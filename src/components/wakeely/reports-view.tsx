'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Briefcase,
  TrendingUp,
  Clock,
  DollarSign,
  AlertTriangle,
  BarChart3,
  CalendarClock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppStore } from '@/stores/app-store';
import { t } from '@/lib/i18n';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AnalyticsData {
  caseMetrics: {
    totalCases: number;
    activeCases: number;
    avgDaysToClose: number;
    casesByType: { type: string; count: number }[];
    casesByStatus: { status: string; count: number }[];
    casesByPriority: { priority: string; count: number }[];
  };
  financialMetrics: {
    totalBilled: number;
    totalCollected: number;
    outstanding: number;
    totalExpenses: number;
    revenueByMonth: { month: string; revenue: number }[];
    topBilledCases: { id: string; caseNumber: string; title: string; totalBilled: number }[];
  };
  timeMetrics: {
    totalHoursLogged: number;
    billableHours: number;
    nonBillableHours: number;
    utilizationRate: number;
    hoursByActivityType: { activityType: string; hours: number }[];
    hoursByLawyer: { lawyerId: string; lawyerName: string; hours: number }[];
  };
  teamMetrics: {
    totalMembers: number;
    activeCasesPerMember: { memberId: string; memberName: string; role: string; activeTaskCount: number }[];
    tasksCompletedByMember: { memberId: string; memberName: string; completedTasks: number }[];
  };
  deadlineMetrics: {
    upcomingDeadlines: {
      id: string; title: string; dueDate: string; priority: string;
      type: string; case: { id: string; caseNumber: string; title: string } | null;
    }[];
    overdueDeadlines: {
      id: string; title: string; dueDate: string; priority: string;
      type: string; case: { id: string; caseNumber: string; title: string } | null;
    }[];
    statuteWarnings: {
      id: string; caseNumber: string; title: string; statuteLimitDate: string; status: string;
    }[];
  };
}

// ─── Color Palette ──────────────────────────────────────────────────────────

const COLORS = ['#10b981', '#f59e0b', '#f43f5e', '#14b8a6', '#f97316', '#a855f7', '#0ea5e9'];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR' }).format(amount);
}

