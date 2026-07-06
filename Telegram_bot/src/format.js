export const DEFAULT_SERVICES = [
  { key: 'food', emoji: '🍽️', name: 'طلب أكل', detailsHint: 'اختار صنف من القائمة أو اكتب طلبك يدويًا', priceEnv: 'SERVICE_PRICE_FOOD', defaultPrice: 120 },
  { key: 'drinks', emoji: '🥤', name: 'مشروبات', detailsHint: 'اختار مشروب من القائمة أو اكتب طلبك يدويًا', priceEnv: 'SERVICE_PRICE_DRINKS', defaultPrice: 40 },
  { key: 'cleaning', emoji: '🧹', name: 'تنظيف الغرفة', detailsHint: 'اكتب الوقت المناسب لتنظيف الغرفة', priceEnv: 'SERVICE_PRICE_CLEANING', defaultPrice: 0 },
  { key: 'towels', emoji: '🧺', name: 'مناشف / ملايات', detailsHint: 'مثال: 2 فوطة كبيرة + تغيير ملايات', priceEnv: 'SERVICE_PRICE_TOWELS', defaultPrice: 30 },
  { key: 'maintenance', emoji: '🧰', name: 'صيانة', detailsHint: 'اكتب المشكلة، مثال: التكييف لا يعمل أو مشكلة في الحمام', priceEnv: 'SERVICE_PRICE_MAINTENANCE', defaultPrice: 0 },
  { key: 'taxi', emoji: '🚖', name: 'تاكسي', detailsHint: 'اكتب وجهتك والوقت المطلوب، مثال: محطة القطار الساعة 8 مساءً', priceEnv: 'SERVICE_PRICE_TAXI', defaultPrice: 150 },
  { key: 'laundry', emoji: '👕', name: 'غسيل ملابس', detailsHint: 'اكتب عدد القطع ونوع الخدمة المطلوبة', priceEnv: 'SERVICE_PRICE_LAUNDRY', defaultPrice: 80 },
  { key: 'other', emoji: '📝', name: 'طلب آخر', detailsHint: 'اكتب أي طلب خاص تريد توصيله لخدمة العملاء', priceEnv: 'SERVICE_PRICE_OTHER', defaultPrice: 0 }
];

export function normalizeInput(value = '') {
  return String(value).trim().toLowerCase();
}

export function normalizePhone(value = '') {
  return String(value).replace(/\D/g, '');
}

export function formatMoney(value) {
  const number = Number(value || 0);
  return `${number.toLocaleString('ar-EG')} جنيه`;
}

export function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('ar-EG');
}

export function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('ar-EG');
}

function translateRoomStatus(status = '') {
  const map = { Available: 'متاحة', Occupied: 'مشغولة', Maintenance: 'تحت الصيانة', Reserved: 'محجوزة' };
  return map[status] || status || '-';
}

function translateBookingStatus(status = '') {
  const map = { Pending: 'قيد الانتظار', Confirmed: 'مؤكد', CheckedIn: 'تم تسجيل الوصول', CheckedOut: 'تم تسجيل المغادرة', Cancelled: 'ملغي' };
  return map[status] || status || '-';
}

function translatePaymentStatus(status = '') {
  const map = { Paid: 'مدفوع', Unpaid: 'غير مدفوع', Pending: 'قيد الانتظار', Refunded: 'تم رد المبلغ' };
  return map[status] || status || '-';
}

export function translateAccountType(type = '') {
  const map = { guest: 'عميل / ضيف', employee: 'موظف / أدمن' };
  return map[type] || type || '-';
}

export function translateRequestStatus(status = '') {
  const map = {
    pending: 'قيد المراجعة',
    received: 'تم استلام الطلب',
    directed: 'سيتم التوجيه للغرفة',
    in_progress: 'جاري التنفيذ',
    done: 'تم التنفيذ',
    rejected: 'مرفوض'
  };
  return map[status] || status || '-';
}

export function translateAuditAction(action = '') {
  const map = {
    wifi_update: 'تعديل بيانات الواي فاي',
    hotel_info_update: 'تعديل معلومات الفندق',
    support_contacts_update: 'تعديل أرقام التواصل',
    service_create: 'إضافة خدمة',
    service_rename: 'تعديل اسم خدمة',
    service_price_update: 'تعديل سعر خدمة',
    service_toggle: 'تشغيل/إيقاف خدمة',
    request_status_update: 'تغيير حالة طلب',
    request_rating: 'تقييم طلب'
  };
  return map[action] || action || '-';
}

