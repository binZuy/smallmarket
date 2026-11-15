const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const productsCount = await prisma.product.count();
  const invCount = await prisma.inventoryTransaction.count();
  const txCount = await prisma.transaction.count();
  const empCount = await prisma.employee.count();
  const ordersCount = await prisma.order.count();
  
  console.log('✅ TRẠNG THÁI DATABASE SUPABASE HIỆN TẠI:');
  console.log('- Tổng sản phẩm & nguyên liệu (products):', productsCount);
  console.log('- Tổng nhật ký xuất nhập kho (inventory_transactions):', invCount);
  console.log('- Tổng giao dịch sổ quỹ (transactions):', txCount);
  console.log('- Tổng nhân viên (employees):', empCount);
  console.log('- Tổng đơn hàng mẫu (orders):', ordersCount);

  const sampleIngredients = await prisma.product.findMany({
    where: { category: 'Nguyên liệu pha chế' },
    select: { name: true, costPrice: true, stockQuantity: true, unit: true },
    take: 5
  });
  console.log('\n--- MẪU NGUYÊN LIỆU TRÊN DATABASE ---');
  console.table(sampleIngredients);

  const sampleInvoices = await prisma.inventoryTransaction.findMany({
    where: { type: 'IMPORT' },
    select: { referenceCode: true, supplier: true, productName: true, quantity: true, unitPrice: true, totalAmount: true },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log('\n--- MẪU PHIẾU NHẬP HÀNG TRÊN DATABASE ---');
  console.table(sampleInvoices);
}

main().catch(console.error).finally(() => prisma.$disconnect());
