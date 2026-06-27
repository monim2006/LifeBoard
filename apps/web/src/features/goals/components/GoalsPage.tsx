import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, Target, CheckCircle2, Settings, LayoutDashboard } from 'lucide-react';
import { getGoals, createGoal, addMilestone, toggleMilestone } from '../api/goalsApi';
import { getCategories } from '../../categories/api/categoriesApi';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';

export const GoalsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: '' });
  const [milestoneInputs, setMilestoneInputs] = useState<Record<string, string>>({});

  const { data: goals, isLoading } = useQuery({ queryKey: ['goals'], queryFn: getGoals });
  const { data: categories } = useQuery({ queryKey: ['categories', 'goal'], queryFn: () => getCategories('goal') });

  const createMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['goals'] }); setShowForm(false); setForm({ title: '', category: '' }); },
  });

  const milestoneMutation = useMutation({
    mutationFn: (data: { goalId: string; title: string }) => addMilestone(data.goalId, { title: data.title }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['goals'] }); setMilestoneInputs({}); },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleMilestone,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('goals.title')}</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('goals.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" /> {t('goals.add')}
          </Button>
          <Link to="/workspace/goals">
            <Button variant="secondary">
              <Settings className="mr-2 h-4 w-4" /> {t('goals.manage')}
            </Button>
          </Link>
          <Link to="/workspace/categories">
            <Button variant="ghost">
              <LayoutDashboard className="mr-2 h-4 w-4" /> {t('goals.manageCategories')}
            </Button>
          </Link>
        </div>
      </div>

      {showForm && (
        <Card title={t('goals.new')}>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              {t('goals.title.label')}
              <Input value={form.title} onChange={(e: any) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              {t('goals.category')}
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

      <div className="space-y-4">
        {goals?.map((goal: any) => (
          <div key={goal.id} className="rounded-3xl border border-[var(--border)] p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Target className="mt-1 h-5 w-5 text-[var(--muted-foreground)]" />
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">{goal.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{goal.category} &middot; {goal.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--foreground)]">{goal.progress}%</span>
              </div>
            </div>

            <div className="mt-4 h-2 w-full rounded-full bg-[var(--secondary)]">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all" style={{ width: `${goal.progress}%` }} />
            </div>

            <div className="mt-4 space-y-2">
              {goal.milestones?.map((milestone: any) => (
                <div key={milestone.id} className="flex items-center gap-3">
                  <button onClick={() => toggleMutation.mutate(milestone.id)} className={`rounded-full p-1 transition ${milestone.completed ? 'text-green-500' : 'text-[var(--muted-foreground)]'}`}>
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <span className={`text-sm ${milestone.completed ? 'text-[var(--muted-foreground)] line-through' : 'text-[var(--foreground)]'}`}>
                    {milestone.title}
                  </span>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={milestoneInputs[goal.id] || ''}
                  onChange={(e) => setMilestoneInputs({ ...milestoneInputs, [goal.id]: e.target.value })}
                  placeholder={t('goals.milestone.add')}
                  className="flex-1 rounded-xl border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[var(--foreground)]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && milestoneInputs[goal.id]) {
                      milestoneMutation.mutate({ goalId: goal.id, title: milestoneInputs[goal.id] });
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (milestoneInputs[goal.id]) {
                      milestoneMutation.mutate({ goalId: goal.id, title: milestoneInputs[goal.id] });
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {!goals?.length && (
          <div className="py-12 text-center">
            <Target className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t('goals.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
