const tg = window.Telegram.WebApp;

tg.expand();
document.body.style.backgroundColor = tg.backgroundColor;

function triggerHaptic(style = 'light') {
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred(style);
    }
}

let selectedPlanId = '3';
function selectPlan(planId) {
    selectedPlanId = planId;
    triggerHaptic('medium');
    
    document.querySelectorAll('.plan-card').forEach(card => {
        card.style.borderColor = 'var(--ios-border)';
    });
    event.currentTarget.style.borderColor = 'var(--ios-blue)';
}

function handlePurchase() {
    triggerHaptic('heavy');
    
    const purchaseData = {
        action: 'create_auto_service',
        plan_id: selectedPlanId,
        user_id: tg.initDataUnsafe?.user?.id || 123456
    };

    tg.sendData(JSON.stringify(purchaseData));
}

function switchTab(element, tabName) {
    triggerHaptic('light');
    document.querySelectorAll('.tab-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    
    if(tabName === 'support') {
        window.open('https://t.me/your_support_username', '_blank');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const user = tg.initDataUnsafe?.user;
    if (user) {
        document.getElementById('daysRemaining').innerText = `کاربر گرامی هانزو، ${user.first_name} اشتراک شما فعال است.`;
    } else {
        document.getElementById('daysRemaining').innerText = 'آماده دریافت سرویس خودکار';
    }
});
