const { Permissions } = require('discord.js')
const { f } = require('../../../database/frases.json')
const { DatabaseObj, ServerDb } = require('../../../Routes/functions/database')
const { e, config } = DatabaseObj

module.exports = {
    name: 'prefix',
    aliases: ['setprefix'],
    category: 'bot',
    UserPermissions: ['MANAGE_GUILD'],
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.ModShield}`,
    usage: '<NovoPrefix> | <reset>',
    description: 'Altere o prefixo ou reset para o padrão.',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

        const prefixembed = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(`${e.Info} Informações sobre Prefixo`)
            .setDescription('Prefixo é o simbolo que você utiliza para executar comandos em bots no Discord.\nExemplo: `' + prefix + 'prefix` ou `' + prefix + 'help`')
            .addFields(
                {
                    name: '💡 Meus comandos de Prefix',
                    value: '`' + prefix + 'prefix [NovoPrefixo]` Escolha meu novo prefixo\n`' + prefix + 'prefix reset` Resete meu prefixo para `-`'
                }
            )

        if (!args[0]) { return message.reply({ embeds: [prefixembed] }) }
        if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) { return message.reply(`${e.Info} | Permissão necessária: "Administrador"`) }

        if (['reset', 'resetar', 'delete', 'deletar'].includes(args[0]?.toLowerCase())) {


            if (prefix === config.prefix)
                return message.reply(`${e.Info} | O prefixo atual é o meu padrão: \`${config.prefix}\``)

            return message.reply(`${e.QuestionMark} | Você deseja resetar meu prefix para \`${config.prefix}\`?`).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] })
                    .then(collected => {
                        const reaction = collected.first()

                        if (reaction.emoji.name === '✅') {
                            sdb.delete(`Request.${message.author.id}`)
                            ServerDb.delete(`Servers.${message.guild.id}.Prefix`)
                            msg.edit(`${e.Check} | ${message.author.username} resetou meu prefixo para \`${config.prefix}\``).catch(() => { })
                            msg.reactions.removeAll().catch(() => { })
                        } else {
                            sdb.delete(`Request.${message.author.id}`)
                            msg.edit(`${e.NezukoDance} | Comando cancelado.`).catch(() => { })
                            msg.reactions.removeAll().catch(() => { })
                        }
                    }).catch(() => {
                        sdb.delete(`Request.${message.author.id}`)
                        msg.edit('⏱️ | Comando cancelado por: Tempo Expirado.').catch(() => { })
                        msg.reactions.removeAll().catch(() => { })
                    })
            })
        }

        if (args[0].length > 2) { return message.reply(`${e.Itachi} | O prefixo não pode ter mais de 2 caracteres.`) }
        if (!isNaN(args[0])) { return message.reply(`${e.Hmmm} | O prefixo não pode ser um número.`) }
        if (args[1]) { return message.reply(`${e.Info} |O prefixo não pode ter espaços.`) }

        if (args[0]) {

            return message.reply(`${e.QuestionMark} | Deseja alterar meu prefixo para: \`${args[0]}\` ?`).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        msg.reactions.removeAll().catch(() => { })

                        if (args[0] === `${config.prefix}`) {

                            sdb.delete(`Request.${message.author.id}`)
                            ServerDb.delete(`Servers.${message.guild.id}.Prefix`)
                            msg.edit(`${e.Check} | ${message.author}, como \`${config.prefix}\` é o meu prefixo padrão, eu resetei o prefixo do servidor.`).catch(() => { })

                        } else if (args[0] === "<") {

                            return message.reply(`${e.Deny} Opa opa, você achou um prefixo proibido.`)

                        } else {
                            sdb.delete(`Request.${message.author.id}`)
                            ServerDb.set(`Servers.${message.guild.id}.Prefix`, args[0])
                            sdb.delete(`Request.${message.author.id}`)
                            msg.edit(`${e.Check} | Prefixo \`${args[0]}\` novinho em folha! Só não esquece, ok? ${e.SaphireFeliz}`)
                        }
                    } else {
                        sdb.delete(`Request.${message.author.id}`)
                        msg.reactions.removeAll().catch(() => { })
                        msg.edit(`${e.Deny} | Comando cancelado por: ${message.author}`).catch(() => { })
                    }
                }).catch(() => {
                    sdb.delete(`Request.${message.author.id}`)
                    msg.edit(`${e.Deny} | Comando cancelado por: Tempo expirado`).catch(() => { })
                })
            })
        }
    }
}