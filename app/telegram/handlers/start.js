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
    ctx.reply("خوش آمدید! برای آپلود عکس، دکمه زیر را بزنید:", markup);
  };
}
