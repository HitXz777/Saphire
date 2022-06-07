const { e } = require('../../../JSON/emojis.json')
const ms = require('parse-ms')

module.exports = {
    name: 'ideia',
    aliases: ['sugerir', 'sugestão', 'ideias', 'sugestao'],
    category: 'servidor',
    ClientPermissions: ['ADD_REACTIONS', 'EMBED_LINKS'],
    emoji: '💭',
    usage: '<ideia> <sua ideia em diante>',
    description: 'Dê suas ideias para o servidor votar',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = await Database.User.findOne({ id: message.author.id }, 'Timeouts.ServerIdeia'),
            Time = user?.Timeouts?.ServerIdeia || 0,
            IdeiaTime = ms(80000 - (Date.now() - Time))

        if (client.Timeout(80000, Time))
            return message.reply(`${e.Loading} Calminha, este comando tem cooldown: \`${IdeiaTime.minutes}m e ${IdeiaTime.seconds}s\``)

        let guildData = await Database.Guild.findOne({ id: message.guild.id }, 'IdeiaChannel')
        let canal = guildData?.IdeiaChannel

        if (!canal) return message.reply({
            content: `${e.Deny} | O canal de ideias não existe no servidor`,
            embeds: [
                new MessageEmbed()
                    .setColor('#246FE0')
                    .setDescription(`${e.Info} | Graças ao meu sistema de organização, este é um dos comandos que requer um canal especifico para funcionamento.\n \nAs ideias e sugestões dos membros ficará em um canal para serem votadas pelos os outros membros. Bem... Se a administração do servidor assim quiser, é claro.`)
                    .addFields({ name: 'Comando de Ativação', value: `\`${prefix}ideiachannel\``, inline: true })
                    .addFields({ name: 'Comando de Desativação', value: `\`${prefix}ideiachannel off\``, inline: true })
            ]
        })

        let channel = message.guild.channels.cache.get(canal),
            content = args.join(" ")

        if (!content) return message.reply(`${e.Info} | Use este comando para enviar ideias para o servidor votar.\n\`${prefix}ideia A sua ideia em diante\``)
        if (content.length > 1500 || content.length < 10) return message.reply(`${e.Deny} | Tente colocar suas ideias dentro de **10~1500 caracteres**.`)

        const IdeiaEmbed = new MessageEmbed()
            .setColor('#246FE0')
            .setAuthor({ name: `${message.author.tag} enviou uma ideia`, iconURL: message.author.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }) })
            .setDescription(`${content || 'Algo deu errado aqui...'}`)
            .setFooter({ text: `${prefix}ideia` })
            .setTimestamp()

        return await channel.send({ embeds: [IdeiaEmbed] })
            .then(messageSended => {
                message.reply(`${e.Check} | A sua ideia foi enviada com sucesso no canal ${channel}`)
                for (let i of [`${e.Upvote}`, `${e.DownVote}`, `${e.QuestionMark}`]) messageSended.react(i).catch(() => { })
                return
            })
            .catch(err => {

                if (err.code === 50013)
                    return message.reply(`${e.Deny} | Eu não tenho permissão suficiente para enviar mensagem no canal ${channel}`)

                if (err.code === 50001)
                    return message.reply(`${e.Deny} | Eu não consigo enviar mensagem no canal ${channel}. Eu nem consigo chegar até lá...`)

                return message.channel.send(`${e.Warn} | Ocorreu um erro ao enviar a mensagem. Caso não saiba resolver o problema, use o comando \`${prefix}bug\` ou entre no meu servidor abrindo meu perfil e reporte o bug.\n\`${err}\``)
            })

    }
}