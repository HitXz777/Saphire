const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const { BgLevel } = require('../../../Routes/functions/database')
const { N } = require('../../../database/nomes.json')
const Moeda = require('../../../Routes/functions/moeda')
const Colors = require('../../../Routes/functions/colors')
const Error = require('../../../Routes/functions/errors')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'levelwallpapers',
    aliases: ['lvlwall'],
    category: 'economy2',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '🖼️',
    usage: '<levelwallpapers> [all]',
    description: 'Confira os wallpapers de level',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (['servidor', 'server'].includes(args[0]?.toLowerCase()))
            return message.reply(`${e.SaphireHi} | Este é o link do chat onde está armazenado todos os wallpapers do level.\nhttps://discord.gg/FcF8w46EAF`)

        let LevelWallpapers = BgLevel.get('LevelWallpapers')

        function WallPapers() {

            if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

            let ObjKey = Object.keys(LevelWallpapers),
                key = ObjKey[Math.floor(Math.random() * ObjKey.length)],
                wallpaper = BgLevel.get(`LevelWallpapers.${key}`),
                amount = Object.values(LevelWallpapers).length

            const WallPaperEmbed = new MessageEmbed().setColor(Colors(message.member)).setDescription(`Nome: ${wallpaper?.Name || 'Indefinido'}\nPreço: ${wallpaper?.Price || 'Indefinido'} ${Moeda(message)}\nVip: ${(wallpaper?.Price || 0) - ((wallpaper?.Price || 0) * 0.3)} ${Moeda(message)}\nCode: ${key}`).setImage(wallpaper.Image).setFooter(`Compre: ${prefix}buy bg ${key} | Wallpapers totais: ${amount}`)

            return message.reply({ content: `Para ver algum wallpaper em especifico, use \`${prefix}levelwallpapers <code>\`. Caso queira ver todos, use \`${prefix}lvlwall all\` ou use \`${prefix}lvlwall server\`.`, embeds: [WallPaperEmbed] }).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('🔄').catch(() => { }) // 1º Embed
                msg.react('❌').catch(() => { })

                let TradeFilter = (reaction, user) => { return reaction.emoji.name === '🔄' && user.id === message.author.id },
                    TradeWallpaper = msg.createReactionCollector({ filter: TradeFilter, idle: 60000 })

                TradeWallpaper.on('collect', (reaction, user) => {

                    try {
                        key = Object.keys(LevelWallpapers)[Math.floor(Math.random() * Object.keys(LevelWallpapers).length)]
                        wallpaper = BgLevel.get(`LevelWallpapers.${key}`)
                    } catch (err) { Error(message, err) }

                    reaction.users.remove(message.author.id).catch(() => { TradeWallpaper.stop() })
                    let price = `${wallpaper.Price} ${Moeda(message)}\nVip: ${wallpaper.Price - (wallpaper.Price * 0.3)} ${Moeda(message)}`
                    WallPaperEmbed.setColor(Colors(message.member))
                        .setDescription(`Nome: ${wallpaper.Name}\nPreço: ${price}\nCode: ${key}`)
                        .setImage(wallpaper.Image)
                        .setFooter(`Compre: ${prefix}buy bg ${key} | Wallpapers totais: ${amount}`)
                    msg.edit({ embeds: [WallPaperEmbed] }).catch(() => { })

                })
                TradeWallpaper.on('end', (reaction, user) => { sdb.delete(`Request.${message.author.id}`); msg.reactions.removeAll().catch(() => { }); WallPaperEmbed.setColor('RED').setFooter(`Sessão expirada | Wallpapers por: ${N.Pepy}`); msg.edit({ embeds: [WallPaperEmbed] }).catch(() => { }) })

                let CancelFilter = (reaction, user) => { return reaction.emoji.name === '❌' && user.id === message.author.id }; let CancelSession = msg.createReactionCollector({ filter: CancelFilter, max: 1, time: 30000, errors: ['time', 'max'] })
                CancelSession.on('collect', (reaction, user) => { msg.reactions.removeAll().catch(() => { }); WallPaperEmbed.setColor('RED').setFooter(`Sessão expirada | Wallpapers por: ${N.Pepy}`); msg.edit({ embeds: [WallPaperEmbed] }).catch(() => { }) })
                CancelSession.on('end', (reaction, user) => { sdb.delete(`Request.${message.author.id}`); msg.reactions.removeAll().catch(() => { }); WallPaperEmbed.setColor('RED').setFooter(`Sessão expirada | Wallpapers por: ${N.Pepy}`); msg.edit({ embeds: [WallPaperEmbed] }).catch(() => { }) })

            }).catch(err => {
                Error(message, err)
                sdb.delete(`Request.${message.author.id}`)
                return message.reply(`${e.Warn} | Houve um erro ao executar este comando\n\`${err}\``)
            })
        }

        function WallPapersCode() {

            let wallpaper

            try {
                if (!Object.keys(LevelWallpapers).includes(args[0]))
                    return message.reply(`${e.Deny} | O bgCode **${args[0]}** não existe no meu banco de dados.`)

                wallpaper = BgLevel.get(`LevelWallpapers.${args[0]}`)
            } catch (err) { Error(message, err) }

            let price = `${wallpaper.Price} ${Moeda(message)}\nVip: ${wallpaper.Price - (wallpaper.Price * 0.3)} ${Moeda(message)}`
            const WallPaperEmbed = new MessageEmbed().setColor(Colors(message.member)).setDescription(`Nome: ${wallpaper.Name}\nPreço: ${price}\nCode: ${args[0]}`).setImage(wallpaper.Image).setFooter(`Compre: ${prefix}buy bg ${args[0]}`)
            return message.reply({ embeds: [WallPaperEmbed] })

        }

        async function AllWallpapers() {

            let BgArray = []
            let control = 0
            let BgCodes = ''

            try {

                BgCodes = Object.keys(LevelWallpapers)?.sort((a, b) => a.slice(2) - b.slice(2))

                for (const bg of BgCodes) {
                    BgArray.push({ code: bg, name: LevelWallpapers[bg].Name, price: LevelWallpapers[bg].Price })
                }

            } catch (err) {
                Error(message, err)
            }

            function EmbedGenerator() {
                let amount = 10
                let Page = 1
                const embeds = [];
                let length = parseInt(BgArray.length / 10) + 1

                for (let i = 0; i < BgArray.length; i += 10) {

                    const current = BgArray.slice(i, amount)
                    const description = current.map((wall) => ` \n> ${wall.name}\n> Código: \`${wall.code}\` | ${wall.price} ${Moeda(message)}`).join("\n")

                    embeds.push({
                        color: Colors(message.member),
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

            if (embeds.length > 1) {
                for (const emoji of ['◀️', '▶️']) {
                    msg.react(emoji).catch(() => { })
                }
            }

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => { return ['◀️', '▶️'].includes(reaction.emoji.name) && user.id === message.author.id },
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

            collector.on('end', () => {
                msg.reactions.removeAll().catch(() => { })
            })

        }

        if (args[1])
            return message.reply(`${e.Deny} | Não diga nada ou apenas o código. Este é um comando sensível, então por favor, colabore.`)

        if (['all', 'todos'].includes(args[0]?.toLowerCase())) return AllWallpapers()
        return args[0] ? WallPapersCode() : WallPapers()

    }
}
