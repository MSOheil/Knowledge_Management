# راهنمای استقرار و پابلیش سامانه جامع مدیریت دانش (Deployment & Publish Guide)

پکیج کامل پابلیش و انتشار سامانه در پوشه `publish/` با موفقیت تولید شد. این پکیج شامل کدهای بهینه‌سازی‌شده نهایی (Production Build) فرانت‌اند و فایل اجرایی JAR بک‌اند به همراه فایل‌های کانفیگ و اسکریپت‌های راه‌اندازی است.

---

## 📁 ساختار محتویات پوشه `publish/`

```text
publish/
├── backend/
│   ├── knowledge-management.jar     # فایل اجرایی کامل Spring Boot
│   ├── application.properties       # تنظیمات پروداکشن (دیتابیس، پورت و امنیتی)
│   ├── start-backend.bat            # اسکریپت اجرای بک‌اند در ویندوز
│   ├── start-backend.sh             # اسکریپت اجرای بک‌اند در لینوکس
│   └── knowledge-management.service # فایل سرویس Systemd جهت اجرای خودکار در لینوکس
├── frontend/
│   └── browser/                     # فایل‌های استاتیک کامپایل‌شده Angular
└── nginx/
    └── km-nginx.conf                # فایل تنظیمات Reverse Proxy وب‌سرور Nginx
```

---

## 🚀 روش ۱: استقرار روی سرور لینوکس (توصیه شده برای سرور اصلی)

### مرحله ۱: پیش‌نیازهای سرور
روی سرور لینوکس (مانند Ubuntu 22.04 / 24.04)، بسته‌های زیر را نصب کنید:
```bash
sudo apt update
sudo apt install -y openjdk-21-jre-headless nginx postgresql postgresql-contrib
```

### مرحله ۲: راه‌اندازی دیتابیس PostgreSQL
```bash
sudo -u postgres psql
```
داخل محیط psql دستورات زیر را اجرا کنید:
```sql
CREATE DATABASE demo WITH ENCODING 'UTF8';
ALTER USER postgres WITH PASSWORD 'postgres'; -- یا رمز دلخواه خودتان
\q
```

### مرحله ۳: انتقال فایل‌های پابلیش
پوشه `publish` را به مسیر `/var/www/km` روی سرور منتقل کنید (از طریق WinSCP، FileZilla یا SCP):
- مسیر بک‌اند: `/var/www/km/backend/`
- مسیر فرانت‌اند: `/var/www/km/frontend/browser/`

مجوزهای دسترسی را تنظیم کنید:
```bash
sudo chmod +x /var/www/km/backend/start-backend.sh
sudo chmod 755 -R /var/www/km/frontend/browser
```

### مرحله ۴: تنظیم دیتابیس در بک‌اند
فایل `/var/www/km/backend/application.properties` را باز کرده و در صورت نیاز نام کاربری یا رمز دیتابیس را تنظیم کنید:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/demo?characterEncoding=UTF-8
spring.datasource.username=postgres
spring.datasource.password=postgres
```

### مرحله ۵: راه‌اندازی سرویس بک‌اند با Systemd
فایل سرویس را در مسیر سیستم‌دی کپی و فعال کنید:
```bash
sudo cp /var/www/km/backend/knowledge-management.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable knowledge-management
sudo systemctl start knowledge-management
```
بررسی وضعیت اجرا:
```bash
sudo systemctl status knowledge-management
```

### مرحله ۶: تنظیم Nginx
فایل کانفیگ Nginx را کپی و فعال کنید:
```bash
sudo cp /var/www/km/nginx/km-nginx.conf /etc/nginx/sites-available/km
sudo ln -s /etc/nginx/sites-available/km /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```
اکنون سامانه با باز کردن IP سرور روی پورت ۸۰ (HTTP) در دسترس خواهد بود.

---

## 💻 روش ۲: اجرای سریع در محیط ویندوز (Local یا Windows Server)

1. مطمئن شوید **Java 21** و سرویس **PostgreSQL** با دیتابیس `demo` روی سیستم فعال است.
2. وارد پوشه `publish\backend` شوید و روی فایل `start-backend.bat` کلیک کنید.
   بک‌اند روی پورت **8080** بالا می‌آید.
3. فایل‌های پوشه `publish\frontend\browser` را می‌توانید با هر وب‌سروری مانند Nginx for Windows، IIS یا حتی یک وب‌سرور سبک سرو کنید.

---

## 🔄 اسکریپت بیلد و پابلیش مجدد (One-Click Rebuild)

هر زمان که در کدهای فرانت‌اند یا بک‌اند تغییراتی ایجاد کردید، برای به‌روزرسانی محتویات پوشه `publish` کافیست یکی از اسکریپت‌های زیر را در ریشه پروژه اجرا کنید:
- در محیط Command Prompt ویندوز:  
  `build-publish.bat`
- در محیط PowerShell:  
  `.\build-publish.ps1`
