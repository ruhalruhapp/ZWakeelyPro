'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Plus,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Inbox,
  Loader2,
  Send,
} from 'lucide-react';
import { useAppStore, type BillingItem } from '@/stores/app-store';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

// ─── Color Maps ───────────────────────────────────────────────────────────────

const BILLING_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  sent: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  overdue: 'bg-rose-50 text-rose-700 border-rose-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

// ─── Extended billing type from API ───────────────────────────────────────────

interface BillingWithCase extends BillingItem {
  case?: { id: string; caseNumber: string; title: string } | null;
}

// ─── Currency Formatting ──────────────────────────────────────────────────────

function formatCurrency(amount: number, lang: string): string {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-SA', {
    style: 'currency',
    currency: 'SAR',
  }).format(amount);
}

// ─── Status Filters ───────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  'all',
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled',
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function statusFilterLabel(s: StatusFilter, lang: string): string {
  if (s === 'all') return t('common.all', lang);
  return t(`billingStatus.${s}`, lang);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BillingView() {
  const { language, cases } = useAppStore();
  const lang = language;
  const isRtl = lang === 'ar';

  const [billings, setBillings] = useState<BillingWithCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('all');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    description: '',
    caseId: '',
    hours: '',
    rate: '',
    amount: '',
    status: 'draft',
    invoiceDate: '',
    dueDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch billings
  const fetchBillings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      const res = await fetch(`/api/billing?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBillings(Array.isArray(data) ? data : data.billings ?? []);
      }
    } catch {
      toast.error(t('common.error', lang));
    } finally {
      setLoading(false);
    }
  }, [filter, lang]);

  useEffect(() => {
    fetchBillings();
  }, [fetchBillings]);

  // Summary stats
  const stats = useMemo(() => {
    const all = billings;
    const totalBilled = all.reduce((sum, b) => sum + b.amount, 0);
    const totalPaid = all
      .filter((b) => b.status === 'paid')
      .reduce((sum, b) => sum + b.amount, 0);
    const outstanding = all
      .filter((b) => b.status === 'sent' || b.status === 'draft')
      .reduce((sum, b) => sum + b.amount, 0);
    const overdue = all
      .filter((b) => b.status === 'overdue')
      .reduce((sum, b) => sum + b.amount, 0);
    return { totalBilled, totalPaid, outstanding, overdue };
  }, [billings]);

  // Table total
  const tableTotal = useMemo(
    () => billings.reduce((sum, b) => sum + b.amount, 0),
    [billings],
  );

  // Auto-calculate amount from hours × rate
  function updateForm(field: string, value: string) {
    const next = { ...form, [field]: value };
    if (field === 'hours' || field === 'rate') {
      const h = parseFloat(field === 'hours' ? value : next.hours);
      const r = parseFloat(field === 'rate' ? value : next.rate);
      if (!isNaN(h) && !isNaN(r)) {
        next.amount = String(h * r);
      }
    }
    setForm(next);
  }

  // Create invoice
  async function createInvoice() {
    if (!form.description.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: form.description.trim(),
          caseId: form.caseId || undefined,
          hours: form.hours ? parseFloat(form.hours) : undefined,
          rate: form.rate ? parseFloat(form.rate) : undefined,
          amount: form.amount ? parseFloat(form.amount) : 0,
          status: form.status,
          invoiceDate: form.invoiceDate || undefined,
          dueDate: form.dueDate || undefined,
          currency: 'SAR',
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setBillings((prev) => [created, ...prev]);
        setDialogOpen(false);
        setForm({
          description: '',
          caseId: '',
          hours: '',
          rate: '',
          amount: '',
          status: 'draft',
          invoiceDate: '',
          dueDate: '',
        });
        toast.success(t('billing.createSuccess', lang));
      }
    } catch {
      toast.error(t('common.error', lang));
    } finally {
      setSubmitting(false);
    }
  }

  // Stat card component
  function StatCard({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: React.ElementType;
    label: string;
    value: number;
    color: string;
  }) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center size-10 rounded-lg ${color}`}
            >
              <Icon className="size-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(value, lang)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredBillings =
    filter === 'all' ? billings : billings.filter((b) => b.status === filter);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('billing.title', lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('common.showing', lang)} {filteredBillings.length}{' '}
            {t('common.of', lang)} {billings.length} {t('common.results', lang)}
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          <Plus className="size-4" />
          {t('billing.newInvoice', lang)}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label={t('billing.total', lang)}
          value={stats.totalBilled}
          color="bg-emerald-600"
        />
        <StatCard
          icon={CheckCircle2}
          label={t('billingStatus.paid', lang)}
          value={stats.totalPaid}
          color="bg-teal-600"
        />
        <StatCard
          icon={Clock}
          label={lang === 'ar' ? 'قيد الانتظار' : 'Outstanding'}
          value={stats.outstanding}
          color="bg-amber-600"
        />
        <StatCard
          icon={AlertTriangle}
          label={t('billingStatus.overdue', lang)}
          value={stats.overdue}
          color="bg-rose-600"
        />
      </div>

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

      {/* Billing Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : filteredBillings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <Inbox className="size-10 opacity-40" />
            <p className="text-sm font-medium">
              {t('billing.noBillings', lang)}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">
                    {t('billing.description', lang)}
                  </TableHead>
                  <TableHead className="font-semibold hidden sm:table-cell">
                    {t('nav.cases', lang)}
                  </TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">
                    {t('billing.hours', lang)}
                  </TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">
                    {t('billing.rate', lang)}
                  </TableHead>
                  <TableHead className="font-semibold">
                    {t('billing.amount', lang)}
                  </TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">
                    {t('common.status', lang)}
                  </TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">
                    {t('billing.invoiceDate', lang)}
                  </TableHead>
                  <TableHead className="font-semibold text-end">
                    {t('common.actions', lang)}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredBillings.map((item, idx) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className="border-b border-border/50 transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-medium text-sm">
                        {item.description}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {item.case ? (
                          <span className="truncate max-w-[160px] block">
                            {item.case.caseNumber} – {item.case.title}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {item.hours ?? '—'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {item.rate
                          ? formatCurrency(item.rate, lang)
                          : '—'}
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        {formatCurrency(item.amount, lang)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge
                          variant="outline"
                          className={`font-normal text-xs ${
                            BILLING_STATUS_COLORS[item.status] ?? ''
                          }`}
                        >
                          {t(`billingStatus.${item.status}`, lang)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {item.invoiceDate
                          ? format(new Date(item.invoiceDate), 'yyyy-MM-dd')
                          : '—'}
                      </TableCell>
                      <TableCell className="text-end">
                        {item.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={async () => {
                              try {
                                // Mark as sent via update
                                const res = await fetch(
                                  `/api/billing/${item.id}`,
                                  {
                                    method: 'PUT',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      status: 'sent',
                                    }),
                                  },
                                );
                                if (res.ok) {
                                  setBillings((prev) =>
                                    prev.map((b) =>
                                      b.id === item.id
                                        ? { ...b, status: 'sent' }
                                        : b,
                                    ),
                                  );
                                  toast.success(
                                    t('billing.sendSuccess', lang),
                                  );
                                }
                              } catch {
                                toast.error(t('common.error', lang));
                              }
                            }}
                          >
                            <Send className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
              {/* Summary Row */}
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/30">
                  <TableCell
                    colSpan={4}
                    className="font-bold text-end"
                  >
                    {t('billing.total', lang)}
                  </TableCell>
                  <TableCell className="font-bold text-sm">
                    {formatCurrency(tableTotal, lang)}
                  </TableCell>
                  <TableCell colSpan={3} />
                </TableRow>
              </TableHeader>
            </Table>
          </div>
        )}
      </Card>

      {/* New Invoice Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('billing.newInvoice', lang)}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="billing-description">
                {t('billing.description', lang)}{' '}
                <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="billing-description"
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                placeholder={t('billing.description', lang)}
              />
            </div>

            {/* Case Select */}
            <div className="space-y-2">
              <Label>{t('nav.cases', lang)}</Label>
              <Select value={form.caseId} onValueChange={(v) => updateForm('caseId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('nav.cases', lang)} />
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
            </div>

            {/* Hours & Rate */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billing-hours">
                  {t('billing.hours', lang)}
                </Label>
                <Input
                  id="billing-hours"
                  type="number"
                  min="0"
                  step="0.25"
                  value={form.hours}
                  onChange={(e) => updateForm('hours', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing-rate">
                  {t('billing.rate', lang)} (SAR)
                </Label>
                <Input
                  id="billing-rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.rate}
                  onChange={(e) => updateForm('rate', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Amount (auto-calculated or manual) */}
            <div className="space-y-2">
              <Label htmlFor="billing-amount">
                {t('billing.amount', lang)} (SAR)
              </Label>
              <Input
                id="billing-amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => updateForm('amount', e.target.value)}
                placeholder="0"
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>{t('common.status', lang)}</Label>
              <Select
                value={form.status}
                onValueChange={(v) => updateForm('status', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['draft', 'sent', 'paid', 'overdue', 'cancelled'].map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {t(`billingStatus.${s}`, lang)}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billing-invoiceDate">
                  {t('billing.invoiceDate', lang)}
                </Label>
                <Input
                  id="billing-invoiceDate"
                  type="date"
                  value={form.invoiceDate}
                  onChange={(e) =>
                    updateForm('invoiceDate', e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing-dueDate">
                  {t('billing.dueDate', lang)}
                </Label>
                <Input
                  id="billing-dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => updateForm('dueDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              {t('action.cancel', lang)}
            </Button>
            <Button
              onClick={createInvoice}
              disabled={!form.description.trim() || submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {t('action.create', lang)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}