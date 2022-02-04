const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'servidoresecomum',
    aliases: ['scomum', 'servercomum', 'serveremcomum'],
    category: 'owner',
    emoji: `${e.OwnerCrow}`,
    usage: '<sc> <UserID>',
    description: 'Verifica os servidores em comum com um membro',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user = client.users.cache.get(args[0]) || message.mentions.users.first() || message.mentions.repliedUser,
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
