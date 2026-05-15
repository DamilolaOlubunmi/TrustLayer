import sys
import tempfile
import types
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from sqlmodel import Session, SQLModel, create_engine

from app.schema import EvaluateRequest, Buyer, Vendor, Session as SessionSchema, Transaction as TxSchema
from app.rules import (
    fake_electronics_listing,
    new_vendor_high_value_txn,
    whatsapp_funnel_attack,
    advance_fee_pattern,
)
from app.models import Transaction


class ValidationAndRulesTests(unittest.TestCase):
    def setUp(self):
        # prepare a temporary sqlite DB for tests that need it
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "test_rules.db"
        self.engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
        SQLModel.metadata.create_all(self.engine)

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_fake_electronics_listing_triggers(self):
        payload = EvaluateRequest(
            transaction=TxSchema(
                id="t_x",
                amount=10,
                currency="NGN",
                email="x@example.com",
                timestamp=datetime.now(timezone.utc),
                payment_method="card",
            ),
            buyer=Buyer(id="b1", account_age_days=1),
            vendor=Vendor(id="v1", account_age_days=3, category="electronics", listing_price=40, avg_category_price=100),
        )

        floor = fake_electronics_listing(payload)
        self.assertEqual(floor, 0.78)

    def test_new_vendor_high_value_txn_triggers(self):
        payload = EvaluateRequest(
            transaction=TxSchema(
                id="t_big",
                amount=200000,
                currency="NGN",
                email="big@example.com",
                timestamp=datetime.now(timezone.utc),
                payment_method="card",
            ),
            buyer=Buyer(id="b1", account_age_days=10),
            vendor=Vendor(id="v2", account_age_days=7, total_completed_transactions=0),
        )

        floor = new_vendor_high_value_txn(payload)
        self.assertEqual(floor, 0.70)

    def test_whatsapp_funnel_attack_triggers(self):
        payload = EvaluateRequest(
            transaction=TxSchema(
                id="t_w",
                amount=50,
                currency="NGN",
                email="w@example.com",
                timestamp=datetime.now(timezone.utc),
                payment_method="card",
            ),
            buyer=Buyer(id="b1", account_age_days=10),
            vendor=Vendor(id="v3", account_age_days=10),
            session=SessionSchema(arrival_source="whatsapp_link", time_on_page_seconds=10),
        )

        floor = whatsapp_funnel_attack(payload)
        self.assertEqual(floor, 0.65)

    def test_advance_fee_pattern_detects_increasing_amounts(self):
        # Insert three transactions for the same buyer/vendor with increasing amounts
        buyer_id = "buyer_x"
        vendor_id = "vendor_y"

        now = datetime.now()
        with Session(self.engine) as session:
            session.add_all([
                Transaction(id="t1", platform_id="platform_test", buyer_id=buyer_id, vendor_id=vendor_id, amount=100, created_at=now - timedelta(days=3)),
                Transaction(id="t2", platform_id="platform_test", buyer_id=buyer_id, vendor_id=vendor_id, amount=200, created_at=now - timedelta(days=2)),
                Transaction(id="t3", platform_id="platform_test", buyer_id=buyer_id, vendor_id=vendor_id, amount=300, created_at=now - timedelta(days=1)),
            ])
            session.commit()

        payload = EvaluateRequest(
            transaction=TxSchema(
                id="t_probe",
                amount=10,
                currency="NGN",
                email="probe@example.com",
                timestamp=datetime.now(timezone.utc),
                payment_method="card",
            ),
            buyer=Buyer(id=buyer_id, account_age_days=10),
            vendor=Vendor(id=vendor_id, account_age_days=10),
        )

        with Session(self.engine) as session:
            floor = advance_fee_pattern(payload, session)

        self.assertEqual(floor, 0.80)


if __name__ == "__main__":
    unittest.main()
