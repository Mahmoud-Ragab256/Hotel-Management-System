import dotenv from 'dotenv';
import { pathToFileURL } from 'url';
import { Telegraf } from 'telegraf';
import {
  getAvailableRooms,
  getBookings,
  getEmployees,
  getGuests,
  getRooms,
  friendlyApiError,
  loginEmployee
} from './api.js';
import {
  backKeyboard,
  exportRequestsKeyboard,
  hotelServicesKeyboard,
  menuItemsKeyboard,
  menuItemsAdminKeyboard,
  quantityKeyboard,
  orderConfirmKeyboard,
  supportConfirmKeyboard,
  loginBackKeyboard,
  loginKeyboard,
  mainKeyboard,
  requestStatusKeyboard,
  ratingKeyboard,
  rateableRequestsKeyboard,
  adminSettingsKeyboard,
  serviceAdminKeyboard,
  serviceManagementKeyboard,
  servicePricesKeyboard,
  serviceRequestsKeyboard
} from './keyboards.js';
import {
  chunkText,
  formatBooking,
  formatMoney,
  formatRoom,
  formatHotelInfo,
  formatSupportContacts,
  formatLinkedUser,
  formatAuditLog,
  formatServiceLine,
  formatServiceList,
  formatServiceRequest,
  formatWifi,
  normalizeInput,
  normalizePhone,
  serviceTitle,
  translateAccountType,
  translateRequestStatus
} from './format.js';
import {
  createHotelService,
  createMenuItem,
  createServiceRequest,
  initStore,
  closeStore,
  ensureDefaultData,
  createSupportRequest,
  getLinkedUser,
  getHotelInfo,
  getSupportContacts,
  getMenuItemsForService,
  getRequestStats,
  getRequestsByExportFilter,
  getServiceByKey,
  getServiceRequest,
  getWifiSettings,
  listServices,
  listLinkedUsers,
  listAuditLog,
  listRateableRequests,
  listServiceRequests,
  listUserServiceRequests,
  removeLinkedUser,
  saveLinkedUser,
  saveWifiSettings,
  saveHotelInfo,
  saveSupportContacts,
  rateServiceRequest,
  setHotelServiceActive,
  updateHotelServiceName,
  updateHotelServicePrice,
  updateMenuItemPrice,
  updateServiceRequestStatus
} from './store.js';
import { exportServiceRequestsToPdf } from './pdf-export.js';

dotenv.config();

const token = process.env.BOT_TOKEN;
if (!token || token === 'PUT_YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  console.error('BOT_TOKEN غير موجود. افتح ملف Bot/.env وضع توكن بوت تيليجرام.');
  process.exit(1);
}

const storeInfo = await initStore();
ensureDefaultData();
console.log(`✅ تم توصيل البوت بقاعدة البيانات: ${storeInfo.driver === 'mongo' ? `MongoDB/${storeInfo.dbName}` : 'ملف محلي'}`);
console.log('✅ تم فحص بيانات البوت: لو لا توجد بيانات تم إنشاؤها مرة واحدة فقط، ولو توجد بيانات تم تركها كما هي.');

const bot = new Telegraf(token);
export { bot };

const pendingState = new Map();


const SERVICE_MENUS = {
  food: [
    { emoji: '🍔', name: 'برجر لحم + بطاطس', price: 180 },
    { emoji: '🍗', name: 'وجبة فراخ مشوية', price: 220 },
    { emoji: '🍕', name: 'بيتزا وسط', price: 160 },
    { emoji: '🍝', name: 'مكرونة بالصوص الأبيض', price: 140 },
    { emoji: '🥗', name: 'سلطة سيزر', price: 95 },
    { emoji: '🍳', name: 'فطار شرقي', price: 120 },
    { emoji: '🍰', name: 'حلو اليوم', price: 75 }
  ],
  drinks: [
    { emoji: '☕', name: 'قهوة', price: 45 },
    { emoji: '🫖', name: 'شاي', price: 30 },
    { emoji: '🥤', name: 'عصير مانجو', price: 55 },
    { emoji: '🍊', name: 'عصير برتقال', price: 50 },
    { emoji: '💧', name: 'مياه معدنية', price: 20 },
    { emoji: '🥛', name: 'مشروب غازي', price: 35 },
    { emoji: '🍹', name: 'كوكتيل فواكه', price: 70 }
  ]
};

function getServiceMenu(serviceKey) {
  const fromDb = getMenuItemsForService(serviceKey);
  if (fromDb.length) return fromDb;
  return SERVICE_MENUS[String(serviceKey || '')] || [];
}

function formatServiceMenu(service, items = []) {
  if (!items.length) return '';
  return [
    `📋 أصناف ${service?.name || 'الخدمة'} المتاحة:`,
    '',
    ...items.map((item, index) => `${index + 1}) ${item.emoji || '🧾'} ${item.name} - ${formatMoney(item.price)}`),
    '',
    'اختار صنف من الأزرار، وبعدها اختار الكمية. أو اضغط: ✍️ اكتب طلبك يدويًا.'
  ].join('\n');
}


function menuTitle(serviceKey) {
  return serviceKey === 'food' ? 'أصناف الأكل' : serviceKey === 'drinks' ? 'أصناف المشروبات' : 'الأصناف';
}

function menuEmoji(serviceKey) {
  return serviceKey === 'food' ? '🍽️' : serviceKey === 'drinks' ? '🥤' : '🧾';
}

function parsePrice(input) {
  const price = Number(String(input || '').replace(',', '.').replace(/[^0-9.]/g, ''));
  return Number.isFinite(price) && price >= 0 ? price : null;
}

function splitEmojiAndName(input, serviceKey) {
  const text = String(input || '').trim();
  const first = Array.from(text)[0] || '';
  const hasEmoji = /[^\p{L}\p{N}\s]/u.test(first) && first.length > 0;
  if (hasEmoji && text.length > first.length) {
    return { emoji: first, name: text.slice(first.length).trim() };
  }
  return { emoji: serviceKey === 'food' ? '🍽️' : '🥤', name: text };
}

function requestPreviewText({ linkedUser, service, details, price, item, items = [], quantity = 1, unitPrice = null }) {
  const cartItems = Array.isArray(items) && items.length ? items : (item ? [item] : []);
  const hasCartItems = cartItems.length > 0;
  const itemLines = hasCartItems
    ? cartItems.map((cartItem, index) => {
        const qty = Math.max(1, Number(cartItem.quantity || 1));
        const unit = Number(cartItem.unitPrice ?? cartItem.price ?? 0);
        const total = Number(cartItem.totalPrice ?? unit * qty);
        return `${index + 1}) ${cartItem.emoji || '🧾'} ${cartItem.name} × ${qty} — ${formatMoney(total)}`;
      })
    : [];

  return [
    '🧾 مراجعة الطلب قبل الإرسال',
    '',
    `🛎️ الخدمة: ${serviceTitle(service)}`,
    hasCartItems ? '📋 الأصناف المختارة:' : null,
    ...itemLines,
    hasCartItems ? '' : null,
    !hasCartItems && item ? `📌 الصنف: ${item.emoji || '🧾'} ${item.name}` : null,
    !hasCartItems && item ? `🔢 الكمية: ${Math.max(1, Number(quantity || 1))}` : null,
    !hasCartItems && item && unitPrice !== null ? `💵 سعر الوحدة: ${formatMoney(unitPrice)}` : null,
    `💰 الإجمالي: ${formatMoney(price)}`,
    `📄 رقم الحجز: ${linkedUser?.bookingCode || linkedUser?.bookingId || '-'}`,
    `🏨 الغرفة: ${linkedUser?.roomNumber || '-'}`,
    '',
    `📝 تفاصيل الطلب: ${details}`,
    '',
    service?.key === 'food' ? 'تقدر تضيف صنف أكل آخر أو ترسل الطلب.' : null,
    service?.key === 'drinks' ? 'تقدر تضيف مشروب آخر أو ترسل الطلب.' : null,
    service?.key !== 'food' && service?.key !== 'drinks' ? 'اضغط إرسال الطلب لتوصيله للإدارة.' : null
  ].filter(Boolean).join('\n');
}

function supportPreviewText({ linkedUser, message }) {
  const support = getSupportContacts();
  return [
    '📞 مراجعة رسالة خدمة العملاء',
    '',
    formatSupportContacts(support),
    '',
    `📄 رقم الحجز: ${linkedUser?.bookingCode || '-'}`,
    `🏨 الغرفة: ${linkedUser?.roomNumber || '-'}`,
    '',
    `📝 الرسالة: ${message}`,
    '',
    'اضغط إرسال الرسالة لتوصيلها للإدارة.'
  ].join('\n');
}

const getTelegramId = (ctx) => String(ctx.from?.id || '');
const isEmployeeUser = (user) => user?.type === 'employee';
const isGuestUser = (user) => user?.type === 'guest';

async function safeAnswer(ctx) {
  try { if (ctx.callbackQuery) await ctx.answerCbQuery(); } catch {}
}

function getUserIdFromApiUser(user = {}) {
  return String(user.id || user._id || user.guestId || user.employeeId || user.EmployeeId || '');
}

function linkedAccountText(user) {
  if (!user) return 'لا يوجد حساب مسجل حاليًا.';
  if (user.type === 'guest') {
    return `أنت مسجل دخول: ${user.name || 'عميل الفندق'} - حجز ${user.bookingCode || user.bookingId || '-'} - غرفة ${user.roomNumber || '-'} - ${translateAccountType(user.type)}`;
  }
  return `أنت مسجل دخول: ${user.name || user.email || '-'} - ${translateAccountType(user.type)}`;
}

function bookingId(booking = {}) {
  return String(booking._id || booking.id || booking.bookingId || booking.bookingID || '');
}

