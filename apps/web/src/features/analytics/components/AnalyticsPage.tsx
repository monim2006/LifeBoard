import { useQuery } from '@tanstack/react-query';
import { getAnalyticsOverview } from '../api/analyticsApi';
import { Card } from '../../../shared/components/ui/Card';

type AnalyticsOverview = {
  totalExpenses: number;
  completedBlocks: number;
  totalBlocks: number;
  categoryBreakdown: Array<{ category: string; total: number }>;
};

export const AnalyticsPage = () => {
  const { data, isLoading } = useQuery<AnalyticsOverview>({
    queryKey: ['analytics', 'overview'],
    queryFn: getAnalyticsOverview,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-slate-900">Analytics</h1>
      <Card title="Weekly overview">
        {isLoading ? (
          <p>Loading analytics…</p>
        ) : data ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 p-4">
              <h3 className="text-sm font-medium text-slate-700">Expenses this week</h3>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                ${data.totalExpenses.toFixed(2)}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 p-4">
              <h3 className="text-sm font-medium text-slate-700">Completed tasks</h3>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {data.completedBlocks}/{data.totalBlocks}
              </p>
            </div>
            <div className="sm:col-span-2 rounded-3xl border border-slate-200 p-4">
              <h3 className="text-sm font-medium text-slate-700">Top expense categories</h3>
              <div className="mt-4 space-y-3">
                {data.categoryBreakdown?.length ? (
                  data.categoryBreakdown.map((group: any) => (
                    <div
                      key={group.category}
                      className="flex items-center justify-between rounded-2xl bg-slate-50 p-3"
                    >
                      <span>{group.category}</span>
                      <span className="font-semibold">${group.total.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No category breakdown available.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600">No analytics data available yet.</p>
        )}
      </Card>
    </div>
  );
};
