import { Telegraf } from "telegraf";
import mongoose from "mongoose";

// اتصال به MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// تعریف Schema برای کاربران
const userSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  waitingForPhoto: { type: Boolean, default: false },
  photos: [
    {
      url: { type: String, required: true },
      key: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
});

const User = mongoose.model("User", userSchema);

const bot = new Telegraf(process.env.BOT_TOKEN);

// دستور /start
bot.start(async (ctx) => {
  console.log(ctx, "ctx");
  console.log("📩 Command /start received from:", ctx.from);
  const userId = ctx.from.id;

  // بررسی یا ایجاد کاربر در دیتابیس
  await User.findOneAndUpdate(
    { userId },
    { userId, waitingForPhoto: false },
    { upsert: true, new: true }
  );

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
bot.command("buttons", async (ctx) => {
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

// وقتی کاربر دکمه آپلود یا حذف را زد
bot.on("callback_query", async (ctx) => {
  console.log(ctx.callbackQuery, "ctx.callbackQuery");
  const callbackData = ctx.callbackQuery?.data;
  console.log("Callback received:", callbackData);
  const userId = ctx.from.id;

  if (callbackData === "upload_photo") {
    await User.findOneAndUpdate(
      { userId },
      { waitingForPhoto: true },
      { upsert: true }
    );
    ctx.reply("📸 لطفاً یک عکس ارسال کن");
  } else if (
    typeof callbackData === "string" &&
    callbackData.startsWith("delete_")
  ) {
    const key = callbackData.replace("delete_", "");
    try {
      const res = await fetch(`${process.env.UPLOAD_ENDPOINT}/api/upload`, {
        method: "DELETE",
        body: JSON.stringify({ key }),
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();
      if (result.success) {
        // حذف عکس از دیتابیس
        await User.findOneAndUpdate({ userId }, { $pull: { photos: { key } } });
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
  const userId = ctx.from.id;
  const user = await User.findOne({ userId });

  if (!user || !user.waitingForPhoto) {
    return ctx.reply("لطفاً اول دکمه آپلود را بزنید!");
  }

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
      // ذخیره اطلاعات عکس در دیتابیس
      await User.findOneAndUpdate(
        { userId },
        {
          waitingForPhoto: false,
          $push: { photos: { url: data.url, key: data.key } },
        }
      );
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
    console.log("📩 Received webhook update:", JSON.stringify(body, null, 2));
    await bot.handleUpdate(body);
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("❌ Error in POST handler:", err);
    return new Response("Error", { status: 500 });
  }
}

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
