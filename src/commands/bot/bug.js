const { DatabaseObj: { config, e } } = require('../../../modules/functions/plugins/database'),
    Error = require('../../../modules/functions/config/errors')

module.exports = {
    name: 'bug',
    aliases: ['sendbug', 'reportbug'],
    category: 'bot',
    emoji: '📨',
    usage: '<bug> <Report um bug>',
    description: 'Report bugs/erros diretamente pro meu criador',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let clientData = await Database.Client.findOne({ id: client.user.id }, 'BlockedUsers'),
            userData = await Database.User.findOne({ id: message.author.id }, 'Timeouts'),
            blocked = clientData?.BlockedUsers || [],
            timeoutBug = userData?.Timeouts?.Bug || 0,
            N = Database.Names

        if (blocked.includes(message.author.id))
            return message.reply(`${e.Deny} | Você está bloqueado e perdeu acesso ao comando \`${prefix}bug\``)

        if (!args[0])
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#246FE0')
                        .setTitle(`${e.Gear} Reporte bugs/erros`)
                        .setDescription('Com este comando, você reporta bugs/erros direto pro meu criador. Assim tudo é resolvido de maneira rápida! *(Links são permitidos)*')
                        .addField('Comando exemplo', `\`${prefix}bug Quando eu uso "comando x" tal bug acontece\``)
                        .setFooter({ text: 'Quaisquer abuso deste comando não será tolerado.' })
                ]
            })

        if (client.Timeout(900000, timeoutBug))
            return message.reply(`⏱️ | Global Cooldown | \`${client.GetTimeout(900000, timeoutBug)}\``).catch(() => { })

        let mensagem = args.join(" ")
        if (mensagem === 'Quando eu uso "comando x" tal bug acontece') return message.reply(`${e.Nagatoro} | Está mensagem claramente não é permitida, né?`)
        if (mensagem.length < 10 || mensagem.length > 1000) return message.reply(`${e.Deny} | Por favor, relate o bug dentro de **10~1000 caracteres.** Se quiser usar mais, use o comando \`${prefix}bin\``)

        async function SendReport() {

            Database.SetTimeout(message.author.id, 'Timeouts.Bug')

            let ChannelInvite = await message.channel.createInvite({ maxAge: 0 }).catch(err => { }) || null
            let messageField = ChannelInvite?.url
                ? `[${message.guild.name}](${ChannelInvite.url})`
                : message.guild.name

            let ReportBugEmbed = new MessageEmbed()
                .setColor('RED')
                .setTitle('📢 Report de Bug/Erro Recebido')
                .addField('Enviado por', `${message.author.tag} (*\`${message.author.id}\`*)`, true)
                .addField('Servidor', `${messageField} - *\`${message.guild.id}\`*\nMensagem: [Link](${message.url})`)
                .addField('Relatório', mensagem),
                channel = client.channels.cache.get(config.BugsChannelId)

            if (!config.BugsChannelId || !channel) return message.reply(`${e.Deny} | Eu não encontrei o canal de envio no meu servidor central.\nPor favor, contacte meu criador --> ${client.users.cache.get(N.Rody)?.tag || 'Indefnido'} <---`)

            channel.send({ embeds: [ReportBugEmbed] }).catch(err => {
                Error(message, err)
                return message.reply(`${e.Deny} | Ocorreu um erro no envio da mensagem... Contacte meu criador, por favor. --> **${client.users.cache.get(N.Rody)?.tag || 'Indefnido'}** <--\n\`${err}\``)
            })

            return message.reply(`${e.Check} | Seu reporte foi enviado com sucesso!\nVocê irá receber uma quantia de Safiras em breve.`)

        }

        return SendReport()

    }
}