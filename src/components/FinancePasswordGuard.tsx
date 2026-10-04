'use client';

import { useState, useEffect } from 'react';
import { Lock, KeyRound, ShieldAlert, LogOut } from 'lucide-react';

interface FinancePasswordGuardProps {
  children: React.ReactNode;
}

export default function FinancePasswordGuard({ children }: FinancePasswordGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check session storage on initial render
    const authStatus = sessionStorage.getItem('finance_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'binzuy') {
      sessionStorage.setItem('finance_authenticated', 'true');
      setIsAuthenticated(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Mật khẩu không chính xác! Vui lòng thử lại.');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('finance_authenticated');
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    // Loading check state
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="animate-pulse font-bold text-lg">Đang xác thực...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Sổ Thu Chi Bảo Mật</h2>
            <p className="text-sm text-slate-400 mt-1">
              Nhập mật khẩu quản trị viên để truy cập trang Sổ Thu Chi.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Mật Khẩu Truy Cập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent font-medium transition-all"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold animate-shake">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Xác Nhận Truy Cập</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <span className="text-xs text-slate-500 font-medium">Hệ thống quản lý Cửa Hàng SmallMarket</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Floating Logout Button on authenticated pages if needed */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 hover:bg-slate-900 text-rose-400 border border-slate-700/80 rounded-full shadow-lg backdrop-blur-md text-xs font-bold transition-all hover:scale-105 active:scale-95"
          title="Khóa Sổ Thu Chi"
        >
          <LogOut className="w-4 h-4" />
          <span>Khóa Sổ</span>
        </button>
      </div>
      {children}
    </div>
  );
}
