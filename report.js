/**
 * المحاسب الشخصي - نظام التقارير والتحليلات المتقدم
 * الإصدار: 2.0.0
 * المميزات: تقارير شاملة، تحليلات، تصدير متعدد التنسيقات
 */

class ReportGenerator {
    constructor() {
        this.reports = [];
        this.templates = {};
        this.settings = {
            autoGenerate: true,
            retentionDays: 365,
            exportFormats: ['pdf', 'excel', 'json'],
            defaultTemplate: 'professional'
        };
        
        this.loadData();
        this.initTemplates();
    }
    
    initTemplates() {
        this.templates = {
            professional: {
                name: 'احترافي',
                colors: {
                    primary: '#4361ee',
                    secondary: '#3a0ca3',
                    accent: '#7209b7',
                    success: '#2ec4b6',
                    danger: '#e71d36',
                    warning: '#ff9f1c'
                },
                fonts: {
                    primary: "'Tajawal', sans-serif",
                    secondary: "'Arial', sans-serif"
                }
            },
            minimal: {
                name: 'بسيط',
                colors: {
                    primary: '#2c3e50',
                    secondary: '#34495e',
                    accent: '#7f8c8d',
                    success: '#27ae60',
                    danger: '#c0392b',
                    warning: '#f39c12'
                },
                fonts: {
                    primary: "'Segoe UI', sans-serif",
                    secondary: "'Tahoma', sans-serif"
                }
            },
            corporate: {
                name: 'شركة',
                colors: {
                    primary: '#1a237e',
                    secondary: '#283593',
                    accent: '#3949ab',
                    success: '#388e3c',
                    danger: '#d32f2f',
                    warning: '#ffa000'
                },
                fonts: {
                    primary: "'Roboto', sans-serif",
                    secondary: "'Arial', sans-serif"
                }
            }
        };
    }
    
    // ==================== توليد التقارير ====================
    generateReport(type, options = {}) {
        let report;
        
        switch(type) {
            case 'financial_summary':
                report = this.generateFinancialSummary(options);
                break;
            case 'budget_analysis':
                report = this.generateBudgetAnalysis(options);
                break;
            case 'goal_progress':
                report = this.generateGoalProgressReport(options);
                break;
            case 'cash_flow':
                report = this.generateCashFlowReport(options);
                break;
            case 'investment_performance':
                report = this.generateInvestmentReport(options);
                break;
            case 'comprehensive':
                report = this.generateComprehensiveReport(options);
                break;
            default:
                throw new Error(`نوع التقرير غير معروف: ${type}`);
        }
        
        // حفظ التقرير
        if (options.save !== false) {
            this.saveReport(report);
        }
        
        return report;
    }
    
    generateFinancialSummary(options = {}) {
        const period = options.period || 'monthly';
        const dateRange = this.getDateRange(period);
        
        const summary = {
            income: this.calculateTotal('income', dateRange),
            expenses: this.calculateTotal('expense', dateRange),
            savings: 0,
            netWorth: this.calculateNetWorth(),
            cashFlow: 0,
            debtRatio: this.calculateDebtRatio()
        };
        
        summary.savings = summary.income - summary.expenses;
        summary.cashFlow = summary.savings;
        summary.savingsRate = summary.income > 0 ? (summary.savings / summary.income) * 100 : 0;
        
        // تحليل الفئات
        const categoryAnalysis = this.analyzeCategories(dateRange);
        const monthlyTrends = this.analyzeMonthlyTrends(6);
        const topExpenses = this.getTopExpenses(dateRange, 10);
        
        const report = {
            id: `financial_summary_${Date.now()}`,
            type: 'financial_summary',
            title: 'التقرير المالي الشامل',
            period: period,
            dateRange: dateRange,
            generatedAt: new Date().toISOString(),
            
            summary: {
                ...summary,
                metrics: {
                    liquidityRatio: this.calculateLiquidityRatio(),
                    expenseToIncomeRatio: summary.income > 0 ? (summary.expenses / summary.income) * 100 : 0,
                    financialHealthScore: this.calculateFinancialHealthScore(summary)
                }
            },
            
            analysis: {
                categoryBreakdown: categoryAnalysis,
                monthlyTrends: monthlyTrends,
                topExpenses: topExpenses,
                recurringExpenses: this.identifyRecurringExpenses(),
                spendingPatterns: this.analyzeSpendingPatterns()
            },
            
            insights: this.generateFinancialInsights(summary, categoryAnalysis),
            recommendations: this.generateFinancialRecommendations(summary),
            
            charts: {
                incomeVsExpense: this.prepareIncomeExpenseChartData(dateRange),
                categoryDistribution: this.prepareCategoryChartData(categoryAnalysis),
                monthlyTrend: this.prepareMonthlyTrendData(monthlyTrends)
            },
            
            metadata: {
                transactionCount: window.transactions?.length || 0,
                periodCovered: `${dateRange.start} إلى ${dateRange.end}`,
                template: options.template || this.settings.defaultTemplate
            }
        };
        
        return report;
    }
    
    generateBudgetAnalysis(options = {}) {
        if (typeof budgetManager === 'undefined') {
            throw new Error('مدير الميزانية غير متوفر');
        }
        
        const budgets = budgetManager.budgets;
        const period = options.period || 'current';
        
        const analysis = {
            totalBudgets: budgets.length,
            activeBudgets: budgets.filter(b => b.status !== 'exceeded' && b.status !== 'expired').length,
            totalAllocated: budgets.reduce((sum, b) => sum + b.amount, 0),
            totalSpent: budgets.reduce((sum, b) => sum + b.actualSpent, 0),
            totalRemaining: budgets.reduce((sum, b) => sum + b.remaining, 0),
            utilizationRate: 0
        };
        
        analysis.utilizationRate = analysis.totalAllocated > 0 ? 
            (analysis.totalSpent / analysis.totalAllocated) * 100 : 0;
        
        // تحليل الأداء
        const performance = budgets.map(budget => ({
            name: budget.name,
            allocated: budget.amount,
            spent: budget.actualSpent,
            remaining: budget.remaining,
            utilization: (budget.actualSpent / budget.amount) * 100,
            status: budget.status,
            variance: budget.actualSpent - (budget.amount * (budget.daysElapsed / (budget.daysElapsed + budget.daysRemaining)))
        }));
        
        // تحليل الفئات
        const categoryPerformance = {};
        budgets.forEach(budget => {
            budget.categories.forEach(category => {
                if (!categoryPerformance[category]) {
                    categoryPerformance[category] = {
                        allocated: 0,
                        spent: 0,
                        budgets: []
                    };
                }
                categoryPerformance[category].allocated += budget.amount;
                categoryPerformance[category].spent += budget.actualSpent;
                categoryPerformance[category].budgets.push(budget.name);
            });
        });
        
        const report = {
            id: `budget_analysis_${Date.now()}`,
            type: 'budget_analysis',
            title: 'تحليل الميزانية',
            period: period,
            generatedAt: new Date().toISOString(),
            
            summary: analysis,
            performance: performance.sort((a, b) => b.utilization - a.utilization),
            categoryPerformance,
            
            insights: this.generateBudgetInsights(analysis, performance),
            recommendations: this.generateBudgetRecommendations(performance),
            
            alerts: budgetManager.budgets.flatMap(b => b.alerts || []).slice(0, 10),
            
            metadata: {
                budgetCount: budgets.length,
                periodCovered: period,
                template: options.template || this.settings.defaultTemplate
            }
        };
        
        return report;
    }
    
