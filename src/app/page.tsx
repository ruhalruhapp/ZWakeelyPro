'use client';

import { useEffect } from 'react';
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
import { CreateCaseDialog } from '@/components/wakeely/create-case-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ViewLoader() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function Home() {
  const {
    currentView,
    sidebarOpen,
    language,
    isLoading,
    setIsLoading,
  } = useAppStore();

  const isRtl = language === 'ar';

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'cases':
        return <CasesListView />;
      case 'tasks':
        return <TasksView />;
      case 'clients':
        return <ClientsView />;
      case 'billing':
        return <BillingView />;
      case 'documents':
        return <DocumentsView />;
      case 'pro-features':
        return <ProFeaturesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
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
          {renderView()}
        </div>
      </main>

      {/* Create Case Dialog (global) */}
      <CreateCaseDialog />
    </div>
  );
}