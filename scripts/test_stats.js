const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const products = await prisma.product.count();
  const inv = await prisma.inventoryTransaction.count();
  const orders = await prisma.order.findMany({ include: { items: true } });
  const totalRev = orders.reduce((s, o) => s + o.totalSellingPrice, 0);
  const totalCost = orders.reduce((s, o) => s + o.totalCostPrice, 0);
  const totalProfit = orders.reduce((s, o) => s + o.profit, 0);

  console.log('=== TEST SEEDED CONVENIENCE STORE DATA ===');
  console.log('PRODUCTS COUNT:', products);
  console.log('INVENTORY TRANSACTIONS COUNT:', inv);
  console.log('ORDERS COUNT:', orders.length);
  console.log(`TOTAL REVENUE: ${totalRev.toLocaleString('vi-VN')} đ`);
  console.log(`TOTAL COST:    ${totalCost.toLocaleString('vi-VN')} đ`);
  console.log(`TOTAL PROFIT:  ${totalProfit.toLocaleString('vi-VN')} đ (${((totalProfit / totalRev) * 100).toFixed(1)}% margin)`);

  const sampleProducts = await prisma.product.findMany({
    select: { name: true, category: true, stockQuantity: true, costPrice: true, sellingPrice: true },
    take: 6,
    orderBy: { createdAt: 'desc' }
  });
  console.log('\n--- SAMPLE RECENT PRODUCTS ---');
  console.table(sampleProducts);
}

test().catch(console.error).finally(() => prisma.$disconnect());