function daysRemaining(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

function StatSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-32" />
      </CardContent>
    </Card>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className={`rounded-lg p-2.5 ${color}`}>
            <Icon className="size-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-lg font-semibold truncate">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
      {label && <p className="font-medium mb-1 text-popover-foreground">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-muted-foreground" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Tab 1: Case Metrics ────────────────────────────────────────────────────

function CaseMetricsTab({ data }: { data: AnalyticsData['caseMetrics'] }) {
  const language = useAppStore((s) => s.language);

  const statusChartData = useMemo(() =>
    data.casesByStatus.map((s) => ({ ...s, status: t(`status.${s.status}`, language) })),
    [data.casesByStatus, language]
  );

  const typeChartData = useMemo(() =>
    data.casesByType.map((ct) => ({ ...ct, type: t(`caseType.${ct.type}`, language) || ct.type })),
    [data.casesByType, language]
  );

  const priorityChartData = useMemo(() =>
    data.casesByPriority.map((p) => ({ ...p, priority: t(`priority.${p.priority}`, language) })),
    [data.casesByPriority, language]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label={language === 'ar' ? 'إجمالي القضايا' : 'Total Cases'} value={data.totalCases.toString()} color="bg-emerald-500" />
        <StatCard icon={TrendingUp} label={language === 'ar' ? 'نشطة' : 'Active'} value={data.activeCases.toString()} color="bg-amber-500" />
        <StatCard icon={BarChart3} label={language === 'ar' ? 'مغلقة' : 'Closed'} value={(data.totalCases - data.activeCases).toString()} color="bg-rose-500" />
        <StatCard icon={Clock} label={language === 'ar' ? 'متوسط أيام الإغلاق' : 'Avg Days to Close'} value={data.avgDaysToClose.toString()} color="bg-teal-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{language === 'ar' ? 'القضايا حسب الحالة' : 'Cases by Status'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusChartData}>
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name={language === 'ar' ? 'العدد' : 'Count'} radius={[4, 4, 0, 0]}>
                  {statusChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{language === 'ar' ? 'القضايا حسب النوع' : 'Cases by Type'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={typeChartData}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ type, percent }) => `${type} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {typeChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{language === 'ar' ? 'القضايا حسب الأولوية' : 'Cases by Priority'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={priorityChartData}>
                <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name={language === 'ar' ? 'العدد' : 'Count'} radius={[4, 4, 0, 0]}>
                  {priorityChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Tab 2: Financial ───────────────────────────────────────────────────────

function FinancialTab({ data }: { data: AnalyticsData['financialMetrics'] }) {
  const language = useAppStore((s) => s.language);

  const revenueData = useMemo(() =>
    data.revenueByMonth.map((r) => {
      const [y, m] = r.month.split('-');
      const date = new Date(Number(y), Number(m) - 1);
      return {
        month: date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', year: '2-digit' }),
        revenue: r.revenue,
      };
    }),
    [data.revenueByMonth, language]
  );

  const topCasesData = useMemo(() =>
    data.topBilledCases.map((c) => ({
      name: `${c.caseNumber} \u2013 ${c.title}`,
      amount: c.totalBilled,
    }))
      .sort((a, b) => a.amount - b.amount),
    [data.topBilledCases]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label={language === 'ar' ? 'إجمالي المفوتر' : 'Total Billed'} value={formatCurrency(data.totalBilled)} color="bg-emerald-500" />
        <StatCard icon={TrendingUp} label={language === 'ar' ? 'المحصل' : 'Collected'} value={formatCurrency(data.totalCollected)} color="bg-teal-500" />
        <StatCard icon={AlertTriangle} label={language === 'ar' ? 'غير المسدد' : 'Outstanding'} value={formatCurrency(data.outstanding)} color="bg-amber-500" />
        <StatCard icon={BarChart3} label={language === 'ar' ? 'المصروفات' : 'Expenses'} value={formatCurrency(data.totalExpenses)} color="bg-rose-500" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{language === 'ar' ? 'الإيرادات الشهرية' : 'Revenue by Month'}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={revenueData}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="revenue"
                name={language === 'ar' ? 'الإيرادات' : 'Revenue'}
                stroke="#10b981"
                fill="url(#revenueGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{language === 'ar' ? 'أعلى 5 قضايا من حيث الفوترة' : 'Top 5 Billed Cases'}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={Math.max(200, topCasesData.length * 50)}>
            <BarChart data={topCasesData} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={250} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" name={language === 'ar' ? 'المبلغ' : 'Amount'} radius={[0, 4, 4, 0]}>
                {topCasesData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab 3: Time Report ─────────────────────────────────────────────────────

function TimeReportTab({ data }: { data: AnalyticsData['timeMetrics'] }) {
  const language = useAppStore((s) => s.language);

  const activityData = useMemo(() =>
    data.hoursByActivityType.map((a) => ({
      activityType: a.activityType,
      hours: a.hours,
    })),
    [data.hoursByActivityType]
  );

  const lawyerData = useMemo(() =>
    data.hoursByLawyer.map((l) => ({
      lawyerName: l.lawyerName,
      hours: l.hours,
    })),
    [data.hoursByLawyer]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Clock} label={language === 'ar' ? 'إجمالي الساعات' : 'Total Hours'} value={`${data.totalHoursLogged}h`} color="bg-emerald-500" />
        <StatCard icon={TrendingUp} label={language === 'ar' ? 'ساعات قابلة للفوترة' : 'Billable Hours'} value={`${data.billableHours}h`} color="bg-amber-500" />
        <StatCard icon={BarChart3} label={language === 'ar' ? 'نسبة الاستخدام' : 'Utilization Rate'} value={`${data.utilizationRate}%`} color="bg-teal-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{language === 'ar' ? 'الساعات حسب النشاط' : 'Hours by Activity Type'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={activityData}
                  dataKey="hours"
                  nameKey="activityType"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ activityType, percent }) => `${activityType} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {activityData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{language === 'ar' ? 'الساعات حسب المحامي' : 'Hours by Lawyer'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={lawyerData}>
                <XAxis dataKey="lawyerName" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" name={language === 'ar' ? 'الساعات' : 'Hours'} radius={[4, 4, 0, 0]}>
                  {lawyerData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Tab 4: Team Performance ───────────────────────────────────────────────

function TeamPerformanceTab({ data }: { data: AnalyticsData['teamMetrics'] }) {
  const language = useAppStore((s) => s.language);

  const memberRows = useMemo(() => {
    const completedMap = new Map(data.tasksCompletedByMember.map((m) => [m.memberId, m.completedTasks]));
    return data.activeCasesPerMember.map((m) => ({
      ...m,
      completedTasks: completedMap.get(m.memberId) || 0,
    }));
  }, [data.activeCasesPerMember, data.tasksCompletedByMember]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{language === 'ar' ? 'أداء أعضاء الفريق' : 'Team Member Performance'}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'ar' ? 'الاسم' : 'Name'}</TableHead>
                  <TableHead>{language === 'ar' ? 'الدور' : 'Role'}</TableHead>
                  <TableHead className="text-center">{language === 'ar' ? 'مهام نشطة' : 'Active Tasks'}</TableHead>
                  <TableHead className="text-center">{language === 'ar' ? 'مهام مكتملة' : 'Tasks Completed'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      {t('common.noResults', language)}
                    </TableCell>
                  </TableRow>
                ) : (
                  memberRows.map((m) => (
                    <TableRow key={m.memberId}>
                      <TableCell className="font-medium">{m.memberName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">{m.role}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{m.activeTaskCount}</TableCell>
                      <TableCell className="text-center">{m.completedTasks}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {memberRows.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{language === 'ar' ? 'مقارنة الأعضاء' : 'Member Comparison'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(200, memberRows.length * 50)}>
              <BarChart data={memberRows} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis type="category" dataKey="memberName" width={120} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="activeTaskCount" name={language === 'ar' ? 'نشطة' : 'Active'} fill="#f59e0b" radius={[0, 4, 4, 0]} />
                <Bar dataKey="completedTasks" name={language === 'ar' ? 'مكتملة' : 'Completed'} fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Tab 5: Deadlines ───────────────────────────────────────────────────────

function DeadlineItem({ title, caseInfo, dueDate, isOverdue, isStatute }: {
  title: string;
  caseInfo?: { caseNumber: string; title: string } | null;
  dueDate: string;
  isOverdue: boolean;
  isStatute?: boolean;
}) {
  const language = useAppStore((s) => s.language);
  const days = daysRemaining(dueDate);

  const borderColor = isOverdue
    ? 'border-r-rose-500'
    : isStatute
      ? 'border-r-amber-500'
      : days <= 7
        ? 'border-r-orange-500'
        : 'border-r-emerald-500';

  const bgColor = isOverdue
    ? 'bg-rose-50'
    : isStatute
      ? 'bg-amber-50'
      : 'bg-white';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`border border-r-4 ${borderColor} rounded-lg ${bgColor} p-3 flex items-center justify-between gap-3`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{title}</p>
        {caseInfo && (
          <p className="text-xs text-muted-foreground truncate">
            {caseInfo.caseNumber} \u2013 {caseInfo.title}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isOverdue && (
          <Badge className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100">
            <AlertTriangle className="size-3 me-1" />
            {language === 'ar' ? 'متأخر' : 'Overdue'}
          </Badge>
        )}
        {isStatute && !isOverdue && (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
            <AlertTriangle className="size-3 me-1" />
            {language === 'ar' ? 'تقادم' : 'Statute'}
          </Badge>
        )}
        <span className={`text-xs font-medium ${isOverdue ? 'text-rose-600' : isStatute ? 'text-amber-600' : 'text-muted-foreground'}`}>
          {isOverdue
            ? (language === 'ar' ? `${Math.abs(days)} يوم مضت` : `${Math.abs(days)}d overdue`)
            : (language === 'ar' ? `${days} يوم متبقي` : `${days}d remaining`)
          }
        </span>
      </div>
    </motion.div>
  );
}

function DeadlineReportTab({ data }: { data: AnalyticsData['deadlineMetrics'] }) {
  const language = useAppStore((s) => s.language);

  const hasContent = data.overdueDeadlines.length > 0 || data.upcomingDeadlines.length > 0 || data.statuteWarnings.length > 0;

  return (
    <div className="space-y-6">
      {!hasContent && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CalendarClock className="size-10 mx-auto mb-3 opacity-40" />
            <p>{language === 'ar' ? 'لا توجد مواعيد نهائية قادمة' : 'No upcoming deadlines'}</p>
          </CardContent>
        </Card>
      )}

      {data.overdueDeadlines.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-rose-600 flex items-center gap-1.5">
            <AlertTriangle className="size-4" />
            {language === 'ar' ? 'المواعيد المتأخرة' : 'Overdue Deadlines'} ({data.overdueDeadlines.length})
          </h3>
          <div className="space-y-2">
            {data.overdueDeadlines.map((d) => (
              <DeadlineItem
                key={d.id}
                title={d.title}
                caseInfo={d.case}
                dueDate={d.dueDate}
                isOverdue
              />
            ))}
          </div>
        </div>
      )}

      {data.statuteWarnings.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-amber-600 flex items-center gap-1.5">
            <AlertTriangle className="size-4" />
            {language === 'ar' ? 'تحذيرات التقادم (60 يوم)' : 'Statute of Limitations Warnings (60 days)'} ({data.statuteWarnings.length})
          </h3>
          <div className="space-y-2">
            {data.statuteWarnings.map((s) => (
              <DeadlineItem
                key={s.id}
                title={s.title}
                caseInfo={{ caseNumber: s.caseNumber, title: s.title }}
                dueDate={s.statuteLimitDate}
                isOverdue={false}
                isStatute
              />
            ))}
          </div>
        </div>
      )}

      {data.upcomingDeadlines.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
            <CalendarClock className="size-4" />
            {language === 'ar' ? 'المواعيد النهائية القادمة (30 يوم)' : 'Upcoming Deadlines (30 days)'} ({data.upcomingDeadlines.length})
          </h3>
          <div className="space-y-2">
            {data.upcomingDeadlines.map((d) => (
              <DeadlineItem
                key={d.id}
                title={d.title}
                caseInfo={d.case}
                dueDate={d.dueDate}
                isOverdue={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Reports View ──────────────────────────────────────────────────────

export function ReportsView() {
  const language = useAppStore((s) => s.language);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const tabs = [
    { value: 'caseMetrics', label: t('reports.caseMetrics', language) },
    { value: 'financial', label: t('reports.financial', language) },
    { value: 'time', label: t('reports.timeReport', language) },
    { value: 'team', label: t('reports.teamPerformance', language) },
    { value: 'deadlines', label: t('reports.deadlineReport', language) },
  ];

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('reports.title', language)}</h1>
        </div>
      </div>

      <Tabs defaultValue="caseMetrics">
        <TabsList className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="caseMetrics">
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartSkeleton /><ChartSkeleton />
              </div>
            </div>
          ) : data ? (
            <CaseMetricsTab data={data.caseMetrics} />
          ) : null}
        </TabsContent>

        <TabsContent value="financial">
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
              </div>
              <ChartSkeleton /><ChartSkeleton />
            </div>
          ) : data ? (
            <FinancialTab data={data.financialMetrics} />
          ) : null}
        </TabsContent>

        <TabsContent value="time">
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatSkeleton /><StatSkeleton /><StatSkeleton />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartSkeleton /><ChartSkeleton />
              </div>
            </div>
          ) : data ? (
            <TimeReportTab data={data.timeMetrics} />
          ) : null}
        </TabsContent>

        <TabsContent value="team">
          {loading ? (
            <ChartSkeleton />
          ) : data ? (
            <TeamPerformanceTab data={data.teamMetrics} />
          ) : null}
        </TabsContent>

        <TabsContent value="deadlines">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : data ? (
            <DeadlineReportTab data={data.deadlineMetrics} />
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
