"""
SENSEFORGE M05: Candidate Selection & Lifecycle Manager
Orchestrates genuine evolutionary discovery, validation screening, and candidate freezing.
Never substitutes random genomes for evolutionary candidates.
Honestly reports NO_ELIGIBLE_CANDIDATE when no candidate passes validation screening.
"""

from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import time
import hashlib
import json
import numpy as np

from senseforge.discovery.forge import DiscoveryForge, ForgeConfig
from senseforge.discovery.candidate import PairedCandidate, EpistemicState
from senseforge.core.environments.base import EnvironmentConfig
from senseforge.core.worldfoundry import make_environment
from senseforge.core.firewall import ObservationFirewall
from senseforge.falsification.partition import PartitionManager, PartitionType
from senseforge.falsification.target import ScientificTarget, STANDARD_TARGETS
from senseforge.falsification.downstream import DownstreamEstimator
from senseforge.falsification.manifest import FrozenCandidate
from senseforge.probes.executor import ProbeExecutor


@dataclass
class SelectionResult:
    status: str  # "SELECTED" or "NO_ELIGIBLE_CANDIDATE"
    frozen_candidate: Optional[FrozenCandidate] = None
    candidate_id: Optional[str] = None
    parent_lineage: Optional[Tuple[str, ...]] = None
    generation: int = 0
    original_genome_hashes: Optional[Dict[str, str]] = None
    validation_results: Optional[Dict[str, float]] = None
    selection_criteria: Optional[Dict[str, Any]] = None
    freeze_timestamp: Optional[float] = None
    reason: Optional[str] = None


