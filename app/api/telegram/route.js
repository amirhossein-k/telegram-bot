// D:\prject\telegram\telegram-bot\app\api\
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

// هر پیامی بیاد، متنش رو برگردون
bot.on("text", (ctx) => {
  console.log("📩 Message received:", ctx.message.text);
  ctx.reply(`پیام شما دریافت شد ✅: ${ctx.message.text}`);
});

// دستور /start
bot.start((ctx) => ctx.reply("سلام 👋 ربات آماده‌ست"));

// دستور /ping
bot.command("ping", (ctx) => ctx.reply("pong 🏓"));

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("📩 Update from Telegram:", JSON.stringify(body, null, 2));

    await bot.handleUpdate(body);

    return new Response("ok");
  } catch (err) {
    console.error("❌ Error in Telegram Webhook:", err);
    return new Response("error", { status: 500 });
  }
}

// فقط برای تست دستی
export async function GET() {
  return new Response("✅ Telegram Webhook is running");
}

// https://telegram-bot-six-liard.vercel.app/

// https://api.telegram.org/bot8005021181:AAEgmDydamItRUvKR2ayP-pVTR848AQaHbs/setWebhook?url=https://telegram-bot-six-liard.vercel.app/telegram
