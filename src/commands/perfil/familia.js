const { e } = require('../../../JSON/emojis.json')
const Colors = require('../../../modules/functions/plugins/colors')
const Data = require('../../../modules/functions/plugins/data')

module.exports = {
    name: 'familia',
    aliases: ['family', 'família'],
    category: 'perfil',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '👩‍👩‍👧‍👧',
    usage: '<family> <1/2/3> <@user/id>',
    description: 'Entre pra uma família',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = client.getUser(client, message, args, 'member') || message.guild.members.cache.get(args[0]),
            color = await Colors(message.author.id),
            Embed = new MessageEmbed().setColor(color),
            data = {}

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return SendInfo()
        if (['separar', 'delete', 'deletar', 'excluir', 'remover', 'remove'].includes(args[0]?.toLowerCase())) return DeleteFamilyMember()

        if (!user)
            return message.reply(`${e.Deny} | Você tem que dizer quem você quer como familiar. Se tiver dúvidas, use \`${prefix}family info\``)

        if (user.user.bot) return message.reply(`${e.Deny} | Sorry... Nada de bots.`)

        let dbData = await Database.User.find({}, 'id Perfil.Family Perfil.Marry.Conjugate')
        authorData = dbData?.find(data => data.id === message.author.id)
        userData = dbData?.find(data => data.id === user.user.id)

        if (!userData) {
            Database.registerUser(user.user)
            return message.reply(`${e.Database} | DATABASE | Eu não achei nada no meu banco de dados referente a **${user.user.tag} *\`${user.user.id}\`***. Eu acabei de efetuar o registro, por favor, use o comando novamente.`)
        }

        data.authorFamily = authorData?.Perfil?.Family || []
        data.authorConjugate = authorData?.Perfil?.Marry?.Conjugate
        data.userFamily = userData?.Perfil?.Family || []

        if (data.authorFamily.includes(user.id) || data.userFamily.includes(message.author.id))
            return message.reply(`${e.Deny} | Vocês já são familiares.`)

        if (data.authorFamily?.length >= 7)
            return message.reply(`${e.Deny} | Você já atingiu o limite de familiares.`)

        if (data.userFamily?.length >= 7)
            return message.reply(`${e.Deny} | ${user.user.username} já atingiu o limite de familiares.`)

        return checkFamily()

        function checkFamily() {

            if (user.id === message.author.id) return message.reply(`${e.Deny} | Você não pode ser familiar de você mesmo.`)
            if (user.id === client.user.id) return message.reply(`${e.Deny} | Sorry... Já tenho minha família.`)
            if (data.authorConjugate && data.authorConjugate === user.id)
                return message.reply(`${e.Info} | ${user.user.username} é seu cônjuge.`)

            if (data.authorFamily.includes(user.id))
                return message.reply(`${e.Info} | Você já é familiar de ${user.user.username}`)

            NewSet()

        }

        async function NewSet() {

            const msg = await message.reply(`${e.QuestionMark} | ${user}, você está sendo convidado*(a)* para ser familiar de ${message.author}, você aceita?`)

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

                    Database.pushUserData(message.author.id, 'Perfil.Family', user.id)
                    Database.pushUserData(user.id, 'Perfil.Family', message.author.id)

                    return msg.edit(`${e.Check} | ${user} ❤️ ${message.author} agora são familiares!`).catch(() => { })

                }
                return msg.edit(`${e.Deny} | Pedido recusado.`).catch(() => { })
            }).catch(() => msg.edit(`${e.Deny} | Pedido recusado por tempo expirado.`).catch(() => { }))

        }

        async function DeleteFamilyMember() {

            let dbData = await Database.User.findOne({ id: message.author.id }, 'id Perfil.Family Perfil.Marry.Conjugate'),
                data = {}

            data.authorFamily = dbData?.Perfil?.Family || []

            if (!data.authorFamily.length === 0)
                return message.reply(`${e.Deny} | Você não tem nenhum familiar.`)

            let user = client.users.cache.get(args[1]) || message.mentions.users.first() || message.mentions.repliedUser

            if (data.authorFamily.includes(args[1]) && !user) {
                Database.deleteUser(args[1])
                Database.pullUserData(message.author.id, 'Perfil.Family', args[1])
                return message.reply(`${e.Check} | Usuário desconhecido. Apaguei os dados remanescente. Padrão restaurado!`)
            }

            if (!user)
                return message.reply(`${e.Info} | Informe um familiar seu que você deseja se separar.`)

            if (!data.authorFamily.includes(user.id))
                return message.reply(`${e.Deny} | ${user.username} não é seu familiar.`)

            const msg = await message.reply(`${e.QuestionMark} | Você confirma a separação de família entre \`${message.author.tag} & ${user.tag}\`?`)

            msg.react('✅').catch(() => { }) // Check
            msg.react('❌').catch(() => { }) // X

            return msg.awaitReactions({
                filter: (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
                max: 1,
                time: 20000
            }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '✅') {

                    Database.pullUserData(message.author.id, 'Perfil.Family', user.id)
                    Database.pullUserData(user.id, 'Perfil.Family', message.author.id)

                    return msg.edit(`${e.Check} | Separação concluída! Você não é mais familiar de ${user.tag}.\nSeparação pedida em: \`${Data()}\``).catch(() => { })

                }
                return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
            }).catch(() => msg.edit(`${e.Deny} | Comando cancelado por tempo expirado.`).catch(() => { }))

        }

        function SendInfo() {
            return message.reply({
                embeds: [
                    Embed.setTitle(`💞 ${client.user.username} Family System`)
                        .setDescription(`Você pode escolher até 7 membros para a sua família! Eles ficaram visíveis no seu perfil e seu nome no perfil deles.`)
                        .addFields(
                            {
                                name: `${e.Gear} Comando`,
                                value: `\`${prefix}familia  <@user/id>\`\nExemplo: \`${prefix}familia @Saphire\``
                            },
                            {
                                name: '💔 Separação',
                                value: `\`${prefix}familia <separar> <@user/id>\` *(Necessita de confirmação)*`
                            }
                        )
                ]
            })
        }
    }
}


