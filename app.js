/**
 * المحاسب الشخصي المتكامل - التطبيق الرئيسي
 * الإصدار: 2.2.0 - إصلاحات كاملة
 */

// ==================== المتغيرات العالمية ====================
let transactions = [];
let categories = ['راتب', 'أكل وشرب', 'مواصلات', 'تسوق', 'ترفيه', 'صحة', 'تعليم', 'منزل'];

// ==================== التهيئة ====================
function initializeApp() {
    console.log('🚀 تهيئة التطبيق...');
    
    loadData();
    initUI();
    setupEventListeners();
    updateDashboard();
    
    console.log('✅ التطبيق جاهز');
}

function initUI() {
    // تعبئة قائمة الفئات
    populateCategorySelects();
    
    // تعيين التاريخ الحالي
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('dateInput')) {
        document.getElementById('dateInput').value = today;
    }
    
    // عرض لوحة التحكم كافتراضي
    showSection('dashboard');
}

function setupEventListeners() {
    // تحديث القيم في حاسبة القروض
    const loanTermRange = document.getElementById('loanTermRange');
    const interestRateRange = document.getElementById('interestRateRange');
    
    if (loanTermRange) {
        loanTermRange.addEventListener('input', function(e) {
            document.getElementById('loanTermValue').textContent = e.target.value + ' أشهر';
        });
    }
    
    if (interestRateRange) {
        interestRateRange.addEventListener('input', function(e) {
            document.getElementById('interestRateValue').textContent = e.target.value + '%';
        });
    }
    
    // البحث في السجل
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterTransactions(e.target.value);
        });
    }
}

// ==================== إدارة الفئات ====================
function populateCategorySelects() {
    const selects = ['categorySelect', 'editCategory'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">اختر الفئة</option>' + 
                categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }
    });
    
    updateCategoryList();
}

function addCategory() {
    const input = document.getElementById('newCategory');
    const categoryName = input.value.trim();
    
    if (!categoryName) {
        showAlert('الرجاء إدخال اسم الفئة', 'warning');
        return;
    }
    
    if (categories.includes(categoryName)) {
        showAlert('هذه الفئة موجودة مسبقاً', 'warning');
        return;
    }
    
    categories.push(categoryName);
    saveCategories();
    populateCategorySelects();
    
    input.value = '';
    showAlert('تم إضافة الفئة بنجاح', 'success');
}

function deleteCategory(categoryName) {
    if (!confirm(`هل أنت متأكد من حذف فئة "${categoryName}"؟`)) return;
    
    if (categories.length <= 1) {
        showAlert('يجب أن تبقى فئة واحدة على الأقل', 'danger');
        return;
    }
    
    categories = categories.filter(cat => cat !== categoryName);
    saveCategories();
    populateCategorySelects();
    showAlert('تم حذف الفئة بنجاح', 'info');
}

