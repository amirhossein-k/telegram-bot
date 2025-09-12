import { Telegraf } from "telegraf";
import { MongoClient } from "mongodb";
import MongoSession from "telegraf-session-mongo";

const bot = new Telegraf(process.env.BOT_TOKEN);

let client;
let mongoInitialized = false;

async function setupMongoSession() {
  if (mongoInitialized) return;

  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  const db = client.db();

  const session = new MongoSession(db, {
    collectionName: "sessions",
    getSessionKey: (ctx) => {
      // هندل کردن انواع آپدیت مختلف
      if (ctx.chat) return `${ctx.chat.id}`;
      if (ctx.from) return `${ctx.from.id}`;
      return null;
    },
  });

  bot.use(session.middleware());
  mongoInitialized = true;
  console.log("✅ MongoDB connected for sessions");
}

// /start
bot.start((ctx) => {
  ctx.session = ctx.session || {}; // fallback
  ctx.session.waitingForPhoto = false;
  ctx.reply("👋 خوش آمدید! برای آپلود عکس، دکمه زیر را بزنید:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📤 آپلود عکس", callback_data: "upload_photo" }],
      ],
    },
  });
});

// callback_query
bot.on("callback_query", async (ctx) => {
  ctx.session = ctx.session || {}; // fallback
  const data = ctx.callbackQuery?.data;

  if (data === "upload_photo") {
    ctx.session.waitingForPhoto = true;
    ctx.reply("📸 لطفاً یک عکس ارسال کن");
  }

  ctx.answerCbQuery();
});

// photo
bot.on("photo", async (ctx) => {
  ctx.session = ctx.session || {}; // fallback
  if (!ctx.session.waitingForPhoto) {
    return ctx.reply("❌ اول دکمه آپلود را بزنید!");
  }

  ctx.session.waitingForPhoto = false;
  ctx.reply("✅ عکس دریافت شد (اینجا آپلود به S3 اضافه میشه)");
});

// webhook POST
export async function POST(req) {
  try {
    await setupMongoSession();
    const body = await req.json();
    await bot.handleUpdate(body);
    return new Response("ok");
  } catch (err) {
    console.error("❌ Error:", err);
    return new Response("error", { status: 500 });
  }
}

// webhook GET
export async function GET() {
  try {
    await setupMongoSession();
    await bot.telegram.setWebhook(
      `${process.env.NEXT_PUBLIC_URL}/api/telegram`
    );
    return new Response("✅ Webhook set successfully");
  } catch (err) {
    console.error("❌ Error setting webhook:", err);
    return new Response("❌ Error setting webhook", { status: 500 });
  }
}
