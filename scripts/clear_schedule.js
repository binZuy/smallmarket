const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clear() {
  await prisma.shiftAssignment.deleteMany();
  await prisma.employee.deleteMany();
  console.log('✅ Cleared shift and employee seed data.');
}

clear().catch(console.error).finally(() => prisma.$disconnect());
