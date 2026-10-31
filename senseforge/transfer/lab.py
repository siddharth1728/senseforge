"""
SENSEFORGE M07: Transfer Lab (Phase 04.1)
Evaluates cross-family generalization and invariance of frozen candidate instruments
across diverse procedural dynamical systems with rigorous semantic validation and
mathematically sound degradation metrics.
"""

from typing import Dict, List, Any, Optional, Tuple
from enum import Enum
import numpy as np
from dataclasses import dataclass

from senseforge.core.environments.base import EnvironmentFamily
from senseforge.core.worldfoundry import WorldFoundry
from senseforge.discovery.candidate import PairedCandidate, EpistemicState
from senseforge.falsification.chamber import FalsificationChamber
from senseforge.falsification.target import ScientificTarget, STANDARD_TARGETS
from senseforge.transfer.adapters import (
    FAMILY_INTERFACES,
    SemanticTransferContract,
    EnvironmentAdapter,
    TransferMode,
)


class TransferCategory(str, Enum):
    SAME_FAMILY_GENERALIZATION = "SAME_FAMILY_GENERALIZATION"
    CROSS_PARAMETER_GENERALIZATION = "CROSS_PARAMETER_GENERALIZATION"
    CROSS_FAMILY_TRANSFER = "CROSS_FAMILY_TRANSFER"
    FAILED_TRANSFER = "FAILED_TRANSFER"
    INCONCLUSIVE_TRANSFER = "INCONCLUSIVE_TRANSFER"
    INCOMPATIBLE_SEMANTICS = "INCOMPATIBLE_SEMANTICS"


@dataclass(frozen=True)
class TransferReport:
    candidate_id: str
    source_family: str
    target_family: str
    transfer_mode: str
    source_skill: float
    target_skill: float
    absolute_skill_diff: float
    transfer_degradation_ratio: Optional[float]
    is_tdr_defined: bool
    p_value: float
    category: TransferCategory
    seeds_evaluated: int
    failure_reason: Optional[str] = None


