import React, { useState, useEffect } from 'react';
import { useShiftContext } from '../context/ShiftContext';
import type { Shift, ShiftType, ShiftStatus } from '../types/shift';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { X, Sun, Moon, Coffee, Trash2 } from 'lucide-react';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, selectedDate }) => {
  const { getShiftByDate, addOrUpdateShift, deleteShift } = useShiftContext();
  const existingShift = getShiftByDate(selectedDate);

  const [shiftType, setShiftType] = useState<ShiftType>('DAY');
  const [status, setStatus] = useState<ShiftStatus>('NORMAL');
  const [isHoliday, setIsHoliday] = useState<boolean>(false);
  const [partnerName, setPartnerName] = useState<string>('');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (existingShift) {
      setShiftType(existingShift.type);
      setStatus(existingShift.status);
      setIsHoliday(Boolean(existingShift.isHoliday));
      setPartnerName(existingShift.partnerName || '');
      setNote(existingShift.note || '');
    } else {
      setShiftType('DAY');
      setStatus('NORMAL');
      setIsHoliday(false);
      setPartnerName('');
      setNote('');
    }
  }, [existingShift, selectedDate]);

  if (!isOpen) return null;

  const dateFormatted = format(parseISO(selectedDate), 'EEEEที่ d MMMM yyyy', { locale: th });

  const handleSave = () => {
    const shiftData: Shift = {
      id: existingShift ? existingShift.id : selectedDate,
      date: selectedDate,
      type: shiftType,
      status,
      isHoliday,
      partnerName: status !== 'NORMAL' ? partnerName : undefined,
      note: note || undefined,
    };

    addOrUpdateShift(shiftData);
    onClose();
  };

  const handleDelete = () => {
    if (existingShift) {
      deleteShift(existingShift.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              {existingShift ? 'แก้ไขบันทึกเวร' : '+ บันทึกเวรใหม่'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{dateFormatted}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              ประเภทเวร
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setShiftType('DAY')}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                  shiftType === 'DAY'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="font-bold text-xs">เวรเช้า</span>
                <span className="text-[10px] opacity-80">08:30-16:30 (8 ชม.)</span>
              </button>

              <button
                type="button"
                onClick={() => setShiftType('NIGHT')}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                  shiftType === 'NIGHT'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="font-bold text-xs">เวรดึก</span>
                <span className="text-[10px] opacity-80">16:30-08:30 (16 ชม.)</span>
              </button>

              <button
                type="button"
                onClick={() => setShiftType('OFF')}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                  shiftType === 'OFF'
                    ? 'bg-slate-700 text-white border-slate-800 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Coffee className="w-5 h-5" />
                <span className="font-bold text-xs">วันหยุด</span>
                <span className="text-[10px] opacity-80">ไม่มีเวร</span>
              </button>
            </div>
          </div>

          {shiftType !== 'OFF' && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
              <div>
                <span className="text-xs font-bold text-slate-800">วันหยุดราชการ / นักขัตฤกษ์</span>
                <p className="text-[11px] text-slate-500">เวรดึกวันหยุด = 420 บ. (วันธรรมดา 400 บ.)</p>
              </div>
              <input
                type="checkbox"
                checked={isHoliday}
                onChange={(e) => setIsHoliday(e.target.checked)}
                className="w-5 h-5 accent-sky-600 rounded-md cursor-pointer"
              />
            </div>
          )}

          {shiftType !== 'OFF' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                สถานะเวร (ปกติ / แลก / ขาย / รับ)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'NORMAL' as ShiftStatus, label: 'เวรปกติของตนเอง' },
                  { key: 'TAKEN' as ShiftStatus, label: 'รับเวรมา (+ชม./+เงิน)' },
                  { key: 'SWAPPED_IN' as ShiftStatus, label: 'สลับมาทำให้ (+ชม./+เงิน)' },
                  { key: 'SWAPPED_OUT' as ShiftStatus, label: 'สลับให้คนอื่น (-ชม./-เงิน)' },
                  { key: 'SOLD' as ShiftStatus, label: 'ขายเวรออก (-ชม./-เงิน)' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setStatus(item.key)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      status === item.key
                        ? 'bg-sky-600 text-white border-sky-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {status !== 'NORMAL' && shiftType !== 'OFF' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อเพื่อนร่วมงานที่เกี่ยวข้อง
              </label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="ระบุชื่อเพื่อนร่วมงาน"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
              />
            </div>
          )}

          {shiftType !== 'OFF' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                บันทึกเพิ่มเติม
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น เวรขึ้นแทน, หมายเหตุพิเศษ"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {existingShift ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold"
              >
                <Trash2 className="w-4 h-4" />
                ลบเวรนี้
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                บันทึกข้อมูล
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};