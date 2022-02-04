const { Schema, model } = require("mongoose")

module.exports = model("Client", new Schema({
    id: { type: String, unique: true },
    Timeouts: { RestoreDividas: Number },
    ComandosUsados: Number,
    BingoChannels: { type: Array, default: undefined },
    Moderadores: { type: Array, default: undefined },
    TopGlobalLevel: String,
    TopGlobalLikes: String,
    TopGlobalMoney: String,
    ComandosBloqueados: { type: Array, default: undefined },
    VipCodes: { type: Array, default: undefined },
    BackgroundAcess: { type: Array, default: undefined },
    BlockedUsers: { type: Array, default: undefined },
    Rebooting: {
        ON: Boolean,
        Features: String,
        ChannelId: String,
        MessageId: String
    },
    Titles: {
        BugHunter: { type: Array, default: undefined },
        OfficialDesigner: { type: Array, default: undefined },
        Halloween: { type: Array, default: undefined },
        Developer: { type: Array, default: undefined }
    },
    Blacklist: {
        Users: { type: Array, default: undefined },
        Guilds: { type: Array, default: undefined }
    },
    Porquinho: {
        LastPrize: Number,
        LastWinner: String,
        Money: Number
    },
    Status: {
        SetActivity: String,
        SetAction: String,
        SetStatus: String
    }
}))