const fs = require('fs');

const statsContent = import React, { useEffect } from react;
import { useShiftContext } from ../context/ShiftContext;
import { Award, Clock, DollarSign, Sun, Moon, CheckCircle, AlertCircle, Sparkles } from lucide-react;
import confetti from canvas-confetti;

export const StatsDashboard: React.FC = () => {
  const { monthSummary } = useShiftContext();

  useEffect(() => {
    if (monthSummary.hasPjrBonus) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [monthSummary.hasPjrBonus]);

  return (
    <div className=space-y-4 mb-6>
      {/* การ์ดเงิน พจร. & หลอดวัด 100 ชั่วโมง */}
      <div className={p-5 rounded-2xl border transition-all duration-300  + (
        monthSummary.hasPjrBonus 
          ? bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-sky-500/10 border-emerald-400/40 shadow-sm
          : bg-white border-slate-200 shadow-sm
      )}>
        <div className=flex items-start justify-between>
          <div>
            <div className=flex items-center gap-2>
              <span className={p-2 rounded-xl  + (monthSummary.hasPjrBonus ? bg-emerald-500 text-white : bg-amber-100 text-amber-700)}>
                <Award className=w-5 h-5 />
              </span>
              <div>
                <h3 className=font-bold text-slate-800 text-base>เป้าหมายเงิน พจร. (8,000 บาท)</h3>
                <p className=text-xs text-slate-500>เกณฑ์: เข้าเวรสะสมตั้งแต่ 100 ชั่วโมงขึ้นไปในเดือนนี้</p>
              </div>
            </div>
          </div>
          <div className=text-right>
            {monthSummary.hasPjrBonus ? (
              <span className=inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200>
                <CheckCircle className=w-3.5 h-3.5 /> ผ่านเกณฑ์ (+8,000 บ.)
              </span>
            ) : (
              <span className=inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200>
                <AlertCircle className=w-3.5 h-3.5 /> ขาดอีก {monthSummary.hoursRemaining} ชม.
              </span>
            )}
          </div>
        </div>

        {/* หลอด Progress Bar */}
        <div className=mt-4>
          <div className=flex justify-between text-xs font-medium mb-1.5>
            <span className=text-slate-600 flex items-center gap-1>
              <Clock className=w-3.5 h-3.5 text-slate-400 />
              ชั่วโมงสะสม: <strong className=text-slate-800 font-bold>{monthSummary.totalHours}</strong> / {monthSummary.targetHours} ชม.
            </span>
            <span className={font-bold  + (monthSummary.hasPjrBonus ? text-emerald-600 : text-sky-600)}>
              {monthSummary.progressPercentage}%
            </span>
          </div>
          <div className=w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200>
            <div
              className={h-full rounded-full transition-all duration-700  + (
                monthSummary.hasPjrBonus
                  ? bg-gradient-to-r from-emerald-500 to-teal-400
                  : bg-gradient-to-r from-sky-500 to-indigo-500
              )}
              style={{ width: monthSummary.progressPercentage + % }}
            />
          </div>
        </div>
      </div>

      {/* กริดสรุปรายได้รวมและสถิติเวร */}
      <div className=grid grid-cols-2 sm:grid-cols-4 gap-3>
        {/* รายได้สุทธิประจำเดือน */}
        <div className=col-span-2 sm:col-span-1 bg-gradient-to-br from-sky-600 to-indigo-700 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between>
          <div className=flex items-center justify-between opacity-80>
            <span className=text-xs font-medium>รายได้สุทธิเดือนนี้</span>
            <DollarSign className=w-4 h-4 />
          </div>
          <div className=mt-2>
            <div className=text-2xl font-black tracking-tight>
              ฿{monthSummary.netTotalEarnings.toLocaleString()}
            </div>
            <div className=text-[11px] opacity-80 mt-0.5>
              {monthSummary.hasPjrBonus ? (ค่าเวร + พจร. 8,000 บ.) : (ยังไม่รวมเงิน พจร.)}
            </div>
          </div>
        </div>

        {/* ค่าเวรรวม (ไม่รวม พจร.) */}
        <div className=bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between>
          <div className=flex items-center justify-between text-slate-500>
            <span className=text-xs font-medium>ค่าเวรรวม</span>
            <Sparkles className=w-4 h-4 text-amber-500 />
          </div>
          <div className=mt-2>
            <div className=text-xl font-bold text-slate-800>
              ฿{monthSummary.totalDutyEarnings.toLocaleString()}
            </div>
            <div className=text-[11px] text-slate-500 mt-0.5>
              รวม {monthSummary.dayShiftCount + monthSummary.nightShiftWeekdayCount + monthSummary.nightShiftWeekendCount} ผลัด
            </div>
          </div>
        </div>

        {/* เวรกลางวัน */}
        <div className=bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between>
          <div className=flex items-center justify-between text-amber-600>
            <span className=text-xs font-medium>เวรกลางวัน (8 ชม.)</span>
            <Sun className=w-4 h-4 text-amber-500 />
          </div>
          <div className=mt-2>
            <div className=text-xl font-bold text-slate-800>
              {monthSummary.dayShiftCount} <span className=text-xs font-normal text-slate-500>เวร</span>
            </div>
            <div className=text-[11px] text-amber-700 font-medium mt-0.5>
              ฿{monthSummary.dayShiftEarnings.toLocaleString()} (420บ./เวร)
            </div>
          </div>
        </div>

        {/* เวรกลางคืน */}
        <div className=bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between>
          <div className=flex items-center justify-between text-indigo-600>
            <span className=text-xs font-medium>เวรกลางคืน (16 ชม.)</span>
            <Moon className=w-4 h-4 text-indigo-500 />
          </div>
          <div className=mt-2>
            <div className=text-xl font-bold text-slate-800>
              {monthSummary.nightShiftWeekdayCount + monthSummary.nightShiftWeekendCount} <span className=text-xs font-normal text-slate-500>เวร</span>
            </div>
            <div className=text-[11px] text-indigo-700 font-medium mt-0.5>
              ฿{monthSummary.nightShiftEarnings.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
;

const notifContent = import { Shift, NotificationConfig } from ../types/shift;
import { format } from date-fns;

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!(Notification in window)) {
    console.warn(เบราว์เซอร์นี้ไม่รองรับ Notification);
    return false;
  }

  if (Notification.permission === granted) {
    return true;
  }

  if (Notification.permission !== denied) {
    const permission = await Notification.requestPermission();
    return permission === granted;
  }

  return false;
};

export const sendDutyNotification = (title: string, options?: NotificationOptions) => {
  if (!(Notification in window) || Notification.permission !== granted) {
    return;
  }

  try {
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          icon: /pwa-192x192.png,
          badge: /pwa-192x192.png,
          ...options,
        });
      });
    } else {
      new Notification(title, {
        icon: /pwa-192x192.png,
        ...options,
      });
    }
  } catch (e) {
    console.error(ส่งแจ้งเตือนไม่สำเร็จ:, e);
  }
};

