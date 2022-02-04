const { Schema, model } = require("mongoose")

module.exports = model("Clans", new Schema({
    id: { type: String, unique: true },
    Name: String,
    Owner: String,
    Admins: { type: Array, default: undefined },
    Members: { type: Array, default: undefined },
    Donation: Number,
    CreatAt: { type: Date, default: new Date() },
    LogRegister: { type: Array, default: undefined }
}))