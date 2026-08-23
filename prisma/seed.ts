import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List without "Khóa hòm" as requested by user
const initialProducts = [
  { name: 'Móc treo quần áo nhôm to', sellingPrice: 55000, costPrice: 45000 },
  { name: 'Móc treo quần áo nhôm', sellingPrice: 45000, costPrice: 35000 },
  { name: 'Dép đi trong nhà', sellingPrice: 0, costPrice: 0 },
  { name: 'Cốc nhựa', sellingPrice: 15000, costPrice: 12000 },
  { name: 'Xô nhựa', sellingPrice: 35000, costPrice: 30000 },
  { name: 'Chậu nhựa to', sellingPrice: 45000, costPrice: 35000 },
  { name: 'Chậu nhựa nhỏ', sellingPrice: 30000, costPrice: 20000 },
  { name: 'Hót rác', sellingPrice: 15000, costPrice: 15000 },
  { name: 'Chổi Chít', sellingPrice: 35000, costPrice: 23000 },
  { name: 'Chổi lau', sellingPrice: 70000, costPrice: 45000 },
  { name: 'Quạt bé', sellingPrice: 230000, costPrice: 190000 },
  { name: 'Quạt to', sellingPrice: 270000, costPrice: 230000 },
  { name: 'Quạt Tản', sellingPrice: 300000, costPrice: 250000 },
  { name: 'Bàn học', sellingPrice: 80000, costPrice: 60000 },
  { name: 'Gáo nước', sellingPrice: 15000, costPrice: 10000 },
  { name: 'Chiếu trúc', sellingPrice: 140000, costPrice: 100000 },
  { name: 'Chiếu nhựa', sellingPrice: 450000, costPrice: 300000 },
  { name: 'Chiếu điều hòa', sellingPrice: 100000, costPrice: 70000 },
  { name: 'Chăn', sellingPrice: 110000, costPrice: 80000 },
  { name: 'Màn tuyền', sellingPrice: 50000, costPrice: 30000 },
  { name: 'Hòm tôn 60cm', sellingPrice: 230000, costPrice: 180000 },
  { name: 'Hòm tôn 70cm', sellingPrice: 250000, costPrice: 190000 },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Remove "Khóa hòm" if it exists in database
  await prisma.product.deleteMany({
    where: { name: { contains: 'Khóa hòm', mode: 'insensitive' } }
  });

  for (const product of initialProducts) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name }
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          name: product.name,
          sellingPrice: product.sellingPrice,
          costPrice: product.costPrice,
          unit: 'cái',
          isAvailable: true
        }
      });
      console.log(`✅ Added product: ${product.name}`);
    }
  }

  console.log('🎉 Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
