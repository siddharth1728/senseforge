"""
SENSEFORGE M06: Explicit Downstream Estimator
Decouples the measurement operator (feature generation) from the estimation model.
Fits deterministic regularized estimators on exploration seeds, tunes on validation seeds,
and freezes completely before confirmatory evaluation.
"""

from typing import Dict, Any, List, Optional, Union
import numpy as np


class EstimatorFrozenError(Exception):
    """Raised when an attempt is made to retrain a frozen downstream estimator."""
    pass


class DownstreamEstimator:
    """
    Deterministic linear ridge estimator with L2 regularization.
    Maps feature representations to ground-truth property estimates:
        theta_hat = w^T z + b
    """

    def __init__(self, l2_reg: float = 1e-3):
        self.l2_reg = l2_reg
        self.weights: Optional[np.ndarray] = None
        self.bias: float = 0.0
        self.feature_mean: Optional[np.ndarray] = None
        self.feature_std: Optional[np.ndarray] = None
        self._is_frozen = False

    @staticmethod
    def extract_features_from_operator_output(val: Union[float, np.ndarray]) -> np.ndarray:
        """
        Extracts fixed-dimensional summary features from an AST operator output.
        Returns a vector: [mean, std, min, max, last, rate_of_change]
        """
        if isinstance(val, (int, float, np.number)):
            v = float(val)
            if np.isnan(v) or np.isinf(v):
                v = 0.0
            return np.array([v, 0.0, v, v, v, 0.0], dtype=np.float64)

        arr = np.asarray(val, dtype=np.float64).flatten()
        if len(arr) == 0:
            return np.zeros(6, dtype=np.float64)

        # Sanitize NaNs and infinities
        arr = np.nan_to_num(arr, nan=0.0, posinf=1e3, neginf=-1e3)

        mean_v = float(np.mean(arr))
        std_v = float(np.std(arr))
        min_v = float(np.min(arr))
        max_v = float(np.max(arr))
        last_v = float(arr[-1])
        delta_v = float(arr[-1] - arr[0]) if len(arr) > 1 else 0.0

        return np.array([mean_v, std_v, min_v, max_v, last_v, delta_v], dtype=np.float64)

    @staticmethod
    def extract_raw_observation_features(trajectory: np.ndarray) -> np.ndarray:
        """
        Extracts summary features from a raw observation channel trajectory.
        """
        arr = np.asarray(trajectory, dtype=np.float64).flatten()
        return DownstreamEstimator.extract_features_from_operator_output(arr)

    @staticmethod
    def extract_conventional_statistical_features(trajectory: np.ndarray) -> np.ndarray:
        """
        Extracts conventional rolling statistical features (Baseline B):
        [mean, variance, peak_to_peak, autocorrelation_lag1, rms, energy]
        """
        arr = np.asarray(trajectory, dtype=np.float64).flatten()
        if len(arr) == 0:
            return np.zeros(6, dtype=np.float64)
        arr = np.nan_to_num(arr, nan=0.0, posinf=1e3, neginf=-1e3)

        mean_v = float(np.mean(arr))
        var_v = float(np.var(arr))
        p2p_v = float(np.ptp(arr))
        rms_v = float(np.sqrt(np.mean(arr ** 2)))
        energy_v = float(np.sum(arr ** 2))

        # Autocorrelation lag 1
        if len(arr) > 1 and var_v > 1e-9:
            norm_arr = arr - mean_v
            ac_v = float(np.mean(norm_arr[:-1] * norm_arr[1:]) / var_v)
        else:
            ac_v = 0.0

        return np.array([mean_v, var_v, p2p_v, ac_v, rms_v, energy_v], dtype=np.float64)

    def fit(self, X: np.ndarray, y: np.ndarray) -> "DownstreamEstimator":
        """
        Fits ridge regression model on training data.
        X shape: (N, D), y shape: (N,)
        """
        if self._is_frozen:
            raise EstimatorFrozenError("Cannot fit a frozen DownstreamEstimator.")

        X = np.asarray(X, dtype=np.float64)
        y = np.asarray(y, dtype=np.float64).flatten()

        n_samples, n_features = X.shape

        # Normalize features
        self.feature_mean = np.mean(X, axis=0)
        self.feature_std = np.std(X, axis=0)
        self.feature_std[self.feature_std < 1e-8] = 1.0

        X_norm = (X - self.feature_mean) / self.feature_std

        # Center target
        self.bias = float(np.mean(y))
        y_cent = y - self.bias

        # Regularized Ridge OLS: (X^T X + lambda I)^(-1) X^T y
        reg_matrix = self.l2_reg * np.eye(n_features)
        lhs = X_norm.T @ X_norm + reg_matrix
        rhs = X_norm.T @ y_cent

        try:
            self.weights = np.linalg.solve(lhs, rhs)
        except np.linalg.LinAlgError:
            self.weights = np.linalg.lstsq(lhs, rhs, rcond=None)[0]

        return self

    def predict(self, x: np.ndarray) -> float:
        """
        Predicts scalar property value for a feature vector.
        """
        if self.weights is None:
            raise ValueError("DownstreamEstimator must be fitted before predict.")

        x = np.asarray(x, dtype=np.float64).flatten()
        x_norm = (x - self.feature_mean) / self.feature_std
        pred = float(np.dot(self.weights, x_norm) + self.bias)
        return pred

    def freeze(self) -> None:
        """Locks the estimator parameters immutably."""
        self._is_frozen = True

    def to_canonical_dict(self) -> Dict[str, Any]:
        """Serializes estimator parameters for hashing and provenance."""
        return {
            "l2_reg": float(self.l2_reg),
            "bias": float(self.bias),
            "weights": [float(w) for w in self.weights] if self.weights is not None else [],
            "feature_mean": [float(m) for m in self.feature_mean] if self.feature_mean is not None else [],
            "feature_std": [float(s) for s in self.feature_std] if self.feature_std is not None else [],
            "is_frozen": self._is_frozen
        }

    @classmethod
    def from_canonical_dict(cls, data: Dict[str, Any]) -> "DownstreamEstimator":
        """Reconstructs estimator from serialized dictionary."""
        est = cls(l2_reg=data["l2_reg"])
        est.bias = float(data["bias"])
        if data["weights"]:
            est.weights = np.array(data["weights"], dtype=np.float64)
            est.feature_mean = np.array(data["feature_mean"], dtype=np.float64)
            est.feature_std = np.array(data["feature_std"], dtype=np.float64)
        est._is_frozen = data.get("is_frozen", False)
        return est
