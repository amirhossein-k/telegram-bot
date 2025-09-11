// D:\prject\telegram\telegram-bot\app\api\
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

// دستورات تستی
bot.start((ctx) => ctx.reply("سلام 👋 رباتت روشن شد!"));
bot.command("ping", (ctx) => ctx.reply("pong 🏓"));

export async function POST(req) {
  try {
    const body = await req.json();

    // لاگ‌گیری برای بررسی درخواست‌ها
    console.log(
      "📩 Update received from Telegram:",
      JSON.stringify(body, null, 2)
    );

    // پردازش پیام‌ها توسط telegraf
    await bot.handleUpdate(body);

    return new Response("ok");
  } catch (err) {
    console.error("❌ Error in Telegram Webhook:", err);
    return new Response("error", { status: 500 });
  }
}

// برای تست دستی با مرورگر یا Postman
export async function GET() {
  return new Response("✅ Telegram Webhook is running");
}

// https://telegram-bot-six-liard.vercel.app/

// https://api.telegram.org/bot8005021181:AAEgmDydamItRUvKR2ayP-pVTR848AQaHbs/setWebhook?url=https://telegram-bot-six-liard.vercel.app/telegram
