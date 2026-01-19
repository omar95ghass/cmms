# دليل التثبيت والتشغيل
## Installation and Setup Guide

## المتطلبات / Requirements

- Node.js 16+ 
- PHP 7.4+
- MySQL/MariaDB
- XAMPP/WAMP (اختياري / Optional)

## خطوات التثبيت / Installation Steps

### 1. تثبيت Front-End Dependencies

```bash
npm install
```

### 2. إعداد قاعدة البيانات / Database Setup

#### أ. إنشاء قاعدة البيانات
```bash
mysql -u root -p < php/database/schema.sql
```

أو استخدم phpMyAdmin:
1. افتح phpMyAdmin
2. استورد ملف `php/database/schema.sql`

#### ب. تعديل إعدادات قاعدة البيانات

عدل ملف `php/config/database.php`:

```php
return [
    'host' => 'localhost',
    'dbname' => 'medical_management',
    'username' => 'root',      // غير هذا
    'password' => '',          // غير هذا
    'charset' => 'utf8mb4',
];
```

### 3. تشغيل المشروع / Running the Project

#### Front-End (Terminal 1)
```bash
npm run dev
```
سيتم فتح المشروع على: `http://localhost:3000`

#### Back-End (Terminal 2)

**الطريقة 1: PHP Built-in Server**
```bash
cd php
php -S localhost:8000 router.php
```

⚠️ **مهم:** يجب استخدام `router.php` وليس `-t .` لتوجيه الطلبات بشكل صحيح.

**الطريقة 2: XAMPP**
1. ضع مجلد `php` في `C:\xampp\htdocs\mms\php`
2. افتح `http://localhost/mms/php/api/` في المتصفح

**الطريقة 3: Apache Virtual Host**
قم بإعداد Virtual Host يشير إلى مجلد `php`

### 4. المستخدمين الافتراضيين / Default Users

جميع المستخدمين لديهم كلمة المرور: `password`

| Username | Role | Description |
|----------|------|-------------|
| admin | admin | مدير النظام |
| reception | reception | موظف الاستقبال |
| nurse | nurse | ممرض |
| doctor | doctor | طبيب |
| lab | laboratory | مخبري |

⚠️ **مهم جداً:** قم بتغيير كلمات المرور فوراً في بيئة الإنتاج!

## هيكل المشروع / Project Structure

```
mms/
├── src/                    # React Front-End
│   ├── components/         # المكونات المستقلة
│   ├── pages/             # الصفحات
│   ├── contexts/          # React Contexts
│   ├── services/          # API Services
│   └── i18n/              # ملفات الترجمة
├── php/                   # PHP Back-End
│   ├── api/               # API Endpoints
│   ├── controllers/       # Controllers
│   ├── models/            # Models
│   ├── services/          # Services
│   ├── middleware/        # Middleware
│   └── database/          # Database Files
└── README.md
```

## استكشاف الأخطاء / Troubleshooting

### مشكلة: لا يمكن الاتصال بـ API
- تأكد من تشغيل Back-End على المنفذ الصحيح
- تحقق من إعدادات `vite.config.js` (proxy)
- تأكد من إعدادات CORS في `php/config/config.php`

### مشكلة: خطأ في قاعدة البيانات
- تحقق من إعدادات `php/config/database.php`
- تأكد من إنشاء قاعدة البيانات
- تحقق من صلاحيات المستخدم

### مشكلة: الترجمة لا تعمل
- تأكد من تحميل ملفات الترجمة في `src/i18n/locales/`
- تحقق من إعدادات `src/i18n/config.js`

## التطوير / Development

### إضافة مكون جديد
1. أنشئ ملف في `src/components/YourComponent/YourComponent.jsx`
2. استخدم المكونات الأساسية الموجودة
3. أضف الترجمة في `src/i18n/locales/ar.json` و `en.json`

### إضافة API Endpoint جديد
1. أنشئ Controller في `php/controllers/`
2. أضف Route في `php/api/index.php`
3. أنشئ Model إذا لزم الأمر

## الإنتاج / Production

### Build Front-End
```bash
npm run build
```

### Back-End
- استخدم Apache/Nginx
- فعّل HTTPS
- قم بتعطيل `display_errors` في `php/config/config.php`
- استخدم JWT للمصادقة بدلاً من Token البسيط

## الدعم / Support

للمساعدة أو الإبلاغ عن مشاكل، يرجى فتح Issue في المستودع.
