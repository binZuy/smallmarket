const { PrismaClient, ShiftType, ShiftStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSchedule() {
  console.log('🔄 Đang cập nhật lịch phân ca từ ngày 12/10/2026...');

  // 1. Cập nhật tên nhân viên Châu -> Phan Châu
  const chauEmp = await prisma.employee.findFirst({
    where: { name: 'Châu' }
  });
  if (chauEmp) {
    await prisma.employee.update({
      where: { id: chauEmp.id },
      data: { name: 'Phan Châu' }
    });
    console.log('✅ Đã đổi tên nhân viên "Châu" thành "Phan Châu"');
  }

  // Lấy danh sách nhân viên
  const employees = await prisma.employee.findMany();
  const empMap = new Map();
  employees.forEach(e => empMap.set(e.name, e.id));

  // 2. Xóa các ca làm việc từ 12/10/2026 trở đi (giữ nguyên tuần trước 05/10 - 11/10 đã hoàn thành)
  const deleted = await prisma.shiftAssignment.deleteMany({
    where: {
      date: { gte: '2026-10-12' }
    }
  });
  console.log(`🗑️ Đã xóa ${deleted.count} ca cũ từ ngày 12/10/2026 trở đi`);

  // Template lịch rảnh cập nhật từ 12/10:
  // dayOffset: 0 = Thứ 2, 1 = Thứ 3, 2 = Thứ 4, 3 = Thứ 5, 4 = Thứ 6
  const updatedTemplate = [
    // --- THỨ 2 ---
    // Sáng T2: Hiền Lương (1 người - thiếu 2 người)
    { empName: 'Hiền Lương', dayOffset: 0, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    // Chiều T2: Dương, Hiền Lương, Ly (Đủ 3 người)
    { empName: 'Dương', dayOffset: 0, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Hiền Lương', dayOffset: 0, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: 'Rảnh cả ngày T2' },
    { empName: 'Ly', dayOffset: 0, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },

    // --- THỨ 3 ---
    // Sáng T3: Hiền Lương, Ly, Nhàn (Đủ 3 người)
    { empName: 'Hiền Lương', dayOffset: 1, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Ly', dayOffset: 1, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Nhàn', dayOffset: 1, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    // Chiều T3: Hương, Dương, Nhàn (và Ly rảnh cả ngày T3 - chọn 3 người)
    { empName: 'Hương', dayOffset: 1, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Dương', dayOffset: 1, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Nhàn', dayOffset: 1, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: 'Rảnh cả ngày T3' },

    // --- THỨ 4 ---
    // Sáng T4: Phan Châu, Nhàn, Dương (từ 9h) (Đủ 3 người)
    { empName: 'Phan Châu', dayOffset: 2, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Nhàn', dayOffset: 2, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Dương', dayOffset: 2, type: ShiftType.MORNING, start: '09:00', end: '12:30', hours: 3.5, notes: 'Rảnh từ 9h00' },
    // Chiều T4: Dương (1 người - thiếu 2 người)
    { empName: 'Dương', dayOffset: 2, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },

    // --- THỨ 5 ---
    // Sáng T5: Dương, Nhàn (2 người - thiếu 1 người)
    { empName: 'Dương', dayOffset: 3, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Nhàn', dayOffset: 3, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    // Chiều T5: Dương, Phan Châu, Nhàn (đến 16h) (Đủ 3 người, Nhàn về sớm 16h)
    { empName: 'Dương', dayOffset: 3, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Phan Châu', dayOffset: 3, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Nhàn', dayOffset: 3, type: ShiftType.AFTERNOON, start: '12:00', end: '16:00', hours: 4.0, notes: 'Rảnh đến 16h00 (về sớm)' },

    // --- THỨ 6 ---
    // Sáng T6: Hiền Lương, Hương (2 người - thiếu 1 người)
    { empName: 'Hiền Lương', dayOffset: 4, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: '' },
    { empName: 'Hương', dayOffset: 4, type: ShiftType.MORNING, start: '07:00', end: '12:30', hours: 5.5, notes: 'Rảnh cả ngày T6' },
    // Chiều T6: Phan Châu, Hương, Nhàn (Đủ 3 người!)
    { empName: 'Phan Châu', dayOffset: 4, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
    { empName: 'Hương', dayOffset: 4, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: 'Rảnh cả ngày T6' },
    { empName: 'Nhàn', dayOffset: 4, type: ShiftType.AFTERNOON, start: '12:00', end: '18:30', hours: 6.5, notes: '' },
  ];

  const futureMondays = ['2026-10-12', '2026-10-19', '2026-10-26'];
  const newShifts = [];

  for (const mondayStr of futureMondays) {
    const monday = new Date(mondayStr);
    for (const item of updatedTemplate) {
      const shiftDateObj = new Date(monday);
      shiftDateObj.setDate(monday.getDate() + item.dayOffset);
      const dateStr = shiftDateObj.toISOString().split('T')[0];

      // Nếu ngày vượt quá tháng 10 thì dừng
      if (!dateStr.startsWith('2026-10')) continue;

      const empId = empMap.get(item.empName);
      if (!empId) {
        console.warn(`⚠️ Không tìm thấy ID cho nhân viên: ${item.empName}`);
        continue;
      }

      newShifts.push({
        employeeId: empId,
        date: dateStr,
        shiftType: item.type,
        startTime: item.start,
        endTime: item.end,
        actualHours: item.hours,
        hourlyRate: 25000,
        status: ShiftStatus.SCHEDULED,
        notes: item.notes,
      });
    }
  }

  await prisma.shiftAssignment.createMany({ data: newShifts });
  console.log(`✅ Đã tạo thành công ${newShifts.length} ca làm việc từ 12/10/2026 đến hết tháng 10!`);
}

updateSchedule()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
