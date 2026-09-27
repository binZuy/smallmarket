'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { PlusCircle, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

type TransactionType = 'INCOME' | 'EXPENSE';

interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
}

interface DailySummary {
  date: string;
  income: number;
  expense: number;
  revenue: number;
}

export default function FinanceMonthlyDashboard() {
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/transactions?month=${currentMonth}`);
        if (res.ok) {
          const data: Transaction[] = await res.json();
          
          // Group by date
          const summaryMap = new Map<string, DailySummary>();
          
          data.forEach(t => {
            const dateStr = format(new Date(t.date), 'yyyy-MM-dd');
            if (!summaryMap.has(dateStr)) {
              summaryMap.set(dateStr, { date: dateStr, income: 0, expense: 0, revenue: 0 });
            }
            const summary = summaryMap.get(dateStr)!;
            
            if (t.type === 'INCOME') {
              summary.income += t.amount;
            } else {
              summary.expense += t.amount;
            }
            summary.revenue = summary.income - summary.expense;
          });

          // Convert to array and sort by date descending
          const summaryArray = Array.from(summaryMap.values()).sort((a, b) => b.date.localeCompare(a.date));
          setDailySummaries(summaryArray);
        }
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      }
      setIsLoading(false);
    };

    fetchMonthlyData();
  }, [currentMonth]);

  const totalMonthlyIncome = dailySummaries.reduce((sum, day) => sum + day.income, 0);
  const totalMonthlyExpense = dailySummaries.reduce((sum, day) => sum + day.expense, 0);
  const totalMonthlyRevenue = totalMonthlyIncome - totalMonthlyExpense;

  const handleExportExcel = () => {
    const dataToExport = dailySummaries.map(d => ({
      'Ngày': format(new Date(d.date), 'dd/MM/yyyy'),
      'Tổng Thu': d.income,
      'Tổng Chi': d.expense,
      'Doanh Thu': d.revenue
    }));
    
    // Add summary row
    dataToExport.push({
      'Ngày': 'TỔNG CỘNG THÁNG',
      'Tổng Thu': totalMonthlyIncome,
      'Tổng Chi': totalMonthlyExpense,
      'Doanh Thu': totalMonthlyRevenue
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Thang_${currentMonth}`);
    XLSX.writeFile(wb, `Tong_hop_thu_chi_${currentMonth}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header & Controls */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border-2 border-green-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-green-800">Tổng Hợp Doanh Thu</h1>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-lg font-bold text-gray-700">Tháng:</label>
              <input 
                type="month" 
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="border-2 border-green-400 rounded-xl p-2 text-xl font-bold text-green-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <Link 
              href="/finance/entry"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95"
            >
              <PlusCircle className="w-6 h-6" />
              <span>Nhập Thu/Chi</span>
            </Link>
          </div>
        </div>

        {/* Monthly Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border-2 border-blue-200 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-xl text-gray-600 font-bold mb-2">Tổng Thu Tháng</h3>
            <p className="text-3xl font-black text-blue-600">
              + {totalMonthlyIncome.toLocaleString('vi-VN')} đ
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border-2 border-red-200 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-xl text-gray-600 font-bold mb-2">Tổng Chi Tháng</h3>
            <p className="text-3xl font-black text-red-600">
              - {totalMonthlyExpense.toLocaleString('vi-VN')} đ
            </p>
          </div>
          <div className={`p-6 rounded-2xl border-2 shadow-sm flex flex-col items-center justify-center ${totalMonthlyRevenue >= 0 ? 'bg-green-100 border-green-400' : 'bg-orange-100 border-orange-400'}`}>
            <h3 className={`text-xl font-bold mb-2 ${totalMonthlyRevenue >= 0 ? 'text-green-800' : 'text-orange-800'}`}>
              Doanh Thu Tháng
            </h3>
            <p className={`text-3xl font-black ${totalMonthlyRevenue >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
              {totalMonthlyRevenue.toLocaleString('vi-VN')} đ
            </p>
          </div>
        </div>

        {/* Daily Table */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b-2 border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Chi tiết theo ngày</h2>
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-bold hover:bg-emerald-200 transition-colors border border-emerald-300"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Xuất Excel
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700 border-b-2 border-gray-300">
                  <th className="p-4 font-bold border-r border-gray-300 text-lg">Ngày</th>
                  <th className="p-4 font-bold border-r border-gray-300 text-right text-lg text-blue-800">Tổng Thu (+)</th>
                  <th className="p-4 font-bold border-r border-gray-300 text-right text-lg text-red-800">Tổng Chi (-)</th>
                  <th className="p-4 font-bold text-right text-lg text-green-900">Doanh Thu</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500 font-bold text-xl">Đang tải dữ liệu...</td>
                  </tr>
                ) : dailySummaries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500 font-bold text-xl">
                      Chưa có dữ liệu cho tháng này
                    </td>
                  </tr>
                ) : (
                  dailySummaries.map((day) => (
                    <tr key={day.date} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="p-4 border-r border-gray-200 font-black text-gray-800 text-lg">
                        {format(new Date(day.date), 'dd/MM/yyyy')}
                      </td>
                      <td className="p-4 border-r border-gray-200 text-right font-bold text-blue-600 text-xl">
                        {day.income > 0 ? `+ ${day.income.toLocaleString('vi-VN')}` : '-'}
                      </td>
                      <td className="p-4 border-r border-gray-200 text-right font-bold text-red-600 text-xl">
                        {day.expense > 0 ? `- ${day.expense.toLocaleString('vi-VN')}` : '-'}
                      </td>
                      <td className={`p-4 text-right font-black text-xl ${day.revenue >= 0 ? 'text-green-700' : 'text-orange-600'}`}>
                        {day.revenue.toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
