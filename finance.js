/**
 * Finance Calculator - Simplified Version
 * Compatible with new design - No conflict with app.js
 * الإصدار: 3.0.0 (مبسط)
 */

console.log('✅ Finance Calculator loaded (simplified version)');

// ==================== نسخة مبسطة لمنع التعارض ====================

class SimpleFinanceCalculator {
    constructor() {
        console.log('🔧 Simple Finance Calculator initialized');
    }
    
    // دالة حساب القروض المبسطة (بدون تعارض مع app.js)
    calculatePersonalLoanSimple(amount, months, interestRate) {
        const monthlyRate = interestRate / 100 / 12;
        const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                             (Math.pow(1 + monthlyRate, months) - 1);
        const totalPayment = monthlyPayment * months;
        const totalInterest = totalPayment - amount;
        
        return {
            loanAmount: amount,
            termMonths: months,
            annualRate: interestRate,
            monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
            totalPayment: parseFloat(totalPayment.toFixed(2)),
            totalInterest: parseFloat(totalInterest.toFixed(2)),
            interestPercentage: parseFloat((totalInterest / amount * 100).toFixed(2))
        };
    }
    
    // دالة لتوليد جدول السداد (ميزة إضافية)
    generatePaymentSchedule(amount, months, interestRate) {
        const monthlyRate = interestRate / 100 / 12;
        const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                             (Math.pow(1 + monthlyRate, months) - 1);
        
        let schedule = [];
        let remainingBalance = amount;
        let totalInterestPaid = 0;
        
        for (let i = 1; i <= months; i++) {
            const interest = remainingBalance * monthlyRate;
            const principal = monthlyPayment - interest;
            remainingBalance -= principal;
            totalInterestPaid += interest;
            
            schedule.push({
                month: i,
                payment: parseFloat(monthlyPayment.toFixed(2)),
                principal: parseFloat(principal.toFixed(2)),
                interest: parseFloat(interest.toFixed(2)),
                remainingBalance: parseFloat(Math.max(remainingBalance, 0).toFixed(2)),
                totalInterestPaid: parseFloat(totalInterestPaid.toFixed(2))
            });
            
            if (remainingBalance <= 0) break;
        }
        
        return schedule;
    }
    
    // نصائح مالية
    getFinancialTips(type, amount, months, rate) {
        const tips = [];
        
        if (type === 'loan') {
            if (rate > 10) {
                tips.push('💡 النسبة مرتفعة، ابحث عن عروض أفضل');
            }
            if (months > 60) {
                tips.push('⏳ المدة طويلة، الفائدة الإجمالية ستكون كبيرة');
            }
            const monthlyPayment = (amount * (rate/100/12) * Math.pow(1 + (rate/100/12), months)) / 
                                 (Math.pow(1 + (rate/100/12), months) - 1);
            if (monthlyPayment > 5000) {
                tips.push('💰 القسط مرتفع، تأكد من قدرتك على السداد');
            }
        }
        
        if (type === 'savings') {
            if (rate < 5) {
                tips.push('📈 العائد متحفظ، فكر في خيارات استثمارية أخرى');
            }
            if (amount < 1000) {
                tips.push('💪 ابدأ بأي مبلغ، المهم الانتظام');
            }
        }
        
        return tips;
    }
    
    // تنسيق العملة
    formatCurrency(amount) {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 2
        }).format(amount);
    }
}

// ==================== التهيئة والتصدير ====================
const simpleFinanceCalculator = new SimpleFinanceCalculator();

// تصدير الدوال للاستخدام في واجهات متقدمة
window.simpleFinanceCalculator = simpleFinanceCalculator;

// ملاحظة: دالة calculateLoan الرئيسية تبقى في app.js
console.log('✅ Simple Finance Calculator ready (will not conflict with main app)');

// ==================== دوال مساعدة إضافية ====================

// حساب نسبة الدخل إلى القسط
window.calculatePaymentToIncomeRatio = function(monthlyPayment, monthlyIncome) {
    if (!monthlyIncome || monthlyIncome <= 0) return 0;
    return (monthlyPayment / monthlyIncome * 100).toFixed(1);
};

// حساب الوقت اللازم للوصول إلى هدف التوفير
window.calculateTimeToGoal = function(currentAmount, targetAmount, monthlySaving, interestRate = 5) {
    if (monthlySaving <= 0) return Infinity;
    
    const monthlyRate = interestRate / 100 / 12;
    let months = 0;
    let amount = currentAmount;
    
    while (amount < targetAmount && months < 600) { // حد أقصى 50 سنة
        amount = amount * (1 + monthlyRate) + monthlySaving;
        months++;
    }
    
    return {
        months: months,
        years: (months / 12).toFixed(1),
        finalAmount: amount.toFixed(2)
    };
};

// تحليل القدرة على السداد
window.analyzeAffordability = function(monthlyPayment, monthlyIncome, obligations = 0) {
    const totalObligations = monthlyPayment + obligations;
    const ratio = (totalObligations / monthlyIncome) * 100;
    
    let status = 'جيدة';
    let color = 'success';
    
    if (ratio > 50) {
        status = 'خطيرة';
        color = 'danger';
    } else if (ratio > 40) {
        status = 'مرتفعة';
        color = 'warning';
    } else if (ratio > 30) {
        status = 'متوسطة';
        color = 'info';
    }
    
    return {
        ratio: ratio.toFixed(1),
        status: status,
        color: color,
        recommendation: ratio > 40 ? 'تعتبر مرتفعة، خفض المبلغ أو ابحث عن تمويل أفضل' :
                    ratio > 30 ? 'ضمن الحدود المقبولة، لكن يمكن تحسينها' :
                    'ممتازة، ضمن الحدود الموصى بها'
    };
};
