const { g } = require('../../../modules/Images/gifs.json'),
  { e } = require('../../../JSON/emojis.json'),
  Moeda = require('../../../modules/functions/public/moeda')

module.exports = {
  name: 'atirar',
  aliases: ['shoot', 'tiro'],
  category: 'interactions',
  ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
  emoji: '🔫',
  usage: '<atirar> <@user>',
  description: 'Atire em alguém',

  run: async (client, message, args, prefix, MessageEmbed, Database) => {

    let rand = g.Atirar[Math.floor(Math.random() * g.Atirar.length)],
      user = message.mentions.members.first() || message.mentions.repliedUser

    if (!user) return message.reply(`${e.Info} | Marca alguém.`)

    if (user.id === client.user.id) {
      Database.subtract(message.author.id, 100)
      return message.reply(`${e.Deny} | **NÃO** é pra atirar em mim, que isso? Só pela ousadia, eu peguei 100 ${await Moeda(message)} emprestadas, ||pra sempre||.`)
    }

    if (user.id === message.author.id) return message.reply(`${e.Deny} | Não atire em você mesmo, que coisa feia.`)

    const embed = new MessageEmbed()
      .setColor('#246FE0')
      .setDescription(`${e.GunRight} | ${message.author} está atirando em você ${user}`)
      .setImage(rand)
      .setFooter({ text: '🔁 retribuir' })

    const msg = await message.reply({ embeds: [embed] })

    msg.react('🔁').catch(() => { }) // Check

    return msg.awaitReactions({
      filter: (reaction, u) => ['🔁'].includes(reaction.emoji.name) && u.id === user.id,
      max: 1,
      time: 15000,
      errors: ['time']
    }).then(collected => {
      const reaction = collected.first()

      if (reaction.emoji.name === '🔁') {

        const TradeEmbed = new MessageEmbed().setColor('RED').setDescription(`${e.GunRight} ${message.author} e ${user} estão trocando tiros! ${e.GunLeft}`).setImage(g.Atirar[Math.floor(Math.random() * g.Atirar.length)])
        return msg.edit({ embeds: [TradeEmbed] }).catch(() => { })
      }

    }).catch(() => {

      embed.setColor('RED').setDescription(`${e.Deny} | ${message.author} atirou e ${user} saiu correndo.`)
      return msg.edit({ embeds: [embed] }).catch(() => { })
    })

  }
}