// app\telegram\bot.ts
import { Telegraf } from "telegraf";
import { profileHandler } from "./handlers/profile";
import { callbackHandler } from "./handlers/callback";
import { photoUploadHandler, setPhotoSlotHandler } from "./handlers/photoHandler";
import { startHandler } from "./handlers/start";
import { connectDB } from "../lib/mongodb";
import User from "../model/User";
import { InputMedia, InputMediaPhoto, CallbackQuery } from "typegram";
import { searchHandler, userSearchIndex, userSearchResults } from "./handlers/searchHandler";


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

// دکمه بعدی پروفایل در جستجو
// دکمه بعدی پروفایل
bot.action("next_profile", async (ctx) => {
    await connectDB();
    const user = await User.findOne({ telegramId: ctx.from.id });
    if (!user) return ctx.reply("❌ پروفایل پیدا نشد");

    const results = userSearchResults.get(user.telegramId) || [];
    if (!results.length) return ctx.reply("❌ هیچ پروفایلی برای نمایش نیست.");

    let index = userSearchIndex.get(user.telegramId) || 0;
    index = (index + 1) % results.length;
    userSearchIndex.set(user.telegramId, index);
    await searchHandler(ctx);
});;

// دکمه لایک در جستجو
bot.action(/like_\d+/, async (ctx) => {
    await connectDB();

    // داخل handler دکمه
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (ctx.callbackQuery as any)?.data;
    if (!data) return ctx.reply("❌ خطا: داده نامعتبر");

    // حالا می‌توانیم از data استفاده کنیم
    const likedId = Number(data.replace("like_", ""));
    if (isNaN(likedId)) return ctx.reply("❌ خطا: کاربر نامعتبر");
    const user = await User.findOne({ telegramId: ctx.from.id });
    const likedUser = await User.findOne({ telegramId: likedId });
    if (!user || !likedUser) return ctx.reply("❌ کاربر پیدا نشد.");

    if (!user.likes.includes(likedId)) {
        user.likes.push(likedId);
        await user.save();
    }

    // بررسی Match
    if (likedUser.likes.includes(user.telegramId) && !user.matches.includes(likedId)) {
        user.matches.push(likedId);
        likedUser.matches.push(user.telegramId);
        await user.save();
        await likedUser.save();

        await ctx.telegram.sendMessage(user.telegramId,
            `🎉 شما با ${likedUser.name} Match شدید!`);
        await ctx.telegram.sendMessage(likedUser.telegramId,
            `🎉 شما با ${user.name} Match شدید!`);
    } else {
        await ctx.reply("✅ لایک ثبت شد!");
    }
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
