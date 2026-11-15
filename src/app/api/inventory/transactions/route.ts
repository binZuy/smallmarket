import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const preferredRegion = 'sin1';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const q = searchParams.get('q') || '';
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = Math.min(200, Number(searchParams.get('limit')) || 100);

    const where: any = {};

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (q) {
      where.OR = [
        { productName: { contains: q, mode: 'insensitive' } },
        { referenceCode: { contains: q, mode: 'insensitive' } },
        { supplier: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    const transactions = await prisma.inventoryTransaction.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        product: {
          select: {
            unit: true,
            stockQuantity: true,
          },
        },
      },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('Error fetching inventory transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory transactions', message: error.message },
      { status: 500 }
    );
  }
}

