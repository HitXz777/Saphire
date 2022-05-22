const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'database',
    aliases: ['db'],
    category: 'owner',
    Owner: true,
    emoji: e.Database,
    usage: 'database',
    description: 'Reconexão com a database',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let data = await Database.Client.findOne({ id: client.user.id })

        if (!data) return message.reply(`${e.Deny} | A database já está conectada.`)

        let msg = await message.reply(`${e.Loading} | Reconectando a database.`)
        await Database.MongoConnect()
        return msg.edit(`${e.Check} | Reconexão com a database concluída.`)

    }
}