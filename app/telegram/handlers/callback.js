import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/model/User";
import { getCityKeyboard } from "@/app/lib/cities";

export function callbackHandler() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (ctx) => {
    const data = ctx.callbackQuery?.data;
    if (!data) return;

    await connectDB();
    const user = await User.findOne({ telegramId: ctx.from.id });

    // قوانین
    if (data === "terms") {
      await ctx.answerCbQuery();
      return ctx.reply(
        "📜 قوانین استفاده از ربات:\n\n1️⃣ احترام به سایر کاربران الزامی است.\n2️⃣ محتوای نامناسب مجاز نیست.\n3️⃣ تخلف باعث مسدود شدن می‌شود.\n\n✅ با ادامه استفاده، شما قوانین را پذیرفته‌اید."
      );
    }

    // دکمه آپلود عکس
    if (data === "upload_photos") {
      await ctx.answerCbQuery();
      return ctx.reply("📸 یکی از گزینه‌های زیر رو انتخاب کن:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "📷 عکس ۱", callback_data: "photo_slot_1" }],
            [{ text: "📷 عکس ۲", callback_data: "photo_slot_2" }],
            [{ text: "📷 عکس ۳", callback_data: "photo_slot_3" }],
          ],
        },
      });
    }

    // مرحله ۲: انتخاب جنسیت
    if (data.startsWith("gender_") && user?.step === 2) {
      user.gender = data === "gender_male" ? "مرد" : "زن";
      user.step = 3;
      await user.save();

      await ctx.answerCbQuery();
      return ctx.reply("📌 مرحله ۳ از ۵: سنت رو وارد کن (عدد):");
    }

    // مرحله ۴: انتخاب استان
    if (data.startsWith("province_") && user?.step === 4) {
      const province = data.replace("province_", "");
      user.province = province;
      user.step = 5;
      await user.save();

      await ctx.answerCbQuery();
      return ctx.reply(
        "📌 مرحله ۵ از ۵: شهرت رو انتخاب کن:",
        getCityKeyboard(province)
      );
    }

    // مرحله ۵: انتخاب شهر
    if (data.startsWith("city_") && user?.step === 5) {
      const city = data.replace("city_", "");
      user.city = city;
      user.step = 6; // پروفایل تکمیل شد
      await user.save();

      await ctx.answerCbQuery();
      return ctx.reply(
        `✅ پروفایلت ساخته شد!\n\n👤 نام: ${user.name}\n👫 جنسیت: ${user.gender}\n🎂 سن: ${user.age}\n📍 استان: ${user.province}\n🏙 شهر: ${user.city}\n\n⚠️ استفاده از ربات به منزله پذیرش قوانین است.`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "📜 شرایط استفاده", callback_data: "terms" }],
              [{ text: "📸 آپلود عکس", callback_data: "upload_photos" }],
            ],
          },
        }
      );
    }
  };
}
