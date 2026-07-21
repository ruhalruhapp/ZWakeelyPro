'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  X,
  Inbox,
  Loader2,
  Lock,
  EyeOff,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react';
import { useAppStore, type CaseItem, type EvidenceItem } from '@/stores/app-store';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEM_TYPES = ['document', 'photo', 'video', 'physical', 'digital', 'testimony'] as const;

const ITEM_TYPE_KEYS: Record<string, string> = {
  document: 'evidence.document',
  photo: 'evidence.photo',
  video: 'evidence.video',
  physical: 'evidence.physical',
  digital: 'evidence.digital',
  testimony: 'evidence.testimony',
};

const ITEM_TYPE_COLORS: Record<string, string> = {
  document: 'bg-blue-100 text-blue-700 border-blue-200',
  photo: 'bg-amber-100 text-amber-700 border-amber-200',
  video: 'bg-rose-100 text-rose-700 border-rose-200',
  physical: 'bg-orange-100 text-orange-700 border-orange-200',
  digital: 'bg-violet-100 text-violet-700 border-violet-200',
  testimony: 'bg-teal-100 text-teal-700 border-teal-200',
};

const PRIVILEGE_TYPES = [
  'attorney_client',
  'attorney_work_product',
  'settlement_negotiation',
  'other',
] as const;

const EVIDENCE_CATEGORIES = [
  'documentary',
  'testimonial',
  'physical',
  'demonstrative',
  'digital',
] as const;

const EMPTY_FORM = {
  title: '',
  description: '',
  itemType: 'document' as string,
  category: '' as string,
  dateReceived: '',
  isPrivileged: false,
  privilegeType: '' as string,
  isConfidential: false,
  tags: '',
  source: '',
  caseId: '' as string,
};

// ─── Extended type with case relation ─────────────────────────────────────────

