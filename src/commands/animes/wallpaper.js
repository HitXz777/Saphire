const { DatabaseObj: { config, e } } = require('../../../modules/functions/plugins/database'),
    Error = require('../../../modules/functions/config/errors'),
    IsUrl = require('../../../modules/functions/plugins/isurl'),
    Colors = require('../../../modules/functions/plugins/colors'),
    Ark = require('ark.db'),
    BgWall = new Ark.Database('../../../JSON/wallpaperanime.json')

module.exports = {
    name: 'wallpaper',
    aliases: ['wpp', 'pdp', 'wall', 'w'],
    category: 'animes',
    ClientPermissions: ['ADD_REACTIONS', 'EMBED_LINKS'],
    emoji: '🖥️',
    usage: '<wallpaper>',
    description: `Wallpaper de Animes`,

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let animes = Object.keys(BgWall.get('Wallpapers') || {}).sort().map(anime => `${prefix}w ${anime}`),
            amount = 0,
            N = Database.Names

        async function SendEmbed() {

            amount = Object.values(BgWall.get('Wallpapers') || {}).flat().length

            if (!animes || animes.length === 0) return message.reply(`${e.Deny} | Não há nenhum anime na minha database.`)

            let emojis = ['⬅️', '➡️', '❌'],
                embeds = EmbedGenerator() || [],
                control = 0

            if (!embeds || embeds.length < 1) return message.channel.send(`${e.Info} | Nenhum anime foi encontrado no banco de dados.`)

            let msg = await message.channel.send({ embeds: [embeds[control]] }).catch(() => { })

            for (const emoji of emojis) msg.react(emoji).catch(() => { })

            let collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                max: 5,
                idle: 30000,
                errors: ['max', 'idle']
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

                })

                .on('end', () => msg.reactions.removeAll().catch(() => { }))


            function EmbedGenerator() {

                let amountControl = 30,
                    Page = 1,
                    embeds = [],
                    length = animes.length / 30 <= 1 ? 1 : parseInt((animes.length / 30) + 1)

                for (let i = 0; i < animes.length; i += 30) {

                    let current = animes.slice(i, amountControl),
                        animesMapped = current.join('\n'),
                        PageCount = `${length > 1 ? `${Page}/${length}` : ''}`

                    if (current.length > 0) {

                        embeds.push({
                            color: '#246FE0',
                            title: `🖥️ ${client.user.username} Wallpapers - ${PageCount}`,
                            description: `Você pode trocar as abas para ver mais animes clicando nos emojis ali em baixo.`,
                            fields: [
                                {
                                    name: `${e.Warn} | Atenção!`,
                                    value: `\`\`\`txt\n1. Alguns wallpapers contém spoilers, tome cuidado!\n2. Não use espaços no nome do anime\`\`\``
                                },
                                {
                                    name: `${e.Download} | Quer algum anime na lista?`,
                                    value: `\`\`\`Peça diretamente ao ${client.users.cache.get(Database.Names.Gowther)?.tag || '"Nome não encontrado"'}\`\`\``
                                },
                                {
                                    name: `${e.Check} | Animes Disponíveis`,
                                    value: `\`\`\`txt\n${Page === 1 ? `${prefix}w random\n` : ''}${animesMapped}\`\`\``
                                }
                            ],
                            footer: {
                                text: `Package: ${animes.length} Animes e ${amount} Wallpapers | ${prefix}wallpaper credits | ${prefix}servers`
                            }
                        })

                        Page++
                        amountControl += 30

                    }

                }

                return embeds;
            }

        }

        async function WallPapers(Category) {

            if (!Category || Category.length === 0)
                return message.reply(`${e.Info} | Este anime ainda não possui wallpapers.`)

            let wallpaper = Category[Math.floor(Math.random() * Category.length)],
                WallPaperEmbed = new MessageEmbed()
                    .setColor('#246FE0')
                    .setDescription(`${e.Download} | [Baixar](${wallpaper}) wallpaper em qualidade original`)
                    .setImage(wallpaper)

            const msg = await message.reply({ embeds: [WallPaperEmbed] }),
                emojis = ['🔄', '❌']

            for (const emoji of emojis) msg.react(emoji).catch(() => { })

            let TradeWallpaper = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                idle: 30000
            })

                .on('collect', (reaction) => {

                    if (reaction.emoji.name === emojis[1]) return TradeWallpaper.stop()

                    if (reaction.emoji.name === emojis[0]) {

                        reaction.users.remove(message.author.id).catch(() => { })
                        let WallTrade = Category[Math.floor(Math.random() * Category.length)]

                        WallPaperEmbed.setImage(WallTrade)
                            .setDescription(`${e.Download} | [Baixar](${WallTrade}) wallpaper em qualidade original`)

                        return msg.edit({ embeds: [WallPaperEmbed] }).catch(() => { })
                    }
                    return
                })

                .on('end', () => {
                    msg.reactions.removeAll().catch(() => { });

                    WallPaperEmbed.setColor('RED')
                        .setFooter({ text: `Sessão expirada | Wallpapers por: ${client.users.cache.get(N.Gowther)?.tag || 'Indefnido'}` })
                    return msg.edit({ embeds: [WallPaperEmbed] }).catch(() => { })
                })
        }

        if (!args[0]) return SendEmbed()

        if (['add', 'adicionar'].includes(args[0]?.toLowerCase())) return NewWallpaperDatabase()
        if (['new', 'novo'].includes(args[0]?.toLowerCase())) return NewAnimeDatabase()
        if (['delete', 'del'].includes(args[0]?.toLowerCase())) return DelAnimeDatabase()
        if (['random', 'aleatório', 'aleatório'].includes(args[0]?.toLowerCase())) return randomize()

        if (['créditos', 'credits', 'creditos'].includes(args[0]?.toLowerCase()))
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setDescription(`${e.Info} | Abaixo, estão os créditos de todas as pessoas e o que elas fizeram na construção do comando \`${prefix}wallpaper\``)
                        .addField('🤝 Créditos', `\`${client.users.cache.get(N.Rody)?.tag || 'Indefnido'}\` - Idealizador, implementação dos Wallpapers ao banco de dados e código fonte da ${client.user.username}\n \n\`${client.users.cache.get(N.Gowther)?.tag || 'Indefnido'}\` - Fornecedor de 100% dos Wallpapers, Organização de Links, dados e review técnico\n \n\`${client.users.cache.get(N.Makol)?.tag || 'Indefnido'}\` - Review adição de Links e sequência de ordem`)
                ]
            })

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) {

            let color = await Colors(message.author.id)

            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor(color)
                        .setTitle(`:tv: Comandos Wallpapers`)
                        .setDescription(`Aqui estão todos os comandos deste comando`)
                        .addFields(
                            {
                                name: `${e.HiNagatoro} Padrões`,
                                value: `\`${prefix}w\` Lista de todos os wallpapers\n\`${prefix}w <NomeDoAnime>\` Wallpapers do anime selecionado\n\`${prefix}w credits\` Créditos do comando\n\`${prefix}w info\` Este painelzinho`
                            },
                            {
                                name: `${e.Gear} Administrativo`,
                                value: `\`${prefix}w [add] <NomeDoAnime> <LinkDoWallpaper>\` Adiciona um novo wallpaper ao anime selecionado.\n\`${prefix}w [new] <NomeDoNovoAnimeNaListaDeAnimes>\` Adiciona um novo anime a lista\n\`${prefix}w [del] [NomeDoAnime]\` Deleta o anime da lista oficial`
                            }
                        )
                ]
            })
        }

        if (args[1]) return message.reply(`${e.Deny} | Mencione o anime exatamente como está escrito no comando \`${prefix}wallpaper\``)

        return Check()

        function randomize() {

            let animesRandomize = Object.values(BgWall.get('Wallpapers') || {}).flat()

            if (!animesRandomize || animesRandomize.length === 0)
                return message.reply(`${e.Deny} | Nenhum wallpaper foi encontrado.`)

            return WallPapers(animesRandomize)
        }

        function Check() {

            let Animes = Object.keys(BgWall.get('Wallpapers') || {})

            let Key = Animes.find(data => data.toLowerCase() === args[0].toLowerCase())

            return Key
                ? WallPapers(BgWall.get(`Wallpapers.${Key}`))
                : message.reply(`${e.Deny} | Este anime não existe no meu banco de dados... Verifique os nomes usando somente \`${prefix}w\``)

        }

        function NewWallpaperDatabase() {

            if (message.author.id !== config.ownerId) {
                if (message.author.id !== config.contentManagerId)
                    return message.reply(`${e.Deny} | Este comando é privado aos administradores do Sistema de Wallpapers.`)
            }

            let { keys, anime, link } = {
                anime: args[1],
                link: args[2],
                keys: ''
            }

            if (!anime)
                return message.reply(`${e.Info} | Para adicionar um novo anime na database. Forneça o nome *(O nome deve ser único)* do anime e o link *(O link deve ser o link da imagem depois de postada no canal no servidor package)* da imagem\nComando exemplo: \`${prefix}w add Naruto LinkDoWallpaperNaruto\``)

            if (args[3])
                return message.reply(`${e.Deny} | Forneça apenas o nome do anime e link.`)

            if (!link || !IsUrl(link) || !link.includes('https://cdn.discordapp.com/attachments/'))
                return message.reply(`${e.Deny} | Forneça um link válido!`)

            try {
                keys = Object.keys(BgWall.get('Wallpapers') || {})

                for (const anime of keys) {
                    let values = Object.values(BgWall.get(`Wallpapers.${anime}`))
                    if (values.includes(link))
                        return message.reply(`${e.Deny} | Eu detectei este wallpaper no anime **${anime}**.`)
                }

            } catch (err) { return Error(message, err) }

            if (!keys.includes(anime))
                return message.reply(`${e.Deny} | O anime **${anime}** não existe na minha database. Para adicionar um novo anime, use o comando \`${prefix}w new NomeDoAnime\``)

            try {
                BgWall.push(`Wallpapers.${anime}`, link)
                return message.reply(`${e.Check} | Wallpaper adicionado com sucesso!`)
            } catch (err) { return Error(message, err) }

        }

        function NewAnimeDatabase() {

            if (message.author.id !== config.ownerId) {
                if (message.author.id !== config.contentManagerId)
                    return message.reply(`${e.Deny} | Este comando é privado aos administradores do Sistema de Wallpapers.`)
            }

            let anime = args[1]

            if (!anime)
                return message.reply(`${e.Info} | Forneça um nome único para a criação da nova categoria.`)

            if (args[2])
                return message.reply(`${e.Deny} | O nome do anime deve ser único.`)

            try {

                if (Object.keys(BgWall.get('Wallpapers')).includes(anime))
                    return message.reply(`${e.Deny} | Este anime já existe na minha database.`)

            } catch (err) { return Error(message, err) }


            BgWall.set(`Wallpapers.${anime}`, [])
            return message.reply(`${e.Check} | Uma nova categoria foi criada na minha database com o nome **${anime}**.`)
        }

        function DelAnimeDatabase() {

            if (message.author.id !== config.ownerId) {
                return message.reply(`${e.Deny} | Este comando é privado ao meu criador.`)
            }

            let keys, anime

            anime = args[1]

            if (!anime)
                return message.reply(`${e.Info} | Forneça um nome único para a exclusão categoria.`)

            if (args[2])
                return message.reply(`${e.Deny} | O nome do anime deve ser único.`)

            try {

                keys = Object.keys(BgWall.get('Wallpapers'))
                if (!keys.includes(anime))
                    return message.reply(`${e.Deny} | Este anime não existe na minha database.`)

            } catch (err) { return Error(message, err) }

            return message.reply(`${e.Info} | Confirmar a exclusão do anime **${anime}** da minha database?`).then(msg => {
                msg.react('✅').catch(() => { }) // Check
                msg.react('❌').catch(() => { }) // X

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter, max: 1, idle: 15000 }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {

                        BgWall.delete(`Wallpapers.${anime}`)
                        return msg.edit(`${e.Check} | O anime **${anime}** foi deletado da minha database com o sucesso!`)
                    } else {
                        msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    }
                }).catch(() => {
                    msg.edit(`${e.Deny} | Comando cancelado por tempo expirado.`).catch(() => { })
                })

            }).catch(err => {
                Error(message, err)
                message.channel.send(`${e.SaphireCry} | Ocorreu um erro durante o processo. Por favor, reporte o ocorrido usando \`${prefix}bug\`\n\`${err}\``)
            })
        }

    }
}