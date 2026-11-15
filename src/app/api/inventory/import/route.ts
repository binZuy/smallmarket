import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const preferredRegion = 'sin1';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, supplier, notes, recordExpense, expensePaymentMethod } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Phiếu nhập phải có ít nhất 1 sản phẩm' },
        { status: 400 }
      );
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `PN-${dateStr}-${randomSuffix}`;

    let totalImportAmount = 0;

    const result = await prisma.$transaction(async (tx) => {
      const createdTxItems = [];

      for (const item of items) {
        const qty = Math.max(1, Number(item.quantity) || 1);
        const costPrice = Math.max(0, Number(item.costPrice) || 0);
        const total = qty * costPrice;
        totalImportAmount += total;

        let productId = item.productId;
        let productName = item.name;

        if (productId) {
          // Update existing product: increment stockQuantity and update costPrice if supplied
          const updated = await tx.product.update({
            where: { id: productId },
            data: {
              stockQuantity: {
                increment: qty,
              },
              costPrice: costPrice > 0 ? costPrice : undefined,
              ...(item.sellingPrice && { sellingPrice: Number(item.sellingPrice) }),
            },
          });
          productName = updated.name;
        } else if (productName && productName.trim() !== '') {
          // Check if product with this name exists
          let product = await tx.product.findFirst({
            where: { name: productName.trim() },
          });

          if (product) {
            productId = product.id;
            await tx.product.update({
              where: { id: product.id },
              data: {
                stockQuantity: { increment: qty },
                costPrice: costPrice > 0 ? costPrice : product.costPrice,
                ...(item.sellingPrice && { sellingPrice: Number(item.sellingPrice) }),
              },
            });
          } else {
            // Create brand new product
            const newProduct = await tx.product.create({
              data: {
                name: productName.trim(),
                costPrice: costPrice,
                sellingPrice: Number(item.sellingPrice) || costPrice * 1.3,
                stockQuantity: qty,
                unit: item.unit || 'cái',
                minStockLevel: 5,
                category: item.category || 'Hàng hoá',
                isAvailable: true,
              },
            });
            productId = newProduct.id;
          }
        }

        const invTx = await tx.inventoryTransaction.create({
          data: {
            type: 'IMPORT',
            productId: productId || null,
            productName: productName || 'Hàng hoá nhập kho',
            quantity: qty,
            unitPrice: costPrice,
            totalAmount: total,
            supplier: supplier || null,
            referenceCode,
            notes: notes || 'Nhập hàng vào kho',
          },
        });
        createdTxItems.push(invTx);
      }

      // If user wants to automatically record this in Sổ Quỹ
      if (recordExpense && totalImportAmount > 0) {
        const paymentCat = expensePaymentMethod === 'Chuyển khoản' ? 'Chi tài khoản' : 'Chi tiền mặt';
        await tx.transaction.create({
          data: {
            date: new Date(),
            type: 'EXPENSE',
            category: paymentCat,
            amount: totalImportAmount,
            notes: `Nhập hàng [${referenceCode}]${supplier ? ' - NCC: ' + supplier : ''}`,
          },
        });
      }

      return { referenceCode, totalImportAmount, items: createdTxItems };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error importing inventory:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo phiếu nhập hàng', message: error.message },
      { status: 500 }
    );
  }
}

