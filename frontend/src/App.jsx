import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

// Pages
import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/LoginPage';
import SignupPage     from './pages/SignupPage';
import OverviewPage  from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import FlaggedPage    from './pages/FlaggedPage';
import FeedbackPage   from './pages/FeedbackPage';
import SettingsPage   from './pages/SettingsPage';

// Dashboard shell components (new folder structure)
import Sidebar from './components/Dashboard/Sidebar';
import TopBar  from './components/Dashboard/TopBar';
export default

// ─── Dashboard layout wrapper ─────────────────────────────────────────────────
// Renders the persistent sidebar + topbar and swaps the inner page component
// based on `activePage` state — no react-router needed for the inner pages.
function DashboardLayout({ onLogout }) {
  const [activePage, setActivePage] = useState('overview');

  const PAGES = {
    overview:     OverviewPage,
    transactions: TransactionsPage,
    flagged:      FlaggedPage,
    feedback:     FeedbackPage,
    settings:     SettingsPage,
  };

  const PageComponent = PAGES[activePage] ?? DashboardPage;

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="main-content">
        <TopBar
          merchantName="Fmarket"
          activePage={activePage}
          onLogout={onLogout}
        />
        <PageComponent onNavigate={setActivePage} />
      </div>
    </div>
  );
}

// ─── Auth guard wrapper ───────────────────────────────────────────────────────
// Sits at /dashboard/* and shows Login → (optionally Signup) → Dashboard.
// Replace `isAuthed` logic with a real auth context / token check as needed.
function AuthGuard() {
  const [screen,  setScreen]  = useState('login');   // 'login' | 'signup'
  const [isAuthed, setAuthed] = useState(false);

  if (isAuthed) {
    return (
      <DashboardLayout onLogout={() => setAuthed(false)} />
    );
  }

  if (screen === 'signup') {
    return (
      <SignupPage
        onSignup={() => setAuthed(true)}
        onGoLogin={() => setScreen('login')}
      />
    );
  }

  return (
    <LoginPage
      onLogin={() => setAuthed(true)}
      onGoSignup={() => setScreen('signup')}
    />
  );
}

// ─── Root app ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page */}
        <Route path="/"element={<LandingPage />} />

        {/* Auth + dashboard (login gate lives here) */}
        <Route path="/dashboard/*" element={<AuthGuard />} />

        {/* Convenience: /login and /signup redirect into the auth flow */}
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/signup" element={<Navigate to="/dashboard" replace />} />

        {/* Catch-all: redirect unknown paths to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}