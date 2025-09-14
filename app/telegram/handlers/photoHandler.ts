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
            const slot = data.replace("photo_slot_", "slot");
            userPhotoState.set(ctx.from.id, slot);

            await ctx.answerCbQuery();
            return ctx.reply("📸 حالا عکس مورد نظرت رو ارسال کن.");
        }
    };
}

export function photoUploadHandler() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async (ctx: any) => {
        const slot = userPhotoState.get(ctx.from.id);
        if (!slot) {
            return ctx.reply("❌ اول یکی از اسلات‌ها رو انتخاب کن (عکس ۱، ۲ یا ۳).");
        }

        const photo = ctx.message.photo.pop(); // آخرین (بزرگترین) سایز
        const fileId = photo.file_id;

        try {
            const file = await ctx.telegram.getFile(fileId);
            const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;

            await connectDB();
            const user = await User.findOne({ telegramId: ctx.from.id });

            if (!user) return ctx.reply("❌ خطا: کاربر پیدا نشد.");

            user.photos[slot] = fileUrl;
            await user.save();

            userPhotoState.delete(ctx.from.id);

            return ctx.replyWithPhoto(fileUrl, {
                caption: `✅ عکس ذخیره شد در ${slot}`,
            });
        } catch (err) {
            console.error("❌ Error uploading photo:", err);
            return ctx.reply("❌ خطا در آپلود عکس.");
        }
    };
}
