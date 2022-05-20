const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'servidoresecomum',
    aliases: ['scomum', 'servercomum', 'serveremcomum'],
    category: 'admin',
    emoji: `${e.OwnerCrow}`,
    usage: '<sc> <UserID>',
    admin: true,
    description: 'Verifica os servidores em comum com um membro',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = client.users.cache.find(data => data.username?.toLowerCase() === args.join(' ')?.toLowerCase() || data.tag?.toLowerCase() === args[0]?.toLowerCase() || data.discriminator === args[0] || data.id === args[0]) || message.mentions.users.first() || message.mentions.repliedUser,
            Guilds = client.guilds.cache,
            i = 0

        if (!user)
            return message.reply(`${e.Info} | Informe um usuário`)

        const msg = await message.reply(`${e.Loading} | Analisando e buscando usuário em todos os servidores...`)

        Guilds.forEach(server => {
            if (server.members.cache.has(user.id))
                i++
        })

        return msg.edit(`${e.Check} | **${user.tag}** está em **${i}** servidores comigo.`).catch(() => { })

    }
}
