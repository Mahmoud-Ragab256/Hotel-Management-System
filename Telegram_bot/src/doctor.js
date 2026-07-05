import dotenv from 'dotenv';
import { createRequire } from 'module';
import { backendUrl, checkBackend, getRooms, getBookings } from './api.js';
import { initStore, closeStore, listServices, getWifiSettings } from './store.js';

dotenv.config();
const require = createRequire(import.meta.url);

async function main() {
  console.log('فحص إعدادات بوت الفندق...');

  if (!process.env.BOT_TOKEN || process.env.BOT_TOKEN === 'PUT_YOUR_TELEGRAM_BOT_TOKEN_HERE') {
    console.log('❌ BOT_TOKEN غير موجود داخل Bot/.env');
  } else {
    console.log('✅ BOT_TOKEN موجود');
  }

  let storeInfo = null;
  try {
    storeInfo = await initStore();
    console.log(`✅ اتصال قاعدة البيانات: ${storeInfo.driver === 'mongo' ? `MongoDB/${storeInfo.dbName}` : 'ملف محلي'}`);
  } catch (error) {
    console.log('❌ فشل الاتصال بقاعدة البيانات MongoDB');
    console.log(error?.message || error);
    process.exitCode = 1;
    return;
  }

  try {
    require.resolve('pdfkit');
    console.log('✅ مكتبة PDF موجودة');
  } catch {
    console.log('❌ مكتبة PDF غير موجودة. شغّل داخل Bot: npm install');
    process.exitCode = 1;
  }

  const wifi = getWifiSettings();
  console.log(`✅ إعدادات الواي فاي: ${wifi.name || 'غير محدد'}`);

  const services = listServices();
  console.log(`✅ عدد الخدمات داخل البوت: ${services.length}`);

  console.log(`فحص اتصال الباك: ${backendUrl}`);

  try {
    const root = await checkBackend();
    console.log(`✅ الباك يعمل: ${root.message || 'OK'}`);
  } catch (error) {
    console.log('❌ فشل الاتصال بالباك');
    console.log(error?.message || error);
    process.exitCode = 1;
    return;
  }

  try {
    const rooms = await getRooms();
    console.log(`✅ Endpoint الغرف يعمل. عدد الغرف: ${rooms.length}`);
  } catch (error) {
    console.log('❌ فشل تشغيل /dashboard/rooms');
    console.log(error?.message || error);
    process.exitCode = 1;
    return;
  }

  try {
    const bookings = await getBookings();
    console.log(`✅ Endpoint الحجوزات يعمل. عدد الحجوزات: ${bookings.length}`);
  } catch (error) {
    console.log('⚠️ Endpoint الحجوزات لم يعمل. دخول العميل برقم الحجز فقط يحتاج هذا المسار.');
    console.log(error?.message || error);
  }

  console.log('انتهى الفحص.');
  await closeStore();
}

main().catch(async (error) => {
  console.error(error);
  await closeStore();
  process.exit(1);
});
