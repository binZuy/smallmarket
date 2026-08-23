'use client';

import { useState } from 'react';
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
  products: Product[];
  onProductAdded: () => void;
}

export default function ProductSidebar({
  isOpen,
  onClose,
  products,
  onProductAdded,
}: ProductSidebarProps) {
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
          unit,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Có lỗi xảy ra khi thêm sản phẩm');
      }

      setName('');
      setSellingPrice('');
      setCostPrice('');
      setUnit('cái');
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
    setEditSelling(product.sellingPrice.toString());
    setEditCost(product.costPrice.toString());
  };

  const saveEditedProduct = async (id: string) => {
    try {
      setUpdateLoading(true);
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          sellingPrice: Number(editSelling) || 0,
          costPrice: Number(editCost) || 0,
        }),
      });

      if (!res.ok) {
        throw new Error('Lỗi khi cập nhật sản phẩm');
      }

      setEditingId(null);
      onProductAdded();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const deleteProduct = async (id: string, productName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa "${productName}" khỏi danh sách?`)) return;

    try {
      setUpdateLoading(true);
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Lỗi khi xóa sản phẩm');
      }

      onProductAdded();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full sm:max-w-md bg-[#fdf7f4] h-full shadow-2xl flex flex-col border-l border-rose-100">
        {/* Sidebar Header */}
        <div className="p-4 bg-[#2d1b22] text-white flex items-center justify-between border-b border-[#422933]">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-300" />
            <h2 className="text-base sm:text-lg font-bold">Thêm & Quản Lý Mặt Hàng</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-[#422933] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Form thêm mới */}
          <form onSubmit={handleSubmitNewProduct} className="bg-white p-4 rounded-xl border border-rose-100 space-y-3 shadow-xs">
            <h3 className="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Thêm mặt hàng mới</span>
            </h3>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên mặt hàng <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên sản phẩm..."
                className="w-full px-3 py-2 bg-rose-50/50 border border-rose-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giá bán (VNĐ)
              </label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-rose-50/50 border border-rose-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-medium"
              />
            </div>

            {/* Hidden cost price field for admin DB record */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Giá nhập (Lưu DB - Ẩn trên màn hình chính)
              </label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-rose-50/30 border border-rose-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-300 text-slate-600 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-300 hover:to-rose-300 text-slate-950 font-black text-xs sm:text-sm rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Save className="w-4 h-4 text-slate-950" />
              )}
              <span>Lưu Mặt Hàng</span>
            </button>
          </form>

          {/* Sửa / Quản lý danh sách sản phẩm hiện tại */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black text-rose-950 uppercase tracking-wider">
              Danh sách sản phẩm hiện tại ({products.length})
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {products.map((p) => {
                const isEditing = editingId === p.id;

                return (
                  <div
                    key={p.id}
                    className="p-3 bg-white rounded-xl border border-rose-100 text-sm transition-all"
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
                            <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Giá bán</label>
                            <input
                              type="number"
                              value={editSelling}
                              onChange={(e) => setEditSelling(e.target.value)}
                              className="w-full px-2 py-1 border border-rose-200 rounded"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Giá nhập (DB)</label>
                            <input
                              type="number"
                              value={editCost}
                              onChange={(e) => setEditCost(e.target.value)}
                              className="w-full px-2 py-1 border border-rose-200 rounded"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => deleteProduct(p.id, p.name)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded text-xs flex items-center gap-1 font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa
                          </button>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={() => saveEditedProduct(p.id)}
                              disabled={updateLoading}
                              className="px-2.5 py-1 text-xs bg-rose-500 text-white rounded font-bold flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Lưu
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <ProductIcon name={p.name} className="w-4 h-4 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">{p.name}</span>
                            <span className="text-xs font-extrabold text-rose-500">
                              {p.sellingPrice > 0 ? formatVND(p.sellingPrice) : 'Chưa có giá'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => startEditProduct(p)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg shrink-0 flex items-center gap-1 text-xs font-bold"
                          title="Sửa sản phẩm"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
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
