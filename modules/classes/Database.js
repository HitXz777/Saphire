const client = require('../../index'),
    Client = require('../database/models/Client'),
    Giveaway = require('../database/models/Giveaway'),
    Guild = require('../database/models/Guild'),
    LogRegister = require('../database/models/LogRegister'),
    Lotery = require('../database/models/Lotery'),
    User = require('../database/models/User'),
    Ark = require('ark.db'),
    eData = new Ark.Database('../../JSON/emojis.json'),
    configData = new Ark.Database('../../JSON/config.json'),
    Frases = new Ark.Database('../../JSON/frases.json'),
    Models = require('../database/Models'),
    config = configData.get('config'),
    e = eData.get('e')

class Database extends Models {
    constructor() {
        super()
        this.BgLevel = new Ark.Database('../../JSON/levelwallpapers.json')
        this.Emojis = e
        this.dbEmoji = eData
        this.Frases = Frases
        this.Names = {
            Rody: "451619591320371213",
            Gowther: "315297741406339083",
            Makol: "351903530161799178",
            Pepy: "830226550116057149"
        }
    }

}

Database.prototype.MongoConnect = async () => {

    const { connect } = require('mongoose'),
        { config } = require('../../JSON/config.json')

    try {
        await connect(process.env.MONGODB_LINK_CONNECTION, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        return console.log('Mongoose Database | OK!')
    } catch (err) {
        console.log('Mongoose Database | FAIL!\n--> ' + err)
        client.users.cache.get(config.ownerId)?.send('Erro ao conectar a database.').catch(() => { })
        return client.off()
    }
}

Database.prototype.add = async (userId, amount) => {

    if (!userId || isNaN(amount)) return

    await User.updateOne(
        { id: userId },
        { $inc: { Balance: amount } },
        { upsert: true }
    )
    return
}

Database.prototype.subtract = async (userId, amount) => {

    if (!userId || isNaN(amount)) return

    await User.updateOne(
        { id: userId },
        { $inc: { Balance: -amount } },
        { upsert: true }
    )
    return
}

Database.prototype.SetTimeout = async (userId, TimeoutRoute) => {

    await User.updateOne(
        { id: userId },
        { [TimeoutRoute]: Date.now() },
        { upsert: true }
    )
    return
}

Database.prototype.pushUsersLotery = async (usersArray, clientId) => {

    await Lotery.updateOne(
        { id: clientId },
        { $push: { Users: { $each: [...usersArray] } } }
    )
    return

}

Database.prototype.getGuild = async (guildId, params = null) => {

    let data = await Guild.findOne({ id: guildId }, params)
    return data

}

Database.prototype.getUser = async (userId, params = null) => {

    let data = await User.findOne({ id: userId }, params)
    return data

}

Database.prototype.closeLotery = async (clientId) => {

    await Lotery.updateOne(
        { id: clientId },
        { Close: true },
        { upsert: true }
    )
    return

}

Database.prototype.openLotery = async (clientId) => {

    let data = await Lotery.findOne({ id: clientId })

    if (!data) return

    await Lotery.updateOne(
        { id: clientId },
        { $unset: { Close: 1 } },
        { upsert: true }
    )
    return
}

Database.prototype.resetLoteryUsers = async (clientId) => {

    await Lotery.updateOne(
        { id: clientId },
        { $unset: { Users: 1 } },
        { upsert: true }
    )
    return

}

Database.prototype.addItem = async (userId, ItemDB, amount) => {

    if (!userId || !ItemDB || isNaN(amount)) return

    await User.updateOne(
        { id: userId },
        { $inc: { [ItemDB]: amount } },
        { upsert: true }
    )

    return
}

Database.prototype.balance = async (userId) => {

    let data = await User.findOne({ id: userId }, 'Balance')
    return data ? parseInt(data.Balance) : 0

}

Database.prototype.subtractItem = async (userId, ItemDB, amount) => {

    if (!userId || !ItemDB || isNaN(amount)) return

    await User.updateOne(
        { id: userId },
        { $inc: { [ItemDB]: -amount } },
        { upsert: true }
    )

    return
}

Database.prototype.updateUserData = async (userId, keyData, valueData) => {

    if (!userId || !keyData || !valueData) return

    await User.updateOne(
        { id: userId },
        { [keyData]: valueData },
        { upsert: true }
    )
    return

}

Database.prototype.pushUserData = async (userId, keyData, dataToPush) => {

    if (!userId || !keyData || !dataToPush) return

    await User.updateOne(
        { id: userId },
        { $push: { [keyData]: { $each: [dataToPush] } } },
        { upsert: true }
    )
    return

}

Database.prototype.pullUserData = async (userId, keyData, dataToPush) => {

    if (!userId || !keyData || !dataToPush) return

    await User.updateOne(
        { id: userId },
        { $pull: { [keyData]: dataToPush } },
        { upsert: true }
    )
    return

}

Database.prototype.deleteGiveaway = async (DataId, All = false) => {

    if (!DataId) return

    return All
        ? await Giveaway.deleteMany({ GuildId: DataId })
        : await Giveaway.deleteOne({ MessageID: DataId })

}

Database.prototype.deleteUser = async (userId) => {

    await User.deleteOne({ id: userId })
    return

}

Database.prototype.addLotery = async (value, clientId) => {

    if (!value || isNaN(value)) return

    await Lotery.updateOne(
        { id: clientId },
        { $inc: { Prize: value } },
        { upsert: true }
    )

    return

}

Database.prototype.delete = async (userId, key) => {

    if (!userId || !key) return

    await User.updateOne(
        { id: userId },
        { $unset: { [key]: 1 } }
    )
    return

}

Database.prototype.PushTransaction = async (userId, Frase) => {

    if (!userId || !Frase) return

    let Data = require('../functions/plugins/data')

    let userData = await User.findOne({ id: userId }, 'Balance'),
        balance = userData?.Balance || 0

    await User.updateOne(
        { id: userId },
        { $push: { Transactions: { $each: [{ time: `${Data(0, true)} - ${balance}`, data: `${Frase}` }], $position: 0 } } },
        { upsert: true }
    )

    return

}

Database.prototype.registerUser = async (user, blocked) => {

    if (blocked || !user || user?.bot) return

    let u = await User.findOne({ id: user.id })
    if (u || u?.id === user.id) return

    new User({ id: user.id }).save()
    return
}

Database.prototype.registerServer = async (guild, client) => {

    if (!guild || !guild?.id) return

    let clientData = await Client.findOne({ id: client.user.id }, 'Blacklist.Guilds')
    if (clientData?.Blacklist?.Guilds.includes(guild.id)) return

    let g = await Guild.findOne({ id: guild.id })

    if (g || g?.id === guild.id) return

    new Guild({ id: guild.id }).save()

    await client?.channels?.cache?.get(config.LogChannelId)?.send(`${e.Database} | DATABASE | O servidor **${guild.name}** foi registrado com sucesso!`).catch(() => { })
    return true
}

Database.prototype.newCommandRegister = async (message, date, clientId) => {

    new LogRegister({
        Author: `${message.author.tag} - ${message.author.id}` || 'Indefinido',
        Server: `${message.guild.name} - ${message.guild.id}` || 'Indefinido',
        Command: message.content || 'Indefinido',
        Time: date || 0
    }).save()

    await Client.updateOne(
        { id: clientId },
        { $inc: { ComandosUsados: 1 } },
        { upsert: true }
    )

    return
}

Database.prototype.registerClient = async (clientId) => {

    let data = await Client.findOne({ id: clientId })
    if (data) return
    return new Client({ id: clientId }).save()

}

module.exports = new Database()