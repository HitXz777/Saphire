const { Schema, model } = require("mongoose")

module.exports = model("Client", new Schema({
    id: { type: String, unique: true },
    Timeouts: { RestoreDividas: Number },
    ComandosUsados: Number,
    BingoChannels: Array,
    Moderadores: Array,
    Administradores: Array,
    TopGlobal: Object,
    ComandosBloqueados: Array,
    VipCodes: Array,
    BackgroundAcess: Array,
    BlockedUsers: Array,
    PremiumServers: Array,
    QuizChannels: Array,
    ForcaChannels: Array,
    Rebooting: {
        ON: Boolean,
        Features: String,
        ChannelId: String,
        MessageId: String
    },
    Titles: {
        BugHunter: Array,
        OfficialDesigner: Array,
        Halloween: Array,
        Developer: Array
    },
    Blacklist: {
        Users: Array,
        Guilds: Array,
        Economy: Array
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