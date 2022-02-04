const { e } = require('../../../database/emojis.json')
const ms = require('ms')
const parsems = require('parse-ms')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'time',
    aliases: ['tempo'],
    category: 'util',
    emoji: '⏱️',
    usage: '<time> <TempoEmNumero>',
    description: 'Conversão de tempo para milisegundo',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let time = args[0]

        if (!time)
            return message.reply(`${e.Info} | Forneça uma tempo no formato \`s/m/h/d/y\``)

        if (args[1])
            return message.reply(`${e.Deny} | Forneça uma tempo no formato \`s/m/h/d/y\``)

        if (!['s', 'm', 'h', 'd', 'y'].includes(time.slice(-1)))
            return message.reply(`${e.Deny} | Tempo inválido!`)

        try {
            let TimeConvert = ms(time)
            let parse = parsems(TimeConvert)

            if (!TimeConvert)
                return message.reply(`${e.Deny} | Tempo inválido!`)

            return message.reply(`⏱️ | \`${TimeConvert}\` -> \`${parse.days} Dias, ${parse.hours} Horas, ${parse.minutes} Minutos, ${parse.seconds} Segundos e ${parse.milliseconds} Milisegundos.\``)
        } catch (err) {
            return message.channel.send(`${e.Warn} | Houve um erro na conversão do horário.\n\`${err}\``)
        }

    }
}
