import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cửa Hàng Tiện Ích - Học viện công nghệ Bưu chính viễn thông',
  description:
    'Phần mềm quản lý bán hàng & tick đơn hàng cửa hàng tiện ích Tầng 1 B5 KTX PTIT',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-slate-100 text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
