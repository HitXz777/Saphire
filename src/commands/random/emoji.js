
const { Util } = require('discord.js')
const { parse } = require("twemoji-parser")
const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'emoji',
    aliases: ['emoti', 'emoticon', 'emoje'],
    category: 'random',
    emoji: '😀',
    ClientPermissions: ['EMBED_LINKS'],
    usage: 'emoji <emoji> <emoji> <emoji> <emoji>',
    description: 'Veja os emojis maiores',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (!args[0]) return message.reply(`${e.Info} | Usa com algum emoji`)
        if (args[4]) return message.reply(`${e.Deny} | Só 3 emojis por vez.`)

        for (const rawEmoji of args) {
            const parsedEmoji = Util.parseEmoji(rawEmoji)

            if (parsedEmoji.id) {
                const extension = parsedEmoji.animated ? ".gif" : ".png"
                const url = `https://cdn.discordapp.com/emojis/${parsedEmoji.id + extension}`
                message.channel.send(`${url}`)
            } else {
                message.reply(`${e.Deny} | Este emoji não é um emoji customizado.`)
            }
        }
    }
}