function explicitBookingCode(booking = {}) {
  return String(
    booking.bookingNumber ||
    booking.bookingNo ||
    booking.reservationNumber ||
    booking.reservationNo ||
    booking.bookingCode ||
    booking.confirmationCode ||
    booking.reference ||
    booking.ref ||
    booking.code ||
    booking.number ||
    ''
  ).trim();
}

function generatedBookingCode(booking = {}) {
  const explicit = explicitBookingCode(booking);
  if (explicit) return explicit;

  const id = bookingId(booking);
  const digits = id.replace(/\D/g, '');
  if (digits.length >= 4) return digits.slice(-6);

  let hash = 0;
  for (const char of id || JSON.stringify(booking)) {
    hash = ((hash * 31) + char.charCodeAt(0)) % 900000;
  }
  return String(1000 + Math.abs(hash % 900000)).padStart(4, '0');
}

function displayBookingCode(booking = {}) {
  return explicitBookingCode(booking) || generatedBookingCode(booking);
}

function bookingCodeCandidates(booking = {}) {
  const values = [
    explicitBookingCode(booking),
    generatedBookingCode(booking),
    bookingId(booking)
  ];
  return Array.from(new Set(values.map(normalizeInput).filter(Boolean)));
}

function isBookingActiveForBot(booking = {}) {
  const status = normalizeInput(booking.status || booking.bookingStatus || '');
  const closedStatuses = new Set(['cancelled', 'canceled', 'checkedout', 'checked_out', 'check-out', 'completed', 'expired', 'ملغي']);
  if (closedStatuses.has(status)) return false;

  return true;
}

function roomNumberFromBooking(booking = {}) {
  return String(
    booking?.roomId?.roomNumber ||
    booking?.room?.roomNumber ||
    booking?.roomNumber ||
    booking?.room ||
    ''
  ).trim();
}

function guestIdFromBooking(booking = {}) {
  const guest = booking.guestId || booking.guest || booking.client || booking.customer;
  if (typeof guest === 'string') return guest;
  if (guest && typeof guest === 'object') return String(guest._id || guest.id || '');
  return String(booking.guest || booking.customerId || '');
}

function guestObjFromBooking(booking = {}) {
  const guest = booking.guestId || booking.guest || booking.client || booking.customer;
  if (guest && typeof guest === 'object') return guest;
  return null;
}

function getPhoneCandidates(booking = {}, guest = {}) {
  return [
    guest.phone,
    guest.mobile,
    guest.phoneNumber,
    guest.whatsapp,
    booking.phone,
    booking.mobile,
    booking.guestPhone,
    booking.customerPhone
  ].filter(Boolean).map(normalizePhone).filter(Boolean);
}

function getGuestName(guest = {}) {
  return guest.fullName || guest.name || guest.username || 'عميل الفندق';
}

function getGuestEmail(guest = {}) {
  return guest.email || '-';
}

function findGuestById(guests = [], id = '') {
  const target = String(id || '');
  if (!target) return null;
  return guests.find((guest) => String(guest._id || guest.id || '') === target) || null;
}

async function findGuestBookingByCode(code) {
  const cleanCode = normalizeInput(code);
  if (!cleanCode) return null;

  const [bookings, guests] = await Promise.all([getBookings(), getGuests().catch(() => [])]);
  const candidates = bookings.filter((booking) => bookingCodeCandidates(booking).includes(cleanCode));

  for (const booking of candidates) {
    if (!isBookingActiveForBot(booking)) continue;
    const directGuest = guestObjFromBooking(booking);
    const guest = directGuest || findGuestById(guests, guestIdFromBooking(booking)) || {};
    return {
      booking,
      guest,
      roomNumber: roomNumberFromBooking(booking),
      bookingCode: displayBookingCode(booking)
    };
  }

  return null;
}

function userBookings(user, bookings = []) {
  if (!user) return [];
  return bookings.filter((booking) => {
    const sameBookingId = user.bookingId && bookingId(booking) === user.bookingId;
    const sameBookingCode = user.bookingCode && bookingCodeCandidates(booking).includes(normalizeInput(user.bookingCode));
    return sameBookingId || sameBookingCode;
  });
}

async function showLogin(ctx) {
  const linkedUser = getLinkedUser(getTelegramId(ctx));
  if (linkedUser) return showHome(ctx);

  const text = [
    '🏨 بوت خدمة الفندق',
    '',
    'قبل تسجيل الدخول تقدر تشوف الغرف المتاحة فقط.',
    'الخدمات وبيانات الواي فاي وطلبات الغرف تظهر بعد تسجيل الدخول.',
    '',
    'اختر العملية المطلوبة:'
  ].join('\n');

  if (ctx.callbackQuery) await ctx.editMessageText(text, loginKeyboard()).catch(() => ctx.reply(text, loginKeyboard()));
  else await ctx.reply(text, loginKeyboard());
}

async function showHome(ctx) {
  const linkedUser = getLinkedUser(getTelegramId(ctx));
  if (!linkedUser) return showLogin(ctx);

  const text = ['🏨 القائمة الرئيسية', '', linkedAccountText(linkedUser), '', 'اختر من القائمة:'].join('\n');
  if (ctx.callbackQuery) await ctx.editMessageText(text, mainKeyboard(linkedUser)).catch(() => ctx.reply(text, mainKeyboard(linkedUser)));
  else await ctx.reply(text, mainKeyboard(linkedUser));
}

async function requireLogin(ctx) {
  const linkedUser = getLinkedUser(getTelegramId(ctx));
  if (!linkedUser) {
    await ctx.reply('سجّل دخولك الأول حتى تظهر لك الخدمات.', loginBackKeyboard);
    return null;
  }
  return linkedUser;
}

async function requireGuest(ctx) {
  const linkedUser = await requireLogin(ctx);
  if (!linkedUser) return null;
  if (!isGuestUser(linkedUser)) {
    await ctx.reply('هذه العملية متاحة للعميل فقط.', backKeyboard);
    return null;
  }
  return linkedUser;
}

async function requireEmployee(ctx) {
  const linkedUser = await requireLogin(ctx);
  if (!linkedUser) return null;
  if (!isEmployeeUser(linkedUser)) {
    await ctx.reply('هذه العملية متاحة للموظف أو الأدمن فقط.', backKeyboard);
    return null;
  }
  return linkedUser;
}

async function sendLong(ctx, title, items, formatter, keyboard = backKeyboard) {
  if (!items.length) {
    await ctx.reply(`${title}\n\nلا توجد بيانات متاحة حاليًا.`, keyboard);
    return;
  }
  const chunks = chunkText(items.map(formatter));
  await ctx.reply(`${title}\n\n${chunks[0]}`, chunks.length === 1 ? keyboard : undefined);
  for (const chunk of chunks.slice(1)) await ctx.reply(chunk);
}

async function showAvailableRooms(ctx, keyboard = backKeyboard) {
  try {
    const rooms = await getAvailableRooms();
    await sendLong(ctx, '🟢 الغرف المتاحة', rooms, formatRoom, keyboard);
  } catch (error) {
    await ctx.reply(`تعذر عرض الغرف المتاحة.\n\n${friendlyApiError(error)}`, keyboard);
  }
}

async function showAccount(ctx) {
  const linkedUser = await requireLogin(ctx);
  if (!linkedUser) return;
  await ctx.reply([
    '👤 حسابي',
    '',
    `النوع: ${translateAccountType(linkedUser.type)}`,
    `الاسم: ${linkedUser.name || '-'}`,
    `الإيميل: ${linkedUser.email || '-'}`,
    `الهاتف: ${linkedUser.phone || '-'}`,
    linkedUser.roomNumber ? `الغرفة: ${linkedUser.roomNumber}` : null,
    linkedUser.bookingCode ? `رقم الحجز: ${linkedUser.bookingCode}` : null,
    linkedUser.role ? `الدور: ${linkedUser.role}` : null
  ].filter(Boolean).join('\n'), backKeyboard);
}

async function showWifiInfo(ctx) {
  if (!(await requireLogin(ctx))) return;
  await ctx.reply(formatWifi(getWifiSettings()), backKeyboard);
}

async function showHotelInfo(ctx) {
  if (!(await requireLogin(ctx))) return;
  await ctx.reply(formatHotelInfo(getHotelInfo()), backKeyboard);
}

async function startHotelInfoEdit(ctx) {
  const linkedUser = await requireEmployee(ctx);
  if (!linkedUser) return;
  pendingState.set(getTelegramId(ctx), { type: 'hotel_info' });
  await ctx.reply([
    'ℹ️ تعديل معلومات الفندق',
    '',
    'ابعت البيانات في 5 سطور بالترتيب:',
    '1) مواعيد الإفطار',
    '2) مواعيد المطعم',
    '3) رقم الاستقبال',
    '4) سياسة تسجيل الخروج',
    '5) ملاحظة خدمات الفندق',
    '',
    'مثال:',
    'من 7 صباحًا إلى 10 صباحًا',
    'من 12 ظهرًا إلى 12 منتصف الليل',
    'داخلي 100 أو 01000000000',
    'تسجيل الخروج قبل 12 ظهرًا',
    'خدمات الغرف متاحة 24 ساعة'
  ].join('\n'), backKeyboard);
}

async function handleHotelInfoText(ctx, input) {
  const linkedUser = getLinkedUser(getTelegramId(ctx));
  if (!isEmployeeUser(linkedUser)) return ctx.reply('تعديل معلومات الفندق متاح للأدمن فقط.', loginBackKeyboard);
  const lines = input.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length < 4) {
    await ctx.reply('البيانات ناقصة. ابعت على الأقل: مواعيد الإفطار، مواعيد المطعم، رقم الاستقبال، سياسة تسجيل الخروج.');
    return;
  }
  const info = saveHotelInfo({
    breakfastTime: lines[0],
    restaurantTime: lines[1],
    receptionPhone: lines[2],
    checkoutPolicy: lines[3],
    servicesNote: lines.slice(4).join(' - ')
  }, linkedUser);
  pendingState.delete(getTelegramId(ctx));
  await ctx.reply(`✅ تم تحديث معلومات الفندق.

${formatHotelInfo(info)}`, backKeyboard);
}

