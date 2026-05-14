import os

import resend
from dotenv import load_dotenv

load_dotenv()


resend.api_key = os.getenv("RESEND_API_KEY")


def send_review_email(
    transaction_id: str,
    final_score: float,
    reasons: list[str],
    platform_email: str,
    review_link: str
):

    formatted_reasons = "\n".join(
        f"- {reason}" for reason in reasons
    )

    resend.Emails.send({
        "from": "TrustLayer <alerts@yourdomain.com>",
        "to": platform_email,
        "subject": f"Transaction Review Required - {transaction_id}",
        "html": f"""
        <h2>Transaction Review Required</h2>

        <p>
            A transaction has been flagged for manual review.
        </p>

        <p>
            <strong>Transaction ID:</strong> {transaction_id}
        </p>

        <p>
            <strong>Risk Score:</strong> {final_score}
        </p>

        <h3>Reasons</h3>

        <pre>{formatted_reasons}</pre>

        <p>
            Review transaction:
        </p>

        <a href="{review_link}">
            Review Transaction
        </a>
        """
    })