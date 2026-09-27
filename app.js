const tg = window.Telegram?.WebApp;
const API_BASE = 'https://hanzuvpn-bot-production.up.railway.app';

const $ = s => document.querySelector(s);
const money = n => new Intl.NumberFormat('fa-IR').format(Number(n || 0)) + ' تومان';
const modal = $('#modal');
let state = { balance: 0, plans: [], services: [], history: [], user: null, support: 'https://t.me/ByHxnzu' };

function showToast(text){
  const el=$('#toast'); el.textContent=text; el.classList.add('show');
  clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>el.classList.remove('show'),2600);
}
function openModal(html){ $('#modal-content').innerHTML=html; modal.hidden=false; }
function closeModal(){ modal.hidden=true; }
function escapeHtml(v){ return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function initData(){ return tg?.initData || ''; }

async function api(path, options={}){
  const rawInit = initData();
  const headers = {'Content-Type':'application/json','X-Telegram-Init-Data':rawInit, ...(options.headers||{})};
  const sep = path.includes('?') ? '&' : '?';
  const url = rawInit ? (API_BASE + path + sep + 'initData=' + encodeURIComponent(rawInit)) : (API_BASE + path);
  const res = await fetch(url, {...options, headers});
  let data = {};
  try { data = await res.json(); } catch(e) { throw new Error('پاسخ نامعتبر از سرور دریافت شد.'); }
  if(!res.ok || data.ok === false) throw new Error(data.error || 'عملیات ناموفق بود.');
  return data;
}

function renderPlans(){
  const plans = (state.plans?.length ? state.plans.map(x=>({...x,gb:x.gb ?? x.volume})) : [
    {gb:1,price:3500},{gb:10,price:35000},{gb:15,price:52500},{gb:20,price:70000},
    {gb:30,price:105000},{gb:40,price:140000},{gb:50,price:175000},{gb:100,price:350000}
  ]);
  $('#plans').innerHTML = plans.map(p=>`
    <article class="plan glass ${[10,30].includes(Number(p.gb))?'hot':''}">
      ${[10,30].includes(Number(p.gb))?'<span class="badge">محبوب</span>':''}
      <h3>${escapeHtml(p.gb)} گیگ</h3><p>اعتبار ۳۰ روزه</p>
      <div class="price">${money(p.price)}</div>
      <button class="buy" data-buy="${escapeHtml(p.gb)}">انتخاب و خرید</button>
    </article>`).join('');
  document.querySelectorAll('[data-buy]').forEach(b=>b.addEventListener('click',()=>buyConfirm(Number(b.dataset.buy))));
}

function updateHeader(){
  $('#balance').textContent = money(state.balance);
  if(state.user){
    const name = [state.user.first_name].filter(Boolean).join(' ');
    $('#hello').textContent = name || 'پنل کاربری';
    $('#tg-user').textContent = state.user.username ? '@'+state.user.username : `شناسه: ${state.user.id}`;
  }
}

function renderServices(){
  const box = $('#service');
  if(!state.services?.length){
    box.innerHTML = '<div class="service-icon">⌁</div><div><strong>هنوز سرویسی ندارید</strong><p>بعد از خرید، سرویس‌های فعال اینجا نمایش داده می‌شوند.</p></div>';
    return;
  }
  const s = state.services[0];
  box.innerHTML = `<div class="service-icon">✓</div><div><strong>${escapeHtml(s.volume)} گیگ — سفارش #${escapeHtml(s.id)}</strong><p>انقضا: ${escapeHtml(s.expires_at || '-')}</p><button class="buy" style="margin-top:8px" onclick="showServices()">مدیریت سرویس‌ها</button></div>`;
}

function buyConfirm(gb){
  const p = state.plans.find(x=>Number(x.gb ?? x.volume)===Number(gb)) || {gb,price:gb*3500};
  openModal(`<h2>🛒 خرید ${escapeHtml(p.gb)} گیگ</h2>
    <p>اعتبار: ۳۰ روز</p><p><b>مبلغ: ${money(p.price)}</b></p><p>موجودی کیف پول: <b>${money(state.balance)}</b></p>
    <button class="modal-action" onclick="doBuy(${Number(p.gb)})">پرداخت از کیف پول</button>`);
}

window.doBuy = async gb => {
  try{
    closeModal(); showToast('در حال ثبت خرید...');
    const data = await api('/api/buy',{method:'POST',body:JSON.stringify({volume:String(gb)})});
    state.balance = Number(data.balance ?? data.new_balance ?? state.balance);
    if(data.services) state.services = data.services;
    updateHeader(); renderServices();
    let extra = '';
    if(data.link) extra = `<p><b>لینک اشتراک:</b></p><textarea readonly style="width:100%;min-height:80px;background:rgba(0,0,0,.2);color:white;border:1px solid var(--line);border-radius:10px;padding:8px;direction:ltr">${escapeHtml(data.link)}</textarea>`;
    openModal(`<h2>✅ خرید موفق</h2><p>سفارش #${escapeHtml(data.order_id ?? '')} ثبت و سرویس تحویل شد.</p><p>موجودی جدید: <b>${money(state.balance)}</b></p>${extra}<button class="modal-action" onclick="closeModal()">باشه</button>`);
  }catch(e){ openModal(`<h2>❌ خرید انجام نشد</h2><p>${escapeHtml(e.message)}</p><button class="modal-action" onclick="closeModal()">بستن</button>`); }
};

function walletModal(){
  const history = (state.history||[]).slice(0,10).map(x=>`<div style="padding:8px 0;border-bottom:1px solid var(--line);font-size:10px">${Number(x.amount)>=0?'🟢':'🔴'} ${money(Math.abs(Number(x.amount)))} — ${escapeHtml(x.description || x.type || '')}<br><span style="color:var(--muted)">${escapeHtml(x.created_at || '')}</span></div>`).join('') || '<p>هنوز تراکنشی ثبت نشده است.</p>';
  openModal(`<h2>💰 کیف پول</h2><p>موجودی فعلی: <b>${money(state.balance)}</b></p>
    <button class="modal-action" onclick="openCharge()">＋ شارژ کیف پول</button>
    <h3 style="font-size:13px;margin-top:18px">📜 تراکنش‌ها</h3>${history}`);
}

window.openCharge=()=>openModal(`<h2>➕ شارژ کیف پول</h2><p>حداقل مبلغ شارژ: ۱۰,۰۰۰ تومان</p>
  <input id="charge-amount" inputmode="numeric" type="number" min="10000" placeholder="مبلغ به تومان" style="width:100%;padding:12px;border-radius:12px;border:1px solid var(--line);background:rgba(0,0,0,.2);color:white;box-sizing:border-box">
  <button class="modal-action" onclick="createCharge()">ادامه</button>`);

window.createCharge=async()=>{
  const amount = Number($('#charge-amount')?.value || 0);
  if(amount < 10000){ showToast('حداقل شارژ ۱۰,۰۰۰ تومان است'); return; }
  try{
    showToast('در حال ایجاد درخواست شارژ...');
    const data = await api('/api/charge',{method:'POST',body:JSON.stringify({amount})});
    const card = data.card || data.card_number || data.payment_card || '';
    const orderId = data.order_id ?? data.order ?? '';
    state.chargeAmount = amount;
    openModal(`<h2>💳 پرداخت شارژ</h2><p>مبلغ: <b>${money(amount)}</b></p>
      <p>شماره سفارش: <b>#${escapeHtml(orderId)}</b></p>
      ${card ? `<p>💳 شماره کارت:</p><div style="direction:ltr;text-align:center;font-size:18px;font-weight:800;letter-spacing:1px;padding:12px;border:1px solid var(--line);border-radius:12px">${escapeHtml(card)}</div>` : '<p>شماره کارت در پاسخ سرور ارسال نشده است.</p>'}
      <p style="color:var(--muted);font-size:10px">بعد از واریز، عکس رسید را همینجا انتخاب و ارسال کن.</p>
      <input id="receipt-file" type="file" accept="image/*" style="width:100%;margin-top:8px">
      <button class="modal-action" onclick="sendReceipt(${Number(orderId)||0})">📸 ارسال رسید</button>`);
  }catch(e){ openModal(`<h2>❌ خطا</h2><p>${escapeHtml(e.message)}</p><button class="modal-action" onclick="closeModal()">بستن</button>`); }
};

window.sendReceipt=async orderId=>{
  const file = $('#receipt-file')?.files?.[0];
  if(!file){ showToast('اول عکس رسید را انتخاب کن'); return; }
  if(!orderId){ showToast('شماره سفارش نامعتبر است'); return; }
  try{
    showToast('در حال ارسال رسید...');
    const reader = new FileReader();
    reader.onload = async () => {
      try{
        const result = await api('/api/charge-receipt',{method:'POST',body:JSON.stringify({order_id:orderId,amount:Number(state.chargeAmount||0),image:String(reader.result),filename:file.name})});
        openModal(`<h2>✅ رسید ارسال شد</h2><p>رسید سفارش #${escapeHtml(result.order_id ?? orderId)} برای مدیریت ارسال شد.</p><p>بعد از تأیید، موجودی کیف پولت خودکار افزایش پیدا می‌کند.</p><button class="modal-action" onclick="refreshData()">بروزرسانی موجودی</button>`);
      }catch(e){ openModal(`<h2>❌ ارسال رسید ناموفق بود</h2><p>${escapeHtml(e.message)}</p><button class="modal-action" onclick="closeModal()">بستن</button>`); }
    };
    reader.readAsDataURL(file);
  }catch(e){ showToast(e.message); }
};

async function showServices(){
  try{
    const data = await api('/api/services'); state.services=data.services||[]; renderServices();
    if(!state.services.length){ openModal('<h2>📦 سرویس‌های من</h2><p>سرویسی برای نمایش وجود ندارد.</p>'); return; }
    const list=state.services.map(s=>`<div class="glass" style="padding:13px;border-radius:16px;margin-bottom:9px"><b>📦 ${escapeHtml(s.volume)} گیگ</b><p style="font-size:10px;color:var(--muted)">سفارش #${escapeHtml(s.id)}<br>انقضا: ${escapeHtml(s.expires_at||'-')}</p>${s.link?`<textarea readonly style="width:100%;min-height:70px;background:rgba(0,0,0,.2);color:white;border:1px solid var(--line);border-radius:10px;padding:8px;direction:ltr;box-sizing:border-box">${escapeHtml(s.link)}</textarea>`:''}<button class="modal-action" onclick="renewService(${Number(s.id)})">🔄 تمدید با کیف پول</button></div>`).join('');
    openModal(`<h2>📦 سرویس‌های من</h2>${list}`);
  }catch(e){ openModal(`<h2>❌ خطا</h2><p>${escapeHtml(e.message)}</p>`); }
}
window.showServices=showServices;

window.renewService=async orderId=>{
  try{
    showToast('در حال تمدید...');
    const data=await api('/api/renew',{method:'POST',body:JSON.stringify({order_id:orderId})});
    state.balance=Number(data.balance ?? data.new_balance ?? state.balance); updateHeader();
    const link=data.link?`<p><b>لینک:</b></p><textarea readonly style="width:100%;min-height:80px;background:rgba(0,0,0,.2);color:white;border:1px solid var(--line);border-radius:10px;padding:8px;direction:ltr">${escapeHtml(data.link)}</textarea>`:'';
    openModal(`<h2>✅ تمدید موفق</h2><p>سرویس با موفقیت تمدید شد.</p><p>موجودی جدید: <b>${money(state.balance)}</b></p>${link}<button class="modal-action" onclick="closeModal()">باشه</button>`);
    await refreshData(false);
  }catch(e){ openModal(`<h2>❌ تمدید انجام نشد</h2><p>${escapeHtml(e.message)}</p><button class="modal-action" onclick="closeModal()">بستن</button>`); }
};

async function refreshData(show=true){
  try{
    const data=await api('/api/bootstrap');
    state={...state,...data,balance:Number(data.balance||0),plans:data.plans||data.tariffs||[],services:data.services||[],history:data.history||[]};
    updateHeader(); renderPlans(); renderServices();
    if(show) showToast('اطلاعات بروزرسانی شد');
  }catch(e){
    console.error(e);
    if(show) showToast(e.message || 'اتصال به سرور برقرار نشد');
  }
}
window.refreshData=refreshData;

function setupTelegram(){
  if(!tg){ showToast('این صفحه را داخل Telegram Mini App باز کن'); return; }
  tg.ready(); tg.expand();
  try{ tg.setHeaderColor('#071426'); tg.setBackgroundColor('#050b16'); }catch(e){}
}

function navigate(page){
  document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page===page));
  if(page==='home') window.scrollTo({top:0,behavior:'smooth'});
  if(page==='services') showServices();
  if(page==='help') $('#help-panel').scrollIntoView({behavior:'smooth',block:'start'});
  if(page==='wallet') walletModal();
}