export function statusIcon(status = '') {
  const map = { pending: '⏳', received: '✅', directed: '🚚', in_progress: '🔧', done: '✅', rejected: '❌' };
  return map[status] || '📌';
}

export function serviceTitle(service = {}) {
  return `${service.emoji || '🧾'} ${service.name || service.key || 'خدمة'}`;
}

export function formatServiceLine(service = {}) {
  const activeText = service.active === false ? 'موقوفة' : 'متاحة';
  return `${serviceTitle(service)} - ${formatMoney(service.price)} - ${activeText}`;
}

export function formatServiceList(services = [], options = {}) {
  if (!services.length) return 'لا توجد خدمات مسجلة حاليًا.';
  const title = options.title || '💰 خدمات الفندق والأسعار';
  return [title, '', ...services.map(formatServiceLine)].join('\n');
}

export function formatRoom(room) {
  const category = room?.categoryId?.name || room?.category?.name || room?.type || 'غير محدد';
  const price = room?.categoryId?.basePrice !== undefined ? formatMoney(room.categoryId.basePrice) : (room?.price ? formatMoney(room.price) : '-');
  return [
    `🏨 رقم الغرفة: ${room.roomNumber || '-'}`,
    `📌 الحالة: ${translateRoomStatus(room.status)}`,
    `🏷️ النوع: ${category}`,
    `💰 السعر: ${price}`,
    `⬆️ الدور: ${room.floor ?? '-'}`
  ].join('\n');
}

export function formatBooking(booking) {
  const roomNumber = booking?.roomId?.roomNumber || booking?.roomNumber || booking?.room || '-';
  const guestName = booking?.guestId?.fullName || booking?.guest?.fullName || booking?.guestName || '-';
  const bookingNumber = booking?.bookingNumber || booking?.bookingCode || booking?.reservationNumber || '-';
  return [
    `📄 رقم الحجز: ${bookingNumber}`,
    `👤 اسم العميل: ${guestName}`,
    `🏨 الغرفة: ${roomNumber}`,
    `📅 تاريخ الوصول: ${formatDate(booking.checkInDate || booking.checkIn)}`,
    `📅 تاريخ المغادرة: ${formatDate(booking.checkOutDate || booking.checkOut)}`,
    `📌 حالة الحجز: ${translateBookingStatus(booking.status)}`,
    `💳 حالة الدفع: ${translatePaymentStatus(booking.paymentStatus)}`,
    `💰 الإجمالي: ${formatMoney(booking.totalPrice || booking.total || 0)}`
  ].join('\n');
}

export function formatWifi(wifi = {}) {
  return [
    '🌐 بيانات الواي فاي',
    '',
    `📶 اسم الشبكة: ${wifi.name || 'غير محدد'}`,
    `🔑 الباسورد: ${wifi.password || 'غير محدد'}`,
    wifi.note ? `📝 ملاحظة: ${wifi.note}` : null,
    wifi.updatedAt ? `🕒 آخر تحديث: ${formatDateTime(wifi.updatedAt)}` : null
  ].filter(Boolean).join('\n');
}

export function formatHotelInfo(info = {}) {
  return [
    'ℹ️ معلومات الفندق',
    '',
    `🍳 مواعيد الإفطار: ${info.breakfastTime || 'غير محدد'}`,
    `🍽️ مواعيد المطعم: ${info.restaurantTime || 'غير محدد'}`,
    `📞 رقم الاستقبال: ${info.receptionPhone || 'غير محدد'}`,
    `🚪 سياسة تسجيل الخروج: ${info.checkoutPolicy || 'غير محدد'}`,
    info.servicesNote ? `🛎️ خدمات الفندق: ${info.servicesNote}` : null,
    info.updatedAt ? `🕒 آخر تحديث: ${formatDateTime(info.updatedAt)}` : null
  ].filter(Boolean).join('\n');
}

export function formatSupportContacts(support = {}) {
  const contacts = Array.isArray(support.contacts) ? support.contacts.filter(Boolean) : [];
  return [
    '📞 أرقام خدمة العملاء',
    '',
    contacts.length ? contacts.map((line) => `☎️ ${line}`).join('\n') : '☎️ غير محدد',
    support.note ? `📝 ملاحظة: ${support.note}` : null,
    support.updatedAt ? `🕒 آخر تحديث: ${formatDateTime(support.updatedAt)}` : null
  ].filter(Boolean).join('\n');
}

