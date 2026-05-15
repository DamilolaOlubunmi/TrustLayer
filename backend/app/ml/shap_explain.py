from typing import Any

import numpy as np  
import pandas as pd
import shap
from sklearn.pipeline import Pipeline


def _unwrap_tree_model(model: Any) -> tuple[Any, Any]:
    if isinstance(model, Pipeline):
        if not model.steps:
            raise ValueError("Cannot explain an empty pipeline")

        transformer = model[:-1]
        estimator = model.steps[-1][1]
        return transformer, estimator

    return None, model


def explain(features: dict, model: Any) -> list[dict]:
    transformer, tree_model = _unwrap_tree_model(model)

    explainer = shap.TreeExplainer(tree_model)

    feature_frame = pd.DataFrame([features], columns=list(features.keys()))
    transformed_features = (
        transformer.transform(feature_frame)
        if transformer is not None
        else feature_frame.to_numpy(dtype=float)
    )

    shap_values = explainer.shap_values(transformed_features)
    if isinstance(shap_values, list):
        shap_values = shap_values[0]

    shap_values = np.asarray(shap_values).reshape(-1)

    paired = list(zip(features.keys(), shap_values))
    top3 = sorted(paired, key=lambda x: abs(x[1]), reverse=True)[:3]

    return [{"feature": f, "value": float(round(float(v), 4))} for f, v in top3]