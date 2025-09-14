import { Telegraf } from "telegraf";
import { profileHandler } from "./handlers/profile";
import { callbackHandler } from "./handlers/callback";
import { photoUploadHandler, setPhotoSlotHandler } from "./handlers/photoHandler";


const bot = new Telegraf(process.env.BOT_TOKEN!);

// پیام متنی (اسم، سن و ...)
bot.on("text", profileHandler());

// کلیک روی دکمه‌ها (جنسیت، استان، شهر، شرایط، آپلود عکس)
bot.on("callback_query", async (ctx) => {
    await callbackHandler()(ctx);
    await setPhotoSlotHandler()(ctx);
});

// آپلود عکس واقعی
bot.on("photo", photoUploadHandler());

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


export default bot;
