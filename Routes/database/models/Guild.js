const { Schema, model } = require('mongoose')

module.exports = model("Guild", new Schema({
    id: { type: String, unique: true },
    Prefix: String,
    Tsundere: Boolean,
    LogChannel: String,
    IdeiaChannel: String,
    Moeda: String,
    XPChannel: String,
    ReportChannel: String,
    FirstSystem: Boolean,
    Farm: {
        BuscaChannel: String,
        PescaChannel: String,
        MineChannel: String,
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
    Autorole: { type: Array, default: undefined },
    ConfessChannel: String,
    Blockchannels: {
        Bots: { type: Array, default: undefined },
        Channels: { type: Array, default: undefined }
    },
    AfkSystem: { type: Array, default: undefined },
    GiveawayChannel: String    
}))