'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  X,
  Inbox,
  Loader2,
  Mail,
  Phone,
  Building2,
  User,
} from 'lucide-react';
import { useAppStore, type ClientItem } from '@/stores/app-store';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
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

// ─── Extended client type from API ────────────────────────────────────────────

interface ClientWithCount extends ClientItem {
  _count?: { cases: number };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ClientsView() {
  const { language, setCurrentView } = useAppStore();
  const lang = language;
  const isRtl = lang === 'ar';

  const [clients, setClients] = useState<ClientWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Fetch clients
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);

    fetch(`/api/clients?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        const list: ClientWithCount[] = Array.isArray(data)
          ? data
          : data.clients ?? [];
        setClients(list);
      })
      .catch(() => {
        toast.error(t('common.error', lang));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [debouncedSearch, lang]);

  // New client form state
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationalId: '',
    address: '',
    company: '',
    type: 'individual',
  });
  const [submitting, setSubmitting] = useState(false);

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Create client
  async function createClient() {
    if (!form.fullName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const newClient = await res.json();
        setClients((prev) => [newClient, ...prev]);
        setDialogOpen(false);
        setForm({
          fullName: '',
          email: '',
          phone: '',
          nationalId: '',
          address: '',
          company: '',
          type: 'individual',
        });
        toast.success(t('clients.createSuccess', lang));
      }
    } catch {
      toast.error(t('common.error', lang));
    } finally {
      setSubmitting(false);
    }
  }

  // Navigate to cases filtered by this client
  function viewClientCases(clientId: string) {
    // Store the selected client ID and navigate to cases view
    useAppStore.getState().setCurrentView('cases');
    // We set it in cases view's filter by storing it in the URL or a shared state
    // For simplicity, we'll just navigate — the cases view can pick up the client filter
    useAppStore.setState({ selectedCaseId: null });
    // Use a custom event to signal the client filter
    window.dispatchEvent(
      new CustomEvent('wakeely:filterByClient', { detail: clientId }),
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('clients.title', lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('common.showing', lang)} {clients.length} {t('common.results', lang)}
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          <Plus className="size-4" />
          {t('clients.newClient', lang)}
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

      {/* Client Cards Grid */}
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
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <Inbox className="size-10 opacity-40" />
            <p className="text-sm font-medium">{t('clients.noClients', lang)}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {clients.map((client, idx) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
              >
                <Card
                  className="cursor-pointer transition-all hover:shadow-md hover:border-emerald-200 group"
                  onClick={() => viewClientCases(client.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-12 shrink-0 bg-emerald-100 text-emerald-700">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold text-sm">
                          {client.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-emerald-700 transition-colors">
                          {client.fullName}
                        </h3>
                        {client.email && (
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                            <Mail className="size-3 shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                            <Phone className="size-3 shrink-0" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {client.type === 'corporate' ? (
                              <span className="flex items-center gap-1">
                                <Building2 className="size-3" />
                                {t('clients.corporate', lang)}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <User className="size-3" />
                                {t('clients.individual', lang)}
                              </span>
                            )}
                          </Badge>
                          {client._count && (
                            <span className="text-xs text-muted-foreground">
                              {client._count.cases}{' '}
                              {t('nav.cases', lang)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* New Client Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('clients.newClient', lang)}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Full Name (required) */}
            <div className="space-y-2">
              <Label htmlFor="client-fullName">
                {t('clients.fullName', lang)} <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="client-fullName"
                value={form.fullName}
                onChange={(e) => updateForm('fullName', e.target.value)}
                placeholder={t('clients.fullName', lang)}
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client-email">{t('clients.email', lang)}</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  placeholder={t('clients.email', lang)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-phone">{t('clients.phone', lang)}</Label>
                <Input
                  id="client-phone"
                  value={form.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  placeholder={t('clients.phone', lang)}
                />
              </div>
            </div>

            {/* National ID & Type */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client-nationalId">
                  {t('clients.nationalId', lang)}
                </Label>
                <Input
                  id="client-nationalId"
                  value={form.nationalId}
                  onChange={(e) => updateForm('nationalId', e.target.value)}
                  placeholder={t('clients.nationalId', lang)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('clients.clientType', lang)}</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => updateForm('type', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">
                      {t('clients.individual', lang)}
                    </SelectItem>
                    <SelectItem value="corporate">
                      {t('clients.corporate', lang)}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="client-address">{t('clients.address', lang)}</Label>
              <Input
                id="client-address"
                value={form.address}
                onChange={(e) => updateForm('address', e.target.value)}
                placeholder={t('clients.address', lang)}
              />
            </div>

            {/* Company (shown for corporate) */}
            {form.type === 'corporate' && (
              <div className="space-y-2">
                <Label htmlFor="client-company">
                  {t('clients.company', lang)}
                </Label>
                <Input
                  id="client-company"
                  value={form.company}
                  onChange={(e) => updateForm('company', e.target.value)}
                  placeholder={t('clients.company', lang)}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              {t('action.cancel', lang)}
            </Button>
            <Button
              onClick={createClient}
              disabled={!form.fullName.trim() || submitting}
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