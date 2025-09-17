import mongoose, { Schema, models, model } from "mongoose";

const userSchema = new Schema(
    {
        telegramId: { type: Number, required: true, unique: true },
        username: String,
        firstName: String,
        lastName: String,
        step: { type: Number, default: 1 }, // تغییر به default = 1

        name: String,
        gender: { type: String, enum: ["مرد", "زن"] },
        age: Number,
        province: String,
        city: String,

        // وضعیت انتظار برای آپلود عکس را در DB نگه می‌داریم
        awaitingPhotoSlot: { type: String, enum: ["slot1", "slot2", "slot3", null], default: null },

        photos: {
            slot1: { type: String, default: null },
            slot2: { type: String, default: null },
            slot3: { type: String, default: null },
        },
        likes: [{ type: Number }], // آرایه‌ای از telegramId افرادی که کاربر لایک کرده
        matches: [{ type: Number }], // آرایه‌ای از telegramId افرادی که Match شده‌اند
        bio: String,
        interests: String,
        lookingFor: String,
    },
    { timestamps: true }
);

export default models.User || model("User", userSchema);
