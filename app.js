const tg = window.Telegram?.WebApp;
const API_BASE = 'https://hanzu.rzk26.site/hanzuvpn';
const API_VERSION = '20261002-manual-unlimited';
const $ = s => document.querySelector(s);
let state = { balance: 0, plans: [], services: [], history: [], user: null, support: 'https://t.me/ByHxnzu', language: 'fa' };
const faNum = n => Number(n||0).toLocaleString('fa-IR');
const FALLBACK_PLANS = [
  {volume:'1',price:3500}, {volume:'10',price:35000}, {volume:'15',price:52500}, {volume:'20',price:70000},
  {volume:'30',price:105000}, {volume:'40',price:140000}, {volume:'50',price:175000}, {volume:'100',price:350000},
  {volume:'UNLIMITED_1',price:150000,kind:'unlimited',label_fa:'تک کاربره',label_en:'Single User',label_ku:'یەک بەکارهێنەر'},
  {volume:'UNLIMITED_2',price:250000,kind:'unlimited',label_fa:'دو کاربره',label_en:'Two Users',label_ku:'دوو بەکارهێنەر'},
  {volume:'UNLIMITED_3',price:350000,kind:'unlimited',label_fa:'سه کاربره',label_en:'Three Users',label_ku:'سێ بەکارهێنەر'}
];
const modal = $('#modal');

function setButtonBusy(btn,busy=true){
  if(!btn) return;
  if(busy){btn.dataset.oldText=btn.innerHTML;btn.disabled=true;btn.classList.add('is-loading');btn.innerHTML='<span class="btn-spinner" aria-hidden="true"></span>'+(state.language==='en'?' Processing...':' در حال پردازش...');}
  else{btn.disabled=false;btn.classList.remove('is-loading');if(btn.dataset.oldText)btn.innerHTML=btn.dataset.oldText;}
}
function addRipple(e){
  const btn=e.target.closest('button'); if(!btn||btn.disabled)return;
  const r=document.createElement('span'); r.className='ripple'; const rect=btn.getBoundingClientRect();
  r.style.left=(e.clientX-rect.left)+'px';r.style.top=(e.clientY-rect.top)+'px';btn.appendChild(r);setTimeout(()=>r.remove(),650);
}
document.addEventListener('pointerdown',addRipple,{passive:true});
const LANG_NAMES = {fa:'🇮🇷 فارسی', ku:'🟢 کوردی', en:'🇬🇧 English'};

