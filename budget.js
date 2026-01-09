/**
 * المحاسب الشخصي - نظام إدارة الميزانية المتقدم
 * الإصدار: 2.0.0
 * المميزات: تتبع، تحليل، تنبيهات
 */

class BudgetManager {
    constructor() {
        this.budgets = [];
        this.categories = [];
        this.loadData();
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadDefaultCategories();
        this.syncWithTransactions();
    }
    
    setupEventListeners() {
        // تحديث الميزانيات عند إضافة معاملة
        if (typeof window.transactions !== 'undefined') {
            window.addEventListener('transactionAdded', () => {
                this.syncWithTransactions();
                this.updateAllBudgets();
            });
        }
        
        // تحديث أسبوعي تلقائي
        setInterval(() => {
            this.checkExpiredBudgets();
        }, 24 * 60 * 60 * 1000); // كل 24 ساعة
    }
    
    loadDefaultCategories() {
        this.categories = [
            'الطعام والمشروبات',
            'السكن والإيجار',
            'المواصلات',
            'التسوق والملابس',
            'الترفيه',
            'الصحة والطبيب',
            'التعليم',
            'التوفير والاستثمار',
            'الفواتير والخدمات',
            'أخرى'
        ];
    }
    
    // ==================== إنشاء الميزانيات ====================
    createBudget(data) {
        const validation = this.validateBudgetData(data);
        if (!validation.valid) {
            throw new Error(validation.message);
        }
        
        const budget = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: data.name,
            amount: parseFloat(data.amount),
            period: data.period || 'monthly',
            categories: Array.isArray(data.categories) ? data.categories : [data.categories],
            startDate: data.startDate || new Date().toISOString().split('T')[0],
            endDate: this.calculateEndDate(data.period, data.startDate),
            currency: data.currency || 'SAR',
            description: data.description || '',
            color: data.color || this.generateRandomColor(),
            icon: data.icon || 'fas fa-chart-pie',
            
            // إحصائيات التتبع
            actualSpent: 0,
            remaining: parseFloat(data.amount),
            transactions: [],
            
            // التحليلات
            dailyAverage: 0,
            projectedSpend: 0,
            variance: 0,
            
            // الحالة
            status: 'active',
            alerts: [],
            isRecurring: data.isRecurring || false,
            recurrencePattern: data.recurrencePattern || null,
            
            // بيانات التعقب
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'user',
            version: 1
        };
        
        // حساب التواريخ
        budget.daysElapsed = this.calculateDaysElapsed(budget.startDate);
        budget.daysRemaining = this.calculateDaysRemaining(budget.endDate);
        budget.dailyBudget = budget.amount / (budget.daysRemaining + budget.daysElapsed);
        
        this.budgets.push(budget);
        this.saveData();
        this.updateBudgetStats(budget.id);
        
        // إرسال إشعار
        this.sendNotification('budget_created', budget);
        
