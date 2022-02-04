const
    { e } = require('../../../database/emojis.json'),
    { config } = require('../../../database/config.json'),
    Vip = require('../../../Routes/functions/vip'),
    Error = require('../../../Routes/functions/errors')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'cargovip',
    aliases: ['viprole'],
    category: 'vip',
    ClientPermissions: ['MANAGE_ROLES'],
    emoji: `${e.VipStar}`,
    usage: '<cargovip>',
    description: 'Receba o cargo vip no servidor central',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (message.guild.id !== config.guildId)
            return message.reply(`${e.Deny} | Este é um comando do meu servidor. Você pode entrar clicando no link:\n${config.ServerLink}`)

        const RoleID = '903099828945428502',
            Role = await message.guild.roles.cache.find(role => role.id === RoleID)

        if (!Vip(message.author.id))
            return message.reply(`${e.Deny} | Você não é vip.`)

        if (message.member.roles.cache.has(RoleID))
            return message.reply(`${e.Info} | Você já possui o cargo vip.`)

        if (!Role)
            return message.reply(`${e.Deny} | Cargo VIP não encontrado.`)

        message.member.roles.add(Role).catch(err => {
            return Error(message, err)
        })

        return message.reply(`${e.Check} | Você recebeu o cargo vip com sucesso!`)

    }
}