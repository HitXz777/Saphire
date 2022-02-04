const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const { ServerDb } = require('../../../Routes/functions/database')

module.exports = {
    name: 'reportchannel',
    aliases: ['setreportchannel'],
    category: 'config',
    UserPermissions: ['MANAGE_GUILD'],
    ClientPermissions: ['SEND_MESSAGES', 'ADD_REACTIONS'],
    emoji: `${e.ModShield}`,
    usage: '<reportchannel> [#canal]',
    description: 'Escolhe um canal para receber reports dos membros',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)
        let channel = message.mentions.channels.first() || message.channel
        let canal = ServerDb.get(`Servers.${message.guild.id}.ReportChannel`)

        const noargs = new MessageEmbed()
            .setColor('#246FE0') // red
            .setTitle(':loudspeaker: Sistema de Report')
            .setDescription('Com este comando, você ativará o meu sistema de report. Isso é bastante útil.')
            .addField(`${e.QuestionMark} O que é o sistema de report?`, 'Com o meu sistema de report, os membros poderão reportar coisas ou outros membros de qualquer canal do servidor, não precisa está indo chamar mod/adm no privado para reportar.')
            .addField(`${e.QuestionMark} Como funciona?`, 'Simples! o membro só precisa escrever `' + prefix + 'report blá blá blá` e o report será encaminhado para o canal definido. As mensagens serão deletadas na hora do envio, tornando o report anônimo e seguro, os únicos que verão o report, serão as pessoas que tem permissão para ver o canal definido.')
            .addField('Comando de Ativação', '`' + prefix + 'setreportchannel #Canal`')
            .addField('Comando de Desativação', '`' + prefix + 'setreportchannel off`')
            .setFooter(`A ${client.user.username} não se responsabiliza pelo conteúdo enviado atráves deste sistema.`)

        if (['help', 'ajuda'].includes(args[0]?.toLowerCase())) { return message.reply(noargs) }
        if (args[1]) return message.reply(`${e.Deny} | Nada além do canal coisinha fofa ${e.SaphireFeliz}`)

        if (args[0] === 'off') {
            if (!canal)
                return message.reply(`${e.Info} | O Report System já está desativado.`)

            return message.channel.send(`${e.Loading} | Ok, espera um pouquinho... | ${canal}/${message.author.id}`).then(msg => {
                sdb.delete(`Request.${message.author.id}`)
                ServerDb.delete(`Servers.${message.guild.id}.ReportChannel`)
                msg.edit(`${e.BrilanceBlob} | Nice, nice! Desativei o sistema de reports.`).catch(() => { })
            }).catch(err => { return message.channel.send(`${e.Warn} | Ocorreu um erro na execução deste comando.\n\`${err}\``) })

        }

        if (channel.id === canal) {
            return message.reply(`${e.Info} | Este canal já foi definido como Report Channel.`)
        } else if (channel !== canal) {
            return message.reply(`${e.Loading} | Ooopa, entendido! Pera só um pouco. | ${channel.id}/${message.author.id}`).then(msg => {
                sdb.delete(`Request.${message.author.id}`)
                ServerDb.set(`Servers.${message.guild.id}.ReportChannel`, channel.id)
                return msg.edit(`${e.NezukoJump} | Aeeee, sistema de report está ativadoooo!!\n\`${prefix}report [@user(opicional)] o seu reporte em diante\``)

            }).catch(err => {
                sdb.delete(`Request.${message.author.id}`)
                return message.channel.send(`${e.Warn} | Ocorreu um erro na execução deste comando.\n\`${err}\``)
            })
        }
    }
}