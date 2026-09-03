import React, { useState } from 'react';
import { useShiftContext } from '../context/ShiftContext';
import { requestNotificationPermission, sendDutyNotification } from '../utils/notifications';
import { 
  Bell, 
  Smartphone, 
  Check, 
  Sparkles, 
  Cloud, 
  RefreshCw
} from 'lucide-react';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { 
    forceSync,
    isSyncing,
    syncStatus
  } = useShiftContext();

  const [hasPermission, setHasPermission] = useState<boolean>(
    'Notification' in window && Notification.permission === 'granted'
  );

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setHasPermission(granted);
    if (granted) {
      sendDutyNotification('✅ เปิดระบบแจ้งเตือนสำเร็จ!', {
        body: 'ระบบจะแจ้งเตือนเมื่อคุณมีเวรในแต่ละวัน',
      });
    }
  };

  const handleTestNotification = () => {
    sendDutyNotification('🔔 ทดสอบการแจ้งเตือนเวร', {
      body: 'วันนี้คุณมีเวรกลางคืน (16:30 - 08:30 น.) อย่าลืมเตรียมตัวให้พร้อมนะครับ!',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-sky-400" />
            <h2 className="font-bold text-lg">ตั้งค่าระบบ & Cloud Sync</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          
          {/* Cloud Sync Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-sky-600" />
                สถานะการเชื่อมต่อออนไลน์
              </h3>
              <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ● ซิงค์เรียลไทม์อัตโนมัติ
              </span>
            </div>

            <div className="p-4 bg-gradient-to-br from-slate-50 to-sky-50/40 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-xs text-slate-600">
                ข้อมูลตารางเวรจะซิงค์ตรงระหว่าง **คอมพิวเตอร์** และ **มือถือ** ตลอดเวลาโดยอัตโนมัติ
              </p>
              
              <button
                onClick={() => forceSync()}
                disabled={isSyncing}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-98"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'กำลังซิงค์...' : 'กดซิงค์ข้อมูลเดี๋ยวนี้'}
              </button>

              {syncStatus && (
                <div className="text-[11px] font-bold text-center text-emerald-700 bg-emerald-50 py-1.5 rounded-lg border border-emerald-200">
                  {syncStatus}
                </div>
              )}
            </div>
          </div>

          {/* ส่วนการแจ้งเตือน Pop-up */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-sky-600" />
              การแจ้งเตือนเตือนเวร (Pop-up Notification)
            </h3>

            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-800">อนุญาตสิทธิ์แจ้งเตือน</span>
                  <p className="text-xs text-slate-500">
                    {hasPermission ? 'เปิดใช้งานแล้วพร้อมเด้งเตือน' : 'กดปุ่มเพื่ออนุญาตให้แจ้งเตือน'}
                  </p>
                </div>
                {!hasPermission ? (
                  <button
                    onClick={handleRequestPermission}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                  >
                    เปิดสิทธิ์
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> อนุญาตแล้ว
                  </span>
                )}
              </div>

              {hasPermission && (
                <button
                  onClick={handleTestNotification}
                  className="w-full py-2 bg-white border border-sky-200 hover:bg-sky-50 text-sky-700 font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  ทดสอบส่งการแจ้งเตือนเด้งลงมา
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};