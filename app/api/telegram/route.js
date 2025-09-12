// app/api/telegram/route.js
import { Telegraf } from "telegraf";
import LocalSession from "telegraf-session-local";

const bot = new Telegraf(process.env.BOT_TOKEN);

// ذخیره session در فایل JSON روی سرور
bot.use(new LocalSession({ database: "sessions.json" }).middleware());

// دستور /start
bot.start((ctx) => {
  ctx.session.waitingForPhoto = false; // ریست session
  ctx.reply("👋 خوش آمدید! برای آپلود عکس، دکمه زیر را بزنید:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📤 آپلود عکس", callback_data: "upload_photo" }],
      ],
    },
  });
});

// دستور /buttons
bot.command("buttons", (ctx) => {
  ctx.reply("یک گزینه انتخاب کنید:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📤 آپلود عکس", callback_data: "upload_photo" }],
      ],
    },
  });
});

// وقتی کاربر دکمه آپلود عکس رو زد
bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery?.data;
  if (!data) return ctx.answerCbQuery();

  if (data === "upload_photo") {
    ctx.session.waitingForPhoto = true;
    ctx.reply("📸 لطفاً یک عکس ارسال کن");
  }

  ctx.answerCbQuery();
});

// وقتی عکس ارسال شد
bot.on("photo", async (ctx) => {
  if (!ctx.session.waitingForPhoto) {
    return ctx.reply("❌ لطفاً اول دکمه آپلود را بزنید!");
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
    }).catch(() => null);

    if (!res) {
      return ctx.reply("❌ سرور آپلود در دسترس نیست");
    }

    const data = await res.json();
    if (data.success) {
      ctx.session.waitingForPhoto = false;
      await ctx.replyWithPhoto(data.url, {
        caption: "✅ آپلود موفق شد!",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🗑 حذف عکس", callback_data: `delete_${data.key}` }],
          ],
        },
      });
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

// هندلینگ درخواست‌ها
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
  try {
    await bot.telegram.setWebhook(
      `${process.env.NEXT_PUBLIC_URL}/api/telegram`
    );
    return new Response("✅ Webhook set successfully");
  } catch (err) {
    console.error("❌ Error setting webhook:", err);
    return new Response("❌ Error setting webhook", { status: 500 });
  }
}
