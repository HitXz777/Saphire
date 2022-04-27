const moment = require('moment'),
  { stripIndent } = require('common-tags'),
  { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: "botinfo",
  aliases: ['stats', 'botstats', 'bi'],
  category: 'bot',
  emoji: `${e.Info}`,
  description: "Estatisticas do bot",
  run: async (client, message, args, prefix, MessageEmbed, Database) => {

    const msg = await message.reply(`${e.Loading} | Obtendo dados e construindo embed...`)

    let LogRegister = await Database.LogRegister.find({}),
      clientData = await Database.Client.findOne({ id: client.user.id }, 'ComandosUsados')
      InDataCommands = `${LogRegister?.length || 0}`,
      d = moment.duration(message.client.uptime),
      days = (d.days() == 1) ? `${d.days()}d` : `${d.days()}d`,
      hours = (d.hours() == 1) ? `${d.hours()}h` : `${d.hours()}h`,
      minutes = (d.minutes() == 1) ? `${d.minutes()}m` : `${d.minutes()}m`,
      data = client.user.createdAt,
      DataFormatada = `${data.getDate()}/${data.getMonth() + 1}/${data.getFullYear()}`,
      clientStats = stripIndent`
          Nome              : ${client.user.tag}
          Servidores        : ${client.guilds.cache.size}
          Usuários          : ${client.users.cache.size}
          Canais            : ${client.channels.cache.size}
          Ping              : ${Math.round(message.client.ws.ping)}ms
          Online            : ${days}, ${hours}, ${minutes}
          Criada em         : ${DataFormatada}
          Prefixo Server    : ${prefix}
       `,
      CommandStats = stripIndent`
          Comandos          :  ${client.commands.size}
          Atalhos           :  ${client.aliases.size}
          Comandos Usados   :  ${clientData?.ComandosUsados || 0}
          Comandos In Data  :  ${InDataCommands + 1}
        `,
      embed = new MessageEmbed()
        .setColor('#2f3136')
        .addField('Comandos', `\`\`\`asciidoc\n${CommandStats}\`\`\``)
        .addField(`Status ${client.user.username}`, `\`\`\`asciidoc\n${clientStats}\`\`\``)

    return msg.edit({ content: `${e.Check} Sucess!`,embeds: [embed] }).catch(() => { })
  }
}