async function startSupportContactsEdit(ctx) {
  const linkedUser = await requireEmployee(ctx);
  if (!linkedUser) return;
  const current = getSupportContacts();
  pendingState.set(getTelegramId(ctx), { type: 'support_contacts' });
  await ctx.reply([
    '📞 تعديل أرقام التواصل مع خدمة العملاء',
    '',
    'الأرقام الحالية:',
    formatSupportContacts(current),
    '',
    'ابعت أرقام التواصل، كل رقم في سطر.',
    'واكتب الملاحظة في آخر سطر بهذا الشكل: ملاحظة: النص المطلوب',
    '',
    'مثال:',
    'الاستقبال الداخلي: 0',
    'خدمة العملاء: 01000000000',
    'واتساب الفندق: 01000000001',
    'الصيانة والطوارئ: 01000000002',
    'ملاحظة: يمكنك الاتصال مباشرة أو كتابة رسالة من البوت.'
  ].join('\n'), backKeyboard);
}

async function handleSupportContactsText(ctx, input) {
  const linkedUser = getLinkedUser(getTelegramId(ctx));
  if (!isEmployeeUser(linkedUser)) return ctx.reply('تعديل أرقام التواصل متاح للأدمن فقط.', loginBackKeyboard);

  const lines = input.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length < 1) {
    return ctx.reply('اكتب رقم واحد على الأقل. مثال: الاستقبال الداخلي: 0');
  }

  let note = '';
  const contacts = [];
  for (const line of lines) {
    if (/^(ملاحظة|ملحوظة|note)\s*[:：-]/i.test(line)) {
      note = line.replace(/^(ملاحظة|ملحوظة|note)\s*[:：-]\s*/i, '').trim();
    } else {
      contacts.push(line);
    }
  }

  if (!contacts.length) return ctx.reply('لازم تكتب رقم أو وسيلة تواصل واحدة على الأقل.');
  const support = saveSupportContacts({ contacts, note }, linkedUser);
  pendingState.delete(getTelegramId(ctx));
  await ctx.reply(`✅ تم تحديث أرقام التواصل.\n\n${formatSupportContacts(support)}`, backKeyboard);
}

async function showAdminSettings(ctx) {
  const linkedUser = await requireEmployee(ctx);
  if (!linkedUser) return;
  const services = listServices();
  const wifi = getWifiSettings();
  const info = getHotelInfo();
  const support = getSupportContacts();
  await ctx.reply([
    '⚙️ إعدادات الفندق',
    '',
    `🌐 الواي فاي: ${wifi.name || '-'} / ${wifi.password || '-'}`,
    `ℹ️ رقم الاستقبال: ${info.receptionPhone || '-'}`,
    `📞 أرقام التواصل: ${Array.isArray(support.contacts) ? support.contacts.length : 0}`,
    `🧾 عدد الخدمات: ${services.length}`,
    `✅ الخدمات المتاحة: ${services.filter((s) => s.active !== false).length}`,
    `⛔ الخدمات الموقوفة: ${services.filter((s) => s.active === false).length}`,
    '',
    'اختر ما تريد تعديله:'
  ].join('\n'), adminSettingsKeyboard());
}

async function showClientBotLink(ctx) {
  const linkedUser = await requireEmployee(ctx);
  if (!linkedUser) return;
  const username = ctx.botInfo?.username || process.env.BOT_USERNAME || '';
  const link = username ? `https://t.me/${username}` : 'ضع اسم البوت في .env داخل BOT_USERNAME أو افتح البوت من تيليجرام وانسخ الرابط.';

  let bookingLines = [];
  try {
    const bookings = (await getBookings()).filter(isBookingActiveForBot).slice(0, 10);
    bookingLines = bookings.map((booking) => {
      const guest = guestObjFromBooking(booking) || {};
      return `• رقم الحجز: ${displayBookingCode(booking)} | غرفة: ${roomNumberFromBooking(booking) || '-'} | العميل: ${getGuestName(guest)}`;
    });
  } catch {
    bookingLines = [];
  }

  await ctx.reply([
    '🔗 لينك البوت للعميل',
    '',
    link,
    '',
    'طريقة الدخول للعميل:',
    'يفتح اللينك، ثم يدخل رقم الحجز فقط.',
    'لا يوجد دخول برقم الغرفة أو الموبايل.',
    '',
    bookingLines.length ? '📄 أرقام حجوزات فعالة يمكن إرسالها للعميل:' : null,
    ...bookingLines
  ].filter(Boolean).join('\n'), backKeyboard);
}

async function showRegisteredCustomers(ctx) {
  if (!(await requireEmployee(ctx))) return;
  const users = listLinkedUsers({ type: 'guest', limit: 50 });
  await sendLong(ctx, '👥 العملاء المسجلين', users, formatLinkedUser, backKeyboard);
}

async function showAuditLog(ctx) {
  if (!(await requireEmployee(ctx))) return;
  const logs = listAuditLog(50);
  await sendLong(ctx, '🧾 سجل العمليات', logs, formatAuditLog, backKeyboard);
}

async function startContactSupport(ctx) {
  const linkedUser = await requireGuest(ctx);
  if (!linkedUser) return;
  const support = getSupportContacts();
  pendingState.set(getTelegramId(ctx), { type: 'support', step: 'message' });
  await ctx.reply([
    '📞 التواصل مع خدمة العملاء',
    '',
    formatSupportContacts(support),
    '',
    `📄 رقم الحجز: ${linkedUser.bookingCode || '-'}`,
    `🏨 الغرفة: ${linkedUser.roomNumber || '-'}`,
    '',
    'تقدر تتصل على الأرقام المكتوبة فوق، أو تكتب رسالتك هنا.',
    'بعد الكتابة هيظهر لك زر: ✅ إرسال الرسالة.',
    'مثال: محتاج أتواصل مع الاستقبال بخصوص موعد المغادرة.'
  ].join('\n'), backKeyboard);
}

async function handleSupportText(ctx, state, input) {
  const telegramId = getTelegramId(ctx);
  const linkedUser = getLinkedUser(telegramId);
  if (!isGuestUser(linkedUser)) {
    pendingState.delete(telegramId);
    return ctx.reply('لازم تسجل دخول كعميل حتى تراسل خدمة العملاء.', loginBackKeyboard);
  }
  if (state.step === 'message') {
    if (input.trim().length < 2) return ctx.reply('اكتب رسالة أوضح لخدمة العملاء.');
    pendingState.set(telegramId, { type: 'support', step: 'confirm', message: input.trim() });
    return ctx.reply(supportPreviewText({ linkedUser, message: input.trim() }), supportConfirmKeyboard());
  }
}

async function confirmSupportMessage(ctx) {
  const telegramId = getTelegramId(ctx);
  const state = pendingState.get(telegramId);
  const linkedUser = getLinkedUser(telegramId);
  if (!state || state.type !== 'support' || state.step !== 'confirm' || !state.message) return ctx.reply('لا توجد رسالة جاهزة للإرسال.', backKeyboard);
  if (!isGuestUser(linkedUser)) return ctx.reply('لازم تسجل دخول كعميل حتى تراسل خدمة العملاء.', loginBackKeyboard);
  const request = createSupportRequest({ telegramId, user: linkedUser, details: state.message, roomNumber: linkedUser.roomNumber });
  pendingState.delete(telegramId);
  await ctx.reply([
    '✅ تم إرسال رسالتك لخدمة العملاء.',
    '',
    `📌 رقم الطلب: ${request.id}`,
    `🏨 الغرفة: ${request.roomNumber}`,
    `📌 الحالة: ${translateRequestStatus(request.status)}`,
    '',
    'تقدر تتابعها من زر: 📦 متابعة طلباتي'
  ].join('\n'), backKeyboard);
}

async function startWifiEdit(ctx) {
  const linkedUser = await requireEmployee(ctx);
  if (!linkedUser) return;
  pendingState.set(getTelegramId(ctx), { type: 'wifi' });
  await ctx.reply([
    '✏️ تعديل بيانات الواي فاي',
    '',
    'ابعت البيانات في 3 سطور:',
    'اسم الشبكة',
    'الباسورد',
    'ملاحظة الواي فاي',
    '',
    'مثال:',
    'Hotel-WiFi',
    '123456789',
    'متاح للنزلاء داخل الفندق'
  ].join('\n'), backKeyboard);
}

async function showBasicServices(ctx) {
  const linkedUser = await requireLogin(ctx);
  if (!linkedUser) return;
  const wifi = getWifiSettings();
  const services = listServices({ activeOnly: true });
  await ctx.reply([
    '🧾 الخدمات الأساسية المتاحة',
    '',
    formatWifi(wifi),
    '',
    formatServiceList(services),
    '',
    'اختر خدمات الفندق لعمل طلب جديد، أو متابعة طلباتي لمراجعة الحالة.'
  ].join('\n'), hotelServicesKeyboard(services, linkedUser.type));
}

async function showHotelServices(ctx) {
  const linkedUser = await requireLogin(ctx);
  if (!linkedUser) return;
  const services = listServices({ activeOnly: linkedUser.type === 'guest' });
  await ctx.reply([
    '🛎️ خدمات الفندق',
    '',
    linkedUser.type === 'guest' ? 'اختر الخدمة التي تريد طلبها:' : 'قائمة الخدمات الحالية:',
    '',
    formatServiceList(services),
    '',
    linkedUser.type === 'guest' ? 'بعد اختيار الخدمة اكتب تفاصيل الطلب، وسيتم إرسال الطلب للإدارة.' : 'تعديل الخدمات والأسعار متاح من لوحة الأدمن.'
  ].join('\n'), hotelServicesKeyboard(services, linkedUser.type));
}

