const { Permissions } = require('discord.js')
const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'unhide',
    aliases: ['desconder', 'mostrar'],
    category: 'moderation',
    UserPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
    ClientPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
    emoji: '🔓',
    usage: 'unhide <#channel>/<user>',
    description: 'Libere o chat para que todos vejam.',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let channel = message.mentions.channels.first() || message.channel
        let user = message.mentions.members.first() || message.mentions.roles.first() || message.mentions.repliedUser || message.guild.members.cache.get(args[0])

        if (args[1]) { return message.reply(`${e.Deny} | Por favor, mencione apenas o canal/user que deseja esconder.`) }

        if (channel && !user) {
            channel.permissionOverwrites.create(channel.guild.roles.everyone, { VIEW_CHANNEL: true })
            return message.channel.send(`🔓 | ${message.author} deixou o canal ${channel} visivel!`)
        }

        if (user) {
            if (user.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                return message.reply(`${e.SaphireQ} | Um administrador pode ver este canal mesmo bloqueado, sabia? Mas vou liberar mesmo assim.`).then(() => {

                        setTimeout(() => {
                            channel.permissionOverwrites.create(user, { VIEW_CHANNEL: true }).then(() => {
                                message.channel.send(`🔓 | ${message.author} liberou ${user}(adm kkk) para falar neste canal.`)
                            }).catch(err => { return message.reply(`${e.Warn} | Houve um erro nesse comando. Use \`${prefix}bug\` e reporte ao meu criador.\n\`${err}\``) })
                        }, 2000)
                })
            } else {
                channel.permissionOverwrites.create(user, { VIEW_CHANNEL: true })
                return message.reply(`${e.Check} | ${message.author} deixou o canal visivel para ${user}.`)
            }
        } else if (message.mentions.members.first()) {
            return message.channel.send(`${e.Info} | ${message.author}, para tornar o canal visivel para alguém, é necessário que você entre nas configurações do canal ou marque a pessoa em forma de resposta a sua mensagem.`)
        } else {
            return message.reply(`${e.Info} | Copia e cola, assim é mais rápido -> \`${prefix}unhide\``)
        }
    }
}