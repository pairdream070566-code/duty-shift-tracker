import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Shift, NotificationConfig, MonthSummary } from '../types/shift';
import { calculateMonthSummary } from '../utils/calculator';
import { checkTodayDutyNotification } from '../utils/notifications';
import { format } from 'date-fns';
import { 
  initFirebase, 
  ALLOWED_ADMIN_EMAIL, 
  DEFAULT_FIREBASE_CONFIG 
} from '../utils/firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  type User,
  GoogleAuthProvider,
  getAuth
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getFirestore,
  onSnapshot
} from 'firebase/firestore';

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
  
  // Auth & Cloud Sync
  user: User | null;
  isFirebaseReady: boolean;
  firebaseConfigState: any;
  saveFirebaseConfig: (config: any) => void;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  syncWithCloud: () => Promise<void>;
  isSyncing: boolean;
  syncStatus: string;
}

const STORAGE_KEY_SHIFTS = 'duty_shifts_data_v1';
const STORAGE_KEY_CONFIG = 'duty_shifts_config_v1';
const STORAGE_KEY_FIREBASE = 'duty_shifts_firebase_cfg_v1';

const defaultNotificationConfig: NotificationConfig = {
  enabled: true,
  dayShiftReminderTime: '07:00',
  nightShiftReminderTime: '15:00',
  advanceReminderHours: 1,
};

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const ShiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('');

  const [firebaseConfigState, setFirebaseConfigState] = useState<any>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FIREBASE);
      return saved ? JSON.parse(saved) : DEFAULT_FIREBASE_CONFIG;
    } catch {
      return DEFAULT_FIREBASE_CONFIG;
    }
  });

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

  const [isFirebaseReady, setIsFirebaseReady] = useState<boolean>(false);

  useEffect(() => {
    const { isConfigured } = initFirebase(firebaseConfigState);
    setIsFirebaseReady(isConfigured);

    if (isConfigured) {
      const auth = getAuth();
      const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribeAuth();
    }
  }, [firebaseConfigState]);

  // ระบบ Real-time Listener (อัปเดตข้อมูลข้ามเครื่องทันทีแบบเรียลไทม์)
  useEffect(() => {
    if (!user) return;

    const db = getFirestore();
    const docRef = doc(db, 'user_shifts', user.uid);

    const unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.shifts)) {
          setShifts(data.shifts);
          try {
            localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(data.shifts));
          } catch (e) {
            console.error('Save local shifts failed', e);
          }
        }
      } else {
        // ถ้ายังไม่มีข้อมูลบนคลาวด์ ให้อัปโหลดข้อมูลในเครื่องปัจจุบันขึ้นไปเป็นตั้งต้น
        const currentLocal = localStorage.getItem(STORAGE_KEY_SHIFTS);
        if (currentLocal) {
          try {
            const parsed = JSON.parse(currentLocal);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setDoc(docRef, {
                shifts: parsed,
                email: user.email,
                updatedAt: new Date().toISOString(),
              }, { merge: true });
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    }, (error) => {
      console.error('Realtime sync error:', error);
    });

    return () => unsubscribeSnapshot();
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(shifts));
    } catch (e) {
      console.error('Save shifts failed', e);
    }
  }, [shifts]);

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

  const syncWithCloud = async () => {
    if (!user) return;
    try {
      setIsSyncing(true);
      const db = getFirestore();
      const docRef = doc(db, 'user_shifts', user.uid);
      await setDoc(docRef, {
        shifts,
        email: user.email,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setSyncStatus('บันทึกข้อมูลขึ้นระบบคลาวด์ออนไลน์แล้ว');
      setTimeout(() => setSyncStatus(''), 3000);
    } catch (error) {
      console.error('Sync cloud error:', error);
      setSyncStatus('ซิงค์ไม่สำเร็จ โปรดลองใหม่อีกครั้ง');
    } finally {
      setIsSyncing(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (result.user.email?.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
        console.warn(`เข้าสู่ระบบด้วยอีเมล ${result.user.email} (แอดมินหลักคือ ${ALLOWED_ADMIN_EMAIL})`);
      }
      
      setUser(result.user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      alert('เข้าสู่ระบบด้วย Google ไม่สำเร็จ: ' + (error as any)?.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const saveFirebaseConfig = (config: any) => {
    localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(config));
    setFirebaseConfigState(config);
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
      return updated;
    });

    if (user) {
      setTimeout(() => syncWithCloud(), 500);
    }
  };

  const deleteShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id && s.date !== id));
    if (user) {
      setTimeout(() => syncWithCloud(), 500);
    }
  };

  const getShiftByDate = (dateStr: string): Shift | undefined => {
    return shifts.find(s => s.date === dateStr);
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(shifts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `duty_shifts_backup_${format(new Date(), 'yyyyMMdd_HHmm')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed)) {
        setShifts(parsed);
        if (user) {
          setTimeout(() => syncWithCloud(), 500);
        }
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
        user,
        isFirebaseReady,
        firebaseConfigState,
        saveFirebaseConfig,
        loginWithGoogle,
        logout,
        syncWithCloud,
        isSyncing,
        syncStatus,
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