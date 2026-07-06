import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const cleanBaseUrl = (process.env.BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');

export const api = axios.create({
  baseURL: cleanBaseUrl,
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' }
});

export const backendUrl = cleanBaseUrl;

const readArray = (response, key) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data?.[key])) return response.data[key];
  if (Array.isArray(response?.data?.data?.[key])) return response.data.data[key];
  return [];
};

export function friendlyApiError(error) {
  const code = error?.code || error?.cause?.code;
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error?.message || 'خطأ غير معروف';

  if (code === 'ECONNREFUSED') {
    return `السيرفر غير متاح على: ${backendUrl}\n\nالحل:\n1) شغّل الباك الأول.\n2) افتح Bot/.env وتأكد أن BACKEND_URL مطابق لبورت الباك.\nلو الباك عندك على 3000 اكتب:\nBACKEND_URL=http://localhost:3000`;
  }

  if (status === 404) {
    return `المسار غير موجود في الباك. تأكد أن نسخة الباك شغالة وصحيحة.\nBACKEND_URL الحالي: ${backendUrl}`;
  }

  if (status === 401 || status === 403) return 'العملية تحتاج صلاحية أو تسجيل دخول صحيح.';
  return message;
}

export async function checkBackend() {
  const response = await api.get('/');
  return response.data;
}

export async function loginEmployee(email, password) {
  const response = await api.post('/dashboard/auth/login', { email, password });
  return response.data;
}

export async function getRooms() {
  const response = await api.get('/dashboard/rooms');
  return readArray(response, 'rooms');
}

export async function getAvailableRooms() {
  try {
    const response = await api.get('/dashboard/rooms/available');
    const rooms = readArray(response, 'rooms');
    if (rooms.length) return rooms;
  } catch (error) {
    if (error?.response?.status !== 404) throw error;
  }

  const rooms = await getRooms();
  return rooms.filter((room) => String(room?.status || '').toLowerCase() === 'available');
}

export async function getBookings() {
  const response = await api.get('/dashboard/bookings');
  return readArray(response, 'bookings');
}

export async function getBookingByNumber(bookingNumber) {
  const response = await api.get(`/dashboard/bookings/number/${bookingNumber}`);
  return response?.data?.data?.booking || null;
}

export async function getGuests() {
  const response = await api.get('/dashboard/guests');
  return readArray(response, 'guests');
}

export async function getEmployees() {
  const response = await api.get('/dashboard/employees');
  return readArray(response, 'employees');
}
