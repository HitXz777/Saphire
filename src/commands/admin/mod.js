const { e } = require('../../../JSON/emojis.json'),
    IsMod = require('../../../modules/functions/plugins/ismod')

module.exports = {
    name: 'mod',
    aliases: ['moderador', 'moderadores'],
    category: 'admin',
    admin: true,
    emoji: e.Admin,
    usage: '<mod> <add/remove> <id/@user>',
    description: 'Adiciona ou remove moderadores da Saphire\'s Team',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = client.users.cache.get(args[1]) || message.mentions.users.first() || message.mentions.repliedUser,
            data = await Database.Client.findOne({ id: client.user.id }, 'Blacklist.Users'),
            blacklist = data?.Blacklist?.Users || []

        if (blacklist.find(d => d.id === user?.id))
            return message.reply(`${e.Deny} | Este usuário precisa ser removido da blackist primeiro. Aqui, para ser mais rápido: \`${prefix}bl remove ${user.id}\``)

        if (['add', 'adicionar', 'set', 'new'].includes(args[0]?.toLowerCase())) return setNewModerator()
        if (['del', 'deletar', 'remove', 'remover', 'tirar', 'r'].includes(args[0]?.toLowerCase())) return removeModerator()
        return message.reply(`${e.Info} | Adicione ou remova moderadores.\n> 1. Adicionar -> \`${prefix}mod add <id/@user>\`\n> 2. Remover -> \`${prefix}mod remove <id/@user>\``)

        async function setNewModerator() {

            if (!user) return message.reply(`${e.Deny} | Você precisa providenciar um usuário para ser promovido a Moderador.`)

            let mod = await IsMod(user.id)

            if (mod)
                return message.reply(`${e.Deny} | Este usuário já é um moderador.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { Moderadores: user.id } }
            )

            user.send(`Parabéns! Você agora é um **${e.ModShield} Official Moderator** do meu sistema.`).catch(err => {
                if (err.code === 50007)
                    return message.channel.send(`${e.Deny} | Não foi possível contactar este usuário.`)

                Error(message, err)
            })
            return message.reply(`${e.Check} | **${user.tag} *\`(${user.id})\`*** foi promovido a moderador com sucesso!`)
        }

        async function removeModerator() {

            if (!user) return message.reply(`${e.Deny} | Você precisa providenciar um usuário para ser removido da lista de moderadores.`)

            let mod = await IsMod(user.id)

            if (!mod)
                return message.reply(`${e.Deny} | Este usuário não é um moderador.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { Moderadores: user.id } }
            )

            user.send(`Retirada de cargo! Você não é mais um **${e.ModShield} Official Moderator** do meu sistema.`).catch(err => {
                if (err.code === 50007)
                    return message.channel.send(`${e.Deny} | Não foi possível contactar este usuário.`)

                Error(message, err)
            })
            return message.reply(`${e.Check} | **${user.tag} *\`(${user.id})\`*** foi removido da lista de moderadores com sucesso!`)
        }
    }
}