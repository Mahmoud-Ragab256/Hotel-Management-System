import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { DEFAULT_SERVICES, normalizeInput, translateRequestStatus, serviceTitle } from './format.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'data', 'bot-db.json');

const DEFAULT_MONGODB_URI = 'mongodb://127.0.0.1:27017/hotel-management-system';
const STORE_DRIVER = String(process.env.STORE_DRIVER || 'mongo').toLowerCase();
const USE_MONGO = STORE_DRIVER !== 'file';
const BOT_STATE_COLLECTION = process.env.BOT_STATE_COLLECTION || 'bot_state';
const BOT_STATE_KEY = process.env.BOT_STATE_KEY || 'main';

let mongoClient = null;
let mongoDb = null;
let mongoCollection = null;
let memoryDb = null;
let mongoReady = false;
let persistChain = Promise.resolve();

function nowIso() { return new Date().toISOString(); }

function actorInfo(actor = null) {
  if (!actor) return null;
  return {
    telegramId: String(actor.telegramId || ''),
    name: actor.name || actor.email || '-',
    email: actor.email || '-',
    role: actor.role || '-'
  };
}

function defaultServices() {
  return DEFAULT_SERVICES.map((service) => ({
    key: service.key,
    emoji: service.emoji,
    name: service.name,
    detailsHint: service.detailsHint,
    price: Math.max(0, Number(process.env[service.priceEnv] ?? service.defaultPrice ?? 0)),
    active: true,
    builtIn: true,
    createdAt: null,
    updatedAt: null,
    updatedBy: null
  }));
}

function defaultHotelInfo() {
  return {
    breakfastTime: process.env.HOTEL_BREAKFAST_TIME || 'الإفطار من 7:00 صباحًا إلى 10:00 صباحًا',
    restaurantTime: process.env.HOTEL_RESTAURANT_TIME || 'المطعم متاح من 12:00 ظهرًا إلى 12:00 منتصف الليل',
    receptionPhone: process.env.HOTEL_RECEPTION_PHONE || 'الاستقبال الداخلي: 0',
    checkoutPolicy: process.env.HOTEL_CHECKOUT_POLICY || 'تسجيل الخروج قبل الساعة 12:00 ظهرًا',
    servicesNote: process.env.HOTEL_SERVICES_NOTE || 'يمكنك طلب خدمات الغرفة ومتابعة حالة الطلب من خلال البوت.',
    updatedAt: null,
    updatedBy: null
  };
}

function defaultSupportContacts() {
  const envContacts = String(process.env.SUPPORT_CONTACTS || '').split('|').map((item) => item.trim()).filter(Boolean);
  return {
    contacts: envContacts.length ? envContacts : [
      'الاستقبال الداخلي: 0',
      'خدمة العملاء: 01000000000',
      'واتساب الفندق: 01000000001',
      'الصيانة والطوارئ: 01000000002',
      'خدمة الغرف: 01000000003'
    ],
    note: process.env.SUPPORT_NOTE || 'يمكنك الاتصال مباشرة أو كتابة رسالتك من خلال البوت وسيتم توجيهها للإدارة.',
    updatedAt: null,
    updatedBy: null
  };
}


function defaultMenuItems() {
  return {
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
}

function defaultDb() {
  return {
    users: {},
    settings: {
      wifi: {
        name: process.env.WIFI_NAME || 'Hotel-Guest-WiFi',
        password: process.env.WIFI_PASSWORD || 'Hotel@2026',
        note: process.env.WIFI_NOTE || 'متاح للنزلاء أثناء فترة الإقامة فقط. برجاء عدم مشاركة كلمة المرور خارج الفندق.',
        updatedAt: null,
        updatedBy: null
      },
      hotelInfo: defaultHotelInfo(),
      supportContacts: defaultSupportContacts()
    },
    services: defaultServices(),
    menuItems: defaultMenuItems(),
    counters: { serviceRequest: 1000, service: 100 },
    serviceRequests: [],
    auditLog: []
  };
}

function ensureDbFile() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(dbPath)) {
    const db = defaultDb();
    db.auditLog.unshift({
      action: 'auto_seed_initial_data',
      details: { message: 'تم إنشاء بيانات البوت الافتراضية أول تشغيل.' },
      at: nowIso(),
      by: { name: 'Auto Seed', role: 'System' }
    });
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  }
}


