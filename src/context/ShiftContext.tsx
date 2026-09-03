import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Shift, MonthSummary, NotificationConfig } from '../types/shift';
import { calculateMonthSummary } from '../utils/calculator';
import { checkTodayDutyNotification } from '../utils/notifications';
import { format } from 'date-fns';
import { db } from '../utils/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

interface ShiftContextType {
  shifts: Shift[];
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  monthSummary: MonthSummary;
  notificationConfig: NotificationConfig;
  setNotificationConfig: (config: NotificationConfig) => void;
  addOrUpdateShift: (shift: Shift) => void;
  deleteShift: (id: string) => void;
  getShiftByDate: (dateStr: string) => Shift | undefined;
  exportData: () => void;
  importData: (jsonData: string) => boolean;
  clearAllData: () => void;
  isSyncing: boolean;
  syncStatus: string;
  forceSync: () => void;
}

const STORAGE_KEY_SHIFTS = 'DREAM_DUTY_SHIFTS_PERMANENT_V1';
const STORAGE_KEY_CONFIG = 'DREAM_DUTY_CONFIG_PERMANENT_V1';
const CLOUD_DOC_ID = 'dream_duty_shifts_master';

const defaultNotificationConfig: NotificationConfig = {
  enabled: true,
  dayShiftReminderTime: '07:00',
  nightShiftReminderTime: '15:00',
  advanceReminderHours: 1,
};

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const ShiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('พร้อมใช้งาน');

  // โหลดข้อมูลที่มีอยู่จาก localStorage ทันที
  const [shifts, setShifts] = useState<Shift[]>(() => {
    try {
      const keys = [
        STORAGE_KEY_SHIFTS,
        'dream_duty_shifts_v2',
        'duty_shifts_data_v1',
        'dream_duty_shifts_master_v3'
      ];
      for (const k of keys) {
        const item = localStorage.getItem(k);
        if (item) {
          const parsed = JSON.parse(item);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(parsed));
            return parsed;
          }
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      return saved ? JSON.parse(saved) : defaultNotificationConfig;
    } catch {
      return defaultNotificationConfig;
    }
  });

  // Real-time Cloud Listener
  useEffect(() => {
    const docRef = doc(db, 'shared_duty_tracker', CLOUD_DOC_ID);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.shifts)) {
          if (data.shifts.length > 0) {
            // คลาวด์มีข้อมูล ให้อัปเดตทั้ง state และ localStorage
            setShifts(data.shifts);
            try {
              localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(data.shifts));
            } catch (e) {
              console.error(e);
            }
            setSyncStatus('ซิงค์ข้อมูลเรียลไทม์สำเร็จ');
          } else {
            // ถ้าบนคลาวด์ว่าง แต่ในเครื่องเรามี ให้ดันข้อมูลในเครื่องขึ้นคลาวด์
            const localSaved = localStorage.getItem(STORAGE_KEY_SHIFTS);
            if (localSaved) {
              try {
                const parsed = JSON.parse(localSaved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setDoc(docRef, { shifts: parsed, updatedAt: new Date().toISOString() }, { merge: true });
                }
              } catch (e) {
                console.error(e);
              }
            }
          }
        }
      } else {
        // เอกสารยังไม่มีบนคลาวด์ ให้สร้างจากข้อมูลในเครื่อง
        const localSaved = localStorage.getItem(STORAGE_KEY_SHIFTS);
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setDoc(docRef, { shifts: parsed, updatedAt: new Date().toISOString() }, { merge: true });
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    }, (error) => {
      console.warn('Firestore realtime error:', error);
      setSyncStatus('โหมดออฟไลน์ (บันทึกในเครื่อง)');
    });

    return () => unsubscribe();
  }, []);

  const saveToCloud = async (newShifts: Shift[]) => {
    try {
      setIsSyncing(true);
      const docRef = doc(db, 'shared_duty_tracker', CLOUD_DOC_ID);
      await setDoc(docRef, {
        shifts: newShifts,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setSyncStatus('บันทึกขึ้นคลาวด์เรียบร้อย');
    } catch (e) {
      console.error('Save to cloud failed:', e);
      setSyncStatus('บันทึกในเครื่องแล้ว');
    } finally {
      setIsSyncing(false);
    }
  };

  const addOrUpdateShift = (newShift: Shift) => {
    // 1. อ่านข้อมูลปัจจุบันจาก localStorage โดยตรงก่อน เพื่อป้องกัน state ไม่ตรง
    let currentShifts: Shift[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SHIFTS);
      if (saved) {
        currentShifts = JSON.parse(saved);
      }
    } catch {
      currentShifts = shifts;
    }

    const index = currentShifts.findIndex(s => s.id === newShift.id || s.date === newShift.date);
    let updated: Shift[];
    if (index >= 0) {
      updated = [...currentShifts];
      updated[index] = newShift;
    } else {
      updated = [...currentShifts, newShift];
    }

    // 2. เขียนลง localStorage ทันทีแบบ synchronous ก่อนเสมอ!
    try {
      localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(updated));
    } catch (e) {
      console.error('Save to localStorage failed:', e);
    }

    // 3. อัปเดต React State
    setShifts(updated);

    // 4. ส่งข้อมูลขึ้น Cloud
    saveToCloud(updated);
  };

  const deleteShift = (id: string) => {
    let currentShifts: Shift[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SHIFTS);
      if (saved) {
        currentShifts = JSON.parse(saved);
      }
    } catch {
      currentShifts = shifts;
    }

    const updated = currentShifts.filter(s => s.id !== id && s.date !== id);
    try {
      localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(updated));
    } catch (e) {
      console.error('Delete shift from localStorage failed:', e);
    }
    setShifts(updated);
    saveToCloud(updated);
  };

  const forceSync = () => {
    saveToCloud(shifts);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(notificationConfig));
    } catch (e) {
      console.error('Save config failed', e);
    }
  }, [notificationConfig]);

  useEffect(() => {
    checkTodayDutyNotification(shifts, notificationConfig);
  }, [shifts, notificationConfig]);

  const monthKey = format(currentMonth, 'yyyy-MM');
  const monthSummary = calculateMonthSummary(monthKey, shifts);

  const getShiftByDate = (dateStr: string): Shift | undefined => {
    return shifts.find(s => s.date === dateStr);
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(shifts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ตารางเวรของดรีม_${format(new Date(), 'yyyyMMdd_HHmm')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed)) {
        setShifts(parsed);
        saveToCloud(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const clearAllData = () => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลตารางเวรทั้งหมด?')) {
      setShifts([]);
      saveToCloud([]);
    }
  };

  return (
    <ShiftContext.Provider
      value={{
        shifts,
        currentMonth,
        setCurrentMonth,
        monthSummary,
        notificationConfig,
        setNotificationConfig,
        addOrUpdateShift,
        deleteShift,
        getShiftByDate,
        exportData,
        importData,
        clearAllData,
        isSyncing,
        syncStatus,
        forceSync,
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
};

export const useShiftContext = () => {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error('useShiftContext must be used within a ShiftProvider');
  }
  return context;
};