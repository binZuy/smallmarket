'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { formatVND } from '@/lib/utils';
import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  TrendingUp,
  DollarSign,
  Boxes,
  Edit2,
  X,
  Coffee,
  Trash2,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ProductInventory {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  unit: string;
  stockQuantity: number;
  minStockLevel: number;
  category: string | null;
  stockStatus: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK';
  costValue: number;
  sellingValue: number;
}

interface InventorySummary {
  totalProducts: number;
  totalStockUnits: number;
  totalCostValue: number;
  totalSellingValue: number;
  potentialProfit: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface InventoryTx {
  id: string;
  type: 'IMPORT' | 'EXPORT' | 'ADJUSTMENT' | 'DAMAGE';
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  supplier: string | null;
  referenceCode: string | null;
  notes: string | null;
  createdAt: string;
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'stock' | 'import' | 'export' | 'history'>('stock');
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [history, setHistory] = useState<InventoryTx[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low' | 'out'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('ALL');

  // Quick edit modal
  const [editingProduct, setEditingProduct] = useState<ProductInventory | null>(null);
  const [editStock, setEditStock] = useState<number>(0);
  const [editCost, setEditCost] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editMinStock, setEditMinStock] = useState<number>(5);
  const [editUnit, setEditUnit] = useState<string>('cái');
  const [editCategory, setEditCategory] = useState<string>('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Import form state
  const [importSupplier, setImportSupplier] = useState('');
  const [importNotes, setImportNotes] = useState('');
  const [recordExpense, setRecordExpense] = useState(false);
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<'Tiền mặt' | 'Chuyển khoản'>('Tiền mặt');
  const [importItems, setImportItems] = useState<
    Array<{
      productId: string;
      name: string;
      category?: string;
      quantity: number;
      costPrice: number;
      sellingPrice: number;
      unit: string;
    }>
  >([{ productId: '', name: '', quantity: 1, costPrice: 0, sellingPrice: 0, unit: 'cái' }]);
  const [isSubmittingImport, setIsSubmittingImport] = useState(false);

  // Export form state
  const [exportType, setExportType] = useState<'DAMAGE' | 'EXPORT' | 'ADJUSTMENT'>('DAMAGE');
  const [exportReason, setExportReason] = useState<'DAMAGE' | 'USAGE' | 'EXPORT' | 'ADJUSTMENT'>('DAMAGE');
  const [exportProductId, setExportProductId] = useState('');
  const [exportQty, setExportQty] = useState(1);
  const [exportNotes, setExportNotes] = useState('');
  const [isSubmittingExport, setIsSubmittingExport] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const url = `/api/inventory/transactions?type=${historyTypeFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, historyTypeFilter]);

  // Quick edit product handler
  const handleOpenEdit = (p: ProductInventory) => {
    setEditingProduct(p);
    setEditStock(p.stockQuantity);
    setEditCost(p.costPrice);
    setEditPrice(p.sellingPrice);
    setEditMinStock(p.minStockLevel || 5);
    setEditUnit(p.unit || 'cái');
    setEditCategory(p.category || 'Hàng hoá');
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    try {
      setIsSavingEdit(true);
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockQuantity: Number(editStock),
          costPrice: Number(editCost),
          sellingPrice: Number(editPrice),
          minStockLevel: Number(editMinStock),
          unit: editUnit,
          category: editCategory,
        }),
      });

      if (res.ok) {
        setEditingProduct(null);
        await fetchInventory();
      } else {
        alert('Cập nhật thất bại, vui lòng thử lại');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Import form handlers
  const handleAddImportItem = () => {
    setImportItems([
      ...importItems,
      { productId: '', name: '', quantity: 1, costPrice: 0, sellingPrice: 0, unit: 'cái' },
    ]);
  };

  const handleRemoveImportItem = (index: number) => {
    if (importItems.length === 1) return;
    setImportItems(importItems.filter((_, i) => i !== index));
  };

  const handleSelectProductForImport = (index: number, prodId: string) => {
    const p = products.find((prod) => prod.id === prodId);
    const updated = [...importItems];
    if (p) {
      updated[index] = {
        productId: p.id,
        name: p.name,
        quantity: updated[index].quantity || 1,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        unit: p.unit,
      };
    } else {
      updated[index] = {
        ...updated[index],
        productId: '',
      };
    }
    setImportItems(updated);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = importItems.filter((it) => it.productId || it.name.trim());
    if (validItems.length === 0) {
      alert('Vui lòng chọn hoặc nhập ít nhất một sản phẩm');
      return;
    }

    try {
      setIsSubmittingImport(true);
      const res = await fetch('/api/inventory/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: validItems,
          supplier: importSupplier,
          notes: importNotes,
          recordExpense,
          expensePaymentMethod,
        }),
      });

      if (res.ok) {
        alert('✅ Đã tạo phiếu nhập kho thành công!');
        setImportSupplier('');
        setImportNotes('');
        setImportItems([{ productId: '', name: '', quantity: 1, costPrice: 0, sellingPrice: 0, unit: 'cái' }]);
        await fetchInventory();
        setActiveTab('stock');
      } else {
        const err = await res.json();
        alert('Lỗi: ' + (err.error || 'Không thể tạo phiếu nhập'));
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmittingImport(false);
    }
  };

  // Export form handler
  const handleExportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exportProductId) {
      alert('Vui lòng chọn sản phẩm cần xuất');
      return;
    }
    if (exportQty <= 0) {
      alert('Số lượng xuất phải lớn hơn 0');
      return;
    }

    try {
      setIsSubmittingExport(true);
      const res = await fetch('/api/inventory/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: exportType,
          reason: exportReason,
          items: [
            {
              productId: exportProductId,
              quantity: Number(exportQty),
              notes: exportNotes,
            },
          ],
          notes: exportNotes,
        }),
      });

      if (res.ok) {
        alert('✅ Đã thực hiện xuất kho thành công!');
        setExportProductId('');
        setExportQty(1);
        setExportNotes('');
        await fetchInventory();
        setActiveTab('stock');
      } else {
        const err = await res.json();
        alert('Lỗi: ' + (err.error || 'Không thể xuất kho'));
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmittingExport(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const dataToExport = products.map((p, idx) => ({
      STT: idx + 1,
      'Tên Hàng': p.name,
      'Danh Mục': p.category || 'Gia dụng',
      'ĐVT': p.unit,
      'Tồn Kho': p.stockQuantity,
      'Cảnh Báo Tối Thiểu': p.minStockLevel,
      'Giá Nhập (VNĐ)': p.costPrice,
      'Giá Bán (VNĐ)': p.sellingPrice,
      'Tổng Tiền Vốn': p.costValue,
      'Tổng Tiền Bán': p.sellingValue,
      'Trạng Thái':
        p.stockStatus === 'OUT_OF_STOCK'
          ? 'Hết hàng'
          : p.stockStatus === 'LOW_STOCK'
          ? 'Sắp hết hàng'
          : 'Còn hàng',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TonKho');
    XLSX.writeFile(wb, `BaoCao_TonKho_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Categories list
  const categoryList = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    if (statusFilter === 'out') return matchesSearch && matchesCategory && p.stockStatus === 'OUT_OF_STOCK';
    if (statusFilter === 'low') return matchesSearch && matchesCategory && p.stockStatus === 'LOW_STOCK';
    return matchesSearch && matchesCategory;
  });

