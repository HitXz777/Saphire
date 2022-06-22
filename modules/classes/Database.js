const { Database: JSON } = require('ark.db'),
    Models = require('../database/Models')

class Database extends Models {
    constructor() {
        super()
        this.BgLevel = new JSON('../../JSON/levelwallpapers.json')
        this.EmojisJSON = Database.EmojisJSON
        this.Frases = new JSON('../../JSON/frases.json')
        this.Characters = new JSON('../../JSON/characters.json')
        this.Flags = new JSON('../../JSON/flags.json')
        this.Cache = Database.Cache
        this.Emojis = Database.Emojis
        this.Config = Database.Config
        this.ConfigJSON = Database.ConfigJSON
        this.Names = {
            Rody: "451619591320371213",
            Gowther: "315297741406339083",
            Makol: "351903530161799178",
            Moana: "737238491842347098",
            Dspofu: "781137239194468403",
            Pepy: "830226550116057149",
            Lereo: "978659462602711101"
        }
    }

    static Client = require('../database/models/Client')
    static Giveaway = require('../database/models/Giveaway')
    static Guild = require('../database/models/Guild')
    static LogRegister = require('../database/models/LogRegister')
    static Lotery = require('../database/models/Lotery')
    static User = require('../database/models/User')
    static Cache = new JSON('../../cache.json')
    static EmojisJSON = new JSON('../../JSON/emojis.json')
    static Emojis = Database.EmojisJSON.get('e')
    static ConfigJSON = new JSON('../../JSON/config.json')
    static Config = Database.ConfigJSON.get('config')

