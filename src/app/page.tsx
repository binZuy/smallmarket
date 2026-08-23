'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProductSidebar from '@/components/ProductSidebar';
import ProductIcon from '@/components/ProductIcon';
import { formatVND } from '@/lib/utils';
import {
  CheckSquare,
  Square,
  Search,
  CheckCircle2,
  Plus,
  Minus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  unit: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, CartItem>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Fetch products from database
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products by search query
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle tick product
  const toggleTickProduct = (product: Product) => {
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[product.id]) {
        delete copy[product.id];
      } else {
        copy[product.id] = { ...product, quantity: 1 };
      }
      return copy;
    });
  };

  // Update item quantity in selection
  const updateQuantity = (id: string, delta: number) => {
    setSelectedItems((prev) => {
      if (!prev[id]) return prev;
      const newQty = prev[id].quantity + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return {
        ...prev,
        [id]: { ...prev[id], quantity: newQty },
      };
    });
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedItems({});
  };

  // Calculate totals
  const tickedList = Object.values(selectedItems);
  const totalSellingPrice = tickedList.reduce(
    (acc, item) => acc + item.sellingPrice * item.quantity,
    0
  );
  const totalQuantity = tickedList.reduce((acc, item) => acc + item.quantity, 0);

  // Submit Order
  const handleCheckoutOrder = async () => {
    if (tickedList.length === 0) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: tickedList.map((item) => ({
            productId: item.id,
            name: item.name,
            costPrice: item.costPrice,
            sellingPrice: item.sellingPrice,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error('Lỗi khi tạo đơn hàng');
      }

      const orderData = await res.json();
      setOrderSuccess(orderData.orderCode);
      setSelectedItems({});

      setTimeout(() => {
        setOrderSuccess(null);
      }, 4000);
    } catch (err: any) {
      alert(err.message || 'Không thể thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf7f4] flex flex-col font-sans pb-28">
      <Navbar onOpenAddSidebar={() => setIsSidebarOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-2.5 sm:px-6 py-3 space-y-2.5">
        {/* Toast Alert */}
        {orderSuccess && (
          <div className="p-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl shadow-md flex items-center justify-between animate-pop">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-amber-200 shrink-0" />
              <span className="font-bold text-xs">Đã lưu: {orderSuccess}</span>
            </div>
            <button
              onClick={() => setOrderSuccess(null)}
              className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Short Header & Search Row */}
        <div className="bg-white p-2.5 sm:p-3.5 rounded-xl shadow-xs border border-rose-100 flex items-center justify-between gap-2">
          <h1 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight shrink-0">
            Sản Phẩm
          </h1>

          {/* Search Box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-rose-300 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1.5 text-xs bg-rose-50/50 border border-rose-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-300 font-medium"
            />
          </div>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-lg shadow-xs flex items-center gap-0.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm</span>
          </button>

          <button
            onClick={fetchProducts}
            className="p-1.5 text-rose-400 hover:text-rose-600 bg-rose-50 rounded-lg transition-colors shrink-0"
            title="Tải lại"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* ULTRA-COMPACT 1-LINE PRODUCT CARDS WITH COMFORTABLE PADDING */}
        {loading ? (
          <div className="bg-white p-8 rounded-xl border border-rose-100 text-center space-y-1">
            <RefreshCw className="w-5 h-5 text-rose-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Đang tải...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-rose-100 text-center space-y-2">
            <p className="text-xs font-bold text-slate-600">Không thấy sản phẩm</p>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-lg inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm Mới
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredProducts.map((p) => {
              const isSelected = !!selectedItems[p.id];
              const cartItem = selectedItems[p.id];

              return (
                <div
                  key={p.id}
                  onClick={() => toggleTickProduct(p)}
                  className={`px-3 py-3 sm:py-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-rose-50 to-amber-50 border-rose-300 ring-1 ring-rose-300 shadow-xs'
                      : 'bg-white border-rose-100 hover:border-rose-200'
                  }`}
                >
                  {/* Single Row: Checkbox + Icon + Name + Price with comfortable padding */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4.5 h-4.5 text-rose-500 fill-rose-100" />
                      ) : (
                        <Square className="w-4.5 h-4.5 text-slate-300" />
                      )}
                    </div>

                    <ProductIcon name={p.name} className="w-4.5 h-4.5 shrink-0" />

                    <div className="min-w-0 flex-1 flex items-baseline gap-2 truncate">
                      <span className={`font-bold text-xs sm:text-sm truncate ${isSelected ? 'text-rose-950 font-black' : 'text-slate-800'}`}>
                        {p.name}
                      </span>

                      <span className="text-xs font-black text-rose-500 shrink-0">
                        {p.sellingPrice > 0 ? formatVND(p.sellingPrice) : 'Chưa giá'}
                      </span>
                    </div>
                  </div>

                  {/* Inline Stepper right next to name */}
                  {isSelected && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 bg-white border border-rose-200 rounded-lg p-1 shrink-0 shadow-2xs"
                    >
                      <button
                        onClick={() => updateQuantity(p.id, -1)}
                        className="p-1 hover:bg-rose-100 rounded text-rose-700 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-1.5 font-black text-xs text-slate-900 min-w-[14px] text-center">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(p.id, 1)}
                        className="p-1 hover:bg-rose-100 rounded text-rose-700 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Sticky Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#2d1b22] text-white border-t border-[#422933] shadow-2xl">
        <div className="max-w-5xl mx-auto px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Short Summary */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 bg-rose-950 text-amber-300 rounded-lg shrink-0">
                <ShoppingBag className="w-4.5 h-4.5" />
              </div>

              <div className="min-w-0">
                <div className="text-[10px] text-rose-200 font-bold truncate">
                  {totalQuantity} món chọn
                </div>
                <div className="text-sm font-black text-white truncate">
                  {formatVND(totalSellingPrice)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {totalQuantity > 0 && (
                <button
                  onClick={clearSelection}
                  className="px-2.5 py-1.5 text-xs text-rose-200 hover:text-white bg-[#422933] rounded-lg font-bold"
                >
                  Xóa
                </button>
              )}

              <button
                onClick={handleCheckoutOrder}
                disabled={totalQuantity === 0 || submitting}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 font-black text-xs rounded-lg shadow-sm flex items-center gap-1 active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                )}
                <span>Chốt Đơn</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProductSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        products={products}
        onProductAdded={fetchProducts}
      />
    </div>
  );
}
