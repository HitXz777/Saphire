const ms = require("parse-ms")
const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const Moeda = require('../../../Routes/functions/moeda')
const { PushTransaction } = require('../../../Routes/functions/transctionspush')

module.exports = {
  name: 'esmola',
  aliases: ['mendigar'],
  category: 'economy',
  ClientPermissions: ['ADD_REACTIONS'],
  emoji: `${e.Coin}`,
  usage: '<esmola>',
  description: 'Mendigue dinheiro no chat',

  run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

    let time = ms(300000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Esmola`)))
    if (sdb.get(`Users.${message.author.id}.Timeouts.Esmola`) !== null && 300000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Esmola`)) > 0)
      return message.reply(`${e.Deny} | Você já pediu esmola! Volte em: \`${time.minutes}m e ${time.seconds}s\``)

    if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)
    let count = 0

    return message.reply(`${e.SadPepe} | ${message.author.username} está pedindo um pouco de dinheiro`).then(msg => {
      sdb.set(`Users.${message.author.id}.Timeouts.Esmola`, Date.now())
      sdb.set(`Request.${message.author.id}`, `${msg.url}`)
      for (const emoji of ['🪙', '❌']) {
        msg.react(emoji).catch(() => { })
      }

      const filter = (reaction, user) => { return ['🪙', '❌'].includes(reaction.emoji.name) && user.id === user.id; };

      const collector = msg.createReactionCollector({ filter, time: 30000 });

      collector.on('collect', (reaction, user) => {

        if (reaction.emoji.name === '🪙') {

          if (user.id === client.user.id || user.id === message.author.id) return
          let money = sdb.get(`Users.${user.id}.Balance`)
          if (money < 50) { return message.channel.send(`${e.Deny} | ${user}, você não tem 50 ${Moeda(message)} na carteira para ajudar ${message.author}`) }
          sdb.subtract(`Users.${user.id}.Balance`, 50)
          sdb.add(`Users.${message.author.id}.Balance`, 50)
          count += 50
          message.channel.send(`${e.MoneyWings} | ${user} ajudou ${message.author} com 50 ${Moeda(message)}`)
        }

        if (reaction.emoji.name === '❌' && user.id === message.author.id) {
          collector.stop()
        }

      });

      collector.on('end', () => {
        sdb.delete(`Request.${message.author.id}`)

        if (count > 0) {
          PushTransaction(
            message.author.id,
            `${e.BagMoney} Recebeu ${count} Moedas de esmola`
          )
        }

        return msg.edit(`${e.Deny} | ${message.author.username} está pedindo um pouco de dinheiro | Esmola expirada`)
      });
    })
  }
}