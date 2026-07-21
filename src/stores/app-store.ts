import { create } from 'zustand';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;
  caseType: string;
  status: string;
  priority: string;
  court?: string;
  judge?: string;
  filedDate?: string;
  nextHearing?: string;
  closedDate?: string;
  value?: number;
  currency: string;
  notes?: string;
  isPro: boolean;
  isVisibleToClient: boolean;
  createdAt: string;
  updatedAt: string;
  lawyerId: string;
  clientId?: string;
  lawyer?: { id: string; name: string; email: string };
  client?: { id: string; fullName: string; email?: string; phone?: string };
  tasks?: TaskItem[];
  documents?: DocumentItem[];
  billings?: BillingItem[];
  timelines?: TimelineItem[];
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  completedAt?: string;
  caseId: string;
  lawyerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  filePath?: string;
  category: string;
  description?: string;
  uploadedAt: string;
  caseId: string;
}

export interface BillingItem {
  id: string;
  description: string;
  hours?: number;
  rate?: number;
  amount: number;
  currency: string;
  status: string;
  invoiceDate?: string;
  dueDate?: string;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
  caseId: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  eventType: string;
  eventDate: string;
  createdAt: string;
  caseId: string;
}

export interface ClientItem {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  address?: string;
  company?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  description?: string;
  entity: string;
  entityId?: string;
  createdAt: string;
  lawyerId: string;
  caseId?: string;
  lawyer?: { name: string };
}

export interface DashboardStats {
  totalCases: number;
  activeCases: number;
  pendingCases: number;
  closedCases: number;
  totalRevenue: number;
  pendingRevenue: number;
  overdueTasks: number;
  upcomingHearings: number;
  casesByStatus: { status: string; count: number }[];
  casesByType: { caseType: string; count: number }[];
  recentCases: CaseItem[];
  upcomingTasks: TaskItem[];
  recentActivity: ActivityItem[];
}

export interface FeatureFlags {
  [key: string]: boolean;
}

export interface PartyItem {
  id: string; name: string; role: string; type: string;
  email?: string; phone?: string; lawyer?: string; notes?: string;
  caseId: string; createdAt: string; updatedAt: string;
}

export interface TeamMemberItem {
  id: string; name: string; email: string; role: string;
  phone?: string; avatarUrl?: string; barNumber?: string;
  specialization?: string; isActive: boolean;
  createdAt: string; updatedAt: string;
}

export interface CommentItem {
  id: string; content: string; isInternal: boolean;
  caseId: string; lawyerId?: string; memberId?: string;
  parentId?: string; lawyer?: { name: string };
  member?: { name: string };
  replies: CommentItem[];
  createdAt: string; updatedAt: string;
}

export interface TimeEntryItem {
  id: string; description: string; duration: number; // minutes
  rate?: number; isBillable: boolean;
  activityType: string; date: string; notes?: string;
  caseId: string; lawyerId: string;
  createdAt: string; updatedAt: string;
}

export interface ExpenseItem {
  id: string; description: string; amount: number;
  currency: string; category: string; isBillable: boolean;
  date: string; receiptPath?: string; notes?: string;
  caseId: string; createdAt: string; updatedAt: string;
}

export interface CalendarEventItem {
  id: string; title: string; description?: string;
  eventType: string; startDate: string; endDate?: string;
  allDay: boolean; location?: string; color?: string;
  reminder?: string; caseId?: string;
  createdAt: string; updatedAt: string;
}

export interface EvidenceItem {
  id: string; title: string; description?: string;
  itemType: string; category?: string; dateReceived?: string;
  isPrivileged: boolean; privilegeType?: string;
  isConfidential: boolean; tags?: string;
  linkedDocId?: string; source?: string;
  caseId: string; createdAt: string; updatedAt: string;
}

export interface PrivilegeLogItem {
  id: string; documentTitle: string; privilegeType: string;
  dateCreated?: string; description?: string;
  withheldFrom?: string; caseId: string;
  createdAt: string; updatedAt: string;
}

// ─── App State Interface ────────────────────────────────────────────────────

export interface AppState {
  // Navigation
  currentView: string;
  setCurrentView: (view: string) => void;

  // Selected case
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
  selectedCase: CaseItem | null;

  // Cases
  cases: CaseItem[];
  setCases: (cases: CaseItem[]) => void;
  addCase: (c: CaseItem) => void;
  updateCase: (id: string, data: Partial<CaseItem>) => void;
  removeCase: (id: string) => void;

  // Dashboard
  dashboardStats: DashboardStats | null;
  setDashboardStats: (stats: DashboardStats) => void;