    MongoConnect = async (client) => {

        const { connect } = require('mongoose')

        try {
            await connect(process.env.MONGODB_LINK_CONNECTION, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            return console.log('Mongoose Database | OK!')
        } catch (err) {
            console.log('Mongoose Database | FAIL!\n--> ' + err)
            client.users.cache.get(Database.Config.ownerId)?.send('Erro ao conectar a database.').catch(() => { })
            return client.destroy()
        }
    }

    add = async (userId, amount) => {

        if (!userId || isNaN(amount)) return

        await Database.User.updateOne(
            { id: userId },
            { $inc: { Balance: amount } },
            { upsert: true }
        )
        return
    }

    subtract = async (userId, amount) => {

        if (!userId || isNaN(amount)) return

        await Database.User.updateOne(
            { id: userId },
            { $inc: { Balance: -amount } },
            { upsert: true }
        )
        return
    }

    SetTimeout = async (userId, TimeoutRoute) => {

        await Database.User.updateOne(
            { id: userId },
            { [TimeoutRoute]: Date.now() },
            { upsert: true }
        )
        return
    }

    pushUsersLotery = async (usersArray, clientId) => {

        await Database.Lotery.updateOne(
            { id: clientId },
            { $push: { Users: { $each: [...usersArray] } } }
        )
        return

    }

    getGuild = async (guildId, params = null) => {

        let data = await Database.Guild.findOne({ id: guildId }, params)
        return data

    }

    closeLotery = async (clientId) => {

        await Database.Lotery.updateOne(
            { id: clientId },
            { Close: true },
            { upsert: true }
        )
        return

    }

    openLotery = async (clientId) => {

        let data = await Database.Lotery.findOne({ id: clientId })

        if (!data) return

        await Database.Lotery.updateOne(
            { id: clientId },
            { $unset: { Close: 1 } },
            { upsert: true }
        )
        return
    }

    resetLoteryUsers = async (clientId) => {

        await Database.Lotery.updateOne(
            { id: clientId },
            { $unset: { Users: 1 } },
            { upsert: true }
        )
        return

    }

    addItem = async (userId, ItemDB, amount) => {

        if (!userId || !ItemDB || isNaN(amount)) return

        await Database.User.updateOne(
            { id: userId },
            { $inc: { [ItemDB]: amount } },
            { upsert: true }
        )

        return
    }

    balance = async (userId) => {

        let data = await Database.User.findOne({ id: userId }, 'Balance')
        return data?.Balance ? parseInt(data.Balance) : 0

    }

    addGamingPoint = async (userId, type, value) => {

        if (!userId || !type || isNaN(value)) return

        await Database.User.updateOne(
            { id: userId },
            { $inc: { [`GamingCount.${type}`]: value } },
            { upsert: true }
        )

    }

    subtractItem = async (userId, ItemDB, amount) => {

        if (!userId || !ItemDB || isNaN(amount)) return

        await Database.User.updateOne(
            { id: userId },
            { $inc: { [ItemDB]: -amount } },
            { upsert: true }
        )

        return
    }

    updateUserData = async (userId, keyData, valueData) => {

        if (!userId || !keyData || !valueData) return

        await Database.User.updateOne(
            { id: userId },
            { [keyData]: valueData },
            { upsert: true }
        )
        return

    }

    setPrefix = async (newPrefix, guildId) => {

        await Database.Guild.updateOne(
            { id: guildId },
            { Prefix: newPrefix }
        )
        return
    }

    pushUserData = async (userId, keyData, dataToPush) => {

        if (!userId || !keyData || !dataToPush) return

        await Database.User.updateOne(
            { id: userId },
            { $push: { [keyData]: { $each: [dataToPush] } } },
            { upsert: true }
        )
        return

    }

    pullUserData = async (userId, keyData, dataToPush) => {

        if (!userId || !keyData || !dataToPush) return

        await Database.User.updateOne(
            { id: userId },
            { $pull: { [keyData]: dataToPush } },
            { upsert: true }
        )
        return

    }

    deleteGiveaway = async (DataId, All = false) => {

        if (!DataId) return

        return All
            ? await Database.Giveaway.deleteMany({ GuildId: DataId })
            : await Database.Giveaway.deleteOne({ MessageID: DataId })

    }

    registerChannelControl = (pullOrPush = '', where = '', channelId = '') => {

        if (!pullOrPush || !where || !channelId) return

        pullOrPush === 'push'
            ? Database.Cache.push(`GameChannels.${where}`, channelId)
            : Database.Cache.pull(`GameChannels.${where}`, channelId)
        return
    }

    deleteUser = async (userId) => {

        await Database.User.deleteOne({ id: userId })
        return

    }

    addLotery = async (value, clientId) => {

        if (!value || isNaN(value)) return

        await Database.Lotery.updateOne(
            { id: clientId },
            { $inc: { Prize: value } },
            { upsert: true }
        )

        return

    }

    delete = async (userId, key) => {

        if (!userId || !key) return

        await Database.User.updateOne(
            { id: userId },
            { $unset: { [key]: 1 } }
        )
        return
    }

    guildDelete = async (guildId, key) => {

        if (!guildId || !key) return

        await Database.Guild.updateOne(
            { id: guildId },
            { $unset: { [key]: 1 } }
        )
        return
    }

    PushTransaction = async (userId, Frase) => {

        if (!userId || !Frase) return

        let userData = await Database.User.findOne({ id: userId }, 'Balance'),
            balance = userData?.Balance || 0

        await Database.User.updateOne(
            { id: userId },
            { $push: { Transactions: { $each: [{ time: `${Date.format(0, true)} - ${balance}`, data: `${Frase}` }], $position: 0 } } },
            { upsert: true }
        )
        return
    }

    registerUser = async (user, blocked) => {

        if (blocked || !user || user?.bot) return

        let u = await Database.User.findOne({ id: user.id })
        if (u || u?.id === user.id) return

        new Database.User({ id: user.id }).save()

        await Database.User.updateOne(
            { id: user.id },
            {
                $unset: {
                    PrivateChannel: 1,
                    Walls: 1,
                    Perfil: 1,
                    Letters: 1,
                    Transactions: 1
                }
            },
            { upsert: true }
        )

        return
    }

    registerServer = async (guild, client) => {

        if (!guild || !guild?.id) return

        let clientData = await Database.Client.findOne({ id: client.user.id }, 'Blacklist.Guilds')
        if (clientData?.Blacklist?.Guilds.includes(guild.id)) return

        let g = await Database.Guild.findOne({ id: guild.id })

        if (g || g?.id === guild.id) return

        new Database.Guild({ id: guild.id }).save()

        await client?.channels?.cache?.get(Database.Config.LogChannelId)?.send(`${Database.Emojis.Database} | DATABASE | O servidor **${guild.name}** foi registrado com sucesso!`).catch(() => { })

        await Database.Guild.updateOne(
            { id: guild.id },
            {
                $unset: {
                    Blockchannels: 1,
                    ReactionRole: 1,
                    LockdownChannels: 1,
                    CommandBlocks: 1,
                    AfkSystem: 1,
                    Autorole: 1
                }
            },
            { upsert: true }
        )

        return true
    }

    newCommandRegister = async (message, date, clientId, commandName) => {

        new Database.LogRegister({
            Author: `${message.author.tag} - ${message.author.id}` || 'Indefinido',
            Server: `${message.guild.name} - ${message.guild.id}` || 'Indefinido',
            Command: message.content || 'Indefinido',
            Time: date || 0
        }).save()

        await Database.Client.updateOne(
            { id: clientId },
            {
                $inc: {
                    ComandosUsados: 1,
                    [`CommandsCount.${commandName}`]: 1
                }
            },
            { upsert: true }
        )

        return
    }

    registerClient = async (clientId) => {

        let data = await Database.Client.findOne({ id: clientId })
        if (data) return
        return new Database.Client({ id: clientId }).save()

    }

}

module.exports = new Database()