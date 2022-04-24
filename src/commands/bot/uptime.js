const moment = require('moment')

module.exports = {
    name: 'uptime',
    aliases: ['tempoonline'],
    category: 'bot',
    emoji: '⏱️',
    usage: '<uptime>',
    description: 'Tempo que eu estou online',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        const d = moment.duration(message.client.uptime),
            days = (d.days() == 1) ? `${d.days()}` : `${d.days()}`,
            hours = (d.hours() == 1) ? `${d.hours()}` : `${d.hours()}`,
            minutes = (d.minutes() == 1) ? `${d.minutes()}` : `${d.minutes()}`,
            seconds = (d.seconds() == 1) ? `${d.seconds()}` : `${d.seconds()}`

        return message.reply(`⏱️ | Eu estou acordada a ${days} dias, ${hours} horas e ${minutes} minutos e ${seconds} segundos`)
    }
}