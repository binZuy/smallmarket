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
    const { name, costPrice, sellingPrice, unit, isAvailable } = body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(costPrice !== undefined && { costPrice: Number(costPrice) }),
        ...(sellingPrice !== undefined && { sellingPrice: Number(sellingPrice) }),
        ...(unit !== undefined && { unit }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });

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
