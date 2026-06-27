import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../shared/hooks/useAuth';
import {
  CalendarDays, TrendingDown, Flame, ArrowRight,
  Droplets, Moon, Dumbbell, ListTodo, Sparkles, BarChart3,
  Target, FolderKanban, Wallet, Clock, CheckCircle2, Lightbulb,
  TrendingUp
} from 'lucide-react';
import { getToday } from '../../daily/api/dailyApi';
import { getHabits } from '../../habits/api/habitsApi';
import { getWeeklyTotal } from '../../finance/api/financeApi';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import api from '../../../shared/lib/api';

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  const { data: day, isLoading: dayLoading } = useQuery({ queryKey: ['daily', today], queryFn: getToday });
  const { data: habits, isLoading: habitsLoading } = useQuery({ queryKey: ['habits'], queryFn: getHabits });
  const { data: weeklyExpenses, isLoading: financeLoading } = useQuery({ queryKey: ['expenses', 'weekly'], queryFn: getWeeklyTotal });
  const { data: goals } = useQuery({ queryKey: ['goals'], queryFn: () => api.get('/goals').then(r => r.data.data) });
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => api.get('/projects').then(r => r.data.data) });
  const { data: todayExpenses } = useQuery({ queryKey: ['expenses', 'today'], queryFn: () => api.get('/expenses/today').then(r => r.data.data) });
  const { data: analytics } = useQuery({ queryKey: ['analytics', 'overview'], queryFn: () => api.get('/analytics/overview').then(r => r.data.data) });

  const isLoading = dayLoading || habitsLoading || financeLoading;

  const completedHabits = habits?.filter((h: any) =>
    h.logs?.some((l: any) => l.date.split('T')[0] === today)
  ).length ?? 0;

  const activeGoals = goals?.filter((g: any) => g.status === 'active').length ?? 0;
  const activeProjects = projects?.filter((p: any) => p.status === 'active').length ?? 0;
  const todayEvents = day?.timelineEvents?.length ?? 0;
  const todayExpensesTotal = todayExpenses?.total ?? todayExpenses?.reduce?.((sum: number, e: any) => sum + Number(e.amount), 0) ?? 0;

  const quickActions = [
    { label: t('nav.today'), path: '/today', icon: CalendarDays },
    { label: t('expenses.add'), path: '/finance', icon: TrendingDown },
    { label: t('habits.log'), path: '/habits', icon: Flame },
    { label: t('nav.analytics'), path: '/analytics', icon: BarChart3 },
  ];

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
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
            {t('dashboard.welcome')}, {user?.username}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('dashboard.desc')}</p>
        </div>
        <div className="hidden items-center gap-2 rounded-2xl bg-[var(--secondary)] px-4 py-2 sm:flex">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">Level {user?.level ?? 1} &middot; {user?.xp ?? 0} XP</span>
        </div>
      </div>

      {/* Today's Progress */}
      <Card title={t('dashboard.progress')}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-[var(--secondary)] p-4">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Droplets className="h-4 w-4 text-blue-500" />
              {t('daily.water')}
            </div>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{day?.waterGlasses ?? 0} <span className="text-sm font-normal text-[var(--muted-foreground)]">{t('daily.water')}</span></p>
          </div>
          <div className="rounded-2xl bg-[var(--secondary)] p-4">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Moon className="h-4 w-4 text-indigo-500" />
              {t('daily.sleep')}
            </div>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{day?.sleepHours ?? '--'} <span className="text-sm font-normal text-[var(--muted-foreground)]">{t('daily.sleep')}</span></p>
          </div>
          <div className="rounded-2xl bg-[var(--secondary)] p-4">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Dumbbell className="h-4 w-4 text-green-500" />
              {t('daily.workout')}
            </div>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{day?.workout ? t('common.yes') : t('common.no')}</p>
          </div>
          <div className="rounded-2xl bg-[var(--secondary)] p-4">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <ListTodo className="h-4 w-4 text-amber-500" />
              {t('daily.habits')}
            </div>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{completedHabits}/{habits?.length ?? 0}</p>
          </div>
        </div>
      </Card>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Today's Timeline */}
          <Card title={t('dashboard.todayTimeline')}>
            {todayEvents > 0 ? (
              <div className="space-y-2">
                {day?.timelineEvents?.slice(0, 5).map((event: any) => (
                  <div key={event.id} className="flex items-center gap-3 rounded-xl bg-[var(--secondary)] p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: event.color || 'var(--secondary)' }}>
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{event.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</p>
                    </div>
                  </div>
                ))}
                <Link to="/today">
                  <Button variant="ghost" className="w-full text-sm">{t('dashboard.viewAll')} <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
              </div>
            ) : (
              <div className="py-6 text-center">
                <Clock className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t('dashboard.empty.timeline')}</p>
                <Link to="/today"><Button variant="ghost" className="mt-2">{t('dashboard.addQuick')}</Button></Link>
              </div>
            )}
          </Card>

          {/* Today's Expenses */}
          <Card title={t('dashboard.todayExpenses')}>
            {todayExpensesTotal > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-[var(--secondary)] p-4">
                  <span className="text-sm text-[var(--muted-foreground)]">{t('expenses.title')}</span>
                  <span className="text-lg font-semibold text-[var(--foreground)]">${Number(todayExpensesTotal).toFixed(2)}</span>
                </div>
                <Link to="/finance">
                  <Button variant="ghost" className="w-full text-sm">{t('dashboard.viewAll')} <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
              </div>
            ) : (
              <div className="py-6 text-center">
                <Wallet className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t('dashboard.empty.expenses')}</p>
                <Link to="/finance"><Button variant="ghost" className="mt-2">{t('dashboard.addQuick')}</Button></Link>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card title={t('dashboard.quick')}>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link key={action.path} to={action.path}>
                  <Button variant="secondary" className="w-full justify-start gap-3">
                    <action.icon className="h-4 w-4" />
                    {action.label}
                    <ArrowRight className="ml-auto h-4 w-4 text-[var(--muted-foreground)]" />
                  </Button>
                </Link>
              ))}
            </div>
          </Card>

          {/* Weekly Progress */}
          <Card title={t('dashboard.weeklyProgress')}>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-[var(--secondary)] p-3">
                <span className="text-sm text-[var(--muted-foreground)]">{t('expenses.title')}</span>
                <span className="font-semibold text-[var(--foreground)]">${Number(weeklyExpenses?.total ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--secondary)] p-3">
                <span className="text-sm text-[var(--muted-foreground)]">{t('dashboard.habits')}</span>
                <span className="font-semibold text-[var(--foreground)]">{completedHabits}/{habits?.length ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[var(--secondary)] p-3">
                <span className="text-sm text-[var(--muted-foreground)]">{t('daily.mood')}</span>
                <span className="font-semibold text-[var(--foreground)]">{day?.mood ? `${day.mood}/10` : '--'}</span>
              </div>
            </div>
          </Card>

          {/* Current Projects */}
          <Card title={t('dashboard.currentProjects')}>
            {activeProjects > 0 ? (
              <div className="space-y-2">
                {projects?.filter((p: any) => p.status === 'active').slice(0, 3).map((project: any) => (
                  <div key={project.id} className="flex items-center justify-between rounded-xl bg-[var(--secondary)] p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderKanban className="h-4 w-4 shrink-0 text-blue-500" />
                      <span className="text-sm font-medium text-[var(--foreground)] truncate">{project.name}</span>
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)]">{project.tasks?.filter((t: any) => t.status === 'done').length ?? 0}/{project.tasks?.length ?? 0}</span>
                  </div>
                ))}
                <Link to="/projects"><Button variant="ghost" className="w-full text-sm">{t('dashboard.viewAll')} <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              </div>
            ) : (
              <div className="py-6 text-center">
                <FolderKanban className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t('dashboard.empty.projects')}</p>
                <Link to="/projects"><Button variant="ghost" className="mt-2">{t('dashboard.addQuick')}</Button></Link>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Habits */}
        <Card title={t('dashboard.habits')}>
          <div className="grid gap-2 sm:grid-cols-2">
            {habits?.length ? (
              habits.slice(0, 6).map((habit: any) => {
                const done = habit.logs?.some((l: any) => l.date.split('T')[0] === today);
                return (
                  <div key={habit.id} className={`flex items-center justify-between rounded-xl p-3 ${done ? 'bg-green-500/10' : 'bg-[var(--secondary)]'}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      {done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" /> : <Circle className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />}
                      <span className="text-sm font-medium text-[var(--foreground)] truncate">{habit.name}</span>
                    </div>
                    <span className={`text-xs shrink-0 ${done ? 'text-green-500' : 'text-[var(--muted-foreground)]'}`}>{done ? t('common.yes') : '--'}</span>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-6 text-center">
                <Flame className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t('dashboard.empty.habits')}</p>
                <Link to="/habits"><Button variant="ghost" className="mt-2">{t('dashboard.addQuick')}</Button></Link>
              </div>
            )}
          </div>
        </Card>

        {/* Today's Goals */}
        <Card title={t('dashboard.todayGoals')}>
          {activeGoals > 0 ? (
            <div className="space-y-3">
              {goals?.filter((g: any) => g.status === 'active').slice(0, 4).map((goal: any) => (
                <div key={goal.id} className="rounded-xl bg-[var(--secondary)] p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Target className="h-4 w-4 shrink-0 text-purple-500" />
                      <span className="text-sm font-medium text-[var(--foreground)] truncate">{goal.title}</span>
                    </div>
                    <span className="text-xs font-medium text-[var(--foreground)]">{goal.progress}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                    <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              ))}
              <Link to="/goals"><Button variant="ghost" className="w-full text-sm">{t('dashboard.viewAll')} <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            </div>
          ) : (
            <div className="py-6 text-center">
              <Target className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t('dashboard.empty.goals')}</p>
              <Link to="/goals"><Button variant="ghost" className="mt-2">{t('dashboard.addQuick')}</Button></Link>
            </div>
          )}
        </Card>
      </div>

      {/* AI Suggestions */}
      {analytics?.suggestions?.length > 0 && (
        <Card title={t('dashboard.aiSuggestions')}>
          <div className="space-y-2">
            {analytics.suggestions.slice(0, 3).map((suggestion: any, i: number) => (
              <div key={i} className="flex items-start gap-3 rounded-xl bg-[var(--secondary)] p-3">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                <p className="text-sm text-[var(--foreground)]">{suggestion}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

const Circle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
  </svg>
);
