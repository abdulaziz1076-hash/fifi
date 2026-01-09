/**
 * المحاسب الشخصي - نظام إدارة الأهداف المالية المتقدم
 * الإصدار: 2.0.0
 * المميزات: تتبع، تحفيز، إشعارات
 */

class GoalsManager {
    constructor() {
        this.goals = [];
        this.categories = [];
        this.milestones = new Map();
        this.loadData();
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadDefaultCategories();
        this.checkGoalProgress();
    }
    
    setupEventListeners() {
        // تحديث التقدم عند إضافة معاملة
        if (typeof window.transactions !== 'undefined') {
            window.addEventListener('transactionAdded', () => {
                this.checkGoalProgress();
            });
        }
        
        // التحقق اليومي للأهداف
        setInterval(() => {
            this.checkDailyProgress();
        }, 24 * 60 * 60 * 1000);
    }
    
    loadDefaultCategories() {
        this.categories = [
            'توفير الطوارئ',
            'شراء منزل',
            'شراء سيارة',
            'التعليم',
            'التقاعد',
            'السفر',
            'الزفاف',
            'الاستثمار',
            'بدء عمل',
            'صحة وعافية',
            'تطوير شخصي',
            'أخرى'
        ];
    }
    
    // ==================== إنشاء الأهداف ====================
    createGoal(data) {
        const validation = this.validateGoalData(data);
        if (!validation.valid) {
            throw new Error(validation.message);
        }
        
        const goal = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            title: data.title,
            description: data.description || '',
            targetAmount: parseFloat(data.targetAmount),
            currentAmount: parseFloat(data.initialAmount || 0),
            currency: data.currency || 'SAR',
            category: data.category || 'أخرى',
            priority: data.priority || 'medium',
            type: data.type || 'saving',
            
            // التواريخ
            startDate: data.startDate || new Date().toISOString().split('T')[0],
            deadline: data.deadline,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            
            // التقدم
            progress: 0,
            daysElapsed: 0,
            daysRemaining: 0,
            dailyRequired: 0,
            
            // التحفيز
            motivation: data.motivation || '',
            reward: data.reward || '',
            image: data.image || '',
            color: data.color || this.generateRandomColor(),
            icon: data.icon || 'fas fa-bullseye',
            
            // الإشعارات
            notifications: {
                weekly: data.notifications?.weekly || true,
                milestone: data.notifications?.milestone || true,
                deadline: data.notifications?.deadline || true
            },
            
            // المعاملات المرتبطة
            transactions: [],
            
            // المعالم (Milestones)
            milestones: this.generateMilestones(data.targetAmount, data.deadline),
            
            // الحالة
            status: 'active',
            isPublic: data.isPublic || false,
            sharedWith: data.sharedWith || [],
            tags: data.tags || [],
            
            // الإحصائيات
            contributions: [],
            lastContribution: null,
            streak: 0,
            version: 1
        };
        
        // حساب الإحصائيات الأولية
        this.calculateGoalStats(goal);
        
        this.goals.push(goal);
        this.saveData();
        
        // إنشاء إشعار
        this.sendNotification('goal_created', goal);
        
