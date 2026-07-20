'use client';

import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  Briefcase,
  Activity,
  Calendar,
  DollarSign,
  FileText,
  Users,
  CreditCard,
  CheckSquare,
  Clock,
  ArrowUpRight,
  Scale,
  Gavel,
  MessageSquare,
  Star,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppStore, type DashboardStats } from '@/stores/app-store';
import { t } from '@/lib/i18n';

// ─── Color Helpers ──────────────────────────────────────────────────────────

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    intake: 'bg-slate-100 text-slate-700 border-slate-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    discovery: 'bg-amber-50 text-amber-700 border-amber-200',
    trial: 'bg-rose-50 text-rose-700 border-rose-200',
    settlement: 'bg-teal-50 text-teal-700 border-teal-200',
    appeal: 'bg-orange-50 text-orange-700 border-orange-200',
    closed: 'bg-gray-100 text-gray-600 border-gray-200',
    archived: 'bg-slate-100 text-slate-500 border-slate-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-600 border-gray-200';
}

function getCaseTypeColor(type: string) {
  const colors: Record<string, string> = {
    civil: 'text-emerald-700 bg-emerald-50',
    criminal: 'text-rose-700 bg-rose-50',
    commercial: 'text-amber-700 bg-amber-50',
    labor: 'text-teal-700 bg-teal-50',
    family: 'text-purple-700 bg-purple-50',
    real_estate: 'text-orange-700 bg-orange-50',
    other: 'text-slate-600 bg-slate-50',
  };
  return colors[type] || 'text-slate-600 bg-slate-50';
}

const statusChartColors: Record<string, string> = {
  intake: '#64748b',
  active: '#059669',
  discovery: '#d97706',
  trial: '#e11d48',
  settlement: '#0d9488',
  appeal: '#ea580c',
  closed: '#9ca3af',
  archived: '#475569',
};

const caseTypeChartColors: Record<string, string> = {
  civil: '#059669',
  criminal: '#e11d48',
  commercial: '#d97706',
  labor: '#0d9488',
  family: '#7c3aed',
  real_estate: '#ea580c',
  other: '#64748b',
};

// ─── Animation Variants ─────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' },
  }),
};

// ─── Activity Icon Mapper ───────────────────────────────────────────────────

function getActivityIcon(entity: string) {
  switch (entity) {
    case 'case':
      return <Briefcase className="w-4 h-4 text-emerald-600" />;
    case 'task':
      return <CheckSquare className="w-4 h-4 text-amber-600" />;
    case 'document':
      return <FileText className="w-4 h-4 text-slate-600" />;
    case 'billing':
      return <CreditCard className="w-4 h-4 text-teal-600" />;
    case 'client':
      return <Users className="w-4 h-4 text-orange-600" />;
    case 'hearing':
      return <Gavel className="w-4 h-4 text-rose-600" />;
    default:
      return <Activity className="w-4 h-4 text-slate-500" />;
  }
}

function getActivityIconBg(entity: string) {
  switch (entity) {
    case 'case':
      return 'bg-emerald-50';
    case 'task':
      return 'bg-amber-50';
    case 'document':
      return 'bg-slate-100';
    case 'billing':
      return 'bg-teal-50';
    case 'client':
      return 'bg-orange-50';
    case 'hearing':
      return 'bg-rose-50';
    default:
      return 'bg-slate-50';
  }
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

function CustomBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { status: string } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const status = payload[0].payload.status;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-medium text-slate-900">{label}</p>
      <p className="text-slate-500">
        {payload[0].value} {t('dashboard.totalCases', 'en').toLowerCase()}
      </p>
    </div>
  );
}

function CustomPieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { caseType: string } }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-medium text-slate-900">{payload[0].name}</p>
      <p className="text-slate-500">
        {payload[0].value} {t('dashboard.totalCases', 'en').toLowerCase()}
      </p>
    </div>
  );
}

// ─── Stat Card Skeleton ─────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
    </Card>
  );
}

// ─── Chart Skeleton ─────────────────────────────────────────────────────────

const CHART_SKELETON_HEIGHTS = [65, 40, 85, 55, 95, 45];

function ChartSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-5 w-36 mb-6" />
      <div className="flex items-end gap-2 h-48">
        {CHART_SKELETON_HEIGHTS.map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
        ))}
      </div>
    </Card>
  );
}

// ─── Pro Banner ─────────────────────────────────────────────────────────────

