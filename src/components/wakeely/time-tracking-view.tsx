'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Play,
  Square,
  Plus,
  Loader2,
  Clock,
  DollarSign,
  Timer,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import { useAppStore, type TimeEntryItem, type ExpenseItem } from '@/stores/app-store';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TimeEntryWithCase extends TimeEntryItem {
  case?: { id: string; caseNumber: string; title: string } | null;
  lawyer?: { id: string; name: string } | null;
}

interface ExpenseWithCase extends ExpenseItem {
  case?: { id: string; caseNumber: string; title: string } | null;
}

const ACTIVITY_TYPES = [
  'research',
  'drafting',
  'review',
  'meeting',
  'court',
  'phone',
  'email',
  'other',
] as const;

const EXPENSE_CATEGORIES = [
  'travel',
  'filing',
  'expert',
  'courier',
  'printing',
  'other',
] as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatCurrency(amount: number, currency = 'SAR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatTimerDisplay(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-bold text-foreground">{value}</p>
            {subtext && (
              <p className="text-[11px] text-muted-foreground">{subtext}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Time Tracking View ─────────────────────────────────────────────────────

export function TimeTrackingView() {
  const { language, cases } = useAppStore();
  const lang = language;
  const isRtl = lang === 'ar';

  // Data
  const [timeEntries, setTimeEntries] = useState<TimeEntryWithCase[]>([]);
  const [expenses, setExpenses] = useState<ExpenseWithCase[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterCaseId, setFilterCaseId] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Timer state (local, not global)
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerCaseId, setTimerCaseId] = useState('');
  const [timerDescription, setTimerDescription] = useState('');
  const [timerActivityType, setTimerActivityType] = useState('other');
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerStartRef = useRef<number>(0);

  // Manual entry dialog
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    description: '',
    durationHours: '',
    durationMinutes: '',
    rate: '',
    isBillable: true,
    activityType: 'other',
    date: format(new Date(), 'yyyy-MM-dd'),
    caseId: '',
  });

  // Expense dialog
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'other',
    isBillable: true,
    date: format(new Date(), 'yyyy-MM-dd'),
    caseId: '',
  });

  // Expenses collapsible
  const [expensesOpen, setExpensesOpen] = useState(false);

  // ─── Fetch data ─────────────────────────────────────────────────────────

  const fetchTimeEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCaseId) params.set('caseId', filterCaseId);
      if (filterDateFrom) params.set('dateFrom', filterDateFrom);
      if (filterDateTo) params.set('dateTo', filterDateTo);

      const [entriesRes, expensesRes] = await Promise.all([
        fetch(`/api/time-entries?${params.toString()}`),
        fetch(`/api/expenses?${params.toString()}`),
      ]);

      if (entriesRes.ok) {
        const data = await entriesRes.json();
        setTimeEntries(Array.isArray(data) ? data : []);
      }
      if (expensesRes.ok) {
        const data = await expensesRes.json();
        setExpenses(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error(t('common.error', lang));
    } finally {
      setLoading(false);
    }
  }, [filterCaseId, filterDateFrom, filterDateTo, lang]);

  useEffect(() => {
    fetchTimeEntries();
  }, [fetchTimeEntries]);

  // ─── Timer ──────────────────────────────────────────────────────────────

  function startTimer() {
    if (!timerCaseId) {
      toast.error('Please select a case');
      return;
    }
    timerStartRef.current = Date.now();
    setTimerSeconds(0);
    setTimerRunning(true);
    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds(Math.floor((Date.now() - timerStartRef.current) / 1000));
    }, 1000);
  }

  function stopTimer() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimerRunning(false);
    createTimerEntry();
  }

  async function createTimerEntry() {
    const durationMinutes = Math.max(1, Math.round(timerSeconds / 60));
    try {
      const res = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: timerDescription.trim() || t('time.other', lang),
          duration: durationMinutes,
          activityType: timerActivityType,
          date: new Date().toISOString(),
          caseId: timerCaseId,
          lawyerId: 'lawyer-1',
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setTimeEntries((prev) => [created, ...prev]);
        toast.success(t('action.create', lang));
        setTimerDescription('');
        setTimerSeconds(0);
      }
    } catch {
      toast.error(t('common.error', lang));
    }
  }

  // Clean up timer interval on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // ─── Manual entry ───────────────────────────────────────────────────────

  async function handleCreateManualEntry() {
    if (!manualEntry.description.trim() || !manualEntry.caseId) return;
    setSubmitting(true);
    try {
      const hours = parseInt(manualEntry.durationHours || '0', 10) || 0;
      const minutes = parseInt(manualEntry.durationMinutes || '0', 10) || 0;
      const totalMinutes = hours * 60 + minutes;
      if (totalMinutes <= 0) {
        toast.error('Duration must be greater than 0');
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: manualEntry.description.trim(),
          duration: totalMinutes,
          rate: manualEntry.rate ? parseFloat(manualEntry.rate) : undefined,
          isBillable: manualEntry.isBillable,
          activityType: manualEntry.activityType,
          date: manualEntry.date,
          caseId: manualEntry.caseId,
          lawyerId: 'lawyer-1',
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setTimeEntries((prev) => [created, ...prev]);
        setManualDialogOpen(false);
        setManualEntry({
          description: '',
          durationHours: '',
          durationMinutes: '',
          rate: '',
          isBillable: true,
          activityType: 'other',
          date: format(new Date(), 'yyyy-MM-dd'),
          caseId: '',
        });
        toast.success(t('action.create', lang));
      }
    } catch {
      toast.error(t('common.error', lang));
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Expense ────────────────────────────────────────────────────────────

  async function handleCreateExpense() {
    if (!newExpense.description.trim() || !newExpense.caseId || !newExpense.amount) return;
    setSubmittingExpense(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newExpense.description.trim(),
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
          isBillable: newExpense.isBillable,
          date: newExpense.date,
          caseId: newExpense.caseId,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setExpenses((prev) => [created, ...prev]);
        setExpenseDialogOpen(false);
        setNewExpense({
          description: '',
          amount: '',
          category: 'other',
          isBillable: true,
          date: format(new Date(), 'yyyy-MM-dd'),
          caseId: '',
        });
        toast.success(t('action.create', lang));
      }
    } catch {
      toast.error(t('common.error', lang));
    } finally {
      setSubmittingExpense(false);
    }
  }

  // ─── Delete time entry ──────────────────────────────────────────────────

  async function deleteTimeEntry(id: string) {
    try {
      const res = await fetch(`/api/time-entries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTimeEntries((prev) => prev.filter((e) => e.id !== id));
        toast.success(t('action.delete', lang));
      }
    } catch {
      toast.error(t('common.error', lang));
    }
  }

  // ─── Delete expense ─────────────────────────────────────────────────────

  async function deleteExpense(id: string) {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        toast.success(t('action.delete', lang));
      }
    } catch {
      toast.error(t('common.error', lang));
    }
  }

  // ─── Computed stats ─────────────────────────────────────────────────────

  const totalMinutes = timeEntries.reduce((sum, e) => sum + e.duration, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const billableEntries = timeEntries.filter((e) => e.isBillable);
  const billableMinutes = billableEntries.reduce((sum, e) => sum + e.duration, 0);
  const billableHours = (billableMinutes / 60).toFixed(1);
  const billableAmount = billableEntries.reduce(
    (sum, e) => sum + (e.duration / 60) * (e.rate ?? 0),
    0,
  );

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('time.title', lang)}
          </h1>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Clock}
          label={t('time.totalHours', lang)}
          value={`${totalHours}h`}
          subtext={t('common.showing', lang) + ' ' + timeEntries.length + ' ' + t('common.results', lang)}
        />
        <StatCard
          icon={Timer}
          label={t('time.billableHours', lang)}
          value={`${billableHours}h`}
          subtext={`${billableEntries.length} ${t('common.results', lang)}`}
        />
        <StatCard
          icon={DollarSign}
          label={`${t('billing.amount')} (${t('time.billable', lang)})`}
          value={formatCurrency(billableAmount)}
        />
      </div>

      {/* Timer Card */}
      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-background">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Timer className="size-4 text-emerald-600" />
            {t('time.title', lang)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              value={timerCaseId}
              onValueChange={setTimerCaseId}
              disabled={timerRunning}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('cases.caseTitle', lang)} />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.caseNumber} – {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder={t('billing.description', lang)}
              value={timerDescription}
              onChange={(e) => setTimerDescription(e.target.value)}
              disabled={timerRunning}
            />
            <Select
              value={timerActivityType}
              onValueChange={setTimerActivityType}
              disabled={timerRunning}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('time.activityType', lang)} />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((at) => (
                  <SelectItem key={at} value={at}>
                    {t(`time.${at}`, lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <motion.p
                className="text-5xl md:text-6xl font-mono font-bold tabular-nums tracking-wider text-foreground"
                key={timerSeconds}
                initial={timerRunning ? { scale: 1.02 } : false}
                animate={{ scale: 1 }}
                transition={{ duration: 0.1 }}
              >
                {formatTimerDisplay(timerSeconds)}
              </motion.p>
            </div>
          </div>

          <div className="flex justify-center">
            {!timerRunning ? (
              <Button
                onClick={startTimer}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-8 h-11 text-base"
              >
                <Play className="size-5" />
                {t('time.startTimer', lang)}
              </Button>
            ) : (
              <Button
                onClick={stopTimer}
                variant="destructive"
                className="gap-2 px-8 h-11 text-base"
              >
                <Square className="size-4" />
                {t('time.stopTimer', lang)}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-auto space-y-1">
          <Label className="text-xs">{t('cases.caseTitle', lang)}</Label>
          <Select value={filterCaseId} onValueChange={setFilterCaseId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder={t('common.all', lang)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('common.all', lang)}</SelectItem>
              {cases.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.caseNumber} – {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-auto space-y-1">
          <Label className="text-xs">{t('common.date', lang)} ({t('action.previous', lang)})</Label>
          <Input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="w-full sm:w-[160px]"
          />
        </div>
        <div className="w-full sm:w-auto space-y-1">
          <Label className="text-xs">{t('common.date', lang)} ({t('action.next', lang)})</Label>
          <Input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="w-full sm:w-[160px]"
          />
        </div>
        <Button
          onClick={() => setManualDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          <Plus className="size-4" />
          {t('time.logEntry', lang)}
        </Button>
      </div>

      {/* Time Entries Table */}
      {loading ? (
        <Card>
          <CardContent className="p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{t('common.date', lang)}</TableHead>
                    <TableHead className="text-xs">{t('cases.caseTitle', lang)}</TableHead>
                    <TableHead className="text-xs">{t('billing.description', lang)}</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">{t('time.activityType', lang)}</TableHead>
                    <TableHead className="text-xs">{t('time.duration', lang)}</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">{t('billing.rate', lang)}</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">{t('billing.amount', lang)}</TableHead>
                    <TableHead className="text-xs">{t('time.billable', lang)}</TableHead>
                    <TableHead className="text-xs">{t('common.actions', lang)}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {timeEntries.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center py-12 text-muted-foreground text-sm"
                        >
                          {t('common.noResults', lang)}
                        </TableCell>
                      </TableRow>
                    ) : (
                      timeEntries.map((entry, idx) => (
                        <motion.tr
                          key={entry.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <TableCell className="py-3 px-4 text-xs">
                            {entry.date
                              ? format(new Date(entry.date), 'MMM d, yyyy')
                              : '—'}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-xs font-medium">
                            {entry.case
                              ? `${entry.case.caseNumber}`
                              : '—'}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-xs max-w-[200px] truncate">
                            {entry.description}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-xs hidden md:table-cell">
                            <Badge variant="outline" className="text-[10px] font-normal">
                              {t(`time.${entry.activityType}`, lang)}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 px-4 text-xs font-mono">
                            {formatDuration(entry.duration)}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-xs hidden sm:table-cell">
                            {entry.rate
                              ? formatCurrency(entry.rate)
                              : '—'}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-xs font-medium hidden sm:table-cell">
                            {entry.rate
                              ? formatCurrency((entry.duration / 60) * entry.rate)
                              : '—'}
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className={
                                entry.isBillable
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                                  : 'bg-gray-50 text-gray-500 border-gray-200 text-[10px]'
                              }
                            >
                              {entry.isBillable
                                ? t('time.billable', lang)
                                : '—'}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-rose-600"
                              onClick={() => deleteTimeEntry(entry.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Expenses Section (Collapsible) */}
      <Collapsible open={expensesOpen} onOpenChange={setExpensesOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between mb-3">
            <span className="flex items-center gap-2">
              <DollarSign className="size-4" />
              {t('expense.title', lang)}
              <Badge variant="secondary" className="text-[10px]">
                {expenses.length}
              </Badge>
            </span>
            {expensesOpen ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <AnimatePresence>
          {expensesOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex justify-end mb-3">
                <Button
                  onClick={() => setExpenseDialogOpen(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="size-3.5" />
                  {t('action.create', lang)}
                </Button>
              </div>
              <Card>
                <CardContent className="p-0">
                  <ScrollArea className="max-h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">{t('common.date', lang)}</TableHead>
                          <TableHead className="text-xs">{t('cases.caseTitle', lang)}</TableHead>
                          <TableHead className="text-xs">{t('billing.description', lang)}</TableHead>
                          <TableHead className="text-xs hidden md:table-cell">{t('common.type', lang)}</TableHead>
                          <TableHead className="text-xs">{t('billing.amount', lang)}</TableHead>
                          <TableHead className="text-xs">{t('time.billable', lang)}</TableHead>
                          <TableHead className="text-xs">{t('common.actions', lang)}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenses.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-8 text-muted-foreground text-sm"
                            >
                              {t('common.noResults', lang)}
                            </TableCell>
                          </TableRow>
                        ) : (
                          expenses.map((expense) => (
                            <TableRow
                              key={expense.id}
                              className="border-b transition-colors hover:bg-muted/50"
                            >
                              <TableCell className="py-3 px-4 text-xs">
                                {expense.date
                                  ? format(new Date(expense.date), 'MMM d, yyyy')
                                  : '—'}
                              </TableCell>
                              <TableCell className="py-3 px-4 text-xs font-medium">
                                {expense.case
                                  ? `${expense.case.caseNumber}`
                                  : '—'}
                              </TableCell>
                              <TableCell className="py-3 px-4 text-xs max-w-[180px] truncate">
                                {expense.description}
                              </TableCell>
                              <TableCell className="py-3 px-4 text-xs hidden md:table-cell">
                                <Badge variant="outline" className="text-[10px] font-normal">
                                  {t(`expense.${expense.category}`, lang)}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3 px-4 text-xs font-medium">
                                {formatCurrency(expense.amount, expense.currency)}
                              </TableCell>
                              <TableCell className="py-3 px-4">
                                <Badge
                                  variant="outline"
                                  className={
                                    expense.isBillable
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                                      : 'bg-gray-50 text-gray-500 border-gray-200 text-[10px]'
                                  }
                                >
                                  {expense.isBillable
                                    ? t('time.billable', lang)
                                    : '—'}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3 px-4">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-muted-foreground hover:text-rose-600"
                                  onClick={() => deleteExpense(expense.id)}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </Collapsible>

      {/* Manual Time Entry Dialog */}
      <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('time.logEntry', lang)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t('cases.caseTitle', lang)}</Label>
              <Select
                value={manualEntry.caseId}
                onValueChange={(v) =>
                  setManualEntry((prev) => ({ ...prev, caseId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('cases.caseTitle', lang)} />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.caseNumber} – {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('billing.description', lang)}</Label>
              <Input
                value={manualEntry.description}
                onChange={(e) =>
                  setManualEntry((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Hours</Label>
                <Input
                  type="number"
                  min="0"
                  value={manualEntry.durationHours}
                  onChange={(e) =>
                    setManualEntry((prev) => ({
                      ...prev,
                      durationHours: e.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Minutes</Label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={manualEntry.durationMinutes}
                  onChange={(e) =>
                    setManualEntry((prev) => ({
                      ...prev,
                      durationMinutes: e.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('time.activityType', lang)}</Label>
                <Select
                  value={manualEntry.activityType}
                  onValueChange={(v) =>
                    setManualEntry((prev) => ({ ...prev, activityType: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((at) => (
                      <SelectItem key={at} value={at}>
                        {t(`time.${at}`, lang)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('billing.rate', lang)}</Label>
                <Input
                  type="number"
                  min="0"
                  value={manualEntry.rate}
                  onChange={(e) =>
                    setManualEntry((prev) => ({ ...prev, rate: e.target.value }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('common.date', lang)}</Label>
                <Input
                  type="date"
                  value={manualEntry.date}
                  onChange={(e) =>
                    setManualEntry((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-end gap-3 pb-1">
                <Switch
                  checked={manualEntry.isBillable}
                  onCheckedChange={(checked) =>
                    setManualEntry((prev) => ({
                      ...prev,
                      isBillable: !!checked,
                    }))
                  }
                />
                <Label>{t('time.billable', lang)}</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setManualDialogOpen(false)}
            >
              {t('action.cancel', lang)}
            </Button>
            <Button
              onClick={handleCreateManualEntry}
              disabled={
                !manualEntry.description.trim() ||
                !manualEntry.caseId ||
                submitting
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {t('action.submit', lang)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('expense.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t('cases.caseTitle', lang)}</Label>
              <Select
                value={newExpense.caseId}
                onValueChange={(v) =>
                  setNewExpense((prev) => ({ ...prev, caseId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('cases.caseTitle', lang)} />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.caseNumber} – {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('billing.description', lang)}</Label>
              <Input
                value={newExpense.description}
                onChange={(e) =>
                  setNewExpense((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('billing.amount', lang)}</Label>
                <Input
                  type="number"
                  min="0"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('common.type', lang)}</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(v) =>
                    setNewExpense((prev) => ({ ...prev, category: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {t(`expense.${cat}`, lang)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('common.date', lang)}</Label>
                <Input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) =>
                    setNewExpense((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-end gap-3 pb-1">
                <Switch
                  checked={newExpense.isBillable}
                  onCheckedChange={(checked) =>
                    setNewExpense((prev) => ({
                      ...prev,
                      isBillable: !!checked,
                    }))
                  }
                />
                <Label>{t('time.billable', lang)}</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setExpenseDialogOpen(false)}
            >
              {t('action.cancel', lang)}
            </Button>
            <Button
              onClick={handleCreateExpense}
              disabled={
                !newExpense.description.trim() ||
                !newExpense.caseId ||
                !newExpense.amount ||
                submittingExpense
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submittingExpense && <Loader2 className="size-4 animate-spin" />}
              {t('action.submit', lang)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}