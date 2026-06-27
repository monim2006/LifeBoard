import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Wallet, DollarSign, PiggyBank, Check, X, AlertTriangle } from 'lucide-react';
import api from '../../../shared/lib/api';

type Budget = {
  id: string;
  month: number;
  year: number;
  category: string;
  budgetAmount: number;
  alertThreshold: number;
  spent?: number;
};

type Category = {
  id: string;
  name: string;
  color: string;
};

type IncomeSource = {
  id: string;
  name: string;
  amount: number;
  frequency: string;
};

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const CURRENT_YEAR = new Date().getFullYear();

const initialBudgetForm = { month: new Date().getMonth() + 1, year: CURRENT_YEAR, category: '', budgetAmount: 0, alertThreshold: 80 };

export const WorkspaceFinance = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<'budgets' | 'categories' | 'income'>('budgets');
  const [showAddForm, setShowAddForm] = useState(false);
  const [budgetForm, setBudgetForm] = useState(initialBudgetForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ budgetAmount: 0, alertThreshold: 0 });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['budgets'] });

  const { data: budgetsData, isLoading, isError } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const res = await api.get('/expenses/budgets');
      return res.data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'expense'],
    queryFn: async () => {
      const res = await api.get('/categories', { params: { type: 'expense' } });
      return res.data;
    },
  });

  const { data: incomeData } = useQuery({
    queryKey: ['income-sources'],
    queryFn: async () => {
      const res = await api.get('/income/sources');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof initialBudgetForm) => api.post('/expenses/budgets', body),
    onSuccess: () => { invalidate(); setShowAddForm(false); setBudgetForm(initialBudgetForm); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string; budgetAmount: number; alertThreshold: number }) => api.put(`/expenses/budgets/${id}`, body),
    onSuccess: () => { invalidate(); setEditingId(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/expenses/budgets/${id}`),
    onSuccess: () => { invalidate(); setDeleteId(null); },
  });

  const budgets: Budget[] = budgetsData?.data ?? [];
  const categories: Category[] = categoriesData?.data ?? [];
  const incomeSources: IncomeSource[] = incomeData?.data ?? [];

  const spent = (budget: Budget) => budget.spent ?? 0;
  const progress = (budget: Budget) => budget.budgetAmount > 0 ? Math.min((spent(budget) / budget.budgetAmount) * 100, 100) : 0;
  const isOverThreshold = (budget: Budget) => progress(budget) >= budget.alertThreshold;

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
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('workspace.finance.title')}</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('workspace.finance.subtitle')}</p>
        </div>
        {tab === 'budgets' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {t('workspace.finance.addBudget')}
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {(['budgets', 'categories', 'income'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${tab === key ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
          >
            {t(`workspace.finance.tab.${key}`)}
          </button>
        ))}
      </div>

      {tab === 'budgets' && (
        <>
          {showAddForm && (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.finance.month')}</label>
                  <select
                    value={budgetForm.month}
                    onChange={(e) => setBudgetForm({ ...budgetForm, month: Number(e.target.value) })}
                    className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.finance.year')}</label>
                  <input
                    type="number"
                    value={budgetForm.year}
                    onChange={(e) => setBudgetForm({ ...budgetForm, year: Number(e.target.value) })}
                    className="w-24 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.finance.category')}</label>
                  <input
                    value={budgetForm.category}
                    onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                    className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                    placeholder={t('workspace.finance.categoryPlaceholder')}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.finance.budgetAmount')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={budgetForm.budgetAmount || ''}
                    onChange={(e) => setBudgetForm({ ...budgetForm, budgetAmount: Number(e.target.value) })}
                    className="w-28 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.finance.alertThreshold')}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={budgetForm.alertThreshold}
                      onChange={(e) => setBudgetForm({ ...budgetForm, alertThreshold: Number(e.target.value) })}
                      className="w-24 accent-[var(--foreground)]"
                    />
                    <span className="text-xs text-[var(--muted-foreground)]">{budgetForm.alertThreshold}%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (budgetForm.category.trim() && budgetForm.budgetAmount > 0) {
                        createMutation.mutate(budgetForm);
                      }
                    }}
                    disabled={!budgetForm.category.trim() || budgetForm.budgetAmount <= 0 || createMutation.isPending}
                    className="flex items-center gap-2 rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:opacity-90 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    {t('common.save')}
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {budgets.length === 0 ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Wallet className="h-12 w-12 text-[var(--muted-foreground)]" />
                <p className="text-sm text-[var(--muted-foreground)]">{t('workspace.finance.emptyBudgets')}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {budgets.map((budget) => {
                const pct = progress(budget);
                const overThreshold = isOverThreshold(budget);

                return (
                  <div
                    key={budget.id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--foreground)]/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <PiggyBank className="h-5 w-5 text-[var(--muted-foreground)]" />
                          <div>
                            <h3 className="font-medium text-[var(--foreground)]">{budget.category}</h3>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {new Date(2000, budget.month - 1).toLocaleString('default', { month: 'long' })} {budget.year}
                            </p>
                          </div>
                          {overThreshold && (
                            <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-500">
                              <AlertTriangle className="h-3 w-3" />
                              {t('workspace.finance.alertExceeded')}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--muted-foreground)]">
                              <DollarSign className="mr-0.5 inline h-3 w-3" />
                              {t('workspace.finance.spent')}: {spent(budget).toFixed(2)}
                            </span>
                            <span className="text-[var(--foreground)]">
                              {t('workspace.finance.of')} {budget.budgetAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--secondary)]">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${overThreshold ? 'bg-red-500' : 'bg-[var(--foreground)]'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                            <span>{pct.toFixed(0)}%</span>
                            <span>{t('workspace.finance.alertThreshold')}: {budget.alertThreshold}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {editingId === budget.id ? (
                          <div className="flex items-center gap-2">
                            <div className="space-y-1">
                              <label className="text-xs text-[var(--muted-foreground)]">{t('workspace.finance.budgetAmount')}</label>
                              <input
                                type="number"
                                step="0.01"
                                value={editValues.budgetAmount}
                                onChange={(e) => setEditValues({ ...editValues, budgetAmount: Number(e.target.value) })}
                                className="w-24 rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-[var(--muted-foreground)]">{t('workspace.finance.alertThreshold')}</label>
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={editValues.alertThreshold}
                                onChange={(e) => setEditValues({ ...editValues, alertThreshold: Number(e.target.value) })}
                                className="w-16 rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                              />
                            </div>
                            <button
                              onClick={() => updateMutation.mutate({ id: budget.id, budgetAmount: editValues.budgetAmount, alertThreshold: editValues.alertThreshold })}
                              className="rounded-lg p-2 text-green-500 transition hover:bg-green-500/10"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => { setEditingId(budget.id); setEditValues({ budgetAmount: budget.budgetAmount, alertThreshold: budget.alertThreshold }); }}
                              className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                              title={t('common.edit')}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            {deleteId === budget.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => deleteMutation.mutate(budget.id)}
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
                                onClick={() => setDeleteId(budget.id)}
                                className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-red-500"
                                title={t('common.delete')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'categories' && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          {categories.length === 0 ? (
            <div className="flex min-h-[20vh] items-center justify-center">
              <p className="text-sm text-[var(--muted-foreground)]">{t('workspace.finance.emptyCategories')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-[var(--secondary)]">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm text-[var(--foreground)]">{cat.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'income' && (
        <div className="space-y-3">
          {incomeSources.length === 0 ? (
            <div className="flex min-h-[20vh] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <DollarSign className="h-12 w-12 text-[var(--muted-foreground)]" />
                <p className="text-sm text-[var(--muted-foreground)]">{t('workspace.finance.emptyIncome')}</p>
              </div>
            </div>
          ) : (
            incomeSources.map((src) => (
              <div key={src.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 transition hover:border-[var(--foreground)]/20">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{src.name}</p>
                  <p className="text-xs capitalize text-[var(--muted-foreground)]">{src.frequency}</p>
                </div>
                <span className="text-sm font-semibold text-green-500">+${Number(src.amount).toFixed(2)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
