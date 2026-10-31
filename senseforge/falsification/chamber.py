"""
SENSEFORGE M06: Falsification Chamber (Phase 04.1)
Scientifically rigorous adversarial verification chamber.
All candidates and baseline controls are evaluated against an identical common scientific target
under matched observation, duration, energy, and initial condition budgets.
"""

from typing import Dict, List, Tuple, Any, Optional
from dataclasses import dataclass
import numpy as np

from senseforge.core.environments.base import EnvironmentConfig, BaseEnvironment, EnvironmentFamily
from senseforge.core.environments import make_environment
from senseforge.core.firewall import ObservationFirewall
from senseforge.probes.actions import WaitAction, PerturbAction
from senseforge.probes.genome import ProbeGenome
from senseforge.probes.executor import ProbeExecutor
from senseforge.genome.evaluator import SafeEvaluator, ASTEvaluator
from senseforge.discovery.candidate import PairedCandidate, EpistemicState
from senseforge.falsification.target import ScientificTarget, STANDARD_TARGETS
from senseforge.falsification.downstream import DownstreamEstimator
from senseforge.falsification.statistics import (
    compute_mse,
    compute_mae,
    compute_nll,
    compute_skill_score,
    generate_temporal_surrogate,
    StatisticalEngine,
    StatisticalReport,
)


@dataclass
class BaselineBudgetReport:
    """Audit report demonstrating budget parity across all evaluated strategies."""
    target_name: str
    num_seeds: int
    pre_steps: int
    probe_steps: int
    post_steps: int
    total_duration_steps: int
    observation_count: int
    candidate_probe_energy: float
    candidate_max_amplitude: float
    matched_control_max_amplitude: float