class TransferLab:
    """Executes frozen candidate transfer experiments across distinct environment families."""

    def __init__(self, target_seeds: Optional[List[int]] = None):
        self.target_seeds = target_seeds or list(range(5000, 5020)) # 20 seeds

    def _get_target_for_family(self, family: str) -> ScientificTarget:
        """Assigns appropriate target property based on environment physics."""
        if family == EnvironmentFamily.REACTION_DIFFUSION:
            return STANDARD_TARGETS["rd_feed_rate"]
        elif family == EnvironmentFamily.THERMODYNAMIC_SWARM:
            return STANDARD_TARGETS["swarm_potential_depth"]
        else:
            return STANDARD_TARGETS["oscillator_stiffness"]

    def evaluate_transfer(
        self,
        candidate: PairedCandidate,
        source_family: str,
        target_family: str,
        source_skill: float = 0.80,
        mode: TransferMode = TransferMode.ZERO_SHOT,
    ) -> TransferReport:
        """
        Transfers a frozen candidate to an independently generated target environment family.
        Supports Zero-Shot, Limited Calibration, and Structural Transfer modes.
        """
        # 1. Semantic compatibility check
        action_channels = {a.channel for a in candidate.probe.actions if hasattr(a, "channel")}
        is_compat, reason = SemanticTransferContract.validate_compatibility(
            candidate.instrument.required_channels,
            action_channels,
            source_family,
            target_family
        )
        if not is_compat:
            return TransferReport(
                candidate_id=candidate.candidate_id,
                source_family=source_family,
                target_family=target_family,
                transfer_mode=mode.value,
                source_skill=source_skill,
                target_skill=-1.0,
                absolute_skill_diff=-1.0 - source_skill,
                transfer_degradation_ratio=None,
                is_tdr_defined=False,
                p_value=1.0,
                category=TransferCategory.INCOMPATIBLE_SEMANTICS,
                seeds_evaluated=0,
                failure_reason=reason
            )

        # 2. Spawn target environment behind Observation Firewall
        target_firewall = WorldFoundry.spawn_sandboxed_environment(
            family=target_family,
            seed=self.target_seeds[0],
            allowed_channels=list(candidate.instrument.required_channels) or [0, 1],
            num_entities=8
        )

        # 3. Setup evaluation target for target family
        target_obj = self._get_target_for_family(target_family)

        # 4. Handle Transfer Modes
        cand_eval = candidate.clone()
        cand_eval.candidate_id = candidate.candidate_id
        if mode == TransferMode.ZERO_SHOT:
            # Preserve original estimator and operator exactly
            cand_eval.estimator = candidate.estimator
        elif mode in [TransferMode.LIMITED_CALIBRATION, TransferMode.STRUCTURAL_TRANSFER]:
            # Re-fit linear estimator on small calibration set in target environment
            calib_seeds = self.target_seeds[:5]
            chamber_calib = FalsificationChamber(
                firewall=target_firewall,
                target=target_obj,
                training_seeds=calib_seeds,
                forecast_horizon=8,
                pre_steps=12
            )
            cand_eval.estimator = chamber_calib._ensure_candidate_estimator(cand_eval)

        # 5. Evaluate in target environment via FalsificationChamber
        eval_seeds = self.target_seeds[5:] if mode != TransferMode.ZERO_SHOT else self.target_seeds
        chamber = FalsificationChamber(
            firewall=target_firewall,
            target=target_obj,
            training_seeds=self.target_seeds[:5] if mode != TransferMode.ZERO_SHOT else None,
            forecast_horizon=8,
            pre_steps=12,
            num_random_controls=3,
            alpha=0.01
        )
        eval_res = chamber.evaluate_candidate_full(cand_eval, seeds=eval_seeds)

        # 6. Extract skill over target passive baseline
        rep_a = eval_res["reports"]["Baseline A (Passive Control)"]
        target_skill = float(rep_a.skill_score)
        p_val = float(rep_a.p_value_corrected)
        abs_diff = float(target_skill - source_skill)

        # 7. Compute Transfer Degradation Ratio (TDR)
        # Mathematical integrity: TDR is only defined if source_skill > 0
        if source_skill > 0:
            tdr = float(target_skill / source_skill)
            is_tdr_def = True
        else:
            tdr = None
            is_tdr_def = False

        # 8. Classification
        if source_family == target_family:
            cat = TransferCategory.SAME_FAMILY_GENERALIZATION if rep_a.statistically_significant else TransferCategory.FAILED_TRANSFER
        else:
            if rep_a.statistically_significant and target_skill >= 0.05:
                cat = TransferCategory.CROSS_FAMILY_TRANSFER
                candidate.state = EpistemicState.GENERALIZED_DISCOVERY
            elif target_skill > 0.0:
                cat = TransferCategory.INCONCLUSIVE_TRANSFER
            else:
                cat = TransferCategory.FAILED_TRANSFER

        return TransferReport(
            candidate_id=candidate.candidate_id,
            source_family=source_family,
            target_family=target_family,
            transfer_mode=mode.value,
            source_skill=source_skill,
            target_skill=target_skill,
            absolute_skill_diff=abs_diff,
            transfer_degradation_ratio=tdr,
            is_tdr_defined=is_tdr_def,
            p_value=p_val,
            category=cat,
            seeds_evaluated=len(eval_seeds),
            failure_reason=None if cat != TransferCategory.FAILED_TRANSFER else "Target skill score non-positive"
        )

    def generate_transfer_matrix(
        self,
        candidate: PairedCandidate,
        source_family: str,
        families: Optional[List[str]] = None,
        source_skill: float = 0.80
    ) -> Dict[str, Dict[str, Any]]:
        """Computes pairwise transfer skill across all supported environment families."""
        fams = families or [
            EnvironmentFamily.COUPLED_OSCILLATORS,
            EnvironmentFamily.REACTION_DIFFUSION,
            EnvironmentFamily.THERMODYNAMIC_SWARM
        ]
        matrix: Dict[str, Dict[str, Any]] = {}
        for target in fams:
            rep = self.evaluate_transfer(
                candidate,
                source_family=source_family,
                target_family=target,
                source_skill=source_skill
            )
            matrix[target] = {
                "target_skill": rep.target_skill,
                "tdr": rep.transfer_degradation_ratio,
                "is_tdr_defined": rep.is_tdr_defined,
                "category": rep.category.value,
            }
        return matrix
