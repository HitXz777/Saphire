const { e } = require('../../../database/emojis.json')
const { config } = require('../../../database/config.json')

module.exports = {
    name: 'novidades',
    aliases: ['news'],
    category: 'bot',
    ClientPermissions: ['MANAGE_ROLES'],
    emoji: `${e.Notification}`,
    usage: '<news>',
    description: 'Pegue o cargo de novidades no meu servidor',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (message.guild.id !== config.guildId)
            return message.reply(`${e.Deny} | Este é um comando privado do meu servidor. Se você quiser entrar, só clicar no link. Será muito bem-vindo*(a)*\n \nhttps://discord.gg/3g8Sa4dUc9`)

        let RoleId = '914925531529609247',
            Role = message.guild.roles.cache.get(RoleId)

        return message.guild.roles.cache.has(RoleId)
            ? (() => {

                return message.member.roles.cache.has(RoleId) ? RemoveRole() : AddRole()

            })()
            : (() => {
                return message.reply(`${e.Info} | O cargo de avisos e novidades não foi encontrado.`)
            })()

        function RemoveRole() {
            message.member.roles.remove(Role, 'Solicitado pelo autor da mensagem').catch((err) => { return message.reply(`${e.Warn} | \`${err}\``) })
            return message.reply(`${e.Check} | Cargo removido com sucesso!`)
        }

        function AddRole() {
            message.member.roles.add(Role, 'Solicitado pelo autor da mensagem').catch((err) => { return message.reply(`${e.Warn} | \`${err}\``) })
            return message.reply(`${e.Check} | Cargo adicionado com sucesso! Agora você ficará por dentro de todas as novidades sobre mim e do servidor.`)
        }

    }
}