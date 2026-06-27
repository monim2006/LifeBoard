import { useTranslation } from 'react-i18next';
import { Sparkles, Lightbulb, TrendingUp, CalendarDays, Target } from 'lucide-react';
import { Card } from '../../shared/components/ui/Card';

const suggestions = [
  { icon: Lightbulb, text: 'What did I do yesterday?', color: 'text-yellow-500' },
  { icon: TrendingUp, text: 'How much did I spend this month?', color: 'text-green-500' },
  { icon: CalendarDays, text: 'Plan my day based on my habits', color: 'text-blue-500' },
  { icon: Target, text: 'Suggest goals based on my progress', color: 'text-purple-500' },
];

export const AIPage = () => {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('ai.title')}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('ai.subtitle')}</p>
      </div>

      <div className="rounded-3xl border border-dashed border-[var(--border)] p-8 text-center">
        <Sparkles className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
        <h2 className="text-xl font-semibold text-[var(--foreground)]">AI Assistant</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Your intelligent life companion is being trained on your data.
          <br />
          It will soon help you analyze patterns, plan your days, and make better decisions.
        </p>
      </div>

      <Card title="Coming features">
        <div className="grid gap-4 sm:grid-cols-2">
          {suggestions.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="flex items-start gap-3 rounded-2xl bg-[var(--secondary)] p-4">
                <Icon className={`mt-0.5 h-5 w-5 ${s.color}`} />
                <p className="text-sm text-[var(--foreground)]">{s.text}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
