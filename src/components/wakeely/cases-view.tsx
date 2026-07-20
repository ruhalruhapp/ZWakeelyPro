'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Plus,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  MoreHorizontal,
  Trash2,
  Eye,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAppStore, type CaseItem } from '@/stores/app-store';
import { t } from '@/lib/i18n';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CaseDetailView } from './case-detail-view';
import { CreateCaseDialog } from './create-case-dialog';

// ─── Status Color Map ─────────────────────────────────────────────────────────

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

const STATUS_LIST = [
  'intake',
  'active',
  'discovery',
  'trial',
  'settlement',
  'appeal',
  'closed',
  'archived',
];

const TYPE_LIST = [
  'civil',
  'criminal',
  'commercial',
  'labor',
  'family',
  'real_estate',
  'other',
];

const PRIORITY_LIST = ['low', 'medium', 'high', 'urgent'];

// ─── Component ───────────────────────────────────────────────────────────────

export function CasesListView() {
  const {
    language,
    selectedCaseId,
    setSelectedCaseId,
    setCurrentView,
    cases,
    setCases,
    removeCase,
    createCaseDialogOpen,
    setCreateCaseDialogOpen,
    isLoading,
    setIsLoading,
  } = useAppStore();

  const isRtl = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  // Filter / search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [totalCount, setTotalCount] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search (300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // Fetch cases
  const fetchCases = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('limit', '100');
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filterStatus) params.set('status', filterStatus);
      if (filterType) params.set('caseType', filterType);
      if (filterPriority) params.set('priority', filterPriority);

      const res = await fetch(`/api/cases?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const list: CaseItem[] = Array.isArray(data) ? data : data.cases ?? data.data ?? [];
        setCases(list);
        setTotalCount(Array.isArray(data) ? data.length : data.total ?? list.length);
      }
    } catch {
      toast.error(t('common.error', language));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, filterStatus, filterType, filterPriority, setCases, setIsLoading, language]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Delete case
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/cases/${id}`, { method: 'DELETE' });
      if (res.ok) {
        removeCase(id);
        toast.success(t('cases.deleteSuccess', language));
      } else {
        toast.error(t('common.error', language));
      }
    } catch {
      toast.error(t('common.error', language));
    }
  };

  // Row click → open detail
  const handleRowClick = (caseId: string) => {
    setSelectedCaseId(caseId);
  };

  // Back to list
  const handleBack = () => {
    setSelectedCaseId(null);
  };

  // If a case is selected, show detail view
  if (selectedCaseId) {
    return <CaseDetailView caseId={selectedCaseId} />;
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('cases.title', language)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('common.showing', language)} {cases.length} {t('common.of', language)}{' '}
            {totalCount} {t('common.results', language)}
          </p>
        </div>
        <Button
          onClick={() => setCreateCaseDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          <Plus className="size-4" />
          {t('cases.newCase', language)}
        </Button>
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('cases.searchPlaceholder', language)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v === '__all__' ? '' : v)}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder={t('cases.allStatuses', language)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{t('cases.allStatuses', language)}</SelectItem>
              {STATUS_LIST.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`status.${s}`, language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={filterType} onValueChange={(v) => setFilterType(v === '__all__' ? '' : v)}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder={t('cases.allTypes', language)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{t('cases.allTypes', language)}</SelectItem>
              {TYPE_LIST.map((tp) => (
                <SelectItem key={tp} value={tp}>
                  {t(`caseType.${tp}`, language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v === '__all__' ? '' : v)}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder={t('cases.allPriorities', language)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{t('cases.allPriorities', language)}</SelectItem>
              {PRIORITY_LIST.map((p) => (
                <SelectItem key={p} value={p}>
                  {t(`priority.${p}`, language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Cases Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : cases.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <Search className="size-10 opacity-40" />
            <p className="text-sm font-medium">{t('cases.noCases', language)}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">{t('cases.caseNumber', language)}</TableHead>
                <TableHead className="font-semibold">{t('cases.caseTitle', language)}</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">{t('cases.client', language)}</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">{t('cases.caseType', language)}</TableHead>
                <TableHead className="font-semibold">{t('cases.caseStatus', language)}</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">{t('cases.priority', language)}</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">{t('cases.nextHearing', language)}</TableHead>
                <TableHead className="font-semibold text-end">{t('common.actions', language)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {cases.map((c, idx) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className="border-b border-border/50 transition-colors hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleRowClick(c.id)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {c.caseNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground line-clamp-1">
                          {c.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {c.client?.fullName ?? '—'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      <Badge variant="outline" className="font-normal">
                        {t(`caseType.${c.caseType}`, language)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`font-normal ${STATUS_COLORS[c.status] ?? ''}`}
                      >
                        {t(`status.${c.status}`, language)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge
                        variant="outline"
                        className={`font-normal ${PRIORITY_COLORS[c.priority] ?? ''}`}
                      >
                        {t(`priority.${c.priority}`, language)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {c.nextHearing
                        ? format(new Date(c.nextHearing), 'yyyy-MM-dd')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-end" onClick={(e) => e.stopPropagation()}>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-40 p-1">
                          <button
                            onClick={() => handleRowClick(c.id)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                          >
                            <Eye className="size-4" />
                            {t('action.view', language)}
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="size-4" />
                            {t('action.delete', language)}
                          </button>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create Case Dialog */}
      <CreateCaseDialog />
    </div>
  );
}