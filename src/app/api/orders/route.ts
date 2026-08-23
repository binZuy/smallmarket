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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Đơn hàng phải chứa ít nhất 1 sản phẩm' },
        { status: 400 }
      );
    }

    let totalSellingPrice = 0;
    let totalCostPrice = 0;

    const formattedItems = items.map((item: any) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const costPrice = Number(item.costPrice) || 0;
      const sellingPrice = Number(item.sellingPrice) || 0;

      totalSellingPrice += sellingPrice * quantity;
      totalCostPrice += costPrice * quantity;

      return {
        productId: item.productId || null,
        productName: item.name || 'Sản phẩm thủ công',
        costPrice,
        sellingPrice,
        quantity,
      };
    });

    const profit = totalSellingPrice - totalCostPrice;

    // Generate unique order code
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `HD-${dateStr}-${randomSuffix}`;

    const order = await prisma.order.create({
      data: {
        orderCode,
        totalSellingPrice,
        totalCostPrice,
        profit,
        notes: notes || null,
        items: {
          create: formattedItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order', message: error.message },
      { status: 500 }
    );
  }
}
