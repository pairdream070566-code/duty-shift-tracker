import React from 'react';
import { useShiftContext } from '../context/ShiftContext';
import { calculateSingleShift } from '../utils/calculator';
import type { Shift } from '../types/shift';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { th } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';

interface CalendarViewProps {
  onSelectDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onSelectDate }) => {
  const { currentMonth, setCurrentMonth, shifts } = useShiftContext();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // เริ่มวันอาทิตย์
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

  const getShiftForDay = (day: Date): Shift | undefined => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return shifts.find(s => s.date === dateStr);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const today = new Date();

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-6">
      {/* Month Navigation Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
            {format(currentMonth, 'MMMM yyyy', { locale: th })}
          </h2>
          <button
            onClick={goToToday}
            className="text-xs px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-lg shadow-2xs transition-colors"
          >
            วันนี้
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            aria-label="Previous month"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            aria-label="Next month"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/80 text-center py-2.5">
        {weekDayNames.map((d, index) => {
          const isSunOrSat = index === 0 || index === 6;
          return (
            <div
              key={d}
              className={`text-xs font-bold ${isSunOrSat ? 'text-rose-500' : 'text-slate-600'}`}
            >
              {d}
            </div>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr gap-px bg-slate-200">
        {calendarDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isDayToday = isSameDay(day, today);
          const shift = getShiftForDay(day);
          const isWeekendDay = day.getDay() === 0 || day.getDay() === 6;

          let badgeContent = null;
          if (shift && shift.type !== 'OFF') {
            const { hours, earnings } = calculateSingleShift(shift);
            const isSold = shift.status === 'SOLD' || shift.status === 'SWAPPED_OUT';

            badgeContent = (
              <div
                className={`mt-1.5 p-1.5 sm:p-2 rounded-xl text-[11px] font-semibold border flex flex-col justify-between transition-transform duration-150 ${
                  isSold
                    ? 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-75'
                    : shift.type === 'DAY'
                    ? 'bg-amber-50 text-amber-900 border-amber-200/90 shadow-2xs'
                    : 'bg-indigo-50 text-indigo-950 border-indigo-200/90 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-0.5">
                  <span className="flex items-center gap-1 font-bold">
                    {shift.type === 'DAY' ? (
                      <Sun className="w-3 h-3 text-amber-500 shrink-0" />
                    ) : (
                      <Moon className="w-3 h-3 text-indigo-600 shrink-0" />
                    )}
                    {shift.type === 'DAY' ? 'เช้า' : 'ดึก'}
                  </span>
                  {!isSold && (
                    <span className="text-[10px] font-bold text-emerald-600">฿{earnings}</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] mt-1 text-slate-500">
                  <span>{isSold ? 'ขาย/สลับ' : `${hours} ชม.`}</span>
                  {shift.status === 'TAKEN' && (
                    <span className="px-1 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">รับ</span>
                  )}
                  {shift.status === 'SOLD' && (
                    <span className="px-1 rounded bg-rose-100 text-rose-800 text-[9px] font-bold">ขาย</span>
                  )}
                  {shift.status === 'SWAPPED_IN' && (
                    <span className="px-1 rounded bg-indigo-100 text-indigo-800 text-[9px] font-bold">สลับ</span>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`min-h-[85px] sm:min-h-[105px] p-1.5 sm:p-2 bg-white flex flex-col justify-between cursor-pointer transition-colors relative hover:bg-sky-50/50 ${
                !isCurrentMonth ? 'bg-slate-50/60 text-slate-300' : 'text-slate-800'
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs sm:text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isDayToday
                      ? 'bg-sky-600 text-white font-black shadow-xs'
                      : isWeekendDay && isCurrentMonth
                      ? 'text-rose-500'
                      : ''
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {shift?.isHoliday && (
                  <span className="text-[10px]" title="วันหยุดราชการ">
                    🏖️
                  </span>
                )}
              </div>

              {/* Shift Badge or Empty Indicator */}
              <div className="flex-1 flex flex-col justify-end">
                {badgeContent ? (
                  badgeContent
                ) : (
                  <div className="h-5 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-sky-600 font-medium">+ เพิ่มเวร</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend คำอธิบายสี */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300 inline-block"></span>
          <span>เวรเช้า (08:30 - 16:30 น. = 8 ชม. / 420 บ.)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-indigo-100 border border-indigo-300 inline-block"></span>
          <span>เวรดึก (16:30 - 08:30 น. = 16 ชม. / 400-420 บ.)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300 inline-block"></span>
          <span>รับเวรมา</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-300 inline-block"></span>
          <span>ขายเวรออก</span>
        </div>
      </div>
    </div>
  );
};

