import React, { useState } from 'react';
import { useShiftContext } from '../context/ShiftContext';
import { calculateSingleShift } from '../utils/calculator';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { Sun, Moon, Trash2, Edit3 } from 'lucide-react';

interface ShiftListViewProps {
  onSelectDate: (dateStr: string) => void;
}

export const ShiftListView: React.FC<ShiftListViewProps> = ({ onSelectDate }) => {
  const { currentMonth, shifts, deleteShift } = useShiftContext();
  const [filter, setFilter] = useState<'ALL' | 'SPECIAL'>('ALL');

  const monthKey = format(currentMonth, 'yyyy-MM');
  const monthShifts = shifts
    .filter(s => s.date.startsWith(monthKey) && s.type !== 'OFF')
    .sort((a, b) => a.date.localeCompare(b.date));

  const filteredShifts = filter === 'SPECIAL'
    ? monthShifts.filter(s => s.status !== 'NORMAL')
    : monthShifts;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-6 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-base">รายการเวรในเดือนนี้</h3>
          <p className="text-xs text-slate-500">รวมทั้งหมด {monthShifts.length} เวร</p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-white text-slate-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ทั้งหมด ({monthShifts.length})
          </button>
          <button
            onClick={() => setFilter('SPECIAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'SPECIAL'
                ? 'bg-white text-slate-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            สลับ/ขาย/รับเวร ({monthShifts.filter(s => s.status !== 'NORMAL').length})
          </button>
        </div>
      </div>

      {filteredShifts.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-sm font-medium">ยังไม่มีรายการเวรในเดือนนี้</p>
          <p className="text-xs mt-1">คลิกที่ปฏิทินเพื่อเริ่มลงเวลาเวร</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredShifts.map((shift) => {
            const { hours, earnings, isWeekendOrHoliday } = calculateSingleShift(shift);
            const isSold = shift.status === 'SOLD' || shift.status === 'SWAPPED_OUT';
            const dateFormatted = format(parseISO(shift.date), 'EEEEที่ d MMMM yyyy', { locale: th });

            return (
              <div
                key={shift.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${shift.type === 'DAY' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    {shift.type === 'DAY' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 capitalize">{dateFormatted}</span>
                      {shift.isHoliday && (
                        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-md">
                          วันหยุดราชการ
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                      <span>{shift.type === 'DAY' ? 'เวรกลางวัน (08:30-16:30)' : 'เวรกลางคืน (16:30-08:30)'}</span>
                      <span>•</span>
                      <span>{isSold ? 'ไม่นับ ชม.' : `${hours} ชั่วโมง`}</span>
                      
                      {shift.status === 'TAKEN' && (
                        <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          รับเวรมาจาก: {shift.partnerName || 'ไม่ระบุชื่อ'}
                        </span>
                      )}
                      {shift.status === 'SOLD' && (
                        <span className="text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          ขายเวรให้: {shift.partnerName || 'ไม่ระบุชื่อ'}
                        </span>
                      )}
                      {shift.status === 'SWAPPED_IN' && (
                        <span className="text-indigo-700 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                          สลับมาทำให้: {shift.partnerName || 'ไม่ระบุชื่อ'}
                        </span>
                      )}
                      {shift.status === 'SWAPPED_OUT' && (
                        <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          สลับให้: {shift.partnerName || 'ไม่ระบุชื่อ'} ไปทำแทน
                        </span>
                      )}
                    </div>
                    {shift.note && (
                      <p className="text-[11px] text-slate-400 mt-1 italic">
                        โน้ต: {shift.note}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`font-black text-sm ${isSold ? 'text-slate-400 line-through' : 'text-emerald-600'}`}>
                      ฿{earnings.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isWeekendOrHoliday ? 'เรทวันหยุด' : 'เรทปกติ'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectDate(shift.date)}
                      className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors"
                      title="แก้ไข"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteShift(shift.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
