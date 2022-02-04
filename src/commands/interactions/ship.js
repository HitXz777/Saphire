const { e } = require('../../../database/emojis.json')
const { g } = require('../../../Routes/Images/gifs.json')

module.exports = {
  name: 'ship',
  aliases: ['shippar', 'shipp'],
  category: 'interactions',
  ClientPermissions: ['EMBED_LINKS'],
  emoji: '💞',
  usage: '<ship> [@user/@user]',
  description: 'Veja o amor, sinta o amor',

  run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

    let user = message.mentions.members.first()

    let NoReactAuthor = sdb.get(`Users.${message.author.id}.NoReact`)
    if (NoReactAuthor) return message.reply(`${e.Deny} | Você está com o \`${prefix}noreact\` ativado.`)

    const LoveEmbedSemArgs = new MessageEmbed()
      .setColor('RED')
      .setTitle(`${e.NezukoDance} Medidor de Amor da ${client.user.username}`)
      .setDescription('Não sabe o quanto 2 pessoas se amam? Com este comando você pode saber!')
      .addField('Comandos', `\`${prefix}ship @user\` Veja seu amor com alguém\n\`${prefix}ship @user @user2\` Veja o amor entre duas pessoas`)

    if (!args[0]) { return message.reply({ embeds: [LoveEmbedSemArgs] }) }
    if (!user) { return message.reply(`${e.Deny} | Tenta assim: \`${prefix}ship @user\` ou \`${prefix}ship @user @user\``) }
    if (user.id === client.user.id) { return message.reply(`${e.Deny} | Opa, opa! Eu não namoro ninguém, muito menos gosto, vou ficar te devendo essa.`) }
    if (user.id === message.author.id) { return message.reply(`${e.Deny} | Gostei do seu amor próprio, mas assim... Não é assim que esse comando funciona sabe...`) }
    if (args[2]) { return message.reply(`${e.Deny} | Só marca até duas pessoas, tá bom?`) }

    let NoReact = sdb.get(`Users.${user.id}.NoReact`)
    if (NoReact) return message.reply(`${e.Deny} | Este usuário está com o \`${prefix}noreact\` ativado.`)

    if (args[1]) {
      let user2 = message.mentions.members.last()
      if (user.id === client.user.id) { return message.reply(`${e.Deny} | Marca eu não poxa, eu fico timida.`) }
      if (user2.id === message.author.id) { return message.reply(`${e.Deny} | Hey, usa \`${prefix}ship\` pra você ver como se usa o comando.`) }
      if (user2.id === user.id) { return message.reply(`${e.Deny} | Pessoas diferentes, poxa...`) }

      if (user && user2) {
        let love = Math.random() * 100
        let loveIndex = Math.floor(love / 10)
        let loveLevel = "💖".repeat(loveIndex) + "💔".repeat(10 - loveIndex)
        let gif70 = g.Ship[0]
        let gif40 = g.Ship[1]
        let gif00 = g.Ship[2]

        const embed1 = new MessageEmbed()
          .setColor("RED")

        if (love > 70) {
          embed1.setTitle(`${e.NezukoJump} Medidor de Amor ${client.user.username}`)
          embed1.setThumbnail(gif70)
          embed1.setDescription(`${user.user.username} & ${user2.user.username}\nHuuum... Eu vejo futuro.\n${loveLevel}⠀${Math.floor(love)}% `)
        }

        if (love > 40 && love < 70) {
          embed1.setTitle(`${e.NezukoDance} Medidor de Amor ${client.user.username}`)
          embed1.setThumbnail(gif40)
          embed1.setDescription(`${user.user.username} & ${user2.user.username}\nhmm... Ainda acho que pode sair algo.\n${loveLevel}⠀${Math.floor(love)}% `)
        }

        if (love < 40) {
          embed1.setTitle(`${e.SadPanda} Medidor de Amor ${client.user.username}`)
          embed1.setThumbnail(gif00)
          embed1.setDescription(`${user.user.username} & ${user2.user.username}\n... Que pena, mas quem sabe, né?.\n${loveLevel}⠀${Math.floor(love)}% `)
        }

        return message.reply({ embeds: [embed1] })
      }
    } else if (user) {
      let love = Math.random() * 100
      let loveIndex = Math.floor(love / 10)
      let loveLevel = "💖".repeat(loveIndex) + "💔".repeat(10 - loveIndex)
      let gif70 = g.Ship[0]
      let gif40 = g.Ship[1]
      let gif00 = g.Ship[2]

      const embed = new MessageEmbed()
        .setColor("RED")

      if (love > 70) {
        embed.setTitle(`${e.NezukoJump} Medidor de Amor ${client.user.username}`)
        embed.setThumbnail(gif70)
        embed.setDescription(`${user.user.username} & ${message.author.username}\nHuuum... Eu vejo futuro.\n${loveLevel}⠀${Math.floor(love)}% `)
      }

      if (love > 40 && love < 70) {
        embed.setTitle(`${e.NezukoDance} Medidor de Amor ${client.user.username}`)
        embed.setThumbnail(gif40)
        embed.setDescription(`${user.user.username} & ${message.author.username}\nhmm... Ainda acho que pode sair algo.\n${loveLevel}⠀${Math.floor(love)}% `)
      }

      if (love < 40) {
        embed.setTitle(`${e.SadPanda} Medidor de Amor ${client.user.username}`)
        embed.setThumbnail(gif00)
        embed.setDescription(`${user.user.username} & ${message.author.username}\n... Que pena.\n${loveLevel}⠀${Math.floor(love)}% `)
      }

      return message.reply({ embeds: [embed] })
    } else {
      return message.reply(`${e.Info} | Hey! Usa o formato correto. É assim: \`${prefix}ship @user\` ou \`${prefix}ship @user @user\``)
    }
  }
}