const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const simplydjs = require('simply-djs')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'jogodavelha',
    aliases: ['tictactoe', 'jv', 'jdv', 'ttt'],
    category: 'util',
    emoji: '❌⭕',
    usage: '<jogodavelha> <@user/id>',
    description: 'Jogo da velha versão Discord',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        return message.reply(`${e.Info} | Comando indisponível.`)
        // TODO: Ver se este comando a não dar erro

        // let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.mentions.repliedUser
        // if (!user) return message.reply(`${e.Deny} | Você precisa @marcar, dizer o ID ou mencionar a mensagem da pessoa que você quer jogar o jogo da velha`)

        // if (user.user.bot)
        //     return message.reply(`${e.Deny} | Nada de bots.`)

        // try {
        //     simplydjs.tictactoe(client, message, {
        //         xEmoji: '❌',
        //         oEmoji: '⭕',
        //         idleEmoji: '◼️',
        //         embedColor: '#246FE0',
        //         embedFoot: `${client.user.username} - Jogo da Velha`,
        //         credit: false
        //     })
        // } catch (err) { Error(message, err) }

    }
}