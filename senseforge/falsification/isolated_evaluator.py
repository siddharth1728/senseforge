"""
SENSEFORGE M06: Isolated Evaluator Client
Spawns the Independent Evaluator Process in a separate OS process,
guaranteeing zero shared memory or pointer leakage between the discovery engine
and the locked evaluation authority.
"""

import sys
import subprocess
import json
import tempfile
import os
from typing import Dict, Any, Optional

from senseforge.discovery.candidate import PairedCandidate
from senseforge.falsification.manifest import FrozenCandidate


class IsolatedEvaluatorClient:
    """
    Client interface invoking the process-separated evaluator.
    """

    def __init__(self, audit_log_path: str = "evaluator_audit.log"):
        self.audit_log_path = audit_log_path

    def evaluate_in_subprocess(
        self,
        frozen_candidate: FrozenCandidate,
        target_name: str = "oscillator_stiffness",
        partition_type: str = "LOCKED_TEST",
        timeout_seconds: float = 60.0
    ) -> Dict[str, Any]:
        """
        Executes evaluation within an independent OS process boundary.
        """
        frozen_candidate.verify_integrity()

        # Write candidate payload to secure temporary file
        cand_dict = frozen_candidate.candidate.to_canonical_dict()
        with tempfile.NamedTemporaryFile("w", delete=False, suffix=".json") as f_in:
            json.dump(cand_dict, f_in)
            temp_in_path = f_in.name

        with tempfile.NamedTemporaryFile("r", delete=False, suffix=".json") as f_out:
            temp_out_path = f_out.name

        try:
            cmd = [
                sys.executable,
                "-m", "senseforge.falsification.evaluator_process",
                "--candidate-file", temp_in_path,
                "--output-file", temp_out_path,
                "--target", target_name,
                "--partition", partition_type,
                "--audit-log", self.audit_log_path,
            ]

            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
                check=False
            )

            if proc.returncode != 0:
                raise RuntimeError(
                    f"Evaluator process exited with error code {proc.returncode}.\n"
                    f"Stderr: {proc.stderr}\nStdout: {proc.stdout}"
                )

            with open(temp_out_path, "r") as f_res:
                results = json.load(f_res)

            return results

        finally:
            # Clean up temp files
            if os.path.exists(temp_in_path):
                os.remove(temp_in_path)
            if os.path.exists(temp_out_path):
                os.remove(temp_out_path)
