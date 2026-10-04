import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ShiftType, ShiftStatus } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const employeeId = searchParams.get('employeeId');

    const where: any = {};

    if (date) {
      where.date = date;
    } else if (month) {
      where.date = {
        startsWith: month,
      };
    } else if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    const shifts = await prisma.shiftAssignment.findMany({
      where,
      include: {
        employee: true,
      },
      orderBy: [
        { date: 'asc' },
        { shiftType: 'asc' },
      ],
    });

    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { employeeId, date, shiftType, startTime, endTime, actualHours, status, notes } = body;

    if (!employeeId || !date) {
      return NextResponse.json({ error: 'Mã nhân viên và ngày xếp ca là bắt buộc' }, { status: 400 });
    }

    // Determine default times and hours based on shiftType if not provided
    let sType: ShiftType = shiftType || ShiftType.MORNING;
    let sStart = startTime;
    let sEnd = endTime;
    let sHours = actualHours;

    if (sType === ShiftType.MORNING) {
      if (!sStart) sStart = '07:00';
      if (!sEnd) sEnd = '12:30';
      if (sHours === undefined || sHours === null) sHours = 5.5;
    } else if (sType === ShiftType.AFTERNOON) {
      if (!sStart) sStart = '12:00';
      if (!sEnd) sEnd = '18:30';
      if (sHours === undefined || sHours === null) sHours = 6.5;
    } else {
      if (!sStart) sStart = '07:00';
      if (!sEnd) sEnd = '12:00';
      if (sHours === undefined || sHours === null) sHours = 5.0;
    }

    const newShift = await prisma.shiftAssignment.create({
      data: {
        employeeId,
        date,
        shiftType: sType,
        startTime: sStart,
        endTime: sEnd,
        actualHours: Number(sHours),
        status: status || ShiftStatus.SCHEDULED,
        notes: notes ? notes.trim() : null,
      },
      include: {
        employee: true,
      },
    });

    return NextResponse.json(newShift, { status: 201 });
  } catch (error) {
    console.error('Error creating shift:', error);
    return NextResponse.json({ error: 'Failed to create shift' }, { status: 500 });
  }
}
