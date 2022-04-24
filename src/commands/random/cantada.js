const
  { DatabaseObj: { e } } = require('../../../modules/functions/plugins/database'),
  PassCode = require('../../../modules/functions/plugins/PassCode'),
  IsMod = require('../../../modules/functions/config/ismod'),
  ark = require('ark.db')

module.exports = {
  name: 'cantadas',
  aliases: ['cantada'],
  category: 'random',
  ClientPermissions: ['ADD_REACTIONS'],
  emoji: '💌',
  usage: '<cantada>',
  description: 'Veja cantadas muito "boas"',

  run: async (client, message, args, prefix, MessageEmbed, Database) => {

    let cantadasData = new ark.Database('../../../JSON/cantadas.json'),
      cantadas = cantadasData.get('Cantadas'),
      mod = await IsMod(message.author.id)

    if (['send', 'enviar'].includes(args[0]?.toLowerCase())) return SendNewCantada()
    if (['list', 'lista'].includes(args[0]?.toLowerCase())) return ListOfCantadas()
    if (['accept', 'aprovar', 'aceitar'].includes(args[0]?.toLowerCase())) return AcceptNewCantada()
    if (['deny', 'desaprovar', 'cancelar', 'excluir', 'delete', 'deletar', 'del', 'remove', 'remover', 'apagar'].includes(args[0]?.toLowerCase())) return DenyCantada()
    if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return CantadasInfo()
    if (['todos', 'all'].includes(args[0]?.toLowerCase())) return AllCantadas()
    if (['filter', 'filtro'].includes(args[0]?.toLowerCase())) return cantadaFilter()
    if (['search', 'procurar', 's'].includes(args[0]?.toLowerCase())) return search()
    return InitialEmbedCantadas()

    async function AllCantadas() {

      if (!mod)
        return message.reply(`${e.Deny} | Este sub-comando é exclusivo apenas para moderadores da Saphire's Team.`)

      let CantadasDB = cantadasData.get('Cantadas') || [],
        Control = 0,
        Emojis = ['⏪', '⬅️', '➡️', '⏩', '❌']

      if (!CantadasDB || !CantadasDB.length) return message.reply(`${e.Info} | Não há nenhuma cantada na lista de espera.`)

      function EmbedGenerator() {

        let amount = 10,
          Page = 1,
          embeds = [],
          length = CantadasDB.length / 10 <= 1 ? 1 : parseInt(CantadasDB.length / 10) + 1

        for (let i = 0; i < CantadasDB.length; i += 10) {

          const current = CantadasDB.slice(i, amount)
          const description = current.map(Cantada => `**Enviada por**: ${client.users.cache.get(Cantada.Author)?.tag || 'Indefinido'} *\`${Cantada.Author}\`*\n**Cantada:** ${Cantada.Cantada}\n------------`).join('\n')

          embeds.push({
            color: client.blue,
            title: `${e.FirePo} Cantadas na Database | ${Page}/${length}`,
            description: `${description}`,
            footer: {
              text: `${CantadasDB.length} Cantadas contabilizadas`
            },
          })

          Page++
          amount += 10

        }

        return embeds;
      }

      let Embeds = EmbedGenerator(),
        msg = await message.reply({ embeds: [Embeds[0]] }),
        collector = msg.createReactionCollector({
          filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
          idle: 30000
        });

      if (Embeds.length > 1)
        for (const e of Emojis)
          msg.react(e).catch(() => { })

      collector.on('collect', (reaction) => {

        if (reaction.emoji.name === '❌')
          return collector.stop()

        if (reaction.emoji.name === '⏩') {
          if (Control === Embeds.length - 1) return
          Control = Embeds.length - 1
          return msg.edit({ embeds: [Embeds[Control]] }).catch(() => { })
        }

        if (reaction.emoji.name === '⏪') {
          if (Control === 0) return
          Control = 0
          return msg.edit({ embeds: [Embeds[Control]] }).catch(() => { })
        }

        if (reaction.emoji.name === '⬅️') {
          Control--
          return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control++
        }

        if (reaction.emoji.name === '➡️') {
          Control++
          return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control--
        }

      })

      collector.on('end', () => {
        msg.reactions.removeAll().catch(() => { })
        return msg.edit(`${e.Deny} | Comando cancelado`).catch(() => { })
      })

    }

    function DenyCantada() {

      if (!mod)
        return message.reply(`${e.Deny} | Este sub-comando é exclusivo para os \`${prefix}mods\` da Saphire's Team.`)

      if (['all', 'tudo'].includes(args[1]?.toLowerCase()))
        return DeleteAllCantadas()

      let CantadasDB = cantadasData.get('Sugest'),
        CantadasCodes = Object.keys(CantadasDB || {}),
        Code = args[1],
        Reason = args.slice(2).join(' ') || 'Nenhuma observação'

      if (!CantadasCodes.includes(Code))
        return RemoveCantada()

      let Cantada = {
        Cantada: `${CantadasDB[Code].Cantada}`,
        Author: `${CantadasDB[Code].Author}`
      }

      cantadasData.delete(`Sugest.${Code}`)

      client.users.cache.get(Cantada.Author)?.send(`${e.Deny} | A sua cantada não foi aceita.\n${e.Info} | Conteúdo: ${Cantada.Cantada}\n💬 | ${Reason}`).catch(() => { })
      return message.reply(`${e.Check} | A cantada \`${Code}\` foi deletada com sucesso!`)

      function DeleteAllCantadas() {
        if (!cantadasData.get('Sugest'))
          return message.reply(`${e.Deny} | Não há nenhuma cantada na lista`)

        cantadasData.delete('Sugest')
        return message.reply(`${e.Check} | Todas as cantadas da lista de espera foram deletadas com sucesso.`)
      }

      async function RemoveCantada() {

        const AllCantadas = cantadasData.get('Cantadas') || [],
          Cantada = AllCantadas.find(cantada => cantada.Cantada === args.slice(1).join(' '))

        if (AllCantadas.length === 0)
          return message.reply(`${e.Deny} | Nenhuma cantada no banco de dados.`)

        if (!Cantada)
          return message.reply(`${e.Deny} | Não encontrei essa cantada no banco de dados.`)

        const msg = await message.reply(`${e.Loading} | Deletando...`)

        let NewSetArray = AllCantadas.filter(ctd => ctd.Cantada !== Cantada.Cantada)

        cantadasData.set('Cantadas', [...NewSetArray])
        return msg.edit(`${e.Check} | A cantada **\`${Cantada.Cantada}\`** foi deletada com sucesso!`)

      }

    }

    function AcceptNewCantada() {

      if (!mod)
        return message.reply(`${e.Deny} | Este sub-comando é exclusivo para os \`${prefix}mods\` da Saphire's Team.`)

      let CantadasDB = cantadasData.get('Sugest'),
        CantadasCodes = Object.keys(CantadasDB || {}),
        Code = args[1]

      if (CantadasCodes.length === 0)
        return message.reply(`${e.Deny} | Não há nenhuma cantada na lista de espera`)

      if (['all', 'tudo'].includes(args[1]?.toLowerCase()))
        return acceptCantadasAll()

      if (!CantadasCodes.includes(Code))
        return message.reply(`${e.Deny} | Este Cantada-KeyCode não existe na lista de espera.`)

      let Cantada = {
        Cantada: `${CantadasDB[Code].Cantada}`,
        Author: `${CantadasDB[Code].Author}`
      }

      cantadasData.push('Cantadas', Cantada)
      cantadasData.delete(`Sugest.${Code}`)

      client.users.cache.get(Cantada.Author)?.send(`${e.Check} | A sua cantada foi aceita.\n${e.Info} | Conteúdo: ${Cantada.Cantada}`).catch(() => { })
      return message.reply(`${e.Check} | A cantada \`${Code}\` foi aceita com sucesso!`)

      function acceptCantadasAll() {

        let arrayControl = [],
          arrayDeny = []

        for (const CCode of CantadasCodes) {

          let Cantada = {
            Cantada: `${CantadasDB[CCode].Cantada}`,
            Author: `${CantadasDB[CCode].Author}`
          },
            AllCantadas = cantadasData.get('Cantadas') || [],
            CantadaSearch = AllCantadas.find(data => data.Cantada === Cantada.Cantada)

          if (CantadaSearch) {
            arrayDeny.push(CCode)
            cantadasData.delete(`Sugest.${CCode}`)
            continue
          }

          cantadasData.push('Cantadas', Cantada)
          cantadasData.delete(`Sugest.${CCode}`)

          arrayControl.push(CCode)
          continue

        }

        const mapped = arrayControl.map(c => `\`${c}\``).join(', '),
          mappedDeny = arrayDeny.map(c => `\`${c}\``).join(', ')

        return message.channel.send(`${e.Info} | Todas as cantadas foram analizadas.${mapped ? `\n> ${e.Check} ${mapped}` : ''}${mappedDeny ? `\n> ${e.Deny} ${mappedDeny}` : ''}`).catch(() => message.channel.send(`${e.Info} | Todas as cantadas foram analizadas.`))

      }

    }

    async function ListOfCantadas() {

      if (!mod)
        return message.reply(`${e.Deny} | Este sub-comando é exclusivo apenas para moderadores da Saphire's Team.`)

      let CantadasDB = cantadasData.get('Sugest'),
        CantadasCodes = Object.keys(CantadasDB || {}),
        CantadasEmEspera = [],
        Control = 0,
        Emojis = ['⏪', '⬅️', '➡️', '⏩', '❌']

      if (!CantadasCodes.length) return message.reply(`${e.Info} | Não há nenhuma cantada na lista de espera.`)

      for (const code of CantadasCodes)
        if (CantadasDB[code])
          CantadasEmEspera.push({ Code: code, Author: CantadasDB[code].Author, Cantada: CantadasDB[code].Cantada })

      function EmbedGenerator() {

        let amount = 10,
          Page = 1,
          embeds = [],
          length = CantadasEmEspera.length / 10 <= 1 ? 1 : parseInt(CantadasEmEspera.length / 10),
          inPage = length > 0 ? ` | ${Page}/${length}` : ''

        for (let i = 0; i < CantadasEmEspera.length; i += 10) {

          const current = CantadasEmEspera.slice(i, amount)
          const description = current.map(Cantada => `**Enviada por**: ${client.users.cache.get(Cantada.Author)?.tag || 'Indefinido'} *\`${Cantada.Author}\`*\n**Cantada-KeyCode**: \`${Cantada.Code}\`\n**Cantada:** ${Cantada.Cantada}\n------------`).join('\n')

          embeds.push({
            color: client.blue,
            title: `🔄 Cantadas em espera${inPage}`,
            description: `${description}`,
            footer: {
              text: `${CantadasEmEspera.length} Cantadas contabilizadas`
            },
          })

          Page++
          amount += 10

        }

        return embeds;
      }

      let Embeds = EmbedGenerator(),
        msg = await message.reply({ embeds: [Embeds[0]] }),
        collector = msg.createReactionCollector({
          filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
          idle: 30000
        });

      if (Embeds.length > 1)
        for (const i of Emojis)
          msg.react(i).catch(() => { })

      collector.on('collect', (reaction) => {

        if (reaction.emoji.name === '❌')
          return collector.stop()

        if (reaction.emoji.name === '⏩') {
          if (Control === Embeds.length - 1) return
          Control = Embeds.length - 1
          return msg.edit({ embeds: [Embeds[Control]] }).catch(() => { })
        }

        if (reaction.emoji.name === '⏪') {
          if (Control === 0) return
          Control = 0
          return msg.edit({ embeds: [Embeds[Control]] }).catch(() => { })
        }

        if (reaction.emoji.name === '⬅️') {
          Control--
          return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control++
        }

        if (reaction.emoji.name === '➡️') {
          Control++
          return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control--
        }

      })

      collector.on('end', () => {
        msg.reactions.removeAll().catch(() => { })
        return msg.edit(`${e.Deny} | Comando cancelado`).catch(() => { })
      })

    }

    function SendNewCantada() {

      let NewCantada = args.slice(1).join(' '),
        CantadaCode = PassCode(5)

      if (!NewCantada)
        return message.reply(`${e.Info} | Você pode enviar sua cantada para os \`${prefix}mods\` aprovarem.`)

      if (NewCantada.length > 300)
        return message.reply(`${e.Deny} | As cantadas não podem ultrapassar **300 caracteres**`)

      cantadasData.set(`Sugest.${CantadaCode}`, {
        Cantada: NewCantada,
        Author: message.author.id
      })

      return message.reply(`${e.Check} | A sua cantada foi enviada com sucesso e está a espera da aprovação dos moderadores.`)

    }

    function InitialEmbedCantadas() {

      if (!cantadas || cantadas?.length === 0)
        return message.reply(`${e.Info} | Não há nenhuma cantada no meu banco de dados neste momento.`)

      const CantadasEmbed = new MessageEmbed()
        .setColor('#246FE0')
        .setTitle(`❤️ Cantadas da Turma`)
        .addField('----------', `${Cantadas()}`)

      return message.reply({ embeds: [CantadasEmbed] }).then(msg => {

        for (const emoji of ['🔄', '❌'])
          msg.react(emoji).catch(() => { })

        const collector = msg.createReactionCollector({
          filter: (reaction, user) => ['🔄', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
          idle: 60000,
          max: 15,
          errors: ['max']
        })

        collector.on('collect', (reaction, user) => {

          return reaction.emoji.name === '🔄'
            ? (() => {
              return msg.edit({
                embeds: [
                  CantadasEmbed.addField('----------', `${Cantadas()}`)
                ]
              }).catch(() => { collector.stop() })
            })()
            : collector.stop()

        })

        collector.on('end', () => {
          CantadasEmbed.setColor('RED').setFooter(`Tempo expirado | ${prefix}cantada send`)
          return msg.edit({ embeds: [CantadasEmbed] }).catch(() => { })
        })

      })

    }

    function Cantadas() {
      const Random = cantadas[Math.floor(Math.random() * cantadas.length)],
        Cantada = `${Random.Cantada}\n${client.users.cache.get(Random.Author)?.tag || 'Autor*(a)* não encontrado'}`

      return Cantada
    }

    function CantadasInfo() {
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setColor(client.blue)
            .setTitle(`${e.Info} Cantada Info`)
            .setDescription('Todos os sub-comandos do comando cantada')
            .addFields(
              {
                name: `${e.Gear} Principal`,
                value: `\`${prefix}cantada\` - Cantadas aleatórias`
              },
              {
                name: `${e.Join} Envie suas cantadas`,
                value: `\`${prefix}cantada send <Sua cantada>\` - Envie sua cantada`
              },
              {
                name: `${e.FirePo} Todas as cantadas no banco de dados`,
                value: `\`${prefix}cantadas all\``
              },
              {
                name: `${e.ModShield} Moderadores Saphire's Team`,
                value: `\`${prefix}cantada list\` - Lista de cantadas enviadas pelos membros\n\`${prefix}cantada accept C-KeyCode\` - Aceita cantadas da lista\n\`${prefix}cantada delete C-KeyCode/all/<Cantada>\` - Deleta cantadas da lista ou todas(all)\n\`${prefix}cantada filter/search\` - Procura por cantadas`
              }
            )
        ]
      })
    }

    async function search() {

      if (!mod)
        return message.reply(`${e.Deny} | Este sub-comando é exclusivo apenas para moderadores da Saphire's Team.`)

      let text = args.slice(1).join(' ')

      if (!text) return message.reply(`${e.Info} | Forneça um texto, alguma palavra chave para que eu possa filtrar as cantadas`)

      let data = cantadasData.get('Cantadas') || []

      let CantadasDB = data.filter(cant => cant.Cantada.includes(text)),
        Control = 0,
        Emojis = ['⏪', '⬅️', '➡️', '⏩', '❌']

      if (!CantadasDB || !CantadasDB.length) return message.reply(`${e.Info} | Nenhuma cantada foi encontrada.`)

      function EmbedGenerator() {

        let amount = 10,
          Page = 1,
          embeds = [],
          length = CantadasDB.length / 10 <= 1 ? 1 : parseInt(CantadasDB.length / 10) + 1

        for (let i = 0; i < CantadasDB.length; i += 10) {

          const current = CantadasDB.slice(i, amount)
          const description = current.map(Cantada => `**Enviada por**: ${client.users.cache.get(Cantada.Author)?.tag || 'Indefinido'} *\`${Cantada.Author}\`*\n**Cantada:** ${Cantada.Cantada}\n------------`).join('\n')

          embeds.push({
            color: client.blue,
            title: `${e.FirePo} Cantadas na Database | Filtro de palavras | ${Page}/${length}`,
            description: `${description}`,
            footer: {
              text: `${CantadasDB.length} Cantadas contabilizadas`
            },
          })

          Page++
          amount += 10

        }

        return embeds;
      }

      let Embeds = EmbedGenerator(),
        msg = await message.reply({ embeds: [Embeds[0]] }),
        collector = msg.createReactionCollector({
          filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
          idle: 30000
        });

      if (Embeds.length > 1)
        for (const e of Emojis)
          msg.react(e).catch(() => { })

      collector.on('collect', (reaction) => {

        if (reaction.emoji.name === '❌')
          return collector.stop()

        if (reaction.emoji.name === '⏩') {
          if (Control === Embeds.length - 1) return
          Control = Embeds.length - 1
          return msg.edit({ embeds: [Embeds[Control]] }).catch(() => { })
        }

        if (reaction.emoji.name === '⏪') {
          if (Control === 0) return
          Control = 0
          return msg.edit({ embeds: [Embeds[Control]] }).catch(() => { })
        }

        if (reaction.emoji.name === '⬅️') {
          Control--
          return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control++
        }

        if (reaction.emoji.name === '➡️') {
          Control++
          return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control--
        }

      })

      collector.on('end', () => {
        msg.reactions.removeAll().catch(() => { })
        return msg.edit(`${e.Deny} | Comando cancelado`).catch(() => { })
      })

    }

    async function cantadaFilter() {

      if (!mod)
        return message.reply(`${e.Deny} | Este sub-comando é exclusivo apenas para moderadores da Saphire's Team.`)

      let id = args[1]

      if (!id) return message.reply(`${e.Info} | Forneça um ID para que eu possa filtrar as cantadas`)

      let data = cantadasData.get('Cantadas') || []

      let CantadasDB = data.filter(cant => cant.Author === id),
        Control = 0,
        Emojis = ['⏪', '⬅️', '➡️', '⏩', '❌']

      if (!CantadasDB || !CantadasDB.length) return message.reply(`${e.Info} | Nenhuma cantada foi encontrada.`)

      function EmbedGenerator() {

        let amount = 10,
          Page = 1,
          embeds = [],
          length = CantadasDB.length / 10 <= 1 ? 1 : parseInt(CantadasDB.length / 10) + 1

        for (let i = 0; i < CantadasDB.length; i += 10) {

          const current = CantadasDB.slice(i, amount)
          const description = current.map(Cantada => `**Enviada por**: ${client.users.cache.get(Cantada.Author)?.tag || 'Indefinido'} *\`${Cantada.Author}\`*\n**Cantada:** ${Cantada.Cantada}\n------------`).join('\n')

          embeds.push({
            color: client.blue,
            title: `${e.FirePo} Cantadas na Database | ${Page}/${length}`,
            description: `${description}`,
            footer: {
              text: `${CantadasDB.length} Cantadas contabilizadas`
            },
          })

          Page++
          amount += 10

        }

        return embeds;
      }

      let Embeds = EmbedGenerator(),
        msg = await message.reply({ embeds: [Embeds[0]] }),
        collector = msg.createReactionCollector({
          filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
          idle: 30000
        });

      if (Embeds.length > 1)
        for (const e of Emojis)
          msg.react(e).catch(() => { })

      collector.on('collect', (reaction) => {

        if (reaction.emoji.name === '❌')
          return collector.stop()

        if (reaction.emoji.name === '⏩') {
          if (Control === Embeds.length - 1) return
          Control = Embeds.length - 1
          return msg.edit({ embeds: [Embeds[Control]] }).catch(() => { })
        }

        if (reaction.emoji.name === '⏪') {
          if (Control === 0) return
          Control = 0
          return msg.edit({ embeds: [Embeds[Control]] }).catch(() => { })
        }

        if (reaction.emoji.name === '⬅️') {
          Control--
          return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control++
        }

        if (reaction.emoji.name === '➡️') {
          Control++
          return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control--
        }

      })

      collector.on('end', () => {
        msg.reactions.removeAll().catch(() => { })
        return msg.edit(`${e.Deny} | Comando cancelado`).catch(() => { })
      })

    }

  }
}