import dotenv from 'dotenv';
dotenv.config();

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('BOT_TOKEN غير موجود في .env');
  process.exit(1);
}

const dropPendingUpdates = process.argv.includes('--drop');
const response = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ drop_pending_updates: dropPendingUpdates })
});
const data = await response.json();

if (!data.ok) {
  console.error('فشل حذف Webhook:', data);
  process.exit(1);
}

console.log('DONE ✅ تم حذف Webhook. تقدر تشغل البوت محليًا الآن بـ npm start');