export function formatServiceRequest(request, options = {}) {
  const admin = Boolean(options.admin);
  const lines = [
    `📌 رقم الطلب: ${request.id || '-'}`,
    `🛎️ الخدمة: ${request.serviceTitle || request.serviceKey || '-'}`,
    Array.isArray(request.items) && request.items.length ? `📋 الأصناف:
${request.items.map((item, index) => `${index + 1}) ${item.emoji || '🧾'} ${item.name} × ${item.quantity || 1} — ${formatMoney(item.totalPrice ?? ((item.unitPrice ?? item.price ?? 0) * (item.quantity || 1)))}`).join('\n')}` : null,
    request.quantity && request.item && !(Array.isArray(request.items) && request.items.length) ? `🔢 الكمية: ${request.quantity}` : null,
    request.unitPrice && !(Array.isArray(request.items) && request.items.length) ? `💵 سعر الوحدة: ${formatMoney(request.unitPrice)}` : null,
    `💰 الإجمالي: ${formatMoney(request.price || 0)}`,
    `🏨 رقم الغرفة: ${request.roomNumber || '-'}`,
    `${statusIcon(request.status)} الحالة: ${translateRequestStatus(request.status)}`,
    `📝 التفاصيل: ${request.details || '-'}`,
    `🕒 وقت الطلب: ${formatDateTime(request.createdAt)}`
  ];

  if (!admin && request.user?.bookingCode) {
    lines.splice(3, 0, `📄 رقم الحجز: ${request.user.bookingCode}`);
  }

  if (admin) {
    lines.splice(3, 0,
      `👤 العميل: ${request.user?.name || '-'}`,
      `📧 الإيميل: ${request.user?.email || '-'}`,
      `📱 الهاتف: ${request.user?.phone || '-'}`,
      `📄 رقم الحجز: ${request.user?.bookingCode || request.user?.bookingId || '-'}`,
      request.telegramId ? `🆔 Telegram ID: ${request.telegramId}` : null
    );
  }

  if (request.updatedAt && request.updatedAt !== request.createdAt) lines.push(`🕒 آخر تحديث: ${formatDateTime(request.updatedAt)}`);
  if (request.rating?.stars) {
    lines.push(`⭐ التقييم: ${request.rating.stars}/5`);
    if (request.rating.comment) lines.push(`💬 تعليق العميل: ${request.rating.comment}`);
  }
  if (admin && request.updatedBy?.name) lines.push(`👔 آخر تعديل بواسطة: ${request.updatedBy.name}`);
  return lines.filter(Boolean).join('\n');
}

export function formatLinkedUser(user = {}) {
  return [
    `👤 الاسم: ${user.name || '-'}`,
    `📌 النوع: ${translateAccountType(user.type)}`,
    user.roomNumber ? `🏨 الغرفة: ${user.roomNumber}` : null,
    user.bookingCode ? `📄 رقم الحجز: ${user.bookingCode}` : (user.bookingId ? `📄 الحجز: ${user.bookingId}` : null),
    user.phone ? `📱 الهاتف: ${user.phone}` : null,
    user.email ? `📧 الإيميل: ${user.email}` : null,
    user.role ? `👔 الدور: ${user.role}` : null,
    user.linkedAt ? `🕒 آخر دخول: ${formatDateTime(user.linkedAt)}` : null
  ].filter(Boolean).join('\n');
}

export function formatAuditLog(item = {}) {
  return [
    `🧾 العملية: ${translateAuditAction(item.action)}`,
    `👔 بواسطة: ${item.by?.name || item.by?.email || '-'}`,
    `🕒 الوقت: ${formatDateTime(item.at)}`,
    item.details?.id ? `📌 الطلب: ${item.details.id}` : null,
    item.details?.key ? `🧾 الخدمة: ${item.details.key}` : null,
    item.details?.status ? `📌 الحالة: ${translateRequestStatus(item.details.status)}` : null,
    item.details?.price !== undefined ? `💰 السعر: ${formatMoney(item.details.price)}` : null
  ].filter(Boolean).join('\n');
}

export function chunkText(lines, maxLength = 3500) {
  const chunks = [];
  let current = '';
  for (const line of lines) {
    const next = current ? `${current}\n\n${line}` : line;
    if (next.length > maxLength) {
      if (current) chunks.push(current);
      current = line;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