  const totalImportCalc = importItems.reduce(
    (acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.costPrice) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#fdf7f4] flex flex-col font-sans pb-16">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-2.5 sm:px-6 py-3 space-y-3">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200/60 pb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#2d1b22] flex items-center gap-2">
              <Boxes className="w-6 h-6 text-rose-500" />
              Quản Lý Xuất Nhập & Kho Hàng
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Theo dõi tồn kho theo thời gian thực, nhập hàng, xuất kho và kiểm soát nguyên vật liệu.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Xuất Excel</span>
            </button>
            <button
              onClick={fetchInventory}
              className="p-1.5 bg-white border border-rose-200 rounded-lg text-slate-700 hover:bg-rose-50 transition-all"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Summary KPI Cards */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Tổng Tồn Kho</span>
                <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                  <Package className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-1 text-lg sm:text-xl font-black text-[#2d1b22]">
                {summary.totalStockUnits.toLocaleString('vi-VN')} <span className="text-xs font-bold text-slate-400">đơn vị</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                {summary.totalProducts} mặt hàng trong kho
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Giá Trị Vốn Tồn</span>
                <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <DollarSign className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-1 text-lg sm:text-xl font-black text-amber-700">
                {formatVND(summary.totalCostValue)}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                Tiền vốn nằm trong kho
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Doanh Thu Dự Kiến</span>
                <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-1 text-lg sm:text-xl font-black text-emerald-700">
                {formatVND(summary.totalSellingValue)}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
                Dự kiến lời +{formatVND(summary.potentialProfit)}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Cảnh Báo Kho</span>
                <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-black text-rose-600">
                  {summary.lowStockCount + summary.outOfStockCount}
                </span>
                <span className="text-xs font-bold text-slate-400">món cần nhập</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                {summary.outOfStockCount} hết hàng · {summary.lowStockCount} sắp hết
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-rose-200/60 rounded-xl overflow-x-auto shadow-xs">
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'stock'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-rose-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Kho Hàng & Tồn Kho ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'import'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-rose-50'
            }`}
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Nhập Hàng (Stock In)</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'export'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-rose-50'
            }`}
          >
            <ArrowUpFromLine className="w-3.5 h-3.5" />
            <span>Xuất Kho / Huỷ Hàng</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-rose-50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch Sử Xuất Nhập</span>
          </button>
        </div>

