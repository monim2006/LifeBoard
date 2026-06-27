import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Save, Camera, Lock, User, Mail, Globe, DollarSign, Clock, CalendarDays, Palette, Check, Loader2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import api from '../../../shared/lib/api';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';

interface Profile {
  id: string;
  username: string;
  email: string;
  language: string;
  currency: string;
  timezone: string;
  weekStartDay: string;
  theme: string;
  avatar?: string;
}

const languages = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'العربية' },
];

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'MAD', 'other'];

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Dubai',
  'Africa/Casablanca',
];

const weekStartDays = ['Monday', 'Sunday'];

const themes = ['light', 'dark', 'system'];

export const WorkspaceProfile = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    username: '',
    email: '',
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    weekStartDay: 'Monday',
    theme: 'system',
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarInput, setAvatarInput] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/workspace/profile').then((r) => r.data.data),
  });

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username || '',
        email: profile.email || '',
        language: profile.language || 'en',
        currency: profile.currency || 'USD',
        timezone: profile.timezone || 'UTC',
        weekStartDay: profile.weekStartDay || 'Monday',
        theme: profile.theme || 'system',
      });
      setAvatarUrl(profile.avatar || '');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Profile>) =>
      api.put('/workspace/profile', data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSuccessMessage(t('workspace.profile.updated'));
      setTimeout(() => setSuccessMessage(''), 3000);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.post('/workspace/change-password', data),
    onSuccess: () => {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordError('');
      setSuccessMessage(t('workspace.profile.passwordUpdated'));
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: () => {
      setPasswordError(t('workspace.profile.passwordError'));
    },
  });

  const avatarMutation = useMutation({
    mutationFn: (avatar: string) =>
      api.post('/workspace/avatar', { avatar }).then((r) => r.data.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setAvatarUrl(data?.avatar || avatarInput);
      setAvatarInput('');
      setSuccessMessage(t('workspace.profile.avatarUpdated'));
      setTimeout(() => setSuccessMessage(''), 3000);
    },
  });

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.username.trim()) errors.username = t('workspace.profile.required');
    if (!form.email.trim()) errors.email = t('workspace.profile.required');
    else if (!validateEmail(form.email)) errors.email = t('workspace.profile.invalidEmail');
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    updateMutation.mutate(form);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError(t('workspace.profile.required'));
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError(t('workspace.profile.passwordLength'));
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(t('workspace.profile.passwordsDontMatch'));
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const handleAvatarUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarInput.trim()) return;
    avatarMutation.mutate(avatarInput.trim());
  };

  const selectClassName =
    'w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--foreground)] shadow-sm outline-none transition focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <AlertCircle className="h-10 w-10 text-[var(--destructive)]" />
        <p className="text-sm text-[var(--destructive)]">
          {t('workspace.profile.loadError')}: {(error as any)?.message}
        </p>
        <Button variant="secondary" onClick={() => queryClient.invalidateQueries({ queryKey: ['profile'] })}>
          {t('workspace.profile.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('workspace.profile.title')}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('workspace.profile.subtitle')}</p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] shadow-sm">
          <Check className="h-4 w-4 text-green-500" />
          {successMessage}
        </div>
      )}

      <Card title={t('workspace.profile.avatarSection')}>
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--border)] bg-[var(--accent)]">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-[var(--muted-foreground)]" />
            )}
          </div>
          <form onSubmit={handleAvatarUpload} className="flex flex-1 gap-3">
            <Input
              type="url"
              placeholder={t('workspace.profile.avatarPlaceholder')}
              value={avatarInput}
              onChange={(e) => setAvatarInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="secondary" disabled={avatarMutation.status === 'pending'}>
              {avatarMutation.status === 'pending' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </Card>

      <Card title={t('workspace.profile.profileDetails')}>
        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                <User className="mr-1.5 inline h-4 w-4" />
                {t('workspace.profile.username')}
              </label>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              {formErrors.username && (
                <p className="mt-1 text-xs text-[var(--destructive)]">{formErrors.username}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                <Mail className="mr-1.5 inline h-4 w-4" />
                {t('workspace.profile.email')}
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {formErrors.email && (
                <p className="mt-1 text-xs text-[var(--destructive)]">{formErrors.email}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                <Globe className="mr-1.5 inline h-4 w-4" />
                {t('workspace.profile.language')}
              </label>
              <select
                className={selectClassName}
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
              >
                {languages.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                <DollarSign className="mr-1.5 inline h-4 w-4" />
                {t('workspace.profile.currency')}
              </label>
              <select
                className={selectClassName}
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                <Clock className="mr-1.5 inline h-4 w-4" />
                {t('workspace.profile.timezone')}
              </label>
              <select
                className={selectClassName}
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                <CalendarDays className="mr-1.5 inline h-4 w-4" />
                {t('workspace.profile.weekStartDay')}
              </label>
              <select
                className={selectClassName}
                value={form.weekStartDay}
                onChange={(e) => setForm({ ...form, weekStartDay: e.target.value })}
              >
                {weekStartDays.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                <Palette className="mr-1.5 inline h-4 w-4" />
                {t('workspace.profile.theme')}
              </label>
              <select
                className={selectClassName}
                value={form.theme}
                onChange={(e) => setForm({ ...form, theme: e.target.value })}
              >
                {themes.map((th) => (
                  <option key={th} value={th}>{th.charAt(0).toUpperCase() + th.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={updateMutation.status === 'pending'}>
              {updateMutation.status === 'pending' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {t('workspace.profile.saveChanges')}
            </Button>
          </div>
        </form>
      </Card>

      <Card title={t('workspace.profile.changePassword')}>
        <form onSubmit={handleChangePassword} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                <Lock className="mr-1.5 inline h-4 w-4" />
                {t('workspace.profile.currentPassword')}
              </label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                <Lock className="mr-1.5 inline h-4 w-4" />
                {t('workspace.profile.newPassword')}
              </label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                <Lock className="mr-1.5 inline h-4 w-4" />
                {t('workspace.profile.confirmPassword')}
              </label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          {passwordError && (
            <p className="text-sm text-[var(--destructive)]">{passwordError}</p>
          )}
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="secondary" disabled={passwordMutation.status === 'pending'}>
              {passwordMutation.status === 'pending' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              {t('workspace.profile.changePassword')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
