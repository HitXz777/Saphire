module.exports = {
    name: 'uptime',
    aliases: ['tempoonline'],
    category: 'bot',
    emoji: '⏱️',
    usage: '<uptime>',
    description: 'Tempo que eu estou online',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        return message.reply(`⏱️ | ${client.formatTimestamp(Date.now() - client.uptime)}`)
    }
}