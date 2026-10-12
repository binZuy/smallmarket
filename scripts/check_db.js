const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDB() {
  console.log('=== CHECKING DATABASE STATUS ===');
  
  const employees = await prisma.employee.findMany();
  console.log(`\n--- EMPLOYEES (${employees.length}) ---`);
  employees.forEach((e) => {
    console.log(`  - ${e.name}: Rate=${e.hourlyRate}đ/h, Phone=${e.phone || 'N/A'}`);
  });

  const totalShifts = await prisma.shiftAssignment.count();
  console.log(`\n--- TOTAL SHIFTS: ${totalShifts} ---`);

  const septShifts = await prisma.shiftAssignment.findMany({
    where: { date: { startsWith: '2026-09' } },
    include: { employee: true },
  });

  const octShifts = await prisma.shiftAssignment.findMany({
    where: { date: { startsWith: '2026-10' } },
    include: { employee: true },
  });

  console.log('  + September 2026 Shifts:', septShifts.length);
  console.log('  + October 2026 Shifts:', octShifts.length);

  // Sept payroll test
  console.log('\n--- SEPTEMBER 2026 PAYROLL DETAILS ---');
  const septEmpsMap = {};
  septShifts.forEach((s) => {
    const name = s.employee.name;
    if (!septEmpsMap[name]) septEmpsMap[name] = { hours: 0, salary: 0, rates: new Set() };
    const rate = s.hourlyRate ?? s.employee.hourlyRate;
    septEmpsMap[name].hours += s.actualHours;
    septEmpsMap[name].salary += s.actualHours * rate;
    septEmpsMap[name].rates.add(rate);
  });
  Object.entries(septEmpsMap).forEach(([name, data]) => {
    console.log(
      `  - ${name.padEnd(12)}: ${data.hours.toFixed(1)}h | Đơn giá: ${Array.from(data.rates).join(', ')}đ/h | Tổng lương: ${data.salary.toLocaleString('vi-VN')}đ`
    );
  });

  // Oct payroll test
  console.log('\n--- OCTOBER 2026 PAYROLL DETAILS ---');
  const octEmpsMap = {};
  octShifts.forEach((s) => {
    const name = s.employee.name;
    if (!octEmpsMap[name]) octEmpsMap[name] = { hours: 0, salary: 0, rates: new Set() };
    const rate = s.hourlyRate ?? s.employee.hourlyRate;
    octEmpsMap[name].hours += s.actualHours;
    octEmpsMap[name].salary += s.actualHours * rate;
    octEmpsMap[name].rates.add(rate);
  });
  Object.entries(octEmpsMap).forEach(([name, data]) => {
    console.log(
      `  - ${name.padEnd(12)}: ${data.hours.toFixed(1)}h | Đơn giá: ${Array.from(data.rates).join(', ')}đ/h | Tổng lương: ${data.salary.toLocaleString('vi-VN')}đ`
    );
  });
}

checkDB()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
