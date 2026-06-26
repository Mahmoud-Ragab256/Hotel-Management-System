import { Markup } from 'telegraf';
import { serviceTitle, translateRequestStatus, formatMoney } from './format.js';

export const backKeyboard = Markup.inlineKeyboard([[Markup.button.callback('⬅️ رجوع للقائمة', 'home')]]);
export const loginBackKeyboard = Markup.inlineKeyboard([[Markup.button.callback('⬅️ رجوع', 'login_home')]]);

export function loginKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🟢 الغرف المتاحة بدون تسجيل', 'available_rooms_public')],
    [Markup.button.callback('🔐 دخول عميل برقم الحجز', 'login_guest')],
    [Markup.button.callback('🔐 دخول موظف / أدمن', 'login_employee')]
  ]);
}

export function mainKeyboard(user) {
  if (user?.type === 'employee') {
    return Markup.inlineKeyboard([
      [Markup.button.callback('📋 طلبات العملاء', 'customer_requests'), Markup.button.callback('📊 إحصائيات الطلبات', 'request_stats')],
      [Markup.button.callback('📄 تصدير الطلبات PDF', 'export_requests_menu')],
      [Markup.button.callback('🧾 إدارة الخدمات', 'service_management'), Markup.button.callback('💰 تعديل الأسعار', 'edit_service_prices')],
      [Markup.button.callback('🌐 تعديل الواي فاي', 'edit_wifi'), Markup.button.callback('📞 تعديل أرقام التواصل', 'edit_support_contacts')],
      [Markup.button.callback('ℹ️ تعديل معلومات الفندق', 'edit_hotel_info')],
      [Markup.button.callback('🍽️ أصناف الأكل', 'manage_menu:food'), Markup.button.callback('🥤 أصناف المشروبات', 'manage_menu:drinks')],
      [Markup.button.callback('👥 العملاء المسجلين', 'registered_customers')],
      [Markup.button.callback('🔗 لينك البوت للعميل', 'client_bot_link'), Markup.button.callback('⚙️ إعدادات الفندق', 'admin_settings')],
      [Markup.button.callback('🏨 كل الغرف', 'all_rooms'), Markup.button.callback('📊 إحصائيات الفندق', 'hotel_stats')],
      [Markup.button.callback('👤 حسابي', 'my_account'), Markup.button.callback('🚪 تسجيل خروج', 'logout')]
    ]);
  }

  return Markup.inlineKeyboard([
    [Markup.button.callback('🟢 الغرف المتاحة', 'available_rooms')],
    [Markup.button.callback('🛎️ خدمات الفندق', 'hotel_services')],
    [Markup.button.callback('🌐 اسم الشبكة والباسورد', 'wifi_info')],
    [Markup.button.callback('📦 متابعة طلباتي', 'my_service_requests'), Markup.button.callback('⭐ قيّم خدمة', 'rate_requests')],
    [Markup.button.callback('📞 التواصل مع خدمة العملاء', 'contact_support')],
    [Markup.button.callback('ℹ️ معلومات الفندق', 'hotel_info')],
    [Markup.button.callback('👤 حسابي', 'my_account'), Markup.button.callback('🚪 تسجيل خروج', 'logout')]
  ]);
}

export function hotelServicesKeyboard(services = [], userType = 'guest') {
  const active = services.filter((service) => service.active !== false);
  const rows = [];
  if (userType === 'guest') {
    for (let i = 0; i < active.length; i += 2) {
      rows.push(active.slice(i, i + 2).map((service) => Markup.button.callback(serviceTitle(service), `service_order:${service.key}`)));
    }
    rows.push([Markup.button.callback('📦 متابعة طلباتي', 'my_service_requests')]);
  }
  rows.push([Markup.button.callback('⬅️ رجوع للقائمة', 'home')]);
  return Markup.inlineKeyboard(rows);
}

