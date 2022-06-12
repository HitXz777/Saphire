const { DatabaseObj: { e, config } } = require('../../../modules/functions/plugins/database')
const Error = require('../../../modules/functions/config/errors')

module.exports = {
  name: 'clear',
  aliases: ['limpar'],
  category: 'moderation',
  UserPermissions: ['MANAGE_MESSAGES'],
  ClientPermissions: ['MANAGE_MESSAGES'],
  emoji: '🧹',
  usage: '<clear> [@user/bots/images/all] [quantidade]',
  description: 'Limpezinha básica',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {

    const clearembed = new MessageEmbed()
      .setColor('#246FE0')
      .setTitle("🧹 Comando Clear")
      .setDescription("Use o comando para fazer aquela limpa nas mensagens")
      .addField('Comandos do Clear', `\`${prefix}clear 1~100\` Apague até 100 mensagens\n\`${prefix}clear images\` Apague imagens\n\`${prefix}clear bots\` Apague mensagens de bots\n\`${prefix}clear @user\` Apague mensagens de alguém\n\`${prefix}clear nuke\` Apague as últimas 1 mil mensagens`)

    if (!args[0]) return message.reply({ embeds: [clearembed] })

    let user = searchMember() || message.guild.members.cache.get(args[0])

    if (user) return BulkDeleteUser()
    if (['bot', "bots"].includes(args[0]?.toLowerCase())) return BulkDeleteBots()
    if (['images', "imagens", "fotos", "foto", "imagem", "midia"].includes(args[0]?.toLowerCase())) return BulkDeleteMidias()
    if (['nuke'].includes(args[0]?.toLowerCase())) return NewClearNuke()
    if (!isNaN(args[0]) && typeof parseInt(args[0]) === "number" && (args[0] >= 1 || args[0] <= 100)) return BulkDelete()
    return message.reply(`${e.Deny} | O argumento "**${args.join(' ')}**" não é válido no comando \`${prefix}clear\`. Use \`${prefix}clear\` sem argumentos que eu te mando tudo o que esse comando é capaz de fazer.`)

    async function BulkDeleteUser() {

      let MsgsPraDeletar = args[1]
      if (!MsgsPraDeletar) { return message.reply(`${e.Deny} | Tenta usar deste jeito: \`${prefix}clear @user 0~100\``) }
      if (isNaN(MsgsPraDeletar)) { return message.reply(`${e.Deny} | A quantidade precisa ser um número, sabia? \`${prefix}clear @user 0~100\``) }
      if (MsgsPraDeletar > 100 || MsgsPraDeletar < 1) { return message.reply(`${e.Deny} | Quantidade de 0 a 100, ok? \`${prefix}clear @user 0~100\``) }
      if (args[2]) return message.reply(`${e.Deny} | Nada além da quantidade, não me atrapalha poxa... \`${prefix}clear @user 0~100\``)

      message.channel.messages.fetch({ limit: parseInt(MsgsPraDeletar) }).then(userMessages => {

        let userFilter = userMessages.filter(obj => obj.author.id === user.id)
        message.channel.bulkDelete(userFilter).then(Mensagens => {
          return message.channel.send(`${e.Check} | Nas últimas ${MsgsPraDeletar} mensagens, eu achei ${Mensagens.size} mensagens de ${user} e apaguei elas sob as ordens de ${message.author}`)
        }).catch(err => {
          if (err.code === 10008)
            return message.channel.send(`${e.Warn} | Alguma das ${args[0]} mensagens acima é desconhecida ou o Discord está com lag.`)

          if (err.code === 50034)
            return message.channel.send(`${e.Warn} | As mensagens acima são velhas demais para eu apagar.`)

          message.reply(`${e.Deny} | Aconteceu um erro ao executar este comando, caso não saiba resolver, reporte o problema com o comando \`${prefix}bug\` ou entre no [meu servidor](${config.SupportServerLink}).\n\`${err}\``)
          Error(message, err)
        })
      }).catch(err => { return message.reply(`${e.Warn} | Aconteceu um erro ao executar este comando, caso não saiba resolver, reporte o problema com o comando \`${prefix}bug\` ou entre no meu servidor, link no perfil.\n\`${err}\``) })

    }

    async function BulkDeleteBots() {

      let MsgsPraDeletar = args[1]
      if (!MsgsPraDeletar) { return message.reply(`${e.Deny} | Tenta usar deste jeito: \`${prefix}clear bots 0~100\``) }
      if (isNaN(MsgsPraDeletar)) { return message.reply(`${e.Deny} | A quantidade precisa ser um número, sabia? \`${prefix}clear bots 0~100\``) }
      if (MsgsPraDeletar > 100 || MsgsPraDeletar < 1) { return message.reply(`${e.Deny} | Quantidade de 0 a 100, ok? \`${prefix}clear bots 0~100\``) }

      await message.channel.messages.fetch({ limit: parseInt(MsgsPraDeletar) }).then(awaitBotMessages => {

        let botFilter = awaitBotMessages.filter(obj => obj.author.bot)

        message.channel.bulkDelete(botFilter).then(MsgApagada => {
          return message.channel.send(`${e.Check} | Eu apaguei ${MsgApagada.size} mensagens de Bots das últimas ${MsgsPraDeletar} mensagens do chat sob as ordens de ${message.author}`)
        }).catch(err => {
          if (err.code === 10008)
            return message.channel.send(`${e.Warn} | Alguma das ${args[0]} mensagens acima é desconhecida ou o Discord está com lag.`)

          if (err.code === 50034)
            return message.channel.send(`${e.Warn} | As mensagens acima são velhas demais para eu apagar.`)

          message.reply(`${e.Deny} | Aconteceu um erro ao executar este comando, caso não saiba resolver, reporte o problema com o comando \`${prefix}bug\` ou entre no [meu servidor](${config.SupportServerLink}).\n\`${err}\``)
          Error(message, err)
        })
      }).catch(err => {
        message.reply(`${e.Deny} | Aconteceu um erro ao executar este comando, caso não saiba resolver, reporte o problema com o comando \`${prefix}bug\` ou entre no [meu servidor](${config.SupportServerLink}).\n\`${err}\``)
      })

    }

    async function BulkDeleteMidias() {

      let MsgsPraDeletar = args[1]
      if (!MsgsPraDeletar) { return message.reply(`${e.Deny} | Tenta usar deste jeito: \`${prefix}clear imagens 0~100\``) }
      if (isNaN(MsgsPraDeletar)) { return message.reply(`${e.Deny} | A quantidade precisa ser um número, sabia? \`${prefix}clear imagens 0~100\``) }
      if (MsgsPraDeletar > 100 || MsgsPraDeletar < 1) { return message.reply(`${e.Deny} | Quantidade de 0 a 100, ok? \`${prefix}clear imagens 0~100\``) }

      message.channel.messages.fetch({ limit: parseInt(MsgsPraDeletar) }).then(awaitImageMessages => {

        let imageFilter = awaitImageMessages.filter(obj => obj.attachments.size > 0)
        message.channel.bulkDelete(imageFilter).then(MsgApagada => {
          return message.channel.send(`${e.Check} | Encontrei ${MsgApagada.size} midias nas últimas ${MsgsPraDeletar} mensagens do chat e apaguei sob as ordens de ${message}`)
        }).catch(err => {
          if (err.code === 10008)
            return message.channel.send(`${e.Warn} | Alguma das ${args[0]} mensagens acima é desconhecida ou o Discord está com lag.`)

          if (err.code === 50034)
            return message.channel.send(`${e.Warn} | As mensagens acima são velhas demais para eu apagar.`)

          return message.channel.send(`${e.Warn} | Houve algum tipo de "erro" na execução:\n\`${err}\``)
        })
      }).catch(err => {
        message.reply(`${e.Deny} | Aconteceu um erro ao executar este comando, caso não saiba resolver, reporte o problema com o comando \`${prefix}bug\` ou entre no [meu servidor](${config.SupportServerLink}).\n\`${err}\``)
        Error(message, err)
      })

    }

    async function NewClearNuke() {

      if (args[1])
        return message.reply(`${e.Deny} | Nada além do primeiro argumento! Use \`${prefix}clear\` para mais informações.`)

      let messages = 0
      let i = true
      while (i) {
        if (!message.channel) {
          i = false
          return
        }

        let deleteAble = await message.channel.messages.fetch({ limit: 100 }).catch(err => { return })
        if (deleteAble.size < 100 || messages >= 900) {
          await message.channel.bulkDelete(deleteAble).catch(err => {
            i = false

            if (err.code === 10008)
              return message.channel.send(`${e.Warn} | Alguma das ${args[0]} mensagens acima é desconhecida ou o Discord está com lag.`)

            if (err.code === 50034)
              return message.channel.send(`${e.Warn} | As mensagens acima são velhas demais para eu apagar.`)

            if (err.code === 50035)
              return message.channel.send(`${e.Warn} | Alguma mensagem é desconhecida... Osh, o que houve?`)

            Error(message, err)
            return message.reply(`${e.Deny} | Aconteceu um erro ao executar este comando, caso não saiba resolver, reporte o problema com o comando \`${prefix}bug\` ou entre no [meu servidor](${config.SupportServerLink}).\n\`${err}\``)
          })
          messages += deleteAble.size
          i = false
          message.channel.send(`${e.Check} | Deletei um total de ${messages} mensagens sob as ordens de ${message.author}.\n${e.SaphireObs} | Mensagens acima de 14 dias não podem ser apagadas.`)
          messages = 0
          return
        }
        await message.channel.bulkDelete(deleteAble).catch(() => { })
        messages += deleteAble.size
      }
    }

    async function BulkDelete() {

      if (args[1]) return message.reply(`${e.Deny} | Nada além do **${args[0]}**! Use \`${prefix}clear\` para mais informações.`)

      if (args[0] > 100)
        return message.reply(`${e.Deny} | O limite máximo de mensagens é 100.`)

      message.delete().then(async () => {

        await message.channel.messages.fetch({ limit: parseInt(args[0]) }).then(messages => {

          message.channel.bulkDelete(messages, true).then(msg => {
            message.channel.send(`${e.Check} | Deletei um total de ${msg.size} mensagens sob as ordens de ${message.author}.\n${e.SaphireObs} | ${(args[0] - msg.size) || 0} mensagens não foram deletadas por serem mais velhas que 14 dias ou por não existirem.`)
          }).catch(err => {
            if (err.code === 10008)
              return message.channel.send(`${e.Warn} | Alguma das ${args[0]} mensagens acima é desconhecida ou o Discord está com lag.`)

            if (err.code === 50034)
              return message.channel.send(`${e.Warn} | As mensagens acima são velhas demais para eu apagar.`)

            if (err.code === 50035)
              return message.channel.send(`${e.Warn} | Alguma mensagem é desconhecida... Osh, o que houve?`)

            Error(message, err)
            return message.reply(`${e.Deny} | Aconteceu um erro ao executar este comando, caso não saiba resolver, reporte o problema com o comando \`${prefix}bug\` ou entre no [meu servidor](${config.SupportServerLink}).\n\`${err}\``)

          })

        }).catch(err => {
          if (err.code === 10008)
            return message.channel.send(`${e.Warn} | Alguma das ${args[0]} mensagens acima é desconhecida ou o Discord está com lag.`)

          if (err.code === 50034)
            return message.channel.send(`${e.Warn} | As mensagens acima são velhas demais para eu apagar.`)

          message.reply(`${e.Deny} | Opa!\n\`${err}\``)
          return Error(message, err)
        })
      }).catch(err => {
        return message.reply(`${e.Deny} | Estou sem a permissão "Gerenciar Mensagens".`)
      })
    }

    function searchMember() {
      return message.mentions.members.first()
        || message.guild.members.cache.get(args[0])
        || message.guild.members.cache.get(args[1])
        || message.guild.members.cache.get(message.mentions.repliedUser?.id)
        || message.guild.members.cache.find(member => {
          return member.displayName?.toLowerCase() == args[0]?.toLowerCase()
            || member.user.username.toLowerCase() == args[0]?.toLowerCase()
            || member.user.tag.toLowerCase() == args[0]?.toLowerCase()
            || member.user.discriminator === args[0]
            || member.user.id === args[0]
            || member.user.username.toLowerCase() == args.join(' ')?.toLowerCase()
            || member.user.tag.toLowerCase() == args.join(' ')?.toLowerCase()
            || member.displayName?.toLowerCase() == args.join(' ')?.toLowerCase()
            || member.user.username.toLowerCase() == args[1]?.toLowerCase()
            || member.user.tag.toLowerCase() == args[1]?.toLowerCase()
            || member.displayName?.toLowerCase() == args[1]?.toLowerCase()
            || member.user.id === args[1]
            || member.user.discriminator === args[1]
            || member.user.username.toLowerCase() == args.slice(1).join(' ')?.toLowerCase()
            || member.user.tag.toLowerCase() == args.slice(1).join(' ')?.toLowerCase()
            || member.displayName.toLowerCase() == args.slice(1).join(' ')?.toLowerCase()
        })
    }

  }
}