'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { AppSidebar } from '@/components/wakeely/app-sidebar';
import { MobileShell } from '@/components/wakeely/mobile-shell';
import { GlobalSearch } from '@/components/wakeely/global-search';
import { DashboardView } from '@/components/wakeely/dashboard-view';
import { CasesListView } from '@/components/wakeely/cases-view';
import { TasksView } from '@/components/wakeely/tasks-view';
import { ClientsView } from '@/components/wakeely/clients-view';
import { BillingView } from '@/components/wakeely/billing-view';
import { DocumentsView } from '@/components/wakeely/documents-view';
import { ProFeaturesView } from '@/components/wakeely/pro-features-view';
import { SettingsView } from '@/components/wakeely/settings-view';
import { KanbanView } from '@/components/wakeely/kanban-view';
import { CalendarView } from '@/components/wakeely/calendar-view';
import { TimeTrackingView } from '@/components/wakeely/time-tracking-view';
import { TeamView } from '@/components/wakeely/team-view';
import { EvidenceView } from '@/components/wakeely/evidence-view';
import { AIAssistantView } from '@/components/wakeely/ai-assistant-view';
import { ReportsView } from '@/components/wakeely/reports-view';
import { ClientPortalView } from '@/components/wakeely/client-portal-view';
import { AuditTrailView } from '@/components/wakeely/audit-trail-view';
import { CreateCaseDialog } from '@/components/wakeely/create-case-dialog';
import { preloadOfflineData } from '@/lib/offline-cache';

const viewMap: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  cases: CasesListView,
  kanban: KanbanView,
  tasks: TasksView,
  calendar: CalendarView,
  'time-tracking': TimeTrackingView,
  clients: ClientsView,
  team: TeamView,
  documents: DocumentsView,
  evidence: EvidenceView,
  billing: BillingView,
  'ai-assistant': AIAssistantView,
  reports: ReportsView,
  'client-portal': ClientPortalView,
  'audit-trail': AuditTrailView,
  'pro-features': ProFeaturesView,
  settings: SettingsView,
};

export default function Home() {
  const { currentView, sidebarOpen, language } = useAppStore();
  const isRtl = language === 'ar';
  const [searchOpen, setSearchOpen] = useState(false);

  const ViewComponent = viewMap[currentView] || DashboardView;

  // Global keyboard shortcut: Cmd/Ctrl + K to open search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Preload offline data on mount
  useEffect(() => {
    preloadOfflineData();
  }, []);

  // Search bar in desktop header
  const isSearchView = currentView !== 'ai-assistant';

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen
            ? isRtl ? 'lg:mr-64' : 'lg:ml-64'
            : isRtl ? 'lg:mr-[68px]' : 'lg:ml-[68px]'
        }`}
      >
        {/* Desktop Header with Search */}
        <div className="hidden lg:flex sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-700">
              {currentView === 'ai-assistant'
                ? 'Wakeely AI'
                : currentView.charAt(0).toUpperCase() + currentView.slice(1).replace(/-/g, ' ')}
            </h2>
          </div>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors w-64 text-start"
          >
            <div className="flex items-center gap-1.5 text-slate-400">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span className="text-xs">{isRtl ? 'بحث... (⌘K)' : 'Search... (⌘K)'}</span>
            </div>
          </button>
        </div>

        {/* Page Content — add padding for mobile bottom nav and top bar */}
        <div className="pt-0 lg:pt-0 pb-24 lg:pb-0 p-4 md:p-6 lg:p-8">
          <ViewComponent />
        </div>
      </main>

      {/* Mobile Shell (bottom nav, drawer, app bar) */}
      <MobileShell onSearchOpen={() => setSearchOpen(true)} />

      {/* Global Search Overlay */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <CreateCaseDialog />
    </div>
  );
}
