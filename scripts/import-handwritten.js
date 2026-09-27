const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const transactions = [
    // Image 2 - August
    { date: '2026-08-10', type: 'INCOME', category: 'Tiền mặt', amount: 500000, notes: 'TM' },
    { date: '2026-08-10', type: 'INCOME', category: 'Chuyển khoản', amount: 1070000, notes: 'TK' },
    { date: '2026-08-10', type: 'EXPENSE', category: 'Chi khác', amount: 1570000, notes: 'Tổng chi' },

    { date: '2026-08-11', type: 'INCOME', category: 'Tiền mặt', amount: 611000, notes: 'TM' },
    { date: '2026-08-11', type: 'INCOME', category: 'Chuyển khoản', amount: 2211000, notes: 'CK' },
    { date: '2026-08-11', type: 'EXPENSE', category: 'Chi khác', amount: 1252000, notes: 'Tổng chi' },

    { date: '2026-08-12', type: 'EXPENSE', category: 'Nguyên liệu', amount: 500000, notes: 'Bún' },
    { date: '2026-08-12', type: 'EXPENSE', category: 'Nguyên liệu', amount: 260000, notes: 'Dầu ăn' },
    { date: '2026-08-12', type: 'EXPENSE', category: 'Nguyên liệu', amount: 200000, notes: 'Xúc xích' },
    { date: '2026-08-12', type: 'INCOME', category: 'Tiền mặt', amount: 2736000, notes: 'TM' },

    { date: '2026-08-13', type: 'EXPENSE', category: 'Nguyên liệu', amount: 1035000, notes: 'Các loại' },
    { date: '2026-08-13', type: 'INCOME', category: 'Tiền mặt', amount: 1412000, notes: 'TM' },
    { date: '2026-08-13', type: 'INCOME', category: 'Chuyển khoản', amount: 2668000, notes: 'TK' },

    { date: '2026-08-14', type: 'EXPENSE', category: 'Nguyên liệu', amount: 262000, notes: 'Rau, đậu...' },
    { date: '2026-08-14', type: 'INCOME', category: 'Tiền mặt', amount: 1694000, notes: 'TM' },
    { date: '2026-08-14', type: 'INCOME', category: 'Chuyển khoản', amount: 3880000, notes: 'TK' },

    // Image 4 - August
    { date: '2026-08-15', type: 'EXPENSE', category: 'Nguyên liệu', amount: 473000, notes: 'Vỏ, nước...' },
    { date: '2026-08-15', type: 'INCOME', category: 'Tiền mặt', amount: 4414000, notes: 'TM' },
    { date: '2026-08-15', type: 'INCOME', category: 'Chuyển khoản', amount: 727000, notes: 'TK' },

    { date: '2026-08-16', type: 'EXPENSE', category: 'Nguyên liệu', amount: 1702000, notes: 'Xúc xích, bánh' },
    { date: '2026-08-16', type: 'INCOME', category: 'Tiền mặt', amount: 730000, notes: 'TM' },
    { date: '2026-08-16', type: 'INCOME', category: 'Chuyển khoản', amount: 3520000, notes: 'TK' },

    // Add previously extracted September dates for context
    { date: '2026-09-15', type: 'INCOME', category: 'Tiền mặt', amount: 700000, notes: 'Két' },
    { date: '2026-09-15', type: 'INCOME', category: 'Chuyển khoản', amount: 1071000, notes: 'Quẹt thẻ' },
    { date: '2026-09-16', type: 'INCOME', category: 'Tiền mặt', amount: 1500000, notes: 'Két' },
    { date: '2026-09-16', type: 'INCOME', category: 'Chuyển khoản', amount: 1073000, notes: 'Quẹt thẻ' },
  ];

  // First, clear existing to avoid duplicates if re-running
  await prisma.transaction.deleteMany({});
  console.log('Cleared existing transactions');

  for (const t of transactions) {
    await prisma.transaction.create({
      data: {
        date: new Date(t.date),
        type: t.type,
        category: t.category,
        amount: t.amount,
        notes: t.notes,
      }
    });
  }
  console.log('Successfully seeded database with August and September handwritten data.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
