// D:\prject\telegram\telegram-bot\app\api\
// route.js
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

let games = {}; // ذخیره بازی‌ها به صورت in-memory

// وقتی کاربر /start زد
bot.start((ctx) => {
  ctx.replyWithPhoto(
    { url: "https://t.me/hamdelchannel/2" }, // لینک عکس (یا می‌تونی File ID تلگرام بزنی)
    {
      caption:
        "👋 سلام! به ربات ما خوش اومدی.\n\nاینجا می‌تونی بازی بینگو رو شروع کنی 🎲",
      parse_mode: "Markdown",
    }
  );
});
// هر متنی که کاربر بفرسته همونو برگردون
bot.on("text", (ctx) => {
  console.log("📩 User sent:", ctx.message.text);
  ctx.reply(`Echo: ${ctx.message.text}`);
});
bot.command("buttons", (ctx) => {
  const keyboard = {
    inline_keyboard: [
      [{ text: "دکمه 1", callback_data: "button1" }],
      [{ text: "دکمه 2", callback_data: "button2" }],
    ],
  };
  ctx.reply("دکمه‌ها را بزنید:", { reply_markup: keyboard });
});
// مدیریت callback
bot.on("callback_query", (ctx) => {
  if (ctx.callbackQuery.data === "button1") {
    ctx.reply("دکمه 1 زده شد!");
  }
  ctx.answerCbQuery();
});
// دستور تستی
bot.command("ping", (ctx) => ctx.reply("pong 🏓"));

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("📩 Update:", JSON.stringify(body, null, 2));

    // اینجا پیام دریافتی رو هندل می‌کنیم
    await bot.handleUpdate(body);

    return new Response("ok");
  } catch (err) {
    console.error("❌ Error:", err);
    return new Response("error", { status: 500 });
  }
}

// برای تست دستی در مرورگر
export async function GET() {
  return new Response("✅ Telegram Webhook is running");
}