    generateGoalProgressReport(options = {}) {
        if (typeof goalsManager === 'undefined') {
            throw new Error('مدير الأهداف غير متوفر');
        }
        
        const goals = goalsManager.goals;
        const period = options.period || 'all';
        
        const summary = {
            totalGoals: goals.length,
            achievedGoals: goals.filter(g => g.status === 'achieved').length,
            activeGoals: goals.filter(g => g.status !== 'achieved' && g.status !== 'expired').length,
            totalTarget: goals.reduce((sum, g) => sum + g.targetAmount, 0),
            totalCurrent: goals.reduce((sum, g) => sum + g.currentAmount, 0),
            totalProgress: 0,
            averageProgress: 0
        };
        
        summary.totalProgress = summary.totalTarget > 0 ? 
            (summary.totalCurrent / summary.totalTarget) * 100 : 0;
        summary.averageProgress = goals.length > 0 ? 
            goals.reduce((sum, g) => sum + g.progress, 0) / goals.length : 0;
        
        // تحليل حسب الفئة
        const categoryAnalysis = {};
        goals.forEach(goal => {
            if (!categoryAnalysis[goal.category]) {
                categoryAnalysis[goal.category] = {
                    count: 0,
                    target: 0,
                    current: 0,
                    progress: 0,
                    goals: []
                };
            }
            categoryAnalysis[goal.category].count++;
            categoryAnalysis[goal.category].target += goal.targetAmount;
            categoryAnalysis[goal.category].current += goal.currentAmount;
            categoryAnalysis[goal.category].goals.push(goal.title);
            categoryAnalysis[goal.category].progress = categoryAnalysis[goal.category].target > 0 ?
                (categoryAnalysis[goal.category].current / categoryAnalysis[goal.category].target) * 100 : 0;
        });
        
        // المعالم المتحققة
        const milestones = goals.flatMap(goal => 
            (goal.milestones || []).filter(m => m.achieved).map(m => ({
                goal: goal.title,
                milestone: `${m.percentage}%`,
                amount: m.amount,
                achievedAt: m.achievedAt
            }))
        );
        
        // المساهمات الأخيرة
        const recentContributions = goals
            .flatMap(goal => (goal.contributions || []).map(c => ({
                ...c,
                goal: goal.title
            })))
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);
        
        const report = {
            id: `goal_progress_${Date.now()}`,
            type: 'goal_progress',
            title: 'تقرير تقدم الأهداف',
            period: period,
            generatedAt: new Date().toISOString(),
            
            summary: summary,
            categoryAnalysis: categoryAnalysis,
            milestones: milestones,
            recentContributions: recentContributions,
            
            topPerforming: goals
                .filter(g => g.status !== 'achieved')
                .sort((a, b) => b.progress - a.progress)
                .slice(0, 5),
            
            needsAttention: goals
                .filter(g => g.status === 'behind' || g.status === 'urgent')
                .sort((a, b) => a.progress - b.progress)
                .slice(0, 5),
            
            insights: this.generateGoalInsights(summary, goals),
            recommendations: this.generateGoalRecommendations(goals),
            
            metadata: {
                goalCount: goals.length,
                periodCovered: period,
                template: options.template || this.settings.defaultTemplate
            }
        };
        
