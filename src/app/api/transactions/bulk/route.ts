import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactions } = body;

    if (!Array.isArray(transactions)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const created = await prisma.transaction.createMany({
      data: transactions.map((t: Record<string, any>) => ({
        date: new Date(t.date),
        type: t.type,
        category: t.category,
        amount: Number(t.amount),
        quantity: t.quantity ? Number(t.quantity) : null,
        notes: t.notes,
      })),
    });

    return NextResponse.json({ success: true, count: created.count });
  } catch (error) {
    console.error('Error in bulk import:', error);
    return NextResponse.json({ error: 'Failed to bulk import transactions' }, { status: 500 });
  }
}
