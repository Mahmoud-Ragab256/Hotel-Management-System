# Hotel Management System — التوثيق الكامل للمشروع

> DEPI Graduation Project — نظام متكامل لإدارة الفنادق: Backend (Node.js/Express/TypeScript/MongoDB) + Frontend (React/Vite) + Telegram Bot (Node.js/MongoDB)

---

## 1. نظرة عامة

المشروع عبارة عن نظام إدارة فندق كامل مقسّم لـ 3 تطبيقات منفصلة داخل نفس الريبو:

| الجزء | الوصف | التقنية الأساسية |
|---|---|---|
| **Backend** | REST API يدير كل البيانات (غرف، حجوزات، فواتير، ضيوف، موظفين...) | Node.js + Express + TypeScript + MongoDB |
| **Frontend** | واجهة الضيوف (Guest) + لوحة تحكم الأدمن (Dashboard) في تطبيق React واحد | React 18 + Vite + React Router |
| **Telegram_bot** | بوت تليجرام بالعربي بيقدّم خدمات فندقية للضيوف والموظفين (طلبات، حجوزات، صيانة...) | Telegraf + MongoDB (Store خاص به) |

الـ Frontend والـ Bot الاتنين بيكلموا نفس الـ Backend API، لكن كل واحد فيهم عنده طريقته الخاصة في التخزين/الحالة المؤقتة.

الرابط المنشور (Production): `https://hotel-management-system-sigma-ruby.vercel.app`

---

## 2. هيكل الريبو (Repository Structure)

```
Hotel-Management-System/
│
├── Backend/
│   ├── src/
│   │   ├── DB/
│   │   │   ├── connection.ts              # الاتصال بـ MongoDB عبر Mongoose
│   │   │   └── Models/                    # كل الـ Schemas (Booking, Guest, Room...)
│   │   ├── Modules/
│   │   │   ├── client/                    # كل حاجة خاصة بالضيف (Guest-facing)
│   │   │   │   ├── auth/                  # تسجيل / دخول / استرجاع باسورد
│   │   │   │   ├── landing/               # بيانات الصفحة الرئيسية والإحصائيات
│   │   │   │   ├── rooms/                 # عرض وبحث الغرف
│   │   │   │   ├── booking/                # حجز الضيف
│   │   │   │   ├── profile/                # بروفايل الضيف
│   │   │   │   └── client.routes.ts
│   │   │   ├── dashboard/                 # كل حاجة خاصة بالأدمن/الموظفين
│   │   │   │   ├── auth/, guest/, employee/, room/, roomCategory/,
│   │   │   │   │   booking/, service/, serviceOrder/, invoice/,
│   │   │   │   │   review/, notification/
│   │   │   │   ├── dashboard.controller.ts
│   │   │   │   └── dashboard.routes.ts
│   │   │   └── index.routes.ts            # نقطة تجميع كل الراوترز
│   │   ├── utils/                         # middleware المصادقة، رفع الصور (Cloudinary/Multer)، الإيميل...
│   │   ├── index.ts                       # إعداد Express app (helmet, cors, rate-limit...)
│   │   ├── server.ts                      # نقطة تشغيل السيرفر محليًا
│   │   ├── seedAdmin.ts                   # زرع أول حساب أدمن
│   │   ├── seedDatabase.ts                # زرع بيانات تجريبية لو الداتابيز فاضية
│   │   └── seedLoginAccounts.ts
│   ├── Documentation/Documentation.pdf    # توثيق PDF قديم مُرفق فى الريبو
│   ├── package.json / tsconfig.json / vercel.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/                    # Header, AccountMenu, NotificationsBell, Sidebar...
│   │   ├── context/ThemeContext.jsx
│   │   ├── data/                          # عناصر السايدبار / النافبار / الميني الثابتة
│   │   ├── layouts/                       # GuestLayout (للضيوف) و AdminLayout (للوحة التحكم)
│   │   ├── pages/                         # كل صفحات الضيف والأدمن (أكثر من 30 صفحة)
│   │   ├── services/api.js                # كل نداءات الـ Axios على الـ Backend
│   │   ├── services/auth.js               # تخزين التوكن وبيانات المستخدم
│   │   ├── styles/                        # ملفات CSS مجاورة للمكوّنات
│   │   └── utils/                         # AdminShortcut (اختصار Ctrl+Shift+A) وأدوات التاريخ
│   ├── package.json / vite.config.js / vercel.json
│
├── Telegram_bot/
│   ├── src/
│   │   ├── index.js                       # منطق البوت الرئيسي (Handlers + State Machine)
│   │   ├── api.js                         # عميل Axios بيكلم الـ Backend API
│   │   ├── store.js                       # طبقة تخزين حالة البوت (MongoDB أو ملف محلي)
│   │   ├── format.js                      # دوال تنسيق الرسائل والعملات والتواريخ
│   │   ├── keyboards.js                   # كيبوردات تليجرام (Inline/Reply)
│   │   ├── pdf-export.js                  # تصدير تقارير PDF
│   │   └── doctor.js                      # سكربت تشخيص إعدادات البوت
│   ├── api/                               # Serverless functions لتشغيل البوت كـ Webhook على Vercel
│   ├── scripts/                           # ضبط/حذف الـ Webhook
│   └── package.json / vercel.json
│
└── .gitignore
```

