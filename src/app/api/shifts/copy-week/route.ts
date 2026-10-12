import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseISO, addDays, format } from 'date-fns';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sourceStartDate, targetMondays } = body;

    if (!sourceStartDate || !Array.isArray(targetMondays) || targetMondays.length === 0) {
      return NextResponse.json(
        { error: 'sourceStartDate và danh sách targetMondays là bắt buộc' },
        { status: 400 }
      );
    }

    const sourceStart = parseISO(sourceStartDate);
    const sourceEnd = addDays(sourceStart, 6);

    const sourceStartStr = format(sourceStart, 'yyyy-MM-dd');
    const sourceEndStr = format(sourceEnd, 'yyyy-MM-dd');

    // 1. Fetch source week shifts
    const sourceShifts = await prisma.shiftAssignment.findMany({
      where: {
        date: {
          gte: sourceStartStr,
          lte: sourceEndStr,
        },
      },
      include: {
        employee: true,
      },
    });

    if (sourceShifts.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy ca làm việc nào ở tuần gốc để sao chép' },
        { status: 400 }
      );
    }

    let createdCount = 0;

    // Process each target week
    for (const targetMondayStr of targetMondays) {
      const targetMonday = parseISO(targetMondayStr);
      const targetSunday = addDays(targetMonday, 6);

      const targetStartStr = format(targetMonday, 'yyyy-MM-dd');
      const targetEndStr = format(targetSunday, 'yyyy-MM-dd');

      // Delete existing SCHEDULED shifts in target week to avoid duplicate overlaps
      await prisma.shiftAssignment.deleteMany({
        where: {
          date: {
            gte: targetStartStr,
            lte: targetEndStr,
          },
          status: 'SCHEDULED', // Keep COMPLETED past historical shifts untouched
        },
      });

      // Prepare new shifts for target week
      const newShiftsData = sourceShifts.map((s) => {
        const shiftDateObj = parseISO(s.date);
        // Calculate day offset from source Monday (0 to 6)
        const dayOffset = Math.round(
          (shiftDateObj.getTime() - sourceStart.getTime()) / (1000 * 3600 * 24)
        );

        const newDateStr = format(addDays(targetMonday, dayOffset), 'yyyy-MM-dd');

        return {
          employeeId: s.employeeId,
          date: newDateStr,
          shiftType: s.shiftType,
          startTime: s.startTime,
          endTime: s.endTime,
          actualHours: s.actualHours,
          hourlyRate: s.hourlyRate ?? s.employee.hourlyRate,
          status: 'SCHEDULED' as const,
          notes: s.notes,
        };
      });

      if (newShiftsData.length > 0) {
        await prisma.shiftAssignment.createMany({
          data: newShiftsData,
        });
        createdCount += newShiftsData.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã áp dụng thành công ${createdCount} ca làm việc cho các tuần tương lai!`,
      createdCount,
    });
  } catch (error) {
    console.error('Error copying week shifts:', error);
    return NextResponse.json({ error: 'Lỗi khi sao chép lịch làm việc' }, { status: 500 });
  }
}
