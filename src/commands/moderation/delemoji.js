const { Util } = require('discord.js')
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'delemoji',
    aliases: ['excluiremoji', 'apagaremoji', 'removeremoji', 'deleteemoji', 'emojidelete', 'emojidel'],
    category: 'moderation',
    emoji: `${e.ModShield}`,
    UserPermissions: ['MANAGE_EMOJIS_AND_STICKERS'],
    ClientPermissions: ['MANAGE_EMOJIS_AND_STICKERS'],
    usage: 'delemoji <emoji> <emoji> <emoji> <emoji>',
    description: 'Delete Emojis do Servidor',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (!args[0]) return message.reply(`${e.SaphireHi} | Delete emojis do servidor. Posso deletar vários de uma vez *(Máx 10)*, só mandar seperados com espaços. <EMOJI> <EMOJI> <EMOJI> `)
        if (args[10]) return message.reply(`${e.Deny} | Eu só posso deletar 10 emojis por vez`)

        let count = 0

        for (const rawEmoji of args) {
            const parsedEmoji = Util.parseEmoji(rawEmoji)

            if (parsedEmoji.id) {
                let Emoji = message.guild.emojis.cache.find(r => r.id == parsedEmoji.id)
                if (!Emoji) return message.channel.send(`${e.Deny} | Esse emoji não existe no servidor.`)
                Emoji.delete()
                    .then(() => count++)
                    .catch(err => message.channel.send(`${e.Deny} | Não foi possível deletar esse emoji: (${rawEmoji})`))
            }
            continue
        }
        return message.reply(`${e.Check} | Prontinho! ${count > 1 ? `${count} emojis deletados` : ''}`)
    }
}