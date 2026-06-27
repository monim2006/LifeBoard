import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, BookOpen, Search, FileText, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../../shared/lib/api';
import { Card } from '../../../shared/components/ui/Card';

type Template = {
  id: string;
  name: string;
  content: string;
};

type JournalEntry = {
  id?: string;
  date?: string;
  journalEntry?: string;
  mood?: number;
};

export const WorkspaceJournal = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const [aiSummaries, setAiSummaries] = useState(() => localStorage.getItem('journal_ai_summaries') !== 'false');
  const [defaultTemplateId, setDefaultTemplateId] = useState(() => localStorage.getItem('journal_default_template') || '');

  const [templates, setTemplates] = useState<Template[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('journal_templates') || '[]');
    } catch {
      return [];
    }
  });

  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);

  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    localStorage.setItem('journal_ai_summaries', String(aiSummaries));
  }, [aiSummaries]);

  useEffect(() => {
    localStorage.setItem('journal_default_template', defaultTemplateId);
  }, [defaultTemplateId]);

  useEffect(() => {
    localStorage.setItem('journal_templates', JSON.stringify(templates));
  }, [templates]);

  const { data: day, isLoading: dayLoading } = useQuery({
    queryKey: ['journal-entries', currentDate],
    queryFn: async () => {
      const res = await api.get(`/daily/${currentDate}`);
      return res.data.data as JournalEntry;
    },
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['journal-entries', 'search', searchQuery],
    queryFn: async () => {
      const res = await api.get('/daily', { params: { search: searchQuery } });
      return res.data.data as JournalEntry[];
    },
    enabled: searchQuery.length > 0,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', 'journal'],
    queryFn: async () => {
      const res = await api.get('/categories', { params: { type: 'journal' } });
      return res.data.data ?? [];
    },
  });

  const navigateDay = (offset: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const dateDisplay = new Date(currentDate + 'T12:00:00');

  const addTemplate = () => {
    if (!templateName.trim()) return;
    const newTemplate: Template = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      name: templateName.trim(),
      content: templateContent,
    };
    setTemplates([...templates, newTemplate]);
    setTemplateName('');
    setTemplateContent('');
    setShowTemplateForm(false);
  };

  const saveTemplateEdit = (id: string) => {
    if (!templateName.trim()) return;
    setTemplates(templates.map((t) => (t.id === id ? { ...t, name: templateName.trim(), content: templateContent } : t)));
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateContent('');
  };

  const startEditing = (template: Template) => {
    setEditingTemplate(template.id);
    setTemplateName(template.name);
    setTemplateContent(template.content);
  };

  const cancelEditing = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateContent('');
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
    setDeleteTemplateId(null);
    if (defaultTemplateId === id) setDefaultTemplateId('');
  };

  const journalEntries = searchQuery ? (searchResults ?? []) : (day ? [day] : []);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('journal.title')}</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('journal.subtitle')}</p>
      </div>

      <Card title="Journal Settings">
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-[var(--foreground)]">Enable AI summaries</span>
            <button
              onClick={() => setAiSummaries(!aiSummaries)}
              className={`relative h-6 w-11 rounded-full transition ${aiSummaries ? 'bg-[var(--foreground)]' : 'bg-[var(--border)]'}`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-[var(--card)] transition ${aiSummaries ? 'translate-x-5' : ''}`}
              />
            </button>
          </label>

          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--foreground)]">Default template</span>
            <select
              value={defaultTemplateId}
              onChange={(e) => setDefaultTemplateId(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
            >
              <option value="">None</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card title="Journal Categories">
        {!categories?.length ? (
          <p className="text-sm text-[var(--muted-foreground)]">No journal categories found.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat: any) => (
              <span
                key={cat.id}
                className="rounded-full px-3 py-1 text-sm"
                style={{ backgroundColor: cat.color ? `${cat.color}20` : 'var(--secondary)', color: cat.color ?? 'var(--foreground)' }}
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}
      </Card>

      <Card title="Templates">
        <div className="space-y-3">
          <button
            onClick={() => { setShowTemplateForm(true); setEditingTemplate(null); setTemplateName(''); setTemplateContent(''); }}
            className="flex items-center gap-2 rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Template
          </button>

          {(showTemplateForm || editingTemplate) && (
            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template name"
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
              />
              <textarea
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                placeholder="Template content..."
                rows={4}
                className="w-full resize-none rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
              />
              <div className="flex gap-2">
                {editingTemplate ? (
                  <>
                    <button
                      onClick={() => saveTemplateEdit(editingTemplate)}
                      disabled={!templateName.trim()}
                      className="flex items-center gap-1 rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:opacity-90 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" /> Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex items-center gap-1 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
                    >
                      <X className="h-4 w-4" /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={addTemplate}
                      disabled={!templateName.trim()}
                      className="flex items-center gap-1 rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:opacity-90 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" /> Create
                    </button>
                    <button
                      onClick={() => setShowTemplateForm(false)}
                      className="flex items-center gap-1 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
                    >
                      <X className="h-4 w-4" /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {templates.length === 0 ? (
            <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">No templates yet.</p>
          ) : (
            <div className="space-y-2">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                      <span className="text-sm font-medium text-[var(--foreground)]">{tpl.name}</span>
                      {tpl.id === defaultTemplateId && (
                        <span className="rounded-full bg-[var(--secondary)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">Default</span>
                      )}
                    </div>
                    {tpl.content && (
                      <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">{tpl.content}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditing(tpl)}
                      className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {deleteTemplateId === tpl.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteTemplate(tpl.id)}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-500/10"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTemplateId(null)}
                          className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteTemplateId(tpl.id)}
                        className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card title="Journal Entries">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search journal entries..."
              className="w-full rounded-xl border border-[var(--border)] bg-transparent py-2 pl-10 pr-4 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--ring)] placeholder:text-[var(--muted-foreground)]"
            />
          </div>

          {!searchQuery && (
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => navigateDay(-1)} className="rounded-full p-2 hover:bg-[var(--secondary)]">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm font-medium text-[var(--foreground)]">
                {dateDisplay.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <button onClick={() => navigateDay(1)} className="rounded-full p-2 hover:bg-[var(--secondary)]">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {dayLoading || searchLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)]" />
            </div>
          ) : journalEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <BookOpen className="mb-2 h-10 w-10 text-[var(--muted-foreground)]" />
              <p className="text-sm text-[var(--muted-foreground)]">
                {searchQuery ? 'No matching entries found.' : 'No journal entry for this day.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {journalEntries.map((entry, idx) => (
                <button
                  key={entry.id ?? idx}
                  onClick={() => setSelectedEntry(entry)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left transition hover:bg-[var(--secondary)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {entry.date ? new Date(entry.date + 'T12:00:00').toLocaleDateString() : currentDate}
                    </span>
                    {entry.mood != null && (
                      <span className="text-xs text-[var(--muted-foreground)]">Mood: {entry.mood}/10</span>
                    )}
                  </div>
                  {entry.journalEntry && (
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--muted-foreground)]">{entry.journalEntry}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {selectedEntry.date ? new Date(selectedEntry.date + 'T12:00:00').toLocaleDateString() : currentDate}
              </h2>
              <button
                onClick={() => setSelectedEntry(null)}
                className="rounded-lg p-1 text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {selectedEntry.mood != null && (
              <p className="mb-3 text-sm text-[var(--muted-foreground)]">Mood: {selectedEntry.mood}/10</p>
            )}
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
              {selectedEntry.journalEntry || 'No content.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
