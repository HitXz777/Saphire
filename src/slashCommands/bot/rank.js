const { e } = require('../../../JSON/emojis.json'),
    Moeda = require('../../../modules/functions/public/moeda'),
    Colors = require('../../../modules/functions/plugins/colors')

module.exports = {
    name: 'ranking',
    description: '[bot] Confira os mais diversos ranking',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'category',
            description: '[bot] Categorias de ranking',
            type: 3,
            required: true,
            choices: [
                {
                    name: 'globais',
                    value: 'topGlobais'
                },
                {
                    name: 'level',
                    value: 'level'
                },
                {
                    name: 'dinheiro',
                    value: 'money'
                },
                {
                    name: 'likes',
                    value: 'like'
                },
                {
                    name: 'dinheiro invertido',
                    value: 'invert'
                },
                {
                    name: 'mix',
                    value: 'mix'
                },
                {
                    name: 'flaggaming',
                    value: 'flag'
                },
                {
                    name: 'jokenpô',
                    value: 'jokempo'
                },
                {
                    name: 'tictactoe',
                    value: 'tictactoe'
                },
                {
                    name: 'memory',
                    value: 'memory'
                },
                {
                    name: 'forca',
                    value: 'forca'
                },
                {
                    name: 'quiz',
                    value: 'quiz'
                },
                {
                    name: 'clans',
                    value: 'clan'
                }
            ]
        },
        // {
        //     name: 'user',
        //     description: '[bot] Selecionar usuário',
        //     type: 6
        // },
        // {
        //     name: 'search',
        //     description: '[bot] Pesquise por um usuário',
        //     type: 6
        // }
    ],
    async execute({ interaction: interaction, client: client, database: Database }) {

        await interaction.deferReply()

        const { options, guild, user: author } = interaction

        let category = options.getString('category'),
            moeda = await Moeda(null, guild.id),
            timingToRefresh = Database.Cache.get('GlobalRefreshTime'),
            timing = client.GetTimeout(1800000, timingToRefresh),
            color = await Colors(author.id)

        switch (category) {
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
            case 'close': await interaction.editReply({ content: `${e.Deny} | Comando cancelado`, embeds: [], components: [] }); break;
            default: await interaction.editReply({ content: `${e.Warn} | Estranho... Isso não deveria ter acontecido...`, embeds: [] }).catch(() => { }); break;
        }
        return

        async function TopGlobalRanking(timing) {

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

            return await interaction.editReply(
                {
                    embeds: [
                        {
                            color: color,
                            title: `${e.CoroaDourada} Top Globais`,
                            description: `⏲️ Os Top Globais se atualizarão daqui ${timing || 'Searching Timing'}`,
                            fields: [
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
                            ]
                        }
                    ]
                }
            )

            function formatUser(userId) {
                let user = client.users.cache.get(`${userId}`)
                if (!user) return `${e.Loading} | Aguardando a próxima atualização global...`
                return `${user.tag?.replace(/`/g, '')} - \`${user.id}\``
            }

        }

        async function flagGamingRanking() {

            let users = await Database.User.find({}, 'id GamingCount.FlagCount'),
                UsersData = []

            if (!users || users.length === 0)
                return await interaction.editReply(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`).catch(() => { })

            for (const data of users) {

                if (!data?.GamingCount?.FlagCount) continue

                let FlagCount = data?.GamingCount?.FlagCount || 0

                if (FlagCount > 0)
                    UsersData.push({ id: data.id, count: FlagCount })
                else continue
            }

            if (UsersData.length === 0)
                return await interaction.editReply(`${e.Info} | Tudo vázio por aqui.`).catch(() => { })

            let Sorted = UsersData.sort((a, b) => b.count - a.count),
                AuthorRank = Sorted.findIndex(u => u.id === author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n🎌 ${a.count} acertos\n`).join('\n')

            if (!UsersData.length) rank = 'Não há ninguém no ranking'

            await interaction.editReply({
                embeds: [
                    {
                        color: color,
                        title: '👑 Ranking - Global Flag Gaming',
                        description: `Esse ranking é gerado na base Flag Gaming Accepts.\n \n${rank}`,
                        footer: { text: `Seu ranking: ${AuthorRank} | Rank Base: FlagGamingGlobalAccepts` }
                    }
                ]
            }).catch(() => { })

        }

        async function RankLevel(timing) {

            let users = Database.Cache.get('rankLevel') || []

            if (!users || !users.length) return await interaction.editReply(`${e.Info} | Não há ninguém no ranking`).catch(() => { })

            let index = users.findIndex(u => u.id === author.id)

            if (index === -1) users = await Database.User.find({}, 'id Xp Level')

            let RankingSorted = index > 0 ? users : users.filter(d => d.Level > 0).sort((a, b) => b.Level - a.Level)
            index = RankingSorted.findIndex(u => u.id === author.id)
            let data = RankingSorted.map((u, i) => { return { i: i, id: u.id, xp: u.Xp, XpNeeded: parseInt(u.Level * 275)?.toFixed(0), level: u.Level } })

            if (!data.length) return await interaction.editReply(`${e.Info} | Não há ninguém no ranking`).catch(() => { })

            let RankMapped = data.slice(0, 10).map(user => `**${Medals(user.i)} ${GetUser(user.id)}** - \`${user.id}\`\n${e.RedStar} ${user.level} *(${user.xp}/${user.XpNeeded})*\n`).join('\n'),
                myrank = index === -1 ? 'N/A' : index + 1

            return await interaction.editReply({
                embeds: [
                    {
                        color: color,
                        title: `👑 Ranking - Global Experience`,
                        description: `Próxima atualização em: ${timing}\n \n${RankMapped}`,
                        footer: { text: `Seu ranking: ${myrank} | Rank Base: XP` }
                    }
                ]
            }).catch(() => { })
        }

        async function RankMoney(timing) {

            let users = Database.Cache.get('rankBalance') || []

            if (!users || !users.length) return await interaction.editReply(`${e.Info} | Não há ninguém no ranking`).catch(() => { })

            let index = users.findIndex(u => u.id === author.id)

            if (index === -1) users = await Database.User.find({}, 'id Balance')

            let RankingSorted = index >= 0 ? users : users.filter(d => d.Balance > 0).sort((a, b) => b.Balance - a.Balance)
            index = RankingSorted.findIndex(u => u.id === author.id)
            let data = RankingSorted.map((u, i) => { return { i: i, id: u.id, Balance: u.Balance } })

            if (!data.length) return await interaction.editReply(`${e.Info} | Não há ninguém no ranking`).catch(() => { })

            let AuthorRank = index === -1 ? 'N/A' : index + 1,
                rank = data.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n${e.Bells} ${a.Balance} ${moeda}\n`).join('\n')

            if (!data.length) rank = 'Não há ninguém no ranking'

            return await interaction.editReply({
                content: `${e.Check} | Ranking carregado com sucesso!`,
                embeds: [
                    {
                        color: color,
                        title: '👑 Ranking - Global Money',
                        description: `Próxima atualização em ${timing}\n \n${rank}`,
                        footer: { text: `Seu ranking: ${AuthorRank} | Rank Base: Saldo` }
                    }
                ]
            })
        }

        async function RankLikes() {

            let users = await Database.User.find({}, 'id Likes'),
                UsersArray = []

            for (const data of users) {
                let Likes = data.Likes || 0

                if (Likes > 0)
                    UsersArray.push({ id: data.id, like: Likes })
            }

            if (!UsersArray.length) return await interaction.editReply(`${e.Info} | Não há ninguém no ranking`).catch(() => { })

            let RankingSorted = UsersArray.sort((a, b) => b.like - a.like),
                Rank = RankingSorted.slice(0, 10),
                RankMapped = Rank.map((user, i) => `**${Medals(i)} ${GetUser(user.id)}** - \`${user.id}\`\n${e.Like} ${user.like}\n`).join('\n'),
                myrank = RankingSorted.findIndex(u => u.id === author.id) + 1 || "N/A"

            return await interaction.editReply({
                content: `${e.Check} | Ranking carregado com sucesso!`,
                embeds: [
                    {
                        color: 'YELLOW',
                        title: `👑 Ranking - Global Likes`,
                        description: RankMapped,
                        footer: { text: `Seu ranking: ${myrank} | Rank Base: Likes` }
                    }
                ]
            })
        }

        async function RankInvert() {

            let USERS = await Database.User.find({}, 'id Balance'),
                UsersMoney = []

            if (USERS.length === 0)
                return await interaction.editReply(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`).catch(() => { })

            for (const data of USERS) {

                let Total = data.Balance || 0

                if (Total < 0)
                    UsersMoney.push({ id: data.id, bal: Total })
            }

            if (UsersMoney.length === 0)
                return await interaction.editReply(`${e.Info} | Aparentemente não há ninguém individado.`).catch(() => { })

            let Sorted = UsersMoney.sort((a, b) => a.bal - b.bal),
                AuthorRank = Sorted.findIndex(u => u.id === author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n${e.Bells} ${a.bal} ${moeda}\n`).join('\n')

            if (UsersMoney.length === 0) rank = 'Não há ninguém no ranking'

            return await interaction.editReply({
                content: `${e.Check} | Ranking carregado com sucesso!`,
                embeds: [
                    {
                        color: color,
                        title: '👑 Ranking - Global Money Reverse',
                        description: `O ranking abaixo representa a todo o dinheiro negativo.\n \n${rank}`,
                        footer: { text: `Seu ranking: ${AuthorRank} | Rank Base: Carteira Negativada` }
                    }
                ]
            }).catch(() => { })

        }

        async function ClanRanking() {

            let ClansArray = [],
                clans = await Database.Clan.find({}) || [],
                dataUser = await Database.User.findOne({ id: author.id }, 'Clan'),
                AtualClan = dataUser.Clan

            for (const data of clans)
                if (data.Donation > 0)
                    ClansArray.push({ key: data.id, name: data.Name, donation: data.Donation })

            if (ClansArray.length < 1) return await interaction.editReply(`${e.Info} | Não tem nenhum clan no ranking por enquanto.`).catch(() => { })

            let rank = ClansArray.slice(0, 10).sort((a, b) => b.donation - a.donation).map((clan, i) => ` \n> ${Medals(i)} **${clan.name}** - \`${clan.key}\`\n> ${clan.donation} ${moeda}\n`).join('\n'),
                MyClanRank = ClansArray.findIndex(clans => clans.name === AtualClan) + 1 || 'N/A'

            return await interaction.editReply(
                {
                    embeds: [
                        {
                            color: color,
                            title: '👑 Top 10 Clans',
                            description: `O clan é baseado nas doações\n \n${rank}`,
                            footer: { text: `Meu Clan: ${MyClanRank}` }
                        }
                    ]
                }
            )

        }

        async function mixGlobalRanking() {

            let users = await Database.User.find({}, 'id MixCount'),
                UsersData = []

            if (users.length === 0)
                return await interaction.editReply(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`).catch(() => { })

            for (const data of users) {

                let mixCount = data.MixCount || 0

                if (mixCount > 0)
                    UsersData.push({ id: data.id, mix: mixCount })
            }

            if (UsersData.length === 0)
                return await interaction.editReply(`${e.Info} | Tudo vázio por aqui.`).catch(() => { })

            let Sorted = UsersData.sort((a, b) => b.mix - a.mix),
                AuthorRank = Sorted.findIndex(u => u.id === author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n💬 ${a.mix} acertos\n`).join('\n')

            if (!UsersData.length) rank = 'Não há ninguém no ranking'

            return await interaction.editReply({
                content: `${e.Check} | Ranking carregado com sucesso!`,
                embeds: [
                    {
                        color: color,
                        title: '👑 Ranking - Global Mix Game',
                        description: `Esse ranking é gerado na base da contagem do comando mix.\n \n${rank}`,
                        footer: { text: `Seu ranking: ${AuthorRank} | Rank Base: MixGlobalCount` }
                    }
                ]
            })

        }

        async function quizGlobalRanking() {

            let users = await Database.User.find({}, 'id QuizCount'),
                UsersData = []

            if (users.length === 0)
                return await interaction.editReply(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`).catch(() => { })

            for (const data of users) {

                let QuizCount = data.QuizCount || 0

                if (QuizCount > 0)
                    UsersData.push({ id: data.id, quiz: QuizCount })
            }

            if (UsersData.length === 0)
                return await interaction.editReply(`${e.Info} | Tudo vázio por aqui.`).catch(() => { })

            let Sorted = UsersData.sort((a, b) => b.quiz - a.quiz),
                AuthorRank = Sorted.findIndex(u => u.id === author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n💡 ${a.quiz} acertos\n`).join('\n')

            if (!UsersData.length) rank = 'Não há ninguém no ranking'

            return await interaction.editReply({
                content: `${e.Check} | Ranking carregado com sucesso!`,
                embeds: [
                    {
                        color: color,
                        title: '👑 Ranking - Global Quiz Game',
                        description: `Esse ranking é gerado na base da contagem do jogo quiz.\n \n${rank}`,
                        footer: { text: `Seu ranking: ${AuthorRank} | Rank Base: QuizGlobalCount` }
                    }
                ]
            })

        }

        async function jokempoGlobalRanking() {

            let users = await Database.User.find({}, 'id Jokempo'),
                UsersData = []

            if (users.length === 0)
                return await interaction.editReply(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`).catch(() => { })

            for (const data of users) {

                let wins = data?.Jokempo?.Wins || 0,
                    loses = data?.Jokempo?.Loses || 0

                if (wins > 0 || loses > 0)
                    UsersData.push({ id: data.id, wins: wins, loses: loses })
            }

            if (UsersData.length === 0)
                return await interaction.editReply(`${e.Info} | Tudo vázio por aqui.`).catch(() => { })

            let Sorted = UsersData.sort((a, b) => b.wins - a.wins),
                AuthorRank = Sorted.findIndex(u => u.id === author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n⬆️ ${a.wins} vitórias\n⬇️ ${a.loses} derrotas\n`).join('\n')

            if (!UsersData.length) rank = 'Não há ninguém no ranking'

            return await interaction.editReply({
                content: `${e.Check} | Ranking carregado com sucesso!`,
                embeds: [
                    {
                        color: color,
                        title: '👑 Ranking - Global Jokempo Game',
                        description: `Esse ranking é gerado na base da contagem do jogo jokempo.\n \n${rank}`,
                        footer: { text: `Seu ranking: ${AuthorRank} | Rank Base: Vitórias no Game Jokempo` }
                    }
                ]
            })

        }

        async function ticTacToeGlobalRanking() {

            let Allusers = await Database.User.find({}, 'id TicTacToeCount'),
                users = Allusers?.filter(data => data.TicTacToeCount),
                UsersData = []

            if (users.length === 0)
                return await interaction.editReply(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`).catch(() => { })

            for (const data of users) {

                let count = data?.TicTacToeCount || 0

                if (count > 0)
                    UsersData.push({ id: data.id, count: count })
            }

            if (UsersData.length === 0)
                return await interaction.editReply(`${e.Info} | Tudo vázio por aqui.`).catch(() => { })

            let Sorted = UsersData.sort((a, b) => b.count - a.count),
                AuthorRank = Sorted.findIndex(u => u.id === author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n⬆️ ${a.count} vitórias`).join('\n')

            if (!UsersData.length) rank = 'Não há ninguém no ranking'

            return await interaction.editReply({
                content: `${e.Check} | Ranking carregado com sucesso!`,
                embeds: [
                    {
                        color: color,
                        title: '👑 Ranking - Global Tic Tac Toe Game',
                        description: `Esse ranking é gerado na base da contagem do jogo da velha.\n \n${rank}`,
                        footer: { text: `Seu ranking: ${AuthorRank} | Rank Base: Vitórias no Game Jogo da Velha` }
                    }
                ]
            })
        }

        async function memoryGlobalRanking() {

            let Allusers = await Database.User.find({}, 'id CompetitiveMemoryCount'),
                users = Allusers?.filter(data => data.CompetitiveMemoryCount),
                UsersData = []

            if (users.length === 0)
                return await interaction.editReply(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`).catch(() => { })

            for (const data of users) {

                let count = data?.CompetitiveMemoryCount || 0

                if (count > 0)
                    UsersData.push({ id: data.id, count: count })
            }

            if (UsersData.length === 0)
                return await interaction.editReply(`${e.Info} | Tudo vázio por aqui.`).catch(() => { })

            let Sorted = UsersData.sort((a, b) => b.count - a.count),
                AuthorRank = Sorted.findIndex(u => u.id === author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n🏆 ${a.count} vitórias`).join('\n')

            if (!UsersData.length) rank = 'Não há ninguém no ranking'

            return await interaction.editReply({
                content: `${e.Check} | Ranking carregado com sucesso!`,
                embeds: [
                    {
                        color: color,
                        title: '👑 Ranking - Global Memory Game',
                        description: `Esse ranking é gerado na contagem de vitórias do Memory Game.\n \n${rank}`,
                        footer: { text: `Seu ranking: ${AuthorRank} | Rank Base: Vitórias no Game Memory` }
                    }
                ]
            })

        }

        async function forcaGlobalRanking() {

            let Allusers = await Database.User.find({}, 'id ForcaCount'),
                users = Allusers?.filter(data => data.ForcaCount),
                UsersData = []

            if (users.length === 0)
                return await interaction.editReply(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`).catch(() => { })

            for (const data of users) {

                let count = data?.ForcaCount || 0

                if (count > 0)
                    UsersData.push({ id: data.id, count: count })
            }

            if (UsersData.length === 0)
                return await interaction.editReply(`${e.Info} | Tudo vázio por aqui.`).catch(() => { })

            let Sorted = UsersData.sort((a, b) => b.count - a.count),
                AuthorRank = Sorted.findIndex(u => u.id === author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}** - *\`${a.id}\`*\n😵 ${a.count} acertos`).join('\n')

            if (!UsersData.length) rank = 'Não há ninguém no ranking'

            return await interaction.editReply({
                content: `${e.Check} | Ranking carregado com sucesso!`,
                embeds: [
                    {
                        color: color,
                        title: '👑 Ranking - Global Hangman Game',
                        description: `Esse ranking é gerado na contagem de vitórias do Hangman Game.\n \n${rank}`,
                        footer: { text: `Seu ranking: ${AuthorRank} | Rank Base: Vitórias no Game Forca` }
                    }
                ]
            })

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