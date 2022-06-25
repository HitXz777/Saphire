
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

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let emojisArray = []
        let msg = await message.channel.send(`${e.Loading} | Adicionando emojis...`)

        if (message.reference?.messageId) {

            let Message = message.channel.messages.cache.get(message.reference.messageId).content,
                Args = Message.trim().split(/ +/g)

            for (const rawEmoji of Args) {
                const parsedEmoji = Util.parseEmoji(rawEmoji)

                if (parsedEmoji.id) {
                    const extension = parsedEmoji.animated ? ".gif" : ".png"
                    const url = `https://cdn.discordapp.com/emojis/${parsedEmoji.id + extension}`
                    await message.guild.emojis.create(url, parsedEmoji.name)
                        .then(emoji => {
                            let format = `🆗 <${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`
                            emojisArray.push(format)
                        })
                        .catch(() => msg.edit(`${e.Deny} | Falha ao adicionar esse emoji: (${rawEmoji}) | Ou isso não é um emoji customizado ou o servidor já atingiu o limite de emojis.`))
                    continue
                }

                emojisArray.push(`❌ ${rawEmoji}`)
            }

            return msg.edit(`${e.Check} | Adição concluída:\n${emojisArray.map(x => `> ${x}`).join('\n')}`).catch(() => { })
        }

        if (!args[0]) return msg.edit(`${e.Info} | Adicione emojis no servidor. Posso adicionar vários de uma vez, só mandar seperados com espaços. <EMOJI> <EMOJI> <EMOJI> `)
        if (args[20]) return msg.edit(`${e.Deny} | Eu só posso adicionar 20 emojis por vez`)

        for (const rawEmoji of args) {
            const parsedEmoji = Util.parseEmoji(rawEmoji)

            if (parsedEmoji.id) {
                const extension = parsedEmoji.animated ? ".gif" : ".png"
                const url = `https://cdn.discordapp.com/emojis/${parsedEmoji.id + extension}`
                await message.guild.emojis.create(url, parsedEmoji.name)
                    .then(emoji => {
                        let format = `🆗 <${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`
                        emojisArray.push(format)
                    })
                    .catch(() => msg.edit(`${e.Deny} | Falha ao adicionar esse emoji: (${rawEmoji}) | Ou isso não é um emoji customizado ou o servidor já atingiu o limite de emojis.`))
                continue
            }

            emojisArray.push(`❌ ${rawEmoji}`)
        }

        return msg.edit(`${e.Check} | Adição concluída:\n${emojisArray.map(x => `> ${x}`).join('\n')}`).catch(() => { })

    }
}