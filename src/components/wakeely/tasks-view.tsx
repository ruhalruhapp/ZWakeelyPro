'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Plus, CheckSquare, Square, Inbox, Loader2, X } from 'lucide-react';
import { useAppStore, type TaskItem } from '@/stores/app-store';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Color Maps ───────────────────────────────────────────────────────────────

const TASK_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-700 border-slate-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600 border-slate-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  urgent: 'bg-rose-50 text-rose-700 border-rose-200',
};

// Map API status to i18n key
function statusKey(status: string): string {
  if (status === 'in_progress') return 'taskStatus.inProgress';
  return `taskStatus.${status}`;
}

// Check if task is overdue
function isOverdue(task: TaskItem): boolean {
  if (task.status === 'completed' || task.status === 'cancelled' || !task.dueDate) return false;
  return new Date(task.dueDate) < new Date();
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────────

const STATUS_FILTERS = ['all', 'pending', 'in_progress', 'completed', 'cancelled'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function statusFilterLabel(s: StatusFilter, lang: string): string {
  if (s === 'all') return t('common.all', lang);
  return t(statusKey(s), lang);
}

// ─── Extended task type from API ──────────────────────────────────────────────

interface TaskWithCase extends TaskItem {
  case?: { id: string; caseNumber: string; title: string } | null;
  lawyer?: { id: string; name: string; avatarUrl?: string | null } | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TasksView() {
  const { language, cases, setCurrentView, setSelectedCaseId } = useAppStore();
  const lang = language;
  const isRtl = lang === 'ar';

  const [tasks, setTasks] = useState<TaskWithCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');

  // Inline add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCaseId, setNewCaseId] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : data.tasks ?? []);
      }
    } catch {
      toast.error(t('common.error', lang));
    } finally {
      setLoading(false);
    }
  }, [filter, lang]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Toggle task completion
  async function toggleTask(task: TaskWithCase) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
        );
        toast.success(t('tasks.updateSuccess', lang));
      }
    } catch {
      toast.error(t('common.error', lang));
    }
  }

  // Create task
  async function handleCreateTask() {
    if (!newTitle.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          caseId: newCaseId || undefined,
          priority: newPriority,
          dueDate: newDueDate || undefined,
          status: 'pending',
          lawyerId: 'lawyer-1',
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setTasks((prev) => [created, ...prev]);
        setNewTitle('');
        setNewCaseId('');
        setNewPriority('medium');
        setNewDueDate('');
        setShowAddForm(false);
        toast.success(t('tasks.createSuccess', lang));
      }
    } catch {
      toast.error(t('common.error', lang));
    } finally {
      setSubmitting(false);
    }
  }

  // Navigate to case
  function goToCase(caseId: string) {
    setSelectedCaseId(caseId);
    setCurrentView('cases');
  }

  const filteredTasks =
    filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('tasks.title', lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('common.showing', lang)} {filteredTasks.length}{' '}
            {t('common.of', lang)} {tasks.length} {t('common.results', lang)}
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          <Plus className="size-4" />
          {t('tasks.newTask', lang)}
        </Button>
      </div>

      {/* Inline Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  <Input
                    placeholder={t('tasks.taskTitle', lang)}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-background"
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Select value={newCaseId} onValueChange={setNewCaseId}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('cases.client', lang)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">—</SelectItem>
                        {cases.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.caseNumber} – {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={newPriority} onValueChange={setNewPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('common.priority', lang)} />
                      </SelectTrigger>
                      <SelectContent>
                        {['low', 'medium', 'high', 'urgent'].map((p) => (
                          <SelectItem key={p} value={p}>
                            {t(`priority.${p}`, lang)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddForm(false)}
                    >
                      {t('action.cancel', lang)}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCreateTask}
                      disabled={!newTitle.trim() || submitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {submitting && <Loader2 className="size-4 animate-spin" />}
                      {t('action.submit', lang)}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <Button
            key={s}
            variant={filter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(s)}
            className={
              filter === s
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : ''
            }
          >
            {statusFilterLabel(s, lang)}
          </Button>
        ))}
      </div>

      {/* Task Cards */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 p-4">
                <Skeleton className="size-5 rounded" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <Inbox className="size-10 opacity-40" />
            <p className="text-sm font-medium">{t('tasks.noTasks', lang)}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredTasks.map((task, idx) => {
              const overdue = isOverdue(task);
              const completed = task.status === 'completed';

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                >
                  <Card
                    className={`transition-colors hover:bg-muted/30 ${
                      overdue ? 'border-s-4 border-s-rose-400' : ''
                    }`}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <Checkbox
                        checked={completed}
                        onCheckedChange={() => toggleTask(task)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium text-sm ${
                            completed
                              ? 'line-through text-muted-foreground'
                              : 'text-foreground'
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {task.case && (
                            <button
                              onClick={() => goToCase(task.case!.id)}
                              className="hover:text-emerald-600 hover:underline transition-colors"
                            >
                              {task.case.caseNumber} – {task.case.title}
                            </button>
                          )}
                          {task.dueDate && (
                            <>
                              <span>·</span>
                              <span
                                className={
                                  overdue ? 'text-rose-600 font-medium' : ''
                                }
                              >
                                {format(new Date(task.dueDate), 'yyyy-MM-dd')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className={`font-normal text-xs ${
                            PRIORITY_COLORS[task.priority] ?? ''
                          }`}
                        >
                          {t(`priority.${task.priority}`, lang)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`font-normal text-xs ${
                            TASK_STATUS_COLORS[task.status] ?? ''
                          }`}
                        >
                          {t(statusKey(task.status), lang)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}