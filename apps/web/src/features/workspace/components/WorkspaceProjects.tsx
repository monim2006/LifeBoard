import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, FolderKanban, Check, X, ChevronDown, ChevronUp, Circle } from 'lucide-react';
import api from '../../../shared/lib/api';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#78716c'];

const PROJECT_STATUSES = ['active', 'paused', 'completed', 'archived'] as const;
const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
const PRIORITIES = ['high', 'medium', 'low'] as const;

type Task = {
  id: string;
  title: string;
  description?: string;
  status: typeof TASK_STATUSES[number];
  priority: typeof PRIORITIES[number];
};

type Project = {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: typeof PROJECT_STATUSES[number];
  deadline?: string;
  goalId?: string;
  tasks: Task[];
};

export const WorkspaceProjects = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [newStatus, setNewStatus] = useState<string>('active');
  const [newDeadline, setNewDeadline] = useState('');
  const [newGoalId, setNewGoalId] = useState('');

  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editDeadline, setEditDeadline] = useState('');

  const [showTaskForm, setShowTaskForm] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<string>('medium');

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskStatus, setEditTaskStatus] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState('');
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data;
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['projects'] });

  const createMutation = useMutation({
    mutationFn: (body: { name: string; description?: string; color: string; status: string; deadline?: string; goalId?: string }) =>
      api.post('/projects', body),
    onSuccess: () => {
      invalidate();
      setShowAddForm(false);
      setNewName('');
      setNewDescription('');
      setNewColor(COLORS[0]);
      setNewStatus('active');
      setNewDeadline('');
      setNewGoalId('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; description?: string; color?: string; status?: string; deadline?: string }) =>
      api.put(`/projects/${id}`, body),
    onSuccess: () => invalidate(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => { invalidate(); setDeleteId(null); },
  });

  const addTaskMutation = useMutation({
    mutationFn: ({ projectId, ...body }: { projectId: string; title: string; description?: string; priority: string }) =>
      api.post(`/projects/${projectId}/tasks`, body),
    onSuccess: () => {
      invalidate();
      setShowTaskForm(null);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskPriority('medium');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, ...body }: { taskId: string; title?: string; status?: string; priority?: string }) =>
      api.put(`/projects/tasks/${taskId}`, body),
    onSuccess: () => { invalidate(); setEditingTaskId(null); },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => api.delete(`/projects/tasks/${taskId}`),
    onSuccess: () => { invalidate(); setDeleteTaskId(null); },
  });

  const projects: Project[] = Array.isArray(data) ? data : data?.data ?? [];

  const startEditing = (p: Project) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDescription(p.description || '');
    setEditColor(p.color);
    setEditStatus(p.status);
    setEditDeadline(p.deadline || '');
  };

  const saveEdit = (id: string) => {
    const body: Record<string, string> = {};
    if (editName.trim()) body.name = editName.trim();
    if (editDescription.trim()) body.description = editDescription.trim();
    body.color = editColor;
    body.status = editStatus;
    if (editDeadline) body.deadline = editDeadline;
    updateMutation.mutate({ id, ...body });
    setEditingId(null);
  };

  const startEditTask = (t: Task) => {
    setEditingTaskId(t.id);
    setEditTaskTitle(t.title);
    setEditTaskStatus(t.status);
    setEditTaskPriority(t.priority);
  };

  const saveEditTask = (taskId: string) => {
    const body: Record<string, string> = {};
    if (editTaskTitle.trim()) body.title = editTaskTitle.trim();
    body.status = editTaskStatus;
    body.priority = editTaskPriority;
    updateTaskMutation.mutate({ taskId, ...body });
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-500/10 text-green-500',
      paused: 'bg-yellow-500/10 text-yellow-500',
      completed: 'bg-blue-500/10 text-blue-500',
      archived: 'bg-[var(--secondary)] text-[var(--muted-foreground)]',
    };
    return styles[status] || 'bg-[var(--secondary)] text-[var(--muted-foreground)]';
  };

  const priorityDot = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-[var(--muted-foreground)]';
    }
  };

  const taskStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <Check className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Circle className="h-4 w-4 text-blue-500" />;
      default: return <Circle className="h-4 w-4 text-[var(--muted-foreground)]" />;
    }
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
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('workspace.projects.title')}</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('workspace.projects.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {t('workspace.projects.add')}
        </button>
      </div>

      {showAddForm && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.projects.name')}</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                placeholder={t('workspace.projects.namePlaceholder')}
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.projects.description')}</label>
              <input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                placeholder={t('workspace.projects.descriptionPlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.projects.status')}</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.projects.deadline')}</label>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.projects.goalId')}</label>
              <input
                value={newGoalId}
                onChange={(e) => setNewGoalId(e.target.value)}
                className="w-24 rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                placeholder={t('workspace.projects.goalIdPlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">{t('workspace.projects.color')}</label>
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
                  createMutation.mutate({
                    name: newName.trim(),
                    description: newDescription.trim() || undefined,
                    color: newColor,
                    status: newStatus,
                    deadline: newDeadline || undefined,
                    goalId: newGoalId.trim() || undefined,
                  });
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

      {projects.length === 0 ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <p className="text-sm text-[var(--muted-foreground)]">{t('workspace.projects.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const taskCounts = {
              total: project.tasks?.length || 0,
              done: project.tasks?.filter((t) => t.status === 'done').length || 0,
            };
            const isExpanded = expandedProject === project.id;

            return (
              <div
                key={project.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] transition"
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                    {editingId === project.id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-32 rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(project.id); if (e.key === 'Escape') setEditingId(null); }}
                        />
                        <input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-32 rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                          placeholder={t('workspace.projects.description')}
                        />
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                        >
                          {PROJECT_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <input
                          type="date"
                          value={editDeadline}
                          onChange={(e) => setEditDeadline(e.target.value)}
                          className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                        />
                        <div className="flex gap-1">
                          {COLORS.map((c) => (
                            <button
                              key={c}
                              onClick={() => setEditColor(c)}
                              className={`h-5 w-5 rounded-full transition ${editColor === c ? 'ring-2 ring-[var(--foreground)]' : ''}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                        <button onClick={() => saveEdit(project.id)} className="text-green-500 hover:text-green-400"><Check className="h-4 w-4" /></button>
                        <button onClick={() => setEditingId(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[var(--foreground)]">{project.name}</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusBadge(project.status)}`}>
                              {project.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {project.description && (
                              <span className="text-xs text-[var(--muted-foreground)]">{project.description}</span>
                            )}
                            <span className="text-xs text-[var(--muted-foreground)]">
                              {taskCounts.done}/{taskCounts.total} {t('workspace.projects.tasks')}
                            </span>
                            {project.deadline && (
                              <span className="text-xs text-[var(--muted-foreground)]">
                                {t('workspace.projects.deadline')}: {new Date(project.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingId(project.id); setEditName(project.name); setEditDescription(project.description || ''); setEditColor(project.color); setEditStatus(project.status); setEditDeadline(project.deadline || ''); }}
                      className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                      title={t('common.edit')}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {deleteId === project.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteMutation.mutate(project.id)}
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
                        onClick={() => setDeleteId(project.id)}
                        className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-red-500"
                        title={t('common.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                      className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                      title={isExpanded ? t('common.collapse') : t('common.expand')}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[var(--border)] px-4 py-3">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-[var(--foreground)]">{t('workspace.projects.tasks')}</h4>
                      <button
                        onClick={() => setShowTaskForm(showTaskForm === project.id ? null : project.id)}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                      >
                        <Plus className="h-3 w-3" />
                        {t('workspace.projects.addTask')}
                      </button>
                    </div>

                    {showTaskForm === project.id && (
                      <div className="mb-3 flex flex-wrap items-end gap-2 rounded-lg border border-[var(--border)] p-3">
                        <div className="flex-1 space-y-1">
                          <label className="text-xs text-[var(--muted-foreground)]">{t('workspace.projects.taskTitle')}</label>
                          <input
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="w-full rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                            placeholder={t('workspace.projects.taskTitlePlaceholder')}
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-xs text-[var(--muted-foreground)]">{t('workspace.projects.taskDescription')}</label>
                          <input
                            value={newTaskDesc}
                            onChange={(e) => setNewTaskDesc(e.target.value)}
                            className="w-full rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                            placeholder={t('workspace.projects.taskDescriptionPlaceholder')}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-[var(--muted-foreground)]">{t('workspace.projects.priority')}</label>
                          <select
                            value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value)}
                            className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                          >
                            {PRIORITIES.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => {
                            if (newTaskTitle.trim()) {
                              addTaskMutation.mutate({
                                projectId: project.id,
                                title: newTaskTitle.trim(),
                                description: newTaskDesc.trim() || undefined,
                                priority: newTaskPriority,
                              });
                            }
                          }}
                          disabled={!newTaskTitle.trim() || addTaskMutation.isPending}
                          className="flex items-center gap-1 rounded-lg bg-[var(--foreground)] px-3 py-2 text-xs font-medium text-[var(--background)] transition hover:opacity-90 disabled:opacity-50"
                        >
                          <Check className="h-3 w-3" />
                          {t('common.save')}
                        </button>
                        <button
                          onClick={() => setShowTaskForm(null)}
                          className="rounded-lg p-2 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    {(!project.tasks || project.tasks.length === 0) ? (
                      <p className="py-4 text-center text-xs text-[var(--muted-foreground)]">{t('workspace.projects.noTasks')}</p>
                    ) : (
                      <div className="space-y-1">
                        {project.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between rounded-lg px-3 py-2 transition hover:bg-[var(--secondary)]"
                          >
                            {editingTaskId === task.id ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <input
                                  value={editTaskTitle}
                                  onChange={(e) => setEditTaskTitle(e.target.value)}
                                  className="w-28 rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                                  autoFocus
                                  onKeyDown={(e) => { if (e.key === 'Enter') saveEditTask(task.id); if (e.key === 'Escape') setEditingTaskId(null); }}
                                />
                                <select
                                  value={editTaskStatus}
                                  onChange={(e) => setEditTaskStatus(e.target.value)}
                                  className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-xs text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                                >
                                  {TASK_STATUSES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                                <select
                                  value={editTaskPriority}
                                  onChange={(e) => setEditTaskPriority(e.target.value)}
                                  className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-xs text-[var(--foreground)] outline-none focus:border-[var(--foreground)]"
                                >
                                  {PRIORITIES.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                  ))}
                                </select>
                                <button onClick={() => saveEditTask(task.id)} className="text-green-500 hover:text-green-400"><Check className="h-3 w-3" /></button>
                                <button onClick={() => setEditingTaskId(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"><X className="h-3 w-3" /></button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-3">
                                  {taskStatusIcon(task.status)}
                                  <div>
                                    <span className={`text-sm ${task.status === 'done' ? 'text-[var(--muted-foreground)] line-through' : 'text-[var(--foreground)]'}`}>
                                      {task.title}
                                    </span>
                                    {task.description && (
                                      <p className="text-xs text-[var(--muted-foreground)]">{task.description}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className={`h-2 w-2 rounded-full ${priorityDot(task.priority)}`} title={task.priority} />
                                  <button
                                    onClick={() => startEditTask(task)}
                                    className="rounded-lg p-1 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                                    title={t('common.edit')}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </button>
                                  {deleteTaskId === task.id ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => deleteTaskMutation.mutate(task.id)}
                                        className="rounded-lg p-1 text-red-500 transition hover:bg-red-500/10"
                                        title={t('common.confirm')}
                                      >
                                        <Check className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteTaskId(null)}
                                        className="rounded-lg p-1 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                                        title={t('common.cancel')}
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setDeleteTaskId(task.id)}
                                      className="rounded-lg p-1 text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-red-500"
                                      title={t('common.delete')}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
