# 🚀 دليل نشر المشروع (Deployment Guide)

## 📦 بناء المشروع للإنتاج

### 1. بناء الملفات (Build)

```bash
npm run build
```

هذا الأمر سيقوم بـ:
- ✅ تحويل TypeScript إلى JavaScript
- ✅ تصغير الملفات (Minification)
- ✅ تحسين الأداء
- ✅ إنشاء مجلد `dist` يحتوي على الملفات الجاهزة

---

## 🌐 خيارات النشر

### Option 1: Vercel (الأسهل - مجاني)

1. **إنشاء حساب على Vercel**
   - اذهب إلى: https://vercel.com
   - سجل دخول باستخدام GitHub

2. **رفع المشروع**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **إعداد Environment Variables**
   - في لوحة تحكم Vercel
   - اذهب إلى Settings → Environment Variables
   - أضف:
     ```
     VITE_API_BASE_URL=https://your-api-url.com/api
     ```

4. **النشر التلقائي**
   - كل push إلى GitHub سيتم نشره تلقائياً!

---

### Option 2: Netlify (سهل - مجاني)

1. **إنشاء حساب على Netlify**
   - اذهب إلى: https://netlify.com

2. **رفع المشروع**
   - اسحب مجلد `dist` إلى Netlify
   - أو اربط GitHub repository

3. **إعداد Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

4. **Environment Variables**
   - Site settings → Environment variables
   - أضف المتغيرات المطلوبة

---

### Option 3: GitHub Pages (مجاني)

1. **تثبيت gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **تعديل package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/bloodlink",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **النشر**
   ```bash
   npm run deploy
   ```

---

### Option 4: خادم خاص (VPS/Dedicated Server)

#### مع Nginx

1. **بناء المشروع**
   ```bash
   npm run build
   ```

2. **رفع مجلد dist إلى السيرفر**
   ```bash
   scp -r dist/* user@server:/var/www/bloodlink/
   ```

3. **إعداد Nginx**
   ```nginx
   server {
       listen 80;
       server_name bloodlink.example.com;
       root /var/www/bloodlink;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript;
   }
   ```

4. **إعادة تشغيل Nginx**
   ```bash
   sudo systemctl restart nginx
   ```

---

### Option 5: Docker

1. **إنشاء Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **إنشاء nginx.conf**
   ```nginx
   server {
       listen 80;
       location / {
           root /usr/share/nginx/html;
           index index.html;
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. **بناء وتشغيل Docker**
   ```bash
   docker build -t bloodlink .
   docker run -p 80:80 bloodlink
   ```

---

## 🔒 SSL/HTTPS

### باستخدام Let's Encrypt (مجاني)

```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d bloodlink.example.com

# تجديد تلقائي
sudo certbot renew --dry-run
```

---

## ⚙️ تحسينات الأداء

### 1. تفعيل Caching
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. تفعيل Compression
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml application/javascript application/json;
```

### 3. CDN (اختياري)
- استخدم Cloudflare أو Amazon CloudFront
- لتسريع تحميل الموقع عالمياً

---

## 📊 Monitoring & Analytics

### 1. Google Analytics
أضف في `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### 2. Error Tracking
استخدم Sentry للتتبع الأخطاء:
```bash
npm install @sentry/react
```

---

## ✅ Checklist قبل النشر

- [ ] تم اختبار جميع الصفحات
- [ ] تم تحديث Environment Variables
- [ ] API مربوط ويعمل بشكل صحيح
- [ ] تم اختبار على أجهزة مختلفة
- [ ] تم تفعيل HTTPS
- [ ] تم إعداد Domain Name
- [ ] تم تفعيل Monitoring
- [ ] تم عمل Backup للبيانات

---

## 🔄 CI/CD (Continuous Deployment)

### GitHub Actions Example

إنشاء ملف `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run build
      
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 📞 الدعم

للمساعدة في النشر، تواصل مع فريق DevOps.

---

**تم بنجاح! موقعك الآن جاهز للعالم 🌍**
