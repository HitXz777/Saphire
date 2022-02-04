const { sdb, ServerDb } = require('./database')
const { e } = require('../../database/emojis.json')
const { Message, Permissions } = require('discord.js')

/**
 * @param { Message } message 
 */

async function AfkSystem(message) {

    if (!message.guild.me.permissions.has(Permissions.FLAGS.ADD_REACTIONS))
        return

    const GuildId = message.guild.id,
        user = message.mentions.users.first() || message.mentions.repliedUser

    if (ServerDb.get(`Servers.${GuildId}.AfkSystem.${message.author.id}`)) {
        ServerDb.delete(`Servers.${GuildId}.AfkSystem.${message.author.id}`)
        const count = ServerDb.get(`Servers.${GuildId}.AfkSystem.${message.author.id}Notification`)
        ServerDb.delete(`Servers.${GuildId}.AfkSystem.${message.author.id}Notification`)

        if (count > 0) {
            const msg = await message.channel.send(`${e.Notification} | Hey, ${message.author}. Enquanto você estava offline, você recebeu ${count} menções no servidor. Lembre-se de conferir as notificações.`).catch(() => { })
            return setTimeout(() => msg.delete().catch(() => { }), 20000)
        }
        return message.react(`${e.Check}`).catch(() => { })

    }

    if (sdb.get(`Users.${message.author.id}.AfkSystem`)) {
        sdb.delete(`Users.${message.author.id}.AfkSystem`)
        const count = sdb.get(`Users.${message.author.id}.AfkSystemNotification`)
        sdb.delete(`Users.${message.author.id}.AfkSystemNotification`)

        if (count > 0) {
            const msg = await message.channel.send(`${e.Notification} | Hey, ${message.author}. Enquanto você estava offline, você recebeu ${count} menções nos servidores. Lembre-se de conferir as notificações.`).catch(() => { })
            return setTimeout(() => msg.delete().catch(() => { }), 20000)
        }
        return message.react(`${e.Planet}`).catch(() => { })
    }

    if (user) {

        if (sdb.has(`Users.${user.id}.AfkSystem`)) {
            sdb.add(`Users.${user.id}.AfkSystemNotification`, 1)
            const msg = await message.channel.send(`${e.Afk} | ${message.author}, ${user.username} está offline desde ${sdb.get(`Users.${user.id}.AfkSystem`)}`).catch(() => { })
            setTimeout(() => msg.delete().catch(() => { }), 20000)
        }

        if (ServerDb.has(`Servers.${GuildId}.AfkSystem.${user.id}`)) {
            ServerDb.add(`Servers.${GuildId}.AfkSystem.${user.id}Notification`, 1)
            const msg = await message.channel.send(`${e.Afk} | ${message.author}, ${user.username} está offline desde ${ServerDb.get(`Servers.${GuildId}.AfkSystem.${user.id}`)}`).catch(() => { })
            setTimeout(() => msg.delete().catch(() => { }), 20000)
        }
    }

    return
}

module.exports = AfkSystem