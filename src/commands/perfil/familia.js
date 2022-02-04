const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const Colors = require('../../../Routes/functions/colors')
const Error = require('../../../Routes/functions/errors')
const Data = require('../../../Routes/functions/data')

module.exports = {
    name: 'familia',
    aliases: ['family', 'família'],
    category: 'perfil',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '👩‍👩‍👧‍👧',
    usage: '<family> <1/2/3> <@user/id>',
    description: 'Entre pra uma família',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user = message.mentions.members.first() || message.mentions.repliedUser || message.guild.members.cache.get(args[1])
        const Embed = new MessageEmbed().setColor(Colors(message.member))

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return SendInfo()
        if (['separar', 'delete', 'deletar', 'excluir', 'del'].includes(args[0]?.toLowerCase())) return DeleteFamilyPosition()

        if (!args[0] || isNaN(args[0]) || parseInt(args[0]) >= 4 || parseInt(args[0]) <= 0)
            return message.reply(`${e.Deny} | Você tem que dizer qual é a posição! Se tiver dúvidas, use \`${prefix}family info\``)

        let number
        switch (args[0]) {
            case '1': number = 'Um'; break;
            case '2': number = 'Dois'; break;
            case '3': number = 'Tres'; break;
        }

        user ? CheckAndSetFamily() : message.reply(`${e.Deny} | Você tem que dizer qual é o @membro! Se tiver dúvidas, use \`${prefix}family info\``)

        function CheckAndSetFamily() {

            if (sdb.get(`Users.${message.author.id}.Perfil.Marry`) === user.id) return message.reply(`${e.Info} | ${user.user.username} é seu cônjugue.`)
            if ((sdb.get(`Users.${message.author.id}.Perfil.Family.Um`) || sdb.get(`Users.${message.author.id}.Perfil.Family.Dois`) || sdb.get(`Users.${message.author.id}.Perfil.Family.Tres`)) === user.id) return message.reply(`${e.Info} | Você já é familiar de ${user.user.username}`)
            if (sdb.get(`Users.${user.id}.Perfil.Family.${number}`)) return message.reply(`${e.Info} | ${user.user.username} já tem um familiar na posição ${number}.`)
            if (sdb.get(`Users.${message.author.id}.Perfil.Family.${number}`)) return message.reply(`${e.Info} | ${GetFamilyUser(sdb.get(`Users.${message.author.id}.Perfil.Family.${number}`))} é seu familiar na posição ${number}`)
            if (user.id === message.author.id) return message.reply(`${e.Deny} | Você não pode chamar você mesmo para a sua família.`)
            if (user.id === client.user.id) return message.reply(`${e.Deny} | Sorry... Já tenho uma família.`)
            if (user.user.bot) return message.reply(`${e.Deny} | Sorry... Nada de bots.`)
            NewFamilySet()

        }

        function NewFamilySet() {

            return message.reply(`${e.QuestionMark} | ${user}, você está sendo convidado*(a)* para formar uma família com ${message.author}, você aceita?`).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, u) => { return ['✅', '❌'].includes(reaction.emoji.name) && u.id === user.id }

                msg.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        sdb.delete(`Request.${message.author.id}`)
                        sdb.set(`Users.${message.author.id}.Perfil.Family.${number}`, user.id)
                        sdb.set(`Users.${user.id}.Perfil.Family.${number}`, message.author.id)
                        msg.edit(`${e.Check} | ${user} & ${message.author} agora são da mesma família!`).catch(() => { })
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

        async function GetFamilyUser(id) {
            let Familiar = await client.users.cache.get(id)
            Familiar ? Familiar = Familiar.tag : Familiar = 'Familiar não encontrado.'
            return Familiar
        }

        function SendInfo() {
            return message.reply({
                embeds: [
                    Embed.setTitle(`💞 ${client.user.username} Family System`)
                        .setDescription(`Você pode escolher até 3 membros para a sua família! Eles ficaram visíveis no seu perfil e seu nome no perfil deles.`)
                        .addFields(
                            {
                                name: '- Posições',
                                value: 'Este sistema tem 3 posições. Você e a pessoa que vão se tornarem familiar, devem ter a mesma posição livre.\nExemplo: Se você convidar a @Saphire para a posição 1 e ela já estiver com a posição 1 ocupada, não será possível a junção.'
                            },
                            {
                                name: `${e.Gear} Comando`,
                                value: `\`${prefix}familia <1/2/3> <@user/id>\`\nExemplo: \`${prefix}familia 2 @Saphire\` *(Posição 2)*`
                            },
                            {
                                name: '💔 Separação',
                                value: `\`${prefix}familia <separar> <1/2/3>\` *(Necessita de confirmação)*`
                            }
                        )
                ]
            })
        }

        async function DeleteFamilyPosition() {
            if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)
            if (!['1', '2', '3'].includes(args[1]))
                return message.reply(`${e.Deny} | Você tem que dizer qual é a posição que deseja deletar! Se tiver dúvidas, use \`${prefix}family info\``)

            let position

            switch (args[1]) {
                case '1': position = 'Um'; break;
                case '2': position = 'Dois'; break;
                case '3': position = 'Tres'; break;
            }

            if (!sdb.get(`Users.${message.author.id}.Perfil.Family.${position}`))
                return message.reply(`${e.Deny} | Você não tem nenhum familiar na posição ${position}`)

            let Fam = await client.users.cache.get(sdb.get(`Users.${message.author.id}.Perfil.Family.${position}`))
            if (!Fam) {
                return message.reply(`${e.Warn} | Usuário desconhecido... Apagando dados...`).then(msg => {
                    setTimeout(() => {
                        sdb.set(`Users.${sdb.get(`Users.${message.author.id}.Perfil.Family.${position}`)}.Perfil.Family.${position}`, false)
                        sdb.set(`Users.${message.author.id}.Perfil.Family.${position}`, false)
                        msg.edit(`${e.Check} | Padrão restaurado!`)
                    }, 4000)
                })
            }

            return message.reply(`${e.QuestionMark} | Você confirma a separação familiar de \`${message.author.tag} & ${Fam.tag}\`?`).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter, max: 1, time: 20000 }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        sdb.delete(`Request.${message.author.id}`)
                        sdb.set(`Users.${sdb.get(`Users.${message.author.id}.Perfil.Family.${position}`)}.Perfil.Family.${position}`, false)
                        sdb.set(`Users.${message.author.id}.Perfil.Family.${position}`, false)

                        Fam ? Fam.send(`${e.Info} | ${message.author} > ${message.author.tag} \`${message.author.id}\` < pôs um fim no seu laço familiar.\nSeparação pedida em: \`${Data()}\``).catch(() => { }) : ''
                        return msg.edit(`${e.Check} | Separação concluída! Você não é mais familiar de ${Fam.tag}.\nSeparação pedida em: \`${Data()}\``).catch(() => { })
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