        {/* TAB 1: KHO HÀNG & TỒN KHO */}
        {activeTab === 'stock' && (
          <div className="bg-white rounded-xl border border-rose-200/60 shadow-xs overflow-hidden space-y-2">
            {/* Search & Status Filters */}
            <div className="p-3 border-b border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên sản phẩm hoặc nguyên liệu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-rose-50/40 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    statusFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setStatusFilter('low')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    statusFilter === 'low'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  Sắp hết ({summary?.lowStockCount || 0})
                </button>
                <button
                  onClick={() => setStatusFilter('out')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    statusFilter === 'out'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  Hết hàng ({summary?.outOfStockCount || 0})
                </button>
              </div>
            </div>

            {/* Category Pills Navigation */}
            <div className="px-3 pb-2 flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide shrink-0">
                Danh mục:
              </span>
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50/60 text-slate-600 hover:bg-rose-100'
                }`}
              >
                Tất cả ({products.length})
              </button>
              <button
                onClick={() => setCategoryFilter('Nguyên liệu pha chế')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  categoryFilter === 'Nguyên liệu pha chế'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <Coffee className="w-3 h-3" />
                <span>Nguyên liệu pha chế</span>
              </button>
              {categoryList
                .filter((c) => c !== 'Nguyên liệu pha chế')
                .map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                      categoryFilter === cat
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50/60 text-slate-600 hover:bg-rose-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto border-t border-rose-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-rose-50/60 text-slate-700 font-black border-b border-rose-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Tên Hàng / Nguyên Liệu</th>
                    <th className="py-2.5 px-3">Danh Mục</th>
                    <th className="py-2.5 px-3 text-center">Tồn Kho</th>
                    <th className="py-2.5 px-3 text-right">Giá Vốn Nhập</th>
                    <th className="py-2.5 px-3 text-right">Giá Bán Ra</th>
                    <th className="py-2.5 px-3 text-right">Tổng Tiền Vốn</th>
                    <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                    <th className="py-2.5 px-3 text-center">Chỉnh Sửa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100/70 font-medium">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-rose-50/40 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[#2d1b22]">{p.name}</div>
                        <div className="text-[10px] text-slate-400">Đơn vị: {p.unit}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.category === 'Nguyên liệu pha chế'
                              ? 'bg-emerald-100 text-emerald-800 font-black'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.category || 'Gia dụng'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`font-black text-sm px-2 py-0.5 rounded-md ${
                            p.stockQuantity <= 0
                              ? 'bg-rose-100 text-rose-700 font-extrabold'
                              : p.stockQuantity <= (p.minStockLevel || 5)
                              ? 'bg-amber-100 text-amber-700 font-extrabold'
                              : 'text-slate-800'
                          }`}
                        >
                          {p.stockQuantity} <span className="text-[10px] font-bold text-slate-400">{p.unit}</span>
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Ngưỡng min: {p.minStockLevel || 5}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 font-semibold">
                        {formatVND(p.costPrice)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-600 font-bold">
                        {p.sellingPrice > 0 ? formatVND(p.sellingPrice) : 'Nguyên liệu'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-900 font-bold">
                        {formatVND(p.costValue)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {p.stockStatus === 'OUT_OF_STOCK' ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700">
                            HẾT HÀNG
                          </span>
                        ) : p.stockStatus === 'LOW_STOCK' ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700">
                            SẮP HẾT
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700">
                            CÒN HÀNG
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-all"
                          title="Chỉnh sửa tồn kho & giá"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs font-semibold">
                        Không tìm thấy mặt hàng hoặc nguyên liệu nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: NHẬP HÀNG (STOCK IN) */}
        {activeTab === 'import' && (
          <form onSubmit={handleImportSubmit} className="bg-white rounded-xl border border-rose-200/60 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-2.5">
              <h2 className="font-black text-sm text-[#2d1b22] flex items-center gap-1.5">
                <ArrowDownToLine className="w-4 h-4 text-rose-500" />
                Tạo Phiếu Nhập Hàng / Nhập Nguyên Liệu
              </h2>
              <div className="text-xs font-bold text-slate-500">
                Mã phiếu: Tự động sinh (PN-...)
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nhà Cung Cấp / Nguồn Hàng
                </label>
                <input
                  type="text"
                  placeholder="VD: Đại lý Vũ Gia, NPP Trang Chiến, Đại lý pha chế..."
                  value={importSupplier}
                  onChange={(e) => setImportSupplier(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-rose-50/40 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi Chú Phiếu Nhập
                </label>
                <input
                  type="text"
                  placeholder="Ghi chú thêm về chuyến hàng..."
                  value={importNotes}
                  onChange={(e) => setImportNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-rose-50/40 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                />
              </div>
            </div>

            {/* List of import items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wide">
                  Danh Sách Mặt Hàng / Nguyên Liệu Nhập
                </label>
                <button
                  type="button"
                  onClick={handleAddImportItem}
                  className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Dòng</span>
                </button>
              </div>

              <div className="space-y-2">
                {importItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-rose-50/30 border border-rose-200/60 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                  >
                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        Chọn hàng có sẵn:
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleSelectProductForImport(idx, e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-white border border-rose-200 rounded-lg font-medium focus:ring-2 focus:ring-rose-400"
                      >
                        <option value="">-- Hoặc nhập tên mới bên dưới --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Tồn: {p.stockQuantity} {p.unit})
                          </option>
                        ))}
                      </select>
                      {!item.productId && (
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <input
                            type="text"
                            placeholder="Nhập tên hàng mới..."
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...importItems];
                              updated[idx].name = e.target.value;
                              setImportItems(updated);
                            }}
                            className="px-2 py-1 text-xs bg-white border border-rose-200 rounded-lg font-medium"
                          />
                          <input
                            type="text"
                            placeholder="Đơn vị (kg, chai, lon...)"
                            value={item.unit}
                            onChange={(e) => {
                              const updated = [...importItems];
                              updated[idx].unit = e.target.value;
                              setImportItems(updated);
                            }}
                            className="px-2 py-1 text-xs bg-white border border-rose-200 rounded-lg font-medium"
                          />
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        Số lượng nhập:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...importItems];
                          updated[idx].quantity = Math.max(1, Number(e.target.value) || 1);
                          setImportItems(updated);
                        }}
                        className="w-full px-2 py-1.5 text-xs bg-white border border-rose-200 rounded-lg font-bold text-center"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        Giá vốn nhập:
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={item.costPrice}
                        onChange={(e) => {
                          const updated = [...importItems];
                          updated[idx].costPrice = Number(e.target.value) || 0;
                          setImportItems(updated);
                        }}
                        className="w-full px-2 py-1.5 text-xs bg-white border border-rose-200 rounded-lg font-bold text-right"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        Thành tiền:
                      </label>
                      <div className="text-xs font-black text-rose-600 py-1.5">
                        {formatVND((Number(item.quantity) || 0) * (Number(item.costPrice) || 0))}
                      </div>
                    </div>

                    <div className="sm:col-span-1 text-right">
                      {importItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImportItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sổ quỹ integration option */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recordExpense}
                  onChange={(e) => setRecordExpense(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-400 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">
                  Tự động ghi nhận số tiền nhập vào Sổ Quỹ (Chi phí)
                </span>
              </label>

              {recordExpense && (
                <div className="flex items-center gap-4 pl-6 text-xs font-medium text-slate-700">
                  <span>Hình thức thanh toán tiền nhập:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={expensePaymentMethod === 'Tiền mặt'}
                      onChange={() => setExpensePaymentMethod('Tiền mặt')}
                    />
                    <span>Tiền mặt (Chi tiền mặt)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={expensePaymentMethod === 'Chuyển khoản'}
                      onChange={() => setExpensePaymentMethod('Chuyển khoản')}
                    />
                    <span>Chuyển khoản (Chi tài khoản)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Total and Submit */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-rose-100">
              <div className="text-sm font-black text-[#2d1b22]">
                Tổng Tiền Phiếu Nhập:{' '}
                <span className="text-rose-600 text-lg font-black">{formatVND(totalImportCalc)}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingImport}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {isSubmittingImport ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Xác Nhận Nhập Kho</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: XUẤT KHO / HUỶ HÀNG / XUẤT DÙNG (STOCK OUT) */}
        {activeTab === 'export' && (
          <form onSubmit={handleExportSubmit} className="bg-white rounded-xl border border-rose-200/60 p-4 shadow-xs space-y-4 max-w-xl mx-auto">
            <div className="border-b border-rose-100 pb-2.5">
              <h2 className="font-black text-sm text-[#2d1b22] flex items-center gap-1.5">
                <ArrowUpFromLine className="w-4 h-4 text-rose-500" />
                Tạo Phiếu Xuất Kho / Xuất Dùng / Kiểm Kê
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Xuất dùng pha chế quầy nước, xuất huỷ hàng hỏng, hoặc cân bằng chênh lệch kiểm kê kho.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lý Do / Loại Xuất Kho
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setExportType('EXPORT');
                    setExportReason('USAGE');
                    setExportNotes('Xuất dùng pha chế quầy nước (trà sữa, cà phê, trà chanh)');
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                    exportReason === 'USAGE'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-black'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🍵 Xuất pha chế
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExportType('DAMAGE');
                    setExportReason('DAMAGE');
                    setExportNotes('Hàng hỏng / móp méo / hết hạn sử dụng');
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                    exportReason === 'DAMAGE'
                      ? 'bg-rose-50 border-rose-400 text-rose-700 font-black'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ⚠️ Hàng hỏng/hết hạn
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExportType('EXPORT');
                    setExportReason('EXPORT');
                    setExportNotes('Xuất dùng nội bộ hoặc bán sỉ ngoài quầy');
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                    exportReason === 'EXPORT'
                      ? 'bg-blue-50 border-blue-400 text-blue-700 font-black'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  📦 Xuất dùng/bán sỉ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExportType('ADJUSTMENT');
                    setExportReason('ADJUSTMENT');
                    setExportNotes('Cân bằng chênh lệch số lượng sau kiểm kê');
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all text-center ${
                    exportReason === 'ADJUSTMENT'
                      ? 'bg-amber-50 border-amber-400 text-amber-700 font-black'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ⚖️ Kiểm kê kho
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chọn Mặt Hàng / Nguyên Liệu Cần Xuất
              </label>
              <select
                value={exportProductId}
                onChange={(e) => setExportProductId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-rose-50/40 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 font-semibold"
                required
              >
                <option value="">-- Chọn mặt hàng / nguyên liệu --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.category || 'Khác'}] {p.name} (Tồn: {p.stockQuantity} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số Lượng Xuất
              </label>
              <input
                type="number"
                min="1"
                value={exportQty}
                onChange={(e) => setExportQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-2 text-xs bg-rose-50/40 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi Chú Chi Tiết
              </label>
              <textarea
                rows={2}
                placeholder="VD: Xuất 2 túi đường + 1 gói trà đen pha trà sữa..."
                value={exportNotes}
                onChange={(e) => setExportNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-rose-50/40 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingExport}
              className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-black rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {isSubmittingExport ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Xác Nhận Xuất Kho</span>
            </button>
          </form>
        )}

        {/* TAB 4: LỊCH SỬ XUẤT NHẬP */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl border border-rose-200/60 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-rose-100 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-black text-sm text-[#2d1b22] flex items-center gap-1.5">
                <History className="w-4 h-4 text-rose-500" />
                Nhật Ký Biến Động Kho (Input - Output)
              </h2>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setHistoryTypeFilter('ALL')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    historyTypeFilter === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setHistoryTypeFilter('IMPORT')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    historyTypeFilter === 'IMPORT'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  Nhập kho
                </button>
                <button
                  onClick={() => setHistoryTypeFilter('EXPORT')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    historyTypeFilter === 'EXPORT'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  Bán / Xuất dùng
                </button>
                <button
                  onClick={() => setHistoryTypeFilter('DAMAGE')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    historyTypeFilter === 'DAMAGE'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  Hư hỏng
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-rose-50/60 text-slate-700 font-black border-b border-rose-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Thời Gian</th>
                    <th className="py-2.5 px-3">Mã Phiếu</th>
                    <th className="py-2.5 px-3">Loại</th>
                    <th className="py-2.5 px-3">Tên Sản Phẩm / Nguyên Liệu</th>
                    <th className="py-2.5 px-3 text-center">Số Lượng</th>
                    <th className="py-2.5 px-3 text-right">Đơn Giá Vốn</th>
                    <th className="py-2.5 px-3 text-right">Thành Tiền</th>
                    <th className="py-2.5 px-3">Nguồn / Ghi Chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100/70 font-medium">
                  {history.map((tx) => (
                    <tr key={tx.id} className="hover:bg-rose-50/40 transition-colors">
                      <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString('vi-VN')} {new Date(tx.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">
                        {tx.referenceCode || '-'}
                      </td>
                      <td className="py-2 px-3">
                        {tx.type === 'IMPORT' ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                            + NHẬP KHO
                          </span>
                        ) : tx.type === 'EXPORT' ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                            - XUẤT DÙNG / BÁN
                          </span>
                        ) : tx.type === 'DAMAGE' ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                            - HƯ HỎNG
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                            ⚖ KIỂM KÊ
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-bold text-[#2d1b22]">
                        {tx.productName}
                      </td>
                      <td className="py-2 px-3 text-center font-black">
                        {tx.type === 'IMPORT' ? `+${tx.quantity}` : `-${tx.quantity}`}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">
                        {formatVND(tx.unitPrice)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {formatVND(tx.totalAmount)}
                      </td>
                      <td className="py-2 px-3 text-slate-500 max-w-xs truncate">
                        {tx.supplier ? `NCC: ${tx.supplier} · ` : ''}
                        {tx.notes || ''}
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs font-semibold">
                        Chưa có lịch sử xuất nhập kho nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Quick Edit Product Stock & Prices */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
            <div className="bg-white rounded-2xl max-w-md w-full p-4 border border-rose-200 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-rose-100 pb-2">
                <h3 className="font-black text-sm text-[#2d1b22]">
                  Cập Nhật Kho & Giá: {editingProduct.name}
                </h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Danh mục:
                    </label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3 py-1.5 border border-rose-200 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Đơn vị tính:
                    </label>
                    <input
                      type="text"
                      value={editUnit}
                      onChange={(e) => setEditUnit(e.target.value)}
                      className="w-full px-3 py-1.5 border border-rose-200 rounded-lg font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số lượng tồn kho thực tế:
                  </label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-rose-200 rounded-lg font-black text-base text-rose-600"
                  />
                  <span className="text-[10px] text-slate-400">
                    * Điều chỉnh trực tiếp số lượng tồn kho theo số đếm thực tế của bạn.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ngưỡng cảnh báo sắp hết (Min stock):
                  </label>
                  <input
                    type="number"
                    value={editMinStock}
                    onChange={(e) => setEditMinStock(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-rose-200 rounded-lg font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Giá Vốn Nhập (VNĐ):
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={editCost}
                      onChange={(e) => setEditCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-rose-200 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Giá Bán Ra (VNĐ):
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-rose-200 rounded-lg font-bold text-rose-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit}
                  className="px-4 py-1.5 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all flex items-center gap-1.5"
                >
                  {isSavingEdit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
