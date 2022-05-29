const { e } = require('../../../JSON/emojis.json'),
    MikuClass = require('./classes/miku'),
    Moeda = require('../../../modules/functions/public/moeda')

module.exports = {
    name: 'miku',
    category: 'economy',
    emoji: e.miku || '❌',
    cooldown: 4000,
    usage: '<miku> <info>',
    description: 'Aposta e tente a sorte com a Miku.',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let Miku = new MikuClass(client, message, args, prefix, MessageEmbed, Database),
            moeda = await Moeda(message)

        if (!args[0] || ['info', 'ajuda', 'help'].includes(args[0]?.toLowerCase())) return Miku.info(message, client, e, prefix)

        if (Database.Cache.get(`Miku.${message.author.id}`))
            return message.reply(`${e.Deny} | Calminha, calminha! Você já tem uma aposta aberta com a Miku. Vamos uma de cada vez, ok?`)

        let buttons = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'A',
                        custom_id: 'A',
                        style: 'PRIMARY'
                    },
                    {
                        type: 2,
                        label: 'B',
                        custom_id: 'B',
                        style: 'PRIMARY'
                    },
                    {
                        type: 2,
                        label: 'C',
                        custom_id: 'C',
                        style: 'PRIMARY'
                    },
                    {
                        type: 2,
                        label: 'D',
                        custom_id: 'D',
                        style: 'PRIMARY'
                    },
                    {
                        type: 2,
                        label: 'E',
                        custom_id: 'E',
                        style: 'PRIMARY'
                    }
                ]
            }
        ]

        let data = await Database.User.findOne({ id: message.author.id }, 'Balance')

        if (!data)
            return message.reply(`${e.Deny} | Eu não consegui achar nenhum dado seu no banco de dados. Por favor, tente novamente.`)

        let money = data?.Balance || 0

        if (!money || money <= 0)
            return message.reply(`${e.Deny} | Você não tem nada para apostar com a Miku.`)

        let arg = args[0].toLowerCase()

        let value = parseInt(arg.replace(/k/g, '000'))

        if (['all', 'tudo'].includes(arg)) value = money
        if (['half', 'metade'].includes(arg)) value = parseInt(money / 2)

        value = parseInt(value?.toFixed(0))

        if (value <= 0)
            return message.reply(`${e.Deny} | Você não acha que para uma aposta o valor deve ser maior ou igual a 1?`)

        if (value > money)
            return message.reply(`${e.Deny} | Você não possui todo esse dinheiro.`)

        Database.Cache.set(`Miku.${message.author.id}`, true)

        let msg = await message.reply(`${e.QuestionMark} | Você tem certeza que quer apostar **${value} ${moeda}** com a Miku?`)
        let emojis = ['✅', '❌'], collected = false

        for (let i of emojis) msg.react(i).catch(() => { })

        return msg.createReactionCollector({
            filter: (r, u) => emojis.includes(r.emoji.name) && u.id === message.author.id,
            max: 1,
            time: 30000,
            errros: ['max', 'time']
        })
            .on('collect', async (reaction) => {

                const { emoji } = reaction

                if (emoji.name === emojis[0]) {
                    collected = true
                    return await Miku.start(value, message, buttons, moeda)
                }

                return
            })
            .on('end', () => {

                if (collected)
                    return msg.delete().catch(() => { })

                Database.Cache.delete(`Miku.${message.author.id}`)
                return msg.edit(`${e.Deny} | Aposta com a Miku cancelada.`)
            })




    }
}