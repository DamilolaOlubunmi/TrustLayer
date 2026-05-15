import sys
import tempfile
import types
import unittest
from datetime import datetime, timezone
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from sqlmodel import Session, SQLModel, create_engine, select

from app.models import Feedback, Platform, Transaction, TransactionFeatures
import app.database as database


notification_service_stub = types.ModuleType("app.services.notification_service")


async def _send_review_notification(*args, **kwargs):
    return None


notification_service_stub.send_review_notification = _send_review_notification
sys.modules["app.services.notification_service"] = notification_service_stub

import app.background_tasks as background_tasks


class FeedbackLabelUpdateTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "test.db"
        self.engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})

        database.engine = self.engine
        background_tasks.engine = self.engine
        SQLModel.metadata.create_all(self.engine)

        self.platform_id = "platform_1"
        self.transaction_id = "txn_123"

        with Session(self.engine) as session:
            session.add(
                Platform(
                    id=self.platform_id,
                    name="Test Platform",
                    email="merchant@example.com",
                    is_active=True,
                )
            )
            session.add(
                Transaction(
                    id=self.transaction_id,
                    platform_id=self.platform_id,
                    created_at=datetime.now(timezone.utc),
                    final_score=0.98,
                    decision="BLOCK",
                )
            )
            session.add(
                TransactionFeatures(
                    transaction_id=self.transaction_id,
                    is_fraud=0,
                )
            )
            session.commit()

    def tearDown(self):
        self.temp_dir.cleanup()

    def _feedback_rows(self):
        with Session(self.engine) as session:
            return session.exec(
                select(Feedback).where(Feedback.transaction_id == self.transaction_id)
            ).all()

    def _feature_rows(self, transaction_id: str | None = None):
        lookup_id = transaction_id or self.transaction_id
        with Session(self.engine) as session:
            return session.exec(
                select(TransactionFeatures).where(TransactionFeatures.transaction_id == lookup_id)
            ).all()

    def test_feedback_is_saved_and_relabels_transaction_features(self):
        with Session(self.engine) as session:
            session.add(
                Feedback(
                    platform_id=self.platform_id,
                    transaction_id=self.transaction_id,
                    outcome="fraudulent",
                    reported_by="merchant@example.com",
                    reported_at=datetime(2026, 5, 14, 12, 0, tzinfo=timezone.utc),
                )
            )
            session.commit()

        background_tasks.update_transaction_label(self.transaction_id, True)

        feedback_rows = self._feedback_rows()
        feature_rows = self._feature_rows()

        self.assertEqual(len(feedback_rows), 1)
        self.assertEqual(feedback_rows[0].outcome, "fraudulent")
        self.assertEqual(len(feature_rows), 1)
        self.assertEqual(feature_rows[0].is_fraud, 1)

    def test_update_transaction_label_creates_legitimate_feature_row(self):
        missing_transaction_id = "txn_missing"

        background_tasks.update_transaction_label(missing_transaction_id, False)

        feature_rows = self._feature_rows(missing_transaction_id)

        self.assertEqual(len(feature_rows), 1)
        self.assertEqual(feature_rows[0].transaction_id, missing_transaction_id)
        self.assertEqual(feature_rows[0].is_fraud, 0)


if __name__ == "__main__":
    unittest.main()