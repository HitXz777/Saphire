const
    { e } = require('../../../JSON/emojis.json'),
    Colors = require('../../../modules/functions/plugins/colors')

module.exports = {
    name: 'slot',
    aliases: ['inventario', 'inve'],
    category: 'economy',
    emoji: '📦',
    usage: '<slot> [user]',
    description: 'Confira todo o seu inventário',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.users.first() || client.users.cache.find(data => data.username?.toLowerCase() === args.join(' ')?.toLowerCase() || data.tag?.toLowerCase() === args[0]?.toLowerCase() || data.discriminator === args[0] || data.id === args[0]) || message.author,
            data = await Database.User.findOne({ id: user.id }, 'Slot Perfil Color Walls')

        if (!data) return message.reply(`${e.Database} | DATABASE | Nenhum dado encontrado.`)

        let avatar = user?.displayAvatarURL({ dynamic: true }),
            color = await Colors(user.id),
            Cartas = data.Slot?.Cartas,
            Dogname = data.Slot?.Dogname,
            raspadinhas = data.Slot?.Raspadinhas > 0 ? `${e.raspadinha} ${data.Slot?.Raspadinhas} Raspadinhas` : '',
            title = data.Perfil.TitlePerm ? "\n🔰 Título" : '',
            cartas = Cartas ? `\n💌 Cartas: ${Cartas}` : '',
            dogname = Dogname ? `\n${e.Doguinho} ${Dogname}` : '',
            cores = data.Color?.Perm ? '\n🎨 Cores' : '',
            skip = data.Slot?.Skip > 0 ? `⏩ Quiz Skip: ${data.Slot?.Skip}` : '',
            nada2 = !cores && !title ? 'Não há nada aqui' : '',
            nada = !cartas && !skip && !dogname && !raspadinhas ? 'Não há nada aqui' : ''

        if (['bg', 'wallpaper', 'w', 'fundo', 'level'].includes(args[0]?.toLowerCase()))
            return SlotBackgrouds()

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(color)
                        .setTitle(`${e.SaphireHi} Slot Saphire Info`)
                        .setDescription(`Aqui está todas *(ou quase todas)* as informações do slot.`)
                        .addFields([
                            {
                                name: 'Itens',
                                value: `Você pode conferir todos os itens usando a aba \`itens\` na \`${prefix}loja\``
                            },
                            {
                                name: 'Comandos do Slot',
                                value: `\`${prefix}slot\` - Padrão\n\`${prefix}slot bg\` - Levels Wallpapers`
                            }
                        ])
                ]
            })
        }

        return NormalSlot()

        async function SlotBackgrouds() {

            let clientData = await Database.Client.findOne({ id: client.user.id }, 'BackgroundAcess'),
                BgArray = [],
                WallpaperDB = Database.BgLevel.get('LevelWallpapers'),
                control = 0,
                WhoAreTheUser = message.author.id === user.id ? 'Você' : user.username

            if (clientData.BackgroundAcess?.includes(user.id))
                return message.reply(`${e.Info} | ${WhoAreTheUser} possui todos os wallpapers. Tente usar \`${prefix}lvlwall all\``)

            let bgArrayFromDb = data?.Walls?.Bg || []

            if (!bgArrayFromDb || bgArrayFromDb.length === 0)
                return message.reply(`${e.Deny} | Não há nenhum wallpaper por aqui.`)

            let backgroundsSorted = bgArrayFromDb.sort((a, b) => a.slice(2) - b.slice(2))

            for (const wall of backgroundsSorted)
                BgArray.push({ code: wall, name: WallpaperDB[wall]?.Name || 'Indefinido', image: WallpaperDB[wall].Image })

            function EmbedGenerator() {
                let amount = 10,
                    Page = 1,
                    embeds = [],
                    length = BgArray.length / 10 < 1 ? 1 : parseInt(BgArray.length / 10) + 1,
                    title = message.author.id === user.id ? '🖼️ Seus Level\'s Backgrounds' : `🖼️ ${user.username} Level's Backgrounds`

                for (let i = 0; i < BgArray.length; i += 10) {

                    const current = BgArray.slice(i, amount),
                        description = current.map(wall => `> \`${wall.code}\`: [${wall.name}](${wall.image})`).join("\n")

                    embeds.push({
                        color: color,
                        title: `${title} | ${Page}/${length}`,
                        description: `${description}`,
                        footer: {
                            text: `${BgArray?.length || 0} Wallpapers | ${prefix}lvl set <BgCode>`
                        }
                    })

                    Page++
                    amount += 10

                }

                return embeds;
            }

            const embeds = EmbedGenerator(),
                msg = await message.reply({ embeds: [embeds[control]] }),
                emojis = ['◀️', '▶️', '❌']

            if (embeds.length <= 1) return

            for (const i of emojis)
                msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                idle: 30000
            })

            collector.on('collect', (reaction, user) => {

                if (reaction.emoji.name === '❌') return collector.stop()

                reaction.emoji.name === '◀️'
                    ? (() => {
                        control--
                        embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control++
                    })()
                    : (() => {
                        control++
                        embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control--
                    })()

            });

            collector.on('end', () => msg.reactions.removeAll().catch(() => { }))

        }

        function NormalSlot() {

            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(color)
                        .setAuthor({ name: `Inventário de ${user.username}`, iconURL: avatar })
                        .setDescription(`Aqui é onde ficam guardados todos os ${user.id === message.author.id ? 'seus itens' : `itens de ${user.username}`}`)
                        .addField('Itens Comprados', `${nada}${skip}${raspadinhas}${cartas}${dogname}`)
                        .addField('Itens Obtidos', `${nada2}${cores}${title}`)
                        .setFooter({ text: `${prefix}buy | ${prefix}slot bg` })
                ]
            })
        }
    }
}