async function showMyBookings(ctx) {
  const linkedUser = await requireGuest(ctx);
  if (!linkedUser) return;
  try {
    const bookings = userBookings(linkedUser, await getBookings());
    await sendLong(ctx, '📄 حجوزاتي', bookings, formatBooking, backKeyboard);
  } catch (error) {
    await ctx.reply(`تعذر عرض الحجوزات.\n\n${friendlyApiError(error)}`, backKeyboard);
  }
}

function startLogin(ctx, loginType) {
  const telegramId = getTelegramId(ctx);
  if (loginType === 'guest') {
    pendingState.set(telegramId, { type: 'login', loginType: 'guest', step: 'booking_code' });
    return ctx.reply([
      '🔐 دخول العميل',
      '',
      'أرسل رقم الحجز فقط.',
      'لا يمكن الدخول برقم الغرفة أو الموبايل.',
      '',
      'مثال: 1005'
    ].join('\n'));
  }
  pendingState.set(telegramId, { type: 'login', loginType: 'employee', step: 'email' });
  return ctx.reply('🔐 دخول موظف / أدمن\n\nأرسل البريد الإلكتروني الآن.');
}

async function handleLoginText(ctx, state, input) {
  const telegramId = getTelegramId(ctx);

  if (state.loginType === 'guest') {
    if (state.step === 'booking_code') {
      try {
        const enteredCode = input.trim();
        const match = await findGuestBookingByCode(enteredCode);
        if (!match) {
          await ctx.reply('لم يتم العثور على حجز فعّال بهذا الرقم. تأكد من رقم الحجز أو تواصل مع الاستقبال.', loginBackKeyboard);
          pendingState.delete(telegramId);
          return;
        }

        const booking = match.booking;
        const guest = match.guest || {};
        const roomNumber = match.roomNumber || '-';
        const phone = getPhoneCandidates(booking, guest)[0] || '-';
        const bookingCode = match.bookingCode || enteredCode;

        saveLinkedUser(telegramId, {
          type: 'guest',
          userId: getUserIdFromApiUser(guest),
          name: getGuestName(guest),
          email: getGuestEmail(guest),
          phone,
          roomNumber,
          bookingId: bookingId(booking),
          bookingCode,
          bookingStatus: booking.status || '-',
          loginMethod: 'booking_code_only'
        });

        pendingState.delete(telegramId);
        await ctx.reply([
          '✅ تم تسجيل دخول العميل بنجاح.',
          '',
          `الاسم: ${getGuestName(guest)}`,
          `رقم الحجز: ${bookingCode}`,
          `الغرفة: ${roomNumber}`
        ].join('\n'));
        await showHome(ctx);
      } catch (error) {
        pendingState.delete(telegramId);
        await ctx.reply(`حدث خطأ أثناء تسجيل دخول العميل.\n\n${friendlyApiError(error)}`, loginBackKeyboard);
      }
      return;
    }
  }

  if (state.step === 'email') {
    if (!input.includes('@')) {
      await ctx.reply('البريد الإلكتروني غير صحيح. أرسل الإيميل بهذا الشكل: name@example.com');
      return;
    }
    pendingState.set(telegramId, { ...state, step: 'password', email: input.trim() });
    await ctx.reply('تمام. أرسل الباسورد الآن.');
    return;
  }

  if (state.step === 'password') {
    try {
      const result = await loginEmployee(state.email, input);
      const user = result?.data || result?.user || {};
      saveLinkedUser(telegramId, {
        type: 'employee',
        userId: getUserIdFromApiUser(user),
        name: user.fullName || user.name || '-',
        email: user.email || state.email,
        phone: user.phone || '-',
        role: user.role || 'Admin',
        token: result?.token || result?.data?.token || ''
      });
      pendingState.delete(telegramId);
      await ctx.reply(['✅ تم تسجيل دخول الموظف / الأدمن بنجاح.', '', `الاسم: ${user.fullName || user.name || '-'}`, `الإيميل: ${user.email || state.email}`].join('\n'));
      await showHome(ctx);
    } catch (error) {
      pendingState.delete(telegramId);
      await ctx.reply(`بيانات دخول الموظف غير صحيحة أو السيرفر غير متاح.\n\n${friendlyApiError(error)}`, loginBackKeyboard);
    }
  }
}

async function handleWifiText(ctx, input) {
  const linkedUser = getLinkedUser(getTelegramId(ctx));
  if (!isEmployeeUser(linkedUser)) return ctx.reply('تعديل بيانات الواي فاي متاح للأدمن فقط.', loginBackKeyboard);
  const lines = input.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) {
    await ctx.reply('البيانات ناقصة. ابعت اسم الشبكة في سطر، والباسورد في سطر، وملاحظة اختيارية في سطر ثالث.');
    return;
  }
  const wifi = saveWifiSettings({ name: lines[0], password: lines[1], note: lines.slice(2).join(' - ') }, linkedUser);
  pendingState.delete(getTelegramId(ctx));
  await ctx.reply(`✅ تم تحديث بيانات الواي فاي.\n\n${formatWifi(wifi)}`, backKeyboard);
}

async function startServicePriceEdit(ctx, serviceKey) {
  const linkedUser = await requireEmployee(ctx);
  if (!linkedUser) return;
  const service = getServiceByKey(serviceKey);
  if (!service) return ctx.reply('الخدمة غير موجودة.', backKeyboard);
  pendingState.set(getTelegramId(ctx), { type: 'service_price', serviceKey });
  await ctx.reply([`💰 تعديل سعر: ${serviceTitle(service)}`, '', `السعر الحالي: ${formatMoney(service.price)}`, '', 'اكتب السعر الجديد رقم فقط. مثال: 150'].join('\n'), backKeyboard);
}

async function handleServicePriceText(ctx, state, input) {
  const linkedUser = getLinkedUser(getTelegramId(ctx));
  if (!isEmployeeUser(linkedUser)) return ctx.reply('تعديل الأسعار متاح للأدمن فقط.', loginBackKeyboard);
  const price = Number(input.replace(',', '.').replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(price) || price < 0) return ctx.reply('السعر غير صحيح. اكتب رقم فقط، مثال: 150');
  const service = updateHotelServicePrice(state.serviceKey, price, linkedUser);
  pendingState.delete(getTelegramId(ctx));
  await ctx.reply(service ? `✅ تم تحديث السعر.\n\n${formatServiceLine(service)}` : 'الخدمة غير موجودة.', service ? serviceAdminKeyboard(service) : backKeyboard);
}

async function showServicePricesEdit(ctx) {
  if (!(await requireEmployee(ctx))) return;
  const services = listServices();
  await ctx.reply([
    '💰 تعديل الأسعار',
    '',
    'تقدر تعدل أسعار الخدمات العامة، أو تدخل على أصناف الأكل والمشروبات لتعديل سعر كل صنف أو إضافة صنف جديد.',
    '',
    formatServiceList(services),
    '',
    'اختر ما تريد تعديله:'
  ].join('\n'), servicePricesKeyboard(services));
}


async function showMenuItemsAdmin(ctx, serviceKey) {
  const linkedUser = await requireEmployee(ctx);
  if (!linkedUser) return;
  if (!['food', 'drinks'].includes(serviceKey)) return ctx.reply('نوع الأصناف غير صحيح.', backKeyboard);
  const items = getMenuItemsForService(serviceKey);
  const lines = items.length
    ? items.map((item, index) => `${index + 1}) ${item.emoji || '🧾'} ${item.name} - ${formatMoney(item.price)}`)
    : ['لا توجد أصناف مضافة حاليًا.'];
  await ctx.reply([
    `${menuEmoji(serviceKey)} ${menuTitle(serviceKey)}`,
    '',
    ...lines,
    '',
    'اختار صنف لتعديل سعره، أو اضغط إضافة صنف جديد.'
  ].join('\n'), menuItemsAdminKeyboard(serviceKey, items));
}

async function startMenuItemPriceEdit(ctx, serviceKey, index) {
  const linkedUser = await requireEmployee(ctx);
  if (!linkedUser) return;
  const items = getMenuItemsForService(serviceKey);
  const idx = Number(index);
  const item = items[idx];
  if (!item) return ctx.reply('الصنف غير موجود.', backKeyboard);
  pendingState.set(getTelegramId(ctx), { type: 'menu_item_price', serviceKey, index: idx });
  await ctx.reply([
    `💰 تعديل سعر الصنف`,
    '',
    `${item.emoji || '🧾'} ${item.name}`,
    `السعر الحالي: ${formatMoney(item.price)}`,
    '',
    'اكتب السعر الجديد رقم فقط. مثال: 180'
  ].join('\n'), backKeyboard);
}

async function handleMenuItemPriceText(ctx, state, input) {
  const linkedUser = getLinkedUser(getTelegramId(ctx));
  if (!isEmployeeUser(linkedUser)) return ctx.reply('تعديل أسعار الأصناف متاح للأدمن فقط.', loginBackKeyboard);
  const price = parsePrice(input);
  if (price === null) return ctx.reply('السعر غير صحيح. اكتب رقم فقط، مثال: 180');
  const item = updateMenuItemPrice(state.serviceKey, state.index, price, linkedUser);
  pendingState.delete(getTelegramId(ctx));
  if (!item) return ctx.reply('الصنف غير موجود.', backKeyboard);
  await ctx.reply([
    '✅ تم تحديث سعر الصنف.',
    '',
    `${item.emoji || '🧾'} ${item.name}`,
    `السعر الجديد: ${formatMoney(item.price)}`,
    '',
    'العميل سيشاهد السعر الجديد فورًا عند فتح القائمة.'
  ].join('\n'), menuItemsAdminKeyboard(state.serviceKey, getMenuItemsForService(state.serviceKey)));
}

