const { e } = require('../../../JSON/emojis.json')
const Data = require('../../../modules/functions/plugins/data')

module.exports = {
    name: 'divorcio',
    aliases: ['divórcio', 'divorce', 'divorciar'],
    category: 'perfil',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '💔',
    usage: '<divorce>',
    description: 'Divorcie do seu casamento',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let author = await Database.User.findOne({ id: message.author.id }, 'id Perfil.Marry')
        authorData = {
            conjugate: author?.Perfil?.Marry?.Conjugate,
            StartAt: author?.Perfil?.Marry?.StartAt
        }

        if (!authorData?.conjugate) return message.reply(`${e.Deny} | Você não está em um relacionamento.`)

        let user = client.users.cache.get(authorData?.conjugate)

        if (!user) {
            Database.delete(message.author.id, 'Perfil.Marry')
            Database.deleteUser(authorData?.conjugate)
            return message.reply(`${e.Deny} | Eu não achei o seu parceiro/a. Removi ele/a do meu banco de dados e retirei seu casamento.`)
        }

        const msg = await message.reply(`${e.QuestionMark} | Você deseja colocar um fim no seu casamento com ${user.tag}?`)

        msg.react('✅').catch(() => { }) // Check
        msg.react('❌').catch(() => { }) // X

        msg.awaitReactions({
            filter: (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
            max: 1,
            time: 15000,
            errors: ['time']
        }).then(collected => {
            const reaction = collected.first()

            if (reaction.emoji.name === '✅') {
                Database.delete(message.author.id, 'Perfil.Marry')
                Database.delete(user.id, 'Perfil.Marry')

                msg.edit(`${e.Check} | Divórcio concluído! Você não está mais se relacionando com ${user.tag}.\nDivórcio pedido em: \`${Data()}\``).catch(() => { })

                return user.send(`${e.Info} | ${message.author.tag} \`${message.author.id}\` pôs um fim no casamento.\n> Divórcio pedido em: \`${Data()}\`\n> Tempo de casados: \`${client.GetTimeout(Date.now() - authorData.StartAt, 0, false)}\``).catch(() => { })

            }

            return msg.edit(`${e.Deny} | Comando cancelado.`)

        }).catch(() => msg.edit(`${e.Deny} | Comando cancelado por tempo expirado.`).catch(() => { }))

    }
}