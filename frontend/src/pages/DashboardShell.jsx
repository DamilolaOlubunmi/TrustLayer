import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import Sidebar from "../components/Dashboard/Sidebar";
import TopBar from "../components/Dashboard/TopBar";
import { allowReviewRequest, blockReviewRequest, getTransactionsRequest, submitFeedbackRequest } from "../api";
import { useAuth } from "../context/AuthContext";

import OverviewPage from "./DashboardPage";
import TransactionsPage from "./TransactionsPage";
import FlaggedPage from "./FlaggedPage";
import FeedbackPage from "./FeedbackPage";
import SettingsPage from "./SettingsPage";
import ProfilePage from "./ProfilePage";
import TransactionDetailsPage from "./TransactionDetailsPage";

function buildDisplayUser(user) {
  const name = user?.name || user?.email || "TrustLayer";
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "TL";

  return {
    name,
    email: user?.email || "",
    platform: user?.name || "TrustLayer",
    role: "Administrator",
    initials,
  };
}

export default function DashboardShell() {
  const { user, settings, signOut, refreshSettings } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { id: transactionId } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadError, setLoadError] = useState("");

  const displayUser = useMemo(() => buildDisplayUser(user), [user]);

  useEffect(() => {
    let isMounted = true;

    const loadTransactions = async () => {
      setLoadingTransactions(true);
      setLoadError("");

      try {
        const response = await getTransactionsRequest();
        if (isMounted) {
          setTransactions(response.transactions);
        }
      } catch (requestError) {
        if (requestError?.response?.status === 401) {
          signOut();
          return;
        }

        if (isMounted) {
          setLoadError(requestError?.response?.data?.detail || "Unable to load dashboard data from the backend.");
          setTransactions([]);
        }
      } finally {
        if (isMounted) {
          setLoadingTransactions(false);
        }
      }
    };

    loadTransactions();

    return () => {
      isMounted = false;
    };
  }, [signOut]);

  const handleSelectTransaction = useCallback(
    (tx) => {
      if (tx?.id) {
        navigate(`/transactions/${tx.id}`);
      }
    },
    [navigate],
  );

  const updateTransactionDecision = useCallback((transaction, decision) => {
    setTransactions((prev) =>
      prev.map((item) =>
        item.id === transaction.id
          ? { ...item, decision, review_token: null, review_expires_at: null }
          : item,
      ),
    );
  }, []);

  const handleReviewAction = useCallback(
    async (transaction, action) => {
      if (!transaction?.review_token) {
        throw new Error("Missing review token");
      }

      const response =
        action === "ALLOW"
          ? await allowReviewRequest(transaction.review_token)
          : await blockReviewRequest(transaction.review_token);

      updateTransactionDecision(transaction, response?.decision || action);
      return response;
    },
    [updateTransactionDecision],
  );

  const pageRoutes = useMemo(
    () => ({
      overview: "/dashboard",
      transactions: "/transactions",
      flagged: "/flagged-transactions",
      feedback: "/feedback",
      settings: "/settings",
      profile: "/profile",
    }),
    [],
  );

  const resolveActivePage = useCallback((pathname) => {
    if (pathname.startsWith("/transactions")) return "transactions";
    if (pathname.startsWith("/flagged-transactions")) return "flagged";
    if (pathname.startsWith("/feedback")) return "feedback";
    if (pathname.startsWith("/settings")) return "settings";
    if (pathname.startsWith("/profile")) return "profile";
    if (pathname.startsWith("/dashboard/transactions")) return "transactions";
    if (pathname.startsWith("/dashboard/flagged")) return "flagged";
    if (pathname.startsWith("/dashboard/feedback")) return "feedback";
    if (pathname.startsWith("/dashboard/settings")) return "settings";
    if (pathname.startsWith("/dashboard/profile")) return "profile";
    return "overview";
  }, []);

  const activePage = useMemo(
    () => resolveActivePage(location.pathname),
    [location.pathname, resolveActivePage],
  );

  const handleNavigate = useCallback(
    (pageId) => {
      navigate(pageRoutes[pageId] || "/dashboard");
    },
    [navigate, pageRoutes],
  );

  const renderPage = () => {
    if (transactionId) {
      return (
        <TransactionDetailsPage
          transactionId={transactionId}
          transactions={transactions}
          onReviewAction={handleReviewAction}
        />
      );
    }

    const pageProps = { transactions, onSelectTx: handleSelectTransaction };

    switch (activePage) {
      case "overview":
        return <OverviewPage {...pageProps} />;
      case "transactions":
        return <TransactionsPage {...pageProps} />;
      case "flagged":
        return <FlaggedPage {...pageProps} onReviewAction={handleReviewAction} />;
      case "feedback":
        return (
          <FeedbackPage
            currentUser={displayUser}
            onSubmitFeedback={submitFeedbackRequest}
          />
        );
      case "settings":
        return (
          <SettingsPage
            settings={settings}
            onSaveSettings={refreshSettings}
          />
        );
      case "profile":
        return <ProfilePage />;
      default:
        return <OverviewPage {...pageProps} />;
    }
  };

  const pageNames = {
    overview: "Overview",
    transactions: "Transactions",
    flagged: "Flagged",
    feedback: "Feedback",
    settings: "Settings",
    profile: "Profile",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <Sidebar activePage={activePage} onNavigate={handleNavigate} user={displayUser} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          pageName={pageNames[activePage]}
          platform={displayUser.platform}
          user={displayUser}
          onLogout={signOut}
        />

        <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {loadError && (
            <div className="mx-6 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {loadError}
            </div>
          )}

          {loadingTransactions && !transactions.length ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
              Loading dashboard data...
            </div>
          ) : (
            renderPage()
          )}
        </main>
      </div>

    </div>
  );
}
