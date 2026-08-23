import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const preferredRegion = 'sin1';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
    });

    let totalOrders = orders.length;
    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    const productMap: Record<
      string,
      {
        productName: string;
        productId: string | null;
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
      totalProfit += order.profit;

      for (const item of order.items) {
        const key = item.productId || item.productName;
        if (!productMap[key]) {
          productMap[key] = {
            productName: item.productName,
            productId: item.productId,
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

    const productStats = Object.values(productMap).sort(
      (a, b) => b.totalQuantitySold - a.totalQuantitySold
    );

    return NextResponse.json({
      summary: {
        totalOrders,
        totalRevenue,
        totalCost,
        totalProfit,
      },
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