---

## 3. Tech Stack بالتفصيل

### Backend
| المكوّن | الاستخدام |
|---|---|
| Node.js + Express 4 | تشغيل السيرفر والـ Routing |
| TypeScript 5 | Typing على مستوى الكود كله (Models + Controllers) |
| MongoDB + Mongoose 8 | قاعدة البيانات وتعريف الـ Schemas |
| JWT (`jsonwebtoken`) | المصادقة (Authentication) |
| bcrypt | تشفير الباسورد |
| Joi | Validation لكل الـ Requests |
| Multer + multer-storage-cloudinary + Cloudinary | رفع صور الغرف/الموظفين/الضيوف/الخدمات |
| Brevo | إرسال إيميلات الـ OTP لاسترجاع كلمة السر |
| Helmet, express-rate-limit, CORS, Morgan | أمان وحماية وتسجيل الطلبات |
| tsx / nodemon | التشغيل في وضع التطوير |

### Frontend
| المكوّن | الاستخدام |
|---|---|
| React 18 + Vite 6 | بناء الواجهة والتطوير السريع |
| React Router 6 | التنقل بين صفحات الضيف ولوحة التحكم |
| Axios | الاتصال بالـ API |
| Bootstrap 5 + React-Bootstrap | مكونات UI جاهزة |
| Chart.js + react-chartjs-2 | الرسوم البيانية في لوحة التحكم |
| FontAwesome | الأيقونات |

### Telegram Bot
| المكوّن | الاستخدام |
|---|---|
| Telegraf 4 | التعامل مع Telegram Bot API |
| MongoDB Driver (`mongodb`) | تخزين حالة البوت (Store الخاص به، منفصل عن قاعدة بيانات الـ Backend) |
| Axios | الاتصال بالـ Backend API (تسجيل دخول الموظف، عرض الغرف، الحجوزات...) |
| pdfkit | توليد تقارير PDF (تصدير الطلبات) |
| dotenv | متغيرات البيئة |

---

## 4. التشغيل محليًا (Local Setup)

### 4.1 المتطلبات
- Node.js 18+
- MongoDB (محلي أو Atlas)
- حساب Cloudinary (لرفع الصور)
- حساب SMTP أو Brevo (لإرسال إيميلات الـ OTP)
- (اختياري) بوت تليجرام من BotFather لو هتشغّل الـ Bot

### 4.2 Backend

```bash
cd Backend
npm install
```

أنشئ ملف `.env` داخل `Backend/` بالمتغيرات دي (مستخرجة فعليًا من الكود):

