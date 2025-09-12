// app/api/telegram/route.js
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

const localSession = new LocalSession({ database: "sessions.json" });
bot.use(localSession.middleware());

// دکمه‌ها
bot.command("buttons", (ctx) => {
  ctx.session.waitingForPhoto = true; // کاربر در حالت انتظار برای آپلود
  ctx.reply("یک گزینه انتخاب کنید:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📤 آپلود عکس", callback_data: "upload_photo" }],
      ],
    },
  });
});

// وقتی دکمه آپلود عکس زده شد
bot.on("callback_query", (ctx) => {
  if (ctx.callbackQuery.data === "upload_photo") {
    ctx.session.waitingForPhoto = true;
    ctx.reply("📸 لطفاً یک عکس ارسال کن");
  }
  ctx.answerCbQuery();
});

// وقتی عکس ارسال شد
bot.on("photo", async (ctx) => {
  console.log("📸 Photo received:", ctx.message.photo);
  if (!ctx.session.waitingForPhoto) {
    return ctx.reply("لطفاً اول دکمه آپلود را بزنید!");
  }

  const photo = ctx.message.photo.pop();
  const fileId = photo.file_id;

  try {
    const file = await ctx.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;

    ctx.reply("⏳ در حال آپلود عکس...");

    const res = await fetch(`${process.env.UPLOAD_ENDPOINT}/api/upload`, {
      method: "POST",
      body: JSON.stringify({ url: fileUrl }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (data.success) {
      ctx.session.waitingForPhoto = false; // پایان حالت انتظار
      await ctx.replyWithPhoto(data.url, { caption: "✅ آپلود موفق شد!" });
    } else {
      ctx.reply("❌ خطا در آپلود به سرور");
    }
  } catch (err) {
    console.error("❌ Error uploading:", err);
    ctx.reply("❌ خطا در آپلود عکس");
  }
});

// دستور تست
bot.command("ping", (ctx) => ctx.reply("pong 🏓"));

// هندلینگ وبهوک
export async function POST(req) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return new Response("ok");
  } catch (err) {
    console.error("❌ Error:", err);
    return new Response("error", { status: 500 });
  }
}

export async function GET() {
  return new Response("✅ Telegram Webhook is running");
}
