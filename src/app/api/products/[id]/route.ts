import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const preferredRegion = 'sin1';
export const runtime = 'nodejs';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, costPrice, sellingPrice, unit, isAvailable, stockQuantity, minStockLevel, category } = body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Sản phẩm không tồn tại' }, { status: 404 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(costPrice !== undefined && { costPrice: Number(costPrice) }),
        ...(sellingPrice !== undefined && { sellingPrice: Number(sellingPrice) }),
        ...(unit !== undefined && { unit }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(stockQuantity !== undefined && { stockQuantity: Number(stockQuantity) }),
        ...(minStockLevel !== undefined && { minStockLevel: Number(minStockLevel) }),
        ...(category !== undefined && { category }),
      },
    });

    // If stock quantity was explicitly adjusted manually, log an ADJUSTMENT
    if (stockQuantity !== undefined && Number(stockQuantity) !== existing.stockQuantity) {
      const diff = Number(stockQuantity) - existing.stockQuantity;
      await prisma.inventoryTransaction.create({
        data: {
          type: 'ADJUSTMENT',
          productId: id,
          productName: updatedProduct.name,
          quantity: Math.abs(diff),
          unitPrice: updatedProduct.costPrice,
          totalAmount: Math.abs(diff) * updatedProduct.costPrice,
          referenceCode: `DC-${Date.now().toString().slice(-4)}`,
          notes: `Điều chỉnh tồn kho từ ${existing.stockQuantity} thành ${stockQuantity} (${diff > 0 ? '+' : ''}${diff})`,
        },
      });
    }

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product', message: error.message },
      { status: 500 }
    );
  }
}
