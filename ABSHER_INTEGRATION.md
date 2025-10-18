# Absher API Integration Documentation

## نظرة عامة

تم دمج نظام GTS Dashboard مع **Absher Business API** لاستعلامات التأمين على المركبات. يتيح هذا التكامل مزامنة بيانات المركبات تلقائياً من منصة أبشر، بما في ذلك معلومات التأمين، الفحص، والرخصة.

---

## المميزات الرئيسية

✅ **إدارة إعدادات API أبشر** - صفحة إدارة كاملة لإعدادات الاتصال
✅ **مزامنة تلقائية** - مزامنة بيانات جميع المركبات من أبشر
✅ **تتبع بيانات التأمين** - إضافة معلومات التأمين من أبشر
✅ **إشعارات ذكية** - إشعارات عند انتهاء التأمين
✅ **أمان عالي** - تشفير البيانات الحساسة وToken Caching

---

## الملفات المضافة/المعدّلة

### Backend
```
backend/
├── services/
│   └── absherService.js          # خدمة الاتصال بـ API أبشر
├── models/
│   ├── AbsherConfig.js            # نموذج إعدادات أبشر
│   └── Vehicle.js                 # تم تحديثه لإضافة حقول التأمين
├── routes/
│   └── absherRoutes.js            # API routes للتكامل مع أبشر
├── .env                           # تم إضافة إعدادات أبشر
└── server.js                      # تم إضافة route أبشر
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── absher/
│   │   │   └── AbsherIntegrationSettings.jsx  # صفحة إدارة أبشر
│   │   ├── layout/
│   │   │   └── TabNavigation.jsx              # تم إضافة تبويب أبشر
│   │   └── vehicles/
│   │       └── VehiclesContainer.jsx          # تم إضافة زر المزامنة
│   └── App.jsx                                # تم إضافة route أبشر
```

---

## إعدادات البيئة (.env)

تم إضافة المتغيرات التالية إلى `.env`:

```env
# Absher API Configuration
ABSHER_AUTHORIZATION_SERVER=https://iam.apps.devnet.elm.sa
ABSHER_REALM_NAME=tamm-QA
ABSHER_CLIENT_ID=70e8c31b
ABSHER_CLIENT_SECRET=f90e9f9e07ec345bc121f8d745a73be7
```

⚠️ **ملاحظة:** هذه البيانات مأخوذة من حساب شركتكم في منصة أبشر للأعمال.

---

## استخدام النظام

### 1. إعداد إعدادات أبشر

1. قم بتسجيل الدخول إلى النظام
2. انتقل إلى تبويب **"Absher Integration"**
3. أدخل بيانات الاتصال:
   - **رقم العميل** (Client ID): `70e8c31b`
   - **الكتلة السرية** (Client Secret): `f90e9f9e07ec345bc121f8d745a73be7`
   - **خادم المصادقة**: `https://iam.apps.devnet.elm.sa`
   - **اسم المجال** (Realm Name): `tamm-QA`
   - **معرف الربط** (Link ID): اختياري
   - **الحالة**: اختر "نشط" (Active)

4. اضغط على **"اختبار الاتصال"** للتأكد من صحة البيانات
5. اضغط على **"حفظ"** لحفظ الإعدادات

### 2. مزامنة بيانات المركبات

#### من صفحة المركبات:
1. انتقل إلى تبويب **"Vehicles"**
2. اضغط على زر **"🔄 Sync with Absher"**
3. سيتم مزامنة جميع المركبات التي لها:
   - رقم لوحة (Plate Number)
   - رقم تسلسلي (Sequence Number)

#### النتائج:
- عرض عدد المركبات التي تمت مزامنتها بنجاح
- عرض عدد المركبات التي فشلت
- إمكانية عرض تفاصيل الأخطاء

### 3. البيانات التي يتم مزامنتها

يقوم النظام بجلب وتحديث البيانات التالية من أبشر:

- ✅ رقم اللوحة (Plate Number)
- ✅ نوع التسجيل (Registration Type)
- ✅ الشركة المصنعة (Vehicle Maker)
- ✅ الموديل (Vehicle Model)
- ✅ سنة التصنيع (Model Year)
- ✅ الرقم التسلسلي (Sequence Number)
- ✅ رقم الشاسيه (Chassis Number)
- ✅ اللون الأساسي (Basic Color)
- ✅ تاريخ انتهاء الرخصة (License Expiry Date)
- ✅ تاريخ انتهاء الفحص (Inspection Expiry Date)
- ✅ رقم هوية المستخدم الفعلي (Actual Driver ID)
- ✅ اسم المستخدم الفعلي (Actual Driver Name)
- ✅ حالة الفحص (Inspection Status)
- ✅ حالة التأمين (Insurance Status)
- ✅ شركة التأمين (Insurance Company) - **جديد**
- ✅ رقم وثيقة التأمين (Insurance Policy Number) - **جديد**
- ✅ تاريخ انتهاء التأمين (Insurance Expiry Date) - **جديد**

