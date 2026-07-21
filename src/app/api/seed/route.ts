import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  const counts = {
    lawyer: 0,
    teamMembers: 0,
    clients: 0,
    cases: 0,
    tasks: 0,
    featureFlags: 0,
    caseParties: 0,
    taskAssignments: 0,
    timeEntries: 0,
    expenses: 0,
    calendarEvents: 0,
    evidence: 0,
    privilegeLogs: 0,
    billing: 0,
    timelineEvents: 0,
    activities: 0,
  };

  const errors: string[] = [];

  try {
    // ─── 1. Lawyer ───────────────────────────────────────────────
    try {
      await db.lawyer.create({
        data: {
          id: 'lawyer-1',
          name: 'Dr. Ahmed Al-Rashid',
          email: 'ahmed@wakeely.com',
          role: 'lawyer',
          firm: 'Al-Rashid & Partners',
          licenseNo: 'SA-LAW-2020-1547',
          phone: '+966501234567',
        },
      });
      counts.lawyer = 1;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`Lawyer: ${msg}`);
    }

    // ─── 2. Team Members ──────────────────────────────────────────
    try {
      await db.teamMember.createMany({
        data: [
          {
            id: 'member-1',
            name: 'Sara Al-Fahad',
            email: 'sara@wakeely.com',
            role: 'senior_associate',
            specialization: 'Commercial Law',
            lawyerId: 'lawyer-1',
          },
          {
            id: 'member-2',
            name: 'Omar Al-Harbi',
            email: 'omar@wakeely.com',
            role: 'associate',
            specialization: 'Criminal Law',
            lawyerId: 'lawyer-1',
          },
          {
            id: 'member-3',
            name: 'Fatima Al-Zahrani',
            email: 'fatima@wakeely.com',
            role: 'paralegal',
            lawyerId: 'lawyer-1',
          },
          {
            id: 'member-4',
            name: 'Khalid Al-Qahtani',
            email: 'khalid@wakeely.com',
            role: 'partner',
            specialization: 'Corporate Law',
            lawyerId: 'lawyer-1',
          },
          {
            id: 'member-5',
            name: 'Noura Al-Saeed',
            email: 'noura@wakeely.com',
            role: 'trainee',
            lawyerId: 'lawyer-1',
          },
        ],
      });
      counts.teamMembers = 5;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`TeamMembers: ${msg}`);
    }

    // ─── 3. Clients ───────────────────────────────────────────────
    try {
      await db.client.createMany({
        data: [
          {
            id: 'client-1',
            name: 'Mohammed Al-Salem',
            email: 'mohammed@email.com',
            type: 'individual',
            phone: '+966551112233',
            lawyerId: 'lawyer-1',
          },
          {
            id: 'client-2',
            name: 'TechVentures Inc',
            email: 'info@techventures.sa',
            type: 'corporate',
            phone: '+966112345678',
            crNumber: '1010123456',
            lawyerId: 'lawyer-1',
          },
          {
            id: 'client-3',
            name: 'Aisha Al-Dosari',
            email: 'aisha@email.com',
            type: 'individual',
            phone: '+966554445566',
            lawyerId: 'lawyer-1',
          },
          {
            id: 'client-4',
            name: 'Gulf Construction Co',
            email: 'contact@gulfconstruction.sa',
            type: 'corporate',
            phone: '+966119876543',
            crNumber: '1010987654',
            lawyerId: 'lawyer-1',
          },
          {
            id: 'client-5',
            name: 'Fahad Al-Otaibi',
            email: 'fahad@email.com',
            type: 'individual',
            phone: '+966557778899',
            lawyerId: 'lawyer-1',
          },
        ],
      });
      counts.clients = 5;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`Clients: ${msg}`);
    }

    // ─── 4. Cases ─────────────────────────────────────────────────
    try {
      await db.case.createMany({
        data: [
          {
            id: 'case-1',
            caseNumber: 'CAS-2024-001',
            title: 'Al-Salem vs. National Bank — Breach of Loan Agreement',
            description:
              'Client claims the bank improperly accelerated a commercial loan and imposed excessive penalties in violation of SAMA regulations.',
            status: 'active',
            type: 'commercial',
            priority: 'high',
            court: 'Riyadh Commercial Court - First Instance',
            lawyerId: 'lawyer-1',
            clientId: 'client-1',
            filedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            nextHearing: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'case-2',
            caseNumber: 'CAS-2024-002',
            title: 'TechVentures Inc — Intellectual Property Dispute',
            description:
              'Software patent infringement claim by a former contractor seeking ownership of proprietary code developed during engagement.',
            status: 'active',
            type: 'commercial',
            priority: 'high',
            court: 'Riyadh Commercial Court - Appeals',
            lawyerId: 'lawyer-1',
            clientId: 'client-2',
            filedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
            nextHearing: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'case-3',
            caseNumber: 'CAS-2024-003',
            title: 'Al-Dosari — Khula & Custody Proceedings',
            description:
              'Client seeking khula dissolution of marriage and full custody of three minor children with visitation schedule for father.',
            status: 'pending',
            type: 'family',
            priority: 'medium',
            court: 'Jeddah Family Court',
            lawyerId: 'lawyer-1',
            clientId: 'client-3',
            filedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'case-4',
            caseNumber: 'CAS-2024-004',
            title: 'Gulf Construction Co — Contract Performance Claim',
            description:
              'Developer failed to complete Phase 2 of the residential compound within the contractual timeline causing significant financial losses.',
            status: 'active',
            type: 'real_estate',
            priority: 'high',
            court: 'Dammam General Court',
            lawyerId: 'lawyer-1',
            clientId: 'client-4',
            filedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            nextHearing: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'case-5',
            caseNumber: 'CAS-2024-005',
            title: 'Al-Otaibi — Traffic Accident Criminal Liability',
            description:
              'Client facing criminal charges following a fatal traffic collision on King Fahd Road. Claiming contributory negligence by other driver.',
            status: 'intake',
            type: 'criminal',
            priority: 'high',
            court: 'Riyadh Criminal Court',
            lawyerId: 'lawyer-1',
            clientId: 'client-5',
            filedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'case-6',
            caseNumber: 'CAS-2024-006',
            title: 'Al-Rashid & Partners — Labor Dispute (Employee Termination)',
            description:
              'Wrongful termination claim by former office manager alleging unfair dismissal without cause under Saudi Labor Law.',
            status: 'on_hold',
            type: 'labor',
            priority: 'low',
            court: 'Riyadh Labor Court',
            lawyerId: 'lawyer-1',
            clientId: 'client-1',
            filedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'case-7',
            caseNumber: 'CAS-2024-007',
            title: 'TechVentures Inc — Shareholder Agreement Amendment',
            description:
              'Drafting and negotiating amendments to the shareholders agreement following Series B funding round.',
            status: 'closed',
            type: 'corporate',
            priority: 'medium',
            court: '',
            lawyerId: 'lawyer-1',
            clientId: 'client-2',
            filedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
            closedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'case-8',
            caseNumber: 'CAS-2024-008',
            title: 'Al-Dosari — Property Inheritance Division',
            description:
              'Partitioning of deceased father\'s estate including three properties in Jeddah and bank accounts per Islamic inheritance rules.',
            status: 'pending',
            type: 'family',
            priority: 'medium',
            court: 'Jeddah General Court',
            lawyerId: 'lawyer-1',
            clientId: 'client-3',
            filedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'case-9',
            caseNumber: 'CAS-2024-009',
            title: 'Gulf Construction Co — Government Contract Dispute',
            description:
              'Dispute with Ministry of Housing over delayed payments for public infrastructure project in the Eastern Province.',
            status: 'active',
            type: 'commercial',
            priority: 'critical',
            court: 'Board of Grievances - Dammam',
            lawyerId: 'lawyer-1',
            clientId: 'client-4',
            filedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
            nextHearing: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'case-10',
            caseNumber: 'CAS-2024-010',
            title: 'Al-Otaibi — Employment Visa Transfer',
            description:
              'Assisting client with employer sponsorship transfer and resolving exit/re-entry visa complications.',
            status: 'closed',
            type: 'labor',
            priority: 'low',
            court: '',
            lawyerId: 'lawyer-1',
            clientId: 'client-5',
            filedAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
            closedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'case-11',
            caseNumber: 'CAS-2024-001-A',
            title: 'Al-Salem vs. National Bank — Counter-claim Defense',
            description:
              'Bank filed counter-claim alleging client defaulted on personal guarantee. Preparing defense strategy and evidence.',
            status: 'active',
            type: 'commercial',
            priority: 'high',
            court: 'Riyadh Commercial Court - First Instance',
            lawyerId: 'lawyer-1',
            clientId: 'client-1',
            parentId: 'case-1',
            filedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            nextHearing: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'case-12',
            caseNumber: 'CAS-2024-001-B',
            title: 'Al-Salem vs. National Bank — Freezing Order Challenge',
            description:
              'Challenging the preliminary asset freeze order obtained by the bank. Filed motion to lift restrictions on client accounts.',
            status: 'pending',
            type: 'commercial',
            priority: 'critical',
            court: 'Riyadh Commercial Court - First Instance',
            lawyerId: 'lawyer-1',
            clientId: 'client-1',
            parentId: 'case-1',
            filedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            nextHearing: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          },
        ],
      });
      counts.cases = 12;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`Cases: ${msg}`);
    }

    // ─── 5. Tasks ─────────────────────────────────────────────────
    try {
      await db.task.createMany({
        data: [
          {
            id: 'task-1',
            title: 'Review loan agreement and identify penalty clauses',
            description: 'Analyze the original loan contract between Al-Salem and National Bank for SAMA compliance.',
            status: 'completed',
            priority: 'high',
            category: 'review',
            caseId: 'case-1',
            dueDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-2',
            title: 'Draft statement of claim for breach of contract',
            description: 'Prepare formal statement of claim for filing at Riyadh Commercial Court.',
            status: 'completed',
            priority: 'high',
            category: 'drafting',
            caseId: 'case-1',
            dueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-3',
            title: 'Research SAMA regulations on loan acceleration',
            description: 'Gather regulatory precedents and SAMA circulars regarding commercial loan acceleration procedures.',
            status: 'in_progress',
            priority: 'medium',
            category: 'research',
            caseId: 'case-1',
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-4',
            title: 'Prepare expert witness report on software code',
            description: 'Coordinate with forensic software analyst to produce expert report on code similarity.',
            status: 'pending',
            priority: 'high',
            category: 'review',
            caseId: 'case-2',
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-5',
            title: 'File motion for protective order on source code',
            description: 'Seek court order to protect proprietary source code from disclosure during discovery.',
            status: 'in_progress',
            priority: 'high',
            category: 'filing',
            caseId: 'case-2',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-6',
            title: 'Draft khula petition and supporting affidavit',
            description: 'Prepare khula petition citing irreconcilable differences and financial grounds.',
            status: 'completed',
            priority: 'medium',
            category: 'drafting',
            caseId: 'case-3',
            dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-7',
            title: 'Collect and organize marriage financial records',
            description: 'Gather mahr records, joint account statements, and property documentation.',
            status: 'completed',
            priority: 'medium',
            category: 'research',
            caseId: 'case-3',
            dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-8',
            title: 'Attend site inspection at residential compound',
            description: 'Inspect Phase 2 construction site to document incomplete work and defects.',
            status: 'completed',
            priority: 'high',
            category: 'court',
            caseId: 'case-4',
            dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-9',
            title: 'Obtain construction delay expert opinion',
            description: 'Engage engineering consultant to assess delay and quantify damages.',
            status: 'in_progress',
            priority: 'high',
            category: 'research',
            caseId: 'case-4',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-10',
            title: 'Review traffic police report and forensic evidence',
            description: 'Analyze Najiz traffic accident report, CCTV footage, and witness statements.',
            status: 'pending',
            priority: 'critical',
            category: 'review',
            caseId: 'case-5',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-11',
            title: 'Prepare client for criminal court hearing',
            description: 'Brief Al-Otaibi on court procedures, likely questions, and defense strategy.',
            status: 'pending',
            priority: 'high',
            category: 'meeting',
            caseId: 'case-5',
            dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-12',
            title: 'Draft defense memorandum for counter-claim',
            description: 'Prepare comprehensive defense to bank\'s counter-claim on personal guarantee.',
            status: 'in_progress',
            priority: 'high',
            category: 'drafting',
            caseId: 'case-11',
            dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-13',
            title: 'File motion to lift asset freeze order',
            description: 'Draft and file urgent motion challenging the preliminary freezing of client accounts.',
            status: 'in_progress',
            priority: 'critical',
            category: 'filing',
            caseId: 'case-12',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-14',
            title: 'Draft shareholders agreement amendment',
            description: 'Incorporate Series B investor rights, board composition changes, and liquidation preferences.',
            status: 'completed',
            priority: 'medium',
            category: 'drafting',
            caseId: 'case-7',
            dueDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-15',
            title: 'Research inheritance shares under Islamic law',
            description: 'Calculate exact inheritance fractions for all heirs and prepare division proposal.',
            status: 'in_progress',
            priority: 'medium',
            category: 'research',
            caseId: 'case-8',
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-16',
            title: 'Prepare government contract claim submission',
            description: 'Draft detailed claim for delayed payments including interest calculation and supporting invoices.',
            status: 'in_progress',
            priority: 'critical',
            category: 'drafting',
            caseId: 'case-9',
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-17',
            title: 'Compile financial documents for Board of Grievances',
            description: 'Organize all invoices, correspondence with Ministry, and project milestone records.',
            status: 'pending',
            priority: 'high',
            category: 'filing',
            caseId: 'case-9',
            dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-18',
            title: 'Client meeting — case strategy review',
            description: 'Meet with Mohammed Al-Salem to discuss settlement options and trial timeline.',
            status: 'pending',
            priority: 'medium',
            category: 'meeting',
            caseId: 'case-1',
            dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-19',
            title: 'Review opposing counsel\'s discovery responses',
            description: 'Analyze National Bank\'s document production for completeness and identify gaps.',
            status: 'pending',
            priority: 'medium',
            category: 'review',
            caseId: 'case-1',
            dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-20',
            title: 'Draft witness list for TechVentures IP case',
            description: 'Prepare and file list of witnesses with brief testimony summaries.',
            status: 'pending',
            priority: 'medium',
            category: 'filing',
            caseId: 'case-2',
            dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-21',
            title: 'Organize custody documentation',
            description: 'Compile school records, medical reports, and character references for custody hearing.',
            status: 'in_progress',
            priority: 'high',
            category: 'research',
            caseId: 'case-3',
            dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-22',
            title: 'Prepare mediation brief for Gulf Construction',
            description: 'Draft position paper for court-ordered mediation with developer.',
            status: 'pending',
            priority: 'medium',
            category: 'drafting',
            caseId: 'case-4',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-23',
            title: 'Obtain and review CCTV footage from traffic accident',
            description: 'Coordinate with traffic department to obtain official CCTV recording of the collision.',
            status: 'pending',
            priority: 'high',
            category: 'research',
            caseId: 'case-5',
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-24',
            title: 'File property valuation requests for inheritance',
            description: 'Submit requests to three licensed property valuers for Jeddah properties.',
            status: 'pending',
            priority: 'low',
            category: 'filing',
            caseId: 'case-8',
            dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'task-25',
            title: 'Prepare closing memo for Shareholder Agreement case',
            description: 'Draft final closing memorandum documenting completed amendments and next steps.',
            status: 'completed',
            priority: 'low',
            category: 'drafting',
            caseId: 'case-7',
            dueDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
          },
        ],
      });
      counts.tasks = 25;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`Tasks: ${msg}`);
    }

    // ─── 6. Feature Flags ─────────────────────────────────────────
    try {
      await db.featureFlag.createMany({
        data: [
          { key: 'kanban_board', enabled: true, description: 'Kanban board view for task management' },
          { key: 'ai_assistant', enabled: true, description: 'AI-powered legal assistant for document review' },
          { key: 'time_tracking', enabled: true, description: 'Time tracking and billing integration' },
          { key: 'team_management', enabled: true, description: 'Advanced team collaboration features' },
          { key: 'evidence_management', enabled: false, description: 'Digital evidence management and chain of custody' },
          { key: 'client_portal', enabled: false, description: 'Self-service client portal for case updates' },
          { key: 'advanced_analytics', enabled: false, description: 'Advanced analytics and reporting dashboards' },
          { key: 'calendar_sync', enabled: false, description: 'Two-way calendar sync with Google and Outlook' },
        ],
      });
      counts.featureFlags = 8;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`FeatureFlags: ${msg}`);
    }

    // ─── 7. Case Parties ──────────────────────────────────────────
    try {
      await db.caseParty.createMany({
        data: [
          // Case 1 - Al-Salem vs. National Bank
          { id: 'party-1', caseId: 'case-1', name: 'Mohammed Al-Salem', role: 'plaintiff', contactInfo: '+966551112233' },
          { id: 'party-2', caseId: 'case-1', name: 'National Bank of Saudi Arabia', role: 'defendant', contactInfo: 'legal@nbsa.sa' },
          { id: 'party-3', caseId: 'case-1', name: 'Mr. Hassan Al-Mutairi', role: 'opposing_counsel', contactInfo: 'hassan@nbsa-legal.sa' },
          { id: 'party-4', caseId: 'case-1', name: 'Judge Sheikh Abdulrahman Al-Bakr', role: 'judge', contactInfo: '' },

          // Case 2 - TechVentures IP
          { id: 'party-5', caseId: 'case-2', name: 'TechVentures Inc', role: 'plaintiff', contactInfo: 'info@techventures.sa' },
          { id: 'party-6', caseId: 'case-2', name: 'Youssef Al-Ramadi', role: 'defendant', contactInfo: 'youssef@gmail.com' },
          { id: 'party-7', caseId: 'case-2', name: 'Dr. Layla Al-Shammari', role: 'expert', contactInfo: 'layla@forensic-tech.sa' },
          { id: 'party-8', caseId: 'case-2', name: 'Ms. Huda Al-Ghamdi', role: 'opposing_counsel', contactInfo: 'huda@ip-law.sa' },

          // Case 3 - Khula & Custody
          { id: 'party-9', caseId: 'case-3', name: 'Aisha Al-Dosari', role: 'plaintiff', contactInfo: '+966554445566' },
          { id: 'party-10', caseId: 'case-3', name: 'Majed Al-Dosari', role: 'defendant', contactInfo: '+966553334444' },
          { id: 'party-11', caseId: 'case-3', name: 'Judge Dr. Salman Al-Omar', role: 'judge', contactInfo: '' },

          // Case 4 - Gulf Construction
          { id: 'party-12', caseId: 'case-4', name: 'Gulf Construction Co', role: 'plaintiff', contactInfo: 'contact@gulfconstruction.sa' },
          { id: 'party-13', caseId: 'case-4', name: 'Al-Majd Development LLC', role: 'defendant', contactInfo: 'legal@almajd-dev.sa' },
          { id: 'party-14', caseId: 'case-4', name: 'Eng. Fawaz Al-Dosari', role: 'expert', contactInfo: 'fawaz@engineering-consult.sa' },
          { id: 'party-15', caseId: 'case-4', name: 'Mr. Nasser Al-Harbi', role: 'opposing_counsel', contactInfo: 'nasser@almajd-legal.sa' },

          // Case 5 - Criminal Traffic
          { id: 'party-16', caseId: 'case-5', name: 'Fahad Al-Otaibi', role: 'defendant', contactInfo: '+966557778899' },
          { id: 'party-17', caseId: 'case-5', name: 'Public Prosecution', role: 'plaintiff', contactInfo: '' },
          { id: 'party-18', caseId: 'case-5', name: 'Officer Tariq Al-Shehri', role: 'witness', contactInfo: 'traffic@riyadh-police.sa' },
          { id: 'party-19', caseId: 'case-5', name: 'Judge Sheikh Ibrahim Al-Farsi', role: 'judge', contactInfo: '' },

          // Case 9 - Government Contract
          { id: 'party-20', caseId: 'case-9', name: 'Gulf Construction Co', role: 'plaintiff', contactInfo: 'contact@gulfconstruction.sa' },
          { id: 'party-21', caseId: 'case-9', name: 'Ministry of Housing', role: 'defendant', contactInfo: 'legal@moh.gov.sa' },

          // Case 11 - Counter-claim
          { id: 'party-22', caseId: 'case-11', name: 'Mohammed Al-Salem', role: 'defendant', contactInfo: '+966551112233' },
          { id: 'party-23', caseId: 'case-11', name: 'National Bank of Saudi Arabia', role: 'plaintiff', contactInfo: 'legal@nbsa.sa' },
          { id: 'party-24', caseId: 'case-11', name: 'Mr. Hassan Al-Mutairi', role: 'opposing_counsel', contactInfo: 'hassan@nbsa-legal.sa' },

          // Case 12 - Freezing Order
          { id: 'party-25', caseId: 'case-12', name: 'Mohammed Al-Salem', role: 'plaintiff', contactInfo: '+966551112233' },
          { id: 'party-26', caseId: 'case-12', name: 'National Bank of Saudi Arabia', role: 'defendant', contactInfo: 'legal@nbsa.sa' },

          // Case 8 - Inheritance
          { id: 'party-27', caseId: 'case-8', name: 'Aisha Al-Dosari', role: 'plaintiff', contactInfo: '+966554445566' },
          { id: 'party-28', caseId: 'case-8', name: 'Dr. Riyadh Al-Zahrani', role: 'expert', contactInfo: 'riyadh@valuation.sa' },

          // Case 6 - Labor Dispute
          { id: 'party-29', caseId: 'case-6', name: 'Former Employee - Lina Al-Ahmari', role: 'plaintiff', contactInfo: 'lina@gmail.com' },
          { id: 'party-30', caseId: 'case-6', name: 'Al-Rashid & Partners', role: 'defendant', contactInfo: 'ahmed@wakeely.com' },
        ],
      });
      counts.caseParties = 30;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`CaseParties: ${msg}`);
    }

    // ─── 8. Task Assignments ──────────────────────────────────────
    try {
      await db.taskAssignment.createMany({
        data: [
          { id: 'assign-1', taskId: 'task-1', teamMemberId: 'member-1', assignedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000) },
          { id: 'assign-2', taskId: 'task-2', teamMemberId: 'member-1', assignedAt: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000) },
          { id: 'assign-3', taskId: 'task-3', teamMemberId: 'member-3', assignedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
          { id: 'assign-4', taskId: 'task-5', teamMemberId: 'member-4', assignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          { id: 'assign-5', taskId: 'task-6', teamMemberId: 'member-1', assignedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000) },
          { id: 'assign-6', taskId: 'task-8', teamMemberId: 'member-2', assignedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
          { id: 'assign-7', taskId: 'task-10', teamMemberId: 'member-2', assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { id: 'assign-8', taskId: 'task-12', teamMemberId: 'member-4', assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
          { id: 'assign-9', taskId: 'task-13', teamMemberId: 'member-1', assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { id: 'assign-10', taskId: 'task-16', teamMemberId: 'member-4', assignedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
        ],
      });
      counts.taskAssignments = 10;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`TaskAssignments: ${msg}`);
    }

    // ─── 9. Time Entries ──────────────────────────────────────────
    try {
      await db.timeEntry.createMany({
        data: [
          { id: 'time-1', caseId: 'case-1', teamMemberId: 'member-1', description: 'Legal research on case precedents', duration: 120, rate: 1200, date: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000), activityType: 'research', billed: false },
          { id: 'time-2', caseId: 'case-1', teamMemberId: 'member-1', description: 'Drafting motion to dismiss', duration: 180, rate: 1200, date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), activityType: 'drafting', billed: false },
          { id: 'time-3', caseId: 'case-1', teamMemberId: 'member-3', description: 'Document review and organization', duration: 90, rate: 500, date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), activityType: 'review', billed: false },
          { id: 'time-4', caseId: 'case-2', teamMemberId: 'member-4', description: 'Client consultation on IP strategy', duration: 60, rate: 1500, date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), activityType: 'meeting', billed: true },
          { id: 'time-5', caseId: 'case-2', teamMemberId: 'member-1', description: 'Reviewing expert witness qualifications', duration: 45, rate: 1200, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), activityType: 'review', billed: false },
          { id: 'time-6', caseId: 'case-3', teamMemberId: 'member-1', description: 'Client consultation — khula proceedings', duration: 75, rate: 1200, date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), activityType: 'meeting', billed: false },
          { id: 'time-7', caseId: 'case-4', teamMemberId: 'member-2', description: 'Site inspection at construction compound', duration: 180, rate: 1000, date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), activityType: 'court', billed: false },
          { id: 'time-8', caseId: 'case-4', teamMemberId: 'member-2', description: 'Drafting mediation brief', duration: 120, rate: 1000, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), activityType: 'drafting', billed: false },
          { id: 'time-9', caseId: 'case-5', teamMemberId: 'member-2', description: 'Reviewing police and forensic reports', duration: 90, rate: 1000, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), activityType: 'review', billed: false },
          { id: 'time-10', caseId: 'case-9', teamMemberId: 'member-4', description: 'Drafting government contract claim', duration: 150, rate: 1500, date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), activityType: 'drafting', billed: false },
          { id: 'time-11', caseId: 'case-9', teamMemberId: 'member-3', description: 'Organizing financial documentation', duration: 60, rate: 500, date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), activityType: 'research', billed: false },
          { id: 'time-12', caseId: 'case-11', teamMemberId: 'member-4', description: 'Legal research on personal guarantee defenses', duration: 105, rate: 1500, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), activityType: 'research', billed: false },
          { id: 'time-13', caseId: 'case-12', teamMemberId: 'member-1', description: 'Drafting urgent motion to lift freeze', duration: 60, rate: 1200, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), activityType: 'drafting', billed: false },
          { id: 'time-14', caseId: 'case-8', teamMemberId: 'member-3', description: 'Research on Islamic inheritance calculations', duration: 90, rate: 500, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), activityType: 'research', billed: false },
          { id: 'time-15', caseId: 'case-7', teamMemberId: 'member-4', description: 'Final review of shareholders agreement', duration: 45, rate: 1500, date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), activityType: 'review', billed: true },
        ],
      });
      counts.timeEntries = 15;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`TimeEntries: ${msg}`);
    }

    // ─── 10. Expenses ─────────────────────────────────────────────
    try {
      await db.expense.createMany({
        data: [
          { id: 'exp-1', caseId: 'case-1', description: 'Court filing fees — Commercial Court', amount: 2500, category: 'filing', date: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000), receiptUrl: '' },
          { id: 'exp-2', caseId: 'case-2', description: 'Expert witness fee — software forensics', amount: 15000, category: 'expert', date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), receiptUrl: '' },
          { id: 'exp-3', caseId: 'case-4', description: 'Travel expenses — Dammam site visit', amount: 1800, category: 'travel', date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), receiptUrl: '' },
          { id: 'exp-4', caseId: 'case-4', description: 'Engineering consultant — delay assessment', amount: 22000, category: 'expert', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), receiptUrl: '' },
          { id: 'exp-5', caseId: 'case-1', description: 'Courier service — legal documents to court', amount: 350, category: 'courier', date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), receiptUrl: '' },
          { id: 'exp-6', caseId: 'case-9', description: 'Court filing fees — Board of Grievances', amount: 5000, category: 'filing', date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), receiptUrl: '' },
          { id: 'exp-7', caseId: 'case-5', description: 'Police report and traffic department fees', amount: 200, category: 'filing', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), receiptUrl: '' },
          { id: 'exp-8', caseId: 'case-3', description: 'Court translation services — Arabic to English', amount: 1200, category: 'expert', date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), receiptUrl: '' },
        ],
      });
      counts.expenses = 8;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`Expenses: ${msg}`);
    }

    // ─── 11. Calendar Events ──────────────────────────────────────
    try {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      await db.calendarEvent.createMany({
        data: [
          { id: 'cal-1', caseId: 'case-1', title: 'Hearing — Preliminary Objections', type: 'hearing', start: new Date(now + 14 * day), end: new Date(now + 14 * day + 2 * 60 * 60 * 1000), location: 'Riyadh Commercial Court - Hall 3', description: 'Preliminary hearing on bank\'s procedural objections.' },
          { id: 'cal-2', caseId: 'case-2', title: 'Mediation Session — IP Dispute', type: 'mediation', start: new Date(now + 21 * day), end: new Date(now + 21 * day + 3 * 60 * 60 * 1000), location: 'Riyadh Center for Commercial Arbitration', description: 'Court-referred mediation with opposing party.' },
          { id: 'cal-3', caseId: 'case-4', title: 'Site Inspection — Residential Compound', type: 'hearing', start: new Date(now + 7 * day), end: new Date(now + 7 * day + 5 * 60 * 60 * 1000), location: 'Al-Majd Residential Compound, Dammam', description: 'Joint site inspection with court-appointed expert.' },
          { id: 'cal-4', caseId: 'case-5', title: 'Criminal Court Hearing', type: 'hearing', start: new Date(now + 28 * day), end: new Date(now + 28 * day + 2 * 60 * 60 * 1000), location: 'Riyadh Criminal Court - Chamber 5', description: 'Initial hearing on traffic accident charges.' },
          { id: 'cal-5', caseId: 'case-1', title: 'Client Meeting — Al-Salem', type: 'meeting', start: new Date(now + 4 * day), end: new Date(now + 4 * day + 60 * 60 * 1000), location: 'Al-Rashid & Partners Office - Meeting Room A', description: 'Discuss settlement options and trial preparation.' },
          { id: 'cal-6', caseId: 'case-3', title: 'Filing Deadline — Khula Petition Amendment', type: 'deadline', start: new Date(now + 10 * day), end: new Date(now + 10 * day), location: '', description: 'Deadline to submit amended khula petition with additional documentation.' },
          { id: 'cal-7', caseId: 'case-9', title: 'Board of Grievances Hearing', type: 'hearing', start: new Date(now + 10 * day), end: new Date(now + 10 * day + 3 * 60 * 60 * 1000), location: 'Board of Grievances - Dammam Branch', description: 'First hearing on government contract payment dispute.' },
          { id: 'cal-8', caseId: 'case-12', title: 'Urgent Motion Hearing — Asset Freeze', type: 'hearing', start: new Date(now + 5 * day), end: new Date(now + 5 * day + 60 * 60 * 1000), location: 'Riyadh Commercial Court - Emergency Chamber', description: 'Emergency hearing on motion to lift asset freeze.' },
          { id: 'cal-9', caseId: 'case-2', title: 'Filing Deadline — Expert Report Submission', type: 'filing', start: new Date(now + 15 * day), end: new Date(now + 15 * day), location: 'Riyadh Commercial Court Registry', description: 'Submit expert witness report on software code analysis.' },
          { id: 'cal-10', caseId: 'case-4', title: 'Mediation — Construction Dispute', type: 'mediation', start: new Date(now + 30 * day), end: new Date(now + 30 * day + 4 * 60 * 60 * 1000), location: 'Dammam Mediation Center', description: 'Court-ordered mediation between Gulf Construction and Al-Majd Development.' },
          { id: 'cal-11', caseId: 'case-11', title: 'Filing Deadline — Defense Memorandum', type: 'deadline', start: new Date(now + 8 * day), end: new Date(now + 8 * day), location: '', description: 'Submit defense memorandum to counter-claim by National Bank.' },
          { id: 'cal-12', caseId: 'case-5', title: 'Client Preparation Meeting', type: 'meeting', start: new Date(now + 25 * day), end: new Date(now + 25 * day + 90 * 60 * 1000), location: 'Al-Rashid & Partners Office - Conference Room', description: 'Prepare Al-Otaibi for criminal hearing and review defense strategy.' },
          { id: 'cal-13', caseId: 'case-8', title: 'Property Valuation Meeting', type: 'meeting', start: new Date(now + 20 * day), end: new Date(now + 20 * day + 2 * 60 * 60 * 1000), location: 'Dr. Al-Zahrani Office, Jeddah', description: 'Review preliminary property valuations for inheritance case.' },
          { id: 'cal-14', caseId: 'case-1', title: 'Trial Commencement — Al-Salem vs. National Bank', type: 'trial', start: new Date(now + 45 * day), end: new Date(now + 45 * day + 4 * 60 * 60 * 1000), location: 'Riyadh Commercial Court - Hall 1', description: 'First day of trial proceedings.' },
          { id: 'cal-15', caseId: 'case-9', title: 'Document Submission Deadline', type: 'filing', start: new Date(now + 18 * day), end: new Date(now + 18 * day), location: 'Board of Grievances - Dammam Registry', description: 'Submit all supporting financial documents and invoices.' },
        ],
      });
      counts.calendarEvents = 15;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`CalendarEvents: ${msg}`);
    }

    // ─── 12. Evidence Items ───────────────────────────────────────
    try {
      await db.evidence.createMany({
        data: [
          { id: 'evid-1', caseId: 'case-1', title: 'Original Loan Agreement (Arabic)', type: 'document', description: 'Signed loan agreement between Al-Salem and National Bank dated 15/03/2023.', privilegeStatus: 'none', dateAdded: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000) },
          { id: 'evid-2', caseId: 'case-1', title: 'Bank Penalty Calculation Spreadsheet', type: 'digital', description: 'Excel file showing the bank\'s penalty and interest calculations.', privilegeStatus: 'none', dateAdded: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000) },
          { id: 'evid-3', caseId: 'case-1', title: 'Internal Bank Communication — Legal Strategy', type: 'document', description: 'Email chain between bank\'s legal team discussing litigation strategy. Obtained via discovery.', privilegeStatus: 'privileged', dateAdded: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) },
          { id: 'evid-4', caseId: 'case-2', title: 'Source Code Comparison Report', type: 'digital', description: 'Forensic analysis comparing TechVentures codebase with defendant\'s published application.', privilegeStatus: 'none', dateAdded: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          { id: 'evid-5', caseId: 'case-4', title: 'Construction Site Photographs', type: 'photo', description: '48 photographs documenting incomplete Phase 2 construction work and structural defects.', privilegeStatus: 'none', dateAdded: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
          { id: 'evid-6', caseId: 'case-4', title: 'Engineering Assessment Report', type: 'document', description: 'Detailed engineering report on construction delays, defects, and cost of remediation.', privilegeStatus: 'none', dateAdded: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
          { id: 'evid-7', caseId: 'case-5', title: 'CCTV Footage — King Fahd Road Collision', type: 'digital', description: 'Traffic camera recording of the accident from two angles. Duration: 45 seconds.', privilegeStatus: 'none', dateAdded: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
          { id: 'evid-8', caseId: 'case-5', title: 'Witness Testimony — bystander Abdullah Al-Ghamdi', type: 'testimony', description: 'Recorded statement of bystander who witnessed the collision. Statement taken by police.', privilegeStatus: 'none', dateAdded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        ],
      });
      counts.evidence = 8;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`Evidence: ${msg}`);
    }

    // ─── 13. Privilege Log Entries ────────────────────────────────
    try {
      await db.privilegeLog.createMany({
        data: [
          { id: 'priv-1', evidenceId: 'evid-3', caseId: 'case-1', description: 'Attorney-client communication between bank and its legal counsel regarding settlement strategy and exposure assessment.', privilegeType: 'attorney_client', date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) },
          { id: 'priv-2', evidenceId: 'evid-3', caseId: 'case-1', description: 'Internal bank memorandum prepared in anticipation of litigation containing risk assessment and settlement range analysis.', privilegeType: 'work_product', date: new Date(Date.now() - 34 * 24 * 60 * 60 * 1000) },
          { id: 'priv-3', evidenceId: 'evid-3', caseId: 'case-1', description: 'Legal opinion from external counsel on SAMA regulation compliance for the disputed loan terms.', privilegeType: 'attorney_client', date: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000) },
          { id: 'priv-4', evidenceId: 'evid-3', caseId: 'case-1', description: 'Draft defense strategy document outlining possible motions and procedural arguments.', privilegeType: 'work_product', date: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000) },
          { id: 'priv-5', evidenceId: 'evid-3', caseId: 'case-1', description: 'Settlement negotiation notes from bank-internal meeting with authorized representatives.', privilegeType: 'settlement', date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) },
        ],
      });
      counts.privilegeLogs = 5;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`PrivilegeLogs: ${msg}`);
    }

    // ─── 14. Billing Entries ──────────────────────────────────────
    try {
      await db.billing.createMany({
        data: [
          { id: 'bill-1', caseId: 'case-1', clientId: 'client-1', description: 'Legal fees — case preparation and research (Month 1)', amount: 45000, status: 'paid', issuedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), paidDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
          { id: 'bill-2', caseId: 'case-1', clientId: 'client-1', description: 'Legal fees — hearings and motion drafting (Month 2)', amount: 38000, status: 'pending', issuedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), paidDate: null },
          { id: 'bill-3', caseId: 'case-2', clientId: 'client-2', description: 'IP dispute — initial consultation and case assessment', amount: 25000, status: 'paid', issuedDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), paidDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000) },
          { id: 'bill-4', caseId: 'case-2', clientId: 'client-2', description: 'IP dispute — expert engagement and motion filing', amount: 55000, status: 'draft', issuedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), paidDate: null },
          { id: 'bill-5', caseId: 'case-4', clientId: 'client-4', description: 'Construction dispute — site inspection and expert coordination', amount: 42000, status: 'pending', issuedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000), paidDate: null },
          { id: 'bill-6', caseId: 'case-7', clientId: 'client-2', description: 'Shareholders agreement — drafting and negotiation (Final)', amount: 35000, status: 'paid', issuedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), paidDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { id: 'bill-7', caseId: 'case-9', clientId: 'client-4', description: 'Government contract dispute — claim preparation', amount: 65000, status: 'draft', issuedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000), paidDate: null },
          { id: 'bill-8', caseId: 'case-3', clientId: 'client-3', description: 'Family case — khula petition and initial filings', amount: 20000, status: 'pending', issuedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), paidDate: null },
          { id: 'bill-9', caseId: 'case-11', clientId: 'client-1', description: 'Counter-claim defense — research and memorandum drafting', amount: 30000, status: 'draft', issuedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000), paidDate: null },
          { id: 'bill-10', caseId: 'case-5', clientId: 'client-5', description: 'Criminal defense — initial case review and consultation', amount: 15000, status: 'paid', issuedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), dueDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000), paidDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        ],
      });
      counts.billing = 10;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`Billing: ${msg}`);
    }

    // ─── 15. Timeline Events ──────────────────────────────────────
    try {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      await db.timelineEvent.createMany({
        data: [
          { id: 'tl-1', caseId: 'case-1', title: 'Case filed at Riyadh Commercial Court', description: 'Statement of claim submitted to the court registry.', type: 'filing', date: new Date(now - 60 * day), actorId: 'lawyer-1' },
          { id: 'tl-2', caseId: 'case-1', title: 'Bank served with statement of claim', description: 'National Bank formally served via court bailiff.', type: 'milestone', date: new Date(now - 50 * day), actorId: 'member-1' },
          { id: 'tl-3', caseId: 'case-1', title: 'Bank filed counter-claim on personal guarantee', description: 'National Bank responded with counter-claim (Case CAS-2024-001-A).', type: 'filing', date: new Date(now - 30 * day), actorId: 'member-1' },
          { id: 'tl-4', caseId: 'case-1', title: 'Asset freeze order issued by court', description: 'Court granted preliminary asset freeze on client accounts pending resolution.', type: 'court_order', date: new Date(now - 10 * day), actorId: 'member-4' },
          { id: 'tl-5', caseId: 'case-2', title: 'Forensic code analysis completed', description: 'Expert witness submitted initial findings on code similarity assessment.', type: 'milestone', date: new Date(now - 20 * day), actorId: 'member-4' },
          { id: 'tl-6', caseId: 'case-3', title: 'Khula petition filed at Family Court', description: 'Petition submitted to Jeddah Family Court with supporting documentation.', type: 'filing', date: new Date(now - 20 * day), actorId: 'member-1' },
          { id: 'tl-7', caseId: 'case-4', title: 'Joint site inspection completed', description: 'Court-appointed expert, both parties, and legal teams conducted site visit.', type: 'milestone', date: new Date(now - 20 * day), actorId: 'member-2' },
          { id: 'tl-8', caseId: 'case-4', title: 'Engineering expert report submitted', description: 'Comprehensive engineering assessment filed documenting delays and defects.', type: 'filing', date: new Date(now - 12 * day), actorId: 'member-2' },
          { id: 'tl-9', caseId: 'case-5', title: 'Client retained for criminal defense', description: 'Fahad Al-Otaibi signed retainer agreement for criminal traffic defense.', type: 'milestone', date: new Date(now - 5 * day), actorId: 'lawyer-1' },
          { id: 'tl-10', caseId: 'case-7', title: 'Shareholders agreement amendments executed', description: 'All parties signed the amended shareholders agreement following Series B round.', type: 'milestone', date: new Date(now - 18 * day), actorId: 'member-4' },
          { id: 'tl-11', caseId: 'case-9', title: 'Claim submitted to Board of Grievances', description: 'Detailed claim for delayed payments filed against Ministry of Housing.', type: 'filing', date: new Date(now - 25 * day), actorId: 'member-4' },
          { id: 'tl-12', caseId: 'case-9', title: 'Board of Grievances acknowledged receipt', description: 'Board confirmed receipt and assigned case reference number.', type: 'milestone', date: new Date(now - 20 * day), actorId: 'member-3' },
          { id: 'tl-13', caseId: 'case-11', title: 'Defense strategy meeting held', description: 'Internal team meeting to outline counter-claim defense strategy.', type: 'milestone', date: new Date(now - 5 * day), actorId: 'member-4' },
          { id: 'tl-14', caseId: 'case-12', title: 'Motion to lift asset freeze filed', description: 'Urgent motion submitted to court seeking to dissolve the freezing order.', type: 'filing', date: new Date(now - 2 * day), actorId: 'member-1' },
          { id: 'tl-15', caseId: 'case-8', title: 'Inheritance division petition filed', description: 'Petition for estate partitioning submitted to Jeddah General Court.', type: 'filing', date: new Date(now - 40 * day), actorId: 'member-3' },
        ],
      });
      counts.timelineEvents = 15;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`TimelineEvents: ${msg}`);
    }

    // ─── 16. Activities (Audit Trail) ─────────────────────────────
    try {
      await db.activity.createMany({
        data: [
          { id: 'act-1', action: 'case.created', entityType: 'case', entityId: 'case-1', details: 'Created case CAS-2024-001: Al-Salem vs. National Bank', userId: 'lawyer-1', timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
          { id: 'act-2', action: 'client.created', entityType: 'client', entityId: 'client-2', details: 'Added new corporate client: TechVentures Inc', userId: 'lawyer-1', timestamp: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000) },
          { id: 'act-3', action: 'task.completed', entityType: 'task', entityId: 'task-2', details: 'Completed: Draft statement of claim for breach of contract', userId: 'member-1', timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) },
          { id: 'act-4', action: 'case.status_changed', entityType: 'case', entityId: 'case-7', details: 'Changed case CAS-2024-007 status from active to closed', userId: 'member-4', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
          { id: 'act-5', action: 'evidence.uploaded', entityType: 'evidence', entityId: 'evid-5', details: 'Uploaded 48 construction site photographs to case CAS-2024-004', userId: 'member-2', timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
          { id: 'act-6', action: 'billing.issued', entityType: 'billing', entityId: 'bill-3', details: 'Issued invoice #BILL-003 to TechVentures Inc for SAR 25,000', userId: 'member-4', timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) },
          { id: 'act-7', action: 'task.assigned', entityType: 'task', entityId: 'task-10', details: 'Assigned "Review traffic police report" to Omar Al-Harbi', userId: 'lawyer-1', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { id: 'act-8', action: 'case.created', entityType: 'case', entityId: 'case-12', details: 'Created sub-case CAS-2024-001-B: Asset Freeze Challenge (child of CAS-2024-001)', userId: 'member-1', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
          { id: 'act-9', action: 'calendar.created', entityType: 'calendar_event', entityId: 'cal-8', details: 'Scheduled urgent hearing on asset freeze motion for 5 days from now', userId: 'member-1', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { id: 'act-10', action: 'team.member_added', entityType: 'team_member', entityId: 'member-5', details: 'Added new team member: Noura Al-Saeed (trainee)', userId: 'lawyer-1', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        ],
      });
      counts.activities = 10;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`Activities: ${msg}`);
    }

    // ─── Summary ──────────────────────────────────────────────────
    const hasErrors = errors.length > 0;

    return NextResponse.json(
      {
        success: !hasErrors,
        message: hasErrors
          ? 'Seed completed with some errors'
          : 'Seed completed successfully',
        counts,
        errors: hasErrors ? errors : undefined,
      },
      { status: hasErrors ? 207 : 200 },
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);

    return NextResponse.json(
      {
        success: false,
        message: 'Seed failed with unexpected error',
        error: msg,
        counts,
      },
      { status: 500 },
    );
  }
}