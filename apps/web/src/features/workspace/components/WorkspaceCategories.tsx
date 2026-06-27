import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Archive, RotateCcw, X, Check, Palette } from 'lucide-react';
import api from '../../../shared/lib/api';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#78716c'];

const TYPES = ['task', 'expense', 'income', 'project', 'goal', 'habit', 'meal', 'journal', 'note', 'timeline'] as const;

type Category = {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string;
  archived: boolean;
};

export const WorkspaceCategories = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [newType, setNewType] = useState<string>('task');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories', typeFilter],
    queryFn: async () => {
      const res = await api.get('/categories', { params: typeFilter ? { type: typeFilter } : {} });
      return res.data;
    },
  });

  const queryClientInvalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const createMutation = useMutation({
    mutationFn: (body: { name: string; type: string; color: string; icon: string }) => api.post('/categories', body),
    onSuccess: () => { queryClientInvalidate(); setShowAddForm(false); setNewName(''); setNewColor(COLORS[0]); setNewType('task'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; color?: string; archived?: boolean }) => api.put(`/categories/${id}`, body),
    onSuccess: () => queryClientInvalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => { queryClientInvalidate(); setDeleteId(null); },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/categories/${id}/archive`),
    onSuccess: () => queryClientInvalidate(),
  });

  const categories: Category[] = data?.data ?? [];

  const startEditing = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      updateMutation.mutate({ id, name: editName.trim() });
    }
    setEditingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-red-500">{t('common.error')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('workspace.categories.title')}</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('workspace.categories.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {t('workspace.categories.add')}
        </button>
      </div>

      {showAddForm && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.categories.name')}</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                placeholder={t('workspace.categories.namePlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.categories.type')}</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
              >
                {TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.categories.color')}</label>
              <div className="flex gap-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={`h-6 w-6 rounded-full transition ${newColor === c ? 'ring-2 ring-[var(--foreground)] ring-offset-2 ring-offset-[var(--card)]' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                if (newName.trim()) {
                  createMutation.mutate({ name: newName.trim(), type: newType, color: newColor, icon: '' });
                }
              }}
              disabled={!newName.trim() || createMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:opacity-90 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {t('common.save')}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTypeFilter('')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${typeFilter === '' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
        >
          {t('common.all')}
        </button>
        {TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${typeFilter === type ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
          >
            {type}
          </button>
        ))}
      </div>

      {categories.length === 0 ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <p className="text-sm text-[var(--muted-foreground)]">{t('workspace.categories.empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 transition ${cat.archived ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                {editingId === cat.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                    />
                    <button onClick={() => saveEdit(cat.id)} className="text-green-500 hover:text-green-400"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditingId(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium text-[var(--foreground)]">{cat.name}</span>
                    <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs capitalize text-[var(--muted-foreground)]">{cat.type}</span>
                    {cat.archived && (
                      <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-500">
                        {t('workspace.categories.archived')}
                      </span>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-1">
                {showColorPicker === cat.id ? (
                  <div className="flex items-center gap-1">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          updateMutation.mutate({ id: cat.id, color: c });
                          setShowColorPicker(null);
                        }}
                        className={`h-5 w-5 rounded-full transition ${cat.color === c ? 'ring-2 ring-[var(--foreground)]' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <button onClick={() => setShowColorPicker(null)} className="ml-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"><X className="h-3 w-3" /></button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                      className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                      title={t('common.edit')}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowColorPicker(cat.id)}
                      className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                      title={t('workspace.categories.changeColor')}
                    >
                      <Palette className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => archiveMutation.mutate(cat.id)}
                      className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-yellow-500"
                      title={cat.archived ? t('workspace.categories.restore') : t('workspace.categories.archive')}
                    >
                      {cat.archived ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                    </button>
                    {deleteId === cat.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteMutation.mutate(cat.id)}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-500/10"
                          title={t('common.confirm')}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                          title={t('common.cancel')}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteId(cat.id)}
                        className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-red-500"
                        title={t('common.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
