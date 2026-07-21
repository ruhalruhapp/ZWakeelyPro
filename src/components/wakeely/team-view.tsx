'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  X,
  Inbox,
  Loader2,
  Mail,
  Phone,
  Pencil,
  Briefcase,
} from 'lucide-react';
import { useAppStore, type TeamMemberItem } from '@/stores/app-store';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TeamMemberWithCount extends TeamMemberItem {
  _count?: { assignedTasks: number; comments: number };
}

const ROLES = [
  'partner',
  'seniorAssociate',
  'associate',
  'paralegal',
  'trainee',
  'admin',
] as const;

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  partner: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  seniorAssociate: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  associate: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  paralegal: { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },
  trainee: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  admin: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
};

const EMPTY_FORM = {
  name: '',
  email: '',
  role: 'associate' as string,
  phone: '',
  barNumber: '',
  specialization: '',
  isActive: true,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function TeamView() {
  const { language } = useAppStore();
  const lang = language;
  const isRtl = lang === 'ar';

  const [members, setMembers] = useState<TeamMemberWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch team members
  useEffect(() => {
    setLoading(true);
    fetch('/api/team')
      .then((r) => r.json())
      .then((data) => {
        const list: TeamMemberWithCount[] = Array.isArray(data) ? data : [];
        setMembers(list);
      })
      .catch(() => {
        toast.error(t('common.error', lang));
      })
      .finally(() => setLoading(false));
  }, [lang]);

  // Filter members
  const filtered = members.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.specialization?.toLowerCase().includes(q) ?? false) ||
      (m.phone?.includes(q) ?? false)
    );
  });

  function updateForm(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  }

  function openEdit(member: TeamMemberWithCount) {
    setEditingId(member.id);
    setForm({
      name: member.name,
      email: member.email,
      role: member.role,
      phone: member.phone || '',
      barNumber: member.barNumber || '',
      specialization: member.specialization || '',
      isActive: member.isActive,
    });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/team/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const updated = await res.json();
          setMembers((prev) =>
            prev.map((m) => (m.id === editingId ? { ...m, ...updated } : m)),
          );
          setDialogOpen(false);
          toast.success(t('action.save', lang));
        }
      } else {
        const res = await fetch('/api/team', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const created = await res.json();
          setMembers((prev) => [created, ...prev]);
          setDialogOpen(false);
          toast.success(t('action.create', lang));
        } else {
          const err = await res.json().catch(() => ({}));
          toast.error(err.error || t('common.error', lang));
        }
      }
    } catch {
      toast.error(t('common.error', lang));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(member: TeamMemberWithCount) {
    const newVal = !member.isActive;
    try {
      const res = await fetch(`/api/team/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newVal }),
      });
      if (res.ok) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === member.id ? { ...m, isActive: newVal } : m,
          ),
        );
      }
    } catch {
      toast.error(t('common.error', lang));
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/team/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== deleteId));
        setDeleteId(null);
        toast.success(t('action.delete', lang));
      }
    } catch {
      toast.error(t('common.error', lang));
    }
  }

  function getInitials(name: string) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('nav.team', lang)}
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

      {/* Search */}
      <div className="relative max-w-md">
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

      {/* Team Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <Inbox className="size-10 opacity-40" />
            <p className="text-sm font-medium">{t('common.noResults', lang)}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((member, idx) => {
              const colors = ROLE_COLORS[member.role] || ROLE_COLORS.associate;
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                >
                  <Card
                    className={`transition-all hover:shadow-md group ${!member.isActive ? 'opacity-60' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Avatar className="size-12 shrink-0">
                            <AvatarFallback
                              className={`font-semibold text-sm ${colors.bg} ${colors.text}`}
                            >
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground text-sm truncate">
                              {member.name}
                            </h3>
                            {member.email && (
                              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                <Mail className="size-3 shrink-0" />
                                <span className="truncate">{member.email}</span>
                              </div>
                            )}
                            {member.phone && (
                              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                                <Phone className="size-3 shrink-0" />
                                <span>{member.phone}</span>
                              </div>
                            )}
                            {member.specialization && (
                              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                                <Briefcase className="size-3 shrink-0" />
                                <span className="truncate">{member.specialization}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => openEdit(member)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs font-normal ${colors.border} ${colors.bg} ${colors.text}`}
                          >
                            {t(`team.${member.role}`, lang)}
                          </Badge>
                          {member._count && (
                            <span className="text-xs text-muted-foreground">
                              {member._count.assignedTasks} active
                            </span>
                          )}
                        </div>
                        <Switch
                          checked={member.isActive}
                          onCheckedChange={() => handleToggleActive(member)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
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
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="member-name">
                {t('common.name', lang)} <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="member-name"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                placeholder={t('common.name', lang)}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="member-email">
                {t('common.email', lang)} <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="member-email"
                type="email"
                value={form.email}
                onChange={(e) => updateForm('email', e.target.value)}
                placeholder={t('common.email', lang)}
              />
            </div>

            {/* Role & Phone */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('common.type', lang)}</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => updateForm('role', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {t(`team.${r}`, lang)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-phone">{t('common.phone', lang)}</Label>
                <Input
                  id="member-phone"
                  value={form.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  placeholder={t('common.phone', lang)}
                />
              </div>
            </div>

            {/* Bar Number & Specialization */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="member-bar">Bar Number</Label>
                <Input
                  id="member-bar"
                  value={form.barNumber}
                  onChange={(e) => updateForm('barNumber', e.target.value)}
                  placeholder="Bar Number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-spec">Specialization</Label>
                <Input
                  id="member-spec"
                  value={form.specialization}
                  onChange={(e) => updateForm('specialization', e.target.value)}
                  placeholder="Specialization"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between">
              <Label>{t('common.status', lang)}</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => updateForm('isActive', v)}
              />
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
              onClick={handleSubmit}
              disabled={!form.name.trim() || !form.email.trim() || submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {editingId ? t('action.save', lang) : t('action.create', lang)}
            </Button>
          </DialogFooter>
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
