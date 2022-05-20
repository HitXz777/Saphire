const { g } = require('../../../modules/Images/gifs.json')
const { e } = require('../../../JSON/emojis.json')
const { f } = require('../../../JSON/frases.json')

module.exports = {
  name: 'chorar',
  aliases: ['cry', 'choro', 'chorando', 'cryando', 'cry'],
  category: 'reactions',
  ClientPermissions: ['EMBED_LINKS'],
  emoji: `${e.SaphireCry}`,
  usage: '<cry> [motivo]',
  description: 'Chorar as vezes faz bem',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {

    
    let rand = g.Cry[Math.floor(Math.random() * g.Cry.length)]
    let texto = args.join(" ")
    if (!texto) texto = `${message.author} está chorando`
    if (texto.length > 1000) return message.reply(`${e.Deny} | Não diga coisas acima de 1000 caracteres, pelo bem do meu coração de códigos :(`)

    const embed = new MessageEmbed().setColor('#246FE0').setDescription(`${texto}`).setImage(rand)

    return message.reply({ embeds: [embed] }).then(msg => {
      
      msg.react('🔄').catch(() => { }) // 1º Embed
      msg.react('❌').catch(() => { }) // cancel

      let filter = (reaction, user) => { return reaction.emoji.name === '🔄' && user.id === message.author.id }; let Collector = msg.createReactionCollector({ filter: filter, time: 15000, errors: ['time'] })
      let filter2 = (reaction, user) => { return reaction.emoji.name === '❌' && user.id === message.author.id }; let Collector2 = msg.createReactionCollector({ filter: filter2, max: 1, time: 30000, errors: ['time', 'max'] })
      Collector.on('collect', (reaction, user) => { embed.setImage(g.Cry[Math.floor(Math.random() * g.Cry.length)]); msg.edit({ embeds: [embed] }).catch(() => { }) })
      Collector.on('end', (reaction, user) => { ; embed.setColor('RED').setFooter({ text: `Sessão Expirada | ${message.author.id}` }); msg.reactions.removeAll().catch(() => { }); msg.edit({ embeds: [embed] }).catch(() => { }) })

      Collector2.on('collect', (reaction, user) => { embed.setColor('RED').setFooter({ text: `Comando Expirado | ${message.author.id}` }); msg.reactions.removeAll().catch(() => { }); msg.edit({ embeds: [embed] }).catch(() => { }) })
      Collector2.on('end', (reaction, user) => { ; embed.setColor('RED').setFooter({ text: `Tempo Expirado | ${message.author.id}` }); msg.reactions.removeAll().catch(() => { }); msg.edit({ embeds: [embed] }).catch(() => { }) })
    }).catch(err => {
      
      return message.reply(`${e.Warn} | Houve um erro ao executar este comando\n\`${err}\``)
    })
  }
}