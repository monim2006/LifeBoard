import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Calendar, CheckCircle, Circle } from 'lucide-react';
import api from '../../../shared/lib/api';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';

interface TimeBlock {
  id: string;
  planId: string;
  dayOfWeek: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  category: string;
  color: string;
  isCompleted: boolean;
}

interface Plan {
  id: string;
  weekStartDate: string;
  isTemplate: boolean;
  timeBlocks: TimeBlock[];
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const WorkspacePlanner = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [includeTemplates, setIncludeTemplates] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createDate, setCreateDate] = useState('');
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [blockForm, setBlockForm] = useState({ dayOfWeek: '', date: '', startTime: '', endTime: '', title: '', category: '', color: '#3b82f6' });
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', startTime: '', endTime: '', category: '' });

  const { data: plans, isLoading, error } = useQuery<Plan[]>({
    queryKey: ['plans', { includeTemplates }],
    queryFn: async () => {
      const res = await api.get('/plans', { params: { includeTemplates } });
      return res.data.data;
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (startDate: string) => {
      const res = await api.post('/plans/week', { startDate });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setShowCreateForm(false);
      setCreateDate('');
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      await api.delete(`/plans/${planId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });

  const createBlockMutation = useMutation({
    mutationFn: async ({ planId, block }: { planId: string; block: typeof blockForm }) => {
      const res = await api.post(`/plans/${planId}/blocks`, block);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setBlockForm({ dayOfWeek: '', date: '', startTime: '', endTime: '', title: '', category: '', color: '#3b82f6' });
    },
  });

  const updateBlockMutation = useMutation({
    mutationFn: async ({ blockId, data }: { blockId: string; data: typeof editForm }) => {
      const res = await api.put(`/plans/blocks/${blockId}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setEditingBlock(null);
    },
  });

  const toggleBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      const res = await api.patch(`/plans/blocks/${blockId}/toggle`);
      return res.data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  });

  const deleteBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      await api.delete(`/plans/blocks/${blockId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('workspace.planner.title')}</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('workspace.planner.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <input
              type="checkbox"
              checked={includeTemplates}
              onChange={(e) => setIncludeTemplates(e.target.checked)}
              className="rounded border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
            />
            {t('workspace.planner.showTemplates')}
          </label>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> {t('workspace.planner.newPlan')}
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <Card title={t('workspace.planner.createPlan')}>
          <form
            className="flex flex-wrap items-end gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (createDate) createPlanMutation.mutate(createDate);
            }}
          >
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--foreground)]">{t('workspace.planner.weekStartDate')}</span>
              <Input
                type="date"
                value={createDate}
                onChange={(e) => setCreateDate(e.target.value)}
                required
              />
            </label>
            <div className="flex gap-2">
              <Button type="submit" disabled={createPlanMutation.isPending}>
                {t('common.create')}
              </Button>
              <Button variant="secondary" onClick={() => setShowCreateForm(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {!plans?.length ? (
        <div className="py-12 text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">{t('workspace.planner.empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-[var(--muted-foreground)]" />
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">
                      {new Date(plan.weekStartDate).toLocaleDateString()}
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {plan.isTemplate ? t('workspace.planner.template') : t('workspace.planner.plan')}
                      {' · '}
                      {plan.timeBlocks?.length || 0} {t('workspace.planner.blocks')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                  >
                    {expandedPlan === plan.id ? t('common.collapse') : t('common.expand')}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (confirm(t('workspace.planner.confirmDelete'))) deletePlanMutation.mutate(plan.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {expandedPlan === plan.id && (
                <div className="mt-6 space-y-4 border-t border-[var(--border)] pt-4">
                  <form
                    className="flex flex-wrap items-end gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      createBlockMutation.mutate({ planId: plan.id, block: blockForm });
                    }}
                  >
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.planner.day')}</span>
                      <select
                        value={blockForm.dayOfWeek}
                        onChange={(e) => setBlockForm({ ...blockForm, dayOfWeek: e.target.value })}
                        required
                        className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none"
                      >
                        <option value="">{t('workspace.planner.selectDay')}</option>
                        {DAYS.map((d) => (
                          <option key={d} value={d}>{t(`days.${d}`)}</option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.planner.date')}</span>
                      <Input type="date" value={blockForm.date} onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })} required />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.planner.start')}</span>
                      <Input type="time" value={blockForm.startTime} onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })} required />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.planner.end')}</span>
                      <Input type="time" value={blockForm.endTime} onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })} required />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.planner.title')}</span>
                      <Input value={blockForm.title} onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })} required />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.planner.category')}</span>
                      <Input value={blockForm.category} onChange={(e) => setBlockForm({ ...blockForm, category: e.target.value })} />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.planner.color')}</span>
                      <Input type="color" value={blockForm.color} onChange={(e) => setBlockForm({ ...blockForm, color: e.target.value })} className="h-9 w-16 p-1" />
                    </label>
                    <Button type="submit" size="sm" disabled={createBlockMutation.isPending}>
                      <Plus className="mr-1 h-3 w-3" /> {t('workspace.planner.addBlock')}
                    </Button>
                  </form>

                  <div className="space-y-2">
                    {plan.timeBlocks?.length ? (
                      plan.timeBlocks.map((block) => (
                        <div
                          key={block.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] p-3 transition hover:bg-[var(--secondary)]"
                          style={{ borderLeftColor: block.color, borderLeftWidth: 4 }}
                        >
                          {editingBlock === block.id ? (
                            <form
                              className="flex flex-wrap items-end gap-2"
                              onSubmit={(e) => {
                                e.preventDefault();
                                updateBlockMutation.mutate({ blockId: block.id, data: editForm });
                              }}
                            >
                              <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required />
                              <Input type="time" value={editForm.startTime} onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })} required />
                              <Input type="time" value={editForm.endTime} onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })} required />
                              <Input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
                              <Button type="submit" size="sm">{t('common.save')}</Button>
                              <Button variant="secondary" size="sm" onClick={() => setEditingBlock(null)}>{t('common.cancel')}</Button>
                            </form>
                          ) : (
                            <>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleBlockMutation.mutate(block.id)}
                                  className="transition hover:scale-110"
                                >
                                  {block.isCompleted ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <Circle className="h-5 w-5 text-[var(--muted-foreground)]" />
                                  )}
                                </button>
                                <div>
                                  <span
                                    className={`text-sm font-medium text-[var(--foreground)] ${
                                      block.isCompleted ? 'text-[var(--muted-foreground)] line-through' : ''
                                    }`}
                                  >
                                    {block.title}
                                  </span>
                                  <p className="text-xs text-[var(--muted-foreground)]">
                                    {block.dayOfWeek}, {block.startTime} – {block.endTime}
                                    {block.category ? ` · ${block.category}` : ''}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingBlock(block.id);
                                    setEditForm({ title: block.title, startTime: block.startTime, endTime: block.endTime, category: block.category });
                                  }}
                                >
                                  {t('common.edit')}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteBlockMutation.mutate(block.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-[var(--destructive)]" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">{t('workspace.planner.noBlocks')}</p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