function mergeDefaultServices(existing = [], oldPrices = {}) {
  const byKey = new Map();
  for (const service of Array.isArray(existing) ? existing : []) {
    if (service?.key) byKey.set(service.key, service);
  }

  for (const base of defaultServices()) {
    const old = byKey.get(base.key);
    const legacyPrice = oldPrices?.[base.key]?.price;
    byKey.set(base.key, {
      ...base,
      ...(old || {}),
      price: Number(old?.price ?? legacyPrice ?? base.price ?? 0),
      active: old?.active === false ? false : true,
      builtIn: true
    });
  }

  return Array.from(byKey.values()).map((service) => ({
    key: String(service.key),
    emoji: service.emoji || '🧾',
    name: service.name || service.shortLabel || service.label || service.key,
    detailsHint: service.detailsHint || 'اكتب تفاصيل الطلب المطلوب',
    price: Math.max(0, Number(service.price || 0)),
    active: service.active === false ? false : true,
    builtIn: Boolean(service.builtIn),
    createdAt: service.createdAt || null,
    updatedAt: service.updatedAt || null,
    updatedBy: service.updatedBy || null
  }));
}

function hasText(value) {
  return String(value ?? '').trim().length > 0;
}

function normalizeMenuItems(existing = {}) {
  const defaults = defaultMenuItems();
  const result = { ...(existing && typeof existing === 'object' ? existing : {}) };
  let changed = false;

  for (const [key, items] of Object.entries(defaults)) {
    if (!Array.isArray(result[key]) || result[key].length === 0) {
      result[key] = items;
      changed = true;
    } else {
      result[key] = result[key]
        .map((item) => ({
          emoji: item.emoji || '🧾',
          name: String(item.name || '').trim(),
          price: Math.max(0, Number(item.price || 0))
        }))
        .filter((item) => item.name);
      if (!result[key].length) {
        result[key] = items;
        changed = true;
      }
    }
  }

  return { menuItems: result, changed };
}

function ensureShape(db) {
  const base = defaultDb();
  const shaped = {
    ...base,
    ...(db && typeof db === 'object' ? db : {}),
    users: db?.users && typeof db.users === 'object' ? db.users : {},
    settings: {
      ...base.settings,
      ...(db?.settings || {}),
      wifi: {
        ...base.settings.wifi,
        ...(db?.settings?.wifi || {})
      },
      hotelInfo: {
        ...base.settings.hotelInfo,
        ...(db?.settings?.hotelInfo || {})
      },
      supportContacts: {
        ...base.settings.supportContacts,
        ...(db?.settings?.supportContacts || {}),
        contacts: Array.isArray(db?.settings?.supportContacts?.contacts) && db.settings.supportContacts.contacts.length
          ? db.settings.supportContacts.contacts.map((item) => String(item).trim()).filter(Boolean)
          : base.settings.supportContacts.contacts
      }
    },
    counters: {
      ...base.counters,
      ...(db?.counters || {})
    },
    serviceRequests: Array.isArray(db?.serviceRequests) ? db.serviceRequests : [],
    auditLog: Array.isArray(db?.auditLog) ? db.auditLog : []
  };

  shaped.services = mergeDefaultServices(db?.services, db?.settings?.servicePrices || {});
  shaped.menuItems = normalizeMenuItems(db?.menuItems).menuItems;
  return shaped;
}

function isEmptyPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0;
}

