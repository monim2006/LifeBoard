import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../../shared/store/themeStore';
import { Sun, Moon, Monitor, Palette, Type, Check, Loader2 } from 'lucide-react';
import api from '../../../shared/lib/api';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';

type ThemePreference = 'light' | 'dark' | 'system';
type FontSize = 'small' | 'medium' | 'large';

const themeOptions: { value: ThemePreference; icon: typeof Sun; labelKey: string }[] = [
  { value: 'light', icon: Sun, labelKey: 'theme.light' },
  { value: 'dark', icon: Moon, labelKey: 'theme.dark' },
  { value: 'system', icon: Monitor, labelKey: 'workspace.appearance.system' },
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'العربية' },
];

const fontSizes: { value: FontSize; labelKey: string }[] = [
  { value: 'small', labelKey: 'workspace.appearance.fontSizeSmall' },
  { value: 'medium', labelKey: 'workspace.appearance.fontSizeMedium' },
  { value: 'large', labelKey: 'workspace.appearance.fontSizeLarge' },
];

const previewCard = (theme: ThemePreference) => {
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  return (
    <div className={`space-y-2 rounded-xl p-3 transition-all ${isDark ? 'bg-neutral-900 text-neutral-100' : 'bg-white text-neutral-900'}`}>
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} />
        <div className={`h-1.5 w-16 rounded ${isDark ? 'bg-neutral-700' : 'bg-neutral-200'}`} />
        <div className={`ml-auto h-1.5 w-8 rounded ${isDark ? 'bg-neutral-700' : 'bg-neutral-200'}`} />
      </div>
      <div className={`h-6 rounded-lg ${isDark ? 'bg-neutral-800' : 'bg-neutral-100'}`} />
      <div className="flex gap-1">
        <div className={`h-3 flex-1 rounded ${isDark ? 'bg-neutral-700' : 'bg-neutral-200'}`} />
        <div className={`h-3 w-6 rounded ${isDark ? 'bg-blue-500' : 'bg-blue-500'}`} />
      </div>
    </div>
  );
};

export const WorkspaceAppearance = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { setTheme } = useThemeStore();

  const [themePref, setThemePref] = useState<ThemePreference>('system');
  const [language, setLanguage] = useState('en');
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [compactMode, setCompactMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/workspace/profile').then((r) => r.data.data),
    onSuccess: (data: any) => {
      if (data) {
        setThemePref(data.theme || 'system');
        setLanguage(data.language || 'en');
      }
    },
  } as any);

  const updateMutation = useMutation({
    mutationFn: (data: { theme: ThemePreference; language: string }) =>
      api.put('/workspace/profile', data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      const resolved = themePref === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : themePref;
      setTheme(resolved);
      i18n.changeLanguage(language);
      setSuccessMessage(t('workspace.appearance.saved'));
      setTimeout(() => setSuccessMessage(''), 3000);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ theme: themePref, language });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('workspace.appearance.title')}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('workspace.appearance.subtitle')}</p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] shadow-sm">
          <Check className="h-4 w-4 text-green-500" />
          {successMessage}
        </div>
      )}

      <Card title={t('workspace.appearance.theme')}>
        <div className="grid gap-4 sm:grid-cols-3">
          {themeOptions.map(({ value, icon: Icon, labelKey }) => (
            <button
              key={value}
              onClick={() => setThemePref(value)}
              className={`group relative rounded-2xl border-2 p-4 text-left transition ${
                themePref === value
                  ? 'border-[var(--foreground)] bg-[var(--accent)]'
                  : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--muted-foreground)]'
              }`}
            >
              {themePref === value && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--foreground)] text-[var(--background)]">
                  <Check className="h-3 w-3" />
                </span>
              )}
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-[var(--foreground)]" />
                <span className="text-sm font-medium text-[var(--foreground)]">{t(labelKey)}</span>
              </div>
              <div className="mt-3">{previewCard(value)}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card title={t('workspace.appearance.language')}>
        <div className="flex flex-wrap gap-3">
          {languages.map((l) => (
            <button
              key={l.value}
              onClick={() => setLanguage(l.value)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                language === l.value
                  ? 'border-[var(--foreground)] bg-[var(--accent)] text-[var(--foreground)]'
                  : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {language === l.value && <Check className="h-4 w-4" />}
              {l.label}
            </button>
          ))}
        </div>
      </Card>

      <Card title={t('workspace.appearance.fontSize')}>
        <div className="flex flex-wrap gap-3">
          {fontSizes.map(({ value, labelKey }) => (
            <button
              key={value}
              onClick={() => setFontSize(value)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                fontSize === value
                  ? 'border-[var(--foreground)] bg-[var(--accent)] text-[var(--foreground)]'
                  : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {fontSize === value && <Check className="h-4 w-4" />}
              <Type className="h-4 w-4" />
              {t(labelKey)}
            </button>
          ))}
        </div>
      </Card>

      <Card title={t('workspace.appearance.compactMode')}>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted-foreground)]">{t('workspace.appearance.compactModeDesc')}</p>
          <button
            role="switch"
            aria-checked={compactMode}
            onClick={() => setCompactMode(!compactMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              compactMode ? 'bg-[var(--foreground)]' : 'bg-[var(--border)]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-[var(--card)] transition ${
                compactMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </Card>

      <Card title={t('workspace.appearance.preview')}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]">
              <Sun className="h-5 w-5 text-[var(--foreground)]" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="h-3 w-32 rounded bg-[var(--border)]" />
              <div className="h-2 w-20 rounded bg-[var(--border)]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-16 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
              <div className="mb-1 h-2 w-12 rounded bg-[var(--border)]" />
              <div className="h-2 w-8 rounded bg-[var(--muted-foreground)] opacity-50" />
            </div>
            <div className="h-16 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
              <div className="mb-1 h-2 w-12 rounded bg-[var(--border)]" />
              <div className="h-2 w-8 rounded bg-[var(--muted-foreground)] opacity-50" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 flex-1 rounded-lg bg-[var(--foreground)]" />
            <div className="h-8 w-16 rounded-lg border border-[var(--border)]" />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateMutation.status === 'pending'}>
          {updateMutation.status === 'pending' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Palette className="mr-2 h-4 w-4" />
          )}
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
};
