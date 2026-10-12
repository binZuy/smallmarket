import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, phone, hourlyRate, active, updateFutureShifts = true, effectiveDate } = body;

    const newHourlyRate = hourlyRate !== undefined ? Number(hourlyRate) : undefined;

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
        ...(newHourlyRate !== undefined && { hourlyRate: newHourlyRate }),
        ...(active !== undefined && { active: Boolean(active) }),
      },
    });

    // If hourly rate was updated and updateFutureShifts is true:
    // Update scheduled/future shifts starting from effectiveDate or today
    if (newHourlyRate !== undefined && updateFutureShifts) {
      const startDateStr = effectiveDate || new Date().toISOString().split('T')[0];
      await prisma.shiftAssignment.updateMany({
        where: {
          employeeId: id,
          date: { gte: startDateStr },
        },
        data: {
          hourlyRate: newHourlyRate,
        },
      });
    }

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
