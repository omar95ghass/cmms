# دليل استخدام Postman مع API
## Postman Guide for API Testing

## ⚠️ ملاحظة مهمة
`/patients/new` هي صفحة React (Front-End) وليست API endpoint. 
Postman يحتاج إلى استخدام API endpoints التي تبدأ بـ `/api`.

## النهايات الصحيحة (Correct Endpoints)

### 🔹 Base URL
- **Back-End مباشر:** `http://localhost:8000/api`
- **عبر Vite Proxy:** `http://localhost:3000/api` (يتم التوجيه تلقائياً إلى 8000)

---

## 📋 نهايات API للمرضى (Patients Endpoints)

### 1. تسجيل الدخول (Login)
```
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJ1c2VyX2lkIjoxLCJleHAiOjE2NzM4...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

---

### 2. إضافة مريض جديد (Create Patient)
```
POST http://localhost:8000/api/patients
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "first_name": "أحمد",
  "last_name": "محمد",
  "date_of_birth": "1990-05-15",
  "gender": "male",
  "phone": "0501234567",
  "email": "ahmed@example.com",
  "address": "الرياض",
  "id_number": "1234567890"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": {
    "id": 1,
    "patient_id": "PATABC123",
    "first_name": "أحمد",
    "last_name": "محمد",
    "full_name": "أحمد محمد",
    "date_of_birth": "1990-05-15",
    "gender": "male",
    "phone": "0501234567",
    "email": "ahmed@example.com",
    "address": "الرياض",
    "id_number": "1234567890",
    "created_at": "2024-01-15 10:30:00"
  }
}
```

---

### 3. الحصول على قائمة المرضى (Get All Patients)
```
GET http://localhost:8000/api/patients
Authorization: Bearer YOUR_TOKEN_HERE
```

**مع البحث:**
```
GET http://localhost:8000/api/patients?search=أحمد
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 4. الحصول على مريض محدد (Get Patient by ID)
```
GET http://localhost:8000/api/patients/1
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 5. تحديث مريض (Update Patient)
```
PUT http://localhost:8000/api/patients/1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "phone": "0509876543",
  "address": "جدة"
}
```

---

## 🔐 كيفية الحصول على Token

### الخطوة 1: تسجيل الدخول
استخدم endpoint `/api/auth/login` للحصول على token:

```http
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

### الخطوة 2: نسخ Token
انسخ `token` من الاستجابة.

### الخطوة 3: استخدام Token
في جميع الطلبات اللاحقة، أضف header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📝 إعداد Postman Collection

### 1. إنشاء Environment Variable
- **Variable Name:** `base_url`
- **Initial Value:** `http://localhost:8000/api`
- **Current Value:** `http://localhost:8000/api`

### 2. إنشاء Variable للـ Token
- **Variable Name:** `token`
- **Initial Value:** (فارغ)
- **Current Value:** (سيتم تعيينه بعد login)

### 3. إعداد Pre-request Script للـ Token
في كل request تحتاج auth، أضف في **Pre-request Script**:
```javascript
// Auto-set token from environment
if (pm.environment.get("token")) {
    pm.request.headers.add({
        key: 'Authorization',
        value: 'Bearer ' + pm.environment.get("token")
    });
}
```

### 4. Save Token بعد Login
في **Tests** tab لـ Login request:
```javascript
var jsonData = pm.response.json();
if (jsonData.token) {
    pm.environment.set("token", jsonData.token);
    console.log("Token saved to environment");
}
```

---

## 🧪 أمثلة على الطلبات

### مثال 1: إنشاء مريض جديد
```http
POST {{base_url}}/patients
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "first_name": "سارة",
  "last_name": "أحمد",
  "date_of_birth": "1995-03-20",
  "gender": "female",
  "phone": "0507654321",
  "email": "sara@example.com"
}
```

### مثال 2: البحث عن مرضى
```http
GET {{base_url}}/patients?search=سارة
Authorization: Bearer {{token}}
```

### مثال 3: تحديث مريض
```http
PUT {{base_url}}/patients/1
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "email": "newemail@example.com",
  "phone": "0509999999"
}
```

---

## ❌ الأخطاء الشائعة

### 1. استخدام Front-End Routes في Postman
❌ **خطأ:** `http://localhost:3000/patients/new`
✅ **صحيح:** `http://localhost:8000/api/patients` (POST)

### 2. نسيان Authorization Header
❌ **خطأ:** إرسال request بدون token
✅ **صحيح:** إضافة `Authorization: Bearer YOUR_TOKEN`

### 3. استخدام Port 3000 للـ API مباشرة
❌ **خطأ:** `http://localhost:3000/api/patients` (قد لا يعمل مباشرة في Postman)
✅ **صحيح:** `http://localhost:8000/api/patients` (Back-End مباشر)

---

## 🔍 اختبار سريع

### Test 1: التحقق من أن API يعمل
```http
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

إذا حصلت على token، فـ API يعمل بشكل صحيح! ✅

---

## 📚 روابط مفيدة
- جميع النهايات: `php/API_DOCUMENTATION.md`
- إعداد المشروع: `SETUP.md`
