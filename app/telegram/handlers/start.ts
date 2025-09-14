// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function startHandler(userStates: Map<number, any>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (ctx: any) => {
    userStates.set(ctx.from.id, { waitingForPhoto: false });

    const markup = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📤 آپلود عکس", callback_data: "upload_photo" }],
        ],
      },
    };

    ctx.replyWithPhoto(
      "https://example.com/welcome.jpg", // 🔹 لینک عکس خوشامد
      {
        caption: "👋 خوش آمدید!\nبرای آپلود عکس، روی دکمه زیر کلیک کنید:",
        reply_markup: markup,
      }
    );
  };
}
