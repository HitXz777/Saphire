const Database = require('../../../../modules/classes/Database'),
    { e } = require('../../../../JSON/emojis.json')

class Miku {
    constructor() { }

    async start(value, message, buttons, moeda) {

        let option = ['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)], clicked = false

        let msg = await message.reply({
            content: `${e.eagora} | E agora? Será que você consegue adivinhar qual opção eu escolhi?`,
            embeds: [],
            components: buttons
        })

        return msg.createMessageComponentCollector({
            filter: int => int.user.id === message.author.id,
            time: 60000,
            max: 1,
            errors: ['time', 'max']
        })
            .on('collect', interaction => {
                interaction.deferUpdate().catch(() => { })

                const { customId } = interaction

                clicked = true

                if (customId !== option)
                    return lose()

                return win()
            })
            .on('end', () => {

                Database.Cache.delete(`Miku.${message.author.id}`)

                if (clicked) return
                return msg.edit({
                    content: `${e.Deny} | Aposta com a Miku cancelada.`,
                    embeds: [],
                    components: []
                }).catch(() => { })
            })

        function lose() {

            Database.subtract(message.author.id, value)

            Database.PushTransaction(
                message.author.id,
                `${e.loss} Perdeu ${value} Safiras apostando com a *Miku*`
            )

            return msg.edit({
                content: `${e.MikuLoseBet} | É uma pena, mas você perdeu! A letra que eu pensei era \`${option}\`. Obrigadinha pelo dinheirinho, ganhei mais **${value} ${moeda}**`,
                embeds: [],
                components: []
            }).catch(() => { })
        }

        function win() {

            let prize = parseInt(value / 2).toFixed(0)

            Database.add(message.author.id, prize)

            Database.PushTransaction(
                message.author.id,
                `${e.gain} Ganhou ${prize} Safiras apostando com a *Miku*`
            )

            return msg.edit({
                content: `${e.MikuWinBet} | Booooa! Eu também pensei na letra \`${option}\`! Então, eu vou te dar **${prize} ${moeda}**. Parabéns!`,
                embeds: [],
                components: []
            }).catch(() => { })

        }
    }

    info(message, client, e, prefix) {
        return message.reply({
            embeds: [{
                color: client.blue,
                title: `${e.MikuDefault} Miku Bet`,
                url: 'https://discord.com/oauth2/authorize?client_id=832018411093229659&scope=bot&permissions=8',
                description: `Você é capaz de ganhar da Miku no jogo de adivinha? Boa sorte!`,
                fields: [
                    {
                        name: `${e.Info} Objetivo`,
                        value: 'Você tem que adivinhar qual é a letra que a Miku escolheu. Se você acertar, ela vai te pagar metade do valor que você apostou.'
                    },
                    {
                        name: `${e.eagora} Inicie uma aposta com a Miku`,
                        value: `\`${prefix}miku <quantia>\``
                    }
                ]
            }]
        })
    }
}

module.exports = Miku