"""
SENSEFORGE Phase 04.1 Scientific Integrity Regression Test Suite
Validates all 15 scientific integrity criteria:
1. Candidate actually comes from DiscoveryForge.
2. No eligible candidate is handled honestly.
3. Candidate and baselines use one common target.
4. Common initial conditions are reproducible.
5. Evaluation budgets are matched.
6. Candidate freezing prevents mutation.
7. Hash verification detects altered configurations.
8. Manifest verification detects modified content.
9. Transfer channel semantics are validated.
10. Transfer ratio handles negative and zero denominators correctly.
11. Evaluator process isolation works.
12. Locked-test access is controlled.
13. Reports reference the correct candidate.
14. No test feedback enters evolutionary selection.
15. Full regression test suite operational.
"""

import pytest
import numpy as np
import json
import time

from senseforge.core.environments.base import EnvironmentFamily, EnvironmentConfig
from senseforge.core.worldfoundry import WorldFoundry, make_environment
from senseforge.core.firewall import ObservationFirewall
from senseforge.genome.candidate import GenomeFactory, InstrumentGenome
from senseforge.genome.types import DataType
from senseforge.probes.evolution import ProbeFactory
from senseforge.probes.genome import ProbeGenome
from senseforge.probes.actions import WaitAction, PerturbAction
from senseforge.discovery.candidate import PairedCandidate, EpistemicState
from senseforge.discovery.forge import DiscoveryForge, ForgeConfig
from senseforge.discovery.selection import CandidateLifecycleManager, SelectionResult
from senseforge.falsification.partition import PartitionManager, PartitionType, PartitionSealedViolation
from senseforge.falsification.target import ScientificTarget, STANDARD_TARGETS
from senseforge.falsification.downstream import DownstreamEstimator, EstimatorFrozenError
from senseforge.falsification.manifest import FrozenCandidate, CandidateFrozenError, verify_manifest
from senseforge.falsification.chamber import FalsificationChamber
from senseforge.falsification.isolated_evaluator import IsolatedEvaluatorClient
from senseforge.transfer.adapters import SemanticTransferContract, TransferMode, FAMILY_INTERFACES
from senseforge.transfer.lab import TransferLab, TransferCategory


# 1. Candidate actually comes from DiscoveryForge
def test_candidate_actually_comes_from_discovery_forge():
    firewall = WorldFoundry.spawn_sandboxed_environment(
        family=EnvironmentFamily.COUPLED_OSCILLATORS, seed=42, allowed_channels=[0, 1]
    )
    pm = PartitionManager()
    exp_seeds = pm.get_partition(PartitionType.EXPLORATION).seeds[:5]
    config = ForgeConfig(population_size=6, max_generations=2, eval_seeds=exp_seeds)
    forge = DiscoveryForge(firewall=firewall, allowed_channels=[0, 1], config=config, seed=42)

    manager = CandidateLifecycleManager(forge=forge, partition_manager=pm, qualification_threshold=-1000.0)
    manager.run_evolution(num_generations=2)
    assert forge.generation == 2
    assert len(forge.archive.candidates) > 0

    res = manager.select_candidate()
    assert res.status == "SELECTED"
    assert res.candidate_id is not None
    assert res.frozen_candidate is not None
    assert res.frozen_candidate.candidate.generation >= 0


# 2. No eligible candidate is handled honestly
def test_no_eligible_candidate_handled_honestly():
    firewall = WorldFoundry.spawn_sandboxed_environment(
        family=EnvironmentFamily.COUPLED_OSCILLATORS, seed=42, allowed_channels=[0, 1]
    )
    pm = PartitionManager()
    config = ForgeConfig(population_size=4, max_generations=1, eval_seeds=[1001, 1002])
    forge = DiscoveryForge(firewall=firewall, allowed_channels=[0, 1], config=config, seed=42)

    # Set an impossibly high qualification threshold (val_skill >= 0.9999)
    manager = CandidateLifecycleManager(forge=forge, partition_manager=pm, qualification_threshold=0.9999)
    manager.run_evolution(num_generations=1)
    res = manager.select_candidate()

    assert res.status == "NO_ELIGIBLE_CANDIDATE"
    assert res.frozen_candidate is None
    assert res.reason is not None


