
const { Util } = require('discord.js')
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'addemoji',
    aliases: ['emojiadd', 'adicionaremoji', 'addemote', 'emotecreate', 'steal', 'stealemoji'],
    category: 'moderation',
    emoji: `${e.ModShield}`,
    UserPermissions: ['MANAGE_EMOJIS_AND_STICKERS'],
    ClientPermissions: ['MANAGE_EMOJIS_AND_STICKERS'],
    usage: 'addemoji <emoji> <emoji> <emoji> <emoji>',
    description: 'Adicione Emojis no Servidor',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (message.reference?.messageId) {

            let Message = message.channel.messages.cache.get(message.reference.messageId).content,
                Args = Message.trim().split(/ +/g)

            for (const rawEmoji of Args) {
                const parsedEmoji = Util.parseEmoji(rawEmoji)

                if (parsedEmoji.id) {
                    const extension = parsedEmoji.animated ? ".gif" : ".png"
                    const url = `https://cdn.discordapp.com/emojis/${parsedEmoji.id + extension}`
                    message.guild.emojis.create(url, parsedEmoji.name)
                        .then((emoji) => message.reply(`${emoji} | Emoji adicionado com sucesso!`))
                        .catch(err => message.reply(`${e.Deny} | Falha ao adicionar esse emoji: (${rawEmoji}) | Ou isso não é um emoji customizado ou o servidor já atingiu o limite de emojis.`))
                    continue
                } else { message.reply(`${e.QuestionMark} | Isso é mesmo um emoji customizado? (${rawEmoji})`) }
            }

            return
        }

        if (!args[0]) return message.reply(`${e.Info} | Adicione emojis no servidor. Posso adicionar vários de uma vez, só mandar seperados com espaços. <EMOJI> <EMOJI> <EMOJI> `)
        if (args[20]) return message.reply(`${e.Deny} | Eu só posso adicionar 20 emojis por vez`)

        for (const rawEmoji of args) {
            const parsedEmoji = Util.parseEmoji(rawEmoji)

            if (parsedEmoji.id) {
                const extension = parsedEmoji.animated ? ".gif" : ".png"
                const url = `https://cdn.discordapp.com/emojis/${parsedEmoji.id + extension}`
                message.guild.emojis.create(url, parsedEmoji.name)
                    .then((emoji) => message.reply(`${emoji} | Emoji adicionado com sucesso!`))
                    .catch(err => message.reply(`${e.Deny} | Falha ao adicionar esse emoji: (${rawEmoji})`))
            } else { message.reply(`${e.QuestionMark} | Isso é mesmo um emoji customizado? (${rawEmoji})`) }
        }

        return

    }
}