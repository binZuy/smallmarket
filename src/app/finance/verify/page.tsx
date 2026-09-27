import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { ArrowLeft, Download, ImageIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function VerifyHandwrittenPage() {
  // Read images directly from public directory (Server Component)
  const imageDir = path.join(process.cwd(), 'public', 'image');
  let images: string[] = [];
  
  try {
    if (fs.existsSync(imageDir)) {
      images = fs.readdirSync(imageDir).filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
    }
  } catch (error) {
    console.error("Error reading image directory:", error);
  }

  return (
    <div className="min-h-screen bg-[#F0FDF4] font-sans text-gray-900 pb-12">
      <Navbar />
      <div className="max-w-6xl mx-auto space-y-6 mt-4 p-4 md:p-8 pt-0">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/finance" className="p-2 bg-white rounded-full shadow-sm hover:bg-green-50 transition-colors">
            <ArrowLeft className="w-6 h-6 text-green-700" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-green-800">
            Đối Chiếu Sổ Tay & Hình Ảnh
          </h1>
        </div>

        {/* Action Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-green-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Dữ liệu chi tiết bóc tách từ ảnh</h2>
            <p className="text-gray-500 text-sm">Tải file Excel/CSV về để dò lại từng con số do máy tự động luận chữ viết tay.</p>
          </div>
          <a 
            href="/chitiet_sotay.csv" 
            download
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow transition-all active:scale-95 whitespace-nowrap"
          >
            <Download className="w-5 h-5" />
            Tải File Đối Chiếu (.CSV)
          </a>
        </div>

        {/* Image Gallery */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-800">Ảnh Sổ Tay Đã Tải Lên ({images.length})</h2>
          </div>
          
          <div className="p-6">
            {images.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                Không tìm thấy hình ảnh nào trong thư mục.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((img, index) => (
                  <div key={index} className="group relative rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-gray-100 aspect-[3/4]">
                    <a href={`/image/${img}`} target="_blank" rel="noreferrer" title="Bấm để xem ảnh gốc">
                      {/* Using standard img tag for simplicity since sizes vary */}
                      <img 
                        src={`/image/${img}`} 
                        alt={`Sổ tay ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="bg-black/70 text-white px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm shadow-lg">
                          Xem chi tiết
                        </span>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
