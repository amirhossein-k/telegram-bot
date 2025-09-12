import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

// دستور /start
bot.start((ctx) => {
  console.log("📩 Command /start received from:", ctx.from);
  const markup = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📤 آپلود عکس", callback_data: "upload_photo" }],
      ],
    },
  };
  console.log("Markup:", JSON.stringify(markup, null, 2));
  ctx.reply("خوش آمدید! برای آپلود عکس، دکمه زیر را بزنید:", markup);
});

// دستور /buttons
bot.command("buttons", (ctx) => {
  console.log("📩 Command /buttons received from:", ctx.from);
  const markup = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📤 آپلود عکس", callback_data: "upload_photo" }],
      ],
    },
  };
  console.log("Markup:", JSON.stringify(markup, null, 2));
  ctx.reply("یک گزینه انتخاب کنید:", markup);
});

// وقتی کاربر دکمه آپلود عکس را زد
bot.on("callback_query", async (ctx) => {
  console.log("Callback received:", ctx.callbackQuery.data);
  if (ctx.callbackQuery.data === "upload_photo") {
    ctx.reply("📸 لطفاً یک عکس ارسال کن");
  } else if (ctx.callbackQuery.data.startsWith("delete_")) {
    const key = ctx.callbackQuery.data.replace("delete_", "");
    try {
      const res = await fetch(`${process.env.UPLOAD_ENDPOINT}/api/upload`, {
        method: "DELETE",
        body: JSON.stringify({ key }),
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();
      if (result.success) {
        ctx.reply("🗑 عکس با موفقیت حذف شد!");
      } else {
        console.error("❌ Delete response error:", result);
        ctx.reply("❌ خطا در حذف عکس");
      }
    } catch (err) {
      console.error("❌ Error deleting:", err);
      ctx.reply("❌ خطا در حذف عکس");
    }
  }
  ctx.answerCbQuery();
});

// وقتی عکس ارسال شد
bot.on("photo", async (ctx) => {
  const photo = ctx.message.photo.pop();
  const fileId = photo.file_id;

  try {
    const file = await ctx.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
    console.log("File URL:", fileUrl);

    ctx.reply("⏳ در حال آپلود عکس...");

    const res = await fetch(`${process.env.UPLOAD_ENDPOINT}/api/upload`, {
      method: "POST",
      body: JSON.stringify({ url: fileUrl }),
      headers: { "Content-Type": "application/json" },
    }).catch((err) => {
      console.error("❌ Fetch error:", err.message, {
        url: `${process.env.UPLOAD_ENDPOINT}/api/upload`,
        status: err.response?.status,
        statusText: err.response?.statusText,
      });
      return null;
    });

    if (!res) {
      return ctx.reply("❌ سرور آپلود در دسترس نیست");
    }

    const data = await res.json();
    if (data.success) {
      await ctx.replyWithPhoto(data.url, {
        caption: "✅ آپلود موفق شد!",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🗑 حذف عکس", callback_data: `delete_${data.key}` }],
          ],
        },
      });
    } else {
      console.error("❌ Upload response error:", data);
      ctx.reply("❌ خطا در آپلود به سرور");
    }
  } catch (err) {
    console.error("❌ Error uploading:", err);
    ctx.reply("❌ خطا در آپلود عکس");
  }
});

// دستور تست
bot.command("ping", (ctx) => ctx.reply("pong 🏓"));

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