```env
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/hotel-management-system

# JWT
SECRET=your_jwt_secret_key
TOKEN_EXPIRE_IN=7d

# Password hashing
SALT_ROUNDS=10
PEPPER=your_extra_pepper_string

# Cloudinary (رفع الصور)
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_cloud_api_key
CLOUD_API_SECRET=your_cloud_api_secret

# Email (OTP لاسترجاع الباسورد) — عبر Brevo
BREVO_API_KEY=your_brevo_api_key

# أول حساب أدمن (لسكربت seed:admin)
FIRST_ADMIN_FULL_NAME=Admin User
FIRST_ADMIN_EMAIL=admin@example.com
FIRST_ADMIN_PASSWORD=Admin@12345
```

تشغيل السيرفر:

```bash
npm run dev          # تشغيل بالـ nodemon (Development)
npm run build        # تحويل TypeScript إلى JavaScript
npm start             # تشغيل النسخة المبنية (Production)

npm run seed:admin           # إنشاء أول حساب أدمن
npm run seed:login-accounts  # زرع حسابات دخول تجريبية
```

> ملاحظة: فيه سكربت `seedDatabaseIfEmpty` بيتنفذ تلقائيًا لو الداتابيز فاضية.

### 4.3 Frontend

```bash
cd Frontend
npm install
```

ملف `.env` (اختياري، لو عايز تغيّر عنوان الـ API):

```env
VITE_API_BASE_URL=http://localhost:3000
```

لو الملف مش موجود، الفرونت هيستخدم تلقائيًا رابط الإنتاج المنشور على Vercel.

```bash
npm run dev       # تشغيل التطوير على http://localhost:6501
npm run build     # بناء نسخة الإنتاج
npm run preview   # معاينة نسخة الإنتاج
```

### 4.4 Telegram Bot

```bash
cd Telegram_bot
npm install
```

ملف `.env`:

```env
BOT_TOKEN=your_telegram_bot_token
BACKEND_URL=http://localhost:3000
STORE_DRIVER=mongo                 # أو file لتخزين محلي في data/bot-db.json
MONGODB_URI=mongodb://127.0.0.1:27017/hotel-management-system
BOT_STATE_COLLECTION=bot_state
BOT_STATE_KEY=main
```

```bash
npm start              # تشغيل البوت بنظام Polling
npm run dev             # تشغيل مع إعادة التحميل التلقائي
npm run doctor          # تشخيص شامل للإعدادات والاتصال
npm run set-webhook     # لضبط Webhook عند النشر على Vercel
npm run delete-webhook  # حذف الـ Webhook والرجوع لـ Polling
```

---

## 5. Data Models (MongoDB / Mongoose)

| الموديل | أهم الحقول |
|---|---|
| **Guest** | `fullName`, `email`, `password`, `phone`, `nationalId`, `vipLevel` (Bronze/Silver/Gold/Platinum), `isActive`, `avatar`, `preferences` |
| **Employee** | `fullName`, `email`, `password`, `role` (Admin/Manager/Receptionist/Service), `shift` (Morning/Evening/Night), `salary`, `isActive`, `avatar` |
| **Room** | `roomNumber`, `categoryId` (ref RoomCategory), `status` (Available/Occupied/Maintenance), `floor`, `mapCoordinates`, `smartDevices` (tv/ac/lights/curtains), `images[]` |
| **RoomCategory** | `name`, `basePrice`, `capacity` (adults/children), `amenities[]`, `images[]`, `description` |
| **Booking** | `bookingNumber` (4 أرقام يتولّد تلقائيًا وبشكل فريد)، `guestId`, `roomId`, `checkInDate`, `checkOutDate`, `status` (Pending/Confirmed/CheckedIn/CheckedOut/Cancelled), `totalPrice`, `paymentStatus` (Pending/Paid/Refunded), `extras[]`, `specialRequests`, `attachments[]` |
| **Invoice** | `bookingId` (فريد — فاتورة واحدة لكل حجز)، `employeeId`, `totalAmount`, `paidAmount`, `status` (Pending/Paid/Cancelled), `method` (Cash/CreditCard/DebitCard/BankTransfer/Mobile), `issuedAt` |
| **Service** | `name`, `description`, `details`, `category` (RoomService/Spa/Laundry/Restaurant/Transport/Other), `price`, `isAvailable`, `maxCapacity`, `images[]` |
| **ServiceOrder** | `bookingId`, `serviceId`, `assignedEmployeeId`, `quantity`, `totalPrice` (= `service.price × quantity`), `status` (Pending/InProgress/Completed/Cancelled), `notes`, `orderTime`, `deliveryTime` |
| **Review** | `guestId`, `roomId`, `bookingId`, `rating` (1-5), `comment`, `images[]`, `status` (Pending/Approved/Rejected), `isApproved` |
| **Notification** | `recipientType` (Guest/Employee), `recipientId`, `title`, `message`, `type` (Booking/Payment/Service/Review/System/Promotion), `isRead`, `images[]` |

