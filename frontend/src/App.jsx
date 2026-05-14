import './index.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

import DashboardShell from './pages/DashboardShell';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function AuthRoute({ mode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eef0f6] text-gray-500 text-sm">
        Restoring your session...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return mode === 'signup' ? <SignupPage /> : <LoginPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthRoute mode="login" />} />
      <Route path="/signup" element={<AuthRoute mode="signup" />} />
      <Route
        path="/dashboard/*"
        element={(
          <ProtectedRoute>
            <DashboardShell />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/transactions"
        element={(
          <ProtectedRoute>
            <DashboardShell />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/transactions/:id"
        element={(
          <ProtectedRoute>
            <DashboardShell />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/flagged-transactions"
        element={(
          <ProtectedRoute>
            <DashboardShell />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/feedback"
        element={(
          <ProtectedRoute>
            <DashboardShell />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/settings"
        element={(
          <ProtectedRoute>
            <DashboardShell />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/profile"
        element={(
          <ProtectedRoute>
            <DashboardShell />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