        return budget;
    }
    
    validateBudgetData(data) {
        if (!data.name || data.name.trim().length < 2) {
            return { valid: false, message: 'اسم الميزانية يجب أن يكون على الأقل حرفين' };
        }
        
        if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
            return { valid: false, message: 'المبلغ يجب أن يكون رقم موجب' };
        }
        
        if (data.amount > 1000000) {
            return { valid: false, message: 'المبلغ كبير جداً' };
        }
        
        if (!data.categories || (Array.isArray(data.categories) && data.categories.length === 0)) {
            return { valid: false, message: 'يجب تحديد فئة واحدة على الأقل' };
        }
        
        if (data.period && !['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].includes(data.period)) {
            return { valid: false, message: 'فترة غير صالحة' };
        }
        
        return { valid: true };
    }
    
    calculateEndDate(period, startDate = null) {
        const start = startDate ? new Date(startDate) : new Date();
        const end = new Date(start);
        
        switch(period) {
            case 'daily':
                end.setDate(end.getDate() + 1);
                break;
            case 'weekly':
                end.setDate(end.getDate() + 7);
                break;
            case 'monthly':
                end.setMonth(end.getMonth() + 1);
                break;
            case 'quarterly':
                end.setMonth(end.getMonth() + 3);
                break;
            case 'yearly':
                end.setFullYear(end.getFullYear() + 1);
                break;
            default:
                end.setMonth(end.getMonth() + 1);
        }
        
        return end.toISOString().split('T')[0];
    }
    
    generateRandomColor() {
        const colors = [
            '#4361ee', '#3a0ca3', '#7209b7', '#f72585',
            '#4cc9f0', '#2ec4b6', '#ff9f1c', '#e71d36'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // ==================== تحديث الميزانيات ====================
    updateAllBudgets() {
        this.budgets.forEach(budget => {
            this.updateBudgetStats(budget.id);
        });
        this.saveData();
        this.checkAlerts();
    }
    
    updateBudgetStats(budgetId) {
        const budget = this.budgets.find(b => b.id === budgetId);
        if (!budget) return;
        
        // حساب المصروفات الفعلية
        budget.transactions = this.getBudgetTransactions(budget);
        budget.actualSpent = budget.transactions.reduce((sum, t) => sum + t.amount, 0);
        budget.remaining = Math.max(0, budget.amount - budget.actualSpent);
        
        // حساب المتوسط اليومي
        budget.daysElapsed = this.calculateDaysElapsed(budget.startDate);
        budget.dailyAverage = budget.daysElapsed > 0 ? budget.actualSpent / budget.daysElapsed : 0;
        
        // حساب الإنفاق المتوقع
        budget.daysRemaining = this.calculateDaysRemaining(budget.endDate);
        budget.projectedSpend = budget.dailyAverage * budget.daysRemaining;
        budget.variance = budget.remaining - budget.projectedSpend;
        
        // تحديث الحالة
        budget.status = this.determineBudgetStatus(budget);
        budget.updatedAt = new Date().toISOString();
        
        // تحديث التنبيهات
        this.updateBudgetAlerts(budget);
        
        return budget;
    }
    
    getBudgetTransactions(budget) {
        if (!window.transactions || !Array.isArray(window.transactions)) {
            return [];
        }
        
        return window.transactions.filter(transaction => {
            // التحقق من النوع والفئة
            if (transaction.type !== 'expense') return false;
            if (!budget.categories.includes(transaction.category)) return false;
            
            // التحقق من التاريخ
            const transDate = new Date(transaction.date);
            const startDate = new Date(budget.startDate);
            const endDate = new Date(budget.endDate);
            
            return transDate >= startDate && transDate <= endDate;
        });
    }
    
    calculateDaysElapsed(startDate) {
        const start = new Date(startDate);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    calculateDaysRemaining(endDate) {
        const end = new Date(endDate);
        const now = new Date();
        const diffTime = Math.abs(end - now);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    determineBudgetStatus(budget) {
        const percentage = (budget.actualSpent / budget.amount) * 100;
        const daysPercentage = (budget.daysElapsed / (budget.daysElapsed + budget.daysRemaining)) * 100;
        
        if (percentage >= 100) {
            return 'exceeded';
        } else if (percentage >= 90) {
            return 'critical';
        } else if (percentage >= 80 || (percentage > daysPercentage + 10)) {
            return 'warning';
        } else if (percentage >= 50) {
            return 'moderate';
        } else if (percentage >= 30) {
            return 'good';
        } else {
            return 'excellent';
        }
    }
    
    // ==================== نظام التنبيهات ====================
    updateBudgetAlerts(budget) {
        budget.alerts = [];
        const percentage = (budget.actualSpent / budget.amount) * 100;
        
        // تنبيه تجاوز الميزانية
        if (percentage >= 100) {
            budget.alerts.push({
                type: 'exceeded',
                message: `تم تجاوز ميزانية ${budget.name} بالكامل`,
                severity: 'high',
                timestamp: new Date().toISOString()
            });
        }
        
        // تنبيه اقتراب الانتهاء
        if (percentage >= 80 && percentage < 100) {
            budget.alerts.push({
                type: 'warning',
                message: `ميزانية ${budget.name} اقتربت من النهاية (${percentage.toFixed(1)}%)`,
                severity: 'medium',
                timestamp: new Date().toISOString()
            });
        }
        
        // تنبيه الإنفاق السريع
        if (budget.dailyAverage > budget.dailyBudget * 1.5) {
            budget.alerts.push({
                type: 'spending_fast',
                message: `إنفاقك في ${budget.name} أسرع من المعدل المخطط`,
                severity: 'medium',
                timestamp: new Date().toISOString()
            });
        }
        
        // تنبيه اقتراب نهاية الفترة
        if (budget.daysRemaining <= 3) {
            budget.alerts.push({
                type: 'period_ending',
                message: `ميزانية ${budget.name} تنتهي بعد ${budget.daysRemaining} أيام`,
                severity: 'low',
                timestamp: new Date().toISOString()
            });
        }
        
        return budget.alerts;
    }
    
    checkAlerts() {
        this.budgets.forEach(budget => {
            const alerts = this.updateBudgetAlerts(budget);
            if (alerts.length > 0 && typeof notificationManager !== 'undefined') {
                alerts.forEach(alert => {
                    notificationManager.addNotification(
                        'warning',
                        `تنبيه الميزانية: ${budget.name}`,
                        alert.message,
                        alert.severity
                    );
                });
            }
        });
    }
    
    sendNotification(type, budget) {
        if (typeof notificationManager !== 'undefined') {
            const messages = {
                'budget_created': `تم إنشاء ميزانية جديدة: ${budget.name}`,
                'budget_updated': `تم تحديث ميزانية: ${budget.name}`,
                'budget_exceeded': `تم تجاوز ميزانية: ${budget.name}`
            };
            
            notificationManager.addNotification(
                'info',
                'الميزانية',
                messages[type] || `تحديث في ميزانية ${budget.name}`,
                'normal'
            );
        }
    }
    
    // ==================== التحليلات والتقارير ====================
    getBudgetAnalytics() {
        const totalBudgets = this.budgets.length;
        const activeBudgets = this.budgets.filter(b => b.status !== 'exceeded').length;
        const totalBudgetAmount = this.budgets.reduce((sum, b) => sum + b.amount, 0);
        const totalSpent = this.budgets.reduce((sum, b) => sum + b.actualSpent, 0);
        const totalRemaining = this.budgets.reduce((sum, b) => sum + b.remaining, 0);
        
        // تحليل حسب الفئة
        const categoryAnalysis = {};
        this.budgets.forEach(budget => {
            budget.categories.forEach(category => {
                if (!categoryAnalysis[category]) {
                    categoryAnalysis[category] = {
                        totalAmount: 0,
                        totalSpent: 0,
                        count: 0
                    };
                }
                categoryAnalysis[category].totalAmount += budget.amount;
                categoryAnalysis[category].totalSpent += budget.actualSpent;
                categoryAnalysis[category].count++;
            });
        });
        
        // أداء الميزانيات
        const performance = this.budgets.map(budget => {
            const percentage = (budget.actualSpent / budget.amount) * 100;
            return {
                name: budget.name,
                percentage: percentage,
                status: budget.status,
                variance: budget.variance
            };
        }).sort((a, b) => b.percentage - a.percentage);
        
        return {
            summary: {
                totalBudgets,
                activeBudgets,
                totalBudgetAmount: parseFloat(totalBudgetAmount.toFixed(2)),
                totalSpent: parseFloat(totalSpent.toFixed(2)),
                totalRemaining: parseFloat(totalRemaining.toFixed(2)),
                utilizationRate: parseFloat((totalSpent / totalBudgetAmount * 100).toFixed(2))
            },
            categoryAnalysis,
            performance,
            recommendations: this.generateBudgetRecommendations()
        };
    }
    
    generateBudgetRecommendations() {
        const recommendations = [];
        const analytics = this.getBudgetAnalytics();
        
        // توصية إذا كان معدل الاستخدام منخفض
        if (analytics.summary.utilizationRate < 30) {
            recommendations.push({
                type: 'under_utilization',
                message: 'ميزانياتك غير مستغلة بالكامل',
                suggestion: 'فكر في تقليل الميزانيات أو إعادة توزيعها'
            });
        }
        
        // توصية إذا كان هناك ميزانيات متجاوزة
        const exceededBudgets = this.budgets.filter(b => b.status === 'exceeded');
        if (exceededBudgets.length > 0) {
            recommendations.push({
                type: 'exceeded_budgets',
                message: `لديك ${exceededBudgets.length} ميزانية متجاوزة`,
                suggestion: 'راجع الميزانيات المتجاوزة وعدّل المصروفات'
            });
        }
        
        // توصية للميزانيات ذات الإنفاق السريع
        const fastSpending = this.budgets.filter(b => b.dailyAverage > b.dailyBudget * 1.3);
        if (fastSpending.length > 0) {
            recommendations.push({
                type: 'fast_spending',
                message: 'بعض الميزانيات تنفق بسرعة أعلى من المخطط',
                suggestion: 'راقب الإنفاق في هذه الفئات عن كثب'
            });
        }
        
        return recommendations;
    }
    
    // ==================== واجهة المستخدم ====================
    displayBudgets() {
        const container = document.getElementById('budgetsContainer');
        if (!container) return;
        
        const analytics = this.getBudgetAnalytics();
        
        let html = `
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card shadow">
                        <div class="card-header bg-gradient-primary text-white">
                            <h5 class="mb-0"><i class="fas fa-chart-bar me-2"></i>ملخص الميزانيات</h5>
                        </div>
                        <div class="card-body">
                            <div class="row text-center">
                                <div class="col-md-3 mb-3">
                                    <div class="p-3 bg-primary bg-opacity-10 rounded">
                                        <h3 class="text-primary">${analytics.summary.totalBudgets}</h3>
                                        <small class="text-muted">إجمالي الميزانيات</small>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <div class="p-3 bg-success bg-opacity-10 rounded">
                                        <h3 class="text-success">${analytics.summary.activeBudgets}</h3>
                                        <small class="text-muted">ميزانيات نشطة</small>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <div class="p-3 bg-info bg-opacity-10 rounded">
                                        <h3 class="text-info">${analytics.summary.totalSpent.toFixed(2)} ر.س</h3>
                                        <small class="text-muted">إجمالي المصروف</small>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <div class="p-3 bg-warning bg-opacity-10 rounded">
                                        <h3 class="text-warning">${analytics.summary.utilizationRate}%</h3>
                                        <small class="text-muted">معدل الاستخدام</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-8">
                    <div class="card shadow mb-4">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="fas fa-list me-2"></i>ميزانياتي</h5>
                        </div>
                        <div class="card-body">
        `;
        
        if (this.budgets.length === 0) {
            html += `
                <div class="text-center py-5">
                    <i class="fas fa-chart-pie fa-4x text-muted mb-3"></i>
                    <h5 class="text-muted">لا توجد ميزانيات</h5>
                    <p class="text-muted">أنشئ ميزانيتك الأولى لتبدأ بالتخطيط</p>
                    <button class="btn btn-primary" onclick="showBudgetModal()">
                        <i class="fas fa-plus me-1"></i>إنشاء ميزانية جديدة
                    </button>
                </div>
            `;
        } else {
            this.budgets.forEach(budget => {
                const percentage = (budget.actualSpent / budget.amount) * 100;
                const statusClass = this.getStatusClass(budget.status);
                const statusText = this.getStatusText(budget.status);
                
                html += `
                    <div class="card budget-card mb-3 border-start border-5 ${statusClass.replace('bg-', 'border-')}">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div class="flex-grow-1">
                                    <div class="d-flex align-items-center mb-2">
                                        <div class="budget-icon me-3" style="color: ${budget.color};">
                                            <i class="${budget.icon} fa-2x"></i>
                                        </div>
                                        <div>
                                            <h5 class="card-title mb-0">${budget.name}</h5>
                                            <div class="text-muted small">
                                                <i class="fas fa-calendar me-1"></i>
                                                ${this.formatPeriod(budget.period)} | 
                                                ${budget.categories.join('، ')}
                                            </div>
                                        </div>
                                    </div>
                                    <p class="text-muted small mb-0">${budget.description || 'لا يوجد وصف'}</p>
                                </div>
                                <div class="text-end">
                                    <span class="badge ${statusClass} mb-2">${statusText}</span>
                                    <div class="h5 mb-0">${budget.actualSpent.toFixed(2)} / ${budget.amount.toFixed(2)} ر.س</div>
                                    <div class="small text-muted">${percentage.toFixed(1)}% مستخدم</div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <div class="d-flex justify-content-between mb-2">
                                    <small class="text-muted">التقدم</small>
                                    <small class="text-muted">${budget.daysElapsed} من ${budget.daysElapsed + budget.daysRemaining} يوم</small>
                                </div>
                                <div class="progress" style="height: 12px;">
                                    <div class="progress-bar ${this.getProgressBarClass(budget.status)}" 
                                         style="width: ${Math.min(percentage, 100)}%">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="text-center p-2 bg-light rounded mb-2">
                                        <small class="text-muted d-block">المتبقي</small>
                                        <strong class="text-success">${budget.remaining.toFixed(2)} ر.س</strong>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="text-center p-2 bg-light rounded mb-2">
                                        <small class="text-muted d-block">المتوسط اليومي</small>
                                        <strong class="text-primary">${budget.dailyAverage.toFixed(2)} ر.س</strong>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="text-center p-2 bg-light rounded mb-2">
                                        <small class="text-muted d-block">الأيام المتبقية</small>
                                        <strong class="text-warning">${budget.daysRemaining} يوم</strong>
                                    </div>
                                </div>
                            </div>
                            
                            ${budget.alerts && budget.alerts.length > 0 ? `
                                <div class="mt-3">
                                    ${budget.alerts.slice(0, 2).map(alert => `
                                        <div class="alert alert-${alert.severity === 'high' ? 'danger' : 'warning'} py-2 mb-2">
                                            <small><i class="fas fa-exclamation-triangle me-1"></i>${alert.message}</small>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                            
                            <div class="mt-3 d-flex justify-content-between">
                                <div>
                                    <button class="btn btn-sm btn-outline-primary" onclick="editBudget(${budget.id})">
                                        <i class="fas fa-edit me-1"></i>تعديل
                                    </button>
                                    <button class="btn btn-sm btn-outline-info ms-2" onclick="viewBudgetDetails(${budget.id})">
                                        <i class="fas fa-chart-line me-1"></i>تفاصيل
                                    </button>
                                </div>
                                <div>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteBudget(${budget.id})">
                                        <i class="fas fa-trash me-1"></i>حذف
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        html += `
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="card shadow mb-4">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="fas fa-lightbulb me-2"></i>التوصيات</h5>
                        </div>
                        <div class="card-body">
                            ${analytics.recommendations.length > 0 ? 
                                analytics.recommendations.map(rec => `
                                    <div class="alert alert-info py-2 mb-2">
                                        <small>
                                            <i class="fas fa-info-circle me-1"></i>
                                            <strong>${rec.message}</strong><br>
                                            ${rec.suggestion}
                                        </small>
                                    </div>
                                `).join('') :
                                '<p class="text-center text-muted">كل شيء على ما يرام!</p>'
                            }
                        </div>
                    </div>
                    
                    <div class="card shadow">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="fas fa-plus-circle me-2"></i>إنشاء ميزانية جديدة</h5>
                        </div>
                        <div class="card-body">
                            <button class="btn btn-primary w-100 mb-3" onclick="showBudgetModal()">
                                <i class="fas fa-plus me-1"></i>ميزانية جديدة
                            </button>
                            <button class="btn btn-outline-primary w-100" onclick="showQuickBudgetWizard()">
                                <i class="fas fa-magic me-1"></i>معالج سريع
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    getStatusClass(status) {
        const classes = {
            'excellent': 'bg-success',
            'good': 'bg-info',
            'moderate': 'bg-primary',
            'warning': 'bg-warning',
            'critical': 'bg-danger',
            'exceeded': 'bg-dark'
        };
        return classes[status] || 'bg-secondary';
    }
    
    getStatusText(status) {
        const texts = {
            'excellent': 'ممتاز',
            'good': 'جيد',
            'moderate': 'متوسط',
            'warning': 'تحذير',
            'critical': 'حرج',
            'exceeded': 'تجاوز'
        };
        return texts[status] || status;
    }
    
    getProgressBarClass(status) {
        const classes = {
            'excellent': 'bg-success',
            'good': 'bg-info',
            'moderate': 'bg-primary',
            'warning': 'bg-warning',
            'critical': 'bg-danger',
            'exceeded': 'bg-dark'
        };
        return classes[status] || 'bg-secondary';
    }
    
    formatPeriod(period) {
        const periods = {
            'daily': 'يومي',
            'weekly': 'أسبوعي',
            'monthly': 'شهري',
            'quarterly': 'ربع سنوي',
            'yearly': 'سنوي'
        };
        return periods[period] || period;
    }
    
    // ==================== إدارة البيانات ====================
    syncWithTransactions() {
        if (window.transactions && Array.isArray(window.transactions)) {
            this.updateAllBudgets();
        }
    }
    
    checkExpiredBudgets() {
        const now = new Date();
        this.budgets.forEach(budget => {
            const endDate = new Date(budget.endDate);
            if (endDate < now && budget.status !== 'exceeded') {
                budget.status = 'expired';
                this.updateBudgetStats(budget.id);
            }
        });
        this.saveData();
    }
    
    loadData() {
        const saved = localStorage.getItem('budgets');
        if (saved) {
            try {
                this.budgets = JSON.parse(saved);
                // تحديث الميزانيات المحملة
                this.budgets.forEach(budget => {
                    this.updateBudgetStats(budget.id);
                });
            } catch (error) {
                console.error('Error loading budgets:', error);
                this.budgets = [];
            }
        }
    }
    
    saveData() {
        localStorage.setItem('budgets', JSON.stringify(this.budgets));
    }
    
    // ==================== عمليات CRUD ====================
    getBudget(id) {
        return this.budgets.find(b => b.id === id);
    }
    
    updateBudget(id, updates) {
        const budget = this.getBudget(id);
        if (!budget) return null;
        
        Object.assign(budget, updates);
        budget.updatedAt = new Date().toISOString();
        budget.version++;
        
        this.updateBudgetStats(id);
        this.saveData();
        
        this.sendNotification('budget_updated', budget);
        return budget;
    }
    
    deleteBudget(id) {
        const index = this.budgets.findIndex(b => b.id === id);
        if (index !== -1) {
            const deleted = this.budgets.splice(index, 1)[0];
            this.saveData();
            return deleted;
        }
        return null;
    }
    
    duplicateBudget(id) {
        const original = this.getBudget(id);
        if (!original) return null;
        
        const duplicate = {
            ...original,
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: `${original.name} (نسخة)`,
            actualSpent: 0,
            remaining: original.amount,
            transactions: [],
            alerts: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1
        };
        
        this.budgets.push(duplicate);
        this.saveData();
        return duplicate;
    }
    
    // ==================== الاستيراد والتصدير ====================
    exportBudgets() {
        const data = {
            budgets: this.budgets,
            exportDate: new Date().toISOString(),
            version: '2.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `الميزانيات_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return data;
    }
    
    importBudgets(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            if (data.budgets && Array.isArray(data.budgets)) {
                data.budgets.forEach(budget => {
                    budget.id = Date.now() + Math.floor(Math.random() * 1000);
                    budget.createdAt = new Date().toISOString();
                    budget.updatedAt = new Date().toISOString();
                    this.budgets.push(budget);
                });
                
                this.saveData();
                return { success: true, count: data.budgets.length };
            }
            
            return { success: false, error: 'تنسيق غير صالح' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// ==================== التهيئة العالمية ====================
const budgetManager = new BudgetManager();

// الدوال العامة
window.showBudgetSection = function() {
    showSection('budgetPlanner');
    setTimeout(() => budgetManager.displayBudgets(), 100);
};

window.showBudgetModal = function() {
    // تنفيذ نموذج إنشاء الميزانية
    alert('نموذج إنشاء الميزانية سيظهر هنا');
};

window.editBudget = function(id) {
    const budget = budgetManager.getBudget(id);
    if (budget) {
        // تنفيذ نموذج التعديل
        alert(`تعديل الميزانية: ${budget.name}`);
    }
};

window.deleteBudget = function(id) {
    if (confirm('هل أنت متأكد من حذف هذه الميزانية؟')) {
        const deleted = budgetManager.deleteBudget(id);
        if (deleted) {
            budgetManager.displayBudgets();
            alert('تم حذف الميزانية بنجاح');
        }
    }
};

window.viewBudgetDetails = function(id) {
    const budget = budgetManager.getBudget(id);
    if (budget) {
        // عرض تفاصيل الميزانية
        const details = `
            اسم الميزانية: ${budget.name}
            المبلغ: ${budget.amount} ر.س
            المصروف: ${budget.actualSpent} ر.س
            المتبقي: ${budget.remaining} ر.س
            الحالة: ${budgetManager.getStatusText(budget.status)}
        `;
        alert(details);
    }
};

// التصدير للاستخدام في ملفات أخرى
window.budgetManager = budgetManager;

console.log('✅ Budget Manager loaded successfully');
