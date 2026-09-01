export type ShiftType = 'DAY' | 'NIGHT' | 'OFF';

export type ShiftStatus = 
  | 'NORMAL'        // เวรปกติของตัวเอง
  | 'SWAPPED_OUT'   // สลับเวรให้คนอื่นไปทำแทน
  | 'SWAPPED_IN'    // สลับเวรมาทำให้คนอื่น
  | 'SOLD'          // ขายเวรให้คนอื่น (ไม่นับ ชม./ไม่รับเงิน)
  | 'TAKEN';        // รับเวรจากคนอื่นมาทำ (นับ ชม. และได้เงินเพิ่ม)

export interface Shift {
  id: string;             // YYYY-MM-DD หรือ ID
  date: string;           // YYYY-MM-DD
  type: ShiftType;        // DAY, NIGHT, OFF
  isHoliday?: boolean;    // วันหยุดนักขัตฤกษ์ / วันหยุดราชการ (สำหรับคำนวณเงินเวรดึก 420 บาท)
  status: ShiftStatus;    // สถานะเวร
  partnerName?: string;   // ชื่อเพื่อนร่วมงานกรณี สลับ/ขาย/รับเวร
  note?: string;          // บันทึกเพิ่มเติม
  customRate?: number;    // กรณีมีเรทพิเศษเพิ่มเติม
}

export interface MonthSummary {
  monthKey: string;          // YYYY-MM
  totalHours: number;        // ชั่วโมงรวม
  hasPjrBonus: boolean;      // ครบ 100 ชม. หรือไม่
  pjrBonusAmount: number;    // เงิน พจร. (8,000 บาท เมื่อครบ 100 ชม.)
  
  dayShiftCount: number;     // จำนวนเวรกลางวัน
  dayShiftEarnings: number;  // รายรับเวรกลางวัน (420 บาท/เวร)
  
  nightShiftWeekdayCount: number; // จำนวนเวรกลางคืนวันธรรมดา (400 บาท/เวร)
  nightShiftWeekendCount: number; // จำนวนเวรกลางคืน ส-อา/วันหยุด (420 บาท/เวร)
  nightShiftEarnings: number;     // รายรับเวรกลางคืนรวม
  
  totalDutyEarnings: number; // รายรับค่าเวรรวม (ไม่รวม พจร.)
  netTotalEarnings: number;  // รายรับรวมสุทธิ (ค่าเวร + พจร.)
  
  targetHours: number;       // 100 ชั่วโมง
  hoursRemaining: number;    // ชั่วโมงที่ขาดก่อนครบ 100 ชม.
  progressPercentage: number;// % ความคืบหน้าถึง 100 ชม.
}

export interface NotificationConfig {
  enabled: boolean;
  dayShiftReminderTime: string;
  nightShiftReminderTime: string;
  advanceReminderHours: number;
}