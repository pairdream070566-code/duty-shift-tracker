import type { Shift, MonthSummary } from '../types/shift';
import { parseISO, getDay } from 'date-fns';

// ชั่วโมงต่อเวร
export const DAY_SHIFT_HOURS = 8;     // 08:30 - 16:30 น.
export const NIGHT_SHIFT_HOURS = 16;  // 16:30 - 08:30 น.

// ค่าตอบแทนต่อเวร
export const DAY_SHIFT_RATE = 420;             // กลางวัน ทุกวัน 420 บาท
export const NIGHT_SHIFT_WEEKDAY_RATE = 400;   // กลางคืน วันธรรมดา (จ-ศ) 400 บาท
export const NIGHT_SHIFT_WEEKEND_RATE = 420;   // กลางคืน เสาร์-อาทิตย์ / วันหยุดราชการ 420 บาท

// เกณฑ์เงิน พจร.
export const PJR_TARGET_HOURS = 100;
export const PJR_BONUS_AMOUNT = 8000;

/**
 * ตรวจสอบว่าเป็นวันหยุดเสาร์-อาทิตย์ หรือไม่
 * 0 = วันอาทิตย์, 6 = วันเสาร์
 */
export const isWeekend = (dateStr: string): boolean => {
  try {
    const day = getDay(parseISO(dateStr));
    return day === 0 || day === 6;
  } catch {
    return false;
  }
};

/**
 * คำนวณชั่วโมงและค่าตอบแทนของเวรแต่ละรายการ
 */
export const calculateSingleShift = (shift: Shift): { hours: number; earnings: number; isWeekendOrHoliday: boolean } => {
  if (shift.type === 'OFF' || shift.status === 'SOLD' || shift.status === 'SWAPPED_OUT') {
    return { hours: 0, earnings: 0, isWeekendOrHoliday: false };
  }

  const isWeekendDay = isWeekend(shift.date);
  const isWeekendOrHoliday = isWeekendDay || Boolean(shift.isHoliday);

  let hours = 0;
  let earnings = 0;

  if (shift.type === 'DAY') {
    hours = DAY_SHIFT_HOURS;
    earnings = shift.customRate !== undefined ? shift.customRate : DAY_SHIFT_RATE;
  } else if (shift.type === 'NIGHT') {
    hours = NIGHT_SHIFT_HOURS;
    if (shift.customRate !== undefined) {
      earnings = shift.customRate;
    } else {
      earnings = isWeekendOrHoliday ? NIGHT_SHIFT_WEEKEND_RATE : NIGHT_SHIFT_WEEKDAY_RATE;
    }
  }

  return { hours, earnings, isWeekendOrHoliday };
};

/**
 * คำนวณสรุปสถิติประจำเดือน (ชั่วโมงรวม, ค่าเวร, เงิน พจร., รายได้สุทธิ)
 */
export const calculateMonthSummary = (monthKey: string, shifts: Shift[]): MonthSummary => {
  // กรองเฉพาะเวรในเดือนนี้ (monthKey รูปแบบ YYYY-MM)
  const monthShifts = shifts.filter(s => s.date.startsWith(monthKey));

  let totalHours = 0;
  let dayShiftCount = 0;
  let dayShiftEarnings = 0;
  let nightShiftWeekdayCount = 0;
  let nightShiftWeekendCount = 0;
  let nightShiftEarnings = 0;

  monthShifts.forEach(shift => {
    // หากเป็นเวรที่ขายออกไป หรือสลับให้คนอื่นไปทำ จะไม่นับชั่วโมงและเงิน
    if (shift.type === 'OFF' || shift.status === 'SOLD' || shift.status === 'SWAPPED_OUT') {
      return;
    }

    const { hours, earnings, isWeekendOrHoliday } = calculateSingleShift(shift);
    totalHours += hours;

    if (shift.type === 'DAY') {
      dayShiftCount += 1;
      dayShiftEarnings += earnings;
    } else if (shift.type === 'NIGHT') {
      if (isWeekendOrHoliday) {
        nightShiftWeekendCount += 1;
      } else {
        nightShiftWeekdayCount += 1;
      }
      nightShiftEarnings += earnings;
    }
  });

  const totalDutyEarnings = dayShiftEarnings + nightShiftEarnings;
  const hasPjrBonus = totalHours >= PJR_TARGET_HOURS;
  
  // คำนวณเงิน พจร. ตามสัดส่วนชั่วโมงจริง (ชั่วโมง / 100 * 8,000 บาท สูงสุดไม่เกิน 8,000 บาท)
  const pjrBonusAmount = Math.min(PJR_BONUS_AMOUNT, Math.round((totalHours / PJR_TARGET_HOURS) * PJR_BONUS_AMOUNT));
  
  // รายได้สุทธิ = ค่าเวรรวม + เงิน พจร. ตามสัดส่วน
  const netTotalEarnings = totalDutyEarnings + pjrBonusAmount;

  const hoursRemaining = Math.max(0, PJR_TARGET_HOURS - totalHours);
  const progressPercentage = Math.min(100, Math.round((totalHours / PJR_TARGET_HOURS) * 100));

  return {
    monthKey,
    totalHours,
    hasPjrBonus,
    pjrBonusAmount,
    dayShiftCount,
    dayShiftEarnings,
    nightShiftWeekdayCount,
    nightShiftWeekendCount,
    nightShiftEarnings,
    totalDutyEarnings,
    netTotalEarnings,
    targetHours: PJR_TARGET_HOURS,
    hoursRemaining,
    progressPercentage,
  };
};
