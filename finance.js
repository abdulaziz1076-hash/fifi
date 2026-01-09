/**
 * المحاسب الشخصي - حاسبات مالية متقدمة
 * الإصدار: 2.0.0
 * وحدات: القروض، العقار، التوفير، الاستثمار
 */

class FinanceCalculator {
    constructor() {
        this.calculationHistory = [];
        this.loadHistory();
        this.initCalculators();
    }
    
    // ==================== التهيئة ====================
    initCalculators() {
        this.setupLoanCalculator();
        this.setupMortgageCalculator();
        this.setupSavingsCalculator();
        this.setupInvestmentCalculator();
    }
    
    // ==================== حاسبة القروض الشخصية ====================
    setupLoanCalculator() {
        const loanAmount = document.getElementById('loanAmount');
        const loanTerm = document.getElementById('loanTermRange');
        const interestRate = document.getElementById('interestRateRange');
        
        if (loanAmount && loanTerm && interestRate) {
            // تحديث القيم المعروضة
            loanTerm.addEventListener('input', (e) => {
                document.getElementById('loanTermValue').textContent = `${e.target.value} أشهر`;
            });
            
            interestRate.addEventListener('input', (e) => {
                document.getElementById('interestRateValue').textContent = `${e.target.value}%`;
            });
            
            // تعيين قيم افتراضية ذكية
            loanAmount.value = 50000;
            loanTerm.value = 36;
            interestRate.value = 8;
            
            document.getElementById('loanTermValue').textContent = '36 أشهر';
            document.getElementById('interestRateValue').textContent = '8%';
        }
    }
    
    calculatePersonalLoan(amount, months, interestRate, options = {}) {
        // التحقق من المدخلات
        if (amount <= 0 || months <= 0 || interestRate < 0) {
            throw new Error('قيم الإدخال غير صالحة');
        }
        
        const monthlyRate = interestRate / 100 / 12;
        
        // حساب القسط الشهري
        let monthlyPayment;
        if (monthlyRate === 0) {
            monthlyPayment = amount / months;
        } else {
            monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                           (Math.pow(1 + monthlyRate, months) - 1);
        }
        
        const totalPayment = monthlyPayment * months;
        const totalInterest = totalPayment - amount;
        
        // إعداد الرسوم الإضافية
        const fees = options.fees || {
            processing: amount * 0.01, // 1% رسوم معالجة
            insurance: amount * 0.005, // 0.5% تأمين
            other: 0
        };
        
        const totalFees = Object.values(fees).reduce((a, b) => a + b, 0);
        
        const result = {
            // المعلومات الأساسية
            loanAmount: amount,
            termMonths: months,
            annualRate: interestRate,
            
            // النتائج
            monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
            totalPayment: parseFloat(totalPayment.toFixed(2)),
            totalInterest: parseFloat(totalInterest.toFixed(2)),
            totalCost: parseFloat((totalPayment + totalFees).toFixed(2)),
            
            // النسب
            interestPercentage: parseFloat((totalInterest / amount * 100).toFixed(2)),
             nominalRate: interestRate, // المعدل الاسمي (المدخل)
             effectiveRate: parseFloat(this.calculateEffectiveRate(amount, monthlyPayment, months).toFixed(2)), // المعدل الفعلي مع الرسوم
            
            // الرسوم
            fees: fees,
            totalFees: parseFloat(totalFees.toFixed(2)),
            
            // جدول السداد
            schedule: options.generateSchedule ? this.generatePaymentSchedule(amount, months, interestRate) : [],
            
            // نصائح
            advice: this.getLoanAdvice(amount, months, interestRate, monthlyPayment),
            
            // بيانات إضافية
            timestamp: new Date().toISOString(),
            type: 'personal_loan'
        };
        
        return result;
    }
    
