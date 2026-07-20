'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  ArrowRight,
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Check,
  Clock,
  FileText,
  Calendar,
  CreditCard,
  Loader2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAppStore, type CaseItem, type TaskItem, type DocumentItem, type BillingItem, type TimelineItem } from '@/stores/app-store';
import { t } from '@/lib/i18n';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─── Color Maps ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  intake: 'bg-slate-100 text-slate-700 border-slate-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  discovery: 'bg-amber-50 text-amber-700 border-amber-200',
  trial: 'bg-rose-50 text-rose-700 border-rose-200',
  settlement: 'bg-teal-50 text-teal-700 border-teal-200',
  appeal: 'bg-orange-50 text-orange-700 border-orange-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
  archived: 'bg-slate-100 text-slate-500 border-slate-200',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-slate-600 bg-slate-50',
  medium: 'text-amber-700 bg-amber-50',
  high: 'text-orange-700 bg-orange-50',
  urgent: 'text-rose-700 bg-rose-50',
};

const TIMELINE_DOT_COLORS: Record<string, string> = {
  hearing: 'bg-emerald-500',
  filing: 'bg-amber-500',
  deadline: 'bg-rose-500',
  note: 'bg-slate-400',
  statusChange: 'bg-teal-500',
  document: 'bg-orange-500',
  payment: 'bg-emerald-600',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface CaseDetailViewProps {
  caseId: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CaseDetailView({ caseId }: CaseDetailViewProps) {
  const { language, setSelectedCaseId, updateCase, removeCase } = useAppStore();
  const isRtl = language === 'ar';
  const ArrowIcon = isRtl ? ArrowRight : ArrowLeft;

  const [caseData, setCaseData] = useState<CaseItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch full case
  const fetchCase = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`);
      if (res.ok) {
        const data = await res.json();
        const c: CaseItem = data.case ?? data.data ?? data;
        setCaseData(c);
      }
    } catch {
      toast.error(t('common.error', language));
    } finally {
      setLoading(false);
    }
  }, [caseId, language]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  // Delete
  const handleDelete = async () => {
    if (!confirm(t('cases.deleteConfirm', language))) return;
    try {
      const res = await fetch(`/api/cases/${caseId}`, { method: 'DELETE' });
      if (res.ok) {
        removeCase(caseId);
        setSelectedCaseId(null);
        toast.success(t('cases.deleteSuccess', language));
      }
    } catch {
      toast.error(t('common.error', language));
    }
  };

  // ─── Loading skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
        <p>{t('common.noResults', language)}</p>
        <Button variant="outline" onClick={() => setSelectedCaseId(null)}>
          {t('action.back', language)}
        </Button>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6 p-4 md:p-6">
      {/* ─── Back + Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedCaseId(null)} className="size-8">
            <ArrowIcon className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{caseData.caseNumber}</h1>
              <Badge variant="outline" className={`font-normal ${STATUS_COLORS[caseData.status] ?? ''}`}>
                {t(`status.${caseData.status}`, language)}
              </Badge>
              <Badge variant="outline" className={`font-normal ${PRIORITY_COLORS[caseData.priority] ?? ''}`}>
                {t(`priority.${caseData.priority}`, language)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{caseData.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Pencil className="size-3.5" />
            {t('action.edit', language)}
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={handleDelete}>
            <Trash2 className="size-3.5" />
            {t('action.delete', language)}
          </Button>
        </div>
      </div>

      {/* ─── Info Grid ──────────────────────────────────────────────────────── */}
      <Card className="p-4 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
          <InfoField label={t('cases.court', language)} value={caseData.court} />
          <InfoField label={t('cases.judge', language)} value={caseData.judge} />
          <InfoField label={t('cases.filedDate', language)} value={caseData.filedDate ? format(new Date(caseData.filedDate), 'yyyy-MM-dd') : undefined} />
          <InfoField label={t('cases.nextHearing', language)} value={caseData.nextHearing ? format(new Date(caseData.nextHearing), 'yyyy-MM-dd') : undefined} />
          <InfoField label={t('cases.caseValue', language)} value={caseData.value ? `${caseData.value.toLocaleString()} ${t('common.currency', language)}` : undefined} />
          <InfoField label={t('cases.client', language)} value={caseData.client?.fullName} />
        </div>
      </Card>

      {/* ─── Tabs ───────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full sm:w-auto flex overflow-x-auto">
          <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
            <FileText className="size-3.5 hidden sm:block" />
            {t('dashboard.overview', language)}
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1.5 text-xs sm:text-sm">
            <Check className="size-3.5 hidden sm:block" />
            {t('cases.tasks', language)}
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5 text-xs sm:text-sm">
            <FileText className="size-3.5 hidden sm:block" />
            {t('cases.documents', language)}
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5 text-xs sm:text-sm">
            <Clock className="size-3.5 hidden sm:block" />
            {t('cases.timelines', language)}
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5 text-xs sm:text-sm">
            <CreditCard className="size-3.5 hidden sm:block" />
            {t('cases.billing', language)}
          </TabsTrigger>
        </TabsList>

        {/* ─── Overview Tab ────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card className="p-4 md:p-6">
            <h3 className="font-semibold text-foreground mb-3">{t('cases.description', language)}</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {caseData.description || '—'}
            </p>
          </Card>
          <Card className="p-4 md:p-6">
            <h3 className="font-semibold text-foreground mb-3">{t('cases.notes', language)}</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {caseData.notes || '—'}
            </p>
          </Card>
          <Card className="p-4 md:p-6">
            <h3 className="font-semibold text-foreground mb-3">{t('common.details', language)}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <InfoField label={t('cases.caseType', language)} value={t(`caseType.${caseData.caseType}`, language)} />
              <InfoField label={t('cases.lawyer', language)} value={caseData.lawyer?.name} />
              <InfoField label={t('common.createdAt', language)} value={format(new Date(caseData.createdAt), 'yyyy-MM-dd')} />
              <InfoField label={t('common.updatedAt', language)} value={format(new Date(caseData.updatedAt), 'yyyy-MM-dd')} />
            </div>
          </Card>
        </TabsContent>

        {/* ─── Tasks Tab ───────────────────────────────────────────────────── */}
        <TabsContent value="tasks" className="mt-4">
          <TasksTab caseId={caseId} tasks={caseData.tasks ?? []} onRefresh={fetchCase} />
        </TabsContent>

        {/* ─── Documents Tab ───────────────────────────────────────────────── */}
        <TabsContent value="documents" className="mt-4">
          <DocumentsTab caseId={caseId} documents={caseData.documents ?? []} onRefresh={fetchCase} />
        </TabsContent>

        {/* ─── Timeline Tab ────────────────────────────────────────────────── */}
        <TabsContent value="timeline" className="mt-4">
          <TimelineTab caseId={caseId} timelines={caseData.timelines ?? []} onRefresh={fetchCase} />
        </TabsContent>

        {/* ─── Billing Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="billing" className="mt-4">
          <BillingTab caseId={caseId} billings={caseData.billings ?? []} onRefresh={fetchCase} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── InfoField ─────────────────────────────────────────────────────────────────

function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="font-medium text-foreground truncate">{value || '—'}</p>
    </div>
  );
}

// ─── Tasks Tab ─────────────────────────────────────────────────────────────────

function TasksTab({
  caseId,
  tasks,
  onRefresh,
}: {
  caseId: string;
  tasks: TaskItem[];
  onRefresh: () => void;
}) {
  const { language } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setFormLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          priority,
          dueDate: dueDate || undefined,
          caseId,
          status: 'pending',
        }),
      });
      if (res.ok) {
        toast.success(t('tasks.createSuccess', language));
        setTitle('');
        setPriority('medium');
        setDueDate('');
        setShowForm(false);
        onRefresh();
      }
    } catch {
      toast.error(t('common.error', language));
    } finally {
      setFormLoading(false);
    }
  };

  const toggleComplete = async (task: TaskItem) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch {
      toast.error(t('common.error', language));
    }
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{t('cases.tasks', language)}</h3>
        <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-3.5" />
          {t('tasks.newTask', language)}
        </Button>
      </div>

      {/* Inline form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <Card className="p-4 bg-muted/30 border border-dashed">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="sm:col-span-2 lg:col-span-1">
                  <Label className="text-xs text-muted-foreground">{t('tasks.taskTitle', language)}</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('tasks.taskTitle', language)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('cases.priority', language)}</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['low', 'medium', 'high', 'urgent'].map((p) => (
                        <SelectItem key={p} value={p}>{t(`priority.${p}`, language)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('tasks.dueDate', language)}</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1" />
                </div>
                <div className="flex items-end gap-2">
                  <Button size="sm" onClick={handleSubmit} disabled={formLoading || !title.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {formLoading ? <Loader2 className="size-3.5 animate-spin" /> : t('action.submit', language)}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                    {t('action.cancel', language)}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">{t('tasks.noTasks', language)}</p>
      ) : (
        <ScrollArea className="max-h-96">
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  task.status === 'completed' ? 'bg-muted/40 opacity-70' : 'bg-card hover:bg-muted/30'
                }`}
              >
                <Checkbox
                  checked={task.status === 'completed'}
                  onCheckedChange={() => toggleComplete(task)}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{task.description}</p>
                  )}
                </div>
                <Badge variant="outline" className={`text-xs shrink-0 ${PRIORITY_COLORS[task.priority] ?? ''}`}>
                  {t(`priority.${task.priority}`, language)}
                </Badge>
                {task.dueDate && (
                  <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                    {format(new Date(task.dueDate), 'yyyy-MM-dd')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}

// ─── Documents Tab ─────────────────────────────────────────────────────────────

function DocumentsTab({
  caseId,
  documents,
  onRefresh,
}: {
  caseId: string;
  documents: DocumentItem[];
  onRefresh: () => void;
}) {
  const { language } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [category, setCategory] = useState('general');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!fileName.trim()) return;
    setFormLoading(true);
    try {
      const res = await fetch('/api/case-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileType,
          category,
          description: description || undefined,
          caseId,
        }),
      });
      if (res.ok) {
        toast.success(t('documents.uploadSuccess', language));
        setFileName('');
        setFileType('pdf');
        setCategory('general');
        setDescription('');
        setShowForm(false);
        onRefresh();
      }
    } catch {
      toast.error(t('common.error', language));
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{t('cases.documents', language)}</h3>
        <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-3.5" />
          {t('documents.upload', language)}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <Card className="p-4 bg-muted/30 border border-dashed">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">{t('documents.fileName', language)}</Label>
                  <Input value={fileName} onChange={(e) => setFileName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('documents.fileType', language)}</Label>
                  <Select value={fileType} onValueChange={setFileType}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'other'].map((ft) => (
                        <SelectItem key={ft} value={ft}>{ft.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('documents.category', language)}</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['pleading', 'evidence', 'correspondence', 'contract', 'courtOrder', 'general', 'other'].map((cat) => (
                        <SelectItem key={cat} value={cat}>{t(`docCategory.${cat}`, language)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('cases.description', language)}</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleSubmit} disabled={formLoading || !fileName.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {formLoading ? <Loader2 className="size-3.5 animate-spin" /> : t('action.submit', language)}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                  {t('action.cancel', language)}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">{t('documents.noDocuments', language)}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t('documents.fileName', language)}</TableHead>
              <TableHead className="hidden sm:table-cell">{t('documents.fileType', language)}</TableHead>
              <TableHead className="hidden md:table-cell">{t('documents.category', language)}</TableHead>
              <TableHead className="hidden lg:table-cell">{t('documents.uploadedAt', language)}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{doc.fileName}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline" className="font-mono text-xs">{doc.fileType.toUpperCase()}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {t(`docCategory.${doc.category}`, language)}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {format(new Date(doc.uploadedAt), 'yyyy-MM-dd')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

// ─── Timeline Tab ─────────────────────────────────────────────────────────────

function TimelineTab({
  caseId,
  timelines,
  onRefresh,
}: {
  caseId: string;
  timelines: TimelineItem[];
  onRefresh: () => void;
}) {
  const { language } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('note');
  const [eventDate, setEventDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setFormLoading(true);
    try {
      const res = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || undefined,
          eventType,
          eventDate,
          caseId,
        }),
      });
      if (res.ok) {
        toast.success(t('cases.createSuccess', language));
        setTitle('');
        setDescription('');
        setEventType('note');
        setEventDate(format(new Date(), 'yyyy-MM-dd'));
        setShowForm(false);
        onRefresh();
      }
    } catch {
      toast.error(t('common.error', language));
    } finally {
      setFormLoading(false);
    }
  };

  const sorted = [...timelines].sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  );

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{t('cases.timelines', language)}</h3>
        <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-3.5" />
          {t('action.create', language)}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <Card className="p-4 bg-muted/30 border border-dashed">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="sm:col-span-2 lg:col-span-1">
                  <Label className="text-xs text-muted-foreground">{t('common.name', language)}</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('common.type', language)}</Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['hearing', 'filing', 'deadline', 'note', 'statusChange', 'document', 'payment'].map((et) => (
                        <SelectItem key={et} value={et}>{t(`timelineType.${et}`, language)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('common.date', language)}</Label>
                  <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('cases.description', language)}</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleSubmit} disabled={formLoading || !title.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {formLoading ? <Loader2 className="size-3.5 animate-spin" /> : t('action.submit', language)}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                  {t('action.cancel', language)}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">{t('common.noResults', language)}</p>
      ) : (
        <ScrollArea className="max-h-96">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute start-4 top-2 bottom-2 w-px bg-border" />

            <div className="space-y-6">
              {sorted.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative flex gap-4 ps-10"
                >
                  {/* Dot */}
                  <div
                    className={`absolute start-2.5 top-1.5 size-3 rounded-full border-2 border-background ${
                      TIMELINE_DOT_COLORS[event.eventType] ?? 'bg-slate-400'
                    }`}
                  />

                  {/* Content */}
                  <div className="flex-1 pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">{event.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {t(`timelineType.${event.eventType}`, language)}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(event.eventDate), 'yyyy-MM-dd')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}

// ─── Billing Tab ──────────────────────────────────────────────────────────────

function BillingTab({
  caseId,
  billings,
  onRefresh,
}: {
  caseId: string;
  billings: BillingItem[];
  onRefresh: () => void;
}) {
  const { language } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [rate, setRate] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('draft');
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Auto-calc amount from hours * rate
  useEffect(() => {
    const h = parseFloat(hours);
    const r = parseFloat(rate);
    if (!isNaN(h) && !isNaN(r) && h > 0 && r > 0) {
      setAmount((h * r).toFixed(2));
    }
  }, [hours, rate]);

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setFormLoading(true);
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          hours: hours ? parseFloat(hours) : undefined,
          rate: rate ? parseFloat(rate) : undefined,
          amount: parseFloat(amount) || 0,
          status,
          invoiceDate: invoiceDate || undefined,
          caseId,
          currency: 'SAR',
        }),
      });
      if (res.ok) {
        toast.success(t('billing.createSuccess', language));
        setDescription('');
        setHours('');
        setRate('');
        setAmount('');
        setStatus('draft');
        setInvoiceDate(format(new Date(), 'yyyy-MM-dd'));
        setShowForm(false);
        onRefresh();
      }
    } catch {
      toast.error(t('common.error', language));
    } finally {
      setFormLoading(false);
    }
  };

  const totalAmount = billings.reduce((sum, b) => sum + (b.amount ?? 0), 0);

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{t('cases.billing', language)}</h3>
        <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowForm(!showForm)}>
          <Plus className="size-3.5" />
          {t('billing.newInvoice', language)}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <Card className="p-4 bg-muted/30 border border-dashed">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="sm:col-span-2 lg:col-span-1">
                  <Label className="text-xs text-muted-foreground">{t('billing.description', language)}</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('billing.hours', language)}</Label>
                  <Input type="number" step="0.5" min="0" value={hours} onChange={(e) => setHours(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('billing.rate', language)}</Label>
                  <Input type="number" min="0" value={rate} onChange={(e) => setRate(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('billing.amount', language)}</Label>
                  <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('common.status', language)}</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['draft', 'sent', 'paid', 'overdue', 'cancelled'].map((s) => (
                        <SelectItem key={s} value={s}>{t(`billingStatus.${s}`, language)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('billing.invoiceDate', language)}</Label>
                  <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="mt-1" />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleSubmit} disabled={formLoading || !description.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {formLoading ? <Loader2 className="size-3.5 animate-spin" /> : t('action.submit', language)}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                  {t('action.cancel', language)}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {billings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">{t('billing.noBillings', language)}</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t('billing.description', language)}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('billing.hours', language)}</TableHead>
                <TableHead className="hidden md:table-cell">{t('billing.rate', language)}</TableHead>
                <TableHead>{t('billing.amount', language)}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('common.status', language)}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('billing.invoiceDate', language)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billings.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium text-sm">{bill.description}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {bill.hours ?? '—'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {bill.rate ? `${bill.rate.toLocaleString()} ${t('common.currency', language)}` : '—'}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {bill.amount.toLocaleString()} {t('common.currency', language)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {t(`billingStatus.${bill.status}`, language)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {bill.invoiceDate ? format(new Date(bill.invoiceDate), 'yyyy-MM-dd') : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Summary */}
          <div className="flex justify-end mt-4 pt-4 border-t">
            <div className="text-sm">
              <span className="text-muted-foreground">{t('billing.total', language)}: </span>
              <span className="font-bold text-lg text-foreground">
                {totalAmount.toLocaleString()} {t('common.currency', language)}
              </span>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}