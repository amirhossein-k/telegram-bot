import { connectDB } from "@/app/lib/mongodb";
import Photo from "@/app/model/Photo";
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

// ذخیره حالت کاربران
const userStates = new Map();

// دستور /start
bot.start((ctx) => {
  userStates.set(ctx.from.id, { waitingForPhoto: false });
  const markup = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📤 آپلود عکس", callback_data: "upload_photo" }],
      ],
    },
  };
  ctx.reply("خوش آمدید! برای آپلود عکس، دکمه زیر را بزنید:", markup);
});

// دستور /buttons
bot.command("buttons", (ctx) => {
  const markup = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📤 آپلود عکس", callback_data: "upload_photo" }],
      ],
    },
  };
  ctx.reply("یک گزینه انتخاب کنید:", markup);
});

// دکمه‌ها
bot.on("callback_query", async (ctx) => {
  const callbackData = ctx.callbackQuery?.data;
  console.log("Callback received:", callbackData);

  // خیلی سریع جواب بدیم که ارور "query is too old" نیاد
  await ctx.answerCbQuery();

  if (callbackData === "upload_photo") {
    userStates.set(ctx.from.id, { waitingForPhoto: true });
    return ctx.reply("📸 لطفاً یک عکس ارسال کن");
  }

  if (typeof callbackData === "string" && callbackData.startsWith("delete_")) {
    const key = callbackData.replace("delete_", ""); // باید بشه "uploads/telegram/xxx.jpg"
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/upload`, {
        method: "DELETE",
        body: JSON.stringify({ key }),
        headers: { "Content-Type": "application/json" },
      });

      const text = await res.text();
      console.log("Delete server response:", text);

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        return ctx.reply("❌ پاسخ سرور حذف معتبر نیست");
      }

      if (result.success) {
        await connectDB();
        await Photo.findOneAndDelete({ fileKey: key });
        ctx.reply("🗑 عکس با موفقیت حذف شد!");
      } else {
        ctx.reply("❌ خطا در حذف عکس");
      }
    } catch (err) {
      console.error("❌ Error deleting:", err);
      ctx.reply("❌ خطا در حذف عکس");
    }
  }
});

// وقتی عکس ارسال شد
bot.on("photo", async (ctx) => {
  const userState = userStates.get(ctx.from.id) || { waitingForPhoto: false };
  if (!userState.waitingForPhoto) {
    return ctx.reply("لطفاً اول دکمه آپلود را بزنید!");
  }

  const photo = ctx.message.photo.pop();
  const fileId = photo.file_id;

  try {
    const file = await ctx.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
    console.log("File URL:", fileUrl);

    ctx.reply("⏳ در حال آپلود عکس...");

    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/upload`, {
      method: "POST",
      body: JSON.stringify({ url: fileUrl }),
      headers: { "Content-Type": "application/json" },
    });

    const text = await res.text();
    console.log("Upload server response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return ctx.reply("❌ پاسخ سرور معتبر نیست (JSON برنگشت)");
    }

    if (data.success) {
      userStates.set(ctx.from.id, { waitingForPhoto: false });
      // ذخیره در دیتابیس
      await connectDB();
      await Photo.create({
        userId: ctx.from.id,
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        fileUrl: data.url,
        fileKey: data.Key, // کلید برگردونده شده از سرور
        telegramFileId: fileId, // file_id تلگرام
      });

      await ctx.replyWithPhoto(data.url, {
        caption: "✅ آپلود موفق شد!",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🗑 حذف عکس", callback_data: `delete_${data.Key}` }],
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

// POST handler
export async function POST(req) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ Error in POST handler:", err);
    return new Response("Error", { status: 500 });
  }
}

// GET handler برای ست کردن webhook
export async function GET() {
  try {
    await bot.telegram.setWebhook(
      `${process.env.NEXT_PUBLIC_URL}/api/telegram`
    );
    return new Response("✅ Webhook set successfully", { status: 200 });
  } catch (err) {
    console.error("❌ Error setting webhook:", err);
    return new Response("❌ Error setting webhook", { status: 500 });
  }
}
