const tg = window.Telegram?.WebApp;
const plans = [
  {gb:1, price:3500}, {gb:10, price:35000, hot:true}, {gb:15, price:52500},
  {gb:20, price:70000}, {gb:30, price:105000, hot:true}, {gb:40, price:140000},
  {gb:50, price:175000}, {gb:100, price:350000}
];

const $ = s => document.querySelector(s);
const money = n => new Intl.NumberFormat('fa-IR').format(n) + ' تومان';
const modal = $('#modal');

function showToast(text){
  const el=$('#toast'); el.textContent=text; el.classList.add('show');
  clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>el.classList.remove('show'),2200);
}
function openModal(html){ $('#modal-content').innerHTML=html; modal.hidden=false; }
function closeModal(){ modal.hidden=true; }

function renderPlans(){
  $('#plans').innerHTML = plans.map(p=>`
    <article class="plan glass ${p.hot?'hot':''}">
      ${p.hot?'<span class="badge">محبوب</span>':''}
      <h3>${p.gb} گیگ</h3><p>اعتبار ۳۰ روزه</p>
      <div class="price">${money(p.price)}</div>
      <button class="buy" data-buy="${p.gb}">انتخاب و خرید</button>
    </article>`).join('');
  document.querySelectorAll('[data-buy]').forEach(b=>b.addEventListener('click',()=>{
    const p=plans.find(x=>x.gb==b.dataset.buy);
    openModal(`<h2>خرید ${p.gb} گیگ</h2><p>پلن ${p.gb} گیگ با اعتبار ۳۰ روزه</p><p><b>مبلغ: ${money(p.price)}</b></p><button class="modal-action" onclick="sendBuy(${p.gb})">ادامه خرید</button>`);
  }));
}

window.sendBuy = gb => {
  closeModal();
  if(tg){ tg.sendData(JSON.stringify({action:'buy',gb})); }
  showToast('درخواست خرید برای ربات ارسال شد');
};

function setupTelegram(){
  if(!tg) return;
  tg.ready(); tg.expand();
  try{ tg.setHeaderColor('#071426'); tg.setBackgroundColor('#050b16'); }catch(e){}
  const u=tg.initDataUnsafe?.user;
  if(u){
    const name=[u.first_name,u.last_name].filter(Boolean).join(' ');
    $('#hello').textContent=name||'پنل کاربری';
    $('#tg-user').textContent=u.username?`@${u.username}`:`شناسه: ${u.id}`;
  }
}

function navigate(page){
  document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page===page));
  if(page==='home') window.scrollTo({top:0,behavior:'smooth'});
  if(page==='services') $('#services-panel').scrollIntoView({behavior:'smooth',block:'start'});
  if(page==='help') $('#help-panel').scrollIntoView({behavior:'smooth',block:'start'});
  if(page==='wallet') openModal('<h2>💰 کیف پول</h2><p>موجودی فعلی: <b>۰ تومان</b></p><p>در نسخه متصل به ربات، شارژ کیف پول و تاریخچه تراکنش‌ها از اطلاعات واقعی ربات نمایش داده می‌شود.</p><button class="modal-action" onclick="requestWallet()">＋ درخواست شارژ</button>');
}
window.requestWallet=()=>{closeModal(); if(tg) tg.sendData(JSON.stringify({action:'wallet'})); showToast('صفحه شارژ برای ربات ارسال شد');};

function action(a){
  if(a==='wallet') return navigate('wallet');
  if(a==='services') return navigate('services');
  if(a==='help') return navigate('help');
  if(a==='support') { if(tg?.openTelegramLink) tg.openTelegramLink('https://t.me/ByHxnzu'); else location.href='https://t.me/ByHxnzu'; return; }
  const data={
    android:['🤖 Android','۱) Hiddify یا V2Box را نصب کن.','۲) لینک اشتراک دریافتی از HanzuVPN را Copy کن.','۳) داخل برنامه گزینه افزودن Subscription را بزن و لینک را وارد کن.','۴) کانفیگ را Update و سپس Connect کن.'],
    ios:[' iPhone / iOS','۱) Hiddify یا V2Box را از App Store نصب کن.','۲) لینک اشتراک را کپی کن.','۳) لینک را داخل برنامه Import کن.','۴) کانفیگ را Update و Connect کن.'],
    windows:['▣ Windows','۱) Hiddify یا v2rayN را نصب کن.','۲) لینک Subscription را کپی کن.','۳) در برنامه Import Subscription را بزن.','۴) Update و سپس کانفیگ را فعال کن.']
  };
  if(data[a]) openModal(`<h2>${data[a][0]}</h2><ol>${data[a].slice(1).map(x=>`<li>${x}</li>`).join('')}</ol>`);
}

document.addEventListener('click',e=>{
  const actionBtn=e.target.closest('[data-action]'); if(actionBtn) action(actionBtn.dataset.action);
  const nav=e.target.closest('[data-page]'); if(nav) navigate(nav.dataset.page);
});
$('#refresh').addEventListener('click',()=>showToast('اطلاعات به‌روزرسانی شد'));
$('#modal-close').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});

renderPlans(); setupTelegram();
setTimeout(()=>{$('#loader').classList.add('hide');$('#app').hidden=false},1100);
