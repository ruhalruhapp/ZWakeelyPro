import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS "FeatureFlag" (
    "id" TEXT NOT NULL, "key" TEXT NOT NULL, "label" TEXT NOT NULL,
    "description" TEXT, "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FeatureFlag_key_key" ON "FeatureFlag"("key");

CREATE TABLE IF NOT EXISTS "Lawyer" (
    "id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL,
    "avatarUrl" TEXT, "role" TEXT NOT NULL DEFAULT 'lawyer',
    "firm" TEXT, "licenseNo" TEXT, "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Lawyer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Lawyer_email_key" ON "Lawyer"("email");

CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'associate', "phone" TEXT,
    "avatarUrl" TEXT, "barNumber" TEXT, "specialization" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_email_key" ON "TeamMember"("email");

CREATE TABLE IF NOT EXISTS "Client" (
    "id" TEXT NOT NULL, "fullName" TEXT NOT NULL, "email" TEXT,
    "phone" TEXT, "nationalId" TEXT, "address" TEXT, "company" TEXT,
    "type" TEXT NOT NULL DEFAULT 'individual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Case" (
    "id" TEXT NOT NULL, "caseNumber" TEXT NOT NULL, "title" TEXT NOT NULL,
    "description" TEXT, "caseType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'intake',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "court" TEXT, "jurisdiction" TEXT, "judge" TEXT,
    "opposingCounsel" TEXT, "opposingCounselFirm" TEXT,
    "filedDate" TIMESTAMP(3), "nextHearing" TIMESTAMP(3),
    "statuteLimitDate" TIMESTAMP(3), "closedDate" TIMESTAMP(3),
    "value" DOUBLE PRECISION, "currency" TEXT NOT NULL DEFAULT 'SAR',
    "notes" TEXT, "isPro" BOOLEAN NOT NULL DEFAULT true,
    "isVisibleToClient" BOOLEAN NOT NULL DEFAULT false,
    "clientAccessConfig" TEXT, "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lawyerId" TEXT NOT NULL, "clientId" TEXT,
    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Case_caseNumber_key" ON "Case"("caseNumber");

CREATE TABLE IF NOT EXISTS "CaseParty" (
    "id" TEXT NOT NULL, "name" TEXT NOT NULL, "role" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'individual', "email" TEXT,
    "phone" TEXT, "lawyer" TEXT, "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL, "caseId" TEXT NOT NULL,
    CONSTRAINT "CaseParty_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Task" (
    "id" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMP(3), "completedAt" TIMESTAMP(3),
    "category" TEXT NOT NULL DEFAULT 'general',
    "estimatedHours" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "caseId" TEXT NOT NULL, "lawyerId" TEXT NOT NULL,
    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TaskAssignment" (
    "id" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" TEXT NOT NULL, "memberId" TEXT NOT NULL,
    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "TaskAssignment_taskId_memberId_key" ON "TaskAssignment"("taskId", "memberId");

CREATE TABLE IF NOT EXISTS "Comment" (
    "id" TEXT NOT NULL, "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL, "caseId" TEXT NOT NULL,
    "lawyerId" TEXT, "memberId" TEXT, "parentId" TEXT,
    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CaseDocument" (
    "id" TEXT NOT NULL, "fileName" TEXT NOT NULL, "fileType" TEXT NOT NULL,
    "fileSize" INTEGER, "filePath" TEXT, "folder" TEXT NOT NULL DEFAULT '/',
    "version" INTEGER NOT NULL DEFAULT 1, "versionOf" TEXT,
    "tags" TEXT, "category" TEXT NOT NULL DEFAULT 'general',
    "description" TEXT, "isConfidential" BOOLEAN NOT NULL DEFAULT false,
    "isVisibleToClient" BOOLEAN NOT NULL DEFAULT true,
    "uploadedBy" TEXT, "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "caseId" TEXT NOT NULL,
    CONSTRAINT "CaseDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TimeEntry" (
    "id" TEXT NOT NULL, "description" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL, "rate" DOUBLE PRECISION,
    "isBillable" BOOLEAN NOT NULL DEFAULT true,
    "activityType" TEXT NOT NULL DEFAULT 'research',
    "date" TIMESTAMP(3) NOT NULL, "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "caseId" TEXT NOT NULL, "lawyerId" TEXT NOT NULL,
    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Expense" (
    "id" TEXT NOT NULL, "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "category" TEXT NOT NULL DEFAULT 'travel',
    "isBillable" BOOLEAN NOT NULL DEFAULT true,
    "date" TIMESTAMP(3) NOT NULL, "receiptPath" TEXT, "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL, "caseId" TEXT NOT NULL,
    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CalendarEvent" (
    "id" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT,
    "eventType" TEXT NOT NULL DEFAULT 'hearing',
    "startDate" TIMESTAMP(3) NOT NULL, "endDate" TIMESTAMP(3),
    "allDay" BOOLEAN NOT NULL DEFAULT false, "location" TEXT,
    "color" TEXT, "reminder" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL, "caseId" TEXT,
    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "EvidenceItem" (
    "id" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT,
    "itemType" TEXT NOT NULL DEFAULT 'document', "category" TEXT,
    "dateReceived" TIMESTAMP(3), "isPrivileged" BOOLEAN NOT NULL DEFAULT false,
    "privilegeType" TEXT, "isConfidential" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT, "linkedDocId" TEXT, "source" TEXT, "chainOfCustody" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL, "caseId" TEXT NOT NULL,
    CONSTRAINT "EvidenceItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PrivilegeLog" (
    "id" TEXT NOT NULL, "documentTitle" TEXT NOT NULL,
    "privilegeType" TEXT NOT NULL, "dateCreated" TIMESTAMP(3),
    "description" TEXT, "withheldFrom" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL, "caseId" TEXT NOT NULL,
    CONSTRAINT "PrivilegeLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Billing" (
    "id" TEXT NOT NULL, "description" TEXT NOT NULL,
    "hours" DOUBLE PRECISION, "rate" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "invoiceDate" TIMESTAMP(3), "dueDate" TIMESTAMP(3),
    "paidDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL, "caseId" TEXT NOT NULL,
    CONSTRAINT "Billing_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TimelineEvent" (
    "id" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT,
    "eventType" TEXT NOT NULL DEFAULT 'note',
    "eventDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "caseId" TEXT NOT NULL,
    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Activity" (
    "id" TEXT NOT NULL, "action" TEXT NOT NULL, "description" TEXT,
    "entity" TEXT NOT NULL, "entityId" TEXT,
    "ipAddress" TEXT, "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lawyerId" TEXT NOT NULL, "caseId" TEXT,
    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
    ALTER TABLE "Case" ADD CONSTRAINT "Case_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "Lawyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "Case" ADD CONSTRAINT "Case_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "Case" ADD CONSTRAINT "Case_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "CaseParty" ADD CONSTRAINT "CaseParty_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "Task" ADD CONSTRAINT "Task_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "Task" ADD CONSTRAINT "Task_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "Lawyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "TeamMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "Comment" ADD CONSTRAINT "Comment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "Comment" ADD CONSTRAINT "Comment_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "Lawyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "Comment" ADD CONSTRAINT "Comment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "CaseDocument" ADD CONSTRAINT "CaseDocument_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "Lawyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "Expense" ADD CONSTRAINT "Expense_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "EvidenceItem" ADD CONSTRAINT "EvidenceItem_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "PrivilegeLog" ADD CONSTRAINT "PrivilegeLog_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "Billing" ADD CONSTRAINT "Billing_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "Activity" ADD CONSTRAINT "Activity_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "Lawyer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    ALTER TABLE "Activity" ADD CONSTRAINT "Activity_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
`;

export async function POST() {
  try {
    // Execute the schema SQL
    const statements = SCHEMA_SQL.split(';').filter(s => s.trim().length > 0);
    const errors: string[] = [];
    let successCount = 0;
    
    for (const stmt of statements) {
      try {
        await db.$executeRawUnsafe(stmt.trim());
        successCount++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        // Skip "already exists" errors
        if (!msg.includes('already exists') && !msg.includes('duplicate')) {
          errors.push(msg.substring(0, 100));
        }
      }
    }
    
    // Verify by listing tables
    const tables = await db.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`;
    
    return NextResponse.json({
      success: errors.length === 0,
      successCount,
      errorCount: errors.length,
      errors: errors.slice(0, 10),
      tables: tables,
      message: errors.length === 0 
        ? 'All 17 tables created successfully!' 
        : `Created ${successCount} statements, ${errors.length} errors`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}