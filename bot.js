const TOKEN = "CCECGG0UASZOEVMLGCLROSINXMADFBIONGNBDRUFOOKTKHOPYBAIQNSXGBJFRODI";
const API_BASE = `https://botapi.rubika.ir/v3/${TOKEN}`;

export default {
  async fetch(request, env, ctx) {
    
    // تست آنلاین بودن
    if (request.method === "GET") {
      return new Response("🤖 Bomber Webhook Active ✅");
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const update = await request.json();
      
      // 🔍 لاگ کامل برای دیدن ساختار واقعی
      console.log("=== UPDATE RECEIVED ===");
      console.log(JSON.stringify(update, null, 2));
      console.log("=======================");
      
      // تلاش برای پیدا کردن chat_id و text در هر ساختار ممکن
      let chatId = null;
      let text = "";
      let userId = null;
      
      // حالت 1: ساختار مستقیم
      if (update.chat_id) chatId = update.chat_id;
      if (update.text) text = update.text;
      if (update.author_object_id) userId = update.author_object_id;
      
      // حالت 2: داخل data
      if (update.data) {
        if (update.data.chat_id) chatId = update.data.chat_id;
        if (update.data.text) text = update.data.text;
        if (update.data.author_object_id) userId = update.data.author_object_id;
      }
      
      // حالت 3: داخل message
      if (update.message) {
        if (update.message.chat_id) chatId = update.message.chat_id;
        if (update.message.text) text = update.message.text;
        if (update.message.author_object_id) userId = update.message.author_object_id;
      }
      
      // حالت 4: داخل data.message
      if (update.data && update.data.message) {
        if (update.data.message.chat_id) chatId = update.data.message.chat_id;
        if (update.data.message.text) text = update.data.message.text;
        if (update.data.message.author_object_id) userId = update.data.message.author_object_id;
      }
      
      console.log("Extracted:", { chatId, text, userId });
      
      // اگه chat_id پیدا شد، جواب بده
      if (chatId) {
        if (text === "/start") {
          await sendMessage(chatId, "🎉 سلام! بات با موفقیت روی Cloudflare Worker نصب شد!\n\n✅ وب‌هوک فعال است");
        } else {
          await sendMessage(chatId, `پیام شما دریافت شد: ${text}\n\nChat ID: ${chatId}`);
        }
      } else {
        // اگه chat_id پیدا نشد، حداقل یه پیام تستی به ادمین بفرست
        console.log("❌ chat_id پیدا نشد!");
      }
      
      return new Response("OK", { status: 200 });
      
    } catch (error) {
      console.error("Error:", error);
      return new Response("Error: " + error.message, { status: 500 });
    }
  }
};

async function sendMessage(chatId, text) {
  try {
    const response = await fetch(`${API_BASE}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    });
    const result = await response.text();
    console.log("Send Message Result:", result);
    return result;
  } catch (e) {
    console.error("Send Error:", e);
  }
}
