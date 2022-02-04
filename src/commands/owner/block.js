const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'block',
    aliases: ['nosend'],
    category: 'owner',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.OwnerCrow}`,
    usage: '<block> <ID> | <remove>',
    description: 'Permite meu criador des/bloquear usuários que abusam dos comandos gif/sendcantada/etc',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (['remove', 'del', 'tirar'].includes(args[0]?.toLowerCase())) {

            let id = args[1]
            if (!id) return message.reply(`${e.Deny} | Forneça um ID.`)
            if (id.length !== 18) return message.reply(`${e.Deny} | ID Inválido.`)
            if (isNaN(id)) return message.reply(`${e.Deny} | ID's não possuem letras.`)
            if (args[2]) return message.reply(`${e.Deny} | Nada além do ID.`)

            sdb.delete(`Client.BlockUsers.${id}`)
            return message.react('✅')
        } else {

            let id = args[0]
            if (!id) return message.reply(`${e.Deny} | Forneça um ID.`)
            if (id.length !== 18) return message.reply(`${e.Deny} | ID Inválido.`)
            if (isNaN(id)) return message.reply(`${e.Deny} | ID's não possuem letras.`)
            if (args[1]) return message.reply(`${e.Deny} | Nada além do ID.`)

            let user = await client.users.cache.get(id)

            if (!user) {

                return message.reply(`${e.Deny} | Eu não achei este usuário em nenhum servidor, deseja forçar o block?`).then(msg => {
                    msg.react('✅').catch(err => { return msg.edit(`${e.Deny} | Request abortada.\n\`${err}\``) })
                    msg.react('❌').catch(err => { return msg.edit(`${e.Deny} | Request abortada.\n\`${err}\``) })

                    const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                    msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                        const reaction = collected.first()

                        if (reaction.emoji.name === '✅') {
                        
                                sdb.set(`Client.BlockUsers.${id}`, true)
                                message.reply(`${e.Check} | Bloqueio do usuário *\`${id}\`* efetuado sucesso!`)
                          
                        } else {
                            msg.edit(`${e.Deny} | Request abortada.`)
                        }

                    }).catch(err => {
                        msg.edit(`${e.Deny} | Request abortada. | Tempo expirado.`)
                    })
                })

            } else {

                return message.reply(`${e.QuestionMark} | Deseja bloquear este usuário dos meus comandos inter-servidor?`).then(msg => {
                    msg.react('✅').catch(err => { return msg.edit(`${e.Deny} | Request abortada.\n\`${err}\``) })
                    msg.react('❌').catch(err => { return msg.edit(`${e.Deny} | Request abortada.\n\`${err}\``) })

                    const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                    msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                        const reaction = collected.first()

                        if (reaction.emoji.name === '✅') {
                            sdb.set(`Client.BlockUsers.${id}`, true)
                            message.reply(`${e.Check} | Bloqueio do usuário *\`${id}\`* efetuado sucesso!`)
                        } else {
                            msg.edit(`${e.Deny} | Request abortada.`)
                        }

                    }).catch(err => {
                        msg.edit(`${e.Deny} | Request abortada. | Tempo expirado.`)
                    })
                })
            }
        }
    }
}