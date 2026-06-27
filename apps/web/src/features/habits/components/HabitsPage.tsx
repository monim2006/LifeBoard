import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, Flame, Check, Settings, LayoutDashboard } from 'lucide-react';
import { getHabits, createHabit, logHabit } from '../api/habitsApi';
import { getCategories } from '../../categories/api/categoriesApi';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';

export const HabitsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: '' });

  const { data: habits, isLoading } = useQuery({ queryKey: ['habits'], queryFn: getHabits });
  const { data: categories } = useQuery({ queryKey: ['categories', 'habit'], queryFn: () => getCategories('habit') });

  const createMutation = useMutation({
    mutationFn: createHabit,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['habits'] }); setShowForm(false); setForm({ name: '', category: '' }); },
  });

  const logMutation = useMutation({
    mutationFn: logHabit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  });

  const today = new Date().toISOString().split('T')[0];

  const isLoggedToday = (habit: any) => habit.logs?.some((log: any) => log.date.split('T')[0] === today);

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-sm text-[var(--muted-foreground)]">{t('common.loading')}</p></div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('habits.title')}</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('habits.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" /> {t('habits.add')}
          </Button>
          <Link to="/workspace/habits">
            <Button variant="secondary">
              <Settings className="mr-2 h-4 w-4" /> {t('habits.manage')}
            </Button>
          </Link>
          <Link to="/workspace/categories">
            <Button variant="ghost">
              <LayoutDashboard className="mr-2 h-4 w-4" /> {t('habits.manageCategories')}
            </Button>
          </Link>
        </div>
      </div>

      {showForm && (
        <Card title={t('habits.new')}>
          <form className="space-y-4" onSubmit={(e: FormEvent) => { e.preventDefault(); createMutation.mutate(form); }}>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              {t('habits.name')}
              <Input value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              {t('habits.category')}
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-2xl border border-[var(--border)] bg-transparent p-3 text-sm text-[var(--foreground)] outline-none" required>
                <option value="">Select category</option>
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </label>
            <Button type="submit">{t('common.create')}</Button>
          </form>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habits?.map((habit: any) => (
          <div key={habit.id} className="rounded-3xl border border-[var(--border)] p-4 transition hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">{habit.name}</h3>
                <p className="text-xs text-[var(--muted-foreground)]">{habit.category}</p>
              </div>
              <button onClick={() => logMutation.mutate({ habitId: habit.id, date: today })} className={`rounded-full p-2 transition ${isLoggedToday(habit) ? 'bg-green-500 text-white' : 'bg-[var(--secondary)] text-[var(--muted-foreground)]'}`}>
                <Check className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <Flame className="h-3 w-3 text-orange-500" />
              <span>{habit.logs?.filter((l: any) => l.date.split('T')[0] === today).length ? t('habits.streak') : ''} {isLoggedToday(habit) ? 'Today' : '--'}</span>
            </div>
          </div>
        ))}
        {!habits?.length && (
          <div className="col-span-full py-12 text-center">
            <Flame className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t('habits.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
