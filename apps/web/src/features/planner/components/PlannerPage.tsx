import { useQuery } from '@tanstack/react-query';
import { getCurrentWeekPlan, toggleTimeBlock } from '../api/plannerApi';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';

export const PlannerPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['planner', 'current-week'],
    queryFn: getCurrentWeekPlan,
  });

  const handleToggle = async (blockId: string) => {
    await toggleTimeBlock(blockId);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-slate-900">Weekly Planner</h1>
      <Card title="Current week">
        {isLoading ? (
          <p>Loading week plan…</p>
        ) : data ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Week starting {new Date(data.weekStartDate).toLocaleDateString()}
            </p>
            <div className="space-y-3">
              {data.timeBlocks?.length ? (
                data.timeBlocks.map((block: any) => (
                  <div key={block.id} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">{block.title}</h2>
                        <p className="text-sm text-slate-600">
                          {block.dayOfWeek}, {block.startTime} – {block.endTime}
                        </p>
                      </div>
                      <Button variant="ghost" onClick={() => handleToggle(block.id)}>
                        {block.isCompleted ? 'Mark incomplete' : 'Complete'}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">
                  No time blocks yet. Create your first plan to get started.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600">No planner data found.</p>
        )}
      </Card>
    </div>
  );
};
