const { Schema, model } = require("mongoose")

module.exports = model("Client", new Schema({
    id: { type: String, unique: true },
    Timeouts: { RestoreDividas: Number },
    ComandosUsados: Number,
    Moderadores: Array,
    Administradores: Array,
    TopGlobal: Object,
    ComandosBloqueados: Array,
    VipCodes: Array,
    BackgroundAcess: Array,
    BlockedUsers: Array,
    PremiumServers: Array,
    GameChannels: {
        Bingo: Array,
        Quiz: Array,
        Forca: Array,
        Flags: Array,
    },
    FlagGame: {
        
    },
    GlobalBet: {
        Bets: Array,
        totalValue: Number
    },
    Raspadinhas: {
        Channels: Array,
        Bought: Number,
        totalPrize: Number
    },
    Zeppelin: {
        Channels: Array,
        winTotalMoney: Number,
        loseTotalMoney: Number
    },
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