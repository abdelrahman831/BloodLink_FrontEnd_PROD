# 🩸 BloodLink - نظام إدارة بنوك الدم

نظام شامل لإدارة بنوك الدم والمستشفيات والحملات التبرعية.

## 📋 المتطلبات الأساسية

قبل البدء، تأكد من تثبيت البرامج التالية على جهازك:

- **Node.js** (الإصدار 18 أو أحدث)
  - تحميل من: https://nodejs.org/
  - للتحقق من التثبيت: افتح Terminal واكتب `node --version`

- **npm** أو **yarn** (يأتي مع Node.js)
  - للتحقق: `npm --version`

- **Git** (اختياري - لتحميل الكود)
  - تحميل من: https://git-scm.com/

---

## 🚀 خطوات التشغيل (خطوة بخطوة)

### 1️⃣ تحميل الكود

**الطريقة الأولى: إذا كان عندك Git**
```bash
git clone <repository-url>
cd bloodlink
```

**الطريقة الثانية: تحميل ZIP**
1. حمل الملف المضغوط (ZIP) من المشروع
2. فك الضغط في مجلد على جهازك
3. افتح Terminal/Command Prompt في المجلد

---

### 2️⃣ تثبيت المكتبات

في Terminal، اكتب:

```bash
npm install
```

هذا الأمر سيقوم بتحميل جميع المكتبات المطلوبة (React, TailwindCSS, Recharts, Leaflet, إلخ)

⏱️ قد يستغرق 2-5 دقائق حسب سرعة الإنترنت

---

### 3️⃣ إعداد ملف البيئة (Environment Variables)

1. انسخ ملف `.env.example` وغير اسمه إلى `.env`
2. افتح ملف `.env` وعدل القيم:

```env
# عنوان API الخاص بالباك إند
VITE_API_BASE_URL=http://localhost:5000/api

# إذا كنت تستخدم Mapbox للخرائط (اختياري)
VITE_MAPBOX_TOKEN=your_token_here
```

**ملاحظة مهمة:** 
- إذا لم يكن عندك API جاهز بعد، اترك القيم كما هي
- النظام سيعمل بالبيانات التجريبية (Mock Data)

---

### 4️⃣ تشغيل المشروع

```bash
npm run dev
```

✅ سيظهر لك رسالة مثل:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### 5️⃣ فتح الموقع في المتصفح

1. افتح المتصفح (Chrome, Firefox, Edge)
2. اذهب إلى: **http://localhost:5173/**
3. سيفتح الموقع مباشرة! 🎉

---

## 🔗 ربط المشروع مع API

### هيكل API المطلوب

يجب أن يكون الـ Backend API جاهز بالـ Endpoints التالية:

#### 1. Dashboard
```
GET  /api/dashboard/stats
GET  /api/dashboard/consumption
GET  /api/dashboard/donations/weekly
GET  /api/dashboard/hospitals
```

#### 2. Blood Inventory
```
GET  /api/inventory
GET  /api/inventory/:bloodType
PUT  /api/inventory/:bloodType
```

#### 3. Hospitals & Requests
```
GET  /api/hospitals
GET  /api/hospitals/requests
POST /api/hospitals/requests/:id/approve
POST /api/hospitals/requests/:id/reject
```

#### 4. Campaigns
```
GET    /api/campaigns
POST   /api/campaigns
GET    /api/campaigns/:id
PUT    /api/campaigns/:id
DELETE /api/campaigns/:id
```

#### 5. Transfers
```
GET   /api/transfers
POST  /api/transfers
PATCH /api/transfers/:id/status
```

#### 6. Analytics
```
GET /api/analytics/monthly
GET /api/analytics/blood-types
GET /api/analytics/donors/age-groups
GET /api/analytics/export
```

#### 7. Authentication
```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

---

### مثال على استخدام API في الكود

الكود موجود في `/services/api.ts` ويمكن استخدامه كالتالي:

```typescript
import { dashboardAPI, inventoryAPI } from './services/api';

