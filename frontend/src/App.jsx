import './dashboard.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Overview from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Flagged from './pages/Flagged';
import Feedback from './pages/Feedback';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { useState } from 'react';

function DashboardLayout() {
  const [activePage, setActivePage] = useState('overview');

  const PAGES = {
    overview: Overview,
    transactions: Transactions,
    flagged: Flagged,
    feedback: Feedback,
    settings: Settings,
  };

  const PageComponent = PAGES[activePage] ?? Overview;

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="main-content">
        <Topbar merchantName="Fmarket" />
        <PageComponent onNavigate={setActivePage} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard/*" element={<DashboardLayout />} />
      </Routes>
    </BrowserRouter>
  );
}