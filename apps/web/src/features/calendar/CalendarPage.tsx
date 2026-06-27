import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const CalendarPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const today = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isToday = (day: number) => {
    return year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
  };

  const goToDay = (day: number) => {
    const d = new Date(year, month, day);
    navigate(`/today?date=${d.toISOString().split('T')[0]}`);
  };

  const weeks: number[][] = [];
  let days: number[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push(-(daysInPrevMonth - i));
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(i);
  }

  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('calendar.title')}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('calendar.subtitle')}</p>
      </div>

      <div className="rounded-3xl border border-[var(--border)] p-6">
        <div className="mb-6 flex items-center justify-between">
          <button onClick={prevMonth} className="rounded-full p-2 hover:bg-[var(--secondary)]">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} className="rounded-full p-2 hover:bg-[var(--secondary)]">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day) => (
            <div key={day} className="py-2 text-center text-xs font-medium text-[var(--muted-foreground)]">
              {day}
            </div>
          ))}
          {weeks.flat().map((day, idx) => {
            const isCurrentMonth = day > 0 && day <= daysInMonth;
            const isTodayDay = isCurrentMonth && isToday(day);
            return (
              <button
                key={idx}
                onClick={() => isCurrentMonth && goToDay(day)}
                disabled={!isCurrentMonth}
                className={`aspect-square rounded-xl text-sm font-medium transition ${
                  isTodayDay
                    ? 'bg-[var(--foreground)] text-[var(--background)]'
                    : isCurrentMonth
                    ? 'text-[var(--foreground)] hover:bg-[var(--secondary)]'
                    : 'text-[var(--muted-foreground)] opacity-30'
                }`}
              >
                {Math.abs(day)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
