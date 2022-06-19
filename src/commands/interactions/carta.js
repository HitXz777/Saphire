const { e } = require('../../../JSON/emojis.json')
const Data = require('../../../modules/functions/plugins/data')

module.exports = {
    name: 'carta',
    aliases: ['letter', 'cartas'],
    category: 'interactions',
    emoji: '📨',
    usage: '<carta> <@user/id> <Sua mensagem em diante>',
    description: 'Envie cartas para as pessoas',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/carta\``)

        let user = client.getUser(client, message, args, 'user') || message.author,
            userData = await Database.User.findOne({ id: user.id }, 'Letters'),
            clientData = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores'),
            control = { collected: false, atualEmbeds: [], embedIndex: 0 },
            staff = [...clientData.Moderadores, ...clientData.Administradores]

        if (user.id !== message.author.id && !staff.includes(message.author.id))
            return message.reply(`${e.Deny} | Apenas moderadores do meu sistema podem acessar cartas de outros usuários.`)

        if (['block', 'bloquear'].includes(args[0]?.toLowerCase())) return blockAcess()
        if (['search', 'pesquisar', 'get', 's'].includes(args[0]?.toLowerCase())) return getLetter()
        if (['delete', 'del'].includes(args[0]?.toLowerCase())) return deleteLetterRequest()

        await build()

        let selectMenuObject = {
            type: 1,
            components: [{
                type: 3,
                custom_id: 'menu',
                placeholder: 'Escolher uma opção',
                options: [
                    {
                        label: 'ENVIAR UMA CARTA',
                        emoji: '📨',
                        description: 'Envie uma carta para alguém.',
                        value: 'sendNewLetter',
                    },
                    {
                        label: 'ENVIADAS',
                        emoji: '📤',
                        description: 'Confira o histório de cartas enviadas.',
                        value: 'sended',
                    },
                    {
                        type: 2,
                        label: 'RECEBIDAS',
                        emoji: '📥',
                        description: 'Confira o histório de cartas recebidas.',
                        value: 'recieved',
                    },
                    {
                        type: 2,
                        label: 'DENÚNCIAR',
                        emoji: '🚨',
                        description: 'Denúncie cartas diretamente para os moderadores',
                        value: 'report',
                    },
                    {
                        label: 'CANCELAR',
                        emoji: e.Deny || '❌',
                        description: 'Force o encerramento do comando.',
                        value: 'cancel',
                    },
                ]
            }]
        }

        let msg = await message.reply({
            embeds: [{
                color: client.blue,
                title: `📨 ${client.user.username}'s Letters System`,
                description: 'Aqui, você pode enviar cartas para as outras pessoas. Basta clicar no botão e escrever sua carta.',
                fields: [
                    {
                        name: `${e.Info} Bloqueio de envio `,
                        value: `Se você não quer receber nenhuma carta, use o comando \`${prefix}carta block\`. Assim eu não vou enviar nada para você.`
                    },
                    {
                        name: `${e.Admin} Administrativo`,
                        value: `\`${prefix}carta search <cartaID>\` | \`${prefix}carta delete <cartaID>\``
                    }
                ]
            }],
            components: [selectMenuObject]
        })

        let collector = msg.createMessageComponentCollector({
            filter: interaction => interaction.user.id === message.author.id,
            idle: 30000,
            errors: ['idle']
        })
            .on('collect', interaction => {

                let { customId } = interaction

                customId = customId === 'menu' ? interaction.values[0] : customId

                if (customId === 'cancel') return collector.stop()

                if (['report', 'sendNewLetter'].includes(customId)) {
                    control.collected = true
                    return msg.edit({ content: `${e.Check} | Pedido aceito.`, components: [], embeds: [] }).catch(() => { })
                }

                interaction.deferUpdate().catch(() => { })

                if (customId === 'recieved')
                    control.atualEmbeds = [...control.embeds.recieved]

                if (customId === 'sended')
                    control.atualEmbeds = [...control.embeds.sended]

                if (['recieved', 'sended'].includes(customId)) return letterList(customId)
                if (['firstEmbed', 'left', 'right', 'lastEmbed'].includes(customId)) return tradeEmbed(customId)

            })
            .on('end', () => {
                if (control.collected) return
                return msg.edit({ content: `${e.Deny} | Comando cancelado.`, embeds: [], components: [] }).catch(() => { })
            })

        return

        async function letterList(customId) {

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

            if (!control.atualEmbeds?.length)
                return msg.edit({ content: `${e.Deny} | Você não tem nenhuma carta ${customId === 'sended' ? 'enviada' : 'recebida'}.`, embeds: [], components: [selectMenuObject] })

            if (control.atualEmbeds?.length === 1)
                return msg.edit({ embeds: [control.atualEmbeds[0]], components: [selectMenuObject] })

            return msg.edit({ embeds: [control.atualEmbeds[0]], components: [buttons, selectMenuObject] })

        }

        function build() {

            let letters = {
                Sended: userData.Letters?.Sended || [],
                Recieved: userData.Letters?.Recieved || []
            }

            if (!userData || !userData.Letters) {
                msg.edit({ components: buttons }).catch(() => { })
                return message.channel.send(`${e.Deny} | ${user.id === message.author.id ? `${message.author}, você` : `${user.tag}`} não possui nenhuma carta recebida ou enviada.`)
            }

            control.embeds = { sended: EmbedGenerator(letters.Sended, 'sended'), recieved: EmbedGenerator(letters.Recieved, 'recieved') }

            return

        }

        function tradeEmbed(value) {

            if (value === 'firstEmbed') {
                if (control.embedIndex === 0) return
                control.embedIndex = 0
                return msg.edit({ embeds: [control.atualEmbeds[0]] }).catch(() => { })
            }

            if (value === 'left') {
                control.embedIndex === 0 ? control.embedIndex = control.atualEmbeds.length - 1 : control.embedIndex--
                return control.atualEmbeds[control.embedIndex] ? msg.edit({ embeds: [control.atualEmbeds[control.embedIndex]] }).catch(() => { }) : control.embedIndex++
            }

            if (value === 'right') {
                control.embedIndex === control.atualEmbeds.length - 1 ? control.embedIndex = 0 : control.embedIndex++
                return control.atualEmbeds[control.embedIndex] ? msg.edit({ embeds: [control.atualEmbeds[control.embedIndex]] }).catch(() => { }) : control.embedIndex--
            }

            if (value === 'lastEmbed') {
                if (control.embedIndex === control.atualEmbeds.length) return
                control.embedIndex = control.atualEmbeds.length - 1
                return control.atualEmbeds[control.embedIndex] ? msg.edit({ embeds: [control.atualEmbeds[control.embedIndex]] }).catch(() => { }) : control.embedIndex--
            }

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

                            return `🆔: \`${data.letterId || 'Not Found'}\`\n📨 To: ${client.users.cache.get(data.to)?.tag || `\`Not Found - ${data.to}\``}\n🛡️ From: ${client.guilds.cache.get(data.guildId)?.name || `\`Not Found - ${data.guildId}\``}\n🕵️ Anonymous: ${data.anonymous ? 'Sim' : 'Não'}\n💭 Content: ${data.content.length > 20 ? `${data.content.trim().slice(0, 20)}...` : data.content}\n📅 When: ${Data(data.date)}`
                        }).join('\n----------------------------------\n')
                        : current.sort((a, b) => b.date - a.date).map(data => {

                            if (!data.letterId) {
                                deleteLetter('Recieved', data.content)
                                return `${e.Deny} Carta deletada por não conter um ID.`
                            }

                            return `🆔: \`${data.letterId || 'Not Found'}\`\n📨 By: ${data.anonymous ? 'Anonymous 🕵️' : client.users.cache.get(data.from)?.tag || `\`Not Found - ${data.to}\``}\n🛡️ From: ${client.guilds.cache.get(data.guildId)?.name || `\`Not Found - ${data.guildId}\``}\n💭 Content: ${data.content.length > 20 ? `${data.content.trim().slice(0, 20)}...` : data.content}\n📅 When: ${Data(data.date)}`
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

            let data = await Database.User.findOne({ id: message.author.id }, 'Letters.Blocked')
            let blocked = data?.Letters?.Blocked

            blocked
                ? await Database.User.updateOne({ id: message.author.id }, { 'Letters.Blocked': false })
                : await Database.User.updateOne({ id: message.author.id }, { 'Letters.Blocked': true })

            let response = blocked
                ? 'Ok! Agora você pode receber cartas de qualquer um.'
                : 'Beleza! Agora você não vai poder receber cartas de ninguém.'

            return message.reply(`${e.Check} | ${response}`)

        }

        async function deleteLetter(recievedOrSended, content) {
            await Database.User.updateOne(
                { id: user.id },
                { $pull: { [`Letters.${recievedOrSended}`]: { content: content } } }
            )
            return
        }

        async function getLetter() {

            if (!args[1])
                return message.reply(`${e.Deny} | Forneça o ID da carta para que eu possa buscar a carta.`)

            let letterId = args[1].toUpperCase()

            if (letterId.length !== 7)
                return message.reply(`${e.Deny} | O ID da carta possui 7 digitos.`)

            let msg = await message.reply(`${e.Loading} | Buscando...`)
            let allDataUsers = await Database.User.find({}, 'id Letters.Recieved')

            let search = allDataUsers.find(data => data.Letters.Recieved.find(arr => arr.letterId === letterId)),
                letter = search?.Letters?.Recieved?.find(data => data.letterId === letterId),
                userId = search?.id

            if (!letter)
                return msg.edit(`${e.Deny} | Nenhuma carta foi encontrada.`).catch(() => { })

            let userRecieved = client.users.cache.get(userId)
            let userSended = client.users.cache.get(letter.from)
            let serverSended = client.guilds.cache.get(letter.guildId)

            return msg.edit({
                content: `${e.Check} | Carta encontrada com sucesso!`,
                embeds: [
                    {
                        color: client.blue,
                        title: `📨 ${client.user.username}'s Letters System`,
                        description: `ℹ Esta carta foi enviada por: ${letter.anonymous ? '\`Usuário anônimo\`' : `${userSended.tag || `\`Not Found\``} - \`${letter.from}\``}`,
                        fields: [{
                            name: `📝 Conteúdo da carta`,
                            value: `\`\`\`txt\n${letter.content}\n\`\`\``
                        }],
                        footer: { text: `A ${client.user.username} não se responsabiliza pelo conteúdo presente nesta carta.` }
                    },
                    {
                        color: client.blue,
                        title: `🔍 ${client.user.username} Letters System Info`,
                        description: `De: ${userSended?.tag || `\`Not Found\``} - \`${letter.from}\`\nPara: ${userRecieved?.tag || `\`Not Found\``} - \`${userId}\`\nDo servidor: ${serverSended?.name || `\`Not Found\``} - \`${letter.guildId}\`\nEnviado a: \`${client.formatTimestamp(letter.date)}\`\nEnviado em: \`${Data(letter.date - Date.now())}\``
                    }
                ]
            })

        }

        async function deleteLetterRequest() {

            if (!args[1])
                return message.reply(`${e.Deny} | Forneça o ID da carta para que eu possa saber o que deletar.`)

            let letterId = args[1].toUpperCase()

            if (letterId.length !== 7)
                return message.reply(`${e.Deny} | O ID da carta possui 7 digitos.`)

            let msg = await message.reply(`${e.Loading} | Localizando e deletando...`)
            let allDataUsers = await Database.User.find({}, 'id Letters')

            let search = allDataUsers.find(data => data.Letters.Recieved.find(arr => arr.letterId === letterId)),
                letter = search?.Letters?.Recieved?.find(data => data.letterId === letterId),
                search2 = allDataUsers.find(data => data.Letters.Sended.find(arr => arr.letterId === letterId)),
                letter2 = search2?.Letters?.Sended?.find(data => data.letterId === letterId)

            if (!letter && !letter2)
                return msg.edit(`${e.Deny} | Nenhuma carta foi encontrada.`).catch(() => { })

            let data = [{ id: search.id, i: 'Recieved' }, { id: search2.id, i: 'Sended' }]

            for (let d of data)
                await Database.User.updateOne(
                    { id: d.id },
                    { $pull: { [`Letters.${d.i}`]: { letterId: letterId } } }
                )

            return msg.edit(`${e.Check} | A carta \`${letterId}\` foi deletada com sucesso dos usuários \`${search.id || 'Not Found'}\` & \`${search2.id || 'Not Found'}\``)
        }

    }
}