const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const Colors = require('../../../Routes/functions/colors')
const Error = require('../../../Routes/functions/errors')
const Data = require('../../../Routes/functions/data')

module.exports = {
    name: 'parca',
    aliases: ['parças', 'amigos', 'parça', 'amigo'],
    category: 'perfil',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: 'c',
    usage: '<parças> <1/2/3/4/5> <@user/id>',
    description: 'Junte seus parças no seu perfil',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user = message.mentions.members.first() || message.mentions.repliedUser || message.guild.members.cache.get(args[1])
        const Embed = new MessageEmbed().setColor(Colors(message.member))

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return SendInfo()
        if (['separar', 'delete', 'deletar', 'excluir'].includes(args[0]?.toLowerCase())) return DeleteParcaPosition()

        if (!args[0] || isNaN(args[0]) || args[0] > 5 || args[0] < 1)
            return message.reply(`${e.Deny} | Você tem que dizer qual é a posição! Se tiver dúvidas, use \`${prefix}parça info\``)

        let number = {
            1: 'Um',
            2: 'Dois',
            3: 'Tres',
            4: 'Quatro',
            5: 'Cinco'
        }[parseInt(args[0])]

        user ? CheckAndSetParca() : message.reply(`${e.Deny} | Você tem que dizer qual é o @membro! Se tiver dúvidas, use \`${prefix}parça info\``)

        function CheckAndSetParca() {

            if (sdb.get(`Users.${message.author.id}.Perfil.Marry`) === user.id) return message.reply(`${e.Info} | ${user.user.username} é seu cônjuge.`)
            if ((sdb.get(`Users.${message.author.id}.Perfil.Family.Um`) || sdb.get(`Users.${message.author.id}.Perfil.Family.Dois`) || sdb.get(`Users.${message.author.id}.Perfil.Family.Tres`)) === user.id) return message.reply(`${e.Info} | Você já é familiar de ${user.user.username}`)
            if (sdb.get(`Users.${user.id}.Perfil.Parcas.${number}`)) return message.reply(`${e.Info} | ${user.user.username} já tem um parça na posição ${number}.`)
            if (sdb.get(`Users.${message.author.id}.Perfil.Parcas.${number}`)) return message.reply(`${e.Info} | ${GetUser(sdb.get(`Users.${message.author.id}.Perfil.Parcas.${number}`))} é seu parça na posição ${number}`)
            if (user.id === message.author.id) return message.reply(`${e.Deny} | Você não pode ser parça de você mesmo.`)
            if (user.id === client.user.id) return message.reply(`${e.Deny} | Sorry... Não posso ter parças.`)
            if (user.user.bot) return message.reply(`${e.Deny} | Sorry... Nada de bots.`)
            NewParcaSet()

        }

        function NewParcaSet() {

            return message.reply(`${e.QuestionMark} | ${user}, você está sendo convidado*(a)* para ser parça de ${message.author}, você aceita?`).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, u) => { return ['✅', '❌'].includes(reaction.emoji.name) && u.id === user.id }

                msg.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        sdb.delete(`Request.${message.author.id}`)
                        sdb.set(`Users.${message.author.id}.Perfil.Parcas.${number}`, user.id)
                        sdb.set(`Users.${user.id}.Perfil.Parcas.${number}`, message.author.id)
                        msg.edit(`${e.Check} | ${user} 🤝 ${message.author} agora são parças!`).catch(() => { })
                    } else {
                        sdb.delete(`Request.${message.author.id}`)
                        msg.edit(`${e.Deny} | Pedido recusado.`).catch(() => { })
                    }
                }).catch(() => {
                    sdb.delete(`Request.${message.author.id}`)
                    msg.edit(`${e.Deny} | Pedido recusado por tempo expirado.`).catch(() => { })
                })

            }).catch(err => {
                Error(message, err)
                message.channel.send(`${e.SaphireCry} | Ocorreu um erro durante o processo. Por favor, reporte o ocorrido usando \`${prefix}bug\`\n\`${err}\``)
            })

        }

        async function GetUser(id, number) {
            let User = await client.users.cache.get(id)

            if (!User) {
                sdb.delete(`Users.${message.author.id}.Perfil.Parcas.${number}`)
                sdb.delete(`Users.${id}`)
            }

            User ? User = User.tag : User = 'Parça não encontrado.'
            return User
        }

        function SendInfo() {
            return message.reply({
                embeds: [
                    Embed.setTitle(`🤝 ${client.user.username} Profile System | Parças `)
                        .setDescription(`Você pode escolher até 5 membros para serem seus parças! Eles ficaram visíveis no seu perfil e seu nome no perfil deles.`)
                        .addFields(
                            {
                                name: '- Posições',
                                value: 'Este sistema tem 5 posições. Você e a pessoa que vão se tornarem parças, devem ter a mesma posição livre.\nExemplo: Se você convidar a @Saphire para a posição 1 e ela já estiver com a posição 1 ocupada, não será possível a junção.'
                            },
                            {
                                name: `${e.Gear} Comando`,
                                value: `\`${prefix}parça <1/2/3/4/5> <@user/id>\`\nExemplo: \`${prefix}parça 2 @Saphire\` *(Posição 2)*`
                            },
                            {
                                name: '💔 Separação',
                                value: `\`${prefix}parça <separar> <1/2/3/4/5>\` *(Necessita de confirmação)*`
                            }
                        )
                ]
            })
        }

        async function DeleteParcaPosition() {
            if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)
            if (!args[1] || args[1] > 5 || args[1] < 1)
                return message.reply(`${e.Deny} | Você tem que dizer qual é a posição que deseja deletar, de 1 a 5! Se tiver dúvidas, use \`${prefix}parça info\``)

            let position = {
                1: 'Um',
                2: 'Dois',
                3: 'Tres',
                4: 'Quatro',
                5: 'Cinco'
            }[parseInt(args[1])]

            if (!sdb.get(`Users.${message.author.id}.Perfil.Parcas.${position}`))
                return message.reply(`${e.Deny} | Você não tem nenhum parça na posição ${position}`)

            let Fam = await client.users.cache.get(sdb.get(`Users.${message.author.id}.Perfil.Parcas.${position}`))
            if (!Fam) {
                return message.reply(`${e.Loading} | Usuário desconhecido. Apagando dados...`).then(msg => {
                    setTimeout(() => {
                        sdb.delete(`Users.${sdb.get(`Users.${message.author.id}.Perfil.Parcas.${position}`)}`)
                        sdb.set(`Users.${message.author.id}.Perfil.Parcas.${position}`, false)
                        msg.edit(`${e.Check} | Padrão restaurado!`)
                    }, 4000)
                })
            }

            return message.reply(`${e.QuestionMark} | Você confirma a separação de parças entre \`${message.author.tag} & ${Fam.tag}\`?`).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter, max: 1, time: 20000 }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        sdb.delete(`Request.${message.author.id}`)
                        sdb.set(`Users.${sdb.get(`Users.${message.author.id}.Perfil.Parcas.${position}`)}.Perfil.Parcas.${position}`, false)
                        sdb.set(`Users.${message.author.id}.Perfil.Parcas.${position}`, false)

                        Fam ? Fam.send(`${e.Info} | ${message.author} > ${message.author.tag} \`${message.author.id}\` < separou vocês dois como parças.\nSeparação pedida em: \`${Data()}\``).catch(() => { }) : ''
                        return msg.edit(`${e.Check} | Separação concluída! Você não é mais parça de ${Fam.tag}.\nSeparação pedida em: \`${Data()}\``).catch(() => { })
                    } else {
                        sdb.delete(`Request.${message.author.id}`)
                        msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    }
                }).catch(() => {
                    sdb.delete(`Request.${message.author.id}`)
                    msg.edit(`${e.Deny} | Comando cancelado por tempo expirado.`).catch(() => { })
                })

            }).catch(err => {
                Error(message, err)
                message.channel.send(`${e.SaphireCry} | Ocorreu um erro durante o processo. Por favor, reporte o ocorrido usando \`${prefix}bug\`\n\`${err}\``)
            })

        }
    }
}