import { useState } from "react";
import Sidebar from "../components/Dashboard/Sidebar";
import TopBar from "../components/Dashboard/Topbar";
import OverviewPage from "./DashboardPage";
import TransactionsPage from "./TransactionsPage";
import FlaggedPage from "./FlaggedPage";
import FeedbackPage from "./FeedbackPage";
import SettingsPage from "./SettingsPage";
import TransactionDetail from "../components/Dashboard/TransactionDetail";
import { MOCK_USER, MOCK_TRANSACTIONS } from "../data/mock";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";

export default

function DashboardShell({ onLogout }) {
  // activePage controls which page content is shown
  const [activePage, setActivePage] = useState("overview");
  // selectedTx holds the transaction the user clicked on (or null = no detail panel)
  const [selectedTx, setSelectedTx] = useState(null);
 
  // The transactions array comes from mock data.
  // In production: const [transactions, setTransactions] = useState([]);
  //                useEffect(() => { fetch('/api/transactions').then(...).then(setTransactions) }, [])
  const transactions = MOCK_TRANSACTIONS;
 
  const renderPage = () => {
    switch (activePage) {
      case "overview":     return <OverviewPage transactions={transactions} onSelectTx={setSelectedTx} />;
      case "transactions": return <TransactionsPage transactions={transactions} onSelectTx={setSelectedTx} />;
      case "flagged":      return <FlaggedPage transactions={transactions} onSelectTx={setSelectedTx} />;
      case "feedback":     return <FeedbackPage />;
      case "settings":     return <SettingsPage />;
      default:             return <OverviewPage transactions={transactions} onSelectTx={setSelectedTx} />;
    }
  };
 
  const pageNames = { overview: "Overview", transactions: "Transactions", flagged: "Flagged", feedback: "Feedback", settings: "Settings" };
 
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Sidebar receives the active page so it can highlight the right item */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} user={MOCK_USER} />
 
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar pageName={pageNames[activePage]} platform={MOCK_USER.platform} />
        <main className="flex-1 overflow-hidden flex flex-col">
          {renderPage()}
        </main>
      </div>
 
      {/* Transaction detail panel — only visible when a transaction is selected */}
      {selectedTx && <TransactionDetail tx={selectedTx} onClose={() => setSelectedTx(null)} />}
    </div>
  );
}