import dotenv from 'dotenv';
dotenv.config();

const token = process.env.BOT_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;

if (!token) {
  console.error('BOT_TOKEN غير موجود في .env');
  process.exit(1);
}
if (!webhookUrl) {
  console.error('WEBHOOK_URL غير موجود. مثال: WEBHOOK_URL=https://your-bot.vercel.app/api/telegram');
  process.exit(1);
}

const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: webhookUrl,
    allowed_updates: ['message', 'callback_query']
  })
});
const data = await response.json();

if (!data.ok) {
  console.error('فشل ربط Webhook:', data);
  process.exit(1);
}

console.log('DONE ✅ تم ربط Webhook:');
console.log(webhookUrl);