function ProBanner({ language, featureFlags }: { language: 'en' | 'ar'; featureFlags: Record<string, boolean> }) {
  const enabledFeatures = Object.entries(featureFlags)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);

  if (enabledFeatures.length === 0) return null;

  const featureLabels: Record<string, { en: string; ar: string }> = {
    pro_dashboard: { en: 'Pro Dashboard', ar: 'لوحة تحكم برو' },
    advanced_analytics: { en: 'Advanced Analytics', ar: 'تحليلات متقدمة' },
    ai_assist: { en: 'AI Legal Assistant', ar: 'مساعد قانوني ذكي' },
    client_portal_sync: { en: 'Client Portal Sync', ar: 'مزامنة بوابة العميل' },
    bulk_operations: { en: 'Bulk Operations', ar: 'عمليات جماعية' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-l from-emerald-600 via-teal-600 to-emerald-700 px-6 py-4 text-white shadow-lg shadow-emerald-900/10">
        {/* Decorative circles */}
        <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-white/5" />
        <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/5" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-white/15 backdrop-blur-sm">
              <Star className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">
                {language === 'ar' ? 'واكيلي برو' : 'Wakeely Pro'}
              </h3>
              <p className="text-emerald-100 text-xs mt-0.5">
                {language === 'ar' ? 'الميزات المفعّلة:' : 'Active features:'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {enabledFeatures.map((key) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-medium"
              >
                {featureLabels[key]
                  ? featureLabels[key][language]
                  : key.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function DashboardView() {
  const {
    dashboardStats,
    setDashboardStats,
    language,
    setCurrentView,
    setSelectedCaseId,
    featureFlags,
    setFeatureFlags,
    isProMode,
  } = useAppStore();

  const isRtl = language === 'ar';

  // ─── Data Fetching ───────────────────────────────────────────────────────

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, flagsRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/feature-flags'),
        ]);
        const dashData = await dashRes.json();
        const flagsData = await flagsRes.json();

        // Transform dashboard data
        const stats: DashboardStats = {
          totalCases: dashData.totalCases,
          activeCases:
            dashData.casesByStatus?.find((s: { status: string }) => s.status === 'active')
              ?.count ?? 0,
          pendingCases:
            dashData.casesByStatus?.find((s: { status: string }) => s.status === 'intake')
              ?.count ?? 0,
          closedCases:
            dashData.casesByStatus?.find((s: { status: string }) => s.status === 'closed')
              ?.count ?? 0,
          totalRevenue: dashData.billingSummary?.totalPaid ?? 0,
          pendingRevenue: dashData.billingSummary?.outstanding ?? 0,
          overdueTasks: dashData.billingSummary?.overdueCount ?? 0,
          upcomingHearings: dashData.nextHearings?.length ?? 0,
          casesByStatus: dashData.casesByStatus ?? [],
          casesByType: dashData.caseTypeDistribution ?? [],
          recentCases: dashData.recentCases ?? [],
          upcomingTasks: dashData.upcomingTasks ?? [],
          recentActivity: dashData.recentActivity ?? [],
        };
        setDashboardStats(stats);

        // Transform feature flags
        const flagMap: Record<string, boolean> = {};
        (flagsData.flags ?? []).forEach((f: { key: string; enabled: boolean }) => {
          flagMap[f.key] = f.enabled;
        });
        setFeatureFlags(flagMap);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      }
    }
    loadData();
  }, [setDashboardStats, setFeatureFlags]);

  // ─── Computed Data ───────────────────────────────────────────────────────

  const barChartData = useMemo(() => {
    if (!dashboardStats) return [];
    return dashboardStats.casesByStatus.map((item) => ({
      ...item,
      fill: statusChartColors[item.status] || '#9ca3af',
    }));
  }, [dashboardStats]);

  const pieChartData = useMemo(() => {
    if (!dashboardStats) return [];
    return dashboardStats.casesByType.map((item) => ({
      ...item,
      name:
        t(`caseType.${item.caseType === 'real_estate' ? 'realEstate' : item.caseType}`, language) ||
        item.caseType,
      fill: caseTypeChartColors[item.caseType] || '#64748b',
    }));
  }, [dashboardStats, language]);

  const statCards = useMemo(() => {
    if (!dashboardStats) return [];
    return [
      {
        label: t('dashboard.totalCases', language),
        value: dashboardStats.totalCases,
        icon: Briefcase,
        bgClass: 'bg-emerald-50',
        iconClass: 'text-emerald-600',
        borderClass: 'border-emerald-100',
      },
      {
        label: t('dashboard.activeCases', language),
        value: dashboardStats.activeCases,
        icon: Activity,
        bgClass: 'bg-amber-50',
        iconClass: 'text-amber-600',
        borderClass: 'border-amber-100',
      },
      {
        label: t('dashboard.upcomingHearings', language),
        value: dashboardStats.upcomingHearings,
        icon: Calendar,
        bgClass: 'bg-rose-50',
        iconClass: 'text-rose-600',
        borderClass: 'border-rose-100',
      },
      {
        label: t('dashboard.totalRevenue', language),
        value: `${(dashboardStats.totalRevenue / 1000).toFixed(0)}K`,
        icon: DollarSign,
        bgClass: 'bg-emerald-50',
        iconClass: 'text-emerald-600',
        borderClass: 'border-emerald-100',
      },
    ];
  }, [dashboardStats, language]);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Pro Features Banner */}
      {isProMode() && <ProBanner language={language} featureFlags={featureFlags} />}

      {/* ─── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats
          ? statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  custom={i}
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="p-6 hover:shadow-md transition-shadow duration-200 cursor-default">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex items-center justify-center h-12 w-12 rounded-xl ${card.bgClass} ${card.borderClass} border`}
                      >
                        <Icon className={`w-6 h-6 ${card.iconClass}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-500 truncate">{card.label}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-0.5">{card.value}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          : Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
              >
                <StatCardSkeleton />
              </motion.div>
            ))}
      </div>

      {/* ─── Charts Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart — Cases by Status */}
        {dashboardStats ? (
          <motion.div custom={4} variants={fadeInUp} initial="hidden" animate="visible">
            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base font-semibold text-slate-900">
                  {t('dashboard.casesByStatus', language)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {barChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={barChartData}
                      margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="status"
                        tickFormatter={(val: string) =>
                          t(`status.${val}`, language)
                        }
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar
                        dataKey="count"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={48}
                      >
                        {barChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                    {t('dashboard.noData', language)}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div custom={4} variants={fadeInUp} initial="hidden" animate="visible">
            <ChartSkeleton />
          </motion.div>
        )}

        {/* Pie Chart — Cases by Type */}
        {dashboardStats ? (
          <motion.div custom={5} variants={fadeInUp} initial="hidden" animate="visible">
            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base font-semibold text-slate-900">
                  {t('dashboard.casesByType', language)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="count"
                        nameKey="name"
                        stroke="none"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        formatter={(value: string) => (
                          <span className="text-xs text-slate-600">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                    {t('dashboard.noData', language)}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div custom={5} variants={fadeInUp} initial="hidden" animate="visible">
            <ChartSkeleton />
          </motion.div>
        )}
      </div>

      {/* ─── Bottom Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases Table */}
        {dashboardStats ? (
          <motion.div custom={6} variants={fadeInUp} initial="hidden" animate="visible">
            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    {t('dashboard.recentCases', language)}
                  </CardTitle>
                  <button
                    onClick={() => setCurrentView('cases')}
                    className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    {t('action.view', language)}
                    <ArrowUpRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {dashboardStats.recentCases.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-slate-100">
                        <TableHead className="text-xs font-medium text-slate-500">
                          {t('cases.caseNumber', language)}
                        </TableHead>
                        <TableHead className="text-xs font-medium text-slate-500">
                          {t('cases.caseTitle', language)}
                        </TableHead>
                        <TableHead className="text-xs font-medium text-slate-500">
                          {t('cases.caseType', language)}
                        </TableHead>
                        <TableHead className="text-xs font-medium text-slate-500">
                          {t('common.status', language)}
                        </TableHead>
                        <TableHead className="text-xs font-medium text-slate-500">
                          {t('cases.client', language)}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardStats.recentCases.slice(0, 5).map((c) => (
                        <TableRow
                          key={c.id}
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedCaseId(c.id);
                            setCurrentView('cases');
                          }}
                        >
                          <TableCell className="text-xs font-mono text-slate-500">
                            {c.caseNumber}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-slate-900 max-w-[140px] truncate">
                            {c.title}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getCaseTypeColor(c.caseType)}`}
                            >
                              {t(
                                `caseType.${c.caseType === 'real_estate' ? 'realEstate' : c.caseType}`,
                                language,
                              )}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getStatusColor(c.status)}`}
                            >
                              {t(`status.${c.status}`, language)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600 max-w-[120px] truncate">
                            {c.client?.fullName ?? '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
                    <Briefcase className="w-8 h-8 mb-2 text-slate-300" />
                    {t('cases.noCases', language)}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div custom={6} variants={fadeInUp} initial="hidden" animate="visible">
            <Card className="p-6">
              <Skeleton className="h-5 w-36 mb-6" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Recent Activity Feed */}
        {dashboardStats ? (
          <motion.div custom={7} variants={fadeInUp} initial="hidden" animate="visible">
            <Card className="p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base font-semibold text-slate-900">
                  {t('dashboard.recentActivity', language)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {dashboardStats.recentActivity.length > 0 ? (
                  <ScrollArea className="max-h-96">
                    <div className="space-y-1">
                      {dashboardStats.recentActivity.map((activity, idx) => (
                        <div
                          key={activity.id}
                          className={`flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors ${
                            idx < dashboardStats.recentActivity.length - 1
                              ? ''
                              : ''
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center h-8 w-8 rounded-lg shrink-0 mt-0.5 ${getActivityIconBg(activity.entity)}`}
                          >
                            {getActivityIcon(activity.entity)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {activity.lawyer?.name && (
                                <span className="font-semibold text-slate-900">
                                  {activity.lawyer.name}
                                </span>
                              )}
                              {activity.lawyer?.name ? ' ' : ''}
                              {activity.description ?? activity.action}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-400">
                                {formatDistanceToNow(new Date(activity.createdAt), {
                                  addSuffix: true,
                                  locale: language === 'ar' ? ar : undefined,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
                    <MessageSquare className="w-8 h-8 mb-2 text-slate-300" />
                    {t('dashboard.noData', language)}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div custom={7} variants={fadeInUp} initial="hidden" animate="visible">
            <Card className="p-6">
              <Skeleton className="h-5 w-36 mb-6" />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default DashboardView;