        return goal;
    }
    
    validateGoalData(data) {
        if (!data.title || data.title.trim().length < 2) {
            return { valid: false, message: 'عنوان الهدف يجب أن يكون على الأقل حرفين' };
        }
        
        if (!data.targetAmount || isNaN(data.targetAmount) || data.targetAmount <= 0) {
            return { valid: false, message: 'المبلغ المستهدف يجب أن يكون رقم موجب' };
        }
        
        if (data.deadline) {
            const deadline = new Date(data.deadline);
            const today = new Date();
            if (deadline <= today) {
                return { valid: false, message: 'تاريخ الانتهاء يجب أن يكون في المستقبل' };
            }
        }
        
        if (data.initialAmount && (data.initialAmount > data.targetAmount)) {
            return { valid: false, message: 'المبلغ المبدئي لا يمكن أن يكون أكبر من المبلغ المستهدف' };
        }
        
        return { valid: true };
    }
    
    generateRandomColor() {
        const colors = [
            '#4361ee', '#3a0ca3', '#7209b7', '#f72585',
            '#4cc9f0', '#2ec4b6', '#ff9f1c', '#e71d36'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    generateMilestones(targetAmount, deadline) {
        const milestones = [];
        const percentages = [25, 50, 75, 100];
        
        percentages.forEach(percentage => {
            const amount = (targetAmount * percentage) / 100;
            milestones.push({
                percentage: percentage,
                amount: parseFloat(amount.toFixed(2)),
                achieved: false,
                achievedAt: null,
                reward: `وصول إلى ${percentage}% من الهدف`
            });
        });
        
        return milestones;
    }
    
    // ==================== تحديث الأهداف ====================
    calculateGoalStats(goal) {
        const now = new Date();
        const startDate = new Date(goal.startDate);
        const deadline = new Date(goal.deadline);
        
        // حساب التقدم
        goal.progress = goal.targetAmount > 0 ? 
            (goal.currentAmount / goal.targetAmount) * 100 : 0;
        
        // حساب الأيام
        goal.daysElapsed = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
        goal.daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        
        // حساب المبلغ المطلوب يومياً
        const amountNeeded = goal.targetAmount - goal.currentAmount;
        goal.dailyRequired = goal.daysRemaining > 0 ? 
            amountNeeded / goal.daysRemaining : amountNeeded;
        
        // تحديث الحالة
        goal.status = this.determineGoalStatus(goal);
        
        // تحديث المعالم
        this.updateMilestones(goal);
        
        // تحديث تاريخ التحديث
        goal.updatedAt = new Date().toISOString();
        
        return goal;
    }
    
    determineGoalStatus(goal) {
        const now = new Date();
        const deadline = new Date(goal.deadline);
        
        if (goal.progress >= 100) {
            return 'achieved';
        }
        
        if (deadline < now) {
            return 'expired';
        }
        
        const daysPercentage = (goal.daysElapsed / (goal.daysElapsed + goal.daysRemaining)) * 100;
        
        if (goal.progress < daysPercentage - 20) {
            return 'behind';
        }
        
        if (goal.progress > daysPercentage + 20) {
            return 'ahead';
        }
        
        if (goal.daysRemaining <= 7 && goal.progress < 100) {
            return 'urgent';
        }
        
        if (goal.progress >= 80) {
            return 'near_completion';
        }
        
        if (goal.progress >= 50) {
            return 'good_progress';
        }
        
        if (goal.progress >= 25) {
            return 'started';
        }
        
        return 'new';
    }
    
    updateMilestones(goal) {
        goal.milestones.forEach(milestone => {
            if (!milestone.achieved && goal.progress >= milestone.percentage) {
                milestone.achieved = true;
                milestone.achievedAt = new Date().toISOString();
                
                // إرسال إشعار بإنجاز المعلم
                this.sendNotification('milestone_achieved', {
                    goal: goal,
                    milestone: milestone
                });
            }
        });
    }
    
    // ==================== المساهمات في الأهداف ====================
    addContribution(goalId, amount, description = '') {
        const goal = this.getGoal(goalId);
        if (!goal) return null;
        
        const contribution = {
            id: Date.now(),
            amount: parseFloat(amount),
            description: description,
            date: new Date().toISOString(),
            type: 'manual'
        };
        
        goal.currentAmount += contribution.amount;
        goal.contributions.unshift(contribution);
        goal.lastContribution = contribution.date;
        
        // تحديث التسلسل (streak)
        this.updateStreak(goal);
        
        // تحديث الإحصائيات
        this.calculateGoalStats(goal);
        this.saveData();
        
        // إرسال إشعار
        this.sendNotification('contribution_added', {
            goal: goal,
            contribution: contribution
        });
        
        return contribution;
    }
    
    updateStreak(goal) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const lastContributionDate = goal.lastContribution ? 
            goal.lastContribution.split('T')[0] : null;
        
        if (lastContributionDate === today) {
            // تمت المساهمة اليوم بالفعل
            return;
        }
        
        if (lastContributionDate === yesterday) {
            goal.streak++;
        } else {
            goal.streak = 1;
        }
    }
    
    linkTransaction(goalId, transactionId) {
        const goal = this.getGoal(goalId);
        const transaction = window.transactions?.find(t => t.id === transactionId);
        
        if (!goal || !transaction) return null;
        
        const contribution = {
            id: transaction.id,
            amount: transaction.amount,
            description: transaction.name,
            date: transaction.date,
            type: 'transaction',
            transactionId: transaction.id
        };
        
        goal.currentAmount += contribution.amount;
        goal.contributions.unshift(contribution);
        
        this.calculateGoalStats(goal);
        this.saveData();
        
        return contribution;
    }
    
    // ==================== نظام الإشعارات ====================
    sendNotification(type, data) {
        if (typeof notificationManager !== 'undefined') {
            const messages = {
                'goal_created': `تم إنشاء هدف جديد: ${data.title}`,
                'contribution_added': `تم إضافة ${data.contribution.amount} ر.س إلى هدف "${data.goal.title}"`,
                'milestone_achieved': `مبروك! وصلت إلى ${data.milestone.percentage}% في هدف "${data.goal.title}"`,
                'goal_achieved': `🎉 مبروك! حققت هدف "${data.title}" بالكامل!`,
                'goal_urgent': `⚡ هدف "${data.title}" يحتاج اهتماماً عاجلاً!`
            };
            
            const severity = {
                'goal_created': 'normal',
                'contribution_added': 'low',
                'milestone_achieved': 'medium',
                'goal_achieved': 'high',
                'goal_urgent': 'urgent'
            };
            
            notificationManager.addNotification(
                'success',
                'الأهداف المالية',
                messages[type] || `تحديث في الهدف: ${data.title || data.goal?.title}`,
                severity[type] || 'normal'
            );
        }
    }
    
    checkGoalProgress() {
        this.goals.forEach(goal => {
            const oldStatus = goal.status;
            this.calculateGoalStats(goal);
            
            // التحقق من التغييرات في الحالة
            if (goal.status !== oldStatus) {
                if (goal.status === 'achieved') {
                    this.sendNotification('goal_achieved', goal);
                } else if (goal.status === 'urgent') {
                    this.sendNotification('goal_urgent', goal);
                }
            }
        });
        
        this.saveData();
    }
    
    checkDailyProgress() {
        this.goals.forEach(goal => {
            if (goal.status === 'active' || goal.status === 'urgent') {
                // إرسال تذكير يومي إذا كان التقدم بطيئاً
                if (goal.dailyRequired > 0 && goal.progress < 50) {
                    this.sendNotification('goal_reminder', goal);
                }
            }
        });
    }
    
    // ==================== التحليلات والتقارير ====================
    getGoalsAnalytics() {
        const totalGoals = this.goals.length;
        const achievedGoals = this.goals.filter(g => g.status === 'achieved').length;
        const activeGoals = this.goals.filter(g => g.status !== 'achieved' && g.status !== 'expired').length;
        
        const totalTarget = this.goals.reduce((sum, g) => sum + g.targetAmount, 0);
        const totalCurrent = this.goals.reduce((sum, g) => sum + g.currentAmount, 0);
        const totalProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
        
        // تحليل حسب الفئة
        const categoryAnalysis = {};
        this.goals.forEach(goal => {
            if (!categoryAnalysis[goal.category]) {
                categoryAnalysis[goal.category] = {
                    count: 0,
                    totalTarget: 0,
                    totalCurrent: 0,
                    goals: []
                };
            }
            categoryAnalysis[goal.category].count++;
            categoryAnalysis[goal.category].totalTarget += goal.targetAmount;
            categoryAnalysis[goal.category].totalCurrent += goal.currentAmount;
            categoryAnalysis[goal.category].goals.push(goal);
        });
        
        // الأهداف الأكثر تقدماً
        const topPerforming = [...this.goals]
            .filter(g => g.status !== 'achieved')
            .sort((a, b) => b.progress - a.progress)
            .slice(0, 5);
        
        // الأهداف الأكثر تأخراً
        const needsAttention = [...this.goals]
            .filter(g => g.status === 'behind' || g.status === 'urgent')
            .sort((a, b) => a.progress - b.progress)
            .slice(0, 5);
        
        // الإحصائيات الزمنية
        const monthlyContributions = this.calculateMonthlyContributions();
        
        return {
            summary: {
                totalGoals,
                achievedGoals,
                activeGoals,
                totalTarget: parseFloat(totalTarget.toFixed(2)),
                totalCurrent: parseFloat(totalCurrent.toFixed(2)),
                totalProgress: parseFloat(totalProgress.toFixed(2)),
                achievementRate: parseFloat((achievedGoals / totalGoals * 100).toFixed(2))
            },
            categoryAnalysis,
            topPerforming,
            needsAttention,
            monthlyContributions,
            recommendations: this.generateRecommendations()
        };
    }
    
    calculateMonthlyContributions() {
        const monthlyData = {};
        const now = new Date();
        
        this.goals.forEach(goal => {
            goal.contributions.forEach(contribution => {
                const date = new Date(contribution.date);
                const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = 0;
                }
                
                monthlyData[monthKey] += contribution.amount;
            });
        });
        
        // الحصول على آخر 6 أشهر
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            last6Months.push({
                month: monthKey,
                amount: monthlyData[monthKey] || 0
            });
        }
        
        return last6Months;
    }
    
    generateRecommendations() {
        const recommendations = [];
        const analytics = this.getGoalsAnalytics();
        
        // توصية إذا كان معدل الإنجاز منخفض
        if (analytics.summary.achievementRate < 30) {
            recommendations.push({
                type: 'low_achievement',
                message: 'معدل إنجاز الأهداف منخفض',
                suggestion: 'راجع الأهداف واجعلها أكثر واقعية'
            });
        }
        
        // توصية للأهداف المتأخرة
        if (analytics.needsAttention.length > 0) {
            recommendations.push({
                type: 'needs_attention',
                message: `لديك ${analytics.needsAttention.length} هدف يحتاج اهتماماً`,
                suggestion: 'ركز على هذه الأهداف أو عدّل مواعيدها'
            });
        }
        
        // توصية للمساهمات
        const totalContributions = this.goals.reduce((sum, goal) => sum + goal.contributions.length, 0);
        if (totalContributions === 0) {
            recommendations.push({
                type: 'no_contributions',
                message: 'لم تقم بأي مساهمات في أهدافك',
                suggestion: 'ابدأ بالإدخار ولو بمبالغ صغيرة'
            });
        }
        
        return recommendations;
    }
    
    // ==================== واجهة المستخدم ====================
    displayGoals() {
        const container = document.getElementById('goalsContainer');
        if (!container) return;
        
        const analytics = this.getGoalsAnalytics();
        
        let html = `
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card shadow">
                        <div class="card-header bg-gradient-success text-white">
                            <h5 class="mb-0"><i class="fas fa-trophy me-2"></i>ملخص الأهداف</h5>
                        </div>
                        <div class="card-body">
                            <div class="row text-center">
                                <div class="col-md-2 col-6 mb-3">
                                    <div class="p-3 bg-success bg-opacity-10 rounded">
                                        <h3 class="text-success">${analytics.summary.totalGoals}</h3>
                                        <small class="text-muted">إجمالي الأهداف</small>
                                    </div>
                                </div>
                                <div class="col-md-2 col-6 mb-3">
                                    <div class="p-3 bg-primary bg-opacity-10 rounded">
                                        <h3 class="text-primary">${analytics.summary.achievedGoals}</h3>
                                        <small class="text-muted">متحقق</small>
                                    </div>
                                </div>
                                <div class="col-md-2 col-6 mb-3">
                                    <div class="p-3 bg-info bg-opacity-10 rounded">
                                        <h3 class="text-info">${analytics.summary.activeGoals}</h3>
                                        <small class="text-muted">نشط</small>
                                    </div>
                                </div>
                                <div class="col-md-3 col-6 mb-3">
                                    <div class="p-3 bg-warning bg-opacity-10 rounded">
                                        <h3 class="text-warning">${analytics.summary.totalProgress.toFixed(1)}%</h3>
                                        <small class="text-muted">التقدم العام</small>
                                    </div>
                                </div>
                                <div class="col-md-3 col-6 mb-3">
                                    <div class="p-3 bg-purple bg-opacity-10 rounded">
                                        <h3 class="text-purple">${analytics.summary.totalCurrent.toFixed(2)} ر.س</h3>
                                        <small class="text-muted">المدخرات الإجمالية</small>
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
                            <h5 class="mb-0"><i class="fas fa-bullseye me-2"></i>أهدافي</h5>
                        </div>
                        <div class="card-body">
        `;
        
        if (this.goals.length === 0) {
            html += `
                <div class="text-center py-5">
                    <i class="fas fa-bullseye fa-4x text-muted mb-3"></i>
                    <h5 class="text-muted">لا توجد أهداف</h5>
                    <p class="text-muted">أنشئ هدفك الأول لتبدأ بالتخطيط للمستقبل</p>
                    <button class="btn btn-success" onclick="showGoalModal()">
                        <i class="fas fa-plus me-1"></i>إنشاء هدف جديد
                    </button>
                </div>
            `;
        } else {
            // ترتيب الأهداف حسب الأولوية
            const sortedGoals = [...this.goals].sort((a, b) => {
                const priorityOrder = { 'urgent': 0, 'behind': 1, 'active': 2, 'ahead': 3, 'good_progress': 4, 'started': 5, 'new': 6, 'achieved': 7, 'expired': 8 };
                return priorityOrder[a.status] - priorityOrder[b.status];
            });
            
            sortedGoals.forEach(goal => {
                const statusClass = this.getStatusClass(goal.status);
                const statusText = this.getStatusText(goal.status);
                const daysLeft = goal.daysRemaining;
                
                html += `
                    <div class="card goal-card mb-3 border-start border-5 ${statusClass.replace('bg-', 'border-')}">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div class="flex-grow-1">
                                    <div class="d-flex align-items-center mb-2">
                                        <div class="goal-icon me-3" style="color: ${goal.color};">
                                            <i class="${goal.icon} fa-2x"></i>
                                        </div>
                                        <div>
                                            <h5 class="card-title mb-0">${goal.title}</h5>
                                            <div class="text-muted small">
                                                <i class="fas fa-tag me-1"></i>${goal.category} | 
                                                <i class="fas fa-calendar me-1"></i>${this.formatDate(goal.deadline)}
                                            </div>
                                        </div>
                                    </div>
                                    <p class="text-muted small mb-0">${goal.description || 'لا يوجد وصف'}</p>
                                </div>
                                <div class="text-end">
                                    <span class="badge ${statusClass} mb-2">${statusText}</span>
                                    <div class="h5 mb-0">${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)} ر.س</div>
                                    <div class="small text-muted">${goal.progress.toFixed(1)}% متحقق</div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <div class="d-flex justify-content-between mb-2">
                                    <small class="text-muted">التقدم</small>
                                    <small class="text-muted">${daysLeft} يوم متبقي</small>
                                </div>
                                <div class="progress" style="height: 12px;">
                                    <div class="progress-bar ${this.getProgressBarClass(goal.status)}" 
                                         style="width: ${Math.min(goal.progress, 100)}%">
                                    </div>
                                </div>
                                <div class="mt-1">
                                    <small class="text-muted">
                                        ${this.getProgressMessage(goal)}
                                    </small>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="text-center p-2 bg-light rounded mb-2">
                                        <small class="text-muted d-block">المبلغ المتبقي</small>
                                        <strong class="text-primary">${(goal.targetAmount - goal.currentAmount).toFixed(2)} ر.س</strong>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="text-center p-2 bg-light rounded mb-2">
                                        <small class="text-muted d-block">المطلوب يومياً</small>
                                        <strong class="text-warning">${goal.dailyRequired.toFixed(2)} ر.س</strong>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="text-center p-2 bg-light rounded mb-2">
                                        <small class="text-muted d-block">التسلسل</small>
                                        <strong class="text-success">${goal.streak} يوم</strong>
                                    </div>
                                </div>
                            </div>
                            
                            ${goal.milestones.filter(m => m.achieved).length > 0 ? `
                                <div class="mt-3">
                                    <small class="text-muted d-block mb-1">المعالم المتحققة:</small>
                                    <div class="d-flex flex-wrap gap-1">
                                        ${goal.milestones.filter(m => m.achieved).map(m => `
                                            <span class="badge bg-success">
                                                <i class="fas fa-check me-1"></i>${m.percentage}%
                                            </span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="mt-3 d-flex justify-content-between">
                                <div>
                                    <button class="btn btn-sm btn-success" onclick="addToGoal(${goal.id})">
                                        <i class="fas fa-plus me-1"></i>إضافة
                                    </button>
                                    <button class="btn btn-sm btn-outline-primary ms-2" onclick="viewGoalDetails(${goal.id})">
                                        <i class="fas fa-chart-line me-1"></i>تفاصيل
                                    </button>
                                </div>
                                <div>
                                    <button class="btn btn-sm btn-outline-primary" onclick="editGoal(${goal.id})">
                                        <i class="fas fa-edit me-1"></i>تعديل
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger ms-2" onclick="deleteGoal(${goal.id})">
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
                            <h5 class="mb-0"><i class="fas fa-star me-2"></i>الأهداف المتميزة</h5>
                        </div>
                        <div class="card-body">
                            ${analytics.topPerforming.length > 0 ? 
                                analytics.topPerforming.map(goal => `
                                    <div class="d-flex align-items-center mb-3">
                                        <div class="me-3">
                                            <div class="bg-success bg-opacity-25 p-2 rounded">
                                                <i class="${goal.icon} text-success"></i>
                                            </div>
                                        </div>
                                        <div class="flex-grow-1">
                                            <small class="d-block fw-bold">${goal.title}</small>
                                            <small class="text-muted">${goal.progress.toFixed(1)}% متحقق</small>
                                        </div>
                                        <div class="text-end">
                                            <span class="badge bg-success">${this.getStatusText(goal.status)}</span>
                                        </div>
                                    </div>
                                `).join('') :
                                '<p class="text-center text-muted">لا توجد أهداف متميزة</p>'
                            }
                        </div>
                    </div>
                    
                    <div class="card shadow">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="fas fa-plus-circle me-2"></i>إدارة الأهداف</h5>
                        </div>
                        <div class="card-body">
                            <button class="btn btn-success w-100 mb-3" onclick="showGoalModal()">
                                <i class="fas fa-plus me-1"></i>هدف جديد
                            </button>
                            <button class="btn btn-outline-success w-100 mb-2" onclick="showGoalWizard()">
                                <i class="fas fa-magic me-1"></i>معالج الأهداف
                            </button>
                            <button class="btn btn-outline-primary w-100" onclick="showGoalsReport()">
                                <i class="fas fa-file-pdf me-1"></i>تقرير الأهداف
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
            'new': 'bg-secondary',
            'started': 'bg-info',
            'good_progress': 'bg-primary',
            'ahead': 'bg-success',
            'active': 'bg-primary',
            'behind': 'bg-warning',
            'urgent': 'bg-danger',
            'near_completion': 'bg-purple',
            'achieved': 'bg-success',
            'expired': 'bg-dark'
        };
        return classes[status] || 'bg-secondary';
    }
    
    getStatusText(status) {
        const texts = {
            'new': 'جديد',
            'started': 'مبدأ',
            'good_progress': 'تقدم جيد',
            'ahead': 'متقدم',
            'active': 'نشط',
            'behind': 'متأخر',
            'urgent': 'عاجل',
            'near_completion': 'قريب الإنجاز',
            'achieved': 'متحقق',
            'expired': 'منتهي'
        };
        return texts[status] || status;
    }
    
    getProgressBarClass(status) {
        return this.getStatusClass(status);
    }
    
    getProgressMessage(goal) {
        if (goal.status === 'achieved') {
            return '🎉 لقد حققت الهدف!';
        }
        
        if (goal.status === 'urgent') {
            return '⚡ تحتاج إلى تسريع وتيرة الإدخار';
        }
        
        if (goal.status === 'behind') {
            return '⏰ أنت متأخر عن الجدول الزمني';
        }
        
        if (goal.status === 'ahead') {
            return '🚀 أنت متقدم عن الجدول الزمني';
        }
        
        if (goal.progress >= 80) {
            return '👍 على وشك الإنجاز!';
        }
        
        return '💪 استمر في العمل نحو هدفك';
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
    
    // ==================== إدارة البيانات ====================
    getGoal(id) {
        return this.goals.find(g => g.id === id);
    }
    
    updateGoal(id, updates) {
        const goal = this.getGoal(id);
        if (!goal) return null;
        
        Object.assign(goal, updates);
        goal.updatedAt = new Date().toISOString();
        goal.version++;
        
        this.calculateGoalStats(goal);
        this.saveData();
        
        return goal;
    }
    
    deleteGoal(id) {
        const index = this.goals.findIndex(g => g.id === id);
        if (index !== -1) {
            const deleted = this.goals.splice(index, 1)[0];
            this.saveData();
            return deleted;
        }
        return null;
    }
    
    loadData() {
        const saved = localStorage.getItem('goals');
        if (saved) {
            try {
                this.goals = JSON.parse(saved);
                // تحديث الأهداف المحملة
                this.goals.forEach(goal => {
                    this.calculateGoalStats(goal);
                });
            } catch (error) {
                console.error('Error loading goals:', error);
                this.goals = [];
            }
        }
    }
    
    saveData() {
        localStorage.setItem('goals', JSON.stringify(this.goals));
    }
    
    // ==================== الاستيراد والتصدير ====================
    exportGoals() {
        const data = {
            goals: this.goals,
            exportDate: new Date().toISOString(),
            version: '2.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `الأهداف_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return data;
    }
}

// ==================== التهيئة العالمية ====================
const goalsManager = new GoalsManager();

// الدوال العامة
window.showGoalsSection = function() {
    showSection('financialGoals');
    setTimeout(() => goalsManager.displayGoals(), 100);
};

window.showGoalModal = function() {
    alert('نموذج إنشاء الهدف سيظهر هنا');
};

window.addToGoal = function(goalId) {
    const amount = prompt('أدخل المبلغ الذي تريد إضافته للهدف:', '100');
    if (amount && !isNaN(amount)) {
        const result = goalsManager.addContribution(goalId, parseFloat(amount));
        if (result) {
            goalsManager.displayGoals();
            alert('تم إضافة المبلغ بنجاح!');
        }
    }
};

window.editGoal = function(id) {
    const goal = goalsManager.getGoal(id);
    if (goal) {
        alert(`تعديل الهدف: ${goal.title}`);
    }
};

window.deleteGoal = function(id) {
    if (confirm('هل أنت متأكد من حذف هذا الهدف؟')) {
        const deleted = goalsManager.deleteGoal(id);
        if (deleted) {
            goalsManager.displayGoals();
            alert('تم حذف الهدف بنجاح');
        }
    }
};

window.viewGoalDetails = function(id) {
    const goal = goalsManager.getGoal(id);
    if (goal) {
        const details = `
            الهدف: ${goal.title}
            المبلغ المستهدف: ${goal.targetAmount} ر.س
            المبلغ المتحقق: ${goal.currentAmount} ر.س (${goal.progress.toFixed(1)}%)
            المتبقي: ${(goal.targetAmount - goal.currentAmount).toFixed(2)} ر.س
            المطلوب يومياً: ${goal.dailyRequired.toFixed(2)} ر.س
            الأيام المتبقية: ${goal.daysRemaining} يوم
            الحالة: ${goalsManager.getStatusText(goal.status)}
        `;
        alert(details);
    }
};

// التصدير للاستخدام في ملفات أخرى
window.goalsManager = goalsManager;

console.log('✅ Goals Manager loaded successfully');
