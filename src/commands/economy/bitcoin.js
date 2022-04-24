const { e } = require('../../../JSON/emojis.json'),
    ms = require('parse-ms'),
    Moeda = require('../../../modules/functions/public/moeda')

module.exports = {
    name: 'bitcoin',
    aliases: ['bc', 'bitcoins', 'bit'],
    category: 'economy',
    emoji: `${e.BitCoin}`,
    usage: '<bitcoin> | [bitcoin me] | [bitcoin @user]',
    description: 'Bitcoin é uma moeda rara do meu sistema de economia',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.users.first() || message.mentions.repliedUser || client.users.cache.find(data => data.username?.toLowerCase() === args.join(' ')?.toLowerCase() || data.tag?.toLowerCase() === args[0]?.toLowerCase() || data.discriminator === args[0] || data.id === args[0])

        if (user) {

            let userData = await Database.User.findOne({ id: user?.id }, 'Perfil.Bitcoins Perfil.Bits')

            if (!userData) return message.reply(`${e.Database} | DATABASE | Nenhum usuário detectado.`)

            let BitUserFarm = userData?.Perfil.Bits,
                BitUser = userData?.Perfil.Bitcoins || 0,
                avatar = user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }),
                BitEmbed = new MessageEmbed().setColor('#FF8C00').setAuthor(`${user.username}`, avatar).addField('BitCoins', `${e.BitCoin} ${BitUser}`, true).addField('BitFarm', `${e.BitCoin} \`${BitUserFarm}/1000\``, true)

            return message.reply({ embeds: [BitEmbed] })
        }

        let authorData = await Database.User.findOne({ id: message.author.id }, 'Perfil.Bits Perfil.Bitcoins Timeouts'),
            Bits = authorData?.Perfil?.Bits || 0,
            BitCoins = authorData?.Perfil?.Bitcoins || 0,
            moeda = await Moeda(message),
            timeout = authorData?.Timeouts

        if (['status', 'stats', 'me', 'eu'].includes(args[0]?.toLowerCase())) {

            const BitEmbed = new MessageEmbed()
                .setColor('#FF8C00')
                .setAuthor(`${message.author.username}`, message.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }))
                .addField('BitCoins', `${e.BitCoin} ${BitCoins || 0}`, true)
                .addField('BitFarm', `${e.BitCoin} \`${Bits}/1000\``, true)

            return message.reply({ embeds: [BitEmbed] })

        }

        let time2 = ms(7200000 - (Date.now() - timeout?.Bitcoin))
        if (client.Timeout(7200000, timeout?.Bitcoin))
            return message.reply(`${e.Loading} | Status: \`${Bits}/1000\` | Reset em \`${time2.hours}h ${time2.minutes}m e ${time2.seconds}s\``).catch(() => { })

        Bits >= 1000 ? NewBitCoin() : MineBitCoin()

        async function NewBitCoin() {

            await Database.User.updateOne(
                { id: message.author.id },
                {
                    $inc: {
                        'Perfil.Bits': -999,
                        'Perfil.Bitcoins': 1,
                        'Balance': 5000000
                    },
                }
            )

            Database.PushTransaction(message.author.id, `${e.gain} Recebeu 5000000 Safiras por ter adquirido um Bitcoin`)

            return message.reply(`${e.Tada} | Você obteve **1 ${e.BitCoin} BitCoin**\n${e.PandaProfit} +5000000 ${moeda}`)
        }

        async function MineBitCoin() {

            await Database.User.updateOne(
                { id: message.author.id },
                {
                    $inc: { 'Perfil.Bits': 1 },
                    'Timeouts.Bitcoin': Date.now()
                },
                { upsert: true }
            )

            return message.reply(`${e.BitCoin} | +1 | \`${Bits + 1}/1000\` | Reset em \`1h 59m 59s\``).catch(() => { })
        }

    }
}