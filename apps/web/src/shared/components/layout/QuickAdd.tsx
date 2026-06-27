import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus, X, ListTodo, TrendingDown, TrendingUp, Flame, Utensils,
  Dumbbell, PenLine, Clock, BookOpen, FolderKanban, Target,
  Search, Command, type LucideIcon
} from 'lucide-react';

interface QuickAddAction {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  path?: string;
  action?: () => void;
}

export const QuickAdd = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [search, setSearch] = useState('');
  const paletteRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
        setOpen(false);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (paletteOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [paletteOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setPaletteOpen(false);
      }
    };
    if (paletteOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [paletteOpen]);

  const actions: QuickAddAction[] = [
    { id: 'task', label: 'Add Task', icon: ListTodo, color: 'text-blue-500', path: '/today' },
    { id: 'expense', label: 'Add Expense', icon: TrendingDown, color: 'text-red-500', path: '/finance' },
    { id: 'income', label: 'Add Income', icon: TrendingUp, color: 'text-green-500', path: '/finance' },
    { id: 'habit', label: 'Log Habit', icon: Flame, color: 'text-orange-500', path: '/habits' },
    { id: 'meal', label: 'Log Meal', icon: Utensils, color: 'text-amber-500', path: '/today' },
    { id: 'workout', label: 'Log Workout', icon: Dumbbell, color: 'text-green-500', path: '/today' },
    { id: 'event', label: 'Add Timeline Event', icon: Clock, color: 'text-purple-500', path: '/today' },
    { id: 'journal', label: 'Write Journal', icon: BookOpen, color: 'text-indigo-500', path: '/today' },
    { id: 'note', label: 'Add Note', icon: PenLine, color: 'text-gray-500', path: '/today' },
    { id: 'project', label: 'New Project', icon: FolderKanban, color: 'text-cyan-500', path: '/projects' },
    { id: 'goal', label: 'New Goal', icon: Target, color: 'text-rose-500', path: '/goals' },
  ];

  const filtered = search
    ? actions.filter((a) => a.label.toLowerCase().includes(search.toLowerCase()))
    : actions;

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--foreground)] text-[var(--background)] shadow-lg transition hover:scale-105 active:scale-95"
        aria-label="Quick add"
      >
        {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>

      {/* Quick Add Menu */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 space-y-2">
          {actions.slice(0, 5).map((action) => (
            <button
              key={action.id}
              onClick={() => {
                setOpen(false);
                if (action.path) navigate(action.path);
              }}
              className="flex w-full items-center gap-3 rounded-2xl bg-[var(--card)] px-4 py-3 shadow-lg backdrop-blur-xl transition hover:scale-105"
              style={{ border: '1px solid var(--border)' }}
            >
              <action.icon className={`h-4 w-4 ${action.color}`} />
              <span className="text-sm font-medium text-[var(--foreground)]">{action.label}</span>
            </button>
          ))}
          <button
            onClick={() => { setOpen(false); setPaletteOpen(true); }}
            className="flex w-full items-center gap-2 rounded-2xl bg-[var(--secondary)] px-4 py-2 text-xs text-[var(--muted-foreground)]"
          >
            <Command className="h-3 w-3" />
            <span>Open command palette</span>
          </button>
        </div>
      )}

      {/* Command Palette Overlay */}
      {paletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            ref={paletteRef}
            className="relative w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
              <Search className="h-5 w-5 text-[var(--muted-foreground)]" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search actions…"
                className="flex-1 bg-transparent text-base text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
              />
              <kbd className="rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                ESC
              </kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    setPaletteOpen(false);
                    if (action.path) navigate(action.path);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-[var(--secondary)]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--secondary)]">
                    <action.icon className={`h-4 w-4 ${action.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{action.label}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Go to {action.path || 'page'}
                    </p>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">No results found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
