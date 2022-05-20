const { e } = require('../../../JSON/emojis.json'),
    ms = require('ms'),
    parsems = require('parse-ms')

module.exports = {
    name: 'time',
    aliases: ['tempo'],
    category: 'util',
    emoji: '⏱️',
    usage: '<time> <TempoEmNumero>',
    description: 'Conversão de tempo para milisegundo',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (!args[0] || args[1])
            return message.reply(`${e.Info} | Forneça uma tempo no formato \`s/m/h/d/y\``)

        if (!['s', 'm', 'h', 'd', 'y'].includes(args[0].slice(-1)))
            return message.reply(`${e.Deny} | Tempo inválido!`)

        try {
            let TimeConvert = ms(args[0]),
                parse = parsems(TimeConvert)

            if (!TimeConvert)
                return message.reply(`${e.Deny} | Tempo inválido!`)

            return message.reply(`⏱️ | \`${TimeConvert}\` -> \`${parse.days} Dias, ${parse.hours} Horas, ${parse.minutes} Minutos, ${parse.seconds} Segundos e ${parse.milliseconds} Milisegundos.\``)
        } catch (err) {
            return message.channel.send(`${e.Warn} | Houve um erro na conversão do tempo.\n\`${err}\``)
        }

    }
}