---

## API Endpoints

### إدارة الإعدادات

#### 1. الحصول على الإعدادات الحالية
```http
GET /api/absher/config
Authorization: Bearer {token}
```

#### 2. الحصول على الإعدادات الكاملة (للتعديل)
```http
GET /api/absher/config/full
Authorization: Bearer {token}
```

#### 3. إنشاء/تحديث الإعدادات
```http
POST /api/absher/config
Authorization: Bearer {token}
Content-Type: application/json

{
  "clientId": "70e8c31b",
  "clientSecret": "f90e9f9e07ec345bc121f8d745a73be7",
  "authorizationServer": "https://iam.apps.devnet.elm.sa",
  "realmName": "tamm-QA",
  "linkId": "3f6f125a2",
  "status": "active",
  "notes": "ملاحظات اختيارية"
}
```

### اختبار الاتصال

```http
POST /api/absher/test-connection
Authorization: Bearer {token}
```

### المزامنة

#### 1. مزامنة جميع المركبات
```http
POST /api/absher/sync
Authorization: Bearer {token}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Sync complete: 5/10 vehicles updated",
  "data": {
    "total": 10,
    "successful": 5,
    "failed": 5,
    "errors": [
      {
        "plateNumber": "ABC123",
        "sequenceNumber": "12345",
        "error": "Vehicle not found in Absher system"
      }
    ],
    "updated": [
      {
        "plateNumber": "XYZ789",
        "sequenceNumber": "67890"
      }
    ]
  }
}
```

#### 2. مزامنة مركبة واحدة
```http
POST /api/absher/sync/vehicle/:id
Authorization: Bearer {token}
```

---

## نموذج البيانات

### AbsherConfig Schema

```javascript
{
  clientId: String,           // رقم العميل
  clientSecret: String,       // الكتلة السرية
  authorizationServer: String,// خادم المصادقة
  realmName: String,          // اسم المجال
  linkId: String,             // معرف الربط (اختياري)
  status: String,             // active | inactive | testing
  lastTestedAt: Date,         // تاريخ آخر اختبار
  lastSyncDate: Date,         // تاريخ آخر مزامنة
  lastTestResult: {
    success: Boolean,
    message: String,
    testedAt: Date
  },
  notes: String
}
```

### Vehicle Schema Updates

تم إضافة الحقول التالية لنموذج Vehicle:

```javascript
{
  // حقول التأمين من أبشر
  insuranceCompany: String,
  insurancePolicyNumber: String,
  insuranceExpiryDate: Date,

  // تتبع مصدر البيانات
  dataSource: String,         // 'manual' | 'absher' | 'import'
  lastSyncDate: Date
}
```

---

## الإشعارات

تم دمج نظام الإشعارات ليشمل تواريخ انتهاء التأمين:

### أنواع الإشعارات للمركبات:

1. **إشعار انتهاء الرخصة** 🚗
   - يتم إرساله قبل 10 أيام من انتهاء الرخصة

2. **إشعار موعد الفحص** 🔧
   - يتم إرساله قبل 10 أيام من موعد الفحص

3. **إشعار انتهاء التأمين** 🛡️ - **جديد**
   - يتم إرساله قبل 10 أيام من انتهاء التأمين
   - يتضمن اسم شركة التأمين إذا كان متوفراً

---

## آلية عمل الخدمة

### 1. المصادقة (Authentication)

```javascript
// absherService.js
async generateAccessToken() {
  // 1. التحقق من وجود token صالح في الـ cache
  if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
    return this.accessToken; // استخدام token من الذاكرة
  }

  // 2. طلب token جديد من أبشر
  const response = await axios.post(
    `${authorizationServer}/auth/realms/${realmName}/protocol/openid-connect/token`,
    {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials'
    }
  );

  // 3. حفظ Token في الذاكرة مع وقت انتهاء صلاحيته
  this.accessToken = response.data.access_token;
  this.tokenExpiry = new Date(Date.now() + expiresIn * 1000 - 60000);

  return this.accessToken;
}
```

### 2. استعلام بيانات المركبة

```javascript
async getVehicleInsuranceDetails(plateNumber, sequenceNumber) {
  // 1. الحصول على access token
  const token = await this.generateAccessToken();

  // 2. استدعاء API أبشر
  const response = await axios.get(
    `${authorizationServer}/api/v1/vehicles/insurance`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { plateNumber, sequenceNumber }
    }
  );

  // 3. تحويل البيانات لنموذج قاعدة البيانات
  return this.parseVehicleData(response.data);
}
```

### 3. المزامنة الدورية

