const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'nsfw',
    aliases: ['+18', 'setchannelnsfw', 'canalnsfw'],
    category: 'moderation',
    UserPermissions: ['MANAGE_CHANNELS'],
    ClientPermissions: ['MANAGE_CHANNELS'],
    emoji: `${e.ModShield}`,
    usage: '<nsfw>',
    description: 'Configure um canal para maiores ou menores de idade',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let channel = message.mentions.channels.first() || message.channel

        if (channel.nsfw === false) {
            channel.setNSFW(true).then(() => {
                return message.reply(`${e.Nagatoro} | Prontinho, agora este é um canal de conteúdo duvidoso.\n||*(Não tenho nada haver com isso)*||`)
            }).catch(err => {
                return message.reply(`${e.Warn} | Ocorreu um erro ao executar este comando.\n\`${err}\``)
            })
        }

        if (channel.nsfw === true) {
            channel.setNSFW(false).then(() => {
                return message.reply(`${e.Check} | Prontinho, agora este é um canal livre para todas as idades.`)
            }).catch(err => {
                return message.reply(`${e.Warn} | Ocorreu um erro ao executar este comando.\n\`${err}\``)
            })
        }
    }
}
