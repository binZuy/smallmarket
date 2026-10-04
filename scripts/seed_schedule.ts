import { PrismaClient, ShiftType, ShiftStatus } from '@prisma/client';
import { startOfWeek, addDays, format } from 'date-fns';

const prisma = new PrismaClient();

const employeeData = [
  { name: 'Hương', phone: '0901234561' },
  { name: 'T.Dương', phone: '0901234562' },
  { name: 'Phan Châu', phone: '0901234563' },
  { name: 'Ly', phone: '0901234564' },
  { name: 'Hiền Lương', phone: '0901234565' },
  { name: 'Minh Châu', phone: '0901234566' },
  { name: 'Nhàn', phone: '0901234567' },
];

async function seedSchedule() {
  console.log('🌱 Seeding employees and shift schedules...');

  // Create employees
  const empMap = new Map<string, string>();
  for (const emp of employeeData) {
    const existing = await prisma.employee.findFirst({ where: { name: emp.name } });
    if (existing) {
      empMap.set(emp.name, existing.id);
    } else {
      const created = await prisma.employee.create({
        data: {
          name: emp.name,
          phone: emp.phone,
          hourlyRate: 25000,
        },
      });
      empMap.set(emp.name, created.id);
    }
  }

  // Calculate current week Monday
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  const getDayStr = (offsetDays: number) => format(addDays(weekStart, offsetDays), 'yyyy-MM-dd');

  // Schedule mapping based on availability and 3-person max per shift requirement
  const scheduleAssignments = [
    // --- THỨ 2 (Day 0) ---
    // Sáng T2: Ly, Hiền Lương (Thiếu 1 người)
    { empName: 'Ly', dayOffset: 0, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Hiền Lương', dayOffset: 0, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },

    // Chiều T2: T.Dương, Phan Châu, Nhàn (Hiền Lương rảnh nhưng xếp 3 người)
    { empName: 'T.Dương', dayOffset: 0, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Phan Châu', dayOffset: 0, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Nhàn', dayOffset: 0, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },

    // --- THỨ 3 (Day 1) ---
    // Sáng T3: Ly, Hiền Lương, Minh Châu
    { empName: 'Ly', dayOffset: 1, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Hiền Lương', dayOffset: 1, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Minh Châu', dayOffset: 1, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },

    // Chiều T3: Hương, T.Dương, Nhàn (Minh Châu rảnh nhưng xếp 3 người)
    { empName: 'Hương', dayOffset: 1, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'T.Dương', dayOffset: 1, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Nhàn', dayOffset: 1, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },

    // --- THỨ 4 (Day 2) ---
    // Sáng T4: Hương, Phan Châu, Minh Châu (T.Dương rảnh từ 9h)
    { empName: 'Hương', dayOffset: 2, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Phan Châu', dayOffset: 2, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Minh Châu', dayOffset: 2, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'T.Dương', dayOffset: 2, type: ShiftType.MORNING, start: '09:00', end: '12:30', hours: 3.5, notes: 'Chỉ rảnh từ 9h00' },

    // Chiều T4: Hương, T.Dương, Nhàn
    { empName: 'Hương', dayOffset: 2, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'T.Dương', dayOffset: 2, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Nhàn', dayOffset: 2, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },

    // --- THỨ 5 (Day 3) ---
    // Sáng T5: T.Dương, Ly, Minh Châu
    { empName: 'T.Dương', dayOffset: 3, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Ly', dayOffset: 3, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Minh Châu', dayOffset: 3, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },

    // Chiều T5: T.Dương, Phan Châu, Minh Châu (về 16h)
    { empName: 'T.Dương', dayOffset: 3, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Phan Châu', dayOffset: 3, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Minh Châu', dayOffset: 3, type: ShiftType.AFTERNOON, start: '12:00', end: '16:00', hours: 4.0, notes: 'Rảnh đến 16h00 (về sớm)' },

    // --- THỨ 6 (Day 4) ---
    // Sáng T6: Hiền Lương (Thiếu 2 người)
    { empName: 'Hiền Lương', dayOffset: 4, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },

    // Chiều T6: Nhàn (Thiếu 2 người)
    { empName: 'Nhàn', dayOffset: 4, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
  ];

  for (const item of scheduleAssignments) {
    const empId = empMap.get(item.empName);
    if (!empId) continue;
    const dateStr = getDayStr(item.dayOffset);

    // Avoid duplicating shift
    const existing = await prisma.shiftAssignment.findFirst({
      where: { employeeId: empId, date: dateStr, shiftType: item.type },
    });

    if (!existing) {
      await prisma.shiftAssignment.create({
        data: {
          employeeId: empId,
          date: dateStr,
          shiftType: item.type,
          startTime: item.start,
          endTime: item.end,
          actualHours: item.hours,
          status: ShiftStatus.SCHEDULED,
          notes: item.notes,
        },
      });
    }
  }

  console.log('✅ Schedule seeded successfully!');
}

seedSchedule()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
