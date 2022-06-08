const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'report',
    aliases: ['reporte', 'denunciar', 'denuncia', 'rpt', 'reports', 'reportes'],
    category: 'servidor',
    ClientPermissions: ['MANAGE_MESSAGES'],
    emoji: `${e.Loud}`,
    usage: '<report> [user] <razão>',
    description: 'Reporte algo ou alguém para a staff do servidor',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        message.delete().catch(() => { })

        let guildData = await Database.Guild.findOne({ id: message.guild.id }, 'ReportChannel'),
            canalDB = guildData?.ReportChannel,
            channel = message.guild.channels.cache.get(canalDB),
            user = message.mentions.members.first() || message.mentions.repliedUser

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor('#246FE0') // red
                    .setTitle(`${e.Report} Sistema de e.Report`)
                    .setDescription(`Com o Sistema de Reports da ${client.user.username} habilitado, você torna seu servidor um lugar mais "regrado".`)
                    .addField(`${e.QuestionMark} O que é o sistema de report?`, 'Com o meu sistema de report, os membros poderão reportar coisas ou outros membros de qualquer canal do servidor, não precisa estar indo chamar mod/adm no privado para reportar.')
                    .addField(`${e.QuestionMark} Como funciona?`, 'Simples! o membro só precisa escrever `' + prefix + 'report blá blá blá` e o report será encaminhado para o canal definido. As mensagens serão deletadas na hora do envio, tornando o report anônimo e seguro. Os únicos que verão os reports, serão as pessoas que tem permissão para ver o canal definido.')
                    .addField('Comando de Ativação', '`' + prefix + 'reportchannel #Canal`')
                    .addField('Comando de Desativação', '`' + prefix + 'reportchannel off`')
                    .addField('Comando de Reporte', `\`${prefix}report [@user(opicional)] o motivo do seu report\``)
                    .setFooter({ text: `A ${client.user.username} não se responsabiliza pelo conteúdo enviado atráves deste sistema.` })
            ]
        })

        if (canalDB && !channel) {
            disableChannel()
            return message.channel.send(`${e.Deny} | O canal presente na minha database não corresponde a nenhum canal deste servidor. Eu tomei a liberdade de desativar o sistema de reporte deste servidor.\nPara ativar novamente, use o comando: \`${prefix}reportchannel [@channel]\``)
        }

        if (!channel) return message.channel.send({
            embeds: [
                new MessageEmbed()
                    .setColor('#246FE0')
                    .setTitle(`${e.Report} Nenhum canal de report definido.`)
                    .setDescription('Ooopa, parece que não definiram o canal de reports. Fale para alguém da Staff criar ou definir o canal, o comando é simples.\n \nCom está função, os membros são capazes de reportar coisas de qualquer canal para um canal especifico, geralmente exclusivo apenas para a moderação do servidor. As mensagens são apagadas, tornando anônimo o report, para evitar brigas e discussões.\n \nTem mais, não é necessário reportar só pessoas, você também pode reportar coisas do servidor sem precisar ficar marcando @alguém.')
                    .addField('Comando de Ativação', '`' + prefix + 'reportchannel #canal`')
                    .addField('Comando de desativação', '`' + prefix + 'reportchannel off`')
                    .addField('Comando de Reporte', `\`${prefix}report [@user(opicional)] o motivo do seu report\``)
                    .addField('Quer mais?', '`' + prefix + 'help report`')
            ]
        })

        if (!args[0]) return message.channel.send(`${e.Report} | Reporte usuários ou alguma coisa no servidor diretamente para a Staff.\n\`${prefix}report <@user(opicional)> O conteúdo do seu report\``)

        const ReportEmbed = new MessageEmbed().setColor('#246FE0').setTitle(`${e.Report} Novo Reporte Recebido`).addField('Autor do Reporte', `${message.author} | *\`${message.author.id}\`*`).setThumbnail(message.author.displayAvatarURL({ dynamic: true })).setTimestamp()

        let reason,
            memberReported

        reason = user ? args.slice(1).join(" ") : args.join(" ")
        memberReported = user ? `${user.user.tag} | *\`${user.id}\`*` : 'N/A'

        if (!reason || reason.length < 10 || reason.length > 1500)
            return message.channel.send(`${e.Info} | A razão do reporte deve estar entre \`10~1500 caracteres\``)

        if (user) ReportEmbed.addField('Membro Reportado', `${user}`)

        ReportEmbed.addField('Razão do Reporte', `${reason}`)

        channel.send({ embeds: [ReportEmbed] }).catch(err => {
            return message.channel.send(`${e.Warn} | Houve um erro ao enviar o report.\n${e.Reference} | \`${err}\`\n${e.Info} | Caso não saiba resolver, reporte o erro ao meu criado usando o comando \`${prefix}bug\``)
        })

        message.channel.send(`${e.CoolDoge} | nice.`)
        try {
            message.author.send(`${e.Check} | O seu report foi enviado com sucesso para a equipe do servidor **${message.guild.name}**.\n \n**Membro Reportado:** "${memberReported}"\n**Razão do Reporte:** "${reason}"`)
        } catch (err) {
            return message.channel.send(`${e.Info} | Parece que a sua DM está fechada. | Seu relatório foi enviado com sucesso, porém não pude enviar o relatório no seu privado.`)
        }

        async function disableChannel() {
            await Database.Guild.updateOne(
                { id: message.guild.id },
                { $unset: { ReportChannel: 1 } }
            )
            return
        }

    }
}