interface EvidenceWithCase extends EvidenceItem {
  case?: { id: string; caseNumber: string; title: string };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EvidenceView() {
  const { language, cases } = useAppStore();
  const lang = language;
  const isRtl = lang === 'ar';

  const [items, setItems] = useState<EvidenceWithCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCaseId, setFilterCaseId] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showPrivilegedOnly, setShowPrivilegedOnly] = useState(false);
  const [showConfidentialOnly, setShowConfidentialOnly] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewItem, setViewItem] = useState<EvidenceWithCase | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch evidence
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterCaseId) params.set('caseId', filterCaseId);

    fetch(`/api/evidence?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        const list: EvidenceWithCase[] = Array.isArray(data) ? data : [];
        setItems(list);
      })
      .catch(() => {
        toast.error(t('common.error', lang));
      })
      .finally(() => setLoading(false));
  }, [filterCaseId, lang]);

  // Filter items
  const filtered = items.filter((item) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !item.title.toLowerCase().includes(q) &&
        !(item.description?.toLowerCase().includes(q) ?? false) &&
        !(item.source?.toLowerCase().includes(q) ?? false)
      ) {
        return false;
      }
    }
    if (filterType && item.itemType !== filterType) return false;
    if (showPrivilegedOnly && !item.isPrivileged) return false;
    if (showConfidentialOnly && !item.isConfidential) return false;
    return true;
  });

  function updateForm(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, caseId: filterCaseId });
    setDialogOpen(true);
  }

  function openEdit(item: EvidenceWithCase) {
    setEditingId(item.id);
    // Tags come as JSON string from API
    let tagsStr = '';
    if (item.tags) {
      try {
        const parsed = JSON.parse(item.tags);
        tagsStr = Array.isArray(parsed) ? parsed.join(', ') : item.tags;
      } catch {
        tagsStr = item.tags;
      }
    }
    setForm({
      title: item.title,
      description: item.description || '',
      itemType: item.itemType,
      category: item.category || '',
      dateReceived: item.dateReceived ? item.dateReceived.split('T')[0] : '',
      isPrivileged: item.isPrivileged,
      privilegeType: item.privilegeType || '',
      isConfidential: item.isConfidential,
      tags: tagsStr,
      source: item.source || '',
      caseId: item.caseId,
    });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.caseId) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        tags: form.tags
          ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : null,
      };

      if (editingId) {
        const res = await fetch(`/api/evidence/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setItems((prev) =>
            prev.map((i) => (i.id === editingId ? { ...i, ...updated } : i)),
          );
          setDialogOpen(false);
          toast.success(t('action.save', lang));
        }
      } else {
        const res = await fetch('/api/evidence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          setItems((prev) => [created, ...prev]);
          setDialogOpen(false);
          toast.success(t('action.create', lang));
        }
      }
    } catch {
      toast.error(t('common.error', lang));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/evidence/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== deleteId));
        setDeleteId(null);
        setViewItem(null);
        toast.success(t('action.delete', lang));
      }
    } catch {
      toast.error(t('common.error', lang));
    }
  }

  function formatDate(dateStr?: string | null) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('evidence.title', lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('common.showing', lang)} {filtered.length} {t('common.results', lang)}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          <Plus className="size-4" />
          {t('action.create', lang)}
        </Button>
      </div>

      {/* Top bar: search, filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`${t('action.search', lang)}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Case filter */}
          <Select value={filterCaseId} onValueChange={setFilterCaseId}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t('nav.cases', lang)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all', lang)}</SelectItem>
              {cases.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.caseNumber} — {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type filter */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t('common.type', lang)} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all', lang)}</SelectItem>
              {ITEM_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(ITEM_TYPE_KEYS[type], lang)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chip row + toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={filterType === '' && !showPrivilegedOnly && !showConfidentialOnly ? 'default' : 'outline'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              setFilterType('');
              setShowPrivilegedOnly(false);
              setShowConfidentialOnly(false);
            }}
          >
            {t('common.all', lang)}
          </Button>
          {ITEM_TYPES.map((type) => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              size="sm"
              className={`h-7 text-xs ${filterType === type ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
              onClick={() => setFilterType(filterType === type ? '' : type)}
            >
              {t(ITEM_TYPE_KEYS[type], lang)}
            </Button>
          ))}

          <div className="border-e mx-1 h-5" />

          <Button
            variant={showPrivilegedOnly ? 'default' : 'outline'}
            size="sm"
            className={`h-7 text-xs gap-1 ${showPrivilegedOnly ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}`}
            onClick={() => setShowPrivilegedOnly(!showPrivilegedOnly)}
          >
            <Lock className="size-3" />
            {t('evidence.privileged', lang)}
          </Button>
          <Button
            variant={showConfidentialOnly ? 'default' : 'outline'}
            size="sm"
            className={`h-7 text-xs gap-1 ${showConfidentialOnly ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}`}
            onClick={() => setShowConfidentialOnly(!showConfidentialOnly)}
          >
            <EyeOff className="size-3" />
            {t('evidence.confidential', lang)}
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Inbox className="size-10 opacity-40" />
          <p className="text-sm font-medium">{t('common.noResults', lang)}</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.name', lang)}</TableHead>
                <TableHead>{t('common.type', lang)}</TableHead>
                <TableHead className="hidden md:table-cell">{t('documents.category', lang)}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('common.date', lang)}</TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead className="hidden sm:table-cell">{t('evidence.source', lang)}</TableHead>
                <TableHead className="w-28 text-end">{t('common.actions', lang)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filtered.map((item, idx) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15, delay: idx * 0.03 }}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="font-medium text-sm max-w-[200px] truncate">
                      {item.title}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs font-normal ${ITEM_TYPE_COLORS[item.itemType] || ''}`}
                      >
                        {t(ITEM_TYPE_KEYS[item.itemType] || 'common.type', lang)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {item.category || '—'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(item.dateReceived)}
                    </TableCell>
                    <TableCell>
                      {item.isPrivileged && (
                        <Lock className="size-3.5 text-amber-600" />
                      )}
                    </TableCell>
                    <TableCell>
                      {item.isConfidential && (
                        <EyeOff className="size-3.5 text-rose-600" />
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground max-w-[150px] truncate">
                      {item.source || '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => setViewItem(item)}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-rose-500 hover:text-rose-700"
                          onClick={() => setDeleteId(item.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? t('action.edit', lang) : t('action.create', lang)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title (required) */}
            <div className="space-y-2">
              <Label htmlFor="ev-title">
                {t('common.name', lang)} <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="ev-title"
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                placeholder={t('common.name', lang)}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="ev-desc">{t('cases.description', lang)}</Label>
              <Textarea
                id="ev-desc"
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                placeholder={t('cases.description', lang)}
                rows={3}
              />
            </div>

            {/* Item Type & Category */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('common.type', lang)}</Label>
                <Select
                  value={form.itemType}
                  onValueChange={(v) => updateForm('itemType', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(ITEM_TYPE_KEYS[type], lang)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('documents.category', lang)}</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => updateForm('category', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVIDENCE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date & Linked Case */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ev-date">{t('common.date', lang)}</Label>
                <Input
                  id="ev-date"
                  type="date"
                  value={form.dateReceived}
                  onChange={(e) => updateForm('dateReceived', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('nav.cases', lang)}</Label>
                <Select
                  value={form.caseId}
                  onValueChange={(v) => updateForm('caseId', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cases.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.caseNumber} — {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Source & Tags */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ev-source">{t('evidence.source', lang)}</Label>
                <Input
                  id="ev-source"
                  value={form.source}
                  onChange={(e) => updateForm('source', e.target.value)}
                  placeholder={t('evidence.source', lang)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-tags">Tags</Label>
                <Input
                  id="ev-tags"
                  value={form.tags}
                  onChange={(e) => updateForm('tags', e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>

            {/* Privileged Toggle */}
            <div className="flex items-center justify-between">
              <Label>{t('evidence.privileged', lang)}</Label>
              <Switch
                checked={form.isPrivileged}
                onCheckedChange={(v) => updateForm('isPrivileged', v)}
              />
            </div>

            {/* Privilege Type (shown when privileged) */}
            {form.isPrivileged && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label>Privilege Type</Label>
                <Select
                  value={form.privilegeType}
                  onValueChange={(v) => updateForm('privilegeType', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIVILEGE_TYPES.map((pt) => (
                      <SelectItem key={pt} value={pt}>
                        {pt.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}

            {/* Confidential Toggle */}
            <div className="flex items-center justify-between">
              <Label>{t('evidence.confidential', lang)}</Label>
              <Switch
                checked={form.isConfidential}
                onCheckedChange={(v) => updateForm('isConfidential', v)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('action.cancel', lang)}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.title.trim() || !form.caseId || submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {editingId ? t('action.save', lang) : t('action.create', lang)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Detail Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewItem?.title}</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className={ITEM_TYPE_COLORS[viewItem.itemType] || ''}
                >
                  {t(ITEM_TYPE_KEYS[viewItem.itemType] || 'common.type', lang)}
                </Badge>
                {viewItem.isPrivileged && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                    <Lock className="size-3 me-1" />
                    {t('evidence.privileged', lang)}
                  </Badge>
                )}
                {viewItem.isConfidential && (
                  <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-200">
                    <EyeOff className="size-3 me-1" />
                    {t('evidence.confidential', lang)}
                  </Badge>
                )}
              </div>
              {viewItem.description && (
                <p className="text-muted-foreground">{viewItem.description}</p>
              )}
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">{t('documents.category', lang)}:</span>{' '}
                  {viewItem.category || '—'}
                </div>
                <div>
                  <span className="font-medium text-foreground">{t('common.date', lang)}:</span>{' '}
                  {formatDate(viewItem.dateReceived)}
                </div>
                <div>
                  <span className="font-medium text-foreground">{t('evidence.source', lang)}:</span>{' '}
                  {viewItem.source || '—'}
                </div>
                {viewItem.case && (
                  <div>
                    <span className="font-medium text-foreground">{t('nav.cases', lang)}:</span>{' '}
                    {viewItem.case.caseNumber}
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    setViewItem(null);
                    openEdit(viewItem);
                  }}
                >
                  <Pencil className="size-3.5" />
                  {t('action.edit', lang)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-rose-600 hover:text-rose-700"
                  onClick={() => setDeleteId(viewItem.id)}
                >
                  <Trash2 className="size-3.5" />
                  {t('action.delete', lang)}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('action.delete', lang)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('cases.deleteConfirm', lang)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('action.cancel', lang)}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {t('action.delete', lang)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
