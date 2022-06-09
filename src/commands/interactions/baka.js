const { e } = require('../../../JSON/emojis.json'),
  { g } = require('../../../modules/Images/gifs.json'),
  Moeda = require('../../../modules/functions/public/moeda'),
  Colors = require('../../../modules/functions/plugins/colors')

module.exports = {
  name: 'baka',
  aliases: ['idiota'],
  category: 'interactions',
  ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
  emoji: '🤪',
  usage: '<baka> [@user]',
  description: 'Baka baka baka',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {

    let avatar = message.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }),
      rand = g.Baka[Math.floor(Math.random() * g.Baka.length)],
      user = client.getUser(client, message, args, 'member')

    if (!user) return message.reply(`${e.Info} | Marca alguém, ||baka||.`)

    if (user.id === message.author.id) return message.reply(`${e.Drinking} | Você não é baka, ||baka!||`)

    if (user.id === client.user.id) {
      Database.subtract(message.author.id, 60)
      return message.reply(`${e.Deny} | Você que é baka! To magoada, peguei 60 ${await Moeda(message)} emprestadas pra comprar sorvetes, bye bye!`)
    }

    let color = await Colors(message.author.id)

    return message.reply({
      embeds: [
        new MessageEmbed()
          .setColor(color)
          .setAuthor({ name: `${message.author.username} chamou ${user.user.username} de baka`, iconURL: avatar })
          .setImage(rand)
      ]
    })
  }
}