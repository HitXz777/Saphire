const ms = require("parse-ms"),
  { e } = require('../../../JSON/emojis.json'),
  Moeda = require('../../../modules/functions/public/moeda')

module.exports = {
  name: 'esmola',
  aliases: ['mendigar'],
  category: 'economy',
  ClientPermissions: ['ADD_REACTIONS'],
  emoji: `${e.Coin}`,
  usage: '<esmola>',
  description: 'Mendigue dinheiro no chat',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {

    let autorData = await Database.User.findOne({ id: message.author.id }, 'Timeouts')

    let timeP = ms(300000 - (Date.now() - autorData.Timeouts.Esmola))
    if (autorData.Timeouts.Esmola !== null && 300000 - (Date.now() - autorData.Timeouts.Esmola) > 0)
      return message.reply(`${e.Deny} | Você já pediu esmola! Volte em: \`${timeP.minutes}m e ${timeP.seconds}s\``)

    let count = 0,
      moeda = await Moeda(message),
      msg = await message.reply(`${e.SadPepe} | ${message.author.username} está pedindo um pouco de dinheiro`),
      emojis = ['🪙', '❌']

    Database.SetTimeout(message.author.id, 'Timeouts.Esmola')

    for (const emoji of emojis) msg.react(emoji).catch(() => { })

    collector = msg.createReactionCollector({
      filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id !== client.user.id,
      time: 30000
    });

    collector.on('collect', async (reaction, user) => {

      if (reaction.emoji.name === emojis[0]) {
        if (message.author.id === user.id) return

        let userData = await Database.User.findOne({ id: user.id }, 'Balance')

        let money = userData?.Balance
        if (!money || money < 10) return message.channel.send(`${e.Deny} | ${user}, você não tem 10 ${moeda} na carteira para ajudar ${message.author}`)
        Database.subtract(user.id, 10)
        Database.add(message.author.id, 10)
        count += 10
        return message.channel.send(`${e.MoneyWings} | ${user} ajudou ${message.author} com 10 ${moeda}`)
      }

      if (reaction.emoji.name === emojis[1] && user.id === message.author.id)
        return collector.stop()

    });

    collector.on('end', () => {

      if (count > 0) {
        Database.PushTransaction(
          message.author.id,
          `${e.gain} Recebeu ${count} Safiras de esmola`
        )
      }

      return msg.edit(`${e.Deny} | ${message.author.username} recebeu ${count} ${moeda} de esmola.`)
    });

  }
}