export const checkTodayDutyNotification = (shifts: Shift[], config: NotificationConfig) => {
  if (!config.enabled) return;

  const todayStr = format(new Date(), yyyy-MM-dd);
  const todayShift = shifts.find(s => s.date === todayStr);

  if (!todayShift || todayShift.type === OFF || todayShift.status === SOLD || todayShift.status === SWAPPED_OUT) {
    return;
  }

  const shiftName = todayShift.type === DAY ? เวรกลางวัน (08:30 - 16:30 น.) : เวรกลางคืน (16:30 - 08:30 น.);
  const statusNote = todayShift.status === TAKEN ?  (รับเวรมา) : todayShift.status === SWAPPED_IN ?  (สลับเวรมา) : ";

 sendDutyNotification(🔔 แจ้งเตือนเข้าเวรวันนี้!, {
 body: วันนี้คุณมี  + shiftName + statusNote +  อย่าลืมเตรียมตัวให้พร้อมนะครับ!,
 tag: duty-today- + todayStr,
 });
};
;

const shiftModalContent = import React, { useState, useEffect } from react;
import { Shift, ShiftType, ShiftStatus } from ../types/shift;
import { useShiftContext } from ../context/ShiftContext;
import { isWeekend, calculateSingleShift } from ../utils/calculator;
import { X, Sun, Moon, Calendar, User, FileText, Check, Trash2, ArrowLeftRight, ShoppingCart, UserCheck } from lucide-react;
import { format, parseISO } from date-fns;
import { th } from date-fns/locale;

interface ShiftModalProps {
 isOpen: boolean;
 onClose: () => void;
 selectedDate: string; // YYYY-MM-DD
}