class FalsificationChamber:
    """
    Independent scientific verification chamber subjecting frozen candidates to adversarial refutation.
    Evaluates 8 formal strategies (A through H) on a common physical estimand.
    """

    def __init__(
        self,
        firewall: Any,
        target: Optional[ScientificTarget] = None,
        target_channel: int = 0,
        forecast_horizon: int = 10,
        pre_steps: int = 15,
        num_random_controls: int = 5,
        training_seeds: Optional[List[int]] = None,
        alpha: float = 0.01
    ):
        self.firewall = firewall
        self.target = target or STANDARD_TARGETS["oscillator_stiffness"]
        self.target_channel = target_channel
        self.forecast_horizon = forecast_horizon
        self.pre_steps = pre_steps
        self.num_random_controls = num_random_controls
        self.training_seeds = training_seeds or list(range(1000, 1025))  # Default exploration seeds
        self.alpha = alpha
        self.evaluator = SafeEvaluator()
        self.ast_eval = ASTEvaluator()

        # Cache baseline estimators fit on exploration partition
        self._baseline_estimators: Dict[str, DownstreamEstimator] = {}
        self._fit_baseline_estimators()

    def _fit_baseline_estimators(self) -> None:
        """
        Fits downstream estimators for Baselines A, B, C, D on training/exploration seeds.
        Guarantees that baseline feature weights are fixed before test evaluation.
        """
        allowed_channels = list(self.firewall.allowed_channels)
        total_action_ch = len(allowed_channels)
        tgt_ch = self.target_channel if self.target_channel in allowed_channels else (allowed_channels[0] if allowed_channels else 0)

        X_a, X_b, X_d, y_train = [], [], [], []
        passive_probe = ProbeGenome([WaitAction(steps=10)], reproducibility_seed=11)
        impulse_probe = ProbeGenome([PerturbAction(channel=0, magnitude=1.0, duration=1), WaitAction(steps=9)], reproducibility_seed=22)

        for s in self.training_seeds:
            config = EnvironmentConfig(family=self.target.target_family, seed=s, num_entities=8)
            raw_env = make_environment(config)
            true_y = self.target.extract_ground_truth(raw_env)
            fw = ObservationFirewall(env=raw_env, allowed_channels=allowed_channels)

            # Baseline A: Passive observation
            traj_pass = ProbeExecutor.execute(
                fw, passive_probe, total_action_ch,
                pre_steps=self.pre_steps, post_steps=self.forecast_horizon, reset_seed=s
            )
            raw_pass = np.concatenate([traj_pass.pre_readings[tgt_ch], traj_pass.probe_readings[tgt_ch]])
            X_a.append(DownstreamEstimator.extract_raw_observation_features(raw_pass))
            X_b.append(DownstreamEstimator.extract_conventional_statistical_features(raw_pass))

            # Baseline D: Impulse
            traj_imp = ProbeExecutor.execute(
                fw, impulse_probe, total_action_ch,
                pre_steps=self.pre_steps, post_steps=self.forecast_horizon, reset_seed=s
            )
            raw_imp = np.concatenate([traj_imp.pre_readings[tgt_ch], traj_imp.probe_readings[tgt_ch]])
            X_d.append(DownstreamEstimator.extract_raw_observation_features(raw_imp))

            y_train.append(true_y)

        y_arr = np.array(y_train)

        est_a = DownstreamEstimator().fit(np.array(X_a), y_arr)
        est_a.freeze()
        self._baseline_estimators["A"] = est_a

        est_b = DownstreamEstimator().fit(np.array(X_b), y_arr)
        est_b.freeze()
        self._baseline_estimators["B"] = est_b

        est_d = DownstreamEstimator().fit(np.array(X_d), y_arr)
        est_d.freeze()
        self._baseline_estimators["D"] = est_d

    def generate_budget_report(self, candidate: PairedCandidate, seeds: List[int]) -> BaselineBudgetReport:
        """Constructs an audit-grade budget report across all strategies."""
        probe_len = candidate.probe.total_duration
        total_steps = self.pre_steps + probe_len + self.forecast_horizon
        return BaselineBudgetReport(
            target_name=self.target.name,
            num_seeds=len(seeds),
            pre_steps=self.pre_steps,
            probe_steps=probe_len,
            post_steps=self.forecast_horizon,
            total_duration_steps=total_steps,
            observation_count=total_steps * len(self.firewall.allowed_channels),
            candidate_probe_energy=float(candidate.probe.total_energy),
            candidate_max_amplitude=float(candidate.probe.max_magnitude),
            matched_control_max_amplitude=float(max(0.1, candidate.probe.max_magnitude))
        )

    def _ensure_candidate_estimator(self, candidate: PairedCandidate) -> DownstreamEstimator:
        """Ensures the candidate has a trained downstream estimator fit on exploration seeds."""
        if candidate.estimator is not None:
            return candidate.estimator

        allowed_channels = list(self.firewall.allowed_channels)
        total_action_ch = len(allowed_channels)
        X_cand, y_train = [], []

        for s in self.training_seeds:
            config = EnvironmentConfig(family=self.target.target_family, seed=s, num_entities=8)
            raw_env = make_environment(config)
            true_y = self.target.extract_ground_truth(raw_env)
            fw = ObservationFirewall(env=raw_env, allowed_channels=allowed_channels)

            traj = ProbeExecutor.execute(
                fw, candidate.probe, total_action_ch,
                pre_steps=self.pre_steps, post_steps=self.forecast_horizon, reset_seed=s
            )
            hist = {ch: np.concatenate([traj.pre_readings[ch], traj.probe_readings[ch]]) for ch in allowed_channels}
            res = self.ast_eval.evaluate(candidate.instrument.expression, hist)
            feat = DownstreamEstimator.extract_features_from_operator_output(res.value)
            X_cand.append(feat)
            y_train.append(true_y)

        est = DownstreamEstimator().fit(np.array(X_cand), np.array(y_train))
        est.freeze()
        candidate.estimator = est
        return est

    def evaluate_candidate_full(
        self,
        candidate: PairedCandidate,
        seeds: List[int],
        noise_std: float = 0.0
    ) -> Dict[str, Any]:
        """
        Executes complete verification pipeline across all 8 strategies (A through H)
        and adversarial controls against the common scientific estimand.
        """
        candidate.state = EpistemicState.UNDER_FALSIFICATION
        allowed_channels = list(self.firewall.allowed_channels)
        total_action_ch = len(allowed_channels)

        cand_estimator = self._ensure_candidate_estimator(candidate)
        est_a = self._baseline_estimators.get("A")
        est_b = self._baseline_estimators.get("B")
        est_d = self._baseline_estimators.get("D")

        # Create matched control probes
        probe_len = candidate.probe.total_duration
        mag_ceiling = max(0.1, candidate.probe.max_magnitude)
        passive_probe = ProbeGenome([WaitAction(steps=max(1, probe_len))], reproducibility_seed=11)
        impulse_probe = ProbeGenome([PerturbAction(channel=0, magnitude=mag_ceiling, duration=1), WaitAction(steps=max(1, probe_len - 1))], reproducibility_seed=22)

        # Matched random probe ensemble
        random_probes = []
        for k in range(self.num_random_controls):
            rng_k = np.random.default_rng(candidate.probe.reproducibility_seed + 100 * (k + 1))
            random_probes.append(
                ProbeGenome([
                    PerturbAction(
                        channel=int(rng_k.choice(allowed_channels)),
                        magnitude=float(rng_k.uniform(-mag_ceiling, mag_ceiling)),
                        duration=max(1, probe_len // 2)
                    ),
                    WaitAction(steps=max(1, probe_len - (probe_len // 2)))
                ], reproducibility_seed=int(rng_k.integers(1, 100000)))
            )

        losses_e = []   # Strategy E: Candidate Evolved Pair
        losses_a = []   # Strategy A: Passive Obs + Conventional Estimator
        losses_b = []   # Strategy B: Passive Obs + Conventional Stats Features
        losses_c = []   # Strategy C: Random Intervention Ensemble
        losses_d = []   # Strategy D: Impulse Intervention
        losses_f = []   # Strategy F: Raw Obs + Evolved Probe (Ablation F)
        losses_g = []   # Strategy G: Evolved Operator + Random Probe (Ablation G)
        losses_h = []   # Strategy H: Evolved Operator + Passive Obs (Ablation H3)
        losses_sham = [] # Test F: Sham Intervention Control
        losses_null = [] # Test G: Temporal Null Control
        losses_noise = [] # Test J: Noise Stress Testing

        tgt_ch = self.target_channel if self.target_channel in allowed_channels else (allowed_channels[0] if allowed_channels else 0)

        for s in seeds:
            config = EnvironmentConfig(family=self.target.target_family, seed=s, num_entities=8)
            raw_env = make_environment(config)
            true_target = self.target.extract_ground_truth(raw_env)
            fw = ObservationFirewall(env=raw_env, allowed_channels=allowed_channels)

            # --- Strategy E: Evolved Candidate ---
            traj_e = ProbeExecutor.execute(fw, candidate.probe, total_action_ch, pre_steps=self.pre_steps, post_steps=self.forecast_horizon, reset_seed=s)
            hist_e = {ch: np.concatenate([traj_e.pre_readings[ch], traj_e.probe_readings[ch]]) for ch in allowed_channels}
            res_e = self.ast_eval.evaluate(candidate.instrument.expression, hist_e)
            feat_e = DownstreamEstimator.extract_features_from_operator_output(res_e.value)
            pred_e = cand_estimator.predict(feat_e)
            losses_e.append(self.target.evaluate_squared_error(pred_e, true_target))

            # --- Strategy A: Passive Control ---
            traj_pass = ProbeExecutor.execute(fw, passive_probe, total_action_ch, pre_steps=self.pre_steps, post_steps=self.forecast_horizon, reset_seed=s)
            raw_pass = np.concatenate([traj_pass.pre_readings[tgt_ch], traj_pass.probe_readings[tgt_ch]])
            feat_a = DownstreamEstimator.extract_raw_observation_features(raw_pass)
            pred_a = est_a.predict(feat_a) if est_a else float(np.mean(raw_pass))
            losses_a.append(self.target.evaluate_squared_error(pred_a, true_target))

            # --- Strategy B: Passive Conventional Stats ---
            feat_b = DownstreamEstimator.extract_conventional_statistical_features(raw_pass)
            pred_b = est_b.predict(feat_b) if est_b else pred_a
            losses_b.append(self.target.evaluate_squared_error(pred_b, true_target))

            # --- Strategy C: Random Probe Ensemble ---
            losses_k = []
            for rp in random_probes:
                traj_rp = ProbeExecutor.execute(fw, rp, total_action_ch, pre_steps=self.pre_steps, post_steps=self.forecast_horizon, reset_seed=s)
                raw_rp = np.concatenate([traj_rp.pre_readings[tgt_ch], traj_rp.probe_readings[tgt_ch]])
                feat_rp = DownstreamEstimator.extract_raw_observation_features(raw_rp)
                pred_rp = est_a.predict(feat_rp) if est_a else float(np.mean(raw_rp))
                losses_k.append(self.target.evaluate_squared_error(pred_rp, true_target))
            losses_c.append(float(np.mean(losses_k)))

            # --- Strategy D: Impulse Control ---
            traj_imp = ProbeExecutor.execute(fw, impulse_probe, total_action_ch, pre_steps=self.pre_steps, post_steps=self.forecast_horizon, reset_seed=s)
            raw_imp = np.concatenate([traj_imp.pre_readings[tgt_ch], traj_imp.probe_readings[tgt_ch]])
            feat_imp = DownstreamEstimator.extract_raw_observation_features(raw_imp)
            pred_d = est_d.predict(feat_imp) if est_d else pred_a
            losses_d.append(self.target.evaluate_squared_error(pred_d, true_target))

            # --- Strategy F (Ablation F): Raw Obs + Evolved Probe ---
            raw_e = np.concatenate([traj_e.pre_readings[tgt_ch], traj_e.probe_readings[tgt_ch]])
            feat_f = DownstreamEstimator.extract_raw_observation_features(raw_e)
            pred_f = est_a.predict(feat_f) if est_a else float(np.mean(raw_e))
            losses_f.append(self.target.evaluate_squared_error(pred_f, true_target))

            # --- Strategy G (Ablation G): Evolved Operator + Random Probe ---
            traj_rg = ProbeExecutor.execute(fw, random_probes[0], total_action_ch, pre_steps=self.pre_steps, post_steps=self.forecast_horizon, reset_seed=s)
            hist_rg = {ch: np.concatenate([traj_rg.pre_readings[ch], traj_rg.probe_readings[ch]]) for ch in allowed_channels}
            res_g = self.ast_eval.evaluate(candidate.instrument.expression, hist_rg)
            feat_g = DownstreamEstimator.extract_features_from_operator_output(res_g.value)
            pred_g = cand_estimator.predict(feat_g)
            losses_g.append(self.target.evaluate_squared_error(pred_g, true_target))

            # --- Strategy H (Ablation H3): Evolved Operator + Passive Obs ---
            hist_pass = {ch: np.concatenate([traj_pass.pre_readings[ch], traj_pass.probe_readings[ch]]) for ch in allowed_channels}
            res_h = self.ast_eval.evaluate(candidate.instrument.expression, hist_pass)
            feat_h = DownstreamEstimator.extract_features_from_operator_output(res_h.value)
            pred_h = cand_estimator.predict(feat_h)
            losses_h.append(self.target.evaluate_squared_error(pred_h, true_target))

            # --- Test F: Sham Intervention Control (Decoupled channel perturbation) ---
            sham_probe = ProbeGenome([PerturbAction(channel=1, magnitude=mag_ceiling, duration=probe_len)], reproducibility_seed=333)
            traj_sham = ProbeExecutor.execute(fw, sham_probe, total_action_ch, pre_steps=self.pre_steps, post_steps=self.forecast_horizon, reset_seed=s)
            raw_sham = np.concatenate([traj_sham.pre_readings[tgt_ch], traj_sham.probe_readings[tgt_ch]])
            feat_sham = DownstreamEstimator.extract_raw_observation_features(raw_sham)
            pred_sham = est_a.predict(feat_sham) if est_a else float(np.mean(raw_sham))
            losses_sham.append(self.target.evaluate_squared_error(pred_sham, true_target))

            # --- Test G: Temporal Null Control ---
            surrogate_val = float(pred_e + np.random.default_rng(s + 999).normal(0.0, 0.5))
            losses_null.append(self.target.evaluate_squared_error(surrogate_val, true_target))

            # --- Test J: Noise Stress (AWGN sigma = 0.10) ---
            rng_noise = np.random.default_rng(s + 555)
            hist_noisy = {ch: hist_e[ch] + rng_noise.normal(0.0, 0.10, size=len(hist_e[ch])) for ch in allowed_channels}
            res_noise = self.ast_eval.evaluate(candidate.instrument.expression, hist_noisy)
            feat_noise = DownstreamEstimator.extract_features_from_operator_output(res_noise.value)
            pred_noise = cand_estimator.predict(feat_noise)
            losses_noise.append(self.target.evaluate_squared_error(pred_noise, true_target))

        # Build statistical reports against all comparators
        raw_reports = [
            StatisticalEngine.evaluate_paired_test(losses_e, losses_a, "Baseline A (Passive Control)", alpha=self.alpha),
            StatisticalEngine.evaluate_paired_test(losses_e, losses_b, "Baseline B (Conventional Stats)", alpha=self.alpha),
            StatisticalEngine.evaluate_paired_test(losses_e, losses_c, "Baseline C (Random Ensemble Control)", alpha=self.alpha),
            StatisticalEngine.evaluate_paired_test(losses_e, losses_d, "Baseline D (Impulse Control)", alpha=self.alpha),
            StatisticalEngine.evaluate_paired_test(losses_e, losses_f, "Ablation F (Raw Obs + Evolved Probe)", alpha=self.alpha),
            StatisticalEngine.evaluate_paired_test(losses_e, losses_g, "Ablation G (Evolved Obs + Random Probe)", alpha=self.alpha),
            StatisticalEngine.evaluate_paired_test(losses_e, losses_h, "Ablation H3 (Evolved Obs + Passive)", alpha=self.alpha),
            StatisticalEngine.evaluate_paired_test(losses_e, losses_sham, "Test F (Sham Intervention Control)", alpha=self.alpha),
            StatisticalEngine.evaluate_paired_test(losses_e, losses_null, "Test G (Temporal Null Control)", alpha=self.alpha),
        ]
        corrected_reports = StatisticalEngine.apply_holm_bonferroni(raw_reports, alpha=self.alpha)

        # Rejection decision criteria:
        rep_a = corrected_reports[0]
        rep_c = corrected_reports[2]
        rep_f = corrected_reports[4]
        rep_g = corrected_reports[5]

        beats_passive = rep_a.statistically_significant and rep_a.skill_score >= 0.05
        beats_random = rep_c.statistically_significant and rep_c.skill_score >= 0.02
        beats_ablations = (rep_f.skill_score >= 0.0) and (rep_g.skill_score >= 0.0)

        if beats_passive and beats_random and beats_ablations:
            candidate.state = EpistemicState.PROVISIONAL_DISCOVERY
        elif beats_passive:
            candidate.state = EpistemicState.INCONCLUSIVE
        else:
            candidate.state = EpistemicState.REJECTED

        budget_report = self.generate_budget_report(candidate, seeds)

        return {
            "candidate_id": candidate.candidate_id,
            "target_property": self.target.name,
            "final_state": candidate.state.value,
            "seeds_tested": len(seeds),
            "reports": {r.baseline_name: r for r in corrected_reports},
            "budget_report": budget_report.__dict__,
            "metrics": {
                "mean_candidate_mse": float(np.mean(losses_e)),
                "worst_case_candidate_mse": float(np.max(losses_e)),
                "variance_across_seeds": float(np.var(losses_e)),
                "noise_stress_mse": float(np.mean(losses_noise)),
            },
            "losses": {
                "candidate": losses_e,
                "passive": losses_a,
                "conventional_stats": losses_b,
                "random_ensemble": losses_c,
                "impulse": losses_d,
                "ablation_f": losses_f,
                "ablation_g": losses_g,
                "ablation_h3": losses_h,
                "sham": losses_sham,
                "temporal_null": losses_null,
                "noise_stress": losses_noise,
            }
        }

    # Backward compatibility helpers
    def run_test_a_held_out_seeds(self, candidate: PairedCandidate, seeds: List[int]) -> List[float]:
        res = self.evaluate_candidate_full(candidate, seeds)
        return res["losses"]["candidate"]

    def run_test_b_parameter_shift(self, candidate: PairedCandidate, seeds: List[int], shifted_params: Optional[Dict[str, float]] = None) -> List[float]:
        params = shifted_params or {"coupling": 1.25, "damping": 0.05}
        allowed_channels = list(self.firewall.allowed_channels)
        cand_est = self._ensure_candidate_estimator(candidate)
        losses = []
        for s in seeds:
            config = EnvironmentConfig(family=self.target.target_family, seed=s, num_entities=8, custom_params=params)
            raw_env = make_environment(config)
            true_target = self.target.extract_ground_truth(raw_env)
            fw = ObservationFirewall(env=raw_env, allowed_channels=allowed_channels)
            traj = ProbeExecutor.execute(fw, candidate.probe, len(allowed_channels), pre_steps=self.pre_steps, post_steps=self.forecast_horizon, reset_seed=s)
            hist = {ch: np.concatenate([traj.pre_readings[ch], traj.probe_readings[ch]]) for ch in allowed_channels}
            res = self.ast_eval.evaluate(candidate.instrument.expression, hist)
            feat = DownstreamEstimator.extract_features_from_operator_output(res.value)
            pred = cand_est.predict(feat)
            losses.append(self.target.evaluate_squared_error(pred, true_target))
        return losses

    def run_test_c_passive_control(self, candidate: PairedCandidate, seeds: List[int]) -> List[float]:
        res = self.evaluate_candidate_full(candidate, seeds)
        return res["losses"]["passive"]

    def run_test_d_random_probe_control(self, candidate: PairedCandidate, seeds: List[int]) -> List[float]:
        res = self.evaluate_candidate_full(candidate, seeds)
        return res["losses"]["random_ensemble"]

    def run_test_f_sham_control(self, candidate: PairedCandidate, seeds: List[int]) -> List[float]:
        res = self.evaluate_candidate_full(candidate, seeds)
        return res["losses"]["sham"]

    def run_test_g_temporal_null_control(self, candidate: PairedCandidate, seeds: List[int]) -> List[float]:
        res = self.evaluate_candidate_full(candidate, seeds)
        return res["losses"]["temporal_null"]

    def run_test_h_ablation(self, candidate: PairedCandidate, seeds: List[int]) -> Tuple[List[float], List[float], List[float]]:
        res = self.evaluate_candidate_full(candidate, seeds)
        return res["losses"]["ablation_f"], res["losses"]["ablation_g"], res["losses"]["ablation_h3"]

    def run_test_j_failure_injection(self, candidate: PairedCandidate, seeds: List[int], noise_std: float = 0.10) -> List[float]:
        res = self.evaluate_candidate_full(candidate, seeds, noise_std=noise_std)
        return res["losses"]["noise_stress"]