    calculateEffectiveRate(loanAmount, monthlyPayment, months) {
        // حساب معدل الفائدة الفعلي باستخدام التقريب
        let rate = 0.01; // بدءاً من 1%
        let precision = 0.0001;
        let maxIterations = 100;
        
        for (let i = 0; i < maxIterations; i++) {
            const monthlyRate = rate / 12;
            const calculatedPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                                     (Math.pow(1 + monthlyRate, months) - 1);
            
            const diff = calculatedPayment - monthlyPayment;
            
            if (Math.abs(diff) < precision) {
                break;
            }
            
            // تعديل المعدل
            if (diff > 0) {
                rate -= rate * 0.1;
            } else {
                rate += rate * 0.1;
            }
        }
        
        return rate * 100;
    }
    
    generatePaymentSchedule(amount, months, interestRate) {
        const monthlyRate = interestRate / 100 / 12;
        const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                             (Math.pow(1 + monthlyRate, months) - 1);
        
        let schedule = [];
        let remainingBalance = amount;
        let totalInterestPaid = 0;
        let totalPrincipalPaid = 0;
        
        for (let i = 1; i <= months; i++) {
            const interest = remainingBalance * monthlyRate;
            const principal = monthlyPayment - interest;
            remainingBalance -= principal;
            
            totalInterestPaid += interest;
            totalPrincipalPaid += principal;
            
            schedule.push({
                month: i,
                payment: parseFloat(monthlyPayment.toFixed(2)),
                principal: parseFloat(principal.toFixed(2)),
                interest: parseFloat(interest.toFixed(2)),
                remainingBalance: parseFloat(Math.max(remainingBalance, 0).toFixed(2)),
                totalInterestPaid: parseFloat(totalInterestPaid.toFixed(2)),
                totalPrincipalPaid: parseFloat(totalPrincipalPaid.toFixed(2)),
                percentagePaid: parseFloat(((totalPrincipalPaid / amount) * 100).toFixed(2))
            });
            
            if (remainingBalance <= 0) break;
        }
        
        return schedule;
    }
    
    getLoanAdvice(amount, months, rate, monthlyPayment) {
        const advice = [];
        
        // نسبة الدخل إلى القسط
        const estimatedIncome = 10000; // يمكن جعل هذا ديناميكياً
        const paymentRatio = (monthlyPayment / estimatedIncome) * 100;
        
        if (paymentRatio > 40) {
            advice.push({
                level: 'danger',
                message: 'القسط الشهري مرتفع جداً بالنسبة لدخلك',
                suggestion: 'فكر في زيادة مدة السداد أو تقليل مبلغ القرض'
            });
        } else if (paymentRatio > 30) {
            advice.push({
                level: 'warning',
                message: 'القسط الشهري مرتفع نسبياً',
                suggestion: 'تأكد من قدرتك على السداد'
            });
        }
        
        // مدة القرض
        if (months > 60) {
            advice.push({
                level: 'warning',
                message: 'مدة القرض طويلة',
                suggestion: 'المدى الطويل يزيد الفائدة الإجمالية'
            });
        }
        
        // معدل الفائدة
        if (rate > 15) {
            advice.push({
                level: 'danger',
                message: 'معدل فائدة مرتفع',
                suggestion: 'ابحث عن عروض أفضل أو حسّن تصنيفك الائتماني'
            });
        } else if (rate > 10) {
            advice.push({
                level: 'warning',
                message: 'معدل فائدة متوسط',
                suggestion: 'يمكنك الحصول على معدلات أفضل'
            });
        }
        
        return advice;
    }
    
