from __future__ import annotations

import html
import os

import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "TrustLayer <trustlayer@resend.dev>")


def _render_reasons_html(reasons: list[str]) -> str:
  """Render a list of reasons as escaped HTML list items.

  This helper ensures safe HTML rendering for inclusion in email bodies.
  """

  if not reasons:
    return "<li>No reasons were supplied.</li>"

  return "".join(
    f'<li style="margin-bottom: 8px;">{html.escape(reason)}</li>'
    for reason in reasons
  )


def send_review_email(
    transaction_id: str,
    final_score: float,
    reasons: list[str],
    platform_email: str,
    review_link: str,
) -> None:
    """Send the REVIEW email with secure review actions embedded as forms."""

    base_review_link = review_link.rstrip("/")
    allow_link = f"{base_review_link}/allow"
    block_link = f"{base_review_link}/block"

    html_body = f"""
    <!doctype html>
    <html>
      <body style="margin:0;padding:0;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;color:#102033;">
        <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
          <div style="background:#ffffff;border:1px solid #e6ebf2;border-radius:16px;padding:28px;box-shadow:0 8px 28px rgba(16,32,51,.08);">
            <div style="font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#5a6b7f;font-weight:700;">TrustLayer</div>
            <h1 style="margin:12px 0 8px;font-size:24px;line-height:1.25;">Transaction review required</h1>
            <p style="margin:0 0 20px;color:#516074;">A transaction has been flagged for manual review. The decision link expires after 12 hours.</p>

            <table style="width:100%;border-collapse:collapse;margin:0 0 20px;">
              <tr>
                <td style="padding:10px 0;color:#5a6b7f;font-weight:700;width:160px;">Transaction ID</td>
                <td style="padding:10px 0;">{html.escape(transaction_id)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#5a6b7f;font-weight:700;">Risk score</td>
                <td style="padding:10px 0;">{final_score:.4f}</td>
              </tr>
            </table>

            <div style="margin:0 0 18px;">
              <div style="font-size:16px;font-weight:700;margin:0 0 10px;">Reasons</div>
              <ul style="margin:0;padding-left:20px;color:#25364a;line-height:1.55;">
                {_render_reasons_html(reasons)}
              </ul>
            </div>

            <div style="margin:24px 0 12px;">
              <a href="{html.escape(base_review_link)}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#102033;color:#ffffff;text-decoration:none;font-weight:700;">Open review page</a>
            </div>

            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:18px;">
              <form action="{html.escape(allow_link)}" method="post" style="margin:0;">
                <button type="submit" style="border:0;border-radius:10px;background:#0f9d58;margin:10px;color:#ffffff;padding:12px 18px;font-weight:700;cursor:pointer;">ALLOW</button>
              </form>
              <form action="{html.escape(block_link)}" method="post" style="margin:0;">
                <button type="submit" style="border:0;border-radius:10px;background:#d93025;margin:10px;color:#ffffff;padding:12px 18px;font-weight:700;cursor:pointer;">BLOCK</button>
              </form>
            </div>

            <p style="margin:20px 0 0;color:#5a6b7f;font-size:13px;line-height:1.5;">
              If your email client blocks forms, open the review page above and use the ALLOW or BLOCK controls there.
            </p>
          </div>
        </div>
      </body>
    </html>
    """

    resend.Emails.send(
        {
            "from": FROM_EMAIL,
            "to": platform_email,
            "subject": f"Transaction Review Required - {transaction_id}",
            "html": html_body,
        }
    )
