import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getAnalyticsOverview } from '../api/analyticsApi';
import { Card } from '../../../shared/components/ui/Card';

type AnalyticsOverview = {
  totalExpenses: number;
  completedBlocks: number;
  totalBlocks: number;
  categoryBreakdown: Array<{ category: string; total: number }>;
};

export const AnalyticsPage = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery<AnalyticsOverview>({
    queryKey: ['analytics', 'overview'],
    queryFn: getAnalyticsOverview,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('analytics.title')}</h1>
      <Card title={t('analytics.overview')}>
        {isLoading ? (
          <p className="text-sm text-[var(--muted-foreground)]">{t('analytics.loading')}</p>
        ) : data ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-[var(--border)] p-4">
              <h3 className="text-sm font-medium text-[var(--muted-foreground)]">
                {t('analytics.expenses.week')}
              </h3>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                ${Number(data.totalExpenses).toFixed(2)}
              </p>
            </div>
            <div className="rounded-3xl border border-[var(--border)] p-4">
              <h3 className="text-sm font-medium text-[var(--muted-foreground)]">
                {t('analytics.completed')}
              </h3>
              <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
                {data.completedBlocks}/{data.totalBlocks}
              </p>
            </div>
            <div className="sm:col-span-2 rounded-3xl border border-[var(--border)] p-4">
              <h3 className="text-sm font-medium text-[var(--muted-foreground)]">
                {t('analytics.top.categories')}
              </h3>
              <div className="mt-4 space-y-3">
                {data.categoryBreakdown?.length ? (
                  data.categoryBreakdown.map((group: any) => (
                    <div
                      key={group.category}
                      className="flex items-center justify-between rounded-2xl bg-[var(--secondary)] p-3"
                    >
                      <span className="text-[var(--foreground)]">{group.category}</span>
                      <span className="font-semibold text-[var(--foreground)]">
                        ${Number(group.total).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {t('analytics.no.categories')}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">{t('analytics.no.data')}</p>
        )}
      </Card>
    </div>
  );
};
