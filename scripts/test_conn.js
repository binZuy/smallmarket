const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const info = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
  console.log('Connected successfully:', info);
}

main().catch(console.error).finally(() => prisma.$disconnect());

