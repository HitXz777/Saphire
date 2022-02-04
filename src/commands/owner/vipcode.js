const { DatabaseObj } = require('../../../Routes/functions/database')
const { e } = DatabaseObj
const PassCode = require('../../../Routes/functions/PassCode')
const ms = require('ms')
const parsems = require('parse-ms')
const Error = require('../../../Routes/functions/errors')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'vipcode',
    category: 'owner',
    emoji: `${e.VipStar}`,
    usage: '<vipcode> <new/del> [code] | <vipcode> <all>',
    description: 'Criação e exclusão de códigos de resgate vip.',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (['new', 'novo', 'create', 'criar'].includes(args[0]?.toLowerCase())) return NewVipCode()
        if (['del', 'delete', 'excluir', 'apagar'].includes(args[0]?.toLowerCase())) return DelVipCode()
        return ShowVipCodes()

        function NewVipCode() {

            if (!args[1])
                return message.reply(`${e.Info} | Comando para criar um código VIP: \`${prefix}vipcode new Tempo(10d, 20m)\``)

            let CodeA = PassCode(5)?.toUpperCase()
            let CodeB = PassCode(5)?.toUpperCase()
            let Code = `${CodeA}-${CodeB}`

            if (!['s', 'm', 'h', 'd', 'y'].includes(args[1].slice(-1)))
                return message.reply(`${e.Deny} | Tempo inválido!`)

            let Time = ms(args[1]),
                parse = parsems(Time)
            sdb.set(`Client.VipCodes.${Code}`, Time)

            return message.reply(`⏱${e.Check} | Código VIP criado com sucesso!\nCódigo de Resgate: \`${Code}\`\nTempo do Vip: \`${parse.days} Dias, ${parse.hours} Horas, ${parse.minutes} Minutos, ${parse.seconds} Segundos e ${parse.milliseconds} Milisegundos.\`\nComando de Resgate: \`${prefix}resgatar ${Code}\``)

        }

        function DelVipCode() {

            if (['all', 'tudo', 'todos'].includes(args[1]?.toLowerCase())) {

                if (!sdb.get('Client.VipCodes'))
                    return message.reply(`${e.Info} | Nenhum código ativo.`)

                sdb.delete('Client.VipCodes')
                return message.reply(`${e.Check} | Feito.`)

            }

            let Code = args[1]

            if (!Code)
                return message.reply(`${e.Info} | Comando: \`${prefix}vipcode del XXXX-XXXX\``)

            if (!sdb.get(`Client.VipCodes.${Code}`))
                return message.reply(`${e.Deny} | Este código não existe.`)

            sdb.delete(`Client.VipCodes.${Code}`)
            return message.reply(`${e.Check} | Código deletado com sucesso!`)
        }

        function ShowVipCodes() {

            let CodesData = sdb.get('Client.VipCodes') || []

            let keys

            try {

                keys = Object.keys(CodesData)
                if (keys.length <= 0)
                    return message.reply(`${e.Info} | Nenhum código vip disponível.`)

                let FormatKeys = keys.map(key => `> ${key} - \`${parsems(sdb.get(`Client.VipCodes.${key}`)).days}d, ${parsems(sdb.get(`Client.VipCodes.${key}`)).hours}h, ${parsems(sdb.get(`Client.VipCodes.${key}`)).minutes}m e ${parsems(sdb.get(`Client.VipCodes.${key}`)).seconds}s\``).join('\n') || 'Nenhum código disponível'

                return message.reply(
                    {
                        embeds:
                            [
                                new MessageEmbed()
                                    .setColor('#246FE0')
                                    .setTitle(`${e.VipStar} Códigos Vip`)
                                    .setDescription(`${FormatKeys}`)
                                    .setFooter(`${prefix}vipcode new/del`)
                            ]
                    }
                )

            } catch (err) {
                Error(message, err)
            }

        }

    }
}