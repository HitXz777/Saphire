const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')

module.exports = {
    name: 'settitulo',
    aliases: ['titulo', 'settitle', 'title', 'título'],
    category: 'perfil',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '🔰',
    usage: '<setitulo> <Seu Título>',
    description: 'Escolha um título grandioso',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {
        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

        sdb.get(`Users.${message.author.id}.Perfil.TitlePerm`) ? AlterarTitulo() : message.reply(`${e.Deny} | Você não tem a permissão 🔰 **Título**. Você pode compra-la na \`${prefix}loja\``)

        function AlterarTitulo() {

            if (!args[0]) return message.reply(`${e.SaphireObs} | Você precisa me dizer qual o seu novo título.`)

            let NewTitle = args.join(' ') || 'Indefinido'
            if (NewTitle.length > 20) return message.reply(`${e.Deny} | O título não pode ultrapassar **20 caracteres**`)

            let BlockWords = ['undefined', 'false', 'null', 'nan']
            for (const word of BlockWords) {
                if (NewTitle.toLowerCase() === word)
                    return message.channel.send(`${e.Deny} | ${message.author}, somente a palavra **${word}** é proibida neste comando. Escreva algo mais.`)
            }

            if (NewTitle === sdb.get(`Users.${message.author.id}.Perfil.Titulo`)) return message.reply(`${e.Info} | Este já é o seu Título atual.`)

            return message.reply(`${e.QuestionMark} | Deseja alterar seu título para: **${NewTitle}** ?`).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        sdb.delete(`Request.${message.author.id}`)
                        sdb.set(`Users.${message.author.id}.Perfil.Titulo`, NewTitle)
                        msg.edit(`${e.Check} | Você alterou seu título com sucesso! Confira usando \`${prefix}perfil\``)
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
}