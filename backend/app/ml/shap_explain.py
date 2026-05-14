from typing import Any

import numpy as np  
import shap


def explain(features: dict, model: Any) -> list[dict]:
    explainer = shap.TreeExplainer(model)

    feature_array = np.array(list(features.values())).reshape(1, -1)
    shap_values = explainer.shap_values(feature_array)[0]

    paired = list(zip(features.keys(), shap_values))
    top3 = sorted(paired, key=lambda x: abs(x[1]), reverse=True)[:3]

    return [{"feature": f, "value": round(v, 4)} for f, v in top3]