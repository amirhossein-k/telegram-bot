import { connectDB } from "@/app/lib/mongodb";
import Photo from "@/app/model/Photo";

export function callbackHandler(userStates) {
  return async (ctx) => {
    const callbackData = ctx.callbackQuery?.data;
    console.log("Callback received:", callbackData);

    await ctx.answerCbQuery();

    if (callbackData === "upload_photo") {
      userStates.set(ctx.from.id, { waitingForPhoto: true });
      return ctx.reply("📸 لطفاً یک عکس ارسال کن");
    }

    if (callbackData.startsWith("delete_")) {
      const key = callbackData.replace("delete_", "");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/upload`, {
          method: "DELETE",
          body: JSON.stringify({ key }),
          headers: { "Content-Type": "application/json" },
        });

        const result = await res.json();
        if (result.success) {
          await connectDB();
          await Photo.findOneAndDelete({ fileKey: key });
          return ctx.reply("🗑 عکس با موفقیت حذف شد!");
        }
        ctx.reply("❌ خطا در حذف عکس");
      } catch (err) {
        console.error("❌ Error deleting:", err);
        ctx.reply("❌ خطا در حذف عکس");
      }
    }
  };
}