async function startAddMenuItem(ctx, serviceKey) {
  const linkedUser = await requireEmployee(ctx);
  if (!linkedUser) return;
  if (!['food', 'drinks'].includes(serviceKey)) return ctx.reply('نوع الأصناف غير صحيح.', backKeyboard);
  pendingState.set(getTelegramId(ctx), { type: 'menu_item_add', step: 'name', serviceKey });
  await ctx.reply([
    `➕ إضافة صنف جديد إلى ${menuTitle(serviceKey)}`,
    '',
    'اكتب اسم الصنف، وممكن تكتب الإيموجي في الأول.',
    serviceKey === 'food' ? 'مثال: 🍔 برجر دجاج' : 'مثال: 🧃 عصير تفاح'
  ].join('\n'), backKeyboard);
}

async function handleAddMenuItemText(ctx, state, input) {
  const linkedUser = getLinkedUser(getTelegramId(ctx));
  if (!isEmployeeUser(linkedUser)) return ctx.reply('إضافة الأصناف متاحة للأدمن فقط.', loginBackKeyboard);

  if (state.step === 'name') {
    const parsed = splitEmojiAndName(input, state.serviceKey);
    if (parsed.name.length < 2) return ctx.reply('اسم الصنف قصير جدًا. اكتب اسم واضح للصنف.');
    pendingState.set(getTelegramId(ctx), { ...state, step: 'price', emoji: parsed.emoji, name: parsed.name });
    await ctx.reply([
      `تمام: ${parsed.emoji} ${parsed.name}`,
      '',
      'اكتب سعر الصنف رقم فقط. مثال: 150'
    ].join('\n'), backKeyboard);
    return;
  }

  if (state.step === 'price') {
    const price = parsePrice(input);
    if (price === null) return ctx.reply('السعر غير صحيح. اكتب رقم فقط، مثال: 150');
    const item = createMenuItem(state.serviceKey, { emoji: state.emoji, name: state.name, price }, linkedUser);
    pendingState.delete(getTelegramId(ctx));
    if (!item) return ctx.reply('تعذر إضافة الصنف.', backKeyboard);
    await ctx.reply([
      '✅ تم إضافة الصنف بنجاح.',
      '',
      `${item.emoji || '🧾'} ${item.name}`,
      `السعر: ${formatMoney(item.price)}`,
      '',
      'العميل سيشاهد الصنف الجديد فورًا.'
    ].join('\n'), menuItemsAdminKeyboard(state.serviceKey, getMenuItemsForService(state.serviceKey)));
  }
}

async function showServiceManagement(ctx) {
  if (!(await requireEmployee(ctx))) return;
  const services = listServices();
  await ctx.reply(['🧾 إدارة الخدمات', '', 'من هنا تقدر تضيف خدمة، تعدل اسمها، تعدل سعرها، توقفها أو تشغلها.', '', formatServiceList(services)].join('\n'), serviceManagementKeyboard(services));
}

async function viewAdminService(ctx, serviceKey) {
  if (!(await requireEmployee(ctx))) return;
  const service = getServiceByKey(serviceKey);
  if (!service) return ctx.reply('الخدمة غير موجودة.', backKeyboard);
  await ctx.reply([
    '🧾 تفاصيل الخدمة',
    '',
    `الاسم: ${serviceTitle(service)}`,
    `السعر: ${formatMoney(service.price)}`,
    `الحالة: ${service.active === false ? 'موقوفة' : 'متاحة'}`,
    service.detailsHint ? `مثال الطلب: ${service.detailsHint}` : null
  ].filter(Boolean).join('\n'), serviceAdminKeyboard(service));
}

async function startAddService(ctx) {
  if (!(await requireEmployee(ctx))) return;
  pendingState.set(getTelegramId(ctx), { type: 'service_add', step: 'name' });
  await ctx.reply(['➕ إضافة خدمة جديدة', '', 'اكتب اسم الخدمة الجديدة.', 'مثال: غسيل ملابس'].join('\n'), backKeyboard);
}

async function handleAddServiceText(ctx, state, input) {
  const linkedUser = getLinkedUser(getTelegramId(ctx));
  if (!isEmployeeUser(linkedUser)) return ctx.reply('إضافة الخدمات متاحة للأدمن فقط.', loginBackKeyboard);

  if (state.step === 'name') {
    if (input.length < 2) return ctx.reply('اسم الخدمة قصير جدًا. اكتب اسم واضح للخدمة.');
    pendingState.set(getTelegramId(ctx), { ...state, step: 'price', name: input.trim() });
    await ctx.reply('اكتب سعر الخدمة رقم فقط. مثال: 100');
    return;
  }

  if (state.step === 'price') {
    const price = Number(input.replace(',', '.').replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(price) || price < 0) return ctx.reply('السعر غير صحيح. اكتب رقم فقط، مثال: 100');
    const service = createHotelService({ name: state.name, price, active: true }, linkedUser);
    pendingState.delete(getTelegramId(ctx));
    await ctx.reply(`✅ تم إضافة الخدمة بنجاح.\n\n${formatServiceLine(service)}`, serviceAdminKeyboard(service));
  }
}

async function startRenameService(ctx, serviceKey) {
  if (!(await requireEmployee(ctx))) return;
  const service = getServiceByKey(serviceKey);
  if (!service) return ctx.reply('الخدمة غير موجودة.', backKeyboard);
  pendingState.set(getTelegramId(ctx), { type: 'service_rename', serviceKey });
  await ctx.reply([`✏️ تعديل اسم الخدمة`, '', `الاسم الحالي: ${serviceTitle(service)}`, '', 'اكتب الاسم الجديد فقط.'].join('\n'), backKeyboard);
}

async function handleRenameServiceText(ctx, state, input) {
  const linkedUser = getLinkedUser(getTelegramId(ctx));
  if (!isEmployeeUser(linkedUser)) return ctx.reply('تعديل الخدمات متاح للأدمن فقط.', loginBackKeyboard);
  if (input.length < 2) return ctx.reply('اسم الخدمة قصير جدًا.');
  const service = updateHotelServiceName(state.serviceKey, input.trim(), linkedUser);
  pendingState.delete(getTelegramId(ctx));
  await ctx.reply(service ? `✅ تم تعديل اسم الخدمة.\n\n${formatServiceLine(service)}` : 'الخدمة غير موجودة.', service ? serviceAdminKeyboard(service) : backKeyboard);
}

async function toggleService(ctx, serviceKey) {
  const linkedUser = await requireEmployee(ctx);
  if (!linkedUser) return;
  const service = getServiceByKey(serviceKey);
  if (!service) return ctx.reply('الخدمة غير موجودة.', backKeyboard);
  const updated = setHotelServiceActive(serviceKey, service.active === false, linkedUser);
  await ctx.reply(`✅ تم تحديث حالة الخدمة.\n\n${formatServiceLine(updated)}`, serviceAdminKeyboard(updated));
}


function parseQuantity(input) {
  const quantity = Number(String(input || '').replace(',', '.').replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  return Math.min(99, Math.floor(quantity));
}

async function confirmMenuItemQuantity(ctx, quantity) {
  const telegramId = getTelegramId(ctx);
  const linkedUser = getLinkedUser(telegramId);
  const state = pendingState.get(telegramId);
  if (!state || state.type !== 'order_quantity') return ctx.reply('لا يوجد صنف في انتظار تحديد الكمية.', backKeyboard);
  if (!isGuestUser(linkedUser)) {
    pendingState.delete(telegramId);
    return ctx.reply('لازم تسجل دخول كعميل حتى تعمل طلب خدمة.', loginBackKeyboard);
  }
  const service = getServiceByKey(state.serviceKey);
  if (!service || service.active === false) {
    pendingState.delete(telegramId);
    return ctx.reply('هذه الخدمة غير متاحة حاليًا.', backKeyboard);
  }
  const qty = Math.max(1, Number(quantity || 1));
  const unitPrice = Number(state.item?.price || 0);
  const totalPrice = unitPrice * qty;
  const item = { ...(state.item || {}), quantity: qty, unitPrice, totalPrice };
  const items = [...(Array.isArray(state.cartItems) ? state.cartItems : []), item];
  const price = items.reduce((sum, cartItem) => sum + Number(cartItem.totalPrice ?? (Number(cartItem.unitPrice ?? cartItem.price ?? 0) * Number(cartItem.quantity || 1))), 0);
  const details = items.map((cartItem) => `${cartItem.quantity || 1} × ${cartItem.name}`).join(' + ');

  pendingState.set(telegramId, {
    type: 'order_confirm',
    serviceKey: state.serviceKey,
    details,
    items,
    item: items.length === 1 ? item : null,
    quantity: items.reduce((sum, cartItem) => sum + Number(cartItem.quantity || 1), 0),
    unitPrice: items.length === 1 ? unitPrice : null,
    priceOverride: price
  });
  await ctx.reply(requestPreviewText({ linkedUser, service, details, price, items }), orderConfirmKeyboard(state.serviceKey));
}

async function handleQuantityText(ctx, state, input) {
  if (state.step !== 'quantity_custom') return;
  const quantity = parseQuantity(input);
  if (!quantity) return ctx.reply('الكمية غير صحيحة. اكتب رقم فقط، مثال: 2');
  await confirmMenuItemQuantity(ctx, quantity);
}

async function handleOrderText(ctx, state, input) {
  const telegramId = getTelegramId(ctx);
  const linkedUser = getLinkedUser(telegramId);
  if (!isGuestUser(linkedUser)) {
    pendingState.delete(telegramId);
    return ctx.reply('لازم تسجل دخول كعميل حتى تعمل طلب خدمة.', loginBackKeyboard);
  }

  if (state.step === 'details') {
    if (input.length < 2) return ctx.reply('اكتب تفاصيل الطلب بشكل أوضح.');
    const service = getServiceByKey(state.serviceKey);
    if (!service || service.active === false) {
      pendingState.delete(telegramId);
      return ctx.reply('هذه الخدمة غير متاحة حاليًا.', backKeyboard);
    }
    const price = Number(state.priceOverride ?? service.price ?? 0);
    const details = input.trim();
    pendingState.set(telegramId, {
      type: 'order_confirm',
      serviceKey: state.serviceKey,
      details,
      items: Array.isArray(state.items) ? state.items : [],
      item: state.item || null,
      quantity: state.quantity || state.item?.quantity || 1,
      unitPrice: state.unitPrice ?? state.item?.unitPrice ?? null,
      priceOverride: price
    });
    await ctx.reply(requestPreviewText({ linkedUser, service, details, price, items: state.items || [], item: state.item || null, quantity: state.quantity || state.item?.quantity || 1, unitPrice: state.unitPrice ?? state.item?.unitPrice ?? null }), orderConfirmKeyboard(state.serviceKey));
  }
}

async function confirmServiceOrder(ctx) {
  const telegramId = getTelegramId(ctx);
  const state = pendingState.get(telegramId);
  const linkedUser = getLinkedUser(telegramId);
  if (!state || state.type !== 'order_confirm') return ctx.reply('لا يوجد طلب جاهز للإرسال.', backKeyboard);
  if (!isGuestUser(linkedUser)) return ctx.reply('لازم تسجل دخول كعميل حتى تعمل طلب خدمة.', loginBackKeyboard);
  const request = createServiceRequest({
    telegramId,
    user: linkedUser,
    serviceKey: state.serviceKey,
    details: state.details,
    roomNumber: linkedUser.roomNumber,
    priceOverride: state.priceOverride,
    item: state.item || null,
    items: Array.isArray(state.items) ? state.items : [],
    quantity: state.quantity || state.item?.quantity || 1,
    unitPrice: state.unitPrice ?? state.item?.unitPrice ?? null
  });
  pendingState.delete(telegramId);
  await ctx.reply([
    '✅ تم إرسال طلبك بنجاح.',
    '',
    `📌 رقم الطلب: ${request.id}`,
    `🛎️ الخدمة: ${request.serviceTitle}`,
    Array.isArray(request.items) && request.items.length ? `📋 الأصناف:
${request.items.map((item, index) => `${index + 1}) ${item.emoji || '🧾'} ${item.name} × ${item.quantity || 1} — ${formatMoney(item.totalPrice ?? ((item.unitPrice ?? item.price ?? 0) * (item.quantity || 1)))}`).join('\n')}` : null,
    request.quantity && request.item && !(Array.isArray(request.items) && request.items.length) ? `🔢 الكمية: ${request.quantity}` : null,
    request.unitPrice && !(Array.isArray(request.items) && request.items.length) ? `💵 سعر الوحدة: ${formatMoney(request.unitPrice)}` : null,
    `💰 الإجمالي: ${formatMoney(request.price)}`,
    `📄 رقم الحجز: ${linkedUser.bookingCode || linkedUser.bookingId || '-'}`,
    `🏨 الغرفة: ${request.roomNumber}`,
    `📌 الحالة: ${translateRequestStatus(request.status)}`,
    '',
    'تقدر تتابع الحالة من زر: 📦 متابعة طلباتي'
  ].filter((line) => line !== null && line !== undefined).join('\n'), backKeyboard);
}

