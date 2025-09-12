import { Telegraf } from "telegraf";
import MongoSession from "telegraf-session-mongodb";
import { MongoClient } from "mongodb";

const bot = new Telegraf(process.env.BOT_TOKEN);

const client = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function setupMongoSession() {
  try {
    await client.connect();
    const db = client.db();

    const session = new MongoSession(db, {
      collectionName: "sessions",
      getSessionKey: (ctx) => {
        // فقط وقتی chat وجود داره سشن برگردون
        if (ctx.chat && ctx.from) {
          return `${ctx.chat.id}:${ctx.from.id}`;
        }
        return null; // برای آپدیت‌هایی مثل my_chat_member
      },
    });

    bot.use(session.middleware());
    console.log("✅ MongoDB connected for sessions");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
  }
}

setupMongoSession();
