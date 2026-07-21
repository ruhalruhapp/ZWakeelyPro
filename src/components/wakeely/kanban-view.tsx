'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { GripVertical, Loader2, Inbox } from 'lucide-react';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppStore, type TaskItem } from '@/stores/app-store';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TaskWithCase extends TaskItem {
  case?: { id: string; caseNumber: string; title: string } | null;
  lawyer?: { id: string; name: string; avatarUrl?: string | null } | null;
}

const COLUMNS = ['pending', 'in_progress', 'completed', 'cancelled'] as const;
type ColumnStatus = (typeof COLUMNS)[number];

function statusKey(status: string): string {
  if (status === 'in_progress') return 'taskStatus.inProgress';
  return `taskStatus.${status}`;
}

const COLUMN_STYLES: Record<ColumnStatus, string> = {
  pending: 'bg-slate-50 border-slate-200',
  in_progress: 'bg-amber-50/50 border-amber-200',
  completed: 'bg-emerald-50/50 border-emerald-200',
  cancelled: 'bg-gray-50 border-gray-200',
};

const COLUMN_HEADER_COLORS: Record<ColumnStatus, string> = {
  pending: 'bg-slate-200 text-slate-700',
  in_progress: 'bg-amber-200 text-amber-800',
  completed: 'bg-emerald-200 text-emerald-800',
  cancelled: 'bg-gray-200 text-gray-600',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600 border-slate-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  urgent: 'bg-rose-50 text-rose-700 border-rose-200',
};

function isOverdue(task: TaskWithCase): boolean {
  if (task.status === 'completed' || task.status === 'cancelled' || !task.dueDate)
    return false;
  return new Date(task.dueDate) < new Date();
}

// ─── Sortable Task Card ─────────────────────────────────────────────────────

function SortableTaskCard({
  task,
  lang,
  onToggleComplete,
}: {
  task: TaskWithCase;
  lang: 'en' | 'ar';
  onToggleComplete: (task: TaskWithCase) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as unknown as number,
  };

  const overdue = isOverdue(task);
  const completed = task.status === 'completed';

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        <Card
          className={`group cursor-default transition-colors hover:bg-muted/30 ${
            overdue ? 'border-s-4 border-s-rose-400' : ''
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <button
                {...attributes}
                {...listeners}
                className="mt-0.5 cursor-grab text-muted-foreground/40 hover:text-muted-foreground focus:outline-none"
                aria-label="Drag task"
              >
                <GripVertical className="size-4" />
              </button>
              <Checkbox
                checked={completed}
                onCheckedChange={() => onToggleComplete(task)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0 space-y-1.5">
                <p
                  className={`text-sm font-medium leading-snug ${
                    completed
                      ? 'line-through text-muted-foreground'
                      : 'text-foreground'
                  }`}
                >
                  {task.title}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 font-normal ${
                      PRIORITY_COLORS[task.priority] ?? ''
                    }`}
                  >
                    {t(`priority.${task.priority}`, lang)}
                  </Badge>
                  {task.dueDate && (
                    <span
                      className={`text-[11px] ${
                        overdue ? 'text-rose-600 font-semibold' : 'text-muted-foreground'
                      }`}
                    >
                      {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                  )}
                </div>
                {task.case && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    {task.case.caseNumber} — {task.case.title}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ─── Column Component ───────────────────────────────────────────────────────

function KanbanColumn({
  status,
  tasks,
  lang,
  onToggleComplete,
}: {
  status: ColumnStatus;
  tasks: TaskWithCase[];
  lang: 'en' | 'ar';
  onToggleComplete: (task: TaskWithCase) => void;
}) {
  return (
    <Card className={`flex flex-col min-w-[280px] max-w-[340px] w-full shrink-0 border ${COLUMN_STYLES[status]}`}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <span
              className={`inline-block size-2 rounded-full ${
                status === 'pending'
                  ? 'bg-slate-400'
                  : status === 'in_progress'
                    ? 'bg-amber-500'
                    : status === 'completed'
                      ? 'bg-emerald-500'
                      : 'bg-gray-400'
              }`}
            />
            {t(statusKey(status), lang)}
          </CardTitle>
          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${COLUMN_HEADER_COLORS[status]}`}>
            {tasks.length}
          </Badge>
        </div>
      </CardHeader>
      <ScrollArea className="flex-1">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 px-3 pb-3">
            {tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                lang={lang}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </SortableContext>
      </ScrollArea>
    </Card>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {COLUMNS.map((col) => (
        <div
          key={col}
          className="flex flex-col min-w-[280px] max-w-[340px] w-full shrink-0 gap-2 p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Main Kanban View ───────────────────────────────────────────────────────

export function KanbanView() {
  const { language, setCurrentView, setSelectedCaseId } = useAppStore();
  const lang = language;
  const isRtl = lang === 'ar';

  const [allTasks, setAllTasks] = useState<TaskWithCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  // Fetch all tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setAllTasks(Array.isArray(data) ? data : data.tasks ?? []);
      }
    } catch {
      toast.error(t('common.error', lang));
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Toggle complete
  async function toggleComplete(task: TaskWithCase) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAllTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
        );
        toast.success(t('tasks.updateSuccess', lang));
      }
    } catch {
      toast.error(t('common.error', lang));
    }
  }

  // Drag end handler
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const currentTask = allTasks.find((t) => t.id === taskId);
    if (!currentTask) return;

    // Determine target column
    const targetColumn = COLUMNS.find(
      (col) => {
        const columnTasks = allTasks.filter((t) => t.status === col);
        return columnTasks.some((t) => t.id === over.id) || over.id === col;
      },
    );

    if (!targetColumn || currentTask.status === targetColumn) return;

    // Optimistic update
    setAllTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: targetColumn } : t,
      ),
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetColumn }),
      });
      if (!res.ok) {
        // Revert on failure
        setAllTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status: currentTask.status } : t,
          ),
        );
        toast.error(t('common.error', lang));
      }
    } catch {
      setAllTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: currentTask.status } : t,
        ),
      );
      toast.error(t('common.error', lang));
    }
  }

  // Group tasks by column
  const columnTasks = (status: ColumnStatus) =>
    allTasks.filter((task) => task.status === status);

  const totalTasks = allTasks.length;

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('nav.kanban', lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('common.showing', lang)} {totalTasks} {t('common.results', lang)}
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <KanbanSkeleton />
      ) : totalTasks === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
            <Inbox className="size-10 opacity-40" />
            <p className="text-sm font-medium">{t('tasks.noTasks', lang)}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto pb-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={({ active }) => setActiveId(active.id as string)}
            onDragEnd={handleDragEnd}
          >
            <div className={`flex gap-4 min-h-[calc(100vh-220px)] ${isRtl ? 'flex-row-reverse' : ''}`}>
              {COLUMNS.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  tasks={columnTasks(status)}
                  lang={lang}
                  onToggleComplete={toggleComplete}
                />
              ))}
            </div>
          </DndContext>
        </div>
      )}
    </div>
  );
}