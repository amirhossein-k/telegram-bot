import { Telegraf } from "telegraf";
import { startHandler } from "./handlers/start";
import { photoHandler } from "./handlers/photo";
import { callbackHandler } from "./handlers/callback";
import { buttonsHandler } from "./handlers/buttons";

const bot = new Telegraf(process.env.BOT_TOKEN!);
const userStates = new Map();

bot.start(startHandler(userStates));
bot.command("buttons", buttonsHandler());  // 🔹 اینجا هندلر دکمه‌ها

// bot.command("buttons", startHandler(userStates));
bot.command("ping", (ctx) => ctx.reply("pong 🏓"));

bot.on("photo", photoHandler(userStates));
bot.on("callback_query", callbackHandler(userStates));

export default bot;
