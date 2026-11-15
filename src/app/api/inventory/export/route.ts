import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const preferredRegion = 'sin1';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, type = 'EXPORT', notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Phiếu xuất phải có ít nhất 1 sản phẩm' },
        { status: 400 }
      );
    }

    const validTypes = ['EXPORT', 'DAMAGE', 'ADJUSTMENT'];
    const movementType = validTypes.includes(type) ? type : 'EXPORT';

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = movementType === 'DAMAGE' ? 'PX-HH' : movementType === 'ADJUSTMENT' ? 'PKK' : 'PX';
    const referenceCode = `${prefix}-${dateStr}-${randomSuffix}`;

    const result = await prisma.$transaction(async (tx) => {
      const createdTxItems = [];

      for (const item of items) {
        const productId = item.productId;
        const qty = Math.max(1, Number(item.quantity) || 1);

        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) continue;

        // Decrement stock
        await tx.product.update({
          where: { id: productId },
          data: {
            stockQuantity: {
              decrement: qty,
            },
          },
        });

        const invTx = await tx.inventoryTransaction.create({
          data: {
            type: movementType as any,
            productId,
            productName: product.name,
            quantity: qty,
            unitPrice: product.costPrice,
            totalAmount: qty * product.costPrice,
            referenceCode,
            notes: item.notes || notes || (movementType === 'DAMAGE' ? 'Xuất hủy / hỏng / hết hạn' : 'Xuất kho'),
          },
        });

        createdTxItems.push(invTx);
      }

      return { referenceCode, items: createdTxItems };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error exporting inventory:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo phiếu xuất hàng', message: error.message },
      { status: 500 }
    );
  }
}