  // Feature Flags
  featureFlags: FeatureFlags;
  setFeatureFlags: (flags: FeatureFlags) => void;
  isProMode: () => boolean;

  // Clients
  clients: ClientItem[];
  setClients: (clients: ClientItem[]) => void;

  // Parties
  parties: PartyItem[];
  setParties: (parties: PartyItem[]) => void;

  // Team Members
  teamMembers: TeamMemberItem[];
  setTeamMembers: (members: TeamMemberItem[]) => void;

  // Comments
  comments: CommentItem[];
  setComments: (comments: CommentItem[]) => void;

  // Time Entries
  timeEntries: TimeEntryItem[];
  setTimeEntries: (entries: TimeEntryItem[]) => void;

  // Expenses
  expenses: ExpenseItem[];
  setExpenses: (expenses: ExpenseItem[]) => void;

  // Calendar Events
  calendarEvents: CalendarEventItem[];
  setCalendarEvents: (events: CalendarEventItem[]) => void;

  // Evidence Items
  evidenceItems: EvidenceItem[];
  setEvidenceItems: (items: EvidenceItem[]) => void;

  // Privilege Logs
  privilegeLogs: PrivilegeLogItem[];
  setPrivilegeLogs: (logs: PrivilegeLogItem[]) => void;

  // Timer state
  activeTimer: { caseId: string; description: string; startTime: number } | null;
  setActiveTimer: (timer: { caseId: string; description: string; startTime: number } | null) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  createCaseDialogOpen: boolean;
  setCreateCaseDialogOpen: (open: boolean) => void;
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentView: 'dashboard',
  setCurrentView: (view) => set({ currentView: view }),

  // Selected case
  selectedCaseId: null,
  setSelectedCaseId: (id) =>
    set({
      selectedCaseId: id,
      selectedCase: id ? get().cases.find((c) => c.id === id) ?? null : null,
    }),
  selectedCase: null,

  // Cases
  cases: [],
  setCases: (cases) =>
    set((state) => ({
      cases,
      selectedCase: state.selectedCaseId
        ? cases.find((c) => c.id === state.selectedCaseId) ?? null
        : null,
    })),
  addCase: (c) => set((state) => ({ cases: [c, ...state.cases] })),
  updateCase: (id, data) =>
    set((state) => ({
      cases: state.cases.map((c) => (c.id === id ? { ...c, ...data } : c)),
      selectedCase:
        state.selectedCase?.id === id
          ? { ...state.selectedCase, ...data }
          : state.selectedCase,
    })),
  removeCase: (id) =>
    set((state) => ({
      cases: state.cases.filter((c) => c.id !== id),
      selectedCase: state.selectedCase?.id === id ? null : state.selectedCase,
      selectedCaseId: state.selectedCaseId === id ? null : state.selectedCaseId,
    })),

  // Dashboard
  dashboardStats: null,
  setDashboardStats: (stats) => set({ dashboardStats: stats }),

  // Feature Flags
  featureFlags: {},
  setFeatureFlags: (flags) => set({ featureFlags: flags }),
  isProMode: () => {
    const flags = get().featureFlags;
    return flags['pro_dashboard'] === true || flags['advanced_analytics'] === true;
  },

  // Clients
  clients: [],
  setClients: (clients) => set({ clients }),

  // Parties
  parties: [],
  setParties: (parties) => set({ parties }),

  // Team Members
  teamMembers: [],
  setTeamMembers: (members) => set({ teamMembers: members }),

  // Comments
  comments: [],
  setComments: (comments) => set({ comments }),

  // Time Entries
  timeEntries: [],
  setTimeEntries: (entries) => set({ timeEntries: entries }),

  // Expenses
  expenses: [],
  setExpenses: (expenses) => set({ expenses }),

  // Calendar Events
  calendarEvents: [],
  setCalendarEvents: (events) => set({ calendarEvents: events }),

  // Evidence Items
  evidenceItems: [],
  setEvidenceItems: (items) => set({ evidenceItems: items }),

  // Privilege Logs
  privilegeLogs: [],
  setPrivilegeLogs: (logs) => set({ privilegeLogs: logs }),

  // Timer state
  activeTimer: null,
  setActiveTimer: (timer) => set({ activeTimer: timer }),

  // UI State
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  createCaseDialogOpen: false,
  setCreateCaseDialogOpen: (open) => set({ createCaseDialogOpen: open }),
  language: 'ar',
  setLanguage: (lang) => set({ language: lang }),

  // Loading states
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));