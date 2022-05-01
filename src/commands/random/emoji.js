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

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (!args[0]) return message.reply(`${e.Info} | Usa com algum emoji`)

        const parsedEmoji = Util.parseEmoji(args[0])

        if (parsedEmoji.id) {

            if (isNaN(parsedEmoji.id))
                return message.reply(`${e.Deny} | Não foi possível analizar o ID original do emoji soliciado.`)

            const url = `https://cdn.discordapp.com/emojis/${parsedEmoji.id + parsedEmoji.animated ? ".gif" : ".png"}`
            return message.channel.send(`${url}`)
        }

        return message.reply(`${e.Deny} | Emoji inválido.`)
    }
}