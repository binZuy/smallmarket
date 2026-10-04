const { PrismaClient, ShiftType, ShiftStatus } = require('@prisma/client');
const { startOfWeek, addDays, format } = require('date-fns');

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

async function seedSwappedSchedule() {
  console.log('🌱 Swapping schedule for Nhàn and Minh Châu...');

  // Reset existing shift data
  await prisma.shiftAssignment.deleteMany();
  await prisma.employee.deleteMany();

  const empMap = new Map();
  for (const emp of employeeData) {
    const created = await prisma.employee.create({
      data: {
        name: emp.name,
        phone: emp.phone,
        hourlyRate: 25000,
      },
    });
    empMap.set(emp.name, created.id);
  }

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const getDayStr = (offsetDays) => format(addDays(weekStart, offsetDays), 'yyyy-MM-dd');

  // Swapped availability:
  // Minh Châu: Chiều T2, Chiều T3, Chiều T4, Chiều T6
  // Nhàn: Cả ngày T3 (Sáng, Chiều), Sáng T4, Sáng T5, Chiều T5 (đến 16h)
  const allShifts = [
    // --- THỨ 2 ---
    // Sáng T2 (Ly, Hiền Lương)
    { empName: 'Ly', dayOffset: 0, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Hiền Lương', dayOffset: 0, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },

    // Chiều T2 (T.Dương, Phan Châu, Hiền Lương, Minh Châu - 4 người rảnh)
    { empName: 'T.Dương', dayOffset: 0, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Phan Châu', dayOffset: 0, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Hiền Lương', dayOffset: 0, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: 'Rảnh cả ngày T2' },
    { empName: 'Minh Châu', dayOffset: 0, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },

    // --- THỨ 3 ---
    // Sáng T3 (Ly, Hiền Lương, Nhàn)
    { empName: 'Ly', dayOffset: 1, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Hiền Lương', dayOffset: 1, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Nhàn', dayOffset: 1, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },

    // Chiều T3 (Hương, T.Dương, Minh Châu, Nhàn - 4 người rảnh)
    { empName: 'Hương', dayOffset: 1, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'T.Dương', dayOffset: 1, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Minh Châu', dayOffset: 1, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Nhàn', dayOffset: 1, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: 'Rảnh cả ngày T3' },

    // --- THỨ 4 ---
    // Sáng T4 (Hương, Phan Châu, Nhàn, T.Dương từ 9h)
    { empName: 'Hương', dayOffset: 2, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Phan Châu', dayOffset: 2, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Nhàn', dayOffset: 2, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'T.Dương', dayOffset: 2, type: ShiftType.MORNING, start: '09:00', end: '12:30', hours: 3.5, notes: 'Rảnh từ 9h00' },

    // Chiều T4 (Hương, T.Dương, Minh Châu)
    { empName: 'Hương', dayOffset: 2, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: 'Rảnh cả ngày T4' },
    { empName: 'T.Dương', dayOffset: 2, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Minh Châu', dayOffset: 2, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },

    // --- THỨ 5 ---
    // Sáng T5 (T.Dương, Ly, Nhàn)
    { empName: 'T.Dương', dayOffset: 3, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Ly', dayOffset: 3, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Nhàn', dayOffset: 3, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },

    // Chiều T5 (T.Dương, Phan Châu, Nhàn đến 16h)
    { empName: 'T.Dương', dayOffset: 3, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Phan Châu', dayOffset: 3, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Nhàn', dayOffset: 3, type: ShiftType.AFTERNOON, start: '12:00', end: '16:00', hours: 4.0, notes: 'Rảnh đến 16h00 (về sớm)' },

    // --- THỨ 6 ---
    // Sáng T6 (Hiền Lương)
    { empName: 'Hiền Lương', dayOffset: 4, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },

    // Chiều T6 (Minh Châu)
    { empName: 'Minh Châu', dayOffset: 4, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
  ];

  for (const item of allShifts) {
    const empId = empMap.get(item.empName);
    if (!empId) continue;
    const dateStr = getDayStr(item.dayOffset);

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

  console.log('✅ Schedule updated with swapped Nhàn & Minh Châu!');
}

seedSwappedSchedule()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
