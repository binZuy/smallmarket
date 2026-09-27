import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, cashIncome, transferIncome, cashExpense, transferExpense } = body;

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Xóa các giao dịch cũ trong ngày này thuộc các danh mục tổng hợp
    await prisma.transaction.deleteMany({
      where: {
        date: {
          gte: targetDate,
          lt: nextDate,
        },
        category: {
          in: ['Tiền mặt', 'Chuyển khoản', 'Chi tiền mặt', 'Chi tài khoản', 'Chi khác']
        }
      }
    });

    type TransactionType = 'INCOME' | 'EXPENSE';
    
    const transactionsToCreate: {
      date: Date;
      type: TransactionType;
      category: string;
      amount: number;
      notes: string;
    }[] = [];

    if (cashIncome !== undefined && cashIncome !== null && cashIncome !== '') {
      transactionsToCreate.push({
        date: targetDate,
        type: 'INCOME',
        category: 'Tiền mặt',
        amount: Number(cashIncome),
        notes: 'Tiền mặt (Thu)',
      });
    }

    if (transferIncome !== undefined && transferIncome !== null && transferIncome !== '') {
      transactionsToCreate.push({
        date: targetDate,
        type: 'INCOME',
        category: 'Chuyển khoản',
        amount: Number(transferIncome),
        notes: 'Chuyển khoản (Thu)',
      });
    }

    if (cashExpense !== undefined && cashExpense !== null && cashExpense !== '') {
      transactionsToCreate.push({
        date: targetDate,
        type: 'EXPENSE',
        category: 'Chi tiền mặt',
        amount: Number(cashExpense),
        notes: 'Chi tiền mặt',
      });
    }

    if (transferExpense !== undefined && transferExpense !== null && transferExpense !== '') {
      transactionsToCreate.push({
        date: targetDate,
        type: 'EXPENSE',
        category: 'Chi tài khoản',
        amount: Number(transferExpense),
        notes: 'Chi tài khoản',
      });
    }

    if (transactionsToCreate.length > 0) {
      await prisma.transaction.createMany({
        data: transactionsToCreate,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating daily finance:', error);
    return NextResponse.json({ error: 'Failed to update daily finance' }, { status: 500 });
  }
}
