import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertTriangle, Trash2, Shield, Check, X, Loader2 } from 'lucide-react';
import api from '../../../shared/lib/api';
import { useAuth } from '../../../shared/hooks/useAuth';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';

export const WorkspaceSecurity = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const passwordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.post('/workspace/change-password', data),
    onSuccess: () => {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordError('');
      setPasswordSuccess(t('workspace.security.passwordUpdated'));
      setTimeout(() => setPasswordSuccess(''), 3000);
    },
    onError: () => {
      setPasswordError(t('workspace.security.passwordError'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (data: { password: string }) =>
      api.delete('/workspace/account', { data }),
    onSuccess: async () => {
      await logout();
      navigate('/auth');
    },
    onError: () => {
      setDeleteError(t('workspace.security.deleteError'));
    },
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError(t('workspace.security.required'));
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError(t('workspace.security.passwordLength'));
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(t('workspace.security.passwordsDontMatch'));
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const handleStartDeletion = () => {
    if (!deletePassword) {
      setDeleteError(t('workspace.security.deletePasswordRequired'));
      return;
    }
    setDeleteError('');
    setDeleteStep(1);
  };

  const handleConfirmDeletion = () => {
    setDeleteStep(2);
  };

  const handleFinalDeletion = () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError(t('workspace.security.typeDelete'));
      return;
    }
    setDeleteError('');
    deleteMutation.mutate({ password: deletePassword });
  };

  const handleCancelDeletion = () => {
    setDeleteStep(0);
    setDeleteConfirmText('');
    setDeletePassword('');
    setDeleteError('');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('workspace.security.title')}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('workspace.security.subtitle')}</p>
      </div>

      {passwordSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] shadow-sm">
          <Check className="h-4 w-4 text-green-500" />
          {passwordSuccess}
        </div>
      )}

      <Card title={t('workspace.security.changePassword')}>
        <form onSubmit={handleChangePassword} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                <Lock className="mr-1.5 inline h-4 w-4" />
                {t('workspace.security.currentPassword')}
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
                {t('workspace.security.newPassword')}
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
                {t('workspace.security.confirmPassword')}
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
              {t('workspace.security.changePassword')}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="border-red-500/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">{t('workspace.security.dangerZone')}</h2>
            <p className="text-sm text-[var(--muted-foreground)]">{t('workspace.security.dangerSubtitle')}</p>
          </div>
        </div>

        <hr className="my-5 border-[var(--border)]" />

        {deleteStep === 0 && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                <Shield className="mr-1.5 inline h-4 w-4" />
                {t('workspace.security.confirmPasswordLabel')}
              </label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder={t('workspace.security.enterPassword')}
                className="border-red-500/30 focus:border-red-500 focus:ring-red-500/30"
              />
            </div>
            {deleteError && (
              <p className="text-sm text-[var(--destructive)]">{deleteError}</p>
            )}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                onClick={handleStartDeletion}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('workspace.security.deleteAccount')}
              </Button>
            </div>
          </div>
        )}

        {deleteStep === 1 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <p className="font-medium text-red-500">{t('workspace.security.confirmTitle')}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('workspace.security.confirmMessage')}</p>
                </div>
              </div>
            </div>
            {deleteError && (
              <p className="text-sm text-[var(--destructive)]">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={handleCancelDeletion}>
                <X className="mr-2 h-4 w-4" />
                {t('workspace.security.cancel')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                onClick={handleConfirmDeletion}
              >
                {t('workspace.security.understandDelete')}
              </Button>
            </div>
          </div>
        )}

        {deleteStep === 2 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <p className="font-medium text-red-500">{t('workspace.security.finalWarning')}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('workspace.security.finalMessage')}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                {t('workspace.security.typeDeletePrompt')}
              </label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="border-red-500/30 focus:border-red-500 focus:ring-red-500/30"
              />
            </div>
            {deleteError && (
              <p className="text-sm text-[var(--destructive)]">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={handleCancelDeletion}>
                <X className="mr-2 h-4 w-4" />
                {t('workspace.security.cancel')}
              </Button>
              <Button
                type="button"
                disabled={deleteMutation.status === 'pending'}
                className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                onClick={handleFinalDeletion}
              >
                {deleteMutation.status === 'pending' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {t('workspace.security.permanentlyDelete')}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
