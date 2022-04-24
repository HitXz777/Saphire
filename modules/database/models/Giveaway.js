const { Schema, model } = require("mongoose")

module.exports = model("Giveaway", new Schema({
    MessageID: String,
    GuildId: String,
    Prize: String,
    Winners: Number,
    TimeMs: Number,
    DateNow: Number,
    ChannelId: String,
    Participants: Array,
    Actived: Boolean,
    MessageLink: String,
    Sponsor: String,
    TimeEnding: String,
    TimeToDelete : Number,
    WinnersGiveaway: Array
}))