function updateCategoryList() {
    const container = document.getElementById('categoryList');
    if (!container) return;
    
    container.innerHTML = categories.map(category => `
        <div class="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
            <span>${category}</span>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory('${category}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// ==================== إدارة المعاملات ====================
function addTransaction() {
    const nameInput = document.getElementById('nameInput');
    const amountInput = document.getElementById('amountInput');
    const dateInput = document.getElementById('dateInput');
    const typeSelect = document.getElementById('typeSelect');
    const categorySelect = document.getElementById('categorySelect');
    
    // التحقق من المدخلات
    if (!nameInput.value.trim()) {
        showAlert('الرجاء إدخال وصف للمعاملة', 'warning');
        nameInput.focus();
        return;
    }
    
    if (!amountInput.value || parseFloat(amountInput.value) <= 0) {
        showAlert('الرجاء إدخال مبلغ صحيح', 'warning');
        amountInput.focus();
        return;
    }
    
    if (!dateInput.value) {
        showAlert('الرجاء إدخال التاريخ', 'warning');
        dateInput.focus();
        return;
    }
    
    if (!categorySelect.value) {
        showAlert('الرجاء اختيار الفئة', 'warning');
        categorySelect.focus();
        return;
    }
    
    // إنشاء المعاملة
    const transaction = {
        id: Date.now(),
        name: nameInput.value.trim(),
        amount: parseFloat(amountInput.value),
        date: dateInput.value,
        type: typeSelect.value,
        category: categorySelect.value,
        timestamp: new Date().toISOString()
    };
    
    transactions.unshift(transaction);
    saveTransactions();
    displayTransactions();
    
    // تفريغ الحقول
    nameInput.value = '';
    amountInput.value = '';
    nameInput.focus();
    
    // تحديث لوحة التحكم
    updateDashboard();
    
    // إظهار رسالة نجاح
    showAlert('تم إضافة المعاملة بنجاح', 'success');
    
    return transaction;
}

function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    // تعبئة النموذج
    document.getElementById('editId').value = transaction.id;
    document.getElementById('editName').value = transaction.name;
    document.getElementById('editAmount').value = transaction.amount;
    document.getElementById('editDate').value = transaction.date;
    document.getElementById('editType').value = transaction.type;
    document.getElementById('editCategory').value = transaction.category;
    
    // إظهار النافذة
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();
}

function saveEdit() {
    const id = parseInt(document.getElementById('editId').value);
    const transaction = transactions.find(t => t.id === id);
    
    if (transaction) {
        transaction.name = document.getElementById('editName').value;
        transaction.amount = parseFloat(document.getElementById('editAmount').value);
        transaction.date = document.getElementById('editDate').value;
        transaction.type = document.getElementById('editType').value;
        transaction.category = document.getElementById('editCategory').value;
        
        saveTransactions();
        displayTransactions();
        updateDashboard();
        
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        editModal.hide();
        
        showAlert('تم تعديل المعاملة بنجاح', 'success');
    }
}

function deleteTransaction(id) {
    if (!confirm('هل أنت متأكد من حذف هذه المعاملة؟')) return;
    
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    displayTransactions();
    updateDashboard();
    
    showAlert('تم حذف المعاملة بنجاح', 'info');
}

function displayTransactions(filterText = '') {
    const container = document.getElementById('transactionTable');
    if (!container) return;
    
    let filtered = transactions;
    
    if (filterText) {
        const searchTerm = filterText.toLowerCase();
        filtered = transactions.filter(t => 
            t.name.toLowerCase().includes(searchTerm) ||
            t.category.toLowerCase().includes(searchTerm) ||
            t.type.toLowerCase().includes(searchTerm) ||
            t.amount.toString().includes(searchTerm)
        );
    }
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="fas fa-search fa-2x mb-3"></i>
                    <p>${filterText ? 'لا توجد نتائج للبحث' : 'لا توجد معاملات'}</p>
                </td>
            </tr>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(transaction => `
        <tr>
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.name}</td>
            <td><span class="badge bg-secondary">${transaction.category}</span></td>
            <td>
                <span class="badge ${transaction.type === 'income' ? 'income-badge' : 'expense-badge'}">
                    ${transaction.type === 'income' ? 'دخل' : 'مصروف'}
                </span>
            </td>
            <td class="fw-bold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}">
                ${transaction.amount.toFixed(2)} ر.س
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editTransaction(${transaction.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction(${transaction.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterTransactions(searchText) {
    displayTransactions(searchText);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// ==================== لوحة التحكم ====================
function updateDashboard() {
    updateStats();
    updateRecentTransactions();
    updateQuickSummary();
    
    // تحديث الرسوم البيانية إذا كانت موجودة
    if (typeof updateCharts === 'function') {
        setTimeout(updateCharts, 100);
    }
}

function updateStats() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const balance = totalIncome - totalExpense;
    
    // تحديث الإحصائيات
    const totalIncomeEl = document.getElementById('totalIncome');
    const totalExpenseEl = document.getElementById('totalExpense');
    const currentBalanceEl = document.getElementById('currentBalance');
    const totalTransactionsEl = document.getElementById('totalTransactions');
    
    if (totalIncomeEl) totalIncomeEl.textContent = totalIncome.toFixed(2) + ' ر.س';
    if (totalExpenseEl) totalExpenseEl.textContent = totalExpense.toFixed(2) + ' ر.س';
    if (currentBalanceEl) currentBalanceEl.textContent = balance.toFixed(2) + ' ر.س';
    if (totalTransactionsEl) totalTransactionsEl.textContent = transactions.length;
}

function updateRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    if (!container) return;
    
    const recent = transactions.slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="fas fa-exchange-alt fa-2x mb-3"></i>
                    <p>لا توجد معاملات حديثة</p>
                </td>
            </tr>
        `;
        return;
    }
    
    container.innerHTML = recent.map(transaction => `
        <tr>
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.name}</td>
            <td>${transaction.category}</td>
            <td>
                <span class="badge ${transaction.type === 'income' ? 'income-badge' : 'expense-badge'}">
                    ${transaction.type === 'income' ? 'دخل' : 'مصروف'}
                </span>
            </td>
            <td class="${transaction.type === 'income' ? 'text-success' : 'text-danger'}">
                ${transaction.amount.toFixed(2)} ر.س
            </td>
        </tr>
    `).join('');
}

function updateQuickSummary() {
    const container = document.getElementById('quickSummary');
    if (!container) return;
    
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
        
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;
    
    container.innerHTML = `
        <div class="text-center">
            <div class="mb-3">
                <i class="fas fa-chart-line fa-2x text-primary mb-2"></i>
                <h6 class="mb-1">ملخص المالية</h6>
            </div>
            
            <div class="row text-center g-2">
                <div class="col-6">
                    <div class="p-2 bg-success bg-opacity-10 rounded">
                        <small class="text-muted d-block">الدخل</small>
                        <strong class="text-success">${totalIncome.toFixed(2)} ر.س</strong>
                    </div>
                </div>
                <div class="col-6">
                    <div class="p-2 bg-danger bg-opacity-10 rounded">
                        <small class="text-muted d-block">المصروف</small>
                        <strong class="text-danger">${totalExpense.toFixed(2)} ر.س</strong>
                    </div>
                </div>
                <div class="col-6">
                    <div class="p-2 bg-primary bg-opacity-10 rounded">
                        <small class="text-muted d-block">المدخرات</small>
                        <strong class="text-primary">${(totalIncome - totalExpense).toFixed(2)} ر.س</strong>
                    </div>
                </div>
                <div class="col-6">
                    <div class="p-2 bg-warning bg-opacity-10 rounded">
                        <small class="text-muted d-block">نسبة التوفير</small>
                        <strong class="text-warning">${savingsRate.toFixed(1)}%</strong>
                    </div>
                </div>
            </div>
            
            <div class="mt-3">
                <small class="text-muted">
                    <i class="fas fa-info-circle me-1"></i>
                    ${getFinancialAdvice(savingsRate)}
                </small>
            </div>
        </div>
    `;
}

function getFinancialAdvice(savingsRate) {
    if (savingsRate >= 20) return 'أداء ممتاز! استمر في هذا النمط';
    if (savingsRate >= 10) return 'جيد، يمكنك تحسين نسبة التوفير';
    if (savingsRate >= 0) return 'انتبه، حاول زيادة المدخرات';
    return 'ميزانيتك سلبية، تحتاج مراجعة عاجلة';
}

// ==================== دوال المساعدة ====================
function showAlert(message, type = 'info', duration = 3000) {
    // إنشاء عنصر التنبيه
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // إضافة إلى الصفحة
    const container = document.getElementById('alertContainer') || createAlertContainer();
    container.appendChild(alertDiv);
    
    // إزالة تلقائية
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.remove();
        }
    }, duration);
}

function createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'alertContainer';
    container.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
    `;
    document.body.appendChild(container);
    return container;
}

function exportData() {
    const data = {
        transactions: transactions,
        categories: categories,
        exportDate: new Date().toISOString(),
        version: '2.2.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `المحاسب_الشخصي_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showAlert('تم تصدير البيانات بنجاح', 'success');
}

// ==================== إدارة البيانات ====================
function loadData() {
    // تحميل المعاملات
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
        try {
            transactions = JSON.parse(savedTransactions);
        } catch (e) {
            console.error('خطأ في تحميل المعاملات:', e);
            transactions = [];
        }
    }
    
    // تحميل الفئات
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
        try {
            categories = JSON.parse(savedCategories);
        } catch (e) {
            console.error('خطأ في تحميل الفئات:', e);
            categories = ['راتب', 'أكل وشرب', 'مواصلات', 'تسوق', 'ترفيه', 'صحة', 'تعليم', 'منزل'];
        }
    }
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

// ==================== دالة عرض الأقسام ====================
function showSection(sectionId) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // إظهار القسم المطلوب
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // تحديث القائمة النشطة
    document.querySelectorAll('.list-group-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    const activeNav = document.querySelector(`.nav-link[onclick="showSection('${sectionId}')"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    // تحديث محتوى القسم إذا لزم
    switch(sectionId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'transactions':
            displayTransactions();
            break;
        case 'budgetPlanner':
            if (typeof budgetManager !== 'undefined') {
                setTimeout(() => budgetManager.displayBudgets(), 100);
            }
            break;
        case 'financialGoals':
            if (typeof goalsManager !== 'undefined') {
                setTimeout(() => goalsManager.displayGoals(), 100);
            }
            break;
    }
}

// ==================== الحاسبات المالية ====================
function calculateLoan() {
    const amount = parseFloat(document.getElementById('loanAmount').value) || 50000;
    const months = parseInt(document.getElementById('loanTermRange').value) || 36;
    const rate = parseFloat(document.getElementById('interestRateRange').value) || 8;
    
    if (!amount || amount <= 0) {
        showAlert('الرجاء إدخال مبلغ القرض', 'warning');
        return;
    }
    
    const monthlyRate = rate / 100 / 12;
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                         (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - amount;
    
    document.getElementById('monthlyPayment').textContent = monthlyPayment.toFixed(2) + ' ر.س';
    document.getElementById('totalPayment').textContent = totalPayment.toFixed(2) + ' ر.س';
    document.getElementById('totalInterest').textContent = totalInterest.toFixed(2) + ' ر.س';
    document.getElementById('interestPercentage').textContent = ((totalInterest / amount) * 100).toFixed(2) + '%';
    
    document.getElementById('loanResults').style.display = 'none';
    document.getElementById('loanDetails').style.display = 'block';
}

function calculateMortgage() {
    const price = parseFloat(document.getElementById('propertyPrice').value) || 500000;
    const downPayment = parseFloat(document.getElementById('downPayment').value) || 100000;
    const years = parseInt(document.getElementById('mortgageYears').value) || 15;
    const rate = parseFloat(document.getElementById('mortgageInterest').value) || 4;
    
    const loanAmount = price - downPayment;
    const months = years * 12;
    const monthlyRate = rate / 100 / 12;
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                         (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - loanAmount;
    
    document.getElementById('mortgageAmount').textContent = loanAmount.toFixed(2) + ' ر.س';
    document.getElementById('mortgageMonthly').textContent = monthlyPayment.toFixed(2) + ' ر.س';
    document.getElementById('mortgageTotal').textContent = totalPayment.toFixed(2) + ' ر.س';
    document.getElementById('mortgageInterestTotal').textContent = totalInterest.toFixed(2) + ' ر.س';
    
    document.getElementById('mortgageResults').style.display = 'none';
    document.getElementById('mortgageDetails').style.display = 'block';
}

function calculateSavings() {
    const initial = parseFloat(document.getElementById('initialAmount').value) || 1000;
    const monthly = parseFloat(document.getElementById('monthlyDeposit').value) || 500;
    const years = parseInt(document.getElementById('savingsYears').value) || 10;
    const rate = parseFloat(document.getElementById('annualReturn').value) || 7;
    
    const months = years * 12;
    const monthlyRate = rate / 100 / 12;
    let futureValue = initial;
    
    for (let i = 0; i < months; i++) {
        futureValue = futureValue * (1 + monthlyRate) + monthly;
    }
    
    const totalDeposits = initial + (monthly * months);
    const totalEarnings = futureValue - totalDeposits;
    
    document.getElementById('finalAmount').textContent = futureValue.toFixed(2) + ' ر.س';
    document.getElementById('totalDeposits').textContent = totalDeposits.toFixed(2) + ' ر.س';
    document.getElementById('totalEarnings').textContent = totalEarnings.toFixed(2) + ' ر.س';
    document.getElementById('earningsPercentage').textContent = ((totalEarnings / totalDeposits) * 100).toFixed(2) + '%';
    
    document.getElementById('savingsResults').style.display = 'none';
    document.getElementById('savingsDetails').style.display = 'block';
}

// ==================== التصدير العالمي ====================
window.addTransaction = addTransaction;
window.saveEdit = saveEdit;
window.addCategory = addCategory;
window.deleteCategory = deleteCategory;
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;
window.exportData = exportData;
window.calculateLoan = calculateLoan;
window.calculateMortgage = calculateMortgage;
window.calculateSavings = calculateSavings;

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});
