# نظام الإدارة الطبية المركزي (Centralized Medical Management System)

## نظرة عامة

نظام إدارة طبية مركزي مبني على بنية حديثة، مرنة، وقابلة للتوسع. يخدم بيئة طبية متعددة الأدوار مع فصل كامل بين الواجهة الأمامية والخلفية.

## المميزات

- ✅ فصل كامل بين Front-End و Back-End
- ✅ مكونات مستقلة وقابلة لإعادة الاستخدام
- ✅ سجل أنشطة شامل
- ✅ دعم لغتين (عربي / إنجليزي) مع RTL/LTR
- ✅ صلاحيات دقيقة حسب نوع المستخدم
- ✅ ملف طبي متكامل لكل مريض
- ✅ واجهات Responsive

## التقنيات المستخدمة

### Front-End
- React 18
- Tailwind CSS
- React Router
- i18next (للترجمة)
- Axios (للتواصل مع API)

### Back-End
- PHP 7.4+
- MySQL/MariaDB
- RESTful API Architecture

## التثبيت

### متطلبات النظام
- Node.js 16+
- PHP 7.4+
- MySQL/MariaDB
- Composer (اختياري)

### خطوات التثبيت

1. **تثبيت Front-End:**
```bash
npm install
```

2. **إعداد قاعدة البيانات:**
```bash
# استيراد قاعدة البيانات
mysql -u root -p < php/database/schema.sql
```

3. **تعديل إعدادات قاعدة البيانات:**
عدل ملف `php/config/database.php` حسب إعدادات قاعدة البيانات لديك.

4. **تشغيل Front-End:**
```bash
npm run dev
```

5. **تشغيل Back-End:**
```bash
# باستخدام PHP Built-in Server
cd php
php -S localhost:8000 -t .
```

أو استخدم XAMPP/WAMP وضبط المسار إلى مجلد `php`.

## الأدوار والصلاحيات

- **موظف الاستقبال (Reception):** إدخال بيانات المريض الأساسية
- **الممرض (Nurse):** إدخال العلامات الحيوية
- **الطبيب (Doctor):** إدخال سجل الزيارات والتشخيص
- **المخبري (Laboratory):** إدخال التحاليل الطبية
- **مدير النظام (Admin):** صلاحيات كاملة

## المستخدمين الافتراضيين

جميع المستخدمين الافتراضيين لديهم كلمة المرور: `password`

- `admin` - مدير النظام
- `reception` - موظف الاستقبال
- `nurse` - ممرض
- `doctor` - طبيب
- `lab` - مخبري

**⚠️ مهم: قم بتغيير كلمات المرور فوراً في بيئة الإنتاج!**

## البنية المعمارية

```
mms/
├── src/                    # Front-End (React)
│   ├── components/         # المكونات المستقلة
│   ├── pages/             # الصفحات
│   ├── contexts/          # React Contexts
│   ├── services/          # خدمات API
│   └── i18n/              # ملفات الترجمة
├── php/                   # Back-End (PHP API)
│   ├── api/               # نقاط النهاية
│   ├── controllers/       # Controllers
│   ├── models/            # Models
│   ├── services/          # Services
│   ├── middleware/        # Middleware
│   └── database/          # قاعدة البيانات
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/verify` - التحقق من التوكن

### Patients
- `GET /api/patients` - قائمة المرضى
- `POST /api/patients` - إضافة مريض جديد
- `GET /api/patients/:id` - تفاصيل المريض
- `PUT /api/patients/:id` - تحديث بيانات المريض

### Vitals
- `POST /api/patients/:id/vitals` - إضافة علامات حيوية

### Visits
- `POST /api/patients/:id/visits` - إضافة زيارة

### Laboratory
- `POST /api/patients/:id/laboratory` - إضافة تحليل طبي
- `GET /api/laboratory/test-types` - أنواع التحاليل

### Dashboard
- `GET /api/dashboard/stats` - إحصائيات لوحة التحكم

### Activity Logs
- `GET /api/activity-logs` - سجل الأنشطة

## التطوير المستقبلي

- [ ] نظام JWT للمصادقة
- [ ] رفع الملفات (صور الهوية والشخصية)
- [ ] تصدير الملف الطبي كـ PDF
- [ ] نظام النسخ الاحتياطي التلقائي
- [ ] تطبيق Mobile
- [ ] نظام الإشعارات

## الترخيص

هذا المشروع مخصص للاستخدام الطبي والتعليمي.
