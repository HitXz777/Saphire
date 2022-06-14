const Notify = require('../../../modules/functions/plugins/notify')
const client = require('../../../index')

module.exports = {
    name: 'welcome',
    description: '[moderation] Configure o sistema de boas vindas',
    dm_permission: false,
    default_member_permissions: client.perms.ADMINISTRATOR,
    type: 1,
    options: [
        {
            name: 'enable',
            description: '[moderation] Ativar sistema de boas-vindas',
            type: 1,
            options: [
                {
                    name: 'channel',
                    description: 'Canal onde as mensagens será enviada',
                    type: 7,
                    required: true
                },
                {
                    name: 'message',
                    description: 'Use $member para difinir o membro e $servername para definir o nome do servidor.',
                    type: 3
                }
            ]
        },
        {
            name: 'options',
            description: '[moderation] Mais opções sobre o sistema de boas-vindas',
            type: 1,
            options: [
                {
                    name: 'disable',
                    description: 'Desativar algo no sistema de boas-vindas',
                    type: 3,
                    choices: [
                        {
                            name: 'mensagem',
                            value: 'message'
                        },
                        {
                            name: 'welcomesystem',
                            value: 'welcomesystem'
                        }
                    ]
                },
                {
                    name: 'info',
                    description: 'Informações sobre o sistema de boas-vindas',
                    type: 3,
                    choices: [
                        {
                            name: 'info',
                            value: 'info'
                        },
                        {
                            name: 'status',
                            value: 'status'
                        }
                    ]
                }
            ]
        },
        {
            name: 'edit',
            description: 'Edite a mensagem do sistema de boas-vindas',
            type: 1,
            options: [
                {
                    name: 'message',
                    description: '$member define o membro na mensagem e $servername o nome do servidor',
                    required: true,
                    type: 3
                }
            ]
        }
    ],
    async execute({ interaction: interaction, database: Database, guildData: guildData, emojis: e }) {

        const { options, guild, user } = interaction

        let channel = options.getChannel('channel'),
            subCommand = options.getSubcommand(),
            welcomeMessage = options.getString('message'),
            disable = options.getString('disable'),
            info = options.getString('info'),
            canalDB = guildData.WelcomeChannel.Canal,
            channelWelcome = guild.channels.cache.get(canalDB)

        if (canalDB && !channelWelcome) {

            await Database.Guild.updateOne(
                { id: guild.id },
                { $unset: { WelcomeChannel: 1 } }
            )

            return await interaction.reply({
                content: `${e.Deny} | O canal presente no meu banco de dados não corresponde a nenhum canal deste servidor. Por favor, use o comando novamente.`,
                ephemeral: true
            })
        }

        if (channel) return SetWelcomeChannel()

        if (disable) return SetWelcomeOff()
        if (subCommand === 'edit') return editWelcomeInfo()
        if (info === 'info') return Info()
        if (info === 'status') return showStatus()

        async function Info() {
            return await interaction.reply({
                embeds: [
                    {
                        color: client.blue,
                        title: `${e.Join} Sistema de Boas-vindas`,
                        description: `${e.SaphireOk} Com este sistema eu aviso sobre todas as pessoas que entrarem no servidor. Mando uma mensagem simples(customizada) no canal definido.`,
                        fields: [
                            {
                                name: `${e.On} Ative`,
                                value: `\`/welcome enable\` Ative o sistema em um canal`
                            },
                            {
                                name: `${e.Off} Desative`,
                                value: `\`/welcome options disable\` Escolha o que desativar`
                            },
                            {
                                name: `${e.Loli} Personalize`,
                                value: `\`/welcome edit\` Edite a mensagem como preferir`
                            },
                            {
                                name: `${e.Info} Informações`,
                                value: `\`/welcome options info\``
                            },
                            {
                                name: `${e.Reference} Canal Atual`,
                                value: channelWelcome ? `${channelWelcome} \`${channelWelcome.id}\`` : 'Nenhum canal foi configurado'
                            }
                        ]
                    }
                ]
            })
        }

        async function editWelcomeInfo() {

            if (!welcomeMessage)
                return await interaction.reply({
                    embeds: [
                        {
                            color: client.blue,
                            title: `${e.SaphireOk} Edição de Welcome Info`,
                            description: 'Aqui você pode editar a mensagem padrão.',
                            fields: [
                                {
                                    name: '📝 Reacolando as informações',
                                    value: `Você pode mudar a posição onde o membro novo vai estar. Use o placeholder \`$member\` aonde você quer que o membro fique na mensagem e \`$servername\` para o nome do servidor.\nExemplo: \`❤️ | Seja muito bem-vindo $member! Este é o $servername, não esqueça de passar nas #regras.\`\nResultado: ❤️ | Seja muito bem-vindo ${user}! Este é o ${guild.name}, não se esqueça de passar nas #regras.`
                                }
                            ]
                        }
                    ]
                })

            if (welcomeMessage.length > 2500)
                return await interaction.reply({
                    content: `${e.Deny} | O limite de caracteres na mensagem de boas vindas são de 2000`,
                    ephemeral: true
                })

            let msg = await await interaction.reply({
                content: `${e.QuestionMark} | Confirmar a nova mensagem?\n> ${welcomeMessage.replace('$member', user).replace('$servername', guild.name)}`,
                fetchReply: true
            }), emojis = ['✅', '❌']
            for (let i of emojis) msg.react(i).catch(() => { })

            return msg.createReactionCollector({
                filter: (r, u) => emojis.includes(r.emoji.name) && u.id === user.id,
                time: 60000,
                max: 1,
                errors: ['time', 'max']
            })
                .on('collect', async (reaction) => {

                    if (reaction.emoji.name === emojis[0]) {

                        await Database.Guild.updateOne(
                            { id: guild.id },
                            { 'WelcomeChannel.Mensagem': welcomeMessage }
                        )

                        Notify(guild.id, 'Recurso atualizado', `${user} \`${user.id}\` atualizou a mensagem de boas-vindas.`)
                        return msg.edit({
                            content: `${e.Check} | Mensagem atualizada com sucesso!`
                        })
                    }

                })
                .on('end', collected => {
                    msg.reactions.removeAll().catch(() => { })
                    if (collected.size >= 1) return
                    return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                })

        }

        async function showStatus() {

            if (!canalDB)
                return await interaction.reply({
                    content: `${e.Deny} | O sistema de boas-vindas está desativado. Portanto, não possui status.`,
                    ephemeral: true
                })

            let Mensagem = guildData?.WelcomeChannel?.Mensagem || '$member entrou no servidor.'

            return await interaction.reply({
                embeds: [
                    {
                        color: client.blue,
                        title: `${e.Info} ${guild.name} Welcome Status`,
                        fields: [
                            {
                                name: '📝 Mensagem atual',
                                value: `${Mensagem.replace('$member', client.user).replace('$servername', guild.name)}`
                            },
                            {
                                name: '# Canal atual',
                                value: `${channelWelcome || 'Canal não encontrado'}`
                            }
                        ]
                    }
                ]
            })

        }

        async function SetWelcomeOff() {

            if (!canalDB)
                return await interaction.reply({
                    content: `${e.Deny} | O Welcome System está desativado.`,
                    ephemeral: true
                })

            if (disable === 'welcomesystem') setOff()
            if (disable === 'message') setOffMessage()

            async function setOffMessage() {

                if (!guildData?.WelcomeChannel?.Mensagem)
                    return await interaction.reply({
                        content: `${e.Deny} | Este servidor não tem nenhuma mensagem personalizada no sistema de boas-vindas.`,
                        ephemeral: true
                    })

                await Database.Guild.updateOne(
                    { id: guild.id },
                    { $unset: { 'WelcomeChannel.Mensagem': 1 } }
                )

                Notify(guild.id, 'Recurso editado', `${user} \`${user.id}\` retirou a mensagem personalizada do sistema de boas-vindas.`)
                return await interaction.reply({
                    content: `${e.Check} | Prontinho! Agora a mensagem padrão é \`$member entrou no servidor.\``
                })
            }

            async function setOff() {

                let msg = await await interaction.reply({
                    content: `${e.QuestionMark} | Deseja desativar o sistema de boas-vindas?`,
                    fetchReply: true
                }),
                    emojis = ['✅', '❌'],
                    validate = false

                for (let i of emojis) msg.react(i).catch(() => { })

                const collector = msg.createReactionCollector({
                    filter: (r, u) => emojis.includes(r.emoji.name) && u.id === user.id,
                    time: 30000,
                    errors: ['time']
                })

                collector.on('collect', async (reaction) => {

                    if (reaction.emoji.name === emojis[0]) {

                        await Database.Guild.updateOne(
                            { id: guild.id },
                            { $unset: { WelcomeChannel: 1 } }
                        )

                        validate = true
                        Notify(guild.id, 'Recurso desabilitado', `${user} \`${user.id}\` desativou o sistema de boas-vindas.`)
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

            if (channel.type !== 'GUILD_TEXT')
                return await interaction.reply({
                    content: `${e.Deny} | Apenas canais de textos são válidos neste sistema.`,
                    ephemeral: true
                })

            if (welcomeMessage && welcomeMessage.length > 2500)
                return await interaction.reply({
                    content: `${e.Deny} | A mensagem de boas vindas não pode passar de 2500 caracteres.`
                })

            if (channel.id === canalDB)
                return await interaction.reply({
                    content: `${e.Info} | Este canal já foi definido como Welcome Channel!`,
                    ephemeral: true
                })

            let msg = await await interaction.reply({
                content: `${e.QuestionMark} | Deseja ativar o sistema de boas-vindas no canal ${channel}?\n${e.Info} | Mensagem definida: ${welcomeMessage.replace('$member', user).replace('$servername', guild.name)}`,
                fetchReply: true
            }),
                emojis = ['✅', '❌'],
                validate = false

            for (let i of emojis) msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (r, u) => emojis.includes(r.emoji.name) && u.id === user.id,
                time: 30000,
                errors: ['time']
            })
                .on('collect', async (reaction) => {

                    if (reaction.emoji.name === emojis[0]) {

                        let data = { Canal: channel.id }

                        if (welcomeMessage) data.Mensagem = welcomeMessage

                        await Database.Guild.updateOne(
                            { id: guild.id },
                            { WelcomeChannel: data }
                        )

                        validate = true
                        Notify(guild.id, 'Recurso ativado', `${user} \`${user.id}\` ativou o sistema de boas-vindas no canal ${channel}`)
                        msg.edit(`${e.Check} | Prontinho! Agora eu vou avisar no canal ${channel} sempre que alguém entrar no servidor. Se quiser alterar a mensagem, só usar o comando \`/welcome edit\``).catch(() => { })

                    }

                    return collector.stop()

                })
                .on('end', () => {

                    if (!validate) return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return
                })

            return

        }

    }
}