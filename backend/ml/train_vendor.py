import time
import logging
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)

from xgboost import XGBClassifier

from features import (
    build_vendor_features,
    MODEL_B_FEATURES
)

from database import (
    fetch_training_transactions
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)


# =====================================================
# LOAD DATA FROM DATABASE
# =====================================================

def load_training_data():

    db_rows = fetch_training_transactions()

    rows = []

    for row in db_rows:

        row = dict(row)

        transformed_row = {

            "transaction": {
                "id": row["transaction_id"],
                "amount": row["amount"],
                "timestamp": row["timestamp"]
            },

            "buyer": {
                "id": row["buyer_id"],
                "account_age_days":
                    row["buyer_account_age_days"]
            },

            "vendor": {
                "id": row["vendor_id"],
                "account_age_days":
                    row["vendor_account_age_days"],

                "category":
                    row["vendor_category"],

                "listing_price":
                    row.get("listing_price", 0)
            },

            "session": {
                "arrival_source":
                    row["arrival_source"],

                "time_on_page_seconds":
                    row["time_on_page_seconds"],

                "device_fingerprint":
                    row["device_fingerprint"]
            },

            "vendor_profile": {

                "total_completed_transactions":
                    row.get(
                        "total_completed_transactions",
                        0
                    ),

                "total_transactions":
                    row.get(
                        "total_transactions",
                        0
                    ),

                "category_avg_price":
                    row.get(
                        "category_avg_price",
                        1
                    ),

                "tx_last_24h":
                    row.get(
                        "tx_last_24h",
                        0
                    ),

                "fraud_flags":
                    row.get(
                        "fraud_flags",
                        0
                    )
            },

            "label": row["label"]
        }

        rows.append(transformed_row)

    return rows


# =====================================================
# PREPARE DATASET
# =====================================================

def prepare_dataset(rows):

    feature_rows = []
    labels = []

    for row in rows:

        payload = {
            "transaction": row["transaction"],
            "buyer": row["buyer"],
            "vendor": row["vendor"],
            "session": row["session"]
        }

        vendor_profile = row["vendor_profile"]

        features = build_vendor_features(
            payload,
            vendor_profile
        )

        feature_rows.append(features)

        labels.append(row["label"])

    X = pd.DataFrame(feature_rows)

    X = X[MODEL_B_FEATURES]

    y = labels

    return X, y


# =====================================================
# TRAIN MODEL
# =====================================================

def train_model(X, y):

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    model = XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        objective="binary:logistic",
        eval_metric="logloss"
    )

    logging.info("Training vendor model...")

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

    metrics = {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1,
        "training_time_seconds":
            round(training_duration, 2)
    }

    return model, metrics


# =====================================================
# SAVE MODEL
# =====================================================

def save_model(model):

    model_path = "vendor_model.pkl"

    joblib.dump(model, model_path)

    logging.info(
        f"Model saved to {model_path}"
    )


# =====================================================
# MAIN EXECUTION
# =====================================================

if __name__ == "__main__":

    logging.info(
        "Loading training data from database..."
    )

    rows = load_training_data()

    logging.info(
        f"Loaded {len(rows)} records"
    )

    if len(rows) < 10:

        logging.warning(
            "Very small dataset detected. "
            "Training quality may be poor."
        )

    X, y = prepare_dataset(rows)

    logging.info(
        "Dataset prepared successfully"
    )

    model, metrics = train_model(X, y)

    logging.info(
        "Training complete"
    )

    logging.info(
        f"Metrics: {metrics}"
    )

    save_model(model)