import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // ─── Case Metrics ─────────────────────────────────────────
    const [totalCases, activeCases, closedCases] = await Promise.all([
      db.case.count(),
      db.case.count({ where: { status: { in: ['active', 'discovery', 'trial', 'intake'] } } }),
      db.case.count({ where: { status: 'closed' } }),
    ])

    // Average days to close
    const closedCasesData = await db.case.findMany({
      where: { status: 'closed', closedDate: { not: null }, filedDate: { not: null } },
      select: { filedDate: true, closedDate: true },
    })

    const avgDaysToClose =
      closedCasesData.length > 0
        ? Math.round(
            closedCasesData.reduce((sum, c) => {
              const days =
                (c.closedDate!.getTime() - c.filedDate!.getTime()) / (1000 * 60 * 60 * 24)
              return sum + days
            }, 0) / closedCasesData.length
          )
        : 0

    // Cases by type
    const casesByTypeRaw = await db.case.groupBy({
      by: ['caseType'],
      _count: { caseType: true },
    })

    const casesByType = casesByTypeRaw.map((item) => ({
      type: item.caseType,
      count: item._count.caseType,
    }))

    // Cases by status
    const casesByStatusRaw = await db.case.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    const casesByStatus = casesByStatusRaw.map((item) => ({
      status: item.status,
      count: item._count.status,
    }))

    // Cases by priority
    const casesByPriorityRaw = await db.case.groupBy({
      by: ['priority'],
      _count: { priority: true },
    })

    const casesByPriority = casesByPriorityRaw.map((item) => ({
      priority: item.priority,
      count: item._count.priority,
    }))

    // ─── Financial Metrics ────────────────────────────────────
    const billingData = await db.billing.findMany({
      select: { amount: true, status: true, invoiceDate: true, paidDate: true, caseId: true, currency: true },
    })

    const totalBilled = billingData.reduce((sum, b) => sum + b.amount, 0)
    const totalCollected = billingData
      .filter((b) => b.status === 'paid')
      .reduce((sum, b) => sum + b.amount, 0)
    const outstanding = totalBilled - totalCollected

    // Revenue by month (last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const recentPaid = billingData.filter(
      (b) => b.paidDate && b.paidDate >= twelveMonthsAgo && b.status === 'paid'
    )

    const revenueByMonthMap = new Map<string, number>()
    for (const b of recentPaid) {
      const key = `${b.paidDate!.getFullYear()}-${String(b.paidDate!.getMonth() + 1).padStart(2, '0')}`
      revenueByMonthMap.set(key, (revenueByMonthMap.get(key) || 0) + b.amount)
    }
    const revenueByMonth = Array.from(revenueByMonthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue }))

    // Top billed cases
    const billingByCase = new Map<string, number>()
    for (const b of billingData) {
      billingByCase.set(b.caseId, (billingByCase.get(b.caseId) || 0) + b.amount)
    }

    const topCaseIds = Array.from(billingByCase.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => id)

    const topCases = topCaseIds.length > 0
      ? await db.case.findMany({
          where: { id: { in: topCaseIds } },
          select: { id: true, caseNumber: true, title: true },
        })
      : []

    const topBilledCases = topCases.map((c) => ({
      ...c,
      totalBilled: billingByCase.get(c.id) || 0,
    }))

    // Total expenses
    const expensesTotal = await db.expense.aggregate({
      _sum: { amount: true },
    })

    const totalExpenses = expensesTotal._sum.amount || 0

    // ─── Time Metrics ─────────────────────────────────────────
    const allTimeEntries = await db.timeEntry.findMany({
      select: {
        duration: true,
        isBillable: true,
        activityType: true,
        lawyerId: true,
      },
    })

    const totalMinutes = allTimeEntries.reduce((sum, e) => sum + e.duration, 0)
    const totalHoursLogged = Math.round((totalMinutes / 60) * 100) / 100

    const billableMinutes = allTimeEntries
      .filter((e) => e.isBillable)
      .reduce((sum, e) => sum + e.duration, 0)
    const billableHours = Math.round((billableMinutes / 60) * 100) / 100

    const nonBillableMinutes = allTimeEntries
      .filter((e) => !e.isBillable)
      .reduce((sum, e) => sum + e.duration, 0)
    const nonBillableHours = Math.round((nonBillableMinutes / 60) * 100) / 100

    const utilizationRate =
      totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 10000) / 100 : 0

    // Hours by activity type
    const hoursByActivityMap = new Map<string, number>()
    for (const e of allTimeEntries) {
      hoursByActivityMap.set(e.activityType, (hoursByActivityMap.get(e.activityType) || 0) + e.duration)
    }
    const hoursByActivityType = Array.from(hoursByActivityMap.entries()).map(
      ([activityType, minutes]) => ({
        activityType,
        hours: Math.round((minutes / 60) * 100) / 100,
      })
    )

    // Hours by lawyer
    const hoursByLawyerMap = new Map<string, number>()
    for (const e of allTimeEntries) {
      hoursByLawyerMap.set(e.lawyerId, (hoursByLawyerMap.get(e.lawyerId) || 0) + e.duration)
    }

    const lawyerIds = Array.from(hoursByLawyerMap.keys())
    const lawyers = lawyerIds.length > 0
      ? await db.lawyer.findMany({
          where: { id: { in: lawyerIds } },
          select: { id: true, name: true },
        })
      : []

    const hoursByLawyer = lawyers.map((l) => ({
      lawyerId: l.id,
      lawyerName: l.name,
      hours: Math.round(((hoursByLawyerMap.get(l.id) || 0) / 60) * 100) / 100,
    }))

    // ─── Team Metrics ─────────────────────────────────────────
    const totalMembers = await db.teamMember.count({ where: { isActive: true } })

    const activeCasesPerMember = await db.teamMember.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        role: true,
        assignedTasks: {
          where: { task: { status: { in: ['pending', 'in_progress'] } } },
          select: { taskId: true },
          distinct: ['taskId'],
        },
      },
    })

    const activeCasesPerMemberData = activeCasesPerMember.map((m) => {
      const caseIds = new Set<string>()
      // Get unique case IDs from tasks
      return {
        memberId: m.id,
        memberName: m.name,
        role: m.role,
        activeTaskCount: m.assignedTasks.length,
      }
    })

    // Tasks completed by member (through task assignments)
    const completedAssignments = await db.taskAssignment.groupBy({
      by: ['memberId'],
      where: { task: { status: 'completed' } },
      _count: { memberId: true },
    })

    const completedMemberIds = completedAssignments.map((a) => a.memberId)
    const completedMembers = completedMemberIds.length > 0
      ? await db.teamMember.findMany({
          where: { id: { in: completedMemberIds } },
          select: { id: true, name: true },
        })
      : []

    const tasksCompletedByMember = completedMembers.map((m) => {
      const assignment = completedAssignments.find((a) => a.memberId === m.id)
      return {
        memberId: m.id,
        memberName: m.name,
        completedTasks: assignment?._count.memberId || 0,
      }
    })

    // ─── Deadline Metrics ─────────────────────────────────────
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    // Upcoming deadlines (next 30 days)
    const upcomingTasks = await db.task.findMany({
      where: {
        status: { notIn: ['completed', 'cancelled'] },
        dueDate: { gte: today, lte: thirtyDaysFromNow },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        priority: true,
        case: { select: { id: true, caseNumber: true, title: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 20,
    })

    const upcomingDeadlines = upcomingTasks.map((t) => ({
      id: t.id,
      title: t.title,
      dueDate: t.dueDate,
      priority: t.priority,
      type: 'task' as const,
      case: t.case,
    }))

    // Overdue deadlines
    const overdueTasks = await db.task.findMany({
      where: {
        status: { notIn: ['completed', 'cancelled'] },
        dueDate: { lt: today },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        priority: true,
        case: { select: { id: true, caseNumber: true, title: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: 20,
    })

    const overdueDeadlines = overdueTasks.map((t) => ({
      id: t.id,
      title: t.title,
      dueDate: t.dueDate,
      priority: t.priority,
      type: 'task' as const,
      case: t.case,
    }))

    // Statute of limitations warnings (within 60 days)
    const sixtyDaysFromNow = new Date()
    sixtyDaysFromNow.setDate(today.getDate() + 60)

    const statuteWarnings = await db.case.findMany({
      where: {
        status: { not: 'closed' },
        statuteLimitDate: { gte: today, lte: sixtyDaysFromNow },
      },
      select: {
        id: true,
        caseNumber: true,
        title: true,
        statuteLimitDate: true,
        status: true,
      },
      orderBy: { statuteLimitDate: 'asc' },
    })

    // ─── Compile Response ─────────────────────────────────────
    return NextResponse.json({
      caseMetrics: {
        totalCases,
        activeCases,
        avgDaysToClose,
        casesByType,
        casesByStatus,
        casesByPriority,
      },
      financialMetrics: {
        totalBilled: Math.round(totalBilled * 100) / 100,
        totalCollected: Math.round(totalCollected * 100) / 100,
        outstanding: Math.round(outstanding * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        revenueByMonth,
        topBilledCases,
      },
      timeMetrics: {
        totalHoursLogged,
        billableHours,
        nonBillableHours,
        utilizationRate,
        hoursByActivityType,
        hoursByLawyer,
      },
      teamMetrics: {
        totalMembers,
        activeCasesPerMember: activeCasesPerMemberData,
        tasksCompletedByMember,
      },
      deadlineMetrics: {
        upcomingDeadlines,
        overdueDeadlines,
        statuteWarnings,
      },
    })
  } catch (error) {
    console.error('GET /api/analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
