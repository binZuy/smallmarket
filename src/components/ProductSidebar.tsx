'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Save, Edit2, Check, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { formatVND } from '@/lib/utils';
import ProductIcon from './ProductIcon';

interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  unit: string;
}

interface ProductSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
  onProductAdded: () => void;
}

export default function ProductSidebar({
  isOpen,
  onClose,
  products: initialProducts,
  onProductAdded,
}: ProductSidebarProps) {
  const [productList, setProductList] = useState<Product[]>(initialProducts || []);
  const [loadingList, setLoadingList] = useState(false);

  // New product state
  const [name, setName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [unit, setUnit] = useState('cái');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Editing state for existing products
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSelling, setEditSelling] = useState('');
  const [editCost, setEditCost] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  // Fetch all products automatically when sidebar is opened
  const loadSidebarProducts = async () => {
    try {
      setLoadingList(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProductList(data);
      }
    } catch (err) {
      console.error('Error fetching sidebar products:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSidebarProducts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmitNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên mặt hàng');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          costPrice: Number(costPrice) || 0,
          sellingPrice: Number(sellingPrice) || 0,
          unit: unit || 'cái',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Lỗi thêm sản phẩm');
      }

      setName('');
      setSellingPrice('');
      setCostPrice('');
      setUnit('cái');
      await loadSidebarProducts();
      onProductAdded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditProduct = (product: Product) => {
    setEditingId(product.id);
    setEditName(product.name);
    setEditSelling(product.sellingPrice > 0 ? product.sellingPrice.toString() : '');
    setEditCost(product.costPrice > 0 ? product.costPrice.toString() : '');
  };

  const saveEditedProduct = async (id: string) => {
    try {
      setUpdateLoading(true);
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim() || undefined,
          sellingPrice: editSelling === '' ? 0 : Number(editSelling),
          costPrice: editCost === '' ? 0 : Number(editCost),
        }),
      });

      if (!res.ok) {
        throw new Error('Lỗi cập nhật');
      }

      setEditingId(null);
      await loadSidebarProducts();
      onProductAdded();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu sản phẩm');
    } finally {
      setUpdateLoading(false);
    }
  };

  const deleteProduct = async (id: string, productName: string) => {
    if (!confirm(`Xóa "${productName}"?`)) return;

    try {
      setUpdateLoading(true);
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Lỗi khi xóa');
      }

      await loadSidebarProducts();
      onProductAdded();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full sm:max-w-md bg-[#fdf7f4] h-full shadow-2xl flex flex-col border-l border-rose-100">
        {/* Sidebar Header */}
        <div className="p-3.5 bg-[#2d1b22] text-white flex items-center justify-between border-b border-[#422933]">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-300" />
            <h2 className="text-sm sm:text-base font-bold">Thêm & Quản Lý Sản Phẩm</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-[#422933] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {/* Form Thêm Mới */}
          <form onSubmit={handleSubmitNewProduct} className="bg-white p-3.5 rounded-xl border border-rose-100 space-y-2.5 shadow-xs">
            <h3 className="text-xs font-black text-rose-900 uppercase tracking-wider">
              Thêm mặt hàng mới
            </h3>

            {error && (
              <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Tên mặt hàng
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên sản phẩm mới..."
                className="w-full px-2.5 py-1.5 bg-rose-50/50 border border-rose-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-rose-300 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Giá bán (VNĐ)
                </label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 bg-rose-50/50 border border-rose-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-rose-300 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                  Giá nhập (VNĐ)
                </label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 bg-rose-50/30 border border-rose-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-rose-300 text-slate-600 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-300 hover:to-rose-300 text-slate-950 font-black text-xs rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
              ) : (
                <Save className="w-3.5 h-3.5 text-slate-950" />
              )}
              <span>Lưu Mặt Hàng Mới</span>
            </button>
          </form>

          {/* Sửa Các Sản Phẩm Đã Seed / Hiện Có */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-rose-950 uppercase tracking-wider">
                Sửa Giá Sản Phẩm Hiện Có ({productList.length})
              </h3>
              {loadingList && <RefreshCw className="w-3 h-3 text-rose-400 animate-spin" />}
            </div>

            <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
              {productList.map((p) => {
                const isEditing = editingId === p.id;

                return (
                  <div
                    key={p.id}
                    className="p-2.5 bg-white rounded-xl border border-rose-100 text-xs transition-all"
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Tên sản phẩm</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2 py-1 border border-rose-200 rounded text-xs font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Giá bán (VNĐ)</label>
                            <input
                              type="number"
                              value={editSelling}
                              onChange={(e) => setEditSelling(e.target.value)}
                              placeholder="0"
                              className="w-full px-2 py-1 border border-rose-200 rounded font-bold text-rose-600"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Giá nhập (VNĐ)</label>
                            <input
                              type="number"
                              value={editCost}
                              onChange={(e) => setEditCost(e.target.value)}
                              placeholder="0"
                              className="w-full px-2 py-1 border border-rose-200 rounded"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => deleteProduct(p.id, p.name)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded text-[11px] flex items-center gap-1 font-semibold"
                          >
                            <Trash2 className="w-3 h-3" /> Xóa
                          </button>

                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100 rounded"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={() => saveEditedProduct(p.id)}
                              disabled={updateLoading}
                              className="px-2.5 py-1 text-[11px] bg-rose-500 text-white rounded font-bold flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Lưu Giá
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <ProductIcon name={p.name} className="w-4 h-4 shrink-0" />
                          <div className="min-w-0 flex-1 flex items-baseline gap-1.5">
                            <span className="font-bold text-slate-900 truncate text-xs">{p.name}</span>
                            <span className={`text-xs font-extrabold shrink-0 ${p.sellingPrice > 0 ? 'text-rose-500' : 'text-amber-600 bg-amber-50 px-1 rounded text-[10px]'}`}>
                              {p.sellingPrice > 0 ? formatVND(p.sellingPrice) : 'Chưa giá'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => startEditProduct(p)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-md shrink-0 flex items-center gap-1 text-xs font-bold"
                          title="Sửa giá"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Sửa Giá</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