```javascript
async syncAllVehicles() {
  // 1. جلب جميع المركبات من قاعدة البيانات
  const vehicles = await Vehicle.find({
    plateNumber: { $exists: true, $ne: '' },
    sequenceNumber: { $exists: true, $ne: '' }
  });

  // 2. المزامنة مع تأخير 500ms بين كل طلب (Rate limiting)
  for (const vehicle of vehicles) {
    const absherData = await this.getVehicleInsuranceDetails(
      vehicle.plateNumber,
      vehicle.sequenceNumber
    );

    // 3. تحديث بيانات المركبة
    Object.assign(vehicle, absherData);
    await vehicle.save();

    await sleep(500); // تأخير لتجنب تجاوز حد الطلبات
  }
}
```

---

## معالجة الأخطاء

### أخطاء شائعة وحلولها

#### 1. خطأ في المصادقة (401 Unauthorized)
```
❌ Failed to authenticate with Absher API
```
**الحل:**
- تحقق من صحة Client ID و Client Secret
- تأكد من أن الحساب نشط في منصة أبشر

#### 2. خطأ في الاتصال (Network Error)
```
❌ Connection timeout
```
**الحل:**
- تحقق من الاتصال بالإنترنت
- تأكد من أن Authorization Server URL صحيح

#### 3. مركبة غير موجودة (404 Not Found)
```
❌ Vehicle not found in Absher system
```
**الحل:**
- تأكد من صحة رقم اللوحة والرقم التسلسلي
- قد تكون المركبة غير مسجلة في نظام أبشر

#### 4. تجاوز حد الطلبات (429 Too Many Requests)
```
❌ Rate limit exceeded
```
**الحل:**
- الانتظار قليلاً قبل إعادة المحاولة
- النظام يتضمن تأخير تلقائي 500ms بين الطلبات

---

## الأمان

### إجراءات الأمان المطبقة:

1. **تشفير البيانات الحساسة**
   - Client Secret يتم تخزينه في قاعدة البيانات
   - عدم عرض Client Secret الكامل في API responses

2. **Token Caching**
   - Access Token يتم تخزينه في الذاكرة
   - تجديد تلقائي قبل انتهاء الصلاحية بدقيقة واحدة

3. **Authentication Required**
   - جميع endpoints تتطلب JWT token
   - فقط المستخدمين المصرح لهم يمكنهم الوصول

4. **Rate Limiting**
   - تأخير 500ms بين طلبات المزامنة
   - حماية من تجاوز حدود API أبشر

5. **Input Validation**
   - التحقق من صحة البيانات قبل إرسالها
   - تنظيف البيانات من NoSQL injection

---

## الاختبار

### 1. اختبار الاتصال

```bash
curl -X POST http://localhost:5000/api/absher/test-connection \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. اختبار المزامنة

```bash
curl -X POST http://localhost:5000/api/absher/sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. اختبار الصحة (Health Check)

```bash
curl http://localhost:5000/api/health
```

يجب أن تحصل على:
```json
{
  "status": "ok",
  "mongodb": "connected",
  "routes": {
    "absher": "/api/absher"
  }
}
```

---

## الصيانة والمراقبة

### Logs للمراقبة

النظام يسجل جميع العمليات:

```
🔄 Generating new Absher access token...
✅ Absher access token generated successfully
⏰ Token expires in 3600 seconds

🔍 Fetching insurance details for vehicle: ABC123 (12345)
✅ Successfully fetched insurance details for ABC123

🔄 Starting Absher sync for 10 vehicles...
✅ Sync complete: 8/10 successful
```

### مؤشرات الأداء

- **نسبة نجاح المزامنة**: يجب أن تكون > 90%
- **وقت الاستجابة**: يجب أن يكون < 5 ثواني لكل مركبة
- **معدل الأخطاء**: يجب أن يكون < 5%

---

## التحديثات المستقبلية

### ميزات مخطط لها:

- [ ] جدولة مزامنة تلقائية يومية
- [ ] لوحة تحكم لإحصائيات المزامنة
- [ ] تنبيهات عند فشل المزامنة
- [ ] دعم APIs أخرى من أبشر
- [ ] تصدير تقارير التأمين

---

## الدعم والمساعدة

### موارد إضافية:

- **وثائق أبشر للأعمال**: https://developers.absher.sa/
- **دعم أبشر**: support@absher.sa
- **التواصل مع فريق التطوير**: gts.development.team@gmail.com

---

## Changelog

### v1.0.0 - 2025-10-16
- ✨ إضافة تكامل كامل مع Absher Business API
- ✨ صفحة إدارة إعدادات أبشر
- ✨ زر مزامنة في صفحة المركبات
- ✨ إشعارات لانتهاء التأمين
- ✨ تتبع مصدر البيانات (manual/absher/import)
- 🔒 تحسينات أمنية (Token caching, Rate limiting)
- 📝 توثيق كامل للنظام

---

تم التطوير بواسطة فريق GTS Development Team ❤️
