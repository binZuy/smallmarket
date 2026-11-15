const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const brewingIngredients = [
  {
    name: 'Đường cát trắng Biên Hòa (Túi 1kg)',
    category: 'Nguyên liệu pha chế',
    unit: 'túi (kg)',
    costPrice: 24000,
    sellingPrice: 28000,
    stockQuantity: 25,
    minStockLevel: 5,
    supplier: 'Đại lý Nguyên liệu Pha chế Hà Nội',
    invoiceCode: 'PN-NL-20261114-01',
    notes: 'Đường cát trắng dùng nấu nước đường pha chế trà sữa, cà phê, trà chanh'
  },
  {
    name: 'Bột béo B-One Thái Lan (Túi 1kg)',
    category: 'Nguyên liệu pha chế',
    unit: 'túi (kg)',
    costPrice: 65000,
    sellingPrice: 75000,
    stockQuantity: 15,
    minStockLevel: 3,
    supplier: 'Đại lý Nguyên liệu Pha chế Hà Nội',
    invoiceCode: 'PN-NL-20261114-01',
    notes: 'Bột kem béo thực vật chuyên dùng pha trà sữa truyền thống'
  },
  {
    name: 'Bột béo Kievit Vana Blanca (Túi 1kg)',
    category: 'Nguyên liệu pha chế',
    unit: 'túi (kg)',
    costPrice: 72000,
    sellingPrice: 85000,
    stockQuantity: 10,
    minStockLevel: 3,
    supplier: 'Đại lý Nguyên liệu Pha chế Hà Nội',
    invoiceCode: 'PN-NL-20261114-01',
    notes: 'Bột béo cao cấp Indonesia tạo độ ngậy thơm cho trà sữa'
  },
  {
    name: 'Trà đen Lộc Phát (Gói 1kg)',
    category: 'Nguyên liệu pha chế',
    unit: 'gói (kg)',
    costPrice: 140000,
    sellingPrice: 160000,
    stockQuantity: 8,
    minStockLevel: 2,
    supplier: 'Đại lý Nguyên liệu Pha chế Hà Nội',
    invoiceCode: 'PN-NL-20261114-01',
    notes: 'Hồng trà / Trà đen pha cốt trà sữa truyền thống đậm vị'
  },
  {
    name: 'Trà lài Lộc Phát (Gói 1kg)',
    category: 'Nguyên liệu pha chế',
    unit: 'gói (kg)',
    costPrice: 160000,
    sellingPrice: 185000,
    stockQuantity: 8,
    minStockLevel: 2,
    supplier: 'Đại lý Nguyên liệu Pha chế Hà Nội',
    invoiceCode: 'PN-NL-20261114-01',
    notes: 'Trà xanh hương hoa nhài/lài dùng pha trà trái cây, trà lài sữa'
  },
  {
    name: 'Sữa đặc Ngôi Sao Phương Nam xanh lá (Hộp 1.284kg)',
    category: 'Nguyên liệu pha chế',
    unit: 'hộp',
    costPrice: 62000,
    sellingPrice: 72000,
    stockQuantity: 12,
    minStockLevel: 3,
    supplier: 'Đại lý Nguyên liệu Pha chế Hà Nội',
    invoiceCode: 'PN-NL-20261114-01',
    notes: 'Sữa đặc chuyên dụng quầy cà phê sữa, trà sữa'
  },
  {
    name: 'Trân châu đen Gia Uy (Gói 1kg)',
    category: 'Nguyên liệu pha chế',
    unit: 'gói (kg)',
    costPrice: 38000,
    sellingPrice: 48000,
    stockQuantity: 15,
    minStockLevel: 4,
    supplier: 'Đại lý Nguyên liệu Pha chế Hà Nội',
    invoiceCode: 'PN-NL-20261114-01',
    notes: 'Topping trân châu đen dai giòn nấu chín ủ đường đen'
  },
  {
    name: 'Siro đào Dingfon (Chai 750ml)',
    category: 'Nguyên liệu pha chế',
    unit: 'chai',
    costPrice: 78000,
    sellingPrice: 95000,
    stockQuantity: 6,
    minStockLevel: 2,
    supplier: 'Đại lý Nguyên liệu Pha chế Hà Nội',
    invoiceCode: 'PN-NL-20261114-01',
    notes: 'Siro đào pha trà đào cam sả'
  },
  {
    name: 'Ly nhựa PP 500ml (Cây 50 cái)',
    category: 'Vật tư quầy pha chế',
    unit: 'cây (50 cái)',
    costPrice: 35000,
    sellingPrice: 45000,
    stockQuantity: 20,
    minStockLevel: 5,
    supplier: 'Xưởng Bao bì Nhựa Thành Đạt',
    invoiceCode: 'PN-VT-20261114-01',
    notes: 'Ly đựng trà sữa, nước ép mang đi'
  },
  {
    name: 'Ống hút trà sữa bọc màng (Gói 500g)',
    category: 'Vật tư quầy pha chế',
    unit: 'gói',
    costPrice: 28000,
    sellingPrice: 38000,
    stockQuantity: 15,
    minStockLevel: 3,
    supplier: 'Xưởng Bao bì Nhựa Thành Đạt',
    invoiceCode: 'PN-VT-20261114-01',
    notes: 'Ống hút phi 12 hút trân châu vệ sinh'
  }
];

