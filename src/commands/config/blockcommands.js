const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'blockcommands',
    aliases: ['bloquearcomando', 'commandblock', 'nocomands', 'cmdblock', 'nocommand', 'blockcomand', 'blockcommand', 'lockcommand', 'nocomand'],
    category: 'config',
    emoji: e.ModShield,
    usage: '<blockcommands> <info>',
    description: 'Bloqueie comandos especificos em canais especificos',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let guildData = await Database.Guild.findOne({ id: message.guild.id }, 'CommandBlocks'),
            blockCommands = guildData.CommandBlocks || [],
            command = client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0])),
            channel = message.mentions.channels.first() || message.channel,
            imutable = ['blockcommands', 'afk', 'help', 'bgconfig', 'botinfo', 'bug', 'donate', 'faq', 'invite', 'mods', 'ping', 'premium', 'vip']
        if (['status', 'stat', 'stats', 's'].includes(args[0]?.toLowerCase())) return blockersStatus()
        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return commandInfo()

        if (!message.member?.permissions?.toArray()?.includes('ADMINISTRATOR'))
            return message.reply(`${e.Deny} | Este comando é restrito apenas para os administradores do servidor.`)

        if (['remove', 'del', 'delete', 'excluir', 'unlock'].includes(args[0]?.toLowerCase())) return unlockCommand()
        if (command) return lockCommand()

        if (args[0])
            return message.reply(`${e.Info} | Argumento inválido. Tenta usar o comando \`${prefix}blockcommands info\``)

        return message.reply(`${e.SaphireOk} | Com esse comando você bloqueia comandos, legal né? Usa isso aqui pra você entender melhor: \`${prefix}blockcommands info\``)

        async function unlockCommand() {

            if (['all', 'todos', 'tudo'].includes(args[1]?.toLowerCase())) return removeAllData()
            if (['channel', 'canal'].includes(args[1]?.toLowerCase())) return removeChannelData()

            command = client.commands.get(args[1]) || client.commands.get(client.aliases.get(args[1]))
            if (!command) return message.reply(`${e.Info} | Você precisa me dizer um comando que exista no meu sistema para que eu possa efetuar o desbloqueio.`)

            if (!blockCommands.some(data => data.cmd === command.name))
                return message.reply(`${e.Info} | Esse comando não está bloqueado em nenhum lugar do servidor.`)

            if (blockCommands.some(data => data.cmd === command.name && data.all) || ['all', 'todos', 'tudo'].includes(args[2]?.toLowerCase())) {

                await Database.Guild.updateOne(
                    { id: message.guild.id },
                    { $pull: { CommandBlocks: { cmd: command.name } } }
                )

                return message.reply(`${e.Check} | O comando **\`${prefix}${command.name}\`** foi desbloqueado em todo o servidor.`)

            }

            if (!blockCommands.some(data => data.cmd === command.name && data.channel === channel.id))
                return message.reply(`${e.SaphireOk} | Esse comando não está bloqueado neste canal.\n${e.Info} | Para mais detalhes, use o comando \`${prefix}lockcommand status\`.`)

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { $pull: { CommandBlocks: { cmd: command.name, channel: channel.id } } }
            )

            return message.reply(`${e.Check} | Tudo certo! O comando **\`${prefix}${command.name}\`** foi desbloqueado no canal ${channel}.`)

            async function removeAllData() {

                if (!blockCommands || blockCommands.length === 0)
                    return message.reply(`${e.Deny} | Esse servidor não tem nenhum comando bloqueado.`)

                await Database.Guild.updateOne(
                    { id: message.guild.id },
                    { $unset: { CommandBlocks: 1 } }
                )

                return message.reply(`${e.SaphireOk} | Ok ok! Todos os comandos foram liberados.`)

            }

            async function removeChannelData() {

                if (!blockCommands || blockCommands.length === 0)
                    return message.reply(`${e.Deny} | Esse servidor não tem nenhum comando bloqueado.`)

                if (!blockCommands.some(data => data.channel === channel.id))
                    return message.reply(`${e.Deny} | ${channel.id === message.channel.id ? 'Esse canal' : `O canal ${channel}`} não tem nenhum comando bloqueado.`)

                await Database.Guild.updateOne(
                    { id: message.guild.id },
                    { $pull: { CommandBlocks: { channel: channel.id } } }
                )

                return message.reply(`${e.SaphireOk} | Woooh! Todos os comandos bloqueados ${channel.id === message.channel.id ? 'desse canal' : `do canal ${channel}`} foram liberados.`)

            }

        }

        async function lockCommand() {

            if (imutable.includes(command.name) || command.category === 'admin')
                return message.reply(`${e.Deny} | Esse comando não pode ser bloqueado.`)

            let all = ['all', 'todos', 'tudo'].includes(args[1]?.toLowerCase())

            if (blockCommands.some(data => data.cmd === command.name && data.all))
                return message.reply(`${e.Info} | Esse comando já foi bloqueado em todo o servidor.`)

            if (!all && blockCommands.some(data => data.cmd === command.name && data.channel === channel.id))
                return message.reply(`${e.Info} | Esse comando já foi bloqueado ${channel.id === message.channel.id ? 'neste canal' : `no canal ${channel}`}.`)

            let buildBlock = { cmd: command.name }

            all
                ? buildBlock.all = true
                : buildBlock.channel = channel.id

            if (all) {
                await Database.Guild.updateOne(
                    { id: message.guild.id },
                    { $pull: { CommandBlocks: { cmd: command.name } } }
                )
            }

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { $push: { CommandBlocks: buildBlock } }
            )

            let adicionalText = all
                ? 'em todo o servidor'
                : channel.id === message.channel.id
                    ? 'neste canal'
                    : `no canal ${channel}`

            return message.reply(`${e.Check} | Tudo certo! O comando **\`${prefix}${command.name}\`** foi bloqueado ${adicionalText}.`)

        }

        function commandInfo() {
            return message.reply(
                {
                    embeds: [
                        new MessageEmbed()
                            .setColor(client.blue)
                            .setTitle(`${e.Gear} ${client.user.username}'s Commands Management`)
                            .setDescription('Hey! Você pode bloquear comandos usando esse comando, sabia?\nTutorialzinho: \`<> Obrigatório | [] Opicional\`')
                            .addFields(
                                {
                                    name: '🔒 Bloqueie comandos',
                                    value: `▫️ \`${prefix}blockcommands <NomeDoComando> [#channel] [all]\`\n> Você pode usar os atalhos dos comandos também, deixa que meu sistema de busca da conta do recado ${e.SaphireOk}\n> Utilizando o \`all\`, você efetua o bloqueio do comando em todos os canais do servidor. Se mencionar um \`#canal\`, vou bloquear o comando no canal mencionado.`
                                },
                                {
                                    name: '🔓 Desbloqueie comandos',
                                    value: `▫️ \`${prefix}blockcommands <unlock> <NomeDoComando> [#channel] [all]\`\n> A opção \`all\` também funciona aqui, mas é para desbloquear o comando em tudo que é lugar.\n \n▫️ \`${prefix}blockcommands <unlock> <all>\`\n> Aqui você libera todos os comandos de todos os canais, sem exceções.\n \n▫️ \`${prefix}blockcommands unlock <#channel>\`\n> E neste aqui, você libera o canal para todos os comandos que estavam bloqueados nele.\n \n▫️ \`${prefix}blockcommands unlock <NomeDoComando> <all>\`\n> Por último e não menos importante. Nesse aqui, você desbloqueia o comando mencionado em todo o servidor, sem mecher nas outras configurações :D`
                                },
                                {
                                    name: `${e.Info} Status Data`,
                                    value: `▫️ \`${prefix}blockcommands <status>\`\n> Informações detalhadas de todos os comandos que foram bloqueados e em quais canais.`
                                },
                                {
                                    name: '+ Atalhos',
                                    value: `${['bloquearcomando', 'commandblock', 'nocomands', 'cmdblock', 'nocommand', 'blockcomand', 'blockcommand', 'lockcommand', 'nocomand'].map(a => `\`${a}\``).join(', ')}`
                                }
                            )
                            .setFooter({ text: `${client.user.username}'s Server Security Control` })
                    ]
                }
            )
        }

        async function blockersStatus() {

            if (!blockCommands || blockCommands.length === 0)
                return message.reply(`${e.Deny} | Este servidor não possui nenhum comando bloqueado.`)

            let allCommandsBlocked = blockCommands.filter(data => data.all) || [],
                commandBlocked = allCommandsBlocked.length > 0 ? allCommandsBlocked?.map(d => `\`${prefix}${d.cmd}\``)?.join(', ') || 'Nada por aqui' : 'Nada por aqui'

            let arrayOfChannelsBlocked = [],
                arrayWithChannelAndCommandsBlock = [],
                channelsWithBlock = blockCommands.filter(data => data.channel) || []

            if (!channelsWithBlock || channelsWithBlock.length === 0) {
                arrayWithChannelAndCommandsBlock = 'Nenhum'
            } else {

                for (const data of channelsWithBlock) {

                    let channel = message.guild.channels.cache.some(canal => canal.id === data.channel)

                    if (!channel) {
                        removeBlockFromChannelData(data.channel)
                        continue
                    }

                    if (arrayOfChannelsBlocked.includes(data.channel)) continue

                    arrayOfChannelsBlocked.push(data.channel)
                    continue
                }

                let arrayControl = []

                if (arrayOfChannelsBlocked.length > 0)
                    for (let id of arrayOfChannelsBlocked) {
                        let data = channelsWithBlock.filter(data => data.channel === id)

                        for (const i of data)
                            arrayControl.push(i.cmd)

                        arrayWithChannelAndCommandsBlock.push({ channel: id, commands: `${arrayControl.length > 0 ? arrayControl.map(d => `\`${prefix}${d}\``)?.join(', ') : 'Nada'}` })
                        arrayControl = []
                    }
            }

            let finishFormat = arrayWithChannelAndCommandsBlock === 'Nenhum'
                ? 'Nada por aqui'
                : arrayWithChannelAndCommandsBlock?.map(data => `> Canal: ${message.guild.channels.cache.get(data.channel) || 'Não encontrado'}\n> ${data.commands}\n`)?.join('\n') || 'Nada por aqui'

            if (arrayWithChannelAndCommandsBlock.length > 7) return showDataWithPagination()

            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`${e.Gear} Block Command System | Status`)
                        .setDescription('Aqui você consegue ver todos os comando que foram bloqueados e onde foram')
                        .addFields(
                            {
                                name: '🔒 Comandos bloqueados em todo o servidor',
                                value: `> ${commandBlocked}`
                            },
                            {
                                name: '#️⃣ Canais e seus comandos bloqueados',
                                value: `${finishFormat}`
                            }
                        )
                        .setFooter({ text: `Os sub-comandos deste comando está em ${prefix}blockcommands info` })
                ]
            })

            async function showDataWithPagination() {

                function EmbedGenerator(array) {

                    let amount = 7,
                        Page = 1,
                        embeds = [],
                        length = array.length / 7 <= 1 ? 1 : parseInt((array.length / 7) + 1)

                    for (let i = 0; i < array.length; i += 7) {

                        let current = array.slice(i, amount),
                            dataDescription = current.map(data => `> Canal: ${message.guild.channels.cache.get(data.channel) || 'Não encontrado'}\n> ${data.commands}\n`)?.join('\n') || 'Nada por aqui',
                            PageCount = `${length > 1 ? `| ${Page}/${length}` : ''}`

                        if (current.length > 0) {

                            embeds.push({
                                color: client.blue,
                                title: `${e.Gear} Block Command System | Status ${PageCount}`,
                                description: 'Aqui você consegue ver todos os comando que foram bloqueados e onde foram',
                                fields: [
                                    {
                                        name: '🔒 Comandos bloqueados em todo o servidor',
                                        value: `> ${commandBlocked}`
                                    },
                                    {
                                        name: '#️⃣ Canais e seus comandos bloqueados',
                                        value: dataDescription
                                    }
                                ],
                                footer: {
                                    text: `Os sub-comandos deste comando está em ${prefix}blockcommands info`
                                },
                            })

                            Page++
                            amount += 7

                        }

                    }

                    return embeds;
                }

                let embeds = EmbedGenerator(arrayWithChannelAndCommandsBlock),
                    emojis = ['⬅️', '➡️', '❌'],
                    msg = await message.reply({ embeds: [embeds[0]] }),
                    control = 0

                if (embeds.length > 1)
                    for (let i of emojis) msg.react(i).catch(() => { })
                else return

                let collector = msg.createReactionCollector({
                    filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                    idle: 30000,
                    errors: ['idle']
                })
                    .on('collect', (reaction) => {

                        if (reaction.emoji.name === emojis[2])
                            return collector.stop()

                        if (reaction.emoji.name === emojis[0]) {
                            control--
                            return embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control++
                        }

                        if (reaction.emoji.name === emojis[1]) {
                            control++
                            return embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control--
                        }

                        return collector.stop()
                    })
                    .on('end', () => {
                        return msg.edit({ content: `${e.Deny} | Comando cancelado.` }).catch(() => { })
                    })
                return
            }

        }

        async function removeBlockFromChannelData(data) {
            if (!data) return

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { $pull: { CommandBlocks: { channel: data } } }
            )
            return
        }

    }
}