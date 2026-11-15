const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTables() {
  console.log('🚀 Checking existing database tables...');
  const beforeTables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
  `;
  console.log('Tables before:', beforeTables.map(t => t.table_name));

  console.log('🛠 Creating enums...');
  const enums = [
    `DO $$ BEGIN
      CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,

    `DO $$ BEGIN
      CREATE TYPE "ShiftType" AS ENUM ('MORNING', 'AFTERNOON', 'CUSTOM');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,

    `DO $$ BEGIN
      CREATE TYPE "ShiftStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'ABSENT');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`,

    `DO $$ BEGIN
      CREATE TYPE "InventoryType" AS ENUM ('IMPORT', 'EXPORT', 'ADJUSTMENT', 'DAMAGE');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`
  ];

  for (const enumSql of enums) {
    await prisma.$executeRawUnsafe(enumSql);
  }
  console.log('✅ Enums ready.');

  console.log('🛠 Creating tables...');
  const tableStatements = [
    `CREATE TABLE IF NOT EXISTS "products" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "sellingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "unit" TEXT NOT NULL DEFAULT 'cái',
      "stockQuantity" INTEGER NOT NULL DEFAULT 0,
      "minStockLevel" INTEGER NOT NULL DEFAULT 5,
      "category" TEXT,
      "isAvailable" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS "orders" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderCode" TEXT NOT NULL UNIQUE,
      "totalSellingPrice" DOUBLE PRECISION NOT NULL,
      "totalCostPrice" DOUBLE PRECISION NOT NULL,
      "profit" DOUBLE PRECISION NOT NULL,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS "order_items" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderId" TEXT NOT NULL,
      "productId" TEXT,
      "productName" TEXT NOT NULL,
      "costPrice" DOUBLE PRECISION NOT NULL,
      "sellingPrice" DOUBLE PRECISION NOT NULL,
      "quantity" INTEGER NOT NULL DEFAULT 1,
      CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS "inventory_transactions" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "type" "InventoryType" NOT NULL,
      "productId" TEXT,
      "productName" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL,
      "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "supplier" TEXT,
      "referenceCode" TEXT,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "inventory_transactions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE
    );`,

    `CREATE TABLE IF NOT EXISTS "transactions" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "date" TIMESTAMP(3) NOT NULL,
      "type" "TransactionType" NOT NULL,
      "category" TEXT NOT NULL,
      "amount" DOUBLE PRECISION NOT NULL,
      "quantity" INTEGER,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS "employees" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "phone" TEXT,
      "hourlyRate" DOUBLE PRECISION NOT NULL DEFAULT 25000,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`,

    `CREATE TABLE IF NOT EXISTS "shift_assignments" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "employeeId" TEXT NOT NULL,
      "date" TEXT NOT NULL,
      "shiftType" "ShiftType" NOT NULL DEFAULT 'MORNING',
      "startTime" TEXT NOT NULL DEFAULT '07:00',
      "endTime" TEXT NOT NULL DEFAULT '12:30',
      "actualHours" DOUBLE PRECISION NOT NULL DEFAULT 5.5,
      "hourlyRate" DOUBLE PRECISION,
      "status" "ShiftStatus" NOT NULL DEFAULT 'SCHEDULED',
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "shift_assignments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`
  ];

  for (const tableSql of tableStatements) {
    await prisma.$executeRawUnsafe(tableSql);
  }
  console.log('✅ Tables created.');

  console.log('🛠 Creating indexes...');
  const indices = [
    `CREATE INDEX IF NOT EXISTS "order_items_orderId_idx" ON "order_items"("orderId");`,
    `CREATE INDEX IF NOT EXISTS "order_items_productId_idx" ON "order_items"("productId");`,
    `CREATE INDEX IF NOT EXISTS "inventory_transactions_productId_idx" ON "inventory_transactions"("productId");`,
    `CREATE INDEX IF NOT EXISTS "shift_assignments_employeeId_idx" ON "shift_assignments"("employeeId");`,
    `CREATE INDEX IF NOT EXISTS "shift_assignments_date_idx" ON "shift_assignments"("date");`,
    `CREATE INDEX IF NOT EXISTS "transactions_date_idx" ON "transactions"("date");`
  ];

  for (const indexSql of indices) {
    await prisma.$executeRawUnsafe(indexSql);
  }
  console.log('✅ Indexes created.');

  console.log('\n--- VERIFYING ALL TABLES IN DB ---');
  const afterTables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
  `;
  console.table(afterTables);
}

createTables()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

