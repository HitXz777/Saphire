const { e } = require('../../../database/emojis.json')
const ms = require('parse-ms')
const Moeda = require('../../../Routes/functions/moeda')
const { PushTransaction} = require('../../../Routes/functions/transctionspush')

module.exports = {
    name: 'bitcoin',
    aliases: ['bc', 'bitcoins', 'bit'],
    category: 'economy',
    emoji: `${e.BitCoin}`,
    usage: '<bitcoin> | [bitcoin me] | [bitcoin @user]',
    description: 'Bitcoin é uma moeda rara do meu sistema de economia',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        const Bits = sdb.get(`Users.${message.author.id}.Perfil.Bits`) || 0
        let user = message.mentions.members.first() || message.mentions.repliedUser

        if (user) {
            const BitUserFarm = sdb.get(`Users.${user.id}.Perfil.Bits`) || 0
            let BitUser = db.get(`Bitcoin_${user.id}`) || 0
            let avatar = user.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 })
            const BitEmbed = new MessageEmbed().setColor('#FF8C00').setAuthor(`${user.user.username}`, avatar).addField('BitCoins', `${e.BitCoin} ${BitUser}`, true).addField('BitFarm', `${e.BitCoin} \`${BitUserFarm}/1000\``, true)
            return message.reply({ embeds: [BitEmbed] })
        }

        if (['status', 'stats', 'me', 'eu'].includes(args[0]?.toLowerCase())) {
            const BitEmbed = new MessageEmbed().setColor('#FF8C00').setAuthor(`${message.author.username}`, message.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 })).addField('BitCoins', `${e.BitCoin} ${db.get(`Bitcoin_${message.author.id}`) || 0}`, true).addField('BitFarm', `${e.BitCoin} \`${sdb.get(`Users.${message.author.id}.Perfil.Bits`) || 0}/1000\``, true)
            return message.reply({ embeds: [BitEmbed] })

        } else {

            let time = ms(7200000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Bitcoin`)))
            if (sdb.get(`Users.${message.author.id}.Timeouts.Bitcoin`) !== null && 7200000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Bitcoin`)) > 0)
                return message.reply(`${e.BitCoin} | Status: \`${Bits}/1000\` | Reset em \`${time.hours}h ${time.minutes}m e ${time.seconds}s\``).catch(() => { })

            Bits >= 1000 ? NewBitCoin() : MineBitCoin()

            function NewBitCoin() {
                sdb.set(`Users.${message.author.id}.Perfil.Bits`, 1)
                db.add(`Bitcoin_${message.author.id}`, 1)
                sdb.add(`Users.${message.author.id}.Bank`, 1000000000)

                PushTransaction(
                    message.author.id,
                    `💰 Recebeu 1000000000 Moedas por ter adquirido um Bitcoin`
                )

                return message.reply(`${e.Tada} | Você obteve **1 ${e.BitCoin} BitCoin**\n${e.PandaProfit} +1000000000 ${Moeda(message)}`)
            }

            function MineBitCoin() {
                sdb.add(`Users.${message.author.id}.Perfil.Bits`, 1); sdb.set(`Users.${message.author.id}.Timeouts.Bitcoin`, Date.now())
                return message.reply(`${e.BitCoin} | +1 | \`${Bits + 1}/1000\` | Reset em \`2h 0m e 0s\``).catch(() => { })
            }
        }
    }
}