function hasAnySeededBotData(data) {
  if (!data || typeof data !== 'object') return false;
  if (!isEmptyPlainObject(data.users || {})) return true;
  if (Array.isArray(data.services) && data.services.length > 0) return true;
  if (Array.isArray(data.serviceRequests) && data.serviceRequests.length > 0) return true;
  if (Array.isArray(data.auditLog) && data.auditLog.length > 0) return true;
  if (data.settings && typeof data.settings === 'object' && !isEmptyPlainObject(data.settings)) return true;
  if (data.menuItems && typeof data.menuItems === 'object' && !isEmptyPlainObject(data.menuItems)) return true;
  if (data.counters && typeof data.counters === 'object' && !isEmptyPlainObject(data.counters)) return true;
  return false;
}

function createInitialSeedDb(action = 'auto_seed_initial_state_once') {
  const db = defaultDb();
  db.auditLog.unshift({
    action,
    details: { message: 'تم إنشاء بيانات البوت الافتراضية مرة واحدة فقط لأن قاعدة بيانات البوت كانت فارغة.' },
    at: nowIso(),
    by: { name: 'Auto Seed', role: 'System' }
  });
  return db;
}

function getMongoUri() {
  return process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL || DEFAULT_MONGODB_URI;
}

async function persistMongo(db) {
  if (!USE_MONGO || !mongoReady || !mongoCollection) return;
  const safeDb = ensureShape(db);
  persistChain = persistChain.then(() => mongoCollection.updateOne(
    { key: BOT_STATE_KEY },
    {
      $set: {
        key: BOT_STATE_KEY,
        data: safeDb,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  )).catch((error) => {
    console.error('فشل حفظ بيانات البوت داخل MongoDB:', error?.message || error);
  });
  await persistChain;
}

export async function initStore() {
  if (!USE_MONGO) {
    ensureDbFile();
    const raw = loadDbFromFile();
    if (!hasAnySeededBotData(raw)) {
      memoryDb = createInitialSeedDb('auto_seed_file_initial_state_once');
      saveDbToFile(memoryDb);
    } else {
      memoryDb = ensureShape(raw);
    }
    return { driver: 'file', dbName: null, collection: null };
  }

  const uri = getMongoUri();
  mongoClient = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await mongoClient.connect();
  mongoDb = process.env.MONGODB_DB ? mongoClient.db(process.env.MONGODB_DB) : mongoClient.db();
  mongoCollection = mongoDb.collection(BOT_STATE_COLLECTION);

  const doc = await mongoCollection.findOne({ key: BOT_STATE_KEY });
  mongoReady = true;

  if (!doc || !hasAnySeededBotData(doc.data)) {
    memoryDb = createInitialSeedDb('auto_seed_mongo_initial_state_once');
    await persistMongo(memoryDb);
  } else {
    // مهم: لو في أي بيانات موجودة، البوت لا يضيف ولا يكمل الناقص.
    // يتم استخدام ensureShape للقراءة أثناء التشغيل فقط بدون حفظ تلقائي.
    memoryDb = ensureShape(doc.data);
  }

  return { driver: 'mongo', dbName: mongoDb.databaseName, collection: BOT_STATE_COLLECTION };
}

export async function closeStore() {
  try { await persistChain; } catch {}
  if (mongoClient) await mongoClient.close();
}

function loadDbFromFile() {
  ensureDbFile();
  try {
    return ensureShape(JSON.parse(fs.readFileSync(dbPath, 'utf8')));
  } catch {
    return defaultDb();
  }
}

function saveDbToFile(db) {
  ensureDbFile();
  fs.writeFileSync(dbPath, JSON.stringify(ensureShape(db), null, 2));
}

export function loadDb() {
  if (memoryDb) return ensureShape(memoryDb);
  return loadDbFromFile();
}

export function saveDb(db) {
  const shaped = ensureShape(db);
  memoryDb = shaped;
  if (USE_MONGO && mongoReady) {
    void persistMongo(shaped);
  } else {
    saveDbToFile(shaped);
  }
}

function rawHasPath(obj, pathList) {
  let current = obj;
  for (const key of pathList) {
    if (!current || typeof current !== 'object' || !(key in current)) return false;
    current = current[key];
  }
  if (Array.isArray(current)) return current.length > 0;
  return hasText(current) || typeof current === 'number' || typeof current === 'boolean' || (current && typeof current === 'object');
}

export function ensureDefaultData() {
  const raw = memoryDb || loadDbFromFile();

  // المطلوب: Auto Seed مرة واحدة فقط عند عدم وجود أي بيانات.
  // لو في أي بيانات موجودة، حتى لو ناقصة، لا نكمل الناقص ولا نستبدل أي قيمة.
  if (!hasAnySeededBotData(raw)) {
    const db = createInitialSeedDb(USE_MONGO ? 'auto_seed_mongo_initial_state_once' : 'auto_seed_file_initial_state_once');
    saveDb(db);
    return ensureShape(db);
  }

  memoryDb = ensureShape(raw);
  return memoryDb;
}

export function getMenuItemsForService(serviceKey) {
  const db = loadDb();
  const items = db.menuItems?.[String(serviceKey || '')];
  return Array.isArray(items) ? items : [];
}

export function updateMenuItemPrice(serviceKey, index, price, updatedBy = null) {
  const db = loadDb();
  const key = String(serviceKey || '');
  const idx = Number(index);
  if (!['food', 'drinks'].includes(key)) return null;
  if (!db.menuItems || typeof db.menuItems !== 'object') db.menuItems = {};
  if (!Array.isArray(db.menuItems[key])) db.menuItems[key] = [];
  const item = db.menuItems[key][idx];
  if (!item) return null;
  item.price = Math.max(0, Number(price || 0));
  item.updatedAt = nowIso();
  item.updatedBy = actorInfo(updatedBy);
  pushAudit(db, 'menu_item_price_update', { serviceKey: key, index: idx, name: item.name, price: item.price }, updatedBy);
  saveDb(db);
  return item;
}

export function createMenuItem(serviceKey, payload = {}, createdBy = null) {
  const db = loadDb();
  const key = String(serviceKey || '');
  if (!['food', 'drinks'].includes(key)) return null;
  const name = String(payload.name || '').trim();
  if (!name) return null;
  if (!db.menuItems || typeof db.menuItems !== 'object') db.menuItems = {};
  if (!Array.isArray(db.menuItems[key])) db.menuItems[key] = [];
  const item = {
    emoji: String(payload.emoji || (key === 'food' ? '🍽️' : '🥤')).trim(),
    name,
    price: Math.max(0, Number(payload.price || 0)),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    updatedBy: actorInfo(createdBy)
  };
  db.menuItems[key].push(item);
  pushAudit(db, 'menu_item_create', { serviceKey: key, name: item.name, price: item.price }, createdBy);
  saveDb(db);
  return item;
}

function pushAudit(db, action, details = {}, actor = null) {
  db.auditLog.unshift({ action, details, at: nowIso(), by: actorInfo(actor) });
  db.auditLog = db.auditLog.slice(0, 500);
}

export function listLinkedUsers(options = {}) {
  const users = Object.values(loadDb().users || {});
  const filtered = options.type ? users.filter((user) => user.type === options.type) : users;
  return filtered.sort((a, b) => new Date(b.linkedAt || 0).getTime() - new Date(a.linkedAt || 0).getTime()).slice(0, Number(options.limit || 50));
}

export function listAuditLog(limit = 30) {
  return loadDb().auditLog.slice(0, Number(limit || 30));
}

export function getLinkedUser(telegramId) {
  return loadDb().users[String(telegramId)] || null;
}

export function saveLinkedUser(telegramId, user) {
  const db = loadDb();
  db.users[String(telegramId)] = { ...user, telegramId: String(telegramId), linkedAt: nowIso() };
  saveDb(db);
  return db.users[String(telegramId)];
}

export function removeLinkedUser(telegramId) {
  const db = loadDb();
  delete db.users[String(telegramId)];
  saveDb(db);
}

export function getWifiSettings() {
  return loadDb().settings.wifi;
}

export function saveWifiSettings(wifi, updatedBy = null) {
  const db = loadDb();
  db.settings.wifi = {
    name: String(wifi.name || '').trim(),
    password: String(wifi.password || '').trim(),
    note: String(wifi.note || '').trim(),
    updatedAt: nowIso(),
    updatedBy: actorInfo(updatedBy)
  };
  pushAudit(db, 'wifi_update', { name: db.settings.wifi.name }, updatedBy);
  saveDb(db);
  return db.settings.wifi;
}

export function getHotelInfo() {
  return loadDb().settings.hotelInfo;
}

export function saveHotelInfo(info, updatedBy = null) {
  const db = loadDb();
  db.settings.hotelInfo = {
    breakfastTime: String(info.breakfastTime || '').trim(),
    restaurantTime: String(info.restaurantTime || '').trim(),
    receptionPhone: String(info.receptionPhone || '').trim(),
    checkoutPolicy: String(info.checkoutPolicy || '').trim(),
    servicesNote: String(info.servicesNote || '').trim(),
    updatedAt: nowIso(),
    updatedBy: actorInfo(updatedBy)
  };
  pushAudit(db, 'hotel_info_update', { receptionPhone: db.settings.hotelInfo.receptionPhone }, updatedBy);
  saveDb(db);
  return db.settings.hotelInfo;
}

export function getSupportContacts() {
  return loadDb().settings.supportContacts;
}

export function saveSupportContacts(payload = {}, updatedBy = null) {
  const db = loadDb();
  const contacts = Array.isArray(payload.contacts)
    ? payload.contacts.map((item) => String(item || '').trim()).filter(Boolean)
    : String(payload.contacts || '').split('\n').map((item) => item.trim()).filter(Boolean);

  db.settings.supportContacts = {
    contacts: contacts.length ? contacts : defaultSupportContacts().contacts,
    note: String(payload.note || '').trim(),
    updatedAt: nowIso(),
    updatedBy: actorInfo(updatedBy)
  };

  // Keep the old hotel info reception phone synced with the first support line for old screens.
  db.settings.hotelInfo = {
    ...db.settings.hotelInfo,
    receptionPhone: db.settings.supportContacts.contacts[0] || db.settings.hotelInfo?.receptionPhone || '',
    updatedAt: db.settings.hotelInfo?.updatedAt || nowIso(),
    updatedBy: db.settings.hotelInfo?.updatedBy || actorInfo(updatedBy)
  };

  pushAudit(db, 'support_contacts_update', { contactsCount: db.settings.supportContacts.contacts.length }, updatedBy);
  saveDb(db);
  return db.settings.supportContacts;
}

export function listServices(options = {}) {
  const services = loadDb().services;
  if (options.activeOnly) return services.filter((service) => service.active !== false);
  return services;
}

export function getServiceByKey(key) {
  const services = listServices();
  return services.find((service) => service.key === key) || null;
}

export function createHotelService(payload, createdBy = null) {
  const db = loadDb();
  const next = Number(db.counters.service || 100) + 1;
  const name = String(payload.name || '').trim();
  const price = Math.max(0, Number(payload.price || 0));
  const service = {
    key: `custom_${next}`,
    emoji: payload.emoji || '🧾',
    name,
    detailsHint: payload.detailsHint || 'اكتب تفاصيل الطلب المطلوب',
    price,
    active: payload.active !== false,
    builtIn: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    updatedBy: actorInfo(createdBy)
  };
  db.counters.service = next;
  db.services.push(service);
  pushAudit(db, 'service_create', { key: service.key, name: service.name, price: service.price }, createdBy);
  saveDb(db);
  return service;
}

export function updateHotelServiceName(key, name, updatedBy = null) {
  const db = loadDb();
  const service = db.services.find((item) => item.key === key);
  if (!service) return null;
  service.name = String(name || '').trim();
  service.updatedAt = nowIso();
  service.updatedBy = actorInfo(updatedBy);
  pushAudit(db, 'service_rename', { key, name: service.name }, updatedBy);
  saveDb(db);
  return service;
}

export function updateHotelServicePrice(key, price, updatedBy = null) {
  const db = loadDb();
  const service = db.services.find((item) => item.key === key);
  if (!service) return null;
  service.price = Math.max(0, Number(price || 0));
  service.updatedAt = nowIso();
  service.updatedBy = actorInfo(updatedBy);
  pushAudit(db, 'service_price_update', { key, price: service.price }, updatedBy);
  saveDb(db);
  return service;
}

export function setHotelServiceActive(key, active, updatedBy = null) {
  const db = loadDb();
  const service = db.services.find((item) => item.key === key);
  if (!service) return null;
  service.active = Boolean(active);
  service.updatedAt = nowIso();
  service.updatedBy = actorInfo(updatedBy);
  pushAudit(db, 'service_toggle', { key, active: service.active }, updatedBy);
  saveDb(db);
  return service;
}

function buildRequest(db, payload, service) {
  const nextNumber = Number(db.counters.serviceRequest || 1000) + 1;
  const now = nowIso();
  const request = {
    id: `REQ-${nextNumber}`,
    number: nextNumber,
    serviceKey: service.key,
    serviceTitle: serviceTitle(service),
    price: Number(payload.priceOverride ?? service.price ?? 0),
    quantity: Math.max(1, Number(payload.quantity || payload.item?.quantity || 1)),
    unitPrice: payload.unitPrice !== null && payload.unitPrice !== undefined ? Number(payload.unitPrice) : (payload.item?.unitPrice !== undefined ? Number(payload.item.unitPrice) : null),
    details: String(payload.details || '').trim(),
    item: payload.item || null,
    items: Array.isArray(payload.items) ? payload.items : [],
    roomNumber: String(payload.roomNumber || '').trim(),
    status: 'pending',
    statusText: translateRequestStatus('pending'),
    telegramId: String(payload.telegramId || ''),
    user: {
      type: payload.user?.type || '-',
      userId: payload.user?.userId || '-',
      name: payload.user?.name || '-',
      email: payload.user?.email || '-',
      phone: payload.user?.phone || '-',
      bookingId: payload.user?.bookingId || '-',
      bookingCode: payload.user?.bookingCode || '-'
    },
    rating: null,
    createdAt: now,
    updatedAt: now,
    updatedBy: null,
    history: [{ status: 'pending', statusText: translateRequestStatus('pending'), at: now, by: 'guest' }]
  };
  db.counters.serviceRequest = nextNumber;
  db.serviceRequests.unshift(request);
  return request;
}

export function createServiceRequest(payload) {
  const db = loadDb();
  const service = db.services.find((item) => item.key === payload.serviceKey && item.active !== false);
  if (!service) throw new Error('الخدمة غير موجودة أو موقوفة حاليًا.');
  const request = buildRequest(db, payload, service);
  saveDb(db);
  return request;
}

export function createSupportRequest(payload) {
  const db = loadDb();
  const service = { key: 'support', emoji: '📞', name: 'التواصل مع خدمة العملاء', price: 0 };
  const request = buildRequest(db, payload, service);
  saveDb(db);
  return request;
}

export function listUserServiceRequests(telegramId, limit = 20) {
  return loadDb().serviceRequests
    .filter((request) => String(request.telegramId) === String(telegramId))
    .slice(0, limit);
}

export function listRateableRequests(telegramId, limit = 20) {
  return loadDb().serviceRequests
    .filter((request) => String(request.telegramId) === String(telegramId) && request.status === 'done' && !request.rating)
    .slice(0, limit);
}

export function listServiceRequests(options = {}) {
  const db = loadDb();
  let requests = [...db.serviceRequests];

  if (options.status) requests = requests.filter((request) => request.status === options.status);
  if (options.roomNumber) requests = requests.filter((request) => normalizeInput(request.roomNumber) === normalizeInput(options.roomNumber));
  if (options.fromDate) {
    const from = new Date(options.fromDate).getTime();
    requests = requests.filter((request) => new Date(request.createdAt).getTime() >= from);
  }

  if (options.limit === 'all' || options.limit === Infinity) return requests;
  return requests.slice(0, Number(options.limit || 30));
}

export function getServiceRequest(id) {
  return loadDb().serviceRequests.find((request) => request.id === id) || null;
}

export function updateServiceRequestStatus(id, status, updatedBy = null) {
  const db = loadDb();
  const request = db.serviceRequests.find((item) => item.id === id);
  if (!request) return null;

  const now = nowIso();
  request.status = status;
  request.statusText = translateRequestStatus(status);
  request.updatedAt = now;
  request.updatedBy = actorInfo(updatedBy);
  request.history = Array.isArray(request.history) ? request.history : [];
  request.history.push({ status, statusText: translateRequestStatus(status), at: now, by: actorInfo(updatedBy) });

  pushAudit(db, 'request_status_update', { id, status }, updatedBy);
  saveDb(db);
  return request;
}

export function rateServiceRequest(id, telegramId, rating, comment = '') {
  const db = loadDb();
  const request = db.serviceRequests.find((item) => item.id === id && String(item.telegramId) === String(telegramId));
  if (!request) return null;
  if (request.status !== 'done') throw new Error('يمكن تقييم الطلب بعد تنفيذه فقط.');
  if (request.rating) throw new Error('تم تقييم هذا الطلب من قبل.');

  request.rating = {
    stars: Math.min(5, Math.max(1, Number(rating || 0))),
    comment: String(comment || '').trim(),
    at: nowIso()
  };
  request.updatedAt = nowIso();
  pushAudit(db, 'request_rating', { id, stars: request.rating.stars }, { name: request.user?.name || 'عميل', telegramId });
  saveDb(db);
  return request;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfWeek() {
  const date = new Date();
  const day = date.getDay();
  const diff = (day + 6) % 7;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getRequestsByExportFilter(filter = 'all', roomNumber = '') {
  if (filter === 'today') return listServiceRequests({ limit: 'all', fromDate: startOfToday().toISOString() });
  if (filter === 'week') return listServiceRequests({ limit: 'all', fromDate: startOfWeek().toISOString() });
  if (filter === 'done') return listServiceRequests({ limit: 'all', status: 'done' });
  if (filter === 'rejected') return listServiceRequests({ limit: 'all', status: 'rejected' });
  if (filter === 'room') return listServiceRequests({ limit: 'all', roomNumber });
  return listServiceRequests({ limit: 'all' });
}

export function getRequestStats() {
  const requests = listServiceRequests({ limit: 'all' });
  const todayStart = startOfToday().getTime();
  const todayCount = requests.filter((request) => new Date(request.createdAt).getTime() >= todayStart).length;
  const doneCount = requests.filter((request) => request.status === 'done').length;
  const activeCount = requests.filter((request) => ['pending', 'received', 'directed', 'in_progress'].includes(request.status)).length;
  const totalValue = requests.reduce((sum, request) => sum + Number(request.price || 0), 0);
  const rated = requests.filter((request) => request.rating?.stars);
  const avgRating = rated.length ? rated.reduce((sum, request) => sum + Number(request.rating.stars || 0), 0) / rated.length : 0;

  const serviceCounts = new Map();
  for (const request of requests) {
    const key = request.serviceTitle || request.serviceKey || 'غير محدد';
    serviceCounts.set(key, (serviceCounts.get(key) || 0) + 1);
  }
  const mostRequested = Array.from(serviceCounts.entries()).sort((a, b) => b[1] - a[1])[0] || ['لا يوجد', 0];

  return {
    total: requests.length,
    todayCount,
    doneCount,
    activeCount,
    totalValue,
    mostRequestedName: mostRequested[0],
    mostRequestedCount: mostRequested[1],
    ratingCount: rated.length,
    avgRating
  };
}
