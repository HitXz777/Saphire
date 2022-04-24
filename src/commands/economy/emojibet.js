const Moeda = require("../../../modules/functions/public/moeda")

module.exports = {
    name: 'emojibet',
    aliases: ['betemoji', 'emojisbet', 'betemojis'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '💸',
    usage: 'emojibet <Valor>',
    description: 'Aposte com emojis',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let emojis = ['💸', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🙈', '🐵', '🐸', '🐨', '🐒', '🦁', '🐯', '🐮', '🐔', '🐧', '🐦', '🐤', '🦄', '🐴', '🐗', '🐺', '🦇', '🦉', '🦅', '🦤', '🦆', '🐛', '🦋', '🐌', '🐝', '🪳', '🪲', '🦗', '🦂', '🐢'],
            e = Database.Emojis

        if (!args[0] || ['help', 'ajuda', 'info'].includes(args[0]?.toLowerCase()))
            return message.reply(
                {
                    embeds: [
                        new MessageEmbed()
                            .setColor(client.blue)
                            .setTitle(`${emojis[Math.floor(Math.random() * emojis.length)]} Emoji Bet`)
                            .setDescription(`Aposte em um game diferenciado usando emojis! Você tem 3 emojis no qual deve escolher o emoji premiado.`)
                            .addFields(
                                {
                                    name: '💸 Inicie uma aposta',
                                    value: `\`${prefix}emojibet <quantia>\``
                                },
                                {
                                    name: `${e.Check} Escolha certa`,
                                    value: 'Você pode ganhar até 20% do valor apostado.'
                                },
                                {
                                    name: `${e.Deny} Escolha errada`,
                                    value: 'Você pega de volta 50% do valor apostado.'
                                }
                            )
                            .setFooter('Comando baseado na bot Loritta.')
                    ]
                }
            )

        let quantia = parseInt(args[0].replace(/k/g, '000'))?.toFixed(0)
        if (!quantia || quantia <= 0 || isNaN(quantia)) return message.reply(`${e.Deny} | Diga uma quantia válida para inicar um emojibet.`)

        let data = await Database.User.findOne({ id: message.author.id }, 'Balance'),
            money = data?.Balance || 0,
            moeda = await Moeda(message)

        if (money < quantia) return message.reply(`${e.Deny} | Você não possui a quantia dita. Você possui **${money} ${moeda}**`)

        Database.subtract(message.author.id, quantia)
        let emojisToBet = getEmojis(),
            emojiChoosen = emojisToBet[Math.floor(Math.random() * emojisToBet.length)],
            collected = false

        let msg = await message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor(client.blue)
                    .setTitle(`${emojis[Math.floor(Math.random() * emojis.length)]} Escolha um emoji e boa sorte!`)
                    .setDescription(`Valor apostado: ${quantia} ${moeda}\nEmojis da Rodada: ${emojisToBet.join(', ')}`)
            ]
        })

        for (let i of emojisToBet) msg.react(i).catch(() => { })

        return msg.createReactionCollector({
            filter: (reaction, user) => emojisToBet.includes(reaction.emoji.name) && user.id === message.author.id,
            time: 20000,
            max: 1,
            errors: ['max', 'time']
        })
            .on('collect', (reaction) => {

                collected = true

                if (reaction.emoji.name === emojiChoosen)
                    return win()

                return lose()

            })
            .on('end', () => {
                if (collected) return msg.delete().catch(() => { })
                Database.add(message.author.id, quantia)
            })

        function win() {

            let percent20 = parseInt(Math.random() * (quantia * 0.2))
            if (percent20 <= 0) percent20 = 1

            Database.add(message.author.id, percent20)
            Database.PushTransaction(message.author.id, `${e.gain} Ganhou ${percent20} Safiras jogando no emojibet.`)
            return message.reply(`${emojiChoosen} | Você escolheu o emoji certo e ganhou ${percent20} ${moeda}!`)
        }

        function lose() {
            let value = parseInt(quantia / 2)?.toFixed(0)

            Database.add(message.author.id, value)
            Database.PushTransaction(message.author.id, `${e.loss} Perdeu ${value} Safiras jogando no emojibet.`)
            return message.reply(`${emojiChoosen} | Você escolheu o emoji errado. Recebeu metade do valor aposta. (${value} ${moeda})`)
        }

        function getEmojis() {

            let emojisArray = []

            for (let i = 0; i < 4; i++) {

                let emoji = emojis[Math.floor(Math.random() * emojis.length)]

                if (emojisArray.includes(emoji)) {
                    i--
                    continue
                }

                emojisArray.push(emoji)
            }

            return emojisArray
        }
    }
}