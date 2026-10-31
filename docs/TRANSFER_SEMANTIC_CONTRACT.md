# SENSEFORGE: Transfer Semantic Contract Specification

**Project:** SENSEFORGE  
**Classification:** Experimental Computational Science / Artificial Intelligence Research  
**Version:** `0.3.1-alpha`  
**Status:** SPECIFICATION & CONTRACT DEFINITION  

---

## 1. Why Channel Indexing Fails Scientific Portability

In naive automated systems, cross-domain transfer is often treated as simple integer mapping: Channel 0 in Environment A maps to Channel 0 in Environment B.
In physical systems, this is scientifically invalid:
- Channel 0 in `CoupledOscillators` is a **continuous mechanical displacement** (meters, range $[-20, 20]$).
- Channel 0 in `ReactionDiffusion` is a **chemical concentration** ($\text{mol/L}$, range $[0, 1]$).
- Channel 0 in `ThermodynamicSwarm` is a **particle Cartesian coordinate** (meters, range $[0, 10]$).

Claiming that an instrument "transfers" between these domains without formal semantic interface contracts constitutes an error of equivocation.

---

## 2. Semantic Interface Declarations

Every environment family implements [`FamilyInterfaceSpec`](file:///c:/akshar/senseforge/transfer/adapters.py), declaring:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        ENVIRONMENT INTERFACE CONTRACT                  │
├──────────────────────┬───────────────────────┬─────────────────────────┤
│ Specification Field  │ Coupled Oscillators   │ Reaction-Diffusion      │
├──────────────────────┼───────────────────────┼─────────────────────────┤
│ Physical Paradigm    │ 2nd-order non-linear  │ 1st-order non-linear    │
│                      │ oscillator chain (ODE)│ chemical PDE            │
│ Integration Step (dt)│ 0.01 seconds          │ 0.02 seconds            │
│ Primary Observable 0 │ Oscillator pos (m)    │ Activator conc U (mol/L)│
│ Primary Observable 1 │ Neighbor pos (m)      │ Inhibitor conc V (mol/L)│
│ Action Port 0        │ Direct torque (N)     │ Catalyst injection rate │
│ Action Bounds        │ [-1.0, +1.0]          │ [-0.5, +0.5]            │
│ Capability Tag       │ "kinetic_impulse"     │ "chemical_injection"    │
└──────────────────────┴───────────────────────┴─────────────────────────┘
```

---

## 3. The 3 Supported Operational Transfer Modes

[`TransferLab`](file:///c:/akshar/senseforge/transfer/lab.py) supports three explicit operational transfer modes:

### Mode 1: Pure Zero-Shot Transfer (`TransferMode.ZERO_SHOT`)
- **Semantics:** The frozen candidate $\Psi = (\Phi, \Pi)$ and its exploration-fit downstream estimator $\mathbf{w}$ are evaluated directly in the target environment without modifying a single weight, node, or action parameter.
- **Verification Objective:** Discovers whether universal mathematical symmetries translate across distinct simulators without adaptation.

### Mode 2: Limited Calibration Transfer (`TransferMode.LIMITED_CALIBRATION`)
- **Semantics:** The AST expression $\Phi$ and probe sequence $\Pi$ remain strictly frozen, but the downstream linear estimator $\mathbf{w}$ is re-fit on a small target calibration partition ($N_{\text{cal}} \le 5$ seeds).
- **Verification Objective:** Evaluates whether the measurement operator extracts invariant relative features while accommodating target unit scales.

### Mode 3: Structural Transfer (`TransferMode.STRUCTURAL_TRANSFER`)
- **Semantics:** The active probe $\Pi$ is transferred intact, while the operator AST structure $\Phi$ serves as a structural scaffold for rapid parameter tuning.

---

## 4. Rejection of Incompatible Mappings

Before running transfer experiments, [`SemanticTransferContract.validate_compatibility()`](file:///c:/akshar/senseforge/transfer/adapters.py) executes pre-flight validation:
1. Candidate required observation channels must not exceed target channel capacity.
2. Candidate intervention ports must match target actuator capabilities.
3. If validation fails, transfer is immediately halted with status **`INCOMPATIBLE_SEMANTICS`** and an explanatory error message, preventing invalid transfer claims.

---

## 5. Mathematically Sound Transfer Degradation Ratio (TDR)

Previous implementations concealed negative source skill by reporting $\text{TDR} = 0.0$. Phase 04.1 implements the rigorous formulation:

$$\text{TDR} = \begin{cases} \frac{SS_{\text{tgt}}}{SS_{\text{src}}} & \text{if } SS_{\text{src}} > 0 \\ \mathbf{undefined} & \text{if } SS_{\text{src}} \le 0 \end{cases}$$

Additionally, the absolute skill retention difference is reported unconditionally:
$$\Delta SS = SS_{\text{tgt}} - SS_{\text{src}}$$

### Classification Criteria:
- **`CROSS_FAMILY_TRANSFER`:** $SS_{\text{tgt}} \ge 0.05$ with $p_{\text{adj}} < 0.01$ (statistically significant positive transfer).
- **`SAME_FAMILY_GENERALIZATION`:** Source family equals target family and $p_{\text{adj}} < 0.01$.
- **`INCONCLUSIVE_TRANSFER`:** Target skill is positive but fails statistical significance.
- **`FAILED_TRANSFER`:** Target skill is non-positive ($SS_{\text{tgt}} \le 0$).
- **`INCOMPATIBLE_SEMANTICS`:** Channels or action capabilities are physically incompatible.
