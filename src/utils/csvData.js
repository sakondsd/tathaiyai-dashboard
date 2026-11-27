import Papa from 'papaparse';

export const DAILY_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-6hvmhzPAcqn-KWshRVZKhhFBJMF2eqVoF6wfBJpogpPysHZiq-Fim_zRyAGgkzqtKhkRAB0Xikqw/pub?gid=0&single=true&output=csv';

export const MONTHLY_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-6hvmhzPAcqn-KWshRVZKhhFBJMF2eqVoF6wfBJpogpPysHZiq-Fim_zRyAGgkzqtKhkRAB0Xikqw/pub?gid=123456789&single=true&output=csv';

export const RESERVOIR_IMAGES = [
  {
    src: '/images/Tathhaiyai_img1.png',
    alt: 'อ่างเก็บน้ำตาดไฮใหญ่ ภาพที่ 1',
  },
  {
    src: '/images/Tathhaiyai_img2.png',
    alt: 'อ่างเก็บน้ำตาดไฮใหญ่ ภาพที่ 2',
  },
];

export const ALERT_THRESHOLDS = {
  FLOOD_CRITICAL: 281.5,
  FLOOD_WARN_1: 280.5,
  DROUGHT_WARN: 275.14,
};

export function getWaterAlertStatus(waterLevel) {
  if (waterLevel == null || Number.isNaN(waterLevel)) {
    return {
      code: 'unknown',
      emoji: '⚪',
      label: 'ไม่มีข้อมูล',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      dotClass: 'bg-slate-400',
    };
  }
  if (waterLevel >= ALERT_THRESHOLDS.FLOOD_CRITICAL) {
    return {
      code: 'critical',
      emoji: '🔴',
      label: 'วิกฤตน้ำท่วม',
      detail: `>= ${ALERT_THRESHOLDS.FLOOD_CRITICAL.toFixed(2)} ม.รทก.`,
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
      dotClass: 'bg-red-500',
    };
  }
  if (waterLevel >= ALERT_THRESHOLDS.FLOOD_WARN_1) {
    return {
      code: 'flood_warn',
      emoji: '🟠',
      label: 'เตือนท่วมระดับ 1',
      detail: `>= ${ALERT_THRESHOLDS.FLOOD_WARN_1.toFixed(2)} ม.รทก.`,
      badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
      dotClass: 'bg-orange-500',
    };
  }
  if (waterLevel <= ALERT_THRESHOLDS.DROUGHT_WARN) {
    return {
      code: 'drought',
      emoji: '🟡',
      label: 'เตือนภัยแล้ง',
      detail: `<= ${ALERT_THRESHOLDS.DROUGHT_WARN.toFixed(2)} ม.รทก.`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      dotClass: 'bg-amber-400',
    };
  }
  return {
    code: 'normal',
    emoji: '🟢',
    label: 'ปกติ',
    detail: '275.15 - 280.49 ม.รทก.',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  };
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const cleaned = String(value).replace(/,/g, '').trim();
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function findColumnValue(row, keywords) {
  const keys = Object.keys(row);
  for (const kw of keywords) {
    const found = keys.find((k) => k.replace(/\s+/g, ' ').trim().includes(kw));
    if (found !== undefined) return row[found];
  }
  return undefined;
}

function parseCsvUrl(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0 && results.data.length === 0) {
          reject(new Error(results.errors[0].message));
          return;
        }
        resolve(results.data || []);
      },
      error: (err) => reject(err),
    });
  });
}

export async function fetchDashboardData() {
  const [rawDaily, rawMonthly] = await Promise.all([
    parseCsvUrl(DAILY_CSV_URL),
    parseCsvUrl(MONTHLY_CSV_URL),
  ]);

  const daily = rawDaily
    .map((row) => {
      const dateStr = String(findColumnValue(row, ['วันที่', 'Date']) ?? '').trim();
      const waterLevel = toNumber(findColumnValue(row, ['ระดับน้ำ']));
      const rainfall = toNumber(findColumnValue(row, ['ปริมาณฝน'])) ?? 0;
      const volume = toNumber(findColumnValue(row, ['ปริมาตรน้ำ']));
      const capacityPct = toNumber(findColumnValue(row, ['% ความจุ']));
      const alertText = String(findColumnValue(row, ['การแจ้งเตือน']) ?? '').trim();

      if (!dateStr || !/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return null;
      const normalizedDate = dateStr.slice(0, 10);

      return {
        date: normalizedDate,
        waterLevel,
        rainfall,
        volume,
        capacityPct,
        alertText,
      };
    })
    .filter((item) => item && item.waterLevel !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  const monthly = rawMonthly
    .map((row) => {
      const month = String(findColumnValue(row, ['Month', 'เดือน']) ?? '').trim();
      const changeM = toNumber(findColumnValue(row, ['เปลี่ยนแปลง (ม.)']));
      const endVolume = toNumber(findColumnValue(row, ['ปริมาตรปลายเดือน']));
      const beginLevel = toNumber(findColumnValue(row, ['Begin_Level']));
      const endLevel = toNumber(findColumnValue(row, ['End_Level']));
      const totalRain = toNumber(findColumnValue(row, ['Total_Rain']));

      if (!month) return null;

      return {
        month,
        changeM: changeM ?? 0,
        endVolume: endVolume ?? 0,
        beginLevel,
        endLevel,
        totalRain,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.month.localeCompare(b.month));

  return { daily, monthly };
}

const THAI_SHORT_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export function formatThaiDate(isoDate) {
  if (!isoDate) return '-';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = Number(parts[0]) + 543;
  const monthIdx = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  if (monthIdx < 0 || monthIdx > 11 || Number.isNaN(day)) return isoDate;
  return `${day} ${THAI_SHORT_MONTHS[monthIdx]} ${year}`;
}

export function formatShortDateTick(isoDate) {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const monthIdx = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  return `${day} ${THAI_SHORT_MONTHS[monthIdx] || parts[1]}`;
}

export function formatThaiMonth(ym) {
  if (!ym) return '';
  const parts = ym.split('-');
  if (parts.length !== 2) return ym;
  const year = (Number(parts[0]) + 543).toString().slice(-2);
  const monthIdx = Number(parts[1]) - 1;
  return `${THAI_SHORT_MONTHS[monthIdx] || parts[1]} ${year}`;
}
