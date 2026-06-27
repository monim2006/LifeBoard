import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User, Tags, Calendar, Flame, Target, FolderKanban,
  Wallet, BookOpen, Bell, Palette, Shield, Database, HardDrive,
} from 'lucide-react';

const CARDS = [
  { section: 'profile', icon: User },
  { section: 'categories', icon: Tags },
  { section: 'planner', icon: Calendar },
  { section: 'habits', icon: Flame },
  { section: 'goals', icon: Target },
  { section: 'projects', icon: FolderKanban },
  { section: 'finance', icon: Wallet },
  { section: 'journal', icon: BookOpen },
  { section: 'notifications', icon: Bell },
  { section: 'appearance', icon: Palette },
  { section: 'security', icon: Shield },
  { section: 'data', icon: Database },
  { section: 'backup', icon: HardDrive },
];

export const WorkspacePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('workspace.title')}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('workspace.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {CARDS.map(({ section, icon: Icon }) => (
          <button
            key={section}
            onClick={() => navigate(`/workspace/${section}`)}
            className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-sm transition hover:bg-[var(--secondary)]"
          >
            <Icon className="h-8 w-8 text-[var(--foreground)]" />
            <span className="text-sm font-medium text-[var(--card-foreground)]">
              {t(`workspace.${section}`)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
