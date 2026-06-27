import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Target, Check, X, Circle, CheckCircle } from 'lucide-react';
import api from '../../../shared/lib/api';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';

const defaultForm = {
  title: '',
  description: '',
  category: 'personal',
  startDate: '',
  targetDate: '',
  color: '#3b82f6',
  status: 'active',
};

const defaultMilestone = { title: '' };

export const WorkspaceGoals = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(defaultForm);
  const [milestoneInputs, setMilestoneInputs] = useState<Record<string, string>>({});

  const { data: goals, isLoading, error } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await api.get('/goals');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof defaultForm) => {
      const res = await api.post('/goals', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowForm(false);
      setForm(defaultForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof defaultForm }) => {
      const res = await api.put(`/goals/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setEditingId(null);
      setEditForm(defaultForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/goals/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const addMilestoneMutation = useMutation({
    mutationFn: async ({ goalId, title }: { goalId: string; title: string }) => {
      const res = await api.post(`/goals/${goalId}/milestones`, { title });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setMilestoneInputs((prev) => ({ ...prev, [Object.keys(milestoneInputs).find((k) => prev[k] === prev[Object.keys(prev).find((k2) => k2 === k) as string]) as string]: '' }));
    },
  });

  const toggleMilestoneMutation = useMutation({
    mutationFn: async (milestoneId: string) => {
      const res = await api.patch(`/goals/milestones/${milestoneId}/toggle`);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: async (milestoneId: string) => {
      await api.delete(`/goals/milestones/${milestoneId}`);
    },
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

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-[var(--destructive)]">{t('common.error')}</p>
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
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); }}>
          <Plus className="mr-2 h-4 w-4" /> {t('goals.add')}
        </Button>
      </div>

      {showForm && (
        <Card title={t('goals.new')}>
          <form
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(form);
            }}
          >
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-[var(--foreground)]">{t('goals.title.label')}</span>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-[var(--foreground)]">Description</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]"
                rows={3}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--foreground)]">{t('goals.category')}</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--foreground)] outline-none"
              >
                <option value="career">Career</option>
                <option value="finance">Finance</option>
                <option value="health">Health</option>
                <option value="learning">Learning</option>
                <option value="personal">Personal</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--foreground)]">Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--foreground)] outline-none"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--foreground)]">Start Date</span>
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--foreground)]">Target Date</span>
              <Input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--foreground)]">Color</span>
              <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-9 w-16 p-1" />
            </label>
            <div className="flex items-end gap-2 sm:col-span-2">
              <Button type="submit" disabled={createMutation.isPending}>{t('common.create')}</Button>
              <Button variant="secondary" onClick={() => { setShowForm(false); setForm(defaultForm); }}>{t('common.cancel')}</Button>
            </div>
          </form>
        </Card>
      )}

      {!goals?.length ? (
        <div className="py-12 text-center">
          <Target className="mx-auto mb-4 h-12 w-12 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">{t('goals.empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal: any) => {
            const milestoneCount = goal.milestones?.length || 0;
            const completedCount = goal.milestones?.filter((m: any) => m.completed).length || 0;
            const isEditing = editingId === goal.id;

            return (
              <Card key={goal.id}>
                {isEditing ? (
                  <form
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateMutation.mutate({ id: goal.id, data: editForm });
                    }}
                  >
                    <label className="flex flex-col gap-1.5 sm:col-span-2">
                      <span className="text-sm font-medium text-[var(--foreground)]">{t('goals.title.label')}</span>
                      <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
                    </label>
                    <label className="flex flex-col gap-1.5 sm:col-span-2">
                      <span className="text-sm font-medium text-[var(--foreground)]">Description</span>
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]"
                        rows={3}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-[var(--foreground)]">{t('goals.category')}</span>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--foreground)] outline-none"
                      >
                        <option value="career">Career</option>
                        <option value="finance">Finance</option>
                        <option value="health">Health</option>
                        <option value="learning">Learning</option>
                        <option value="personal">Personal</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-[var(--foreground)]">Status</span>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--foreground)] outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-[var(--foreground)]">Target Date</span>
                      <Input type="date" value={editForm.targetDate} onChange={(e) => setEditForm({ ...editForm, targetDate: e.target.value })} />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-sm font-medium text-[var(--foreground)]">Color</span>
                      <Input type="color" value={editForm.color} onChange={(e) => setEditForm({ ...editForm, color: e.target.value })} className="h-9 w-16 p-1" />
                    </label>
                    <div className="flex items-end gap-2 sm:col-span-2">
                      <Button type="submit" disabled={updateMutation.isPending}>{t('common.save')}</Button>
                      <Button variant="secondary" onClick={() => { setEditingId(null); setEditForm(defaultForm); }}>{t('common.cancel')}</Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-5 w-5 rounded-full" style={{ backgroundColor: goal.color || '#3b82f6' }} />
                        <div>
                          <h3 className="text-lg font-semibold text-[var(--foreground)]">{goal.title}</h3>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {goal.category}
                            {goal.status !== 'active' && <span className="ml-2 rounded-full border border-[var(--border)] px-2 py-0.5 text-xs">{goal.status}</span>}
                          </p>
                          {goal.description && (
                            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{goal.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--foreground)]">{goal.progress ?? 0}%</span>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingId(goal.id);
                            setEditForm({
                              title: goal.title,
                              description: goal.description || '',
                              category: goal.category,
                              startDate: goal.startDate || '',
                              targetDate: goal.targetDate || '',
                              color: goal.color || '#3b82f6',
                              status: goal.status || 'active',
                            });
                            setShowForm(false);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Delete this goal?')) deleteMutation.mutate(goal.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-[var(--destructive)]" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 h-2 w-full rounded-full bg-[var(--secondary)]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${goal.progress ?? 0}%`, backgroundColor: goal.color || '#3b82f6' }}
                      />
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                      {goal.startDate && <span>Start: {new Date(goal.startDate).toLocaleDateString()}</span>}
                      {goal.targetDate && <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>}
                      <span>{completedCount}/{milestoneCount} milestones</span>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-4">
                      {goal.milestones?.length ? (
                        goal.milestones.map((milestone: any) => (
                          <div key={milestone.id} className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2 transition hover:bg-[var(--secondary)]">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleMilestoneMutation.mutate(milestone.id)}
                                className="transition hover:scale-110"
                              >
                                {milestone.completed ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-[var(--muted-foreground)]" />
                                )}
                              </button>
                              <span
                                className={`text-sm ${
                                  milestone.completed
                                    ? 'text-[var(--muted-foreground)] line-through'
                                    : 'text-[var(--foreground)]'
                                }`}
                              >
                                {milestone.title}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                if (confirm('Delete this milestone?')) deleteMilestoneMutation.mutate(milestone.id);
                              }}
                              className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="py-2 text-center text-sm text-[var(--muted-foreground)]">No milestones yet</p>
                      )}

                      <form
                        className="flex items-center gap-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const title = milestoneInputs[goal.id]?.trim();
                          if (title) {
                            addMilestoneMutation.mutate({ goalId: goal.id, title });
                            setMilestoneInputs((prev) => ({ ...prev, [goal.id]: '' }));
                          }
                        }}
                      >
                        <Input
                          placeholder={t('goals.milestone.add')}
                          value={milestoneInputs[goal.id] || ''}
                          onChange={(e) => setMilestoneInputs((prev) => ({ ...prev, [goal.id]: e.target.value }))}
                          className="flex-1"
                        />
                        <Button type="submit" size="sm" disabled={addMilestoneMutation.isPending}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
