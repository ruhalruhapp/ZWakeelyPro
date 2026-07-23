'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Globe,
  Bell,
  Info,
  Scale,
  Shield,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { t } from '@/lib/i18n';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

// ─── Component ────────────────────────────────────────────────────────────────

export function SettingsView() {
  const { language, setLanguage } = useAppStore();
  const lang = language;
  const isRtl = lang === 'ar';

  // Notification toggles (UI-only, no backend)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskReminders: true,
    caseUpdates: true,
    billingAlerts: false,
  });

  function toggleNotification(key: keyof typeof notifications) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6 p-4 md:p-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t('settings.title', lang)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {lang === 'ar'
            ? 'إدارة إعدادات حسابك وتفضيلاتك'
            : 'Manage your account settings and preferences'}
        </p>
      </div>

      {/* ─── Profile Section ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="size-4 text-emerald-600" />
              <CardTitle className="text-base">
                {t('settings.profile', lang)}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  {lang === 'ar' ? 'الاسم' : 'Name'}
                </p>
                <p className="text-sm font-medium text-foreground">
                  عبدالله المحمدي
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t('common.email', lang)}
                </p>
                <p className="text-sm font-medium text-foreground">
                  abdullah@wakeely.pro
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {lang === 'ar' ? 'المكتب' : 'Firm'}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {lang === 'ar' ? 'مكتب المحمدي للمحاماة' : 'Al-Mohammadi Law Firm'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {lang === 'ar' ? 'رقم الترخيص' : 'License'}
                </p>
                <p className="text-sm font-medium text-foreground font-mono">
                  12345/2024
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Language Section ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-emerald-600" />
              <CardTitle className="text-base">
                {t('settings.language', lang)}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Button
                variant={lang === 'ar' ? 'default' : 'outline'}
                onClick={() => setLanguage('ar')}
                className={
                  lang === 'ar'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : ''
                }
              >
                العربية
              </Button>
              <Button
                variant={lang === 'en' ? 'default' : 'outline'}
                onClick={() => setLanguage('en')}
                className={
                  lang === 'en'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : ''
                }
              >
                English
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Notifications Section ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-emerald-600" />
              <CardTitle className="text-base">
                {t('settings.notifications', lang)}
              </CardTitle>
            </div>
            <CardDescription>
              {lang === 'ar'
                ? 'تخصيص تفضيلات الإشعارات الخاصة بك'
                : 'Customize your notification preferences'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-email" className="text-sm cursor-pointer">
                {lang === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}
              </Label>
              <Switch
                id="notif-email"
                checked={notifications.email}
                onCheckedChange={() => toggleNotification('email')}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-push" className="text-sm cursor-pointer">
                {lang === 'ar' ? 'الإشعارات الفورية' : 'Push Notifications'}
              </Label>
              <Switch
                id="notif-push"
                checked={notifications.push}
                onCheckedChange={() => toggleNotification('push')}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-tasks" className="text-sm cursor-pointer">
                {lang === 'ar' ? 'تذكيرات المهام' : 'Task Reminders'}
              </Label>
              <Switch
                id="notif-tasks"
                checked={notifications.taskReminders}
                onCheckedChange={() => toggleNotification('taskReminders')}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-cases" className="text-sm cursor-pointer">
                {lang === 'ar' ? 'تحديثات القضايا' : 'Case Updates'}
              </Label>
              <Switch
                id="notif-cases"
                checked={notifications.caseUpdates}
                onCheckedChange={() => toggleNotification('caseUpdates')}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-billing" className="text-sm cursor-pointer">
                {lang === 'ar' ? 'تنبيهات الفواتير' : 'Billing Alerts'}
              </Label>
              <Switch
                id="notif-billing"
                checked={notifications.billingAlerts}
                onCheckedChange={() => toggleNotification('billingAlerts')}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── About Section ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="size-4 text-emerald-600" />
              <CardTitle className="text-base">
                {lang === 'ar' ? 'حول' : 'About'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* App branding */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-emerald-100">
                <Scale className="size-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Wakeely Pro</h3>
                <p className="text-xs text-muted-foreground">v1.0.0</p>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {lang === 'ar'
                ? 'منصة إدارة القضايا القانونية المتقدمة المصممة خصيصاً للمحامين والمكاتب القانونية في المملكة العربية السعودية. توفر إدارة شاملة للقضايا، المهام، الفواتير، والعملاء مع دعم كامل للغة العربية.'
                : 'Advanced legal case management platform designed for lawyers and law firms in Saudi Arabia. Provides comprehensive case, task, billing, and client management with full Arabic language support.'}
            </p>

            <Separator />

            {/* Tech stack badges */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {lang === 'ar' ? 'التقنيات المستخدمة' : 'Tech Stack'}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Next.js 16',
                  'TypeScript',
                  'Tailwind CSS',
                  'Prisma',
                  'PostgreSQL',
                  'Supabase',
                  'Zustand',
                  'shadcn/ui',
                  'Framer Motion',
                ].map((tech) => (
                  <Badge
                    key={tech}
                    variant="outline"
                    className="text-xs font-normal"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Security note */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="size-4 text-emerald-600" />
              <span>
                {lang === 'ar'
                  ? 'بياناتك محمية ومشفرة محلياً'
                  : 'Your data is protected and encrypted locally'}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}