    // ==================== حاسبة التمويل العقاري ====================
    calculateMortgage(propertyPrice, downPayment, years, interestRate, options = {}) {
        const loanAmount = propertyPrice - downPayment;
        const months = years * 12;
        
        if (loanAmount <= 0) {
            throw new Error('المبلغ المتبقي بعد الدفعة الأولى غير صالح');
        }
        
        // حساب القرض الأساسي
        const loanResult = this.calculatePersonalLoan(loanAmount, months, interestRate, {
            ...options,
            generateSchedule: false
        });
        
        // رسوم عقارية إضافية
        const propertyFees = {
            registration: propertyPrice * 0.05, // 5% رسوم تسجيل
            valuation: 2000,
            brokerage: propertyPrice * 0.02, // 2% وساطة
            maintenance: options.annualMaintenance || (propertyPrice * 0.01) // 1% صيانة سنوية
        };
        
        const totalFees = Object.values(propertyFees).reduce((a, b) => a + b, 0);
        
        const result = {
            // معلومات العقار
            propertyPrice: propertyPrice,
            downPayment: downPayment,
            downPaymentPercentage: parseFloat((downPayment / propertyPrice * 100).toFixed(2)),
            loanAmount: loanAmount,
            loanToValue: parseFloat((loanAmount / propertyPrice * 100).toFixed(2)),
            
            // شروط التمويل
            termYears: years,
            termMonths: months,
            annualRate: interestRate,
            
            // النتائج المالية
            monthlyPayment: loanResult.monthlyPayment,
            totalPayment: loanResult.totalPayment,
            totalInterest: loanResult.totalInterest,
            
            // التكاليف الإجمالية
            totalCost: parseFloat((propertyPrice + loanResult.totalInterest + totalFees).toFixed(2)),
            upfrontCost: parseFloat((downPayment + propertyFees.registration + propertyFees.brokerage).toFixed(2)),
            
            // الرسوم
            fees: propertyFees,
            totalFees: parseFloat(totalFees.toFixed(2)),
            
            // التحليل
            affordability: this.calculateAffordability(loanResult.monthlyPayment, propertyPrice),
            roi: options.expectedRent ? this.calculateROI(propertyPrice, options.expectedRent) : null,
            
            // نصائح
            advice: this.getMortgageAdvice(downPayment, loanAmount, years, interestRate),
            
            type: 'mortgage',
            timestamp: new Date().toISOString()
        };
        
        return result;
    }
    
    calculateAffordability(monthlyPayment, propertyPrice) {
        const scenarios = [
            { income: 10000, maxPayment: 4000 },
            { income: 15000, maxPayment: 6000 },
            { income: 20000, maxPayment: 8000 },
            { income: 30000, maxPayment: 12000 }
        ];
        
        const affordableIncomes = scenarios
            .filter(s => monthlyPayment <= s.maxPayment)
            .map(s => s.income);
        
        return {
            monthlyPayment,
            minRequiredIncome: affordableIncomes.length > 0 ? Math.min(...affordableIncomes) : null,
            affordabilityScore: affordableIncomes.length > 0 ? 'جيدة' : 'ضعيفة',
            recommendation: affordableIncomes.length > 0 ? 
                'الدفعة ضمن الحدود المعقولة' : 
                'الدفعة أعلى من القدرة المتوقعة'
        };
    }
    
    calculateROI(propertyPrice, annualRent) {
        const grossYield = (annualRent / propertyPrice) * 100;
        const netYield = grossYield * 0.7; // افتراض 30% مصاريف
        const yearsToBreakEven = 100 / netYield;
        
        return {
            grossYield: parseFloat(grossYield.toFixed(2)),
            netYield: parseFloat(netYield.toFixed(2)),
            annualRent: annualRent,
            monthlyRent: parseFloat((annualRent / 12).toFixed(2)),
            yearsToBreakEven: parseFloat(yearsToBreakEven.toFixed(1))
        };
    }
    
    getMortgageAdvice(downPayment, loanAmount, years, rate) {
        const advice = [];
        const downPaymentPercentage = (downPayment / (downPayment + loanAmount)) * 100;
        
        if (downPaymentPercentage < 20) {
            advice.push({
                level: 'warning',
                message: 'الدفعة الأولى أقل من 20%',
                suggestion: 'زيادة الدفعة الأولى تقلل الفائدة والتأمين'
            });
        }
        
        if (years > 25) {
            advice.push({
                level: 'info',
                message: 'مدة التمويل طويلة',
                suggestion: 'المدى الطويل يرفع الفائدة الإجمالية بشكل كبير'
            });
        }
        
        if (rate > 6) {
            advice.push({
                level: 'warning',
                message: 'معدل فائدة مرتفع للعقار',
                suggestion: 'تأكد من استقرار المعدل أو اختر معدل ثابت'
            });
        }
        
        return advice;
    }
    
