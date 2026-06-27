import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Settings, LayoutDashboard, Search } from 'lucide-react';
import { getDay, updateDay } from '../daily/api/dailyApi';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';

export const JournalPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: day, isLoading } = useQuery({
    queryKey: ['daily', currentDate],
    queryFn: () => getDay(currentDate),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateDay(currentDate, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily', currentDate] }),
  });

  const navigateDay = (offset: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const dateDisplay = new Date(currentDate + 'T12:00:00');

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('journal.title')}</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('journal.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/workspace/journal">
            <Button variant="secondary">
              <Settings className="mr-2 h-4 w-4" /> {t('journal.manage')}
            </Button>
          </Link>
          <Link to="/workspace/categories">
            <Button variant="ghost">
              <LayoutDashboard className="mr-2 h-4 w-4" /> {t('journal.manageCategories')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button onClick={() => navigateDay(-1)} className="rounded-full p-2 hover:bg-[var(--secondary)]">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-lg font-medium text-[var(--foreground)]">
          {dateDisplay.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
        <button onClick={() => navigateDay(1)} className="rounded-full p-2 hover:bg-[var(--secondary)]">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('journal.search')}
          className="w-full rounded-2xl border border-[var(--border)] bg-transparent py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)]" />
        </div>
      ) : (
        <div className="space-y-6">
          <Card title={t('journal.write')}>
            <textarea
              value={day?.journalEntry ?? ''}
              onChange={(e) => updateMutation.mutate({ journalEntry: e.target.value })}
              placeholder="What happened today? How are you feeling? What did you learn?"
              className="min-h-[300px] w-full resize-none rounded-2xl border border-[var(--border)] bg-transparent p-6 text-base leading-relaxed text-[var(--foreground)] outline-none transition focus:border-[var(--ring)] placeholder:text-[var(--muted-foreground)]"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>{(day?.journalEntry?.length ?? 0) > 0 ? `${day?.journalEntry?.length} characters` : ''}</span>
              <span>{day?.mood ? `Mood: ${day.mood}/10` : ''}</span>
            </div>
          </Card>

          <Card title="Notes">
            <textarea
              value={day?.notes ?? ''}
              onChange={(e) => updateMutation.mutate({ notes: e.target.value })}
              placeholder="Quick notes, ideas, or reminders..."
              className="min-h-[150px] w-full resize-none rounded-2xl border border-[var(--border)] bg-transparent p-4 text-sm leading-relaxed text-[var(--foreground)] outline-none transition focus:border-[var(--ring)] placeholder:text-[var(--muted-foreground)]"
            />
          </Card>
        </div>
      )}
    </div>
  );
};
