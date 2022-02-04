const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'sync',
    aliases: ['sincronizar', 'sinc'],
    category: 'moderation',
    UserPermissions: ['MANAGE_CHANNELS'],
    ClientPermissions: ['MANAGE_CHANNELS'],
    emoji: `${e.ModShield}`,
    usage: '<sync> [#channel]',
    description: 'Sincronize o canal com a categoria',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let channel = message.mentions.channels.first() || message.channel
        if (args[1]) return message.reply(`${e.Deny} | Não diga nada além do canal. Mencione o #canal ou digite \`${prefix}sync\` no canal no qual deseja sincronizar com sua categoria.`)

        if (!channel.parent) return message.reply(`${e.Deny} | Este canal não está em nenhuma categoria.`)
        if (channel.permissionsLocked === true) return message.reply(`${e.Check} | Este canal já está sincronizado.`)

        channel.lockPermissions().then(() => {
            return message.reply(`${e.Check} | Prontinho, o canal ${channel} foi sincronizado com as permissões da categoria **${channel.parent.name.toUpperCase()}**`)
        }).catch(err => {
            return message.reply(`${e.Warn} | Ocorreu um erro na execução da sincronização.\n\`${err}\``)
        })
    }
}