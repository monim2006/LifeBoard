import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Clock, Moon, Droplets, Dumbbell, Utensils, Plus,
  Brain, Heart, Smile, Meh, Frown,
  ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';
import { getDay, updateDay, createEvent, deleteEvent, createMeal, deleteMeal } from '../api/dailyApi';
import { getHabits, logHabit } from '../../habits/api/habitsApi';
import { getCategories } from '../../categories/api/categoriesApi';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';

const MOODS = [
  { value: 2, icon: Frown, color: 'text-red-500', bg: 'bg-red-500/10' },
  { value: 4, icon: Meh, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { value: 6, icon: Smile, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { value: 8, icon: Heart, color: 'text-green-500', bg: 'bg-green-500/10' },
  { value: 10, icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export const DailyPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', startTime: '', category: '' });
  const [newMeal, setNewMeal] = useState({ type: 'breakfast' as typeof MEAL_TYPES[number], name: '' });

  const isToday = currentDate === new Date().toISOString().split('T')[0];

  const { data: day, isLoading } = useQuery({
    queryKey: ['daily', currentDate],
    queryFn: () => getDay(currentDate),
  });

  const { data: habits } = useQuery({
    queryKey: ['habits'],
    queryFn: getHabits,
  });

  const { data: timelineCategories } = useQuery({
    queryKey: ['categories', 'timeline'],
    queryFn: () => getCategories('timeline'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateDay(currentDate, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily', currentDate] }),
  });

  const eventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['daily', currentDate] }); setShowAddEvent(false); setNewEvent({ title: '', startTime: '', category: '' }); },
  });

  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily', currentDate] }),
  });

  const mealMutation = useMutation({
    mutationFn: createMeal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily', currentDate] }),
  });

  const deleteMealMutation = useMutation({
    mutationFn: deleteMeal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['daily', currentDate] }),
  });

  const habitLogMutation = useMutation({
    mutationFn: logHabit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] }),
  });

  const navigateDay = (offset: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const dateDisplay = new Date(currentDate + 'T12:00:00');
  const dayName = dateDisplay.toLocaleDateString(undefined, { weekday: 'long' });
  const dateFormatted = dateDisplay.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">{t('daily.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={() => navigateDay(-1)} className="rounded-full p-2 hover:bg-[var(--secondary)]">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
            {dayName}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {dateFormatted}
            {isToday && <span className="ml-2 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-500">Today</span>}
          </p>
        </div>
        <button onClick={() => navigateDay(1)} className="rounded-full p-2 hover:bg-[var(--secondary)]">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <div className="rounded-2xl bg-[var(--secondary)] p-3">
          <p className="mb-2 text-xs font-medium text-[var(--muted-foreground)]">{t('daily.mood')}</p>
          <div className="flex gap-1">
            {MOODS.map((m) => {
              const Icon = m.icon;
              const active = day?.mood === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => updateMutation.mutate({ mood: m.value })}
                  className={`rounded-lg p-1.5 transition ${active ? `${m.bg} ${m.color}` : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--secondary)] p-3">
          <p className="mb-2 text-xs font-medium text-[var(--muted-foreground)]">{t('daily.energy')}</p>
          <div className="flex gap-1">
            {[2, 4, 6, 8, 10].map((e) => (
              <button
                key={e}
                onClick={() => updateMutation.mutate({ energy: e })}
                className={`h-6 w-6 rounded-lg text-xs font-medium transition ${day?.energy && day.energy >= e ? 'bg-amber-500 text-white' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
              >
                {e / 2}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--secondary)] p-3">
          <p className="mb-2 text-xs font-medium text-[var(--muted-foreground)]">{t('daily.water')}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateMutation.mutate({ waterGlasses: Math.max(0, (day?.waterGlasses ?? 0) - 1) })}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--background)] text-xs text-[var(--muted-foreground)]"
            >
              -
            </button>
            <div className="flex items-center gap-1">
              <Droplets className={`h-4 w-4 ${(day?.waterGlasses ?? 0) > 0 ? 'text-blue-500' : 'text-[var(--muted-foreground)]'}`} />
              <span className="text-lg font-semibold text-[var(--foreground)]">{day?.waterGlasses ?? 0}</span>
            </div>
            <button
              onClick={() => updateMutation.mutate({ waterGlasses: (day?.waterGlasses ?? 0) + 1 })}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--background)] text-xs text-[var(--muted-foreground)]"
            >
              +
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--secondary)] p-3">
          <p className="mb-2 text-xs font-medium text-[var(--muted-foreground)]">{t('daily.sleep')}</p>
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-indigo-500" />
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={day?.sleepHours ?? ''}
              onChange={(e) => updateMutation.mutate({ sleepHours: parseFloat(e.target.value) || 0 })}
              className="w-14 bg-transparent text-lg font-semibold text-[var(--foreground)] outline-none"
              placeholder="0"
            />
            <span className="text-xs text-[var(--muted-foreground)]">h</span>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--secondary)] p-3">
          <p className="mb-2 text-xs font-medium text-[var(--muted-foreground)]">{t('daily.workout')}</p>
          <button
            onClick={() => updateMutation.mutate({ workout: !day?.workout })}
            className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition ${day?.workout ? 'bg-green-500 text-white' : 'text-[var(--muted-foreground)]'}`}
          >
            <Dumbbell className="h-4 w-4" />
            {day?.workout ? t('common.yes') : t('common.no')}
          </button>
        </div>

        <div className="rounded-2xl bg-[var(--secondary)] p-3">
          <p className="mb-2 text-xs font-medium text-[var(--muted-foreground)]">{t('daily.habits')}</p>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-lg font-semibold text-[var(--foreground)]">
              {habits?.filter((h: any) => h.logs?.some((l: any) => l.date.split('T')[0] === currentDate)).length ?? 0}/{habits?.length ?? 0}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card title={t('daily.timeline')}>
            <div className="space-y-1">
              {day?.timelineEvents?.length ? (
                day.timelineEvents.map((event: any, idx: number) => (
                  <div key={event.id} className="group relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium ${
                        event.category === 'meal' ? 'border-orange-500 text-orange-500' :
                        event.category === 'workout' ? 'border-green-500 text-green-500' :
                        event.category === 'work' ? 'border-blue-500 text-blue-500' :
                        'border-[var(--foreground)] text-[var(--foreground)]'
                      }`}>
                        {event.startTime.split(':')[0]}
                      </div>
                      {idx < day.timelineEvents.length - 1 && (
                        <div className="h-full w-px bg-[var(--border)]" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}
                          </p>
                          <p className="text-sm font-medium text-[var(--foreground)]">{event.title}</p>
                          {event.description && (
                            <p className="text-xs text-[var(--muted-foreground)]">{event.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteEventMutation.mutate(event.id)}
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <span className="text-xs text-red-500 hover:text-red-400">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <Clock className="mx-auto mb-2 h-8 w-8 text-[var(--muted-foreground)]" />
                  <p className="text-sm text-[var(--muted-foreground)]">{t('daily.no.events')}</p>
                </div>
              )}
            </div>

            {showAddEvent ? (
              <div className="mt-2 space-y-3 rounded-2xl border border-[var(--border)] p-4">
                <input
                  placeholder={t('daily.event.title')}
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
                  autoFocus
                />
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm text-[var(--foreground)] outline-none"
                  />
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm text-[var(--foreground)] outline-none"
                  >
                    <option value="">Category</option>
                    {timelineCategories?.map((cat: any) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (newEvent.title && newEvent.startTime) {
                        eventMutation.mutate({ date: currentDate, ...newEvent });
                      }
                    }}
                  >
                    {t('common.save')}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddEvent(false)}>
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="secondary" className="mt-4 w-full" onClick={() => setShowAddEvent(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('daily.add.event')}
              </Button>
            )}
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card title={t('daily.journal')}>
            <textarea
              value={day?.journalEntry ?? ''}
              onChange={(e) => updateMutation.mutate({ journalEntry: e.target.value })}
              placeholder={t('daily.journal.placeholder')}
              className="min-h-[160px] w-full resize-none rounded-2xl border border-[var(--border)] bg-transparent p-4 text-sm leading-relaxed text-[var(--foreground)] outline-none transition focus:border-[var(--ring)] placeholder:text-[var(--muted-foreground)]"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-[var(--muted-foreground)]">
                {(day?.journalEntry?.length ?? 0) > 0 ? `${day?.journalEntry?.length} characters` : ''}
              </span>
            </div>
          </Card>

          <Card title="Tomorrow">
            <textarea
              value={day?.tomorrowPlan ?? ''}
              onChange={(e) => updateMutation.mutate({ tomorrowPlan: e.target.value })}
              placeholder="What's on your mind for tomorrow?"
              className="min-h-[80px] w-full resize-none rounded-2xl border border-[var(--border)] bg-transparent p-4 text-sm leading-relaxed text-[var(--foreground)] outline-none transition focus:border-[var(--ring)] placeholder:text-[var(--muted-foreground)]"
            />
          </Card>

          <Card title={t('daily.meals')}>
            <div className="space-y-2">
              {day?.meals?.length ? (
                day.meals.map((meal: any) => (
                  <div key={meal.id} className="flex items-center justify-between rounded-xl bg-[var(--secondary)] px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-3 w-3 text-[var(--muted-foreground)]" />
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">{meal.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {meal.type}
                          {meal.calories ? ` · ${meal.calories} kcal` : ''}
                          {meal.time ? ` · ${meal.time}` : ''}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => deleteMealMutation.mutate(meal.id)} className="text-xs text-red-500 hover:opacity-70">Delete</button>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">{t('daily.no.meals')}</p>
              )}
            </div>

            {showAddMeal ? (
              <div className="mt-3 space-y-3 rounded-2xl border border-[var(--border)] p-4">
                <input
                  placeholder="Meal name"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
                  autoFocus
                />
                <select
                  value={newMeal.type}
                  onChange={(e) => setNewMeal({ ...newMeal, type: e.target.value as typeof MEAL_TYPES[number] })}
                  className="w-full rounded-xl border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm text-[var(--foreground)] outline-none"
                >
                  {MEAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { if (newMeal.name) mealMutation.mutate({ date: currentDate, ...newMeal }); }}>{t('common.save')}</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddMeal(false)}>{t('common.cancel')}</Button>
                </div>
              </div>
            ) : (
              <Button variant="ghost" className="mt-3 w-full" onClick={() => setShowAddMeal(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Meal
              </Button>
            )}
          </Card>

          <Card title={t('daily.habits')}>
            <div className="space-y-2">
              {habits?.length ? (
                habits.slice(0, 5).map((habit: any) => {
                  const done = habit.logs?.some((l: any) => l.date.split('T')[0] === currentDate);
                  return (
                    <button
                      key={habit.id}
                      onClick={() => habitLogMutation.mutate({ habitId: habit.id, date: currentDate })}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                        done ? 'bg-green-500/10 text-green-500' : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--secondary)]'
                      }`}
                    >
                      <span className="text-sm font-medium">{habit.name}</span>
                      <span className="text-xs">{done ? 'Done' : 'Log'}</span>
                    </button>
                  );
                })
              ) : (
                <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">{t('daily.no.habits')}</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
