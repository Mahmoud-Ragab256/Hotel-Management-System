import { bot } from '../src/index.js';

function getUpdate(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, message: 'Telegram webhook endpoint is ready.' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const update = getUpdate(req);
    if (!update) return res.status(400).json({ ok: false, error: 'Invalid Telegram update body' });

    await bot.handleUpdate(update);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return res.status(200).json({ ok: false, error: error?.message || 'Webhook handler error' });
  }
}
