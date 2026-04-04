import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ApplicationsPage from './pages/ApplicationsPage';
import TransactionsPage from './pages/TransactionsPage';
import SettingsPage from './pages/SettingsPage';
import WithdrawPage from './pages/WithdrawPage';
import OAuthConsentPage from './pages/OAuthConsentPage';
import { DashboardLayout } from './components/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* OAuth Consent Route (standalone, gère son propre auth check) */}
        <Route path="/oauth/authorize" element={<OAuthConsentPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/withdraw" element={<WithdrawPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/income" element={<div className="p-8">Income Page (Coming Soon)</div>} />
            <Route path="/expenses" element={<div className="p-8">Expenses Page (Coming Soon)</div>} />
            <Route path="/analytics" element={<div className="p-8">Analytics Page (Coming Soon)</div>} />
            <Route path="/settings" element={<div className="p-8">Settings Page (Coming Soon)</div>} />
          </Route>
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
