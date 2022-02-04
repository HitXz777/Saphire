const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')

module.exports = {
    name: 'setstatus',
    aliases: ['status'],
    category: 'perfil',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '✍️',
    usage: '<setstatus> <Seu Novo Status>',
    description: 'Defina seu status no perfil',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {
        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

        if (!args[0]) return message.reply(`${e.SaphireObs} | Você precisa me dizer qual o seu novo status.`)

        let NewStatus = args.join(' ') || 'Indefinido'
        if (NewStatus.length > 140) return message.reply(`${e.Deny} | O status não pode ultrapassar **140 caracteres**`)

        let BlockWords = ['undefined', 'false', 'null', 'nan']
        for (const word of BlockWords) {
            if (NewStatus?.toLowerCase() === word)
                return message.channel.send(`${e.Deny} | ${message.author}, somente a palavra **${word}** é proibida neste comando. Escreva algo mais.`)
        }

        let status = sdb.get(`Users.${message.author.id}.Perfil.Status`)
        if (status === NewStatus) return message.reply(`${e.Info} | Este já é o seu status.`)

        return message.reply(`${e.QuestionMark} | Deseja alterar seu status para:\n**${NewStatus}**`).then(msg => {
            sdb.set(`Request.${message.author.id}`, `${msg.url}`)
            msg.react('✅').catch(() => { }) // Check
            msg.react('❌').catch(() => { }) // X

            const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '✅') {
                    sdb.delete(`Request.${message.author.id}`)
                    sdb.set(`Users.${message.author.id}.Perfil.Status`, NewStatus)
                    msg.edit(`${e.Check} | Você alterou seu status com sucesso! Confira usando \`${prefix}perfil\``)
                } else {
                    sdb.delete(`Request.${message.author.id}`)
                    msg.edit(`${e.Deny} | Request cancelada.`)
                }
            }).catch(() => {
                sdb.delete(`Request.${message.author.id}`)
                msg.edit(`${e.Deny} | Request cancelada por tempo expirado.`)
            })
        })
    }

}