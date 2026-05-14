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
    build_buyer_features,
    MODEL_A_FEATURES
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
    """Load and transform transaction records from the database for training.
    
    Retrieves all transactions from the database and transforms them into a standardized
    nested dictionary format required by the feature engineering pipeline.
    
    Returns:
        list: A list of dictionaries, each containing:
            - transaction: dict with id, amount, timestamp
            - buyer: dict with id, account_age_days
            - vendor: dict with id, account_age_days, category
            - session: dict with arrival_source, time_on_page_seconds, device_fingerprint
            - buyer_profile: dict with avg_transaction_amount, total_past_transactions, past_dispute_count
            - label: int (0=legitimate, 1=fraudulent)
    """
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
                    row["vendor_category"]
            },

            "session": {
                "arrival_source":
                    row["arrival_source"],

                "time_on_page_seconds":
                    row["time_on_page_seconds"],

                "device_fingerprint":
                    row["device_fingerprint"]
            },

            "buyer_profile": {
                "avg_transaction_amount":
                    row["avg_transaction_amount"],

                "total_past_transactions":
                    row["total_past_transactions"],

                "past_dispute_count":
                    row["past_dispute_count"]
            },

            "label": row["label"]
        }

        rows.append(transformed_row)

    return rows


# =====================================================
# PREPARE DATASET
# =====================================================

def prepare_dataset(rows):
    """Prepare training dataset by extracting features and labels from raw transaction data.
    
    Processes a list of transaction records, extracts buyer features for each transaction,
    and organizes data into feature matrix and label vector suitable for model training.
    
    Args:
        rows (list): List of transaction dictionaries with transaction, buyer, vendor,
                     session, buyer_profile, and label fields.
    
    Returns:
        tuple: A tuple containing:
            - X (pd.DataFrame): Feature matrix with MODEL_A_FEATURES columns
            - y (list): Label vector (0=legitimate, 1=fraudulent)
    """
    feature_rows = []
    labels = []

    for row in rows:

        payload = {
            "transaction": row["transaction"],
            "buyer": row["buyer"],
            "vendor": row["vendor"],
            "session": row["session"]
        }

        buyer_profile = row["buyer_profile"]

        features = build_buyer_features(
            payload,
            buyer_profile
        )

        feature_rows.append(features)

        labels.append(row["label"])

    X = pd.DataFrame(feature_rows)

    X = X[MODEL_A_FEATURES]

    y = labels

    return X, y


# =====================================================
# TRAIN MODEL
# =====================================================

def train_model(X, y):
    """Train an XGBoost classifier for buyer fraud detection.
    
    Trains a binary classification model on buyer features, evaluates it on a held-out
    test set, and computes performance metrics including accuracy, precision, recall, and F1.
    Uses 80/20 train-test split with stratification to maintain class balance.
    
    Args:
        X (pd.DataFrame): Feature matrix with buyer-side features
        y (list or array-like): Binary labels (0=legitimate, 1=fraudulent)
    
    Returns:
        tuple: A tuple containing:
            - model (XGBClassifier): Trained model ready for prediction
            - metrics (dict): Dictionary with keys:
                - accuracy: float (0-1)
                - precision: float (0-1)
                - recall: float (0-1)
                - f1_score: float (0-1)
                - training_time_seconds: float
    """
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

    logging.info("Training buyer model...")

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
    """Serialize and save the trained buyer model to disk.
    
    Persists the trained XGBoost classifier to a pickle file for later loading
    and inference in production systems.
    
    Args:
        model (XGBClassifier): The trained buyer fraud detection model
    
    Returns:
        None
    """
    model_path = "buyer_model.pkl"

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