    // ==================== حاسبة التوفير والاستثمار ====================
    calculateSavings(initialAmount, monthlyDeposit, years, annualReturn, options = {}) {
        const months = years * 12;
        const monthlyRate = annualReturn / 100 / 12;
        
        let futureValue = initialAmount;
        const monthlyValues = [];
        const deposits = [];
        const earnings = [];
        
        for (let i = 0; i < months; i++) {
            // إضافة العائد الشهري
            futureValue = futureValue * (1 + monthlyRate);
            
            // إضافة الإيداع الشهري
            futureValue += monthlyDeposit;
            
            // تتبع القيم
            if (i % 12 === 0 || i === months - 1) {
                const totalDeposits = initialAmount + (monthlyDeposit * (i + 1));
                const totalEarnings = futureValue - totalDeposits;
                
                monthlyValues.push({
                    year: Math.floor(i / 12) + 1,
                    month: i + 1,
                    value: parseFloat(futureValue.toFixed(2))
                });
                
                deposits.push(totalDeposits);
                earnings.push(totalEarnings);
            }
        }
        
        const totalDeposits = initialAmount + (monthlyDeposit * months);
        const totalEarnings = futureValue - totalDeposits;
        
        // حساب القوة الشرائية مع التضخم
        const inflationRate = options.inflationRate || 3;
        const realValue = futureValue / Math.pow(1 + inflationRate/100, years);
        
        const result = {
            // المدخلات
            initialAmount: initialAmount,
            monthlyDeposit: monthlyDeposit,
            years: years,
            annualReturn: annualReturn,
            
            // النتائج
            finalAmount: parseFloat(futureValue.toFixed(2)),
            totalDeposits: parseFloat(totalDeposits.toFixed(2)),
            totalEarnings: parseFloat(totalEarnings.toFixed(2)),
            
            // النسب
            earningsPercentage: parseFloat((totalEarnings / totalDeposits * 100).toFixed(2)),
            annualizedReturn: parseFloat((Math.pow(futureValue / totalDeposits, 1/years) - 1) * 100).toFixed(2),
            
            // التضخم
            inflationAdjusted: {
                realValue: parseFloat(realValue.toFixed(2)),
                inflationRate: inflationRate,
                purchasingPowerLoss: parseFloat(((futureValue - realValue) / futureValue * 100).toFixed(2))
            },
            
            // الجدول الزمني
            timeline: monthlyValues,
            
            // الأهداف
            milestones: this.calculateMilestones(futureValue, years),
            
            // نصائح
            advice: this.getSavingsAdvice(monthlyDeposit, annualReturn, years),
            
            type: 'savings',
            timestamp: new Date().toISOString()
        };
        
        return result;
    }
    
    calculateMilestones(finalAmount, years) {
        const milestones = [];
        const targetAmounts = [
            10000, 50000, 100000, 250000, 500000, 1000000
        ];
        
        targetAmounts.forEach(amount => {
            if (finalAmount >= amount) {
                // تقدير الوقت للوصول لهذا المبلغ
                const yearsToReach = (amount / finalAmount) * years;
                
                milestones.push({
                    amount: amount,
                    reachable: true,
                    estimatedYears: parseFloat(yearsToReach.toFixed(1)),
                    percentage: parseFloat((amount / finalAmount * 100).toFixed(1))
                });
            }
        });
        
        return milestones;
    }
    
    getSavingsAdvice(monthlyDeposit, annualReturn, years) {
        const advice = [];
        
        if (monthlyDeposit < 500) {
            advice.push({
                level: 'warning',
                message: 'مبلغ التوفير الشهري منخفض',
                suggestion: 'حاول زيادة المبلغ المدخر شهرياً ولو قليلاً'
            });
        }
        
        if (annualReturn < 5) {
            advice.push({
                level: 'info',
                message: 'عائد الاستثمار متحفظ',
                suggestion: 'فكر في خيارات استثمارية ذات عائد أعلى'
            });
        }
        
        if (years < 5) {
            advice.push({
                level: 'warning',
                message: 'فترة الاستثمار قصيرة',
                suggestion: 'الاستثمار طويل الأجل يقلل المخاطر ويزيد العوائد'
            });
        }
        
        return advice;
    }
    
