// // app\telegram\handlers\start.js
// import { connectDB } from "@/app/lib/mongodb";
// import User from "@/app/model/User";

// export function startHandler() {
//   return async (ctx) => {
//     await connectDB();

//     let user = await User.findOne({ telegramId: ctx.from.id });
//     if (!user) {
//       user = await User.create({
//         telegramId: ctx.from.id,
//         username: ctx.from.username,
//         firstName: ctx.from.first_name,
//         lastName: ctx.from.last_name,
//         step: 1, // مرحله اول
//       });
//     } else {
//       if (!user.step || user.step < 1) {
//         user.step = 1;
//         await user.save();
//       }
//     }
//     ctx.reply(
//       "👋 خوش آمدی! بیا بریم پروفایلت رو کامل کنیم.\n\n📌 مرحله ۱ از ۵: لطفاً اسمت رو بفرست."
//     );
//   };
// }
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/model/User";

export function startHandler() {
  return async (ctx) => {
    await connectDB();

    let user = await User.findOne({ telegramId: ctx.from.id });
    // اگر کاربر وجود داره و پروفایل کامل کرده
    if (user && user.step >= 6) {
      return ctx.reply(`👋 خوش برگشتی ${user.name}!\n\nپروفایلت اینجاست:`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "👤 مشاهده پروفایل", callback_data: "show_profile" }],
            [{ text: "🖼 ویرایش عکس‌ها", callback_data: "edit_photos" }],
            [{ text: "✏️ ویرایش پروفایل", callback_data: "edit_profile" }],
          ],
        },
      });
    }
    // اگر کاربر جدید بود یا پروفایل ناقص داشت → مرحله ۱

    if (!user) {
      user = await User.create({
        telegramId: ctx.from.id,
        // username: ctx.from.username,
        // firstName: ctx.from.first_name,
        // lastName: ctx.from.last_name,
        step: 1,
      });
    } else {
      user.step = 1;
      await user.save();
    }

    // پیام خوش‌آمد + درخواست اسم (در caption)
    await ctx.reply(
      "👋 خوش آمدی! بیا پروفایلت رو بسازیم.\n\n📌 مرحله ۱ از ۵: لطفاً اسمت رو ارسال کن."
    );
  };
}
