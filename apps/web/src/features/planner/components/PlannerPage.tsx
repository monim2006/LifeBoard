import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getCurrentWeekPlan, toggleTimeBlock } from '../api/plannerApi';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';

export const PlannerPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['planner', 'current-week'],
    queryFn: getCurrentWeekPlan,
  });

  const toggleMutation = useMutation({
    mutationFn: toggleTimeBlock,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['planner', 'current-week'] }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('planner.title')}</h1>
      <Card title={t('planner.current.week')}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)]" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              {t('planner.week.starting', {
                date: new Date(data.weekStartDate).toLocaleDateString(),
              })}
            </p>
            <div className="space-y-3">
              {data.timeBlocks?.length ? (
                data.timeBlocks.map((block: any) => (
                  <div key={block.id} className="rounded-3xl border border-[var(--border)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-[var(--foreground)]">{block.title}</h2>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {block.dayOfWeek}, {block.startTime} – {block.endTime}
                        </p>
                      </div>
                      <Button variant="ghost" onClick={() => toggleMutation.mutate(block.id)} disabled={toggleMutation.isPending}>
                        {block.isCompleted ? t('planner.incomplete') : t('planner.complete')}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">{t('planner.empty')}</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">{t('planner.nodata')}</p>
        )}
      </Card>
    </div>
  );
};
