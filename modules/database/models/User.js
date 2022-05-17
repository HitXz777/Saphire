const { Schema, model } = require("mongoose")

module.exports = model("User", new Schema({
    id: { type: String, unique: true },
    Clan: String,
    Likes: Number,
    Xp: Number,
    Level: Number,
    Transactions: Array,
    Balance: Number,
    AfkSystem: String,
    DailyCount: Number,

    MixCount: Number,
    QuizCount: Number,
    TicTacToeCount: Number,
    CompetitiveMemoryCount: Number,
    ForcaCount: Number,
    GamingCount: {
        FlagCount: Number,
        // TODO: Adicionar o Flag Gaming no ranking
        // TODO: Juntar as pontuações de todos os  games dentro deste Object
    },
    Timeouts: {
        Bug: Number,
        Daily: Number,
        Cu: Number,
        Roleta: Number,
        Esmola: Number,
        Work: Number,
        ImagesCooldown: Number,
        ServerIdeia: Number,
        Letter: Number,
        Confess: Number,
        Loteria: Number,
        LevelTrade: Number,
        LevelImage: Number,
        Cantada: Number,
        Bitcoin: Number,
        Porquinho: Number,
        Rep: Number,
    },
    Cache: { ComprovanteOpen: Boolean },
    Color: {
        Perm: Boolean,
        Set: String
    },
    Perfil: {
        TitlePerm: Boolean,
        Titulo: String,
        Status: String,
        Sexo: String,
        Signo: String,
        Aniversario: String,
        Trabalho: String,
        BalanceOcult: Boolean,
        Family: Array,
        Parcas: Array,
        Marry: {
            Conjugate: String,
            StartAt: Number
        },
        Bits: Number,
        Bitcoins: Number,
        Estrela: {
            Um: Boolean,
            Dois: Boolean,
            Tres: Boolean,
            Quatro: Boolean,
            Cinco: Boolean,
            Seis: Boolean,
        }
    },
    Vip: {
        DateNow: Number,
        TimeRemaing: Number,
        Permanent: Boolean
    },
    Slot: {
        TitlePerm: String,
        Cartas: Number,
        Dogname: String,
        Skip: Number,
        Raspadinhas: Number
    },
    Walls: {
        Bg: Array,
        Set: String
    },
    PrivateChannel: {
        Channel: String,
        Users: Array
    },
    Jokempo: {
        Wins: Number,
        Loses: Number
    }
}))