const
    { e } = require('../../../JSON/emojis.json'),
    { config } = require('../../../JSON/config.json'),
    Vip = require('../../../modules/functions/public/vip'),
    Error = require('../../../modules/functions/config/errors')

module.exports = {
    name: 'cargovip',
    aliases: ['viprole'],
    category: 'vip',
    ClientPermissions: ['MANAGE_ROLES'],
    emoji: `${e.VipStar}`,
    usage: '<cargovip>',
    description: 'Receba o cargo vip no servidor central',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (message.guild.id !== config.guildId)
            return message.reply(`${e.Deny} | Este é um comando do meu servidor. Você pode entrar clicando no link:\n${config.ServerLink}`)

        const Role = await message.guild.roles.cache.find(role => role.id === '903099828945428502'),
            vip = await Vip(message.author.id)

        if (!vip)
            return message.reply(`${e.Deny} | Você não é vip.`)

        if (message.member.roles.cache.has('903099828945428502'))
            return message.reply(`${e.Info} | Você já possui o cargo vip.`)

        if (!Role)
            return message.reply(`${e.Deny} | Cargo VIP não encontrado.`)

        message.member.roles.add(Role).catch(err => {
            return Error(message, err)
        })

        return message.reply(`${e.Check} | Você recebeu o cargo vip com sucesso!`)

    }
}