'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Briefcase,
  CheckSquare,
  FileText,
  Users,
  WifiOff,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { t } from '@/lib/i18n';
import { searchCached } from '@/lib/offline-cache';

const TYPE_CONFIG: Record<string, { icon: any; color: string; bgColor: string }> = {
  case: { icon: Briefcase, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  task: { icon: CheckSquare, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  client: { icon: Users, color: 'text-sky-600', bgColor: 'bg-sky-50' },
  document: { icon: FileText, color: 'text-rose-600', bgColor: 'bg-rose-50' },
};

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { language, setCurrentView, setSelectedCaseId } = useAppStore();
  const lang = language;
  const isRtl = lang === 'ar';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const online = () => setIsOffline(false);
    const offline = () => setIsOffline(true);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      // Try API search first
      const res = await fetch(`/api/cases?search=${encodeURIComponent(q)}&limit=5`);
      if (res.ok) {
        const caseData = await res.json();
        const allResults: any[] = [];
        (caseData.cases || caseData || []).slice(0, 5).forEach((c: any) => {
          allResults.push({ type: 'case', id: c.id, title: c.title, subtitle: c.caseNumber, status: c.status });
        });
        // Also search cached data for other types
        const cached = await searchCached(q);
        const existingIds = new Set(allResults.map((r) => `${r.type}:${r.id}`));
        cached.forEach((r: any) => {
          if (!existingIds.has(`${r.type}:${r.id}`)) allResults.push(r);
        });
        setResults(allResults.slice(0, 15));
      } else {
        // Fallback to cached search
        const cached = await searchCached(q);
        setResults(cached.slice(0, 15));
      }
    } catch {
      const cached = await searchCached(q);
      setResults(cached.slice(0, 15));
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 250);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  function handleSelect(result: any) {
    if (result.type === 'case') {
      setSelectedCaseId(result.id);
      setCurrentView('cases');
    } else if (result.type === 'task') {
      setCurrentView('tasks');
    } else if (result.type === 'client') {
      setCurrentView('clients');
    } else if (result.type === 'document') {
      setCurrentView('documents');
    }
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && results.length > 0) handleSelect(results[0]);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-4 z-50 mx-auto max-w-xl"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isRtl
                      ? 'بحث في القضايا، المهام، العملاء، المستندات...'
                      : 'Search cases, tasks, clients, documents...'
                  }
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                  dir={isRtl ? 'rtl' : 'ltr'}
                />
                {isOffline && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    <WifiOff className="w-3 h-3" />
                    {isRtl ? 'غير متصل' : 'Offline'}
                  </span>
                )}
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto">
                {searching && (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    <div className="animate-pulse">{isRtl ? 'جارٍ البحث...' : 'Searching...'}</div>
                  </div>
                )}
                {!searching && query && results.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {isRtl ? 'لا توجد نتائج' : 'No results found'}
                  </div>
                )}
                {!searching &&
                  results.map((result) => {
                    const config = TYPE_CONFIG[result.type] || TYPE_CONFIG.case;
                    const Icon = config.icon;
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSelect(result)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-start ${
                          isRtl ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div className={`rounded-lg p-2 shrink-0 ${config.bgColor}`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{result.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                        </div>
                        <ArrowRight className={`w-4 h-4 text-muted-foreground shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
                      </button>
                    );
                  })}
                {!searching && !query && (
                  <div className="px-4 py-6 text-center text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">{isRtl ? 'بحث سريع' : 'Quick Search'}</p>
                    <p>{isRtl ? 'ابحث بالاسم أو الرقم' : 'Search by name or number'}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
