'use client';

import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

type TransactionType = 'INCOME' | 'EXPENSE';

interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  amount: number;
  quantity: number | null;
  notes: string | null;
}

export default function FinanceDashboard() {
  const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const fetchTransactions = async (date: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/transactions?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTransactions(currentDate);
  }, [currentDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) return;

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: currentDate,
          type,
          category,
          amount: parseFloat(amount),
          quantity: quantity ? parseInt(quantity) : null,
          notes,
        }),
      });

      if (res.ok) {
        setCategory('');
        setAmount('');
        setQuantity('');
        setNotes('');
        fetchTransactions(currentDate);
      }
    } catch (error) {
      console.error('Failed to add transaction', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTransactions(currentDate);
      }
    } catch (error) {
      console.error('Failed to delete transaction', error);
    }
  };

  const handleExportExcel = () => {
    const dataToExport = transactions.map(t => ({
      'Ngày': format(new Date(t.date), 'dd/MM/yyyy'),
      'Loại': t.type === 'INCOME' ? 'Thu' : 'Chi',
      'Hạng mục': t.category,
      'Số tiền': t.amount,
      'Số lượng': t.quantity || '',
      'Ghi chú': t.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ThuChi');
    XLSX.writeFile(wb, `Thu_Chi_${currentDate}.xlsx`);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as Record<string, any>[];

      const formattedData = data.map((row) => ({
        date: currentDate, // Dùng ngày hiện tại hoặc đọc từ file
        type: row['Loại'] === 'Thu' ? 'INCOME' : 'EXPENSE',
        category: row['Hạng mục'],
        amount: parseFloat(row['Số tiền'] || 0),
        quantity: row['Số lượng'] ? parseInt(row['Số lượng']) : null,
        notes: row['Ghi chú'] || ''
      }));

      try {
        const res = await fetch('/api/transactions/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions: formattedData }),
        });
        if (res.ok) {
          alert('Nhập dữ liệu thành công!');
          fetchTransactions(currentDate);
        }
      } catch (error) {
        console.error('Lỗi khi nhập excel', error);
        alert('Có lỗi xảy ra khi nhập file.');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const incomeCategories = ['Chuyển khoản', 'Tiền mặt', 'Khác'];
  const expenseCategories = ['Nhập nước', 'Bánh mì', 'Bánh bao', 'Nguyên liệu trà', 'Khác'];

  return (
    <div className="min-h-screen bg-[#F0FDF4] p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header & Date Picker */}
        <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-green-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-green-800">Sổ Thu Chi</h1>
          <div className="flex items-center gap-2">
            <label className="text-lg font-medium">Ngày:</label>
            <input 
              type="date" 
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="border-2 border-green-300 rounded-lg p-2 text-xl font-bold"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="bg-blue-100 p-4 rounded-xl border-2 border-blue-300 text-center shadow-sm">
            <h3 className="text-lg text-blue-800 font-semibold mb-1">Tổng Thu</h3>
            <p className="text-xl md:text-2xl font-bold text-blue-700">{totalIncome.toLocaleString('vi-VN')} đ</p>
          </div>
          <div className="bg-red-100 p-4 rounded-xl border-2 border-red-300 text-center shadow-sm">
            <h3 className="text-lg text-red-800 font-semibold mb-1">Tổng Chi</h3>
            <p className="text-xl md:text-2xl font-bold text-red-700">{totalExpense.toLocaleString('vi-VN')} đ</p>
          </div>
          <div className={`col-span-2 md:col-span-1 p-4 rounded-xl border-2 text-center shadow-sm ${balance >= 0 ? 'bg-green-100 border-green-300' : 'bg-orange-100 border-orange-300'}`}>
            <h3 className={`text-lg font-semibold mb-1 ${balance >= 0 ? 'text-green-800' : 'text-orange-800'}`}>Tồn Quỹ</h3>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-700' : 'text-orange-700'}`}>{balance.toLocaleString('vi-VN')} đ</p>
          </div>
        </div>

        {/* Excel Actions */}
        <div className="flex gap-2 justify-end">
          <button onClick={handleExportExcel} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-emerald-700">
            Xuất Excel
          </button>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImportExcel}
          />
          <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700">
            Nhập Excel
          </button>
        </div>

        {/* Entry Form */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border-2 border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Nhập khoản mới</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="type" 
                  value="EXPENSE" 
                  checked={type === 'EXPENSE'} 
                  onChange={() => setType('EXPENSE')}
                  className="w-5 h-5 text-red-600"
                />
                <span className="text-lg font-bold text-red-600">Khoản Chi</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="type" 
                  value="INCOME" 
                  checked={type === 'INCOME'} 
                  onChange={() => setType('INCOME')}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-lg font-bold text-blue-600">Khoản Thu</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Hạng mục</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(type === 'INCOME' ? incomeCategories : expenseCategories).map(cat => (
                    <button 
                      type="button" 
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${category === cat ? 'bg-gray-800 text-white border-gray-800' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <input 
                  type="text" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Hoặc nhập tên hạng mục..."
                  className="w-full border-2 border-gray-300 rounded-lg p-2 text-lg focus:border-green-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Số tiền (VNĐ)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ví dụ: 100000"
                  className="w-full border-2 border-gray-300 rounded-lg p-2 text-lg focus:border-green-500 outline-none"
                  required
                />
              </div>

              {type === 'EXPENSE' && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Số lượng (Tuỳ chọn)</label>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="VD: 10 thùng"
                    className="w-full border-2 border-gray-300 rounded-lg p-2 text-lg focus:border-green-500 outline-none"
                  />
                </div>
              )}

              <div className={type === 'INCOME' ? 'md:col-span-2' : ''}>
                <label className="block text-gray-700 font-semibold mb-1">Ghi chú (Tuỳ chọn)</label>
                <input 
                  type="text" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú thêm..."
                  className="w-full border-2 border-gray-300 rounded-lg p-2 text-lg focus:border-green-500 outline-none"
                />
              </div>
            </div>

            <button type="submit" className={`w-full py-3 rounded-lg text-white font-bold text-xl shadow-lg mt-4 ${type === 'INCOME' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
              LƯU {type === 'INCOME' ? 'KHOẢN THU' : 'KHOẢN CHI'}
            </button>
          </form>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Chi tiết ngày {format(new Date(currentDate), 'dd/MM/yyyy')}</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700 border-b-2 border-gray-300">
                  <th className="p-3 font-bold border-r border-gray-300">Loại</th>
                  <th className="p-3 font-bold border-r border-gray-300">Hạng mục</th>
                  <th className="p-3 font-bold border-r border-gray-300 text-right">Số lượng</th>
                  <th className="p-3 font-bold border-r border-gray-300 text-right">Số tiền</th>
                  <th className="p-3 font-bold border-r border-gray-300">Ghi chú</th>
                  <th className="p-3 font-bold text-center">Xóa</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-500 font-medium text-lg">
                      Chưa có dữ liệu cho ngày này
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className={`p-3 border-r border-gray-200 font-bold ${t.type === 'INCOME' ? 'text-blue-600' : 'text-red-600'}`}>
                        {t.type === 'INCOME' ? 'THU' : 'CHI'}
                      </td>
                      <td className="p-3 border-r border-gray-200 font-medium text-gray-800">{t.category}</td>
                      <td className="p-3 border-r border-gray-200 text-right">{t.quantity || '-'}</td>
                      <td className="p-3 border-r border-gray-200 text-right font-bold text-gray-900">{t.amount.toLocaleString('vi-VN')}</td>
                      <td className="p-3 border-r border-gray-200 text-gray-600 text-sm">{t.notes}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded">
                          ✕
                        </button>
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
