const { DatabaseObj } = require('../../../Routes/functions/database')
const { config, e, N } = DatabaseObj
const ms = require('parse-ms')
const Error = require('../../../Routes/functions/errors')

module.exports = {
    name: 'bug',
    aliases: ['sendbug', 'reportbug'],
    category: 'bot',
    emoji: '📨',
    usage: '<bug> <Report um bug>',
    description: 'Report bugs/erros diretamente pro meu criador',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (sdb.get(`Client.BlockUsers.${message.author.id}`))
            return message.reply(`${e.Deny} | Você está bloqueado e perdeu acesso aos seguintes comandos: \`${prefix}bug\` \`${prefix}sendcantada\` \`${prefix}ideiasaphire\` \`${prefix}gif\``)

        const noargs = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(`${e.Gear} Reporte bugs/erros`)
            .setDescription('Com este comando, você reporta bugs/erros direto pro meu criador. Assim tudo é resolvido de maneira rápida! *(Links são permitidos)*')
            .addField('Comando exemplo', `\`${prefix}bug Quando eu uso "comando x" tal bug acontece\``)
            .setFooter('Quaisquer abuso deste comando não será tolerado.')

        if (!args[0])
            return message.reply({ embeds: [noargs] })

        let time = ms(900000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Bug`)))
        if (sdb.get(`Users.${message.author.id}.Timeouts.Bug`) !== null && 900000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Bug`)) > 0)
            return message.reply(`⏱️ | Global Cooldown | \`${time.hours}h ${time.minutes}m e ${time.seconds}s\``).catch(() => { })

        let mensagem = args.join(" ")
        if (mensagem === 'Quando eu uso "comando x" tal bug acontece') return message.reply(`${e.Nagatoro} | Está mensagem claramente não é permitida, né?`)
        if (mensagem.length < 10 || mensagem.length > 1000)
            return message.reply(`${e.Deny} | Por favor, relate o bug dentro de **10~1000 caracteres.** Se quiser usar mais, use o comando \`${prefix}bin\``)

        async function WithChannel() {
            sdb.set(`Users.${message.author.id}.Timeouts.Bug`, Date.now())
            message.channel.createInvite({ maxAge: 0 }).then(async ChannelInvite => {
                const ReportBugEmbed = new MessageEmbed().setColor('RED').setTitle('📢 Report de Bug/Erro Recebido').addField('Enviado por', `${message.author.tag} (*\`${message.author.id}\`*)`, true).addField('Servidor', `[${message.guild.name}](${ChannelInvite.url}) (*${message.guild.id}*)\nMensagem: [Link](${message.url})`).addField('Relatório', mensagem)
                if (!config.BugsChannelId) {
                    return message.reply(`${e.Deny} | Eu não encontrei o canal de envio no meu servidor central.\nPor favor, contacte meu criador --> ${N.Rody} <---`)
                } else {
                    const channel = await client.channels.cache.get(config.BugsChannelId);
                    if (!channel) {
                        return message.reply(`${e.Deny} | Eu não encontrei o canal de envio no meu servidor central.\nPor favor, contacte meu criador --> ${N.Rody} <---`)
                    } else {
                        channel.send({ embeds: [ReportBugEmbed] }).then(() => {
                            message.reply(`${e.Check} | Seu reporte foi enviado com sucesso!\nVocê vai receber uma recompensa no banco em breve.`)
                        }).catch(err => {
                            Error(message, err)
                            return message.reply(`${e.Deny} | Ocorreu um erro no envio da mensagem... Contacte meu criador, por favor. --> **${N.Rody}** <--\n\`${err}\``)
                        })
                    }
                }
            }).catch(() => {
                Error(message, err)
                WithoutChannel()
            })
        }

        async function WithoutChannel() {
            sdb.set(`Users.${message.author.id}.Timeouts.Bug`, Date.now())
            const ReportBugEmbed = new MessageEmbed().setColor('RED').setTitle('📢 Report de Bug/Erro Recebido').addField('Enviado por', `${message.author.tag} (*\`${message.author.id}\`*)`, true).addField('Servidor', `${message.guild.name} (*${message.guild.id}*)\nMensagem: [Link](${message.url})`).addField('Relatório', mensagem)
            if (!config.BugsChannelId) { return message.reply(`${e.Deny} | Eu não encontrei o canal de envio no meu servidor central.\nPor favor, contacte meu criador --> ${N.Rody} <---`) } else {
                const channel = await client.channels.cache.get(config.BugsChannelId); if (!channel) { return } else {
                    channel.send({ embeds: [ReportBugEmbed] }).then(() => {
                        message.reply(`${e.Check} | Seu reporte foi enviado com sucesso!\nVocê vai receber uma recompensa no banco em breve.`)
                    }).catch(err => {
                        Error(message, err)
                        return message.reply(`${e.Deny} | Ocorreu um erro no envio da mensagem... Contacte meu criador, por favor. --> ${N.Rody} <--\n\`${err}\``)
                    })
                }
            }
        }

        message.channel ? WithChannel() : WithoutChannel()
    }
}