        return report;
    }
    
    generateCashFlowReport(options = {}) {
        const period = options.period || 'monthly';
        const months = options.months || 12;
        
        const cashFlowData = this.analyzeCashFlow(months);
        const projections = this.projectCashFlow(cashFlowData, 3);
        
        const report = {
            id: `cash_flow_${Date.now()}`,
            type: 'cash_flow',
            title: 'تقرير التدفق النقدي',
            period: period,
            generatedAt: new Date().toISOString(),
            
            historical: cashFlowData,
            projections: projections,
            
            analysis: {
                averageMonthlyIncome: this.calculateAverage(cashFlowData.map(d => d.income)),
                averageMonthlyExpense: this.calculateAverage(cashFlowData.map(d => d.expense)),
                averageMonthlyCashFlow: this.calculateAverage(cashFlowData.map(d => d.net)),
                volatility: this.calculateVolatility(cashFlowData.map(d => d.net)),
                liquidityTrend: this.analyzeLiquidityTrend(cashFlowData)
            },
            
            insights: this.generateCashFlowInsights(cashFlowData, projections),
            recommendations: this.generateCashFlowRecommendations(cashFlowData),
            
            charts: {
                cashFlowTrend: this.prepareCashFlowChartData(cashFlowData),
                incomeSources: this.analyzeIncomeSources(),
                expenseCategories: this.analyzeExpenseCategories()
            },
            
            metadata: {
                monthsAnalyzed: months,
                periodCovered: period,
                template: options.template || this.settings.defaultTemplate
            }
        };
        
        return report;
    }
    
    generateComprehensiveReport(options = {}) {
        const period = options.period || 'quarterly';
        
        const financialSummary = this.generateFinancialSummary({ period, save: false });
        const budgetAnalysis = typeof budgetManager !== 'undefined' ? 
            this.generateBudgetAnalysis({ period, save: false }) : null;
        const goalProgress = typeof goalsManager !== 'undefined' ? 
            this.generateGoalProgressReport({ period, save: false }) : null;
        const cashFlowReport = this.generateCashFlowReport({ period: 'monthly', months: 6, save: false });
        
        const report = {
            id: `comprehensive_${Date.now()}`,
            type: 'comprehensive',
            title: 'التقرير المالي المتكامل',
            period: period,
            generatedAt: new Date().toISOString(),
            
            sections: {
                financialSummary,
                budgetAnalysis,
                goalProgress,
                cashFlowReport
            },
            
            executiveSummary: this.generateExecutiveSummary(
                financialSummary, 
                budgetAnalysis, 
                goalProgress, 
                cashFlowReport
            ),
            
            keyMetrics: {
                financialHealth: financialSummary.summary.metrics.financialHealthScore,
                savingsRate: financialSummary.summary.savingsRate,
                budgetUtilization: budgetAnalysis?.summary.utilizationRate || 0,
                goalProgress: goalProgress?.summary.averageProgress || 0,
                cashFlowStability: cashFlowReport.analysis.volatility
            },
            
            actionPlan: this.generateActionPlan(
                financialSummary.recommendations,
                budgetAnalysis?.recommendations || [],
                goalProgress?.recommendations || [],
                cashFlowReport.recommendations
            ),
            
            metadata: {
                reportType: 'comprehensive',
                periodCovered: period,
                template: options.template || 'professional',
                version: '2.0.0'
            }
        };
        
        // حفظ التقرير
        if (options.save !== false) {
            this.saveReport(report);
        }
        
        return report;
    }
    
    // ==================== دوال التحليل ====================
    getDateRange(period) {
        const now = new Date();
        const start = new Date(now);
        
        switch(period) {
            case 'daily':
                start.setDate(now.getDate() - 1);
                break;
            case 'weekly':
                start.setDate(now.getDate() - 7);
                break;
            case 'monthly':
                start.setMonth(now.getMonth() - 1);
                break;
            case 'quarterly':
                start.setMonth(now.getMonth() - 3);
                break;
            case 'yearly':
                start.setFullYear(now.getFullYear() - 1);
                break;
            case 'ytd':
                start.setFullYear(now.getFullYear(), 0, 1);
                break;
            default:
                start.setMonth(now.getMonth() - 1);
        }
        
        return {
            start: start.toISOString().split('T')[0],
            end: now.toISOString().split('T')[0]
        };
    }
    
    calculateTotal(type, dateRange = null) {
        if (!window.transactions || !Array.isArray(window.transactions)) {
            return 0;
        }
        
        let filtered = window.transactions.filter(t => t.type === type);
        
        if (dateRange) {
            filtered = filtered.filter(t => {
                const transDate = new Date(t.date).toISOString().split('T')[0];
                return transDate >= dateRange.start && transDate <= dateRange.end;
            });
        }
        
        return filtered.reduce((sum, t) => sum + t.amount, 0);
    }
    
    calculateNetWorth() {
        // هذه دالة مبسطة، يمكن تطويرها
        const assets = this.calculateTotal('income') * 0.7; // افتراض
        const liabilities = this.calculateTotal('expense') * 0.3; // افتراض
        return assets - liabilities;
    }
    
    calculateDebtRatio() {
        const monthlyDebt = this.calculateTotal('expense', this.getDateRange('monthly')) * 0.3;
        const monthlyIncome = this.calculateTotal('income', this.getDateRange('monthly'));
        return monthlyIncome > 0 ? (monthlyDebt / monthlyIncome) * 100 : 0;
    }
    
    calculateLiquidityRatio() {
        // نسبة السيولة
        const liquidAssets = this.calculateTotal('income', this.getDateRange('monthly')) * 0.2;
        const monthlyExpenses = this.calculateTotal('expense', this.getDateRange('monthly'));
        return monthlyExpenses > 0 ? (liquidAssets / monthlyExpenses) * 1.5 : 0;
    }
    
    calculateFinancialHealthScore(summary) {
        let score = 100;
        
        // نقاط بناءً على نسبة المدخرات
        if (summary.savingsRate >= 20) score += 20;
        else if (summary.savingsRate >= 10) score += 10;
        else if (summary.savingsRate >= 0) score += 5;
        else score -= 10;
        
        // نقاط بناءً على نسبة الدين
        if (summary.debtRatio <= 30) score += 20;
        else if (summary.debtRatio <= 50) score += 10;
        else if (summary.debtRatio <= 70) score += 5;
        else score -= 10;
        
        // نقاط بناءً على التدفق النقدي
        if (summary.cashFlow > 0) score += 15;
        else score -= 15;
        
        return Math.min(Math.max(score, 0), 100);
    }
    
    analyzeCategories(dateRange) {
        if (!window.transactions) return {};
        
        const categories = {};
        const filtered = window.transactions.filter(t => {
            if (dateRange) {
                const transDate = new Date(t.date).toISOString().split('T')[0];
                return transDate >= dateRange.start && transDate <= dateRange.end;
            }
            return true;
        });
        
        filtered.forEach(transaction => {
            if (!categories[transaction.category]) {
                categories[transaction.category] = {
                    income: 0,
                    expense: 0,
                    count: 0
                };
            }
            
            if (transaction.type === 'income') {
                categories[transaction.category].income += transaction.amount;
            } else {
                categories[transaction.category].expense += transaction.amount;
            }
            
            categories[transaction.category].count++;
        });
        
        return categories;
    }
    
    analyzeMonthlyTrends(months) {
        const trends = [];
        const now = new Date();
        
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            
            const dateRange = {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0]
            };
            
            trends.push({
                month: monthKey,
                label: this.formatMonth(monthKey),
                income: this.calculateTotal('income', dateRange),
                expense: this.calculateTotal('expense', dateRange),
                net: 0
            });
        }
        
        trends.forEach(trend => {
            trend.net = trend.income - trend.expense;
        });
        
        return trends;
    }
    
    analyzeCashFlow(months) {
        const monthlyData = this.analyzeMonthlyTrends(months);
        
        return monthlyData.map(month => ({
            period: month.label,
            income: month.income,
            expense: month.expense,
            net: month.net,
            cumulative: 0
        })).map((month, index, array) => {
            month.cumulative = array.slice(0, index + 1).reduce((sum, m) => sum + m.net, 0);
            return month;
        });
    }
    
    projectCashFlow(historicalData, monthsToProject) {
        if (historicalData.length < 3) return [];
        
        const projections = [];
        const lastData = historicalData[historicalData.length - 1];
        const growthRate = this.calculateGrowthRate(historicalData.map(d => d.net));
        
        for (let i = 1; i <= monthsToProject; i++) {
            const projectedDate = new Date();
            projectedDate.setMonth(projectedDate.getMonth() + i);
            
            const projectedNet = lastData.net * Math.pow(1 + growthRate / 100, i);
            
            projections.push({
                period: this.formatMonth(
                    `${projectedDate.getFullYear()}-${(projectedDate.getMonth() + 1).toString().padStart(2, '0')}`
                ),
                projectedIncome: lastData.income * (1 + growthRate / 100),
                projectedExpense: lastData.expense * (1 + growthRate / 100),
                projectedNet: projectedNet,
                confidence: Math.max(0.5, 1 - (i * 0.1)) // تقل الثقة مع البعد عن التاريخ الحالي
            });
        }
        
        return projections;
    }
    
    // ==================== توليد الرؤى والتوصيات ====================
    generateFinancialInsights(summary, categoryAnalysis) {
        const insights = [];
        
        // رؤى حول المدخرات
        if (summary.savingsRate < 10) {
            insights.push({
                type: 'warning',
                title: 'معدل مدخرات منخفض',
                message: `معدل مدخراتك (${summary.savingsRate.toFixed(1)}%) أقل من المستوى الموصى به (20%).`,
                suggestion: 'فكر في تقليل المصروفات غير الضرورية أو زيادة دخلك.'
            });
        } else if (summary.savingsRate >= 20) {
            insights.push({
                type: 'success',
                title: 'معدل مدخرات ممتاز',
                message: `معدل مدخراتك (${summary.savingsRate.toFixed(1)}%) ممتاز!`,
                suggestion: 'استمر في هذا النمط، وفكر في استثمار الفائض.'
            });
        }
        
        // رؤى حول الدين
        if (summary.debtRatio > 50) {
            insights.push({
                type: 'danger',
                title: 'نسبة دين مرتفعة',
                message: `نسبة الدين إلى الدخل (${summary.debtRatio.toFixed(1)}%) مرتفعة.`,
                suggestion: 'ركز على تخفيض الديون قبل اتخاذ أي التزامات جديدة.'
            });
        }
        
        // رؤى حول الفئات
        const topExpenseCategory = Object.entries(categoryAnalysis)
            .filter(([_, data]) => data.expense > 0)
            .sort((a, b) => b[1].expense - a[1].expense)[0];
        
        if (topExpenseCategory) {
            const [category, data] = topExpenseCategory;
            const percentage = (data.expense / summary.expenses) * 100;
            
            if (percentage > 30) {
                insights.push({
                    type: 'info',
                    title: 'تركيز المصروفات',
                    message: `أكبر مصروفاتك في فئة "${category}" بنسبة ${percentage.toFixed(1)}%.`,
                    suggestion: 'راجع مصروفات هذه الفئة لتحسين التوفير.'
                });
            }
        }
        
        // رؤى حول التدفق النقدي
        if (summary.cashFlow < 0) {
            insights.push({
                type: 'danger',
                title: 'تدفق نقدي سلبي',
                message: 'تدفقاتك النقدية سلبية هذا الشهر.',
                suggestion: 'تحقق من مصروفاتك وابحث عن فرص لزيادة الدخل.'
            });
        }
        
        return insights;
    }
    
    generateFinancialRecommendations(summary) {
        const recommendations = [];
        
        if (summary.savingsRate < 10) {
            recommendations.push({
                priority: 'high',
                action: 'زيادة المدخرات',
                details: 'حاول توفير 10-20% من دخلك الشهري.',
                timeline: 'فوري'
            });
        }
        
        if (summary.debtRatio > 40) {
            recommendations.push({
                priority: 'high',
                action: 'تقليل الديون',
                details: 'ركز على سداد الديون ذات الفائدة المرتفعة أولاً.',
                timeline: '3 أشهر'
            });
        }
        
        if (summary.cashFlow < 0) {
            recommendations.push({
                priority: 'urgent',
                action: 'تحسين التدفق النقدي',
                details: 'خفض المصروفات أو زيادة الدخل لتصحيح التدفق النقدي.',
                timeline: 'شهر واحد'
            });
        }
        
        // توصيات عامة
        recommendations.push({
            priority: 'medium',
            action: 'تنويع مصادر الدخل',
            details: 'ابحث عن مصادر دخل إضافية لزيادة الاستقرار المالي.',
            timeline: '6 أشهر'
        });
        
        recommendations.push({
            priority: 'low',
            action: 'بناء صندوق الطوارئ',
            details: 'وفر مبلغاً يعادل 3-6 أشهر من المصروفات لحالات الطوارئ.',
            timeline: 'سنة'
        });
        
        return recommendations;
    }
    
    generateExecutiveSummary(financialSummary, budgetAnalysis, goalProgress, cashFlowReport) {
        const summary = {
            overallHealth: 'جيد',
            keyAchievements: [],
            areasForImprovement: [],
            nextSteps: []
        };
        
        // تقييم الصحة المالية
        const healthScore = financialSummary.summary.metrics.financialHealthScore;
        if (healthScore >= 80) summary.overallHealth = 'ممتاز';
        else if (healthScore >= 60) summary.overallHealth = 'جيد';
        else if (healthScore >= 40) summary.overallHealth = 'متوسط';
        else summary.overallHealth = 'يحتاج تحسين';
        
        // الإنجازات
        if (financialSummary.summary.savingsRate >= 15) {
            summary.keyAchievements.push('معدل مدخرات مرتفع');
        }
        
        if (budgetAnalysis && budgetAnalysis.summary.utilizationRate <= 90) {
            summary.keyAchievements.push('إدارة ميزانية فعالة');
        }
        
        if (goalProgress && goalProgress.summary.averageProgress >= 50) {
            summary.keyAchievements.push('تقدم جيد في الأهداف');
        }
        
        // مجالات التحسين
        if (financialSummary.summary.debtRatio > 40) {
            summary.areasForImprovement.push('تقليل نسبة الدين');
        }
        
        if (cashFlowReport.analysis.volatility > 30) {
            summary.areasForImprovement.push('تحسين استقرار التدفق النقدي');
        }
        
        // الخطوات التالية
        summary.nextSteps = [
            'مراجعة المصروفات غير الضرورية',
            'زيادة مساهمات الأهداف المهمة',
            'تحديث الميزانيات بناءً على الأداء الفعلي'
        ];
        
        return summary;
    }
    
    generateActionPlan(...recommendationSets) {
        const allRecommendations = recommendationSets.flat();
        
        // تجميع حسب الأولوية
        const byPriority = {
            urgent: [],
            high: [],
            medium: [],
            low: []
        };
        
        allRecommendations.forEach(rec => {
            if (byPriority[rec.priority]) {
                byPriority[rec.priority].push(rec);
            }
        });
        
        // إنشاء خطة عمل
        const actionPlan = {
            immediateActions: byPriority.urgent.slice(0, 3),
            shortTermGoals: byPriority.high.slice(0, 5),
            mediumTermGoals: byPriority.medium.slice(0, 5),
            longTermGoals: byPriority.low.slice(0, 3)
        };
        
        return actionPlan;
    }
    
    // ==================== إعداد البيانات للرسوم البيانية ====================
    prepareIncomeExpenseChartData(dateRange) {
        const monthlyData = this.analyzeMonthlyTrends(6);
        
        return {
            labels: monthlyData.map(m => m.label),
            datasets: [
                {
                    label: 'الدخل',
                    data: monthlyData.map(m => m.income),
                    backgroundColor: 'rgba(46, 196, 182, 0.5)',
                    borderColor: '#2ec4b6'
                },
                {
                    label: 'المصروفات',
                    data: monthlyData.map(m => m.expense),
                    backgroundColor: 'rgba(231, 29, 54, 0.5)',
                    borderColor: '#e71d36'
                }
            ]
        };
    }
    
    prepareCategoryChartData(categoryAnalysis) {
        const categories = Object.entries(categoryAnalysis)
            .filter(([_, data]) => data.expense > 0)
            .sort((a, b) => b[1].expense - a[1].expense)
            .slice(0, 8);
        
        return {
            labels: categories.map(([category]) => category),
            datasets: [{
                data: categories.map(([_, data]) => data.expense),
                backgroundColor: [
                    '#4361ee', '#3a0ca3', '#7209b7', '#f72585',
                    '#4cc9f0', '#2ec4b6', '#ff9f1c', '#e71d36'
                ]
            }]
        };
    }
    
    prepareCashFlowChartData(cashFlowData) {
        return {
            labels: cashFlowData.map(d => d.period),
            datasets: [
                {
                    label: 'التدفق النقدي',
                    data: cashFlowData.map(d => d.net),
                    type: 'line',
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'الدخل',
                    data: cashFlowData.map(d => d.income),
                    backgroundColor: 'rgba(46, 196, 182, 0.5)'
                },
                {
                    label: 'المصروفات',
                    data: cashFlowData.map(d => d.expense),
                    backgroundColor: 'rgba(231, 29, 54, 0.5)'
                }
            ]
        };
    }
    
    // ==================== تصدير التقارير ====================
    exportReport(reportId, format = 'html') {
        const report = this.reports.find(r => r.id === reportId) || 
                      this.generateReport('comprehensive');
        
        switch(format.toLowerCase()) {
            case 'html':
                return this.exportAsHTML(report);
            case 'pdf':
                return this.exportAsPDF(report);
            case 'excel':
                return this.exportAsExcel(report);
            case 'json':
                return this.exportAsJSON(report);
            case 'csv':
                return this.exportAsCSV(report);
            default:
                throw new Error(`تنسيق التصدير غير مدعوم: ${format}`);
        }
    }
    
    exportAsHTML(report) {
        const template = this.templates[report.metadata?.template || 'professional'];
        const html = this.generateHTMLReport(report, template);
        
        // فتح في نافذة جديدة
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        
        return html;
    }
    
    exportAsPDF(report) {
        // استخدام مكتبة jsPDF إذا كانت متوفرة
        if (typeof jsPDF !== 'undefined') {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFont('tajawal', 'normal');
            doc.setR2L(true);
            
            // إضافة المحتوى
            doc.text('التقرير المالي', 10, 10);
            doc.text(`تاريخ الإنشاء: ${new Date(report.generatedAt).toLocaleDateString('ar-SA')}`, 10, 20);
            
            const pdfBlob = doc.output('blob');
            this.downloadFile(pdfBlob, `report_${report.id}.pdf`);
            
            return pdfBlob;
        } else {
            alert('مكتبة PDF غير متوفرة. جاري تحميلها...');
            this.loadLibrary('jsPDF', () => this.exportAsPDF(report));
            return null;
        }
    }
    
    exportAsExcel(report) {
        // استخدام مكتبة SheetJS إذا كانت متوفرة
        if (typeof XLSX !== 'undefined') {
            const wb = XLSX.utils.book_new();
            
            // ورقة الملخص
            const summaryData = [
                ['التقرير المالي', report.title],
                ['الفترة', report.period],
                ['تاريخ الإنشاء', new Date(report.generatedAt).toLocaleDateString('ar-SA')],
                [],
                ['المؤشر', 'القيمة']
            ];
            
            if (report.summary) {
                Object.entries(report.summary).forEach(([key, value]) => {
                    if (typeof value === 'number') {
                        summaryData.push([key, value.toFixed(2)]);
                    } else {
                        summaryData.push([key, value]);
                    }
                });
            }
            
            const ws = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, ws, 'الملخص');
            
            const excelBlob = new Blob(
                [XLSX.write(wb, { bookType: 'xlsx', type: 'array' })],
                { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
            );
            
            this.downloadFile(excelBlob, `report_${report.id}.xlsx`);
            return excelBlob;
        } else {
            alert('مكتبة Excel غير متوفرة');
            return null;
        }
    }
    
    exportAsJSON(report) {
        const jsonStr = JSON.stringify(report, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        this.downloadFile(blob, `report_${report.id}.json`);
        return blob;
    }
    
    exportAsCSV(report) {
        let csvContent = 'المؤشر,القيمة\n';
        
        if (report.summary) {
            Object.entries(report.summary).forEach(([key, value]) => {
                csvContent += `${key},${typeof value === 'number' ? value.toFixed(2) : value}\n`;
            });
        }
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this.downloadFile(blob, `report_${report.id}.csv`);
        return blob;
    }
    
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    loadLibrary(libName, callback) {
        const scripts = {
            jsPDF: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
            SheetJS: 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
        };
        
        if (!scripts[libName]) {
            console.error(`المكتبة ${libName} غير معروفة`);
            return;
        }
        
        const script = document.createElement('script');
        script.src = scripts[libName];
        script.onload = callback;
        document.head.appendChild(script);
    }
    
    // ==================== دوال مساعدة ====================
    formatMonth(monthKey) {
        const [year, month] = monthKey.split('-');
        const months = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        return `${months[parseInt(month) - 1]} ${year}`;
    }
    
    calculateAverage(numbers) {
        if (numbers.length === 0) return 0;
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    }
    
    calculateGrowthRate(numbers) {
        if (numbers.length < 2) return 0;
        
        const first = numbers[0];
        const last = numbers[numbers.length - 1];
        
        if (first === 0) return 0;
        return ((last - first) / Math.abs(first)) * 100;
    }
    
    calculateVolatility(numbers) {
        if (numbers.length < 2) return 0;
        
        const mean = this.calculateAverage(numbers);
        const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
        const variance = this.calculateAverage(squaredDiffs);
        return Math.sqrt(variance);
    }
    
    getTopExpenses(dateRange, limit = 10) {
        if (!window.transactions) return [];
        
        return window.transactions
            .filter(t => t.type === 'expense')
            .filter(t => {
                if (dateRange) {
                    const transDate = new Date(t.date).toISOString().split('T')[0];
                    return transDate >= dateRange.start && transDate <= dateRange.end;
                }
                return true;
            })
            .sort((a, b) => b.amount - a.amount)
            .slice(0, limit)
            .map(t => ({
                description: t.name,
                amount: t.amount,
                date: t.date,
                category: t.category
            }));
    }
    
    identifyRecurringExpenses() {
        if (!window.transactions) return [];
        
        const recurring = {};
        window.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const key = `${t.name}_${t.amount.toFixed(2)}`;
                if (!recurring[key]) {
                    recurring[key] = {
                        description: t.name,
                        amount: t.amount,
                        occurrences: 0,
                        dates: []
                    };
                }
                recurring[key].occurrences++;
                recurring[key].dates.push(t.date);
            });
        
        return Object.values(recurring)
            .filter(r => r.occurrences >= 3)
            .sort((a, b) => b.occurrences - a.occurrences);
    }
    
    analyzeSpendingPatterns() {
        // تحليل أنماط الإنفاق حسب اليوم والأسبوع
        const patterns = {
            byDay: {},
            byWeekday: {},
            byTime: {}
        };
        
        if (window.transactions) {
            window.transactions
                .filter(t => t.type === 'expense')
                .forEach(t => {
                    const date = new Date(t.date);
                    const day = date.toISOString().split('T')[0];
                    const weekday = date.getDay();
                    const hour = date.getHours();
                    
                    patterns.byDay[day] = (patterns.byDay[day] || 0) + t.amount;
                    patterns.byWeekday[weekday] = (patterns.byWeekday[weekday] || 0) + t.amount;
                    patterns.byTime[hour] = (patterns.byTime[hour] || 0) + t.amount;
                });
        }
        
        return patterns;
    }
    
    analyzeIncomeSources() {
        if (!window.transactions) return [];
        
        const sources = {};
        window.transactions
            .filter(t => t.type === 'income')
            .forEach(t => {
                sources[t.category] = (sources[t.category] || 0) + t.amount;
            });
        
        return Object.entries(sources)
            .map(([source, amount]) => ({ source, amount }))
            .sort((a, b) => b.amount - a.amount);
    }
    
    analyzeExpenseCategories() {
        if (!window.transactions) return [];
        
        const categories = {};
        window.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                categories[t.category] = (categories[t.category] || 0) + t.amount;
            });
        
        return Object.entries(categories)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);
    }
    
    analyzeLiquidityTrend(cashFlowData) {
        if (cashFlowData.length < 2) return 'مستقر';
        
        const lastThree = cashFlowData.slice(-3);
        const trend = lastThree[2].cumulative - lastThree[0].cumulative;
        
        if (trend > lastThree[0].cumulative * 0.1) return 'تحسن';
        if (trend < -lastThree[0].cumulative * 0.1) return 'تراجع';
        return 'مستقر';
    }
    
    // ==================== إدارة التقارير ====================
    saveReport(report) {
        // تنظيف التقارير القديمة
        this.cleanupOldReports();
        
        // إضافة التقرير الجديد
        this.reports.unshift(report);
        this.saveData();
        
        return report;
    }
    
    getReport(id) {
        return this.reports.find(r => r.id === id);
    }
    
    getRecentReports(limit = 10) {
        return this.reports.slice(0, limit);
    }
    
    deleteReport(id) {
        const index = this.reports.findIndex(r => r.id === id);
        if (index !== -1) {
            this.reports.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }
    
    cleanupOldReports() {
        const retentionDays = this.settings.retentionDays;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        
        this.reports = this.reports.filter(report => {
            const reportDate = new Date(report.generatedAt);
            return reportDate > cutoffDate;
        });
        
        this.saveData();
    }
    
    // ==================== إدارة البيانات ====================
    loadData() {
        const saved = localStorage.getItem('financialReports');
        if (saved) {
            try {
                this.reports = JSON.parse(saved);
            } catch (error) {
                console.error('Error loading reports:', error);
                this.reports = [];
            }
        }
        
        const savedSettings = localStorage.getItem('reportSettings');
        if (savedSettings) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            } catch (error) {
                console.error('Error loading report settings:', error);
            }
        }
    }
    
    saveData() {
        localStorage.setItem('financialReports', JSON.stringify(this.reports));
        localStorage.setItem('reportSettings', JSON.stringify(this.settings));
    }
    
    // ==================== واجهة المستخدم ====================
    generateHTMLReport(report, template) {
        const colors = template.colors;
        
        return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title} - المحاسب الشخصي</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${template.fonts.primary};
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
            padding: 20px;
        }
        
        .report-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .report-header {
            background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .report-header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 800;
        }
        
        .report-header .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        
        .report-meta {
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
            margin-top: 20px;
        }
        
        .meta-item {
            background: rgba(255,255,255,0.1);
            padding: 10px 20px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
        }
        
        .report-body {
            padding: 40px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section-header {
            border-bottom: 3px solid ${colors.primary};
            padding-bottom: 10px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .section-header h2 {
            color: ${colors.primary};
            font-size: 1.8rem;
        }
        
        .section-header i {
            font-size: 1.5rem;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            border-left: 4px solid;
            transition: transform 0.3s;
        }
        
        .summary-card:hover {
            transform: translateY(-5px);
        }
        
        .summary-card.income { border-color: ${colors.success}; }
        .summary-card.expense { border-color: ${colors.danger}; }
        .summary-card.savings { border-color: ${colors.warning}; }
        .summary-card.net-worth { border-color: ${colors.primary}; }
        
        .summary-card h3 {
            font-size: 2rem;
            margin: 10px 0;
            font-weight: 700;
        }
        
        .summary-card p {
            color: #666;
            font-size: 0.9rem;
        }
        
        .insights-container {
            display: grid;
            gap: 15px;
        }
        
        .insight {
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid;
        }
        
        .insight.success {
            background: #d4edda;
            border-color: ${colors.success};
            color: #155724;
        }
        
        .insight.warning {
            background: #fff3cd;
            border-color: ${colors.warning};
            color: #856404;
        }
        
        .insight.danger {
            background: #f8d7da;
            border-color: ${colors.danger};
            color: #721c24;
        }
        
        .insight.info {
            background: #d1ecf1;
            border-color: ${colors.accent};
            color: #0c5460;
        }
        
        .recommendations {
            background: #e8f4fd;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
        }
        
        .recommendation-item {
            padding: 10px 0;
            border-bottom: 1px solid rgba(0,0,0,0.1);
        }
        
        .recommendation-item:last-child {
            border-bottom: none;
        }
        
        .priority-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            margin-left: 10px;
        }
        
        .priority-urgent { background: ${colors.danger}; color: white; }
        .priority-high { background: ${colors.warning}; color: black; }
        .priority-medium { background: ${colors.accent}; color: white; }
        .priority-low { background: #6c757d; color: white; }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        th, td {
            padding: 12px;
            text-align: right;
            border-bottom: 1px solid #dee2e6;
        }
        
        th {
            background: #f8f9fa;
            font-weight: 700;
            color: ${colors.primary};
        }
        
        tr:hover {
            background: #f8f9fa;
        }
        
        .charts-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .chart-placeholder {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            color: #666;
            height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .report-footer {
            text-align: center;
            padding: 30px;
            background: #f8f9fa;
            color: #666;
            border-top: 1px solid #dee2e6;
            margin-top: 40px;
        }
        
        .footer-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .footer-logo img {
            height: 30px;
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .report-container {
                box-shadow: none;
                border-radius: 0;
            }
            
            .no-print {
                display: none;
            }
        }
        
        @media (max-width: 768px) {
            .report-header {
                padding: 20px;
            }
            
            .report-header h1 {
                font-size: 1.8rem;
            }
            
            .report-body {
                padding: 20px;
            }
            
            .summary-grid {
                grid-template-columns: 1fr;
            }
            
            .charts-container {
                grid-template-columns: 1fr;
            }
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="report-container">
        <div class="report-header">
            <h1>${report.title}</h1>
            <div class="subtitle">المحاسب الشخصي المتكامل</div>
            <div class="report-meta">
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    ${new Date(report.generatedAt).toLocaleDateString('ar-SA', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    ${new Date(report.generatedAt).toLocaleTimeString('ar-SA')}
                </div>
                <div class="meta-item">
                    <i class="fas fa-chart-line"></i>
                    ${report.period}
                </div>
            </div>
        </div>
        
        <div class="report-body">
            ${this.generateReportSections(report)}
        </div>
        
        <div class="report-footer">
            <div class="footer-logo">
                <i class="fas fa-calculator" style="color: ${colors.primary}; font-size: 1.5rem;"></i>
                <span style="font-weight: bold; color: ${colors.primary};">المحاسب الشخصي المتكامل</span>
            </div>
            <p>تم إنشاء هذا التقرير تلقائياً. يوصى بمراجعة شهريّة وتعديل الخطط المالية بناءً على النتائج.</p>
            <p class="no-print">للطباعة: استخدم Ctrl+P أو Command+P</p>
        </div>
    </div>
    
    <script>
        // وظائف الطباعة
        window.addEventListener('load', function() {
            // الطباعة التلقائية إذا كان في نافذة جديدة
            if (window.opener === null) {
                window.print();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                window.print();
            }
        });
    </script>
</body>
</html>`;
    }
    
    generateReportSections(report) {
        let sections = '';
        
        // قسم الملخص التنفيذي
        if (report.executiveSummary) {
            sections += `
                <div class="section">
                    <div class="section-header">
                        <i class="fas fa-chart-line"></i>
                        <h2>الملخص التنفيذي</h2>
                    </div>
                    <div class="summary-grid">
                        <div class="summary-card">
                            <p>الصحة المالية</p>
                            <h3 style="color: ${this.getHealthColor(report.executiveSummary.overallHealth)}">
                                ${report.executiveSummary.overallHealth}
                            </h3>
                        </div>
                    </div>
                    
                    ${report.executiveSummary.keyAchievements.length > 0 ? `
                        <h3><i class="fas fa-trophy"></i> الإنجازات الرئيسية</h3>
                        <ul style="margin: 15px 0 15px 20px;">
                            ${report.executiveSummary.keyAchievements.map(achievement => `
                                <li>${achievement}</li>
                            `).join('')}
                        </ul>
                    ` : ''}
                    
                    ${report.executiveSummary.areasForImprovement.length > 0 ? `
                        <h3><i class="fas fa-tools"></i> مجالات التحسين</h3>
                        <ul style="margin: 15px 0 15px 20px;">
                            ${report.executiveSummary.areasForImprovement.map(area => `
                                <li>${area}</li>
                            `).join('')}
                        </ul>
                    ` : ''}
                    
                    ${report.executiveSummary.nextSteps.length > 0 ? `
                        <h3><i class="fas fa-road"></i> الخطوات التالية</h3>
                        <ul style="margin: 15px 0 15px 20px;">
                            ${report.executiveSummary.nextSteps.map(step => `
                                <li>${step}</li>
                            `).join('')}
                        </ul>
                    ` : ''}
                </div>
            `;
        }
        
        // قسم المؤشرات الرئيسية
        if (report.keyMetrics) {
            sections += `
                <div class="section">
                    <div class="section-header">
                        <i class="fas fa-chart-bar"></i>
                        <h2>المؤشرات الرئيسية</h2>
                    </div>
                    <div class="summary-grid">
                        ${Object.entries(report.keyMetrics).map(([key, value]) => `
                            <div class="summary-card">
                                <p>${this.translateMetric(key)}</p>
                                <h3>${typeof value === 'number' ? value.toFixed(1) + (key.includes('Rate') || key.includes('Progress') ? '%' : '') : value}</h3>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // قسم الملخص المالي
        if (report.summary) {
            sections += `
                <div class="section">
                    <div class="section-header">
                        <i class="fas fa-money-bill-wave"></i>
                        <h2>الملخص المالي</h2>
                    </div>
                    <div class="summary-grid">
                        <div class="summary-card income">
                            <p>إجمالي الدخل</p>
                            <h3>${report.summary.income?.toFixed(2) || 0} ر.س</h3>
                        </div>
                        <div class="summary-card expense">
                            <p>إجمالي المصروفات</p>
                            <h3>${report.summary.expenses?.toFixed(2) || 0} ر.س</h3>
                        </div>
                        <div class="summary-card savings">
                            <p>المدخرات</p>
                            <h3>${report.summary.savings?.toFixed(2) || 0} ر.س</h3>
                        </div>
                        <div class="summary-card net-worth">
                            <p>صافي القيمة</p>
                            <h3>${report.summary.netWorth?.toFixed(2) || 0} ر.س</h3>
                        </div>
                    </div>
                    
                    ${report.summary.metrics ? `
                        <table>
                            <thead>
                                <tr>
                                    <th>المؤشر</th>
                                    <th>القيمة</th>
                                    <th>التقييم</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(report.summary.metrics).map(([key, value]) => `
                                    <tr>
                                        <td>${this.translateMetric(key)}</td>
                                        <td>${typeof value === 'number' ? value.toFixed(2) + (key.includes('Ratio') ? '%' : '') : value}</td>
                                        <td>${this.evaluateMetric(key, value)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : ''}
                </div>
            `;
        }
        
        // قسم الرؤى
        if (report.insights && report.insights.length > 0) {
            sections += `
                <div class="section">
                    <div class="section-header">
                        <i class="fas fa-lightbulb"></i>
                        <h2>الرؤى والتحليلات</h2>
                    </div>
                    <div class="insights-container">
                        ${report.insights.map(insight => `
                            <div class="insight ${insight.type}">
                                <strong>${insight.title}:</strong> ${insight.message}
                                ${insight.suggestion ? `<br><small><strong>اقتراح:</strong> ${insight.suggestion}</small>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // قسم التوصيات
        if (report.recommendations && report.recommendations.length > 0) {
            sections += `
                <div class="section">
                    <div class="section-header">
                        <i class="fas fa-list-check"></i>
                        <h2>التوصيات وخطة العمل</h2>
                    </div>
                    <div class="recommendations">
                        ${report.recommendations.map(rec => `
                            <div class="recommendation-item">
                                <strong>${rec.action}</strong>
                                <span class="priority-badge priority-${rec.priority}">${this.translatePriority(rec.priority)}</span>
                                <div style="margin-top: 5px; color: #666;">
                                    ${rec.details}
                                    ${rec.timeline ? `<br><small><strong>الجدول الزمني:</strong> ${rec.timeline}</small>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // قسم خطة العمل
        if (report.actionPlan) {
            sections += `
                <div class="section">
                    <div class="section-header">
                        <i class="fas fa-calendar-check"></i>
                        <h2>خطة العمل الزمنية</h2>
                    </div>
                    
                    ${report.actionPlan.immediateActions.length > 0 ? `
                        <h3><i class="fas fa-bolt text-danger"></i> إجراءات عاجلة (خلال أسبوع)</h3>
                        <ul style="margin: 15px 0 25px 20px;">
                            ${report.actionPlan.immediateActions.map(action => `
                                <li>${action.action} - ${action.details}</li>
                            `).join('')}
                        </ul>
                    ` : ''}
                    
                    ${report.actionPlan.shortTermGoals.length > 0 ? `
                        <h3><i class="fas fa-flag text-warning"></i> أهداف قصيرة المدى (1-3 أشهر)</h3>
                        <ul style="margin: 15px 0 25px 20px;">
                            ${report.actionPlan.shortTermGoals.map(goal => `
                                <li>${goal.action} - ${goal.details}</li>
                            `).join('')}
                        </ul>
                    ` : ''}
                    
                    ${report.actionPlan.mediumTermGoals.length > 0 ? `
                        <h3><i class="fas fa-chart-line text-primary"></i> أهداف متوسطة المدى (3-6 أشهر)</h3>
                        <ul style="margin: 15px 0 25px 20px;">
                            ${report.actionPlan.mediumTermGoals.map(goal => `
                                <li>${goal.action} - ${goal.details}</li>
                            `).join('')}
                        </ul>
                    ` : ''}
                    
                    ${report.actionPlan.longTermGoals.length > 0 ? `
                        <h3><i class="fas fa-mountain text-success"></i> أهداف طويلة المدى (6-12 شهر)</h3>
                        <ul style="margin: 15px 0 25px 20px;">
                            ${report.actionPlan.longTermGoals.map(goal => `
                                <li>${goal.action} - ${goal.details}</li>
                            `).join('')}
                        </ul>
                    ` : ''}
                </div>
            `;
        }
        
        // قسم الرسوم البيانية
        if (report.charts) {
            sections += `
                <div class="section">
                    <div class="section-header">
                        <i class="fas fa-chart-area"></i>
                        <h2>الرسوم البيانية والتصورات</h2>
                    </div>
                    <div class="charts-container">
                        ${Object.entries(report.charts).map(([chartName, chartData]) => `
                            <div class="chart-placeholder">
                                <i class="fas fa-chart-${chartName.includes('Trend') ? 'line' : 'pie'} fa-3x" style="color: #dee2e6; margin-bottom: 15px;"></i>
                                <div>
                                    <strong>${this.translateChartName(chartName)}</strong>
                                    <p>سيظهر الرسم البياني في النسخة التفاعلية</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        return sections;
    }
    
    translateMetric(metric) {
        const translations = {
            'financialHealth': 'الصحة المالية',
            'savingsRate': 'معدل المدخرات',
            'budgetUtilization': 'استخدام الميزانية',
            'goalProgress': 'تقدم الأهداف',
            'cashFlowStability': 'استقرار التدفق النقدي',
            'liquidityRatio': 'نسبة السيولة',
            'expenseToIncomeRatio': 'نسبة المصروف إلى الدخل',
            'debtRatio': 'نسبة الدين'
        };
        return translations[metric] || metric;
    }
    
    evaluateMetric(metric, value) {
        if (typeof value !== 'number') return value;
        
        switch(metric) {
            case 'financialHealthScore':
                if (value >= 80) return 'ممتاز';
                if (value >= 60) return 'جيد';
                if (value >= 40) return 'متوسط';
                return 'يحتاج تحسين';
                
            case 'savingsRate':
                if (value >= 20) return 'ممتاز';
                if (value >= 10) return 'جيد';
                if (value >= 0) return 'مقبول';
                return 'سلبي';
                
            case 'debtRatio':
                if (value <= 30) return 'ممتاز';
                if (value <= 50) return 'جيد';
                if (value <= 70) return 'متوسط';
                return 'مرتفع';
                
            default:
                return value.toFixed(1);
        }
    }
    
    translatePriority(priority) {
        const translations = {
            'urgent': 'عاجل',
            'high': 'عالي',
            'medium': 'متوسط',
            'low': 'منخفض'
        };
        return translations[priority] || priority;
    }
    
    translateChartName(chartName) {
        const translations = {
            'incomeVsExpense': 'الدخل مقابل المصروفات',
            'categoryDistribution': 'توزيع الفئات',
            'monthlyTrend': 'الاتجاه الشهري',
            'cashFlowTrend': 'اتجاه التدفق النقدي'
        };
        return translations[chartName] || chartName;
    }
    
    getHealthColor(health) {
        switch(health) {
            case 'ممتاز': return '#2ec4b6';
            case 'جيد': return '#4cc9f0';
            case 'متوسط': return '#ff9f1c';
            case 'يحتاج تحسين': return '#e71d36';
            default: return '#6c757d';
        }
    }
}

// ==================== التهيئة العالمية ====================
const reportGenerator = new ReportGenerator();

// الدوال العامة
window.generateReport = function(type = 'comprehensive') {
    try {
        const report = reportGenerator.generateReport(type);
        reportGenerator.exportReport(report.id, 'html');
        return report;
    } catch (error) {
        console.error('Error generating report:', error);
        alert(`خطأ في إنشاء التقرير: ${error.message}`);
        return null;
    }
};

window.exportReport = function(format = 'pdf') {
    const reports = reportGenerator.getRecentReports(1);
    if (reports.length > 0) {
        reportGenerator.exportReport(reports[0].id, format);
    } else {
        const report = reportGenerator.generateReport('comprehensive');
        reportGenerator.exportReport(report.id, format);
    }
};

window.showReportsSection = function() {
    showSection('reports');
    // يمكن إضافة منطق لعرض قائمة التقارير
};

// التصدير
window.reportGenerator = reportGenerator;

// إنشاء تقرير تلقائي عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    if (reportGenerator.settings.autoGenerate) {
        setTimeout(() => {
            const lastReport = reportGenerator.getRecentReports(1)[0];
            const lastReportDate = lastReport ? new Date(lastReport.generatedAt) : null;
            const today = new Date();
            
            // إنشاء تقرير إذا مر أسبوع منذ آخر تقرير
            if (!lastReportDate || (today - lastReportDate) > 7 * 24 * 60 * 60 * 1000) {
                console.log('Generating automatic weekly report...');
                reportGenerator.generateReport('financial_summary', { 
                    period: 'weekly',
                    save: true 
                });
            }
        }, 5000);
    }
});

console.log('✅ Report Generator loaded successfully');
