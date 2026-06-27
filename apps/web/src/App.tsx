import { useEffect, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './shared/hooks/useAuth';
import { AppShell } from './shared/components/layout/AppShell';
import { AuthPage } from './features/auth/components/AuthPage';
import { DashboardPage } from './features/auth/components/DashboardPage';
import { DailyPage } from './features/daily/components/DailyPage';
import { WeekPage } from './features/week/components/WeekPage';
import { ProjectsPage } from './features/projects/components/ProjectsPage';
import { FinancePage } from './features/finance/components/FinancePage';
import { HabitsPage } from './features/habits/components/HabitsPage';
import { GoalsPage } from './features/goals/components/GoalsPage';
import { JournalPage } from './features/journal/JournalPage';
import { AnalyticsPage } from './features/analytics/components/AnalyticsPage';
import { WorkspacePage } from './features/workspace/components/WorkspacePage';
import { WorkspaceProfile } from './features/workspace/components/WorkspaceProfile';
import { WorkspaceCategories } from './features/workspace/components/WorkspaceCategories';
import { WorkspacePlanner } from './features/workspace/components/WorkspacePlanner';
import { WorkspaceHabits } from './features/workspace/components/WorkspaceHabits';
import { WorkspaceGoals } from './features/workspace/components/WorkspaceGoals';
import { WorkspaceProjects } from './features/workspace/components/WorkspaceProjects';
import { WorkspaceFinance } from './features/workspace/components/WorkspaceFinance';
import { WorkspaceJournal } from './features/workspace/components/WorkspaceJournal';
import { WorkspaceNotifications } from './features/workspace/components/WorkspaceNotifications';
import { WorkspaceAppearance } from './features/workspace/components/WorkspaceAppearance';
import { WorkspaceSecurity } from './features/workspace/components/WorkspaceSecurity';
import { WorkspaceDataManagement } from './features/workspace/components/WorkspaceDataManagement';
import { WorkspaceBackup } from './features/workspace/components/WorkspaceBackup';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">{t('app.loading')}</div>
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
        <Route path="/today" element={<DailyPage />} />
        <Route path="/week" element={<WeekPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/planner" element={<Navigate to="/week" replace />} />
        <Route path="/expenses" element={<Navigate to="/finance" replace />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/workspace/profile" element={<WorkspaceProfile />} />
        <Route path="/workspace/categories" element={<WorkspaceCategories />} />
        <Route path="/workspace/planner" element={<WorkspacePlanner />} />
        <Route path="/workspace/habits" element={<WorkspaceHabits />} />
        <Route path="/workspace/goals" element={<WorkspaceGoals />} />
        <Route path="/workspace/projects" element={<WorkspaceProjects />} />
        <Route path="/workspace/finance" element={<WorkspaceFinance />} />
        <Route path="/workspace/journal" element={<WorkspaceJournal />} />
        <Route path="/workspace/notifications" element={<WorkspaceNotifications />} />
        <Route path="/workspace/appearance" element={<WorkspaceAppearance />} />
        <Route path="/workspace/security" element={<WorkspaceSecurity />} />
        <Route path="/workspace/data" element={<WorkspaceDataManagement />} />
        <Route path="/workspace/backup" element={<WorkspaceBackup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
};

const DirSetter = ({ children }: { children: ReactNode }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return children;
};

function App() {
  return (
    <DirSetter>
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
    </DirSetter>
  );
}

export default App;