async function showMyServiceRequests(ctx) {
  const linkedUser = await requireGuest(ctx);
  if (!linkedUser) return;
  const requests = listUserServiceRequests(getTelegramId(ctx), 20);
  await sendLong(ctx, '📦 متابعة طلباتي', requests, (request) => formatServiceRequest(request, { admin: false }), backKeyboard);
}

async function showRateableRequests(ctx) {
  const linkedUser = await requireGuest(ctx);
  if (!linkedUser) return;
  const requests = listRateableRequests(getTelegramId(ctx), 20);
  if (!requests.length) return ctx.reply('لا توجد طلبات منفذة تحتاج إلى تقييم حاليًا.', backKeyboard);
  await ctx.reply('⭐ اختر الطلب الذي تريد تقييمه:', rateableRequestsKeyboard(requests));
}

async function chooseRateRequest(ctx, requestId) {
  const linkedUser = await requireGuest(ctx);
  if (!linkedUser) return;
  const request = getServiceRequest(requestId);
  if (!request || String(request.telegramId) !== getTelegramId(ctx)) return ctx.reply('الطلب غير موجود في حسابك.', backKeyboard);
  if (request.status !== 'done') return ctx.reply('يمكن تقييم الطلب بعد تنفيذه فقط.', backKeyboard);
  if (request.rating) return ctx.reply('تم تقييم هذا الطلب من قبل.', backKeyboard);
  await ctx.reply([
    `⭐ تقييم الطلب ${request.id}`,
    '',
    `الخدمة: ${request.serviceTitle}`,
    'اختر التقييم من 1 إلى 5:'
  ].join('\n'), ratingKeyboard(request.id));
}

async function startRatingComment(ctx, requestId, stars) {
  const linkedUser = await requireGuest(ctx);
  if (!linkedUser) return;
  const request = getServiceRequest(requestId);
  if (!request || String(request.telegramId) !== getTelegramId(ctx)) return ctx.reply('الطلب غير موجود في حسابك.', backKeyboard);
  pendingState.set(getTelegramId(ctx), { type: 'rating_comment', requestId, stars: Number(stars) });
  await ctx.reply([
    `تم اختيار ${stars}⭐`,
    '',
    'اكتب تعليقك على الخدمة الآن، أو اكتب: تخطي'
  ].join('\n'), backKeyboard);
}

async function handleRatingCommentText(ctx, state, input) {
  const comment = normalizeInput(input) === 'تخطي' ? '' : input.trim();
  const request = rateServiceRequest(state.requestId, getTelegramId(ctx), state.stars, comment);
  pendingState.delete(getTelegramId(ctx));
  if (!request) return ctx.reply('تعذر حفظ التقييم. الطلب غير موجود.', backKeyboard);
  await ctx.reply([
    '✅ شكرًا لك، تم حفظ تقييم الخدمة.',
    '',
    `📌 الطلب: ${request.id}`,
    `⭐ التقييم: ${request.rating.stars}/5`,
    request.rating.comment ? `💬 تعليقك: ${request.rating.comment}` : null
  ].filter(Boolean).join('\n'), backKeyboard);
}

async function showCustomerRequests(ctx) {
  if (!(await requireEmployee(ctx))) return;
  const requests = listServiceRequests({ limit: 20 });
  if (!requests.length) return ctx.reply('لا توجد طلبات عملاء حاليًا.', backKeyboard);
  await ctx.reply('📋 طلبات العملاء\n\nاختر الطلب لعرض التفاصيل وتغيير الحالة:', serviceRequestsKeyboard(requests));
}

async function viewCustomerRequest(ctx, requestId) {
  if (!(await requireEmployee(ctx))) return;
  const request = getServiceRequest(requestId);
  if (!request) return ctx.reply('الطلب غير موجود.', backKeyboard);
  await ctx.reply(formatServiceRequest(request, { admin: true }), requestStatusKeyboard(request.id));
}

async function setCustomerRequestStatus(ctx, requestId, status) {
  const linkedUser = await requireEmployee(ctx);
  if (!linkedUser) return;
  const request = updateServiceRequestStatus(requestId, status, linkedUser);
  if (!request) return ctx.reply('الطلب غير موجود.', backKeyboard);

  await ctx.reply(['✅ تم تحديث حالة الطلب.', '', formatServiceRequest(request, { admin: true })].join('\n'), requestStatusKeyboard(request.id));

  if (request.telegramId) {
    const message = [
      `تم تحديث حالة طلبك ${request.id}`,
      `الحالة الجديدة: ${translateRequestStatus(request.status)}`,
      '',
      `🛎️ الخدمة: ${request.serviceTitle}`,
      `🏨 الغرفة: ${request.roomNumber}`
    ].join('\n');

    if (request.status === 'done' && !request.rating) {
      await bot.telegram.sendMessage(request.telegramId, `${message}\n\n⭐ الخدمة تم تنفيذها. قيّم الخدمة من 1 إلى 5:`, ratingKeyboard(request.id)).catch(() => {});
    } else {
      await bot.telegram.sendMessage(request.telegramId, message).catch(() => {});
    }
  }
}

function exportLabel(filter, roomNumber = '') {
  const labels = { all: 'كل الطلبات', today: 'طلبات اليوم', week: 'طلبات هذا الأسبوع', done: 'الطلبات المنفذة فقط', rejected: 'الطلبات المرفوضة فقط', room: `طلبات غرفة ${roomNumber}` };
  return labels[filter] || 'كل الطلبات';
}

async function exportRequestsPdf(ctx, filter = 'all', roomNumber = '') {
  const linkedUser = await requireEmployee(ctx);
  if (!linkedUser) return;
  const requests = getRequestsByExportFilter(filter, roomNumber);
  if (!requests.length) return ctx.reply(`لا توجد طلبات في تصدير: ${exportLabel(filter, roomNumber)}`, backKeyboard);
  const loading = await ctx.reply('⏳ جاري تجهيز ملف PDF...');
  try {
    const { filePath, fileName } = await exportServiceRequestsToPdf(requests, { exportedBy: linkedUser, filterLabel: exportLabel(filter, roomNumber), filterTitle: filter });
    await ctx.replyWithDocument({ source: filePath, filename: fileName }, { caption: `📄 تم تصدير ${requests.length} طلب - ${exportLabel(filter, roomNumber)}` });
    await ctx.telegram.deleteMessage(ctx.chat.id, loading.message_id).catch(() => {});
  } catch (error) {
    console.error('PDF export error:', error);
    await ctx.reply('تعذر تصدير الطلبات PDF. تأكد أنك شغّلت npm install داخل فولدر Bot.', backKeyboard);
  }
}

async function showExportMenu(ctx) {
  if (!(await requireEmployee(ctx))) return;
  await ctx.reply('📄 تصدير طلبات العملاء PDF\n\nاختر نوع التصدير:', exportRequestsKeyboard());
}

async function startExportRoom(ctx) {
  if (!(await requireEmployee(ctx))) return;
  pendingState.set(getTelegramId(ctx), { type: 'export_room' });
  await ctx.reply('اكتب رقم الغرفة التي تريد تصدير طلباتها. مثال: 205', backKeyboard);
}

