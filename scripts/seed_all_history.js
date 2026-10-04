const XLSX = require('xlsx');
const { PrismaClient, ShiftType, ShiftStatus } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function seedAllHistory() {
  console.log('🌱 Seeding ALL historical attendance data (Tháng 8 & Tháng 9) from public/Lịch làm việc.xlsx...');

  const wb = XLSX.readFile('public/Lịch làm việc.xlsx');

  // 1. Ensure all employees from both sheets exist
  const empNames = new Set();
  
  // Sheet Tháng 8
  const ws8 = wb.Sheets['Tháng 8'];
  if (ws8) {
    const data8 = XLSX.utils.sheet_to_json(ws8, { header: 1 });
    const rows8 = data8.slice(8, 13);
    rows8.forEach(r => r[0] && empNames.add(r[0].toString().trim()));
  }

  // Sheet Tháng 9
  const ws9 = wb.Sheets['Tháng 9'];
  if (ws9) {
    const data9 = XLSX.utils.sheet_to_json(ws9, { header: 1 });
    const rows9 = data9.slice(9, 15);
    rows9.forEach(r => r[0] && empNames.add(r[0].toString().trim()));
  }

  // Active employees for Oct
  ['Hiền Lương', 'Minh Châu', 'Phan Châu', 'T.Dương'].forEach(n => empNames.add(n));

  const empMap = new Map();
  for (const name of empNames) {
    let emp = await prisma.employee.findFirst({ where: { name } });
    if (!emp) {
      emp = await prisma.employee.create({
        data: {
          name,
          hourlyRate: 25000,
        },
      });
    }
    empMap.set(name, emp.id);
  }

  const shiftBatch = [];

  // Helper to parse sheet attendance
  function parseSheet(sheet, monthLabel) {
    if (!sheet) return;
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Find header row containing Excel date serials
    let headerIdx = -1;
    for (let i = 0; i < data.length; i++) {
      if (data[i] && typeof data[i][1] === 'number' && data[i][1] > 40000) {
        headerIdx = i;
        break;
      }
    }

    if (headerIdx === -1) return;

    const headers = data[headerIdx];
    const empRows = data.slice(headerIdx + 1).filter(r => r && r[0] && typeof r[0] === 'string' && !r[0].includes('BẢNG') && !r[0].includes('Tên'));

    for (let c = 1; c < headers.length - 3; c++) {
      const dateNum = headers[c];
      if (typeof dateNum !== 'number') continue;

      const dateObj = XLSX.SSF.parse_date_code(dateNum);
      const yyyy = dateObj.y;
      const mm = String(dateObj.m).padStart(2, '0');
      const dd = String(dateObj.d).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      for (const row of empRows) {
        const empName = row[0].toString().trim();
        const hours = row[c];

        if (hours !== undefined && hours !== null && hours !== '' && !isNaN(Number(hours)) && Number(hours) > 0) {
          const numHours = Number(hours);
          const empId = empMap.get(empName);
          if (empId) {
            const shiftType = numHours >= 11 ? ShiftType.CUSTOM : (numHours <= 6 ? ShiftType.MORNING : ShiftType.AFTERNOON);
            shiftBatch.push({
              employeeId: empId,
              date: dateStr,
              shiftType,
              startTime: '07:00',
              endTime: numHours >= 11 ? '18:30' : (shiftType === ShiftType.MORNING ? '12:30' : '18:30'),
              actualHours: numHours,
              status: ShiftStatus.COMPLETED,
              notes: `Chấm công thực tế Excel Sheet ${monthLabel} (${numHours}h)`,
            });
          }
        }
      }
    }
  }

  parseSheet(ws8, 'Tháng 8');
  parseSheet(ws9, 'Tháng 9');

  if (shiftBatch.length > 0) {
    // Delete past history shifts to replace cleanly
    await prisma.shiftAssignment.deleteMany({
      where: {
        date: {
          lt: '2026-09-28', // keep Oct schedule
        },
      },
    });

    await prisma.shiftAssignment.createMany({ data: shiftBatch });
  }

  console.log(`✅ SUCCESS! Loaded ${shiftBatch.length} historical attendance records (Tháng 8 & Tháng 9) into database!`);
}

seedAllHistory().catch(console.error).finally(() => prisma.$disconnect());
