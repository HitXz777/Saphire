const { DatabaseObj } = require('../../../Routes/functions/database')
const { e, config } = DatabaseObj
const { Permissions } = require('discord.js')

module.exports = {
    name: 'say',
    aliases: ['dizer', 'falar', 'enviar'],
    category: 'moderation',
    emoji: '🗣️',
    usage: '<say> <conteúdo da sua mensagem>',
    description: 'Diga algo no chat atráves de mim',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (message.author.id !== config.ownerId && !message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES))
            return message.reply(`${e.Deny} | Permissão necessária: Gerenciar Mensagens`)

        let Message = args.join(' ')
        if (!Message) return message.reply(`${e.Deny} | Você precisa dizer algo para que eu envie.`)

        let SayMessage = message.author.id === config.ownerId ? `${Message}` : `${Message}\n \n*Por: ${message.author}*`

        message.delete().catch(() => { })
        return message.channel.send(`${SayMessage}`)

    }
}