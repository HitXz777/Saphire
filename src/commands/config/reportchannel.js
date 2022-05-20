const { e } = require('../../../JSON/emojis.json'),
    Notify = require('../../../modules/functions/plugins/notify')

module.exports = {
    name: 'reportchannel',
    aliases: ['setreportchannel'],
    category: 'config',
    UserPermissions: ['MANAGE_GUILD'],
    ClientPermissions: ['SEND_MESSAGES', 'ADD_REACTIONS'],
    emoji: `${e.ModShield}`,
    usage: '<reportchannel> [#canal]',
    description: 'Escolhe um canal para receber reports dos membros',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let channel = message.mentions.channels.first() || message.channel,
            guildData = await Database.Guild.findOne({ id: message.guild.id }, 'ReportChannel'),
            canalDB = guildData?.ReportChannel

        if (['help', 'ajuda', 'info'].includes(args[0]?.toLowerCase())) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('RED')
                    .setTitle(':loudspeaker: Sistema de Report')
                    .setDescription('Com este comando, você ativará o meu sistema de report. Isso é bastante útil.')
                    .addField(`${e.QuestionMark} O que é o sistema de report?`, 'Com o meu sistema de report, os membros poderão reportar coisas ou outros membros de qualquer canal do servidor, não precisa está indo chamar mod/adm no privado para reportar.')
                    .addField(`${e.QuestionMark} Como funciona?`, 'Simples! o membro só precisa escrever `' + prefix + 'report blá blá blá` e o report será encaminhado para o canal definido. As mensagens serão deletadas na hora do envio, tornando o report anônimo e seguro, os únicos que verão o report, serão as pessoas que tem permissão para ver o canal definido.')
                    .addField('Comando de Ativação', '`' + prefix + 'setreportchannel #Canal`')
                    .addField('Comando de Desativação', '`' + prefix + 'setreportchannel off`')
                    .setFooter({ text: `A ${client.user.username} não se responsabiliza pelo conteúdo enviado atráves deste sistema.` })
            ]
        })

        if (['off', 'del', 'desativar', 'desligar', 'deletar'].includes(args[0])) return turnOff()

        if (channel.id === canalDB) return message.reply(`${e.Info} | Este canal já foi definido como Report Channel.`)

        let msg = await message.reply(`${e.Loading} | Quer ativar o sistema de reports neste servidor?`),
            emojis = ['✅', '❌'],
            validate = false

        for (let i of emojis) msg.react(i).catch(() => { })

        const collector = msg.createReactionCollector({
            filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
            time: 30000,
            errors: ['time']
        })

        collector.on('collect', async (reaction) => {

            if (reaction.emoji.name === emojis[0]) {

                await Database.Guild.updateOne(
                    { id: message.guild.id },
                    { ReportChannel: channel.id }
                )

                validate = true
                Notify(message.guild.id, 'Recurso Ativado', `<@${message.author.id}> *\`${message.author.id}\`* ativou o sistema de Reports no servidor.`)
                msg.edit(`${e.Check} | Ativadinho! Para reportar algo ou alguém, use o comando \`${prefix}report [@user(opicional)] e o seu report adiante...\``).catch(() => { })
            }

            return collector.stop()

        })

        collector.on('end', () => {

            if (!validate) return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
            return
        })



        async function turnOff() {

            if (!canalDB) return message.reply(`${e.Deny} | Não há nenhum canal de report deste servidor no meu banco de dados.`)

            let msg = await message.reply(`${e.QuestionMark} | Deseja desativar o sistem de reports no servidor?`),
                emojis = ['✅', '❌'],
                validate = false

            for (let i of emojis) msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000,
                errors: ['time']
            })

            collector.on('collect', async (reaction) => {

                if (reaction.emoji.name === emojis[0]) {

                    await Database.Guild.updateOne(
                        { id: message.guild.id },
                        { $unset: { ReportChannel: 1 } }
                    )

                    validate = true
                    msg.edit(`${e.Check} | Canal de report desativado.`).catch(() => { })
                    Notify(message.guild.id, 'Recurso desabilitado', `<@${message.author.id}> *\`${message.author.id}\`* desativou o Canal de Reportes no servidor.`)
                }

                return collector.stop()

            })

            collector.on('end', () => {

                if (!validate) return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                return
            })
        }
    }
}