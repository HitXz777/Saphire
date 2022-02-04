const { Util } = require('discord.js')
const { parse } = require("twemoji-parser")
const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'delemoji',
    aliases: ['excluiremoji', 'apagaremoji', 'removeremoji', 'deleteemoji', 'emojidelete', 'emojidel'],
    category: 'moderation',
    emoji: `${e.ModShield}`,
    UserPermissions: ['MANAGE_EMOJIS_AND_STICKERS'],
    ClientPermissions: ['MANAGE_EMOJIS_AND_STICKERS'],
    usage: 'delemoji <emoji> <emoji> <emoji> <emoji>',
    description: 'Delete Emojis do Servidor',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (!args[0]) return message.reply(`${e.SaphireHi} | Delete emojis do servidor. Posso deletar vários de uma vez *(Máx 10)*, só mandar seperados com espaços. <EMOJI> <EMOJI> <EMOJI> `)
        if (args[10]) return message.reply( `${e.Deny} | Eu só posso deletar 10 emojis por vez`)

        for (const rawEmoji of args) {
            const parsedEmoji = Util.parseEmoji(rawEmoji)

            if (parsedEmoji.id) {
                let Emoji = message.guild.emojis.cache.find(r => r.name == parsedEmoji.name)
                if (!Emoji) return message.channel.send(`${e.Deny} | Esse emoji não existe no servidor.`)
                Emoji.delete()
                    .then(() => message.channel.send(`${e.Check} | Emoji deletado com sucesso!`))
                    .catch(err => { message.reply(`${e.Deny} | Não foi possível deletar o emoji **${rawEmoji}**. Isso é mesmo um emoji?`) })
            } else {
                message.reply(`${e.Deny} | ${rawEmoji} não é um emoji customizado.`)
            }
        }
    }
}