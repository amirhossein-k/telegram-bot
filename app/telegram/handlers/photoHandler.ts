// app/handlers/photoHandler.ts
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/model/User";

const userPhotoState = new Map<number, string>(); // userId → slot (slot1, slot2, slot3)

export function setPhotoSlotHandler() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async (ctx: any) => {
        const data = ctx.callbackQuery?.data;
        if (!data) return;

        if (data.startsWith("photo_slot_")) {
            await connectDB();

            const slot = data.replace("photo_slot_", "slot");

            let user = await User.findOne({ telegramId: ctx.from.id });
            if (!user) {
                user = await User.create({
                    telegramId: ctx.from.id,
                    step: 1,
                });
            }
            // وضع انتظار برای آپلود را در دیتابیس ذخیره کن
            user.awaitingPhotoSlot = slot;
            await user.save();

            await ctx.answerCbQuery();
            return ctx.reply("📸 حالا عکس مورد نظرت رو ارسال کن.");
        }
    };
}
// هندل آپلود خود عکس (پیامی که شامل photo است)

// هندل آپلود خود عکس (پیامی که شامل photo است)
export function photoUploadHandler() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async (ctx: any) => {
        try {
            await connectDB();
            const user = await User.findOne({ telegramId: ctx.from.id });
            if (!user) return ctx.reply("❌ لطفاً ابتدا پروفایل خود را ایجاد کنید.");

            const slot = user.awaitingPhotoSlot;
            if (!slot) {
                return ctx.reply("❌ ابتدا یکی از اسلات‌ها را انتخاب کنید (عکس ۱، ۲ یا ۳).");
            }

            const photo = ctx.message?.photo;
            if (!photo || !photo.length) return ctx.reply("❌ لطفاً یک عکس ارسال کنید.");

            const largest = photo[photo.length - 1];
            const fileId = largest.file_id;
            const file = await ctx.telegram.getFile(fileId);
            const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;

            // --- ارسال به API آپلود خودت (تا در S3 ذخیره بشه) ---
            const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/upload`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: fileUrl }),
            });

            const uploadText = await uploadRes.text();
            let uploadData;
            try {
                uploadData = JSON.parse(uploadText);
            } catch {
                console.error("Upload response not JSON:", uploadText);
                return ctx.reply("❌ خطا در آپلود (پاسخ سرور نامعتبر است).");
            }

            if (!uploadData.success) {
                console.error("Upload failed:", uploadData);
                return ctx.reply("❌ خطا در آپلود به سرور.");
            }

            // ذخیره لینک نهایی در DB زیر اسلات مناسب
            user.photos = user.photos || {};
            user.photos[slot] = uploadData.url; // یا uploadData.url یا همان data.url که سرورت برمی‌گرداند
            user.awaitingPhotoSlot = null; // پاک کردن حالت انتظار
            await user.save();

            await ctx.replyWithPhoto(uploadData.url, {
                caption: `✅ عکس با موفقیت در ${slot} ذخیره شد.`,
            });
        } catch (err) {
            console.error("❌ Error in photoUploadHandler:", err);
            return ctx.reply("❌ خطا در پردازش عکس. دوباره تلاش کنید.");
        }
    };
}