class CandidateLifecycleManager:
    """
    Governs the end-to-end lifecycle of candidate discoveries:
    1. Evolution on Exploration Partition only.
    2. Screening on Validation Partition only.
    3. Rigorous qualification gate.
    4. Defensive cryptographic freezing.
    5. No-leakage confirmatory testing.
    """

    def __init__(
        self,
        forge: DiscoveryForge,
        partition_manager: PartitionManager,
        target: Optional[ScientificTarget] = None,
        qualification_threshold: float = 0.05,
    ):
        self.forge = forge
        self.pm = partition_manager
        self.target = target or STANDARD_TARGETS["oscillator_stiffness"]
        self.qualification_threshold = qualification_threshold

    def run_evolution(self, num_generations: int = 3) -> None:
        """Executes evolutionary generations strictly on exploration seeds."""
        for _ in range(num_generations):
            self.forge.step()

    def select_candidate(self) -> SelectionResult:
        """
        Ranks candidates in the Pareto archive using VALIDATION partition data only.
        If no candidate qualifies, honestly returns NO_ELIGIBLE_CANDIDATE.
        """
        archive_candidates = self.forge.archive.candidates
        if not archive_candidates:
            return SelectionResult(
                status="NO_ELIGIBLE_CANDIDATE",
                reason="Pareto archive is empty after evolutionary search."
            )

        val_seeds = self.pm.get_partition(PartitionType.VALIDATION).seeds
        exp_seeds = self.pm.get_partition(PartitionType.EXPLORATION).seeds

        scored_candidates: List[Tuple[float, PairedCandidate, DownstreamEstimator, Dict[str, float]]] = []

        total_action_ch = len(self.forge.allowed_channels)

        for cand in archive_candidates:
            # 1. Fit downstream estimator on EXPLORATION seeds
            X_exp = []
            y_exp = []
            for s in exp_seeds:
                # Spawn cloned environment for this seed
                config = EnvironmentConfig(
                    family=self.target.target_family,
                    seed=s,
                    num_entities=8
                )
                raw_env = make_environment(config)
                true_target = self.target.extract_ground_truth(raw_env)
                firewall = ObservationFirewall(
                    env=raw_env,
                    allowed_channels=list(self.forge.allowed_channels)
                )

                traj = ProbeExecutor.execute(
                    firewall, cand.probe, total_action_ch,
                    pre_steps=self.forge.config.pre_steps,
                    post_steps=self.forge.config.forecast_horizon,
                    reset_seed=s
                )
                hist = {
                    ch: np.concatenate([traj.pre_readings[ch], traj.probe_readings[ch]])
                    for ch in self.forge.allowed_channels
                }
                from senseforge.genome.evaluator import ASTEvaluator
                ev = ASTEvaluator()
                res = ev.evaluate(cand.instrument.expression, hist)

                feat = DownstreamEstimator.extract_features_from_operator_output(res.value)
                X_exp.append(feat)
                y_exp.append(true_target)

            X_exp_arr = np.array(X_exp)
            y_exp_arr = np.array(y_exp)
            estimator = DownstreamEstimator(l2_reg=1e-3)
            try:
                estimator.fit(X_exp_arr, y_exp_arr)
            except Exception:
                continue

            # 2. Evaluate candidate and passive baseline on VALIDATION seeds
            cand_sq_errors = []
            pass_sq_errors = []
            for s in val_seeds:
                config_val = EnvironmentConfig(
                    family=self.target.target_family,
                    seed=s,
                    num_entities=8
                )
                raw_env_val = make_environment(config_val)
                true_target_val = self.target.extract_ground_truth(raw_env_val)
                firewall_val = ObservationFirewall(
                    env=raw_env_val,
                    allowed_channels=list(self.forge.allowed_channels)
                )

                traj_cand = ProbeExecutor.execute(
                    firewall_val, cand.probe, total_action_ch,
                    pre_steps=self.forge.config.pre_steps,
                    post_steps=self.forge.config.forecast_horizon,
                    reset_seed=s
                )
                hist_cand = {
                    ch: np.concatenate([traj_cand.pre_readings[ch], traj_cand.probe_readings[ch]])
                    for ch in self.forge.allowed_channels
                }
                from senseforge.genome.evaluator import ASTEvaluator
                ev = ASTEvaluator()
                res_cand = ev.evaluate(cand.instrument.expression, hist_cand)
                feat_cand = DownstreamEstimator.extract_features_from_operator_output(res_cand.value)
                pred_cand = estimator.predict(feat_cand)
                cand_sq_errors.append(self.target.evaluate_squared_error(pred_cand, true_target_val))

                # Passive baseline: mean of exploration targets
                pred_passive = float(np.mean(y_exp_arr))
                pass_sq_errors.append(self.target.evaluate_squared_error(pred_passive, true_target_val))

            mean_cand_mse = float(np.mean(cand_sq_errors))
            mean_pass_mse = float(np.mean(pass_sq_errors))
            val_skill = float(1.0 - mean_cand_mse / (mean_pass_mse + 1e-8))

            val_metrics = {
                "val_mse": mean_cand_mse,
                "passive_val_mse": mean_pass_mse,
                "val_skill": val_skill,
            }

            if val_skill >= self.qualification_threshold:
                scored_candidates.append((val_skill, cand, estimator, val_metrics))

        # 3. Decision
        if not scored_candidates:
            return SelectionResult(
                status="NO_ELIGIBLE_CANDIDATE",
                reason=(
                    f"No candidate met the qualification threshold (val_skill >= {self.qualification_threshold:.4f}). "
                    f"Tested {len(archive_candidates)} Pareto archive candidates on {len(val_seeds)} validation seeds."
                )
            )

        # Sort by validation skill descending
        scored_candidates.sort(key=lambda t: t[0], reverse=True)
        best_skill, best_cand, best_estimator, best_val_metrics = scored_candidates[0]

        # Attach frozen estimator to candidate
        best_estimator.freeze()
        selected_candidate = best_cand.clone()
        selected_candidate.candidate_id = best_cand.candidate_id
        selected_candidate.estimator = best_estimator
        selected_candidate.state = EpistemicState.GENERATED

        # Hashes
        inst_str = json.dumps(selected_candidate.instrument.to_canonical_dict(), sort_keys=True)
        probe_str = json.dumps(selected_candidate.probe.to_canonical_dict(), sort_keys=True)
        inst_hash = hashlib.sha256(inst_str.encode('utf-8')).hexdigest()
        probe_hash = hashlib.sha256(probe_str.encode('utf-8')).hexdigest()

        frozen = FrozenCandidate(
            selected_candidate,
            evaluation_config={
                "target_name": self.target.name,
                "target_symbol": self.target.symbol,
                "qualification_threshold": self.qualification_threshold,
                "val_seeds_count": len(val_seeds),
                "exp_seeds_count": len(exp_seeds)
            }
        )

        return SelectionResult(
            status="SELECTED",
            frozen_candidate=frozen,
            candidate_id=selected_candidate.candidate_id,
            parent_lineage=selected_candidate.parent_candidate_ids,
            generation=selected_candidate.generation,
            original_genome_hashes={"instrument_hash": inst_hash, "probe_hash": probe_hash},
            validation_results=best_val_metrics,
            selection_criteria={
                "metric": "val_skill_over_passive",
                "threshold": self.qualification_threshold,
                "val_skill_achieved": best_skill
            },
            freeze_timestamp=frozen.freeze_timestamp
        )
