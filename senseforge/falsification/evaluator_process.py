"""
SENSEFORGE M06: Process-Separated Independent Evaluator Process
Runs in an independent OS process boundary.
Controls locked test seeds, verifies candidate hashes, evaluates common target,
writes audit logs, and returns strictly sanitized summary evaluation metrics.
"""

import sys
import json
import argparse
import time
from typing import Dict, Any

from senseforge.discovery.candidate import PairedCandidate
from senseforge.falsification.manifest import FrozenCandidate
from senseforge.falsification.partition import PartitionManager, PartitionType
from senseforge.falsification.chamber import FalsificationChamber
from senseforge.falsification.target import STANDARD_TARGETS
from senseforge.core.worldfoundry import WorldFoundry


def run_isolated_evaluation(
    candidate_dict: Dict[str, Any],
    target_name: str = "oscillator_stiffness",
    partition_type: str = "LOCKED_TEST",
    audit_log_path: str = "evaluator_audit.log"
) -> Dict[str, Any]:
    """
    Executes isolated evaluation in the independent process boundary.
    """
    # 1. Reconstruct candidate and verify config hash
    candidate = PairedCandidate.from_canonical_dict(candidate_dict)
    frozen = FrozenCandidate(candidate)
    frozen.verify_integrity()

    # 2. Control seed access via PartitionManager
    pm = PartitionManager()
    p_enum = PartitionType(partition_type)
    seeds = pm.get_partition(p_enum).get_seeds(frozen.candidate_id, frozen.config_hash)

    # 3. Setup target property and environment
    target_obj = STANDARD_TARGETS.get(target_name, STANDARD_TARGETS["oscillator_stiffness"])
    firewall = WorldFoundry.spawn_sandboxed_environment(
        family=target_obj.target_family,
        seed=seeds[0],
        allowed_channels=list(candidate.instrument.required_channels) or [0, 1],
        num_entities=8
    )

    # 4. Execute FalsificationChamber
    chamber = FalsificationChamber(
        firewall=firewall,
        target=target_obj,
        forecast_horizon=8,
        pre_steps=12,
        num_random_controls=3,
        alpha=0.01
    )
    results = chamber.evaluate_candidate_full(candidate, seeds=seeds)

    # 5. Maintain append-only audit log
    audit_entry = {
        "timestamp": time.time(),
        "candidate_id": candidate.candidate_id,
        "config_hash": frozen.config_hash,
        "target_property": target_name,
        "partition_type": partition_type,
        "seeds_count": len(seeds),
        "final_state": results["final_state"],
        "mean_mse": results["metrics"]["mean_candidate_mse"],
    }
    try:
        with open(audit_log_path, "a") as f:
            f.write(json.dumps(audit_entry) + "\n")
    except Exception:
        pass

    # 6. Sanitize response (Zero internal simulation objects or pointers)
    sanitized_reports = {}
    for k, v in results["reports"].items():
        sanitized_reports[k] = {
            "baseline_name": v.baseline_name,
            "n_seeds": v.n_seeds,
            "skill_score": v.skill_score,
            "cohens_d": v.cohens_d,
            "p_value_corrected": v.p_value_corrected,
            "statistically_significant": v.statistically_significant,
        }

    return {
        "candidate_id": candidate.candidate_id,
        "config_hash": frozen.config_hash,
        "target_property": target_name,
        "final_state": results["final_state"],
        "seeds_tested": len(seeds),
        "reports": sanitized_reports,
        "metrics": results["metrics"],
        "budget_report": results["budget_report"]
    }


def main():
    parser = argparse.ArgumentParser(description="SENSEFORGE Independent Evaluator Process")
    parser.add_argument("--candidate-file", required=True, help="Path to JSON file with candidate canonical dict")
    parser.add_argument("--output-file", default=None, help="Path to save sanitized evaluation results")
    parser.add_argument("--target", default="oscillator_stiffness", help="Scientific target name")
    parser.add_argument("--partition", default="LOCKED_TEST", help="Partition type")
    parser.add_argument("--audit-log", default="evaluator_audit.log", help="Path to append-only audit log")

    args = parser.parse_args()

    with open(args.candidate_file, "r") as f:
        cand_data = json.load(f)

    # If wrapped in frozen container, extract candidate
    if "instrument" not in cand_data and "candidate" in cand_data:
        cand_data = cand_data["candidate"]

    res = run_isolated_evaluation(
        candidate_dict=cand_data,
        target_name=args.target,
        partition_type=args.partition,
        audit_log_path=args.audit_log
    )

    out_str = json.dumps(res, indent=2)
    if args.output_file:
        with open(args.output_file, "w") as f:
            f.write(out_str)
    else:
        print(out_str)


if __name__ == "__main__":
    main()
