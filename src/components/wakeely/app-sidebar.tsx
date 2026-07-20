'use client';

import React from 'react';
import { useAppStore } from '@/stores/app-store';
import { t } from '@/lib/i18n';
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  FileText,
  Receipt,
  Users,
  Settings,
  Sparkles,
  ChevronLeft,
  Scale,
  Menu,
  X,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { id: 'cases', icon: Briefcase, labelKey: 'nav.cases' },
  { id: 'tasks', icon: CheckSquare, labelKey: 'nav.tasks' },
  { id: 'clients', icon: Users, labelKey: 'nav.clients' },
  { id: 'billing', icon: Receipt, labelKey: 'nav.billing' },
  { id: 'documents', icon: FileText, labelKey: 'nav.documents' },
  { id: 'pro-features', icon: Sparkles, labelKey: 'nav.proFeatures', proOnly: true },
  { id: 'settings', icon: Settings, labelKey: 'nav.settings' },
];

export function AppSidebar() {
  const {
    currentView,
    setCurrentView,
    sidebarOpen,
    setSidebarOpen,
    language,
    setLanguage,
    featureFlags,
    setSelectedCaseId,
  } = useAppStore();

  const isRtl = language === 'ar';
  const isPro = featureFlags['pro_dashboard'] === true;

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={`fixed top-0 ${isRtl ? 'right-0' : 'left-0'} z-40 h-screen bg-slate-900 text-white transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'w-64' : 'w-[68px]'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-700/50">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500 shrink-0">
            <Scale className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-tight truncate">Wakeely</span>
              <span className="text-[10px] text-emerald-400 font-medium tracking-wider uppercase">
                Pro
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={`ml-auto text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8 shrink-0 ${
              !sidebarOpen ? 'hidden' : ''
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              const showItem = !item.proOnly || isPro;
              if (!showItem) return null;

              const Icon = item.icon;
              const label = t(item.labelKey, language);

              const button = (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id);
                    setSelectedCaseId(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  } ${!sidebarOpen ? 'justify-center' : ''}`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  {sidebarOpen && <span className="truncate">{label}</span>}
                  {sidebarOpen && item.proOnly && (
                    <Badge
                      variant="outline"
                      className="ml-auto text-[10px] px-1.5 py-0 border-emerald-500/50 text-emerald-400"
                    >
                      PRO
                    </Badge>
                  )}
                </button>
              );

              if (!sidebarOpen) {
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent side={isRtl ? 'left' : 'right'} className="font-medium">
                      {label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return button;
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-slate-700/50 p-3 space-y-2">
          {/* Language Toggle */}
          {sidebarOpen ? (
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                  className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side={isRtl ? 'left' : 'right'}>
                {language === 'en' ? 'العربية' : 'English'}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Collapse Toggle */}
          {!sidebarOpen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Menu className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side={isRtl ? 'left' : 'right'}>
                {isRtl ? 'توسيع' : 'Expand'}
              </TooltipContent>
            </Tooltip>
          )}

          {sidebarOpen && (
            <>
              <Separator className="bg-slate-700/50" />
              <div className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold">
                    ع
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-white truncate">عبدالله المحمدي</span>
                    <span className="text-[10px] text-slate-400 truncate">abdullah@wakeely.pro</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}