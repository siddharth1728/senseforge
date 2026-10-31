"""
SENSEFORGE M06: Common Scientific Target Specification
Formalizes scientific property estimation tasks where candidates and control baselines
must infer the identical underlying dynamical property from identical initial conditions.
"""

from typing import Dict, Any, Callable
from dataclasses import dataclass
import numpy as np

from senseforge.core.environments.base import BaseEnvironment


@dataclass(frozen=True)
class ScientificTarget:
    """
    Formal specification of a scientific property estimand.
    Defines what is observable, what is hidden, and the ground-truth loss function.
    """
    name: str
    target_family: str
    symbol: str
    description: str
    units: str
    param_key: str
    
    def extract_ground_truth(self, env: BaseEnvironment) -> float:
        """Extracts the latent ground-truth property directly from the simulation environment."""
        return env.get_ground_truth_target(self.param_key)

    def evaluate_squared_error(self, estimate: float, ground_truth: float) -> float:
        """Computes squared estimation error (MSE component)."""
        return float((estimate - ground_truth) ** 2)

    def evaluate_absolute_error(self, estimate: float, ground_truth: float) -> float:
        """Computes absolute estimation error (MAE component)."""
        return float(abs(estimate - ground_truth))


# Pre-registered standard target registry for Phase 04.1
STANDARD_TARGETS: Dict[str, ScientificTarget] = {
    "oscillator_stiffness": ScientificTarget(
        name="oscillator_stiffness",
        target_family="coupled_oscillators",
        symbol="k_0",
        description="Intrinsic linear restorative spring stiffness of primary observed oscillator",
        units="N/m",
        param_key="stiffness_0"
    ),
    "oscillator_damping": ScientificTarget(
        name="oscillator_damping",
        target_family="coupled_oscillators",
        symbol="mu_0",
        description="Non-linear van der Pol damping coefficient of primary observed oscillator",
        units="N s / m",
        param_key="damping_0"
    ),
    "oscillator_coupling": ScientificTarget(
        name="oscillator_coupling",
        target_family="coupled_oscillators",
        symbol="c_coup",
        description="Spatial inter-oscillator ring coupling strength",
        units="N/m",
        param_key="coupling"
    ),
    "rd_feed_rate": ScientificTarget(
        name="rd_feed_rate",
        target_family="reaction_diffusion",
        symbol="F",
        description="Gray-Scott global feeding rate parameter",
        units="dimensionless",
        param_key="feed_rate"
    ),
    "swarm_potential_depth": ScientificTarget(
        name="swarm_potential_depth",
        target_family="thermodynamic_swarm",
        symbol="epsilon",
        description="Lennard-Jones pairwise potential interaction depth",
        units="Joules",
        param_key="epsilon"
    )
}
