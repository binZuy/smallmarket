'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProductSidebar from '@/components/ProductSidebar';
import ProductIcon from '@/components/ProductIcon';
import { formatVND } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  Package,
  Calendar,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  DollarSign,
  PieChart,
  FileSpreadsheet,
  Search,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface OrderItem {
  id: string;
  productName: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
}

interface Order {
  id: string;
  orderCode: string;
  totalSellingPrice: number;
  totalCostPrice: number;
  profit: number;
  createdAt: string;
  items: OrderItem[];
}

interface DailyRecord {
  date: string;
  ordersCount: number;
  revenue: number;
  cost: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
}

interface ProductStat {
  productName: string;
  productId: string | null;
  totalQuantitySold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  lastSoldAt: string | null;
}

interface StatsData {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    totalCost: number;
    totalGrossProfit: number;
    grossMarginPercent: number;
    totalExpenses: number;
    totalNetProfit: number;
    netMarginPercent: number;
  };
  dailyBreakdown: DailyRecord[];
  productStats: ProductStat[];
}

export default function OrdersAndProfitPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profit' | 'daily' | 'products' | 'orders'>('profit');

  // Filter states
  const [period, setPeriod] = useState<string>('this_month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      let statsUrl = `/api/stats?period=${period}`;
      if (period === 'custom' && customFrom && customTo) {
        statsUrl += `&from=${customFrom}&to=${customTo}`;
      }

      const [ordersRes, statsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch(statsUrl),
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, customFrom, customTo]);

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  // Export Revenue & Profit Report
  const handleExportExcel = () => {
    if (!stats) return;

    // Daily breakdown sheet
    const dailyData = stats.dailyBreakdown.map((d) => ({
      'Ngày': d.date,
      'Số Đơn': d.ordersCount,
      'Doanh Thu (VNĐ)': d.revenue,
      'Tiền Vốn (VNĐ)': d.cost,
      'Lợi Nhuận Gộp (VNĐ)': d.grossProfit,
      'Chi Phí Cửa Hàng (VNĐ)': d.expenses,
      'Lợi Nhuận Ròng (VNĐ)': d.netProfit,
    }));

    // Product ranking sheet
    const productData = stats.productStats.map((p, idx) => ({
      STT: idx + 1,
      'Tên Sản Phẩm': p.productName,
      'Số Lượng Bán': p.totalQuantitySold,
      'Doanh Thu (VNĐ)': p.totalRevenue,
      'Tiền Vốn (VNĐ)': p.totalCost,
      'Lợi Nhuận (VNĐ)': p.totalProfit,
      'Tỷ Suất Lợi Nhuận (%)':
        p.totalRevenue > 0 ? ((p.totalProfit / p.totalRevenue) * 100).toFixed(1) : 0,
    }));

    const wb = XLSX.utils.book_new();
    const wsDaily = XLSX.utils.json_to_sheet(dailyData);
    const wsProd = XLSX.utils.json_to_sheet(productData);

    XLSX.utils.book_append_sheet(wb, wsDaily, 'DoanhThuTheoNgay');
    XLSX.utils.book_append_sheet(wb, wsProd, 'SanPhamLoiNhuan');
    XLSX.writeFile(wb, `BaoCao_DoanhThu_LoiNhuan_${period}.xlsx`);
  };

  const filteredOrders = orders.filter((o) =>
    o.orderCode.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.items.some((i) => i.productName.toLowerCase().includes(orderSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#fdf7f4] flex flex-col font-sans pb-16">
      <Navbar onOpenAddSidebar={() => setIsSidebarOpen(true)} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-2.5 sm:px-6 py-3 space-y-3">
        {/* Header Title & Period Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 border-b border-rose-200/60 pb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#2d1b22] flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-rose-500" />
              Báo Cáo Doanh Thu & Lợi Nhuận
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Đo lường doanh thu bán lẻ, giá vốn, chi phí phát sinh và lợi nhuận ròng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Xuất Báo Cáo</span>
            </button>
            <button
              onClick={fetchData}
              className="p-1.5 bg-white border border-rose-200 rounded-lg text-slate-700 hover:bg-rose-50 transition-all"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Period Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-rose-200/60 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 px-2 uppercase tracking-wide">
            Kỳ Báo Cáo:
          </span>
          {[
            { id: 'today', label: 'Hôm Nay' },
            { id: 'yesterday', label: 'Hôm Qua' },
            { id: '7days', label: '7 Ngày Qua' },
            { id: 'this_month', label: 'Tháng Này' },
            { id: 'last_month', label: 'Tháng Trước' },
            { id: 'all', label: 'Toàn Bộ' },
            { id: 'custom', label: 'Tuỳ Chọn Ngày' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                period === tab.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-rose-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Custom date range inputs if selected */}
        {period === 'custom' && (
          <div className="flex items-center gap-2 p-2.5 bg-rose-50/50 rounded-xl border border-rose-200 text-xs font-medium">
            <span>Từ ngày:</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-2 py-1 bg-white border border-rose-200 rounded-lg"
            />
            <span>Đến ngày:</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-2 py-1 bg-white border border-rose-200 rounded-lg"
            />
          </div>
        )}

        {/* 5 Main Financial KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
            {/* 1. Revenue */}
            <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Doanh Thu</span>
                <span className="p-1 bg-rose-50 text-rose-600 rounded-md">
                  <DollarSign className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-1 text-base sm:text-lg font-black text-[#2d1b22]">
                {formatVND(stats.summary.totalRevenue)}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                {stats.summary.totalOrders} đơn hàng
              </div>
            </div>

            {/* 2. COGS */}
            <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Tiền Vốn (COGS)</span>
                <span className="p-1 bg-amber-50 text-amber-600 rounded-md">
                  <Package className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-1 text-base sm:text-lg font-black text-amber-700">
                {formatVND(stats.summary.totalCost)}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Giá gốc sản phẩm bán ra
              </div>
            </div>

            {/* 3. Gross Profit */}
            <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Lợi Nhuận Gộp</span>
                <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-1 text-base sm:text-lg font-black text-emerald-700">
                {formatVND(stats.summary.totalGrossProfit)}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
                Biên gộp: {stats.summary.grossMarginPercent}%
              </div>
            </div>

            {/* 4. Operating Expenses */}
            <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Chi Phí Cửa Hàng</span>
                <span className="p-1 bg-rose-50 text-rose-600 rounded-md">
                  <Wallet className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-1 text-base sm:text-lg font-black text-rose-600">
                {formatVND(stats.summary.totalExpenses)}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Chi phí từ Sổ Quỹ
              </div>
            </div>

            {/* 5. Net Profit */}
            <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-[#2d1b22] to-[#462330] p-3 rounded-xl shadow-xs text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-200">Lợi Nhuận Ròng</span>
                <span className="p-1 bg-amber-400/20 text-amber-300 rounded-md">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-1 text-base sm:text-lg font-black text-amber-300">
                {formatVND(stats.summary.totalNetProfit)}
              </div>
              <div className="text-[11px] text-rose-200 font-bold mt-0.5">
                Biên ròng: {stats.summary.netMarginPercent}%
              </div>
            </div>
          </div>
        )}

        {/* View Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-rose-200/60 rounded-xl overflow-x-auto shadow-xs">
          <button
            onClick={() => setActiveTab('profit')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'profit'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-rose-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Tổng Quan Lợi Nhuận</span>
          </button>

          <button
            onClick={() => setActiveTab('daily')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'daily'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-rose-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Theo Từng Ngày ({stats?.dailyBreakdown.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-rose-50'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Sản Phẩm Sinh Lời</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-rose-50'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Đơn Hàng Gần Đây ({orders.length})</span>
          </button>
        </div>

        {/* TAB: TỔNG QUAN LỢI NHUẬN (PROFIT SUMMARY) */}
        {activeTab === 'profit' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Profit Calculation Breakdown */}
            <div className="bg-white p-4 rounded-xl border border-rose-200/60 shadow-xs space-y-3">
              <h3 className="font-black text-sm text-[#2d1b22] flex items-center gap-1.5 border-b border-rose-100 pb-2">
                <TrendingUp className="w-4 h-4 text-rose-500" />
                Cơ Cấu Doanh Thu & Lợi Nhuận
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-dashed border-rose-100">
                  <span className="font-bold text-slate-600">(+) Doanh Thu Bán Hàng</span>
                  <span className="font-black text-slate-900 text-sm">
                    {formatVND(stats.summary.totalRevenue)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-dashed border-rose-100 text-amber-700">
                  <span className="font-bold">(-) Giá Vốn Hàng Bán (COGS)</span>
                  <span className="font-black text-sm">
                    -{formatVND(stats.summary.totalCost)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 bg-emerald-50/60 px-2 rounded-lg font-bold text-emerald-800">
                  <span>(=) LỢI NHUẬN GỘP (Gross Profit)</span>
                  <span className="font-black text-sm">
                    {formatVND(stats.summary.totalGrossProfit)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-dashed border-rose-100 text-rose-600">
                  <span className="font-bold">(-) Chi Phí Cửa Hàng & Vận Hành</span>
                  <span className="font-black text-sm">
                    -{formatVND(stats.summary.totalExpenses)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 bg-[#2d1b22] text-white px-3 rounded-xl font-bold">
                  <span>(=) LỢI NHUẬN RÒNG (Net Profit)</span>
                  <span className="font-black text-amber-300 text-base">
                    {formatVND(stats.summary.totalNetProfit)}
                  </span>
                </div>
              </div>

              {/* Progress visual bar */}
              {stats.summary.totalRevenue > 0 && (
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                    <span>Cơ cấu doanh thu</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{
                        width: `${Math.min(100, (stats.summary.totalCost / stats.summary.totalRevenue) * 100)}%`,
                      }}
                      className="bg-amber-400 h-full"
                      title="Giá vốn"
                    />
                    <div
                      style={{
                        width: `${Math.min(100, (stats.summary.totalExpenses / stats.summary.totalRevenue) * 100)}%`,
                      }}
                      className="bg-rose-400 h-full"
                      title="Chi phí"
                    />
                    <div
                      style={{
                        width: `${Math.max(0, Math.min(100, (stats.summary.totalNetProfit / stats.summary.totalRevenue) * 100))}%`,
                      }}
                      className="bg-emerald-500 h-full"
                      title="Lợi nhuận ròng"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 mt-1.5">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Tiền vốn
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" /> Chi phí
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Lợi nhuận ròng
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Top Profit Products mini list */}
            <div className="bg-white p-4 rounded-xl border border-rose-200/60 shadow-xs space-y-3">
              <h3 className="font-black text-sm text-[#2d1b22] flex items-center justify-between border-b border-rose-100 pb-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Top Mặt Hàng Sinh Lời Nhất
                </span>
                <button
                  onClick={() => setActiveTab('products')}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Xem tất cả
                </button>
              </h3>

              <div className="space-y-2">
                {stats.productStats.slice(0, 5).map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-rose-50/40 hover:bg-rose-50 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 font-black text-[11px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-[#2d1b22]">{p.productName}</div>
                        <div className="text-[10px] text-slate-400">
                          Đã bán: {p.totalQuantitySold} cái · Doanh thu: {formatVND(p.totalRevenue)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-emerald-700">+{formatVND(p.totalProfit)}</div>
                      <div className="text-[10px] text-slate-400 font-bold">
                        {p.totalRevenue > 0 ? ((p.totalProfit / p.totalRevenue) * 100).toFixed(0) : 0}% lãi
                      </div>
                    </div>
                  </div>
                ))}
                {stats.productStats.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                    Chưa có dữ liệu bán hàng trong kỳ này.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: THEO TỪNG NGÀY (DAILY BREAKDOWN) */}
        {activeTab === 'daily' && stats && (
          <div className="bg-white rounded-xl border border-rose-200/60 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-rose-100 flex items-center justify-between">
              <h2 className="font-black text-sm text-[#2d1b22] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rose-500" />
                Bảng Kê Doanh Thu & Lợi Nhuận Từng Ngày
              </h2>
              <span className="text-xs font-bold text-slate-400">
                {stats.dailyBreakdown.length} ngày phát sinh giao dịch
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-rose-50/60 text-slate-700 font-black border-b border-rose-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Ngày</th>
                    <th className="py-2.5 px-3 text-center">Số Đơn</th>
                    <th className="py-2.5 px-3 text-right">Doanh Thu</th>
                    <th className="py-2.5 px-3 text-right">Tiền Vốn</th>
                    <th className="py-2.5 px-3 text-right">Lợi Nhuận Gộp</th>
                    <th className="py-2.5 px-3 text-right">Chi Phí Quỹ</th>
                    <th className="py-2.5 px-3 text-right">Lợi Nhuận Ròng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100/70 font-medium">
                  {stats.dailyBreakdown.map((d) => (
                    <tr key={d.date} className="hover:bg-rose-50/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[#2d1b22]">
                        {d.date}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                        {d.ordersCount}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">
                        {formatVND(d.revenue)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-700 font-semibold">
                        {formatVND(d.cost)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                        {formatVND(d.grossProfit)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-600 font-semibold">
                        {formatVND(d.expenses)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`font-black px-2 py-0.5 rounded-md ${
                            d.netProfit >= 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {d.netProfit >= 0 ? '+' : ''}
                          {formatVND(d.netProfit)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stats.dailyBreakdown.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-semibold">
                        Chưa có dữ liệu ngày nào trong khoảng thời gian đã chọn.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: SẢN PHẨM SINH LỜI (PRODUCT RANKING) */}
        {activeTab === 'products' && stats && (
          <div className="bg-white rounded-xl border border-rose-200/60 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-rose-100 flex items-center justify-between">
              <h2 className="font-black text-sm text-[#2d1b22] flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-rose-500" />
                Xếp Hạng Sản Phẩm Đem Lại Lợi Nhuận
              </h2>
              <span className="text-xs font-bold text-slate-400">
                {stats.productStats.length} sản phẩm đã bán
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-rose-50/60 text-slate-700 font-black border-b border-rose-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 text-center">Top</th>
                    <th className="py-2.5 px-3">Tên Mặt Hàng</th>
                    <th className="py-2.5 px-3 text-center">Đã Bán</th>
                    <th className="py-2.5 px-3 text-right">Doanh Thu</th>
                    <th className="py-2.5 px-3 text-right">Tiền Vốn</th>
                    <th className="py-2.5 px-3 text-right">Lợi Nhuận</th>
                    <th className="py-2.5 px-3 text-center">Biên Lợi Nhuận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100/70 font-medium">
                  {stats.productStats.map((p, idx) => {
                    const margin = p.totalRevenue > 0 ? (p.totalProfit / p.totalRevenue) * 100 : 0;
                    return (
                      <tr key={idx} className="hover:bg-rose-50/40 transition-colors">
                        <td className="py-2.5 px-3 text-center font-black">
                          <span
                            className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] ${
                              idx === 0
                                ? 'bg-amber-400 text-slate-950 font-black'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-800'
                                : idx === 2
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-[#2d1b22]">
                          {p.productName}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                          {p.totalQuantitySold}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-900 font-semibold">
                          {formatVND(p.totalRevenue)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-amber-700 font-semibold">
                          {formatVND(p.totalCost)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-700">
                          +{formatVND(p.totalProfit)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                            {margin.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {stats.productStats.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-semibold">
                        Chưa có sản phẩm nào được bán trong khoảng thời gian này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: ĐƠN HÀNG GẦN ĐÂY (ORDER LIST) */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl border border-rose-200/60 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <h2 className="font-black text-sm text-[#2d1b22] flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-rose-500" />
                Danh Sách Hoá Đơn Bán Lẻ
              </h2>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo mã đơn hoặc món..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-rose-50/40 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                />
              </div>
            </div>

            <div className="divide-y divide-rose-100/70">
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                return (
                  <div key={order.id} className="p-3 hover:bg-rose-50/30 transition-colors">
                    <div
                      onClick={() => toggleExpandOrder(order.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                          <Receipt className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="font-mono font-black text-xs text-[#2d1b22]">
                            {order.orderCode}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {new Date(order.createdAt).toLocaleDateString('vi-VN')} {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · {order.items.length} món
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs font-black text-[#2d1b22]">
                            {formatVND(order.totalSellingPrice)}
                          </div>
                          <div className="text-[10px] text-emerald-600 font-bold">
                            Lãi +{formatVND(order.profit)}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-2.5 pt-2.5 border-t border-rose-100 pl-8 space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                          Chi Tiết Mặt Hàng:
                        </div>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-xs py-1 px-2 bg-rose-50/50 rounded-lg"
                            >
                              <span className="font-medium text-slate-800">
                                {item.productName} <span className="font-bold text-rose-600">x{item.quantity}</span>
                              </span>
                              <div className="flex items-center gap-3 text-[11px]">
                                <span className="text-slate-400">
                                  Vốn: {formatVND(item.costPrice * item.quantity)}
                                </span>
                                <span className="font-bold text-slate-900">
                                  Bán: {formatVND(item.sellingPrice * item.quantity)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredOrders.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold">
                  Chưa có đơn hàng nào được ghi nhận.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <ProductSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onProductAdded={fetchData}
      />
    </div>
  );
}
