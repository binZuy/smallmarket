const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Comprehensive Convenience Store Catalog
const storeProducts = [
  // 1. Nước Giải Khát & Đồ Uống
  { name: 'Coca-Cola 320ml (Lon)', category: 'Nước giải khát', unit: 'lon', costPrice: 7500, sellingPrice: 11000, stockQuantity: 96, minStockLevel: 24 },
  { name: 'Pepsi Không Calo 320ml (Lon)', category: 'Nước giải khát', unit: 'lon', costPrice: 7500, sellingPrice: 11000, stockQuantity: 72, minStockLevel: 24 },
  { name: 'Nước suối Lavie 500ml (Chai)', category: 'Nước giải khát', unit: 'chai', costPrice: 3500, sellingPrice: 6000, stockQuantity: 120, minStockLevel: 30 },
  { name: 'Nước suối Aquafina 500ml (Chai)', category: 'Nước giải khát', unit: 'chai', costPrice: 3500, sellingPrice: 6000, stockQuantity: 90, minStockLevel: 25 },
  { name: 'Bò Húc Redbull 250ml (Lon)', category: 'Nước giải khát', unit: 'lon', costPrice: 11000, sellingPrice: 15000, stockQuantity: 65, minStockLevel: 20 },
  { name: 'Trà xanh C2 360ml (Chai)', category: 'Nước giải khát', unit: 'chai', costPrice: 6000, sellingPrice: 9000, stockQuantity: 80, minStockLevel: 20 },
  { name: 'Trà Oolong Tea+ 455ml (Chai)', category: 'Nước giải khát', unit: 'chai', costPrice: 7500, sellingPrice: 11000, stockQuantity: 75, minStockLevel: 20 },
  { name: 'Sữa tươi Vinamilk có đường 180ml', category: 'Sữa & Bổ dưỡng', unit: 'hộp', costPrice: 6500, sellingPrice: 9000, stockQuantity: 48, minStockLevel: 16 },
  { name: 'Sữa chua uống Susu 110ml', category: 'Sữa & Bổ dưỡng', unit: 'chai', costPrice: 4500, sellingPrice: 7000, stockQuantity: 40, minStockLevel: 15 },
  { name: 'Cà phê lon Highlands sữa 235ml', category: 'Nước giải khát', unit: 'lon', costPrice: 13000, sellingPrice: 18000, stockQuantity: 45, minStockLevel: 15 },
  { name: 'Bia Heineken bạc 330ml (Lon)', category: 'Bia & Rượu', unit: 'lon', costPrice: 17500, sellingPrice: 23000, stockQuantity: 48, minStockLevel: 12 },
  { name: 'Bia Tiger nâu 330ml (Lon)', category: 'Bia & Rượu', unit: 'lon', costPrice: 14500, sellingPrice: 19000, stockQuantity: 48, minStockLevel: 12 },

  // 2. Mì Gói & Đồ Ăn Vặt, Bánh Kẹo
  { name: 'Mì Hảo Hảo chua cay (Gói)', category: 'Mì gói & Ăn liền', unit: 'gói', costPrice: 3400, sellingPrice: 5000, stockQuantity: 150, minStockLevel: 30 },
  { name: 'Mì Omachi sườn hầm ngũ quả (Gói)', category: 'Mì gói & Ăn liền', unit: 'gói', costPrice: 6800, sellingPrice: 9000, stockQuantity: 85, minStockLevel: 20 },
  { name: 'Mì ly Modern bò hầm 65g', category: 'Mì gói & Ăn liền', unit: 'ly', costPrice: 8000, sellingPrice: 12000, stockQuantity: 45, minStockLevel: 15 },
  { name: 'Mì cay Samyang gà cay phô mai', category: 'Mì gói & Ăn liền', unit: 'gói', costPrice: 22000, sellingPrice: 30000, stockQuantity: 30, minStockLevel: 10 },
  { name: 'Snack khoai tây Lay\'s 56g', category: 'Bánh kẹo & Snack', unit: 'gói', costPrice: 11000, sellingPrice: 15000, stockQuantity: 40, minStockLevel: 12 },
  { name: 'Snack Oishi tôm cay 40g', category: 'Bánh kẹo & Snack', unit: 'gói', costPrice: 4500, sellingPrice: 7000, stockQuantity: 60, minStockLevel: 15 },
  { name: 'Bánh Chocopie hộp 2 cái', category: 'Bánh kẹo & Snack', unit: 'hộp', costPrice: 8500, sellingPrice: 12000, stockQuantity: 35, minStockLevel: 10 },
  { name: 'Xúc xích tiệt trùng Vissan 40g', category: 'Bánh kẹo & Snack', unit: 'cây', costPrice: 4000, sellingPrice: 6000, stockQuantity: 120, minStockLevel: 30 },
  { name: 'Kẹo cao su Cool Air vỉ', category: 'Bánh kẹo & Snack', unit: 'vỉ', costPrice: 5000, sellingPrice: 7000, stockQuantity: 30, minStockLevel: 10 },
  { name: 'Kem ốc quế Merino socola', category: 'Kem & Đông lạnh', unit: 'cây', costPrice: 12000, sellingPrice: 16000, stockQuantity: 25, minStockLevel: 8 },

  // 3. Nguyên Liệu Thực Phẩm / Chế Biến Quầy
  { name: 'Bánh mì tươi ăn liền', category: 'Nguyên liệu & Thực phẩm', unit: 'ổ', costPrice: 2500, sellingPrice: 5000, stockQuantity: 30, minStockLevel: 10 },
  { name: 'Trứng gà công nghiệp', category: 'Nguyên liệu & Thực phẩm', unit: 'quả', costPrice: 2200, sellingPrice: 3500, stockQuantity: 60, minStockLevel: 20 },
  { name: 'Bún tươi', category: 'Nguyên liệu & Thực phẩm', unit: 'kg', costPrice: 12000, sellingPrice: 18000, stockQuantity: 10, minStockLevel: 3 },
  { name: 'Dầu ăn Simply 1L', category: 'Nguyên liệu & Thực phẩm', unit: 'chai', costPrice: 45000, sellingPrice: 56000, stockQuantity: 15, minStockLevel: 5 },
  { name: 'Xúc xích hồ lô nướng (Gói 500g)', category: 'Nguyên liệu & Thực phẩm', unit: 'gói', costPrice: 55000, sellingPrice: 75000, stockQuantity: 12, minStockLevel: 4 },
  { name: 'Cà phê hạt pha phin (Gói 500g)', category: 'Nguyên liệu & Thực phẩm', unit: 'gói', costPrice: 75000, sellingPrice: 110000, stockQuantity: 8, minStockLevel: 3 },
  { name: 'Tương ớt Cholimex 270g', category: 'Nguyên liệu & Thực phẩm', unit: 'chai', costPrice: 10000, sellingPrice: 14000, stockQuantity: 20, minStockLevel: 5 },

  // 4. Tiện Ích Cá Nhân & Sinh Hoạt
  { name: 'Khăn giấy gấu trúc Sipiao', category: 'Đồ tiện ích cá nhân', unit: 'gói', costPrice: 4000, sellingPrice: 7000, stockQuantity: 60, minStockLevel: 15 },
  { name: 'Bàn chải đánh răng Colgate', category: 'Đồ tiện ích cá nhân', unit: 'cái', costPrice: 12000, sellingPrice: 18000, stockQuantity: 25, minStockLevel: 8 },
  { name: 'Kem đánh răng Closeup 180g', category: 'Đồ tiện ích cá nhân', unit: 'tuýp', costPrice: 32000, sellingPrice: 42000, stockQuantity: 18, minStockLevel: 5 },
  { name: 'Khẩu trang y tế 4 lớp (Túi 10 cái)', category: 'Đồ tiện ích cá nhân', unit: 'túi', costPrice: 6000, sellingPrice: 10000, stockQuantity: 40, minStockLevel: 10 },
  { name: 'Áo mưa tiện lợi 1 lần', category: 'Đồ tiện ích cá nhân', unit: 'cái', costPrice: 4000, sellingPrice: 8000, stockQuantity: 50, minStockLevel: 15 },
  { name: 'Bật lửa Hoa Việt', category: 'Đồ tiện ích cá nhân', unit: 'cái', costPrice: 3000, sellingPrice: 5000, stockQuantity: 60, minStockLevel: 15 },
  { name: 'Băng keo trong bản nhỏ', category: 'Văn phòng phẩm', unit: 'cuộn', costPrice: 5000, sellingPrice: 8000, stockQuantity: 20, minStockLevel: 5 },

  // 5. Đồ Gia Dụng Tiện Ích (Đã có sẵn trong cửa hàng)
  { name: 'Móc treo quần áo nhôm to', category: 'Đồ gia dụng', unit: 'cái', costPrice: 45000, sellingPrice: 55000, stockQuantity: 25, minStockLevel: 5 },
  { name: 'Móc treo quần áo nhôm', category: 'Đồ gia dụng', unit: 'cái', costPrice: 35000, sellingPrice: 45000, stockQuantity: 35, minStockLevel: 5 },
  { name: 'Dép đi trong nhà', category: 'Đồ gia dụng', unit: 'đôi', costPrice: 20000, sellingPrice: 35000, stockQuantity: 18, minStockLevel: 5 },
  { name: 'Cốc nhựa', category: 'Đồ gia dụng', unit: 'cái', costPrice: 12000, sellingPrice: 15000, stockQuantity: 50, minStockLevel: 10 },
  { name: 'Xô nhựa', category: 'Đồ gia dụng', unit: 'cái', costPrice: 30000, sellingPrice: 35000, stockQuantity: 15, minStockLevel: 5 },
  { name: 'Chậu nhựa to', category: 'Đồ gia dụng', unit: 'cái', costPrice: 35000, sellingPrice: 45000, stockQuantity: 15, minStockLevel: 5 },
  { name: 'Quạt bé', category: 'Điện gia dụng', unit: 'cái', costPrice: 190000, sellingPrice: 230000, stockQuantity: 8, minStockLevel: 2 },
  { name: 'Bàn học sinh gấp gọn', category: 'Nội thất tiện ích', unit: 'cái', costPrice: 60000, sellingPrice: 80000, stockQuantity: 10, minStockLevel: 3 },
  { name: 'Chiếu điều hòa', category: 'Phòng ngủ', unit: 'chiếc', costPrice: 70000, sellingPrice: 100000, stockQuantity: 12, minStockLevel: 3 },
];