    // ==================== حاسبة الاستثمار ====================
    calculateInvestment(investmentType, amount, period, riskLevel = 'medium') {
        const strategies = {
            conservative: { return: 4, risk: 'منخفض', description: 'ودائع وأذون خزانة' },
            moderate: { return: 8, risk: 'متوسط', description: 'صناديق مختلطة' },
            aggressive: { return: 12, risk: 'مرتفع', description: 'أسهم وريادة أعمال' }
        };
        
        const strategy = strategies[riskLevel] || strategies.moderate;
        
        const result = this.calculateSavings(
            amount,
            0, // لا توجد إيداعات شهرية
            period,
            strategy.return,
            { inflationRate: 3 }
        );
        
        return {
            ...result,
            investmentType: investmentType,
            riskLevel: riskLevel,
            strategy: strategy,
            type: 'investment'
        };
    }
    
    // ==================== عرض النتائج ====================
    displayLoanResults(results) {
        const container = document.getElementById('loanResults');
        if (!container) return;
        
        container.innerHTML = `
            <div class="card border-0 shadow">
                <div class="card-header bg-gradient-warning text-white">
                    <h5 class="mb-0"><i class="fas fa-file-invoice-dollar me-2"></i>نتائج حساب القرض</h5>
                </div>
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <div class="card bg-light h-100">
                                <div class="card-body">
                                    <h6 class="card-title text-center mb-3">
                                        <i class="fas fa-calculator text-warning me-2"></i>التفاصيل المالية
                                    </h6>
                                    <div class="table-responsive">
                                        <table class="table table-sm">
                                            <tbody>
                                                <tr>
                                                    <td><strong>القسط الشهري</strong></td>
                                                    <td class="text-end fw-bold text-warning">${results.monthlyPayment.toFixed(2)} ر.س</td>
                                                </tr>
                                                <tr>
                                                    <td>إجمالي المبلغ المسدد</td>
                                                    <td class="text-end">${results.totalPayment.toFixed(2)} ر.س</td>
                                                </tr>
                                                <tr>
                                                    <td>إجمالي الفائدة</td>
                                                    <td class="text-end text-danger">${results.totalInterest.toFixed(2)} ر.س</td>
                                                </tr>
                                                <tr>
                                                    <td>نسبة الفائدة الإجمالية</td>
                                                    <td class="text-end">${results.interestPercentage.toFixed(2)}%</td>
                                                </tr>
                                                <tr>
                                                    <td>معدل الفائدة الفعلي</td>
                                                    <td class="text-end">${results.effectiveRate.toFixed(2)}%</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="card bg-light h-100">
                                <div class="card-body">
                                    <h6 class="card-title text-center mb-3">
                                        <i class="fas fa-lightbulb text-info me-2"></i>نصائح وتوصيات
                                    </h6>
                                    ${results.advice.length > 0 ? 
                                        results.advice.map(a => `
                                            <div class="alert alert-${a.level} py-2 mb-2">
                                                <small>
                                                    <i class="fas fa-exclamation-circle me-1"></i>
                                                    <strong>${a.message}</strong><br>
                                                    ${a.suggestion}
                                                </small>
                                            </div>
                                        `).join('') :
                                        '<p class="text-center text-muted">لا توجد ملاحظات خاصة</p>'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    ${results.schedule && results.schedule.length > 0 ? `
                        <div class="mt-4">
                            <h6 class="mb-3"><i class="fas fa-calendar-alt me-2"></i>جدول السداد</h6>
                            <div class="table-responsive">
                                <table class="table table-sm table-hover">
                                    <thead>
                                        <tr>
                                            <th>الشهر</th>
                                            <th>القسط</th>
                                            <th>الأصل</th>
                                            <th>الفائدة</th>
                                            <th>المتبقي</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${results.schedule.slice(0, 12).map(payment => `
                                            <tr>
                                                <td>${payment.month}</td>
                                                <td>${payment.payment.toFixed(2)}</td>
                                                <td>${payment.principal.toFixed(2)}</td>
                                                <td>${payment.interest.toFixed(2)}</td>
                                                <td>${payment.remainingBalance.toFixed(2)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                                ${results.schedule.length > 12 ? 
                                    '<p class="text-center text-muted">عرض 12 شهر من أصل ' + results.schedule.length + ' شهر</p>' : 
                                    ''
                                }
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="mt-4 text-center">
                        <button class="btn btn-warning me-2" onclick="financeCalculator.saveCalculation(${JSON.stringify(results).replace(/"/g, '&quot;')})">
                            <i class="fas fa-save me-1"></i>حفظ الحساب
                        </button>
                        <button class="btn btn-outline-primary" onclick="financeCalculator.printResults(${JSON.stringify(results).replace(/"/g, '&quot;')})">
                            <i class="fas fa-print me-1"></i>طباعة النتائج
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ==================== إدارة السجل ====================
    saveCalculation(results) {
        this.calculationHistory.unshift({
            ...results,
            savedAt: new Date().toISOString(),
            id: Date.now()
        });
        
        this.saveHistory();
        
        // إظهار رسالة نجاح
        this.showNotification('تم حفظ الحساب بنجاح في السجل', 'success');
        
        return this.calculationHistory[0];
    }
    
    loadHistory() {
        const saved = localStorage.getItem('financeCalculations');
        if (saved) {
            try {
                this.calculationHistory = JSON.parse(saved);
            } catch (error) {
                console.error('Error loading history:', error);
                this.calculationHistory = [];
            }
        }
    }
    
    saveHistory() {
        localStorage.setItem('financeCalculations', JSON.stringify(this.calculationHistory));
    }
    
    getRecentCalculations(limit = 10) {
        return this.calculationHistory
            .slice(0, limit)
            .sort((a, b) => new Date(b.timestamp || b.savedAt) - new Date(a.timestamp || a.savedAt));
    }
    
    // ==================== الوظائف المساعدة ====================
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            min-width: 300px;
            text-align: center;
        `;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 2
        }).format(amount);
    }
    
