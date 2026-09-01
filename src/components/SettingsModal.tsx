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
          
          {/* Cloud Sync & Google Login */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-sky-600" />
                ระบบซิงค์ออนไลน์ (Google Cloud)
              </h3>
              <span className="text-[11px] text-sky-600 font-semibold">{ALLOWED_ADMIN_EMAIL}</span>
            </div>

            <div className="p-4 bg-gradient-to-br from-slate-50 to-sky-50/40 rounded-2xl border border-slate-200 space-y-3">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="profile" className="w-8 h-8 rounded-full border border-sky-300" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold">
                          <UserIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-800 leading-tight">{user.displayName || 'เข้าสู่ระบบแล้ว'}</div>
                        <div className="text-[11px] text-slate-500">{user.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => logout()}
                      className="text-xs text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> ออก
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => syncWithCloud()}
                      disabled={isSyncing}
                      className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูลขึ้นคลาวด์เดี๋ยวนี้'}
                    </button>
                  </div>

                  {syncStatus && (
                    <div className="text-[11px] font-bold text-center text-emerald-700 bg-emerald-50 py-1.5 rounded-lg border border-emerald-200">
                      {syncStatus}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-600">
                    เข้าสู่ระบบด้วย Google เมล <strong className="text-sky-700">{ALLOWED_ADMIN_EMAIL}</strong> เพื่อบันทึกตารางเวรออนไลน์และดูได้จากทุกอุปกรณ์
                  </p>
                  <button
                    onClick={() => loginWithGoogle()}
                    className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs flex items-center justify-center gap-2 transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    เข้าสู่ระบบด้วย Google
                  </button>

                  <div className="text-right">
                    <button
                      onClick={() => setShowConfigForm(!showConfigForm)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 ml-auto"
                    >
                      <KeyRound className="w-3 h-3" />
                      {showConfigForm ? 'ซ่อนตั้งค่า Firebase Keys' : 'ตั้งค่า Firebase Keys (ถ้าขึ้นออนไลน์)'}
                    </button>
                  </div>

                  {showConfigForm && (
                    <div className="pt-2 space-y-2 border-t border-slate-200">
                      <label className="text-[11px] font-bold text-slate-600 block">
                        วาง Firebase Config JSON (จาก Firebase Console):
                      </label>
                      <textarea
                        rows={5}
                        value={configJson}
                        onChange={(e) => setConfigJson(e.target.value)}
                        placeholder='{ "apiKey": "...", "projectId": "..." }'
                        className="w-full p-2 text-[10px] font-mono bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                      />
                      <button
                        onClick={handleSaveFirebaseKeys}
                        className="w-full py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900"
                      >
                        บันทึก Firebase Config
                      </button>
                    </div>
                  )}
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