كل الموديلات بتستخدم `timestamps: true` (يعني عندها `createdAt` و `updatedAt` تلقائيًا).

---

## 6. API Reference

> الـ Base URL في الإنتاج: `https://hotel-management-system-sigma-ruby.vercel.app`
> كل الـ Endpoints تحت `/` مباشرة (مفيش prefix زي `/api`) — حسب `index.routes.ts`.

### 6.1 Client API — خاص بالضيف (`/client`)

مسارات الـ `auth` و `landing` مفتوحة، وباقي المسارات (`rooms`, `booking`, `me`) محمية بميدلوير `protect` (لازم Guest JWT في الهيدر `Authorization: Bearer <token>`).

#### `POST /client/auth/*`
| Method | Endpoint | الوصف |
|---|---|---|
| POST | `/register` | تسجيل حساب ضيف جديد |
| POST | `/login` | دخول الضيف واستلام JWT |
| POST | `/forgot-password` | إرسال كود OTP على الإيميل |
| POST | `/reset-code` | التحقق من كود الـ OTP |
| POST | `/reset-password` | تعيين باسورد جديد |

#### `GET /client/landing/*`
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/` أو `/landing` | بيانات الصفحة الرئيسية |
| GET | `/statistics` | إحصائيات عامة عن الفندق |
| GET | `/featured-categories` | فئات الغرف المميزة |

#### `🔒 /client/rooms/*`
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/available` | كل الغرف المتاحة حاليًا |
| POST | `/search` | بحث بالفلاتر (النوع، السعر، التواريخ...) |
| GET | `/:id` | تفاصيل غرفة معينة |

#### `🔒 /client/booking/*`
| Method | Endpoint | الوصف |
|---|---|---|
| POST | `/` | إنشاء حجز جديد |
| GET | `/user/:guestId` | كل حجوزات ضيف معيّن |
| GET | `/:id` | تفاصيل حجز |
| PUT | `/:id/cancel` | إلغاء حجز |

#### `🔒 /client/me/*` (بروفايل الضيف الحالي)
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/` | بيانات البروفايل |
| PUT | `/` | تحديث البروفايل |
| PUT | `/change-password` | تغيير كلمة السر |
| GET | `/avatar` | صورة البروفايل |
| PUT | `/avatar` | رفع صورة (`multipart/form-data`, field: `avatar`) |
| DELETE | `/avatar` | حذف صورة البروفايل |
| GET | `/bookings` | سجل الحجوزات |
| GET | `/reviews` | التقييمات اللي كتبها الضيف |

---

### 6.2 Dashboard API — خاص بالأدمن/الموظفين (`/dashboard`)

> ملاحظة مهمة: حاليًا الحماية العامة (`protect`, `allowTo`) على مستوى الراوتر الرئيسي **متعطّلة مؤقتًا** (مكتوبة كـ comment في `dashboard.routes.ts`)، فمعظم مسارات الـ Dashboard شغّالة من غير توكن. ده حاجة لازم تتراجع قبل أي نشر حقيقي (production hardening).

#### `/dashboard/auth`
| Method | Endpoint | الوصف |
|---|---|---|
| POST | `/login` | دخول الموظف/الأدمن |
| POST | `/forgot-password` | إرسال OTP |
| POST | `/reset-code` | التحقق من الكود |
| POST | `/reset-password` | تعيين باسورد جديد |

#### `/dashboard/guests`
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/` | كل الضيوف |
| GET | `/:id` | ضيف معيّن |
| POST | `/register` | إنشاء حساب ضيف |
| POST | `/login` | دخول ضيف (من لوحة التحكم) |
| PUT | `/:id/status` | تفعيل/تعطيل الحساب |
| PUT | `/:id/inactive` | تعطيل الحساب |
| PUT | `/:id` | تعديل بيانات الضيف |
| DELETE | `/:id` | حذف الضيف |

#### `/dashboard/employees`
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/` | كل الموظفين |
| GET | `/:id` | موظف معيّن |
| GET | `/:id/avatar` | صورة الموظف |
| POST | `/register` | إنشاء حساب موظف |
| POST | `/login` | دخول موظف |
| PUT | `/:id/status` | تفعيل/تعطيل |
| PUT | `/:id/inactive` | تعطيل |
| PUT | `/:id` | تعديل + رفع صورة (`multipart/form-data`, field: `avatar`) |
| DELETE | `/:id` | حذف موظف |

#### `/dashboard/room-categories`
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/` | كل الفئات |
| GET | `/:id` | فئة معيّنة |
| POST | `/` | إنشاء فئة |
| PUT | `/:id` | تعديل فئة |
| DELETE | `/:id` | حذف فئة |

#### `/dashboard/rooms`
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/` | كل الغرف |
| GET | `/available` | الغرف المتاحة فقط |
| GET | `/:id` | غرفة معيّنة |
| POST | `/` | إنشاء غرفة |
| PUT | `/:id` | تعديل غرفة |
| PUT | `/:id/images` | رفع صور (`multipart/form-data`, field: `images`, حد أقصى 10) |
| GET | `/:id/images` | جلب صور غرفة |
| DELETE | `/:id` | حذف غرفة |

#### `/dashboard/bookings`
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/` | كل الحجوزات |
| GET | `/number/:bookingNumber` | حجز برقمه المكوّن من 4 أرقام |
| GET | `/:id` | حجز بالـ ID |
| POST | `/` | إنشاء حجز |
| PUT | `/:id` | تعديل حجز |
| PUT | `/:id/cancel` | إلغاء حجز |
| DELETE | `/:id` | حذف حجز نهائيًا |

#### `/dashboard/services`
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/` | كل الخدمات |
| GET | `/available` | الخدمات المتاحة |
| GET | `/:id` | خدمة معيّنة |
| POST | `/` | إنشاء خدمة (رفع صور، field: `images`، حد أقصى 10) |
| PUT | `/:id/images` | تحديث صور الخدمة |
| PUT | `/:id` | تعديل خدمة |
| DELETE | `/:id` | حذف خدمة |

#### `/dashboard/service-orders`
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/` | كل طلبات الخدمة |
| GET | `/:id` | طلب معيّن |
| POST | `/` | إنشاء طلب خدمة |
| PUT | `/:id` | تعديل طلب |
| DELETE | `/:id` | حذف طلب |

#### `/dashboard/invoices`
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/` | كل الفواتير |
| GET | `/booking/:bookingId` | الفاتورة المرتبطة بحجز معيّن |
| GET | `/:id` | فاتورة بالـ ID |
| POST | `/` | إنشاء فاتورة |
| PUT | `/:id` | تعديل فاتورة |
| DELETE | `/:id` | حذف فاتورة |

#### `/dashboard/reviews`
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/` | كل التقييمات |
| GET | `/approved` | التقييمات المعتمدة فقط |
| GET | `/:id` | تقييم معيّن |
| POST | `/` | إنشاء تقييم |
| PUT | `/:id` | تعديل تقييم |
| PUT | `/:id/approve` | اعتماد تقييم |
| DELETE | `/:id` | حذف تقييم |

#### `/dashboard/notifications`
| Method | Endpoint | الوصف |
|---|---|---|
| GET | `/` | كل الإشعارات |
| GET | `/:id` | إشعار معيّن |
| GET | `/recipient/:recipientId` | إشعارات مستلم معيّن |
| GET | `/recipient/:recipientId/unread` | الإشعارات غير المقروءة |
| POST | `/` | إنشاء إشعار |
| PUT | `/:id/read` | تحديد كمقروء |
| PUT | `/recipient/:recipientId/read-all` | تحديد الكل كمقروء |
| DELETE | `/:id` | حذف إشعار |

#### `GET /dashboard/stats`
إحصائيات عامة للوحة التحكم (`dashboard.controller.ts`).

---

### 6.3 شكل الاستجابة (Response Shape)

الـ Frontend وكل الـ Bot بيقروا الاستجابة بالشكل ده:

```json
{
  "success": true,
  "data": {
    "<key>": { }
  }
}
```

فمثلاً عشان تجيب الـ `bookingId` بعد إنشاء حجز، المسار الصحيح غالبًا هو:
`response?.data?.data?.booking?._id` — مش `response.data.bookingId` مباشرة. ده بيتماشى مع الـ helper الموجود في `Frontend/src/services/api.js`:

```js
const readObject = (response, key) => response?.data?.data?.[key] || null;
```

---

## 7. الـ Frontend — الصفحات والمسارات (Routes)

### مسارات الضيف (Guest — تحت `GuestLayout`)
| Route | الصفحة |
|---|---|
| `/` | `LandingPage` (الصفحة الرئيسية) |
| `/services` | `ClientServicesPage` |
| `/help-center` | `HelpCenterPage` |
| `/reviews` | `GuestsReviewsPage` |
| `/rooms` | `ClientRoomsPage` |
| `/rooms/:id` | `RoomDetailsPage` |
| `/book-stay` | `BookStayPage` |
| `/profile` | `ProfilePage` |
| `/profile/service-orders` | `ServiceOrdersPage` |
| `/my-bookings` | `MyBookingsPage` |
| `/my-rooms` | `MyRoomsPage` |
| `/my-invoices` | `MyInvoicesPage` |
| `/order-service` | `OrderServicePage` |
| `/login`, `/signup`, `/forgot-password` | مصادقة الضيف |

### مسارات الأدمن (تحت `AdminLayout` — `/dashboard/*`)
| Route | الصفحة | الصلاحيات |
|---|---|---|
| `/dashboard` | `DashboardPage` | كل الأدوار |
| `/dashboard/bookings` | `BookingsPage` | Operations roles |
| `/dashboard/rooms` | `RoomsPage` | Room roles |
| `/dashboard/room-categories` | `RoomCategoriesPage` | Admin/Manager |
| `/dashboard/guests` | `GuestsPage` | Operations roles |
| `/dashboard/employees` | `EmployeesPage` | Admin/Manager |
| `/dashboard/invoices` | `InvoicesPage` | Operations roles |
| `/dashboard/services`, `/services/add` | `ServicesPage`, `AddServicePage` | Service roles |
| `/dashboard/service-orders` | `ServiceOrdersPage` | Service roles |
| `/dashboard/reviews`, `/reviews/:id` | `ReviewsPage`, `ReviewDetailsPage` | Operations roles |
| `/dashboard/notifications` | `NotificationsPage` | كل الأدوار |
| `/dashboard/login` | `LoginPage` | — |

الدخول للوحة التحكم من واجهة الضيف بيتم عبر اختصار كيبورد مخفي (`useAdminShortcut` — `Ctrl+Shift+A`) بدل ما يكون فيه لينك ظاهر في القائمة.

### أهم الـ Conventions المستخدمة في الفرونت
- عدم استخدام أي code comments.
- عدم استخدام وحدة `rem` في الـ CSS (استخدام `px` بدلًا منها).
- تخزين حالة المستخدم في `localStorage` تحت المفتاح `hotel_admin_user`.
- كل مكوّن له ملف CSS مجاور له (colocated CSS).
- تحميل البيانات بنمط Stale-While-Revalidate: عرض القيمة المخزّنة في localStorage أولًا، ثم تحديثها من الـ API.
- الصور بتُجلب مع query string لكسر الكاش (cache-busting) على روابطها.

---

## 8. Telegram Bot

بوت تليجرام بالكامل باللغة العربية، بيخدم فئتين:
- **الضيوف**: عرض الغرف، الحجوزات، طلب خدمات فندقية (أكل، مشروبات، تنظيف، صيانة، تاكسي، غسيل ملابس...)، الدعم الفني، والتقييم.
- **الموظفين/الأدمن**: تسجيل دخول بنفس حساب الداشبورد، إدارة الطلبات، إعدادات الخدمات والأسعار، الـ WiFi، وتصدير تقارير PDF.

### آلية العمل
- البوت مبني بـ **Telegraf** ويشتغل بنظام **State Machine** بسيط لتتبع خطوة كل مستخدم داخل المحادثة.
- عنده تخزين خاص به (`store.js`) منفصل تمامًا عن قاعدة بيانات الـ Backend — يقدر يشتغل على **MongoDB** (افتراضي) أو على **ملف JSON محلي** (`data/bot-db.json`) عن طريق `STORE_DRIVER=file`.
- بيكلم الـ Backend API فعليًا (مش بس تخزينه الداخلي) لعمليات زي تسجيل دخول الموظف، وجلب الغرف/الحجوزات (`src/api.js`).
- يدعم وضعين للتشغيل: **Polling** (محليًا) و **Webhook** (عند النشر على Vercel، عبر `api/telegram.js` و `scripts/set-webhook.js`).
- `pdf-export.js` بيولّد تقارير PDF لطلبات الخدمة.
- `doctor.js` سكربت تشخيصي بيتأكد إن كل الإعدادات (`BOT_TOKEN`, `BACKEND_URL`, الاتصال بـ MongoDB...) شغّالة صح.

---

## 9. النشر (Deployment)

الثلاث تطبيقات كل واحد فيهم عنده `vercel.json` خاص بيه وبينشر بشكل مستقل:

- **Backend**: بينشر كـ Serverless Function عبر `@vercel/node`، وكل الطلبات بتتوجّه لـ `src/index.ts`.
- **Frontend**: SPA عادي مع rewrite لكل المسارات لـ `index.html` (عشان React Router يشتغل صح).
- **Telegram_bot**: بيشتغل عبر Webhook باستخدام Serverless functions في مجلد `api/` (`telegram.js`, `set-webhook.js`, `delete-webhook.js`, `health.js`).

> لازم تتأكد إن متغيرات البيئة (`.env`) لكل تطبيق متضبّطة في إعدادات المشروع على Vercel، لأن الملفات دي مش موجودة في الريبو (مستبعدة عمدًا لأسباب أمنية).

---

## 10. نقاط مهمة / ملاحظات فنية (Known Issues & Notes)

- ملف `Backend/README.md` الحالي فيه **Git merge conflict لم يتم حله** (علامات `<<<<<<<`, `========`, `>>>>>>>>`)، ده التوثيق الحالي بيحل المشكلة دي ويجمّع كل المحتوى الصحيح في مكان واحد.
- حماية مسارات الـ Dashboard (`protect`, `allowTo`) **متعطّلة مؤقتًا** في `dashboard.routes.ts` — لازم تتفعّل قبل أي نشر إنتاجي حقيقي.
- فيه `bug` معروف في `deleteServiceOrder` بيوجّه لمسار API غلط — محتاج مراجعة يدوية.
- اسم الحقل الصحيح في موديل `ServiceOrder` هو `assignedEmployeeId` (مش `assignedTo`)، والـ `totalPrice` بيتحسب من `service.price × quantity`.
- عند قراءة رد الـ API، استخدم دايمًا `response?.data?.data?.[key]` (نمط `readObject`/`readArray` المتبع في `Frontend/src/services/api.js`) بدل الوصول المباشر لأن كل الردود ملفوفة جوه `data.data`.

---

## 11. التوثيق الإضافي المرفق أصلًا بالريبو

فيه ملف PDF قديم موجود في `Backend/Documentation/Documentation.pdf` — ممكن يحتوي على تفاصيل إضافية أو نسخة سابقة من التوثيق، يُنصح بمراجعته أيضًا كمرجع تكميلي.
