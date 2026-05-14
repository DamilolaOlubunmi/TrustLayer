from __future__ import annotations

from datetime import datetime, timezone
from html import escape

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlmodel import Session

from app.api.auth import get_api_key_platform
from app.database import get_session
from app.models import Platform, ReviewDecision
from app.schema import ReviewActionResponse
from app.services.notification_service import (
    apply_review_action,
    get_review_decision_by_token,
)

browser_router = APIRouter(tags=["review"])
api_router = APIRouter(prefix="/api", tags=["review-api"])


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _render_review_page(review: ReviewDecision) -> str:
    transaction = review.transaction
    reasons = transaction.reasons or [] if transaction else []
    reason_items = "".join(
        f"<li style='margin-bottom:8px;'>{escape(reason)}</li>" for reason in reasons
    ) or "<li>No reasons recorded.</li>"

    review_status = review.decision if review.reviewed_at else "PENDING"
    decision_deadline = review.expires_at.isoformat()
    score = transaction.final_score if transaction and transaction.final_score is not None else 0.0
    transaction_id = transaction.id if transaction else review.transaction_id

    return f"""
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>TrustLayer Review</title>
      </head>
      <body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f5f7fb;color:#132033;">
        <div style="max-width:760px;margin:0 auto;padding:32px 20px;">
          <div style="background:#fff;border:1px solid #e5ebf2;border-radius:16px;padding:28px;box-shadow:0 8px 28px rgba(19,32,51,.08);">
            <h1 style="margin:0 0 10px;font-size:26px;">Review transaction</h1>
            <p style="margin:0 0 20px;color:#526070;">Review status: <strong>{escape(review_status)}</strong></p>

            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <tr><td style="padding:8px 0;color:#617084;font-weight:700;width:180px;">Transaction ID</td><td style="padding:8px 0;">{escape(transaction_id)}</td></tr>
              <tr><td style="padding:8px 0;color:#617084;font-weight:700;">Risk score</td><td style="padding:8px 0;">{score:.4f}</td></tr>
              <tr><td style="padding:8px 0;color:#617084;font-weight:700;">Expires at</td><td style="padding:8px 0;">{escape(decision_deadline)}</td></tr>
            </table>

            <div style="margin-bottom:20px;">
              <h2 style="font-size:18px;margin:0 0 10px;">Reasons</h2>
              <ul style="margin:0;padding-left:20px;line-height:1.6;">{reason_items}</ul>
            </div>

            <div style="display:flex;gap:12px;flex-wrap:wrap;">
                            <form action="/review/{escape(review.review_token)}/allow" method="post" style="margin:0;">
                <button type="submit" style="border:0;border-radius:10px;padding:12px 18px;background:#0f9d58;color:#fff;font-weight:700;cursor:pointer;">ALLOW</button>
              </form>
                            <form action="/review/{escape(review.review_token)}/block" method="post" style="margin:0;">
                <button type="submit" style="border:0;border-radius:10px;padding:12px 18px;background:#d93025;color:#fff;font-weight:700;cursor:pointer;">BLOCK</button>
              </form>
            </div>
          </div>
        </div>
      </body>
    </html>
    """


def _render_action_page(review: ReviewDecision, decision: str, whitelist_created: bool) -> str:
    transaction = review.transaction
    transaction_id = transaction.id if transaction else review.transaction_id
    message = "Temporary whitelist created." if whitelist_created else "No whitelist was created."

    return f"""
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>TrustLayer Review Complete</title>
      </head>
      <body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f5f7fb;color:#132033;">
        <div style="max-width:760px;margin:0 auto;padding:32px 20px;">
          <div style="background:#fff;border:1px solid #e5ebf2;border-radius:16px;padding:28px;box-shadow:0 8px 28px rgba(19,32,51,.08);">
            <h1 style="margin:0 0 10px;font-size:26px;">Review recorded</h1>
            <p style="margin:0 0 20px;color:#526070;">Decision: <strong>{escape(decision)}</strong></p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <tr><td style="padding:8px 0;color:#617084;font-weight:700;width:180px;">Transaction ID</td><td style="padding:8px 0;">{escape(transaction_id)}</td></tr>
              <tr><td style="padding:8px 0;color:#617084;font-weight:700;">Reviewed at</td><td style="padding:8px 0;">{escape((review.reviewed_at or _utcnow()).isoformat())}</td></tr>
            </table>
            <p style="margin:0;color:#526070;">{escape(message)}</p>
          </div>
        </div>
      </body>
    </html>
    """


