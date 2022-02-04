const { f } = require('../../../database/frases.json')
const { BgWall, DatabaseObj } = require('../../../Routes/functions/database')
const { stripIndent } = require('common-tags')
const { config, e, N, Wallpapers } = DatabaseObj
const Error = require('../../../Routes/functions/errors')
const IsUrl = require('../../../Routes/functions/isurl')
const Colors = require('../../../Routes/functions/colors')

module.exports = {
    name: 'wallpaper',
    aliases: ['wpp', 'pdp', 'wall', 'w'],
    category: 'animes',
    ClientPermissions: ['ADD_REACTIONS', 'EMBED_LINKS'],
    emoji: '🖥️',
    usage: '<wallpaper>',
    description: `Wallpaper de Animes | Imagens por: ${N.Gowther}`,

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

        let animes, amount = 0

        try {
            animes = Object.keys(Wallpapers).sort().map(anime => `${prefix}w ${anime}`)
        } catch (err) { return Error(message, err) }

        const WallPapersIndents = stripIndent`${animes.slice(0, 30).join('\n') || 'Em breve'}`,
            WallPapersIndents2 = stripIndent`${animes.slice(30, 60).join('\n') || 'Em breve'}`,
            WallPapersIndents3 = stripIndent`${animes.slice(60, 90).join('\n') || 'Em breve'}`,
            WallPapersIndents4 = stripIndent`${animes.slice(90, 120).join('\n') || 'Em breve'}`

        function SendEmbed() {

            return message.channel.send({ embeds: [new MessageEmbed().setDescription(`${e.Loading} Carregando...`)] }).then(msg => {

                try {
                    for (const anime of Object.keys(BgWall.get('Wallpapers'))) {
                        amount += Object.values(BgWall.get(`Wallpapers.${anime}`)).length
                    }
                } catch (err) {
                    Error(message, err)
                    message.reply(`${e.Warn} | Ocorreu um erro ao contabilizar a quantidade de animes presente na minha database.\n\`${err}\``)
                }

                let AnimeList1 = WallPapersIndents,
                    AnimeList2 = WallPapersIndents2
                msg.react('🔄').catch(() => { })
                msg.react('❌').catch(() => { })
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)

                TradingEmbed(WallPapersIndents, WallPapersIndents2)

                const filter = (reaction, user) => { return reaction.emoji.name === '🔄' && user.id === message.author.id; },
                    collector = msg.createReactionCollector({ filter: filter, max: 5, idle: 30000, errors: ['max', 'idle'] }),
                    filtercancel = (reaction, user) => { return reaction.emoji.name === '❌' && user.id === message.author.id; },
                    collectorcancel = msg.createReactionCollector({ filter: filtercancel, max: 1, idle: 30000, errors: ['max', 'idle'] })

                collector.on('collect', () => {
                    TradingEmbed(AnimeList1 === WallPapersIndents ? AnimeList1 = WallPapersIndents3 : AnimeList1 = WallPapersIndents, AnimeList2 === WallPapersIndents2 ? AnimeList2 = WallPapersIndents4 : AnimeList2 = WallPapersIndents2)
                });

                collector.on('end', () => {
                    sdb.delete(`Request.${message.author.id}`)
                    msg.reactions.removeAll().catch(() => { })
                });

                collectorcancel.on('collect', () => {
                    collector.stop()
                    collectorcancel.stop()
                })

                function TradingEmbed(AnimesList, AnimesList2) {
                    return msg.edit({
                        embeds: [
                            new MessageEmbed()
                                .setColor('#246FE0')
                                .setTitle(`🖥️ ${client.user.username} Wallpapers`)
                                .setDescription(`Este comando foi reformado e pode haver um bug ali ou aqui. Caso ache um, use o comando \`${prefix}bug\` e reporte-o, ok? Você pode trocar as abas para ver mais animes clicando no emoji 🔄 ali em baixo.`)
                                .addField(`${e.Warn} | Atenção!`, `\`\`\`txt\n1. Alguns wallpapers contém spoilers, tome cuidado!\n2. Não use espaços no nome do anime\`\`\``)
                                .addField(`${e.Download} | Quer algum anime na lista?`, `\`\`\`Nos diga no formulário: ${prefix}sugest\`\`\``)
                                .addField(`${e.Check} | Animes Disponíveis`, `\`\`\`txt\n${AnimesList}\`\`\``, true)
                                .addField('⠀', `\`\`\`txt\n${AnimesList2}\`\`\``, true)
                                .setFooter(`Package: ${animes.length} Animes e ${amount} Wallpapers | ${prefix}wallpaper credits | ${prefix}servers`)
                        ]
                    }).catch(err => {
                        collector.stop()
                        return message.reply(`${e.Warn} | Houve um erro na troca das embeds.\n\`${err}\``)
                    })
                }
            })
        }

        function WallPapers(Category) {

            if (!Category || Category.length <= 0)
                return message.reply(`${e.Info} | Este anime ainda não possui wallpapers.`)

            let wallpaper = Category[Math.floor(Math.random() * Category.length)]
            const WallPaperEmbed = new MessageEmbed()
                .setColor('#246FE0')
                .setDescription(`${e.Download} | [Baixar](${wallpaper}) wallpaper em qualidade original`)
                .setImage(wallpaper)

            return message.reply({ embeds: [WallPaperEmbed] }).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('🔄').catch(() => { }) // 1º Embed
                msg.react('❌').catch(() => { })

                let TradeFilter = (reaction, user) => { return reaction.emoji.name === '🔄' && user.id === message.author.id }; let TradeWallpaper = msg.createReactionCollector({ filter: TradeFilter, idle: 30000 })

                TradeWallpaper.on('collect', (reaction, user) => {

                    reaction.users.remove(message.author.id).catch(() => { TradeWallpaper.stop() })
                    let WallTrade = Category[Math.floor(Math.random() * Category.length)]
                    WallPaperEmbed.setDescription(`${e.Download} | [Baixar](${WallTrade}) wallpaper em qualidade original`).setImage(WallTrade)
                    msg.edit({ embeds: [WallPaperEmbed] }).catch(() => { })

                })
                TradeWallpaper.on('end', (reaction, user) => { sdb.delete(`Request.${message.author.id}`); msg.reactions.removeAll().catch(() => { }); WallPaperEmbed.setColor('RED').setFooter(`Sessão expirada | Wallpapers por: ${N.Gowther}`); msg.edit({ embeds: [WallPaperEmbed] }).catch(() => { }) })

                let CancelFilter = (reaction, user) => { return reaction.emoji.name === '❌' && user.id === message.author.id }; let CancelSession = msg.createReactionCollector({ filter: CancelFilter, max: 1, idle: 30000 })
                CancelSession.on('collect', (reaction, user) => { msg.reactions.removeAll().catch(() => { }); WallPaperEmbed.setColor('RED').setFooter(`Sessão expirada | Wallpapers por: ${N.Gowther}`); msg.edit({ embeds: [WallPaperEmbed] }).catch(() => { }) })
                CancelSession.on('end', (reaction, user) => { sdb.delete(`Request.${message.author.id}`); msg.reactions.removeAll().catch(() => { }); WallPaperEmbed.setColor('RED').setFooter(`Sessão expirada | Wallpapers por: ${N.Gowther}`); msg.edit({ embeds: [WallPaperEmbed] }).catch(() => { }) })

            }).catch(err => {
                Error(message, err)
                sdb.delete(`Request.${message.author.id}`)
                return message.reply(`${e.Warn} | Houve um erro ao executar este comando\n\`${err}\``)
            })
        }

        if (!args[0]) return SendEmbed()

        if (['add', 'adicionar'].includes(args[0]?.toLowerCase()))
            return NewWallpaperDatabase()

        if (['new', 'novo'].includes(args[0]?.toLowerCase()))
            return NewAnimeDatabase()

        if (['delete', 'del'].includes(args[0]?.toLowerCase()))
            return DelAnimeDatabase()

        if (['créditos', 'credits', 'creditos'].includes(args[0]?.toLowerCase())) {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setDescription(`${e.Info} | Abaixo, estão os créditos de todas as pessoas e o que elas fizeram na construção do comando \`${prefix}wallpaper\``)
                        .addField('🤝 Créditos', `\`${N.Rody}\` - Idealizador, implementação dos Wallpapers ao banco de dados e código fonte da ${client.user.username}\n \n\`${N.Gowther}\` - Fornecedor de 100% dos Wallpapers, Organização de Links, dados e review técnico\n \n\`${N.Makol}\` - Review adição de Links e sequência de ordem`)
                ]
            })
        }

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) {
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor(Colors(message.member))
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

        function Check() {

            try {

                let Animes = Object.keys(BgWall.get('Wallpapers'))

                for (const Key of Animes) {

                    if (Key?.toLowerCase() === args[0]?.toLowerCase())
                        return WallPapers(BgWall.get(`Wallpapers.${Key}`))

                }

                return message.reply(`${e.Deny} | Este anime não existe no meu banco de dados... Verefique os nomes usando somente \`${prefix}w\``)

            } catch (err) { return Error(message, err) }

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
                keys = Object.keys(Wallpapers)

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