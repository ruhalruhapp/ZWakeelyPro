import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [
      casesByStatus,
      upcomingTasks,
      recentActivity,
      billingSummary,
      caseTypeDistribution,
      totalCasesCount,
      overdueBillings,
      nextHearings,
    ] = await Promise.all([
      // Cases grouped by status
      db.case.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // Upcoming tasks (not completed, has due date, ordered by due date)
      db.task.findMany({
        where: {
          status: { notIn: ['completed', 'cancelled'] },
          dueDate: { not: null },
        },
        include: {
          case: { select: { id: true, caseNumber: true, title: true } },
          lawyer: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),

      // Recent activity (last 20)
      db.activity.findMany({
        include: {
          lawyer: { select: { id: true, name: true, avatarUrl: true } },
          case: { select: { id: true, caseNumber: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),

      // Billing summary by status
      db.billing.groupBy({
        by: ['status'],
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Case type distribution
      db.case.groupBy({
        by: ['caseType'],
        _count: { id: true },
      }),

      // Total cases count
      db.case.count(),

      // Overdue billings count
      db.billing.count({
        where: {
          status: { in: ['sent', 'overdue'] },
          dueDate: { lt: new Date() },
        },
      }),

      // Next 5 upcoming hearings
      db.case.findMany({
        where: {
          nextHearing: { gt: new Date() },
          status: { notIn: ['closed', 'archived'] },
        },
        include: {
          lawyer: { select: { id: true, name: true, avatarUrl: true } },
          client: { select: { id: true, fullName: true } },
        },
        orderBy: { nextHearing: 'asc' },
        take: 5,
      }),
    ])

    // Calculate total billed and total paid from the raw billing data
    const totalBilled = billingSummary.reduce(
      (sum, b) => sum + (b._sum.amount || 0),
      0
    )
    const totalPaid =
      billingSummary.find((b) => b.status === 'paid')?._sum.amount || 0

    return NextResponse.json({
      casesByStatus: casesByStatus.map((c) => ({
        status: c.status,
        count: c._count.id,
      })),
      totalCases: totalCasesCount,
      upcomingTasks,
      recentActivity,
      billingSummary: {
        byStatus: billingSummary.map((b) => ({
          status: b.status,
          total: b._sum.amount || 0,
          count: b._count.id,
        })),
        totalBilled,
        totalPaid,
        outstanding: totalBilled - totalPaid,
        overdueCount: overdueBillings,
      },
      caseTypeDistribution: caseTypeDistribution.map((c) => ({
        caseType: c.caseType,
        count: c._count.id,
      })),
      nextHearings,
    })
  } catch (error) {
    console.error('GET /api/dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}