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

const STORAGE_KEY_SHIFTS = 'dream_duty_shifts_v2';
const STORAGE_KEY_CONFIG = 'dream_duty_config_v2';
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
  const [syncStatus, setSyncStatus] = useState<string>('เชื่อมต่อคลาวด์แล้ว');

  const [shifts, setShifts] = useState<Shift[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SHIFTS);
      return saved ? JSON.parse(saved) : [];
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


  // Real-time Cloud Listener เชื่อมต่อตรงตลอดเวลา
  useEffect(() => {
    const docRef = doc(db, 'shared_duty_tracker', CLOUD_DOC_ID);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.shifts) && data.shifts.length > 0) {
          setShifts(data.shifts);
          try {
            localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(data.shifts));
          } catch (e) {
            console.error(e);
          }
          setSyncStatus('ซิงค์ข้อมูลเรียลไทม์สำเร็จ');
        } else {
          // ถ้าเอกสารบนคลาวด์เป็นอาร์เรย์ว่าง ให้ส่งข้อมูลจากเครื่องขึ้นไปแทน
          const currentLocal = localStorage.getItem(STORAGE_KEY_SHIFTS);
          if (currentLocal) {
            try {
              const parsed = JSON.parse(currentLocal);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setDoc(docRef, { shifts: parsed, updatedAt: new Date().toISOString() }, { merge: true });
              }
            } catch (e) {
              console.error(e);
            }
          }
        }
      } else {
        const currentLocal = localStorage.getItem(STORAGE_KEY_SHIFTS);
        if (currentLocal) {
          try {
            const parsed = JSON.parse(currentLocal);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setDoc(docRef, { shifts: parsed, updatedAt: new Date().toISOString() }, { merge: true });
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    }, (error) => {
      console.error('Realtime sync error:', error);
      setSyncStatus('โหมดออฟไลน์ (บันทึกในเครื่อง)');
    });

    return () => unsubscribe();
  }, []);

  const saveToCloud = async (newShifts: Shift[]) => {
    // บันทึกลงเครื่องทันทีก่อนเสมอ ไม่ต้องรอคลาวด์
    try {
      localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(newShifts));
    } catch (e) {
      console.error(e);
    }

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
    } finally {
      setIsSyncing(false);
    }
  };

  const addOrUpdateShift = (newShift: Shift) => {
    setShifts(prev => {
      const index = prev.findIndex(s => s.id === newShift.id || s.date === newShift.date);
      let updated: Shift[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = newShift;
      } else {
        updated = [...prev, newShift];
      }
      // เซฟลงทั้งเครื่องและคลาวด์ทันที
      saveToCloud(updated);
      return updated;
    });
  };

  const deleteShift = (id: string) => {
    setShifts(prev => {
      const updated = prev.filter(s => s.id !== id && s.date !== id);
      saveToCloud(updated);
      return updated;
    });
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