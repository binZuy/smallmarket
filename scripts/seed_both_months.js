const { PrismaClient, ShiftType, ShiftStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedBothFast() {
  console.log('🌱 Quick Seeding BOTH September & October 2026...');

  await prisma.shiftAssignment.deleteMany();
  await prisma.employee.deleteMany();

  const allEmployees = [
    { name: 'Hương', phone: 'MB 0332895654', hourlyRate: 25000 },
    { name: 'Châu', phone: 'Tech 8964471134', hourlyRate: 25000 },
    { name: 'Ly', phone: 'TPBANK 84418102006', hourlyRate: 25000 },
    { name: 'Dương', phone: 'VCB 9965087148', hourlyRate: 20000 },
    { name: 'Hiền Lương', phone: '0901234565', hourlyRate: 25000 },
    { name: 'Minh Châu', phone: '0901234566', hourlyRate: 25000 },
    { name: 'Nhàn', phone: 'MB 0393700129', hourlyRate: 20000 },
    { name: 'Huyền', phone: 'MB 0389411573', hourlyRate: 20000 },
  ];

  const empMap = new Map();
  for (const emp of allEmployees) {
    const created = await prisma.employee.create({ data: emp });
    empMap.set(emp.name, created.id);
  }

  const shiftData = [];

  // ==========================================
  // 1. SEPTEMBER 2026 (THÁNG 9)
  // ==========================================
  const septTemplate = [
    { dayOffset: 0, shiftType: ShiftType.MORNING, staff: ['Ly', 'Nhàn'], start: '07:00', end: '12:30', hours: 5.5 },
    { dayOffset: 0, shiftType: ShiftType.AFTERNOON, staff: ['Dương', 'Châu'], start: '12:00', end: '18:30', hours: 6.5 },
    { dayOffset: 1, shiftType: ShiftType.MORNING, staff: ['Châu', 'Ly', 'Nhàn'], start: '07:00', end: '12:30', hours: 5.5 },
    { dayOffset: 1, shiftType: ShiftType.AFTERNOON, staff: ['Dương', 'Ly', 'Hương'], start: '12:00', end: '18:30', hours: 6.5 },
    { dayOffset: 2, shiftType: ShiftType.MORNING, staff: ['Châu', 'Huyền', 'Nhàn'], start: '07:00', end: '12:30', hours: 5.5 },
    { dayOffset: 2, shiftType: ShiftType.AFTERNOON, staff: ['Châu', 'Dương', 'Hương'], start: '12:00', end: '18:30', hours: 6.5, notesMap: { 'Châu': 'Về sớm 16h00' }, hoursMap: { 'Châu': 4.0 } },
    { dayOffset: 3, shiftType: ShiftType.MORNING, staff: ['Dương', 'Huyền', 'Ly'], start: '07:00', end: '12:30', hours: 5.5 },
    { dayOffset: 3, shiftType: ShiftType.AFTERNOON, staff: ['Châu', 'Dương', 'Hương'], start: '12:00', end: '18:30', hours: 6.5 },
    { dayOffset: 4, shiftType: ShiftType.MORNING, staff: ['Châu', 'Huyền', 'Hương'], start: '07:00', end: '12:30', hours: 5.5 },
    { dayOffset: 4, shiftType: ShiftType.AFTERNOON, staff: ['Dương', 'Hương', 'Nhàn'], start: '12:00', end: '18:30', hours: 6.5 },
  ];

  const septMondays = ['2026-08-31', '2026-09-07', '2026-09-14', '2026-09-21'];
  for (const mondayStr of septMondays) {
    const monday = new Date(mondayStr);
    for (const item of septTemplate) {
      const shiftDateObj = new Date(monday);
      shiftDateObj.setDate(monday.getDate() + item.dayOffset);
      const dateStr = shiftDateObj.toISOString().split('T')[0];

      for (const sName of item.staff) {
        const empId = empMap.get(sName);
        if (!empId) continue;
        const customHours = (item.hoursMap && item.hoursMap[sName]) ? item.hoursMap[sName] : item.hours;
        const customNote = (item.notesMap && item.notesMap[sName]) ? item.notesMap[sName] : null;

        shiftData.push({
          employeeId: empId,
          date: dateStr,
          shiftType: item.shiftType,
          startTime: item.start,
          endTime: item.end,
          actualHours: customHours,
          status: ShiftStatus.COMPLETED,
          notes: customNote,
        });
      }
    }
  }

  // ==========================================
  // 2. OCTOBER 2026 (THÁNG 10 - LỊCH HIỆN TẠI)
  // ==========================================
  const octTemplate = [
    { empName: 'Ly', dayOffset: 0, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Hiền Lương', dayOffset: 0, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Dương', dayOffset: 0, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Châu', dayOffset: 0, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Hiền Lương', dayOffset: 0, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: 'Rảnh cả ngày T2' },
    { empName: 'Minh Châu', dayOffset: 0, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },

    { empName: 'Ly', dayOffset: 1, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Hiền Lương', dayOffset: 1, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Nhàn', dayOffset: 1, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Hương', dayOffset: 1, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Dương', dayOffset: 1, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Minh Châu', dayOffset: 1, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Nhàn', dayOffset: 1, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: 'Rảnh cả ngày T3' },

    { empName: 'Hương', dayOffset: 2, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Châu', dayOffset: 2, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Nhàn', dayOffset: 2, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Dương', dayOffset: 2, type: ShiftType.MORNING, start: '09:00', end: '12:30', hours: 3.5, notes: 'Rảnh từ 9h00' },
    { empName: 'Hương', dayOffset: 2, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: 'Rảnh cả ngày T4' },
    { empName: 'Dương', dayOffset: 2, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Minh Châu', dayOffset: 2, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },

    { empName: 'Dương', dayOffset: 3, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Ly', dayOffset: 3, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Nhàn', dayOffset: 3, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Dương', dayOffset: 3, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Châu', dayOffset: 3, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Nhàn', dayOffset: 3, type: ShiftType.AFTERNOON, start: '12:00', end: '16:00', hours: 4.0, notes: 'Rảnh đến 16h00 (về sớm)' },

    { empName: 'Hiền Lương', dayOffset: 4, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Minh Châu', dayOffset: 4, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
  ];

  const octMondays = ['2026-09-28', '2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26'];
  for (const mondayStr of octMondays) {
    const monday = new Date(mondayStr);
    for (const item of octTemplate) {
      const shiftDateObj = new Date(monday);
      shiftDateObj.setDate(monday.getDate() + item.dayOffset);
      const dateStr = shiftDateObj.toISOString().split('T')[0];
      const empId = empMap.get(item.empName);
      if (!empId) continue;

      shiftData.push({
        employeeId: empId,
        date: dateStr,
        shiftType: item.type,
        startTime: item.start,
        endTime: item.end,
        actualHours: item.hours,
        status: ShiftStatus.SCHEDULED,
        notes: item.notes,
      });
    }
  }

  await prisma.shiftAssignment.createMany({ data: shiftData });
  console.log(`✅ INSTANTLY SEEDED ${shiftData.length} SHIFTS FOR SEPT & OCT 2026!`);
}

seedBothFast().catch(console.error).finally(() => prisma.$disconnect());