export function servicePricesKeyboard(services = []) {
  const rows = [];
  rows.push([Markup.button.callback('🍽️ تعديل أسعار أصناف الأكل', 'manage_menu:food')]);
  rows.push([Markup.button.callback('🥤 تعديل أسعار أصناف المشروبات', 'manage_menu:drinks')]);
  for (let i = 0; i < services.length; i += 2) {
    rows.push(services.slice(i, i + 2).map((service) => Markup.button.callback(serviceTitle(service), `edit_price:${service.key}`)));
  }
  rows.push([Markup.button.callback('⬅️ رجوع للقائمة', 'home')]);
  return Markup.inlineKeyboard(rows);
}

export function serviceManagementKeyboard(services = []) {
  const rows = [];
  for (const service of services) {
    const status = service.active === false ? '⛔' : '✅';
    rows.push([Markup.button.callback(`${status} ${serviceTitle(service)}`, `manage_service:${service.key}`)]);
  }
  rows.push([Markup.button.callback('➕ إضافة خدمة جديدة', 'add_service')]);
  rows.push([Markup.button.callback('⬅️ رجوع للقائمة', 'home')]);
  return Markup.inlineKeyboard(rows);
}

export function serviceAdminKeyboard(service) {
  const toggleText = service.active === false ? '✅ تشغيل الخدمة' : '⛔ إيقاف الخدمة';
  return Markup.inlineKeyboard([
    [Markup.button.callback('✏️ تعديل اسم الخدمة', `rename_service:${service.key}`)],
    [Markup.button.callback('💰 تعديل سعر الخدمة', `edit_price:${service.key}`)],
    [Markup.button.callback(toggleText, `toggle_service:${service.key}`)],
    [Markup.button.callback('⬅️ إدارة الخدمات', 'service_management')]
  ]);
}

export function serviceRequestsKeyboard(requests = []) {
  const rows = requests.slice(0, 20).map((request) => [
    Markup.button.callback(`${request.id} | غرفة ${request.roomNumber || '-'} | ${translateRequestStatus(request.status)}`, `view_request:${request.id}`)
  ]);
  rows.push([Markup.button.callback('⬅️ رجوع للقائمة', 'home')]);
  return Markup.inlineKeyboard(rows);
}

export function requestStatusKeyboard(requestId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('✅ تم استلام الطلب', `set_status:${requestId}:received`)],
    [Markup.button.callback('🚚 سيتم التوجيه للغرفة', `set_status:${requestId}:directed`)],
    [Markup.button.callback('⏳ جاري التنفيذ', `set_status:${requestId}:in_progress`)],
    [Markup.button.callback('✅ تم التنفيذ', `set_status:${requestId}:done`), Markup.button.callback('❌ مرفوض', `set_status:${requestId}:rejected`)],
    [Markup.button.callback('📋 كل الطلبات', 'customer_requests')]
  ]);
}

export function ratingKeyboard(requestId) {
  return Markup.inlineKeyboard([
    [1, 2, 3, 4, 5].map((star) => Markup.button.callback(`${star}⭐`, `rate_request:${requestId}:${star}`)),
    [Markup.button.callback('⬅️ رجوع للقائمة', 'home')]
  ]);
}

export function rateableRequestsKeyboard(requests = []) {
  const rows = requests.slice(0, 20).map((request) => [
    Markup.button.callback(`${request.id} | ${request.serviceTitle} | غرفة ${request.roomNumber || '-'}`, `choose_rate_request:${request.id}`)
  ]);
  rows.push([Markup.button.callback('⬅️ رجوع للقائمة', 'home')]);
  return Markup.inlineKeyboard(rows);
}


export function menuItemsKeyboard(serviceKey, items = []) {
  const rows = items.map((item, index) => [
    Markup.button.callback(`${item.emoji || '🧾'} ${item.name} - ${formatMoney(item.price)}`, `menu_item:${serviceKey}:${index}`)
  ]);
  rows.push([Markup.button.callback('✍️ اكتب طلبك يدويًا', `service_custom:${serviceKey}`)]);
  rows.push([Markup.button.callback('⬅️ رجوع للخدمات', 'hotel_services')]);
  return Markup.inlineKeyboard(rows);
}

