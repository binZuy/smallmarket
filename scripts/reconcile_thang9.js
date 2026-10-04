const XLSX = require('xlsx');
const { PrismaClient, ShiftType, ShiftStatus } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function reconcileThang9Fast() {
  console.log('🔍 Reconciling exact daily attendance from public/Lịch làm việc.xlsx Sheet "Tháng 9"...');

  const wb = XLSX.readFile('public/Lịch làm việc.xlsx');
  const ws9 = wb.Sheets['Tháng 9'];
  const data = XLSX.utils.sheet_to_json(ws9, { header: 1 });

  // Clear existing shift assignments for September 2026
  await prisma.shiftAssignment.deleteMany({
    where: {
      date: {
        startsWith: '2026-09',
      },
    },
  });

  const headers = data[8]; // Row 8: Tên nhân viên, dates...
  const empRows = data.slice(9, 15); // Rows 9-14

  const empMap = new Map();
  const allEmployees = await prisma.employee.findMany();
  for (const emp of allEmployees) {
    empMap.set(emp.name, emp.id);
  }

  const csvRows = [
    ['Ngay', 'Thu', 'Ten_Nhan_Vien', 'So_Gio_Lam_Thuc_Te', 'Tinh_Trang_Lich', 'Ghi_Chu'],
  ];

  const shiftData = [];

  for (let c = 1; c < headers.length - 3; c++) {
    const dateNum = headers[c];
    if (!dateNum) continue;

    const dateObj = XLSX.SSF.parse_date_code(dateNum);
    const yyyy = dateObj.y;
    const mm = String(dateObj.m).padStart(2, '0');
    const dd = String(dateObj.d).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const dateVal = new Date(yyyy, dateObj.m - 1, dateObj.d);
    const dayOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][dateVal.getDay()];

    let totalStaffOnDay = 0;

    for (let r = 0; r < empRows.length; r++) {
      const row = empRows[r];
      const empName = row[0];
      if (!empName) continue;

      const hours = row[c];
      if (hours !== undefined && hours !== null && hours !== '' && Number(hours) > 0) {
        totalStaffOnDay++;
        const numHours = Number(hours);

        csvRows.push([
          `${dd}/${mm}/${yyyy}`,
          dayOfWeek,
          empName,
          `${numHours} giờ`,
          numHours >= 11 ? 'Làm thông cả ngày' : 'Làm 1 ca',
          dateStr === '2026-09-02' ? 'Nghỉ lễ Quốc Khánh 2/9' : '',
        ]);

        const empId = empMap.get(empName);
        if (empId) {
          const shiftType = numHours >= 11 ? ShiftType.CUSTOM : (numHours <= 6 ? ShiftType.MORNING : ShiftType.AFTERNOON);
          shiftData.push({
            employeeId: empId,
            date: dateStr,
            shiftType,
            startTime: '07:00',
            endTime: numHours >= 11 ? '18:30' : (shiftType === ShiftType.MORNING ? '12:30' : '18:30'),
            actualHours: numHours,
            status: ShiftStatus.COMPLETED,
            notes: `Chấm công thực tế Excel Sheet Tháng 9 (${numHours}h)`,
          });
        }
      }
    }

    if (totalStaffOnDay === 0) {
      csvRows.push([
        `${dd}/${mm}/${yyyy}`,
        dayOfWeek,
        'Không có NV nào',
        '0 giờ',
        dateStr === '2026-09-02' ? 'Nghỉ lễ 2/9' : 'Nghỉ / Trống lịch',
        dateStr === '2026-09-01' || dateStr === '2026-09-02' ? 'Cửa hàng nghỉ 01/09 & 02/09' : '',
      ]);
    }
  }

  if (shiftData.length > 0) {
    await prisma.shiftAssignment.createMany({ data: shiftData });
  }

  const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  fs.writeFileSync('public/lich_doi_chieu_thang9_chinh_xac.csv', '\uFEFF' + csvContent, 'utf8');

  console.log(`✅ EXACTLY RECONCILED ${shiftData.length} ATTENDANCE RECORDS FOR SEPTEMBER 2026!`);
}

reconcileThang9Fast().catch(console.error).finally(() => prisma.$disconnect());
