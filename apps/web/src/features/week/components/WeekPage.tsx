import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Settings, LayoutDashboard } from 'lucide-react';
import { getCurrentWeekPlan, toggleTimeBlock } from '../../planner/api/plannerApi';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';

export const WeekPage = () => {
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
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('week.title')}</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('week.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/workspace/planner">
            <Button variant="secondary">
              <Settings className="mr-2 h-4 w-4" /> {t('week.manage')}
            </Button>
          </Link>
          <Link to="/workspace/categories">
            <Button variant="ghost">
              <LayoutDashboard className="mr-2 h-4 w-4" /> {t('week.manageCategories')}
            </Button>
          </Link>
        </div>
      </div>

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
                          {block.dayOfWeek}, {block.startTime} &ndash; {block.endTime}
                        </p>
                        <span className="text-xs text-[var(--muted-foreground)]">{block.category}</span>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => toggleMutation.mutate(block.id)}
                        disabled={toggleMutation.isPending}
                      >
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
