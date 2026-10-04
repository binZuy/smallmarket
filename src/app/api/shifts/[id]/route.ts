import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { shiftType, startTime, endTime, actualHours, status, notes, employeeId, date } = body;

    const updated = await prisma.shiftAssignment.update({
      where: { id },
      data: {
        ...(employeeId !== undefined && { employeeId }),
        ...(date !== undefined && { date }),
        ...(shiftType !== undefined && { shiftType }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(actualHours !== undefined && { actualHours: Number(actualHours) }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes: notes ? notes.trim() : null }),
      },
      include: {
        employee: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating shift:', error);
    return NextResponse.json({ error: 'Failed to update shift' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.shiftAssignment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shift:', error);
    return NextResponse.json({ error: 'Failed to delete shift' }, { status: 500 });
  }
}
