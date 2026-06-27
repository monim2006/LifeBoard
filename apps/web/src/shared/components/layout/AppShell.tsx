import { Link, NavLink, useLocation } from 'react-router-dom';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Moon, Sun, Globe, Home, CalendarDays, Calendar, BookOpen,
  Wallet, BarChart3, LayoutDashboard, Menu, X, LogOut, Bell,
  User, Sparkles, ChevronRight, ChevronLeft
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useThemeStore } from '../../store/themeStore';
import { FloatingAI } from '../../../features/ai/components/FloatingAI';

interface AppShellProps {
  children: ReactNode;
  onLogout?: () => void;
}

const languages = [
  { code: 'en', label: 'language.en' },
  { code: 'fr', label: 'language.fr' },
  { code: 'ar', label: 'language.ar' },
];

const mainNavItems = [
  { label: 'nav.home', path: '/', icon: Home },
  { label: 'nav.today', path: '/today', icon: CalendarDays },
  { label: 'nav.week', path: '/week', icon: Calendar },
  { label: 'nav.journal', path: '/journal', icon: BookOpen },
  { label: 'nav.finance', path: '/finance', icon: Wallet },
  { label: 'nav.analytics', path: '/analytics', icon: BarChart3 },
  { label: 'nav.workspace', path: '/workspace', icon: LayoutDashboard },
];

export const AppShell = ({ children, onLogout }: AppShellProps) => {
  const { t, i18n } = useTranslation();
  const { theme, toggle } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const switchLanguage = (code: string) => {
    i18n.changeLanguage(code);
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl">
        <div className="mx-auto flex items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-xl p-2 hover:bg-[var(--secondary)] lg:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden rounded-xl p-1.5 hover:bg-[var(--secondary)] lg:block"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <Link to="/" className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
              {t('app.title')}
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <NavLink
              to="/workspace/notifications"
              className="relative rounded-xl p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
            >
              <Bell className="h-4 w-4" />
            </NavLink>
            <div className="relative">
              <Button variant="ghost" className="peer p-2" aria-haspopup="true" aria-label={t('language')}>
                <Globe className="h-4 w-4" />
              </Button>
              <div className="absolute right-0 top-full z-30 mt-1 hidden w-36 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1 shadow-lg peer-hover:block hover:block focus-within:block">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => switchLanguage(lang.code)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[var(--secondary)] ${
                      i18n.language === lang.code
                        ? 'font-semibold text-[var(--foreground)]'
                        : 'text-[var(--muted-foreground)]'
                    }`}
                  >
                    {t(lang.label)}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="ghost" onClick={toggle} className="p-2">
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <NavLink to="/workspace/profile" className="rounded-xl p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]">
              <User className="h-4 w-4" />
            </NavLink>
            {onLogout ? (
              <Button variant="secondary" onClick={onLogout} className="hidden sm:inline-flex">
                <LogOut className="mr-1.5 h-4 w-4" />
                {t('auth.logout')}
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden border-r border-[var(--border)] bg-[var(--card)]/50 transition-all duration-300 lg:flex lg:flex-col ${
            sidebarCollapsed ? 'w-16' : 'w-56'
          }`}
        >
          <nav className="flex flex-col gap-1 p-3 pt-4">
            {mainNavItems.map((item) => {
              const isActive = item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--foreground)] text-[var(--background)]'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]'
                  }`}
                  title={sidebarCollapsed ? t(item.label) : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span>{t(item.label)}</span>}
                </NavLink>
              );
            })}
          </nav>
          {sidebarCollapsed && onLogout && (
            <div className="mt-auto border-t border-[var(--border)] p-3">
              <button onClick={onLogout} className="flex w-full items-center justify-center rounded-xl p-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]" title={t('auth.logout')}>
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </aside>

        {/* Mobile Sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-20 lg:hidden">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <nav className="relative h-full w-64 overflow-y-auto border-r border-[var(--border)] bg-[var(--background)] p-4 pt-6">
              <div className="mb-4 flex items-center gap-3 border-b border-[var(--border)] pb-4">
                <Link to="/" className="text-lg font-semibold" onClick={() => setMobileOpen(false)}>
                  {t('app.title')}
                </Link>
              </div>
              <div className="space-y-1">
                {mainNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? 'bg-[var(--foreground)] text-[var(--background)]'
                          : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {t(item.label)}
                  </NavLink>
                ))}
              </div>
              <div className="mt-6 border-t border-[var(--border)] pt-4 space-y-1">
                {onLogout ? (
                  <Button variant="secondary" onClick={onLogout} className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('auth.logout')}
                  </Button>
                ) : null}
              </div>
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="min-h-[calc(100vh-3.5rem)] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <FloatingAI />
    </div>
  );
};
