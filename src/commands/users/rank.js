const { e } = require('../../../database/emojis.json'),
    { lotery, Clan, Transactions, Reminders, DatabaseObj: { config } } = require('../../../Routes/functions/database'),
    Moeda = require('../../../Routes/functions/moeda'),
    Colors = require('../../../Routes/functions/colors'),
    DeleteUser = require('../../../Routes/functions/deleteUser')

module.exports = {
    name: 'rank',
    aliases: ['podio', 'ranking'],
    category: 'level',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: '🏆',
    usage: '<rank>',
    description: 'Confira os Top 10 Globais',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (!args[0]) return NoArgs()

        const user = client.users.cache.get(args[1]) || message.mentions.users.first() || message.mentions.repliedUser,
            embed = new MessageEmbed()

        if (['xp', 'level', 'nivel'].includes(args[0]?.toLowerCase())) return RankLevel()
        if (['dinheiro', 'money', 'cash', 'sp', 'coin', 'moeda', 'bank', 'coins'].includes(args[0]?.toLowerCase())) return RankMoney()
        if (['carteira', 'wallet'].includes(args[0]?.toLowerCase())) return RankCarteira()
        if (['like', 'curtidas', 'likes'].includes(args[0]?.toLowerCase())) return RankLikes()
        if (['dividas', 'invertido', 'dívidas', 'invert', 'invertido'].includes(args[0]?.toLowerCase())) return RankInvert()
        if (['clan', 'clans'].includes(args[0]?.toLowerCase())) return ClanRanking()

        return message.reply(`${e.Deny} | ${message.author}, este ranking não existe ou você escreveu errado. Use \`${prefix}rank\` e veja os rankings disponiveis.`)

        async function RankLevel() {

            let users = Object.keys(sdb.get('Users')),
                UsersArray = []

            for (const id of users) {
                let Exp = sdb.get(`Users.${id}.Xp`) || 0,
                    Level = sdb.get(`Users.${id}.Level`) || 0,
                    XpNeeded = Level * 550

                if (Exp > 0)
                    UsersArray.push({ id: id, xp: Exp, XpNeeded: XpNeeded, level: Level })
            }

            if (!UsersArray.length) rank = 'Não há ninguém no ranking'

            let RankingSorted = UsersArray.sort((a, b) => b.level - a.level),
                Rank = RankingSorted.slice(0, 10),
                RankMapped = Rank.map((user, i) => `**${Medals(i)} ${GetUser(user.id)}**\n🆔 \`${user.id}\`\n${e.RedStar} ${user.level} *(${user.xp}/${user.XpNeeded})*\n`).join('\n'),
                myrank = RankingSorted.findIndex(author => author.id === message.author.id) + 1 || "N/A"

            embed
                .setColor('YELLOW')
                .setTitle(`👑 Ranking - Global Experience`)
                .setDescription(`${RankMapped}`)
                .setFooter(`Seu ranking: ${myrank} | Rank Base: XP`)

            if (['local', 'server'].includes(args[1]?.toLowerCase())) return InServerLocalRanking()

            return !isNaN(args[1]) || ['me', 'eu'].includes(args[1]?.toLowerCase()) || user
                ? VerifyLocationRanking()
                : message.reply({ embeds: [embed] })

            function InServerLocalRanking() {

                let Rank = RankingSorted.filter(user => message.guild.members.cache.has(user.id)),
                    RankMapped = Rank.slice(0, 10).map((user, i) => `**${Medals(i)} ${GetUser(user.id)}**\n🆔 \`${user.id}\`\n${e.RedStar} ${user.level || 0} *(${user.xp}/${user.XpNeeded})*\n`).join('\n'),
                    myrank = Rank.findIndex(author => author.id === message.author.id) + 1 || "N/A"

                embed
                    .setColor('YELLOW')
                    .setTitle(`👑 Ranking - ${message.guild.name}`)
                    .setDescription(`${RankMapped}`)
                    .setFooter(`Seu ranking: ${myrank} | Rank Base: XP`)

                return message.reply({ embeds: [embed] })

            }

            function VerifyLocationRanking() {

                let Num = parseInt(args[1])

                if (['me', 'eu'].includes(args[1]?.toLowerCase())) Num = myrank

                if (user) Num = RankingSorted.findIndex(u => u.id === user.id) + 1 || "N/A"

                if (Num === 0 || !UsersArray[Num - 1])
                    return message.reply(`${e.Deny} | Ranking não encontrado.`)

                let InLocaleRanking = UsersArray.splice(Num - 1, 1)

                return message.reply(InLocaleRanking.map(user => `**${Medals(Num - 1)} ${GetUser(user.id)}**\n🆔 \`${user.id}\`\n${e.RedStar} ${user.level || 0} *(${user.xp}/${user.XpNeeded})*`).join('\n'))

            }

        }

        async function RankMoney() {

            let USERS = Object.keys(sdb.get('Users') || {}),
                UsersMoney = []

            if (USERS.length === 0)
                return message.reply(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`)

            for (const id of USERS) {

                const { Bal, Bank, Resgate } = {
                    Bal: parseInt(sdb.get(`Users.${id}.Balance`)) || 0,
                    Bank: parseInt(sdb.get(`Users.${id}.Bank`)) || 0,
                    Resgate: parseInt(sdb.get(`Users.${id}.Cache.Resgate`)) || 0
                }

                let Total = Bal + Bank + Resgate
                if (Total > 0)
                    UsersMoney.push({ id: id, bal: Total })
            }

            if (UsersMoney.length === 0)
                return message.reply(`${e.Info} | Tudo vázio por aqui.`)

            let Sorted = UsersMoney.sort((a, b) => b.bal - a.bal),
                AuthorRank = Sorted.findIndex(author => author.id === message.author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}**\n🆔*\`${a.id}\`*\n${e.Bells} ${a.bal} ${Moeda(message)}\n`).join('\n')

            if (!UsersMoney.length) rank = 'Não há ninguém no ranking'

            if (['local', 'server'].includes(args[1]?.toLowerCase())) return InServerLocalRanking()

            return !isNaN(args[1]) || ['me', 'eu'].includes(args[1]?.toLowerCase()) || user
                ? VerifyLocationRanking()
                : message.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor('YELLOW')
                            .setTitle(`👑 Ranking - Global Money`)
                            .setDescription(`O ranking abaixo representa a soma total entre carteira, banco e cache.\n \n${rank}`)
                            .setFooter(`Seu ranking: ${AuthorRank} | Rank Base: Soma de todo o dinheiro`)
                    ]
                })

            function InServerLocalRanking() {

                let Rank = Sorted.filter(user => message.guild.members.cache.has(user.id)),
                    RankMapped = Rank.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}**\n🆔*\`${a.id}\`*\n${e.Bells} ${a.bal || 0} ${Moeda(message)}\n`).join('\n'),
                    myrank = Rank.findIndex(author => author.id === message.author.id) + 1 || "N/A"

                embed
                    .setColor('YELLOW')
                    .setTitle(`👑 Ranking - ${message.guild.name}`)
                    .setDescription(`${RankMapped}`)
                    .setFooter(`Seu ranking: ${myrank} | Rank Base: Soma de todo o dinheiro`)

                return message.reply({ embeds: [embed] })

            }

            function VerifyLocationRanking() {

                let Num = parseInt(args[1])

                if (['me', 'eu'].includes(args[1]?.toLowerCase())) Num = AuthorRank

                if (user) Num = Sorted.findIndex(u => u.id === user.id) + 1 || "N/A"

                if (Num === 0 || !UsersMoney[Num - 1])
                    return message.reply(`${e.Deny} | Ranking não encontrado.`)

                let InLocaleRanking = UsersMoney.splice(Num - 1, 1)

                return message.reply(InLocaleRanking.map(a => `**${Medals(Num - 1)} ${GetUser(a.id)}**\n🆔*\`${a.id}\`*\n${e.Bells} ${Ocult(a.id) ? '||Oculto||' : a.bal || 0} ${Moeda(message)}`).join('\n'))

            }

        }

        async function RankCarteira() {

            let users = Object.keys(sdb.get('Users') || {}),
                UsersArray = []

            if (users.length === 0)
                return message.reply(`${e.Deny} | Ranking vázio`)

            for (const id of users) {
                let Money = parseInt(sdb.get(`Users.${id}.Balance`)) || 0

                if (Money > 0)
                    UsersArray.push({ id: id, money: Money })
            }

            if (!UsersArray.length) rank = 'Não há ninguém no ranking'

            let RankingSorted = UsersArray.sort((a, b) => b.money - a.money),
                Rank = RankingSorted.slice(0, 10),
                RankMapped = Rank.map((user, i) => `**${Medals(i)} ${GetUser(user.id)}**\n🆔 \`${user.id}\`\n${e.Bells} ${user.money} ${Moeda(message)}\n`).join('\n'),
                loteria = lotery.get('Loteria.Prize')?.toFixed(0) || 0,
                myrank = RankingSorted.findIndex(author => author.id === message.author.id) + 1 || "N/A"

            embed
                .setColor('YELLOW')
                .setTitle(`👑 Ranking - Global Wallet`)
                .setDescription(`${RankMapped}`)
                .addField(`${e.PandaProfit} Loteria ${client.user.username}`, `Prêmio Atual: ${loteria} ${Moeda(message)}`)
                .setFooter(`Seu ranking: ${myrank} | Rank Base: Carteira`)

            if (['local', 'server'].includes(args[1]?.toLowerCase())) return InServerLocalRanking()

            return !isNaN(args[1]) || ['me', 'eu'].includes(args[1]?.toLowerCase()) || user
                ? VerifyLocationRanking()
                : message.reply({ embeds: [embed] })

            function InServerLocalRanking() {

                let Rank = RankingSorted.filter(user => message.guild.members.cache.has(user.id)),
                    RankMapped = Rank.slice(0, 10).map((user, i) => `**${Medals(i)} ${GetUser(user.id)}**\n🆔 \`${user.id}\`\n${e.Bells} ${user.money || 0} ${Moeda(message)}\n`).join('\n'),
                    myrank = Rank.findIndex(author => author.id === message.author.id) + 1 || "N/A"

                embed
                    .setColor('YELLOW')
                    .setTitle(`👑 Ranking - ${message.guild.name}`)
                    .setDescription(`${RankMapped}`)
                    .setFooter(`Seu ranking: ${myrank} | Rank Base: Carteira`)

                return message.reply({ embeds: [embed] })

            }

            function VerifyLocationRanking() {

                let Num = parseInt(args[1])

                if (['me', 'eu'].includes(args[1]?.toLowerCase())) Num = myrank

                if (user) Num = RankingSorted.findIndex(u => u.id === user.id) + 1 || 0

                if (Num === 0 || !UsersArray[Num - 1])
                    return message.reply(`${e.Deny} | Ranking não encontrado.`)

                let InLocaleRanking = UsersArray.splice(Num - 1, 1)

                return message.reply(InLocaleRanking.map(user => `**${Medals(Num - 1)} ${GetUser(user.id)}**\n🆔 \`${user.id}\`\n${e.Bells} ${Ocult(user.id) ? '||Oculto||' : sdb.get(`Users.${user.id}.Balance`) || 0} ${Moeda(message)}\n`).join('\n'))

            }

        }

        async function RankLikes() {

            let users = Object.keys(sdb.get('Users')),
                UsersArray = []

            for (const id of users) {
                let Likes = sdb.get(`Users.${id}.Likes`) || 0

                if (Likes > 0)
                    UsersArray.push({ id: id, like: Likes })
            }

            if (!UsersArray.length) rank = 'Não há ninguém no ranking'

            let RankingSorted = UsersArray.sort((a, b) => b.like - a.like),
                Rank = RankingSorted.slice(0, 10),
                RankMapped = Rank.map((user, i) => `**${Medals(i)} ${GetUser(user.id)}**\n🆔 \`${user.id}\`\n${e.Like} ${user.like}\n`).join('\n'),
                myrank = RankingSorted.findIndex(author => author.id === message.author.id) + 1 || "N/A"

            embed
                .setColor('YELLOW')
                .setTitle(`👑 Ranking - Global Likes`)
                .setDescription(`${RankMapped}`)
                .setFooter(`Seu ranking: ${myrank} | Rank Base: Likes`)

            if (['local', 'server'].includes(args[1]?.toLowerCase())) return InServerLocalRanking()
            return !isNaN(args[1]) || ['me', 'eu'].includes(args[1]?.toLowerCase()) || user
                ? VerifyLocationRanking()
                : message.reply({ embeds: [embed] })

            function InServerLocalRanking() {

                let Rank = RankingSorted.filter(user => message.guild.members.cache.has(user.id)),
                    RankMapped = Rank.slice(0, 10).map((user, i) => `**${Medals(i)} ${GetUser(user.id)}**\n🆔 \`${user.id}\`\n${e.Like} ${user.like || 0}\n`).join('\n'),
                    myrank = Rank.findIndex(author => author.id === message.author.id) + 1 || "N/A"

                embed
                    .setColor('YELLOW')
                    .setTitle(`👑 Ranking - ${message.guild.name}`)
                    .setDescription(`${RankMapped}`)
                    .setFooter(`Seu ranking: ${myrank} | Rank Base: Likes`)

                return message.reply({ embeds: [embed] })

            }

            function VerifyLocationRanking() {

                let Num = parseInt(args[1])

                if (['me', 'eu'].includes(args[1]?.toLowerCase())) Num = myrank

                if (user) Num = RankingSorted.findIndex(u => u.id === user.id) + 1 || 0

                if (Num === 0 || !UsersArray[Num - 1])
                    return message.reply(`${e.Deny} | Ranking não encontrado.`)

                let InLocaleRanking = UsersArray.splice(Num - 1, 1)

                return message.reply(InLocaleRanking.map(user => `**${Medals(Num - 1)} ${GetUser(user.id)}**\n🆔 \`${user.id}\`\n${e.Like} ${user.like || 0}\n`).join('\n'))

            }

        }

        async function RankInvert() {

            let USERS = Object.keys(sdb.get('Users') || {}),
                UsersMoney = []

            if (USERS.length === 0)
                return message.reply(`${e.Info} | Não há nenhum usuário na minha database por enquanto.`)

            for (const id of USERS) {

                const { Bal, Bank, Resgate } = {
                    Bal: parseInt(sdb.get(`Users.${id}.Balance`)) || 0,
                    Bank: parseInt(sdb.get(`Users.${id}.Bank`)) || 0,
                    Resgate: parseInt(sdb.get(`Users.${id}.Cache.Resgate`)) || 0
                }

                let Total = Bal + Bank + Resgate
                if (Total < 0)
                    UsersMoney.push({ id: id, bal: Total })
            }

            if (UsersMoney.length === 0)
                return message.reply(`${e.Info} | Aparentemente não há ninguém individado.`)

            let Sorted = UsersMoney.sort((a, b) => a.bal - b.bal),
                AuthorRank = Sorted.findIndex(author => author.id === message.author.id) + 1 || "N/A",
                rank = Sorted.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}**\n🆔*\`${a.id}\`*\n${e.Bells} ${a.bal} ${Moeda(message)}\n`).join('\n')

            if (UsersMoney.length === 0) rank = 'Não há ninguém no ranking'

            embed
                .setColor('YELLOW')
                .setTitle(`👑 Ranking - Global Money Reverse`)
                .setDescription(`O ranking abaixo representa a soma total entre carteira, banco e cache.\n \n${rank}`)
                .setFooter(`Seu ranking: ${AuthorRank} | Rank Base: Carteira Negativada`)

            if (['local', 'server'].includes(args[1]?.toLowerCase())) return InServerLocalRanking()
            return !isNaN(args[1]) || ['me', 'eu'].includes(args[1]?.toLowerCase()) || user
                ? VerifyLocationRanking()
                : message.reply({ embeds: [embed] })

            function InServerLocalRanking() {

                let Rank = Sorted.filter(user => message.guild.members.cache.has(user.id)),
                    RankMapped = Rank.slice(0, 10).map((a, i) => `**${Medals(i)} ${GetUser(a.id)}**\n🆔*\`${a.id}\`*\n${e.Bells} ${a.bal || 0} ${Moeda(message)}\n`).join('\n'),
                    myrank = Rank.findIndex(author => author.id === message.author.id) + 1 || "N/A"

                if (!Rank)
                    return message.reply(`${e.Info} | Aparentemente não há ninguém individado.`)

                embed
                    .setColor('YELLOW')
                    .setTitle(`👑 Ranking - ${message.guild.name}`)
                    .setDescription(`${RankMapped}`)
                    .setFooter(`Seu ranking: ${myrank} | Rank Base: Carteira Negativada`)

                return message.reply({ embeds: [embed] })

            }

            function VerifyLocationRanking() {

                let Num = parseInt(args[1])

                if (['me', 'eu'].includes(args[1]?.toLowerCase())) Num = AuthorRank

                if (user) Num = Sorted.findIndex(u => u.id === user.id) + 1 || "N/A"

                if (Num === 0 || !UsersMoney[Num - 1])
                    return message.reply(`${e.Deny} | Ranking não encontrado.`)

                let InLocaleRanking = UsersMoney.splice(Num - 1, 1)

                return message.reply(InLocaleRanking.map(a => `**${Medals(Num - 1)} ${GetUser(a.id)}**\n🆔*\`${a.id}\`*\n${e.Bells} ${a.bal || 0} ${Moeda(message)}`).join('\n'))

            }

        }

        function ClanRanking() {

            let ClansArray = [],
                keys = Object.keys(Clan.get('Clans')),
                AtualClan = sdb.get(`Users.${message.author.id}.Clan`)

            for (const key of keys)
                if (Clan.get(`Clans.${key}.Donation`) > 0)
                    ClansArray.push({ key: key, name: Clan.get(`Clans.${key}.Name`), donation: Clan.get(`Clans.${key}.Donation`) })

            if (ClansArray.length < 1) return message.reply(`${e.Info} | Não tem nenhum ranking por enquanto.`)

            let rank = ClansArray.slice(0, 10).sort((a, b) => b.donation - a.donation).map((clan, i) => ` \n> ${Medals(i)} **${clan.name}** - \`${clan.key}\`\n> ${clan.donation} ${Moeda(message)}\n`).join('\n'),
                MyClanRank = ClansArray.findIndex(clans => clans.name === AtualClan) + 1 || 'N/A'

            return message.reply(
                {
                    embeds: [
                        new MessageEmbed()
                            .setColor(Colors(message.member))
                            .setTitle(`👑 Top 10 Clans`)
                            .setDescription(`O clan é baseado nas doações\n \n${rank}`)
                            .setFooter(`Meu Clan: ${MyClanRank}`)
                    ]
                }
            )

        }

        function NoArgs() {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#246FE0')
                        .setTitle(`🏆 | ${client.user.username} Global Ranking System`)
                        .setDescription('Aqui você pode ver os top 10 em cada classe')
                        .addField(`${e.MoneyWings} Ranking Money`, `\`${prefix}rank money [Local]\`\n\`${prefix}rank carteira [Local]\`\n\`${prefix}rank invertido [Local]\``)
                        .addField(`${e.RedStar} Ranking Experiência`, '`' + prefix + 'rank xp [Local]`')
                        .addField(`${e.Like} Ranking Reputação`, '`' + prefix + 'rank likes [Local]`')
                        .addField('🛡️ Ranking Clans', `\`${prefix}rank clan\``)
                        .addField('🔍 In Locale Search', `\`${prefix}rank <classe> [posição/@user/id]\` ou \`${prefix}rank <classe> [me]\``)
                        .setFooter('[] - Argumento opcional')
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
                DeleteUser(UserId)
                return `${e.Deny} Usuário deletado`
            }

            return user

        }

        function Ocult(UserId) {
            const Author = message.author.id === UserId,
                Owner = message.author.id === config.ownerId,
                Ocult = sdb.get(`Users.${UserId}.Perfil.BankOcult`)

            if (Ocult && Author) return false
            if (Ocult && Owner) return false
            if (Ocult) return true
            return false
        }

    }
}