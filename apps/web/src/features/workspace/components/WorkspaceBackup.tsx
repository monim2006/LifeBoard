import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Upload, Trash2, HardDrive, Clock, FileJson, Loader2, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import api from '../../../shared/lib/api';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';

interface Backup {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const WorkspaceBackup = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [restoreTarget, setRestoreTarget] = useState<Backup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Backup | null>(null);

  const { data: backups, isLoading, isError, error } = useQuery<Backup[]>({
    queryKey: ['backups'],
    queryFn: () => api.get('/workspace/backups').then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/workspace/backups'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/backups/${id}/restore`),
    onSuccess: () => {
      setRestoreTarget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/backups/${id}`),
    onSuccess: () => {
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
  });

  const handleDownload = async (backup: Backup) => {
    try {
      const res = await api.get(`/workspace/backups/${backup.id}`);
      const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.filename.endsWith('.json') ? backup.filename : `${backup.filename}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // handled by the UI state
    }
  };

  const isPending =
    createMutation.status === 'pending' ||
    restoreMutation.status === 'pending' ||
    deleteMutation.status === 'pending';

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('workspace.backup.title')}</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('workspace.backup.subtitle')}</p>
        </div>
        <Button disabled={createMutation.status === 'pending'} onClick={() => createMutation.mutate()}>
          {createMutation.status === 'pending' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          {t('workspace.backup.create')}
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
        </div>
      )}

      {isError && (
        <Card>
          <div className="flex items-center gap-3 text-[var(--destructive)]">
            <span className="text-sm">{(error as any)?.message || t('workspace.backup.loadError')}</span>
          </div>
        </Card>
      )}

      {!isLoading && !isError && (!backups || backups.length === 0) && (
        <Card>
          <div className="flex flex-col items-center gap-3 py-10">
            <HardDrive className="h-10 w-10 text-[var(--muted-foreground)]" />
            <p className="text-sm text-[var(--muted-foreground)]">{t('workspace.backup.empty')}</p>
          </div>
        </Card>
      )}

      {!isLoading && !isError && backups && backups.length > 0 && (
        <div className="space-y-3">
          {backups.map((backup) => (
            <Card key={backup.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]">
                    <FileJson className="h-5 w-5 text-[var(--foreground)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">{backup.filename}</p>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {formatSize(backup.size)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(backup.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => handleDownload(backup)}
                    className="rounded-xl p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                    title={t('workspace.backup.download')}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setRestoreTarget(backup)}
                    className="rounded-xl p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                    title={t('workspace.backup.restore')}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(backup)}
                    className="rounded-xl p-2 text-[var(--muted-foreground)] transition hover:bg-red-500/10 hover:text-red-500"
                    title={t('workspace.backup.delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Restore confirmation modal */}
      {restoreTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">{t('workspace.backup.restoreTitle')}</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {t('workspace.backup.restoreConfirm', { filename: restoreTarget.filename })}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setRestoreTarget(null)} disabled={isPending}>
                {t('workspace.backup.cancel')}
              </Button>
              <Button
                disabled={isPending}
                onClick={() => restoreMutation.mutate(restoreTarget.id)}
              >
                {restoreMutation.status === 'pending' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {t('workspace.backup.restore')}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className={clsx('w-full max-w-md', 'border-red-500/30')}>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">{t('workspace.backup.deleteTitle')}</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {t('workspace.backup.deleteConfirm', { filename: deleteTarget.filename })}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={isPending}>
                {t('workspace.backup.cancel')}
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                disabled={isPending}
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
              >
                {deleteMutation.status === 'pending' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                {t('workspace.backup.delete')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
