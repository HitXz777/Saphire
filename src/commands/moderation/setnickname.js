const { e } = require('../../../JSON/emojis.json')
const { Permissions } = require('discord.js')

module.exports = {
    name: 'setnickname',
    aliases: ['nickname', 'setnick', 'nick', 'nome'],
    category: 'moderation',
    UserPermissions: ['CHANGE_NICKNAME'],
    ClientPermissions: ['MANAGE_NICKNAMES'],
    emoji: `${e.ModShield}`,
    usage: '<setnickname> <@user>/<NovoNome>',
    description: 'Mude o seu nome ou os dos usuários se tiver cargo',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.members.first() || message.guild.members.cache.get(message.mentions.repliedUser?.id) || message.guild.members.cache.find(data => data.displayName?.toLowerCase() === args[0]?.toLowerCase() || data.user.tag?.toLowerCase() === args[0]?.toLowerCase() || data.user.discriminator === args[0] || data.user.id === args[0])

        if (user) {

            if (user.id === message.guild.ownerId)
                return message.reply(`${e.Deny} | Opa, não posso alterar o nick do grande ser e honrado/a dono/a do servidor.`)

            if (user.id === message.author.id)
                return message.reply(`${e.Deny} | Para mudar seu próprio nome, você não precisa se marcar, sabia? ${e.Nagatoro}`)

            if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_NICKNAMES)) { return message.reply(`${e.Deny} | Permissão Necessária: Gerenciar Nicknames (Nomes/Apelidos)`) }
            if (message.author.id !== message.guild.ownerId) {
                if (user.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return message.reply(`${e.Deny} | Pelo decreto internacional das nações desunidas. Eu, ${client.user.username}, não posso mudar nicknames de administradores.`)
            }
            const member = message.guild.members.cache.get(user.id)

            let nick = args.join(" ")
            if (args[0] && args[0].startsWith('<@') && args[0].endsWith('>')) nick = args.slice(1).join(" ")
            if (nick.length > 32) return message.reply(`${e.Deny} | O nome não pode ultrapassar **32 Caracteres**`)

            return member.setNickname(nick).then(() => {
                return message.reply(`${e.Check} | Feito.`)
            }).catch(err => {
                return message.reply(`${e.Deny} | Eu não posso mudar o nome deste ser poderoso. ||*(Zoeira, só deu algum erro bobo)*||\n\`${err}\``)
            })

        }

        const nick = args.join(" ")
        if (nick.length > 32) return message.reply(`${e.Deny} | O tamanho máximo do nome é de **32 caracteres**.`)

        if (message.author.id === message.guild.ownerId) return message.reply(`${e.Deny} | Não posso alterar o nome do dono do servidor.`)
        const member = message.guild.members.cache.get(message.author.id)

        if (!member.manageable)
            return message.reply(`${e.Deny} | Foi maaal, mas não consigo editar o nickname dessa pessoa ☹`)

        return member.setNickname(nick).then(() => {
            return message.reply(`${e.Check} | Prontinho.`)
        }).catch(err => {
            if (err.code === 10009)
                return message.reply(`${e.Deny} | Eu não tenho permissão suficiente, poxa! Pode ativar a permissão \`GERENCIAR APELIDOS\` não? É rapidinho ${e.SaphireCry}`)

            if (err.code === 50013)
                return message.reply(`${e.SaphireCry} | Eu não tenho poder suficiente... Poxa...`)

            return message.reply(`${e.Deny} | Vish, algo deu errado aqui...\n\`${err}\``)
        })
        
    }
}