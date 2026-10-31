# SENSEFORGE: Phase 04.1 Scientific Integrity Audit

**Project:** SENSEFORGE  
**Classification:** Experimental Computational Science / Artificial Intelligence Research  
**Version:** `0.3.1-alpha`  
**Milestone:** Phase 04.1 Scientific Integrity Repair & Evaluation Reconstruction  
**Authors:** SENSEFORGE Principal Research Architecture Group  
**Status:** COMPLETE & VERIFIED  

---

## 1. Executive Summary

During the Phase 04 master review, several critical methodological and implementation discrepancies were identified in the automated discovery and verification pipelines. While the software reported successful test passes and honest candidate rejections, the underlying experimental architecture contained structural compromises that compromised scientific validity.

This audit report documents each identified failure mode, traces its mathematical and procedural origins in the codebase, and details the architectural repairs implemented in Phase 04.1.

---

## 2. Comprehensive Audit Matrix

| Defect ID | Architectural Area | Root Cause Identified | Scientific Risk | Phase 04.1 Repair |
| :--- | :--- | :--- | :--- | :--- |
| **AUD-01** | Candidate Selection | `milestone_04_verify.py` generated random genomes using `GenomeFactory` instead of sampling from `DiscoveryForge` Pareto archive. | Misrepresentation of random search as evolutionary discovery. | Implemented `CandidateLifecycleManager`: evolutionary search on exploration partition $\to$ validation screening $\to$ honest `NO_ELIGIBLE_CANDIDATE` gate. |
| **AUD-02** | Target Trajectory Mismatch | Post-probe trajectories represented different physical attractor states rather than a common ground truth. | Comparing candidate against baseline on different dynamical targets violates ceteris paribus. | Replaced trajectory forecasting with estimation of an intrinsic hidden physical property ($k_0$ stiffness). |
| **AUD-03** | Measurement Operator Role | AST scalar outputs were repeated across the forecast horizon rather than acting as feature representations. | Conflating feature representation with downstream estimation; inability to learn non-trivial mappings. | Separated operator into feature generator coupled with explicit L2 Ridge `DownstreamEstimator`. |
| **AUD-04** | Control Experiments | Baselines lacked budget parity in energy, observation count, and target alignment. | Unfair comparisons favoring or disfavoring candidate arbitrarily. | Formalized 8 strategies (A–H) with identical sample counts, observation durations, and `BaselineBudgetReport`. |
| **AUD-05** | Transfer Semantics | `EnvironmentAdapter` checked only raw integer channel indices, ignoring variable units and physics meanings. | Invalid claims of transfer across semantically incompatible physical fields. | Implemented `FamilyInterfaceSpec` with physical semantics, units, action bounds, and explicit compatibility rejection. |
| **AUD-06** | Degradation Metric Collapse | Transfer Degradation Ratio (TDR) returned `0.0` whenever source skill was negative. | Concealed massive negative performance; mathematically undefined ratio reported as zero. | Redesigned TDR to report `None` / `undefined` when source skill is non-positive; reports absolute skill delta $\Delta SS$. |
| **AUD-07** | Candidate Freezing Escapes | `FrozenCandidate` exposed mutable internal candidate reference; no file-persisted partition locks. | Downstream mutations could alter candidate state without changing configuration hash. | Enforced defensive immutability with canonical JSON snapshotting, re-hashing on evaluation, and file-persisted lock database. |
| **AUD-08** | Provenance Terminology | Plain SHA-256 hash was labeled `manifest_signature`. | Misleading terminology implying asymmetric digital signature authentication. | Renamed to `manifest_digest` with explicit documentation of integrity digest vs. digital signature. |
| **AUD-09** | Evaluator Isolation | Verification script executed evaluation in-process, bypassing process-separated boundary. | Potential heap contamination and covert state leakage between simulator and evaluator. | Built `IsolatedEvaluatorClient` and `evaluator_process.py` running in separate OS processes. |
| **AUD-10** | Artifact Inconsistency | Divergent candidate IDs across `docs/PHASE_04_EXPERIMENTAL_RESULTS.md` and `confirmatory_manifest.json`. | Broken chain of cryptographic provenance. | Standardized end-to-end manifest generation in `milestone_04_1_verify.py` with automated `verify_manifest`. |

---

## 3. Mathematical & Empirical Analysis of Repaired Defects

### 3.1 The Common Target Paradigm (AUD-02 & AUD-03)
In Phase 04, the candidate predicted future observation frames $y_{t+1:t+H}$ following an active probe $\Pi$, while Baseline A predicted the unperturbed decay trajectory. Because the active probe physically displaced the system into non-linear regimes, $y_{\text{perturbed}}$ differed fundamentally from $y_{\text{unperturbed}}$.

In Phase 04.1, the task is redefined as **Physical Estimand Inference**:
$$\theta^* = \mathcal{P}(\mathcal{E}) \in \mathbb{R}$$
For `CoupledOscillators`, $\theta^* = k_0$, the intrinsic linear spring constant of oscillator 0 ($k_0 \sim U(0.5, 2.5)$).
All strategies receive the exact same initial state $\mathbf{x}_0$ and must infer $\widehat{\theta}$.
The estimation error is:
$$\mathcal{L}(\widehat{\theta}, \theta^*) = (\widehat{\theta} - \theta^*)^2$$
Both candidate and baselines are judged by the exact same loss against the exact same latent target.

### 3.2 Proper Transfer Degradation Ratio Formulation (AUD-06)
Previously:
$$\text{TDR}_{\text{old}} = \begin{cases} \frac{SS_{\text{tgt}}}{SS_{\text{src}} + \epsilon} & \text{if } SS_{\text{src}} > 0 \\ 0.0 & \text{otherwise} \end{cases}$$
When $SS_{\text{src}} = -2560.47$ and $SS_{\text{tgt}} = -21767.55$, $\text{TDR}$ was reported as $0.0$, creating the illusion of zero degradation rather than catastrophic failure.

In Phase 04.1:
$$\text{TDR}_{\text{new}} = \begin{cases} \frac{SS_{\text{tgt}}}{SS_{\text{src}}} & \text{if } SS_{\text{src}} > 0 \\ \text{undefined} & \text{if } SS_{\text{src}} \le 0 \end{cases}$$
Along with the absolute skill retention difference:
$$\Delta SS = SS_{\text{tgt}} - SS_{\text{src}}$$

### 3.3 Defensive Immutability and Audit-Grade Provenance (AUD-07 & AUD-08)
`FrozenCandidate` now encapsulates candidate state in an immutable canonical string snapshot $S = \text{CanonicalJSON}(\Psi)$. Every query to `.candidate` reconstructs a clean decoupled instance from $S$. Recomputed hash checks occur automatically prior to execution.
The manifest payload verifies via `verify_manifest()`, confirming identical candidate IDs, hash matches, and full report presence.
