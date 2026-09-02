import React, { useState } from 'react';
import { useShiftContext } from '../context/ShiftContext';
import { requestNotificationPermission, sendDutyNotification } from '../utils/notifications';
import { ALLOWED_ADMIN_EMAIL } from '../utils/firebase';
import { 
  Bell, 
  ShieldCheck, 
  Download, 
  Upload, 
  Trash2, 
  Smartphone, 
  Check, 
  Sparkles, 
  Cloud, 
  LogOut, 
  KeyRound, 
  RefreshCw,
  User as UserIcon
} from 'lucide-react';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { 
    exportData, 
    importData, 
    clearAllData,
    user,
    firebaseConfigState,
    saveFirebaseConfig,
    loginWithGoogle,
    logout,
    syncWithCloud,
    isSyncing,
    syncStatus
  } = useShiftContext();

  const [hasPermission, setHasPermission] = useState<boolean>(
    'Notification' in window && Notification.permission === 'granted'
  );
  const [importStatus, setImportStatus] = useState<string>('');
  const [showConfigForm, setShowConfigForm] = useState<boolean>(false);
  const [configJson, setConfigJson] = useState<string>(
    JSON.stringify(firebaseConfigState, null, 2)
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importData(content);
        if (success) {
          setImportStatus('นำเข้าข้อมูลสำเร็จ!');
          setTimeout(() => setImportStatus(''), 3000);
        } else {
          setImportStatus('ไฟล์ไม่ถูกต้อง ไม่สามารถนำเข้าได้');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSaveFirebaseKeys = () => {
    try {
      const parsed = JSON.parse(configJson);
      saveFirebaseConfig(parsed);
      setShowConfigForm(false);
      alert('บันทึกการตั้งค่า Firebase สำเร็จ!');
    } catch {
      alert('รูปแบบ JSON ของ Firebase Config ไม่ถูกต้อง');
    }
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
                ระบบซิงค์ออนไลน์ (Real-time Live Sync)
              </h3>
              <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ● เชื่อมต่อสด
              </span>
            </div>

            <div className="p-4 bg-gradient-to-br from-slate-50 to-sky-50/40 rounded-2xl border border-slate-200 space-y-3">
              <p className="text-xs text-slate-600">
                ระบบเปิดการซิงค์สดระหว่าง **คอมพิวเตอร์** และ **มือถือ** อัตโนมัติ (ลงเวรหรือแก้วันไหน ข้อมูลจะวิ่งหากันทันที)
              </p>
              
              <button
                onClick={() => syncWithCloud()}
                disabled={isSyncing}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-98"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'กำลังบันทึกข้อมูล...' : 'กดอัปเดตข้อมูลขึ้นคลาวด์เดี๋ยวนี้'}
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
              การแจ้งเตือนบนมือถือ (Pop-up Notification)
            </h3>

            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-800">อนุญาตสิทธิ์แจ้งเตือน</span>
                  <p className="text-xs text-slate-500">
                    {hasPermission ? 'เปิดใช้งานแล้วพร้อมเด้งเตือน' : 'กดปุ่มเพื่ออนุญาตให้เบราว์เซอร์แจ้งเตือน'}
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

          {/* สำรองและกู้คืนข้อมูล */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              สำรองและกู้คืนข้อมูล (Backup & Restore)
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={exportData}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-colors flex flex-col justify-between"
              >
                <Download className="w-5 h-5 text-sky-600 mb-2" />
                <div>
                  <div className="text-xs font-bold text-slate-800">ส่งออกข้อมูล (Backup)</div>
                  <div className="text-[10px] text-slate-500">บันทึกเป็นไฟล์ .json</div>
                </div>
              </button>

              <label className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-colors flex flex-col justify-between cursor-pointer">
                <Upload className="w-5 h-5 text-emerald-600 mb-2" />
                <div>
                  <div className="text-xs font-bold text-slate-800">นำเข้าข้อมูล (Restore)</div>
                  <div className="text-[10px] text-slate-500">เลือกไฟล์ .json กู้คืน</div>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <div className="text-xs font-bold text-center p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                {importStatus}
              </div>
            )}
          </div>

          {/* ล้างข้อมูล */}
          <div className="pt-2">
            <button
              onClick={clearAllData}
              className="w-full py-2.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              ลบข้อมูลตารางเวรทั้งหมดในเครื่อง
            </button>
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