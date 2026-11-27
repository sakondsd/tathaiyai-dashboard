import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts';
import { Droplets, CloudRain, Activity } from 'lucide-react';
import {
  formatThaiDate,
  formatShortDateTick,
  formatThaiMonth,
  getWaterAlertStatus,
} from '../utils/csvData';

function RainfallTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{formatThaiDate(item.date)}</p>
      <p className="text-sky-600 font-medium">
        ปริมาณฝน: <span className="font-bold">{item.rainfall.toFixed(2)}</span> มม.
      </p>
    </div>
  );
}

function VolumeTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-1">เดือน {formatThaiMonth(item.month)}</p>
      <p className="text-indigo-600 font-medium">
        ปริมาตรปลายเดือน:{' '}
        <span className="font-bold">{Number(item.endVolume).toLocaleString()}</span> ลบ.ม.
      </p>
    </div>
  );
}

export default function LeftColumn({ latestDay, rainStats, filteredDaily, filteredMonthly }) {
  const status = getWaterAlertStatus(latestDay?.waterLevel);

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Latest Status Card (Amber-Orange Header) */}
      <section className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="bg-amber-500 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
            <Activity className="w-4 h-4" />
            <span>สถานะล่าสุด</span>
          </div>
          <span className="text-xs font-medium bg-white/20 text-white px-2.5 py-0.5 rounded-full">
            {latestDay ? formatThaiDate(latestDay.date) : '-'}
          </span>
        </div>

        <div className="p-4">
          {latestDay ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">ระดับน้ำปัจจุบัน</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-slate-900">
                      {latestDay.waterLevel.toFixed(2)}
                    </span>
                    <span className="text-xs font-medium text-slate-500">ม.รทก.</span>
                  </div>
                </div>

                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold ${status.badgeClass}`}
                >
                  <span className="text-base leading-none">{status.emoji}</span>
                  <span>{status.label}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 rounded-lg px-3 py-2">
                  <span className="text-slate-500 block">ปริมาณฝนวันล่าสุด</span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {latestDay.rainfall.toFixed(2)} มม.
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg px-3 py-2">
                  <span className="text-slate-500 block">เกณฑ์สถานะ</span>
                  <span className="font-semibold text-slate-800 text-xs">{status.detail}</span>
                </div>
              </div>

              {/* Threshold Legend */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-1">
                  <span>🟢</span>
                  <span>ปกติ (275.15–280.49)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🟡</span>
                  <span>ภัยแล้ง (&lt;= 275.14)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🟠</span>
                  <span>ท่วมระดับ 1 (&gt;= 280.50)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🔴</span>
                  <span>วิกฤต (&gt;= 281.50)</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">ไม่พบข้อมูลล่าสุด</p>
          )}
        </div>
      </section>

      {/* 2. Rainfall Summary 3 Boxes */}
      <section className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <CloudRain className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-800">สรุปปริมาณฝน (มม.)</h2>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-sky-50 border border-sky-100 rounded-lg p-2.5 text-center">
            <p className="text-[11px] font-medium text-sky-700">สูงสุด</p>
            <p className="text-lg sm:text-xl font-bold text-sky-900 mt-0.5">
              {rainStats.max.toFixed(1)}
            </p>
            <p className="text-[10px] text-sky-600">มม.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-center">
            <p className="text-[11px] font-medium text-slate-600">ต่ำสุด</p>
            <p className="text-lg sm:text-xl font-bold text-slate-800 mt-0.5">
              {rainStats.min.toFixed(1)}
            </p>
            <p className="text-[10px] text-slate-500">มม.</p>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 text-center">
            <p className="text-[11px] font-medium text-indigo-700">ฝนรวม</p>
            <p className="text-lg sm:text-xl font-bold text-indigo-900 mt-0.5">
              {rainStats.total.toFixed(1)}
            </p>
            <p className="text-[10px] text-indigo-600">มม.</p>
          </div>
        </div>
      </section>

      {/* 3. Rainfall Line Chart */}
      <section className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-500" />
            <h2 className="text-sm font-bold text-slate-800">ปริมาณฝน (มม.)</h2>
          </div>
          <span className="text-[11px] text-slate-400">{filteredDaily.length} วัน</span>
        </div>

        <div className="w-full h-52 sm:h-56">
          {filteredDaily.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredDaily} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDateTick}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  minTickGap={24}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<RainfallTooltip />} />
                <Line
                  type="monotone"
                  dataKey="rainfall"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={filteredDaily.length <= 31 ? { r: 2.5, fill: '#0284c7' } : false}
                  activeDot={{ r: 5, fill: '#0369a1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              ไม่มีข้อมูลในช่วงวันที่เลือก
            </div>
          )}
        </div>
      </section>

      {/* 4. End-of-Month Volume Bar Chart */}
      <section className="bg-white rounded-xl shadow-xs border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-800">ปริมาตรปลายเดือน (ลบ.ม.)</h2>
          <span className="text-[11px] text-slate-400">รายเดือน</span>
        </div>

        <div className="w-full h-60 sm:h-64">
          {filteredMonthly.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredMonthly}
                margin={{ top: 22, right: 10, left: 0, bottom: 4 }}
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
                  tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip content={<VolumeTooltip />} />
                <Bar dataKey="endVolume" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={44}>
                  <LabelList
                    dataKey="endVolume"
                    position="top"
                    formatter={(val) =>
                      val === 0 ? '0' : `${(val / 1000).toFixed(0)}k`
                    }
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
      </section>
    </div>
  );
}
