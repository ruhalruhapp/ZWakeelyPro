import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  const counts: Record<string, number> = {};
  const errors: string[] = [];
  const now = new Date();
  const day = 86400000;

  try {
    // 1. Lawyer
    try {
      await db.lawyer.create({ data: {
        id: 'lawyer-1', name: 'Dr. Ahmed Al-Rashid', email: 'ahmed@wakeely.com',
        role: 'lawyer', firm: 'Al-Rashid & Partners', licenseNo: 'SA-LAW-2020-1547',
        phone: '+966501234567',
      }});
      counts.lawyer = 1;
    } catch (e: unknown) { errors.push(`Lawyer: ${e instanceof Error ? e.message.substring(0, 80) : String(e)}`); }

    // 2. Team Members (no lawyerId field in schema)
    try {
      await db.teamMember.createMany({ data: [
        { id: 'member-1', name: 'Sara Al-Fahad', email: 'sara@wakeely.com', role: 'senior_associate', specialization: 'Commercial Law', phone: '+966502345678' },
        { id: 'member-2', name: 'Omar Al-Harbi', email: 'omar@wakeely.com', role: 'associate', specialization: 'Criminal Law', phone: '+966503456789' },
        { id: 'member-3', name: 'Fatima Al-Zahrani', email: 'fatima@wakeely.com', role: 'paralegal', phone: '+966504567890' },
        { id: 'member-4', name: 'Khalid Al-Qahtani', email: 'khalid@wakeely.com', role: 'partner', specialization: 'Corporate Law', barNumber: 'SA-LAW-2018-0892', phone: '+966505678901' },
        { id: 'member-5', name: 'Noura Al-Saeed', email: 'noura@wakeely.com', role: 'trainee', phone: '+966506789012' },
      ]});
      counts.teamMembers = 5;
    } catch (e: unknown) { errors.push(`TeamMembers: ${e instanceof Error ? e.message.substring(0, 80) : String(e)}`); }

    // 3. Clients (fullName not name)
    try {
      await db.client.createMany({ data: [
        { id: 'client-1', fullName: 'Mohammed Al-Salem', email: 'mohammed@email.com', type: 'individual', phone: '+966551112233', nationalId: '1098765432', address: 'Riyadh, Al Olaya District' },
        { id: 'client-2', fullName: 'TechVentures Inc', email: 'info@techventures.sa', type: 'corporate', phone: '+966112345678', company: 'TechVentures Inc', address: 'Riyadh, King Fahd Road' },
        { id: 'client-3', fullName: 'Aisha Al-Dosari', email: 'aisha@email.com', type: 'individual', phone: '+966552223344', address: 'Jeddah, Al Hamra District' },
        { id: 'client-4', fullName: 'Gulf Construction Co', email: 'contact@gulfconstruction.sa', type: 'corporate', phone: '+966114567890', company: 'Gulf Construction Co', address: 'Dammam, Corniche Road' },
        { id: 'client-5', fullName: 'Fahad Al-Otaibi', email: 'fahad@email.com', type: 'individual', phone: '+966553334455', address: 'Riyadh, Al Nakheel' },
      ]});
      counts.clients = 5;
    } catch (e: unknown) { errors.push(`Clients: ${e instanceof Error ? e.message.substring(0, 80) : String(e)}`); }

    // 4. Cases
    try {
      await db.case.createMany({ data: [
        { id: 'case-1', caseNumber: 'CAS-2024-001', title: 'Al-Salem vs. National Bank', description: 'Breach of contract case regarding loan agreement terms', caseType: 'commercial', status: 'active', priority: 'high', court: 'Riyadh Commercial Court', jurisdiction: 'Riyadh', judge: 'Judge Abdullah Al-Mutairi', opposingCounsel: 'Atty. Hassan Al-Badr', opposingCounselFirm: 'Al-Badr Legal Group', filedDate: new Date(now.getTime() - 90*day), nextHearing: new Date(now.getTime() + 14*day), statuteLimitDate: new Date(now.getTime() + 270*day), value: 2500000, currency: 'SAR', lawyerId: 'lawyer-1', clientId: 'client-1' },
        { id: 'case-2', caseNumber: 'CAS-2024-002', title: 'TechVentures IP Infringement', description: 'Intellectual property infringement by competitor', caseType: 'commercial', status: 'active', priority: 'high', court: 'Riyadh Commercial Court', jurisdiction: 'Riyadh', opposingCounsel: 'Atty. Nadia Al-Shammari', filedDate: new Date(now.getTime() - 60*day), nextHearing: new Date(now.getTime() + 7*day), value: 5000000, currency: 'SAR', lawyerId: 'lawyer-1', clientId: 'client-2' },
        { id: 'case-3', caseNumber: 'CAS-2024-003', title: 'Al-Dosari Property Dispute', description: 'Boundary dispute with neighbor over property line', caseType: 'real_estate', status: 'pending', priority: 'medium', court: 'Jeddah General Court', jurisdiction: 'Jeddah', judge: 'Judge Saud Al-Ghamdi', filedDate: new Date(now.getTime() - 45*day), value: 850000, currency: 'SAR', lawyerId: 'lawyer-1', clientId: 'client-3' },
        { id: 'case-4', caseNumber: 'CAS-2024-004', title: 'Gulf Construction Contract Claim', description: 'Payment dispute for construction project Phase 2', caseType: 'commercial', status: 'active', priority: 'critical', court: 'Dammam Commercial Court', jurisdiction: 'Eastern Province', opposingCounsel: 'Atty. Faisal Al-Dossari', opposingCounselFirm: 'Dossari & Associates', filedDate: new Date(now.getTime() - 120*day), nextHearing: new Date(now.getTime() + 21*day), value: 12000000, currency: 'SAR', lawyerId: 'lawyer-1', clientId: 'client-4' },
        { id: 'case-5', caseNumber: 'CAS-2024-005', title: 'Al-Otaibi Labor Dispute', description: 'Wrongful termination and unpaid benefits claim', caseType: 'labor', status: 'intake', priority: 'medium', court: 'Riyadh Labor Court', jurisdiction: 'Riyadh', lawyerId: 'lawyer-1', clientId: 'client-5' },
        { id: 'case-6', caseNumber: 'CAS-2024-006', title: 'Al-Rashid Family Inheritance', description: 'Complex inheritance distribution among multiple heirs', caseType: 'family', status: 'active', priority: 'high', court: 'Riyadh General Court', jurisdiction: 'Riyadh', filedDate: new Date(now.getTime() - 30*day), value: 15000000, currency: 'SAR', lawyerId: 'lawyer-1' },
        { id: 'case-7', caseNumber: 'CAS-2024-007', title: 'Ministry of Commerce Appeal', description: 'Appeal against commercial regulatory penalty', caseType: 'criminal', status: 'pending', priority: 'medium', court: 'Riyadh Administrative Court', jurisdiction: 'Riyadh', filedDate: new Date(now.getTime() - 15*day), lawyerId: 'lawyer-1', clientId: 'client-2' },
        { id: 'case-8', caseNumber: 'CAS-2024-008', title: 'Al-Fahad Divorce Settlement', description: 'Divorce with asset division and custody arrangement', caseType: 'family', status: 'active', priority: 'high', court: 'Jeddah Personal Status Court', jurisdiction: 'Jeddah', filedDate: new Date(now.getTime() - 20*day), nextHearing: new Date(now.getTime() + 10*day), lawyerId: 'lawyer-1', clientId: 'client-3' },
        { id: 'case-9', caseNumber: 'CAS-2024-009', title: 'Gulf Co. vs. Supplier Defect', description: 'Product liability and defect claim against supplier', caseType: 'commercial', status: 'on_hold', priority: 'low', court: 'Dammam Commercial Court', jurisdiction: 'Eastern Province', filedDate: new Date(now.getTime() - 180*day), lawyerId: 'lawyer-1', clientId: 'client-4' },
        { id: 'case-10', caseNumber: 'CAS-2024-010', title: 'TechVentures Merger Review', description: 'Legal review and regulatory compliance for merger', caseType: 'corporate', status: 'active', priority: 'critical', court: 'Riyadh Commercial Court', jurisdiction: 'Riyadh', filedDate: new Date(now.getTime() - 10*day), value: 50000000, currency: 'SAR', lawyerId: 'lawyer-1', clientId: 'client-2' },
        { id: 'case-11', caseNumber: 'CAS-2024-001-A', title: 'Al-Salem vs. Bank - Counterclaim', description: 'Counterclaim for bank fees and penalties', caseType: 'commercial', status: 'active', priority: 'high', court: 'Riyadh Commercial Court', jurisdiction: 'Riyadh', parentId: 'case-1', value: 500000, currency: 'SAR', lawyerId: 'lawyer-1', clientId: 'client-1' },
        { id: 'case-12', caseNumber: 'CAS-2024-001-B', title: 'Al-Salem vs. Bank - Interest Calculation', description: 'Dispute over interest calculation methodology', caseType: 'commercial', status: 'pending', priority: 'medium', court: 'Riyadh Commercial Court', jurisdiction: 'Riyadh', parentId: 'case-1', lawyerId: 'lawyer-1', clientId: 'client-1' },
      ]});
      counts.cases = 12;
    } catch (e: unknown) { errors.push(`Cases: ${e instanceof Error ? e.message.substring(0, 80) : String(e)}`); }

    // 5. Tasks
    try {
      await db.task.createMany({ data: [
        { id: 'task-1', title: 'Review loan agreement documents', description: 'Analyze all loan agreement terms and identify breaches', status: 'in_progress', priority: 'high', dueDate: new Date(now.getTime() + 3*day), category: 'review', estimatedHours: 4, caseId: 'case-1', lawyerId: 'lawyer-1' },
        { id: 'task-2', title: 'Draft statement of claim', description: 'Prepare initial statement of claim for filing', status: 'pending', priority: 'high', dueDate: new Date(now.getTime() + 5*day), category: 'drafting', estimatedHours: 8, caseId: 'case-1', lawyerId: 'lawyer-1' },
        { id: 'task-3', title: 'Research IP case precedents', description: 'Find similar IP infringement cases in Saudi courts', status: 'completed', priority: 'medium', dueDate: new Date(now.getTime() - 5*day), completedAt: new Date(now.getTime() - 6*day), category: 'research', estimatedHours: 6, caseId: 'case-2', lawyerId: 'lawyer-1' },
        { id: 'task-4', title: 'Prepare expert witness report', description: 'Coordinate with engineering expert for property survey', status: 'in_progress', priority: 'high', dueDate: new Date(now.getTime() + 7*day), category: 'research', estimatedHours: 10, caseId: 'case-3', lawyerId: 'lawyer-1' },
        { id: 'task-5', title: 'File construction claim', description: 'Submit formal claim to Dammam Commercial Court', status: 'pending', priority: 'critical', dueDate: new Date(now.getTime() + 2*day), category: 'filing', estimatedHours: 3, caseId: 'case-4', lawyerId: 'lawyer-1' },
        { id: 'task-6', title: 'Client consultation - Al-Otaibi', description: 'Initial consultation to gather employment documents', status: 'pending', priority: 'medium', dueDate: new Date(now.getTime() + 10*day), category: 'meeting', estimatedHours: 2, caseId: 'case-5', lawyerId: 'lawyer-1' },
        { id: 'task-7', title: 'Review inheritance documents', description: 'Verify will and inheritance certificates', status: 'in_progress', priority: 'high', dueDate: new Date(now.getTime() + 5*day), category: 'review', estimatedHours: 5, caseId: 'case-6', lawyerId: 'lawyer-1' },
        { id: 'task-8', title: 'Draft appeal brief', description: 'Prepare appeal arguments for regulatory penalty', status: 'pending', priority: 'medium', dueDate: new Date(now.getTime() + 14*day), category: 'drafting', estimatedHours: 12, caseId: 'case-7', lawyerId: 'lawyer-1' },
        { id: 'task-9', title: 'Prepare asset inventory', description: 'Compile comprehensive list of marital assets', status: 'in_progress', priority: 'high', dueDate: new Date(now.getTime() + 4*day), category: 'research', estimatedHours: 6, caseId: 'case-8', lawyerId: 'lawyer-1' },
        { id: 'task-10', title: 'Court hearing preparation', description: 'Prepare documents and arguments for next hearing', status: 'pending', priority: 'high', dueDate: new Date(now.getTime() + 12*day), category: 'court', estimatedHours: 4, caseId: 'case-1', lawyerId: 'lawyer-1' },
        { id: 'task-11', title: 'Merger due diligence review', description: 'Review target company legal and financial documents', status: 'in_progress', priority: 'critical', dueDate: new Date(now.getTime() + 7*day), category: 'review', estimatedHours: 20, caseId: 'case-10', lawyerId: 'lawyer-1' },
        { id: 'task-12', title: 'Draft custody agreement', description: 'Prepare child custody and visitation schedule', status: 'pending', priority: 'high', dueDate: new Date(now.getTime() + 8*day), category: 'drafting', estimatedHours: 5, caseId: 'case-8', lawyerId: 'lawyer-1' },
        { id: 'task-13', title: 'Compile evidence binder', description: 'Organize all evidence documents for court submission', status: 'completed', priority: 'medium', dueDate: new Date(now.getTime() - 3*day), completedAt: new Date(now.getTime() - 4*day), category: 'review', estimatedHours: 3, caseId: 'case-4', lawyerId: 'lawyer-1' },
        { id: 'task-14', title: 'File motion for extension', description: 'Request time extension for document submission', status: 'pending', priority: 'low', dueDate: new Date(now.getTime() + 1*day), category: 'filing', estimatedHours: 1, caseId: 'case-9', lawyerId: 'lawyer-1' },
        { id: 'task-15', title: 'Settle counterclaim negotiations', description: 'Prepare negotiation strategy for counterclaim settlement', status: 'pending', priority: 'high', dueDate: new Date(now.getTime() + 20*day), category: 'meeting', estimatedHours: 8, caseId: 'case-11', lawyerId: 'lawyer-1' },
        { id: 'task-16', title: 'Research banking regulations', description: 'Review SAMA regulations on interest calculation', status: 'in_progress', priority: 'medium', dueDate: new Date(now.getTime() + 6*day), category: 'research', estimatedHours: 4, caseId: 'case-12', lawyerId: 'lawyer-1' },
        { id: 'task-17', title: 'Draft NDA for merger', description: 'Prepare non-disclosure agreement for merger parties', status: 'completed', priority: 'high', dueDate: new Date(now.getTime() - 2*day), completedAt: new Date(now.getTime() - 3*day), category: 'drafting', estimatedHours: 3, caseId: 'case-10', lawyerId: 'lawyer-1' },
        { id: 'task-18', title: 'Prepare witness list', description: 'Compile and organize witness list with statements', status: 'pending', priority: 'medium', dueDate: new Date(now.getTime() + 9*day), category: 'research', estimatedHours: 4, caseId: 'case-2', lawyerId: 'lawyer-1' },
        { id: 'task-19', title: 'Review contractor agreements', description: 'Analyze subcontractor agreements for liability clauses', status: 'in_progress', priority: 'high', dueDate: new Date(now.getTime() + 5*day), category: 'review', estimatedHours: 6, caseId: 'case-4', lawyerId: 'lawyer-1' },
        { id: 'task-20', title: 'File labor complaint', description: 'Submit formal complaint to Ministry of Human Resources', status: 'pending', priority: 'medium', dueDate: new Date(now.getTime() + 15*day), category: 'filing', estimatedHours: 2, caseId: 'case-5', lawyerId: 'lawyer-1' },
        { id: 'task-21', title: 'Draft mediation brief', description: 'Prepare position paper for upcoming mediation', status: 'pending', priority: 'high', dueDate: new Date(now.getTime() + 11*day), category: 'drafting', estimatedHours: 8, caseId: 'case-1', lawyerId: 'lawyer-1' },
        { id: 'task-22', title: 'Update case timeline', description: 'Ensure all case milestones are documented', status: 'completed', priority: 'low', dueDate: new Date(now.getTime() - 1*day), completedAt: new Date(now.getTime() - 2*day), category: 'other', estimatedHours: 1, caseId: 'case-6', lawyerId: 'lawyer-1' },
        { id: 'task-23', title: 'Coordinate with forensic accountant', description: 'Schedule and prepare for forensic accounting review', status: 'in_progress', priority: 'high', dueDate: new Date(now.getTime() + 8*day), category: 'meeting', estimatedHours: 3, caseId: 'case-4', lawyerId: 'lawyer-1' },
        { id: 'task-24', title: 'Prepare closing arguments', description: 'Draft closing arguments for upcoming trial', status: 'pending', priority: 'critical', dueDate: new Date(now.getTime() + 16*day), category: 'drafting', estimatedHours: 10, caseId: 'case-2', lawyerId: 'lawyer-1' },
        { id: 'task-25', title: 'Review settlement offer', description: 'Analyze settlement terms and advise client', status: 'pending', priority: 'medium', dueDate: new Date(now.getTime() + 3*day), category: 'review', estimatedHours: 2, caseId: 'case-9', lawyerId: 'lawyer-1' },
      ]});
      counts.tasks = 25;
    } catch (e: unknown) { errors.push(`Tasks: ${e instanceof Error ? e.message.substring(0, 80) : String(e)}`); }

    // 6. Feature Flags
    try {
      await db.featureFlag.createMany({ data: [
        { id: 'ff-1', key: 'kanban_board', label: 'Kanban Board', description: 'Drag-and-drop task management board', enabled: true },
        { id: 'ff-2', key: 'ai_assistant', label: 'AI Legal Assistant', description: 'AI-powered legal research and document analysis', enabled: true },
        { id: 'ff-3', key: 'time_tracking', label: 'Time Tracking', description: 'Track billable hours and expenses', enabled: true },
        { id: 'ff-4', key: 'team_management', label: 'Team Management', description: 'Manage team members and assignments', enabled: true },
        { id: 'ff-5', key: 'evidence_management', label: 'Evidence Management', description: 'Organize and track evidence items', enabled: false },
        { id: 'ff-6', key: 'client_portal', label: 'Client Portal', description: 'Allow clients to view case progress', enabled: false },
        { id: 'ff-7', key: 'advanced_analytics', label: 'Advanced Analytics', description: 'Detailed reports and analytics dashboard', enabled: false },
        { id: 'ff-8', key: 'calendar_sync', label: 'Calendar Sync', description: 'Sync calendar with external services', enabled: false },
      ]});
      counts.featureFlags = 8;
    } catch (e: unknown) { errors.push(`FeatureFlags: ${e instanceof Error ? e.message.substring(0, 80) : String(e)}`); }

    // 7. Case Parties
    try {
      await db.caseParty.createMany({ data: [
        { id: 'party-1', name: 'Mohammed Al-Salem', role: 'plaintiff', type: 'individual', email: 'mohammed@email.com', phone: '+966551112233', caseId: 'case-1' },
        { id: 'party-2', name: 'National Bank of Saudi Arabia', role: 'defendant', type: 'corporate', lawyer: 'Atty. Hassan Al-Badr', caseId: 'case-1' },
        { id: 'party-3', name: 'Judge Abdullah Al-Mutairi', role: 'judge', type: 'individual', caseId: 'case-1' },
        { id: 'party-4', name: 'TechVentures Inc', role: 'plaintiff', type: 'corporate', email: 'info@techventures.sa', caseId: 'case-2' },
        { id: 'party-5', name: 'InnoSoft Solutions', role: 'defendant', type: 'corporate', lawyer: 'Atty. Nadia Al-Shammari', caseId: 'case-2' },
        { id: 'party-6', name: 'Dr. Majed Al-Harbi', role: 'expert', type: 'individual', notes: 'IP valuation expert', caseId: 'case-2' },
        { id: 'party-7', name: 'Aisha Al-Dosari', role: 'plaintiff', type: 'individual', caseId: 'case-3' },
        { id: 'party-8', name: 'Ibrahim Al-Mohammadi', role: 'defendant', type: 'individual', phone: '+966554445566', caseId: 'case-3' },
        { id: 'party-9', name: 'Eng. Sami Al-Ahmad', role: 'expert', type: 'individual', notes: 'Survey engineer', caseId: 'case-3' },
        { id: 'party-10', name: 'Gulf Construction Co', role: 'plaintiff', type: 'corporate', caseId: 'case-4' },
        { id: 'party-11', name: 'Al-Majd Trading Ltd', role: 'defendant', type: 'corporate', lawyer: 'Atty. Faisal Al-Dossari', caseId: 'case-4' },
        { id: 'party-12', name: 'Fahad Al-Otaibi', role: 'plaintiff', type: 'individual', caseId: 'case-5' },
        { id: 'party-13', name: 'Advanced Systems Corp', role: 'defendant', type: 'corporate', caseId: 'case-5' },
        { id: 'party-14', name: 'Khalid Al-Rashid', role: 'plaintiff', type: 'individual', caseId: 'case-6' },
        { id: 'party-15', name: 'Maha Al-Rashid', role: 'defendant', type: 'individual', caseId: 'case-6' },
        { id: 'party-16', name: 'Sara Al-Rashid', role: 'third_party', type: 'individual', caseId: 'case-6' },
        { id: 'party-17', name: 'TechVentures Inc', role: 'appellant', type: 'corporate', caseId: 'case-7' },
        { id: 'party-18', name: 'Ministry of Commerce', role: 'respondent', type: 'government', caseId: 'case-7' },
        { id: 'party-19', name: 'Aisha Al-Dosari', role: 'plaintiff', type: 'individual', caseId: 'case-8' },
        { id: 'party-20', name: 'Turki Al-Dosari', role: 'defendant', type: 'individual', caseId: 'case-8' },
        { id: 'party-21', name: 'Gulf Construction Co', role: 'plaintiff', type: 'corporate', caseId: 'case-9' },
        { id: 'party-22', name: 'Quality Materials Supply', role: 'defendant', type: 'corporate', caseId: 'case-9' },
        { id: 'party-23', name: 'TechVentures Inc', role: 'plaintiff', type: 'corporate', caseId: 'case-10' },
        { id: 'party-24', name: 'DataFlow Systems', role: 'defendant', type: 'corporate', lawyer: 'Atty. Rami Al-Khalidi', caseId: 'case-10' },
        { id: 'party-25', name: 'Mohammed Al-Salem', role: 'plaintiff', type: 'individual', caseId: 'case-11' },
        { id: 'party-26', name: 'National Bank of Saudi Arabia', role: 'defendant', type: 'corporate', caseId: 'case-11' },
        { id: 'party-27', name: 'Accountant Ahmad Al-Farsi', role: 'expert', type: 'individual', notes: 'Financial calculations expert', caseId: 'case-12' },
        { id: 'party-28', name: 'Layla Al-Mansour', role: 'witness', type: 'individual', notes: 'Bank employee witness', caseId: 'case-1' },
        { id: 'party-29', name: 'Rami Al-Suwaidi', role: 'witness', type: 'individual', caseId: 'case-4' },
        { id: 'party-30', name: 'Judge Sultan Al-Otaibi', role: 'judge', type: 'individual', caseId: 'case-10' },
      ]});
      counts.caseParties = 30;
    } catch (e: unknown) { errors.push(`CaseParties: ${e instanceof Error ? e.message.substring(0, 80) : String(e)}`); }

    // 8. Task Assignments
    try {
      await db.taskAssignment.createMany({ data: [
        { id: 'ta-1', taskId: 'task-1', memberId: 'member-1' },
        { id: 'ta-2', taskId: 'task-2', memberId: 'member-1' },
        { id: 'ta-3', taskId: 'task-3', memberId: 'member-2' },
        { id: 'ta-4', taskId: 'task-4', memberId: 'member-2' },
        { id: 'ta-5', taskId: 'task-5', memberId: 'member-4' },
        { id: 'ta-6', taskId: 'task-7', memberId: 'member-3' },
        { id: 'ta-7', taskId: 'task-11', memberId: 'member-1' },
        { id: 'ta-8', taskId: 'task-11', memberId: 'member-4' },
        { id: 'ta-9', taskId: 'task-19', memberId: 'member-2' },
        { id: 'ta-10', taskId: 'task-9', memberId: 'member-3' },
      ]});
      counts.taskAssignments = 10;
    } catch (e: unknown) { errors.push(`TaskAssignments: ${e instanceof Error ? e.message.substring(0, 80) : String(e)}`); }

    // 9. Time Entries
    try {
      await db.timeEntry.createMany({ data: [
        { id: 'te-1', description: 'Legal research on breach of contract precedents', duration: 90, rate: 1200, isBillable: true, activityType: 'research', date: new Date(now.getTime() - 2*day), notes: 'Saudi Commercial Court cases 2020-2024', caseId: 'case-1', lawyerId: 'lawyer-1' },
        { id: 'te-2', description: 'Drafting statement of claim - section 1', duration: 120, rate: 1200, isBillable: true, activityType: 'drafting', date: new Date(now.getTime() - 1*day), caseId: 'case-1', lawyerId: 'lawyer-1' },
        { id: 'te-3', description: 'IP case research and precedent analysis', duration: 180, rate: 1500, isBillable: true, activityType: 'research', date: new Date(now.getTime() - 7*day), notes: 'Found 12 relevant precedents', caseId: 'case-2', lawyerId: 'lawyer-1' },
        { id: 'te-4', description: 'Client consultation - initial meeting', duration: 60, rate: 1000, isBillable: true, activityType: 'meeting', date: new Date(now.getTime() - 3*day), caseId: 'case-3', lawyerId: 'lawyer-1' },
        { id: 'te-5', description: 'Review construction contract clauses', duration: 150, rate: 1200, isBillable: true, activityType: 'review', date: new Date(now.getTime() - 1*day), caseId: 'case-4', lawyerId: 'lawyer-1' },
        { id: 'te-6', description: 'Court hearing attendance', duration: 240, rate: 1500, isBillable: true, activityType: 'court', date: new Date(now.getTime() - 10*day), notes: 'Preliminary hearing - case adjourned', caseId: 'case-4', lawyerId: 'lawyer-1' },
        { id: 'te-7', description: 'Document review for inheritance case', duration: 90, rate: 1000, isBillable: true, activityType: 'review', date: new Date(now.getTime() - 4*day), caseId: 'case-6', lawyerId: 'lawyer-1' },
        { id: 'te-8', description: 'Phone call with opposing counsel', duration: 30, rate: 800, isBillable: true, activityType: 'phone', date: new Date(now.getTime() - 1*day), caseId: 'case-1', lawyerId: 'lawyer-1' },
        { id: 'te-9', description: 'Merger document due diligence review', duration: 180, rate: 1500, isBillable: true, activityType: 'review', date: new Date(now.getTime() - 2*day), notes: 'Reviewing 200+ corporate documents', caseId: 'case-10', lawyerId: 'lawyer-1' },
        { id: 'te-10', description: 'Drafting NDA for merger parties', duration: 120, rate: 1200, isBillable: true, activityType: 'drafting', date: new Date(now.getTime() - 3*day), caseId: 'case-10', lawyerId: 'lawyer-1' },
        { id: 'te-11', description: 'Email correspondence with court clerk', duration: 15, rate: 500, isBillable: false, activityType: 'email', date: new Date(now.getTime()), caseId: 'case-8', lawyerId: 'lawyer-1' },
        { id: 'te-12', description: 'Mediation session preparation', duration: 60, rate: 1000, isBillable: true, activityType: 'meeting', date: new Date(now.getTime() - 5*day), caseId: 'case-1', lawyerId: 'lawyer-1' },
        { id: 'te-13', description: 'Internal case strategy discussion', duration: 45, rate: 800, isBillable: false, activityType: 'other', date: new Date(now.getTime() - 1*day), caseId: 'case-2', lawyerId: 'lawyer-1' },
        { id: 'te-14', description: 'Expert witness coordination call', duration: 45, rate: 1000, isBillable: true, activityType: 'phone', date: new Date(now.getTime() - 2*day), caseId: 'case-3', lawyerId: 'lawyer-1' },
        { id: 'te-15', description: 'Review appeal brief draft', duration: 90, rate: 1200, isBillable: true, activityType: 'review', date: new Date(now.getTime()), caseId: 'case-7', lawyerId: 'lawyer-1' },
      ]});
      counts.timeEntries = 15;
    } catch (e: unknown) { errors.push(`TimeEntries: ${e instanceof Error ? e.message.substring(0, 80) : String(e)}`); }

    // 10. Expenses
    try {
      await db.expense.createMany({ data: [
        { id: 'exp-1', description: 'Court filing fees - Commercial Court', amount: 2500, currency: 'SAR', category: 'filing', isBillable: true, date: new Date(now.getTime() - 85*day), caseId: 'case-1' },
        { id: 'exp-2', description: 'Expert witness fee - Dr. Al-Harbi', amount: 15000, currency: 'SAR', category: 'expert', isBillable: true, date: new Date(now.getTime() - 40*day), caseId: 'case-2' },
        { id: 'exp-3', description: 'Travel to Dammam court', amount: 1200, currency: 'SAR', category: 'travel', isBillable: true, date: new Date(now.getTime() - 10*day), caseId: 'case-4' },
        { id: 'exp-4', description: 'Courier service for document delivery', amount: 350, currency: 'SAR', category: 'courier', isBillable: true, date: new Date(now.getTime() - 5*day), caseId: 'case-1' },
        { id: 'exp-5', description: 'Engineering survey fee', amount: 8000, currency: 'SAR', category: 'expert', isBillable: true, date: new Date(now.getTime() - 30*day), caseId: 'case-3' },
        { id: 'exp-6', description: 'Translation services - Arabic/English', amount: 2000, currency: 'SAR', category: 'other', isBillable: true, date: new Date(now.getTime() - 15*day), caseId: 'case-4' },
        { id: 'exp-7', description: 'Document printing and binding', amount: 450, currency: 'SAR', category: 'printing', isBillable: false, date: new Date(now.getTime() - 3*day), caseId: 'case-10' },
        { id: 'exp-8', description: 'Court filing fees - Labor Court', amount: 1000, currency: 'SAR', category: 'filing', isBillable: true, date: new Date(now.getTime() - 1*day), caseId: 'case-5' },
      ]});
      counts.expenses = 8;
    } catch (e: unknown) { errors.push(`Expenses: ${e instanceof Error ? e.message.substring(0, 80) : String(e)}`); }

    // 11. Calendar Events
    try {
      await db.calendarEvent.createMany({ data: [
        { id: 'cal-1', title: 'Hearing - Al-Salem vs. National Bank', description: 'Preliminary hearing on breach of contract', eventType: 'hearing', startDate: new Date(now.getTime() + 14*day), endDate: new Date(now.getTime() + 14*day + 2*3600000), location: 'Riyadh Commercial Court - Hall 3', color: '#ef4444', reminder: '1d', caseId: 'case-1' },
        { id: 'cal-2', title: 'Client Meeting - TechVentures', description: 'Discuss IP case strategy and evidence', eventType: 'meeting', startDate: new Date(now.getTime() + 3*day), endDate: new Date(now.getTime() + 3*day + 3600000), location: 'Office - Conference Room A', color: '#10b981', reminder: '1h', caseId: 'case-2' },
        { id: 'cal-3', title: 'Filing Deadline - Construction Claim', description: 'Submit amended claim to Dammam Court', eventType: 'deadline', startDate: new Date(now.getTime() + 2*day), color: '#f59e0b', reminder: '1d', caseId: 'case-4' },
        { id: 'cal-4', title: 'Mediation Session - Al-Salem', description: 'Court-ordered mediation for settlement', eventType: 'mediation', startDate: new Date(now.getTime() + 21*day), endDate: new Date(now.getTime() + 21*day + 3*3600000), location: 'Riyadh mediation Center', color: '#8b5cf6', reminder: '1d', caseId: 'case-1' },
        { id: 'cal-5', title: 'Trial - TechVentures IP', description: 'First day of trial proceedings', eventType: 'trial', startDate: new Date(now.getTime() + 30*day), endDate: new Date(now.getTime() + 30*day + 8*3600000), location: 'Riyadh Commercial Court - Hall 7', color: '#ef4444', reminder: '1d', caseId: 'case-2' },
        { id: 'cal-6', title: 'Team Strategy Meeting', description: 'Weekly team meeting to review all active cases', eventType: 'meeting', startDate: new Date(now.getTime() + 1*day), endDate: new Date(now.getTime() + 1*day + 2*3600000), location: 'Office - Main Conference Room', color: '#10b981', reminder: '30min', caseId: 'case-10' },
        { id: 'cal-7', title: 'Deposition - Construction Witness', description: 'Take deposition from site engineer', eventType: 'deposition', startDate: new Date(now.getTime() + 10*day), endDate: new Date(now.getTime() + 10*day + 3*3600000), location: 'Office - Conference Room B', color: '#0ea5e9', reminder: '1h', caseId: 'case-4' },
        { id: 'cal-8', title: 'Hearing - Divorce Settlement', description: 'Personal Status Court hearing', eventType: 'hearing', startDate: new Date(now.getTime() + 10*day), endDate: new Date(now.getTime() + 10*day + 2*3600000), location: 'Jeddah Personal Status Court', color: '#ef4444', reminder: '1d', caseId: 'case-8' },
        { id: 'cal-9', title: 'Filing Deadline - Appeal Brief', description: 'Submit appeal brief to Administrative Court', eventType: 'deadline', startDate: new Date(now.getTime() + 14*day), color: '#f59e0b', reminder: '1d', caseId: 'case-7' },
        { id: 'cal-10', title: 'Hearing - Property Dispute', description: 'Expert testimony on property boundaries', eventType: 'hearing', startDate: new Date(now.getTime() + 7*day), endDate: new Date(now.getTime() + 7*day + 2*3600000), location: 'Jeddah General Court', color: '#ef4444', reminder: '1d', caseId: 'case-3' },
        { id: 'cal-11', title: 'Client Consultation - Al-Otaibi', description: 'Initial labor dispute consultation', eventType: 'meeting', startDate: new Date(now.getTime() + 5*day), endDate: new Date(now.getTime() + 5*day + 3600000), location: 'Office - Meeting Room 2', color: '#10b981', reminder: '1h', caseId: 'case-5' },
        { id: 'cal-12', title: 'Deadline - Document Production', description: 'Produce all requested documents to opposing counsel', eventType: 'deadline', startDate: new Date(now.getTime() + 18*day), color: '#f59e0b', reminder: '1d', caseId: 'case-2' },
        { id: 'cal-13', title: 'Merger Closing Meeting', description: 'Final meeting before merger completion', eventType: 'meeting', startDate: new Date(now.getTime() + 25*day), endDate: new Date(now.getTime() + 25*day + 4*3600000), location: 'Ritz Carlton - Riyadh', color: '#10b981', reminder: '1d', caseId: 'case-10' },
        { id: 'cal-14', title: 'Court Filing - Counterclaim', description: 'File counterclaim documents', eventType: 'filing', startDate: new Date(now.getTime() + 20*day), location: 'Riyadh Commercial Court', color: '#0ea5e9', reminder: '30min', caseId: 'case-11' },
        { id: 'cal-15', title: 'Hearing - Gulf Construction', description: 'Motion hearing on evidence admissibility', eventType: 'hearing', startDate: new Date(now.getTime() + 21*day), endDate: new Date(now.getTime() + 21*day + 2*3600000), location: 'Dammam Commercial Court', color: '#ef4444', reminder: '1d', caseId: 'case-4' },
      ]});
      counts.calendarEvents = 15;
    } catch (e: unknown) { errors.push(`CalendarEvents: ${e instanceof Error ? e.message.substring(0, 80) : String(e)}`); }

    // 12. Evidence Items
    try {
      await db.evidenceItem.createMany({ data: [
        { id: 'evi-1', title: 'Loan Agreement Original', description: 'Signed original loan agreement between parties', itemType: 'document', category: 'contract', dateReceived: new Date(now.getTime() - 85*day), isPrivileged: false, source: 'Client', caseId: 'case-1' },
        { id: 'evi-2', title: 'Bank Transaction Records', description: '3 years of bank transaction records', itemType: 'digital', category: 'financial', dateReceived: new Date(now.getTime() - 70*day), isPrivileged: false, source: 'Court Order', caseId: 'case-1' },
        { id: 'evi-3', title: 'IP Registration Certificate', description: 'Original patent registration from Saudi IPO', itemType: 'document', category: 'other', dateReceived: new Date(now.getTime() - 50*day), isPrivileged: false, source: 'Client', caseId: 'case-2' },
        { id: 'evi-4', title: 'Competitor Product Analysis', description: 'Technical analysis showing IP infringement', itemType: 'document', category: 'expert_report', dateReceived: new Date(now.getTime() - 30*day), isPrivileged: true, privilegeType: 'work_product', source: 'Expert - Dr. Al-Harbi', caseId: 'case-2' },
        { id: 'evi-5', title: 'Property Survey Report', description: 'Professional land survey with GPS coordinates', itemType: 'document', category: 'other', dateReceived: new Date(now.getTime() - 25*day), isPrivileged: false, source: 'Expert - Eng. Al-Ahmad', caseId: 'case-3' },
        { id: 'evi-6', title: 'Construction Site Photos', description: '240 photos documenting construction defects', itemType: 'photo', category: 'other', dateReceived: new Date(now.getTime() - 60*day), isPrivileged: false, source: 'Site Inspection', tags: '["defects","foundation","structural"]', caseId: 'case-4' },
        { id: 'evi-7', title: 'Internal Legal Memo - Case Strategy', description: 'Confidential attorney notes on case strategy', itemType: 'document', category: 'communication', dateReceived: new Date(now.getTime() - 10*day), isPrivileged: true, privilegeType: 'attorney_client', isConfidential: true, source: 'Attorney Work Product', caseId: 'case-4' },
        { id: 'evi-8', title: 'Witness Testimony Recording', description: 'Video recording of key witness testimony', itemType: 'video', category: 'other', dateReceived: new Date(now.getTime() - 5*day), isPrivileged: false, source: 'Deposition', caseId: 'case-2' },
      ]});
      counts.evidence = 8;
    } catch (e: unknown) { errors.push(`Evidence: ${e instanceof Error ? e.message.substring(0, 80) : String(e)}`); }

    // 13. Privilege Logs
    try {
      await db.privilegeLog.createMany({ data: [
        { id: 'pl-1', documentTitle: 'Internal Legal Memo - Case Strategy', privilegeType: 'attorney_client', dateCreated: new Date(now.getTime() - 10*day), description: 'Confidential memo discussing litigation strategy and settlement posture', withheldFrom: 'Al-Majd Trading Ltd', caseId: 'case-4' },
        { id: 'pl-2', documentTitle: 'Competitor Product Analysis', privilegeType: 'work_product', dateCreated: new Date(now.getTime() - 30*day), description: 'Expert analysis prepared in anticipation of litigation', withheldFrom: 'InnoSoft Solutions', caseId: 'case-2' },
        { id: 'pl-3', documentTitle: 'Settlement Negotiation Notes', privilegeType: 'settlement', dateCreated: new Date(now.getTime() - 7*day), description: 'Notes from confidential settlement discussions', withheldFrom: 'National Bank', caseId: 'case-1' },
        { id: 'pl-4', documentTitle: 'Fee Agreement Discussion', privilegeType: 'attorney_client', dateCreated: new Date(now.getTime() - 20*day), description: 'Communications regarding fee arrangements', withheldFrom: 'All opposing parties', caseId: 'case-10' },
        { id: 'pl-5', documentTitle: 'Joint Defense Strategy Memo', privilegeType: 'joint_defense', dateCreated: new Date(now.getTime() - 15*day), description: 'Shared strategy memo among co-defendants counsel', withheldFrom: 'Gulf Construction Co', caseId: 'case-4' },
      ]});
      counts.privilegeLogs = 5;
    } catch (e: unknown) { errors.push(`PrivilegeLogs: ${e instanceof Error ? e.message.substring(0, 80) : String(e)}`); }

    // 14. Billing
    try {
      await db.billing.createMany({ data: [
        { id: 'bill-1', description: 'Legal services - Al-Salem case (Month 1)', hours: 12.5, rate: 1200, amount: 15000, currency: 'SAR', status: 'paid', invoiceDate: new Date(now.getTime() - 60*day), dueDate: new Date(now.getTime() - 30*day), paidDate: new Date(now.getTime() - 25*day), caseId: 'case-1' },
        { id: 'bill-2', description: 'Legal services - Al-Salem case (Month 2)', hours: 18, rate: 1200, amount: 21600, currency: 'SAR', status: 'paid', invoiceDate: new Date(now.getTime() - 30*day), dueDate: new Date(now.getTime()), paidDate: new Date(now.getTime() - 2*day), caseId: 'case-1' },
        { id: 'bill-3', description: 'IP Infringement case - Research & Analysis', hours: 25, rate: 1500, amount: 37500, currency: 'SAR', status: 'pending', invoiceDate: new Date(now.getTime() - 10*day), dueDate: new Date(now.getTime() + 20*day), caseId: 'case-2' },
        { id: 'bill-4', description: 'Construction claim - Document review', hours: 30, rate: 1200, amount: 36000, currency: 'SAR', status: 'pending', invoiceDate: new Date(now.getTime() - 5*day), dueDate: new Date(now.getTime() + 25*day), caseId: 'case-4' },
        { id: 'bill-5', description: 'Property dispute - Initial consultation', hours: 4, rate: 1000, amount: 4000, currency: 'SAR', status: 'paid', invoiceDate: new Date(now.getTime() - 40*day), dueDate: new Date(now.getTime() - 10*day), paidDate: new Date(now.getTime() - 12*day), caseId: 'case-3' },
        { id: 'bill-6', description: 'Merger due diligence - Phase 1', hours: 40, rate: 1500, amount: 60000, currency: 'SAR', status: 'draft', invoiceDate: new Date(now.getTime()), dueDate: new Date(now.getTime() + 30*day), caseId: 'case-10' },
        { id: 'bill-7', description: 'Divorce case - Asset documentation', hours: 8, rate: 1000, amount: 8000, currency: 'SAR', status: 'draft', caseId: 'case-8' },
        { id: 'bill-8', description: 'Appeal brief - Ministry of Commerce', hours: 15, rate: 1200, amount: 18000, currency: 'SAR', status: 'draft', caseId: 'case-7' },
        { id: 'bill-9', description: 'Construction claim - Court attendance', hours: 6, rate: 1500, amount: 9000, currency: 'SAR', status: 'overdue', invoiceDate: new Date(now.getTime() - 45*day), dueDate: new Date(now.getTime() - 15*day), caseId: 'case-4' },
        { id: 'bill-10', description: 'Inheritance case - Document review', hours: 10, rate: 1000, amount: 10000, currency: 'SAR', status: 'paid', invoiceDate: new Date(now.getTime() - 20*day), dueDate: new Date(now.getTime() + 10*day), paidDate: new Date(now.getTime() - 5*day), caseId: 'case-6' },
      ]});
      counts.billing = 10;
    } catch (e: unknown) { errors.push(`Billing: ${e instanceof Error ? e.message.substring(0, 80) : String(e)}`); }

    // 15. Timeline Events
    try {
      await db.timelineEvent.createMany({ data: [
        { id: 'tl-1', title: 'Case Filed', description: 'Breach of contract case filed with Riyadh Commercial Court', eventType: 'filing', eventDate: new Date(now.getTime() - 90*day), caseId: 'case-1' },
        { id: 'tl-2', title: 'First Hearing Scheduled', description: 'Court scheduled preliminary hearing', eventType: 'milestone', eventDate: new Date(now.getTime() - 75*day), caseId: 'case-1' },
        { id: 'tl-3', title: 'IP Registration Verified', description: 'Confirmed patent registration validity', eventType: 'milestone', eventDate: new Date(now.getTime() - 50*day), caseId: 'case-2' },
        { id: 'tl-4', title: 'Expert Witness Appointed', description: 'Dr. Majed Al-Harbi appointed as IP expert', eventType: 'milestone', eventDate: new Date(now.getTime() - 40*day), caseId: 'case-2' },
        { id: 'tl-5', title: 'Property Survey Completed', description: 'Engineering survey of disputed property completed', eventType: 'milestone', eventDate: new Date(now.getTime() - 25*day), caseId: 'case-3' },
        { id: 'tl-6', title: 'Amended Claim Filed', description: 'Filed amended construction claim with new evidence', eventType: 'filing', eventDate: new Date(now.getTime() - 60*day), caseId: 'case-4' },
        { id: 'tl-7', title: 'Court Order - Document Production', description: 'Court ordered production of financial documents', eventType: 'court_order', eventDate: new Date(now.getTime() - 30*day), caseId: 'case-4' },
        { id: 'tl-8', title: 'Settlement Discussion Initiated', description: 'Opposing counsel proposed settlement discussions', eventType: 'note', eventDate: new Date(now.getTime() - 7*day), caseId: 'case-1' },
        { id: 'tl-9', title: 'Merger Agreement Signed', description: 'Parties signed letter of intent for merger', eventType: 'milestone', eventDate: new Date(now.getTime() - 5*day), caseId: 'case-10' },
        { id: 'tl-10', title: 'Deposition Scheduled', description: 'Court ordered deposition of site engineer', eventType: 'court_order', eventDate: new Date(now.getTime() - 3*day), caseId: 'case-4' },
        { id: 'tl-11', title: 'Divorce Petition Filed', description: 'Petition filed with Jeddah Personal Status Court', eventType: 'filing', eventDate: new Date(now.getTime() - 20*day), caseId: 'case-8' },
        { id: 'tl-12', title: 'Appeal Filed', description: 'Notice of appeal filed against regulatory penalty', eventType: 'filing', eventDate: new Date(now.getTime() - 15*day), caseId: 'case-7' },
        { id: 'tl-13', title: 'Counterclaim Filed', description: 'Filed counterclaim for bank fees and penalties', eventType: 'filing', eventDate: new Date(now.getTime() - 20*day), caseId: 'case-11' },
        { id: 'tl-14', title: 'Case on Hold', description: 'Case paused pending regulatory decision', eventType: 'note', eventDate: new Date(now.getTime() - 90*day), caseId: 'case-9' },
        { id: 'tl-15', title: 'Labor Complaint Drafted', description: 'Complaint drafted and ready for filing', eventType: 'milestone', eventDate: new Date(now.getTime() - 2*day), caseId: 'case-5' },
      ]});
      counts.timelineEvents = 15;
    } catch (e: unknown) { errors.push(`TimelineEvents: ${e instanceof Error ? e.message.substring(0, 80) : String(e)}`); }

    // 16. Activities
    try {
      await db.activity.createMany({ data: [
        { id: 'act-1', action: 'case_created', description: 'Created new case: Al-Salem vs. National Bank', entity: 'case', entityId: 'case-1', lawyerId: 'lawyer-1', caseId: 'case-1' },
        { id: 'act-2', action: 'document_uploaded', description: 'Uploaded loan agreement to case documents', entity: 'document', entityId: 'doc-1', lawyerId: 'lawyer-1', caseId: 'case-1' },
        { id: 'act-3', action: 'task_completed', description: 'Completed: Research IP case precedents', entity: 'task', entityId: 'task-3', lawyerId: 'lawyer-1', caseId: 'case-2' },
        { id: 'act-4', action: 'time_entry_added', description: 'Added 2h time entry for case review', entity: 'time_entry', entityId: 'te-5', lawyerId: 'lawyer-1', caseId: 'case-4' },
        { id: 'act-5', action: 'billing_created', description: 'Created invoice for Al-Salem case (Month 2)', entity: 'billing', entityId: 'bill-2', lawyerId: 'lawyer-1', caseId: 'case-1' },
        { id: 'act-6', action: 'case_updated', description: 'Updated case status to active', entity: 'case', entityId: 'case-2', lawyerId: 'lawyer-1', caseId: 'case-2' },
        { id: 'act-7', action: 'team_member_added', description: 'Added Sara Al-Fahad as senior associate', entity: 'team', entityId: 'member-1', lawyerId: 'lawyer-1' },
        { id: 'act-8', action: 'evidence_added', description: 'Added construction site photos as evidence', entity: 'evidence', entityId: 'evi-6', lawyerId: 'lawyer-1', caseId: 'case-4' },
        { id: 'act-9', action: 'calendar_event_created', description: 'Scheduled hearing for Al-Salem case', entity: 'calendar', entityId: 'cal-1', lawyerId: 'lawyer-1', caseId: 'case-1' },
        { id: 'act-10', action: 'comment_added', description: 'Added internal comment on case strategy', entity: 'comment', entityId: 'comment-1', lawyerId: 'lawyer-1', caseId: 'case-10' },
      ]});
      counts.activities = 10;
    } catch (e: unknown) { errors.push(`Activities: ${e instanceof Error ? e.message.substring(0, 80) : String(e)}`); }

    return NextResponse.json({
      success: errors.length === 0,
      message: errors.length === 0 ? 'Database seeded successfully!' : `Seed completed with ${errors.length} errors`,
      counts,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
    }, { status: errors.length === 0 ? 200 : 207 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message, counts }, { status: 500 });
  }
}