import type { Shift, NotificationConfig } from '../types/shift';
import { format, addDays } from 'date-fns';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const sendDutyNotification = (title: string, options?: NotificationOptions) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          ...options,
        });
      });
    } else {
      new Notification(title, {
        icon: '/favicon.svg',
        ...options,
      });
    }
  } catch (e) {
    console.error('Notification error:', e);
  }
};

export const checkTodayDutyNotification = (shifts: Shift[], config: NotificationConfig) => {
  if (!config.enabled) return;

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(today, 1), 'yyyy-MM-dd');

  // ตรวจสอบเวรวันนี้
  const todayShift = shifts.find(s => s.date === todayStr);
  if (todayShift && todayShift.type !== 'OFF' && todayShift.status !== 'SOLD' && todayShift.status !== 'SWAPPED_OUT') {
    const shiftName = todayShift.type === 'DAY' ? 'เวรกลางวัน (08:30 - 16:30 น.)' : 'เวรกลางคืน (16:30 - 08:30 น.)';
    const statusNote = todayShift.status === 'TAKEN' ? ' (รับเวรมา)' : todayShift.status === 'SWAPPED_IN' ? ' (สลับเวรมา)' : '';
    sendDutyNotification('🔔 วันนี้คุณดรีมมีเวรครับ!', {
      body: `วันนี้มี ${shiftName}${statusNote} อย่าลืมเตรียมตัวให้พร้อมนะครับ!`,
      tag: 'duty-today-' + todayStr,
    });
  }

  // ตรวจสอบเวรพรุ่งนี้ (แจ้งเตือนล่วงหน้า)
  const tomorrowShift = shifts.find(s => s.date === tomorrowStr);
  if (tomorrowShift && tomorrowShift.type !== 'OFF' && tomorrowShift.status !== 'SOLD' && tomorrowShift.status !== 'SWAPPED_OUT') {
    const shiftName = tomorrowShift.type === 'DAY' ? 'เวรเช้า (08:30 - 16:30 น.)' : 'เวรดึก (16:30 - 08:30 น.)';
    sendDutyNotification('⏰ พรุ่งนี้คุณดรีมมีเวรนะครับ!', {
      body: `เตือนล่วงหน้า: พรุ่งนี้มี ${shiftName} พักผ่อนให้เต็มที่นะครับ`,
      tag: 'duty-tomorrow-' + tomorrowStr,
    });
  }
};

