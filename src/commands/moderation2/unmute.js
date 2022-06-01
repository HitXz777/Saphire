const
    { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'unmute',
    aliases: ['desmutar'],
    category: 'moderation',
    UserPermissions: ['MODERATE_MEMBERS'],
    ClientPermissions: ['MODERATE_MEMBERS'],
    emoji: `${e.ModShield}`,
    usage: '<unmute> <@user/id>',
    description: 'Desmute membros mutados',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.members.first() || message.guild.members.cache.get(args[0])

        if (!user)
            return message.reply(`${e.Info} | Para desmutar alguém, você pode usar esse comando assim: \`${prefix}unmute @user/Id\``)

        user.timeout(null, `Unmute efetuado por ${message.author.tag}`)
        return message.reply(`${e.Check} | O usuário ${user} foi removido do castigo com sucesso!`)

    }
}