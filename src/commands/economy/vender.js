const { e } = require('../../../database/emojis.json'),
    Moeda = require('../../../Routes/functions/moeda'),
    { PushTransaction } = require('../../../Routes/functions/transctionspush')

module.exports = {
    name: 'vender',
    aliases: ['sell'],
    category: 'economy',
    emoji: `${e.BagMoney2}`,
    usage: '<vender> <info>',
    description: 'Vendas... Vendas. Venda o que você tem',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user = message.mentions.members.first() || message.mentions.repliedUser,
            Amount = parseInt(args[1])

        if (!args[0] || ['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase()))
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`🪙 Sistema de Vendas ${client.user.username}`)
                        .setDescription('Aqui você pode vender seus itens em troca de Moedas. É muito simples, basta usar o comando, assim você pode vender os itens obtidos.')
                        .addField('Comando', `\`${prefix}sell <NomeDoItem> <Quantidade>\``)
                        .addField('Todos os itens', `\`${prefix}loja - Categoria: Itens>`)
                ]
            })

        if (user) return message.reply(`${e.Info} | O sistema de venda inter-jogadores estará pronto dentro de alguns dias.`)

        // if (['estrela', 'stars', 'star', 'estrelas'].includes(args[0]?.toLowerCase())) return SellStars()
        if (['camarao', 'camarão', 'camarões', 'camaroes'].includes(args[0]?.toLowerCase())) return SaphireSelling('Slot.Camarao', 'camarões', 4, '🍤')
        if (['diamantes', 'diamante', 'diamond', 'diamonds'].includes(args[0]?.toLowerCase())) return SaphireSelling('Slot.Diamante', 'diamantes', Math.floor(Math.random() * 4000) + 1, '💎')
        if (['minerios', 'minérios'].includes(args[0]?.toLowerCase())) return SaphireSelling('Slot.Minerios', 'minerios', 6, '🪨')
        if (['ossos', 'osso', 'bones', 'bone'].includes(args[0]?.toLowerCase())) return SaphireSelling('Slot.Ossos', 'ossos', 3, '🦴')
        if (['maca', 'macas', 'maça', 'maças', 'apple', 'apples'].includes(args[0]?.toLowerCase())) return SaphireSelling('Slot.Apple', 'maças', 2, '🍎')
        if (['rosas', 'rosa'].includes(args[0]?.toLowerCase())) return SaphireSelling('Slot.Rosas', 'rosas', 4, '🌹')
        if (['peixes', 'peixe', 'fish', 'fishs'].includes(args[0]?.toLowerCase())) return SaphireSelling('Slot.Peixes', 'peixes', 3, '🐟')
        if (['faca', 'knife'].includes(args[0]?.toLowerCase())) return SaphireSellingUniqueItem('Slot.Faca', 'Faca', 35000, '🔪')
        if (['fossil'].includes(args[0]?.toLowerCase())) return SaphireSellingUniqueItem('Slot.Fossil', 'Fossil', 145000, e.Fossil)
        if (['diamantenegro', 'darkdiamond'].includes(args[0]?.toLowerCase())) return SaphireSellingUniqueItem('Slot.DiamanteNegro', 'Diamante Negro', 250000, e.DarkDiamond)

        return message.reply(`${e.Info} | Já tentou usar o comando \`${prefix}vender info\` ou só \`${prefix}vender\``)

        function SaphireSelling(DataBaseRoute, ItemPluralNameToLowerCased, ItemPrice, Emoji) {

            const ItemToSell = sdb.get(`Users.${message.author.id}.${DataBaseRoute}`) || 0

            if (['all', 'tudo', 'todos', 'todas'].includes(args[1]?.toLowerCase())) Amount = ItemToSell

            if (ItemToSell < 1)
                return message.reply(`${e.Deny} | Você não possui ${Emoji} ${ItemPluralNameToLowerCased}.`)

            if (!Amount || Amount < 1)
                return message.reply(`${e.Info} | Você precisa falar quantos ${Emoji} ${ItemPluralNameToLowerCased} você quer vender...`)

            if (Amount > ItemToSell)
                return message.reply(`${e.Deny} | Você não possui tudo isso de ${Emoji} ${ItemPluralNameToLowerCased}.`)

            sdb.subtract(`Users.${message.author.id}.${DataBaseRoute}`, Amount)

            if (sdb.get(`Users.${message.author.id}.${DataBaseRoute}`) <= 0)
                sdb.delete(`Users.${message.author.id}.${DataBaseRoute}`)

            PushTransaction(message.author.id, `💰 Recebeu ${Amount * ItemPrice} Moedas vendendo ${Amount} ${ItemPluralNameToLowerCased}`)

            return message.reply(`${e.Check} | Você venceu ${Amount} ${Emoji} ${ItemPluralNameToLowerCased} e faturou ${Add(Amount, ItemPrice)}`)

        }

        function SaphireSellingUniqueItem(DataBaseRoute, ItemName, Price, Emoji) {

            let UniqueItem = sdb.get(`Users.${message.author.id}.${DataBaseRoute}`)

            if (!UniqueItem)
                return message.reply(`${e.Deny} | Você não tem este item.`)

            sdb.delete(`Users.${message.author.id}.${DataBaseRoute}`)

            return message.reply(`${e.Check} | Você vendeu o item ${Emoji} ${ItemName} e faturou ${Add(1, Price)}`)

        }

        function Add(Quantidade, ItemPrice) {
            sdb.add(`Users.${message.author.id}.Balance`, Quantidade * ItemPrice)
            return `${Quantidade * ItemPrice} ${Moeda(message)}`
        }

    }
}