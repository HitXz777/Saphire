const { e } = require('../../../database/emojis.json')
const { ServerDb } = require('../../../Routes/functions/database')

module.exports = {
    name: 'report',
    aliases: ['reporte', 'denunciar', 'denuncia', 'rpt'],
    category: 'servidor',
    ClientPermissions: ['MANAGE_MESSAGES'],
    emoji: `${e.Loud}`,
    usage: '<report> [user] <razão>',
    description: 'Reporte algo ou alguém para a staff do servidor',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        try {
            message.delete()
        } catch (err) {
            return message.channel.send(`${e.Deny} | Houve um erro na execução deste comando. Verifique se eu tenho a permissão **GERENCIAR MENSAGENS**\n\`${err}\``)
        }

        const help = new MessageEmbed()
            .setColor('#246FE0') // red
            .setTitle(`${e.Report} Sistema de e.Report`)
            .setDescription(`Com o Sistema de Reports da ${client.user.username} habilitado, você torna seu servidor um lugar mais "regrado".`)
            .addField(`${e.QuestionMark} O que é o sistema de report?`, 'Com o meu sistema de report, os membros poderão reportar coisas ou outros membros de qualquer canal do servidor, não precisa estar indo chamar mod/adm no privado para reportar.')
            .addField(`${e.QuestionMark} Como funciona?`, 'Simples! o membro só precisa escrever `' + prefix + 'report blá blá blá` e o report será encaminhado para o canal definido. As mensagens serão deletadas na hora do envio, tornando o report anônimo e seguro. Os únicos que verão os reports, serão as pessoas que tem permissão para ver o canal definido.')
            .addField('Comando de Ativação', '`' + prefix + 'reportchannel #Canal`')
            .addField('Comando de Desativação', '`' + prefix + 'reportchannel off`')
            .addField('Comando de Reporte', `\`${prefix}report [@user(opicional)] o motivo do seu report\``)
            .setFooter(`A ${client.user.username} não se responsabiliza pelo conteúdo enviado atráves deste sistema.`)

        const nochannel1 = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(`${e.Report} Nenhum canal de report definido.`)
            .setDescription('Ooopa, parece que não definiram o canal de reports. Fale para alguém da Staff criar ou definir o canal, o comando é simples.\n \nCom está função, os membros são capazes de reportar coisas de qualquer canal para um canal especifico, geralmente exclusivo apenas para a moderação do servidor. As mensagens são apagadas, tornando anônimo o report, para evitar brigas e discussões.\n \nTem mais, não é necessário reportar só pessoas, você também pode reportar coisas do servidor sem precisar ficar marcando @alguém.')
            .addField('Comando de Ativação', '`' + prefix + 'reportchannel #canal`')
            .addField('Comando de desativação', '`' + prefix + 'reportchannel off`')
            .addField('Comando de Reporte', `\`${prefix}report [@user(opicional)] o motivo do seu report\``)
            .addField('Quer mais?', '`' + prefix + 'help report`')

        const channel = message.guild.channels.cache.get(ServerDb.get(`Servers.${message.guild.id}.ReportChannel`))
        let user = message.mentions.members.first() || message.mentions.repliedUser

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) { return message.channel.send({ embeds: [help] }) }
        if (!channel || channel === null || channel === undefined) { return message.channel.send({ embeds: [nochannel1] }) }
        if (!channel) { return message.channel.send(`${e.Info} Parece que o canal de report foi excluido.`) }
        if (!args[0]) { return message.channel.send(`${e.Report} | Reporte usuários ou alguma coisa no servidor diretamente para a Staff.\n\`${prefix}report <@user(opicional)> O conteúdo do seu report\``) }

        const ReportEmbed = new MessageEmbed().setColor('#246FE0').setTitle(`${e.Report} Novo Reporte Recebido`).addField('Autor do Reporte', `${message.author} | *\`${message.author.id}\`*`).setThumbnail(message.author.displayAvatarURL({ dynamic: true })).setTimestamp()

        if (!user) {
            ReportEmbed.addField('Razão do Reporte', `${args.join(" ")}`)
            channel.send({ embeds: [ReportEmbed] }).then(() => {
                return message.author.send(`${e.Check} | O seu report foi enviado com sucesso para a equipe do servidor **${message.guild.name}**.\n \n**Membro Reportado:** "Ninguém"\n**Razão do Reporte:** "${args.join(" ")}"`).then(() => {
                    message.channel.send(`${e.CoolDoge} nice.`)
                }).catch(() => {
                    return message.channel.send(`${e.Info} | Parece que a sua DM está fechada. | Seu relatório foi enviado com sucesso, porém não pude enviar o relatório no seu privado.`)
                })
            }).catch(err => {
                return message.channel.send(`${e.Warn} | Ocorreu um erro na execução deste comando.\n\`${err}\``)
            })
        } else if (user) {
            ReportEmbed.addField('Membro Reportado', `${user}`).addField('Razão do Reporte', `${args.slice(1).join(" ")}`)
            channel.send({ embeds: [ReportEmbed] }).then(() => {
                message.channel.send(`${e.CoolDoge} nice.`)
                return message.author.send(`${e.Check} | O seu report foi enviado com sucesso para a equipe do servidor **${message.guild.name}**.\n \n**Membro Reportado:** "${user} *\`${user.id}\`*"\n**Razão do Reporte:** "${args.slice(1).join(" ")}"`).catch(err => {
                    return message.channel.send(`${e.Info} | Parece que a sua DM está fechada. | Seu relatório foi enviado com sucesso, porém não pude enviar o relatório no seu privado.`)
                })
            }).catch(err => {
                return message.channel.send(`${e.Warn} | Ocorreu um erro na execução deste comando.\n\`${err}\``)
            })
        } else {
            return message.channel.send(`${e.Deny} | Para reportar alguém membro, marque a pessoa em primeiro lugar, depois continue com o reporte.\n\`${prefix}rpt @user A sua denúncia em diante\``)
        }

    }
}