const Data = require('../../../modules/functions/plugins/data')

module.exports = {
    name: 'carta',
    description: '[interaction] Envie cartas para as pessoa',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'enviar',
            description: '[interaction] Envie cartas para as pessoa',
            type: 1
        },
        {
            name: 'options',
            description: '[interaction] Outras opções no comando carta',
            type: 1,
            options: [
                {
                    name: 'function',
                    description: 'Escolha a função que você deseja executar',
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: 'enviadas',
                            value: 'sended',
                        },
                        {
                            name: 'recebidas',
                            value: 'recieved',
                        },
                        {
                            name: 'bloquear',
                            value: 'block',
                        },
                        {
                            name: 'deletar',
                            value: 'delete',
                        },
                        {
                            name: 'denúnciar',
                            value: 'report',
                        }
                    ]
                },
                {
                    name: 'user',
                    description: 'Nome ou o ID de um usuário',
                    type: 3
                },
                {
                    name: 'letter_id',
                    description: 'Forneça o ID da carta se necessário',
                    type: 3
                }
            ]
        },
    ],
    async execute({ interaction: interaction, client: client, database: Database, clientData: clientData, emojis: e, modals: modals }) {

        const { options, guild, user } = interaction,
            { Config: config } = Database

        return options.getSubcommand() === 'enviar' ? sendLetter() : optionsExec()

        async function optionsExec() {

            let control = { collected: false, atualEmbeds: [], embedIndex: 0 },
                func = options.getString('function'),
                search = options.getString('user') || null,
                resultSearch = getUser(search) || null,
                userSearch = resultSearch || user,
                letterId = options.getString('letter_id') || null,
                staff = [...clientData.Moderadores, ...clientData.Administradores]//, config.ownerId,
                invalid = search || letterId || func === 'delete'

            if (search && !resultSearch && staff.includes(user.id))
                return await interaction.reply({
                    content: `${e.Deny} | Nenhum usuário foi encontrado.`,
                    ephemeral: true
                })

            if (invalid && !staff.includes(user.id))
                return await interaction.reply({
                    content: `${e.Admin} | A utilização de usuário & Letter ID são recursos privados aos moderadores do \`${client.user.username}'s Security\`.`,
                    ephemeral: true
                })

            switch (func) {
                case 'sended': case 'recieved': letterList(); break;
                case 'report': reportModal(); break;
                case 'block': blockAcess(); break;
                case 'delete': deleteLetterUsers(); break;

                default:
                    break;
            }
            return

            async function letterList() {
                await interaction.deferReply({})
                await build()

                let buttons = {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            emoji: '⬅️',
                            custom_id: 'left',
                            style: 'PRIMARY'
                        },
                        {
                            type: 2,
                            emoji: '➡️',
                            custom_id: 'right',
                            style: 'PRIMARY'
                        }
                    ]
                }

                if (!control.embeds)
                    return await interaction.editReply({
                        content: `${e.Deny} | ${userSearch.id === user.id ? `${user}, você` : `${userSearch.tag}`} não possui nenhuma carta recebida ou enviada.`,
                        ephemeral: true
                    }).catch(() => { })

                if (func === 'recieved')
                    control.atualEmbeds = [...control.embeds.recieved]

                if (func === 'sended')
                    control.atualEmbeds = [...control.embeds.sended]

                if (control.atualEmbeds.length >= 3) {
                    buttons.components.unshift({
                        type: 2,
                        emoji: '⏪',
                        custom_id: 'firstEmbed',
                        style: 'PRIMARY'
                    })
                    buttons.components.push(
                        {
                            type: 2,
                            emoji: '⏩',
                            custom_id: 'lastEmbed',
                            style: 'PRIMARY'
                        })
                }

                if (control.atualEmbeds.length === 0)
                    return await interaction.editReply({
                        content: `${e.Deny} | ${userSearch.id === user.id ? `Você` : `${userSearch.tag}`} não tem nenhuma carta ${func === 'sended' ? 'enviada' : 'recebida'}.`
                    }).catch(() => { })

                if (control.atualEmbeds?.length === 1)
                    return await interaction.editReply({
                        embeds: [control.atualEmbeds[0]]
                    }).catch(() => { })

                const msg = await interaction.editReply({
                    embeds: [control.atualEmbeds[0]],
                    components: [buttons],
                    fetchReply: true
                }).catch(() => { })

                return msg.createMessageComponentCollector({
                    filter: i => i.user.id === user.id,
                    idle: 30000,
                    errors: ['idle']
                })
                    .on('collect', int => {
                        int.deferUpdate().catch(() => { })

                        let { customId } = int

                        if (customId === 'firstEmbed') {
                            if (control.embedIndex === 0) return
                            control.embedIndex = 0
                            return msg.edit({ embeds: [control.atualEmbeds[0]] }).catch(() => { })
                        }

                        if (customId === 'left') {
                            control.embedIndex === 0 ? control.embedIndex = control.atualEmbeds.length - 1 : control.embedIndex--
                            return control.atualEmbeds[control.embedIndex] ? msg.edit({ embeds: [control.atualEmbeds[control.embedIndex]] }).catch(() => { }) : control.embedIndex++
                        }

                        if (customId === 'right') {
                            control.embedIndex === control.atualEmbeds.length - 1 ? control.embedIndex = 0 : control.embedIndex++
                            return control.atualEmbeds[control.embedIndex] ? msg.edit({ embeds: [control.atualEmbeds[control.embedIndex]] }).catch(() => { }) : control.embedIndex--
                        }

                        if (customId === 'lastEmbed') {
                            if (control.embedIndex === control.atualEmbeds.length) return
                            control.embedIndex = control.atualEmbeds.length - 1
                            return control.atualEmbeds[control.embedIndex] ? msg.edit({ embeds: [control.atualEmbeds[control.embedIndex]] }).catch(() => { }) : control.embedIndex--
                        }

                        return

                    })
                    .on('end', () => {
                        if (control.collected) return
                        return msg.edit({ content: `${e.Deny} | Comando cancelado.`, embeds: [], components: [] }).catch(() => { })
                    })
            }

            async function build() {

                let userData = await Database.User.findOne({ id: userSearch.id }, 'Letters')
                let letters = {
                    Sended: userData.Letters?.Sended || [],
                    Recieved: userData.Letters?.Recieved || []
                }

                if (!userData || !userData.Letters) return null

                control.embeds = { sended: EmbedGenerator(letters.Sended, 'sended'), recieved: EmbedGenerator(letters.Recieved, 'recieved') }
                return
            }

            function EmbedGenerator(array, mode) {

                let amount = 5,
                    page = 1,
                    embeds = [],
                    length = array.length / 5 <= 1 ? 1 : parseInt((array.length / 5) + 1)

                for (let i = 0; i < array.length; i += 5) {

                    let current = array.slice(i, amount),
                        description = mode === 'sended'
                            ? current.sort((a, b) => b.date - a.date).map(data => {

                                if (!data.letterId) {
                                    deleteLetter('Sended', data.content)
                                    return `${e.Deny} Carta deletada por não conter um ID.`
                                }

                                return `🆔: \`${data.letterId || 'Not Found'}\`\n📨 To: ${client.users.cache.get(data.to)?.tag || `\`Not Found - ${data.to}\``}\n🛡️ From: ${client.guilds.cache.get(data.guildId)?.name || `\`Not Found - ${data.guildId}\``}\n🕵️ Anonymous: ${data.anonymous ? 'Sim' : 'Não'}\n💭 Content: ${data.content.length > 20 ? `${data.content.trim().slice(0, 20)}...` : data.content}\n📅 When: ${Data(data.date, false, false)}`
                            }).join('\n----------------------------------\n')
                            : current.sort((a, b) => b.date - a.date).map(data => {

                                if (!data.letterId) {
                                    deleteLetter('Recieved', data.content)
                                    return `${e.Deny} Carta deletada por não conter um ID.`
                                }

                                return `🆔: \`${data.letterId || 'Not Found'}\`\n📨 By: ${data.anonymous ? 'Anonymous 🕵️' : client.users.cache.get(data.from)?.tag || `\`Not Found - ${data.to}\``}\n🛡️ From: ${client.guilds.cache.get(data.guildId)?.name || `\`Not Found - ${data.guildId}\``}\n💭 Content: ${data.content.length > 20 ? `${data.content.trim().slice(0, 20)}...` : data.content}\n📅 When: ${Data(data.date, false, false)}`
                            }).join('\n----------------------------------\n'),
                        pageCount = length > 1 ? ` ${page}/${length}` : ''

                    embeds.push({
                        color: client.blue,
                        title: mode === 'sended' ? `📨 Cartas Enviadas${pageCount}` : `📨 Cartas Recebidas${pageCount}`,
                        description: description,
                        footer: { text: `${client.user.username}'s Letters Command` }
                    })

                    page++
                    amount += 5

                }

                return embeds
            }

            async function blockAcess() {

                let data = await Database.User.findOne({ id: user.id }, 'Letters.Blocked')
                let blocked = data?.Letters?.Blocked || false

                await Database.User.updateOne({ id: user.id }, { 'Letters.Blocked': !blocked })

                let response = blocked
                    ? '🔓 | O recebimento de cartas foi liberado.'
                    : '🔒 | Agora você não vai mais receber cartas de ninguém.'

                return await interaction.reply({
                    content: response,
                    ephemeral: true
                })
            }

            async function deleteLetter(recievedOrSended, content) {
                await Database.User.updateOne(
                    { id: user.id },
                    { $pull: { [`Letters.${recievedOrSended}`]: { content: content } } }
                )
                return
            }

            // async function getLetter() {

            //     if (!args[1])
            //         return message.reply(`${e.Deny} | Forneça o ID da carta para que eu possa buscar a carta.`)

            //     let letterId = args[1].toUpperCase()

            //     if (letterId.length !== 7)
            //         return message.reply(`${e.Deny} | O ID da carta possui 7 digitos.`)

            //     let msg = await message.reply(`${e.Loading} | Buscando...`)
            //     let allDataUsers = await Database.User.find({}, 'id Letters.Recieved')

            //     let search = allDataUsers.find(data => data.Letters.Recieved.find(arr => arr.letterId === letterId)),
            //         letter = search?.Letters?.Recieved?.find(data => data.letterId === letterId),
            //         userId = search?.id

            //     if (!letter)
            //         return msg.edit(`${e.Deny} | Nenhuma carta foi encontrada.`).catch(() => { })

            //     let userRecieved = client.users.cache.get(userId)
            //     let userSended = client.users.cache.get(letter.from)
            //     let serverSended = client.guilds.cache.get(letter.guildId)

            //     return msg.edit({
            //         content: `${e.Check} | Carta encontrada com sucesso!`,
            //         embeds: [
            //             {
            //                 color: client.blue,
            //                 title: `📨 ${client.user.username}'s Letters System`,
            //                 description: `ℹ Esta carta foi enviada por: ${letter.anonymous ? '\`Usuário anônimo\`' : `${userSended.tag || `\`Not Found\``} - \`${letter.from}\``}`,
            //                 fields: [{
            //                     name: `📝 Conteúdo da carta`,
            //                     value: `\`\`\`txt\n${letter.content}\n\`\`\``
            //                 }],
            //                 footer: { text: `A ${client.user.username} não se responsabiliza pelo conteúdo presente nesta carta.` }
            //             },
            //             {
            //                 color: client.blue,
            //                 title: `🔍 ${client.user.username} Letters System Info`,
            //                 description: `De: ${userSended?.tag || `\`Not Found\``} - \`${letter.from}\`\nPara: ${userRecieved?.tag || `\`Not Found\``} - \`${userId}\`\nDo servidor: ${serverSended?.name || `\`Not Found\``} - \`${letter.guildId}\`\nEnviado a: \`${client.formatTimestamp(letter.date)}\`\nEnviado em: \`${Data(letter.date - Date.now())}\``
            //             }
            //         ]
            //     })

            // }

            async function deleteLetterUsers() {

                if (!letterId)
                    return await interaction.reply({
                        content: `${e.Deny} | Você precisa fornecer o ID da carta para que eu possa deletar.`,
                        ephemeral: true
                    })

                if (letterId.length !== 7)
                    return await interaction.reply({
                        content: `${e.Deny} | O ID da carta possui 7 digitos.`,
                        ephemeral: true
                    })

                await interaction.deferReply({ ephemeral: true })

                let allDataUsers = await Database.User.find({}, 'id Letters')

                let search = allDataUsers.find(data => data.Letters.Recieved.find(arr => arr.letterId === letterId)),
                    letter = search?.Letters?.Recieved?.find(data => data.letterId === letterId),
                    search2 = allDataUsers.find(data => data.Letters.Sended.find(arr => arr.letterId === letterId)),
                    letter2 = search2?.Letters?.Sended?.find(data => data.letterId === letterId)

                if (!letter && !letter2)
                    return await interaction.editReply({
                        content: `${e.Deny} | Nenhuma carta foi encontrada.`
                    }).catch(() => { })

                let data = [{ id: search.id, i: 'Recieved' }, { id: search2.id, i: 'Sended' }]

                for (let d of data)
                    await Database.User.updateOne(
                        { id: d.id },
                        { $pull: { [`Letters.${d.i}`]: { letterId: letterId } } }
                    )

                return await interaction.editReply({
                    content: `${e.Check} | A carta \`${letterId}\` foi deletada com sucesso dos usuários \`${search.id || 'Not Found'}\` & \`${search2.id || 'Not Found'}\``
                }).catch(() => { })
            }

        }

        function getUser(value) {

            if (!value) return null

            let hasMember = searchMember()

            return hasMember
                ? hasMember?.user || null
                : client.users.cache.find(data => {
                    return data.id === value
                        || data.username === value
                        || data.tag === value
                        || data.discriminator === value
                }) || null

            function searchMember() {
                return guild.members.cache.get(value)
                    || guild.members.cache.find(member => member.displayName == value)
                    || null
            }
        }

        async function sendLetter() {

            let data = await Database.User.findOne({ id: user.id }, 'Slot.Cartas Timeouts.Letter'),
                cartas = data?.Slot?.Cartas || 0,
                Timer = data?.Timeouts?.Letter || 0

            if (!data) {
                Database.registerUser(user)

                return await interaction.reply({
                    content: '❌ | Nenhum dado foi encontrado no banco de dados. Tente novamente.',
                    ephemeral: true
                })
            }

            if (cartas <= 0)
                return await interaction.reply({
                    content: '❌ | Você não possui nenhuma carta. Que tal comprar umas na loja?',
                    ephemeral: true
                })

            if (client.Timeout(900000, Timer))
                return await interaction.reply({
                    content: `⏱️ | Letters System Cooldown | Tempo restante para o envio de uma próxima carta: \`${client.GetTimeout(900000, Timer)}\``,
                    ephemeral: true
                })

            return await interaction.showModal(modals.sendLetter)
        }

        async function reportModal() {
            return await interaction.showModal(modals.reportLetter)
        }

    }
}