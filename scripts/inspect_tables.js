const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log('--- TABLES IN PUBLIC SCHEMA ---');
    console.table(tables);

    for (const row of tables) {
      const tableName = row.table_name;
      const countRes = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${tableName}"`);
      console.log(`Table: ${tableName} -> ${countRes[0].count} rows`);
    }
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

