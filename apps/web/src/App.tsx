import { type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './shared/hooks/useAuth';
import { AppShell } from './shared/components/layout/AppShell';
import { AuthPage } from './features/auth/components/AuthPage';
import { DashboardPage } from './features/auth/components/DashboardPage';
import { PlannerPage } from './features/planner/components/PlannerPage';
import { ExpensesPage } from './features/expenses/components/ExpensesPage';
import { AnalyticsPage } from './features/analytics/components/AnalyticsPage';
import './App.css';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">Loading your workspace…</div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

const ProtectedArea = () => {
  const { logout } = useAuth();

  return (
    <AppShell onLogout={logout}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <ProtectedArea />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
