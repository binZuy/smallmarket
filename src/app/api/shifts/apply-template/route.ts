import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseISO, format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';

// Template format:
// template: {
//   0: { MORNING: [empId1, empId2], AFTERNOON: [empId3] }, // 0 = Monday
//   1: { MORNING: [...], AFTERNOON: [...] }, // 1 = Tuesday
//   ...
//   6: { MORNING: [...], AFTERNOON: [...] }  // 6 = Sunday
// }

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { template, targetMonth, overwrite = true } = body;

    if (!template || !targetMonth) {
      return NextResponse.json(
        { error: 'Khung lịch mẫu template và tháng targetMonth là bắt buộc' },
        { status: 400 }
      );
    }

    const monthDate = parseISO(`${targetMonth}-01`);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    const monthStartStr = format(monthStart, 'yyyy-MM-dd');
    const monthEndStr = format(monthEnd, 'yyyy-MM-dd');

    // Fetch all active employees to get hourlyRates
    const employees = await prisma.employee.findMany();
    const empRateMap = new Map(employees.map((e) => [e.id, e.hourlyRate]));

    if (overwrite) {
      // Delete existing SCHEDULED shifts in target month
      await prisma.shiftAssignment.deleteMany({
        where: {
          date: {
            gte: monthStartStr,
            lte: monthEndStr,
          },
          status: 'SCHEDULED',
        },
      });
    }

    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const shiftsToCreate: any[] = [];

    for (const day of daysInMonth) {
      const dateStr = format(day, 'yyyy-MM-dd');
      // JS getDay(): 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      // Convert to 0 = Monday, ..., 6 = Sunday
      const jsDay = getDay(day);
      const dayIndex = jsDay === 0 ? 6 : jsDay - 1;

      const dayConfig = template[dayIndex];
      if (!dayConfig) continue;

      // Morning shifts
      if (Array.isArray(dayConfig.MORNING)) {
        for (const empId of dayConfig.MORNING) {
          const rate = empRateMap.get(empId) ?? 25000;
          shiftsToCreate.push({
            employeeId: empId,
            date: dateStr,
            shiftType: 'MORNING' as const,
            startTime: '07:00',
            endTime: '12:30',
            actualHours: 5.5,
            hourlyRate: rate,
            status: 'SCHEDULED' as const,
          });
        }
      }

      // Afternoon shifts
      if (Array.isArray(dayConfig.AFTERNOON)) {
        for (const empId of dayConfig.AFTERNOON) {
          const rate = empRateMap.get(empId) ?? 25000;
          shiftsToCreate.push({
            employeeId: empId,
            date: dateStr,
            shiftType: 'AFTERNOON' as const,
            startTime: '12:00',
            endTime: '18:30',
            actualHours: 6.5,
            hourlyRate: rate,
            status: 'SCHEDULED' as const,
          });
        }
      }
    }

    if (shiftsToCreate.length > 0) {
      await prisma.shiftAssignment.createMany({
        data: shiftsToCreate,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Đã áp dụng khung lịch mẫu thành công cho ${shiftsToCreate.length} ca làm trong tháng ${targetMonth}!`,
      createdCount: shiftsToCreate.length,
    });
  } catch (error) {
    console.error('Error applying shift template:', error);
    return NextResponse.json({ error: 'Lỗi khi áp dụng lịch mẫu' }, { status: 500 });
  }
}
