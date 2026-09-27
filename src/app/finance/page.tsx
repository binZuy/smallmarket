'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { FileSpreadsheet, Save, Loader2, Check } from 'lucide-react';
import * as XLSX from 'xlsx';

type TransactionType = 'INCOME' | 'EXPENSE';

interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
}

interface DailyRecord {
  date: string;
  cashPrev: number; // calculated
  cashNow: number;
  transfer: number;
  cashExpense: number;
  transferExpense: number;
  isEdited?: boolean;
  isSaving?: boolean;
  saveSuccess?: boolean;
}

export default function FinanceMonthlyDashboard() {
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [daysInMonth, setDaysInMonth] = useState<DailyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMonthlyData();
  }, [currentMonth]);

  const fetchMonthlyData = async () => {
    setIsLoading(true);
    try {
      // Fetch data for the current month and the previous month (to get the last cash balance)
      const prevMonthDate = subDays(new Date(currentMonth + '-01'), 1);
      const prevMonth = format(prevMonthDate, 'yyyy-MM');
      
      const [resCurrent, resPrev] = await Promise.all([
        fetch(`/api/transactions?month=${currentMonth}`),
        fetch(`/api/transactions?month=${prevMonth}`)
      ]);

      if (resCurrent.ok && resPrev.ok) {
        const dataCurrent: Transaction[] = await resCurrent.json();
        const dataPrev: Transaction[] = await resPrev.json();
        
        // Find the last cash balance from previous month
        let lastKnownCash = 0;
        const sortedPrev = dataPrev.sort((a, b) => b.date.localeCompare(a.date));
        for (const t of sortedPrev) {
          if (t.category === 'Tiền mặt' && t.type === 'INCOME') {
            lastKnownCash = t.amount;
            break;
          }
        }

        // Generate all days in the current month
        const [year, month] = currentMonth.split('-');
        const numDays = new Date(parseInt(year), parseInt(month), 0).getDate();
        
        const records: DailyRecord[] = [];
        
        for (let i = 1; i <= numDays; i++) {
          const dateStr = `${currentMonth}-${i.toString().padStart(2, '0')}`;
          
          // Find transactions for this date
          const dayTx = dataCurrent.filter(t => t.date.startsWith(dateStr));
          
          const cashNow = dayTx.find(t => t.category === 'Tiền mặt' && t.type === 'INCOME')?.amount || 0;
          const transfer = dayTx.find(t => t.category === 'Chuyển khoản' && t.type === 'INCOME')?.amount || 0;
          
          // Support old "Chi khác" or new specific expense categories
          let cashExpense = dayTx.find(t => t.category === 'Chi tiền mặt' && t.type === 'EXPENSE')?.amount || 0;
          let transferExpense = dayTx.find(t => t.category === 'Chi tài khoản' && t.type === 'EXPENSE')?.amount || 0;
          
          if (cashExpense === 0 && transferExpense === 0) {
            const oldTotalExpense = dayTx.find(t => t.category === 'Chi khác' && t.type === 'EXPENSE')?.amount || 0;
            if (oldTotalExpense > 0) cashExpense = oldTotalExpense; // fallback
          }

          records.push({
            date: dateStr,
            cashPrev: 0, // will calculate below
            cashNow,
            transfer,
            cashExpense,
            transferExpense
          });
        }

        // Calculate cashPrev cascading down
        let currentCash = lastKnownCash;
        for (let i = 0; i < records.length; i++) {
          records[i].cashPrev = currentCash;
          if (records[i].cashNow > 0 || records[i].transfer > 0 || records[i].cashExpense > 0 || records[i].transferExpense > 0) {
            // Update last known cash only if there's activity today
            if (records[i].cashNow > 0) {
              currentCash = records[i].cashNow;
            }
          }
        }

        setDaysInMonth(records);
      }
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
    setIsLoading(false);
  };

  const handleInputChange = (index: number, field: keyof DailyRecord, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value.replace(/\D/g, ''), 10) || 0;
    
    const newRecords = [...daysInMonth];
    newRecords[index] = {
      ...newRecords[index],
      [field]: numValue,
      isEdited: true,
      saveSuccess: false
    };

    // Recalculate cashPrev for subsequent days
    let currentCash = newRecords[index].cashPrev;
    for (let i = index; i < newRecords.length; i++) {
      newRecords[i].cashPrev = currentCash;
      if (newRecords[i].cashNow > 0 || newRecords[i].transfer > 0 || newRecords[i].cashExpense > 0 || newRecords[i].transferExpense > 0) {
        if (newRecords[i].cashNow > 0) {
          currentCash = newRecords[i].cashNow;
        }
      }
    }

    setDaysInMonth(newRecords);
  };

  const saveRow = async (index: number) => {
    const record = daysInMonth[index];
    
    const newRecords = [...daysInMonth];
    newRecords[index].isSaving = true;
    setDaysInMonth(newRecords);

    try {
      const res = await fetch('/api/finance/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: record.date,
          cashIncome: record.cashNow,
          transferIncome: record.transfer,
          cashExpense: record.cashExpense,
          transferExpense: record.transferExpense,
        })
      });

      if (res.ok) {
        const successRecords = [...daysInMonth];
        successRecords[index].isSaving = false;
        successRecords[index].isEdited = false;
        successRecords[index].saveSuccess = true;
        setDaysInMonth(successRecords);
        
        setTimeout(() => {
          setDaysInMonth(current => {
            const reset = [...current];
            if (reset[index]) reset[index].saveSuccess = false;
            return reset;
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Save failed', error);
      const errRecords = [...daysInMonth];
      errRecords[index].isSaving = false;
      setDaysInMonth(errRecords);
      alert('Lỗi khi lưu dữ liệu!');
    }
  };

  const handleExportExcel = () => {
    const dataToExport = daysInMonth
      .filter(d => d.cashNow > 0 || d.transfer > 0 || d.cashExpense > 0 || d.transferExpense > 0)
      .map(d => {
        const revenue = (d.cashNow - d.cashPrev + d.transfer) - (d.cashExpense + d.transferExpense);
        return {
          'Ngày': format(new Date(d.date), 'dd/MM/yyyy'),
          'TM Hôm Trước': d.cashPrev,
          'TM Hôm Nay': d.cashNow,
          'Chuyển Khoản': d.transfer,
          'Chi TM': d.cashExpense,
          'Chi TK': d.transferExpense,
          'Doanh Thu': revenue
        };
      });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Thang_${currentMonth}`);
    XLSX.writeFile(wb, `So_Thu_Chi_${currentMonth}.xlsx`);
  };

  const formatCurrency = (val: number) => {
    if (val === 0) return '';
    return val.toLocaleString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] p-2 md:p-8 font-sans text-gray-900">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border-2 border-green-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-green-800">Sổ Thu Chi Tổng Hợp</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-lg font-bold text-gray-700">Tháng:</label>
              <input 
                type="month" 
                value={currentMonth}
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="border-2 border-green-400 rounded-xl p-2 text-xl font-bold text-green-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-bold hover:bg-emerald-200 transition-colors border border-emerald-300"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Xuất Excel
            </button>
          </div>
        </div>

        {/* Interactive Table */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr>
                  <th rowSpan={2} className="p-3 bg-gray-100 border border-gray-300 text-center font-black text-gray-700 w-24">Ngày</th>
                  <th colSpan={3} className="p-2 bg-blue-100 border border-blue-300 text-center font-black text-blue-800">THU (+)</th>
                  <th colSpan={2} className="p-2 bg-red-100 border border-red-300 text-center font-black text-red-800">CHI (-)</th>
                  <th rowSpan={2} className="p-3 bg-green-100 border border-green-300 text-center font-black text-green-900 w-40">DOANH THU</th>
                  <th rowSpan={2} className="p-3 bg-gray-100 border border-gray-300 text-center font-black text-gray-700 w-24">Lưu</th>
                </tr>
                <tr>
                  <th className="p-2 bg-blue-50 border border-blue-200 text-center font-bold text-blue-700 text-sm">TM Hôm Trước</th>
                  <th className="p-2 bg-blue-50 border border-blue-200 text-center font-bold text-blue-700 text-sm">TM Nay (Két)</th>
                  <th className="p-2 bg-blue-50 border border-blue-200 text-center font-bold text-blue-700 text-sm">Chuyển Khoản</th>
                  <th className="p-2 bg-red-50 border border-red-200 text-center font-bold text-red-700 text-sm">Chi TM</th>
                  <th className="p-2 bg-red-50 border border-red-200 text-center font-bold text-red-700 text-sm">Chi TK</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500 font-bold text-xl">Đang tải dữ liệu...</td>
                  </tr>
                ) : daysInMonth.map((day, index) => {
                  const revenue = (day.cashNow - day.cashPrev + day.transfer) - (day.cashExpense + day.transferExpense);
                  const isWeekend = new Date(day.date).getDay() === 0 || new Date(day.date).getDay() === 6;
                  const hasData = day.cashNow > 0 || day.transfer > 0 || day.cashExpense > 0 || day.transferExpense > 0;
                  
                  return (
                    <tr key={day.date} className={`border-b border-gray-200 hover:bg-gray-50 ${isWeekend ? 'bg-orange-50/30' : ''} ${hasData ? 'bg-green-50/20' : ''}`}>
                      <td className="p-2 border border-gray-200 text-center font-bold">
                        <Link href={`/finance/${day.date}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                          {format(new Date(day.date), 'dd/MM')}
                        </Link>
                      </td>
                      
                      {/* TM Hôm Trước (Read only) */}
                      <td className="p-2 border border-blue-100 text-center font-bold text-gray-500 bg-gray-50">
                        {day.cashPrev > 0 ? day.cashPrev.toLocaleString('vi-VN') : '-'}
                      </td>
                      
                      {/* TM Nay (Editable) */}
                      <td className="p-1 border border-blue-100">
                        <input
                          type="text"
                          value={formatCurrency(day.cashNow)}
                          onChange={(e) => handleInputChange(index, 'cashNow', e.target.value)}
                          className="w-full text-center p-2 rounded bg-transparent font-bold text-blue-700 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                          placeholder="-"
                        />
                      </td>

                      {/* Chuyển Khoản (Editable) */}
                      <td className="p-1 border border-blue-100">
                        <input
                          type="text"
                          value={formatCurrency(day.transfer)}
                          onChange={(e) => handleInputChange(index, 'transfer', e.target.value)}
                          className="w-full text-center p-2 rounded bg-transparent font-bold text-blue-700 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                          placeholder="-"
                        />
                      </td>

                      {/* Chi TM (Editable) */}
                      <td className="p-1 border border-red-100">
                        <input
                          type="text"
                          value={formatCurrency(day.cashExpense)}
                          onChange={(e) => handleInputChange(index, 'cashExpense', e.target.value)}
                          className="w-full text-center p-2 rounded bg-transparent font-bold text-red-600 focus:bg-white focus:ring-2 focus:ring-red-400 outline-none transition-all"
                          placeholder="-"
                        />
                      </td>

                      {/* Chi TK (Editable) */}
                      <td className="p-1 border border-red-100">
                        <input
                          type="text"
                          value={formatCurrency(day.transferExpense)}
                          onChange={(e) => handleInputChange(index, 'transferExpense', e.target.value)}
                          className="w-full text-center p-2 rounded bg-transparent font-bold text-red-600 focus:bg-white focus:ring-2 focus:ring-red-400 outline-none transition-all"
                          placeholder="-"
                        />
                      </td>

                      {/* Doanh Thu (Calculated) */}
                      <td className={`p-2 border border-green-200 text-center font-black text-lg ${revenue > 0 ? 'text-green-700' : revenue < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {hasData ? revenue.toLocaleString('vi-VN') : '-'}
                      </td>

                      {/* Action */}
                      <td className="p-2 border border-gray-200 text-center">
                        {day.isEdited && !day.isSaving && (
                          <button 
                            onClick={() => saveRow(index)}
                            className="bg-amber-400 hover:bg-amber-500 text-amber-950 p-2 rounded-lg font-bold shadow transition-all active:scale-95"
                            title="Lưu dòng này"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                        )}
                        {day.isSaving && (
                          <div className="p-2 flex justify-center">
                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                          </div>
                        )}
                        {day.saveSuccess && !day.isEdited && (
                          <div className="p-2 flex justify-center">
                            <Check className="w-5 h-5 text-green-600" />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
