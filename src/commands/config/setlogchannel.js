const { Permissions } = require('discord.js'),
    { e } = require('../../../JSON/emojis.json'),
    Notify = require('../../../modules/functions/plugins/notify')

module.exports = {
    name: 'setlogchannel',
    aliases: ['logs', 'setlogs', 'logchannel', 'log', 'gsn', 'notification'],
    category: 'config',
    UserPermissions: ['MANAGE_GUILD'],
    ClientPermissions: ['ADD_REACTIONS', 'VIEW_AUDIT_LOG', 'MANAGE_CHANNELS'],
    emoji: `${e.ModShield}`,
    usage: '<logs> [on/off] <#channel>',
    description: 'Canal de referência para o sistema 🛰️ | **Global System Notification**',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let channel = message.mentions.channels.first() || message.channel,
            guildData = await Database.Guild.findOne({ id: message.guild.id }, 'LogChannel'),
            atual = guildData?.LogChannel,
            ChannelAtual = message.guild.channels.cache.get(atual)

        if (atual && !ChannelAtual) {
            deleteLogs()
            return message.channel.send(`${e.Deny} | Detectei que o canal GSN presente no meu banco de dados não é compatível com nenhum canal deste servidor. Por favor, use o comando novamente.`)
        }

        if (!args[0]) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#246FE0')
                    .setTitle(`🛰️ | Global System Notification`)
                    .setDescription('Este sistema abrange todos os meus servidores em uma checagem continua, verificando se está tudo bem com todos os servidores. Quaisquer alteração que resulta na quebra de segurança do servidor, eu avisarei no canal pré-definido neste comando.')
                    .addField(`${e.QuestionMark} O que é isso?`, `Este sistema é responsável por notificar as atividades do servidor em uma escala geral. Os dados fornecido de cada ação é processado pelo meu sistema e enviado de uma forma clara e objetiva ao canal pré-definido em uma forma de histórico de acontecimentos disponível ou não para todos do servidor perante o desejo da staff.`)
                    .addField(`${e.QuestionMark} O que eu envio no Sistema GSN?`, `\`Banimentos/Kicks\` Relatarei os dados do banimento/expulsão. Mesmo que não tenha sido feito através dos meus comandos -> \`${prefix}ban / ${prefix}kick\`\n\`Mute/Warns\` Relatório e informações sob o ato também serão fornecidos\n\`Autorole System\` Qualquer quebra de segurança ou mudança brusca nos cargos e erros serão notificados\n\`Canais de Configurações\` Na exclusão de canais com configurações minhas ativadas, também será notificado.`)
                    .addField(`${e.QuestionMark} O que eu não envio no Sistema GSN?`, `\`${prefix}welcomechannel\` - Novos Membros\n\`${prefix}leavechannel\`- Membros que sairem \nMensagens Apagadas/Editadas\nCargos/Canais editados`)
                    .addField(`${e.Gear} Comandos`, `\`${prefix}logs on/off <#channel>\` Ative/Desative o Sistema GSN\n\`${prefix}logs create\` Deixa que eu crio um canal pro Sistema GSN`)
                    .addField(`${e.Reference} Canal Atual`, ChannelAtual ? `${ChannelAtual} \`${ChannelAtual.id}\`` : 'N/A')
                    .setFooter({ text: 'Permissão necessária: "Ver o registro de auditoria | Adicionar reações | Gerenciar Canais"' })
            ]
        })

        if (['on', 'ligar', 'ativar'].includes(args[0]?.toLowerCase())) return LogsON()
        if (['off', 'desligar', 'desativar'].includes(args[0]?.toLowerCase())) return LogsOff()
        if (['create', 'criar', 'novo'].includes(args[0]?.toLowerCase())) return LogsCreate()

        return message.reply(`Comando não reconhecido. Use \`${prefix}help gsn\` ou \`${prefix}gsn\` para obter mais informações.`)

        async function LogsON() {

            if (channel.id === atual) return message.reply(`${e.Deny} | Este canal é o mesmo que foi configurado no meu banco de dados.`)

            let msg = await message.reply(`${e.QuestionMark} | Deseja ativar o meu sistema de GSN no servidor usando o canal ${channel}?`),
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
                        { LogChannel: channel.id }
                    )

                    validate = true
                    Notify(message.guild.id, 'Recurso Ativado', `<@${message.author.id}> \`${message.author.id}\` ativou o sitema GSN no servidor.`)
                    msg.edit(`${e.Check} | Certo! Deixa o resto comigo agora.`).catch(() => { })
                }

                return collector.stop()

            })

            collector.on('end', () => {

                if (!validate) return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                return
            })

        }

        async function LogsOff() {

            if (!atual) return message.reply(`${e.Info} | O Sistema GSN já está desativado.`)

            let msg = await message.reply(`${e.QuestionMark} | Deseja desativar o sistema GSN?`),
                emojis = ['✅', '❌'],
                validate = false

            for (let i of emojis) msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000,
                errors: ['time']
            })

            collector.on('collect', (reaction) => {

                if (reaction.emoji.name === emojis[0]) {

                    deleteLogs()

                    validate = true
                    msg.edit(`${e.Check} | O Sistema GSN foi desabilitado com sucesso!`).catch(() => { })
                }

                return collector.stop()

            })

            collector.on('end', () => {

                if (!validate) return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                return
            })
        }

        async function LogsCreate() {

            if (ChannelAtual) return message.reply(`${e.Info} | O canal atual do Sistema GSN é esse aqui: ${ChannelAtual}`)

            let msg = await message.reply(`${e.QuestionMark} | Você permite que eu crie um canal novo e ative o Sistema GSN?`),
                emojis = ['✅', '❌'],
                validate = false

            for (let i of emojis) msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000,
                errors: ['time']
            })

            collector.on('collect', (reaction) => {

                if (reaction.emoji.name === emojis[0]) {

                    message.guild.channels.create('log-channel', {
                        type: 'GUILD_TEXT',
                        permissionOverwrites: [
                            {
                                id: message.guild.id,
                                deny: [Permissions.FLAGS.SEND_MESSAGES],
                            },
                        ],
                    }).then(async channel => {

                        await Database.Guild.updateOne(
                            { id: message.guild.id },
                            { LogChannel: channel.id }
                        )

                        Notify(message.guild.id, 'Recurso Ativado', `<@${message.author.id}> \`${message.author.id}\` ativou o sitema GSN no servidor.`)

                    }).catch(err => {
                        return message.reply(`${e.Deny} | Ocorreu um erro ao criar o novo canal.\n\`${err}\``)
                    })

                    validate = true
                    Notify()
                    msg.edit(`${e.Check} | Prontinho!`).catch(() => { })
                }

                return collector.stop()

            })

            collector.on('end', () => {

                if (!validate) return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                return
            })

        }

        async function deleteLogs() {
            await Database.Guild.updateOne(
                { id: message.guild.id },
                { $unset: { LogChannel: 1 } }
            )
            return
        }

    }
}