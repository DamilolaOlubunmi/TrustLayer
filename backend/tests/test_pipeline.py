import sys
import unittest
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi import HTTPException

from app.models import Platform, Settings
from app.schema import Buyer, EvaluateRequest, Session as SessionSchema, Transaction as TransactionRequest, Vendor

notification_service_module = sys.modules.get("app.services.notification_service")
if notification_service_module is not None and not hasattr(notification_service_module, "get_active_whitelist_entry"):
    notification_service_module.get_active_whitelist_entry = lambda *args, **kwargs: None

from app.pipeline import evaluate


class RecordingBackgroundTasks:
    def __init__(self) -> None:
        self.tasks: list[tuple[str, tuple, dict]] = []

    def add_task(self, func, *args, **kwargs) -> None:
        task_name = getattr(func, "__name__", None) or getattr(func, "_mock_name", None) or func.__class__.__name__
        self.tasks.append((task_name, args, kwargs))


def build_payload(transaction_id: str = "txn_123") -> EvaluateRequest:
    return EvaluateRequest(
        transaction=TransactionRequest(
            id=transaction_id,
            amount=150000,
            currency="NGN",
            email="buyer@example.com",
            timestamp=datetime(2026, 5, 15, 12, 0, tzinfo=timezone.utc),
            payment_method="card",
        ),
        buyer=Buyer(
            id="buyer_1",
            account_age_days=90,
            total_past_transactions=12,
            avg_transaction_amount=50000,
            past_dispute_count=1,
        ),
        vendor=Vendor(
            id="vendor_1",
            account_age_days=4,
            total_completed_transactions=0,
            category="electronics",
            listing_price=65000,
            avg_category_price=120000,
        ),
        session=SessionSchema(
            arrival_source="web",
            time_on_page_seconds=48,
            device_fingerprint="fp_123",
        ),
    )


def build_platform(platform_id: str = "platform_1") -> Platform:
    return Platform(
        id=platform_id,
        name="TrustLayer Demo",
        email="ops@example.com",
        squad_secret_key="sq_test_key",
        is_active=True,
    )


def build_settings(platform_id: str = "platform_1") -> Settings:
    return Settings(
        platform_id=platform_id,
        buyer_weight=0.4,
        vendor_weight=0.6,
        block_threshold=0.8,
        review_threshold=0.55,
        notify_email=True,
        notify_sms=False,
        notify_phone=False,
        callback_url="https://example.com/callback",
    )


