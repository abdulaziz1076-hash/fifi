/**
 * خادم Render.com للتطبيق المالي
 * الإصدار: 2.0.0
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('.'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// دعم العربية والـ CORS
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// صفحة رئيسية محسنة
app.get('/', (req, res) => {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    
    // إضافة تحليلات (اختياري)
    const analytics = `
    <!-- Render Analytics -->
    <script>
    window.addEventListener('load', function() {
        console.log('المحاسب الشخصي - الإصدار 2.0.0');
        console.log('تم النشر على Render.com');
        
        // تسجيل إحصائيات الاستخدام (مجهول)
        fetch('/api/statistics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: 'page_view',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                path: window.location.pathname
            })
        }).catch(() => {});
    });
    </script>
    `;
    
    const modifiedHtml = html.replace('</head>', `${analytics}</head>`);
    res.send(modifiedHtml);
});

// API للتخزين (يمكن تطويره لاستخدام قاعدة بيانات)
app.post('/api/save', (req, res) => {
    try {
        const { key, data } = req.body;
        // هنا يمكن ربطه بقاعدة بيانات
        res.json({ success: true, message: 'تم الحفظ' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API للنسخ الاحتياطي
app.get('/api/backup', (req, res) => {
    res.json({
        status: 'active',
        version: '2.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// API للإحصائيات
app.post('/api/statistics', (req, res) => {
    // فقط تسجيل البيانات (يمكن تطويره)
    console.log('Statistics:', req.body);
    res.json({ received: true });
});

// جميع المسارات الأخرى ترجع index.html (لـ SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// بدء الخادم
app.listen(PORT, () => {
    console.log(`🚀 التطبيق يعمل على: http://localhost:${PORT}`);
    console.log(`📊 البيئة: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🕐 الوقت: ${new Date().toLocaleString('ar-SA')}`);
    
    // رسالة ترحيب
    console.log(`
    ========================================
        المحاسب الشخصي المتكامل
        الإصدار: 2.0.0
        النشر: Render.com
    ========================================
    `);
});

// معالجة الأخطاء
process.on('uncaughtException', (err) => {
    console.error('خطأ غير متوقع:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('وعد مرفوض:', reason);
});
