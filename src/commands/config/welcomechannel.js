const { e } = require('../../../JSON/emojis.json')
const { Util } = require('discord.js')
const Notify = require('../../../modules/functions/plugins/notify')

module.exports = {
    name: 'welcomechannel',
    aliases: ['setwelcome', 'setwelcomechannel'],
    category: 'config',
    UserPermissions: ['MANAGE_CHANNELS'],
    ClientPermissions: ['SEND_MESSAGES', 'ADD_REACTIONS'],
    emoji: `${e.Loud}`,
    usage: '<welcomechannel> [#channel] | [off]',
    description: 'Selecione um canal para eu avisar todos que chegarem no servidor',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let guildData = await Database.Guild.findOne({ id: message.guild.id }, 'WelcomeChannel LeaveChannel'),
            channel = message.mentions.channels.first() || message.channel,
            canal = guildData.WelcomeChannel.Canal,
            WelcomeMsg = guildData.WelcomeChannel.Mensagem || 'entrou no servidor.',
            WelcomeEmoji = guildData.WelcomeChannel.Emoji || `${e.Join}`,
            channelWelcome = message.guild.channels.cache.get(canal)

        if (canal && !channelWelcome) {

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { $unset: { WelcomeChannel: 1 } }
            )

            return message.reply(`${e.Deny} | O canal presente no meu banco de dados não corresponde a nenhum canal deste servidor. Por favor, use o comando novamente.`)
        }

        if (['off', 'desligar'].includes(args[0]?.toLowerCase())) return SetWelcomeOff()
        if (['mensagem', 'edit', 'msg'].includes(args[0]?.toLowerCase())) return MsgEdit()
        if (['reset', 'delete', 'padrão'].includes(args[0]?.toLowerCase())) return ResetWelcome()
        if (['emoji', 'emote'].includes(args[0]?.toLowerCase())) return Emoji()
        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return Info()
        return SetWelcomeChannel()

        function Info() {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#246FE0')
                        .setTitle(`${e.Join} Sistema de Boas-vindas`)
                        .setDescription(`${e.SaphireObs} Com este sistema eu aviso sobre todas as pessoas que entrarem no servidor. Mando uma mensagem simples(customizada) no canal definido.`)
                        .addFields(
                            {
                                name: `${e.On} Ative`,
                                value: `\`${prefix}welcomechannel [#channel]\` Escolhe um canal`
                            },
                            {
                                name: `${e.Off} Desative`,
                                value: `\`${prefix}welcomechannel off\``
                            },
                            {
                                name: `${e.Loli} Personalize a mensagem`,
                                value: `\`${prefix}welcomechannel mensagem <A sua mensagem de boas vindas>\``
                            },
                            {
                                name: `${e.SaphireFeliz} Escolhe o emoji`,
                                value: `\`${prefix}welcomechannel emoji <EMOJI>\``
                            },
                            {
                                name: `${e.HiNagatoro} Reset para o padrão`,
                                value: `\`${prefix}welcomechannel reset\``
                            },
                            {
                                name: `${e.Reference} Canal Atual`,
                                value: channelWelcome ? `${channelWelcome} \`${channelWelcome.id}\`` : 'N/A'
                            },
                            {
                                name: `${e.Info} Informações`,
                                value: `\`${prefix}welcomechannel info\``
                            }
                        )
                ]
            })
        }

        async function ResetWelcome() {

            if (!canal) return message.reply(`${e.Deny} | O sistema de boas-vindas deve estar ativado para usar esta função.`)

            if (!guildData?.WelcomeChannel?.Mensagem && !guildData?.WelcomeChannel?.Emoji) return message.reply(`${e.Deny} | A minha mensagem de boas-vindas já é a padrão.`)

            await Database.Guild.updateOne(
                { id: message.guild.id },
                {
                    $unset: {
                        'WelcomeChannel.Emoji': 1,
                        'WelcomeChannel.Mensagem': 1
                    }
                }
            )

            return message.reply(`${e.Check} | ${message.author} resetou a minha mensagem de boas-vindas com sucesso!`)
        }

        async function MsgEdit() {
            if (!canal) return message.reply(`${e.Deny} | O sistema de boas-vindas deve estar ativado para usar esta função.`)

            let mensagem = args.slice(1).join(' ')
            if (!mensagem) return message.channel.send(`${e.Info} | Mensagem de boas-vindas padrão: **${WelcomeMsg}**\n${e.SaphireObs} | Caso queira personalizar, use \`${prefix}welcome mensagem A mensagem de boas vindas\``)
            if (mensagem.length > 1400) return message.reply(`${e.Deny} | A mensagem de boas-vindas não pode ultrapassar **1400 caracteres**.`)

            if (mensagem === WelcomeMsg) return message.reply(`${e.Deny} | Está já é a mensagem presente no meu banco de dados.`)

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { 'WelcomeChannel.Mensagem': mensagem }
            )

            return message.channel.send(`${e.Check} | ${message.author} alterou a mensagem de boas-vindas para:\n${WelcomeEmoji} | <@${client.user.id}> ${mensagem}`)
        }

        async function Emoji() {
            if (!canal) return message.reply(`${e.Deny} | O sistema de boas-vindas deve estar ativado para usar esta função.`)

            if (!args[1]) return message.reply(`${e.Info} | Tenta assim: \`${prefix}welcome emoji <EMOJI> (customizado pfo)\``)
            let emoji = Util.parseEmoji(args[1])
            if (args[2]) return message.reply(`${e.Deny} | Apenas o emoji, ok?`)

            if (args[1] === WelcomeEmoji) return message.reply(`${e.Deny} | Este é o mesmo emoji configurado na mensagem de boas-vindas atual.`)

            if (emoji.id) {

                await Database.Guild.updateOne(
                    { id: message.guild.id },
                    { 'WelcomeChannel.Emoji': args[1] }
                )

                return message.channel.send(`${e.Check} | ${message.author} alterou o emoji da mensagem de boas-vindas para:\n${args[1]} | <@${client.user.id}> ${WelcomeMsg}`)
            } else {
                message.reply(`${e.Deny} | Este emoji não é um emoji customizado.`)
            }
        }

        function SetWelcomeOff() {
            canal ? SetOff() : message.reply(`${e.Deny} | O Welcome System já está desativado.`)

            async function SetOff() {

                let msg = await message.reply(`${e.QuestionMark} | Deseja desativar o sistema de boas-vindas?`),
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
                            { $unset: { WelcomeChannel: 1 } }
                        )

                        validate = true
                        Notify(message.guild.id, 'Recurso desabilitado', `${message.author} \`${message.author.id}\` desativou o sistema de boas-vindas.`)
                        msg.edit(`${e.Check} | Prontinho! Agora eu não vou avisar quando alguém entrar no servidor.`).catch(() => { })
                    }

                    return collector.stop()

                })

                collector.on('end', () => {

                    if (!validate) return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return
                })
            }
        }

        async function SetWelcomeChannel() {

            if (channel.id === canal)
                return message.reply(`${e.Info} | Este canal já foi definido como Welcome Channel!`)

            let msg = await message.reply(`${e.QuestionMark} | Deseja ativar o sistema de boas-vindas no canal ${channel}?`),
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
                        { 'WelcomeChannel.Canal': channel.id }
                    )

                    validate = true
                    Notify(message.guild.id, 'Recurso ativado', `${message.author} \`${message.author.id}\` ativou o sistema de boas-vindas no canal ${channel}`)
                    msg.edit(`${e.Check} | Prontinho! Agora eu vou avisar no canal ${channel} sempre que alguém entrar no servidor. Se quiser alterar o emoji ou a mensagem, só usar o comando \`${prefix}welcomechannel info\``).catch(() => { })

                    if (!guildData.LeaveChannel.Canal) warnToActiveLeaveChannel()
                }

                return collector.stop()

            })

            collector.on('end', () => {

                if (!validate) return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                return
            })

        }

        async function warnToActiveLeaveChannel() {

            let msg = await message.channel.send(`${e.QuestionMark} | Hey, ${message.author}! Eu vi que nesse servidor, não está ativado o sistema de saídas. É igual o sistema de boas-vindas, só que o contrário. Eu aviso todos que sairem.\n> Se você quiser que eu ative o sistema de saídas no canal ${channel}, é só confirmar.`),
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
                        { 'LeaveChannel.Canal': channel.id }
                    )

                    validate = true
                    Notify(message.guild.id, 'Recurso ativado', `${message.author} \`${message.author.id}\` ativou o sistema de boas-vindas no canal ${channel}`)
                    msg.edit(`${e.Check} | Prontinho! Agora eu vou avisar sobre todos que entrarem e saírem do servidor.`).catch(() => { })
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