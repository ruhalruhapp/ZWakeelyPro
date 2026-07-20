'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, LayoutDashboard, BarChart3, RefreshCw, Layers } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import type { LucideIcon } from 'lucide-react';

// ─── Feature Config ───────────────────────────────────────────────────────────

interface FeatureConfig {
  key: string;
  icon: LucideIcon;
  desc: string;
}

const defaultFeatures: FeatureConfig[] = [
  {
    key: 'pro_dashboard',
    icon: LayoutDashboard,
    desc: 'Enhanced dashboard with analytics and KPIs',
  },
  {
    key: 'advanced_analytics',
    icon: BarChart3,
    desc: 'Advanced case analytics and reporting',
  },
  {
    key: 'ai_assist',
    icon: Sparkles,
    desc: 'AI-powered legal document assistance',
  },
  {
    key: 'client_portal_sync',
    icon: RefreshCw,
    desc: 'Real-time sync with client portal',
  },
  {
    key: 'bulk_operations',
    icon: Layers,
    desc: 'Bulk case operations and management',
  },
];

// ─── i18n key mapping ─────────────────────────────────────────────────────────

const FEATURE_I18N_KEYS: Record<string, string> = {
  pro_dashboard: 'pro.dashboard',
  advanced_analytics: 'pro.advancedAnalytics',
  ai_assist: 'pro.aiAssist',
  client_portal_sync: 'pro.clientPortalSync',
  bulk_operations: 'pro.bulkOperations',
};

// ─── Feature Flag from API ────────────────────────────────────────────────────

interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProFeaturesView() {
  const { language, featureFlags, setFeatureFlags } = useAppStore();
  const lang = language;
  const isRtl = lang === 'ar';

  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  // Fetch feature flags
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/feature-flags');
        if (res.ok) {
          const data: FeatureFlag[] = await res.json();
          const map: Record<string, boolean> = {};
          for (const f of data) {
            map[f.key] = f.enabled;
          }
          setFeatureFlags(map);
        }
      } catch {
        toast.error(t('common.error', lang));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lang, setFeatureFlags]);

  // Toggle a feature flag
  async function toggleFeature(key: string, enabled: boolean) {
    setToggling(key);
    try {
      const res = await fetch('/api/feature-flags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled }),
      });
      if (res.ok) {
        setFeatureFlags({ ...featureFlags, [key]: enabled });
        toast.success(
          enabled
            ? t('pro.enabled', lang)
            : t('pro.disabled', lang),
        );
      }
    } catch {
      toast.error(t('common.error', lang));
    } finally {
      setToggling(null);
    }
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-lg bg-emerald-100">
          <Sparkles className="size-5 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('pro.title', lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === 'ar'
              ? 'إدارة ميزات Wakeely Pro المتقدمة'
              : 'Manage advanced Wakeely Pro features'}
          </p>
        </div>
      </div>

      {/* Feature Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                  <Skeleton className="size-6 w-10" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {defaultFeatures.map((feat, idx) => {
            const isEnabled = featureFlags[feat.key] === true;
            const Icon = feat.icon;
            const isTogglingThis = toggling === feat.key;

            return (
              <motion.div
                key={feat.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
              >
                <Card
                  className={`relative overflow-hidden transition-all duration-300 ${
                    isEnabled
                      ? 'border-emerald-300 shadow-sm shadow-emerald-100'
                      : 'border-border'
                  }`}
                >
                  {/* Subtle glow when enabled */}
                  {isEnabled && (
                    <motion.div
                      layoutId={`glow-${feat.key}`}
                      className="absolute inset-0 bg-emerald-50/40 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  <CardContent className="relative p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex items-center justify-center size-10 rounded-lg shrink-0 transition-colors duration-300 ${
                          isEnabled
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-foreground">
                            {t(FEATURE_I18N_KEYS[feat.key], lang)}
                          </h3>
                          {isEnabled && (
                            <Badge
                              variant="outline"
                              className="text-xs font-normal bg-emerald-50 text-emerald-700 border-emerald-200"
                            >
                              {t('pro.enabled', lang)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {lang === 'ar' ? getArabicDesc(feat.key) : feat.desc}
                        </p>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) =>
                          toggleFeature(feat.key, checked)
                        }
                        disabled={isTogglingThis}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Arabic descriptions ──────────────────────────────────────────────────────

function getArabicDesc(key: string): string {
  const descs: Record<string, string> = {
    pro_dashboard: 'لوحة تحكم محسّنة مع التحليلات ومؤشرات الأداء',
    advanced_analytics: 'تحليلات متقدمة للقضايا والتقارير',
    ai_assist: 'مساعدة ذكية للمستندات القانونية بالذكاء الاصطناعي',
    client_portal_sync: 'مزامنة فورية مع بوابة العميل',
    bulk_operations: 'عمليات جماعية لإدارة القضايا',
  };
  return descs[key] ?? key;
}