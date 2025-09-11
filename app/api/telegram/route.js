// D:\prject\telegram\telegram-bot\app\api\
// route.js
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

// هر متنی که کاربر بفرسته همونو برگردون
bot.on("text", (ctx) => {
  console.log("📩 User sent:", ctx.message.text);
  ctx.reply(`Echo: ${ctx.message.text}`);
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

// https://telegram-bot-six-liard.vercel.app/

// https://api.telegram.org/bot8005021181:AAEgmDydamItRUvKR2ayP-pVTR848AQaHbs/setWebhook?url=https://telegram-bot-six-liard.vercel.app/telegram
