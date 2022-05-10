const
    { DatabaseObj: { e, config } } = require('../../../modules/functions/plugins/database'),
    simply = require('simply-djs'),
    Error = require('../../../modules/functions/config/errors'),
    ms = require("parse-ms")

module.exports = {
    name: 'level',
    aliases: ['xp', 'nivel', 'lvl', 'l'],
    category: 'level',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: `${e.Star}`,
    usage: '<level> [info]',
    description: 'Confira seu nível ou o de alguém',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return LevelInfo()
        if (['acess', 'bgacess'].includes(args[0]?.toLowerCase())) return bgAcess()

        let user = message.mentions.users.first() || message.mentions.repliedUser || client.users.cache.find(data => data.username?.toLowerCase() === args.join(' ')?.toLowerCase() || data.tag?.toLowerCase() === args[0]?.toLowerCase() || data.discriminator === args[0] || data.id === args[0]) || message.author,
            userData = await Database.User.findOne({ id: user.id }, 'Walls Timeouts Level Xp'),
            BgLevel = Database.BgLevel

        if (!userData) return message.reply(`${e.Database} | DATABASE | O usuário **${user?.tag || 'Indefinido'}** *\`${user?.id || '0'}\`* não foi encontrado.`)

        if (user.bot) return message.reply(`${e.Deny} | Bots não possuem experiência.`)

        let level = userData.Level || 0,
            exp = userData.Xp || 0,
            xpNeeded = level * 275,
            usersAllData = await Database.User.find({}, 'id Xp Level'),
            rank = (() => {

                let UsersArray = []

                return usersAllData.length > 0
                    ? (() => {

                        for (const data of usersAllData) {
                            let Exp = data.Xp || 0,
                                Level = data.Level || 0

                            if (Exp > 0)
                                UsersArray.push({ id: data.id, level: Level })
                        }

                        if (!UsersArray.length) return 0

                        return UsersArray
                            .sort((a, b) => b.level - a.level)
                            .findIndex(author => author.id === user.id) + 1 || 0

                    })()
                    : 0

            })(),
            LevelWallpapers = BgLevel.get('LevelWallpapers'),
            TimeDB = userData.Timeouts?.LevelImage || 0,
            Timing = ms(5000 - (Date.now() - TimeDB))

        if (client.Timeout(5000, TimeDB))
            return message.reply(`⏱️ | Calminha coisa linda! \`${Timing.seconds}s\``)

        if (['set', 'wall', 'wallpaper', 'fundo', 'bg', 'background', 'capa'].includes(args[0]?.toLowerCase())) return setNewWallpaper()
        if (['reset', 'excluir', 'off', 'tirar', 'delete', 'del', 'bg0'].includes(args[0]?.toLowerCase())) resetWallpaper()
        if (!args[0] || user) return SendLevel()

        return message.reply(`${e.Deny} | Não sabe usar o level? Use \`${prefix}level info\``)

        async function resetWallpaper() {
            if (!userData.Walls?.Set)
                return message.reply(`${e.Info} | Seu background já é o padrão.`)

            Database.delete(message.author.id, 'Walls.Set')
            return message.reply(`${e.Check} | Background removido com sucesso!`)
        }

        async function setNewWallpaper() {

            let Cooldown = userData.Timeouts?.LevelTrade || 0,
                Time = ms(180000 - (Date.now() - Cooldown)),
                wallSetted = userData.Walls?.Set,
                Client = await Database.Client.findOne({ id: client.user.id }, 'BackgroundAcess') || [],
                minutos = Time.minutes > 0 ? `${Time.minutes} minutos e` : '',
                option = args[1]?.toLowerCase()

            if (client.Timeout(180000, Cooldown))
                return message.reply(`⏱️ | Espere mais **${minutos} ${Time.seconds} segundos** para trocar de wallpaper`)

            if (!option)
                return message.reply(`${e.Info} | Selecione o background dizendo o **código** dele. Você pode ver seus backgrounds usando \`${prefix}slot bg\``)

            if (!Object.keys(LevelWallpapers || {}).includes(option))
                return message.reply(`${e.Deny} | Esse background não existe.`)

            if (option === 'bg0') {
                if (!wallSetted)
                    return message.reply(`${e.Info} | Este fundo já é o seu atual.`)

                Database.delete(message.author.id, 'Walls.Set')
                return SendLevel()
            }

            if (wallSetted === BgLevel.get(`LevelWallpapers.${option}`))
                return message.reply(`${e.Info} | Este fundo já é o seu atual.`)

            if (!Client.BackgroundAcess?.includes(message.author.id) && !userData.Walls?.Bg?.includes(option))
                return message.reply(`${e.Deny} | Você não tem esse background. Que tal comprar ele usando \`${prefix}buy bg ${option}\`?`)

            Database.updateUserData(message.author.id, 'Walls.Set', BgLevel.get(`LevelWallpapers.${option}.Image`))
            Database.updateUserData(message.author.id, 'Timeouts.LevelTrade', Date.now())
            return SendLevel()

        }

        async function SendLevel() {
            const msg = await message.reply(`${e.Loading} | Carregando...`)

            let reData = await Database.User.findOne({ id: user.id }, 'Walls.Set')

            try {
                Database.updateUserData(message.author.id, 'Timeouts.LevelImage', Date.now())

                await simply.rankCard(client, message, {
                    member: user, // String
                    level: level || 0, // Number
                    currentXP: exp || 0, // Number
                    neededXP: xpNeeded || 0, // Number
                    rank: rank || 0, // Number
                    slash: false, // It isn't a slash command
                    background: reData.Walls?.Set || LevelWallpapers?.bg0?.Image || null // Image URL from Discord Chats || It's work perfectly
                }).then(() => { msg.delete().catch(() => { }) }).catch(err => { })

                return

            } catch (err) { return Error(message, err) }
        }

        function LevelInfo() {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`${e.RedStar} Sistema de Level Personalizado`)
                        .setDescription('Você pode mudar o fundo do seu level.')
                        .addFields(
                            {
                                name: `${e.MoneyWings} Compre backgrounds`,
                                value: `\`${prefix}loja | ${prefix}buy bg <bgCode>\``
                            },
                            {
                                name: `${e.Gear} Configure seu backgrounds`,
                                value: `\`${prefix}level set <bgCode>\`\nAtalhos: \`wall, wallpaper, fundo, bg, background, capa\``
                            },
                            {
                                name: `${e.Deny} Delete o fundo`,
                                value: `\`${prefix}level off\` - Fundo Padrão: bg0\nAtalhos: \`reset, excluir, tirar, delete, del, bg0\``
                            },
                            {
                                name: `${e.BongoScript} Códigos de Fundo`,
                                value: `Cada fundo possui um código único no qual é usado para configura-lo. O padrão é \`bg0\`. Você pode ver os códigos das capas usando \`${prefix}lvlwall [bgCode]\` ou acessando o [servidor package](${config.PackageInvite}) onde todos os fundos estão guardados.`
                            }
                        )
                ]
            })
        }

        async function bgAcess() {

            let clientData = await Database.Client.findOne({ id: client.user.id }, 'Moderadores BackgroundAcess'),
                adms = clientData.Moderadores || []

            if (!adms.includes(message.author.id)) return message.reply(`${e.Admin} | Comando exclusivo aos Administradores do Sistema de Level.`)

            let bgacess = clientData.BackgroundAcess

            if (!bgacess || bgacess.length === 0) return message.reply(`${e.Info} | Não há ninguém na lista de acesso livro aos wallpapers`)

            let format = bgacess.map(data => `${client.users.cache.get(data)?.tag} - \`${data}\``).join('\n')

            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`${e.ModShield} Background Free Acess`)
                        .setDescription(`${format}`)
                ]
            })

        }

    }
}