export function quantityKeyboard() {
  return Markup.inlineKeyboard([
    [1, 2, 3].map((quantity) => Markup.button.callback(String(quantity), `qty_select:${quantity}`)),
    [4, 5, 6].map((quantity) => Markup.button.callback(String(quantity), `qty_select:${quantity}`)),
    [Markup.button.callback('✍️ كمية أخرى', 'qty_custom')],
    [Markup.button.callback('⬅️ رجوع للخدمات', 'hotel_services')]
  ]);
}

export function orderConfirmKeyboard(serviceKey = '') {
  const rows = [[Markup.button.callback('✅ إرسال الطلب', 'confirm_order')]];
  if (serviceKey === 'food') rows.push([Markup.button.callback('➕ إضافة صنف أكل آخر', 'add_more_item:food')]);
  if (serviceKey === 'drinks') rows.push([Markup.button.callback('➕ إضافة مشروب آخر', 'add_more_item:drinks')]);
  rows.push([Markup.button.callback('✏️ تعديل الطلب', 'edit_order_details'), Markup.button.callback('❌ إلغاء', 'cancel_pending')]);
  return Markup.inlineKeyboard(rows);
}

export function supportConfirmKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('✅ إرسال الرسالة', 'confirm_support')],
    [Markup.button.callback('✏️ تعديل الرسالة', 'edit_support_message'), Markup.button.callback('❌ إلغاء', 'cancel_pending')]
  ]);
}


export function menuItemsAdminKeyboard(serviceKey, items = []) {
  const rows = items.map((item, index) => [
    Markup.button.callback(`${item.emoji || '🧾'} ${item.name} - ${formatMoney(item.price)}`, `edit_menu_price:${serviceKey}:${index}`)
  ]);
  rows.push([Markup.button.callback('➕ إضافة صنف جديد', `add_menu_item:${serviceKey}`)]);
  rows.push([Markup.button.callback('⬅️ رجوع للقائمة', 'home')]);
  return Markup.inlineKeyboard(rows);
}

export function menuItemEditKeyboard(serviceKey, index) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('💰 تعديل سعر الصنف', `edit_menu_price:${serviceKey}:${index}`)],
    [Markup.button.callback(`⬅️ رجوع للأصناف`, `manage_menu:${serviceKey}`)]
  ]);
}

export function exportRequestsKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📄 كل الطلبات', 'export_requests:all')],
    [Markup.button.callback('📅 طلبات اليوم', 'export_requests:today'), Markup.button.callback('🗓️ طلبات هذا الأسبوع', 'export_requests:week')],
    [Markup.button.callback('🏨 طلبات غرفة معينة', 'export_room_prompt')],
    [Markup.button.callback('✅ الطلبات المنفذة فقط', 'export_requests:done')],
    [Markup.button.callback('❌ الطلبات المرفوضة فقط', 'export_requests:rejected')],
    [Markup.button.callback('⬅️ رجوع للقائمة', 'home')]
  ]);
}

export function adminSettingsKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🌐 تعديل الواي فاي', 'edit_wifi')],
    [Markup.button.callback('📞 تعديل أرقام التواصل', 'edit_support_contacts')],
    [Markup.button.callback('ℹ️ تعديل معلومات الفندق', 'edit_hotel_info')],
    [Markup.button.callback('🧾 إدارة الخدمات', 'service_management')],
    [Markup.button.callback('💰 تعديل الأسعار', 'edit_service_prices')],
    [Markup.button.callback('🍽️ أصناف الأكل', 'manage_menu:food'), Markup.button.callback('🥤 أصناف المشروبات', 'manage_menu:drinks')],
    [Markup.button.callback('🔗 لينك البوت للعميل', 'client_bot_link')],
    [Markup.button.callback('⬅️ رجوع للقائمة', 'home')]
  ]);
}
