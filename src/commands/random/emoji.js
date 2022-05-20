const { Util } = require('discord.js')
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'emoji',
    aliases: ['emoti', 'emoticon', 'emoje'],
    category: 'random',
    emoji: '😀',
    ClientPermissions: ['EMBED_LINKS'],
    usage: 'emoji <emoji> <emoji> <emoji> <emoji>',
    description: 'Veja os emojis maiores',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (!args[0]) return message.reply(`${e.Info} | Usa com algum emoji`)

        const parsedEmoji = Util.parseEmoji(args[0]),
            emoji = {
                id: parsedEmoji.id || null,
                animated: parsedEmoji.animated ? ".gif" : ".png"
            }

        if (emoji.id) {

            const url = `https://cdn.discordapp.com/emojis/${emoji.id}${emoji.animated}`
            return message.channel.send(`${url}`)
        }

        return message.reply(`${e.Deny} | Emoji inválido.`)
    }
}