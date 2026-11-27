import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import LeftColumn from './components/LeftColumn';
import RightColumn from './components/RightColumn';
import { fetchDashboardData, formatThaiDate } from './utils/csvData';

export default function App() {
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { daily, monthly } = await fetchDashboardData();
      setDailyData(daily);
      setMonthlyData(monthly);

      if (daily.length > 0) {
        const first = daily[0].date;
        const last = daily[daily.length - 1].date;
        setStartDate((prev) => prev || first);
        setEndDate((prev) => prev || last);
        setLastUpdated(formatThaiDate(last));
      }
    } catch (err) {
      setError(err?.message || 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const minDate = dailyData.length > 0 ? dailyData[0].date : '';
  const maxDate = dailyData.length > 0 ? dailyData[dailyData.length - 1].date : '';
  const latestDay = dailyData.length > 0 ? dailyData[dailyData.length - 1] : null;

  const handlePresetRange = (days) => {
    if (!maxDate || !minDate) return;
    if (days === null) {
      setStartDate(minDate);
      setEndDate(maxDate);
      return;
    }
    const endObj = new Date(maxDate);
    endObj.setDate(endObj.getDate() - (days - 1));
    const candidate = endObj.toISOString().slice(0, 10);
    setStartDate(candidate < minDate ? minDate : candidate);
    setEndDate(maxDate);
  };

  const filteredDaily = useMemo(() => {
    return dailyData.filter((d) => {
      if (startDate && d.date < startDate) return false;
      if (endDate && d.date > endDate) return false;
      return true;
    });
  }, [dailyData, startDate, endDate]);

  const filteredMonthly = useMemo(() => {
    const startYm = startDate ? startDate.slice(0, 7) : '';
    const endYm = endDate ? endDate.slice(0, 7) : '';
    return monthlyData.filter((m) => {
      if (startYm && m.month < startYm) return false;
      if (endYm && m.month > endYm) return false;
      return true;
    });
  }, [monthlyData, startDate, endDate]);

  const rainStats = useMemo(() => {
    if (filteredDaily.length === 0) {
      return { max: 0, min: 0, total: 0 };
    }
    let max = -Infinity;
    let min = Infinity;
    let total = 0;
    for (const d of filteredDaily) {
      if (d.rainfall > max) max = d.rainfall;
      if (d.rainfall < min) min = d.rainfall;
      total += d.rainfall;
    }
    return { max, min, total };
  }, [filteredDaily]);

  const waterStats = useMemo(() => {
    if (filteredDaily.length === 0) {
      return { max: null, min: null, maxDate: '', minDate: '' };
    }
    let max = -Infinity;
    let min = Infinity;
    let maxD = '';
    let minD = '';
    for (const d of filteredDaily) {
      if (d.waterLevel > max) {
        max = d.waterLevel;
        maxD = d.date;
      }
      if (d.waterLevel < min) {
        min = d.waterLevel;
        minD = d.date;
      }
    }
    return { max, min, maxDate: maxD, minDate: minD };
  }, [filteredDaily]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header onRefresh={loadData} loading={loading} lastUpdated={lastUpdated} />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-5 py-4 sm:py-5">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
            <span>เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</span>
            <button
              type="button"
              onClick={loadData}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 self-start cursor-pointer"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {loading && dailyData.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-pulse">
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="h-48 bg-white rounded-xl border border-slate-200" />
              <div className="h-32 bg-white rounded-xl border border-slate-200" />
              <div className="h-60 bg-white rounded-xl border border-slate-200" />
              <div className="h-64 bg-white rounded-xl border border-slate-200" />
            </div>
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="h-28 bg-white rounded-xl border border-slate-200" />
              <div className="h-80 bg-white rounded-xl border border-slate-200" />
              <div className="h-72 bg-white rounded-xl border border-slate-200" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-4">
              <LeftColumn
                latestDay={latestDay}
                rainStats={rainStats}
                filteredDaily={filteredDaily}
                filteredMonthly={filteredMonthly}
              />
            </div>

            <div className="lg:col-span-8">
              <RightColumn
                minDate={minDate}
                maxDate={maxDate}
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onPresetRange={handlePresetRange}
                waterStats={waterStats}
                filteredDaily={filteredDaily}
                filteredMonthly={filteredMonthly}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
