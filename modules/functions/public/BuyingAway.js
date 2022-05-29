const { Message, MessageEmbed } = require('discord.js'),
    { e } = require('../../../JSON/emojis.json'),
    NewLoteryGiveaway = require('../update/newlotery'),
    ms = require('parse-ms'),
    Vip = require('../public/vip'),
    Database = require('../../classes/Database'),
    client = require('../../../index')

/** 
* @param {Message} message
*/

async function BuyingAway(message, prefix, args, money, color, moeda, user) {

    if (!user)
        return message.reply(`${e.Menhera} | Opa! tenta usar o comando de novo.`)

    let vip = await Vip(`${message.author.id}`),
        reg = /^\d+$/

    if (['bg', 'wall', 'wallpapers', 'fundo', 'capa'].includes(args[0]?.toLowerCase())) return BuyBackground()
    if (['título', 'title', 'titulo'].includes(args[0]?.toLowerCase())) return BuyItem('Perfil', 'TitlePerm', 'Título', 10000)
    if (['cor', 'cores', 'color', 'colors'].includes(args[0]?.toLowerCase())) return BuyItem('Color', 'Perm', 'Permissão de Cor', 180000)
    if (['rifa', 'rifaticket'].includes(args[0]?.toLowerCase())) return newRifaTicket()

    if (['carta', 'cartas', 'letter', 'letters'].includes(args[0]?.toLowerCase())) return Consumivel('Slot', 'Cartas', 'cartas', parseInt(args[1]), 50, 2, '📨')
    if (['skip', 'skips', 'jump', 'pular'].includes(args[0]?.toLowerCase())) return Consumivel('Slot', 'Skip', 'Quiz Skip', parseInt(args[1]), 10, 50, '⏩')
    if (['rasp', 'rp', 'raspa', 'raspadinhas', 'raspadinha'].includes(args[0]?.toLowerCase())) return Consumivel('Slot', 'Raspadinhas', 'Raspadinhas', parseInt(args[1]), 50, 100, e.raspadinha)
    if (['tickets', 'ticket'].includes(args[0]?.toLowerCase())) return BuyTickets()

    if (['estrela1'].includes(args[0]?.toLowerCase())) return Estrela1()
    if (['estrela2'].includes(args[0]?.toLowerCase())) return Estrela2()
    if (['estrela3'].includes(args[0]?.toLowerCase())) return Estrela3()
    if (['estrela4'].includes(args[0]?.toLowerCase())) return Estrela4()
    if (['estrela5'].includes(args[0]?.toLowerCase())) return Estrela5()

    return message.reply(`${e.Deny} | Eu não achei nenhum item com o nome **${args[0]?.toLowerCase()}** na minha loja, tente digitar um único nome. Você já viu no painel rápido da \`${prefix}loja\`?`)

    function Estrela1() {
        if (user?.Perfil.Estrela.Um) return JaPossui()
        if (user?.Perfil.Estrela.Dois || user?.Perfil.Estrela.Tres || user?.Perfil.Estrela.Quatro || user?.Perfil.Estrela.Cinco) return JaPossui()
        if (money >= 1000000) {
            Database.subtract(message.author.id, 1000000)
            AddLoteria(500000)
            Database.updateUserData(message.author.id, 'Perfil.Estrela.Um', true)
            return message.reply(`${e.Check} | ${message.author} comprou a ⭐ \`Estrela 1\`\n${e.PandaProfit} | -1000000 ${moeda}`)
        } else { NoMoney(1000000) }
    }

    function Estrela2() {
        if (user?.Perfil.Estrela.Dois) return JaPossui()
        if (!user?.Perfil.Estrela.Um) return message.reply(`${e.Deny} | Você precisa da Estrela 1 para comprar a Estrela 2.`)
        if (user?.Perfil.Estrela.Tres || user?.Perfil.Estrela.Quatro || user?.Perfil.Estrela.Cinco) return JaPossui()

        if (money >= 2000000) {
            Database.subtract(message.author.id, 2000000)
            AddLoteria(1000000)
            Database.updateUserData(message.author.id, 'Perfil.Estrela.Dois', true)
            Database.updateUserData(message.author.id, 'Perfil.Estrela.Um', false)
            return message.reply(`${e.Check} | ${message.author} comprou a ⭐⭐ \`Estrela 2\`\n${e.PandaProfit} | -2000000 ${moeda}`)
        } else { NoMoney(2000000) }
    }

    function Estrela3() {
        if (user?.Perfil.Estrela.Tres) return JaPossui()
        if (!user?.Perfil.Estrela.Dois) return message.reply(`${e.Deny} | Você precisa da Estrela 2 para comprar a Estrela 3.`)
        if (user?.Perfil.Estrela.Quatro || user?.Perfil.Estrela.Cinco) return JaPossui()
        if (money >= 3000000) {
            Database.subtract(message.author.id, 3000000)
            AddLoteria(300000)
            Database.updateUserData(message.author.id, 'Perfil.Estrela.Tres', true)
            Database.updateUserData(message.author.id, 'Perfil.Estrela.Dois', false)
            return message.reply(`${e.Check} | ${message.author} comprou a ⭐⭐⭐ \`Estrela 3\`\n${e.PandaProfit} | -3000000 ${moeda}`)
        } else { NoMoney(3000000) }
    }

    function Estrela4() {
        if (user?.Perfil.Estrela.Quatro) return JaPossui()
        if (!user?.Perfil.Estrela.Tres) return message.reply(`${e.Deny} | Você precisa da Estrela 3 para comprar a Estrela 4.`)
        if (user?.Perfil.Estrela.Cinco) return JaPossui()
        if (money >= 4000000) {
            Database.subtract(message.author.id, 4000000)
            AddLoteria(2000000)
            Database.updateUserData(message.author.id, 'Perfil.Estrela.Quatro', true)
            Database.updateUserData(message.author.id, 'Perfil.Estrela.Tres', false)
            return message.reply(`${e.Check} | ${message.author} comprou a ⭐⭐⭐⭐ \`Estrela 4\`\n${e.PandaProfit} | -4000000 ${moeda}`)
        } else { NoMoney(4000000) }
    }

    function Estrela5() {
        if (!vip) return message.reply(`${e.Deny} | Apenas membros Vips podem comprar a ${e.Star} Estrela 5`)
        if (user?.Perfil.Estrela.Cinco) return JaPossui()
        if (!user?.Perfil.Estrela.Quatro) return message.reply(`${e.Deny} | Você precisa da Estrela 4 para comprar a Estrela 5.`)
        if (money >= 5000000) {
            Database.subtract(message.author.id, 5000000)
            AddLoteria(2500000)
            Database.updateUserData(message.author.id, 'Perfil.Estrela.Cinco', true)
            Database.updateUserData(message.author.id, 'Perfil.Estrela.Quatro', false)
            return message.reply(`${e.Check} | ${message.author} comprou a ⭐⭐⭐⭐⭐ \`Estrela 5\`\n${e.PandaProfit} | -5000000 ${moeda}`)
        } else { NoMoney(5000000) }
    }

    async function BuyTickets() {

        let lotery = await Database.Lotery.findOne({ id: client.user.id })

        if (lotery.Close)
            return message.reply(`${e.Deny} | A loteria não está aberta.`)

        let time = ms(300000 - (Date.now() - user?.Timeouts.Loteria)),
            count = 0,
            amount = args[1],
            i = 0,
            TicketsArray = [],
            taxa = 0,
            moneyToLotery = 0,
            loteryUsers = lotery?.Users || []

        if (client.Timeout(300000, user?.Timeouts?.Loteria))
            return message.reply(`${e.Loading} | Volte em: \`${time.minutes}m e ${time.seconds}s\``)

        count = loteryUsers.filter(data => data === message.author.id)?.length || 0

        if (count >= 2000)
            return message.reply(`${e.Deny} | Você já atingiu o limite máximo de 2000 tickets comprados.`)

        if (!args[1] || isNaN(amount) || amount < 1)
            return message.reply(`${e.Info} | Você precisa dizer a quantia de tickets que você deseja comprar. O limite por compra é de 1~500 tickets. Lembrando que cada ticket custa 10 ${moeda}.`)

        if (!reg.test(amount))
            return message.reply(`${e.Deny} | A quantidade informada possui virgulas ou pontos. Tente usar **somente** números inteiros que não contenha qualquer caracter que não seja 0~9`)

        if (parseInt(amount) > 500)
            return message.reply(`${e.Deny} | A quantidade de tickets não pode ser maior que 500.`)

        if (money < amount * 10)
            return message.reply(`${e.Deny} | Você precisa de pelo menos **${amount * 10} ${moeda}** na carteira para comprar ${amount} 🎫 Tickets da Loteria.`)

        const msg = await message.reply(`${e.Loading} | Alocando tickets`)

        for (i; i < amount; i++) {

            TicketsArray.push(message.author.id)

            if (loteryUsers?.length + i >= 15000) {

                taxa += parseInt((i * 10) * 0.04)
                moneyToLotery += (i * 10) - taxa
                let feedBack
                feedBack = taxa > 0 ? `${e.Taxa} | *Taxa: (4%) -${taxa} ${moeda} foram retirados do prêmio da loteria*` : ''

                Database.subtract(message.author.id, i * 10)
                AddLoteria(moneyToLotery)
                Database.resetLoteryUsers(client.user.id)
                Database.closeLotery(client.user.id)
                Database.pushUsersLotery(TicketsArray, client.user.id)

                msg.edit(`${e.Check} | Você comprou +${i} 🎫 \`Tickets da Loteria\` aumentando o prêmio da loteria para **${(lotery.Prize || 0) + moneyToLotery} ${moeda}**.\n${feedBack}`).catch(() => { })
                return NewLoteryGiveaway(message)

            }
        }

        taxa += parseInt((i * 10) * 0.04)
        moneyToLotery += (i * 10) - taxa
        let feedBack
        feedBack = taxa > 0 ? `${e.Taxa} | *Taxa: (4%) -${taxa} ${moeda} foram retirados do prêmio da loteria*` : ''

        Database.PushTransaction(
            message.author.id,
            `${e.loss} Gastou ${i * 10} Safiras comprando ${i} Tickets da Loteria.`
        )
        Database.SetTimeout(message.author.id, 'Timeouts.Loteria')
        Database.subtract(message.author.id, i * 10)
        AddLoteria(moneyToLotery)
        Database.pushUsersLotery(TicketsArray, client.user.id)

        msg.edit(`${e.Check} | Você comprou +${i} 🎫 \`Tickets da Loteria\` aumentando o prêmio da loteria para **${(lotery.Prize || 0) + moneyToLotery} ${moeda}**.\n${feedBack}`).catch(() => { })

        return

    }

    function BuyItem(Rota1, NameDB, ItemName, Price) {

        return user[Rota1][NameDB] ? JaPossui() : (money >= Price ? confirmation() : NoMoney(Price))

        async function confirmation() {

            let msg = await message.reply(`${e.QuestionMark} | Você tem certeza que deseja comprar o item \`${ItemName}\` por **${Price} ${moeda}**?`),
                emojis = ['✅', '❌'], clicked = false
            for (let i of emojis) msg.react(i).catch(() => { })

            collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                max: 1,
                time: 60000,
                erros: ['max', 'time']
            })
                .on('collect', (reaction) => {

                    if (reaction.emoji.name === emojis[1]) return

                    clicked = true
                    return BuyItemFunction(msg)

                })
                .on('end', () => {
                    if (clicked) return
                    return msg.edit(`${e.Deny} | Compra cancelada.`).catch(() => { })
                })
        }

        function BuyItemFunction(msg) {
            Database.subtract(message.author.id, Price)
            AddLoteria(Price / 2)
            Database.updateUserData(message.author.id, `${Rota1}.${NameDB}`, true)
            Database.PushTransaction(
                message.author.id,
                `${e.loss} Gastou ${Price} Safiras na loja.`
            )
            return msg.edit(`${e.Check} | ${message.author} comprou um item: \`${ItemName}\`\n${e.PandaProfit} | -${Price} ${moeda}`).catch(() => { })
        }
    }

    function Consumivel(Rota1, NomeTec, NomeUser, quantia, Limit, Price, Emoji) {

        let Consumiveis = user[Rota1][NomeTec] || 0

        if (Consumiveis >= Limit) return message.reply(`${e.Deny} | Você já atingiu o seu limite de ${Emoji} ${NomeUser}.`)
        if (!quantia) return message.reply(`${e.QuestionMark} | Quantas ${NomeUser} você quer comprar? \`${prefix}buy ${NomeUser} quantidade\``)
        if (isNaN(quantia)) return message.reply(`${e.Deny} | O valor informado não é um número.`)
        if (quantia <= 0) return message.reply(`${e.Deny} | Você não pode estar falando sério, né? Uma compra negativa?`)
        if (money <= 0) return message.reply(`${e.Deny} | ${message.author}, você não possui dinheiro na carteira.`)
        let q = quantia * Price
        let check = quantia + Consumiveis

        if (q > money) return message.reply(`${e.PandaProfit} | Você precisa ter pelo menos ${q} ${moeda} na carteira para comprar +${quantia} ${NomeUser}.`)

        return check >= Limit ? Complete() : BuyItens()

        async function BuyItens() {

            Database.addItem(message.author.id, `${Rota1}.${NomeTec}`, quantia)
            Database.subtract(message.author.id, quantia * Price)
            AddLoteria((quantia * Price) / 2)
            Database.PushTransaction(
                message.author.id,
                `${e.loss} Gastou ${quantia * Price} Safiras na loja.`
            )
            return message.channel.send(`${e.Check} | ${message.author} comprou ${quantia} ${Emoji} ${NomeUser} ficando com um total de ${Emoji} ${Consumiveis + quantia} ${NomeUser}.\n${e.PandaProfit} | -${q} ${moeda}`)
        }

        async function Complete() {

            let quantiaAtual = user?.[Rota1][NomeTec] || 0,
                toComplete = 0

            for (let i = quantiaAtual; quantiaAtual + toComplete < Limit; i++) {
                toComplete++
            }

            let finalPrice = toComplete * Price

            if (money - finalPrice < 0) return message.reply(`${e.Deny} | Você precisa ter pelo menos ${finalPrice} ${moeda} na carteira para comprar mais ${toComplete} ${NomeUser}`)

            Database.addItem(message.author.id, `${Rota1}.${NomeTec}`, toComplete)
            Database.subtract(message.author.id, finalPrice)
            AddLoteria(finalPrice / 2)

            Database.PushTransaction(
                message.author.id,
                `${e.loss} Gastou ${finalPrice} Safiras na loja.`
            )

            return message.channel.send(`${e.Check} | ${message.author} completou o limite de ${NomeUser} comprando +${toComplete} ${NomeUser}.\n${e.PandaProfit} | -${finalPrice} ${moeda}`)
        }

    }

    function NoMoney(x) { return message.channel.send(`${e.Deny} | ${message.author}, você precisa de pelo menos **${x} ${moeda}** na carteira para comprar este item.`) }
    function JaPossui() { return message.reply(`${e.Info} | Você já possui este item.`) }

    async function AddLoteria(Amount) {

        await Database.Lotery.updateOne(
            { id: client.user.id },
            { $inc: { Prize: Amount } },
            { upsert: true }
        )

    }

    async function BuyBackground() {

        let Client = await Database.Client.findOne({ id: client.user.id }, 'BackgroundAcess'),
            vip = await Vip(message.author.id)

        if (Client.BackgroundAcess?.includes(message.author.id))
            return message.reply(`${e.Deny} | Você possui acesso a todos os wallpapers gratuitamente.`)

        const BgLevel = Database.BgLevel

        let wallpapers = Object.keys(BgLevel.get('LevelWallpapers') || {}),
            code = args[1]?.toLowerCase(),
            price = BgLevel.get(`LevelWallpapers.${code}.Price`),
            name = BgLevel.get(`LevelWallpapers.${code}.Name`),
            image = BgLevel.get(`LevelWallpapers.${code}.Image`),
            designerId = BgLevel.get(`LevelWallpapers.${code}.Designer`),
            limite = BgLevel.get(`LevelWallpapers.${code}.Limit`),
            limiteString = `${limite ? `\`${limite}\` Unidades` : limite === 0 ? '\`Esgotado\`' : '\`Infinito\`'}`

        if (vip)
            price -= parseInt(price * 0.3)

        if (price < 1) price = 0

        if (!code)
            return message.channel.send(`${e.Info} | Informe o código do wallpaper que você deseja. O código é seguido das letras **bg** mais um **número**. Exemplo: \`${prefix}buy wall bg1\`.\nNão sabe o código do seu wallpaper? Use o comando \`${prefix}levelwallpapers\``)

        if (!wallpapers.includes(args[1]))
            return message.reply(`${e.Deny} | Esse background não existe. Verifique o código informado.`)

        if (user?.Walls?.Bg?.includes(code) || code === 'bg0')
            return message.channel.send(`${e.Info} | Você já possui este wallpaper.`)

        if (limite < 1)
            return message.reply(`${e.Deny} | Este wallpaper está esgotado.`)

        if (price > money)
            return message.channel.send(`${e.Deny} | Você precisa de pelo menos **${price} ${moeda}** para comprar o fundo **${name}**`)

        let comissao = parseInt(price * 0.02)

        if (comissao < 1) comissao = 0

        const embed = new MessageEmbed()
            .setColor(color)
            .setTitle(`${e.Info} | Confirmação de compra`)
            .setDescription(`🖼️ Wallpaper: \`${name}\`\n📎 Código: \`${code}\`\n${e.PandaProfit} Preço: ${price} ${moeda}\n🖌️ Criador: ${client.users.cache.get(designerId)?.tag || 'Indefinido'}\n${e.PepeRich} Comissão: ${comissao} ${moeda}\n${e.boxes} Estoque: ${limiteString}`)
            .setImage(image),
            msg = await message.reply({ embeds: [embed] }),
            emojis = ['✅', '❌']

        for (let i of emojis) msg.react(i).catch(() => { })

        return msg.awaitReactions({
            filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
            max: 1,
            time: 15000,
            errors: ['time']
        }).then(async collected => {
            const reaction = collected.first()

            if (reaction.emoji.name === '✅') {

                let data = await Database.User.findOne({ id: message.author.id }, 'Walls.Bg')
                if (data?.Walls?.Bg?.includes(code))
                    return msg.edit({ content: `${e.Deny} | Você já possui esse wallpaper.`, embeds: [] }).catch(() => { })

                Database.pushUserData(message.author.id, 'Walls.Bg', code)

                if (client.users.cache.has(designerId) && comissao > 1) {
                    Database.PushTransaction(designerId, `${e.gain} Ganhou ${comissao} Safiras via *Wallpaper Designers CashBack*`)
                    Database.add(designerId, comissao)
                }

                if (limite > 0) BgLevel.subtract(`LevelWallpapers.${code}.Limit`, 1)

                if (price > 0) {

                    Database.subtract(message.author.id, price)
                    Database.PushTransaction(
                        message.author.id,
                        `${e.loss} Gastou ${price} Safiras comprando o *Wallpaper ${code}*`
                    )
                }

                return msg.edit({
                    content: `${e.Check} Compra confirmada!`,
                    embeds: [
                        embed.setColor('GREEN')
                            .setTitle(`${e.Check} Compra efetuada com sucesso!`)
                            .setDescription(`${e.SaphireObs} | ${message.author}, eu já adicionei o novo wallpaper no seu slot. Você pode usar \`${prefix}level set ${code}\` para usar o seu novo wallpaper.`)
                    ]
                }).catch(() => { })

            }

            return msg.edit({ content: `${e.Deny} | Comando cancelado.`, embeds: [embed.setColor('RED')] }).catch(() => { })

        }).catch(() => msg.edit({ content: `${e.Deny} | Comando cancelado por tempo expirado.`, embeds: [embed.setColor('RED')] }).catch(() => { }))

    }

    async function newRifaTicket() {

        let rifa = await Database.Raffle.find({}) || [],
            clientRifa = rifa.find(data => data.ClientId === client.user.id),
            isClose = clientRifa?.Close

        if (isClose) return message.reply(`${e.Deny} | A rifa está fechada.`)

        let controlFilter = rifa.filter(data => data.MemberId === message.author.id) || [],
            price = 100 * ((controlFilter.length + 1) * 2)

        if (controlFilter.length >= 10)
            return message.reply(`${e.Deny} | Você já atingiu o limite de 10 tickets.`)

        if (!user.Balance || user.Balance < price)
            return message.reply(`${e.Deny} | Você precisa de pelo menos **${price} ${moeda}** para comprar um ticket da rifa.`)

        let numbersAvaliable = []

        for (let i = 1; i <= 90; i++) {

            let control = rifa?.some(data => data.id === i)

            if (!control) numbersAvaliable.push(i)
            continue
        }

        if (numbersAvaliable.length === 0)
            return messaage.reply(`${e.Info} | Todos os tickets da rifa já foram comprados.`)

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

}

module.exports = BuyingAway