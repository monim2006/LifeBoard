import { Link, NavLink } from 'react-router-dom';
import { type ReactNode } from 'react';
import { Button } from '../ui/Button';

interface AppShellProps {
  children: ReactNode;
  onLogout?: () => void;
}

const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Planner', path: '/planner' },
  { label: 'Expenses', path: '/expenses' },
  { label: 'Analytics', path: '/analytics' },
];

export const AppShell = ({ children, onLogout }: AppShellProps) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link to="/" className="text-xl font-semibold tracking-tight text-slate-900">
            LifeBoard
          </Link>
          <div className="flex items-center gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          {onLogout ? (
            <Button variant="secondary" onClick={onLogout}>
              Logout
            </Button>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
};