function action(a){
  if(a==='wallet') return navigate('wallet');
  if(a==='services') return navigate('services');
  if(a==='help') return navigate('help');
  if(a==='support') { if(tg?.openTelegramLink) tg.openTelegramLink(state.support||'https://t.me/ByHxnzu'); else location.href=state.support||'https://t.me/ByHxnzu'; return; }
  const data={
    android:['🤖 Android','۱) Hiddify یا V2Box را نصب کن.','۲) لینک اشتراک دریافتی را کپی کن.','۳) داخل برنامه گزینه افزودن Subscription را بزن.','۴) Update و سپس Connect کن.'],
    ios:[' iPhone / iOS','۱) Hiddify یا V2Box را نصب کن.','۲) لینک اشتراک را کپی کن.','۳) لینک را داخل برنامه Import کن.','۴) Update و Connect کن.'],
    windows:['▣ Windows','۱) Hiddify یا v2rayN را نصب کن.','۲) لینک Subscription را کپی کن.','۳) Import Subscription را بزن.','۴) Update و کانفیگ را فعال کن.']
  };
  if(data[a]) openModal(`<h2>${data[a][0]}</h2><ol>${data[a].slice(1).map(x=>`<li>${x}</li>`).join('')}</ol>`);
}

document.addEventListener('click',e=>{
  const actionBtn=e.target.closest('[data-action]'); if(actionBtn) action(actionBtn.dataset.action);
  const nav=e.target.closest('[data-page]'); if(nav) navigate(nav.dataset.page);
});
$('#refresh').addEventListener('click',()=>refreshData(true));
$('#modal-close').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});

setupTelegram();
refreshData(false);
setTimeout(()=>{$('#loader').classList.add('hide');$('#app').hidden=false},1100);


// STARTUP
setupTelegram();
renderPlans();
renderServices();
refreshData(false);
