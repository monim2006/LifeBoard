import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Flame, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../../shared/lib/api';

type Habit = {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  target: number;
  unit: string;
  color: string;
  icon: string;
  logs: { id: string; date: string; value: number; note: string }[];
  createdAt: string;
};

type StreakData = {
  streak: number;
  totalLogs: number;
};

const FREQUENCIES = ['daily', 'weekly', 'monthly'] as const;
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#78716c'];

const emptyForm = () => ({
  name: '', description: '', category: '', frequency: 'daily' as const, target: 1, unit: '', color: COLORS[0], icon: '',
});

export const WorkspaceHabits = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newForm, setNewForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);
  const [streakCache, setStreakCache] = useState<Record<string, StreakData>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const res = await api.get('/habits');
      return res.data.data as Habit[];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['habits'] });

  const createMutation = useMutation({
    mutationFn: (body: typeof newForm) => api.post('/habits', body),
    onSuccess: () => { invalidate(); setShowAddForm(false); setNewForm(emptyForm()); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Omit<typeof editForm, 'icon'>) => api.put(`/habits/${id}`, body),
    onSuccess: () => { invalidate(); setEditingId(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/habits/${id}`),
    onSuccess: () => { invalidate(); setDeleteId(null); },
  });

  const fetchStreak = async (id: string) => {
    if (streakCache[id]) return;
    const res = await api.get(`/habits/${id}/streak`);
    setStreakCache((prev) => ({ ...prev, [id]: res.data.data as StreakData }));
  };

  const habits: Habit[] = data ?? [];

  const startEditing = (habit: Habit) => {
    setEditingId(habit.id);
    setEditForm({
      name: habit.name,
      description: habit.description,
      category: habit.category,
      frequency: habit.frequency,
      target: habit.target,
      unit: habit.unit,
      color: habit.color,
      icon: habit.icon,
    });
  };

  const saveEdit = (id: string) => {
    if (editForm.name.trim()) {
      updateMutation.mutate({ id, ...editForm });
    }
    setEditingId(null);
  };

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

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-red-500">{t('common.error')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('workspace.habits.title')}</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('workspace.habits.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {t('workspace.habits.add')}
        </button>
      </div>

      {showAddForm && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.habits.name')}</label>
              <input
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                placeholder={t('workspace.habits.namePlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.habits.description')}</label>
              <input
                value={newForm.description}
                onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                placeholder={t('workspace.habits.descriptionPlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.habits.category')}</label>
              <input
                value={newForm.category}
                onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                placeholder={t('workspace.habits.categoryPlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.habits.frequency')}</label>
              <select
                value={newForm.frequency}
                onChange={(e) => setNewForm({ ...newForm, frequency: e.target.value as typeof newForm.frequency })}
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>{t(`workspace.habits.frequency_${f}`)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.habits.target')}</label>
              <input
                type="number"
                min={1}
                value={newForm.target}
                onChange={(e) => setNewForm({ ...newForm, target: Math.max(1, Number(e.target.value)) })}
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.habits.unit')}</label>
              <input
                value={newForm.unit}
                onChange={(e) => setNewForm({ ...newForm, unit: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                placeholder={t('workspace.habits.unitPlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.habits.color')}</label>
              <div className="flex flex-wrap gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewForm({ ...newForm, color: c })}
                    className={`h-6 w-6 rounded-full transition ${newForm.color === c ? 'ring-2 ring-[var(--foreground)] ring-offset-2 ring-offset-[var(--card)]' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.habits.icon')}</label>
              <input
                value={newForm.icon}
                onChange={(e) => setNewForm({ ...newForm, icon: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                placeholder={t('workspace.habits.iconPlaceholder')}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => {
                if (newForm.name.trim()) {
                  createMutation.mutate(newForm);
                }
              }}
              disabled={!newForm.name.trim() || createMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:opacity-90 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {t('common.save')}
            </button>
            <button
              onClick={() => { setShowAddForm(false); setNewForm(emptyForm()); }}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <p className="text-sm text-[var(--muted-foreground)]">{t('workspace.habits.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const isExpanded = expandedHabit === habit.id;
            const streakData = streakCache[habit.id];
            const logs = habit.logs ?? [];

            return (
              <div
                key={habit.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] transition"
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: habit.color + '20' }}>
                      {habit.icon ? (
                        <span className="text-lg">{habit.icon}</span>
                      ) : (
                        <Flame className="h-5 w-5" style={{ color: habit.color }} />
                      )}
                    </div>
                    {editingId === habit.id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.habits.name')}</label>
                          <input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(habit.id); if (e.key === 'Escape') setEditingId(null); }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.habits.description')}</label>
                          <input
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.habits.category')}</label>
                          <input
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.habits.frequency')}</label>
                          <select
                            value={editForm.frequency}
                            onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value as typeof editForm.frequency })}
                            className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                          >
                            {FREQUENCIES.map((f) => (
                              <option key={f} value={f}>{t(`workspace.habits.frequency_${f}`)}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.habits.target')}</label>
                          <input
                            type="number"
                            min={1}
                            value={editForm.target}
                            onChange={(e) => setEditForm({ ...editForm, target: Math.max(1, Number(e.target.value)) })}
                            className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.habits.unit')}</label>
                          <input
                            value={editForm.unit}
                            onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                            className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.habits.color')}</label>
                          <div className="flex gap-1">
                            {COLORS.map((c) => (
                              <button
                                key={c}
                                onClick={() => setEditForm({ ...editForm, color: c })}
                                className={`h-5 w-5 rounded-full transition ${editForm.color === c ? 'ring-2 ring-[var(--foreground)] ring-offset-1 ring-offset-[var(--card)]' : ''}`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 pt-5">
                          <button onClick={() => saveEdit(habit.id)} className="rounded-lg p-1.5 text-green-500 transition hover:bg-green-500/10"><Check className="h-4 w-4" /></button>
                          <button onClick={() => setEditingId(null)} className="rounded-lg p-1.5 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"><X className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="text-sm font-medium text-[var(--foreground)]">{habit.name}</span>
                          {habit.description && (
                            <p className="text-xs text-[var(--muted-foreground)]">{habit.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {habit.category && (
                            <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs capitalize text-[var(--muted-foreground)]">{habit.category}</span>
                          )}
                          <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs capitalize text-[var(--muted-foreground)]">
                            {t(`workspace.habits.frequency_${habit.frequency}`)}
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {habit.target} {habit.unit}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {editingId !== habit.id && (
                    <div className="flex items-center gap-1">
                      <button
                        onMouseEnter={() => fetchStreak(habit.id)}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-orange-500 transition hover:bg-orange-500/10"
                      >
                        <Flame className="h-4 w-4" />
                        {streakData ? streakData.streak : '?'}
                      </button>
                      <button
                        onClick={() => startEditing(habit)}
                        className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                        title={t('common.edit')}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {deleteId === habit.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteMutation.mutate(habit.id)}
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-500/10"
                            title={t('common.confirm')}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(null)}
                            className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                            title={t('common.cancel')}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteId(habit.id)}
                          className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-red-500"
                          title={t('common.delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const next = isExpanded ? null : habit.id;
                          setExpandedHabit(next);
                          if (next) fetchStreak(habit.id);
                        }}
                        className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                        title={isExpanded ? t('common.collapse') : t('common.expand')}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-[var(--border)] px-4 py-3">
                    <div className="mb-3 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-[var(--foreground)]">
                          {streakData ? (
                            <>{streakData.streak} {t('workspace.habits.dayStreak')}</>
                          ) : (
                            t('common.loading')
                          )}
                        </span>
                      </div>
                      <div className="text-[var(--muted-foreground)]">
                        {streakData ? `${streakData.totalLogs} ${t('workspace.habits.totalLogs')}` : ''}
                      </div>
                    </div>
                    {logs.length === 0 ? (
                      <p className="py-2 text-center text-xs text-[var(--muted-foreground)]">{t('workspace.habits.noLogs')}</p>
                    ) : (
                      <div className="max-h-60 space-y-1 overflow-y-auto">
                        {logs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between rounded-lg bg-[var(--secondary)] px-3 py-2 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <Check className="h-3.5 w-3.5 text-green-500" />
                              <span className="text-[var(--foreground)]">
                                {new Date(log.date).toLocaleDateString()}
                              </span>
                              <span className="text-[var(--muted-foreground)]">
                                {log.value} {habit.unit}
                              </span>
                            </div>
                            {log.note && (
                              <span className="text-xs text-[var(--muted-foreground)]">{log.note}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
