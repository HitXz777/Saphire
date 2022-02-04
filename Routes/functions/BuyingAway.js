const { Message } = require('discord.js')
const { e } = require('../../database/emojis.json')
const { sdb, db, lotery } = require('./database')
const Moeda = require('./moeda')
const Error = require('./errors')
const NewLoteryGiveaway = require('./newlotery')
const ms = require('parse-ms')
const Vip = require('./vip')
const { PushTransaction } = require('./transctionspush')

/** 
* @param {Message} message
*/

function BuyingAway(message, prefix, args, args1) {

    let vip = Vip(`${message.author.id}`),
        money = sdb.get(`Users.${message.author.id}.Balance`) || 0,
        reg = /^\d+$/

    function NoMoney(x) { message.channel.send(`${e.Deny} | ${message.author}, você precisa de pelo menos ${x} ${Moeda(message)} na carteira para comprar este item.`) }
    function JaPossui() { message.reply(`${e.Info} | Você já possui este item.`) }
    function AddLoteria(x) { lotery.add(`Loteria.Prize`, x) }

    // Itens - BuyItem(NameDB, ItemName, Price)
    if (['vara de pesca', 'vara', 'pesca'].includes(args[0]?.toLowerCase())) return BuyItem('Vara', 'Vara de Pesca', 180)
    if (['anel', 'ring'].includes(args[0]?.toLowerCase())) return BuyItem('Anel', 'Anel de Casamento', 350000)
    if (['machado', 'axe'].includes(args[0]?.toLowerCase())) return BuyItem('Machado.Machado', 'Machado', 120)
    if (['arma', 'gun'].includes(args[0]?.toLowerCase())) return BuyItem('Arma', 'Arma', 4700)
    if (['picareta'].includes(args[0]?.toLowerCase())) return BuyItem('Picareta.Picareta', 'Picareta', 120)
    if (['título', 'title', 'titulo'].includes(args[0]?.toLowerCase())) return BuyPerfil('TitlePerm', 'Título', 10000)
    if (['balaclava', 'mask', 'mascara', 'máscara'].includes(args[0]?.toLowerCase())) return BuyItem('Balaclava', 'Balaclava', 60000)
    if (['cor', 'cores', 'color', 'colors'].includes(args[0]?.toLowerCase())) return ColorPerm()

    // Consumiveis - Consumivel(NomeDB, NomeAwnsers, quantia, Limit, Price)
    if (['ficha', 'fichas'].includes(args[0]?.toLowerCase())) return Consumivel('Fichas', 'fichas', parseInt(args1), 50, 5) // FichasDaRoleta()
    if (['agua', 'água', 'water', 'águas', 'aguas', 'copo', 'd\'água'].includes(args[0]?.toLowerCase())) return Consumivel('Aguas', 'águas', parseInt(args1), 80, 2) // Aguas()
    if (['isca', 'minhoca', 'iscas', 'minhocas', 'Isca', 'Iscas'].includes(args[0]?.toLowerCase())) return Consumivel('Iscas', 'iscas', parseInt(args1), 70, 1)
    if (['comida', 'food', 'comidas'].includes(args[0]?.toLowerCase())) return Consumivel('Comidas', 'comidas', parseInt(args1), 70, 2)
    if (['Carta', 'carta', 'cartas', 'Cartas', 'letter', 'Letter'].includes(args[0]?.toLowerCase())) return Consumivel('Cartas', 'cartas', parseInt(args1), 20, 100)
    if (['tickets', 'ticket'].includes(args[0]?.toLowerCase())) return BuyTickets()

    if (['estrela1'].includes(args[0]?.toLowerCase())) return Estrela1()
    if (['estrela2'].includes(args[0]?.toLowerCase())) return Estrela2()
    if (['estrela3'].includes(args[0]?.toLowerCase())) return Estrela3()
    if (['estrela4'].includes(args[0]?.toLowerCase())) return Estrela4()
    if (['estrela5'].includes(args[0]?.toLowerCase())) return Estrela5()

    return message.reply(`${e.Deny} | Eu não achei nenhum item com o nome **${args[0]?.toLowerCase()}** na minha loja, tente digitar um único nome, tipo "vara" ou "água".`)

    // Ok!
    function Estrela1() {
        if (sdb.get(`Users.${message.author.id}.Perfil.Estrela.Um`)) return JaPossui()
        if (sdb.get(`Users.${message.author.id}.Perfil.Estrela.Dois`) || sdb.get(`Users.${message.author.id}.Perfil.Estrela.Tres`) || sdb.get(`Users.${message.author.id}.Perfil.Estrela.Quatro`) || sdb.get(`Users.${message.author.id}.Perfil.Estrela.Cinco`)) return JaPossui()
        if (money >= 1000000) {
            sdb.subtract(`Users.${message.author.id}.Balance`, 1000000)
            AddLoteria(500000)
            sdb.set(`Users.${message.author.id}.Perfil.Estrela.Um`, true)
            return message.reply(`${e.Check} | ${message.author} comprou a ⭐ \`Estrela 1\`\n${e.PandaProfit} | -1000000 ${Moeda(message)}`)
        } else { NoMoney(1000000) }
    }

    // Ok!
    function Estrela2() {
        if (sdb.get(`Users.${message.author.id}.Perfil.Estrela.Dois`)) return JaPossui()
        if (!sdb.get(`Users.${message.author.id}.Perfil.Estrela.Um`)) return message.reply(`${e.Deny} | Você precisa da Estrela 1 para comprar a Estrela 2.`)
        if (sdb.get(`Users.${message.author.id}.Perfil.Estrela.Tres`) || sdb.get(`Users.${message.author.id}.Perfil.Estrela.Quatro`) || sdb.get(`Users.${message.author.id}.Perfil.Estrela.Cinco`)) return JaPossui()

        if (money >= 2000000) {
            sdb.subtract(`Users.${message.author.id}.Balance`, 2000000)
            AddLoteria(1000000)
            sdb.set(`Users.${message.author.id}.Perfil.Estrela.Dois`, true)
            sdb.set(`Users.${message.author.id}.Perfil.Estrela.Um`, false)
            return message.reply(`${e.Check} | ${message.author} comprou a ⭐⭐ \`Estrela 2\`\n${e.PandaProfit} | -2000000 ${Moeda(message)}`)
        } else { NoMoney(2000000) }
    }

    // Ok!
    function Estrela3() {
        if (sdb.get(`Users.${message.author.id}.Perfil.Estrela.Tres`)) return JaPossui()
        if (!sdb.get(`Users.${message.author.id}.Perfil.Estrela.Dois`)) return message.reply(`${e.Deny} | Você precisa da Estrela 2 para comprar a Estrela 3.`)
        if (sdb.get(`Users.${message.author.id}.Perfil.Estrela.Quatro`) || sdb.get(`Users.${message.author.id}.Perfil.Estrela.Cinco`)) return JaPossui()
        if (money >= 3000000) {
            sdb.subtract(`Users.${message.author.id}.Balance`, 3000000)
            AddLoteria(300000)
            sdb.set(`Users.${message.author.id}.Perfil.Estrela.Tres`, true)
            sdb.set(`Users.${message.author.id}.Perfil.Estrela.Dois`, false)
            return message.reply(`${e.Check} | ${message.author} comprou a ⭐⭐⭐ \`Estrela 3\`\n${e.PandaProfit} | -3000000 ${Moeda(message)}`)
        } else { NoMoney(3000000) }
    }

    // Ok!
    function Estrela4() {
        if (sdb.get(`Users.${message.author.id}.Perfil.Estrela.Quatro`)) return JaPossui()
        if (!sdb.get(`Users.${message.author.id}.Perfil.Estrela.Tres`)) return message.reply(`${e.Deny} | Você precisa da Estrela 3 para comprar a Estrela 4.`)
        if (sdb.get(`Users.${message.author.id}.Perfil.Estrela.Cinco`)) return JaPossui()
        if (money >= 4000000) {
            sdb.subtract(`Users.${message.author.id}.Balance`, 4000000)
            AddLoteria(2000000)
            sdb.set(`Users.${message.author.id}.Perfil.Estrela.Quatro`, true)
            sdb.set(`Users.${message.author.id}.Perfil.Estrela.Tres`, false)
            return message.reply(`${e.Check} | ${message.author} comprou a ⭐⭐⭐⭐ \`Estrela 4\`\n${e.PandaProfit} | -4000000 ${Moeda(message)}`)
        } else { NoMoney(4000000) }
    }

    // Ok!
    function Estrela5() {
        if (!vip) return message.reply(`${e.Deny} | Apenas membros Vips podem comprar a ${e.Star} Estrela 5`)
        if (sdb.get(`Users.${message.author.id}.Perfil.Estrela.Cinco`)) return JaPossui()
        if (!sdb.get(`Users.${message.author.id}.Perfil.Estrela.Quatro`)) return message.reply(`${e.Deny} | Você precisa da Estrela 4 para comprar a Estrela 5.`)
        if (money >= 5000000) {
            sdb.subtract(`Users.${message.author.id}.Balance`, 5000000)
            AddLoteria(2500000)
            sdb.set(`Users.${message.author.id}.Perfil.Estrela.Cinco`, true)
            sdb.set(`Users.${message.author.id}.Perfil.Estrela.Quatro`, false)
            return message.reply(`${e.Check} | ${message.author} comprou a ⭐⭐⭐⭐⭐ \`Estrela 5\`\n${e.PandaProfit} | -5000000 ${Moeda(message)}`)
        } else { NoMoney(5000000) }
    }

    async function BuyTickets() {

        if (lotery.get('Loteria.Close'))
            return message.reply(`${e.Deny} | A loteria não está aberta.`)

        let time = ms(300000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Loteria`))),
            count = 0,
            amount = args[1],
            i = 0,
            TicketsArray = []

        if (sdb.get(`Users.${message.author.id}.Timeouts.Loteria`) !== null && 300000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Loteria`)) > 0)
            return message.reply(`${e.Loading} | Volte em: \`${time.minutes}m e ${time.seconds}s\``)

        if (!lotery.get('Loteria.Users'))
            lotery.set('Loteria.Users', [])

        for (const ticket of lotery.get('Loteria.Users'))
            if (ticket === message.author.id)
                count++

        if (count >= 2000)
            return message.reply(`${e.Deny} | Você já atingiu o limite máximo de 2000 tickets comprados.`)

        if (args[2])
            return message.reply(`${e.Deny} | Por favor, use o comando somente com os argumentos necessários. \`${prefix}buy tickets <Quantidade>\``)

        if (!args[1] || isNaN(amount))
            return message.reply(`${e.Info} | Você precisa dizer a quantia de tickets que você deseja comprar. O limite por compra é de 300 tickets. Lembrando que cada ticket custa 10 ${Moeda(message)}.`)

        if (!reg.test(amount))
            return message.reply(`${e.Deny} | A quantidade informada possui virgulas ou pontos. Tente usar **somente** números inteiros que não contenha qualquer caracter que não seja 0~9`)

        if (parseInt(amount) > 300)
            return message.reply(`${e.Deny} | A quantidade de tickets não pode ser maior que 300.`)

        if ((sdb.get(`Users.${message.author.id}.Balance`) || 0) < amount * 10)
            return message.reply(`${e.Deny} | Você precisa de pelo menos **${amount * 10} ${Moeda(message)}** na carteira para comprar ${amount} 🎫 Tickets da Loteria.`)

        const msg = await message.reply(`${e.Loading} | Alocando tickets`)

        for (i; i < amount; i++) {

            TicketsArray.push(message.author.id)

            if (lotery.get('Loteria.Users')?.length + i >= 15000) {

                sdb.subtract(`Users.${message.author.id}.Balance`, i * 10)
                lotery.add('Loteria.Prize', i * 10)
                lotery.set('Loteria.Users', [...lotery.get('Loteria.Users'), ...TicketsArray])
                msg.edit(`${e.Check} | Você comprou +${i} 🎫 \`Tickets da Loteria\` aumentando o prêmio da loteria para **${lotery.get('Loteria.Prize') || 0} ${Moeda(message)}**.`).catch(() => { })
                return NewLoteryGiveaway(lotery.get('Loteria.Users'), message)

            }
        }

        sdb.set(`Users.${message.author.id}.Timeouts.Loteria`, Date.now())
        sdb.subtract(`Users.${message.author.id}.Balance`, i * 10)
        lotery.add('Loteria.Prize', i * 10)
        lotery.set('Loteria.Users', [...lotery.get('Loteria.Users'), ...TicketsArray])
        msg.edit(`${e.Check} | Você comprou +${i} 🎫 \`Tickets da Loteria\` aumentando o prêmio da loteria para **${lotery.get('Loteria.Prize') || 0} ${Moeda(message)}**.`).catch(() => { })

        if (lotery.get('Loteria.Users').length >= 15000)
            return NewLoteryGiveaway(lotery.get('Loteria.Users'), message)

        return

    }

    // 100% Funcional - Permite comprar todos itens de utilidade única
    function BuyItem(NameDB, ItemName, Price) {
        sdb.get(`Users.${message.author.id}.Slot.${NameDB}`) ? JaPossui() : (money >= Price ? BuyItemFunction() : NoMoney(Price))

        function BuyItemFunction() {
            sdb.subtract(`Users.${message.author.id}.Balance`, Price); AddLoteria(Price / 2)
            sdb.set(`Users.${message.author.id}.Slot.${NameDB}`, true)
            PushTransaction(
                message.author.id,
                `${e.MoneyWithWings} Gastou ${Price} Moedas na loja.`
            )
            return message.channel.send(`${e.Check} | ${message.author} comprou um item: \`${ItemName}\`\n${e.PandaProfit} | -${Price} ${Moeda(message)}`)
        }
    }

    function BuyPerfil(NameDB, ItemName, Price) {
        sdb.get(`Users.${message.author.id}.Perfil.${NameDB}`) ? JaPossui() : (money >= Price ? BuyItemFunction() : NoMoney(Price))

        function BuyItemFunction() {
            sdb.subtract(`Users.${message.author.id}.Balance`, Price); AddLoteria(Price / 2)
            sdb.set(`Users.${message.author.id}.Perfil.${NameDB}`, true)
            PushTransaction(
                message.author.id,
                `${e.MoneyWithWings} Gastou ${Price} Moedas na loja.`
            )
            return message.channel.send(`${e.Check} | ${message.author} comprou um item: \`${ItemName}\`\n${e.PandaProfit} | -${Price} ${Moeda(message)}`)
        }
    }

    function ColorPerm() {
        sdb.get(`Users.${message.author.id}.Color.Perm`) ? JaPossui() : (money >= 2000000 ? BuyItemFunction() : NoMoney(2000000))

        function BuyItemFunction() {
            sdb.subtract(`Users.${message.author.id}.Balance`, 2000000); AddLoteria(1000000)
            sdb.set(`Users.${message.author.id}.Color.Perm`, true)
            PushTransaction(
                message.author.id,
                `${e.MoneyWithWings} Gastou 2000000 Moedas na loja.`
            )
            return message.channel.send(`${e.Check} | ${message.author} comprou um item: \`Color\`\n${e.PandaProfit} | -2000000 ${Moeda(message)}`)
        }
    }

    // 100% Funcional - Checking e Complete limit
    function Consumivel(NomeTec, NomeUser, quantia, Limit, Price) {

        let Consumiveis = sdb.get(`Users.${message.author.id}.Slot.${NomeTec}`) || 0

        if (Consumiveis >= Limit) return message.reply(`${e.Deny} | Você já atingiu o seu limite de ${NomeUser}.`)
        if (!quantia) { return message.reply(`${e.QuestionMark} | Quantas ${NomeUser} você quer comprar? \`${prefix}buy ${NomeUser} quantidade\``) }
        if (money <= 0) { return message.reply(`${e.Deny} | ${message.author}, você não possui dinheiro na carteira.`) }
        if (isNaN(quantia)) { return message.reply(`${e.Deny} | **${quantia}** | Não é um número.`) }
        let q = quantia * Price
        let check = quantia + Consumiveis

        if (q > money) { return message.reply(`${e.PandaProfit} | Você precisa ter pelo menos ${q} ${Moeda(message)} na carteira para comprar ${quantia} ${NomeUser}.`) }

        if (check >= Limit) { Complete() } else { BuyItens() }

        function BuyItens() {
            sdb.add(`Users.${message.author.id}.Slot.${NomeTec}`, quantia)
            sdb.subtract(`Users.${message.author.id}.Balance`, quantia * Price)
            AddLoteria((quantia * Price) / 2)
            PushTransaction(
                message.author.id,
                `${e.MoneyWithWings} Gastou ${quantia * Price} Moedas na loja.`
            )
        message.channel.send(`${e.Check} | ${message.author} comprou ${quantia} ${NomeUser} ficando com um total de ${sdb.get(`Users.${message.author.id}.Slot.${NomeTec}`)} ${NomeUser}.\n${e.PandaProfit} | -${q} ${Moeda(message)}`)
        }

        function Complete() {
            let i = 0
            do {
                sdb.add(`Users.${message.author.id}.Slot.${NomeTec}`, 1)
                sdb.subtract(`Users.${message.author.id}.Balance`, Price)
                AddLoteria(Price / 2)
                i++
            } while (sdb.get(`Users.${message.author.id}.Slot.${NomeTec}`) <= Limit)
            PushTransaction(
                message.author.id,
                `${e.MoneyWithWings} Gastou ${Price * i - 1} Moedas na loja.`
            )
            message.channel.send(`${e.Check} | ${message.author} completou o limite de ${NomeUser} comprando +${i - 1} ${NomeUser}.\n${e.PandaProfit} | -${Price * i - 1} ${Moeda(message)}`)
        }
    }
}

module.exports = BuyingAway