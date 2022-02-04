const { e } = require('../../../database/emojis.json')
const discloud = require("discloud-status")
const Error = require('../../../Routes/functions/errors')

module.exports = {
    name: 'stats',
    aliases: ['s'],
    category: 'bot',
    emoji: '🏓',
    description: 'Stats Bot',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {
        await message.reply(`${e.Loading} Stating...`).then(msg => {
            msg.edit(`⏱️ Client: ${client.ws.ping}ms | Server: ${Math.floor(msg.createdAt - message.createdAt)}ms\n${e.Ram} Ram: ${discloud.ram()}`).catch(() => { })
        }).catch(err => {
            Error(message, err)
            return message.channel.send(`${e.Deny} | Ocorreu um erro no comando ping:\n\`${err}\``)
        })
    }
}