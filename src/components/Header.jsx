import React from 'react';
import { RefreshCw } from 'lucide-react';
import { RESERVOIR_IMAGES } from '../utils/csvData';

export default function Header({ onRefresh, loading, lastUpdated }) {
  return (
    <header className="w-full bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 py-3">
        <div className="flex flex-col lg:flex-row items-stretch gap-3">
          {/* Left: 2 Reservoir Images */}
          <div className="grid grid-cols-2 gap-2.5 lg:w-[360px] xl:w-[400px] shrink-0">
            {RESERVOIR_IMAGES.map((img, idx) => (
              <div
                key={idx}
                className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 h-24 sm:h-28 lg:h-full min-h-[96px] shadow-xs"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            ))}
          </div>

          {/* Right: Maroon Banner (#802A52) */}
          <div
            className="flex-1 rounded-lg px-5 py-4 sm:px-7 sm:py-5 flex flex-col justify-center relative overflow-hidden shadow-xs"
            style={{ backgroundColor: '#802A52' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-white text-xl sm:text-2xl lg:text-[26px] font-bold tracking-tight leading-snug">
                  รายงานข้อมูล ระดับน้ำ อ่างเก็บน้ำตาดไฮใหญ่
                </h1>
                <p className="text-pink-100/95 text-sm sm:text-base font-medium mt-1">
                  ศูนย์ศึกษาการพัฒนาภูพานอันเนื่องมาจากพระราชดำริ จังหวัดสกลนคร
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                {lastUpdated && (
                  <span className="hidden xl:inline-block text-xs text-pink-100/80 bg-black/15 px-2.5 py-1 rounded-md">
                    อัปเดตล่าสุด: {lastUpdated}
                  </span>
                )}
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium bg-white/15 hover:bg-white/25 text-white border border-white/20 transition cursor-pointer disabled:opacity-60"
                  title="รีเฟรชข้อมูล"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>รีเฟรช</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
