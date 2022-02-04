const { e } = require('../../../database/emojis.json')
const { g } = require('../../../Routes/Images/gifs.json')
const Moeda = require('../../../Routes/functions/moeda')
const colors = require('../../../Routes/functions/colors')

module.exports = {
  name: 'baka',
  aliases: ['idiota'],
  category: 'interactions',
  ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
  emoji: `${e.SaphireQ}`,
  usage: '<baka> [@user]',
  description: 'Baka baka baka',

  run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

    let avatar = message.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 })
    let rand = g.Baka[Math.floor(Math.random() * g.Baka.length)]

    let NoReactAuthor = sdb.get(`Users.${message.author.id}.NoReact`)
    if (NoReactAuthor) return message.reply(`${e.Deny} | Você está com o \`${prefix}noreact\` ativado.`)

    let user = message.mentions.members.first() || message.member

    if (user.id === message.author.id) { return message.reply(`${e.Drinking} | Você não é baka, ||baka!||`) }

    let NoReact = sdb.get(`Users.${user.id}.NoReact`)
    if (NoReact) return message.reply(`${e.Deny} | Este usuário está com o \`${prefix}noreact\` ativado.`)

    if (user.id === client.user.id) {
      sdb.subtract(`Users.${message.author.id}.Balance`, 60);
      sdb.set(`Users.${message.author.id}.Baka`, true)
      message.reply(`${e.Deny} | Você que é baka! To magoada, peguei 60 ${Moeda(message)} emprestadas pra comprar sorvetes, bye bye!`)
      return setTimeout(() => { sdb.delete(`Users.${message.author.id}.Baka`) }, 15000)
    }

    return message.reply({
      embeds: [
        new MessageEmbed()
          .setColor(colors(message.member))
          .setAuthor(`${message.author.username} chamou ${user.user.username} de baka`, avatar)
          .setImage(rand)
      ]
    })
  }
}