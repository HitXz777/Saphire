const client = require('../../../index'),
    Database = require('../../classes/Database')

async function Notify(ServerId, type, msg) {

    let guild = await Database.Guild.findOne({ id: ServerId }, 'LogChannel'),
        canal = client.channels.cache.get(guild?.LogChannel)

    if (!canal && guild?.LogChannel) {
        await Database.Guild.updateOne(
            { id: ServerId },
            { $unset: { LogChannel: 1 } }
        )
        return
    }

    return canal?.send(`🛰️ | **Global System Notification** | ${type}\n \n${msg}`).catch(() => { })
}

module.exports = Notify