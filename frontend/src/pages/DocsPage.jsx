import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/common/Button";

function SectionPill({ children, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${tones[tone]}`}>
      {children}
    </span>
  );
}

function CodeBlock({ children }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-gray-200 bg-slate-950 px-4 py-4 text-xs leading-6 text-slate-100 shadow-sm">
      <code>{children}</code>
    </pre>
  );
}

function DocCard({ id, title, eyebrow, children }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
        {eyebrow && <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-600">{eyebrow}</div>}
        <h2 className="text-lg font-semibold text-[#022448]">{title}</h2>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}

export default function DocsPage() {
  const navigate = useNavigate();

  const navItems = useMemo(
    () => [
      { id: "authentication", label: "Authentication" },
      { id: "evaluation", label: "Evaluation" },
      { id: "integration", label: "Dashboard Integration" },
      { id: "best-practices", label: "Best Practices" },
    ],
    [],
  );

  const exampleRequest = {
    transaction: {
      id: "txn_1700000000_demo",
      amount: 12500,
      currency: "NGN",
      timestamp: "2026-05-15T14:47:54.416Z",
      payment_method: "card",
    },
    buyer: {
      id: "usr_buyer_001",
      account_age_days: 187,
      total_past_txns: 12,
      avg_amount: 48500,
      dispute_count: 0,
    },
    vendor: {
      id: "vnd_vendor_001",
      account_age_days: 548,
      completed_txns: 89,
      category: "fashion",
      listing_price: 12500,
      avg_category_price: 14000,
    },
    session: {
      arrival_source: "organic",
      time_on_page_seconds: 62,
    },
  };

  const exampleResponse = {
    transaction_id: "txn_1700000000_demo",
    decision: "ALLOW",
    score: 0.2186,
    confidence: "HIGH",
    buyer_risk_score: 0.2856,
    vendor_risk_score: 0.174,
    primary_signal: "buyer",
    reasons: [
      "Buyer account history is consistent with normal behavior.",
      "Vendor pricing aligns with category averages.",
      "No high-risk session indicators were detected.",
    ],
    recommended_action: "Proceed with payment",
    missing_signals: [],
    squad_response: { status: 200, message: "payment_started" },
  };

  const errorResponse = {
    detail: "Invalid or missing API key",
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-8 lg:h-fit">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-500">Sections</div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-4 border-t border-gray-100 pt-4">
              <Button variant="secondary" className="w-full justify-center" onClick={() => navigate("/profile")}>
                Open Profile
              </Button>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-3 flex flex-wrap gap-2">
              <SectionPill tone="blue">API Documentation</SectionPill>
              <SectionPill tone="gray">Bearer Auth</SectionPill>
              <SectionPill tone="amber">Read Only</SectionPill>
            </div>
            <h1 className="text-2xl font-bold text-[#022448] sm:text-3xl">API Documentation</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              Integrate TrustLayer fraud detection into your platform with a consistent, authenticated REST API.
            </p>
            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              Authentication uses an API key in the <span className="font-mono font-semibold">Authorization</span> header with the Bearer scheme.
            </div>
          </div>

          <DocCard id="authentication" eyebrow="Section 1" title="Authentication">
            <div className="space-y-4 text-sm leading-6 text-gray-600">
              <p>
                Every authenticated request must include your platform API key. Keep the key secret and treat it like a password.
              </p>
              <CodeBlock>{`Authorization: Bearer <API_KEY>`}</CodeBlock>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                <strong>Important:</strong> API keys should never be embedded in client-side code or shared publicly.
              </div>
              <p>
                You can regenerate your key from the Profile page in the dashboard. Open <button className="font-semibold text-blue-600 hover:underline" onClick={() => navigate("/profile")}>Profile</button> to manage credentials.
              </p>
            </div>
          </DocCard>

          <DocCard id="evaluation" eyebrow="Section 2" title="Main Endpoint - Evaluation">
            <div className="space-y-6 text-sm leading-6 text-gray-600">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-[#022448]">
                POST /v1/evaluate
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-[#022448]">Description</h3>
                <p>
                  Runs the TrustLayer fraud evaluation pipeline and returns a score, decision, explanation reasons, and downstream payment status when applicable.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-[#022448]">Required Headers</h3>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <SectionPill tone="emerald">Required</SectionPill>
                    <span className="font-mono text-sm text-gray-700">Authorization: Bearer &lt;API_KEY&gt;</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-[#022448]">Request Body Schema</h3>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="mb-3 flex items-center gap-2"><SectionPill tone="emerald">Required Fields</SectionPill></div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {[
                        "transaction.id",
                        "transaction.amount",
                        "transaction.currency",
                        "transaction.timestamp",
                        "transaction.payment_method",
                        "buyer.id",
                        "vendor.id",
                      ].map((item) => <li key={item} className="font-mono">{item}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="mb-3 flex items-center gap-2"><SectionPill tone="amber">Optional Fields</SectionPill></div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {[
                        "buyer.account_age_days",
                        "buyer.total_past_txns",
                        "buyer.avg_amount",
                        "buyer.dispute_count",
                        "vendor.account_age_days",
                        "vendor.completed_txns",
                        "vendor.category",
                        "vendor.listing_price",
                        "arrival_source",
                        "time_on_page_seconds",
                      ].map((item) => <li key={item} className="font-mono">{item}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-[#022448]">Example Request</h3>
                <CodeBlock>{JSON.stringify(exampleRequest, null, 2)}</CodeBlock>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-[#022448]">Response Format</h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {[
                    "transaction_id",
                    "decision (ALLOW | REVIEW | BLOCK)",
                    "score",
                    "confidence",
                    "buyer_risk_score",
                    "vendor_risk_score",
                    "primary_signal",
                    "reasons (array of strings)",
                    "recommended_action",
                    "missing_signals",
                    "squad_response (if applicable)",
                  ].map((item) => (
                    <li key={item} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-[#022448]">Example Response</h3>
                <CodeBlock>{JSON.stringify(exampleResponse, null, 2)}</CodeBlock>
              </div>
            </div>
          </DocCard>

          

          <DocCard id="integration" eyebrow="Section 3" title="Dashboard Integration (Profile & Settings)">
            <div className="space-y-4 text-sm leading-6 text-gray-600">
              <h3 className="mb-2 font-semibold text-[#022448]">Squad Secret (Profile)</h3>
              <p>
                In your TrustLayer dashboard open <button className="font-semibold text-blue-600 hover:underline" onClick={() => navigate("/profile")}>Profile</button> and enter your Squad secret key in the <strong>Squad Secret</strong> field.
                This secret is used server-side by TrustLayer to initiate payments on your behalf. The secret is stored encrypted and masked in the UI; only add it from a secure environment.
              </p>

              <h3 className="mb-2 font-semibold text-[#022448]">Callback URL (Settings)</h3>
              <p>
                Configure the callback URL where TrustLayer will POST asynchronous events (payment status, webhook events) from the Settings page of your dashboard. Use an HTTPS endpoint under your control, for example:
              </p>
              <CodeBlock>{`https://your.platform.example.com/api/integrations/trustlayer/squad/callback`}</CodeBlock>
              <p>
                Ensure the callback endpoint validates requests and uses TLS. TrustLayer will sign webhook payloads; keep your endpoint secret and reject unsigned requests.
              </p>

              <h3 className="mb-2 font-semibold text-[#022448]">API Key Retrieval</h3>
              <p>
                Your platform API key for calling <span className="font-mono">/v1/evaluate</span> is available from the Profile page. Use the dashboard to copy or regenerate the key when necessary. Always send it in the <span className="font-mono">Authorization</span> header as <span className="font-mono">Bearer &lt;API_KEY&gt;</span>.
              </p>
            </div>
          </DocCard>

          

          <DocCard id="best-practices" eyebrow="Section 4" title="Best Practices">
            <div className="space-y-4 text-sm leading-6 text-gray-600">
              <ul className="space-y-2">
                <li>Always send the full transaction payload so the scoring engine has the best context.</li>
                <li>Avoid duplicate requests unless you intentionally retry with a unique transaction ID.</li>
                <li>Design retries to be idempotent on your side whenever possible.</li>
              </ul>
            </div>
          </DocCard>
        </div>
      </div>
    </div>
  );
}