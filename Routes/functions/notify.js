const client = require('../../index'),
    { ServerDb } = require('./database')

async function Notify(ServerId, type, msg) {

    const canal = await client.channels.cache.get(ServerDb.get(`Servers.${ServerId}.LogChannel`))

    if (!canal && ServerDb.get(`Servers.${ServerId}.LogChannel`))
        return ServerDb.delete(`Servers.${ServerId}.LogChannel`)

    canal?.send(`🛰️ | **Global System Notification** | ${type}\n \n${msg}`).catch(() => { })
}

module.exports = Notify