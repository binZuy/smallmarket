'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FinanceEntry() {
  const router = useRouter();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Simplified entry
  const [cashIncome, setCashIncome] = useState('');
  const [transferIncome, setTransferIncome] = useState('');
  const [totalExpense, setTotalExpense] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const transactions = [];
    
    if (cashIncome && Number(cashIncome) > 0) {
      transactions.push({
        date,
        type: 'INCOME',
        category: 'Tiền mặt',
        amount: Number(cashIncome),
        notes: 'Chốt ca',
      });
    }

    if (transferIncome && Number(transferIncome) > 0) {
      transactions.push({
        date,
        type: 'INCOME',
        category: 'Chuyển khoản',
        amount: Number(transferIncome),
        notes: 'Chốt ca',
      });
    }

    if (totalExpense && Number(totalExpense) > 0) {
      transactions.push({
        date,
        type: 'EXPENSE',
        category: 'Chi khác',
        amount: Number(totalExpense),
        notes: 'Tổng chi trong ngày',
      });
    }

    if (transactions.length === 0) {
      alert('Vui lòng nhập ít nhất một khoản thu hoặc chi');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/transactions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions }),
      });

      if (res.ok) {
        alert('Lưu số liệu thành công!');
        router.push('/finance');
      } else {
        alert('Có lỗi xảy ra khi lưu dữ liệu');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Lỗi hệ thống');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/finance" className="p-2 bg-white rounded-full shadow-sm hover:bg-green-50 transition-colors">
            <ArrowLeft className="w-6 h-6 text-green-700" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-green-800">Nhập Số Liệu Chốt Ngày</h1>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border-2 border-green-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-xl font-bold text-gray-700 mb-2">Ngày chốt sổ</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-xl p-4 text-2xl font-bold focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                required
              />
            </div>

            <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-200 space-y-4">
              <h2 className="text-2xl font-black text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">KHOẢN THU (+)</h2>
              
              <div>
                <label className="block text-lg font-bold text-blue-900 mb-2">Tiền mặt thu được (Két)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={cashIncome}
                    onChange={(e) => setCashIncome(e.target.value)}
                    placeholder="VD: 1500000"
                    className="w-full border-2 border-blue-300 rounded-xl p-4 text-2xl font-bold text-blue-900 placeholder-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-blue-400">VNĐ</span>
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold text-blue-900 mb-2">Chuyển khoản (Quẹt/TK)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={transferIncome}
                    onChange={(e) => setTransferIncome(e.target.value)}
                    placeholder="VD: 2500000"
                    className="w-full border-2 border-blue-300 rounded-xl p-4 text-2xl font-bold text-blue-900 placeholder-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-blue-400">VNĐ</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-200">
              <h2 className="text-2xl font-black text-red-800 mb-4 border-b-2 border-red-200 pb-2">KHOẢN CHI (-)</h2>
              
              <div>
                <label className="block text-lg font-bold text-red-900 mb-2">Tổng tiền chi xuất (Nguyên liệu, đá...)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={totalExpense}
                    onChange={(e) => setTotalExpense(e.target.value)}
                    placeholder="VD: 500000"
                    className="w-full border-2 border-red-300 rounded-xl p-4 text-2xl font-bold text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-red-400">VNĐ</span>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-4 rounded-xl font-black text-2xl shadow-xl transition-all active:scale-95 mt-8"
            >
              <Save className="w-8 h-8" />
              {isSubmitting ? 'ĐANG LƯU...' : 'LƯU SỐ LIỆU'}
            </button>
            <p className="text-center text-gray-500 font-medium mt-4">
              Lưu ý: Doanh thu sẽ tự động được tính = (Tiền mặt + Chuyển khoản) - Tổng chi
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
