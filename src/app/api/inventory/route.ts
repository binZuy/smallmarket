import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const preferredRegion = 'sin1';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || ''; // 'low', 'out', 'in'

    const products = await prisma.product.findMany({
      where: {
        isAvailable: true,
        ...(search && {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }),
        ...(category && { category }),
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    let totalProducts = products.length;
    let totalStockUnits = 0;
    let totalCostValue = 0;
    let totalSellingValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const formattedProducts = products.map((p) => {
      const stock = p.stockQuantity;
      const minLevel = p.minStockLevel || 5;

      let stockStatus: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK' = 'IN_STOCK';
      if (stock <= 0) {
        stockStatus = 'OUT_OF_STOCK';
        outOfStockCount++;
      } else if (stock <= minLevel) {
        stockStatus = 'LOW_STOCK';
        lowStockCount++;
      }

      totalStockUnits += Math.max(0, stock);
      totalCostValue += Math.max(0, stock) * p.costPrice;
      totalSellingValue += Math.max(0, stock) * p.sellingPrice;

      return {
        ...p,
        stockStatus,
        costValue: Math.max(0, stock) * p.costPrice,
        sellingValue: Math.max(0, stock) * p.sellingPrice,
      };
    });

    const filtered = formattedProducts.filter((p) => {
      if (status === 'out') return p.stockStatus === 'OUT_OF_STOCK';
      if (status === 'low') return p.stockStatus === 'LOW_STOCK';
      if (status === 'in') return p.stockStatus === 'IN_STOCK';
      return true;
    });

    return NextResponse.json({
      summary: {
        totalProducts,
        totalStockUnits,
        totalCostValue,
        totalSellingValue,
        potentialProfit: totalSellingValue - totalCostValue,
        lowStockCount,
        outOfStockCount,
      },
      products: filtered,
    });
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory', message: error.message },
      { status: 500 }
    );
  }
}

