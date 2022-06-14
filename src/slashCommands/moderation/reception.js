const Notify = require('../../../modules/functions/plugins/notify')
const client = require('../../../index')

module.exports = {
    name: 'reception',
    description: '[moderation] Configure o sistema de recepção',
    dm_permission: false,
    default_member_permissions: client.perms.ADMINISTRATOR,
    type: 1,
    options: [
        {
            name: 'welcome',
            description: 'De as boas-vindas aos novos membros',
            type: 2,
            options: [
                {
                    name: 'enable',
                    description: '[moderation] Ativar sistema de boas-vindas',
                    type: 1,
                    options: [
                        {
                            name: 'channel',
                            description: 'Canal onde as mensagens serão enviadas',
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
                                    value: 'receptionsystem'
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
                    description: '[moderation] Edite a mensagem do sistema de boas-vindas',
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
            ]
        },
        {
            name: 'leave',
            description: 'Deixe uma mensagem de saída para os membros',
            type: 2,
            options: [
                {
                    name: 'enable',
                    description: '[moderation] Ativar sistema de saídas',
                    type: 1,
                    options: [
                        {
                            name: 'channel',
                            description: 'Canal onde as mensagens serão enviadas',
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
                    description: '[moderation] Mais opções sobre o sistema de saídas',
                    type: 1,
                    options: [
                        {
                            name: 'disable',
                            description: 'Desativar algo no sistema de saídas',
                            type: 3,
                            choices: [
                                {
                                    name: 'mensagem',
                                    value: 'message'
                                },
                                {
                                    name: 'leavesystem',
                                    value: 'receptionsystem'
                                }
                            ]
                        },
                        {
                            name: 'info',
                            description: 'Informações sobre o sistema de saída',
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
                    description: '[moderation] Edite a mensagem do sistema de saída',
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
            ]
        }
    ],
    async execute({ interaction: interaction, database: Database, guildData: guildData, emojis: e }) {

        const { options, guild, user } = interaction

        let channel = options.getChannel('channel'),
            subCommandGroup = options.getSubcommandGroup(),
            subCommand = options.getSubcommand(),
            receptionMessage = options.getString('message'),
            disable = options.getString('disable'),
            info = options.getString('info'),
            route = '', welcomeOrLeave = '', isWelcome = false

        if (isWelcome) {
            route = 'WelcomeChannel'
            welcomeOrLeave = 'boas-vindas'
            isWelcome = true
        } else {
            route = 'LeaveChannel'
            welcomeOrLeave = 'saídas'
            isWelcome = false
        }

        let canalDB = guildData[route].Canal,
            channelReception = guild.channels.cache.get(canalDB)

        if (canalDB && !channelReception) {

            await Database.Guild.updateOne(
                { id: guild.id },
                { $unset: { [route]: 1 } }
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
                        title: `${e.Join} Sistema de Recepção`,
                        description: `${e.SaphireOk} Com este sistema eu aviso sobre todas as pessoas que entrarem e sairem do servidor. Mando uma mensagem simples(customizada) no canal definido.`,
                        fields: [
                            {
                                name: `${e.On} Ative`,
                                value: `\`/reception <welcome/leave> enable\` Ative o sistema em um canal`
                            },
                            {
                                name: `${e.Off} Desative`,
                                value: `\`/reception <welcome/leave> options disable\` Escolha o que desativar`
                            },
                            {
                                name: `${e.Loli} Personalize`,
                                value: `\`/reception <welcome/leave> edit\` Edite a mensagem como preferir`
                            },
                            {
                                name: `${e.Info} Informações`,
                                value: `\`/reception <welcome/leave> options info\``
                            },
                            {
                                name: `${e.Reference} Canal Atual`,
                                value: channelReception ? `${channelReception} \`${channelReception.id}\`` : `Nenhum canal foi configurado no sistema de ${welcomeOrLeave}`
                            }
                        ]
                    }
                ]
            })
        }

        async function editWelcomeInfo() {

            if (!receptionMessage)
                return await interaction.reply({
                    embeds: [
                        {
                            color: client.blue,
                            title: `${e.SaphireOk} Edição de Recepção`,
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

            if (receptionMessage.length > 2500)
                return await interaction.reply({
                    content: `${e.Deny} | O limite de caracteres na mensagem de ${welcomeOrLeave} são de 2000`,
                    ephemeral: true
                })

            let msg = await await interaction.reply({
                content: `${e.QuestionMark} | Confirmar a nova mensagem?\n> ${receptionMessage.replace('$member', user).replace('$servername', guild.name)}`,
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
                            { [`${route}.Mensagem`]: receptionMessage }
                        )

                        Notify(guild.id, 'Recurso atualizado', `${user} \`${user.id}\` atualizou a mensagem de ${welcomeOrLeave}.`)
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
                    content: `${e.Deny} | O sistema de ${welcomeOrLeave} está desativado. Portanto, não possui status.`,
                    ephemeral: true
                })

            let Mensagem = guildData[route]?.Mensagem || `$member ${isWelcome ? 'entrou no' : 'saiu do'} servidor.`

            return await interaction.reply({
                embeds: [
                    {
                        color: client.blue,
                        title: `${e.Info} ${guild.name} ${subCommandGroup} status`,
                        fields: [
                            {
                                name: '📝 Mensagem atual',
                                value: `${Mensagem.replace('$member', client.user).replace('$servername', guild.name)}`
                            },
                            {
                                name: '# Canal atual',
                                value: `${channelReception || 'Canal não encontrado'}`
                            }
                        ]
                    }
                ]
            })

        }

        async function SetWelcomeOff() {

            if (!canalDB)
                return await interaction.reply({
                    content: `${e.Deny} | O ${subCommandGroup} system está desativado.`,
                    ephemeral: true
                })

            if (disable === 'receptionsystem') setOff()
            if (disable === 'message') setOffMessage()

            async function setOffMessage() {

                if (!guildData[route]?.Mensagem)
                    return await interaction.reply({
                        content: `${e.Deny} | Este servidor não tem nenhuma mensagem personalizada no sistema de ${welcomeOrLeave}.`,
                        ephemeral: true
                    })

                await Database.Guild.updateOne(
                    { id: guild.id },
                    { $unset: { [`${route}.Mensagem`]: 1 } }
                )

                Notify(guild.id, 'Recurso editado', `${user} \`${user.id}\` retirou a mensagem personalizada do sistema de ${welcomeOrLeave}.`)
                return await interaction.reply({
                    content: `${e.Check} | Prontinho! Agora a mensagem padrão é \`$member ${isWelcome ? 'entrou no' : 'saiu do'} servidor.\``
                })
            }

            async function setOff() {

                let msg = await await interaction.reply({
                    content: `${e.QuestionMark} | Deseja desativar o sistema de ${welcomeOrLeave}?`,
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
                            { $unset: { [route]: 1 } }
                        )

                        validate = true
                        Notify(guild.id, 'Recurso desabilitado', `${user} \`${user.id}\` desativou o sistema de ${welcomeOrLeave}.`)
                        msg.edit(`${e.Check} | Prontinho! Agora eu não vou mais avisar quando alguém ${isWelcome ? 'entrar no' : 'sair do'} servidor.`).catch(() => { })
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

            if (receptionMessage && receptionMessage.length > 2500)
                return await interaction.reply({
                    content: `${e.Deny} | A mensagem de ${welcomeOrLeave} não pode passar de 2500 caracteres.`
                })

            if (channel.id === canalDB)
                return await interaction.reply({
                    content: `${e.Info} | Este canal já foi definido como canal de ${welcomeOrLeave}!`,
                    ephemeral: true
                })

            let msg = await await interaction.reply({
                content: `${e.QuestionMark} | Deseja ativar o sistema de ${welcomeOrLeave} no canal ${channel}?\n${e.Info} | Mensagem definida: ${receptionMessage.replace('$member', user).replace('$servername', guild.name)}`,
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

                        if (receptionMessage) data.Mensagem = receptionMessage

                        await Database.Guild.updateOne(
                            { id: guild.id },
                            { [route]: data }
                        )

                        validate = true
                        Notify(guild.id, 'Recurso ativado', `${user} \`${user.id}\` ativou o sistema de ${welcomeOrLeave} no canal ${channel}`)
                        msg.edit(`${e.Check} | Prontinho! Agora eu vou avisar no canal ${channel} sempre que alguém ${isWelcome ? 'entrar no' : 'sair do'} servidor. Se quiser alterar a mensagem, só usar o comando \`/reception edit\``).catch(() => { })

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