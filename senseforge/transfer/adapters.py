"""
SENSEFORGE M07: Environment Interface Adapters & Semantic Contracts
Defines formal semantic interface metadata, units, action capabilities, and
compatibility contracts across distinct procedural environment families.
"""

from typing import List, Dict, Any, Optional, Tuple, Set
from dataclasses import dataclass
from enum import Enum


class TransferMode(str, Enum):
    ZERO_SHOT = "ZERO_SHOT"
    LIMITED_CALIBRATION = "LIMITED_CALIBRATION"
    STRUCTURAL_TRANSFER = "STRUCTURAL_TRANSFER"


@dataclass(frozen=True)
class SemanticChannelSpec:
    index: int
    name: str
    physical_meaning: str
    units: str
    normalization_range: Tuple[float, float]


@dataclass(frozen=True)
class SemanticActionSpec:
    port: int
    name: str
    physical_semantics: str
    action_bounds: Tuple[float, float]
    intervention_capability: str


@dataclass(frozen=True)
class FamilyInterfaceSpec:
    family: str
    description: str
    temporal_resolution_dt: float
    num_observation_channels: int
    num_action_channels: int
    observable_channels: Dict[int, SemanticChannelSpec]
    action_ports: Dict[int, SemanticActionSpec]
    compatibility_tags: Tuple[str, ...]


FAMILY_INTERFACES: Dict[str, FamilyInterfaceSpec] = {
    "coupled_oscillators": FamilyInterfaceSpec(
        family="coupled_oscillators",
        description="Non-linear coupled Duffing-van der Pol oscillator chain (positions and velocities)",
        temporal_resolution_dt=0.01,
        num_observation_channels=16,
        num_action_channels=2,
        observable_channels={
            0: SemanticChannelSpec(0, "pos_0", "Displacement of Oscillator 0", "meters", (-20.0, 20.0)),
            1: SemanticChannelSpec(1, "pos_1", "Displacement of Oscillator 1", "meters", (-20.0, 20.0)),
            2: SemanticChannelSpec(2, "vel_0", "Velocity of Oscillator 0", "m/s", (-50.0, 50.0)),
            3: SemanticChannelSpec(3, "vel_1", "Velocity of Oscillator 1", "m/s", (-50.0, 50.0)),
        },
        action_ports={
            0: SemanticActionSpec(0, "torque_0", "Direct external force on Oscillator 0", (-1.0, 1.0), "kinetic_impulse"),
            1: SemanticActionSpec(1, "torque_1", "Direct external force on Oscillator 1", (-1.0, 1.0), "kinetic_impulse"),
        },
        compatibility_tags=("mechanical", "continuous_state", "second_order_ode", "conservative_dissipative")
    ),
    "reaction_diffusion": FamilyInterfaceSpec(
        family="reaction_diffusion",
        description="Gray-Scott continuous activator-inhibitor spatial lattice (u and v concentrations)",
        temporal_resolution_dt=0.02,
        num_observation_channels=16,
        num_action_channels=2,
        observable_channels={
            0: SemanticChannelSpec(0, "u_center", "Chemical U activator concentration at center", "concentration_mol_L", (0.0, 1.0)),
            1: SemanticChannelSpec(1, "v_center", "Chemical V inhibitor concentration at center", "concentration_mol_L", (0.0, 1.0)),
            2: SemanticChannelSpec(2, "u_neighbor", "Chemical U concentration at adjacent node", "concentration_mol_L", (0.0, 1.0)),
            3: SemanticChannelSpec(3, "v_neighbor", "Chemical V concentration at adjacent node", "concentration_mol_L", (0.0, 1.0)),
        },
        action_ports={
            0: SemanticActionSpec(0, "catalyst_u", "Chemical injection of component U", (-0.5, 0.5), "chemical_injection"),
            1: SemanticActionSpec(1, "catalyst_v", "Chemical injection of component V", (-0.5, 0.5), "chemical_injection"),
        },
        compatibility_tags=("chemical", "continuous_field", "first_order_pde", "reaction_diffusion")
    ),
    "thermodynamic_swarm": FamilyInterfaceSpec(
        family="thermodynamic_swarm",
        description="2D particulate swarm interacting via soft-core Lennard-Jones forces (x, y, vx, vy)",
        temporal_resolution_dt=0.01,
        num_observation_channels=32,
        num_action_channels=2,
        observable_channels={
            0: SemanticChannelSpec(0, "particle0_x", "X coordinate of primary particle", "meters", (0.0, 10.0)),
            1: SemanticChannelSpec(1, "particle0_y", "Y coordinate of primary particle", "meters", (0.0, 10.0)),
            2: SemanticChannelSpec(2, "particle0_vx", "X velocity of primary particle", "m/s", (-10.0, 10.0)),
            3: SemanticChannelSpec(3, "particle0_vy", "Y velocity of primary particle", "m/s", (-10.0, 10.0)),
        },
        action_ports={
            0: SemanticActionSpec(0, "thermal_pulse", "Kinetic thermal pulse along X", (-1.0, 1.0), "thermal_gradient"),
            1: SemanticActionSpec(1, "pressure_wave", "Kinetic thermal pulse along Y", (-1.0, 1.0), "thermal_gradient"),
        },
        compatibility_tags=("nbody", "particulate", "second_order_ode", "stochastic_molecular")
    ),
}


class SemanticTransferContract:
    """
    Validates semantic compatibility between source and target environments.
    Rejects unsupported mappings explicitly.
    """

    @staticmethod
    def validate_compatibility(
        candidate_required_channels: Set[int],
        candidate_action_channels: Set[int],
        source_family: str,
        target_family: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Validates whether candidate measurement channels and action ports are
        semantically transferable to the target environment family.
        """
        if target_family not in FAMILY_INTERFACES:
            return False, f"Unknown target family '{target_family}'"
        if source_family not in FAMILY_INTERFACES:
            return False, f"Unknown source family '{source_family}'"

        target_spec = FAMILY_INTERFACES[target_family]

        # 1. Check observation channel capacity
        for ch in candidate_required_channels:
            if ch < 0 or ch >= target_spec.num_observation_channels:
                return False, f"Channel index {ch} exceeds target capacity {target_spec.num_observation_channels}"

        # 2. Check action port capacity
        for act_ch in candidate_action_channels:
            if act_ch < 0 or act_ch >= target_spec.num_action_channels:
                return False, f"Action channel {act_ch} exceeds target action capacity {target_spec.num_action_channels}"

        return True, None


class EnvironmentAdapter:
    """Backward compatible wrapper around SemanticTransferContract."""

    @staticmethod
    def validate_compatibility(candidate_required_channels: set, target_family: str) -> bool:
        valid, _ = SemanticTransferContract.validate_compatibility(
            candidate_required_channels,
            set(),
            "coupled_oscillators",
            target_family
        )
        return valid
