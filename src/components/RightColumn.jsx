import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  LabelList,
} from 'recharts';
import {
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronLeft,
  ChevronRight,
  Table as TableIcon,
  TrendingUp,
} from 'lucide-react';
import {
  ALERT_THRESHOLDS,
  formatThaiDate,
  formatShortDateTick,
  formatThaiMonth,
  getWaterAlertStatus,
} from '../utils/csvData';

const PAGE_SIZE = 10;

function WaterLevelTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  const status = getWaterAlertStatus(item.waterLevel);
  return (
    <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{formatThaiDate(item.date)}</p>
      <p className="text-blue-700 font-medium">
        ระดับน้ำ: <span className="font-bold">{item.waterLevel.toFixed(2)}</span> ม.รทก.
      </p>
      <p className="text-slate-600 mt-0.5">
        ปริมาณฝน: <span className="font-semibold">{item.rainfall.toFixed(2)}</span> มม.
      </p>
      <p className="mt-1 font-medium">
        {status.emoji} {status.label}
      </p>
    </div>
  );
}

function ChangeTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  const val = item.changeM;
  return (
    <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">เดือน {formatThaiMonth(item.month)}</p>
      <p className={`font-bold ${val >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
        เปลี่ยนแปลง: {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)} ม.
      </p>
    </div>
  );
}

export default function RightColumn({
  minDate,
  maxDate,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onPresetRange,
  waterStats,
  filteredDaily,
  filteredMonthly,
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when filtered data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, filteredDaily.length]);

  const sortedDescDaily = useMemo(() => {
    return [...filteredDaily].sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredDaily]);

  const totalPages = Math.max(1, Math.ceil(sortedDescDaily.length / PAGE_SIZE));
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedDescDaily.slice(start, start + PAGE_SIZE);
  }, [sortedDescDaily, currentPage]);

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Date Range Filter + Max/Min Water Level Cards */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Date Filter Card */}
        <div className="xl:col-span-6 bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#802A52]" />
              <h2 className="text-sm font-bold text-slate-800">เลือกช่วงวันที่</h2>
            </div>
            <div className="flex items-center gap-1">
              {[
                { label: 'ทั้งหมด', days: null },
                { label: '30 วัน', days: 30 },
                { label: '90 วัน', days: 90 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onPresetRange(preset.days)}
                  className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                จากวันที่
              </label>
              <input
                type="date"
                value={startDate}
                min={minDate}
                max={endDate || maxDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#802A52]/30 focus:border-[#802A52]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                ถึงวันที่
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || minDate}
                max={maxDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#802A52]/30 focus:border-[#802A52]"
              />
            </div>
          </div>
        </div>

        {/* Max & Min Water Level Cards */}
        <div className="xl:col-span-6 grid grid-cols-2 gap-3">
          {/* Max Water Level */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-slate-700">ระดับน้ำสูงสุด</span>
              <ArrowUpCircle className="w-5 h-5 text-blue-600 shrink-0" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold text-blue-700">
                  {waterStats.max !== null ? waterStats.max.toFixed(2) : '-'}
                </span>
                <span className="text-xs text-slate-500">ม.รทก.</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                วันที่: {waterStats.maxDate ? formatThaiDate(waterStats.maxDate) : '-'}
              </p>
            </div>
          </div>

          {/* Min Water Level */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-slate-700">ระดับน้ำต่ำสุด</span>
              <ArrowDownCircle className="w-5 h-5 text-amber-600 shrink-0" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-bold text-amber-700">
                  {waterStats.min !== null ? waterStats.min.toFixed(2) : '-'}
                </span>
                <span className="text-xs text-slate-500">ม.รทก.</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                วันที่: {waterStats.minDate ? formatThaiDate(waterStats.minDate) : '-'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Water Level Area Chart (270 - 285 with 3 threshold dashed lines) */}
      <section className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm sm:text-base font-bold text-slate-800">
              ระดับน้ำ (ม.รทก.)
            </h2>
          </div>

          {/* Inline Reference Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1 text-red-600 font-medium">
              <span className="w-3 border-t-2 border-dashed border-red-600 inline-block" />
              วิกฤต 281.50
            </span>
            <span className="inline-flex items-center gap-1 text-orange-600 font-medium">
              <span className="w-3 border-t-2 border-dashed border-orange-500 inline-block" />
              เตือนท่วม 280.50
            </span>
            <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
              <span className="w-3 border-t-2 border-dashed border-amber-500 inline-block" />
              ภัยแล้ง 275.14
            </span>
          </div>
        </div>

        <div className="w-full h-64 sm:h-72">
          {filteredDaily.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredDaily}
                margin={{ top: 10, right: 16, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="waterLevelGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDateTick}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  minTickGap={28}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[270, 285]}
                  ticks={[270, 273, 276, 279, 282, 285]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<WaterLevelTooltip />} />
                <ReferenceLine
                  y={ALERT_THRESHOLDS.FLOOD_CRITICAL}
                  stroke="#dc2626"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                />
                <ReferenceLine
                  y={ALERT_THRESHOLDS.FLOOD_WARN_1}
                  stroke="#f97316"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                />
                <ReferenceLine
                  y={ALERT_THRESHOLDS.DROUGHT_WARN}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="waterLevel"
                  stroke="#0284c7"
                  strokeWidth={2.2}
                  fillOpacity={1}
                  fill="url(#waterLevelGradient)"
                  activeDot={{ r: 5, fill: '#0369a1' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              ไม่มีข้อมูลในช่วงวันที่เลือก
            </div>
          )}
        </div>
      </section>

      {/* 3. Bottom Row: Monthly Change Bar Chart (Left) + Historical Table (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Bottom Left: Monthly Change (ม.) */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800">เปลี่ยนแปลง (ม.)</h2>
            <span className="text-[11px] text-slate-400">รายเดือน</span>
          </div>

          <div className="w-full h-64 sm:h-72 flex-1">
            {filteredMonthly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredMonthly}
                  margin={{ top: 20, right: 10, left: -16, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickFormatter={formatThaiMonth}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChangeTooltip />} />
                  <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.2} />
                  <Bar dataKey="changeM" maxBarSize={36} radius={[3, 3, 3, 3]}>
                    {filteredMonthly.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.changeM >= 0 ? '#10b981' : '#ef4444'}
                      />
                    ))}
                    <LabelList
                      dataKey="changeM"
                      position="top"
                      formatter={(val) => (val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2))}
                      style={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                ไม่มีข้อมูลรายเดือนในช่วงวันที่เลือก
              </div>
            )}
          </div>
        </div>

        {/* Bottom Right: Historical Data Table (10 rows per page, newest first) */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-[#802A52]" />
              <h2 className="text-sm font-bold text-slate-800">ตารางข้อมูลย้อนหลัง</h2>
            </div>
            <span className="text-[11px] text-slate-500">
              ทั้งหมด {sortedDescDaily.length} รายการ
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs sm:text-[13px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="py-2 px-2.5 font-semibold whitespace-nowrap">วันที่</th>
                  <th className="py-2 px-2.5 font-semibold text-right whitespace-nowrap">
                    ระดับน้ำ (ม.รทก.)
                  </th>
                  <th className="py-2 px-2.5 font-semibold text-right whitespace-nowrap">
                    ปริมาณฝน (มม.)
                  </th>
                  <th className="py-2 px-2.5 font-semibold text-center whitespace-nowrap">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedRows.length > 0 ? (
                  pagedRows.map((row) => {
                    const rowStatus = getWaterAlertStatus(row.waterLevel);
                    return (
                      <tr key={row.date} className="hover:bg-slate-50/80 transition">
                        <td className="py-2 px-2.5 font-medium text-slate-700 whitespace-nowrap">
                          {formatThaiDate(row.date)}
                        </td>
                        <td className="py-2 px-2.5 text-right font-semibold text-slate-900 tabular-nums">
                          {row.waterLevel.toFixed(2)}
                        </td>
                        <td className="py-2 px-2.5 text-right text-slate-700 tabular-nums">
                          {row.rainfall.toFixed(2)}
                        </td>
                        <td className="py-2 px-2.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${rowStatus.badgeClass}`}
                          >
                            <span>{rowStatus.emoji}</span>
                            <span>{rowStatus.label}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      ไม่มีข้อมูลในช่วงวันที่เลือก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {sortedDescDaily.length > 0 && (
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                หน้า {currentPage} / {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>ก่อนหน้า</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>ถัดไป</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
