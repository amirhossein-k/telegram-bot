import bot from "@/app/telegram/bot";

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

export async function GET() {
  try {
    await bot.telegram.setWebhook(
      `${process.env.NEXT_PUBLIC_URL}/api/telegram`
    );
    // تنظیم دستورات بات
    await bot.telegram.setMyCommands([
      { command: "start", description: "🚀 شروع کار با ربات" },
      { command: "show_profile", description: "👤 مشاهده پروفایل خود" },
      { command: "edit_profile", description: "✏️ ویرایش پروفایل و عکس‌ها" },
      { command: "search", description: "🔍 جستجوی افراد جدید" },
      { command: "liked_by_me", description: "💌 مشاهده کسانی که شما را لایک کردند" },
      { command: "buy_premium", description: "⭐️ خرید عضویت ویژه" },
      { command: "end_chat", description: "❌ قطع ارتباط در چت فعال" },
    ]);

    return new Response("✅ Webhook set successfully", { status: 200 });
  } catch (err) {
    console.error("❌ Error setting webhook:", err);
    return new Response("❌ Error setting webhook", { status: 500 });
  }
}
