import React, { useState } from 'react';
import { ShiftProvider } from './context/ShiftContext';
import { StatsDashboard } from './components/StatsDashboard';
import { CalendarView } from './components/CalendarView';
import { ShiftListView } from './components/ShiftListView';
import { ShiftModal } from './components/ShiftModal';
import { SettingsModal } from './components/SettingsModal';
import { Calendar, List, Settings, Plus, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CALENDAR' | 'LIST'>('CALENDAR');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  const handleOpenDateModal = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const handleCloseDateModal = () => {
    setSelectedDate(null);
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-base sm:text-lg leading-none text-slate-800 flex items-center gap-1.5">
                ตารางเวรของดรีม <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded-full font-bold">พจร. 8,000</span>
              </h1>
              <p className="text-[11px] text-slate-500 mt-1">บันทึกเวร • คำนวณเงิน • เช็คยอด 100 ชม.</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRefresh}
              className="p-2 text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
              title="รีเฟรชข้อมูล (Refresh)"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-sky-600' : ''}`} />
            </button>

            <button
              onClick={() => handleOpenDateModal(todayStr)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              ลงเวรวันนี้
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="ตั้งค่า & แจ้งเตือน"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>


      <main className="max-w-4xl mx-auto px-4 py-5 sm:qx-6">
        <StatsDashboard />


        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex p-1 bg-slate-200/70 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('CALENDAR')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'CALENDAR'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              มุมมองปฏิทิน
            </button>
            <button
              onClick={() => setActiveTab('LIST')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'LIST'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              มุมมองรายการ
            </button>
          </div>

          <button
            onClick={() => handleOpenDateModal(todayStr)}
            className="sm:hidden flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> ลงเวร
          </button>
        </div>

        {activeTab === 'CALENDAR' ? (
          <CalendarView onSelectDate={handleOpenDateModal} />
        ) : (
          <ShiftListView onSelectDate={handleOpenDateModal} />
        )}
      </main>

      <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-200/60 max-w-4xl mx-auto">
        <p>เว็บแอปบันทึกตารางเวรส่วนตัว & คำนวณเงิน พจร. • บัญชีของคุณดรีม</p>
      </footer>

      {selectedDate && (
        <ShiftModal
          isOpen={Boolean(selectedDate)}
          onClose={handleCloseDateModal}
          selectedDate={selectedDate}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <ShiftProvider>
      <AppContent />
    </ShiftProvider>
  );
}

export default App;