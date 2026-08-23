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
} from 'lucide-react';

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

interface ProductStat {
  productName: string;
  productId: string | null;
  totalQuantitySold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  lastSoldAt: string | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<{
    summary: {
      totalOrders: number;
      totalRevenue: number;
      totalCost: number;
      totalProfit: number;
    };
    productStats: ProductStat[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'orders'>('stats');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/stats'),
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
  }, []);

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#fdf7f4] flex flex-col font-sans pb-16">
      <Navbar onOpenAddSidebar={() => setIsSidebarOpen(true)} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-2.5 sm:px-6 py-2.5 space-y-2.5">
        {/* Top Cards - Ultra Short */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white p-2.5 rounded-xl border border-rose-100 shadow-xs flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                Tổng đơn
              </span>
              <span className="text-sm font-black text-slate-900 truncate block">
                {stats?.summary.totalOrders || 0} đơn
              </span>
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-xl border border-rose-100 shadow-xs flex items-center gap-2">
            <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                Doanh thu
              </span>
              <span className="text-sm font-black text-rose-600 truncate block">
                {formatVND(stats?.summary.totalRevenue || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white p-1 rounded-xl border border-rose-100 shadow-xs flex items-center gap-1">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1 ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-rose-50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Đã Bán ({stats?.productStats.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1 ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-rose-50'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Lịch Sử ({orders.length})</span>
          </button>
        </div>

        {/* TAB 1: PRODUCT QUANTITY SOLD STATS */}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-xl border border-rose-100 shadow-xs overflow-hidden">
            <div className="p-2.5 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-900">
                Số Lượng Đã Bán
              </h2>
              <button
                onClick={fetchData}
                className="p-1 text-rose-400 hover:text-rose-600 bg-white border border-rose-100 rounded-lg transition-colors"
                title="Tải lại"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                Đang tải...
              </div>
            ) : !stats || stats.productStats.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                Chưa có đơn hàng.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-rose-50/40 text-slate-600 text-[10px] uppercase font-extrabold border-b border-rose-100">
                    <tr>
                      <th className="py-2 px-2">Top</th>
                      <th className="py-2 px-2">Tên món</th>
                      <th className="py-2 px-2 text-center">Đã bán</th>
                      <th className="py-2 px-2 text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50">
                    {stats.productStats.map((item, idx) => (
                      <tr key={idx} className="hover:bg-rose-50/30 transition-colors">
                        <td className="py-2 px-2 font-bold text-slate-400 whitespace-nowrap">
                          #{idx + 1}
                        </td>
                        <td className="py-2 px-2 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <ProductIcon name={item.productName} className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{item.productName}</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center font-black text-rose-600 whitespace-nowrap">
                          {item.totalQuantitySold} cái
                        </td>
                        <td className="py-2 px-2 text-right font-extrabold text-slate-900 whitespace-nowrap">
                          {formatVND(item.totalRevenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDER HISTORY */}
        {activeTab === 'orders' && (
          <div className="space-y-1.5">
            {loading ? (
              <div className="bg-white p-6 rounded-xl border border-rose-100 text-center text-slate-500 text-xs">
                Đang tải...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border border-rose-100 text-center text-slate-500 text-xs">
                Chưa có đơn.
              </div>
            ) : (
              orders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const formattedDate = new Date(order.createdAt).toLocaleString('vi-VN');

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border border-rose-100 shadow-xs overflow-hidden transition-all"
                  >
                    <div
                      onClick={() => toggleExpandOrder(order.id)}
                      className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-rose-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1 bg-rose-100 text-rose-900 font-mono text-[10px] font-black rounded shrink-0">
                          {order.orderCode}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Calendar className="w-3 h-3 text-rose-400 shrink-0" />
                            <span className="truncate">{formattedDate}</span>
                          </div>
                          <div className="text-xs font-bold text-slate-800 truncate">
                            {order.items.length} món ({order.items.reduce((a, b) => a + b.quantity, 0)} cái)
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-right shrink-0">
                        <span className="text-xs font-black text-rose-600">
                          {formatVND(order.totalSellingPrice)}
                        </span>

                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-2 bg-rose-50/40 border-t border-rose-100 space-y-1">
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="p-1.5 bg-white rounded border border-rose-100 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-1 min-w-0">
                                <ProductIcon name={item.productName} className="w-3 h-3 shrink-0" />
                                <span className="font-bold text-slate-900 truncate text-[11px]">{item.productName}</span>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="font-black text-slate-900 text-[11px]">
                                  {item.quantity} x {formatVND(item.sellingPrice)} = {formatVND(item.sellingPrice * item.quantity)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      <ProductSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        products={[]}
        onProductAdded={fetchData}
      />
    </div>
  );
}