// مثال: جلب إحصائيات Dashboard
const stats = await dashboardAPI.getStats();

// مثال: تحديث المخزون
await inventoryAPI.update('A+', { units: 500 });
```

---

## 📁 هيكل المشروع

```
bloodlink/
├── App.tsx                 # الملف الرئيسي
├── components/            # جميع المكونات
│   ├── DashboardOverview.tsx
│   ├── BloodInventory.tsx
│   ├── HospitalsRequests.tsx
│   ├── DonationsCampaigns.tsx
│   ├── TransfersLogistics.tsx
│   ├── AnalyticsReports.tsx
│   ├── SettingsPage.tsx
│   ├── TechnicalSpecs.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── ui/               # مكونات UI جاهزة
├── services/
│   └── api.ts            # جميع API calls
├── styles/
│   └── globals.css       # التنسيقات العامة
├── .env                  # إعدادات البيئة (لا ترفعه على Git)
├── .env.example          # مثال لملف البيئة
└── package.json          # قائمة المكتبات
```

---

## 🛠️ أوامر مفيدة

```bash
# تشغيل المشروع في بيئة التطوير
npm run dev

# بناء المشروع للإنتاج (Production)
npm run build

# معاينة النسخة النهائية
npm run preview

# تثبيت مكتبة جديدة
npm install <package-name>
```

---

## 🎨 التقنيات المستخدمة

- **React 18** - المكتبة الأساسية
- **TypeScript** - للكتابة بأمان
- **Tailwind CSS v4** - للتنسيقات
- **Recharts** - للرسوم البيانية
- **Leaflet.js** - للخرائط التفاعلية
- **Lucide React** - للأيقونات
- **Shadcn/ui** - مكتبة مكونات UI

---

## 🔐 المصادقة (Authentication)

عند ربط API حقيقي:

1. المستخدم يدخل Email و Password
2. يتم إرسال POST request إلى `/api/auth/login`
3. الـ Backend يرجع `token`
4. يتم حفظ الـ Token في `localStorage`
5. كل API call بعد كذا يرسل الـ Token في الـ Headers:
   ```
   Authorization: Bearer <token>
   ```

---

## 📱 Responsive Design

الموقع يعمل على جميع الأجهزة:
- 💻 Desktop
- 📱 Mobile
- 📱 Tablet

---

## 🐛 حل المشاكل الشائعة

### المشكلة: `npm: command not found`
**الحل:** قم بتثبيت Node.js من الموقع الرسمي

### المشكلة: `Port 5173 is already in use`
**الحل:** أغلق أي برنامج يستخدم نفس المنفذ أو غير المنفذ:
```bash
npm run dev -- --port 3000
```

### المشكلة: الخريطة لا تظهر
**الحل:** تأكد من الاتصال بالإنترنت (Leaflet يحمل الخرائط من OpenStreetMap)

### المشكلة: API Errors
**الحل:** 
1. تأكد من أن Backend يعمل
2. تحقق من `VITE_API_BASE_URL` في ملف `.env`
3. تحقق من Console في المتصفح (F12)

---

## 📞 الدعم الفني

إذا واجهت أي مشكلة:
1. افتح Developer Console في المتصفح (اضغط F12)
2. تحقق من رسائل الأخطاء
3. تأكد من تثبيت جميع المكتبات بشكل صحيح

---

## 📄 الترخيص

هذا المشروع مملوك لوزارة الصحة - مصر

النسخة: v2.5.1
آخر تحديث: أكتوبر 2025

---

## ✅ Checklist قبل النشر

- [ ] تم تثبيت Node.js
- [ ] تم تشغيل `npm install`
- [ ] تم إنشاء ملف `.env`
- [ ] تم تشغيل `npm run dev`
- [ ] الموقع يفتح على المتصفح
- [ ] Backend API جاهز ومربوط
- [ ] تم اختبار جميع الصفحات

---

🎉 **مبروك! موقعك جاهز للتشغيل**

للتواصل أو الاستفسارات، تواصل مع فريق التطوير.