def _action_error_to_http_exception(exc: ValueError) -> HTTPException:
    message = str(exc)
    if "expired" in message.lower():
        return HTTPException(status_code=status.HTTP_410_GONE, detail=message)
    if "already" in message.lower():
        return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=message)
    if "not found" in message.lower():
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=message)
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)


def _ensure_platform_matches_review(review: ReviewDecision, platform: Platform) -> None:
    if review.platform_id != platform.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Review token does not belong to this platform")


def _handle_review_action(token: str, session: Session, action: str, platform: Platform | None = None) -> tuple[ReviewDecision, bool]:
    review = get_review_decision_by_token(session, token)
    if not review:
        raise ValueError("Review token not found")

    if platform is not None:
        _ensure_platform_matches_review(review, platform)

    review, whitelist_entry = apply_review_action(session, review_token=token, action=action)

    return review, whitelist_entry is not None


@browser_router.get("/review/{token}", response_class=HTMLResponse)
def review_page(token: str, session: Session = Depends(get_session)):
    review = get_review_decision_by_token(session, token)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review token not found")

    now = _utcnow()
    if review.expires_at <= now:
        return HTMLResponse(
            "<h1>Review token expired</h1><p>Please submit manual feedback instead.</p>",
            status_code=status.HTTP_410_GONE,
        )

    if not review.transaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    return HTMLResponse(_render_review_page(review))


@browser_router.post("/review/{token}/allow")
def allow_review(token: str, session: Session = Depends(get_session)):
    try:
        review, whitelist_created = _handle_review_action(token, session, action="ALLOW")
    except ValueError as exc:
        raise _action_error_to_http_exception(exc)

    return RedirectResponse(
        url=f"/review/{token}/complete?decision=ALLOW&whitelist_created={str(whitelist_created).lower()}",
        status_code=status.HTTP_303_SEE_OTHER,
    )


@browser_router.get("/review/{token}/complete", response_class=HTMLResponse)
def review_complete(
    token: str,
    decision: str,
    whitelist_created: bool = False,
    session: Session = Depends(get_session),
):
    review = get_review_decision_by_token(session, token)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review token not found")

    return HTMLResponse(_render_action_page(review, decision, whitelist_created))


def _build_review_response(review: ReviewDecision, whitelist_created: bool) -> ReviewActionResponse:
    return ReviewActionResponse(
        status="success",
        transaction_id=review.transaction_id,
        decision=review.decision,
        reviewed_at=review.reviewed_at or _utcnow(),
        whitelist_created=whitelist_created,
    )


@browser_router.post("/review/{token}/block")
def block_review(token: str, session: Session = Depends(get_session)):
    try:
        review, _ = _handle_review_action(token, session, action="BLOCK")
    except ValueError as exc:
        raise _action_error_to_http_exception(exc)

    return RedirectResponse(
        url=f"/review/{token}/complete?decision=BLOCK&whitelist_created=false",
        status_code=status.HTTP_303_SEE_OTHER,
    )


@api_router.post("/review/{token}/allow", response_model=ReviewActionResponse)
def allow_review_api(
    token: str,
    session: Session = Depends(get_session),
    platform: Platform = Depends(get_api_key_platform),
):
    try:
        review, whitelist_created = _handle_review_action(token, session, action="ALLOW", platform=platform)
    except ValueError as exc:
        raise _action_error_to_http_exception(exc)

    return _build_review_response(review, whitelist_created)


@api_router.post("/review/{token}/block", response_model=ReviewActionResponse)
def block_review_api(
    token: str,
    session: Session = Depends(get_session),
    platform: Platform = Depends(get_api_key_platform),
):
    try:
        review, whitelist_created = _handle_review_action(token, session, action="BLOCK", platform=platform)
    except ValueError as exc:
        raise _action_error_to_http_exception(exc)

    return _build_review_response(review, whitelist_created)