async function handleExportRoomText(ctx, input) {
  pendingState.delete(getTelegramId(ctx));
  await exportRequestsPdf(ctx, 'room', input.trim());
}

async function showRequestStats(ctx) {
  if (!(await requireEmployee(ctx))) return;
  const stats = getRequestStats();
  await ctx.reply([
    '📊 إحصائيات طلبات العملاء',
    '',
    `📌 إجمالي الطلبات: ${stats.total}`,
    `📅 عدد طلبات اليوم: ${stats.todayCount}`,
    `🔥 أكثر خدمة مطلوبة: ${stats.mostRequestedName} (${stats.mostRequestedCount})`,
    `💰 إجمالي أسعار الخدمات المطلوبة: ${formatMoney(stats.totalValue)}`,
    `✅ عدد الطلبات المنفذة: ${stats.doneCount}`,
    `⏳ عدد الطلبات قيد التنفيذ/المراجعة: ${stats.activeCount}`,
    `⭐ متوسط التقييم: ${stats.ratingCount ? stats.avgRating.toFixed(1) + '/5' : 'لا يوجد تقييمات'}`
  ].join('\n'), backKeyboard);
}

async function showHotelStats(ctx) {
  if (!(await requireEmployee(ctx))) return;
  try {
    const [rooms, bookings, guests, employees] = await Promise.all([getRooms(), getBookings(), getGuests(), getEmployees()]);
    const available = rooms.filter((room) => room.status === 'Available').length;
    const occupied = rooms.filter((room) => room.status === 'Occupied').length;
    const maintenance = rooms.filter((room) => room.status === 'Maintenance').length;
    const stats = getRequestStats();
    await ctx.reply([
      '📊 إحصائيات الفندق',
      '',
      `🏨 إجمالي الغرف: ${rooms.length}`,
      `🟢 غرف متاحة: ${available}`,
      `🔴 غرف مشغولة: ${occupied}`,
      `🛠️ غرف تحت الصيانة: ${maintenance}`,
      `📄 إجمالي الحجوزات: ${bookings.length}`,
      `👤 عدد الضيوف: ${guests.length}`,
      `👔 عدد الموظفين: ${employees.length}`,
      `🛎️ طلبات خدمات مفتوحة: ${stats.activeCount}`
    ].join('\n'), backKeyboard);
  } catch (error) {
    await ctx.reply(`تعذر عرض إحصائيات الفندق.\n\n${friendlyApiError(error)}`, backKeyboard);
  }
}

bot.start(showLogin);
bot.command('menu', showHome);
bot.command('login', showLogin);
bot.command('services', showHotelServices);
bot.command('orders', showMyServiceRequests);
bot.command('requests', showCustomerRequests);
bot.command('stats', showRequestStats);
bot.command('export', showExportMenu);
bot.command('wifi', showWifiInfo);
bot.command('info', showHotelInfo);
bot.command('rate', showRateableRequests);
bot.command('unlink', async (ctx) => {
  removeLinkedUser(getTelegramId(ctx));
  pendingState.delete(getTelegramId(ctx));
  await ctx.reply('تم تسجيل الخروج بنجاح.');
  await showLogin(ctx);
});

bot.action('login_home', async (ctx) => { await safeAnswer(ctx); await showLogin(ctx); });
bot.action('home', async (ctx) => { await safeAnswer(ctx); await showHome(ctx); });
bot.action('login_guest', async (ctx) => { await safeAnswer(ctx); await startLogin(ctx, 'guest'); });
bot.action('login_employee', async (ctx) => { await safeAnswer(ctx); await startLogin(ctx, 'employee'); });
bot.action('logout', async (ctx) => { await safeAnswer(ctx); removeLinkedUser(getTelegramId(ctx)); pendingState.delete(getTelegramId(ctx)); await ctx.reply('تم تسجيل الخروج بنجاح.'); await showLogin(ctx); });
bot.action('my_account', async (ctx) => { await safeAnswer(ctx); await showAccount(ctx); });

bot.action('available_rooms_public', async (ctx) => { await safeAnswer(ctx); await showAvailableRooms(ctx, loginBackKeyboard); });
bot.action('available_rooms', async (ctx) => { await safeAnswer(ctx); if (await requireLogin(ctx)) await showAvailableRooms(ctx, backKeyboard); });
bot.action('all_rooms', async (ctx) => { await safeAnswer(ctx); if (!(await requireEmployee(ctx))) return; await sendLong(ctx, '🏨 كل الغرف', await getRooms(), formatRoom, backKeyboard); });
bot.action('my_bookings', async (ctx) => { await safeAnswer(ctx); await showMyBookings(ctx); });

bot.action('wifi_info', async (ctx) => { await safeAnswer(ctx); await showWifiInfo(ctx); });
bot.action('edit_wifi', async (ctx) => { await safeAnswer(ctx); await startWifiEdit(ctx); });
bot.action('basic_services', async (ctx) => { await safeAnswer(ctx); await showBasicServices(ctx); });
bot.action('hotel_services', async (ctx) => { await safeAnswer(ctx); await showHotelServices(ctx); });
bot.action('hotel_info', async (ctx) => { await safeAnswer(ctx); await showHotelInfo(ctx); });
bot.action('edit_hotel_info', async (ctx) => { await safeAnswer(ctx); await startHotelInfoEdit(ctx); });
bot.action('edit_support_contacts', async (ctx) => { await safeAnswer(ctx); await startSupportContactsEdit(ctx); });
bot.action('admin_settings', async (ctx) => { await safeAnswer(ctx); await showAdminSettings(ctx); });
bot.action('client_bot_link', async (ctx) => { await safeAnswer(ctx); await showClientBotLink(ctx); });
bot.action('registered_customers', async (ctx) => { await safeAnswer(ctx); await showRegisteredCustomers(ctx); });
bot.action('contact_support', async (ctx) => { await safeAnswer(ctx); await startContactSupport(ctx); });

bot.action(/^service_order:(.+)$/, async (ctx) => {
  await safeAnswer(ctx);
  const linkedUser = await requireGuest(ctx);
  if (!linkedUser) return;
  const service = getServiceByKey(ctx.match[1]);
  if (!service || service.active === false) return ctx.reply('هذه الخدمة غير متاحة حاليًا.', backKeyboard);

  const menuItems = getServiceMenu(service.key);
  if (menuItems.length) {
    return ctx.reply([
      `${serviceTitle(service)}`,
      `📄 رقم الحجز: ${linkedUser.bookingCode || linkedUser.bookingId || '-'}`,
      `🏨 الغرفة: ${linkedUser.roomNumber || '-'}`,
      '',
      formatServiceMenu(service, menuItems)
    ].join('\n'), menuItemsKeyboard(service.key, menuItems));
  }

  pendingState.set(getTelegramId(ctx), { type: 'order', step: 'details', serviceKey: service.key });
  await ctx.reply([
    `${serviceTitle(service)}`,
    `💰 السعر: ${formatMoney(service.price)}`,
    `📄 رقم الحجز: ${linkedUser.bookingCode || linkedUser.bookingId || '-'}`,
    `🏨 الغرفة: ${linkedUser.roomNumber || '-'}`,
    '',
    'اكتب تفاصيل الطلب الآن، وبعدها هيظهر لك زر: ✅ إرسال الطلب.',
    `مثال: ${service.detailsHint || 'اكتب تفاصيل الطلب المطلوب'}`
  ].join('\n'), backKeyboard);
});

bot.action(/^menu_item:(food|drinks):(\d+)$/, async (ctx) => {
  await safeAnswer(ctx);
  const linkedUser = await requireGuest(ctx);
  if (!linkedUser) return;
  const serviceKey = ctx.match[1];
  const index = Number(ctx.match[2]);
  const service = getServiceByKey(serviceKey);
  const item = getServiceMenu(serviceKey)[index];
  if (!service || !item) return ctx.reply('الصنف غير موجود حاليًا.', backKeyboard);
  const telegramId = getTelegramId(ctx);
  const existingState = pendingState.get(telegramId);
  const cartItems = existingState?.serviceKey === serviceKey && Array.isArray(existingState.items) ? existingState.items : [];
  pendingState.set(telegramId, {
    type: 'order_quantity',
    step: 'quantity',
    serviceKey,
    item,
    cartItems
  });
  await ctx.reply([
    `📌 الصنف: ${item.emoji || '🧾'} ${item.name}`,
    `💵 سعر الوحدة: ${formatMoney(item.price)}`,
    '',
    'اختار الكمية المطلوبة:'
  ].join('\n'), quantityKeyboard());
});

bot.action(/^qty_select:(\d+)$/, async (ctx) => {
  await safeAnswer(ctx);
  const quantity = parseQuantity(ctx.match[1]);
  if (!quantity) return ctx.reply('الكمية غير صحيحة.', backKeyboard);
  await confirmMenuItemQuantity(ctx, quantity);
});

bot.action('qty_custom', async (ctx) => {
  await safeAnswer(ctx);
  const telegramId = getTelegramId(ctx);
  const state = pendingState.get(telegramId);
  if (!state || state.type !== 'order_quantity') return ctx.reply('لا يوجد صنف في انتظار تحديد الكمية.', backKeyboard);
  pendingState.set(telegramId, { ...state, step: 'quantity_custom' });
  await ctx.reply('اكتب الكمية المطلوبة رقم فقط، مثال: 2', backKeyboard);
});