    printResults(results) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <title>نتائج الحساب المالي</title>
                <style>
                    body { font-family: 'Tajawal', sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .result-item { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
                    .total { font-weight: bold; font-size: 1.2em; margin-top: 20px; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>نتائج الحساب المالي</h2>
                    <p>${new Date().toLocaleDateString('ar-SA')}</p>
                </div>
                <div class="content">
                    ${Object.entries(results).map(([key, value]) => `
                        <div class="result-item">
                            <strong>${key}:</strong> ${value}
                        </div>
                    `).join('')}
                </div>
                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()">طباعة</button>
                    <button onclick="window.close()">إغلاق</button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
}

// ==================== التهيئة والتصدير ====================
const financeCalculator = new FinanceCalculator();

// الدوال العامة
window.calculateLoan = function() {
    try {
        const amount = parseFloat(document.getElementById('loanAmount').value);
        const months = parseInt(document.getElementById('loanTermRange').value);
        const interestRate = parseFloat(document.getElementById('interestRateRange').value);
        
        if (!amount || amount < 1000) {
            alert('الرجاء إدخال مبلغ قرض صحيح (أقل مبلغ 1000 ريال)');
            return;
        }
        
        const results = financeCalculator.calculatePersonalLoan(amount, months, interestRate, {
            generateSchedule: true,
            fees: {
                processing: amount * 0.01,
                insurance: amount * 0.005
            }
        });
        
        financeCalculator.displayLoanResults(results);
        
    } catch (error) {
        console.error('Error calculating loan:', error);
        alert('حدث خطأ في الحساب: ' + error.message);
    }
};

window.saveLoanCalculation = function() {
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const months = parseInt(document.getElementById('loanTermRange').value);
    const interestRate = parseFloat(document.getElementById('interestRateRange').value);
    
    const results = financeCalculator.calculatePersonalLoan(amount, months, interestRate);
    financeCalculator.saveCalculation(results);
};

window.showFinanceHistory = function() {
    const recent = financeCalculator.getRecentCalculations(10);
    // عرض السجل في واجهة مناسبة
    console.log('Recent calculations:', recent);
};

// التصدير للاستخدام في ملفات أخرى
window.financeCalculator = financeCalculator;

console.log('✅ Finance Calculator loaded successfully');
