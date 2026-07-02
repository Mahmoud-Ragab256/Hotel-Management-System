import dotenv from 'dotenv';
dotenv.config();

export default async function handler(req, res) {
  try {
    const token = process.env.BOT_TOKEN;
    if (!token) return res.status(500).json({ ok: false, error: 'BOT_TOKEN is missing' });

    const drop = String(req.query?.drop || '').toLowerCase() === 'true';
    const response = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drop_pending_updates: drop })
    });
    const data = await response.json();

    return res.status(response.ok ? 200 : 500).json({
      ok: Boolean(data.ok),
      dropPendingUpdates: drop,
      telegram: data
    });
  } catch (error) {
    console.error('Delete webhook error:', error);
    return res.status(500).json({ ok: false, error: error?.message || 'Delete webhook failed' });
  }
}
