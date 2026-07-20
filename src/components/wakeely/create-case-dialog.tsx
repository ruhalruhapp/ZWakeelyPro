'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAppStore, type CaseItem } from '@/stores/app-store';
import { t } from '@/lib/i18n';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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

// ─── Options ───────────────────────────────────────────────────────────────────

const CASE_TYPES = ['civil', 'criminal', 'commercial', 'labor', 'family', 'real_estate', 'other'];
const STATUSES = ['intake', 'active', 'discovery', 'trial', 'settlement', 'appeal', 'closed', 'archived'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

// ─── Form State ────────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  description: string;
  caseType: string;
  status: string;
  priority: string;
  court: string;
  judge: string;
  filedDate: string;
  nextHearing: string;
  value: string;
  clientId: string;
  notes: string;
  isPro: boolean;
  isVisibleToClient: boolean;
}

const INITIAL_FORM: FormState = {
  title: '',
  description: '',
  caseType: 'civil',
  status: 'intake',
  priority: 'medium',
  court: '',
  judge: '',
  filedDate: '',
  nextHearing: '',
  value: '',
  clientId: '',
  notes: '',
  isPro: true,
  isVisibleToClient: false,
};

// ─── Component ───────────────────────────────────────────────────────────────

export function CreateCaseDialog() {
  const {
    createCaseDialogOpen,
    setCreateCaseDialogOpen,
    addCase,
    clients,
    setClients,
    cases,
    language,
  } = useAppStore();

  const isRtl = language === 'ar';
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Fetch clients if empty
  const fetchClients = useCallback(async () => {
    if (clients.length > 0) return;
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.clients ?? data.data ?? [];
        setClients(list);
      }
    } catch {
      // silently fail — client select will just be empty
    }
  }, [clients.length, setClients]);

  useEffect(() => {
    if (createCaseDialogOpen) {
      fetchClients();
      setForm(INITIAL_FORM);
      setErrors({});
    }
  }, [createCaseDialogOpen, fetchClients]);

  // Update a single field
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  // Generate case number: WP-{YEAR}-{NNN}
  const generateCaseNumber = () => {
    const year = new Date().getFullYear();
    const count = cases.length + 1;
    const num = String(count).padStart(3, '0');
    return `WP-${year}-${num}`;
  };

  // Validate
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) {
      newErrors.title = t('cases.caseTitle', language);
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const caseNumber = generateCaseNumber();
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        caseType: form.caseType,
        status: form.status,
        priority: form.priority,
        court: form.court.trim() || undefined,
        judge: form.judge.trim() || undefined,
        filedDate: form.filedDate || undefined,
        nextHearing: form.nextHearing || undefined,
        value: form.value ? parseFloat(form.value) : undefined,
        currency: 'SAR',
        clientId: form.clientId || undefined,
        notes: form.notes.trim() || undefined,
        isPro: form.isPro,
        isVisibleToClient: form.isVisibleToClient,
      };

      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const newCase: CaseItem = data.case ?? data.data ?? {
          ...payload,
          id: data.id,
          caseNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lawyerId: '',
        };
        // Ensure caseNumber is set
        if (!newCase.caseNumber) newCase.caseNumber = caseNumber;

        addCase(newCase);
        toast.success(t('cases.createSuccess', language));
        setCreateCaseDialogOpen(false);
      } else {
        const body = await res.json().catch(() => ({}));
        toast.error(body.error ?? body.message ?? t('common.error', language));
      }
    } catch {
      toast.error(t('common.error', language));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={createCaseDialogOpen} onOpenChange={setCreateCaseDialogOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-lg font-bold">
            {t('cases.newCase', language)}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-10rem)] px-6">
          <div className="space-y-5 py-4" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Title (required) */}
            <div className="space-y-2">
              <Label htmlFor="case-title">
                {t('cases.caseTitle', language)} <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="case-title"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder={t('cases.caseTitle', language)}
                className={errors.title ? 'border-rose-400' : ''}
              />
              {errors.title && (
                <p className="text-xs text-rose-500">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="case-desc">{t('cases.description', language)}</Label>
              <Textarea
                id="case-desc"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder={t('cases.description', language)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Case Type */}
              <div className="space-y-2">
                <Label>{t('cases.caseType', language)}</Label>
                <Select value={form.caseType} onValueChange={(v) => update('caseType', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CASE_TYPES.map((ct) => (
                      <SelectItem key={ct} value={ct}>
                        {t(`caseType.${ct}`, language)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>{t('cases.caseStatus', language)}</Label>
                <Select value={form.status} onValueChange={(v) => update('status', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`status.${s}`, language)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>{t('cases.priority', language)}</Label>
                <Select value={form.priority} onValueChange={(v) => update('priority', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {t(`priority.${p}`, language)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Court */}
              <div className="space-y-2">
                <Label htmlFor="court">{t('cases.court', language)}</Label>
                <Input
                  id="court"
                  value={form.court}
                  onChange={(e) => update('court', e.target.value)}
                  placeholder={t('cases.court', language)}
                />
              </div>

              {/* Judge */}
              <div className="space-y-2">
                <Label htmlFor="judge">{t('cases.judge', language)}</Label>
                <Input
                  id="judge"
                  value={form.judge}
                  onChange={(e) => update('judge', e.target.value)}
                  placeholder={t('cases.judge', language)}
                />
              </div>

              {/* Filed Date */}
              <div className="space-y-2">
                <Label htmlFor="filed-date">{t('cases.filedDate', language)}</Label>
                <Input
                  id="filed-date"
                  type="date"
                  value={form.filedDate}
                  onChange={(e) => update('filedDate', e.target.value)}
                />
              </div>

              {/* Next Hearing */}
              <div className="space-y-2">
                <Label htmlFor="next-hearing">{t('cases.nextHearing', language)}</Label>
                <Input
                  id="next-hearing"
                  type="date"
                  value={form.nextHearing}
                  onChange={(e) => update('nextHearing', e.target.value)}
                />
              </div>

              {/* Case Value */}
              <div className="space-y-2">
                <Label htmlFor="case-value">{t('cases.caseValue', language)}</Label>
                <Input
                  id="case-value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.value}
                  onChange={(e) => update('value', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              {/* Client */}
              <div className="space-y-2">
                <Label>{t('cases.client', language)}</Label>
                <Select value={form.clientId} onValueChange={(v) => update('clientId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('cases.client', language)} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="case-notes">{t('cases.notes', language)}</Label>
              <Textarea
                id="case-notes"
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder={t('cases.notes', language)}
                rows={3}
              />
            </div>

            <Separator />

            {/* Switches */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              {/* Is Pro Case */}
              <div className="flex items-center gap-3">
                <Switch
                  id="is-pro"
                  checked={form.isPro}
                  onCheckedChange={(checked) => update('isPro', checked)}
                />
                <Label htmlFor="is-pro" className="cursor-pointer">
                  {t('cases.proCase', language)}
                </Label>
              </div>

              {/* Visible to Client */}
              <div className="flex items-center gap-3">
                <Switch
                  id="visible-client"
                  checked={form.isVisibleToClient}
                  onCheckedChange={(checked) => update('isVisibleToClient', checked)}
                />
                <Label htmlFor="visible-client" className="cursor-pointer">
                  {t('cases.visibleToClient', language)}
                </Label>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-0 flex-row gap-2 sm:justify-end" dir={isRtl ? 'rtl' : 'ltr'}>
          <Button
            variant="outline"
            onClick={() => setCreateCaseDialogOpen(false)}
            disabled={submitting}
          >
            {t('action.cancel', language)}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px]"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              t('action.create', language)
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}