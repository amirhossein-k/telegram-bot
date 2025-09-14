import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    telegramId: { type: String, required: true, unique: true },
    username: String,
    firstName: String,
    lastName: String,
    step: { type: Number, default: 0 }, // مرحله پروفایل

    name: String,
    gender: { type: String, enum: ["مرد", "زن"] },
    age: Number,
    province: String,
    city: String,

    photos: {
        slot1: { type: String, default: null },
        slot2: { type: String, default: null },
        slot3: { type: String, default: null },
    }, bio: String,
    interests: String,
    lookingFor: String,
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
