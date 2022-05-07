const { e } = require('../../../JSON/emojis.json')
const Colors = require('../../../modules/functions/plugins/colors')
const Data = require('../../../modules/functions/plugins/data')
const Moeda = require('../../../modules/functions/public/moeda')

module.exports = {
    name: 'casar',
    aliases: ['marry'],
    category: 'perfil',
    ClientPermissions: ['ADD_REACTIONS', 'ADD_REACTIONS'],
    emoji: '💍',
    usage: '<casar> <@user>',
    description: 'Casamentos são importantes. Para alguns',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.mentions.repliedUser
        let color = await Colors(message.author.id)
        let moeda = await Moeda(message)

        if (['status', 'stats', 'stat'].includes(args[0]?.toLowerCase())) return MarryStats()

        if (!user) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor(color)
                    .setTitle('💍 Casamento')
                    .setDescription(`Você pode se casar no Sistema Saphire.`)
                    .addField(`${e.On} Comando`, `\`${prefix}casar @user\``)
            ]
        })

        if (user.id === client.user.id) return message.reply(`${e.SaphireOk} | Eu admiro seu bom gosto, mas eu já sou comprometida.`)
        if (user.bot) return message.reply(`${e.Deny} | Bots são fiéis ao Discord`)

        if (!user) return message.reply(`${e.Info} | @marca, responda a mensagem ou me fala o ID da pessoa que você quer se casar.`)

        let data = await Database.User.find({}, 'id Perfil.Marry Balance'),
            author = data.find(d => d.id === message.author.id),
            authorData = {
                conjugate: author?.Perfil?.Marry?.Conjugate,
                StartAt: author?.Perfil?.Marry?.StartAt,
                Balance: author.Balance || 0
            },
            dataUser = data.find(d => d.id === user.id)

        if (!dataUser) {
            Database.registerUser(user.id)
            return message.reply(`${e.Database} | DATABASE | Usuário não encontrado. Efetuei o registro. Por favor, tente novamente.`)
        }

        let userData = {
            conjugate: dataUser?.Perfil?.Marry?.Conjugate,
            StartAt: dataUser?.Perfil?.Marry?.StartAt,
            Balance: dataUser?.Balance || 0
        }

        if (authorData.conjugate && authorData.conjugate === user.id) return message.reply(`${e.Info} | Vocês já estão casados.`)
        if (authorData.conjugate) return message.reply(`${e.Deny} | Você já está em um relacionamento, o que você quer por aqui?`)

        if (!dataUser) {
            Database.registerUser(client.users.cache.get(user.id))
            return message.reply(`${e.Database} | Eu não encontrei **${user.user.tag} *\`${user.id}\`*** no banco de dados. Acabei de efetuar o registro. Por favor, use o comando novamente.`)
        }

        if (userData.conjugate) return message.reply(`${e.Deny} | ${user} já está em um relacionamento.`)
        if (authorData.Balance < 150000 || userData.Balance < 150000) return message.reply(`${e.Deny} | O casal deve ter pelo menos 150000 ${moeda} para se casar (Sim, os dois 150k dos dois somando 300k). Casamentos são caros...`)
        if (user.id === client.user.id) return message.reply(`${e.Deny} | Já sou casada com o Itachi Uchiha, sai daqui. ${e.Itachi}`)
        if (user.id === message.author.id) return message.reply(`${e.Deny} | Você não pode se casar com você mesmo.`)

        const gif = 'https://imgur.com/Ush7ZDy.gif',
            casar = new MessageEmbed()
                .setColor(color)
                .setTitle('💍 Novo Pedido de Casamento 💍')
                .setDescription(`${message.author.username} está pedindo a mão de ${user.user?.username || user.username} em casamento.\n\n${user}, você aceita se casar com ${message.author}?`)
                .setThumbnail(gif)
                .setFooter({ text: 'Ao aceitar, será descontado 150000 Safiras de cada um.' }),
            msg1 = await message.reply(`${e.QuestionMark} | ${message.author}, ambos irão gastar 150000 ${moeda} para efetuar o casamento, uma vez ciente, clique em prosseguir.`)

        msg1.react('✅').catch(() => { }) // Check
        msg1.react('❌').catch(() => { }) // X

        return msg1.awaitReactions({
            filter: (reaction, User) => ['✅', '❌'].includes(reaction.emoji.name) && User.id === message.author.id,
            max: 1,
            time: 60000,
            errors: ['time']
        }).then(collected => {
            const reaction = collected.first()

            if (reaction.emoji.name === '✅') {
                msg1.delete().catch(() => { })
                return CasarAsk()
            }
            return msg1.edit(`${e.Deny} | Request cancelada.`).catch(() => { })
        }).catch(() => msg1.edit(`${e.Deny} | Request cancelada.`).catch(() => { }))


        function CasarAsk() {
            message.reply({ embeds: [casar] }).then(msg => {
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                msg.awaitReactions({
                    filter: (reaction, u) => ['✅', '❌'].includes(reaction.emoji.name) && u.id === user.id,
                    max: 1,
                    time: 60000,
                    errors: ['time']
                }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {

                        let dateTime = Date.now()

                        Database.updateUserData(message.author.id, 'Perfil.Marry.Conjugate', user.id)
                        Database.updateUserData(user.id, 'Perfil.Marry.Conjugate', message.author.id)
                        Database.updateUserData(message.author.id, 'Perfil.Marry.StartAt', dateTime)
                        Database.updateUserData(user.id, 'Perfil.Marry.StartAt', dateTime)
                        Database.subtract(user.id, 150000)
                        Database.subtract(message.author.id, 150000)

                        return msg.edit({
                            embeds: [
                                new MessageEmbed()
                                    .setColor('GREEN')
                                    .setTitle(`:heart: Um novo casal acaba de se formar :heart:`)
                                    .setDescription(`${user} aceitou o pedido de casamento de ${message.author}`)
                                    .setFooter({ text: '150000 Safiras foram descontadas.' })
                            ]
                        }).catch(() => { })
                    } else {
                        msg.delete().catch(() => { })
                        return message.channel.send(`${e.Deny} | Não foi dessa vez, ${message.author}. ${user} recusou seu pedido de casamento.`)
                    }
                }).catch(() => {
                    msg.delete().catch(() => { })
                    return message.channel.send(`${e.Deny} | Pedido de casamento expirado.`)
                })
            })
        }

        async function MarryStats() {

            let DataAuthor = await Database.User.findOne({ id: message.author.id }, 'Perfil.Marry'),
                data = {
                    conjugate: DataAuthor?.Perfil?.Marry?.Conjugate,
                    StartAt: DataAuthor?.Perfil?.Marry?.StartAt
                }

            if (!data.conjugate) return message.reply(`${e.Deny} | Você não está casado.`)

            let user = client.users.cache.get(data.conjugate)

            if (!user) {
                Database.delete(message.author.id, 'Perfil.Marry')
                Database.deleteUser(data.conjugate)
                return message.reply(`${e.Deny} | O usuário não foi encontrado. O casamento foi desfeito.`)
            }

            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`💍 Status do Casamento`)
                        .addFields(
                            {
                                name: '❤️ Cônjuge',
                                value: `> ${user.tag} | \`${user.id}\``
                            },
                            {
                                name: '📆 Histórico de tempo',
                                value: `> Data: \`${Data(data.StartAt - Date.now())}\`\n> Tempo de casados: \`${client.formatTimestamp(data.StartAt)}\``
                            }
                        )
                ]
            })

        }

    }
}