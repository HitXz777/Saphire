const { Schema, model } = require('mongoose')

module.exports = model("Guild", new Schema({
    id: { type: String, unique: true },
    Prefix: String,
    LogChannel: String,
    IdeiaChannel: String,
    Moeda: String,
    ReportChannel: String,
    FirstSystem: Boolean,
    Autorole: Array,
    ConfessChannel: String,
    AntLink: Boolean,
    AfkSystem: Array,
    GiveawayChannel: String,
    CommandBlocks: Array,
    Antifake: Boolean,
    LockdownChannels: Array,
    ReactionRole: Array,
    Warns: {
        Users: Object,
        Config: Object
    },
    XpSystem: {
        Canal: String,
        Mensagem: String
    },
    LeaveChannel: {
        Canal: String,
        Emoji: String,
        Mensagem: String,
    },
    WelcomeChannel: {
        Canal: String,
        Emoji: String,
        Mensagem: String,
    },
    Blockchannels: {
        Bots: Array,
        Channels: Array
    }
}))