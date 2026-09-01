const fs = require('fs');
fs.writeFileSync('src/utils/notifications.ts', `import { Shift, NotificationConfig } from '../types/shift';
import { format } from 'date-fns';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!requestNotificationPermission) return false;
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const sendDutyNotification = (title: string, options?: NotificationOptions) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          ...options,
        });
      });
    } else {
      new Notification(title, {
        icon: '/pwa-192x192.png',
        ...options,
      });
    }
  } catch (e) {
    console.error('Notification error:', e);
  }
};

export const checkTodayDutyNotification = (shifts: Shift[], config: NotificationConfig) => {
  if (!config.enabled) return;
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayShift = shifts.find(s => s.date === todayStr);
  if (!todayShift || todayShift.type === 'OFF' || todayShift.status === 'SOLD' || todayShift.status === 'SWAPPED_OUT') {
    return;
  }
  const shiftName = todayShift.type === 'DAY' ? 'เวรกลางวัน (08:30 - 16:30 น.)' : 'เวรกลางคืน (16:30 - 08:30 น.)';
  const statusNote = todayShift.status === 'TAKEN' ? ' (รับเวรม฻)' : todayShift.status === 'SWAPPED_IN' ? ' (สลับเวรม฻)' : '';
  sendDutyNotification('<Notification>' + ' จ้งเตออนเข้าเวรวันน�', {
    body: `วันนีไคสมี ${shiftName}${statusNote} อย่าล෈มเตรียมตัวให้ปร้อง﻿`,
    tag: `duty-today-${todayStr}`,
  });
};`, 'utf8');
console.log('Fixed notif');
