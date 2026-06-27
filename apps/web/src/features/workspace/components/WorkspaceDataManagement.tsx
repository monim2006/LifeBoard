import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Database,
  FileJson,
  RefreshCw,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import api from '../../../shared/lib/api';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';

const dataTypes = [
  { key: 'planner', label: 'workspace.dataManagement.planner', endpoint: '/workspace/data/planner' },
  { key: 'journal', label: 'workspace.dataManagement.journal', endpoint: '/workspace/data/journal' },
  { key: 'finance', label: 'workspace.dataManagement.finance', endpoint: '/workspace/data/finance' },
  { key: 'habits', label: 'workspace.dataManagement.habits', endpoint: '/workspace/data/habits' },
  { key: 'goals', label: 'workspace.dataManagement.goals', endpoint: '/workspace/data/goals' },
  { key: 'projects', label: 'workspace.dataManagement.projects', endpoint: '/workspace/data/projects' },
  { key: 'categories', label: 'workspace.dataManagement.categories', endpoint: '/workspace/data/categories' },
] as const;

export const WorkspaceDataManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [eraseStep, setEraseStep] = useState(0);
  const [eraseConfirmText, setEraseConfirmText] = useState('');
  const [eraseError, setEraseError] = useState('');

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const exportMutation = useMutation({
    mutationFn: () => api.get('/workspace/export', { responseType: 'blob' }),
    onSuccess: (res) => {
      const blob = new Blob([res.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifeboard-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showFeedback('success', t('workspace.dataManagement.exportSuccess'));
    },
    onError: () => {
      showFeedback('error', t('workspace.dataManagement.exportError'));
    },
  });

  const importMutation = useMutation({
    mutationFn: (data: unknown) => api.post('/workspace/import', { data }),
    onSuccess: () => {
      showFeedback('success', t('workspace.dataManagement.importSuccess'));
    },
    onError: () => {
      showFeedback('error', t('workspace.dataManagement.importError'));
    },
  });

  const deleteMutations = dataTypes.reduce(
    (acc, dt) => {
      acc[dt.key] = useMutation({
        mutationFn: () => api.delete(dt.endpoint),
        onSuccess: () => {
          setConfirmDelete(null);
          showFeedback('success', t('workspace.dataManagement.deleteSuccess', { type: t(dt.label) }));
        },
        onError: () => {
          setConfirmDelete(null);
          showFeedback('error', t('workspace.dataManagement.deleteError', { type: t(dt.label) }));
        },
      });
      return acc;
    },
    {} as Record<string, ReturnType<typeof useMutation>>,
  );

  const eraseAllMutation = useMutation({
    mutationFn: () => api.delete('/workspace/data/all'),
    onSuccess: () => {
      setEraseStep(0);
      setEraseConfirmText('');
      showFeedback('success', t('workspace.dataManagement.eraseSuccess'));
    },
    onError: () => {
      setEraseError(t('workspace.dataManagement.eraseError'));
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => api.delete('/workspace/data/all'),
    onSuccess: () => {
      navigate('/welcome');
    },
    onError: () => {
      showFeedback('error', t('workspace.dataManagement.resetError'));
    },
  });

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        importMutation.mutate(data);
      } catch {
        showFeedback('error', t('workspace.dataManagement.invalidJson'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleEraseAll = () => {
    if (eraseStep === 0) {
      setEraseStep(1);
      return;
    }
    if (eraseStep === 1) {
      if (eraseConfirmText !== 'DELETE') {
        setEraseError(t('workspace.dataManagement.typeDelete'));
        return;
      }
      setEraseError('');
      eraseAllMutation.mutate();
    }
  };

  const handleResetApp = () => {
    if (window.confirm(t('workspace.dataManagement.resetConfirm'))) {
      resetMutation.mutate();
    }
  };

  const cancelErase = () => {
    setEraseStep(0);
    setEraseConfirmText('');
    setEraseError('');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('workspace.dataManagement.title')}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('workspace.dataManagement.subtitle')}</p>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-sm ${
            feedback.type === 'success'
              ? 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]'
              : 'border-red-500/30 bg-red-500/5 text-red-500'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          {feedback.message}
        </div>
      )}

      <Card title={t('workspace.dataManagement.exportTitle')}>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">{t('workspace.dataManagement.exportDescription')}</p>
        <div className="flex justify-end">
          <Button
            variant="secondary"
            disabled={exportMutation.status === 'pending'}
            onClick={() => exportMutation.mutate()}
          >
            {exportMutation.status === 'pending' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {t('workspace.dataManagement.exportAll')}
          </Button>
        </div>
      </Card>

      <Card title={t('workspace.dataManagement.importTitle')}>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">{t('workspace.dataManagement.importDescription')}</p>
        <div className="flex justify-end">
          <label>
            <Button
              variant="secondary"
              disabled={importMutation.status === 'pending'}
              as="span"
              className="cursor-pointer"
            >
              {importMutation.status === 'pending' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {t('workspace.dataManagement.importData')}
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </Card>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-[var(--foreground)]">{t('workspace.dataManagement.dataSections')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {dataTypes.map((dt) => {
            const mutation = deleteMutations[dt.key];
            const isPending = mutation.status === 'pending';
            const isConfirming = confirmDelete === dt.key;

            return (
              <Card key={dt.key} className="border-red-500/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[var(--foreground)]">{t(dt.label)}</h3>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {t('workspace.dataManagement.deleteDescription', { type: t(dt.label) })}
                    </p>
                  </div>
                  {isConfirming ? (
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        variant="ghost"
                        className="h-9 w-9 p-0"
                        onClick={() => setConfirmDelete(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={isPending}
                        className="h-9 border-red-500/30 text-red-500 hover:bg-red-500/10"
                        onClick={() => mutation.mutate()}
                      >
                        {isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      className="h-9 w-9 shrink-0 p-0 text-red-500 hover:bg-red-500/10"
                      onClick={() => setConfirmDelete(dt.key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {eraseStep === 0 ? (
        <Card className="border-red-500/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">{t('workspace.dataManagement.eraseTitle')}</h2>
              <p className="text-sm text-[var(--muted-foreground)]">{t('workspace.dataManagement.eraseDescription')}</p>
            </div>
          </div>
          <hr className="my-5 border-[var(--border)]" />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              className="border-red-500/30 text-red-500 hover:bg-red-500/10"
              onClick={() => setEraseStep(1)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('workspace.dataManagement.eraseAll')}
            </Button>
            <Button
              variant="secondary"
              className="border-red-500/30 text-red-500 hover:bg-red-500/10"
              onClick={handleResetApp}
              disabled={resetMutation.status === 'pending'}
            >
              {resetMutation.status === 'pending' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {t('workspace.dataManagement.resetApp')}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="border-red-500/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">{t('workspace.dataManagement.confirmEraseTitle')}</h2>
              <p className="text-sm text-[var(--muted-foreground)]">{t('workspace.dataManagement.confirmEraseMessage')}</p>
            </div>
          </div>
          <hr className="my-5 border-[var(--border)]" />
          <div className="space-y-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              {t('workspace.dataManagement.typeDeletePrompt')}
            </p>
            <input
              value={eraseConfirmText}
              onChange={(e) => setEraseConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-xl border border-red-500/30 bg-[var(--card)] px-4 py-2 text-sm text-[var(--foreground)] shadow-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
            />
            {eraseError && (
              <p className="text-sm text-[var(--destructive)]">{eraseError}</p>
            )}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={cancelErase}>
                <X className="mr-2 h-4 w-4" />
                {t('workspace.dataManagement.cancel')}
              </Button>
              <Button
                type="button"
                disabled={eraseAllMutation.status === 'pending'}
                className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                onClick={handleEraseAll}
              >
                {eraseAllMutation.status === 'pending' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {t('workspace.dataManagement.confirmErase')}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
