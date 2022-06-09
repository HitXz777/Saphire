const { e } = require('../../../JSON/emojis.json')
const Colors = require('../../../modules/functions/plugins/colors')
const Data = require('../../../modules/functions/plugins/data')

module.exports = {
    name: 'parca',
    aliases: ['parças', 'amigos', 'parça', 'amigo'],
    category: 'perfil',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '👥',
    usage: '<parças> <1/2/3/4/5> <@user/id>',
    description: 'Junte seus parças no seu perfil',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = client.getUser(client, message, args, 'member') || message.guild.members.cache.get(args[0]),
            color = await Colors(message.author.id),
            Embed = new MessageEmbed().setColor(color),
            data = {}

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return SendInfo()
        if (['separar', 'delete', 'deletar', 'excluir', 'remover', 'remove'].includes(args[0]?.toLowerCase())) return DeleteParcaPosition()

        if (!user)
            return message.reply(`${e.Deny} | Você tem que dizer quem você quer como parça. Se tiver dúvidas, use \`${prefix}parça info\``)

        if (user.user.bot) return message.reply(`${e.Deny} | Sorry... Nada de bots.`)

        let dbData = await Database.User.find({}, 'id Perfil.Parcas Perfil.Marry.Conjugate')
        authorData = dbData?.find(data => data.id === message.author.id)
        userData = dbData?.find(data => data.id === user.user.id)

        if (!userData) {
            Database.registerUser(user.user)
            return message.reply(`${e.Database} | DATABASE | Eu não achei nada no meu banco de dados referente a **${user.user.tag} *\`${user.user.id}\`***. Eu acabei de efetuar o registro, por favor, use o comando novamente.`)
        }

        data.authorParcas = authorData?.Perfil?.Parcas || []
        data.authorConjugate = authorData?.Perfil?.Marry?.Conjugate
        data.userParcas = userData?.Perfil?.Parcas || []

        if (data.authorParcas.includes(user.id) || data.userParcas.includes(message.author.id))
            return message.reply(`${e.Deny} | Vocês já são parceiros.`)

        if (data.authorParcas?.length >= 7)
            return message.reply(`${e.Deny} | Você já atingiu o limite de parças.`)

        if (data.userParcas?.length >= 7)
            return message.reply(`${e.Deny} | ${user.user.username} já atingiu o limite de parças.`)

        return CheckAndSetParca()

        function CheckAndSetParca() {

            if (user.id === message.author.id) return message.reply(`${e.Deny} | Você não pode ser parça de você mesmo.`)
            if (user.id === client.user.id) return message.reply(`${e.Deny} | Sorry... Não posso ter parças.`)
            if (data.authorConjugate && data.authorConjugate === user.id)
                return message.reply(`${e.Info} | ${user.user.username} é seu cônjuge.`)

            if (data.authorParcas.includes(user.id))
                return message.reply(`${e.Info} | Você já é familiar de ${user.user.username}`)

            NewParcaSet()

        }

        async function NewParcaSet() {

            const msg = await message.reply(`${e.QuestionMark} | ${user}, você está sendo convidado*(a)* para ser parça de ${message.author}, você aceita?`)

            msg.react('✅').catch(() => { }) // Check
            msg.react('❌').catch(() => { }) // X

            return msg.awaitReactions({
                filter: (reaction, u) => ['✅', '❌'].includes(reaction.emoji.name) && u.id === user.id,
                max: 1,
                time: 60000,
                errors: ['time']
            }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '✅') {

                    Database.pushUserData(message.author.id, 'Perfil.Parcas', user.id)
                    Database.pushUserData(user.id, 'Perfil.Parcas', message.author.id)

                    return msg.edit(`${e.Check} | ${user} 🤝 ${message.author} agora são parças!`).catch(() => { })

                }
                return msg.edit(`${e.Deny} | Pedido recusado.`).catch(() => { })
            }).catch(() => msg.edit(`${e.Deny} | Pedido recusado por tempo expirado.`).catch(() => { }))

        }

        function SendInfo() {
            return message.reply({
                embeds: [
                    Embed.setTitle(`🤝 ${client.user.username} Profile System | Parças `)
                        .setDescription(`Você pode escolher até 7 membros para serem seus parças! Eles ficaram visíveis no seu perfil e seu nome no perfil deles.`)
                        .addFields(
                            {
                                name: `${e.Gear} Comando`,
                                value: `\`${prefix}parça <@user/id>\`\nExemplo: \`${prefix}parça @Saphire\``
                            },
                            {
                                name: '💔 Separação',
                                value: `\`${prefix}parça separar <@user/id>\` *(Necessita de confirmação)* | \`${prefix}parça separar all\``
                            }
                        )
                ]
            })
        }

        async function DeleteParcaPosition() {

            let dbData = await Database.User.findOne({ id: message.author.id }, 'id Perfil.Parcas Perfil.Marry.Conjugate'),
                data = {}

            data.authorParcas = dbData?.Perfil?.Parcas || []

            if (!data.authorParcas.length === 0)
                return message.reply(`${e.Deny} | Você não tem nenhum parça.`)

            if (['all', 'todos'].includes(args[1]?.toLowerCase()))
                return deleteAllParcasPositions()

            let user = client.users.cache.get(args[1]) || message.mentions.users.first() || message.mentions.repliedUser

            if (data.authorParcas.includes(args[1]) && !user) {
                Database.deleteUser(args[1])
                Database.pullUserData(message.author.id, 'Perfil.Parcas', args[1])
                return message.reply(`${e.Check} | Usuário desconhecido. Apaguei os dados remanescente. Padrão restaurado!`)
            }

            if (!user)
                return message.reply(`${e.Info} | Informe um parça seu para você separar.`)

            if (!data.authorParcas.includes(user.id))
                return message.reply(`${e.Deny} | ${user.username} não é seu parça.`)

            const msg = await message.reply(`${e.QuestionMark} | Você confirma a separação de parças entre \`${message.author.tag} & ${user.tag}\`?`)

            msg.react('✅').catch(() => { }) // Check
            msg.react('❌').catch(() => { }) // X

            return msg.awaitReactions({
                filter: (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
                max: 1,
                time: 20000
            }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '✅') {

                    Database.pullUserData(message.author.id, 'Perfil.Parcas', user.id)
                    Database.pullUserData(user.id, 'Perfil.Parcas', message.author.id)

                    return msg.edit(`${e.Check} | Separação concluída! Você não é mais parça de ${user.tag}.\nSeparação pedida em: \`${Data()}\``).catch(() => { })

                }
                return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
            }).catch(() => msg.edit(`${e.Deny} | Comando cancelado por tempo expirado.`).catch(() => { }))

            async function deleteAllParcasPositions() {

                let msg = await message.reply(`${e.Loading} | Você confirma separar de todos os seus ${data.authorParcas.length || 0} parças?`),
                    array = []

                for (let i of ['✅', '❌']) msg.react(i).catch(() => { })

                return msg.awaitReactions({
                    filter: (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
                    max: 1,
                    time: 20000
                }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅')
                        return deleteAll()

                    return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                }).catch(() => msg.edit(`${e.Deny} | Comando cancelado por tempo expirado.`).catch(() => { }))

                function deleteAll() {

                    for (let parcaId of data.authorParcas) {

                        let userSearch = client.users.cache.get(parcaId)
                        array.push(parcaId)

                        userSearch
                            ? Database.pullUserData(parcaId, 'Perfil.Parcas', message.author.id)
                            : Database.deleteUser(parcaId)
                    }

                    Database.delete(message.author.id, 'Perfil.Parcas')
                    return message.reply(`${e.Info} | Separações concluída.\n${array > 0 ? `${array.map(id => `${client.users.cache.get(id) ? `> ${e.Check} \`${client.users.cache.get(id).tag}\`` : `> ${e.Deny} Usuário deletado`}`).join('\n')}` : ''}`)
                }

            }

        }
    }
}