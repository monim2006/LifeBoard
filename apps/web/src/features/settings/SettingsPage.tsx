import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../shared/store/themeStore';
import { Card } from '../../shared/components/ui/Card';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
];

export const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('settings.subtitle')}</p>
      </div>

      <div className="space-y-6">
        <Card title="Appearance">
          <div className="space-y-4">
            <div>
              <p className="mb-3 text-sm font-medium text-[var(--foreground)]">{t('theme.light')} / {t('theme.dark')}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`rounded-2xl border-2 px-6 py-3 text-sm font-medium transition ${
                    theme === 'light'
                      ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]'
                      : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {t('theme.light')}
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`rounded-2xl border-2 px-6 py-3 text-sm font-medium transition ${
                    theme === 'dark'
                      ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]'
                      : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {t('theme.dark')}
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card title={t('language')}>
          <div className="flex flex-wrap gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  document.documentElement.dir = lang.code === 'ar' ? 'rtl' : 'ltr';
                  localStorage.setItem('i18nextLng', lang.code);
                }}
                className={`rounded-2xl border-2 px-6 py-3 text-sm font-medium transition ${
                  i18n.language === lang.code
                    ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]'
                    : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
