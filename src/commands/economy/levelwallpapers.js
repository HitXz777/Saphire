const { e } = require('../../../JSON/emojis.json'),
    Moeda = require('../../../modules/functions/public/moeda'),
    Colors = require('../../../modules/functions/plugins/colors'),
    Vip = require('../../../modules/functions/public/vip'),
    { MessageButton, MessageActionRow } = require('discord.js')

module.exports = {
    name: 'levelwallpapers',
    aliases: ['lvlwall', 'levelwall'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '🖼️',
    usage: '<levelwallpapers> [all]',
    description: 'Confira os wallpapers de level',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (['servidor', 'server'].includes(args[0]?.toLowerCase()))
            return message.reply(`${e.SaphireHi} | Este é o link do chat onde está armazenado todos os wallpapers do level.\nhttps://discord.gg/FcF8w46EAF`)

        const BgLevel = Database.BgLevel

        let LevelWallpapers = BgLevel.get('LevelWallpapers'),
            moeda = await Moeda(message),
            color = await Colors(message.author.id),
            ObjKey = Object.keys(LevelWallpapers || {})?.sort((a, b) => a.slice(2) - b.slice(2))

        if (args[1])
            return message.reply(`${e.Deny} | Diga apenas o código <bg> do wallpaper que deseja ver. Para ver todos, use o comando \`${prefix}lvlwall all\``)

        if (['all', 'todos'].includes(args[0]?.toLowerCase())) return AllWallpapers()
        if (args[0]) return WallPapers(ObjKey.findIndex(bg => bg === args[0]))
        return WallPapers()

        async function WallPapers(indexControl = 0) {

            if (indexControl < 0) indexControl = Math.floor(Math.random() * ObjKey.length)

            let key = ObjKey[indexControl],
                wallpaper = BgLevel.get(`LevelWallpapers.${key}`),
                amount = ObjKey.length,
                price = `${wallpaper.Price} ${moeda}\n${e.VipStar} Vip: ${wallpaper.Price - (wallpaper.Price * 0.3)} ${moeda}`,
                limite = `${wallpaper.Limit ? `\`${wallpaper.Limit}\` unidades` : wallpaper.Limit === 0 ? '\`Esgotado\`' : '\`Infinito\`'}`

            let WallPaperEmbed = new MessageEmbed()
                .setColor(color)
                .setDescription(`${e.Reference} Nome: [${wallpaper.Name}](${wallpaper.Image})\n${e.BagMoney2} Preço: ${price}\n${e.PepeRich} Comissão: ${parseInt(wallpaper.Price * 0.02)?.toFixed(0)} ${moeda}\n🖌️ Designer: ${client.users.cache.get(wallpaper.Designer)?.tag || "Anonymous"}\n${e.Commands} Code: ${key}\n${e.boxes} Estoque: ${limite}`)
                .setImage(wallpaper.Image)
                .setFooter({ text: `Compre: ${prefix}buy bg ${key} | Wallpapers totais: ${amount}` })

            let buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('left')
                        .setEmoji('⬅️')
                        .setLabel('Voltar')
                        .setStyle('PRIMARY')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('right')
                        .setEmoji('➡️')
                        .setLabel('Avançar')
                        .setStyle('PRIMARY')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('random')
                        .setEmoji('🔄')
                        .setLabel('Aleatório')
                        .setStyle('PRIMARY')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('fastBuy')
                        .setEmoji('💳')
                        .setLabel('Comprar')
                        .setStyle('SUCCESS')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('cancel')
                        .setEmoji('❌')
                        .setLabel('Cancelar')
                        .setStyle('DANGER')
                )

            const msg = await message.reply(
                {
                    content: `Para ver algum wallpaper em especifico, use \`${prefix}levelwallpapers <code>\`. Caso queira ver todos, use \`${prefix}lvlwall all\` ou use \`${prefix}lvlwall server\`.`,
                    embeds: [WallPaperEmbed],
                    components: [buttons]
                })
            //  emojis = ['⬅️', '➡️', '🔄', '💳', '❌']

            // for (let i of emojis) msg.react(i).catch(() => { })

            const collector = msg.createMessageComponentCollector({
                filter: (int) => int.user.id === message.author.id,
                idle: 30000
            })

                .on('collect', (interaction) => {
                    interaction.deferUpdate().catch(() => { })

                    let intId = interaction.customId

                    if (!['left', 'right', 'random', 'fastBuy', 'cancel'].includes(intId)) return

                    if (intId === 'cancel')
                        return collector.stop()

                    if (intId === 'fastBuy')
                        return trade(true)

                    if (intId === 'random') {
                        indexControl = Math.floor(Math.random() * ObjKey.length)
                        return trade()
                    }

                    if (intId === 'right') {
                        indexControl++
                        if (!ObjKey[indexControl]) indexControl = 0
                        return trade()
                    }

                    if (intId === 'left') {
                        indexControl--
                        if (!ObjKey[indexControl]) indexControl = ObjKey.length - 1
                        return trade()
                    }

                    function trade(fastBuy = false) {
                        key = ObjKey[indexControl]

                        if (fastBuy) return BuyBackground(key)

                        wallpaper = BgLevel.get(`LevelWallpapers.${key}`)
                        price = `${wallpaper.Price} ${moeda}\n${e.VipStar} Vip: ${wallpaper.Price - (wallpaper.Price * 0.3)} ${moeda}`
                        limite = `${wallpaper.Limit ? `\`${wallpaper.Limit}\` unidades` : wallpaper.Limit === 0 ? '\`Esgotado\`' : '\`Infinito\`'}`

                        WallPaperEmbed.setColor(color)
                            .setDescription(`${e.Reference} Nome: [${wallpaper.Name}](${wallpaper.Image})\n${e.BagMoney2} Preço: ${price}\n${e.PepeRich} Comissão: ${parseInt(wallpaper.Price * 0.02)?.toFixed(0)} ${moeda}\n🖌️ Designer: ${client.users.cache.get(wallpaper.Designer)?.tag || "Anonymous"}\n${e.Commands} Code: ${key}\n${e.boxes} Estoque: ${limite}`)
                            .setImage(wallpaper.Image)
                            .setFooter({ text: `Compre: ${prefix}buy bg ${key} | Wallpapers totais: ${amount} | 💳 Compra rápida` })

                        return msg.edit({ embeds: [WallPaperEmbed] }).catch(() => { })
                    }

                    return
                })

                .on('end', () => {
                    WallPaperEmbed.setColor('RED').setFooter({ text: 'Sessão expirada' })
                    msg.edit({ content: `${e.Deny} | Comando cancelado.`, embeds: [WallPaperEmbed], components: [] })
                })

        }

        async function AllWallpapers() {

            let BgArray = [],
                control = 0,
                BgCodes = ''

            BgCodes = Object.keys(LevelWallpapers || {})?.sort((a, b) => a.slice(2) - b.slice(2))

            for (const bg of BgCodes)
                BgArray.push({ code: bg, name: LevelWallpapers[bg].Name, price: LevelWallpapers[bg].Price, limit: LevelWallpapers[bg].Limit, image: LevelWallpapers[bg].Image })

            function EmbedGenerator() {

                let amount = 10,
                    Page = 1,
                    embeds = [],
                    length = parseInt(BgArray.length / 10) + 1

                for (let i = 0; i < BgArray.length; i += 10) {

                    let current = BgArray.slice(i, amount),
                        description = current.map((wall) => {

                            let limite = `${wall.limit ? `\`${wall.limit}\` Unidades` : wall.limit === 0 ? '\`Esgotado\`' : '\`Infinito\`'}`

                            return ` \n> ${e.Reference} [${wall.name}](${wall.image})\n> ${e.Commands} Código: \`${wall.code}\` | ${wall.price} ${moeda}\n> ${e.boxes} Estoque: ${limite}`
                        }).join("\n")

                    embeds.push({
                        color: color,
                        title: `🖼️ ${client.user.username} Level's Wallpapers - ${Page}/${length}`,
                        description: `${description}`,
                        footer: {
                            text: `${BgArray.length} Wallpapers | ${prefix}lvlwall <código>`
                        },
                    })

                    Page++
                    amount += 10

                }

                return embeds;
            }

            const embeds = EmbedGenerator()

            const msg = await message.reply({ embeds: [embeds[0]] })

            if (embeds.length > 1)
                for (const emoji of ['◀️', '▶️'])
                    msg.react(emoji).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => ['◀️', '▶️'].includes(reaction.emoji.name) && user.id === message.author.id,
                idle: 60000,
                errors: ['idle']
            });

            collector.on('collect', (reaction, user) => {

                if (reaction.emoji.name === '◀️') {
                    control--
                    embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control++
                }

                if (reaction.emoji.name === '▶️') {
                    control++
                    embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control--
                }

            });

            collector.on('end', () => msg.reactions.removeAll().catch(() => { }))

        }

        async function BuyBackground(code) {

            let Client = await Database.Client.findOne({ id: client.user.id }, 'BackgroundAcess'),
                vip = await Vip(message.author.id),
                userData = await Database.User.findOne({ id: message.author.id }, 'Balance Walls')

            if (Client.BackgroundAcess?.includes(message.author.id))
                return message.channel.send(`${e.Deny} | ${message.author}, você possui acesso a todos os wallpapers gratuitamente.`)

            const BgLevel = Database.BgLevel

            let price = BgLevel.get(`LevelWallpapers.${code}.Price`),
                name = BgLevel.get(`LevelWallpapers.${code}.Name`),
                designerId = BgLevel.get(`LevelWallpapers.${code}.Designer`),
                limite = BgLevel.get(`LevelWallpapers.${code}.Limit`),
                money = userData?.Balance || 0

            if (vip)
                price -= parseInt(price * 0.3)

            if (price < 1) price = 0

            if (userData?.Walls?.Bg?.includes(code) || code === 'bg0')
                return message.channel.send(`${e.Info} | ${message.author}, você já possui este wallpaper.`)

            if (limite < 1)
                return message.channel.send(`${e.Deny} | ${message.author}, este wallpaper está esgotado.`)

            if (price > money)
                return message.channel.send(`${e.Deny} | ${message.author}, você precisa de pelo menos **${price} ${moeda}** para comprar o fundo **${name}**`)

            let msg = await message.channel.send(`${e.QuestionMark} | ${message.author}, você confirma a compra do wallpaper \`${name}\` por **${price} ${moeda}**?`),
                emojis = ['✅', '❌']

            for (let i of emojis) msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                max: 1,
                time: 30000,
                errors: ['time']
            })

                .on('collect', (reaction) => {

                    if (reaction.emoji.name === emojis[0])
                        return newFastBuy()

                    return collector.stop()
                })

                .on('end', () => msg.delete().catch(() => { }))

            function newFastBuy() {

                let comissao = parseInt(price * 0.02)

                if (comissao < 1) comissao = 0

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

                return message.channel.send({
                    embeds: [
                        new MessageEmbed().setColor('GREEN')
                            .setTitle(`💳 Compra rápida efetuada`)
                            .setDescription(`${e.Info} | ${message.author}, você comprou o wallpaper \`${name}\`, para ativar, use o comando \`${prefix}level set ${code}\`.`)
                    ]
                })
            }

            return
        }

    }
}
