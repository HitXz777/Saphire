const { e } = require('../../../database/emojis.json')
const Error = require('../../../Routes/functions/errors')

module.exports = {
    name: 'ping',
    aliases: ['ws', 'ms', 'latency'],
    category: 'bot',
    emoji: '🏓',
    description: 'Ping/Latency do bot',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {
        await message.reply(`${e.Loading} Pinging...`).then(msg => {
            msg.edit(`⏱️ Latency Client: ${client.ws.ping}ms | Latency Server: ${Math.floor(msg.createdAt - message.createdAt)}ms`).catch(() => { })
        }).catch(err => {
            Error(message, err)
            return message.channel.send(`${e.Deny} | Ocorreu um erro no comando ping:\n\`${err}\``)
        })
    }
}