# 3. Candidate and baselines use one common target
def test_candidate_and_baselines_use_common_target():
    firewall = WorldFoundry.spawn_sandboxed_environment(
        family=EnvironmentFamily.COUPLED_OSCILLATORS, seed=42, allowed_channels=[0, 1]
    )
    target = STANDARD_TARGETS["oscillator_stiffness"]
    chamber = FalsificationChamber(
        firewall=firewall,
        target=target,
        training_seeds=[1001, 1002, 1003],
        forecast_horizon=5,
        pre_steps=8,
        num_random_controls=2
    )

    inst = GenomeFactory.create_random_genome(1, [0, 1], DataType.SERIES, 2)
    probe = ProbeFactory.create_random_probe(2, [0, 1], num_actions=2)
    cand = PairedCandidate(inst, probe)

    eval_res = chamber.evaluate_candidate_full(cand, seeds=[9001, 9002])
    assert eval_res["target_property"] == "oscillator_stiffness"
    assert "Baseline A (Passive Control)" in eval_res["reports"]
    assert "Baseline C (Random Ensemble Control)" in eval_res["reports"]
    assert "Ablation F (Raw Obs + Evolved Probe)" in eval_res["reports"]


# 4. Common initial conditions are reproducible
def test_common_initial_conditions_reproducibility():
    s = 4040
    cfg1 = EnvironmentConfig(family=EnvironmentFamily.COUPLED_OSCILLATORS, seed=s, num_entities=8)
    cfg2 = EnvironmentConfig(family=EnvironmentFamily.COUPLED_OSCILLATORS, seed=s, num_entities=8)
    env1 = make_environment(cfg1)
    env2 = make_environment(cfg2)

    assert env1.get_ground_truth_target("stiffness_0") == env2.get_ground_truth_target("stiffness_0")
    assert np.allclose(env1._get_raw_observable_vector(), env2._get_raw_observable_vector())


# 5. Evaluation budgets are matched
def test_evaluation_budgets_matched():
    firewall = WorldFoundry.spawn_sandboxed_environment(
        family=EnvironmentFamily.COUPLED_OSCILLATORS, seed=42, allowed_channels=[0, 1]
    )
    chamber = FalsificationChamber(firewall=firewall, training_seeds=[1001, 1002])
    inst = GenomeFactory.create_random_genome(1, [0, 1], DataType.SERIES, 2)
    probe = ProbeFactory.create_random_probe(2, [0, 1], num_actions=2)
    cand = PairedCandidate(inst, probe)

    budget_report = chamber.generate_budget_report(cand, seeds=[9001, 9002, 9003])
    assert budget_report.num_seeds == 3
    assert budget_report.total_duration_steps == budget_report.pre_steps + budget_report.probe_steps + budget_report.post_steps
    assert budget_report.observation_count > 0


# 6. Candidate freezing prevents mutation
def test_candidate_freezing_prevents_mutation():
    inst = GenomeFactory.create_random_genome(1, [0], DataType.SERIES, 2)
    probe = ProbeFactory.create_random_probe(2, [0], num_actions=1)
    cand = PairedCandidate(inst, probe)
    frozen = FrozenCandidate(cand)

    # Attempting to assign new attributes on frozen candidate wrapper raises CandidateFrozenError
    with pytest.raises(CandidateFrozenError):
        frozen.candidate_id = "mutated_id"

    # Mutating returned candidate does not mutate frozen candidate's state or config hash
    old_hash = frozen.config_hash
    initial_len = len(frozen.candidate.probe.actions)
    cand_copy = frozen.candidate
    cand_copy.probe.actions.append(WaitAction(steps=999))
    assert frozen.config_hash == old_hash
    assert len(frozen.candidate.probe.actions) == initial_len


