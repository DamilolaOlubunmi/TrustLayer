import time
import logging
from datetime import datetime, timedelta

import joblib
import pandas as pd

from sqlmodel import Session, select

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, average_precision_score, confusion_matrix

from xgboost import XGBClassifier

from app.ml.constants import MODEL_A_FEATURES
from app.models import TransactionFeatures
from app.utils import log_training_result 


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)


# =====================================================
# LOAD DATA FROM DATABASE
# =====================================================

def load_training_data(db: Session):

    cutoff = datetime.now() - timedelta(hours=48)

    db_rows = db.exec(
        select(
            TransactionFeatures
        ).where(
            TransactionFeatures.created_at >= cutoff
        )
    )

    db_rows_dict = [rows.model_dump() for rows in db_rows]

    training_data_rows = []

    for row in db_rows_dict:
        training_data = dict()
        for features in MODEL_A_FEATURES:
            training_data[features] = row.get(features, "")
            training_data["is_fraud"] = row.get("is_fraud", 0)

        training_data_rows.append(training_data)

    return training_data_rows

# =====================================================
# PREPARE DATASET
# =====================================================

def prepare_dataset(training_data_rows):
    data = pd.DataFrame(training_data_rows)

    X = data[MODEL_A_FEATURES]

    y = data["is_fraud"]

    return X, y


# =====================================================
# TRAIN MODEL
# =====================================================

def train_model(X, y, db: Session, test_size=0.2, random_state=42):

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y
    )

    model = XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        objective="binary:logistic",
        eval_metric="logloss"
    )

    logging.info("Training buyer model...")

    training_data_size = len(X_train)

    start_time = time.time()

    model.fit(X_train, y_train)

    training_duration = (
        time.time() - start_time
    )

    predictions = model.predict(X_test)

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        y_test,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0
    )
    roc_auc = roc_auc_score(
        y_test,
        predictions
    )

    pr_auc = average_precision_score(
        y_test,
        predictions
    )
    cf_matrix = confusion_matrix(
        y_test,
        predictions
    )

    metrics = {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1,
        "roc_auc": roc_auc,
        "pr_auc": pr_auc,
        "confusion_matrix": cf_matrix.tolist(),
        "training_time_seconds": round(training_duration, 2),
        "training_data_size": training_data_size
    }

    log_training_result(
        metrics,
        model_type="buyer",
        db=db,
        error_message=None
    )

    return model, metrics


# =====================================================
# SAVE MODEL
# =====================================================

def save_model(model):

    model_path = "buyer_model.pkl"

    joblib.dump(model, model_path)

    logging.info(
        f"Model saved to {model_path}"
    )
