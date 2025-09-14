import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/model/User";

export function startHandler() {
  return async (ctx) => {
    await connectDB();

    let user = await User.findOne({ telegramId: ctx.from.id });
    if (!user) {
      user = await User.create({
        telegramId: ctx.from.id,
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        step: 1, // مرحله اول
      });
    }
    ctx.reply(
      "👋 خوش آمدی! بیا بریم پروفایلت رو کامل کنیم.\n\n📌 مرحله ۱ از ۵: لطفاً اسمت رو بفرست."
    );
  };
}
