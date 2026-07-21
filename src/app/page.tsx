'use client';

import { useAppStore } from '@/stores/app-store';
import { AppSidebar } from '@/components/wakeely/app-sidebar';
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
import { Skeleton } from '@/components/ui/skeleton';

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

  const ViewComponent = viewMap[currentView] || DashboardView;

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50">
      <AppSidebar />

      <main
        className={`transition-all duration-300 ${
          sidebarOpen
            ? isRtl ? 'mr-64' : 'ml-64'
            : isRtl ? 'mr-[68px]' : 'ml-[68px]'
        }`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                </svg>
              </div>
              <span className="font-bold text-sm">Wakeely <span className="text-emerald-500">Pro</span></span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8">
          <ViewComponent />
        </div>
      </main>

      <CreateCaseDialog />
    </div>
  );
}