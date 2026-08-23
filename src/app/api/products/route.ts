import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const preferredRegion = 'sin1';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || '';

    const products = await prisma.product.findMany({
      where: {
        isAvailable: true,
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, costPrice, sellingPrice, unit } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Tên sản phẩm không được để trống' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        costPrice: Number(costPrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        unit: unit || 'cái',
        isAvailable: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product', message: error.message },
      { status: 500 }
    );
  }
}
