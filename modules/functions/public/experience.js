const
    { Message } = require('discord.js'),
    { e } = require('../../../JSON/emojis.json'),
    Notify = require('../plugins/notify'),
    Database = require('../../classes/Database'),
    client = require('../../../index')

/**
 * @param { Message } message 
 */

async function xp(message) {

    if (!message || !message.author || !message.guild) return

    let user = await Database.User.findOne({ id: message.author.id }, 'Xp Level Timeouts.XpCooldown')
    if (!user) return

    let currentXp = user?.Xp || 0,
        XpAdd = Math.floor(Math.random() * 3),
        timeout = user?.Timeouts?.XpCooldown || 0

    if (client.Timeout(3000, timeout)) return

    if (XpAdd === 0) XpAdd++

    let level = user?.Level || 1,
        xpNeeded = level * 275

    await Database.User.updateOne(
        { id: message.author.id },
        {
            $inc: { Xp: XpAdd },
            'Timeouts.XpCooldown': Date.now()
        }
    )

    if (currentXp + XpAdd > xpNeeded) {

        let guild = await Database.Guild.findOne({ id: message.guild.id }, 'XpSystem'),
            canal = message.guild.channels.cache.get(guild?.XpSystem?.Canal),
            text = guild?.XpSystem?.Mensagem || 'alcançou o level'

        await Database.User.updateOne(
            { id: message.author.id },
            {
                $inc: {
                    Level: 1,
                    Xp: -xpNeeded
                }
            },
            { upsert: true }
        )

        if (guild?.XpSystem?.Canal && !canal) {

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { $unset: { XpSystem: 1 } }
            )

            return Notify(message.guild.id, 'Recurso Desabilitado', 'O canal de notificações de level up presente no meu banco de dados não foi encontrado neste servidor. O canal foi deletado do meu sistema.')
        }

        if (!canal) return
        return canal?.send(`${e.Tada} | ${message.author} ${text} ${level + 1} ${e.RedStar}`).catch(() => { })

    }

    return
}

module.exports = xp