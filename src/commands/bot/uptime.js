const moment = require('moment')

module.exports = {
    name: 'uptime',
    aliases: ['tempoonline'],
    category: 'bot',
    emoji: '⏱️',
    usage: '<uptime>',
    description: 'Tempo que eu estou online',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        const d = moment.duration(message.client.uptime)
        const days = (d.days() == 1) ? `${d.days()}` : `${d.days()}`
        const hours = (d.hours() == 1) ? `${d.hours()}` : `${d.hours()}`
        const minutes = (d.minutes() == 1) ? `${d.minutes()}` : `${d.minutes()}`
        const seconds = (d.seconds() == 1) ? `${d.seconds()}` : `${d.seconds()}`

        return message.reply(`⏱️ | Eu estou acordada a ${days} dias, ${hours} horas e ${minutes} minutos e ${seconds} segundos`)
    }
}