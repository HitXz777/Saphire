const { e } = require('../../../JSON/emojis.json'),
    Moeda = require('../../../modules/functions/public/moeda'),
    Colors = require('../../../modules/functions/plugins/colors'),
    { MessageActionRow, MessageSelectMenu } = require('discord.js')

module.exports = {
    name: 'rank',
    aliases: ['podio', 'ranking', 'top'],
    category: 'level',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: '🏆',
    usage: '<rank>',
    description: 'Confira os Top 10 Globais',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let msg = await message.reply(`${e.Loading} | Obtendo informações e construindo...`),
            user = client.getUser(client, message, args, 'user'),
            embed = new MessageEmbed(),
            moeda = await Moeda(message),
            timingToRefresh = Database.Cache.get('GlobalRefreshTime'),
            timing = client.GetTimeout(1800000, timingToRefresh)

        if (!args[0] || ['help', 'info', 'ajuda'].includes(args[0]?.toLowerCase())) {

            const rankingSelectMenu = new MessageActionRow()
                .addComponents(new MessageSelectMenu()
                    .setCustomId('menu')
                    .setPlaceholder('Escolha um ranking')
                    .addOptions([
                        {
                            label: 'Painel inicial',
                            emojis: e.yay,
                            value: 'principal'
                        },
                        {
                            label: 'Tops Globais',
                            emoji: e.CoroaDourada,
                            value: 'topGlobais'
                        },
                        {
                            label: 'Level',
                            emoji: e.RedStar || '💙',
                            value: 'level'
                        },
                        {
                            label: 'Dinheiro',
                            emoji: e.Coin,
                            value: 'money'
                        },
                        {
                            label: 'Likes',
                            emoji: e.Like,
                            value: 'like'
                        },
                        {
                            label: 'Dinheiro invertido',
                            emoji: e.Coin,
                            value: 'invert'
                        },
                        {
                            label: 'Mix',
                            emoji: '🔄',
                            value: 'mix'
                        },
                        {
                            label: 'Flag Gaming',
                            emoji: '🎌',
                            value: 'flag'
                        },
                        {
                            label: 'Jokenpô',
                            emoji: '✂️',
                            value: 'jokempo'
                        },
                        {
                            label: 'Jogo da Velha',
                            emoji: '⭕',
                            value: 'tictactoe'
                        },
                        {
                            label: 'Jogo da Memória',
                            emoji: e.duvida || '❔',
                            value: 'memory'
                        },
                        {
                            label: 'Forca',
                            emoji: '😵',
                            value: 'forca'
                        },
                        {
                            label: 'Quiz',
                            emoji: e.QuestionMark || '❔',
                            value: 'quiz'
                        },
                        {
                            label: 'Clans',
                            emoji: '🛡️',
                            value: 'clan'
                        },
                        {
                            label: 'Fechar',
                            emoji: e.Deny,
                            value: 'close'
                        },
                    ])
                )

            msg.edit({
                embeds: [
                    new MessageEmbed()
                        .setColor('#246FE0')
                        .setTitle(`🏆 | ${client.user.username} Global Ranking System`)
                        .setDescription('Aqui você pode ver os top 10 em cada classe')
                        .addField(`🌐 Ranking Global (Refresh in ${timing})`, `\`${prefix}rank global\` - \`${prefix}rank global refresh\``)
                        .addField(`${e.MoneyWings} Ranking Money (Refresh in ${timing})`, `\`${prefix}rank money [local/invertido]\`\n\`${prefix}rank invertido [Local]\``)
                        .addField(`${e.RedStar} Ranking Experiência (Refresh in ${timing})`, `\`${prefix}rank xp [local/invertido]\``)
                        .addField(`${e.Like} Ranking Reputação`, `\`${prefix}rank likes [local]\``)
                        .addField(`${e.duvida || '❔'} Ranking Global Memory Game`, `\`${prefix}rank memory [local]\``)
                        .addField('😵 Ranking Global Forca Game', `\`${prefix}rank forca [local]\``)
                        .addField('💬 Ranking Global Mix Game', `\`${prefix}rank mix [local]\``)
                        .addField('✂️ Ranking Global Jokempo Game', `\`${prefix}rank Jokempo [local/invertido]\``)
                        .addField('💡 Ranking Global Quiz Game', `\`${prefix}rank quiz [local]\``)
                        .addField('🎌 Ranking Flag Game', `\`${prefix}rank flag [local]\``)
                        .addField('⭕ Ranking Global Jogo da Velha', `\`${prefix}rank ttt [local]\`\n\`${prefix}rank ttt [invertido]\``)
                        .addField('🛡️ Ranking Clans', `\`${prefix}rank clan\``)
                        .addField('🔍 In Locale Search', `\`${prefix}rank <classe> [posição/@user/id]\` ou \`${prefix}rank <classe> [me]\``)
                        .setFooter({ text: '[] - Argumento opcional' })
                ],
                components: [rankingSelectMenu]
            }).catch(() => { }),
                coletor = msg.createMessageComponentCollector({
                    filter: (interaction) => interaction.customId === 'menu' && interaction.user.id === message.author.id,
                    idle: 60000
                })

            coletor.on('end', () => msg.edit({ components: [] }).catch(() => { }))

            coletor.on('collect', async (collected) => {

                let item = collected.values[0]
                collected.deferUpdate().catch(() => { })

                msg.edit({ content: `${e.Loading} | Obtendo dados e construindo...`, embeds: [] }).catch(() => { })

                switch (item) {
                    case 'principal': PrincipalEmbedHome(); break
                    case 'topGlobais': TopGlobalRanking(timing); break
                    case 'level': RankLevel(timing); break;
                    case 'money': RankMoney(timing); break;
                    case 'like': RankLikes(); break;
                    case 'invert': RankInvert(); break;
                    case 'mix': mixGlobalRanking(); break;
                    case 'jokempo': jokempoGlobalRanking(); break;
                    case 'tictactoe': ticTacToeGlobalRanking(); break;
                    case 'memory': memoryGlobalRanking(); break;
                    case 'quiz': quizGlobalRanking(); break;
                    case 'forca': forcaGlobalRanking(); break;
                    case 'flag': flagGamingRanking(); break;
                    case 'clan': ClanRanking(); break;
                    case 'close': msg.edit({ content: `${e.Deny} | Comando cancelado`, embeds: [], components: [] }); break;
                    default: msg.edit({ content: `${e.Warn} | Estranho... Isso não deveria ter acontecido...`, embeds: [] }).catch(() => { }); break;
                }

                return
            })

            return
        }

        if (['xp', 'level', 'nivel'].includes(args[0]?.toLowerCase())) return RankLevel(timing)
        if (['dinheiro', 'money', 'cash', 'sp', 'coin', 'moeda', 'bank', 'coins'].includes(args[0]?.toLowerCase())) return RankMoney(timing)
        if (['like', 'curtidas', 'likes'].includes(args[0]?.toLowerCase())) return RankLikes()
        if (['dividas', 'invertido', 'dívidas', 'invert', 'invertido'].includes(args[0]?.toLowerCase())) return RankInvert()
        if (['mix', 'palavramisturada'].includes(args[0]?.toLowerCase())) return mixGlobalRanking()
        if (['jokempo', 'jokenpo', 'jkp', 'ppt'].includes(args[0]?.toLowerCase())) return jokempoGlobalRanking()
        if (['jogodavelha', 'velha', 'ttt', 'tictactoe', 'tic', 'tac', 'toe'].includes(args[0]?.toLowerCase())) return ticTacToeGlobalRanking()
        if (['memory', 'jogodamemoria', 'jogodememoria', 'mg', 'gm', 'memorygame', 'gamememory'].includes(args[0]?.toLowerCase())) return memoryGlobalRanking()
        if (['forca', 'hangman'].includes(args[0]?.toLowerCase())) return forcaGlobalRanking()
        if (['quiz'].includes(args[0]?.toLowerCase())) return quizGlobalRanking()
        if (['clan', 'clans'].includes(args[0]?.toLowerCase())) return ClanRanking()
        if (['top', 'global', 'g'].includes(args[0]?.toLowerCase())) return TopGlobalRanking(timing)
        if (['flag', 'brandeiras', 'bandeira', 'falg'].includes(args[0]?.toLowerCase())) return flagGamingRanking()

        return msg.edit(`${e.Deny} | ${message.author}, este ranking não existe ou você escreveu errado. Use \`${prefix}rank\` e veja os rankings disponiveis.`).catch(() => { })

        function PrincipalEmbedHome() {
            return msg.edit({
                content: `${e.Info} | Painel inicial.`,
                embeds: [
                    new MessageEmbed()
                        .setColor('#246FE0')
                        .setTitle(`🏆 | ${client.user.username} Global Ranking System`)
                        .setDescription('Aqui você pode ver os top 10 em cada classe')
                        .addField('🌐 Ranking Global', `\`${prefix}rank global\` - \`${prefix}rank global refresh\``)
                        .addField(`${e.MoneyWings} Ranking Money`, `\`${prefix}rank money [local/invertido]\`\n\`${prefix}rank invertido [Local]\``)
                        .addField(`${e.RedStar} Ranking Experiência`, `\`${prefix}rank xp [local/invertido]\``)
                        .addField(`${e.Like} Ranking Reputação`, `\`${prefix}rank likes [local]\``)
                        .addField(`${e.duvida || '❔'} Ranking Global Memory Game`, `\`${prefix}rank memory [local]\``)
                        .addField('😵 Ranking Global Forca Game', `\`${prefix}rank forca [local]\``)
                        .addField('💬 Ranking Global Mix Game', `\`${prefix}rank mix [local]\``)
                        .addField('✂️ Ranking Global Jokempo Game', `\`${prefix}rank Jokempo [local/invertido]\``)
                        .addField('💡 Ranking Global Quiz Game', `\`${prefix}rank quiz [local]\``)
                        .addField('🎌 Ranking Flag Game', `\`em breve\``)
                        .addField('⭕ Ranking Global Jogo da Velha', `\`${prefix}rank ttt [local]\`\n\`${prefix}rank ttt [invertido]\``)
                        .addField('🛡️ Ranking Clans', `\`${prefix}rank clan\``)
                        .addField('🔍 In Locale Search', `\`${prefix}rank <classe> [posição/@user/id]\` ou \`${prefix}rank <classe> [me]\``)
                        .setFooter({ text: '[] - Argumento opcional' })
                ]
            }).catch(() => { })
        }

        async function TopGlobalRanking(timing) {

            if (['refresh', 'att', 'atualizar', 'reboot', 'restart'].includes(args[1]?.toLowerCase())) return refreshTopGlobalRanking()

            const clientData = await Database.Client.findOne({ id: client.user.id }, 'TopGlobal'),

                TopGlobalData = {
                    Level: clientData.TopGlobal?.Level,
                    Likes: clientData.TopGlobal?.Likes,
                    Money: clientData.TopGlobal?.Money,
                    Quiz: clientData.TopGlobal?.Quiz,
                    Mix: clientData.TopGlobal?.Mix,
                    Flag: clientData.TopGlobal?.Flag,
                    Jokempo: clientData.TopGlobal?.Jokempo,
                    TicTacToe: clientData.TopGlobal?.TicTacToe,
                    Memory: clientData.TopGlobal?.Memory,
                    Forca: clientData.TopGlobal?.Forca
                }

            return msg.edit(
                {
                    content: `${e.Check} | Ranking construido com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor(client.blue)
                            .setTitle(`${e.CoroaDourada} Top Globais`)
                            .setDescription(`⏲️ Os Top Globais se atualizarão daqui ${timing || 'Searching Timing'}`)
                            .addFields(
                                {
                                    name: `${e.RedStar} **Top Global Level**`,
                                    value: formatUser(TopGlobalData.Level)
                                },
                                {
                                    name: `${e.Like} **Top Global Likes**`,
                                    value: formatUser(TopGlobalData.Likes)
                                },
                                {
                                    name: `${e.MoneyWings} **Top Global Money**`,
                                    value: formatUser(TopGlobalData.Money)
                                },
                                {
                                    name: '🧠 **Top Global Quiz**',
                                    value: formatUser(TopGlobalData.Quiz)
                                },
                                {
                                    name: `🔡 **Top Global Mix**`,
                                    value: formatUser(TopGlobalData.Mix)
                                },
                                {
                                    name: '✂️ **Top Global Jokempo**',
                                    value: formatUser(TopGlobalData.Jokempo)
                                },
                                {
                                    name: '#️⃣ **Top Global TicTacToe**',
                                    value: formatUser(TopGlobalData.TicTacToe)
                                },
                                {
                                    name: '🎌 **Top Global Flag Gaming**',
                                    value: formatUser(TopGlobalData.Flag)
                                },
                                {
                                    name: `\n${e.duvida || '❔'} **Top Global Memory**`,
                                    value: formatUser(TopGlobalData.Memory)
                                },
                                {
                                    name: `\n😵 **Top Global Forca**`,
                                    value: formatUser(TopGlobalData.Forca)
                                }
                            )
                    ]
                }
            ).catch(() => { })

            function formatUser(userId) {
                let user = client.users.cache.get(`${userId}`)
                if (!user) return `${e.Loading} | Aguardando a próxima atualização global...`
                return `${user.tag?.replace(/`/g, '')} - \`${user.id}\``
            }

            async function refreshTopGlobalRanking() {

                let clientData = await Database.Client.findOne({ id: client.user.id }, 'Administradores'),
                    adms = clientData?.Administradores || []

                if (!adms.includes(message.author.id))
                    return msg.edit(`${e.Admin} | Este é um comando privado da classe Saphire's Team Administrators`).catch(() => { })

                let topGlobalAtualization = require('../../../modules/functions/update/TopGlobalRanking')

                await topGlobalAtualization()
                return msg.edit(`${e.Check} | O ranking global foi atualizado com sucesso!`).catch(() => { })
            }

        }

        async function flagGamingRanking() {

            let users = await Database.User.find({}, 'id GamingCount.FlagCount'),
                UsersData = []

            if (!users || users.length === 0)
                return msg.edit(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`).catch(() => { })

            for (const data of users) {

                if (!data?.GamingCount?.FlagCount) continue

                let FlagCount = data?.GamingCount?.FlagCount || 0

                if (FlagCount > 0)
                    UsersData.push({ id: data.id, count: FlagCount })
                else continue
            }

            if (UsersData.length === 0)
                return msg.edit(`${e.Info} | Tudo vázio por aqui.`).catch(() => { })

            let Sorted = UsersData.sort((a, b) => b.count - a.count),
                AuthorRank = Sorted.findIndex(author => author.id === message.author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n🎌 ${a.count} acertos\n`).join('\n')

            if (!UsersData.length) rank = 'Não há ninguém no ranking'

            if (['local', 'server'].includes(args[1]?.toLowerCase())) return InServerLocalRanking()

            return !isNaN(args[1]) || ['me', 'eu'].includes(args[1]?.toLowerCase()) || user
                ? VerifyLocationRanking()
                : msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor('YELLOW')
                            .setTitle(`👑 Ranking - Global Flag Gaming`)
                            .setDescription(`Esse ranking é gerado na base Flag Gaming Accepts.\n \n${rank}`)
                            .setFooter({ text: `Seu ranking: ${AuthorRank} | Rank Base: FlagGamingGlobalAccepts` })
                    ]
                }).catch(() => { })

            function InServerLocalRanking() {

                let Rank = Sorted.filter(user => message.guild.members.cache.has(user.id)),
                    RankMapped = Rank.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n🎌 ${a.count || 0} acertos\n`).join('\n'),
                    myrank = Rank.findIndex(author => author.id === message.author.id) + 1 || "N/A"

                return msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor('YELLOW')
                            .setTitle(`👑 Ranking Flag Gaming - ${message.guild.name}`)
                            .setDescription(`${RankMapped}`)
                            .setFooter({ text: `Seu ranking: ${myrank}` })
                    ]
                }).catch(() => { })

            }

            function VerifyLocationRanking() {

                let Num = parseInt(args[1])

                if (['me', 'eu'].includes(args[1]?.toLowerCase())) Num = AuthorRank

                if (user) Num = Sorted.findIndex(u => u.id === user.id) + 1 || "N/A"

                if (Num === 0 || !UsersData[Num - 1])
                    return msg.edit(`${e.Deny} | Ranking não encontrado.`).catch(() => { })

                let InLocaleRanking = UsersData.splice(Num - 1, 1)

                return msg.edit({ content: InLocaleRanking.map(a => `**${Medals(Num - 1)} ${GetUser(a.id)}** - *\`${a.id}\`*\n🎌 ${a.count || 0} acertos`).join('\n') }).catch(() => { })

            }

        }

        async function RankLevel(timing) {

            let users = Database.Cache.get('rankLevel') || []

            if (!users || !users.length) return msg.edit(`${e.Info} | Não há ninguém no ranking`).catch(() => { })

            let index = users.findIndex(author => author.id === message.author.id)

            if (index === -1) users = await Database.User.find({}, 'id Xp Level')

            let RankingSorted = index > 0 ? users : users.filter(d => d.Level > 0).sort((a, b) => b.Level - a.Level)
            index = RankingSorted.findIndex(author => author.id === message.author.id)
            let data = RankingSorted.map((u, i) => { return { i: i, id: u.id, xp: u.Xp, XpNeeded: parseInt(u.Level * 275)?.toFixed(0), level: u.Level } })

            if (!data.length) return msg.edit(`${e.Info} | Não há ninguém no ranking`).catch(() => { })

            let RankMapped = data.slice(0, 10).map(user => `**${Medals(user.i)} ${GetUser(user.id)}** - \`${user.id}\`\n${e.RedStar} ${user.level} *(${user.xp}/${user.XpNeeded})*\n`).join('\n'),
                myrank = index === -1 ? 'N/A' : index + 1

            embed
                .setColor('YELLOW')
                .setTitle(`👑 Ranking - Global Experience`)
                .setDescription(`Próxima atualização em: ${timing}\n \n${RankMapped}`)
                .setFooter({ text: `Seu ranking: ${myrank} | Rank Base: XP` })

            if (['local', 'server'].includes(args[1]?.toLowerCase())) return InServerLocalRanking()

            return !isNaN(args[1]) || ['me', 'eu'].includes(args[1]?.toLowerCase()) || user
                ? VerifyLocationRanking()
                : msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [embed]
                }).catch(() => { })

            function InServerLocalRanking() {

                let Rank = data.filter(user => message.guild.members.cache.has(user.id)),
                    RankMapped = Rank.slice(0, 10).map((user, i) => `**${Medals(i)} ${GetUser(user.id)}** - \`${user.id}\`\n${e.RedStar} ${user.level || 0} *(${user.xp}/${user.XpNeeded})*\n`).join('\n'),
                    myrank = Rank.findIndex(author => author.id === message.author.id) + 1 || "N/A"

                embed
                    .setColor('YELLOW')
                    .setTitle('👑 Ranking Level Locale')
                    .setDescription(`${RankMapped}`)
                    .setFooter({ text: `Seu ranking: ${myrank} | O ranking se atualiza de 30 em 30 minutos` })

                return msg.edit({
                    content: `${e.Check} | Ranking local carregado com sucesso!`,
                    embeds: [embed]
                }).catch(() => { })
            }

            async function VerifyLocationRanking() {

                let Num = parseInt(args[1] || 0) - 1

                if (['me', 'eu'].includes(args[1]?.toLowerCase())) Num = myrank

                if (user) Num = data.findIndex(u => u.id === user.id)

                if (!data[Num]) {
                    users = await Database.User.find({}, 'id Level Xp')
                    data = users.filter(d => d.Level > 0).sort((a, b) => b.Level - a.Level)
                    if (user) Num = data.findIndex(u => u.id === user.id)
                    if (['me', 'eu'].includes(args[1]?.toLowerCase())) Num = data.findIndex(u => u.id === message.author.id)
                }

                if (!data[Num])
                    return msg.edit({ content: `${e.Deny} | Ranking não encontrado.` }).catch(() => { })

                let InLocaleRanking = data.splice(Num, 1)

                return msg.edit({ content: InLocaleRanking.map(user => `**${Medals(Num)} ${GetUser(user.id)}** - \`${user.id}\`\n${e.RedStar} ${user.level || user.Level || 0} *(${user.xp || user.Xp || 0}/${user.XpNeeded || parseInt(user.Xp * 275) || 0})*`).join('\n') }).catch(() => { })

            }

        }

        async function RankMoney(timing) {

            let users = Database.Cache.get('rankBalance') || []

            if (!users || !users.length) return msg.edit(`${e.Info} | Não há ninguém no ranking`).catch(() => { })

            let index = users.findIndex(author => author.id === message.author.id)

            if (index === -1) users = await Database.User.find({ Balance: { $gt: 0 } }, 'id Balance').sort('-Balance').limit(10)

            let RankingSorted = users
            index = RankingSorted.findIndex(author => author.id === message.author.id)
            let data = RankingSorted.map((u, i) => { return { i: i, id: u.id, Balance: u.Balance } })

            if (!data.length) return msg.edit(`${e.Info} | Não há ninguém no ranking`).catch(() => { })

            let AuthorRank = index === -1 ? 'N/A' : index + 1,
                rank = data.map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n${e.Bells} ${a.Balance} ${moeda}\n`).join('\n')

            if (!data.length) rank = 'Não há ninguém no ranking'

            if (['local', 'server'].includes(args[1]?.toLowerCase())) return InServerLocalRanking()

            return !isNaN(args[1]) || ['me', 'eu'].includes(args[1]?.toLowerCase()) || user
                ? VerifyLocationRanking()
                : msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor('YELLOW')
                            .setTitle(`👑 Ranking - Global Money`)
                            .setDescription(`Próxima atualização em ${timing}\n \n${rank}`)
                            .setFooter({ text: `Seu ranking: ${AuthorRank} | Rank Base: Saldo` })
                    ]
                }).catch(() => { })

            function InServerLocalRanking() {

                let Rank = data.filter(user => message.guild.members.cache.has(user.id)),
                    RankMapped = Rank.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n${e.Bells} ${a.Balance || 0} ${moeda}\n`).join('\n'),
                    myrank = Rank.findIndex(author => author.id === message.author.id) + 1 || "N/A"

                embed
                    .setColor('YELLOW')
                    .setTitle(`👑 Ranking - ${message.guild.name}`)
                    .setDescription(`${RankMapped}`)
                    .setFooter({ text: `Seu ranking: ${myrank} | Rank Base: Saldo` })

                return msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [embed]
                }).catch(() => { })

            }

            async function VerifyLocationRanking() {

                let Num = parseInt(args[1] || 0) - 1

                if (['me', 'eu'].includes(args[1]?.toLowerCase())) Num = AuthorRank

                if (user) Num = data.findIndex(u => u.id === user.id)

                if (!data[Num]) {
                    users = await Database.User.find({}, 'id Balance')
                    data = users.filter(d => d.Balance > 0).sort((a, b) => b.Balance - a.Balance)
                    if (user) Num = data.findIndex(u => u.id === user.id)
                    if (['me', 'eu'].includes(args[1]?.toLowerCase())) Num = data.findIndex(u => u.id === message.author.id)
                }

                if (!data[Num])
                    return msg.edit({ content: `${e.Deny} | Ranking não encontrado.` }).catch(() => { })

                let InLocaleRanking = data.splice(Num, 1)

                return msg.edit({ content: InLocaleRanking.map(a => `**${Medals(Num)} ${GetUser(a.id)}** - *\`${a.id}\`*\n${e.Bells} ${a.Balance || 0} ${moeda}`).join('\n') })

            }

        }

        async function RankLikes() {

            let users = await Database.User.find({}, 'id Likes'),
                UsersArray = []

            for (const data of users) {
                let Likes = data.Likes || 0

                if (Likes > 0)
                    UsersArray.push({ id: data.id, like: Likes })
            }

            if (!UsersArray.length) return msg.edit(`${e.Info} | Não há ninguém no ranking`).catch(() => { })

            let RankingSorted = UsersArray.sort((a, b) => b.like - a.like),
                Rank = RankingSorted.slice(0, 10),
                RankMapped = Rank.map((user, i) => `**${Medals(i)} ${GetUser(user.id)}** - \`${user.id}\`\n${e.Like} ${user.like}\n`).join('\n'),
                myrank = RankingSorted.findIndex(author => author.id === message.author.id) + 1 || "N/A"

            embed
                .setColor('YELLOW')
                .setTitle(`👑 Ranking - Global Likes`)
                .setDescription(`${RankMapped}`)
                .setFooter({ text: `Seu ranking: ${myrank} | Rank Base: Likes` })

            if (['local', 'server'].includes(args[1]?.toLowerCase())) return InServerLocalRanking()
            return !isNaN(args[1]) || ['me', 'eu'].includes(args[1]?.toLowerCase()) || user
                ? VerifyLocationRanking()
                : msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [embed]
                }).catch(() => { })

            function InServerLocalRanking() {

                let Rank = RankingSorted.filter(user => message.guild.members.cache.has(user.id)),
                    RankMapped = Rank.slice(0, 10).map((user, i) => `**${Medals(i)} ${GetUser(user.id)}** - \`${user.id}\`\n${e.Like} ${user.like || 0}\n`).join('\n'),
                    myrank = Rank.findIndex(author => author.id === message.author.id) + 1 || "N/A"

                embed
                    .setColor('YELLOW')
                    .setTitle(`👑 Ranking - ${message.guild.name}`)
                    .setDescription(`${RankMapped}`)
                    .setFooter({ text: `Seu ranking: ${myrank} | Rank Base: Likes` })

                return msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [embed]
                }).catch(() => { })

            }

            function VerifyLocationRanking() {

                let Num = parseInt(args[1])

                if (['me', 'eu'].includes(args[1]?.toLowerCase())) Num = myrank

                if (user) Num = RankingSorted.findIndex(u => u.id === user.id) + 1 || 0

                if (Num === 0 || !UsersArray[Num - 1])
                    return msg.edit({ content: `${e.Deny} | Ranking não encontrado.` }).catch(() => { })

                let InLocaleRanking = UsersArray.splice(Num - 1, 1)

                return msg.edit({ content: InLocaleRanking.map(user => `**${Medals(Num - 1)} ${GetUser(user.id)}** - \`${user.id}\`\n${e.Like} ${user.like || 0}\n`).join('\n') }).catch(() => { })

            }

        }

        async function RankInvert() {

            let USERS = await Database.User.find({}, 'id Balance'),
                UsersMoney = []

            if (USERS.length === 0)
                return msg.edit(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`).catch(() => { })

            for (const data of USERS) {

                let Total = data.Balance || 0

                if (Total < 0)
                    UsersMoney.push({ id: data.id, bal: Total })
            }

            if (UsersMoney.length === 0)
                return msg.edit(`${e.Info} | Aparentemente não há ninguém individado.`).catch(() => { })

            let Sorted = UsersMoney.sort((a, b) => a.bal - b.bal),
                AuthorRank = Sorted.findIndex(author => author.id === message.author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n${e.Bells} ${a.bal} ${moeda}\n`).join('\n')

            if (UsersMoney.length === 0) rank = 'Não há ninguém no ranking'

            embed
                .setColor('YELLOW')
                .setTitle(`👑 Ranking - Global Money Reverse`)
                .setDescription(`O ranking abaixo representa a todo o dinheiro negativo.\n \n${rank}`)
                .setFooter({ text: `Seu ranking: ${AuthorRank} | Rank Base: Carteira Negativada` })

            if (['local', 'server'].includes(args[1]?.toLowerCase())) return InServerLocalRanking()
            return !isNaN(args[1]) || ['me', 'eu'].includes(args[1]?.toLowerCase()) || user
                ? VerifyLocationRanking()
                : msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [embed]
                }).catch(() => { })

            function InServerLocalRanking() {

                let Rank = Sorted.filter(user => message.guild.members.cache.has(user.id)),
                    RankMapped = Rank.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n${e.Bells} ${a.bal || 0} ${moeda}\n`).join('\n'),
                    myrank = Rank.findIndex(author => author.id === message.author.id) + 1 || "N/A"

                if (!Rank)
                    return msg.edit({ content: `${e.Info} | Aparentemente não há ninguém individado.` }).catch(() => { })

                embed
                    .setColor('YELLOW')
                    .setTitle(`👑 Ranking - ${message.guild.name}`)
                    .setDescription(`${RankMapped}`)
                    .setFooter({ text: `Seu ranking: ${myrank} | Rank Base: Carteira Negativada` })

                return msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [embed]
                }).catch(() => { })

            }

            function VerifyLocationRanking() {

                let Num = parseInt(args[1])

                if (['me', 'eu'].includes(args[1]?.toLowerCase())) Num = AuthorRank

                if (user) Num = Sorted.findIndex(u => u.id === user.id) + 1 || "N/A"

                if (Num === 0 || !UsersMoney[Num - 1])
                    return msg.edit({ content: `${e.Deny} | Ranking não encontrado.` }).catch(() => { })

                let InLocaleRanking = UsersMoney.splice(Num - 1, 1)

                return msg.edit({ content: InLocaleRanking.map(a => `**${Medals(Num - 1)} ${GetUser(a.id)}** - *\`${a.id}\`*\n${e.Bells} ${a.bal || 0} ${moeda}`).join('\n') }).catch(() => { })

            }

        }

        async function ClanRanking() {

            let ClansArray = [],
                clans = await Database.Clan.find({}) || [],
                dataUser = await Database.User.findOne({ id: message.author.id }, 'Clan'),
                AtualClan = dataUser.Clan

            for (const data of clans)
                if (data.Donation > 0)
                    ClansArray.push({ key: data.id, name: data.Name, donation: data.Donation })

            if (ClansArray.length < 1) return msg.edit(`${e.Info} | Não tem nenhum clan no ranking por enquanto.`).catch(() => { })

            let rank = ClansArray.slice(0, 10).sort((a, b) => b.donation - a.donation).map((clan, i) => ` \n> ${Medals(i)} **${clan.name}** - \`${clan.key}\`\n> ${clan.donation} ${moeda}\n`).join('\n'),
                MyClanRank = ClansArray.findIndex(clans => clans.name === AtualClan) + 1 || 'N/A',
                color = await Colors(message.author.id)

            return msg.edit(
                {
                    content: `${e.Check} | Ranking construido com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor(color)
                            .setTitle(`👑 Top 10 Clans`)
                            .setDescription(`O clan é baseado nas doações\n \n${rank}`)
                            .setFooter({ text: `Meu Clan: ${MyClanRank}` })
                    ]
                }
            ).catch(() => { })

        }

        async function mixGlobalRanking() {

            let users = await Database.User.find({}, 'id MixCount'),
                UsersData = []

            if (users.length === 0)
                return msg.edit(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`).catch(() => { })

            for (const data of users) {

                let mixCount = data.MixCount || 0

                if (mixCount > 0)
                    UsersData.push({ id: data.id, mix: mixCount })
            }

            if (UsersData.length === 0)
                return msg.edit(`${e.Info} | Tudo vázio por aqui.`).catch(() => { })

            let Sorted = UsersData.sort((a, b) => b.mix - a.mix),
                AuthorRank = Sorted.findIndex(author => author.id === message.author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n💬 ${a.mix} acertos\n`).join('\n')

            if (!UsersData.length) rank = 'Não há ninguém no ranking'

            if (['local', 'server'].includes(args[1]?.toLowerCase())) return InServerLocalRanking()

            return !isNaN(args[1]) || ['me', 'eu'].includes(args[1]?.toLowerCase()) || user
                ? VerifyLocationRanking()
                : msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor('YELLOW')
                            .setTitle(`👑 Ranking - Global Mix Game`)
                            .setDescription(`Esse ranking é gerado na base da contagem do comando mix.\n \n${rank}`)
                            .setFooter({ text: `Seu ranking: ${AuthorRank} | Rank Base: MixGlobalCount` })
                    ]
                }).catch(() => { })

            function InServerLocalRanking() {

                let Rank = Sorted.filter(user => message.guild.members.cache.has(user.id)),
                    RankMapped = Rank.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n💬 ${a.mix || 0} acertos\n`).join('\n'),
                    myrank = Rank.findIndex(author => author.id === message.author.id) + 1 || "N/A"

                return msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor('YELLOW')
                            .setTitle(`👑 Ranking Mix - ${message.guild.name}`)
                            .setDescription(`${RankMapped}`)
                            .setFooter({ text: `Seu ranking: ${myrank}` })
                    ]
                }).catch(() => { })

            }

            function VerifyLocationRanking() {

                let Num = parseInt(args[1])

                if (['me', 'eu'].includes(args[1]?.toLowerCase())) Num = AuthorRank

                if (user) Num = Sorted.findIndex(u => u.id === user.id) + 1 || "N/A"

                if (Num === 0 || !UsersData[Num - 1])
                    return msg.edit(`${e.Deny} | Ranking não encontrado.`).catch(() => { })

                let InLocaleRanking = UsersData.splice(Num - 1, 1)

                return msg.edit({ content: InLocaleRanking.map(a => `**${Medals(Num - 1)} ${GetUser(a.id)}** - *\`${a.id}\`*\n💬 ${a.mix || 0} acertos`).join('\n') }).catch(() => { })

            }

        }

        async function quizGlobalRanking() {

            let users = await Database.User.find({}, 'id QuizCount'),
                UsersData = []

            if (users.length === 0)
                return msg.edit(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`).catch(() => { })

            for (const data of users) {

                let QuizCount = data.QuizCount || 0

                if (QuizCount > 0)
                    UsersData.push({ id: data.id, quiz: QuizCount })
            }

            if (UsersData.length === 0)
                return msg.edit(`${e.Info} | Tudo vázio por aqui.`).catch(() => { })

            let Sorted = UsersData.sort((a, b) => b.quiz - a.quiz),
                AuthorRank = Sorted.findIndex(author => author.id === message.author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n💡 ${a.quiz} acertos\n`).join('\n')

            if (!UsersData.length) rank = 'Não há ninguém no ranking'

            if (['local', 'server'].includes(args[1]?.toLowerCase())) return InServerLocalRanking()

            return !isNaN(args[1]) || ['me', 'eu'].includes(args[1]?.toLowerCase()) || user
                ? VerifyLocationRanking()
                : msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor('YELLOW')
                            .setTitle(`👑 Ranking - Global Quiz Game`)
                            .setDescription(`Esse ranking é gerado na base da contagem do jogo quiz.\n \n${rank}`)
                            .setFooter({ text: `Seu ranking: ${AuthorRank} | Rank Base: QuizGlobalCount` })
                    ]
                }).catch(() => { })

            function InServerLocalRanking() {

                let Rank = Sorted.filter(user => message.guild.members.cache.has(user.id)),
                    RankMapped = Rank.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n💡 ${a.quiz || 0} acertos\n`).join('\n'),
                    myrank = Rank.findIndex(author => author.id === message.author.id) + 1 || "N/A"

                return msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor('YELLOW')
                            .setTitle(`👑 Ranking Quiz - ${message.guild.name}`)
                            .setDescription(`${RankMapped}`)
                            .setFooter({ text: `Seu ranking: ${myrank}` })
                    ]
                }).catch(() => { })

            }

            function VerifyLocationRanking() {

                let Num = parseInt(args[1])

                if (['me', 'eu'].includes(args[1]?.toLowerCase())) Num = AuthorRank

                if (user) Num = Sorted.findIndex(u => u.id === user.id) + 1 || "N/A"

                if (Num === 0 || !UsersData[Num - 1])
                    return msg.edit(`${e.Deny} | Ranking não encontrado.`).catch(() => { })

                let InLocaleRanking = UsersData.splice(Num - 1, 1)

                return msg.edit(InLocaleRanking.map(a => `**${Medals(Num - 1)} ${GetUser(a.id)}** - *\`${a.id}\`*\n💡 ${a.quiz || 0} acertos`).join('\n')).catch(() => { })

            }

        }

        async function jokempoGlobalRanking() {

            if (['invertido', 'invert', 'derrotas', 'derrota'].includes(args[1]?.toLowerCase())) return jokempoGlobalRankingInvert()

            let users = await Database.User.find({}, 'id Jokempo'),
                UsersData = []

            if (users.length === 0)
                return msg.edit(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`).catch(() => { })

            for (const data of users) {

                let wins = data?.Jokempo?.Wins || 0,
                    loses = data?.Jokempo?.Loses || 0

                if (wins > 0 || loses > 0)
                    UsersData.push({ id: data.id, wins: wins, loses: loses })
            }

            if (UsersData.length === 0)
                return msg.edit(`${e.Info} | Tudo vázio por aqui.`).catch(() => { })

            let Sorted = UsersData.sort((a, b) => b.wins - a.wins),
                AuthorRank = Sorted.findIndex(author => author.id === message.author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n⬆️ ${a.wins} vitórias\n⬇️ ${a.loses} derrotas\n`).join('\n')

            if (!UsersData.length) rank = 'Não há ninguém no ranking'

            if (['local', 'server'].includes(args[1]?.toLowerCase())) return InServerLocalRanking()

            return !isNaN(args[1]) || ['me', 'eu'].includes(args[1]?.toLowerCase()) || user
                ? VerifyLocationRanking()
                : msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor('YELLOW')
                            .setTitle(`👑 Ranking - Global Jokempo Game`)
                            .setDescription(`Esse ranking é gerado na base da contagem do jogo jokempo.\n \n${rank}`)
                            .setFooter({ text: `Seu ranking: ${AuthorRank} | Rank Base: Vitórias no Game Jokempo` })
                    ]
                }).catch(() => { })

            function InServerLocalRanking() {

                let Rank = Sorted.filter(user => message.guild.members.cache.has(user.id)),
                    RankMapped = Rank.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n⬆️ ${a.wins} vitórias\n⬇️ ${a.loses} derrotas\n`).join('\n'),
                    myrank = Rank.findIndex(author => author.id === message.author.id) + 1 || "N/A"

                return msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor('YELLOW')
                            .setTitle(`👑 Ranking Jokempo - ${message.guild.name}`)
                            .setDescription(`${RankMapped}`)
                            .setFooter({ text: `Seu ranking: ${myrank}` })
                    ]
                }).catch(() => { })

            }

            function VerifyLocationRanking() {

                let Num = parseInt(args[1])

                if (['me', 'eu'].includes(args[1]?.toLowerCase())) Num = AuthorRank

                if (user) Num = Sorted.findIndex(u => u.id === user.id) + 1 || "N/A"

                if (Num === 0 || !UsersData[Num - 1])
                    return msg.edit(`${e.Deny} | Ranking não encontrado.`).catch(() => { })

                let InLocaleRanking = UsersData.splice(Num - 1, 1)

                return msg.edit(InLocaleRanking.map(a => `**${Medals(Num - 1)} ${GetUser(a.id)}** - *\`${a.id}\`*\n⬆️ ${a.wins} vitórias\n⬇️ ${a.loses} derrotas\n`).join('\n')).catch(() => { })

            }

        }

        async function jokempoGlobalRankingInvert() {

            let users = await Database.User.find({}, 'id Jokempo'),
                UsersData = []

            if (users.length === 0)
                return msg.edit(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`).catch(() => { })

            for (const data of users) {

                let wins = data?.Jokempo?.Wins || 0,
                    loses = data?.Jokempo?.Loses || 0

                if (wins > 0 || loses > 0)
                    UsersData.push({ id: data.id, wins: wins, loses: loses })
            }

            if (UsersData.length === 0)
                return msg.edit(`${e.Info} | Tudo vázio por aqui.`).catch(() => { })

            let Sorted = UsersData.sort((a, b) => b.loses - a.loses),
                AuthorRank = Sorted.findIndex(author => author.id === message.author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n⬇️ ${a.loses} derrotas\n⬆️ ${a.wins} vitórias\n`).join('\n')

            if (!UsersData.length) rank = 'Não há ninguém no ranking'

            if (['local', 'server'].includes(args[2]?.toLowerCase())) return InServerLocalRanking()

            return !isNaN(args[1]) || ['me', 'eu'].includes(args[2]?.toLowerCase()) || user
                ? VerifyLocationRanking()
                : msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor('YELLOW')
                            .setTitle(`👑 Ranking - Global Jokempo Game | Invertido`)
                            .setDescription(`Esse ranking é gerado na base da contagem do jogo jokempo.\n \n${rank}`)
                            .setFooter({ text: `Seu ranking: ${AuthorRank} | Rank Base: Derrotas no Game Jokempo` })
                    ]
                }).catch(() => { })

            function InServerLocalRanking() {

                let Rank = Sorted.filter(user => message.guild.members.cache.has(user.id)),
                    RankMapped = Rank.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n⬇️ ${a.loses} derrotas\n⬆️ ${a.wins} vitórias\n`).join('\n'),
                    myrank = Rank.findIndex(author => author.id === message.author.id) + 1 || "N/A"

                return msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor('YELLOW')
                            .setTitle(`👑 Ranking Jokempo Invertido - ${message.guild.name}`)
                            .setDescription(`${RankMapped}`)
                            .setFooter({ text: `Seu ranking: ${myrank}` })
                    ]
                })

            }

            function VerifyLocationRanking() {

                let Num = parseInt(args[2])

                if (['me', 'eu'].includes(args[2]?.toLowerCase())) Num = AuthorRank

                if (user) Num = Sorted.findIndex(u => u.id === user.id) + 1 || "N/A"

                if (Num === 0 || !UsersData[Num - 1])
                    return msg.edit(`${e.Deny} | Ranking não encontrado.`).catch(() => { })

                let InLocaleRanking = UsersData.splice(Num - 1, 1)

                return msg.edit(InLocaleRanking.map(a => `**${Medals(Num - 1)} ${GetUser(a.id)}** - *\`${a.id}\`*\n⬇️ ${a.loses} derrotas\n⬆️ ${a.wins} vitórias\n`).join('\n')).catch(() => { })

            }

        }

        async function ticTacToeGlobalRanking() {

            let invert = false

            if (['invertido', 'invert', 'derrotas', 'derrota'].includes(args[1]?.toLowerCase())) invert = true

            let Allusers = await Database.User.find({}, 'id TicTacToeCount'),
                users = Allusers?.filter(data => data.TicTacToeCount),
                UsersData = []

            if (users.length === 0)
                return msg.edit(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`).catch(() => { })

            for (const data of users) {

                let count = data?.TicTacToeCount || 0

                if (count > 0)
                    UsersData.push({ id: data.id, count: count })
            }

            if (UsersData.length === 0)
                return msg.edit(`${e.Info} | Tudo vázio por aqui.`).catch(() => { })

            let Sorted = invert ? UsersData.sort((a, b) => a.count - b.count) : UsersData.sort((a, b) => b.count - a.count),
                AuthorRank = Sorted.findIndex(author => author.id === message.author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n⬆️ ${a.count} vitórias`).join('\n')

            if (!UsersData.length) rank = 'Não há ninguém no ranking'

            if (['local', 'server'].includes(args[1]?.toLowerCase())) return InServerLocalRanking()

            return !isNaN(args[1]) || ['me', 'eu'].includes(args[1]?.toLowerCase()) || user
                ? VerifyLocationRanking()
                : msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor('YELLOW')
                            .setTitle(`👑 Ranking - Global Tic Tac Toe Game ${invert ? '| Invertido' : ''}`)
                            .setDescription(`Esse ranking é gerado na base da contagem do jogo da velha.\n \n${rank}`)
                            .setFooter({ text: `Seu ranking: ${AuthorRank} | Rank Base: Vitórias no Game Jogo da Velha` })
                    ]
                }).catch(() => { })

            function InServerLocalRanking() {

                let Rank = Sorted.filter(user => message.guild.members.cache.has(user.id)),
                    RankMapped = Rank.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n⬆️ ${a.count} vitórias\``).join('\n'),
                    myrank = Rank.findIndex(author => author.id === message.author.id) + 1 || "N/A"

                return msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor('YELLOW')
                            .setTitle(`👑 Ranking Jogo da Velha - ${message.guild.name}`)
                            .setDescription(`${RankMapped}`)
                            .setFooter({ text: `Seu ranking: ${myrank}` })
                    ]
                }).catch(() => { })

            }

            function VerifyLocationRanking() {

                let Num = parseInt(args[1])

                if (['me', 'eu'].includes(args[1]?.toLowerCase())) Num = AuthorRank

                if (user) Num = Sorted.findIndex(u => u.id === user.id) + 1 || "N/A"

                if (Num === 0 || !UsersData[Num - 1])
                    return msg.edit(`${e.Deny} | Ranking não encontrado.`).catch(() => { })

                let InLocaleRanking = UsersData.splice(Num - 1, 1)

                return msg.edit(InLocaleRanking.map(a => `**${Medals(Num - 1)} ${GetUser(a.id)}** - *\`${a.id}\`*\n⬆️ ${a.count} vitórias`).join('\n')).catch(() => { })

            }

        }

        async function memoryGlobalRanking() {

            let Allusers = await Database.User.find({}, 'id CompetitiveMemoryCount'),
                users = Allusers?.filter(data => data.CompetitiveMemoryCount),
                UsersData = []

            if (users.length === 0)
                return msg.edit(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`).catch(() => { })

            for (const data of users) {

                let count = data?.CompetitiveMemoryCount || 0

                if (count > 0)
                    UsersData.push({ id: data.id, count: count })
            }

            if (UsersData.length === 0)
                return msg.edit(`${e.Info} | Tudo vázio por aqui.`).catch(() => { })

            let Sorted = UsersData.sort((a, b) => b.count - a.count),
                AuthorRank = Sorted.findIndex(author => author.id === message.author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n🏆 ${a.count} vitórias`).join('\n')

            if (!UsersData.length) rank = 'Não há ninguém no ranking'

            if (['local', 'server'].includes(args[1]?.toLowerCase())) return InServerLocalRanking()

            return !isNaN(args[1]) || ['me', 'eu'].includes(args[1]?.toLowerCase()) || user
                ? VerifyLocationRanking()
                : msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor('YELLOW')
                            .setTitle('👑 Ranking - Global Memory Game')
                            .setDescription(`Esse ranking é gerado na contagem de vitórias do Memory Game.\n \n${rank}`)
                            .setFooter({ text: `Seu ranking: ${AuthorRank} | Rank Base: Vitórias no Game Memory` })
                    ]
                }).catch(() => { })

            function InServerLocalRanking() {

                let Rank = Sorted.filter(user => message.guild.members.cache.has(user.id)),
                    RankMapped = Rank.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n🏆 ${a.count} vitórias\``).join('\n'),
                    myrank = Rank.findIndex(author => author.id === message.author.id) + 1 || "N/A"

                return msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor('YELLOW')
                            .setTitle(`👑 Ranking Game Memory - ${message.guild.name}`)
                            .setDescription(`${RankMapped}`)
                            .setFooter({ text: `Seu ranking: ${myrank}` })
                    ]
                }).catch(() => { })

            }

            function VerifyLocationRanking() {

                let Num = parseInt(args[1])

                if (['me', 'eu'].includes(args[1]?.toLowerCase())) Num = AuthorRank

                if (user) Num = Sorted.findIndex(u => u.id === user.id) + 1 || "N/A"

                if (Num === 0 || !UsersData[Num - 1])
                    return msg.edit(`${e.Deny} | Ranking não encontrado.`).catch(() => { })

                let InLocaleRanking = UsersData.splice(Num - 1, 1)

                return msg.edit(InLocaleRanking.map(a => `**${Medals(Num - 1)} ${GetUser(a.id)}** - *\`${a.id}\`*\n🏆 ${a.count} vitórias`).join('\n')).catch(() => { })

            }

        }

        async function forcaGlobalRanking() {

            let Allusers = await Database.User.find({}, 'id ForcaCount'),
                users = Allusers?.filter(data => data.ForcaCount),
                UsersData = []

            if (users.length === 0)
                return msg.edit(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`).catch(() => { })

            for (const data of users) {

                let count = data?.ForcaCount || 0

                if (count > 0)
                    UsersData.push({ id: data.id, count: count })
            }

            if (UsersData.length === 0)
                return msg.edit(`${e.Info} | Tudo vázio por aqui.`).catch(() => { })

            let Sorted = UsersData.sort((a, b) => b.count - a.count),
                AuthorRank = Sorted.findIndex(author => author.id === message.author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n😵 ${a.count} acertos`).join('\n')

            if (!UsersData.length) rank = 'Não há ninguém no ranking'

            if (['local', 'server'].includes(args[1]?.toLowerCase())) return InServerLocalRanking()

            return !isNaN(args[1]) || ['me', 'eu'].includes(args[1]?.toLowerCase()) || user
                ? VerifyLocationRanking()
                : msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor('YELLOW')
                            .setTitle(`👑 Ranking - Global Hangman Game`)
                            .setDescription(`Esse ranking é gerado na contagem de vitórias do Hangman Game.\n \n${rank}`)
                            .setFooter({ text: `Seu ranking: ${AuthorRank} | Rank Base: Vitórias no Game Forca` })
                    ]
                }).catch(() => { })

            function InServerLocalRanking() {

                let Rank = Sorted.filter(user => message.guild.members.cache.has(user.id)),
                    RankMapped = Rank.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n😵 ${a.count} acertos`).join('\n'),
                    myrank = Rank.findIndex(author => author.id === message.author.id) + 1 || "N/A"

                return msg.edit({
                    content: `${e.Check} | Ranking carregado com sucesso!`,
                    embeds: [
                        new MessageEmbed()
                            .setColor('YELLOW')
                            .setTitle(`👑 Ranking Game Hangman - ${message.guild.name}`)
                            .setDescription(`${RankMapped}`)
                            .setFooter({ text: `Seu ranking: ${myrank}` })
                    ]
                }).catch(() => { })

            }

            function VerifyLocationRanking() {

                let Num = parseInt(args[1])

                if (['me', 'eu'].includes(args[1]?.toLowerCase())) Num = AuthorRank

                if (user) Num = Sorted.findIndex(u => u.id === user.id) + 1 || "N/A"

                if (Num === 0 || !UsersData[Num - 1])
                    return msg.edit(`${e.Deny} | Ranking não encontrado.`).catch(() => { })

                let InLocaleRanking = UsersData.splice(Num - 1, 1)

                return msg.edit(InLocaleRanking.map(a => `**${Medals(Num - 1)} ${GetUser(a.id)}** - *\`${a.id}\`*\n🏆 ${a.count} vitórias`).join('\n')).catch(() => { })

            }

        }

        function Medals(i) {
            const Medals = {
                1: e.CoroaDourada,
                2: e.CoroaDePrata,
                3: e.thirdcrown
            }

            return Medals[i + 1] || `${i + 1}.`
        }

        function GetUser(UserId) {

            const user = client.users.cache.get(UserId)?.tag

            if (!user) {
                Database.deleteUser(UserId)
                return `${e.Deny} Usuário deletado`
            }

            return user?.replace(/`/g, '')

        }

    }
}