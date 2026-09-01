import React, { useEffect } from 'react';
import { useShiftContext } from '../context/ShiftContext';
import { Award, Clock, DollarSign, Sun, Moon, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

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
    <div className="space-y-4 mb-6">
      <div className={`p-5 rounded-2xl border transition-all duration-300 ${monthSummary.hasPjrBonus ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`p-2 rounded-xl ${monthSummary.hasPjrBonus ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-700'}`}>
                <Award className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-slate-800 text-base">เป้าหมายเงิน พจร. (8,000 บาท)</h3>
                <p className="text-xs text-slate-500">เกณฑ์: เข้าเวรสะสมตั้งแต่ 100 ชั่วโมงขึ้นไปในเดือนนี้</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            {monthSummary.hasPjrBonus ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" /> ผ่านเกณฑ์ (+8,000 บ.)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5" /> ขาดอีก {monthSummary.hoursRemaining} ชม.
              </span>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs font-medium mb-1.5">
            <span className="text-slate-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              ชั่วโมงสะสม: <strong className="text-slate-800 font-bold">{monthSummary.totalHours}</strong> / {monthSummary.targetHours} ชม.
            </span>
            <span className={`font-bold ${monthSummary.hasPjrBonus ? 'text-emerald-600' : 'text-sky-600'}`}>
              {monthSummary.progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-700 ${monthSummary.hasPjrBonus ? 'bg-emerald-500' : 'bg-sky-500'}`}
              style={{ width: `${monthSummary.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-sky-600 to-indigo-700 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-80">
            <span className="text-xs font-medium">รายได้สุทธิเดือนนี้</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black tracking-tight">
              ฿{monthSummary.netTotalEarnings.toLocaleString()}
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">
              {monthSummary.hasPjrBonus ? '(ค่าเวร + พจร. 8,000 บ.)' : '(ยังไม่รวมเงิน พจร.)'}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">ค่าเวรรวม</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-800">
              ฿{monthSummary.totalDutyEarnings.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              รวม {monthSummary.dayShiftCount + monthSummary.nightShiftWeekdayCount + monthSummary.nightShiftWeekendCount} ผลัด
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-medium">เวรกลางวัน (8 ชม.)</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-800">
              {monthSummary.dayShiftCount} <span className="text-xs font-normal text-slate-500">เวร</span>
            </div>
            <div className="text-xs text-amber-700 font-medium mt-0.5">
              ฿{monthSummary.dayShiftEarnings.toLocaleString()} (420 บ./เวร)
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-medium">เวรกลางคืน (16 ชม.)</span>
            <Moon className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-slate-800">
              {monthSummary.nightShiftWeekdayCount + monthSummary.nightShiftWeekendCount} <span className="text-xs font-normal text-slate-500">เวร</span>
            </div>
            <div className="text-xs text-indigo-700 font-medium mt-0.5">
              ฿{monthSummary.nightShiftEarnings.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

