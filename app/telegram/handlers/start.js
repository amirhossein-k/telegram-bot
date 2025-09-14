export function startHandler(userStates) {
  return (ctx) => {
    userStates.set(ctx.from.id, { waitingForPhoto: false });
    const markup = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📤 آپلود عکس", callback_data: "upload_photo" }],
        ],
      },
    };
    ctx.replyWithPhoto("https://t.me/hamdelchannel/5", {
      caption: "👋 خوش آمدید!\nبرای آپلود عکس، روی دکمه زیر کلیک کنید:",
      reply_markup: markup,
    });
  };
}