const I18N = {
  fa:{dir:'rtl',hello:'پنل کاربری',wallet:'کیف پول',balance:'موجودی کیف پول',charge:'شارژ کیف پول',buy:'خرید اشتراک',days:'۳۰ روزه',quick:'دسترسی سریع',services:'سرویس‌های من',manage:'مدیریت و تمدید',help:'آموزش اتصال',support:'پشتیبانی',manage_sub:'مدیریت و تمدید',wallet_sub:'موجودی و تراکنش‌ها',help_sub:'Android / iPhone / Windows',support_sub:'@ByHxnzu',no_service:'هنوز سرویسی ندارید',no_service_sub:'بعد از خرید، سرویس‌های فعال اینجا نمایش داده می‌شوند.',choose:'انتخاب و خرید',popular:'محبوب',valid:'اعتبار ۳۰ روزه',buy_title:'🛒 خرید',amount:'مبلغ',wallet_balance:'موجودی کیف پول',pay_wallet:'پرداخت از کیف پول',buying:'در حال ثبت خرید...',buy_ok:'خرید موفق',order:'سفارش',delivered:'ثبت و سرویس تحویل شد.',new_balance:'موجودی جدید',ok:'باشه',buy_fail:'خرید انجام نشد',close:'بستن',insufficient:'موجودی کیف پول شما کافی نیست.',please_charge:'لطفاً کیف پول خود را شارژ کنید.',go_charge:'💳 شارژ کیف پول',copy:'کپی',copied:'شماره کارت کپی شد.',charge_title:'➕ شارژ کیف پول',min:'حداقل مبلغ شارژ',continue:'ادامه',creating:'در حال ایجاد درخواست شارژ...',payment:'💳 پرداخت شارژ',order_no:'شماره سفارش',card:'شماره کارت',receipt_hint:'بعد از واریز، عکس رسید را همینجا انتخاب و ارسال کن.',send_receipt:'📸 ارسال رسید',receipt_preview:'پیش‌نمایش رسید',pick_receipt:'اول عکس رسید را انتخاب کن',invalid_order:'شماره سفارش نامعتبر است',sending:'در حال ارسال رسید...',receipt_ok:'رسید ارسال شد',receipt_sent:'رسید برای مدیریت ارسال شد.',after_approve:'بعد از تأیید، موجودی کیف پولت خودکار افزایش پیدا می‌کند.',refresh_balance:'بروزرسانی موجودی',receipt_fail:'ارسال رسید ناموفق بود',wallet_title:'💰 کیف پول',current:'موجودی فعلی',transactions:'📜 تراکنش‌ها',no_tx:'هنوز تراکنشی ثبت نشده است.',history_empty:'هنوز تراکنشی ثبت نشده است.',services_title:'📦 سرویس‌های من',no_services:'سرویسی برای نمایش وجود ندارد.',renew:'🔄 تمدید با کیف پول',renewing:'در حال تمدید...',renew_ok:'تمدید موفق',renew_done:'سرویس با موفقیت تمدید شد.',renew_fail:'تمدید انجام نشد',link:'لینک اشتراک',guide:'راهنمای اتصال',android:'Android',ios:'iPhone / iOS',windows:'Windows',close2:'بستن',refresh:'اطلاعات بروزرسانی شد',connection:'اتصال',support_open:'باز کردن پشتیبانی',invalid_response:'پاسخ نامعتبر از سرور دریافت شد.',network:'اتصال به سرور برقرار نشد',not_enough:'موجودی کافی نیست',no_stock:'این حجم فعلاً موجود نیست.',custom:'✏️ حجم دلخواه',custom_prompt:'✏️ حجم دلخواه',custom_minus:'➖ ۵ گیگ',custom_plus:'➕ ۵ گیگ',custom_confirm:'✅ انتخاب این حجم',back:'بازگشت',direct_pay:'💳 پرداخت مستقیم (کارت‌به‌کارت)',direct_hint:'بعد از واریز، عکس رسید را ارسال کنید.',buy_receipt_ok:'رسید خرید ارسال شد',buy_receipt_sent:'رسید برای مدیریت ارسال شد. پس از تأیید، سرویس تحویل می‌شود.',tracking_code:'کد پیگیری سفارش',waiting_approval:'رسید شما در انتظار تأیید است.',receipt_approved:'رسید تأیید شد و تصویر رسید از پنل شما حذف شد.',receipt_rejected:'رسید رد شد و تصویر رسید از پنل شما حذف شد.'},
  en:{dir:'ltr',hello:'User Panel',wallet:'Wallet',balance:'Wallet balance',charge:'Charge Wallet',buy:'Buy Subscription',days:'30 days',quick:'Quick Access',services:'My Services',manage:'Manage & renew',help:'Connection Guide',support:'Support',manage_sub:'Manage & renew',wallet_sub:'Balance & transactions',help_sub:'Android / iPhone / Windows',support_sub:'@ByHxnzu',no_service:'No service yet',no_service_sub:'Your active services will appear here after purchase.',choose:'Choose & Buy',popular:'Popular',valid:'30-day validity',buy_title:'🛒 Purchase',amount:'Amount',wallet_balance:'Wallet balance',pay_wallet:'Pay from Wallet',buying:'Processing purchase...',buy_ok:'Purchase successful',order:'Order',delivered:'registered and service delivered.',new_balance:'New balance',ok:'OK',buy_fail:'Purchase failed',close:'Close',insufficient:'Your wallet balance is insufficient.',please_charge:'Please charge your wallet first.',go_charge:'💳 Charge Wallet',copy:'Copy',copied:'Card number copied.',charge_title:'➕ Charge Wallet',min:'Minimum charge',continue:'Continue',creating:'Creating charge request...',payment:'💳 Wallet Charge',order_no:'Order number',card:'Card number',receipt_hint:'After payment, select and send the receipt image here.',send_receipt:'📸 Send Receipt',receipt_preview:'Receipt preview',pick_receipt:'Please select the receipt image first',invalid_order:'Invalid order number',sending:'Sending receipt...',receipt_ok:'Receipt sent',receipt_sent:'The receipt was sent to management.',after_approve:'After approval, your wallet balance will be increased automatically.',refresh_balance:'Refresh Balance',receipt_fail:'Receipt upload failed',wallet_title:'💰 Wallet',current:'Current balance',transactions:'📜 Transactions',no_tx:'No transactions yet.',history_empty:'No transactions yet.',services_title:'📦 My Services',no_services:'No service to display.',renew:'🔄 Renew with Wallet',renewing:'Renewing...',renew_ok:'Renewal successful',renew_done:'Service renewed successfully.',renew_fail:'Renewal failed',link:'Subscription link',guide:'Connection Guide',android:'Android',ios:'iPhone / iOS',windows:'Windows',close2:'Close',refresh:'Information updated',connection:'Connection',support_open:'Open Support',invalid_response:'Invalid response from server.',network:'Could not connect to server',not_enough:'Insufficient balance',no_stock:'This volume is currently out of stock.',custom:'✏️ Custom Volume',custom_prompt:'✏️ Custom Volume',custom_minus:'➖ 5 GB',custom_plus:'➕ 5 GB',custom_confirm:'✅ Confirm volume',back:'Back',direct_pay:'💳 Direct payment (Card-to-Card)',direct_hint:'After payment, send the receipt image.',buy_receipt_ok:'Purchase receipt sent',buy_receipt_sent:'Receipt sent to management. The service will be delivered after approval.',tracking_code:'Order tracking code',waiting_approval:'Your receipt is waiting for approval.',receipt_approved:'Receipt approved. The receipt image has been removed from your panel.',receipt_rejected:'Receipt rejected. The receipt image has been removed from your panel.'},
  ku:{dir:'rtl',hello:'پەڕەی بەکارهێنەر',wallet:'جزدان',balance:'باڵانسی جزدان',charge:'شارژکردنی جزدان',buy:'کڕینی خزمەتگوزاری',days:'۳۰ ڕۆژ',quick:'دەستگەیشتنی خێرا',services:'خزمەتگوزارییەکانم',manage:'بەڕێوەبردن و نوێکردنەوە',help:'ڕێنمایی بەستن',support:'پشتگیری',manage_sub:'بەڕێوەبردن و نوێکردنەوە',wallet_sub:'باڵانس و مامەڵەکان',help_sub:'Android / iPhone / Windows',support_sub:'@ByHxnzu',no_service:'هێشتا خزمەتگوزاری نییە',no_service_sub:'دوای کڕین، خزمەتگوزارییە چالاکەکان لێرە دەردەکەون.',choose:'هەڵبژاردن و کڕین',popular:'بەناوبانگ',valid:'ماوەی ۳۰ ڕۆژ',buy_title:'🛒 کڕین',amount:'بڕ',wallet_balance:'باڵانسی جزدان',pay_wallet:'پارەدان لە جزدان',buying:'کڕین تۆمار دەکرێت...',buy_ok:'کڕین سەرکەوتوو بوو',order:'داواکاری',delivered:'تۆمار کرا و خزمەتگوزاری درا.',new_balance:'باڵانسی نوێ',ok:'باشە',buy_fail:'کڕین سەرکەوتوو نەبوو',close:'داخستن',insufficient:'باڵانسی جزدان بەس نییە.',please_charge:'تکایە سەرەتا جزدانەکەت شارژ بکە.',go_charge:'💳 شارژکردنی جزدان',copy:'کۆپی',copied:'ژمارەی کارت کۆپی کرا.',charge_title:'➕ شارژکردنی جزدان',min:'کەمترین بڕی شارژ',continue:'بەردەوام بە',creating:'داواکاری شارژ دروست دەکرێت...',payment:'💳 پارەدانی شارژ',order_no:'ژمارەی داواکاری',card:'ژمارەی کارت',receipt_hint:'دوای پارەدان، وێنەی پسوڵە لێرە هەڵبژێرە و بنێرە.',send_receipt:'📸 ناردنی پسوڵە',receipt_preview:'پیشبینینی پسوڵە',pick_receipt:'تکایە سەرەتا وێنەی پسوڵە هەڵبژێرە',invalid_order:'ژمارەی داواکاری نادروستە',sending:'پسوڵە دەنێردرێت...',receipt_ok:'پسوڵە نێردرا',receipt_sent:'پسوڵە بۆ بەڕێوەبەرایەتی نێردرا.',after_approve:'دوای پشتڕاستکردنەوە، باڵانسی جزدان خۆکار زیاد دەکرێت.',refresh_balance:'نوێکردنەوەی باڵانس',receipt_fail:'ناردنی پسوڵە سەرکەوتوو نەبوو',wallet_title:'💰 جزدان',current:'باڵانسی ئێستا',transactions:'📜 مامەڵەکان',no_tx:'هێشتا مامەڵەیەک نییە.',history_empty:'هێشتا مامەڵەیەک نییە.',services_title:'📦 خزمەتگوزارییەکانم',no_services:'هیچ خزمەتگوزارییەک نییە.',renew:'🔄 نوێکردنەوە لەگەڵ جزدان',renewing:'نوێ دەکرێتەوە...',renew_ok:'نوێکردنەوە سەرکەوتوو بوو',renew_done:'خزمەتگوزاری بە سەرکەوتوویی نوێکرایەوە.',renew_fail:'نوێکردنەوە سەرکەوتوو نەبوو',link:'بەستەری بەشداریکردن',guide:'ڕێنمایی بەستن',android:'Android',ios:'iPhone / iOS',windows:'Windows',close2:'داخستن',refresh:'زانیاری نوێکرایەوە',connection:'بەستن',support_open:'کردنەوەی پشتگیری',invalid_response:'وەڵامی نادروست لە سێرڤەرەوە.',network:'پەیوەندی بە سێرڤەرەوە نەکرا',not_enough:'باڵانس بەس نییە',no_stock:'ئەم قەبارەیە ئێستا بەردەست نییە.',custom:'✏️ قەبارەی دڵخواز',custom_prompt:'✏️ قەبارەی دڵخواز',custom_minus:'➖ ٥ گیگ',custom_plus:'➕ ٥ گیگ',custom_confirm:'✅ ئەم قەبارەیە هەڵبژێرە',back:'گەڕانەوە',direct_pay:'💳 پارەدانی ڕاستەوخۆ (کارت بە کارت)',direct_hint:'دوای پارەدان، وێنەی پسوڵە بنێرە.',buy_receipt_ok:'پسوڵەی کڕین نێردرا',buy_receipt_sent:'پسوڵە بۆ بەڕێوەبەرایەتی نێردرا. دوای پشتڕاستکردنەوە خزمەتگوزاری دەدرێت.',tracking_code:'کۆدی بەدواداچوونی داواکاری',waiting_approval:'پسوڵەکەت چاوەڕوانی پشتڕاستکردنەوەیە.',receipt_approved:'پسوڵە پشتڕاستکرایەوە و وێنەکە لە پەڕەکەت سڕایەوە.',receipt_rejected:'پسوڵەکە ڕەتکرایەوە و وێنەکە لە پەڕەکەت سڕایەوە.'}
};
function L(k){ return (I18N[state.language]||I18N.fa)[k] || I18N.fa[k] || k; }
const money = n => new Intl.NumberFormat(state.language==='en'?'en-US':'fa-IR').format(Number(n||0)) + (state.language==='en'?' Toman':' تومان');
function showToast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
function openModal(html){$('#modal-content').innerHTML=html;modal.hidden=false;}
function closeModal(){modal.hidden=true;}
function clearReceiptPreviewUrl(){
  if(window.__receiptPreviewUrl){try{URL.revokeObjectURL(window.__receiptPreviewUrl);}catch(e){} window.__receiptPreviewUrl='';}
}
function attachReceiptPreview(inputId,previewId){
  const input=document.getElementById(inputId);
  const preview=document.getElementById(previewId);
  if(!input||!preview)return;
  input.addEventListener('change',()=>{
    const file=input.files?.[0];
    clearReceiptPreviewUrl();
    preview.innerHTML='';
    if(!file)return;
    if(!String(file.type||'').startsWith('image/')){preview.textContent=L('pick_receipt');return;}
    const url=URL.createObjectURL(file);
    window.__receiptPreviewUrl=url;
    const img=document.createElement('img');
    img.src=url;
    img.alt=L('receipt_preview');
    img.className='receipt-preview-image';
    preview.appendChild(img);
  });
}
function restoreReceiptPreview(previewId){
  const preview=document.getElementById(previewId);
  if(!preview||!window.__receiptPreviewUrl)return;
  preview.innerHTML='';
  const img=document.createElement('img');
  img.src=window.__receiptPreviewUrl;
  img.alt=L('receipt_preview');
  img.className='receipt-preview-image';
  preview.appendChild(img);
}

