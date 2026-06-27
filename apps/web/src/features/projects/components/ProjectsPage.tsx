import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Plus, Folder, Settings, LayoutDashboard } from 'lucide-react';
import { getProjects, createProject, addTask } from '../api/projectsApi';
import { getCategories } from '../../categories/api/categoriesApi';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';

export const ProjectsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', color: '' });
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});

  const { data: projects, isLoading } = useQuery({ queryKey: ['projects'], queryFn: getProjects });
  const { data: categories } = useQuery({ queryKey: ['categories', 'project'], queryFn: () => getCategories('project') });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); setShowForm(false); setForm({ name: '', description: '', color: '' }); },
  });

  const addTaskMutation = useMutation({
    mutationFn: (data: { projectId: string; title: string }) => addTask(data.projectId, { title: data.title }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); setTaskInputs({}); },
  });

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

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">{t('projects.title')}</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t('projects.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(!showForm)}><Plus className="mr-2 h-4 w-4" />{t('projects.add')}</Button>
          <Link to="/workspace/projects">
            <Button variant="secondary">
              <Settings className="mr-2 h-4 w-4" /> {t('projects.manage')}
            </Button>
          </Link>
          <Link to="/workspace/categories">
            <Button variant="ghost">
              <LayoutDashboard className="mr-2 h-4 w-4" /> {t('projects.manageCategories')}
            </Button>
          </Link>
        </div>
      </div>

      {showForm && (
        <Card title={t('projects.new')}>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ ...form, color: form.color || undefined }); }}>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              {t('projects.name')}
              <Input value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              {t('projects.description')}
              <Input value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value })} />
            </label>
            <Button type="submit">{t('common.create')}</Button>
          </form>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {projects?.map((project: any) => (
          <div key={project.id} className="rounded-3xl border border-[var(--border)] p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Folder className="h-5 w-5 text-[var(--muted-foreground)]" />
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">{project.name}</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">{project.description}</p>
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                project.status === 'active' ? 'bg-green-500/10 text-green-500' :
                project.status === 'paused' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-[var(--secondary)] text-[var(--muted-foreground)]'
              }`}>{project.status}</span>
            </div>
            <div className="mt-4 space-y-2">
              {project.tasks?.slice(0, 3).map((task: any) => (
                <div key={task.id} className="flex items-center gap-2 text-sm">
                  <div className={`h-1.5 w-1.5 rounded-full ${
                    task.status === 'done' ? 'bg-green-500' :
                    task.status === 'in_progress' ? 'bg-blue-500' : 'bg-[var(--muted-foreground)]'
                  }`} />
                  <span className={task.status === 'done' ? 'text-[var(--muted-foreground)] line-through' : 'text-[var(--foreground)]'}>{task.title}</span>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={taskInputs[project.id] || ''}
                  onChange={(e) => setTaskInputs({ ...taskInputs, [project.id]: e.target.value })}
                  placeholder="+ Add task"
                  className="flex-1 rounded-xl border border-[var(--border)] bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[var(--foreground)]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && taskInputs[project.id]) {
                      addTaskMutation.mutate({ projectId: project.id, title: taskInputs[project.id] });
                    }
                  }}
                />
                <Button variant="ghost" size="sm" onClick={() => { if (taskInputs[project.id]) addTaskMutation.mutate({ projectId: project.id, title: taskInputs[project.id] }); }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {!projects?.length && (
          <div className="col-span-full py-12 text-center">
            <Folder className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t('projects.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
