import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from fastapi import HTTPException
from sqlmodel import Session, SQLModel, create_engine

from app.api.squad_routes import squad_webhook
from app.integrations.squad import validate_squad_signature
from app.models import Platform, Transaction


class SquadWebhookTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "test_squad.db"
        self.engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
        SQLModel.metadata.create_all(self.engine)

        with Session(self.engine) as session:
            session.add(
                Platform(
                    id="platform_1",
                    name="TrustLayer Demo",
                    email="ops@example.com",
                    squad_secret_key="secret_key",
                    is_active=True,
                )
            )
            session.add(
                Transaction(
                    id="txn_1",
                    platform_id="platform_1",
                    amount=100,
                    currency="NGN",
                    payment_method="card",
                    created_at=datetime.now(timezone.utc),
                )
            )
            session.commit()

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_validate_squad_signature_returns_false_for_missing_header(self):
        self.assertFalse(validate_squad_signature(b"{}", None, "secret_key"))
        self.assertFalse(validate_squad_signature(b"{}", "", "secret_key"))

    async def test_squad_webhook_returns_401_when_signature_header_missing(self):
        body = (
            b'{"Event":"charge_successful","TransactionRef":"txn_1","Body":{"amount":200,"currency":"NGN","transaction_type":"card"}}'
        )
        request = SimpleNamespace(
            body=SimpleNamespace(__call__=lambda: None),
            headers={},
        )

        async def _body():
            return body

        request.body = _body

        with Session(self.engine) as session:
            with self.assertRaises(HTTPException) as exc_info:
                await squad_webhook(request, db=session)

        self.assertEqual(exc_info.exception.status_code, 401)
        self.assertEqual(exc_info.exception.detail, "Missing signature")


if __name__ == "__main__":
    unittest.main()