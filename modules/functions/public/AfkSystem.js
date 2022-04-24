const { e } = require('../../../JSON/emojis.json'),
    { Message } = require('discord.js'),
    Database = require('../../classes/Database')

/**
 * @param { Message } message 
 */

async function AfkSystem(message) {

    if (!message.guild) return

    let memberUser = message.mentions.users.first() || message.mentions.repliedUser,
        guildData = await Database.Guild.findOne({ id: message.guild.id }, 'AfkSystem'),
        authorData = await Database.User.findOne({ id: message.author.id }, 'AfkSystem'),
        afkAuthorGuildInfo = guildData?.AfkSystem?.find(arr => arr.MemberId === message.author.id)

    if (authorData?.AfkSystem) {

        await Database.User.updateOne(
            { id: message.author.id },
            { $unset: { AfkSystem: 1 } }
        )

        return message.react(`${e.Planet}`).catch(() => { })
    }

    if (afkAuthorGuildInfo?.Message) {

        await Database.Guild.updateOne(
            { id: message.guildId },
            { $pull: { 'AfkSystem': { MemberId: message.author.id } } }
        )

        return message.react(`${e.Check}`).catch(() => { })

    }

    if (!memberUser) return

    let memberData = await Database.User.findOne({ id: memberUser.id }, 'AfkSystem'),
        afkMemberGuildInfo = guildData?.AfkSystem?.find(arr => arr.MemberId === memberUser.id)

    if (memberData?.AfkSystem) {
        const msg = await message.channel.send(`${e.Afk} | ${message.author}, ${memberUser.username} está offline desde ${memberData.AfkSystem}`).catch(() => { })
        return setTimeout(() => msg.delete().catch(() => { }), 20000)
    }

    if (afkMemberGuildInfo) {
        const msg = await message.channel.send(`${e.Afk} | ${message.author}, ${memberUser.username} está offline desde ${afkMemberGuildInfo.Message}`).catch(() => { })
        return setTimeout(() => msg.delete().catch(() => { }), 20000)
    }
}

module.exports = AfkSystem