const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'roll',
    aliases: ['dado', 'rolls'],
    category: 'util',
    emoji: '🎲',
    usage: '<roll> <número>',
    description: 'Role os dados e tente a sorte',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return RollInfo()
        if (['bet', 'apostar'].includes(args[0]?.toLowerCase())) return newBetRoll()

        if (!args[0]) return GetNewNumber()
        if (args[1]) return message.reply(`${e.Deny} | Só me fala os números, ok? \`${prefix}roll Números\``)

        return isNaN(parseInt(args[0])) ? message.channel.send(`${e.Deny} | **${args[0]}** | Não é um número. \`${prefix}roll info\``) : NewRoll(parseInt(args[0]))

        async function GetNewNumber() {
            const msg = await message.reply(`${e.Loading} | Já que você não disse o número, eu vou esperar você dizer... Eai? Qual é o número do roll?`)

            return message.channel.createMessageCollector({
                filter: m => m.author.id === message.author.id && !isNaN(m.content),
                max: 1,
                time: 30000
            })
                .on('collect', m => NewRoll(parseInt(m.content)))
                .on('end', () => msg.delete().catch(() => { }));
        }

        function NewRoll(value) {
            if (isNaN(value)) return message.reply(`${e.Warn} | Argumento inválido!`)
            let Result = Math.floor(Math.random() * value).toFixed(0)
            return message.reply(`🎲 | **${Result}**`)
        }

        function RollInfo() {
            return message.reply(
                {
                    embeds: [
                        new MessageEmbed()
                            .setColor('#246FE0')
                            .setTitle(`🎲 ${client.user.username} Rolls`)
                            .setDescription(`Role quantos dados quiser! Você fala algúm número e eu rolo os dados. Quer tentar a sorte?`)
                            .addFields(
                                {
                                    name: `${e.SaphireObs} Normal Roll`,
                                    value: `\`${prefix}roll <Número>\``

                                },
                                {
                                    name: `${e.Taxa} Bet Roll`,
                                    value: `\`${prefix}roll bet <1~6> <Quantia>\` - Se acertar o número, você ganha metade do dinheiro apostado.`
                                }
                            )
                    ]
                }
            )
        }

        async function newBetRoll() {

            let amount = parseInt(args[2]?.replace(/k/g, '000'))?.toFixed(0),
                numberChoice = parseInt(args[1]),
                diceNumbers = [1, 2, 3, 4, 5, 6]

            if (!args[1])
                return message.reply(`${e.Info} | Diga um número de 1 a 6. Logo após, diga um a quantia que você quer apostar. \`${prefix}roll bet <1~6> <Quantia>\`\n \n${e.gain} Se você acertar o número do dado, você ganha +50% do dinheiro aposta.\n${e.loss} Se você errar, já era. Adeus dinheirinho...`)

            if (!diceNumbers.includes(numberChoice))
                return message.reply(`${e.Deny} | O número do dado deve estar entre 1 ~ 6. \`${prefix}roll bet <1~6> <Quantia>\``)

            if (!args[2])
                return message.reply(`${e.Deny} | Você precisa dizer um valor para a aposta. \`${prefix}roll bet <1~6> <Quantia>\``)

            if (isNaN(amount))
                return message.reply(`${e.Deny} | O valor aposta não é um número.`)

            if (amount <= 0)
                return message.reply(`${e.Deny} | O valor deve ser maior que 0, concorda?`)

            let balance = await Database.balance(message.author.id)

            if (!balance || balance <= 0)
                return message.reply(`${e.Deny} | Infelizmente você não tenho dinheiro nenhum para jogar o dado.`)

            if (balance < amount)
                return message.reply(`${e.Deny} | Você não possui todo esse dinheiro.`)

            let randomDiceNumber = diceNumbers[Math.floor(Math.random() * diceNumbers.length)],
                half = parseInt(amount / 2)?.toFixed(0)
            if (half <= 0) half = 1

            Database.subtract(message.author.id, amount)

            return randomDiceNumber === numberChoice
                ? win()
                : (() => {
                    Database.PushTransaction(message.author.id, `${e.loss} Perdeu ${amount} Safiras apostando no *roll bet*`)
                    return message.reply(`${e.Deny} | Você perdeu! Não foi dessa vez. O número que você escolheu foi **${numberChoice}** e o número sorteado foi **${randomDiceNumber}**.`)
                })()

            async function win() {

                let prize = amount + half,
                    Moeda = require('../../../modules/functions/public/moeda'),
                    moeda = await Moeda(message)

                Database.add(message.author.id, prize)
                Database.PushTransaction(message.author.id, `${e.gain} Ganhou ${half} Safiras apostando no *roll bet*`)
                return message.reply(`${e.Check} | Você acertou o número sorteado! **${randomDiceNumber}**\n${e.gain} | Você ganhou metade do valor apostado. Você apostou **${amount} ${moeda}** e ganhou mais **${half} ${moeda}**.`)
            }

        }

    }
}