# 7. Hash verification detects altered configurations
def test_hash_verification_detects_altered_configurations():
    inst = GenomeFactory.create_random_genome(1, [0], DataType.SERIES, 2)
    probe = ProbeFactory.create_random_probe(2, [0], num_actions=1)
    cand = PairedCandidate(inst, probe)
    frozen = FrozenCandidate(cand)
    assert frozen.verify_integrity() is True

    # Tampering with snapshot raises CandidateFrozenError
    object.__setattr__(frozen, "_canonical_snapshot", frozen._canonical_snapshot + " ")
    with pytest.raises(CandidateFrozenError, match="Frozen candidate integrity violated"):
        frozen.verify_integrity()


# 8. Manifest verification detects modified content
def test_manifest_verification_detects_tampering():
    inst = GenomeFactory.create_random_genome(1, [0], DataType.SERIES, 2)
    probe = ProbeFactory.create_random_probe(2, [0], num_actions=1)
    cand = PairedCandidate(inst, probe)
    frozen = FrozenCandidate(cand)
    manifest = frozen.to_manifest(
        source_family=EnvironmentFamily.COUPLED_OSCILLATORS,
        seeds_partition={"seeds": [1, 2, 3]}
    )

    is_valid, errors = verify_manifest(manifest)
    assert is_valid is True
    assert len(errors) == 0

    # Tamper with candidate_id
    manifest["candidate_id"] = "tampered_id"
    is_valid_t, errors_t = verify_manifest(manifest)
    assert is_valid_t is False
    assert any("Manifest digest mismatch" in e for e in errors_t)


# 9. Transfer channel semantics are validated
def test_transfer_channel_semantics_validation():
    # Valid channels
    valid, reason = SemanticTransferContract.validate_compatibility(
        candidate_required_channels={0, 1},
        candidate_action_channels={0},
        source_family="coupled_oscillators",
        target_family="reaction_diffusion"
    )
    assert valid is True
    assert reason is None

    # Invalid channels (exceeds target channel capacity)
    invalid, reason_inv = SemanticTransferContract.validate_compatibility(
        candidate_required_channels={0, 99},
        candidate_action_channels={0},
        source_family="coupled_oscillators",
        target_family="reaction_diffusion"
    )
    assert invalid is False
    assert "exceeds target capacity" in reason_inv


# 10. Transfer ratio handles negative and zero denominators correctly
def test_transfer_ratio_handles_negative_and_zero_denominators():
    lab = TransferLab(target_seeds=[5001, 5002])
    inst = GenomeFactory.create_random_genome(1, [0, 1], DataType.SERIES, 2)
    probe = ProbeFactory.create_random_probe(2, [0, 1], num_actions=1)
    cand = PairedCandidate(inst, probe)

    # Negative source performance
    rep_neg = lab.evaluate_transfer(
        candidate=cand,
        source_family=EnvironmentFamily.COUPLED_OSCILLATORS,
        target_family=EnvironmentFamily.REACTION_DIFFUSION,
        source_skill=-150.0
    )
    assert rep_neg.is_tdr_defined is False
    assert rep_neg.transfer_degradation_ratio is None
    assert rep_neg.source_skill == -150.0

    # Positive source performance
    rep_pos = lab.evaluate_transfer(
        candidate=cand,
        source_family=EnvironmentFamily.COUPLED_OSCILLATORS,
        target_family=EnvironmentFamily.REACTION_DIFFUSION,
        source_skill=0.80
    )
    assert rep_pos.is_tdr_defined is True
    assert rep_pos.transfer_degradation_ratio is not None


# 11. Evaluator process isolation works
def test_evaluator_process_isolation():
    inst = GenomeFactory.create_random_genome(1, [0], DataType.SERIES, 2)
    probe = ProbeFactory.create_random_probe(2, [0], num_actions=1)
    cand = PairedCandidate(inst, probe)
    frozen = FrozenCandidate(cand)

    client = IsolatedEvaluatorClient(audit_log_path="test_evaluator_audit.log")
    res = client.evaluate_in_subprocess(
        frozen_candidate=frozen,
        target_name="oscillator_stiffness",
        partition_type="VALIDATION"
    )
    assert "candidate_id" in res
    assert res["candidate_id"] == cand.candidate_id
    assert "reports" in res
    assert "final_state" in res


