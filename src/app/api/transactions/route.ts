import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');
  
  let dateFilter = {};
  if (dateStr) {
    const startDate = new Date(dateStr);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    
    dateFilter = {
      date: {
        gte: startDate,
        lt: endDate,
      }
    };
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: dateFilter,
      orderBy: {
        createdAt: 'desc' // Lấy mới nhất lên đầu
      }
    });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(body.date),
        type: body.type,
        category: body.category,
        amount: Number(body.amount),
        quantity: body.quantity ? Number(body.quantity) : null,
        notes: body.notes,
      }
    });
    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
