const { Schema, model } = require("mongoose")

module.exports = model("Clans", new Schema({
    id: { type: String, unique: true },
    Name: String,
    Owner: String,
    Admins: Array,
    Members: Array,
    Donation: Number,
    CreatAt: { type: Date, default: Date.now() },
    LogRegister: Array
}))