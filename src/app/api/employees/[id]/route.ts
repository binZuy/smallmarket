import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, phone, hourlyRate, active } = body;

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
        ...(hourlyRate !== undefined && { hourlyRate: Number(hourlyRate) }),
        ...(active !== undefined && { active: Boolean(active) }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}