export const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, selectedDate }) => {
 const { getShiftByDate, addOrUpdateShift, deleteShift } = useShiftContext();

 const existingShift = getShiftByDate(selectedDate);
 const isWeekendDay = isWeekend(selectedDate);

 const [type, setType] = useState<ShiftType>(DAY);
 const [status, setStatus] = useState<ShiftStatus>(NORMAL);
 const [isHoliday, setIsHoliday] = useState<boolean>(false);
 const [partnerName, setPartnerName] = useState<string>();
 const [note, setNote] = useState<string>();

 useEffect(() => {
 if (existingShift) {
 setType(existingShift.type);
 setStatus(existingShift.status);
 setIsHoliday(Boolean(existingShift.isHoliday));
 setPartnerName(existingShift.partnerName || );
 setNote(existingShift.note || );
 } else {
 setType(DAY);
 setStatus(NORMAL);
 setIsHoliday(false);
 setPartnerName();
 setNote();
 }
 }, [existingShift, selectedDate, isOpen]);

 if (!isOpen) return null;

 const tempShift: Shift = {
 id: selectedDate,
 date: selectedDate,
 type,
 status,
 isHoliday,
 partnerName,
 note,
 };

 const preview = calculateSingleShift(tempShift);
 const formattedDate = format(parseISO(selectedDate), EEEEที่ d MMMM yyyy, { locale: th });

 const handleSave = () => {
 addOrUpdateShift({
 id: selectedDate,
 date: selectedDate,
 type,
 status,
 isHoliday: isHoliday,
 partnerName: partnerName.trim() || undefined,
 note: note.trim() || undefined,
 });
 onClose();
 };

 const handleDelete = () => {
 deleteShift(selectedDate);
 onClose();
 };

 return (
 <div className=fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn>
 <div className=bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]>
 {/* Header */}
 <div className=bg-gradient-to-r from-sky-600 to-indigo-600 p-5 text-white flex items-center justify-between>
 <div className=flex items-center gap-2.5>
 <div className=p-2 bg-white/15 rounded-xl backdrop-blur-md>
 <Calendar className=w-5 h-5 text-white />
 </div>
 <div>
 <h2 className=font-bold text-lg leading-tight>บันทึกเวรประจำวัน</h2>
 <p className=text-xs text-sky-100 mt-0.5 capitalize>{formattedDate}</p>
 </div>
 </div>
 <button
 onClick={onClose}
 className=p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors
 >
 <X className=w-5 h-5 />
 </button>
 </div>

 {/* Content */}
 <div className=p-5 overflow-y-auto space-y-5 flex-1>
 {/* เลือกประเภทเวร */}
 <div>
 <label className=block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider>
 ประเภทเวร
 </label>
 <div className=grid grid-cols-3 gap-2.5>
 <button
 type=button
 onClick={() => setType(DAY)}
 className={flex flex-col items-center p-3 rounded-2xl border-2 transition-all  + (
 type === DAY
 ? border-amber-500 bg-amber-50/70 text-amber-900 shadow-sm
 : border-slate-200 hover:border-slate-300 text-slate-600
 )}
 >
 <Sun className={w-6 h-6 mb-1  + (type === DAY ? text-amber-500 : text-slate-400)} />
 <span className=font-bold text-sm>เวรกลางวัน</span>
 <span className=text-[11px] text-slate-500>08:30-16:30 (8 ชม.)</span>
 <span className=text-[11px] font-semibold text-amber-600 mt-0.5>420 บาท</span>
 </button>

 <button
 type=button
 onClick={() => setType(NIGHT)}
 className={flex flex-col items-center p-3 rounded-2xl border-2 transition-all  + (
 type === NIGHT
 ? border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm
 : border-slate-200 hover:border-slate-300 text-slate-600
 )}
 >
 <Moon className={w-6 h-6 mb-1  + (type === NIGHT ? text-indigo-600 : text-slate-400)} />
 <span className=font-bold text-sm>เวรกลางคืน</span>
 <span className=text-[11px] text-slate-500>16:30-08:30 (16 ชม.)</span>
 <span className=text-[11px] font-semibold text-indigo-600 mt-0.5>
 {isWeekendDay || isHoliday ? 420 บาท (วันหยุด) : 400 บาท (จ-ศ)}
 </span>
 </button>

 <button
 type=button
 onClick={() => setType(OFF)}
 className={flex flex-col items-center p-3 rounded-2xl border-2 transition-all  + (
 type === OFF
 ? border-slate-500 bg-slate-100 text-slate-900 shadow-sm
 : border-slate-200 hover:border-slate-300 text-slate-600
 )}
 >
 <div className=w-6 h-6 mb-1 flex items-center justify-center font-black text-slate-400>✕</div>
 <span className=font-bold text-sm>วันหยุด (OFF)</span>
 <span className=text-[11px] text-slate-500>ไม่มีเวร</span>
 <span className=text-[11px] font-semibold text-slate-400 mt-0.5>0 บาท</span>
 </button>
 </div>
 </div>

 {/* สวิตช์วันหยุดราชการ */}
 {type !== OFF && (
 <div className=flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl>
 <div>
 <span className=text-sm font-semibold text-slate-800 flex items-center gap-1.5>
 🏖️ วันหยุดราชการ / นักขัตฤกษ์
 </span>
 <p className=text-xs text-slate-500 mt-0.5>
 {isWeekendDay 
 ? (วันนี้เป็นวันเสาร์-อาทิตย์ เรทวันหยุดอัตโนมัติ)
 : ติ๊กหากเป็นวันหยุดราชการ เพื่อคิดเรทเวรดึก 420 บาท}
 </p>
 </div>
 <label className=relative inline-flex items-center cursor-pointer>
 <input
 type=checkbox
 checked={isHoliday || isWeekendDay}
 disabled={isWeekendDay}
 onChange={(e) => setIsHoliday(e.target.checked)}
 className=sr-only peer
 />
 <div className=w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600></div>
 </label>
 </div>
 )}

 {/* สถานะเวร */}
 {type !== OFF && (
 <div>
 <label className=block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider>
 สถานะการเข้าเวร
 </label>
 <div className=grid grid-cols-2 sm:grid-cols-3 gap-2>
 {[
 { key: NORMAL, label: เวรตัวเอง, icon: Check, color: sky },
 { key: TAKEN, label: รับเวรมา (+เงิน/+ชม.), icon: UserCheck, color: emerald },
 { key: SOLD, label: ขายเวร (ไม่นับ), icon: ShoppingCart, color: rose },
 { key: SWAPPED_IN, label: สลับมาทำให้ (+ชม.), icon: ArrowLeftRight, color: indigo },
 { key: SWAPPED_OUT, label: สลับให้คนอื่นทำ, icon: ArrowLeftRight, color: amber },
 ].map(item => {
 const Icon = item.icon;
 const isSelected = status === item.key;
 return (
 <button
 key={item.key}
 type=button
 onClick={() => setStatus(item.key as ShiftStatus)}
 className={flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all  + (
 isSelected 
 ? border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-500/20
 : border-slate-200 text-slate-700 hover:bg-slate-50
 )}
 >
 <Icon className=w-4 h-4 flex-shrink-0 />
 <span>{item.label}</span>
 </button>
 );
 })}
 </div>
 </div>
 )}

 {/* ชื่อเพื่อนร่วมงาน */}
 {type !== OFF && status !== NORMAL && (
 <div className=p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-2xl space-y-2>
 <label className=text-xs font-bold text-amber-900 flex items-center gap-1.5>
 <User className=w-4 h-4 text-amber-600 />
 ชื่อเพื่อนร่วมงาน (ที่สลับ / ขาย / รับเวร)
 </label>
 <input
 type=text
 value={partnerName}
 onChange={(e) => setPartnerName(e.target.value)}
 placeholder=เช่น น้องเมย์, พี่ยุ้ย
 className=w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500
 />
 </div>
 )}

 {/* โน้ต */}
 <div>
 <label className=block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider flex items-center gap-1>
 <FileText className=w-3.5 h-3.5 text-slate-400 />
 บันทึกช่วยจำ (ถ้ามี)
 </label>
 <input
 type=text
 value={note}
 onChange={(e) => setNote(e.target.value)}
 placeholder=เช่น เวรขึ้นตึก 4, อยู่จุดคัดกรอง
 className=w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500
 />
 </div>

 {/* กล่องสรุปผล */}
 {type !== OFF && (
 <div className=p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between>
 <div>
 <span className=text-xs text-slate-400>สรุปผลของวันนี้</span>
 <div className=font-semibold text-sm text-slate-200>
 {status === SOLD || status === SWAPPED_OUT ? (
 <span className=text-rose-300>ไม่นับชั่วโมงและค่าเวร</span>
 ) : (
 <span>นับสะสม <strong>+{preview.hours}</strong> ชั่วโมง</span>
 )}
 </div>
 </div>
 <div className=text-right>
 <span className=text-xs text-slate-400>ค่าเวร</span>
 <div className=text-lg font-black text-emerald-400>
 ฿{preview.earnings.toLocaleString()}
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Footer */}
 <div className=p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3>
 {existingShift ? (
 <button
 type=button
 onClick={handleDelete}
 className=px-3 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors
 >
 <Trash2 className=w-4 h-4 />
 ลบเวรนี้
 </button>
 ) : <div />}

 <div className=flex items-center gap-2>
 <button
 type=button
 onClick={onClose}
 className=px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors
 >
 ยกเลิก
 </button>
 <button
 type=button
 onClick={handleSave}
 className=px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5
 >
 <Check className=w-4 h-4 />
 บันทึกข้อมูล
 </button>
 </div>
 </div>
 </div>
 </div>
 );
};
;

fs.writeFileSync(src/components/StatsDashboard.tsx, statsContent, utf8);
fs.writeFileSync(src/utils/notifications.ts, notifContent, utf8);
fs.writeFileSync(src/components/ShiftModal.tsx, shiftModalContent, utf8);
console.log(All components written cleanly!);