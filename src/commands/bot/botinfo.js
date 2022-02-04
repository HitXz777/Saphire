const moment = require('moment')
const { stripIndent } = require('common-tags')
const { e } = require('../../../database/emojis.json')
const discloud = require("discloud-status")
const { sdb } = require('../../../Routes/functions/database')

module.exports = {
  name: "botinfo",
  aliases: ['stats', 'botstats', 'bi'],
  category: 'bot',
  ClientPermissions: ['EMBED_LINKS'],
  emoji: `${e.Info}`,
  description: "Estatisticas do bot",
  run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

      let ComandosUsados = `${sdb.get('Client.ComandosUsados') || 0}`

      const d = moment.duration(message.client.uptime)
      const days = (d.days() == 1) ? `${d.days()}d` : `${d.days()}d`
      const hours = (d.hours() == 1) ? `${d.hours()}h` : `${d.hours()}h`
      const minutes = (d.minutes() == 1) ? `${d.minutes()}m` : `${d.minutes()}m`

      let data = client.user.createdAt
      let DataFormatada = ((data.getDate())) + "/" + ((data.getMonth() + 1)) + "/" + data.getFullYear()

      const clientStats = stripIndent`
          Nome           : ${client.user.tag}
          Servidores     : ${client.guilds.cache.size}
          Usuários       : ${client.users.cache.size}
          Canais         : ${client.channels.cache.size}
          Ping           : ${Math.round(message.client.ws.ping)}ms
          Online         : ${days}, ${hours}, ${minutes}
          Criada em      : ${DataFormatada}
          Prefixo Server : ${prefix}
       `

    let Ram = discloud.ram();
      const serverStats = stripIndent`
          RAM Usage      : ${Ram}
        `
      const CommandStats = stripIndent`
          Comandos       :  ${client.commands.size}
          Atalhos        :  ${client.aliases.size}
          Comandos Usados:  ${ComandosUsados}
        `

      const embed = new MessageEmbed()
        .setColor('#2f3136')
        .addField('Comandos', `\`\`\`asciidoc\n${CommandStats}\`\`\``)
        .addField(`Status ${client.user.username}`, `\`\`\`asciidoc\n${clientStats}\`\`\``)
        .addField('Host', `\`\`\`asciidoc\n${serverStats}\`\`\``)
      message.reply({ embeds: [embed] })
  }
}