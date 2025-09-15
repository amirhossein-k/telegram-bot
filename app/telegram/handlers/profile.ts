// app\telegram\handlers\profile.ts
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/model/User";
import { getProvinceKeyboard } from '@/app/lib/provinces'
import { getCityKeyboard } from "@/app/lib/cities";

export function profileHandler() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async (ctx: any) => {
        await connectDB()

        let user = await User.findOne({ telegramId: ctx.from.id });

        if (!user) {
            user = await User.create({
                telegramId: ctx.from.id,
                step: 1, // شروع پروفایل
            });
        } else {
            // اگر step نامعتبر بود، آن را ریست کن (اجتناب از ریست کردن پروفایل کامل شده)
            if (!user.step || user.step < 1) {
                user.step = 1;
                await user.save();
            }
        }
        // اگر پروفایل کامل است، ثبت نام را اجرا نکن
        if (user.step >= 6) return;
        switch (user.step) {
            case 1:
                if (ctx.message?.text) {
                    user.name = ctx.message.text
                    user.step = 2
                    await user.save()

                    return ctx.reply("📌 مرحله ۲ از ۵: جنسیتت رو انتخاب کن:", {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "👨 مرد", callback_data: "gender_male" }],
                                [{ text: "👩 زن", callback_data: "gender_female" }],
                            ]
                        }
                    })
                }
                break
            // ♂♀ مرحله ۲: گرفتن جنسیت (callback)
            case 2:
                if (ctx.callbackQuery?.data?.startsWith("gender_")) {
                    const gender =
                        ctx.callbackQuery.data === "gender_male" ? "مرد" : "زن";
                    user.gender = gender;
                    user.step = 3;
                    await user.save();

                    await ctx.answerCbQuery();
                    return ctx.reply("📌 مرحله ۳ از ۵: سنت رو وارد کن (عدد):");
                }
                break;
            case 3://سن
                if (ctx.message?.text && !isNaN(Number(ctx.message.text))) {
                    user.age = Number(ctx.message.text)
                    user.step = 4
                    await user.save()

                    return ctx.reply("📌 مرحله ۴ از ۵: استانت رو انتخاب کن:", getProvinceKeyboard())
                } else {
                    return ctx.reply("❌ لطفاً یک عدد معتبر بفرست.");
                }
            case 4: //استان
                if (ctx.callbackQuery?.data?.startsWith("province_")) {
                    const province = ctx.callbackQuery.data.replace("province_", "");
                    user.province = province;
                    user.step = 5;
                    await user.save();

                    await ctx.answerCbQuery();
                    return ctx.reply(
                        "📌 مرحله ۵ از ۵: شهرت رو انتخاب کن:",
                        getCityKeyboard(province)
                    );
                }
                break;
            case 5:      // 📍 مرحله ۵: انتخاب شهر

                if (ctx.callbackQuery?.data?.startsWith("city_")) {
                    const city = ctx.callbackQuery.data.replace("city_", "");
                    user.city = city;
                    user.step = 6; // پروفایل تکمیل شد
                    await user.save();

                    await ctx.answerCbQuery("پروفایل شما کامل شد!");

                    // پیام با کیبورد کلاسیک ثابت
                    return ctx.telegram.sendMessage(
                        ctx.chat.id,
                        `✅ پروفایلت ساخته شد!\n\n👤 نام: ${user.name}\n👫 جنسیت: ${user.gender}\n🎂 سن: ${user.age}\n📍 استان: ${user.province}\n🏙 شهر: ${user.city}`,
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: "👤 پروفایل من", callback_data: "show_profile" }],
                                    [{ text: "🖼 ویرایش عکس‌ها", callback_data: "edit_photos" }],
                                    [{ text: "✏️ ویرایش پروفایل", callback_data: "edit_profile" }],
                                ],

                            },
                        }
                    );
                }
                break;
            default:
                // 🔥 اینجا به جای پیام خطا، کاربر رو برگردون به مرحله اول
                user.step = 1;
                await user.save();
                return ctx.reply("📌 مرحله ۱ از ۵: لطفاً اسمت رو وارد کن:");
        }

    }

}