// app/model/Message.ts
import { Schema, models, model } from "mongoose";

const messageSchema = new Schema(
    {
        from: { type: Number, required: true }, // telegramId فرستنده
        to: { type: Number, required: true },   // telegramId گیرنده
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default models.Message || model("Message", messageSchema);
