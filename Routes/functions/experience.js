const
    { Message } = require('discord.js'),
    { e } = require('../../database/emojis.json'),
    { sdb, db, ServerDb } = require('./database'),
    Notify = require('./notify')

/**
 * @param { Message } message 
 */

async function xp(message) {
    if (message.author.bot) return

    if (db.get(`XpSystem.${message.author.id}`) !== null && 3000 - (Date.now() - db.get(`XpSystem.${message.author.id}`)) > 0)
        return

    let XpAdd = Math.floor(Math.random() * 3)
    if (XpAdd === 0) XpAdd++
    db.set(`XpSystem.${message.author.id}`, Date.now())

    let level = sdb.get(`Users.${message.author.id}.Level`) || 1,
        xp = sdb.add(`Users.${message.author.id}.Xp`, XpAdd),
        xpNeeded = level * 550

    if (xpNeeded < xp) {

        sdb.subtract(`Users.${message.author.id}.Xp`, level * 550)
        let newLevel = sdb.add(`Users.${message.author.id}.Level`, 1),
            canal = await message.guild.channels.cache.get(ServerDb.get(`Servers.${message.guild.id}.XPChannel`))

        if (ServerDb.get(`Servers.${message.guild.id}.XPChannel`) && !canal) {
            ServerDb.delete(`Servers.${message.guild.id}.XPChannel`)
            Notify(message.guild.id, 'Recurso Desabilitado', 'O canal de notificações de level up presente no meu banco de dados não foi encontrado neste servidor. O canal foi deletado do meu sistema.')
        }

        return canal?.send(`${e.Tada} | ${message.author} alcançou o level ${newLevel} ${e.RedStar}`).catch(() => { })

    }
}

module.exports = xp