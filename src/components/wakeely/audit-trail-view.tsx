'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Search, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { useAppStore } from '@/stores/app-store';
import { t } from '@/lib/i18n';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AuditEntry {
  id: string;
  action: string;
  description: string | null;
  entity: string;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  lawyerId: string;
  lawyer: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  } | null;
  case: {
    id: string;
    caseNumber: string;
    title: string;
  } | null;
}

// ─── Entity Badge Colors ────────────────────────────────────────────────────

const ENTITY_COLORS: Record<string, string> = {
  case: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  task: 'bg-amber-100 text-amber-700 border-amber-200',
  document: 'bg-sky-100 text-sky-700 border-sky-200',
  billing: 'bg-rose-100 text-rose-700 border-rose-200',
  comment: 'bg-purple-100 text-purple-700 border-purple-200',
  timeline: 'bg-teal-100 text-teal-700 border-teal-200',
  evidence: 'bg-orange-100 text-orange-700 border-orange-200',
};

function entityBadge(entity: string, language: 'en' | 'ar'): React.ReactNode {
  const colorClass = ENTITY_COLORS[entity] || 'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <Badge variant="outline" className={`text-xs ${colorClass}`}>
      {entity}
    </Badge>
  );
}

// ─── Format Date ────────────────────────────────────────────────────────────

function formatTimestamp(dateStr: string, language: 'en' | 'ar'): string {
  const date = new Date(dateStr);
  return format(date, 'yyyy-MM-dd HH:mm:ss', {
    locale: language === 'ar' ? ar : undefined,
  });
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function AuditTrailView() {
  const language = useAppStore((s) => s.language);
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    async function fetchAudit() {
      try {
        const params = new URLSearchParams({ limit: '100' });
        const res = await fetch(`/api/audit?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setEntries(json);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchAudit();
  }, []);

  // Unique entities for filter
  const uniqueEntities = useMemo(() => {
    const set = new Set(entries.map((e) => e.entity));
    return Array.from(set).sort();
  }, [entries]);

  // Unique actions for filter
  const uniqueActions = useMemo(() => {
    const set = new Set(entries.map((e) => e.action));
    return Array.from(set).sort();
  }, [entries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (entityFilter !== 'all' && entry.entity !== entityFilter) return false;
      if (actionFilter && entry.action !== actionFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const searchable = [
          entry.lawyer?.name,
          entry.action,
          entry.description,
          entry.entity,
          entry.ipAddress,
          entry.case?.caseNumber,
          entry.case?.title,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!searchable.includes(term)) return false;
      }
      return true;
    });
  }, [entries, entityFilter, actionFilter, searchTerm]);

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('audit.title', language)}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {language === 'ar'
              ? 'سجل شامل لجميع الأنشطة لأغراض الامتثال'
              : 'Comprehensive log of all activities for compliance purposes'}
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {language === 'ar' ? `${filteredEntries.length} سجل` : `${filteredEntries.length} entries`}
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 start-3 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ar' ? 'بحث في السجل...' : 'Search audit log...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-9"
              />
            </div>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={language === 'ar' ? 'الكيان' : 'Entity'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all', language)}</SelectItem>
                {uniqueEntities.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder={language === 'ar' ? 'الإجراء' : 'Action'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all', language)}</SelectItem>
                {uniqueActions.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <ScrollArea className="max-h-[70vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">
                      {t('audit.timestamp', language)}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t('audit.user', language)}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t('audit.action', language)}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {language === 'ar' ? 'الكيان' : 'Entity'}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t('audit.details', language)}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t('audit.ip', language)}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                        <Filter className="size-8 mx-auto mb-2 opacity-40" />
                        <p>{t('common.noResults', language)}</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((entry, index) => (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(index * 0.02, 0.5) }}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground font-mono">
                          {formatTimestamp(entry.createdAt, language)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium">{entry.lawyer?.name || '\u2014'}</p>
                            {entry.lawyer?.email && (
                              <p className="text-xs text-muted-foreground">{entry.lawyer.email}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span className="text-sm font-medium">{entry.action}</span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {entityBadge(entry.entity, language)}
                          {entry.case && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {entry.case.caseNumber}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          <p className="text-sm text-muted-foreground truncate">
                            {entry.description || '\u2014'}
                          </p>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground font-mono">
                          {entry.ipAddress || '\u2014'}
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
