import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import { formatDateTime, formatMoney, translateRequestStatus } from './format.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const exportsDir = path.join(__dirname, '..', 'data', 'exports');

const PAGE = {
  width: 595.28,
  height: 841.89,
  margin: 38,
  right: 557.28,
  contentWidth: 519.28
};

const COLORS = {
  primary: '#1F4E79',
  primaryDark: '#153A5A',
  text: '#222222',
  muted: '#666666',
  lightText: '#FFFFFF',
  line: '#D8DEE8',
  soft: '#F4F7FB',
  danger: '#A94442',
  success: '#2E7D32',
  warning: '#A66A00'
};

function ensureDir() {
  if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir, { recursive: true });
}

function findArabicFont() {
  const candidates = [
    'C:/Windows/Fonts/tahoma.ttf',
    'C:/Windows/Fonts/arial.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/noto/NotoSansArabic-Regular.ttf',
    '/usr/share/fonts/opentype/noto/NotoSansArabic-Regular.ttf'
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function cleanPdfText(value = '') {
  return String(value)
    .replace(/[\r\n]+/g, ' ')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function safe(value, fallback = '-') {
  const text = cleanPdfText(value);
  return text || fallback;
}

function addText(doc, text = '', x = PAGE.margin, y = doc.y, width = PAGE.contentWidth, options = {}) {
  doc.text(cleanPdfText(text), x, y, {
    width,
    align: 'right',
    lineGap: options.lineGap ?? 2,
    ...options
  });
}

function labelValue(doc, label, value, x, y, width, options = {}) {
  const labelWidth = options.labelWidth || 112;
  const valueWidth = width - labelWidth - 8;
  doc.fillColor(COLORS.muted).fontSize(options.fontSize || 9);
  doc.text(cleanPdfText(label), x + width - labelWidth, y, { width: labelWidth, align: 'right' });
  doc.fillColor(options.valueColor || COLORS.text).fontSize(options.fontSize || 9);
  doc.text(cleanPdfText(value), x, y, { width: valueWidth, align: 'right' });
}

function roundedRect(doc, x, y, w, h, fill, stroke = null, radius = 8) {
  doc.save();
  doc.roundedRect(x, y, w, h, radius);
  if (fill) doc.fill(fill);
  if (stroke) doc.strokeColor(stroke).lineWidth(0.7).stroke();
  doc.restore();
}

function addHeader(doc, options = {}) {
  const y = 30;
  roundedRect(doc, PAGE.margin, y, PAGE.contentWidth, 78, COLORS.primary, null, 12);
  doc.fillColor(COLORS.lightText).fontSize(19);
  addText(doc, 'تقرير طلبات العملاء', PAGE.margin + 18, y + 14, PAGE.contentWidth - 36);
  doc.fontSize(10).fillColor('#EAF2FA');
  addText(doc, `نوع التصدير: ${options.filterLabel || 'كل الطلبات'}`, PAGE.margin + 18, y + 45, PAGE.contentWidth - 36);
  doc.fontSize(8).fillColor('#D8E7F4');
  addText(doc, `تاريخ التصدير: ${formatDateTime(new Date().toISOString())}`, PAGE.margin + 18, y + 60, PAGE.contentWidth - 36);
  doc.y = y + 96;
}

function addFooter(doc, pageNumber) {
  const y = PAGE.height - 34;
  doc.save();
  doc.moveTo(PAGE.margin, y - 8).lineTo(PAGE.right, y - 8).strokeColor(COLORS.line).lineWidth(0.5).stroke();
  doc.fontSize(8).fillColor(COLORS.muted);
  doc.text(cleanPdfText(`صفحة ${pageNumber}`), PAGE.margin, y, { width: PAGE.contentWidth / 2, align: 'left' });
  doc.text(cleanPdfText('Hotel Telegram Bot'), PAGE.margin, y, { width: PAGE.contentWidth, align: 'right' });
  doc.restore();
}

function newPageIfNeeded(doc, requiredHeight, state) {
  if (doc.y + requiredHeight <= PAGE.height - 60) return;
  addFooter(doc, state.pageNumber);
  doc.addPage();
  state.pageNumber += 1;
  addHeader(doc, state.options);
}

function statusColor(status = '') {
  const map = {
    done: COLORS.success,
    rejected: COLORS.danger,
    pending: COLORS.warning,
    received: COLORS.primary,
    directed: COLORS.primary,
    in_progress: COLORS.warning
  };
  return map[status] || COLORS.primary;
}

function statusCounts(requests = []) {
  const counts = { pending: 0, received: 0, directed: 0, in_progress: 0, done: 0, rejected: 0 };
  for (const request of requests) counts[request.status] = (counts[request.status] || 0) + 1;
  return counts;
}

function totalPrice(requests = []) {
  return requests.reduce((sum, request) => sum + Number(request.price || 0), 0);
}

function mostRequestedService(requests = []) {
  const map = new Map();
  for (const request of requests) {
    const title = safe(request.serviceTitle || request.serviceKey, 'غير محدد');
    map.set(title, (map.get(title) || 0) + 1);
  }
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]);
  return sorted.length ? `${sorted[0][0]} (${sorted[0][1]})` : '-';
}

function addSummaryBox(doc, title, value, x, y, w, h, color = COLORS.primary) {
  roundedRect(doc, x, y, w, h, COLORS.soft, COLORS.line, 10);
  doc.fontSize(8).fillColor(COLORS.muted);
  doc.text(cleanPdfText(title), x + 10, y + 10, { width: w - 20, align: 'right' });
  doc.fontSize(12).fillColor(color);
  doc.text(cleanPdfText(value), x + 10, y + 27, { width: w - 20, align: 'right' });
}

function addSummary(doc, requests = [], options = {}) {
  const counts = statusCounts(requests);
  const boxGap = 8;
  const boxW = (PAGE.contentWidth - boxGap * 2) / 3;
  let y = doc.y;

  addSummaryBox(doc, 'عدد الطلبات', String(requests.length), PAGE.margin + boxW * 2 + boxGap * 2, y, boxW, 58);
  addSummaryBox(doc, 'إجمالي القيمة', formatMoney(totalPrice(requests)), PAGE.margin + boxW + boxGap, y, boxW, 58, COLORS.success);
  addSummaryBox(doc, 'أكثر خدمة طلبًا', mostRequestedService(requests), PAGE.margin, y, boxW, 58, COLORS.primaryDark);

  y += 70;
  const smallW = (PAGE.contentWidth - boxGap * 5) / 6;
  const statusBoxes = [
    ['قيد المراجعة', counts.pending || 0, COLORS.warning],
    ['تم الاستلام', counts.received || 0, COLORS.primary],
    ['للغرفة', counts.directed || 0, COLORS.primary],
    ['جاري التنفيذ', counts.in_progress || 0, COLORS.warning],
    ['تم التنفيذ', counts.done || 0, COLORS.success],
    ['مرفوض', counts.rejected || 0, COLORS.danger]
  ];

  statusBoxes.forEach(([label, value, color], index) => {
    const x = PAGE.margin + (5 - index) * (smallW + boxGap);
    addSummaryBox(doc, label, String(value), x, y, smallW, 46, color);
  });

  doc.y = y + 62;

  roundedRect(doc, PAGE.margin, doc.y, PAGE.contentWidth, 36, '#FFF8E8', '#EDD391', 8);
  doc.fontSize(9).fillColor(COLORS.text);
  addText(doc, `تم التصدير بواسطة: ${safe(options.exportedBy?.name || options.exportedBy?.email)}    |    نوع التصدير: ${safe(options.filterLabel || 'كل الطلبات')}`, PAGE.margin + 12, doc.y + 11, PAGE.contentWidth - 24);
  doc.y += 52;
}

function addSectionTitle(doc, title) {
  doc.fontSize(12).fillColor(COLORS.primaryDark);
  addText(doc, title, PAGE.margin, doc.y, PAGE.contentWidth);
  doc.moveDown(0.4);
}

function addRequestCard(doc, request = {}, index = 0, state) {
  const details = safe(request.details, '-');
  const hasRating = Boolean(request.rating?.stars);
  const hasHistory = Array.isArray(request.history) && request.history.length;
  const estimatedHeight = 178 + Math.min(40, Math.ceil(details.length / 75) * 12) + (hasRating ? 34 : 0) + (hasHistory ? Math.min(70, request.history.length * 12 + 22) : 0);
  newPageIfNeeded(doc, estimatedHeight, state);

  const x = PAGE.margin;
  const y = doc.y;
  const w = PAGE.contentWidth;
  const h = Math.min(estimatedHeight, 292);
  const accent = statusColor(request.status);

  roundedRect(doc, x, y, w, h, '#FFFFFF', COLORS.line, 10);
  doc.save();
  doc.roundedRect(x + w - 8, y, 8, h, 3).fill(accent);
  doc.restore();

  doc.fontSize(13).fillColor(COLORS.primaryDark);
  addText(doc, `طلب ${index + 1} — ${safe(request.id)}`, x + 16, y + 12, w - 34);

  const badgeW = 112;
  roundedRect(doc, x + 16, y + 10, badgeW, 24, accent, null, 12);
  doc.fontSize(8).fillColor(COLORS.lightText);
  doc.text(cleanPdfText(translateRequestStatus(request.status)), x + 22, y + 16, { width: badgeW - 12, align: 'center' });

  const topY = y + 47;
  const colGap = 14;
  const colW = (w - 46 - colGap) / 2;
  const rightX = x + w - 23 - colW;
  const leftX = x + 16;

  labelValue(doc, 'الخدمة:', safe(request.serviceTitle || request.serviceKey), rightX, topY, colW);
  labelValue(doc, 'رقم الغرفة:', safe(request.roomNumber), leftX, topY, colW);

  labelValue(doc, 'الإجمالي:', formatMoney(request.price || 0), rightX, topY + 18, colW, { valueColor: COLORS.success });
  labelValue(doc, 'رقم الحجز:', safe(request.user?.bookingCode || request.user?.bookingId), leftX, topY + 18, colW);

  const hasItems = Array.isArray(request.items) && request.items.length > 0;
  if (hasItems) {
    const itemsText = request.items.map((item, itemIndex) => {
      const qty = Number(item.quantity || 1);
      const unit = Number(item.unitPrice ?? item.price ?? 0);
      const total = Number(item.totalPrice ?? unit * qty);
      return `${itemIndex + 1}) ${item.name} × ${qty} - ${formatMoney(total)}`;
    }).join(' | ');
    labelValue(doc, 'الأصناف:', itemsText, rightX, topY + 36, w - 46);
  } else if (request.quantity && request.item) {
    labelValue(doc, 'الصنف:', safe(request.item?.name || request.item), rightX, topY + 36, colW);
    labelValue(doc, 'الكمية:', String(request.quantity), leftX, topY + 36, colW);
    labelValue(doc, 'سعر الوحدة:', formatMoney(request.unitPrice || 0), rightX, topY + 54, colW);
  }

  const infoY = hasItems ? topY + 76 : (request.quantity && request.item ? topY + 76 : topY + 42);
  labelValue(doc, 'اسم العميل:', safe(request.user?.name), rightX, infoY, colW);
  labelValue(doc, 'الهاتف:', safe(request.user?.phone), leftX, infoY, colW);
  labelValue(doc, 'وقت الطلب:', formatDateTime(request.createdAt), rightX, infoY + 18, colW);
  labelValue(doc, 'آخر تحديث:', formatDateTime(request.updatedAt), leftX, infoY + 18, colW);
  labelValue(doc, 'آخر تعديل:', safe(request.updatedBy?.name), rightX, infoY + 36, colW);

  const detailsY = infoY + 62;
  doc.fontSize(9).fillColor(COLORS.muted);
  addText(doc, 'تفاصيل الطلب:', x + 16, detailsY, w - 32);
  doc.fontSize(9.5).fillColor(COLORS.text);
  addText(doc, details, x + 16, detailsY + 15, w - 32, { lineGap: 2 });

  let currentY = detailsY + 44 + Math.min(36, Math.ceil(details.length / 80) * 10);

  if (hasRating) {
    doc.fontSize(9).fillColor(COLORS.primaryDark);
    addText(doc, `التقييم: ${request.rating.stars}/5    ${request.rating.comment ? `| تعليق: ${request.rating.comment}` : ''}`, x + 16, currentY, w - 32);
    currentY += 18;
  }

  if (hasHistory) {
    doc.fontSize(9).fillColor(COLORS.muted);
    addText(doc, 'سجل الحالة:', x + 16, currentY, w - 32);
    currentY += 14;
    const history = request.history.slice(-4);
    for (const item of history) {
      doc.fontSize(8).fillColor(COLORS.text);
      addText(doc, `${translateRequestStatus(item.status)} — ${formatDateTime(item.at)}`, x + 16, currentY, w - 32);
      currentY += 12;
    }
  }

  doc.y = y + h + 12;
}

export async function exportServiceRequestsToPdf(requests = [], options = {}) {
  ensureDir();

  const safeTitle = String(options.filterTitle || 'all').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 40);
  const fileName = `hotel-service-requests-${safeTitle}-${Date.now()}.pdf`;
  const filePath = path.join(exportsDir, fileName);
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 30, bottom: 45, left: PAGE.margin, right: PAGE.margin },
    autoFirstPage: true,
    info: { Title: 'Hotel Service Requests Report', Author: 'Hotel Telegram Bot' }
  });

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const fontPath = findArabicFont();
  if (fontPath) {
    doc.registerFont('ArabicFont', fontPath);
    doc.font('ArabicFont');
  }

  const state = { pageNumber: 1, options };
  addHeader(doc, options);
  addSummary(doc, requests, options);

  if (!requests.length) {
    roundedRect(doc, PAGE.margin, doc.y, PAGE.contentWidth, 80, COLORS.soft, COLORS.line, 10);
    doc.fontSize(13).fillColor(COLORS.muted);
    addText(doc, 'لا توجد طلبات مسجلة في هذا التصدير.', PAGE.margin + 20, doc.y + 30, PAGE.contentWidth - 40);
    doc.y += 96;
  } else {
    addSectionTitle(doc, 'تفاصيل الطلبات');
    const sortedRequests = [...requests].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    for (const [index, request] of sortedRequests.entries()) {
      addRequestCard(doc, request, index, state);
    }
  }

  addFooter(doc, state.pageNumber);
  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return { filePath, fileName };
}
