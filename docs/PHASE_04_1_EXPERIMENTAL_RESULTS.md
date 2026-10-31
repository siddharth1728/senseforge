# SENSEFORGE: Phase 04.1 Experimental Results & Scientific Evidence

**Project:** SENSEFORGE  
**Classification:** Experimental Computational Science / Artificial Intelligence Research  
**Version:** `0.3.1-alpha`  
**Milestone:** Phase 04.1 Scientific Integrity Repair & Evaluation Reconstruction  
**Authors:** SENSEFORGE Principal Research Architecture Group  
**Status:** COMPLETE & EMPIRICALLY CONFIRMED  

---

## 1. Executive Summary & Epistemic Honesty

In accordance with our core non-negotiable principles:
> **An honest negative outcome produced by an unimpeachable scientific protocol is a successful scientific milestone.**

In Phase 04.1, SENSEFORGE rebuilt its candidate selection and evaluation machinery from the ground up:
1. Candidate `pair_7a65066ed7ce` was genuinely evolved in [`DiscoveryForge`](file:///c:/akshar/senseforge/discovery/forge.py) using exploration seeds only.
2. The candidate was screened on independent validation seeds, fitted with an explicit downstream linear estimator, and defensively sealed in [`FrozenCandidate`](file:///c:/akshar/senseforge/falsification/manifest.py).
3. The candidate was evaluated against an identical common target ($\theta^* = k_0$, linear oscillator stiffness) on the **Sealed Confirmatory Partition ($N = 35$ seeds)** alongside all 7 control baselines under matched operational budgets.
4. The candidate was subjected to out-of-family zero-shot transfer in the Gray-Scott and Lennard-Jones simulators.

---

## 2. Selected Candidate Provenance

- **Candidate ID:** `pair_7a65066ed7ce`
- **Lineage:** Evolved over 2 generations in `DiscoveryForge` from exploration seed 101.
- **Operator AST ($\Phi$):** `Sub(Channel(0), DivSafe(Variance(Channel(0)), Channel(0)))`
- **Probe Schedule ($\Pi$):** `['ReversePerturb', 'ReversePerturb', 'ReversePerturb']`
- **Downstream Estimator:** L2 Regularized Linear Ridge Estimator ($\lambda = 0.001$, 6 normalized features).
- **Configuration SHA-256:** `59a9fa9d15109bb6ec44fcd653def5602b40d7a82ef5ce26c8f6ec7c5710ad2b`
- **Evaluated Target:** `oscillator_stiffness` ($k_0 \in [0.5, 2.5]\text{ N/m}$).

---

## 3. Locked Confirmatory Telemetry ($N = 35$ Seeds)

All 8 strategies were evaluated against identical initial conditions and the identical target parameter $k_0$:

| Strategy / Comparator | Mean Loss (MSE) | Skill Score ($SS$) | Cohen's $d$ | Corrected $p$ (Holm) | Significance ($\alpha=0.01$) | Epistemic Verdict |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Strategy E: Candidate Pair** | $0.2314$ | — | — | — | — | Evaluated Candidate |
| **Strategy A: Passive Control** | $0.2452$ | $+0.0561$ | $+0.48$ | $0.0609$ | Not Significant | Fails Significance Threshold |
| **Strategy B: Conventional Stats** | $0.1931$ | $-0.1983$ | $-0.26$ | $0.9158$ | Not Significant | Fails (Worse than Stats) |
| **Strategy C: Random Ensemble ($K=5$)** | $0.2442$ | $+0.0524$ | $+0.46$ | $0.0420$ | Not Significant | Fails Significance Threshold |
| **Strategy D: Impulse Control** | $0.2429$ | $+0.0474$ | $+0.43$ | $0.0557$ | Not Significant | Fails Significance Threshold |
| **Strategy F: Ablation F (Raw + Probe)** | $0.2449$ | $+0.0551$ | $+0.47$ | $0.0501$ | Not Significant | Fails Operator Necessity Test |
| **Strategy G: Ablation G (AST + Rand)** | $0.2317$ | $+0.0012$ | $+0.69$ | $2.24 \times 10^{-4}$ | **Significant** | Marginal effect size |
| **Strategy H: Ablation H3 (AST + Pass)**| $0.2317$ | $+0.0012$ | $+0.69$ | $1.99 \times 10^{-4}$ | **Significant** | Marginal effect size |
| **Test F: Sham Intervention** | $0.2452$ | $+0.0562$ | $+0.48$ | $0.0522$ | Not Significant | Decoupled channel parity |
| **Test G: Temporal Null Control** | $0.3567$ | $+0.3513$ | $+0.38$ | $0.1442$ | Not Significant | Null hypothesis not rejected |

### Confirmatory Decision:
$$\mathbf{Epistemic\ Status} = \mathbf{REJECTED\ /\ INCONCLUSIVE}$$
- While the candidate achieved positive raw skill ($SS = +0.0561$) over the passive baseline, its Wilcoxon signed-rank $p$-value ($p = 0.0609$) failed the rigorous confirmatory significance threshold ($\alpha = 0.01$).
- More importantly, **Baseline B (Conventional Statistics on Passive Observations)** outperformed the candidate ($SS = -0.1983$, MSE $0.1931$ vs $0.2314$), proving that simple rolling variance and autocorrelation on passive observations capture $k_0$ better than the evolved instrument.
- The Falsification Chamber successfully identified that the evolved candidate does **not** constitute a genuine scientific discovery.

---

## 4. Baseline Budget Audit Report

```text
Target Property:              oscillator_stiffness
Total Duration per Seed:      27 discrete steps (Pre: 12, Probe: 7, Post: 8)
Total Observation Count:      54 channel readings / seed
Candidate Probe Energy:       1.4745 (N^2 s)
Matched Control Max Amp:      0.8308 N
Initial Phase Space Coord:    Paired seeds identically matched across all 8 strategies
```

---

## 5. Cross-Family Transfer Telemetry (M07 TransferLab)

The candidate was evaluated in zero-shot mode across 20 held-out seeds in the out-of-family target environments:

### Target 1: Reaction-Diffusion (Gray-Scott Morphogenesis)
- **Target Property:** Feed rate $F \in [0.01, 0.08]$
- **Target Skill Score:** $-1.42 \times 10^8$
- **Absolute Skill Delta ($\Delta SS$):** $-1.42 \times 10^8$
- **Transfer Degradation Ratio (TDR):** Defined ($SS_{\text{src}} > 0$), $\text{TDR} = -2.53 \times 10^9$
- **Corrected Significance:** $p = 1.0000$
- **Transfer Category:** **`FAILED_TRANSFER`**

### Target 2: Thermodynamic Swarm (Lennard-Jones Particulate Dynamics)
- **Target Property:** Potential depth $\epsilon \in [0.1, 2.0]\text{ J}$
- **Target Skill Score:** $-1.04 \times 10^9$
- **Absolute Skill Delta ($\Delta SS$):** $-1.04 \times 10^9$
- **Transfer Degradation Ratio (TDR):** Defined ($SS_{\text{src}} > 0$), $\text{TDR} = -1.86 \times 10^{10}$
- **Corrected Significance:** $p = 1.0000$
- **Transfer Category:** **`FAILED_TRANSFER`**

---

## 6. Provenance Digest & Verification Evidence

- **Manifest File:** `confirmatory_manifest_v041.json`
- **Candidate ID:** `pair_7a65066ed7ce`
- **Configuration SHA-256:** `59a9fa9d15109bb6ec44fcd653def5602b40d7a82ef5ce26c8f6ec7c5710ad2b`
- **Manifest Digest:** `0a7f23f7c57c79a9fa6032a2ea281b3ef96935635073117a1f9490105124c4a9`
- **Verification Engine Status:** **PASS** (Zero tamper flags, exact candidate ID and configuration hash match).
