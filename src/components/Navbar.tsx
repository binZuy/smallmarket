'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, BarChart3, PlusCircle, Store, Banknote } from 'lucide-react';

interface NavbarProps {
  onOpenAddSidebar?: () => void;
}

export default function Navbar({ onOpenAddSidebar }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-[#2d1b22] text-white shadow-md border-b border-[#422933]">
      <div className="max-w-5xl mx-auto px-2.5 sm:px-6">
        <div className="flex items-center justify-between h-13 sm:h-15">
          {/* Super short brand title */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="p-1.5 bg-gradient-to-tr from-amber-400 to-rose-400 rounded-lg text-slate-950 font-bold flex items-center justify-center">
              <Store className="w-4 h-4 text-slate-950" />
            </div>
            <span className="font-black text-xs sm:text-base tracking-tight text-white whitespace-nowrap hidden sm:block">
              Cửa Hàng
            </span>
          </Link>

          {/* Ultra short nav links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                pathname === '/'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                  : 'text-rose-100/80 hover:bg-[#3d252e]'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Bán Hàng</span>
            </Link>

            <Link
              href="/orders"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                pathname === '/orders'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                  : 'text-rose-100/80 hover:bg-[#3d252e]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Thống Kê</span>
            </Link>

            <Link
              href="/finance"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                pathname === '/finance'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                  : 'text-rose-100/80 hover:bg-[#3d252e]'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Sổ Quỹ</span>
            </Link>

            {onOpenAddSidebar && (
              <button
                onClick={onOpenAddSidebar}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs transition-all active:scale-95 whitespace-nowrap"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
