const { e } = require('../../../JSON/emojis.json')
const Moeda = require('../../../modules/functions/public/moeda')

module.exports = {
    name: 'cu',
    aliases: ['anus', 'bunda', 'traseiro', 'popo'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.Warn}`,
    usage: '<cu>',
    description: 'Você daria seu traseiro por dinheiro?',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let data = await Database.User.findOne({ id: message.author.id }, 'Timeouts.Cu'),
            moeda = await Moeda(message)

        if (client.Timeout(600000, data?.Timeouts?.Cu))
            return message.reply(`${e.Deny} | Pelo bem do seu querido anûs, espere mais \`${client.GetTimeout(600000, data.Timeouts?.Cu)}\``)

        let user = message.mentions.members.first() || message.guild.members.cache.find(user => user.user.id === args[0] || user.displayName?.toLowerCase() == args[0]?.toLowerCase() || user.user.username?.toLowerCase() == args[0]?.toLowerCase())

        if (user?.id === client.user.id) return message.reply('Saiiii, fumou pólvora?')
        if (user?.user?.bot) return message.reply(`${e.Deny} | Noooooooo! Nada disso, não não não! Os bots não tem nada a ver com sua perversidade.`)

        let result = Math.floor(Math.random() * 3) + 1
        if (result === 0) result++
        let din = Math.floor(Math.random() * 80) + 1
        Database.SetTimeout(message.author.id, 'Timeouts.Cu')

        let msg = user ? `serviços de ${user.user.username}` : 'seus serviços'

        if (result === 1) {

            Database.add(message.author.id, din)

            Database.PushTransaction(
                message.author.id,
                `${e.gain} Recebeu ${din} Safiras dando o cú ${user ? `de ${user.user.tag}` : ''}`
            )

            return message.reply(`${e.Check} | ${message.author}, o cliente anônimo gostou dos ${msg} e te pagou +${din} ${moeda}`).catch(() => { })
        }

        Database.subtract(message.author.id, din)

        Database.PushTransaction(
            message.author.id,
            `${e.loss} Perdeu ${din} Safiras dando o cú ${user ? `de ${user.user.tag}` : ''}`
        )

        return message.reply(`${e.Deny} | ${message.author}, o cliente anônimo não gostou dos ${msg} e seu prejuízo foi de -${din} ${moeda}`).catch(() => { })

    }
}