bot.action(/^service_custom:(food|drinks)$/, async (ctx) => {
  await safeAnswer(ctx);
  const linkedUser = await requireGuest(ctx);
  if (!linkedUser) return;
  const serviceKey = ctx.match[1];
  const service = getServiceByKey(serviceKey);
  if (!service) return ctx.reply('الخدمة غير موجودة.', backKeyboard);
  pendingState.set(getTelegramId(ctx), { type: 'order', step: 'details', serviceKey });
  await ctx.reply([
    `${serviceTitle(service)}`,
    `📄 رقم الحجز: ${linkedUser.bookingCode || linkedUser.bookingId || '-'}`,
    `🏨 الغرفة: ${linkedUser.roomNumber || '-'}`,
    '',
    'اكتب طلبك بالتفصيل، مثال: 2 برجر + 1 عصير مانجو.',
    'بعد الكتابة هيظهر لك زر: ✅ إرسال الطلب.'
  ].join('\n'), backKeyboard);
});

bot.action(/^add_more_item:(food|drinks)$/, async (ctx) => {
  await safeAnswer(ctx);
  const linkedUser = await requireGuest(ctx);
  if (!linkedUser) return;
  const telegramId = getTelegramId(ctx);
  const serviceKey = ctx.match[1];
  const state = pendingState.get(telegramId);
  if (!state || state.type !== 'order_confirm' || state.serviceKey !== serviceKey) {
    return ctx.reply('لا يوجد طلب مفتوح لإضافة صنف آخر.', backKeyboard);
  }
  const service = getServiceByKey(serviceKey);
  const menuItems = getServiceMenu(serviceKey);
  pendingState.set(telegramId, { ...state, type: 'order_cart', serviceKey, items: Array.isArray(state.items) ? state.items : [] });
  const currentTotal = Number(state.priceOverride || 0);
  await ctx.reply([
    serviceKey === 'food' ? '➕ إضافة صنف أكل آخر' : '➕ إضافة مشروب آخر',
    `💰 إجمالي الطلب الحالي: ${formatMoney(currentTotal)}`,
    '',
    formatServiceMenu(service, menuItems)
  ].join('\n'), menuItemsKeyboard(serviceKey, menuItems));
});

bot.action('confirm_order', async (ctx) => { await safeAnswer(ctx); await confirmServiceOrder(ctx); });
bot.action('edit_order_details', async (ctx) => {
  await safeAnswer(ctx);
  const state = pendingState.get(getTelegramId(ctx));
  if (!state || state.type !== 'order_confirm') return ctx.reply('لا يوجد طلب لتعديله.', backKeyboard);
  pendingState.set(getTelegramId(ctx), { type: 'order', step: 'details', serviceKey: state.serviceKey, items: Array.isArray(state.items) ? state.items : [], item: state.item || null, quantity: state.quantity || state.item?.quantity || 1, unitPrice: state.unitPrice ?? state.item?.unitPrice ?? null, priceOverride: state.priceOverride });
  await ctx.reply('اكتب تفاصيل الطلب مرة أخرى، وبعدها اضغط إرسال الطلب.', backKeyboard);
});

bot.action('confirm_support', async (ctx) => { await safeAnswer(ctx); await confirmSupportMessage(ctx); });
bot.action('edit_support_message', async (ctx) => {
  await safeAnswer(ctx);
  const state = pendingState.get(getTelegramId(ctx));
  if (!state || state.type !== 'support') return ctx.reply('لا توجد رسالة لتعديلها.', backKeyboard);
  pendingState.set(getTelegramId(ctx), { type: 'support', step: 'message' });
  await ctx.reply('اكتب رسالة خدمة العملاء مرة أخرى، وبعدها اضغط إرسال الرسالة.', backKeyboard);
});

bot.action('cancel_pending', async (ctx) => {
  await safeAnswer(ctx);
  pendingState.delete(getTelegramId(ctx));
  await ctx.reply('تم إلغاء العملية الحالية.', backKeyboard);
});

bot.action('my_service_requests', async (ctx) => { await safeAnswer(ctx); await showMyServiceRequests(ctx); });
bot.action('customer_requests', async (ctx) => { await safeAnswer(ctx); await showCustomerRequests(ctx); });
bot.action('rate_requests', async (ctx) => { await safeAnswer(ctx); await showRateableRequests(ctx); });
bot.action(/^choose_rate_request:(REQ-\d+)$/, async (ctx) => { await safeAnswer(ctx); await chooseRateRequest(ctx, ctx.match[1]); });
bot.action(/^rate_request:(REQ-\d+):(\d)$/, async (ctx) => { await safeAnswer(ctx); await startRatingComment(ctx, ctx.match[1], ctx.match[2]); });
bot.action(/^view_request:(REQ-\d+)$/, async (ctx) => { await safeAnswer(ctx); await viewCustomerRequest(ctx, ctx.match[1]); });
bot.action(/^set_status:(REQ-\d+):([a-z_]+)$/, async (ctx) => { await safeAnswer(ctx); await setCustomerRequestStatus(ctx, ctx.match[1], ctx.match[2]); });

bot.action('edit_service_prices', async (ctx) => { await safeAnswer(ctx); await showServicePricesEdit(ctx); });
bot.action(/^manage_menu:(food|drinks)$/, async (ctx) => { await safeAnswer(ctx); await showMenuItemsAdmin(ctx, ctx.match[1]); });
bot.action(/^edit_menu_price:(food|drinks):(\d+)$/, async (ctx) => { await safeAnswer(ctx); await startMenuItemPriceEdit(ctx, ctx.match[1], ctx.match[2]); });
bot.action(/^add_menu_item:(food|drinks)$/, async (ctx) => { await safeAnswer(ctx); await startAddMenuItem(ctx, ctx.match[1]); });
bot.action(/^edit_price:(.+)$/, async (ctx) => { await safeAnswer(ctx); await startServicePriceEdit(ctx, ctx.match[1]); });
bot.action('service_management', async (ctx) => { await safeAnswer(ctx); await showServiceManagement(ctx); });
bot.action('add_service', async (ctx) => { await safeAnswer(ctx); await startAddService(ctx); });
bot.action(/^manage_service:(.+)$/, async (ctx) => { await safeAnswer(ctx); await viewAdminService(ctx, ctx.match[1]); });
bot.action(/^rename_service:(.+)$/, async (ctx) => { await safeAnswer(ctx); await startRenameService(ctx, ctx.match[1]); });
bot.action(/^toggle_service:(.+)$/, async (ctx) => { await safeAnswer(ctx); await toggleService(ctx, ctx.match[1]); });

bot.action('export_requests_menu', async (ctx) => { await safeAnswer(ctx); await showExportMenu(ctx); });
bot.action(/^export_requests:(all|today|week|done|rejected)$/, async (ctx) => { await safeAnswer(ctx); await exportRequestsPdf(ctx, ctx.match[1]); });
bot.action('export_room_prompt', async (ctx) => { await safeAnswer(ctx); await startExportRoom(ctx); });
bot.action('request_stats', async (ctx) => { await safeAnswer(ctx); await showRequestStats(ctx); });
bot.action('hotel_stats', async (ctx) => { await safeAnswer(ctx); await showHotelStats(ctx); });

bot.on('text', async (ctx) => {
  const telegramId = getTelegramId(ctx);
  const input = ctx.message?.text || '';
  const state = pendingState.get(telegramId);

  try {
    if (!state) {
      await ctx.reply('استخدم الأزرار من القائمة أو اكتب /menu لعرض القائمة.');
      return;
    }

    if (state.type === 'login') return handleLoginText(ctx, state, input);
    if (state.type === 'wifi') return handleWifiText(ctx, input);
    if (state.type === 'hotel_info') return handleHotelInfoText(ctx, input);
    if (state.type === 'support_contacts') return handleSupportContactsText(ctx, input);
    if (state.type === 'support') return handleSupportText(ctx, state, input);
    if (state.type === 'service_price') return handleServicePriceText(ctx, state, input);
    if (state.type === 'menu_item_price') return handleMenuItemPriceText(ctx, state, input);
    if (state.type === 'menu_item_add') return handleAddMenuItemText(ctx, state, input);
    if (state.type === 'service_add') return handleAddServiceText(ctx, state, input);
    if (state.type === 'service_rename') return handleRenameServiceText(ctx, state, input);
    if (state.type === 'order_quantity') return handleQuantityText(ctx, state, input);
    if (state.type === 'order') return handleOrderText(ctx, state, input);
    if (state.type === 'order_confirm') return ctx.reply('راجع الطلب واضغط زر ✅ إرسال الطلب، أو ✏️ تعديل الطلب.');
    if (state.type === 'export_room') return handleExportRoomText(ctx, input);
    if (state.type === 'rating_comment') return handleRatingCommentText(ctx, state, input);

    pendingState.delete(telegramId);
    await ctx.reply('انتهت العملية الحالية. اكتب /menu للرجوع للقائمة.');
  } catch (error) {
    console.error('Bot text handler error:', error);
    pendingState.delete(telegramId);
    await ctx.reply(`حدث خطأ غير متوقع.\n\n${error?.message || 'خطأ غير معروف'}`, backKeyboard);
  }
});

bot.catch((error, ctx) => {
  console.error('Bot error:', error);
  if (ctx) ctx.reply('حدث خطأ غير متوقع داخل البوت. جرّب مرة أخرى.').catch(() => {});
});

async function startPolling() {
  const mode = String(process.env.BOT_MODE || 'polling').toLowerCase();
  if (mode === 'webhook' || process.env.VERCEL) {
    console.log('Webhook mode enabled. Polling is disabled.');
    return;
  }

  try {
    await bot.telegram.callApi('deleteWebhook', { drop_pending_updates: false });
    console.log('✅ تم تعطيل Webhook لتشغيل البوت محليًا بنظام Polling.');
  } catch (error) {
    console.warn('تعذر تعطيل Webhook تلقائيًا:', error?.message || error);
  }

  await bot.launch();
  console.log('Telegram hotel bot is running locally with polling.');
  console.log('Press Ctrl+C to stop.');

  const shutdown = async (signal) => {
    try { bot.stop(signal); } catch {}
    await closeStore();
    process.exit(0);
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMainModule) {
  startPolling().catch(async (error) => {
    console.error('فشل تشغيل البوت:', error);
    await closeStore();
    process.exit(1);
  });
}
