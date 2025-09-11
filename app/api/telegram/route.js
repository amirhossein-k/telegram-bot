// D:\prject\telegram\telegram-bot\app\api\
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

// نمونه یک دستور ساده
bot.start((ctx) => ctx.reply("سلام 👋 رباتت روشن شد!"));
bot.command("ping", (ctx) => ctx.reply("pong 🏓"));

export async function POST(req) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body); // پردازش پیام دریافتی
    return new Response("ok");
  } catch (err) {
    console.error(err);
    return new Response("error", { status: 500 });
  }
}

// https://telegram-bot-six-liard.vercel.app/

// https://api.telegram.org/bot8005021181:AAEgmDydamItRUvKR2ayP-pVTR848AQaHbs/setWebhook?url=https://telegram-bot-six-liard.vercel.app/telegram
