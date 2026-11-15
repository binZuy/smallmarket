const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function importRealInvoices() {
  console.log('🚀 Bắt đầu nhập dữ liệu từ 4 hóa đơn thực tế của cửa hàng...');

  // 1. HÓA ĐƠN 1: ĐẠI LÝ VŨ GIA - Số chứng từ 00075-1411260101 (Ngày 14/11/2026)
  // Tổng: 6,982,000 đ (50 thùng)
  const vuGiaBill1 = {
    supplier: 'Đại lý Vũ Gia (Yên Xá, Tân Triều, Hà Nội)',
    referenceCode: '00075-1411260101',
    date: new Date('2026-11-14T08:30:00Z'),
    paymentMethod: 'Chi tài khoản',
    totalAmount: 6982000,
    items: [
      { name: 'Aquafina 500ml', category: 'Nước giải khát', unit: 'chai', boxQty: 4, perBox: 24, boxCost: 93000, sellingPrice: 6000 },
      { name: 'Bí Đao Wonderfarm Lon 310ml', category: 'Nước giải khát', unit: 'lon', boxQty: 2, perBox: 24, boxCost: 152000, sellingPrice: 10000 },
      { name: 'C2 Trà Chanh 455ml', category: 'Nước giải khát', unit: 'chai', boxQty: 3, perBox: 24, boxCost: 185000, sellingPrice: 11000 },
      { name: 'C2 Trà Chanh Tuyết 455ml', category: 'Nước giải khát', unit: 'chai', boxQty: 3, perBox: 24, boxCost: 185000, sellingPrice: 11000 },
      { name: 'Cà Phê Highland lon 235ml', category: 'Nước giải khát', unit: 'lon', boxQty: 2, perBox: 24, boxCost: 280000, sellingPrice: 17000 },
      { name: 'Latte socola', category: 'Nước giải khát', unit: 'chai', boxQty: 2, perBox: 24, boxCost: 183000, sellingPrice: 12000 },
      { name: 'Lavie 500ml', category: 'Nước giải khát', unit: 'chai', boxQty: 4, perBox: 24, boxCost: 82000, sellingPrice: 6000 },
      { name: 'Lavie 5L', category: 'Nước giải khát', unit: 'bình', boxQty: 3, perBox: 4, boxCost: 99000, sellingPrice: 35000 },
      { name: 'Mì Kokomi Tôm chua cay 90g', category: 'Mì gói & Ăn liền', unit: 'gói', boxQty: 10, perBox: 30, boxCost: 118000, sellingPrice: 6000 },
      { name: 'Mì Ly Cung Đình Tôm chua cay', category: 'Mì gói & Ăn liền', unit: 'ly', boxQty: 1, perBox: 24, boxCost: 186000, sellingPrice: 12000 },
      { name: 'Mì Siukay Hải Sản', category: 'Mì gói & Ăn liền', unit: 'gói', boxQty: 1, perBox: 24, boxCost: 280000, sellingPrice: 16000 },
      { name: 'Nước Khoáng Number One', category: 'Nước giải khát', unit: 'chai', boxQty: 4, perBox: 24, boxCost: 44000, sellingPrice: 4000 },
      { name: 'Nước Me Wonderfarm Lon', category: 'Nước giải khát', unit: 'lon', boxQty: 1, perBox: 24, boxCost: 158000, sellingPrice: 10000 },
      { name: 'Nước Oshi Túi', category: 'Nước giải khát', unit: 'túi', boxQty: 3, perBox: 24, boxCost: 134000, sellingPrice: 9000 },
      { name: 'Revive Khoáng 500ml', category: 'Nước giải khát', unit: 'chai', boxQty: 3, perBox: 24, boxCost: 175000, sellingPrice: 11000 },
      { name: 'Sting Đỏ chai 330ml', category: 'Nước giải khát', unit: 'chai', boxQty: 1, perBox: 24, boxCost: 189000, sellingPrice: 12000 },
      { name: 'Trà xanh không độ 500ml', category: 'Nước giải khát', unit: 'chai', boxQty: 3, perBox: 24, boxCost: 183000, sellingPrice: 11000 },
    ]
  };

  // 2. HÓA ĐƠN 2: ĐẠI LÝ VŨ GIA - Số chứng từ 00076-1411260101 (Ngày 14/11/2026)
  // Tổng: 624,000 đ
  const vuGiaBill2 = {
    supplier: 'Đại lý Vũ Gia (Yên Xá, Tân Triều, Hà Nội)',
    referenceCode: '00076-1411260101',
    date: new Date('2026-11-14T08:45:00Z'),
    paymentMethod: 'Chi tiền mặt',
    totalAmount: 624000,
    items: [
      { name: 'Bánh que AKIKO', category: 'Bánh kẹo & Snack', unit: 'gói', boxQty: 9, perBox: 1, boxCost: 14000, sellingPrice: 20000 },
      { name: 'Bim bim Oishi 10K (6 bịch)', category: 'Bánh kẹo & Snack', unit: 'gói', boxQty: 1, perBox: 60, boxCost: 390000, sellingPrice: 10000 },
      { name: 'Kẹo hũ ngũ sắc', category: 'Bánh kẹo & Snack', unit: 'hũ', boxQty: 3, perBox: 1, boxCost: 36000, sellingPrice: 48000 },
    ]
  };

  // 3. HÓA ĐƠN 3: NPP TRANG CHIẾN - Tờ 1 (Ngày 14/11/2026)
  // Tổng: 2,668,000 đ (Chuyển khoản)
  const trangChienBill1 = {
    supplier: 'NPP Trang Chiến (Triều Khúc, Tân Triều, Thanh Trì, Hà Nội)',
    referenceCode: 'HD-TC-20261114-01',
    date: new Date('2026-11-14T11:00:00Z'),
    paymentMethod: 'Chi tài khoản',
    totalAmount: 2668000,
    items: [
      { name: 'Bánh que Ticky', category: 'Bánh kẹo & Snack', unit: 'hộp', boxQty: 3, perBox: 12, boxCost: 55000, sellingPrice: 7000 },
      { name: 'Bánh xốp Nabati', category: 'Bánh kẹo & Snack', unit: 'gói', boxQty: 1, perBox: 60, boxCost: 310000, sellingPrice: 7000 },
      { name: 'Thỏi sôcôla thanh', category: 'Bánh kẹo & Snack', unit: 'thỏi', boxQty: 7, perBox: 10, boxCost: 62000, sellingPrice: 9000 },
      { name: 'Kẹo mút Chupa Chups tô màu', category: 'Bánh kẹo & Snack', unit: 'que', boxQty: 2, perBox: 60, boxCost: 64000, sellingPrice: 2000 },
      { name: 'Xúc xích So Yummy tiệt trùng', category: 'Bánh kẹo & Snack', unit: 'cây', boxQty: 2, perBox: 50, boxCost: 205000, sellingPrice: 6000 },
      { name: 'Chân gà Bách Thảo cay đen', category: 'Bánh kẹo & Snack', unit: 'gói', boxQty: 3, perBox: 10, boxCost: 133000, sellingPrice: 18000 },
      { name: 'Đậu phộng da cá tỏi ớt', category: 'Bánh kẹo & Snack', unit: 'gói', boxQty: 1, perBox: 40, boxCost: 160000, sellingPrice: 6000 },
      { name: 'Xúc xích Frank đỏ', category: 'Bánh kẹo & Snack', unit: 'cây', boxQty: 1, perBox: 20, boxCost: 120000, sellingPrice: 9000 },
      { name: 'Xúc xích Frank vàng', category: 'Bánh kẹo & Snack', unit: 'cây', boxQty: 1, perBox: 20, boxCost: 102000, sellingPrice: 8000 },
      { name: 'Xúc xích Red bé', category: 'Bánh kẹo & Snack', unit: 'cây', boxQty: 1, perBox: 50, boxCost: 200000, sellingPrice: 5000 },
      { name: 'Xúc xích tiệt trùng S2', category: 'Bánh kẹo & Snack', unit: 'cây', boxQty: 1, perBox: 50, boxCost: 240000, sellingPrice: 6000 },
    ]
  };

  // 4. HÓA ĐƠN 4: NPP TRANG CHIẾN - Tờ 2 (Ngày 14/11/2026)
  // Tổng: 1,499,000 đ
  const trangChienBill2 = {
    supplier: 'NPP Trang Chiến (Triều Khúc, Tân Triều, Thanh Trì, Hà Nội)',
    referenceCode: 'HD-TC-20261114-02',
    date: new Date('2026-11-14T11:15:00Z'),
    paymentMethod: 'Chi tài khoản',
    totalAmount: 1499000,
    items: [
      { name: 'Thạch nước Oishi vị táo', category: 'Nước giải khát', unit: 'túi', boxQty: 1, perBox: 24, boxCost: 140000, sellingPrice: 8000 },
      { name: 'Bánh bơ cuộn giòn', category: 'Bánh kẹo & Snack', unit: 'hộp', boxQty: 5, perBox: 1, boxCost: 22000, sellingPrice: 30000 },
      { name: 'Xiên que vui vẻ', category: 'Bánh kẹo & Snack', unit: 'hộp', boxQty: 5, perBox: 1, boxCost: 25000, sellingPrice: 35000 },
      { name: 'Snack Long Thần', category: 'Bánh kẹo & Snack', unit: 'gói', boxQty: 20, perBox: 1, boxCost: 12000, sellingPrice: 16000 },
      { name: 'Kẹo dẻo 2+3N', category: 'Bánh kẹo & Snack', unit: 'gói', boxQty: 10, perBox: 1, boxCost: 20000, sellingPrice: 26000 },
      { name: 'Bánh bông lan cốc', category: 'Bánh kẹo & Snack', unit: 'hộp', boxQty: 2, perBox: 1, boxCost: 48000, sellingPrice: 60000 },
      { name: 'Kẹo ngậm Cool to', category: 'Bánh kẹo & Snack', unit: 'vỉ', boxQty: 1, perBox: 10, boxCost: 80000, sellingPrice: 12000 },
      { name: 'Mì que giòn ăn liền', category: 'Bánh kẹo & Snack', unit: 'gói', boxQty: 1, perBox: 30, boxCost: 80000, sellingPrice: 4000 },
      { name: 'Kẹo chip chip trái cây', category: 'Bánh kẹo & Snack', unit: 'gói', boxQty: 2, perBox: 10, boxCost: 64000, sellingPrice: 10000 },
      { name: 'Cơm cháy mắm hành', category: 'Bánh kẹo & Snack', unit: 'bịch', boxQty: 6, perBox: 1, boxCost: 50000, sellingPrice: 65000 },
    ]
  };

  const allBills = [vuGiaBill1, vuGiaBill2, trangChienBill1, trangChienBill2];

  for (const bill of allBills) {
    console.log(`\n📄 Đang xử lý hóa đơn [${bill.referenceCode}] từ ${bill.supplier}...`);

    for (const item of bill.items) {
      const totalUnits = item.boxQty * item.perBox;
      const unitCost = Math.round(item.boxCost / item.perBox);
      const totalCost = item.boxQty * item.boxCost;

      // 1. Upsert product
      let product = await prisma.product.findFirst({
        where: { name: item.name },
      });

      if (product) {
        product = await prisma.product.update({
          where: { id: product.id },
          data: {
            costPrice: unitCost,
            sellingPrice: item.sellingPrice,
            unit: item.unit,
            category: item.category,
            stockQuantity: {
              increment: totalUnits,
            },
            isAvailable: true,
          },
        });
      } else {
        product = await prisma.product.create({
          data: {
            name: item.name,
            costPrice: unitCost,
            sellingPrice: item.sellingPrice,
            unit: item.unit,
            category: item.category,
            stockQuantity: totalUnits,
            minStockLevel: Math.max(5, Math.round(totalUnits * 0.2)),
            isAvailable: true,
          },
        });
      }

      // 2. Create inventory import transaction
      await prisma.inventoryTransaction.create({
        data: {
          type: 'IMPORT',
          productId: product.id,
          productName: product.name,
          quantity: totalUnits,
          unitPrice: unitCost,
          totalAmount: totalCost,
          supplier: bill.supplier,
          referenceCode: bill.referenceCode,
          notes: `Nhập ${item.boxQty} thùng/hộp (${totalUnits} ${item.unit}) theo hóa đơn ${bill.referenceCode}`,
          createdAt: bill.date,
          updatedAt: bill.date,
        },
      });

      console.log(`  + [${item.name}]: Nhập ${totalUnits} ${item.unit} | Giá vốn: ${unitCost.toLocaleString()}đ | Giá bán: ${item.sellingPrice.toLocaleString()}đ`);
    }

    // 3. Create expense transaction in Sổ Quỹ
    await prisma.transaction.create({
      data: {
        date: bill.date,
        type: 'EXPENSE',
        category: bill.paymentMethod,
        amount: bill.totalAmount,
        notes: `Thanh toán tiền hàng [${bill.referenceCode}] - ${bill.supplier}`,
      },
    });
    console.log(`  💰 Đã ghi sổ quỹ chi: ${bill.totalAmount.toLocaleString('vi-VN')} đ (${bill.paymentMethod})`);
  }

  console.log('\n🎉 ĐÃ NHẬP TOÀN BỘ 4 HÓA ĐƠN THỰC TẾ VÀO HỆ THỐNG THÀNH CÔNG!');
}

importRealInvoices()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
