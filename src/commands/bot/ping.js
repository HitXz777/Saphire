const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'ping',
    aliases: ['ws', 'ms', 'latency'],
    category: 'bot',
    cooldown: 5000,
    emoji: '🏓',
    description: 'Ping/Latency do bot',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let msg = await message.reply(`${e.Loading} Pinging...`)
        return msg.edit(`⏱️ Latency Client: ${Math.floor(msg.createdAt - message.createdAt)}ms | Latency Server: ${client.ws.ping}ms`).catch(() => { })

    }
}