async function addBrewingIngredients() {
  console.log('🍵 Bắt đầu nạp nguyên liệu pha chế (đường, bột béo, trà đen, trà lài...)...');

  let totalAmount = 0;
  for (const item of brewingIngredients) {
    const itemTotal = item.stockQuantity * item.costPrice;
    totalAmount += itemTotal;

    // 1. Upsert product
    let product = await prisma.product.findFirst({
      where: { name: item.name },
    });

    if (product) {
      product = await prisma.product.update({
        where: { id: product.id },
        data: {
          category: item.category,
          unit: item.unit,
          costPrice: item.costPrice,
          sellingPrice: item.sellingPrice,
          stockQuantity: item.stockQuantity,
          minStockLevel: item.minStockLevel,
          isAvailable: true,
        },
      });
    } else {
      product = await prisma.product.create({
        data: {
          name: item.name,
          category: item.category,
          unit: item.unit,
          costPrice: item.costPrice,
          sellingPrice: item.sellingPrice,
          stockQuantity: item.stockQuantity,
          minStockLevel: item.minStockLevel,
          isAvailable: true,
        },
      });
    }

    // 2. Create inventory transaction
    await prisma.inventoryTransaction.create({
      data: {
        type: 'IMPORT',
        productId: product.id,
        productName: product.name,
        quantity: item.stockQuantity,
        unitPrice: item.costPrice,
        totalAmount: itemTotal,
        supplier: item.supplier,
        referenceCode: item.invoiceCode,
        notes: item.notes,
        createdAt: new Date('2026-11-14T09:00:00Z'),
        updatedAt: new Date('2026-11-14T09:00:00Z'),
      },
    });

    console.log(`  + [${item.name}]: Tồn ${item.stockQuantity} ${item.unit} | Giá vốn: ${item.costPrice.toLocaleString()}đ/đơn vị`);
  }

  // 3. Record expense in Sổ Quỹ
  await prisma.transaction.create({
    data: {
      date: new Date('2026-11-14T09:00:00Z'),
      type: 'EXPENSE',
      category: 'Chi tài khoản',
      amount: totalAmount,
      notes: `Nhập nguyên vật liệu pha chế (Đường, bột béo, trà đen, trà lài, bao bì)`,
    },
  });
  console.log(`💰 Đã ghi sổ quỹ chi nguyên liệu: ${totalAmount.toLocaleString('vi-VN')} đ`);
  console.log('🎉 Hoàn thành nạp nguyên liệu pha chế thành công!');
}

addBrewingIngredients()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