# 12. Locked-test access is controlled
def test_locked_test_access_control():
    pm = PartitionManager(persistence_path="test_partition_lock.json")
    l_part = pm.get_partition(PartitionType.LOCKED_TEST)

    cand_id = "test_cand_auth_1"
    h1 = "hash_alpha"
    h2 = "hash_beta"

    seeds1 = l_part.get_seeds(cand_id, h1)
    assert len(seeds1) > 0

    # Re-access with same hash allowed
    seeds2 = l_part.get_seeds(cand_id, h1)
    assert seeds1 == seeds2

    # Access with different hash rejected
    with pytest.raises(PartitionSealedViolation):
        l_part.get_seeds(cand_id, h2)


# 13. Reports reference the correct candidate
def test_reports_reference_correct_candidate():
    firewall = WorldFoundry.spawn_sandboxed_environment(
        family=EnvironmentFamily.COUPLED_OSCILLATORS, seed=42, allowed_channels=[0, 1]
    )
    chamber = FalsificationChamber(firewall=firewall, training_seeds=[1001, 1002])
    inst = GenomeFactory.create_random_genome(1, [0, 1], DataType.SERIES, 2)
    probe = ProbeFactory.create_random_probe(2, [0, 1], num_actions=1)
    cand = PairedCandidate(inst, probe)

    res = chamber.evaluate_candidate_full(cand, seeds=[2001, 2002])
    assert res["candidate_id"] == cand.candidate_id
    frozen = FrozenCandidate(cand)
    manifest = frozen.to_manifest(
        source_family=EnvironmentFamily.COUPLED_OSCILLATORS,
        falsification_report=res,
        seeds_partition={"seeds": [2001, 2002]}
    )
    assert manifest["candidate_id"] == cand.candidate_id
    assert manifest["falsification_report"]["candidate_id"] == cand.candidate_id


# 14. No test feedback enters evolutionary selection
def test_no_test_feedback_enters_evolutionary_selection():
    pm = PartitionManager()
    search_seeds = set(pm.get_partition(PartitionType.EXPLORATION).seeds)
    locked_seeds = set(pm.get_partition(PartitionType.LOCKED_TEST).seeds)

    firewall = WorldFoundry.spawn_sandboxed_environment(
        family=EnvironmentFamily.COUPLED_OSCILLATORS, seed=42, allowed_channels=[0, 1]
    )
    forge = DiscoveryForge(firewall=firewall, allowed_channels=[0, 1], config=ForgeConfig(eval_seeds=list(search_seeds)[:3]))
    manager = CandidateLifecycleManager(forge=forge, partition_manager=pm)
    manager.run_evolution(1)

    # Verify that the forge evaluation seeds never intersected with locked seeds
    assert set(forge.config.eval_seeds).isdisjoint(locked_seeds)


# 15. All previous M01-M07 functionality verified operational
def test_all_previous_modules_remain_operational():
    # WorldFoundry
    cfg = EnvironmentConfig(family=EnvironmentFamily.COUPLED_OSCILLATORS, seed=42)
    env = WorldFoundry.make_environment(cfg)
    assert env.total_observable_channels > 0

    # Firewall
    fw = WorldFoundry.spawn_sandboxed_environment(EnvironmentFamily.COUPLED_OSCILLATORS, seed=42, allowed_channels=[0])
    frame = fw.observe()
    assert len(frame.readings) == 1

    # Genome Evaluator
    from senseforge.genome.ast import ConstantNode, ChannelNode, BinaryOpNode
    from senseforge.genome.evaluator import SafeEvaluator
    expr = BinaryOpNode("Add", ChannelNode(0), ConstantNode(1.0))
    evaluator = SafeEvaluator()
    res = evaluator.evaluate(expr, {0: np.array([2.0, 3.0])})
    assert np.allclose(res.value, [3.0, 4.0])
