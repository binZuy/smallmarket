import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export const preferredRegion = 'sin1';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'this_month';
    const customFrom = searchParams.get('from');
    const customTo = searchParams.get('to');

    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    switch (period) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case 'yesterday':
        const yest = subDays(now, 1);
        startDate = startOfDay(yest);
        endDate = endOfDay(yest);
        break;
      case '7days':
        startDate = startOfDay(subDays(now, 6));
        break;
      case '30days':
        startDate = startOfDay(subDays(now, 29));
        break;
      case 'last_month':
        const prevMonth = subMonths(now, 1);
        startDate = startOfMonth(prevMonth);
        endDate = endOfMonth(prevMonth);
        break;
      case 'custom':
        startDate = customFrom ? startOfDay(new Date(customFrom)) : startOfMonth(now);
        endDate = customTo ? endOfDay(new Date(customTo)) : endOfDay(now);
        break;
      case 'all':
        startDate = new Date(2020, 0, 1);
        break;
      case 'this_month':
      default:
        startDate = startOfMonth(now);
        break;
    }

    // 1. Fetch Orders within date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // 2. Fetch Operating Expenses from Sổ Quỹ (transactions) within same date range
    const expenseTx = await prisma.transaction.findMany({
      where: {
        type: 'EXPENSE',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    let totalOrders = orders.length;
    let totalRevenue = 0;
    let totalCost = 0;
    let totalGrossProfit = 0;

    const dailyMap: Record<
      string,
      {
        date: string;
        ordersCount: number;
        revenue: number;
        cost: number;
        grossProfit: number;
        expenses: number;
        netProfit: number;
      }
    > = {};

    const productMap: Record<
      string,
      {
        productId: string | null;
        productName: string;
        totalQuantitySold: number;
        totalRevenue: number;
        totalCost: number;
        totalProfit: number;
        lastSoldAt: Date | null;
      }
    > = {};

    for (const order of orders) {
      totalRevenue += order.totalSellingPrice;
      totalCost += order.totalCostPrice;
      totalGrossProfit += order.profit;

      const dayKey = format(order.createdAt, 'yyyy-MM-dd');
      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = {
          date: dayKey,
          ordersCount: 0,
          revenue: 0,
          cost: 0,
          grossProfit: 0,
          expenses: 0,
          netProfit: 0,
        };
      }
      dailyMap[dayKey].ordersCount += 1;
      dailyMap[dayKey].revenue += order.totalSellingPrice;
      dailyMap[dayKey].cost += order.totalCostPrice;
      dailyMap[dayKey].grossProfit += order.profit;

      for (const item of order.items) {
        const key = item.productId || item.productName;
        if (!productMap[key]) {
          productMap[key] = {
            productId: item.productId,
            productName: item.productName,
            totalQuantitySold: 0,
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
            lastSoldAt: order.createdAt,
          };
        }

        const itemRevenue = item.sellingPrice * item.quantity;
        const itemCost = item.costPrice * item.quantity;

        productMap[key].totalQuantitySold += item.quantity;
        productMap[key].totalRevenue += itemRevenue;
        productMap[key].totalCost += itemCost;
        productMap[key].totalProfit += itemRevenue - itemCost;
        if (!productMap[key].lastSoldAt || order.createdAt > productMap[key].lastSoldAt!) {
          productMap[key].lastSoldAt = order.createdAt;
        }
      }
    }

    // Process operating expenses
    let totalExpenses = 0;
    for (const tx of expenseTx) {
      totalExpenses += tx.amount;
      const dayKey = format(tx.date, 'yyyy-MM-dd');
      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = {
          date: dayKey,
          ordersCount: 0,
          revenue: 0,
          cost: 0,
          grossProfit: 0,
          expenses: 0,
          netProfit: 0,
        };
      }
      dailyMap[dayKey].expenses += tx.amount;
    }

    // Calculate net profits per day
    const dailyBreakdown = Object.values(dailyMap)
      .map((d) => ({
        ...d,
        netProfit: d.grossProfit - d.expenses,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    const totalNetProfit = totalGrossProfit - totalExpenses;
    const grossMarginPercent = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
    const netMarginPercent = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0;

    const productStats = Object.values(productMap).sort(
      (a, b) => b.totalProfit - a.totalProfit
    );

    return NextResponse.json({
      filter: {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalOrders,
        totalRevenue,
        totalCost,
        totalGrossProfit,
        grossMarginPercent: Number(grossMarginPercent.toFixed(1)),
        totalExpenses,
        totalNetProfit,
        netMarginPercent: Number(netMarginPercent.toFixed(1)),
      },
      dailyBreakdown,
      productStats,
    });
  } catch (error: any) {
    console.error('Error calculating stats:', error);
    return NextResponse.json(
      { error: 'Failed to calculate stats', message: error.message },
      { status: 500 }
    );
  }
}
