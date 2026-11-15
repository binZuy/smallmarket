const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initialProducts = [
  { name: 'Móc treo quần áo nhôm to', sellingPrice: 55000, costPrice: 45000, stockQuantity: 20, minStockLevel: 5, category: 'Đồ gia dụng' },
  { name: 'Móc treo quần áo nhôm', sellingPrice: 45000, costPrice: 35000, stockQuantity: 30, minStockLevel: 5, category: 'Đồ gia dụng' },
  { name: 'Dép đi trong nhà', sellingPrice: 35000, costPrice: 20000, stockQuantity: 15, minStockLevel: 5, category: 'Đồ gia dụng' },
  { name: 'Cốc nhựa', sellingPrice: 15000, costPrice: 12000, stockQuantity: 50, minStockLevel: 10, category: 'Đồ gia dụng' },
  { name: 'Xô nhựa', sellingPrice: 35000, costPrice: 30000, stockQuantity: 15, minStockLevel: 5, category: 'Đồ gia dụng' },
  { name: 'Chậu nhựa to', sellingPrice: 45000, costPrice: 35000, stockQuantity: 15, minStockLevel: 5, category: 'Đồ gia dụng' },
  { name: 'Chậu nhựa nhỏ', sellingPrice: 30000, costPrice: 20000, stockQuantity: 20, minStockLevel: 5, category: 'Đồ gia dụng' },
  { name: 'Hót rác', sellingPrice: 15000, costPrice: 15000, stockQuantity: 10, minStockLevel: 3, category: 'Đồ gia dụng' },
  { name: 'Chổi Chít', sellingPrice: 35000, costPrice: 23000, stockQuantity: 12, minStockLevel: 3, category: 'Đồ gia dụng' },
  { name: 'Chổi lau', sellingPrice: 70000, costPrice: 45000, stockQuantity: 10, minStockLevel: 3, category: 'Đồ gia dụng' },
  { name: 'Quạt bé', sellingPrice: 230000, costPrice: 190000, stockQuantity: 8, minStockLevel: 2, category: 'Điện gia dụng' },
  { name: 'Quạt to', sellingPrice: 270000, costPrice: 230000, stockQuantity: 6, minStockLevel: 2, category: 'Điện gia dụng' },
  { name: 'Quạt Tản', sellingPrice: 300000, costPrice: 250000, stockQuantity: 5, minStockLevel: 2, category: 'Điện gia dụng' },
  { name: 'Bàn học', sellingPrice: 80000, costPrice: 60000, stockQuantity: 7, minStockLevel: 2, category: 'Nội thất' },
  { name: 'Gáo nước', sellingPrice: 15000, costPrice: 10000, stockQuantity: 25, minStockLevel: 5, category: 'Đồ gia dụng' },
  { name: 'Chiếu trúc', sellingPrice: 140000, costPrice: 100000, stockQuantity: 10, minStockLevel: 2, category: 'Phòng ngủ' },
  { name: 'Chiếu nhựa', sellingPrice: 450000, costPrice: 300000, stockQuantity: 5, minStockLevel: 2, category: 'Phòng ngủ' },
  { name: 'Chiếu điều hòa', sellingPrice: 100000, costPrice: 70000, stockQuantity: 12, minStockLevel: 3, category: 'Phòng ngủ' },
  { name: 'Chăn', sellingPrice: 110000, costPrice: 80000, stockQuantity: 10, minStockLevel: 2, category: 'Phòng ngủ' },
  { name: 'Màn tuyền', sellingPrice: 50000, costPrice: 30000, stockQuantity: 15, minStockLevel: 3, category: 'Phòng ngủ' },
  { name: 'Hòm tôn 60cm', sellingPrice: 230000, costPrice: 180000, stockQuantity: 6, minStockLevel: 2, category: 'Đồ gia dụng' },
  { name: 'Hòm tôn 70cm', sellingPrice: 250000, costPrice: 190000, stockQuantity: 6, minStockLevel: 2, category: 'Đồ gia dụng' },
];

const initialEmployees = [
  { name: 'Hiền Lương', hourlyRate: 25000, phone: '0981234567' },
  { name: 'Minh Châu', hourlyRate: 25000, phone: '0972345678' },
  { name: 'Phan Châu', hourlyRate: 25000, phone: '0963456789' },
  { name: 'T.Dương', hourlyRate: 25000, phone: '0914567890' },
];

async function main() {
  console.log('🌱 Adding initial products...');
  for (const p of initialProducts) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: p.name,
          sellingPrice: p.sellingPrice,
          costPrice: p.costPrice,
          unit: 'cái',
          stockQuantity: p.stockQuantity,
          minStockLevel: p.minStockLevel,
          category: p.category,
          isAvailable: true
        }
      });
      console.log(`+ Product: ${p.name}`);
    }
  }

  console.log('🌱 Adding initial employees...');
  for (const emp of initialEmployees) {
    const existing = await prisma.employee.findFirst({ where: { name: emp.name } });
    if (!existing) {
      await prisma.employee.create({
        data: {
          name: emp.name,
          hourlyRate: emp.hourlyRate,
          phone: emp.phone,
          active: true
        }
      });
      console.log(`+ Employee: ${emp.name}`);
    }
  }

  console.log('✅ Done initial seeding.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

