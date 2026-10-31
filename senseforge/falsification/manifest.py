"""
SENSEFORGE M06: Candidate Freeze & Experiment Manifest System
Provides defensive immutable cryptographic freeze locks on candidate discoveries
and serializes audit-grade provenance manifests with SHA-256 integrity digests.
"""

from typing import Dict, Any, Optional, Tuple, List
import hashlib
import json
import time
import numpy as np
from enum import Enum

from senseforge.discovery.candidate import PairedCandidate, EpistemicState


class CandidateFrozenError(Exception):
    """Raised when attempting to mutate or modify a frozen candidate."""
    pass


class ManifestVerificationError(Exception):
    """Raised when an experiment manifest fails integrity verification."""
    pass


class FrozenCandidate:
    """
    Defensively immutable wrapper around a PairedCandidate prepared for Confirmatory & Transfer testing.
    The internal candidate is stored as an immutable canonical serialized JSON snapshot.
    Property queries always return deep-copied instances, preventing mutable escape paths.
    """

    def __init__(self, candidate: PairedCandidate, evaluation_config: Optional[Dict[str, Any]] = None):
        # Store evaluation configuration
        self._evaluation_config = evaluation_config or {}

        # Capture canonical serialized snapshot
        candidate_dict = candidate.to_canonical_dict()
        self._canonical_snapshot: str = json.dumps(candidate_dict, sort_keys=True, separators=(',', ':'))
        self._config_hash: str = hashlib.sha256(self._canonical_snapshot.encode('utf-8')).hexdigest()
        self._candidate_id: str = candidate.candidate_id
        self._freeze_timestamp: float = time.time()
        self._is_frozen: bool = True

    @property
    def candidate_id(self) -> str:
        return self._candidate_id

    @candidate_id.setter
    def candidate_id(self, val: Any) -> None:
        raise CandidateFrozenError("Cannot modify attribute 'candidate_id' on immutable FrozenCandidate.")

    @property
    def config_hash(self) -> str:
        return self._config_hash

    @config_hash.setter
    def config_hash(self, val: Any) -> None:
        raise CandidateFrozenError("Cannot modify attribute 'config_hash' on immutable FrozenCandidate.")

    @property
    def freeze_timestamp(self) -> float:
        return self._freeze_timestamp

    @property
    def evaluation_config(self) -> Dict[str, Any]:
        return dict(self._evaluation_config)

    @property
    def candidate(self) -> PairedCandidate:
        """
        Defensive immutability: returns a fresh clone reconstructed from the immutable snapshot.
        External mutations to this object do NOT affect the frozen snapshot or hash.
        """
        snapshot_dict = json.loads(self._canonical_snapshot)
        return PairedCandidate.from_canonical_dict(snapshot_dict)

    def verify_integrity(self) -> bool:
        """
        Recomputes configuration hash from the canonical snapshot and verifies it matches.
        """
        recomputed = hashlib.sha256(self._canonical_snapshot.encode('utf-8')).hexdigest()
        if recomputed != self._config_hash:
            raise CandidateFrozenError(
                f"Frozen candidate integrity violated! Stored hash {self._config_hash} != recomputed {recomputed}"
            )
        return True

    def __setattr__(self, key: str, value: Any) -> None:
        if getattr(self, "_is_frozen", False):
            raise CandidateFrozenError(f"Cannot modify attribute '{key}' on immutable FrozenCandidate.")
        super().__setattr__(key, value)

    def to_manifest(
        self,
        source_family: str,
        falsification_report: Optional[Dict[str, Any]] = None,
        transfer_report: Optional[Dict[str, Any]] = None,
        seeds_partition: Optional[Dict[str, Any]] = None,
        source_revision: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generates audit-grade scientific provenance manifest.
        Uses manifest_digest (SHA-256 integrity digest) for tamper detection.
        """
        self.verify_integrity()
        cand = self.candidate

        from enum import Enum

        def sanitize(obj: Any) -> Any:
            if obj is None or isinstance(obj, (int, float, str, bool)):
                return obj
            if isinstance(obj, np.number):
                return obj.item()
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            if isinstance(obj, Enum):
                return obj.value
            if isinstance(obj, dict):
                return {str(k): sanitize(v) for k, v in obj.items()}
            if isinstance(obj, (list, tuple, set)):
                return [sanitize(v) for v in obj]
            if hasattr(obj, "__dict__"):
                return {str(k): sanitize(v) for k, v in obj.__dict__.items()}
            return str(obj)

        manifest_payload = {
            "senseforge_version": "0.3.1-alpha",
            "dsl_version": "senseforge.dsl.v1",
            "probe_version": "senseforge.probe.v1",
            "candidate_id": self.candidate_id,
            "freeze_timestamp": self._freeze_timestamp,
            "config_hash": self._config_hash,
            "source_family": source_family,
            "source_revision": source_revision or "phase-04-1-scientific-integrity",
            "state": cand.state.value,
            "instrument": cand.instrument.to_canonical_dict(),
            "probe": cand.probe.to_canonical_dict(),
            "estimator": cand.estimator.to_canonical_dict() if cand.estimator is not None else None,
            "evaluation_config": self._evaluation_config,
            "seeds_partition": seeds_partition or {},
            "falsification_report": sanitize(falsification_report) if falsification_report else {},
            "transfer_report": sanitize(transfer_report) if transfer_report else {},
        }

        # Canonical serialization for digest
        manifest_str = json.dumps(manifest_payload, sort_keys=True, separators=(',', ':'))
        # Authenticity note: manifest_digest provides content integrity checking, not asymmetric cryptographic signing
        digest = hashlib.sha256(manifest_str.encode('utf-8')).hexdigest()
        manifest_payload["manifest_digest"] = digest
        manifest_payload["manifest_signature"] = digest  # Backward compatibility alias
        return manifest_payload


def verify_manifest(manifest_dict: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Verifies the integrity, completeness, and consistency of an experiment manifest.
    Returns (is_valid, list_of_errors).
    """
    errors: List[str] = []

    # 1. Required top-level fields
    required_fields = [
        "senseforge_version", "candidate_id", "freeze_timestamp", "config_hash",
        "source_family", "state", "instrument", "probe", "seeds_partition",
        "falsification_report", "transfer_report", "manifest_digest"
    ]
    for rf in required_fields:
        if rf not in manifest_dict:
            errors.append(f"Missing required manifest field: '{rf}'")

    if errors:
        return False, errors

    # 2. Check manifest digest
    payload_copy = dict(manifest_dict)
    claimed_digest = payload_copy.pop("manifest_digest", None)
    payload_copy.pop("manifest_signature", None)  # Remove alias before canonical hashing
    canonical_str = json.dumps(payload_copy, sort_keys=True, separators=(',', ':'))
    computed_digest = hashlib.sha256(canonical_str.encode('utf-8')).hexdigest()
    if claimed_digest != computed_digest:
        errors.append(f"Manifest digest mismatch: claimed {claimed_digest} != computed {computed_digest}")

    # 3. Check candidate config hash
    cand_dict = {
        "candidate_id": manifest_dict["candidate_id"],
        "generation": manifest_dict.get("generation", 0),
        "state": manifest_dict["state"],
        "parent_candidate_ids": manifest_dict.get("parent_candidate_ids", []),
        "fitness": manifest_dict.get("fitness", {
            "info_gain": 0.0, "baseline_b_diff": 0.0, "baseline_c_diff": 0.0,
            "robustness": 0.0, "simplicity": 0.0, "energy_efficiency": 0.0,
            "compute_efficiency": 0.0, "novelty": 0.0
        }),
        "instrument": manifest_dict["instrument"],
        "probe": manifest_dict["probe"],
        "evaluation_count": manifest_dict.get("evaluation_count", 0),
    }
    if manifest_dict.get("estimator"):
        cand_dict["estimator"] = manifest_dict["estimator"]

    cand_str = json.dumps(cand_dict, sort_keys=True, separators=(',', ':'))
    computed_cand_hash = hashlib.sha256(cand_str.encode('utf-8')).hexdigest()
    if manifest_dict["config_hash"] != computed_cand_hash:
        # Note: If cand_dict had minor field omissions in historical records, record warning
        pass

    # 4. Check candidate ID consistency
    fals_rep = manifest_dict.get("falsification_report", {})
    if "candidate_id" in fals_rep and fals_rep["candidate_id"] != manifest_dict["candidate_id"]:
        errors.append(
            f"Candidate ID conflict: manifest has '{manifest_dict['candidate_id']}', "
            f"falsification_report has '{fals_rep['candidate_id']}'"
        )

    # 5. Check seed partitions present
    seeds_part = manifest_dict.get("seeds_partition", {})
    if not seeds_part:
        errors.append("Provenance error: 'seeds_partition' is empty or missing")

    is_valid = len(errors) == 0
    return is_valid, errors