async function seedConvenienceStore() {
  console.log('🌱 Bắt đầu nạp dữ liệu cửa hàng tiện ích...');

  // 1. Upsert/Update Products
  console.log(`📦 Đồng bộ ${storeProducts.length} mặt hàng tiện ích...`);
  const productDbMap = new Map();

  for (const item of storeProducts) {
    let p = await prisma.product.findFirst({
      where: { name: item.name },
    });

    if (p) {
      p = await prisma.product.update({
        where: { id: p.id },
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
      p = await prisma.product.create({
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
    productDbMap.set(p.name, p);
  }
  console.log('✅ Đã cập nhật toàn bộ sản phẩm và số lượng tồn kho.');

  // 2. Tạo các Hóa đơn nhập hàng hàng tháng (Inventory Import Transactions)
  console.log('📝 Tạo các đợt phiếu nhập hàng hàng tháng...');
  
  // Xóa inventory_transactions cũ nếu chưa có liên kết chặt chẽ để seed sạch sẽ
  await prisma.inventoryTransaction.deleteMany();

  const importBatches = [
    {
      code: 'PN-202610-01',
      date: new Date('2026-10-05T09:30:00Z'),
      supplier: 'Đại lý Nước ngọt Minh Khang',
      notes: 'Nhập nước giải khát, bia, sữa đầu tháng 10',
      recordExpenseMethod: 'Chi tài khoản',
      items: [
        { name: 'Coca-Cola 320ml (Lon)', qty: 120, price: 7500 },
        { name: 'Pepsi Không Calo 320ml (Lon)', qty: 72, price: 7500 },
        { name: 'Nước suối Lavie 500ml (Chai)', qty: 150, price: 3500 },
        { name: 'Bò Húc Redbull 250ml (Lon)', qty: 72, price: 11000 },
        { name: 'Trà Oolong Tea+ 455ml (Chai)', qty: 72, price: 7500 },
        { name: 'Sữa tươi Vinamilk có đường 180ml', qty: 96, price: 6500 },
        { name: 'Bia Heineken bạc 330ml (Lon)', qty: 48, price: 17500 },
      ],
    },
    {
      code: 'PN-202610-02',
      date: new Date('2026-10-10T14:15:00Z'),
      supplier: 'Công ty Phân phối Thực phẩm Hưng Thịnh',
      notes: 'Nhập bánh kẹo, mì gói, xúc xích và đồ ăn vặt',
      recordExpenseMethod: 'Chi tiền mặt',
      items: [
        { name: 'Mì Hảo Hảo chua cay (Gói)', qty: 200, price: 3400 },
        { name: 'Mì Omachi sườn hầm ngũ quả (Gói)', qty: 100, price: 6800 },
        { name: 'Mì ly Modern bò hầm 65g', qty: 60, price: 8000 },
        { name: 'Snack khoai tây Lay\'s 56g', qty: 50, price: 11000 },
        { name: 'Snack Oishi tôm cay 40g', qty: 80, price: 4500 },
        { name: 'Xúc xích tiệt trùng Vissan 40g', qty: 150, price: 4000 },
        { name: 'Bánh Chocopie hộp 2 cái', qty: 50, price: 8500 },
      ],
    },
    {
      code: 'PN-202610-03',
      date: new Date('2026-10-15T08:00:00Z'),
      supplier: 'Kho Thực phẩm Sỉ Á Châu',
      notes: 'Nhập nguyên liệu quầy: Bún, dầu ăn, trứng, xúc xích tươi nướng',
      recordExpenseMethod: 'Chi tiền mặt',
      items: [
        { name: 'Bún tươi', qty: 25, price: 12000 },
        { name: 'Trứng gà công nghiệp', qty: 100, price: 2200 },
        { name: 'Dầu ăn Simply 1L', qty: 20, price: 45000 },
        { name: 'Xúc xích hồ lô nướng (Gói 500g)', qty: 20, price: 55000 },
        { name: 'Tương ớt Cholimex 270g', qty: 30, price: 10000 },
      ],
    },
    {
      code: 'PN-202611-01',
      date: new Date('2026-11-02T10:00:00Z'),
      supplier: 'Tổng kho Tiêu dùng Miền Nam',
      notes: 'Đợt nhập đầu tháng 11: Khăn giấy, khẩu trang, áo mưa, đồ cá nhân',
      recordExpenseMethod: 'Chi tài khoản',
      items: [
        { name: 'Khăn giấy gấu trúc Sipiao', qty: 80, price: 4000 },
        { name: 'Bàn chải đánh răng Colgate', qty: 30, price: 12000 },
        { name: 'Kem đánh răng Closeup 180g', qty: 20, price: 32000 },
        { name: 'Khẩu trang y tế 4 lớp (Túi 10 cái)', qty: 50, price: 6000 },
        { name: 'Áo mưa tiện lợi 1 lần', qty: 60, price: 4000 },
        { name: 'Bật lửa Hoa Việt', qty: 80, price: 3000 },
      ],
    },
    {
      code: 'PN-202611-02',
      date: new Date('2026-11-10T11:20:00Z'),
      supplier: 'Đại lý Nước ngọt Minh Khang',
      notes: 'Bổ sung nước ngọt, cà phê lon & mì gói giữa tháng 11',
      recordExpenseMethod: 'Chi tài khoản',
      items: [
        { name: 'Coca-Cola 320ml (Lon)', qty: 96, price: 7500 },
        { name: 'Nước suối Lavie 500ml (Chai)', qty: 96, price: 3500 },
        { name: 'Cà phê lon Highlands sữa 235ml', qty: 48, price: 13000 },
        { name: 'Mì Hảo Hảo chua cay (Gói)', qty: 100, price: 3400 },
        { name: 'Kem ốc quế Merino socola', qty: 30, price: 12000 },
      ],
    },
  ];

  for (const batch of importBatches) {
    let batchTotal = 0;
    for (const item of batch.items) {
      const p = productDbMap.get(item.name);
      const totalAmount = item.qty * item.price;
      batchTotal += totalAmount;

      await prisma.inventoryTransaction.create({
        data: {
          type: 'IMPORT',
          productId: p ? p.id : null,
          productName: item.name,
          quantity: item.qty,
          unitPrice: item.price,
          totalAmount: totalAmount,
          supplier: batch.supplier,
          referenceCode: batch.code,
          notes: batch.notes,
          createdAt: batch.date,
          updatedAt: batch.date,
        },
      });
    }

    // Ghi nhận vào Sổ Quỹ (Chi phí nhập hàng)
    await prisma.transaction.create({
      data: {
        date: batch.date,
        type: 'EXPENSE',
        category: batch.recordExpenseMethod,
        amount: batchTotal,
        notes: `Nhập hàng theo [${batch.code}] - ${batch.supplier}`,
      },
    });
  }
  console.log('✅ Đã tạo các phiếu nhập hàng và giao dịch chi sổ quỹ tương ứng.');

  // 3. Tạo một số phiếu xuất hủy hư hỏng (DAMAGE) mẫu
  const damageItems = [
    { name: 'Kem ốc quế Merino socola', qty: 2, reason: 'Tủ đông bị ngắt điện nửa đêm làm tan kem' },
    { name: 'Mì Hảo Hảo chua cay (Gói)', qty: 3, reason: 'Gói mì bị chuột cắn rách bao bì' },
    { name: 'Bánh mì tươi ăn liền', qty: 4, reason: 'Quá hạn sử dụng sau 2 ngày' },
  ];

  for (const d of damageItems) {
    const p = productDbMap.get(d.name);
    if (p) {
      await prisma.inventoryTransaction.create({
        data: {
          type: 'DAMAGE',
          productId: p.id,
          productName: p.name,
          quantity: d.qty,
          unitPrice: p.costPrice,
          totalAmount: d.qty * p.costPrice,
          referenceCode: `PX-HH-${Date.now().toString().slice(-4)}`,
          notes: d.reason,
          createdAt: new Date('2026-11-12T16:00:00Z'),
          updatedAt: new Date('2026-11-12T16:00:00Z'),
        },
      });
    }
  }
  console.log('✅ Đã tạo các phiếu xuất hủy hao hụt kiểm kê.');

  // 4. Tạo các đơn hàng bán lẻ mẫu (Orders & Order Items)
  console.log('🛒 Tạo dữ liệu các đơn hàng bán lẻ mẫu để hiển thị doanh thu...');
  
  // Xóa đơn cũ nếu cần
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  const sampleOrders = [
    {
      code: 'HD-20261114-101',
      date: new Date('2026-11-14T08:15:00Z'),
      notes: 'Khách mua ăn sáng',
      items: [
        { name: 'Bánh mì tươi ăn liền', qty: 2 },
        { name: 'Xúc xích tiệt trùng Vissan 40g', qty: 2 },
        { name: 'Coca-Cola 320ml (Lon)', qty: 1 },
      ],
    },
    {
      code: 'HD-20261114-102',
      date: new Date('2026-11-14T11:45:00Z'),
      notes: 'Khách trưa',
      items: [
        { name: 'Mì ly Modern bò hầm 65g', qty: 2 },
        { name: 'Trà xanh C2 360ml (Chai)', qty: 2 },
        { name: 'Snack khoai tây Lay\'s 56g', qty: 1 },
      ],
    },
    {
      code: 'HD-20261114-103',
      date: new Date('2026-11-14T15:20:00Z'),
      notes: 'Đồ dùng cá nhân',
      items: [
        { name: 'Khăn giấy gấu trúc Sipiao', qty: 3 },
        { name: 'Nước suối Lavie 500ml (Chai)', qty: 2 },
        { name: 'Kẹo cao su Cool Air vỉ', qty: 2 },
      ],
    },
    {
      code: 'HD-20261114-104',
      date: new Date('2026-11-14T19:30:00Z'),
      notes: 'Khách mua buổi tối',
      items: [
        { name: 'Bia Heineken bạc 330ml (Lon)', qty: 6 },
        { name: 'Snack Oishi tôm cay 40g', qty: 3 },
        { name: 'Xúc xích hồ lô nướng (Gói 500g)', qty: 1 },
      ],
    },
    {
      code: 'HD-20261115-201',
      date: new Date('2026-11-15T07:45:00Z'),
      notes: 'Mua đồ ăn sáng',
      items: [
        { name: 'Bánh mì tươi ăn liền', qty: 3 },
        { name: 'Trứng gà công nghiệp', qty: 4 },
        { name: 'Sữa tươi Vinamilk có đường 180ml', qty: 2 },
        { name: 'Cà phê lon Highlands sữa 235ml', qty: 1 },
      ],
    },
    {
      code: 'HD-20261115-202',
      date: new Date('2026-11-15T10:10:00Z'),
      notes: 'Khách mua đồ dùng',
      items: [
        { name: 'Bàn chải đánh răng Colgate', qty: 1 },
        { name: 'Kem đánh răng Closeup 180g', qty: 1 },
        { name: 'Khẩu trang y tế 4 lớp (Túi 10 cái)', qty: 2 },
      ],
    },
    {
      code: 'HD-20261115-203',
      date: new Date('2026-11-15T13:30:00Z'),
      notes: 'Đồ ăn trưa & giải khát',
      items: [
        { name: 'Mì Omachi sườn hầm ngũ quả (Gói)', qty: 3 },
        { name: 'Bò Húc Redbull 250ml (Lon)', qty: 2 },
        { name: 'Bánh Chocopie hộp 2 cái', qty: 2 },
      ],
    },
    {
      code: 'HD-20261115-204',
      date: new Date('2026-11-15T16:50:00Z'),
      notes: 'Khách đi mưa',
      items: [
        { name: 'Áo mưa tiện lợi 1 lần', qty: 3 },
        { name: 'Khăn giấy gấu trúc Sipiao', qty: 2 },
        { name: 'Bật lửa Hoa Việt', qty: 1 },
      ],
    },
  ];

  for (const o of sampleOrders) {
    let orderSellingTotal = 0;
    let orderCostTotal = 0;

    const formattedItems = [];
    for (const item of o.items) {
      const p = productDbMap.get(item.name);
      const costPrice = p ? p.costPrice : 0;
      const sellingPrice = p ? p.sellingPrice : 0;
      const qty = item.qty;

      orderSellingTotal += sellingPrice * qty;
      orderCostTotal += costPrice * qty;

      formattedItems.push({
        productId: p ? p.id : null,
        productName: item.name,
        costPrice,
        sellingPrice,
        quantity: qty,
      });

      // Tạo nhật ký xuất bán (EXPORT)
      await prisma.inventoryTransaction.create({
        data: {
          type: 'EXPORT',
          productId: p ? p.id : null,
          productName: item.name,
          quantity: qty,
          unitPrice: sellingPrice,
          totalAmount: sellingPrice * qty,
          referenceCode: o.code,
          notes: `Bán lẻ - Đơn #${o.code}`,
          createdAt: o.date,
          updatedAt: o.date,
        },
      });
    }

    const profit = orderSellingTotal - orderCostTotal;

    await prisma.order.create({
      data: {
        orderCode: o.code,
        totalSellingPrice: orderSellingTotal,
        totalCostPrice: orderCostTotal,
        profit: profit,
        notes: o.notes,
        createdAt: o.date,
        items: {
          create: formattedItems,
        },
      },
    });
  }
  console.log('✅ Đã tạo các đơn bán lẻ và đồng bộ xuất bán kho.');

  // 5. Thêm chi phí vận hành cửa hàng tháng 10 & tháng 11 vào Sổ Quỹ
  const operatingExpenses = [
    { date: new Date('2026-10-01T08:00:00Z'), category: 'Chi tài khoản', amount: 8000000, notes: 'Tiền thuê mặt bằng cửa hàng tháng 10' },
    { date: new Date('2026-10-15T09:00:00Z'), category: 'Chi tài khoản', amount: 1250000, notes: 'Tiền điện sinh hoạt & tủ đông tháng 10' },
    { date: new Date('2026-10-15T09:30:00Z'), category: 'Chi tiền mặt', amount: 250000, notes: 'Tiền nước sinh hoạt tháng 10' },
    { date: new Date('2026-10-05T10:00:00Z'), category: 'Chi tài khoản', amount: 330000, notes: 'Cước Internet cáp quang Viettel tháng 10' },
    { date: new Date('2026-11-01T08:00:00Z'), category: 'Chi tài khoản', amount: 8000000, notes: 'Tiền thuê mặt bằng cửa hàng tháng 11' },
    { date: new Date('2026-11-12T09:00:00Z'), category: 'Chi tài khoản', amount: 1180000, notes: 'Tiền điện kinh doanh tháng 11' },
    { date: new Date('2026-11-05T10:00:00Z'), category: 'Chi tài khoản', amount: 330000, notes: 'Cước Internet cáp quang Viettel tháng 11' },
  ];

  for (const exp of operatingExpenses) {
    await prisma.transaction.create({
      data: {
        date: exp.date,
        type: 'EXPENSE',
        category: exp.category,
        amount: exp.amount,
        notes: exp.notes,
      },
    });
  }
  console.log('✅ Đã tạo các khoản chi phí vận hành cửa hàng.');

  console.log('🎉 Hoàn thành seed toàn bộ dữ liệu cửa hàng tiện ích thành công!');
}

seedConvenienceStore()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
