import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Check, CheckCheck, Trash2, X, Info, AlertTriangle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../../shared/lib/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

const typeStyles: Record<string, { icon: typeof Info; color: string; bg: string; border: string }> = {
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-l-blue-500' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-l-amber-500' },
  success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-l-green-500' },
  error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-l-red-500' },
};

export const WorkspaceNotifications = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useQuery<NotificationsResponse>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onMutate: (id) => {
      setPendingIds((prev) => new Set(prev).add(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onSettled: (_, __, id) => {
      setPendingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.post('/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/${id}`);
    },
    onMutate: (id) => {
      setPendingIds((prev) => new Set(prev).add(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onSettled: (_, __, id) => {
      setPendingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/notifications');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-[var(--destructive)]">{t('common.error')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('notifications.title')}</h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('notifications.subtitle')}</p>
          </div>
          {unreadCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--secondary)] disabled:opacity-50"
            >
              {markAllReadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              {t('notifications.markAllRead')}
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => {
                if (confirm(t('notifications.clearAllConfirm'))) clearAllMutation.mutate();
              }}
              disabled={clearAllMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--destructive)] transition hover:bg-[var(--secondary)] disabled:opacity-50"
            >
              {clearAllMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {t('notifications.clearAll')}
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="py-12 text-center">
          <Bell className="mx-auto mb-4 h-12 w-12 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">{t('notifications.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const style = typeStyles[notification.type] || typeStyles.info;
            const Icon = style.icon;
            const isPending = pendingIds.has(notification.id);

            return (
              <div
                key={notification.id}
                className={`relative rounded-2xl border border-[var(--border)] bg-[var(--card)] pl-4 shadow-sm transition ${style.border} border-l-4 ${!notification.read ? 'ring-1 ring-[var(--ring)]/40' : ''} ${isPending ? 'opacity-50' : ''}`}
              >
                <div className={`flex items-start gap-4 p-4 ${style.bg} rounded-r-2xl`}>
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={`text-sm font-semibold ${!notification.read ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}>
                          {notification.title}
                        </h3>
                        <p className={`mt-0.5 text-sm ${!notification.read ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}>
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {!notification.read && (
                          <button
                            onClick={() => markReadMutation.mutate(notification.id)}
                            disabled={isPending}
                            className="rounded-xl p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-blue-600 disabled:opacity-50"
                            title={t('notifications.markRead')}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(t('notifications.deleteConfirm'))) deleteMutation.mutate(notification.id);
                          }}
                          disabled={isPending}
                          className="rounded-xl p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--destructive)] disabled:opacity-50"
                          title={t('notifications.delete')}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                      <span className="rounded-md border border-[var(--border)] px-1.5 py-0.5 text-xs capitalize">
                        {notification.type}
                      </span>
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
