const { Schema, model } = require("mongoose")

module.exports = model("Reminders", new Schema({
    id: { type: String, unique: true },
    userId: String,
    RemindMessage: String,
    Time: Number,
    DateNow: Number,
    ChannelId: String
}))