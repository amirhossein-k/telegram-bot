// app\telegram\bot.ts
import { Telegraf } from "telegraf";
import { profileHandler } from "./handlers/profile";
import { callbackHandler } from "./handlers/callback";
import { photoUploadHandler, setPhotoSlotHandler } from "./handlers/photoHandler";
import { startHandler } from "./handlers/start";
import { connectDB } from "../lib/mongodb";
import User from "../model/User";
import { InputMedia, InputMediaPhoto } from "typegram";
import { searchHandler } from "./handlers/searchHandler";


const bot = new Telegraf(process.env.BOT_TOKEN!);
bot.start(startHandler()); // اینجا هندلر استارت جدید

// پیام متنی (اسم، سن و ...)
bot.on("text", profileHandler());

// کلیک روی دکمه‌ها (جنسیت، استان، شهر، شرایط، آپلود عکس)
// bot.on("callback_query", async (ctx) => {
//     await callbackHandler()(ctx);
//     await setPhotoSlotHandler()(ctx);
// });
// ✅ به جاش مستقیم action ها رو تعریف کن:
bot.action(/gender_|province_|city_/, callbackHandler());
bot.action(["edit_photos", "edit_profile", "terms", "upload_photos"], callbackHandler());
bot.action(["photo_slot_1", "photo_slot_2", "photo_slot_3", "back_to_photo_menu"], setPhotoSlotHandler());
// آپلود عکس واقعی
bot.on("photo", photoUploadHandler());

bot.action("show_profile", async (ctx) => {
    await connectDB();
    const user = await User.findOne({ telegramId: ctx.from.id });
    if (!user) return ctx.reply("❌ پروفایل پیدا نشد");

    // نمایش آلبوم عکس‌ها
    // اگر کاربر عکس دارد
    const urls = Object.values(user.photos).filter(Boolean) as string[];

    // const urls = Object.values(user.photos).filter((url) => !!url) as string[];

    if (urls.length > 0) {
        const media: InputMediaPhoto<string>[] = urls.map((url, idx) => ({
            type: "photo",
            media: url,
            caption: idx === 0 ? "📸 عکس‌های شما" : undefined,
        }));

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
                [{ text: "🔍 جستجو", callback_data: "search_profiles" }] // دکمه جستجو اضافه شد
            ],
        },
    });
});
// دکمه جستجو
bot.action("search_profiles", async (ctx) => {
    await searchHandler(ctx);
});

// bot.hears("🖼 ویرایش عکس‌ها", async (ctx) => {
//     // منوی ویرایش عکس
// });

// bot.hears("✏️ ویرایش پروفایل", async (ctx) => {
//     // منوی ویرایش پروفایل
// });

// bot.hears("❓ راهنما", async (ctx) => {
//     ctx.reply("📖 اینجا متن راهنما میاد...");
// });

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
