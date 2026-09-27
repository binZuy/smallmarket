'use client';

import { useState, useEffect, use } from 'react';
import { format, subDays } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface Transaction {
  id: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  notes: string;
}


export default function FinanceDailyDetail({ params }: { params: Promise<{ date: string }> }) {
  const router = useRouter();
  const { date } = use(params);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashPrev, setCashPrev] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Form for new expense
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseNotes, setNewExpenseNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resCurrent = await fetch(`/api/transactions?date=${date}`);
      
      // We need to fetch the previous month to trace cash correctly if it's the 1st of the month,
      // but for a simple detail view, we can just fetch the whole month up to this date to find the last cash balance.
      const monthStr = date.substring(0, 7); // yyyy-MM
      const resMonth = await fetch(`/api/transactions?month=${monthStr}`);

      if (resCurrent.ok && resMonth.ok) {
        const txCurrent: Transaction[] = await resCurrent.json();
        const txMonth: Transaction[] = await resMonth.json();

        setTransactions(txCurrent);

        // Calculate cashPrev by looking at previous days in the month
        // In a real app, this would be computed on the backend.
        let lastKnown = 0;
        const sortedMonth = txMonth.sort((a, b) => a.date.localeCompare(b.date));
        for (const t of sortedMonth) {
          if (t.date.startsWith(date)) break; // stop at current date
          if (t.category === 'Tiền mặt' && t.type === 'INCOME') {
            lastKnown = t.amount;
          }
        }
        
        // If it's the first of the month and we found 0, we'd theoretically need the previous month,
        // but let's keep it simple for this UI base.
        setCashPrev(lastKnown);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
    setIsLoading(false);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseAmount) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: date,
          type: 'EXPENSE',
          category: 'Chi khác', // General expense category
          amount: Number(newExpenseAmount),
          notes: newExpenseNotes || 'Chi tiết',
        }),
      });

      if (res.ok) {
        setNewExpenseAmount('');
        setNewExpenseNotes('');
        fetchData(); // Reload data
      } else {
        alert('Có lỗi xảy ra');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi hệ thống');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa khoản này?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  // Calculate metrics
  const cashNow = transactions.find(t => t.category === 'Tiền mặt' && t.type === 'INCOME')?.amount || 0;
  const transfer = transactions.find(t => t.category === 'Chuyển khoản' && t.type === 'INCOME')?.amount || 0;
  
  // Exclude the aggregate "Chi tiền mặt" and "Chi tài khoản" if we want to show detailed list
  // But wait, the detailed list IS the transactions. 
  // Let's separate "Tổng hợp" transactions from "Chi tiết"
  const detailedExpenses = transactions.filter(t => t.type === 'EXPENSE' && !['Chi tiền mặt', 'Chi tài khoản'].includes(t.category));
  const aggregateExpense = transactions.find(t => ['Chi tiền mặt', 'Chi tài khoản'].includes(t.category))?.amount || 0;
  
  // Total expenses is either the aggregate input from dashboard OR the sum of details. 
  // For now, sum of details + aggregate (if any, though usually one or the other)
  const totalDetailedExpense = detailedExpenses.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = aggregateExpense + totalDetailedExpense;

  const realCashRevenue = cashNow - cashPrev;

  return (
    <div className="min-h-screen bg-[#F0FDF4] font-sans text-gray-900 pb-12">
      <Navbar />
      <div className="max-w-4xl mx-auto space-y-6 mt-4 p-4 md:p-8 pt-0">
        
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Link href="/finance" className="p-1.5 sm:p-2 bg-white rounded-full shadow-sm hover:bg-green-50 transition-colors">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-green-700" />
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-800">
            Chi tiết ngày: {format(new Date(date), 'dd/MM/yyyy')}
          </h1>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-blue-200">
            <h2 className="text-xl font-bold text-blue-800 mb-4 border-b pb-2">Doanh thu TỔNG</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">Tiền mặt trong két:</span>
                <span className="font-bold">{formatCurrency(cashNow)}</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-600">Tiền mặt hôm trước:</span>
                <span className="font-bold text-gray-400">- {formatCurrency(cashPrev)}</span>
              </div>
              <div className="flex justify-between items-center text-base sm:text-lg border-t pt-2 border-dashed">
                <span className="font-bold text-blue-900">Thực thu Tiền mặt:</span>
                <span className="font-black text-blue-600">{formatCurrency(realCashRevenue)}</span>
              </div>
              <div className="flex justify-between items-center text-base sm:text-lg pt-2">
                <span className="font-bold text-blue-900">Chuyển khoản:</span>
                <span className="font-black text-blue-600">{formatCurrency(transfer)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-2 border-orange-200">
            <h2 className="text-lg sm:text-xl font-bold text-orange-800 mb-4 border-b pb-2">Tổng Chi ra</h2>
            <div className="flex h-full items-center justify-center -mt-4 sm:-mt-6">
              <span className="text-3xl sm:text-4xl font-black text-red-600">
                - {formatCurrency(totalExpense)}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Expenses Entry */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-red-200 overflow-hidden">
          <div className="p-4 bg-red-50 border-b border-red-200">
            <h2 className="text-xl font-bold text-red-800">Chi tiết các khoản CHI (Tiền nhập hàng, đá...)</h2>
            <p className="text-sm text-red-600 mt-1">
              Ghi chú cụ thể các khoản chi lẻ ra ở đây để sau này đối soát lợi nhuận kho.
            </p>
          </div>

          <div className="p-4">
            {/* Add new expense form */}
            <form onSubmit={handleAddExpense} className="flex flex-col sm:flex-row gap-3 mb-6 bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
              <div className="flex-1">
                <input 
                  type="text" 
                  value={newExpenseNotes}
                  onChange={(e) => setNewExpenseNotes(e.target.value)}
                  placeholder="Ghi chú (VD: Mua 1 thùng dưa...)"
                  className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 text-base sm:text-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
                  required
                />
              </div>
              <div className="w-full sm:w-48">
                <input 
                  type="number" 
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  placeholder="Số tiền"
                  className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 text-base sm:text-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 font-bold text-red-600"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-gray-400 text-sm sm:text-base w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Thêm
              </button>
            </form>

            {/* Expenses List */}
            {isLoading ? (
              <div className="text-center p-4 text-gray-500">Đang tải...</div>
            ) : detailedExpenses.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-medium">
                Chưa có khoản chi tiết nào được ghi chú trong ngày này.
              </div>
            ) : (
              <div className="space-y-3">
                {detailedExpenses.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="font-medium text-lg text-gray-800">{tx.notes}</div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-red-600 text-xl">- {formatCurrency(tx.amount)}</span>
                      <button 
                        onClick={() => handleDelete(tx.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
