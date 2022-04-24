const { e } = require('../../../JSON/emojis.json')
const { Util } = require('discord.js')
const Notify = require('../../../modules/functions/plugins/notify')

module.exports = {
    name: 'leavechannel',
    aliases: ['canaldesaida', 'setleavechannel'],
    category: 'config',
    UserPermissions: ['MANAGE_CHANNELS'],
    ClientPermissions: ['SEND_MESSAGES', 'ADD_REACTIONS'],
    emoji: `${e.Loud}`,
    usage: '<leavechannel> [#channel] | [off]',
    description: 'Selecione um canal para eu avisar todos que chegarem no servidor',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let guildData = await Database.Guild.findOne({ id: message.guild.id }, 'LeaveChannel'),
            channel = message.mentions.channels.first() || message.channel,
            canalDB = guildData?.LeaveChannel?.Canal || null,
            leavechannel = message.guild.channels.cache.get(canalDB),
            LeaveMsg = guildData?.LeaveChannel?.Mensagem || 'saiu no servidor.',
            LeaveEmoji = guildData?.LeaveChannel?.Emoji || `${e.Leave}`

        if (canalDB && !leavechannel) {
            await Database.Guild.updateOne(
                { id: message.guild.id },
                { $unset: { LeaveChannel: 1 } }
            )
        }

        if (['off', 'desligar'].includes(args[0]?.toLowerCase())) return SetLeaveOff()
        if (['mensagem', 'edit', 'msg'].includes(args[0]?.toLowerCase())) return MsgEdit()
        if (['reset', 'delete', 'padrão'].includes(args[0]?.toLowerCase())) return ResetLeaveChannel()
        if (['emoji', 'emote'].includes(args[0]?.toLowerCase())) return Emoji()
        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return Info()

        return SetLeaveChannel()

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
                                value: `\`${prefix}leavechannel [#channel]\` Escolhe um canal`
                            },
                            {
                                name: `${e.Off} Desative`,
                                value: `\`${prefix}leavechannel off\``
                            },
                            {
                                name: `${e.Loli} Personalize a mensagem`,
                                value: `\`${prefix}leavechannel mensagem <A sua mensagem de boas vindas>\``
                            },
                            {
                                name: `${e.SaphireFeliz} Escolhe o emoji`,
                                value: `\`${prefix}leavechannel emoji <EMOJI>\``
                            },
                            {
                                name: `${e.HiNagatoro} Reset para o padrão`,
                                value: `\`${prefix}leavechannel reset\``
                            },
                            {
                                name: `${e.Info} Informações`,
                                value: `\`${prefix}leavechannel info\``
                            }
                        )
                ]
            })
        }

        async function ResetLeaveChannel() {

            if (!leavechannel) return message.reply(`${e.Info} | Este servidor não tem nenhum canal de saída configurado.`)

            if (!guildData?.LeaveChannel?.Mensagem && !guildData?.LeaveChannel?.Emoji) return message.reply(`${e.Deny} | A minha mensagem de saída já é a padrão.`)

            await Database.Guild.updateOne(
                { id: message.guild.id },
                {
                    $unset: {
                        'LeaveChannel.Emoji': 1,
                        'LeaveChannel.Mensagem': 1,
                    }
                }
            )

            return message.reply(`${e.Check} | ${message.author} resetou a minha mensagem de saída no servidor sucesso!`)
        }

        async function MsgEdit() {

            if (!leavechannel) return message.reply(`${e.Deny} | O sistema de saída deve estar ativado para utilizar esta função.`)

            let mensagem = args.slice(1).join(' ')
            if (!mensagem) return message.channel.send(`${e.Info} | Mensagem de saída padrão: **saiu do servidor**\n${e.SaphireObs} | Caso queira personalizar, use \`${prefix}leavechannel mensagem A mensagem de saída\``)
            if (mensagem.length > 1500) return message.reply(`${e.Deny} | A mensagem de saída não pode ultrapassar **1500 caracteres**.`)

            if (mensagem === LeaveMsg) return message.reply(`${e.Deny} | Está já é a mensagem configurada no Leave System deste servidor.`)

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { 'LeaveChannel.Mensagem': mensagem }
            )

            return message.channel.send(`${e.Check} | ${message.author} alterou a mensagem de saída para:\n> ${LeaveEmoji} | ${message.author} ${mensagem}`)
        }

        async function Emoji() {

            if (!leavechannel) return message.reply(`${e.Deny} | O sistema de saída deve estar ativado para utilizar esta função.`)

            if (!args[1]) return message.reply(`${e.Info} | Tenta assim: \`${prefix}leavechannel emoji <EMOJI> (apenas emojis customizados)\``)
            let emoji = Util.parseEmoji(args[1])
            if (args[2]) return message.reply(`${e.Deny} | Apenas o emoji, ok?`)

            if (args[1] === LeaveEmoji) return message.reply(`${e.Deny} | Este emoji já foi configurado como emoji do Leave System`)

            if (emoji.id) {

                await Database.Guild.updateOne(
                    { id: message.guild.id },
                    { 'LeaveChannel.Emoji': args[1] }
                )

                return message.channel.send(`${e.Check} | ${message.author} alterou o emoji da mensagem de saída para:\n${args[1]} | <@${client.user.id}> ${LeaveMsg}`)
            } else {
                message.reply(`${e.Deny} | Este emoji não é um emoji customizado.`)
            }
        }

        function SetLeaveOff() {
            return leavechannel ? SetOff() : message.reply(`${e.Deny} | O Leave System já está desativado.`)

            async function SetOff() {
                const msg = await message.reply(`${e.QuestionMark} | Você deseja desativar o Sistema de Saídas?`)

                let emojis = ['✅', '❌'],
                    validate = false

                for (let i of emojis) msg.react(i).catch(() => { })

                const collector = msg.createReactionCollector({
                    filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                    idle: 30000
                })

                    .on('collect', async (reaction) => {

                        if (reaction.emoji.name === emojis[0]) {

                            await Database.Guild.updateOne(
                                { id: message.guild.id },
                                { $unset: { 'LeaveChannel': 1 } }
                            )
                            validate = true
                            Notify(message.guild.id, 'Recurso desabilitado', `O sistema de saídas foi desabilitado por <@${message.author.id}> *\`${message.author.id}\`*`)
                            msg.edit(`${e.Check} | Você desabilitou o sistema de saída deste servidor.`)

                        }

                        return collector.stop()

                    })

                    .on('end', () => {

                        if (!validate) return msg.edit(`${e.Deny} | Comando cancelado.`)
                        return

                    })

            }
        }

        async function SetLeaveChannel() {

            if (channel.id === canalDB)
                return message.reply(`${e.Info} | Este canal já foi definido como Canal de Saídas!`)

            let msg = await message.reply(`${e.QuestionMark} | Deseja configurar "${channel}" como canal de saída?`),
                emojis = ['✅', '❌'],
                validate = false

            for (let i of emojis) msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000,
                errors: ['time']
            })

                .on('collect', async (reaction, user) => {

                    if (reaction.emoji.name === emojis[0]) {

                        await Database.Guild.updateOne(
                            { id: message.guild.id },
                            { 'LeaveChannel.Canal': channel.id }
                        )
                        validate = true
                        Notify(message.guild.id, 'Sistema Ativado', `<@${message.author.id}> *\`${message.author.id}\`* habilitou meu sistema de saídas e avisarei no canal "${channel} *\`${channel.id}\`*" sempre que um membro sair do servidor.`)
                        msg.edit(`${e.Check} | Sistema de saídas ativado com sucesso! Agora, quando qualquer membro sair do servidor, eu vou avisar no canal ${channel} que ele saiu.`)
                    }

                    return collector.stop()

                })

                .on('end', () => {

                    if (!validate) return msg.edit(`${e.Deny} | Comando cancelado`).catch(() => { })
                    return

                })


        }
    }
}