const XLSX = require('xlsx');
const { PrismaClient, ShiftType, ShiftStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedThang9FromExcel() {
  console.log('🌱 Reading public/Lịch làm việc.xlsx - Sheet "Tháng 9"...');
  
  const wb = XLSX.readFile('public/Lịch làm việc.xlsx');
  const ws = wb.Sheets['Tháng 9'];
  const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });

  // Clear existing
  await prisma.shiftAssignment.deleteMany();
  await prisma.employee.deleteMany();

  // Extract employees and rates from sheet
  // Row 8 is headers (Tên nhân viên, dates..., Số giờ chính, Lương, STK)
  // Rows 9-14 are employee records
  const empRows = rawData.slice(9, 15);
  const empMap = new Map();

  for (const row of empRows) {
    const name = row[0];
    if (!name) continue;
    
    const totalHours = Number(row[row.length - 3]) || 0;
    const totalSalary = Number(row[row.length - 2]) || 0;
    // Calculate rate
    const rate = totalHours > 0 ? Math.round((totalSalary * 1000) / totalHours) : 25000;

    const emp = await prisma.employee.create({
      data: {
        name: name.toString().trim(),
        phone: row[row.length - 1] ? row[row.length - 1].toString() : null,
        hourlyRate: rate > 0 ? rate : 25000,
      }
    });
    empMap.set(emp.name, emp);
  }

  console.log('✅ Created employees from Sheet Tháng 9:', Array.from(empMap.keys()));

  // Weekly Schedule Template from Sheet Tháng 9 (Top table):
  // T2: Ca 1 (Ly + Nhàn), Ca 2 (Dương + Châu)
  // T3: Ca 1 (Châu + Ly + Nhàn), Ca 2 (Dương + Ly + Hương)
  // T4: Ca 1 (Châu + Huyền + Nhàn), Ca 2 (Châu(đến 4h) + Dương + Hương)
  // T5: Ca 1 (Dương + Huyền + Ly), Ca 2 (Châu + Dương + Hương)
  // T6: Ca 1 (Châu + Huyền + Hương), Ca 2 (Dương + Hương + Nhàn)

  const rosterTemplate = [
    // T2 (Day 0)
    { dayOffset: 0, shiftType: ShiftType.MORNING, staff: ['Ly', 'Nhàn'], start: '07:00', end: '12:30', hours: 5.5 },
    { dayOffset: 0, shiftType: ShiftType.AFTERNOON, staff: ['Dương', 'Châu'], start: '12:00', end: '18:30', hours: 6.5 },

    // T3 (Day 1)
    { dayOffset: 1, shiftType: ShiftType.MORNING, staff: ['Châu', 'Ly', 'Nhàn'], start: '07:00', end: '12:30', hours: 5.5 },
    { dayOffset: 1, shiftType: ShiftType.AFTERNOON, staff: ['Dương', 'Ly', 'Hương'], start: '12:00', end: '18:30', hours: 6.5 },

    // T4 (Day 2)
    { dayOffset: 2, shiftType: ShiftType.MORNING, staff: ['Châu', 'Huyền', 'Nhàn'], start: '07:00', end: '12:30', hours: 5.5 },
    { dayOffset: 2, shiftType: ShiftType.AFTERNOON, staff: ['Châu', 'Dương', 'Hương'], start: '12:00', end: '18:30', hours: 6.5, notesMap: { 'Châu': 'Về sớm 16h00 (làm 4.0h)' }, hoursMap: { 'Châu': 4.0 } },

    // T5 (Day 3)
    { dayOffset: 3, shiftType: ShiftType.MORNING, staff: ['Dương', 'Huyền', 'Ly'], start: '07:00', end: '12:30', hours: 5.5 },
    { dayOffset: 3, shiftType: ShiftType.AFTERNOON, staff: ['Châu', 'Dương', 'Hương'], start: '12:00', end: '18:30', hours: 6.5 },

    // T6 (Day 4)
    { dayOffset: 4, shiftType: ShiftType.MORNING, staff: ['Châu', 'Huyền', 'Hương'], start: '07:00', end: '12:30', hours: 5.5 },
    { dayOffset: 4, shiftType: ShiftType.AFTERNOON, staff: ['Dương', 'Hương', 'Nhàn'], start: '12:00', end: '18:30', hours: 6.5 },
  ];

  // We can populate for all 4 weeks of September 2026 (or September 2026 dates)
  // Let's seed for September 2026 (2026-09-01 to 2026-09-30)
  const startDate = new Date('2026-09-01'); // Tuesday
  // Find Mondays in September 2026
  const septMondays = ['2026-08-31', '2026-09-07', '2026-09-14', '2026-09-21', '2026-09-28'];

  for (const mondayStr of septMondays) {
    const monday = new Date(mondayStr);
    for (const item of rosterTemplate) {
      const shiftDateObj = new Date(monday);
      shiftDateObj.setDate(monday.getDate() + item.dayOffset);
      const dateStr = shiftDateObj.toISOString().split('T')[0];

      for (const sName of item.staff) {
        const emp = empMap.get(sName);
        if (!emp) continue;

        const customHours = (item.hoursMap && item.hoursMap[sName]) ? item.hoursMap[sName] : item.hours;
        const customNote = (item.notesMap && item.notesMap[sName]) ? item.notesMap[sName] : null;

        await prisma.shiftAssignment.create({
          data: {
            employeeId: emp.id,
            date: dateStr,
            shiftType: item.shiftType,
            startTime: item.start,
            endTime: item.end,
            actualHours: customHours,
            status: ShiftStatus.COMPLETED,
            notes: customNote,
          }
        });
      }
    }
  }

  console.log('✅ September 2026 schedule seeded from Excel file!');
}

seedThang9FromExcel().catch(console.error).finally(() => prisma.$disconnect());
