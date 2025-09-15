// app\telegram\bot.ts
import { Telegraf } from "telegraf";
import { profileHandler } from "./handlers/profile";
import { callbackHandler } from "./handlers/callback";
import { photoUploadHandler, setPhotoSlotHandler } from "./handlers/photoHandler";
import { startHandler } from "./handlers/start";
import { connectDB } from "../lib/mongodb";
import User from "../model/User";


const bot = new Telegraf(process.env.BOT_TOKEN!);
bot.start(startHandler()); // اینجا هندلر استارت جدید

// پیام متنی (اسم، سن و ...)
bot.on("text", profileHandler());

// کلیک روی دکمه‌ها (جنسیت، استان، شهر، شرایط، آپلود عکس)
bot.on("callback_query", async (ctx) => {
    await callbackHandler()(ctx);
    await setPhotoSlotHandler()(ctx);
});

// آپلود عکس واقعی
bot.on("photo", photoUploadHandler());

bot.hears("👤 پروفایل من", async (ctx) => {
    await connectDB();
    const user = await User.findOne({ telegramId: ctx.from.id });
    if (!user) return ctx.reply("❌ پروفایل پیدا نشد");

    // ارسال آلبوم عکس‌ها
    if (user.photos && user.photos.length > 0) {
        const media = user.photos.map((url: string) => ({ type: "photo", media: url }));
        await ctx.replyWithMediaGroup(media);
    }

    // متن پروفایل
    const profileText = `
👤 پروفایل شما:

📝 نام: ${user.name || "-"}
🚻 جنسیت: ${user.gender || "-"}
🎂 سن: ${user.age || "-"}
📍 استان: ${user.province || "-"}
🏙 شهر: ${user.city || "-"}
`;



    return ctx.reply(profileText, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "🖼 ویرایش عکس‌ها", callback_data: "edit_photos" }],
                [{ text: "✏️ ویرایش پروفایل", callback_data: "edit_profile" }],
            ],
        },
    });
});

bot.hears("🖼 ویرایش عکس‌ها", async (ctx) => {
    // منوی ویرایش عکس
});

bot.hears("✏️ ویرایش پروفایل", async (ctx) => {
    // منوی ویرایش پروفایل
});

bot.hears("❓ راهنما", async (ctx) => {
    ctx.reply("📖 اینجا متن راهنما میاد...");
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        await bot.handleUpdate(body);
        return new Response("OK", { status: 200 });
    } catch (err) {
        console.error("❌ Error in POST handler:", err);
        return new Response("Error", { status: 500 });
    }
}


export default bot;
