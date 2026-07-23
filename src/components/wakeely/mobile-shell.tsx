'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  Menu,
  BarChart3,
  Columns3,
  FileText,
  Sparkles,
  X,
  ChevronRight,
  Plus,
  Bell,
  Search,
  Scale,
  Globe,
  Shield,
  User,
  Eye,
  Receipt,
  Users,
  Briefcase,
  LayoutDashboard,
  Settings,
  ArrowRightLeft,
  WifiOff,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { t } from '@/lib/i18n';
import { preloadOfflineData } from '@/lib/offline-cache';

// ─── Bottom Nav Items ──────────────────────────────────────────────────

const BOTTOM_NAV = [
  { id: 'drawer', icon: Menu, labelKey: 'nav.menu' },
  { id: 'dashboard', icon: BarChart3, labelKey: 'nav.dashboard' },
  { id: 'kanban', icon: Columns3, labelKey: 'nav.kanban' },
  { id: 'documents', icon: FileText, labelKey: 'nav.documents' },
  { id: 'ai-assistant', icon: Sparkles, labelKey: 'nav.aiAssistant' },
] as const;

// ─── Drawer Menu Sections ──────────────────────────────────────────────

const DRAWER_SECTIONS = [
  {
    items: [
      { id: 'dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
      { id: 'kanban', icon: Columns3, labelKey: 'nav.kanban' },
      { id: 'documents', icon: FileText, labelKey: 'nav.documents' },
      { id: 'billing', icon: Receipt, labelKey: 'nav.billing' },
      { id: 'ai-assistant', icon: Sparkles, labelKey: 'nav.aiAssistant' },
    ],
  },
  {
    items: [
      { id: 'cases', icon: Briefcase, labelKey: 'nav.cases' },
      { id: 'clients', icon: Users, labelKey: 'nav.clients' },
      { id: 'team', icon: User, labelKey: 'nav.team' },
      { id: 'calendar', icon: BarChart3, labelKey: 'nav.calendar' },
    ],
  },
  {
    items: [
      { id: 'client-portal', icon: Eye, labelKey: 'nav.clientPortal' },
      { id: 'reports', icon: BarChart3, labelKey: 'nav.reports' },
      { id: 'settings', icon: Settings, labelKey: 'nav.settings' },
    ],
  },
];

// ─── Mobile Shell Component ─────────────────────────────────────────────

export function MobileShell({
  onSearchOpen,
}: {
  onSearchOpen: () => void;
}) {
  const {
    currentView,
    setCurrentView,
    language,
    setLanguage,
    cases,
    setSelectedCaseId,
    setCreateCaseDialogOpen,
  } = useAppStore();

  const lang = language;
  const isRtl = lang === 'ar';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [caseSearch, setCaseSearch] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [notifCount] = useState(3);
  const [notifShake, setNotifShake] = useState(false);

  // Offline detection
  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const online = () => setIsOffline(false);
    const offline = () => setIsOffline(true);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);

  // Preload offline data
  useEffect(() => {
    preloadOfflineData();
  }, []);

  // Notification bell shake on mount
  useEffect(() => {
    const t = setTimeout(() => setNotifShake(true), 500);
    const t2 = setTimeout(() => setNotifShake(false), 1500);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  // Drawer body scroll lock
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleNavPress = useCallback(
    (id: string) => {
      if (id === 'drawer') {
        setDrawerOpen(true);
        return;
      }
      setCurrentView(id);
      setSelectedCaseId(null);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setCurrentView, setSelectedCaseId]
  );

  const handleDrawerNav = useCallback(
    (id: string) => {
      setCurrentView(id);
      setSelectedCaseId(null);
      setDrawerOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setCurrentView, setSelectedCaseId]
  );

  const filteredCases = cases.filter(
    (c) =>
      c.title?.toLowerCase().includes(caseSearch.toLowerCase()) ||
      c.caseNumber?.toLowerCase().includes(caseSearch.toLowerCase())
  );

  const drawerX = isRtl ? { x: '-100%' } : { x: '-100%' };
  const drawerFrom = isRtl ? '100%' : '-100%';

  return (
    <>
      {/* ═══ Top App Bar ═══ */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="flex items-center justify-between px-4 h-12">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-1.5 -ml-1 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Scale className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[11px] font-bold tracking-tight">Wakeely <span className="text-emerald-500">Pro</span></span>
              </div>
            </div>
          </div>

          {/* Right: Search + Notifications */}
          <div className="flex items-center gap-1">
            {isOffline && (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full mr-1">
                <WifiOff className="w-2.5 h-2.5" />
              </span>
            )}
            <button
              onClick={onSearchOpen}
              className="p-1.5 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors"
            >
              <Search className="w-5 h-5 text-slate-500" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors relative">
              <motion.div animate={notifShake ? { rotate: [0, 15, -15, 10, -10, 0] } : {}} transition={{ duration: 0.5 }}>
                <Bell className="w-5 h-5 text-slate-500" />
              </motion.div>
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Side Drawer ═══ */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: drawerFrom }}
              animate={{ x: 0 }}
              exit={{ x: drawerFrom }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`fixed top-0 ${isRtl ? 'right-0' : 'left-0'} z-50 w-[300px] max-w-[85vw] h-full bg-white shadow-2xl flex flex-col lg:hidden`
            }
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-4 h-14 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold text-white">
                    ع
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{isRtl ? 'عبدالله المحمدي' : 'Abdullah Al-Mohammadi'}</span>
                    <span className="text-[10px] text-muted-foreground">{isRtl ? 'محامي مستشار' : 'Senior Lawyer'}</span>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Role Switcher */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1">
                  <button className="flex-1 text-xs font-medium py-2 rounded-lg bg-emerald-500 text-white shadow-sm">
                    {isRtl ? 'مساحة المحامي' : 'Lawyer Workspace'}
                  </button>
                  <button className="flex-1 text-xs font-medium py-2 rounded-lg text-slate-500 hover:text-slate-700">
                    {isRtl ? 'بوابة العميل' : 'Client Access'}
                  </button>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-3">
                {DRAWER_SECTIONS.map((section, si) => (
                  <div key={si} className={si > 0 ? 'mt-4' : ''}>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleDrawerNav(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                              isRtl ? 'flex-row-reverse' : ''
                            } ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 font-medium'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <span className="flex-1">{t(item.labelKey, lang)}</span>
                            {isRtl ? (
                              <ChevronRight className="w-4 h-4 text-slate-300 rotate-180" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-300" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Case Directory */}
              <div className="border-t border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {isRtl ? 'القضايا النشطة' : 'Active Cases'}
                  </span>
                  <button
                    onClick={() => { setCreateCaseDialogOpen(true); setDrawerOpen(false); }}
                    className="p-1 rounded-md hover:bg-emerald-50 text-emerald-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative mb-2">
                  <Search className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 ${isRtl ? 'right-2.5' : 'left-2.5'}`} />
                  <input
                    value={caseSearch}
                    onChange={(e) => setCaseSearch(e.target.value)}
                    placeholder={isRtl ? 'بحث سريع...' : 'Quick search...'}
                    className={`w-full text-xs py-2 ${isRtl ? 'pr-8 pl-3' : 'pl-8 pr-3'} rounded-lg bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400`}
                    dir={isRtl ? 'rtl' : 'ltr'}
                  />
                </div>
                <div className="max-h-36 overflow-y-auto space-y-0.5">
                  {filteredCases.slice(0, 5).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCaseId(c.id);
                        setCurrentView('cases');
                        setDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors text-start ${
                        isRtl ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{c.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{c.caseNumber}</p>
                      </div>
                    </button>
                  ))}
                  {filteredCases.length === 0 && (
                    <p className="text-[10px] text-slate-400 text-center py-2">
                      {isRtl ? 'لا توجد قضايا' : 'No cases'}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer: Compliance + Language */}
              <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[10px] font-medium text-slate-500">DIFC / SCCA</span>
                </div>
                <button
                  onClick={() => setLanguage(lang === 'en' ? 'ar' : 'en')}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {lang === 'en' ? 'عربي' : 'EN'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ Bottom Navigation Bar ═══ */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 safe-area-pb">
        <div className="flex items-stretch h-16">
          {BOTTOM_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'drawer' && drawerOpen);
            const isSpecial = item.id === 'drawer' || item.id === 'ai-assistant';

            if (isSpecial) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavPress(item.id)}
                  className={`flex-1 flex flex-col items-center justify-center gap-0.5 active:bg-slate-100 transition-colors relative ${
                    item.id === 'drawer' ? (isRtl ? 'rounded-tr-xl' : 'rounded-tl-xl') : ''
                  } ${
                    item.id === 'ai-assistant' ? (isRtl ? 'rounded-tl-xl' : 'rounded-tr-xl') : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md transition-all duration-200 ${
                      item.id === 'drawer'
                        ? 'bg-slate-800 text-white'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
                    } ${isActive ? 'scale-110' : 'scale-100'}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {t(item.labelKey, lang)}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavPress(item.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 active:bg-slate-100 transition-all duration-150 ${
                  isActive ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className={`absolute -inset-x-2 -top-1.5 -bottom-0.5 rounded-xl bg-emerald-50`}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-emerald-600' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] ${isActive ? 'font-semibold text-emerald-600' : 'font-medium'}`}>
                  {t(item.labelKey, lang)}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavDot"
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-emerald-500"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