function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function initData(){return tg?.initData||'';}
async function api(path,options={}){const rawInit=initData();const headers={'Content-Type':'application/json','X-Telegram-Init-Data':rawInit,...(options.headers||{})};const sep=path.includes('?')?'&':'?';const url=API_BASE+path+sep+'v='+API_VERSION;const res=await fetch(url,{...options,headers});let data={};try{data=await res.json();}catch(e){throw new Error(L('invalid_response'));}if(!res.ok||data.ok===false)throw new Error(data.error||L('network'));return data;}
function errorText(err){const e=String(err?.message||err||'');if(e==='insufficient_balance')return L('insufficient')+' '+L('please_charge');if(e==='no_stock')return L('no_stock');if(e==='invalid_volume')return L('buy_fail')+' — حجم سرویس نامعتبر است. مقدار ارسال‌شده: '+String(window.__lastBuyVolume??'نامشخص');if(e==='purchase_failed')return L('buy_fail')+' — خطای سرور خرید. لطفاً دوباره تلاش کن.';if(e==='min_charge')return L('min')+': ۱۰,۰۰۰ تومان';if(e==='unauthorized')return L('network');if(e==='charge_order_not_found')return L('invalid_order');if(e==='invalid_language')return L('network');return e;}
function applyLanguage(){
  const i=I18N[state.language]||I18N.fa;
  document.documentElement.lang=state.language;document.documentElement.dir=i.dir;
  if($('#hello')) $('#hello').textContent=(state.user?.first_name||L('hello'));
  if($('#welcome-name')) $('#welcome-name').textContent=(state.user?.first_name||'کاربر');
  document.querySelectorAll('.eyebrow').forEach(x=>x.textContent=L('balance'));
  const walletBtn=document.querySelector('.wallet-card [data-action="wallet"]');if(walletBtn)walletBtn.textContent='＋ '+L('charge');
  const heads=document.querySelectorAll('.section-head h2');
  if(heads[0])heads[0].textContent=L('buy');
  if(heads[1])heads[1].textContent=L('services');
  if(heads[2])heads[2].textContent=L('guide');
  const os=document.querySelectorAll('.os-card');
  if(os.length>=3){os[0].querySelector('b').textContent=L('android');os[1].querySelector('b').textContent=L('ios');os[2].querySelector('b').textContent=L('windows');}
  const navs=document.querySelectorAll('.nav small');
  if(navs[0])navs[0].textContent=state.language==='en'?'Dashboard':'داشبورد';
  if(navs[1])navs[1].textContent=L('services');
  if(navs[2])navs[2].textContent=L('buy');
  if(navs[3])navs[3].textContent=L('wallet');
  if(navs[4])navs[4].textContent=state.language==='en'?'Profile':'پروفایل';
}
function planLabel(p){if(p?.kind==='unlimited'){const key=String(p.volume||'');const labels=state.language==='en'?p.label_en:state.language==='ku'?p.label_ku:p.label_fa;return '♾️ '+(labels||key);}const gb=p?.gb??p?.volume;return `${escapeHtml(gb)} ${state.language==='en'?'GB':'گیگ'}`;}
function planKey(p){return String(p?.volume??p?.gb??'');}
function renderPlans(){
  const plans=(state.plans?.length?state.plans:FALLBACK_PLANS).map(x=>({...x,gb:x.gb??x.volume}));
  const monthly=plans.filter(p=>p.kind!=='unlimited');
  const unlimited=plans.filter(p=>p.kind==='unlimited');
  const monthlyBox=$('#monthly-plans'), unlimitedBox=$('#unlimited-plans');
  const planCard=p=>{
    const key=planKey(p), hot=[10,30].includes(Number(p.gb));
    const available=p.available===false;
    return `<article class="plan ${hot?'hot':''}">
      ${hot?`<span class="badge">${L('popular')}</span>`:''}
      <h3>${planLabel(p)}</h3><p>${L('valid')}</p>
      <div class="price">${money(p.price)}</div>
      <button class="buy" data-buy="${escapeHtml(key)}">${available?'ناموجود':L('choose')}</button>
    </article>`;
  };
  if(monthlyBox) monthlyBox.innerHTML=monthly.map(planCard).join('')+`<article class="plan"><h3>${L('custom')}</h3><p>${L('valid')}</p><div class="price">${L('custom_prompt')}</div><button class="buy" data-custom="1">${L('custom')}</button></article>`;
  if(unlimitedBox) unlimitedBox.innerHTML=unlimited.map(planCard).join('');
  document.querySelectorAll('[data-buy]').forEach(b=>b.addEventListener('click',()=>buyConfirm(b.dataset.buy)));
  document.querySelector('[data-custom]')?.addEventListener('click',()=>showCustomVolume(5));
}
function updateHeader(){$('#balance').textContent=money(state.balance);applyLanguage();}
function renderServices(){
  const box=$('#service-list');
  const services=state.services||[];
  let total=0;
  services.forEach(s=>{const n=parseFloat(String(s.volume??'').replace(/[^0-9.]/g,''));if(Number.isFinite(n)) total+=n;});
  const countEl=$('#active-count'), volEl=$('#total-volume');
  if(countEl) countEl.textContent=faNum(services.length);
  if(volEl) volEl.textContent=(total%1?total.toFixed(1):total).toLocaleString('en-US')+' GB';
  if(!services.length){
    box.innerHTML=`<div class="empty-service"><div class="empty-icon">⌁</div><strong>${L('no_service')}</strong><p>${L('no_service_sub')}</p><button class="outline-red" data-action="buy">＋ خرید اولین سرویس</button></div>`;
    return;
  }
  box.innerHTML=services.slice(0,4).map(s=>`<div class="service-item">
    <div class="service-row"><div><div class="service-volume">${escapeHtml(s.volume)} ${state.language==='en'?'GB':'گیگ'}</div><div class="service-meta">${L('order')} #${escapeHtml(s.id)} · ${state.language==='en'?'Expires':'انقضا'}: ${escapeHtml(s.expires_at||'-')}</div></div><div class="stat-icon green">✓</div></div>
    ${s.link?`<div class="link-row" style="margin-top:12px"><textarea readonly class="link-box">${escapeHtml(s.link)}</textarea><button class="copy-link" onclick="copyServiceLink(this)" data-link="${escapeHtml(s.link)}">📋</button></div>`:''}
    <button class="buy" style="margin-top:10px" onclick="renewService(${Number(s.id)})">${L('renew')}</button>
  </div>`).join('');
}
function paymentModal(volume,price,custom=false,label=''){const isUnlimited=String(volume).toUpperCase().startsWith('UNLIMITED_');const title=label||(isUnlimited?String(volume):`${escapeHtml(volume)} ${state.language==='en'?'GB':'گیگ'}`);openModal(`<h2>${L('buy_title')} ${title}</h2><p>${L('valid')}</p><p><b>${L('amount')}: ${money(price)}</b></p><p>${L('wallet_balance')}: <b>${money(state.balance)}</b></p><button class="modal-action" onclick="doBuy('${escapeHtml(String(volume))}')">${L('pay_wallet')}</button><button class="modal-action" onclick="openDirectPurchase('${escapeHtml(String(volume))}',${Number(price)})">${L('direct_pay')}</button><button class="modal-action secondary-action" onclick="${custom?`showCustomVolume(5)`:`closeModal();refreshData(false)`}">${L('back')}</button>`);}
function buyConfirm(volume){const key=String(volume);const raw=state.plans.find(x=>String(x.volume??x.gb)===key);if(!raw){openModal(`<h2>❌ ${L('buy_fail')}</h2><p>${L('no_stock')}</p><button class="modal-action secondary-action" onclick="closeModal()">${L('close')}</button>`);return;}const price=Number(raw.price)||0;paymentModal(key,price,false,raw.kind==='unlimited'?planLabel(raw):'');}
window.openDirectPurchase=async(volume,price)=>{clearReceiptPreviewUrl();const raw=state.plans.find(x=>String(x.volume??x.gb)===String(volume));const label=raw?.kind==='unlimited'?planLabel(raw):(raw?planLabel(raw):String(volume));openModal(`<h2>${L('direct_pay')}</h2><p>${label}</p><p>${L('amount')}: <b>${money(price)}</b></p>${state.card?`<p>${L('card')}:</p><div class="card-number"><span>${escapeHtml(state.card)}</span><button class="copy-card" onclick="copyCard('${escapeHtml(state.card)}')" aria-label="${L('copy')}">📋</button></div>`:''}<p class="hint">${L('direct_hint')}</p><input id="purchase-receipt-file" type="file" accept="image/*"><div class="receipt-preview-wrap"><div class="receipt-preview-title">${L('receipt_preview')}</div><div id="purchase-receipt-preview" class="receipt-preview"></div></div><button class="modal-action" onclick="sendPurchaseReceipt('${escapeHtml(String(volume))}',${Number(price)})">📸 ${L('send_receipt')}</button><button class="modal-action secondary-action" onclick="paymentModal('${escapeHtml(String(volume))}',${Number(price)},false,'${escapeHtml(label)}')">${L('back')}</button>`);attachReceiptPreview('purchase-receipt-file','purchase-receipt-preview');};window.__receiptWatchTimer=null;
function stopReceiptWatch(){if(window.__receiptWatchTimer){clearInterval(window.__receiptWatchTimer);window.__receiptWatchTimer=null;}}
function clearReceiptAfterDecision(){stopReceiptWatch();clearReceiptPreviewUrl();}
function startReceiptStatusWatch(orderId,previewId,kind){
  stopReceiptWatch();
  const check=async()=>{
    try{
      const r=await api('/api/order-status',{method:'POST',body:JSON.stringify({order_id:Number(orderId)})});
      if(r.status==='approved'||r.status==='rejected'){
        clearReceiptAfterDecision();
        const title=r.status==='approved'?'✅ '+L('receipt_ok'):'❌ '+L('receipt_fail');
        const msg=r.status==='approved'?L('receipt_approved'):L('receipt_rejected');
        openModal(`<h2>${title}</h2><p>${escapeHtml(msg)}</p><p><b>${L('tracking_code')}:</b> #${escapeHtml(r.order_id??orderId)}</p><button class="modal-action" onclick="closeModal()">${L('ok')}</button>`);
      }
    }catch(e){}
  };
  check();
  window.__receiptWatchTimer=setInterval(check,5000);
}
window.sendPurchaseReceipt=async(volume,price)=>{const file=$('#purchase-receipt-file')?.files?.[0];if(!file){showToast(L('pick_receipt'));return;}const btn=document.querySelector('#modal-content .modal-action');setButtonBusy(btn,true);try{showToast(L('sending'));const image=await prepareReceiptImage(file);const result=await api('/api/buy-receipt',{method:'POST',body:JSON.stringify({volume:String(volume),amount:Number(price),image,filename:file.name})});openModal(`<h2>✅ ${L('buy_receipt_ok')}</h2><p><b>${L('tracking_code')}:</b> #${escapeHtml(result.order_id??'')}</p><p>${L('waiting_approval')}</p><div class="receipt-preview-wrap"><div class="receipt-preview-title">${L('receipt_preview')}</div><div id="purchase-receipt-preview" class="receipt-preview"></div></div><button class="modal-action" onclick="closeModal()">${L('ok')}</button>`);restoreReceiptPreview('purchase-receipt-preview');startReceiptStatusWatch(result.order_id,'purchase-receipt-preview','purchase');}catch(e){setButtonBusy(btn,false);openModal(`<h2>❌ ${L('buy_fail')}</h2><p>${escapeHtml(errorText(e))}</p><button class="modal-action secondary-action" onclick="closeModal()">${L('close')}</button>`);}};window.doBuy=async volume=>{window.__lastBuyVolume=volume;try{closeModal();showToast(L('buying'));const data=await api('/api/buy',{method:'POST',body:JSON.stringify({volume:String(volume)})});state.balance=Number(data.balance??data.new_balance??state.balance);if(data.services)state.services=data.services;updateHeader();renderServices();const extra=data.link?`<p><b>${L('link')}:</b></p><div class="link-row"><textarea readonly class="link-box">${escapeHtml(data.link)}</textarea><button class="copy-link" onclick="copyServiceLink(this)" data-link="${escapeHtml(data.link)}" aria-label="${L('copy')}">📋</button></div>`:'';openModal(`<h2>✅ ${L('buy_ok')}</h2><p>${L('order')} #${escapeHtml(data.order_id??'')} ${L('delivered')}</p><p>${L('new_balance')}: <b>${money(state.balance)}</b></p>${extra}<button class="modal-action" onclick="closeModal()">${L('ok')}</button>`);}catch(e){const msg=errorText(e);const insufficient=String(e?.message||'')==='insufficient_balance';const noStock=String(e?.message||'')==='no_stock';openModal(`<h2>❌ ${L('buy_fail')}</h2><p>${escapeHtml(msg)}</p>${insufficient?`<button class="modal-action" onclick="openCharge()">${L('go_charge')}</button>`:''}${noStock?`<button class="modal-action" onclick="closeModal();refreshData(false)">${L('refresh_balance')}</button>`:''}<button class="modal-action secondary-action" onclick="closeModal()">${L('close')}</button>`);}};function walletModal(){const history=(state.history||[]).slice(0,10).map(x=>`<div class="tx">${Number(x.amount)>=0?'🟢':'🔴'} ${money(Math.abs(Number(x.amount)))} — ${escapeHtml(x.description||x.type||'')}<br><span>${escapeHtml(x.created_at||'')}</span></div>`).join('')||`<p>${L('no_tx')}</p>`;openModal(`<h2>${L('wallet_title')}</h2><p>${L('current')}: <b>${money(state.balance)}</b></p><button class="modal-action" onclick="openCharge()">＋ ${L('charge')}</button><h3 class="modal-subtitle">${L('transactions')}</h3>${history}`);}
window.openCharge=()=>openModal(`<h2>${L('charge_title')}</h2><p>${L('min')}: ۱۰,۰۰۰ تومان</p><input id="charge-amount" inputmode="numeric" type="number" min="10000" placeholder="10000"><button class="modal-action" onclick="createCharge()">${L('continue')}</button>`);
window.createCharge=async()=>{const amount=Number($('#charge-amount')?.value||0);if(amount<10000){showToast(L('min')+': ۱۰,۰۰۰ تومان');return;}try{showToast(L('creating'));const data=await api('/api/charge',{method:'POST',body:JSON.stringify({amount})});const card=data.card||data.card_number||data.payment_card||'';const orderId=data.order_id??data.order??'';state.chargeAmount=amount;openModal(`<h2>${L('payment')}</h2><p>${L('amount')}: <b>${money(amount)}</b></p><p>${L('order_no')}: <b>#${escapeHtml(orderId)}</b></p>${card?`<p>${L('card')}:</p><div class="card-number"><span>${escapeHtml(card)}</span><button class="copy-card" onclick="copyCard('${escapeHtml(card)}')" aria-label="${L('copy')}">📋</button></div>`:'<p>Card number unavailable.</p>'}<p class="hint">${L('receipt_hint')}</p><input id="receipt-file" type="file" accept="image/*"><div class="receipt-preview-wrap"><div class="receipt-preview-title">${L('receipt_preview')}</div><div id="receipt-preview" class="receipt-preview"></div></div><button class="modal-action" onclick="sendReceipt(${Number(orderId)||0})">${L('send_receipt')}</button>`);attachReceiptPreview('receipt-file','receipt-preview');}catch(e){openModal(`<h2>❌ ${L('buy_fail')}</h2><p>${escapeHtml(errorText(e))}</p><button class="modal-action" onclick="closeModal()">${L('close')}</button>`);}};
window.copyServiceLink=async btn=>{const link=String(btn?.dataset?.link||'');if(!link)return;try{await navigator.clipboard.writeText(link);}catch(e){const ta=document.createElement('textarea');ta.value=link;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();}showToast(L('copy'));};
window.copyCard=async card=>{try{await navigator.clipboard.writeText(String(card));showToast(L('copied'));}catch(e){const ta=document.createElement('textarea');ta.value=card;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();showToast(L('copied'));}};
async function readReceiptImage(file){
  return await new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(String(reader.result||''));
    reader.onerror=()=>reject(new Error('file_read_error'));
    reader.onabort=()=>reject(new Error('file_read_error'));
    reader.readAsDataURL(file);
  });
}
async function prepareReceiptImage(file){
  const raw=await readReceiptImage(file);
  try{
    const img=new Image();
    const loaded=new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;});
    img.src=raw;
    await loaded;
    const maxSide=1600;
    const scale=Math.min(1,maxSide/Math.max(img.naturalWidth||img.width||1,img.naturalHeight||img.height||1));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round((img.naturalWidth||img.width)*scale));
    canvas.height=Math.max(1,Math.round((img.naturalHeight||img.height)*scale));
    const ctx=canvas.getContext('2d');
    if(!ctx) return raw;
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    const compressed=canvas.toDataURL('image/jpeg',0.82);
    return compressed&&compressed.length<raw.length?compressed:raw;
  }catch(e){
    return raw;
  }
}
window.sendReceipt=async orderId=>{
  const file=$('#receipt-file')?.files?.[0];
  const btn=document.querySelector('#modal-content .modal-action');
  if(!file){showToast(L('pick_receipt'));return;}
  if(!orderId){showToast(L('invalid_order'));return;}
  setButtonBusy(btn,true);
  try{
    showToast(L('sending'));
    const image=await prepareReceiptImage(file);
    const result=await api('/api/charge-receipt',{method:'POST',body:JSON.stringify({order_id:orderId,amount:Number(state.chargeAmount||0),image,filename:file.name})});
    openModal(`<h2>✅ ${L('receipt_ok')}</h2><p><b>${L('tracking_code')}:</b> #${escapeHtml(result.order_id??orderId)}</p><p>${L('waiting_approval')}</p><div class="receipt-preview-wrap"><div class="receipt-preview-title">${L('receipt_preview')}</div><div id="receipt-preview" class="receipt-preview"></div></div><button class="modal-action" onclick="closeModal()">${L('ok')}</button>`); restoreReceiptPreview('receipt-preview'); startReceiptStatusWatch(result.order_id??orderId,'receipt-preview','charge');
  }catch(e){
    setButtonBusy(btn,false);
    openModal(`<h2>❌ ${L('receipt_fail')}</h2><p>${escapeHtml(errorText(e))}</p><button class="modal-action" onclick="closeModal()">${L('close')}</button>`);
  }
};
function serviceLabel(s){if(s?.volume&&String(s.volume).toUpperCase().startsWith('UNLIMITED_')){const p=state.plans.find(x=>String(x.volume)===String(s.volume));return escapeHtml(p?planLabel(p):('♾️ '+String(s.volume)));}return `📦 ${escapeHtml(s.volume)} ${state.language==='en'?'GB':'گیگ'}`;}
async function showServices(){try{const data=await api('/api/services');state.services=data.services||[];renderServices();if(!state.services.length){openModal(`<h2>${L('services_title')}</h2><p>${L('no_services')}</p>`);return;}const list=state.services.map(s=>`<div class="service-list glass"><b>${serviceLabel(s)}</b><p>${L('order')} #${escapeHtml(s.id)}<br>${state.language==='en'?'Expires':'انقضا'}: ${escapeHtml(s.expires_at||'-')}</p>${s.link?`<div class="link-row"><textarea readonly class="link-box">${escapeHtml(s.link)}</textarea><button class="copy-link" onclick="copyServiceLink(this)" data-link="${escapeHtml(s.link)}" aria-label="${L('copy')}">📋</button></div>`:''}<button class="modal-action" onclick="renewService(${Number(s.id)})">${L('renew')}</button></div>`).join('');openModal(`<h2>${L('services_title')}</h2>${list}`);}catch(e){openModal(`<h2>❌ ${L('close')}</h2><p>${escapeHtml(errorText(e))}</p>`);}}window.showServices=showServices;
window.renewService=async orderId=>{try{showToast(L('renewing'));const data=await api('/api/renew',{method:'POST',body:JSON.stringify({order_id:orderId})});state.balance=Number(data.balance??data.new_balance??state.balance);updateHeader();const link=data.link?`<p><b>${L('link')}:</b></p><div class="link-row"><textarea readonly class="link-box">${escapeHtml(data.link)}</textarea><button class="copy-link" onclick="copyServiceLink(this)" data-link="${escapeHtml(data.link)}" aria-label="${L('copy')}">📋</button></div>`:'';openModal(`<h2>✅ ${L('renew_ok')}</h2><p>${L('renew_done')}</p><p>${L('new_balance')}: <b>${money(state.balance)}</b></p>${link}<button class="modal-action" onclick="closeModal()">${L('ok')}</button>`);await refreshData(false);}catch(e){openModal(`<h2>❌ ${L('renew_fail')}</h2><p>${escapeHtml(errorText(e))}</p><button class="modal-action" onclick="closeModal()">${L('close')}</button>`);}};
async function refreshData(show=true){try{const data=await api('/api/bootstrap');state={...state,...data,balance:Number(data.balance||0),plans:data.plans||data.tariffs||FALLBACK_PLANS,services:data.services||[],history:data.history||[],language:data.language||state.language||'fa'};applyLanguage();updateHeader();renderPlans();renderServices();if(show)showToast(L('refresh'));}catch(e){console.error(e);if(!state.plans.length)state.plans=FALLBACK_PLANS;applyLanguage();renderPlans();renderServices();if(show)showToast(errorText(e)||L('network'));}}
window.refreshData=refreshData;
function setupTelegram(){if(!tg){showToast('Telegram Mini App');return;}tg.ready();tg.expand();try{tg.setHeaderColor('#102a43');tg.setBackgroundColor('#0b1624');}catch(e){}}
function navigate(page){document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.page===page));if(page==='home')window.scrollTo({top:0,behavior:'smooth'});if(page==='services')showServices();if(page==='buy')$('#plans-panel').scrollIntoView({behavior:'smooth',block:'start'});if(page==='help')$('#help-panel').scrollIntoView({behavior:'smooth',block:'start'});if(page==='wallet')walletModal();if(page==='profile')profileModal();}
function profileModal(){const u=state.user||{};openModal(`<h2>👤 پروفایل</h2><div class="profile-box"><div class="profile-avatar"><img src="logo.webp" alt="Hanzu"></div><h3>${escapeHtml(u.first_name||'کاربر HanzuVPN')}</h3><p>${u.username?'@'+escapeHtml(u.username):''}</p><div class="card-number"><span>ID: ${escapeHtml(u.id||'-')}</span></div></div><button class="modal-action" onclick="closeModal()">${L('close')}</button>`);}function action(a){if(a==='wallet')return navigate('wallet');if(a==='wallet-history')return walletModal();if(a==='services')return navigate('services');if(a==='buy')return navigate('buy');if(a==='renew')return navigate('services');if(a==='volume')return navigate('buy');if(a==='help')return navigate('help');if(a==='support'){if(tg?.openTelegramLink)tg.openTelegramLink(state.support||'https://t.me/ByHxnzu');else location.href=state.support||'https://t.me/ByHxnzu';return;}const data={android:[`🤖 ${L('android')}`,state.language==='en'?['1) Install Hiddify or V2Box.','2) Copy your subscription link.','3) Add the Subscription in the app.','4) Update and Connect.']:['۱) Hiddify یا V2Box را نصب کن.','۲) لینک اشتراک را کپی کن.','۳) داخل برنامه Subscription را اضافه کن.','۴) Update و Connect کن.']],ios:[` ${L('ios')}`,state.language==='en'?['1) Install Hiddify or V2Box.','2) Copy the subscription link.','3) Import it into the app.','4) Update and Connect.']:['۱) Hiddify یا V2Box را نصب کن.','۲) لینک اشتراک را کپی کن.','۳) لینک را داخل برنامه Import کن.','۴) Update و Connect کن.']],windows:[`▣ ${L('windows')}`,state.language==='en'?['1) Install Hiddify or v2rayN.','2) Copy your subscription link.','3) Import Subscription.','4) Update and connect.']:['۱) Hiddify یا v2rayN را نصب کن.','۲) لینک Subscription را کپی کن.','۳) Import Subscription را بزن.','۴) Update و اتصال را فعال کن.']]};if(data[a])openModal(`<h2>${data[a][0]}</h2><ol>${data[a][1].map(x=>`<li>${x}</li>`).join('')}</ol><button class="modal-action" onclick="closeModal()">${L('close')}</button>`);}
document.addEventListener('click',e=>{const actionBtn=e.target.closest('[data-action]');if(actionBtn)action(actionBtn.dataset.action);const nav=e.target.closest('[data-page]');if(nav)navigate(nav.dataset.page);});
$('#refresh').addEventListener('click',()=>refreshData(true));
const langBtn=document.createElement('button');langBtn.className='icon-btn lang-btn';langBtn.id='language';langBtn.textContent='🌐';langBtn.setAttribute('aria-label','Language');document.querySelector('.topbar')?.appendChild(langBtn);langBtn.addEventListener('click',()=>{openModal(`<h2>🌐 ${state.language==='en'?'Language':state.language==='ku'?'زمان':'زبان'}</h2>${Object.entries(LANG_NAMES).map(([k,v])=>`<button class="modal-action ${k===state.language?'selected-lang':''}" onclick="setLanguage('${k}')">${v}</button>`).join('')}`);});
window.setLanguage=async lang=>{try{await api('/api/language',{method:'POST',body:JSON.stringify({language:lang})});state.language=lang;applyLanguage();renderPlans();renderServices();closeModal();showToast(lang==='en'?'Language changed':lang==='ku'?'زمان گۆڕدرا':'زبان تغییر کرد');}catch(e){showToast(errorText(e));}};$('#modal-close').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});
setupTelegram();
if(!state.plans.length)state.plans=FALLBACK_PLANS;
renderPlans();renderServices();
refreshData(false);
setTimeout(()=>{$('#loader').classList.add('hide');$('#app').hidden=false},150);

const motionStyle=document.createElement('style');motionStyle.textContent=`
button{position:relative;overflow:hidden}.ripple{position:absolute;width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.5);transform:translate(-50%,-50%) scale(1);animation:ripple .6s ease-out forwards;pointer-events:none}.btn-spinner{display:inline-block;width:13px;height:13px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;vertical-align:-2px;margin-inline:3px;animation:spin .7s linear infinite}.is-loading{opacity:.82;pointer-events:none}@keyframes ripple{to{transform:translate(-50%,-50%) scale(30);opacity:0}}
`;document.head.appendChild(motionStyle);
