import dotenv from 'dotenv';
dotenv.config();

function buildWebhookUrl(req) {
  const fromEnv = String(process.env.WEBHOOK_URL || '').trim();
  if (fromEnv) return fromEnv;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `https://${host}/api/telegram`;
}

export default async function handler(req, res) {
  try {
    const token = process.env.BOT_TOKEN;
    if (!token) return res.status(500).json({ ok: false, error: 'BOT_TOKEN is missing' });

    const webhookUrl = buildWebhookUrl(req);
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query']
      })
    });
    const data = await response.json();

    return res.status(response.ok ? 200 : 500).json({
      ok: Boolean(data.ok),
      webhookUrl,
      telegram: data
    });
  } catch (error) {
    console.error('Set webhook error:', error);
    return res.status(500).json({ ok: false, error: error?.message || 'Set webhook failed' });
  }
}
