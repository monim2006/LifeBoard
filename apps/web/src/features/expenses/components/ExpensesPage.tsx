import { type FormEvent, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getExpenses, addExpense } from '../api/expensesApi';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';

const emptyExpense = { amount: 0, category: '', description: '', paymentMethod: '', location: '' };

export const ExpensesPage = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState(emptyExpense);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses,
  });
  const mutation = useMutation({
    mutationFn: addExpense,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await mutation.mutateAsync({
      ...form,
      amount: Number(form.amount),
      date: new Date().toISOString(),
      tags: [],
      isRecurring: false,
    });
    setForm(emptyExpense);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('expenses.title')}</h1>
      <Card title={t('expenses.add')}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              {t('expenses.amount')}
              <Input
                value={form.amount}
                type="number"
                step="0.01"
                onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })}
                required
              />
            </label>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              {t('expenses.category')}
              <Input
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                required
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              {t('expenses.payment')}
              <Input
                value={form.paymentMethod}
                onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}
              />
            </label>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              {t('expenses.location')}
              <Input
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
              />
            </label>
          </div>
          <label className="block text-sm font-medium text-[var(--foreground)]">
            {t('expenses.description')}
            <Input
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </label>
          <Button type="submit" disabled={mutation.status === 'pending'}>
            {mutation.status === 'pending' ? t('expenses.saving') : t('expenses.save')}
          </Button>
        </form>
      </Card>
      <Card title={t('expenses.recent')}>
        {isLoading ? (
          <p className="text-sm text-[var(--muted-foreground)]">{t('expenses.loading')}</p>
        ) : data?.data?.length ? (
          <div className="space-y-3">
            {data.data.map((expense: any) => (
              <div key={expense.id} className="rounded-3xl border border-[var(--border)] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">{expense.category}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {expense.description || t('expenses.no.desc')}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    ${Number(expense.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">{t('expenses.empty')}</p>
        )}
      </Card>
    </div>
  );
};
