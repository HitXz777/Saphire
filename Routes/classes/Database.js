const client = require('../../index'),
    Clan = require('../database/models/Clans'),
    Client = require('../database/models/Client'),
    Giveaway = require('../database/models/Giveaway'),
    Guild = require('../database/models/Guild'),
    LogRegister = require('../database/models/LogRegister'),
    Lotery = require('../database/models/Lotery'),
    Reminder = require('../database/models/Reminders'),
    User = require('../database/models/User'),
    Ark = require('ark.db'),
    BgLevel = new Ark.Database('../../database/levelwallpapers.json'),
    BgWall = new Ark.Database('../../database/wallpaperanime.json')

class Database {
    constructor() {
        this.Clan = Clan
        this.Client = Client
        this.Giveaway = Giveaway
        this.Guild = Guild
        this.LogRegister = LogRegister
        this.Lotery = Lotery
        this.Reminder = Reminder
        this.User = User
        this.BgWall = BgWall
        this.BgLevel = BgLevel
    }
}

Database.prototype.MongoConnect = async () => {

    const mongoose = require('mongoose'),
        { config } = require('../../database/config.json')

    try {
        await mongoose.connect(process.env.MONGODB_LINK_CONNECTION, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        return console.log('Mongoose Database | OK!')
    } catch (err) {
        console.log('Mongoose Database | FAIL!\n' + err)
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

Database.prototype.closeLotery = async (clientId) => {

    await Lotery.updateOne(
        { id: clientId },
        { Close: true },
        { upsert: true }
    )
    return

}

Database.prototype.openLotery = async (clientId) => {

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

Database.prototype.deleteGiveaway = async (DataId, All = false) => {

    if (!DataId) return

    return All
        ? await Giveaway.deleteMany({ GuildId: DataId })
        : await Giveaway.deleteOne({ MessageID: DataId })

}

Database.prototype.deleteUser = async (userId) => {

    await User.deleteOne({ id: userId })
    await Reminder.deleteMany({ userId: userId })
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

    let Data = require('../functions/data')

    await User.updateOne(
        { id: userId },
        { $push: { Transactions: { $each: [{ time: Data(0, true), data: `${Frase}` }], $position: 0 } } },
        { upsert: true }
    )

    return

}



module.exports = new Database()