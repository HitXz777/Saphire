const Moeda = require('../../../modules/functions/public/moeda'),
    { DatabaseObj: { e, config } } = require('../../../modules/functions/plugins/database'),
    NewLoteryGiveaway = require('../../../modules/functions/update/newlotery')

module.exports = {
    name: 'loteria',
    aliases: ['lotery', 'ticket', 'tickets'],
    category: 'economy',
    emoji: '🎫',
    usage: '<tickets> [@user/id]',
    description: 'Confira as chances de ganhar na loteria',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        const lotery = await Database.Lotery.findOne({ id: client.user.id })
        if (message.author.id === config.ownerId) {
            if (['lock', 'fechar', 'travar', 'close'].includes(args[0]?.toLowerCase())) return LockLotery()
            if (['unlock', 'abrir', 'destravar', 'open'].includes(args[0]?.toLowerCase())) return UnlockLotery()
            if (['sortear'].includes(args[0]?.toLowerCase())) return NewLoteryGiveaway(message)
        }

        let u = message.mentions.users.first() || message.repliedUser || client.users.cache.find(data => data.username?.toLowerCase() === args.join(' ')?.toLowerCase() || data.tag?.toLowerCase() === args[0]?.toLowerCase() || data.discriminator === args[0] || data.id === args[0]) || message.author,
            user = await client.users.cache.get(u.id),
            tickets = lotery?.Users || [],
            Prize = lotery?.Prize || 0,
            WhoAre = user.id === message.author.id ? 'Você' : user.username,
            moeda = await Moeda(message)

        let i = tickets.filter(data => data === user.id).length || 0

        return message.reply(`${e.PandaProfit} | ${WhoAre} comprou ${i} 🎫 tickets da loteria\n💰 | ${parseInt(((i / tickets?.length) * 100) || 0).toFixed(3)}% de chance de ganhar.\n🌐 | ${tickets?.length}/15000 🎫 tickets comprados ao todo\n${e.MoneyWings} | ${Prize?.toFixed(0) || 0} ${moeda} acumulados\n🏆 | Último vencedor(a): ${lotery?.LastWinner || 'Ninguém | 0'} ${moeda}`)

        function LockLotery() {
            if (lotery.Close) return message.reply(`${e.Info} | A loteria já está trancada.`)

            Database.closeLotery(client.user.id)
            return message.reply(`${e.Check} | A loteria foi trancada com sucesso!`)

        }

        function UnlockLotery() {
            if (!lotery.Close) return message.reply(`${e.Info} | A loteria já está destrancada.`)

            Database.openLotery(client.user.id)
            return message.reply(`${e.Check} | A loteria foi destrancada com sucesso!`)
        }
    }
}