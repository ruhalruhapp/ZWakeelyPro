'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Save,
  ExternalLink,
  Shield,
  LayoutDashboard,
  FileText,
  DollarSign,
  ListChecks,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore, type CaseItem } from '@/stores/app-store';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────────────────────

interface PortalConfig {
  timeline: boolean;
  documents: boolean;
  billing: boolean;
  tasks: boolean;
  comments: boolean;
}

const DEFAULT_CONFIG: PortalConfig = {
  timeline: false,
  documents: false,
  billing: false,
  tasks: false,
  comments: false,
};

const PORTAL_SECTIONS: { key: keyof PortalConfig; icon: React.ElementType; descEn: string; descAr: string }[] = [
  { key: 'timeline', icon: LayoutDashboard, descEn: 'Client can view the case timeline and event history', descAr: 'يمكن للعميل عرض الجدول الزمني للقضية وسجل الأحداث' },
  { key: 'documents', icon: FileText, descEn: 'Client can view and download case documents', descAr: 'يمكن للعميل عرض وتنزيل مستندات القضية' },
  { key: 'billing', icon: DollarSign, descEn: 'Client can view invoices and billing details', descAr: 'يمكن للعميل عرض الفواتير وتفاصيل الفوترة' },
  { key: 'tasks', icon: ListChecks, descEn: 'Client can see task progress and status updates', descAr: 'يمكن للعميل رؤية تقدم المهام وتحديثات الحالة' },
  { key: 'comments', icon: MessageSquare, descEn: 'Client can view non-internal comments and communicate', descAr: 'يمكن للعميل عرض التعليقات غير الداخلية والتواصل' },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export function ClientPortalView() {
  const language = useAppStore((s) => s.language);
  const clients = useAppStore((s) => s.clients);
  const cases = useAppStore((s) => s.cases);

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [config, setConfig] = useState<PortalConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [loadingCase, setLoadingCase] = useState(false);

  // Filter cases for the selected client
  const clientCases = useMemo(() =>
    selectedClientId ? cases.filter((c) => c.clientId === selectedClientId) : [],
    [selectedClientId, cases]
  );

  // Current selected case
  const selectedCase = useMemo(() =>
    cases.find((c) => c.id === selectedCaseId) ?? null,
    [selectedCaseId, cases]
  );

  // When a client changes, reset case selection
  useEffect(() => {
    setSelectedCaseId('');
    setConfig(DEFAULT_CONFIG);
  }, [selectedClientId]);

  // When a case is selected, load its config
  useEffect(() => {
    if (!selectedCaseId) return;
    async function loadCase() {
      setLoadingCase(true);
      try {
        const res = await fetch(`/api/cases/${selectedCaseId}`);
        if (res.ok) {
          const caseData = await res.json();
          if (caseData.clientAccessConfig) {
            try {
              setConfig(JSON.parse(caseData.clientAccessConfig));
            } catch {
              setConfig(DEFAULT_CONFIG);
            }
          } else {
            setConfig(DEFAULT_CONFIG);
          }
        }
      } catch {
        // silently fail
      } finally {
        setLoadingCase(false);
      }
    }
    loadCase();
  }, [selectedCaseId]);

  // Save configuration
  async function handleSave() {
    if (!selectedCaseId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/cases/${selectedCaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isVisibleToClient: true,
          clientAccessConfig: JSON.stringify(config),
        }),
      });
      if (res.ok) {
        toast.success(language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Configuration saved successfully');
      } else {
        toast.error(language === 'ar' ? 'فشل في حفظ الإعدادات' : 'Failed to save configuration');
      }
    } catch {
      toast.error(language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  }

  // Visible sections count
  const visibleCount = Object.values(config).filter(Boolean).length;

  function toggleSection(key: keyof PortalConfig) {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('portal.title', language)}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {language === 'ar'
            ? 'إدارة ما يمكن للعملاء رؤيته في بوابة العميل'
            : 'Manage what clients can see in the client portal'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ─── Left Column: Client + Case List ─── */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {language === 'ar' ? 'اختر عميل' : 'Select Client'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={language === 'ar' ? 'اختر عميلاً...' : 'Select a client...'} />
                </SelectTrigger>
                <SelectContent>
                  {clients.length === 0 && (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                      {language === 'ar' ? 'لا يوجد عملاء' : 'No clients found'}
                    </div>
                  )}
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Case List */}
          {selectedClientId && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  {language === 'ar' ? 'قضايا العميل' : 'Client Cases'} ({clientCases.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-96">
                  {clientCases.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      {language === 'ar' ? 'لا توجد قضايا لهذا العميل' : 'No cases for this client'}
                    </div>
                  ) : (
                    <div className="divide-y">
                      {clientCases.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCaseId(c.id)}
                          className={`w-full text-start px-4 py-3 flex items-center justify-between gap-2 hover:bg-accent/50 transition-colors ${
                            selectedCaseId === c.id ? 'bg-accent' : ''
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{c.caseNumber}</p>
                            <p className="text-xs text-muted-foreground truncate">{c.title}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={c.isVisibleToClient ? 'default' : 'outline'} className="text-xs">
                              {c.isVisibleToClient
                                ? (language === 'ar' ? 'مرئي' : 'Visible')
                                : (language === 'ar' ? 'مخفي' : 'Hidden')
                              }
                            </Badge>
                            <ChevronRight className="size-4 text-muted-foreground" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ─── Right Column: Portal Configuration ─── */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!selectedCaseId ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-64"
              >
                <Card className="w-full">
                  <CardContent className="py-12 text-center">
                    <Shield className="size-12 mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-muted-foreground">
                      {selectedClientId
                        ? (language === 'ar' ? 'اختر قضية لتكوين البوابة' : 'Select a case to configure portal access')
                        : (language === 'ar' ? 'اختر عميلاً أولاً' : 'Select a client first')
                      }
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : loadingCase ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <Skeleton className="h-6 w-60" />
                <Skeleton className="h-4 w-80" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="config"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Header */}
                <div>
                  <h2 className="text-lg font-semibold">{t('portal.title', language)}</h2>
                  {selectedCase && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {selectedCase.caseNumber} \u2013 {selectedCase.title}
                    </p>
                  )}
                </div>

                {/* Summary */}
                <Card className="border-dashed">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="rounded-full bg-emerald-100 p-2">
                      {visibleCount === 5 ? (
                        <Eye className="size-5 text-emerald-600" />
                      ) : (
                        <EyeOff className="size-5 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {visibleCount === 0
                          ? (language === 'ar' ? 'لا توجد أقسام مرئية' : 'No sections visible')
                          : visibleCount === 5
                            ? (language === 'ar' ? 'جميع الأقسام مرئية' : 'All sections visible')
                            : (language === 'ar'
                              ? `${visibleCount} من 5 أقسام مرئية`
                              : `${visibleCount} of 5 sections visible`)
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('portal.visibleSections', language)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Visibility Toggles */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      {t('portal.visibleSections', language)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {PORTAL_SECTIONS.map((section, i) => {
                      const Icon = section.icon;
                      const isOn = config[section.key];
                      return (
                        <div key={section.key}>
                          {i > 0 && <Separator className="my-1" />}
                          <div className="flex items-start justify-between gap-4 py-3">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <div className={`rounded-lg p-2 mt-0.5 ${isOn ? 'bg-emerald-100 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                                <Icon className="size-4" />
                              </div>
                              <div className="min-w-0">
                                <Label className="text-sm font-medium cursor-pointer" htmlFor={`toggle-${section.key}`}>
                                  {t(`portal.${section.key}`, language)}
                                </Label>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {language === 'ar' ? section.descAr : section.descEn}
                                </p>
                              </div>
                            </div>
                            <Switch
                              id={`toggle-${section.key}`}
                              checked={isOn}
                              onCheckedChange={() => toggleSection(section.key)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Save className="size-4 me-2" />
                    {language === 'ar' ? 'حفظ التكوين' : 'Save Configuration'}
                  </Button>
                  <Button variant="outline" disabled={!selectedCase?.isVisibleToClient}>
                    <ExternalLink className="size-4 me-2" />
                    {language === 'ar' ? 'معاينة عرض العميل' : 'Preview Client View'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
