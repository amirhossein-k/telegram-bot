export function buttonsHandler() {
  return (ctx) => {
    const markup = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📤 آپلود عکس", callback_data: "upload_photo" }],
        ],
      },
    };

    ctx.reply("یک گزینه انتخاب کنید:", markup);
  };
}