class PipelineEvaluateTests(unittest.IsolatedAsyncioTestCase):
    async def test_whitelist_short_circuits_model_pipeline_and_queues_background_work(self):
        payload = build_payload()
        platform = build_platform()
        settings = build_settings()
        db = MagicMock()
        db.exec.return_value.first.return_value = settings
        request = SimpleNamespace()
        background_tasks = RecordingBackgroundTasks()

        with (
            patch("app.pipeline.get_active_whitelist_entry", return_value=object()) as mock_whitelist,
            patch("app.pipeline.initiate_payment", new=AsyncMock(return_value={"status": 200, "message": "ok"})) as mock_payment,
            patch("app.pipeline.build_buyer_features", return_value={"buyer_feature": 1}) as mock_buyer_features,
            patch("app.pipeline.build_vendor_features", return_value={"vendor_feature": 2}) as mock_vendor_features,
            patch("app.pipeline.update_profiles") as mock_update_profiles,
            patch("app.pipeline.save_features_to_store") as mock_save_features,
            patch("app.pipeline.run_validation_gate") as mock_validation,
            patch("app.pipeline.run_rule_presets") as mock_rules,
            patch("app.pipeline.run_models") as mock_models,
            patch("app.pipeline.aggregate_scores") as mock_aggregate,
            patch("app.pipeline.determine_confidence") as mock_confidence,
            patch("app.pipeline.determine_decision") as mock_decision,
            patch("app.pipeline.explain") as mock_explain,
            patch("app.pipeline.explain_with_llm") as mock_llm_explain,
            patch("app.pipeline.escalate_to_llm", new=AsyncMock()) as mock_escalate,
        ):
            result = await evaluate(payload, db, request, background_tasks, platform)

        self.assertEqual(result.decision, "ALLOW")
        self.assertEqual(result.primary_signal, "whitelist")
        self.assertEqual(result.reasons, ["Matched active temporary whitelist"])
        self.assertEqual(result.squad_response, {"status": 200, "message": "ok"})
        self.assertTrue(result.transaction_id.startswith("txn_123_"))
        self.assertEqual(len(background_tasks.tasks), 2)
        self.assertEqual(background_tasks.tasks[0][0], "update_profiles")
        self.assertEqual(background_tasks.tasks[1][0], "save_features_to_store")

        mock_whitelist.assert_called_once()
        mock_payment.assert_awaited_once()
        mock_buyer_features.assert_called_once()
        mock_vendor_features.assert_called_once()
        mock_validation.assert_not_called()
        mock_rules.assert_not_called()
        mock_models.assert_not_called()
        mock_aggregate.assert_not_called()
        mock_confidence.assert_not_called()
        mock_decision.assert_not_called()
        mock_explain.assert_not_called()
        mock_llm_explain.assert_not_called()
        mock_escalate.assert_not_called()

    async def test_high_confidence_allow_runs_explanation_and_initiates_payment(self):
        payload = build_payload("txn_allow")
        platform = build_platform()
        settings = build_settings()
        db = MagicMock()
        db.exec.return_value.first.return_value = settings
        request = SimpleNamespace()
        background_tasks = RecordingBackgroundTasks()

        with (
            patch("app.pipeline.get_active_whitelist_entry", return_value=None),
            patch("app.pipeline.run_validation_gate", return_value=["vendor_listing_price"]),
            patch("app.pipeline.run_rule_presets", return_value=(None, None)),
            patch("app.pipeline.build_buyer_features", return_value={"buyer_feature": 0.12}) as mock_buyer_features,
            patch("app.pipeline.build_vendor_features", return_value={"vendor_feature": 0.88}) as mock_vendor_features,
            patch("app.pipeline.run_models", return_value=(0.22, 0.91)) as mock_models,
            patch("app.pipeline.aggregate_scores", return_value=(0.7345, "vendor")) as mock_aggregate,
            patch("app.pipeline.determine_confidence", return_value="HIGH") as mock_confidence,
            patch("app.pipeline.determine_decision", return_value="ALLOW") as mock_decision,
            patch("app.pipeline.explain", return_value=[{"signal": "vendor_age"}]) as mock_explain,
            patch("app.pipeline.explain_with_llm", new=AsyncMock(return_value=["Vendor pattern is consistent with the model output"])) as mock_llm_explain,
            patch("app.pipeline.initiate_payment", new=AsyncMock(return_value={"status": 200, "message": "payment_started"})) as mock_payment,
            patch("app.pipeline.escalate_to_llm", new=AsyncMock()) as mock_escalate,
            patch("app.pipeline.save_features_to_store") as mock_save_features,
            patch("app.pipeline.update_profiles") as mock_update_profiles,
            patch("app.pipeline.send_review_notification", new=MagicMock(name="send_review_notification")) as mock_review_notification,
        ):
            result = await evaluate(payload, db, request, background_tasks, platform)

        self.assertEqual(result.decision, "ALLOW")
        self.assertEqual(result.confidence, "HIGH")
        self.assertEqual(result.primary_signal, "vendor")
        self.assertEqual(result.rule_preset_matched, None)
        self.assertEqual(result.recommended_action, "Proceed with payment")
        self.assertEqual(result.squad_response, {"status": 200, "message": "payment_started"})
        self.assertEqual(result.reasons, ["Vendor pattern is consistent with the model output"])
        self.assertEqual(len(background_tasks.tasks), 2)
        self.assertEqual(background_tasks.tasks[0][0], "save_features_to_store")
        self.assertEqual(background_tasks.tasks[1][0], "update_profiles")

        mock_buyer_features.assert_called_once()
        mock_vendor_features.assert_called_once()
        mock_models.assert_called_once()
        mock_aggregate.assert_called_once()
        mock_confidence.assert_called_once()
        mock_decision.assert_called_once()
        mock_explain.assert_called_once()
        mock_llm_explain.assert_awaited_once()
        mock_payment.assert_awaited_once()
        mock_escalate.assert_not_called()
        mock_save_features.assert_not_called()
        mock_update_profiles.assert_not_called()
        mock_review_notification.assert_not_called()

    async def test_review_path_queues_notification_and_marks_fraud(self):
        payload = build_payload("txn_review")
        platform = build_platform()
        settings = build_settings()
        platform.squad_secret_key = None
        db = MagicMock()
        db.exec.return_value.first.return_value = settings
        request = SimpleNamespace()
        background_tasks = RecordingBackgroundTasks()

        with (
            patch("app.pipeline.get_active_whitelist_entry", return_value=None),
            patch("app.pipeline.run_validation_gate", return_value=["session_block"]),
            patch("app.pipeline.run_rule_presets", return_value=(0.6, "whatsapp_funnel_attack")),
            patch("app.pipeline.build_buyer_features", return_value={"buyer_feature": 0.33}),
            patch("app.pipeline.build_vendor_features", return_value={"vendor_feature": 0.44}),
            patch("app.pipeline.run_models", return_value=(0.31, 0.52)),
            patch("app.pipeline.aggregate_scores", return_value=(0.61, "vendor")),
            patch("app.pipeline.determine_confidence", return_value="MEDIUM"),
            patch("app.pipeline.determine_decision", return_value="REVIEW"),
            patch("app.pipeline.explain", return_value=[{"signal": "session_source"}]),
            patch("app.pipeline.explain_with_llm", new=AsyncMock(return_value=["Traffic source is suspicious"])),
            patch("app.pipeline.save_features_to_store") as mock_save_features,
            patch("app.pipeline.update_profiles") as mock_update_profiles,
            patch("app.pipeline.send_review_notification") as mock_review_notification,
            patch("app.pipeline.escalate_to_llm", new=AsyncMock()) as mock_escalate,
            patch("app.pipeline.initiate_payment", new=AsyncMock()) as mock_payment,
        ):
            result = await evaluate(payload, db, request, background_tasks, platform)

        self.assertEqual(result.decision, "REVIEW")
        self.assertEqual(result.recommended_action, "Trigger step-up authentication or queue for manual review")
        self.assertTrue(result.squad_response)
        self.assertEqual(result.squad_response, {"error": "Transaction not approved by LLM, so Squad not called"})
        self.assertEqual(len(background_tasks.tasks), 3)
        self.assertIn(background_tasks.tasks[2][0], {"send_review_notification", "AsyncMock"})
        self.assertEqual(background_tasks.tasks[2][1][0], payload.transaction.id)
        self.assertEqual(result.escalated_to_llm, False)

        mock_review_notification.assert_not_called()
        mock_save_features.assert_not_called()
        mock_update_profiles.assert_not_called()
        mock_escalate.assert_not_called()
        mock_payment.assert_not_called()

    async def test_missing_platform_settings_raises_clear_http_error(self):
        payload = build_payload("txn_missing_settings")
        platform = build_platform()
        db = MagicMock()
        db.exec.return_value.first.return_value = None
        request = SimpleNamespace()
        background_tasks = RecordingBackgroundTasks()

        with patch("app.pipeline.get_active_whitelist_entry", return_value=None):
            with self.assertRaises(HTTPException) as exc_info:
                await evaluate(payload, db, request, background_tasks, platform)

        self.assertEqual(exc_info.exception.status_code, 500)
        self.assertEqual(exc_info.exception.detail, "Platform settings missing")


if __name__ == "__main__":
    unittest.main()
