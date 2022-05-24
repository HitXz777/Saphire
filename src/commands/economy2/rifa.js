const { e } = require('../../../JSON/emojis.json'),
    Moeda = require('../../../modules/functions/public/moeda'),
    { config } = require('../../../JSON/config.json')

module.exports = {
    name: 'rifa',
    aliases: ['raffle'],
    category: 'economy',
    emoji: e.ticketRifa,
    usage: '<rifa> <info>',
    description: 'Compre seus números e boa sorte!',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        
        let moeda = await Moeda(message)
        if (!args[0] || ['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return rifaInfo()

        let rifa = await Database.Raffle.find({}) || [],
            userData = await Database.User.findOne({ id: message.author.id }, 'Balance'),
            clientRifa = rifa.find(data => data.ClientId === client.user.id),
            isClose = clientRifa?.Close

        if (['buy', 'comprar', 'b'].includes(args[0]?.toLowerCase())) return newTicket()
        if (['stats', 'status', 's'].includes(args[0]?.toLowerCase())) return raffleStats()
        return message.reply(`${e.Deny} | Sub-comando não reconhecido... Tenta usar \`${prefix}rifa info\``)

        async function newTicket() {

            if (isClose) return message.reply(`${e.Deny} | A rifa está fechada.`)

            let controlFilter = rifa.filter(data => data.MemberId === message.author.id) || [],
                price = 100 * ((controlFilter.length + 1) * 2)

            if (controlFilter.length >= 10)
                return message.reply(`${e.Deny} | Você já atingiu o limite de 10 tickets.`)

            if (!userData.Balance || userData.Balance < price)
                return message.reply(`${e.Deny} | Você precisa de pelo menos **${price} ${moeda}** para comprar um ticket da rifa.`)

            let numbersAvaliable = []

            for (let i = 1; i <= 90; i++) {

                let control = rifa?.some(data => data.id === i)

                if (!control) numbersAvaliable.push(i)
                continue
            }

            if (numbersAvaliable.length === 0)
                return message.reply(`${e.Info} | Todos os tickets da rifa já foram comprados.`)

            let msg = await message.reply(
                {
                    content: `${e.Loading} | Me fala o número que você quer comprar`,
                    embeds: [
                        new MessageEmbed()
                            .setColor(client.blue)
                            .setTitle(`${e.ticketRifa} ${client.user.username} Rifa | Números disponíveis`)
                            .setDescription(`> ${numbersAvaliable.map(num => `\`${num}\``).join(', ')}`)
                    ]
                }
            ),
                collector = message.channel.createMessageCollector({
                    filter: m => m.author.id === message.author.id,
                    max: 1,
                    time: 60000
                })

            collector.on('collect', async m => {

                if (['cancel', 'cancelar', 'close', 'fechar'].includes(m.content)) return collector.stop()

                let num = parseInt(m.content)

                if (isNaN(num))
                    return m.reply(`${e.Deny} | Isso não é um número. Tenta usa o comando novamente.`)

                if (num < 1 || num > 90)
                    return m.reply(`${e.Deny} | Os números devem ser inteiros e entre 0~90`)

                if (!numbersAvaliable.includes(num))
                    return message.reply(`${e.Deny} | Esse número não está disponível.`)

                let reData = await Database.Raffle.findOne({ id: num })
                if (reData) return m.reply(`${e.Deny} | Esse número acabou de ser comprado antes de você falar. Tente outro número.`)

                Database.subtract(message.author.id, price)
                Database.PushTransaction(message.author.id, `${e.loss} Gastou ${price} Safiras comprando o ticket **${num}** na rifa.`)

                new Database.Raffle(
                    {
                        id: num,
                        MemberId: message.author.id
                    }
                ).save()

                await Database.Raffle.updateOne(
                    { ClientId: client.user.id },
                    {
                        $inc: { Prize: price }
                    },
                    { upsert: true }
                )

                collector.stop()
                return m.reply(`${e.Check} | Você comprou um ticket da Rifa! Número: ${e.ticketRifa} **${num}**\n${e.Info} | **${controlFilter.length + 1 < 10 ? `Seu próximo ticket da Rifa custará ${100 * ((controlFilter.length + 2) * 2)}  ${moeda}` : 'Limite de tickets da rifa atingido.'}**`)

            })

            collector.on('end', () => msg.delete().catch(() => { }))

        }

        async function raffleStats() {

            let arrayValidation = [],
                user = message.mentions.users.first() || message.mentions.repliedUser || client.users.cache.get(args[1])

            if (['me', 'eu'].includes(args[1]?.toLowerCase())) user = message.author

            if (user) return validateFilterUser()
            return generalRaffle()

            async function validateFilterUser() {
                const loadingMessage = await message.reply(`${e.Loading} Obtendo dados e construindo...`)
                let control = rifa?.filter(data => data.MemberId === user.id) || []

                if (!control || control.length === 0)
                    return message.reply(`${e.Deny} | Nenhum ticket da rifa foi comprado.`)

                for (const data of control)
                    arrayValidation.push(data.id)

                return sendEmbed(EmbedGenerator(arrayValidation, 'user', user), loadingMessage)
            }

            async function generalRaffle() {
                const loadingMessage = await message.reply(`${e.Loading} Obtendo dados e construindo...`)
                for (let i = 1; i <= 90; i++) {

                    let control = rifa?.find(data => data.id === i)

                    arrayValidation.push({ id: i, stats: control?.MemberId || false })
                    continue
                }
                return sendEmbed(EmbedGenerator(arrayValidation), loadingMessage)
            }

            async function sendEmbed(arrayEmbed, loadingMessage) {
                loadingMessage.delete().catch(() => { })
                if (!arrayEmbed || arrayEmbed.length === 0)
                    return message.reply(`${e.Deny} | Nenhum dado foi encontrado.`)

                let embeds = arrayEmbed,
                    msg = await message.reply({ embeds: [embeds[0]] }),
                    emojis = ['⬅️', '➡️', '❌'],
                    control = 0

                if (arrayEmbed.length > 1)
                    for (let i of emojis) msg.react(i).catch(() => { })
                else return

                const collector = msg.createReactionCollector({
                    filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                    idle: 30000
                })

                    .on('collect', (reaction) => {

                        if (reaction.emoji.name === emojis[2]) return collector.stop()

                        if (reaction.emoji.name === emojis[0]) {
                            control--
                            return embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control++
                        }

                        if (reaction.emoji.name === emojis[1]) {
                            control++
                            return embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control--
                        }
                        return
                    })

                    .on('end', () => msg.edit({ content: `${e.Deny} | Comando cancelado` }).catch(() => { }))
            }
        }

        function EmbedGenerator(array, userString, user) {

            let amount = 20,
                Page = 1,
                embeds = [],
                length = array.length / 20 <= 1 ? 1 : parseInt((array.length / 20) + 1),
                isUser = userString === 'user',
                titleFormat = isUser ? `${e.ticketRifa} Rifas Compradas | ${user?.username}` : `${e.ticketRifa} ${client.user.username}'s Rifas Status`,
                lastWinner = client.users.cache.get(clientRifa?.LastWinner)

            for (let i = 0; i < array.length; i += 20) {

                let current = array.slice(i, amount),
                    description = isUser
                        ? current.map(data => `\`${data}\``).join(', ')
                        : current.map(
                            data => {

                                let id = data.id,
                                    stats = data.stats,
                                    user = client.users.cache.get(stats),
                                    infoFormat = user ? `${e.ticketRifa} \`${user.tag?.replace(/`/g, '')} - ${user.id}\`` : `${e.Check} \`Disponível\``

                                if (stats && !user) {
                                    deleteRifa(id)
                                    infoFormat = `${e.Deny} \`Usuário não encontrado\``
                                }

                                return `${id} - ${infoFormat}`
                            }
                        ).join('\n'),
                    PageCount = `${length > 1 ? ` - ${Page}/${length}` : ''}`

                if (current.length > 0) {

                    embeds.push({
                        color: client.blue,
                        title: `${titleFormat}${PageCount}`,
                        description: `${description || 'Nenhuma rifa encontrada'}`,
                        fields: [
                            {
                                name: `${e.Taxa} Prêmio Acumulado`,
                                value: `${clientRifa.Prize || 0} ${moeda}`
                            },
                            {
                                name: `${e.CoroaDourada} Último Ganhador*(a)*`,
                                value: `${lastWinner ? `${lastWinner.tag} \`${lastWinner.id}\`\n${clientRifa.LastPrize} ${moeda}` : 'Ninguém'}`
                            }
                        ],
                        footer: {
                            text: `${rifa.length - 1} rifas contabilizadas`
                        },
                    })

                    Page++
                    amount += 20

                }

            }

            return embeds;
        }

        async function deleteRifa(rifaNumber) {
            await Database.Raffle.deleteOne({ id: rifaNumber })
            return
        }

        async function rifaInfo() {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`${e.ticketRifa} ${client.user.username} Rifa`)
                        .setDescription(`Seja muito bem vindo*(a)* a **${client.user.username} Rifa**, ${message.author}!\n \nO jogo é fácil. Você pode comprar números da rifa para ter mais chances. Atualmente, o limite é 90 rifas globalmente. *(Com o decorrer do tempo pode aumentar.)*\n \n${e.Info} O resultado da rifa é liberado no [meu servidor](${config.ServerLink}) em duas ocasiões.\n> 1. Todos os números da rifa foram comprados.\n> 2. Meia noite da Sexta-Feira pro Sábado.\n*obs: Atualmente, o limite mínimo para sorteio são de 20 números comprados, o máximo é 90.*`)
                        .addFields(
                            {
                                name: `${e.MoneyWings} Compre números`,
                                value: `\`${prefix}rifa buy\`\n${e.Info} Após o comando, escolha um dos números disponíveis.`
                            },
                            {
                                name: `${e.Stonks} Números comprados`,
                                value: `\`${prefix}rifa stats <me/@user/id>\`\n${e.Info} Você pode olhar todos os números que foram comprados. Adicionando \`me\`, você vê os seus números comprados. Com \`@user/id\`, você vê os números que a pessoa comprou.`
                            },
                            {
                                name: `${e.Taxa} Mais de um número comprado`,
                                value: `${e.Info} Cada número vale **200 ${moeda}.** A cada número adicional comprado, você paga por todos os outros número que você já comprou.\n> Exemplo: Na compra do 1º número, você pagará 200 ${moeda}. No 2º número, 400 ${moeda}. Sempre adicionando mais 200.\n*obs: O limite máximo de números comprados por usuário é 10.*`
                            }
                        )
                ]
            })
        }

    }
}