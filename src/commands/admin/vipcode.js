const { DatabaseObj: { e } } = require('../../../modules/functions/plugins/database')
const PassCode = require('../../../modules/functions/plugins/PassCode')
const ms = require('ms')
const parsems = require('parse-ms')

module.exports = {
    name: 'vipcode',
    admin: true,
    category: 'owner',
    emoji: e.Admin,
    usage: '<vipcode> <new/del> [code] | <vipcode> <all>',
    description: 'Criação e exclusão de códigos de resgate vip.',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (['new', 'novo', 'create', 'criar'].includes(args[0]?.toLowerCase())) return NewVipCode()
        if (['del', 'delete', 'excluir', 'apagar'].includes(args[0]?.toLowerCase())) return DelVipCode()
        return ShowVipCodes()

        async function NewVipCode() {

            if (!args[1])
                return message.reply(`${e.Info} | Comando para criar um código VIP: \`${prefix}vipcode new Tempo(10d, 20m)\``)

            let Code = PassCode(7)?.toUpperCase(), Time, parse

            if (['permanent', 'permanente'].includes(args[1]?.toLowerCase())) {

                await Database.Client.updateOne(
                    { id: client.user.id },
                    { $push: { VipCodes: { $each: [{ code: Code, time: 1 }], $position: 0 } } },
                )

                return message.reply(`${e.Check} | Código VIP Permanente criado com sucesso!\nComando de Resgate: \`${prefix}resgatar ${Code}\``)

            }

            if (!['s', 'm', 'h', 'd', 'y'].includes(args[1].slice(-1)))
                return message.reply(`${e.Deny} | Tempo inválido!`)

            try {
                Time = ms(args[1])
                parse = parsems(Time)
            } catch (err) { return message.channel.send(`${e.Deny} | Verifica se o tempo está correto!`) }

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { VipCodes: { $each: [{ code: Code, time: Time }], $position: 0 } } }
            )

            return message.reply(`${e.Check} | Código VIP criado com sucesso!\nCódigo de Resgate: \`${Code}\`\nTempo do Vip: \`${parse.days} Dias, ${parse.hours} Horas, ${parse.minutes} Minutos, ${parse.seconds} Segundos e ${parse.milliseconds} Milisegundos.\`\nComando de Resgate: \`${prefix}resgatar ${Code}\``)

        }

        async function DelVipCode() {

            let clientData = await Database.Client.findOne({ id: client.user.id }),
                codes = clientData?.VipCodes || [],
                Code = args[1]

            if (!codes || codes.length === 0)
                return message.reply(`${e.Info} | Nenhum código ativo.`)

            if (['all', 'tudo', 'todos'].includes(args[1]?.toLowerCase())) {

                await Database.Client.updateOne(
                    { id: client.user.id },
                    { $unset: { VipCodes: 1 } }
                )

                return message.reply(`${e.Check} | Feito.`)

            }

            if (!Code)
                return message.reply(`${e.Info} | Comando: \`${prefix}vipcode del XXXXXXX\``)

            let codeData = codes?.find(dt => dt.code === Code)

            if (!codeData)
                return message.reply(`${e.Deny} | Este código não existe.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { VipCodes: { code: Code } } }
            )

            return message.reply(`${e.Check} | Código deletado com sucesso!`)
        }

        async function ShowVipCodes() {

            let clientData = await Database.Client.findOne({ id: client.user.id }),
                CodesData = clientData?.VipCodes || []

            if (!clientData || !CodesData || CodesData.length === 0) return message.reply(`${e.Info} | Nenhum código vip disponível.`)

            const dataFormat = CodesData?.map(data => `> ${data.code || 'Invalid V-Code'} - \`${formatTime(data.time)}\``).join('\n') || 'Nenhum código disponível'

            function formatTime(num) {
                let ms = parseInt(num) || 0
                if (ms === 0) return 'Invalid'
                if (ms === 1) return 'Permanente'
                return `${parsems(ms).days} dias, ${parsems(ms).hours} horas, ${parsems(ms).minutes} minutos e ${parsems(ms).seconds} segundos`
            }

            return message.reply(
                {
                    embeds:
                        [
                            new MessageEmbed()
                                .setColor('#246FE0')
                                .setTitle(`${e.VipStar} Códigos Vip`)
                                .setDescription(`${dataFormat}`)
                                .setFooter(`${prefix}vipcode new/del <code>`)
                        ]
                }
            )

        }

    }
}