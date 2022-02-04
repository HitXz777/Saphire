const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'unpin',
    aliases: ['desfixa', 'desfixar'],
    category: 'moderation',
    UserPermissions: ['MANAGE_MESSAGES'],
    ClientPermissions: ['MANAGE_MESSAGES'],
    emoji: `${e.Deny}`,
    usage: '<unpin> (Mencione a mensagem para dar um unpin)',
    description: 'Desfixa a mensagem mencionada',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        message.fetchReference(true).then(msg => {
            if (!msg.pinned) return message.reply(`${e.Deny} | Este mensagem não está fixada.`)
            message.channel.messages.unpin(message.reference.messageId).then(() => {
                return message.reply(`${e.Check} | Prontinho.`)
            }).catch(err => { return message.reply(`${e.Warn} | Ocorreu um erro durante o processo.\n\`${err}\``) })
        }).catch(() => {
            return message.reply(`${e.Deny} | Menciona uma mensagem fixada em forma de resposta`)
        })
    }
}