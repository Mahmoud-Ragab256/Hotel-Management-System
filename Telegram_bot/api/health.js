export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: 'telegram-hotel-bot',
    mode: process.env.BOT_MODE || (process.env.VERCEL ? 'webhook' : 'polling'),
    backendUrl: process.env.BACKEND_URL || null,
    storeDriver: process.env.STORE_DRIVER || 'mongo'
  });
}
