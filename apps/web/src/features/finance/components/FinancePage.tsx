import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Wallet, Settings, LayoutDashboard } from 'lucide-react';
import { getExpenses, addExpense, getIncomes, addIncome, getTodayTotal, getWeeklyTotal } from '../api/financeApi';
import { getCategories } from '../../categories/api/categoriesApi';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';

export const FinancePage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'expenses' | 'income'>('expenses');

  const [expenseForm, setExpenseForm] = useState({ amount: 0, category: '', description: '' });
  const [incomeForm, setIncomeForm] = useState({ amount: 0, source: '', description: '' });

  const { data: expenses, isLoading: expensesLoading } = useQuery({ queryKey: ['expenses'], queryFn: getExpenses });
  const { data: incomes, isLoading: incomesLoading } = useQuery({ queryKey: ['incomes'], queryFn: () => getIncomes() });
  const { data: todayTotal, isLoading: todayLoading } = useQuery({ queryKey: ['expenses', 'today'], queryFn: getTodayTotal });
  const { data: weeklyTotal, isLoading: weeklyLoading } = useQuery({ queryKey: ['expenses', 'weekly'], queryFn: getWeeklyTotal });
  const { data: expenseCategories } = useQuery({ queryKey: ['categories', 'expense'], queryFn: () => getCategories('expense') });
  const { data: incomeCategories } = useQuery({ queryKey: ['categories', 'income'], queryFn: () => getCategories('income') });

  const isLoading = expensesLoading || incomesLoading || todayLoading || weeklyLoading;

  const expenseMutation = useMutation({
    mutationFn: addExpense,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expenses'] }); queryClient.invalidateQueries({ queryKey: ['expenses', 'today'] }); queryClient.invalidateQueries({ queryKey: ['expenses', 'weekly'] }); },
  });

  const incomeMutation = useMutation({
    mutationFn: addIncome,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['incomes'] }),
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
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('finance.title')}</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('finance.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/workspace/finance">
            <Button variant="secondary">
              <Settings className="mr-2 h-4 w-4" /> {t('finance.manage')}
            </Button>
          </Link>
          <Link to="/workspace/categories">
            <Button variant="ghost">
              <LayoutDashboard className="mr-2 h-4 w-4" /> {t('finance.manageCategories')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-[var(--border)] p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <TrendingDown className="h-4 w-4 text-red-500" />
            {t('finance.today')}
          </div>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            ${Number(todayTotal?.total ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="rounded-3xl border border-[var(--border)] p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Wallet className="h-4 w-4 text-blue-500" />
            {t('finance.week')}
          </div>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            ${Number(weeklyTotal?.total ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="rounded-3xl border border-[var(--border)] p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <TrendingUp className="h-4 w-4 text-green-500" />
            {t('finance.balance')}
          </div>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            ${(Number(incomes?.reduce?.((s: number, i: any) => s + Number(i.amount), 0) ?? 0) - Number(weeklyTotal?.total ?? 0)).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setTab('expenses')} className={`rounded-full px-4 py-2 text-sm font-medium transition ${tab === 'expenses' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] text-[var(--muted-foreground)]'}`}>
          {t('finance.expenses')}
        </button>
        <button onClick={() => setTab('income')} className={`rounded-full px-4 py-2 text-sm font-medium transition ${tab === 'income' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] text-[var(--muted-foreground)]'}`}>
          {t('finance.income')}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={tab === 'expenses' ? t('expenses.add') : t('finance.add.income')}>
          <form className="space-y-4" onSubmit={(e: FormEvent) => { e.preventDefault();
            if (tab === 'expenses') {
              expenseMutation.mutate({ ...expenseForm, amount: Number(expenseForm.amount), date: new Date().toISOString(), tags: [], isRecurring: false });
              setExpenseForm({ amount: 0, category: '', description: '' });
            } else {
              incomeMutation.mutate({ ...incomeForm, amount: Number(incomeForm.amount), date: new Date().toISOString(), tags: [] });
              setIncomeForm({ amount: 0, source: '', description: '' });
            }
          }}>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              {t('expenses.amount')}
              <Input type="number" step="0.01" value={tab === 'expenses' ? expenseForm.amount : incomeForm.amount}
                onChange={(e: any) => tab === 'expenses' ? setExpenseForm({ ...expenseForm, amount: Number(e.target.value) }) : setIncomeForm({ ...incomeForm, amount: Number(e.target.value) })}
                required />
            </label>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              {tab === 'expenses' ? t('expenses.category') : t('finance.source')}
              <select
                value={tab === 'expenses' ? expenseForm.category : incomeForm.source}
                onChange={(e: any) => tab === 'expenses' ? setExpenseForm({ ...expenseForm, category: e.target.value }) : setIncomeForm({ ...incomeForm, source: e.target.value })}
                className="w-full rounded-2xl border border-[var(--border)] bg-transparent p-3 text-sm text-[var(--foreground)] outline-none"
                required
              >
                <option value="">Select</option>
                {(tab === 'expenses' ? expenseCategories : incomeCategories)?.map((cat: any) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              {t('expenses.description')}
              <Input value={tab === 'expenses' ? expenseForm.description : incomeForm.description}
                onChange={(e: any) => tab === 'expenses' ? setExpenseForm({ ...expenseForm, description: e.target.value }) : setIncomeForm({ ...incomeForm, description: e.target.value })} />
            </label>
            <Button type="submit">{tab === 'expenses' ? t('expenses.save') : t('finance.save.income')}</Button>
          </form>
        </Card>

        <Card title={tab === 'expenses' ? t('expenses.recent') : t('finance.recent.income')}>
          <div className="space-y-3">
            {(tab === 'expenses' ? expenses?.data : incomes)?.length ? (
              (tab === 'expenses' ? expenses.data : incomes).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-[var(--secondary)] p-3">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {tab === 'expenses' ? item.category : item.source}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {item.description || (tab === 'expenses' ? t('expenses.no.desc') : '')}
                    </p>
                  </div>
                  <p className={`text-sm font-semibold ${tab === 'expenses' ? 'text-red-500' : 'text-green-500'}`}>
                    {tab === 'expenses' ? '-' : '+'}${Number(item.amount).toFixed(2)}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-6 text-center">
                <Wallet className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {tab === 'expenses' ? t('expenses.empty') : t('finance.no.income')}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
