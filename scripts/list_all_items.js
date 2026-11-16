const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    orderBy: [
      { category: 'asc' },
      { name: 'asc' }
    ]
  });

  const txs = await prisma.inventoryTransaction.findMany({
    where: { type: 'IMPORT' },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`=== TỔNG CỘNG SẢN PHẨM TRONG DATABASE: ${products.length} ===`);
  console.log(`=== TỔNG CỘNG LỊCH SỬ PHIẾU NHẬP: ${txs.length} ===\n`);

  // Group by category
  const categories = {};
  for (const p of products) {
    const cat = p.category || 'Khác';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(p);
  }

  for (const [cat, items] of Object.entries(categories)) {
    console.log(`\n📂 DANH MỤC: ${cat.toUpperCase()} (${items.length} món)`);
    console.table(
      items.map((i, idx) => ({
        STT: idx + 1,
        'Tên Mặt Hàng': i.name,
        'ĐVT': i.unit,
        'Tồn Kho': i.stockQuantity,
        'Giá Nhập (VNĐ)': i.costPrice.toLocaleString('vi-VN'),
        'Giá Bán (VNĐ)': i.sellingPrice.toLocaleString('vi-VN'),
      }))
    );
  }

  // Summary by Invoice/Supplier
  console.log('\n📄 TỔNG HỢP CÁC ĐỢT PHIẾU NHẬP HÀNG:');
  const invoiceMap = {};
  for (const t of txs) {
    const code = t.referenceCode || 'Không có mã';
    if (!invoiceMap[code]) {
      invoiceMap[code] = {
        code,
        supplier: t.supplier,
        itemCount: 0,
        totalAmount: 0,
        date: t.createdAt.toISOString().slice(0, 10),
      };
    }
    invoiceMap[code].itemCount += 1;
    invoiceMap[code].totalAmount += t.totalAmount;
  }

  console.table(
    Object.values(invoiceMap).map((inv) => ({
      'Mã Phiếu': inv.code,
      'Nhà Cung Cấp': inv.supplier,
      'Số Mặt Hàng': inv.itemCount,
      'Tổng Tiền (VNĐ)': inv.totalAmount.toLocaleString('vi-VN'),
      'Ngày Nhập': inv.date,
    }))
  );
}

main().catch(console.error).finally(() => prisma.$disconnect());
