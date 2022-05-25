const { MessageSelectMenu, MessageActionRow } = require('discord.js'),
    { DatabaseObj: { e } } = require('../../../modules/functions/plugins/database'),
    ms = require('parse-ms'),
    BuyingAway = require('../../../modules/functions/public/BuyingAway'),
    Moeda = require('../../../modules/functions/public/moeda'),
    NewLoteryGiveaway = require('../../../modules/functions/update/newlotery')

module.exports = {
    name: 'comprar',
    aliases: ['buy', 'loja', 'store', 'shop', 'itens', 'compra'],
    category: 'economy',
    emoji: `${e.Coin}`,
    usage: '<buy> [item/quantidade]',
    description: 'Compre itens da Loja Saphire',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let moeda = await Moeda(message),
            user = await Database.User.findOne({ id: message.author.id }),
            lotery = await Database.Lotery.findOne({ id: client.user.id }),
            color = user?.Color?.Set || client.blue,
            loteryPrize = lotery?.Prize || 0,
            money = user?.Balance || 0

        if (args[0]) return BuyingAway(message, prefix, args, money, color, moeda, user)

        let attColorPerm,
            attTitlePerm = user.Perfil?.TitlePerm,
            LojaEmbed = new MessageEmbed()
                .setColor(color)
                .setTitle(`${e.PandaProfit} Lojinha ${client.user.username} 24h`)
                .setDescription(`Aqui na Lojinha ${client.user.username}, você pode comprar várias coisas para ter acesso a comandos e funções incriveis.\n\`${prefix}buy <item> [quantidade]\``)
                .addFields(
                    {
                        name: 'Disponíveis',
                        value: `💌 \`Carta de Amor\` 100 ${moeda}`
                    },
                    {
                        name: 'Sorte',
                        value: `🎫 \`Ticket Loteria\` 10 ${moeda} | Montante: (${loteryPrize > 0 ? parseInt(loteryPrize)?.toFixed(0) : 0})\n${e.raspadinha} \`Raspadinha\` 100 ${moeda}`
                    },
                    {
                        name: 'Perfil',
                        value: `⭐ \`Estrela1\` 1.000.000 ${moeda}\n⭐⭐ \`Estrela2\` 2.000.000 ${moeda}\n⭐⭐⭐ \`Estrela3\` 3.000.000 ${moeda}\n⭐⭐⭐⭐ \`Estrela4\` 4.000.000 ${moeda}`
                    },
                    {
                        name: 'Permissões',
                        value: `🎨 \`Cores\` 180.000 ${moeda}\n🔰 \`Título\` 10.000 ${moeda}`
                    },
                    {
                        name: 'Fundos/Wallpapers/Backgrounds',
                        value: `\`${prefix}comprar bg <code>\` Compre um único wallpaper\n\`${prefix}levelwallpapers\` Todos os wallpapers de levels`
                    }
                )
                .setImage('https://media.discordapp.net/attachments/893361065084198954/978449901522399362/unknown.png?width=729&height=361')
                .setFooter({ text: `${prefix}buy | ${prefix}vender | ${prefix}slot` }),
            itens = new MessageEmbed()
                .setColor(color)
                .setTitle('📋 Itens e suas funções')
                .setDescription('Todos os dados de todos os itens aqui em baixo')
                .addField('Itens Consumiveis', `Itens consumiveis são aqueles que são gastos a cada vez que é usado\n \n🎫 \`Ticket\` Aposte na loteria \`${prefix}buy ticket\`\n${e.raspadinha} \`Raspadinha\` Vale jogo na \`${prefix}raspadinha\`\n⏩ \`Skip\` Use para pular perguntas no quiz.\n💌 \`Cartas\` Use para conquistar alguém`)
                .addField('Perfil', 'Itens de perfil são aqueles que melhora seu perfil\n \n⭐ `Estrela` Estrelas no perfil')
                .addField('Permissões', `Permissões libera comandos bloqueados\n \n🔰 \`Título\` Mude o título no perfil \`${prefix}titulo <Novo Título>\`\n🎨 \`Cores\` Mude as cores das suas mensagens \`${prefix}setcolor <#CódigoHex>\``)

        const PainelLoja = new MessageActionRow()
            .addComponents(new MessageSelectMenu()
                .setCustomId('menu')
                .setPlaceholder('Menu de compras') // Mensagem estampada
                .addOptions([
                    {
                        label: 'Lojinha Saphire',
                        description: 'Painel principal da lojinha',
                        emoji: `${e.BlueHeart || '💙'}`,
                        value: 'Embed',
                    },
                    {
                        label: 'Itens',
                        description: 'Todos os itens da Classe Economia',
                        emoji: '📝',
                        value: 'Itens',
                    },
                    {
                        label: 'Restaurar Dívida',
                        description: `Restaurar a dívida da carteira`,
                        emoji: `${e.MoneyWings || '💸'}`,
                        value: 'Dívida',
                    },
                    {
                        label: 'Quiz Skip',
                        description: 'Pule pergunta usando a palavra "skip"',
                        emoji: '⏩',
                        value: 'Skip',
                    },
                    {
                        label: 'Completar Raspadinhas',
                        description: `Completar limite de 50 raspadinhas | ${prefix}raspadinha`,
                        emoji: e.raspadinha,
                        value: 'Raspadinha',
                    },
                    {
                        label: 'Tickets da Loteria',
                        description: `Comprar 100 tickets | ${prefix}loteria`,
                        emoji: '🎫',
                        value: 'Ticket',
                    },
                    {
                        label: 'Carta de Amor',
                        description: `Completar limite de 50 cartas | ${prefix}carta`,
                        emoji: '💌',
                        value: 'Carta',
                    },
                    {
                        label: 'Título',
                        description: `Personalize seu título > ${prefix}perfil > ${prefix}titulo`,
                        emoji: '🔰',
                        value: 'Titulo',
                    },
                    {
                        label: 'Cores',
                        description: `Personalize suas cores > ${prefix}setcolor`,
                        emoji: '🎨',
                        value: 'Cores',
                    },
                    {
                        label: 'Já terminei',
                        description: 'Delete a mensagem',
                        emoji: `${e.Deny || '❌'}`,
                        value: 'Close',
                    }
                ])
            )

        if (!args[0]) {

            const msg = await message.reply({ content: '50% do dinheiro gasto na loja vão para a loteria, exceto os tickets (100%).', embeds: [LojaEmbed], components: [PainelLoja] }),
                coletor = msg.createMessageComponentCollector({
                    filter: (interaction) => interaction.customId === 'menu' && interaction.user.id === message.author.id,
                    idle: 60000
                })

            coletor.on('end', async () => {
                LojaEmbed.setColor('RED').setFooter({ text: `Sessão encerrada | ${message.author.id}` })

                return msg.edit({ components: [] }).catch(() => { })
            })

            coletor.on('collect', async (collected) => {
                if (collected.user.id !== message.author.id) return

                let att = await Database.User.findOne({ id: message.author.id }, 'Balance Color Perfil')
                money = att.Balance || 0
                attColorPerm = att.Color?.Perm
                attTitlePerm = att.Perfil?.TitlePerm

                let item = collected.values[0]
                collected.deferUpdate().catch(() => { })

                msg.edit({ components: [PainelLoja] }).catch(() => { })
                switch (item) {
                    case 'Embed': msg.edit({ embeds: [LojaEmbed] }).catch(() => { }); break;
                    case 'Itens': msg.edit({ embeds: [itens] }).catch(() => { }); break;
                    case 'Dívida': Divida(); break
                    case 'Ticket': Ticket(); break;
                    case 'Carta': Cartas(); break;
                    case 'Cores': NewColor(); break;
                    case 'Titulo': Titulo(); break;
                    case 'Skip': buySkips(); break;
                    case 'Raspadinha': buyRaspadinhas(); break;
                    case 'Close': msg.edit({ components: [] }).catch(() => { }); break;
                    default: msg.edit({ components: [PainelLoja] }).catch(() => { }); break;
                }

                return
            })

        }

        function PushData(value) {
            Database.PushTransaction(
                message.author.id,
                `${e.loss} Gastou ${value} Safiras na loja`
            )
        }

        function NoMoney(value) {
            return message.channel.send(`${e.Deny} | ${message.author}, você precisa de pelo menos ${value} ${moeda} na carteira para comprar este item.`)
        }

        function NewColor() {
            return attColorPerm ? message.reply(`${e.Info} | Você já possui este item.`) : (money >= 180000 ? BuyNewColor() : NoMoney(180000))

            async function BuyNewColor() {
                Database.subtract(message.author.id, 180000)
                addLotery(60000)
                PushData(180000)

                Database.updateUserData(message.author.id, 'Color.Perm', true)

                return message.channel.send(`${e.Check} | ${message.author} comprou a permissão 🎨 \`Cores\`.\n${e.PandaProfit} | -180000 ${moeda}`)
            }
        }

        async function Divida() {

            let Client = await Database.Client.findOne({ id: client.user.id }, 'Timeouts.RestoreDividas')

            let time = ms(86400000 - (Date.now() - Client.Timeouts?.RestoreDividas))
            if (Client.Timeouts?.RestoreDividas !== null && 86400000 - (Date.now() - Client.Timeouts?.RestoreDividas) > 0) {
                return message.reply(`${e.MoneyWings} | Próxima restauração em: \`${time.hours}h, ${time.minutes}m, e ${time.seconds}s\`\n${e.PandaProfit} ~ Se você for o primeiro(a) a conseguir o claim logo após o tempo zerar, eu pagarei toda sua dívida.`)
            } else {
                money >= 0 ? message.channel.send(`${e.Deny} | ${message.author}, você não possui dívida.`) : Restore()
            }

            async function Restore() {

                await Database.Client.updateOne(
                    { id: client.user.id },
                    { 'Timeouts.RestoreDividas': Date.now() },
                    { upsert: true }
                )

                let Divida = money
                let profit = (Divida - Divida) - Divida
                message.channel.send(`${e.Check} | ${message.author} restaurou sua dívida com sucesso!\n${e.PandaProfit} | +${profit} ${moeda}`).catch(() => { })
                Database.delete(message.author.id, 'Balance')

                Database.PushTransaction(message.author.id, `${e.Admin} Restaurou a dívida de ${Divida} Safiras no Restore Global Debt.`)
                return
            }
        }

        function Titulo() {
            return attTitlePerm ? message.reply(`${e.Info} | Você já possui este item.`) : (money >= 10000 ? BuyTitulo() : NoMoney(10000))

            function BuyTitulo() {
                Database.subtract(message.author.id, 10000)
                addLotery(60)
                PushData(10000)
                Database.updateUserData(message.author.id, 'Perfil.TitlePerm', true)
                return message.channel.send(`${e.Check} | ${message.author} comprou a permissão 🔰 \`Título\`.\n${e.PandaProfit} | -10000 ${moeda}`)
            }
        }

        async function buySkips() {

            let data = await Database.User.findOne({ id: message.author.id }, 'Slot.Skip Balance')
            let x = data.Slot?.Skip || 0

            return x >= 10
                ? message.reply(`${e.Deny} | Você já atingiu o limite de Quiz Skip.`)
                : data.Balance >= (10 - x) * 50
                    ? BuySkip()
                    : message.channel.send(`${e.Deny} | ${message.author}, você precisa de ${(50 - x) * 2} ${moeda} para comprar mais ${10 - x} Quiz Skip.`)

            function BuySkip() {
                Database.subtract(message.author.id, (10 - x) * 50)
                PushData((10 - x) * 50)
                addLotery(((10 - x) * 50) / 2)
                Database.addItem(message.author.id, 'Slot.Skip', 10 - x)
                return message.channel.send(`${e.Check} | ${message.author} completou o limite de \`Quiz Skip\` comprando +${10 - x} cartas.\n${e.PandaProfit} | -${(10 - x) * 50} ${moeda}`)
            }
        }

        async function buyRaspadinhas() {

            let data = await Database.User.findOne({ id: message.author.id }, 'Slot.Raspadinhas Balance')
            let x = data.Slot?.Raspadinhas || 0

            return x >= 50
                ? message.reply(`${e.Deny} | Você já atingiu o limite de Raspadinhas.`)
                : data.Balance >= (50 - x) * 100
                    ? completeRaspadinhas()
                    : message.channel.send(`${e.Deny} | ${message.author}, você precisa de ${(100 - x) * 2} ${moeda} para comprar mais ${50 - x} Raspadinhas.`)

            function completeRaspadinhas() {
                Database.subtract(message.author.id, (50 - x) * 100)
                PushData((50 - x) * 100)
                addLotery(((50 - x) * 100) / 2)
                Database.addItem(message.author.id, 'Slot.Raspadinhas', 50 - x)
                return message.channel.send(`${e.Check} | ${message.author} completou o limite de \`Raspadinhas\` comprando +${50 - x} unidades.\n${e.PandaProfit} | -${(50 - x) * 100} ${moeda}`)
            }
        }

        async function Ticket() {

            let Lotery = await Database.Lotery.findOne({ id: client.user.id }, 'Prize Close Users')

            if (Lotery?.Close)
                return message.reply(`${e.Deny} | A loteria não está aberta.`)

            let count = 0
            for (const ticket of Lotery?.Users || [])
                if (ticket === message.author.id)
                    count++

            if (count >= 2000)
                return message.reply(`${e.Deny} | Você já atingiu o limite máximo de 2000 tickets comprados.`)

            money >= 1000 ? AddNewTickets(Lotery) : NoMoney(1000)
        }

        async function AddNewTickets(Lotery) {

            Database.subtract(message.author.id, 1000)
            PushData(1000)
            let msg = await message.channel.send(`${e.Loading} | Alocando tickets...`),
                TicketsArray = [],
                i = 0

            for (i; i < 100; i++) {

                TicketsArray.push(message.author.id)

                if ((Lotery?.Users?.length + i) + 1 >= 15000)
                    break
            }

            Database.pushUsersLotery(TicketsArray, client.user.id)
            Database.subtract(message.author.id, i * 10)
            addLotery(i * 10)
            msg.edit(`${e.Check} | ${message.author} comprou +${i} 🎫 \`Tickets da Loteria\` aumentando o prêmio para ${loteryPrize?.toFixed(0)} ${moeda}.\n${e.PandaProfit} | -1000 ${moeda}`).catch(() => { })

            if (Lotery?.Users?.length + i >= 15000)
                return NewLoteryGiveaway(message)

            return
        }

        async function Cartas() {
            let data = await Database.User.findOne({ id: message.author.id }, 'Slot.Cartas Balance')
            let x = data.Slot?.Cartas || 0
            return x >= 50 ? message.reply(`${e.Deny} | Você já atingiu o limite de cartas.`) : data.Balance >= (50 - x) * 2 ? BuyCartas() : message.channel.send(`${e.Deny} | ${message.author}, você precisa de ${(50 - x) * 2} ${moeda} para comprar mais ${50 - x} cartas.`)
            function BuyCartas() {
                Database.subtract(message.author.id, (50 - x) * 2)
                PushData((50 - x) * 2)
                addLotery(((50 - x) * 2) / 2)
                Database.addItem(message.author.id, 'Slot.Cartas', 50 - x)
                return message.channel.send(`${e.Check} | ${message.author} completou o limite de \`Cartas de Amor\` comprando +${50 - x} cartas.\n${e.PandaProfit} | -${(50 - x) * 2} ${moeda}`)
            }
        }

        function addLotery(amount) {
            Database.addLotery(amount, client.user.id)
        }

    }
}