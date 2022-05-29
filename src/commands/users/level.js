const
    { DatabaseObj: { e, config } } = require('../../../modules/functions/plugins/database'),
    simply = require('simply-djs'),
    Error = require('../../../modules/functions/config/errors')

module.exports = {
    name: 'level',
    aliases: ['xp', 'nivel', 'lvl', 'l'],
    category: 'level',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: `${e.Star}`,
    cooldown: 5000,
    usage: '<level> [info]',
    description: 'Confira seu nível ou o de alguém',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return LevelInfo()
        if (['acess', 'bgacess'].includes(args[0]?.toLowerCase())) return bgAcess()

        let user = message.mentions.users.first() || message.mentions.repliedUser || client.users.cache.find(data => data.username?.toLowerCase() === args.join(' ')?.toLowerCase() || data.tag?.toLowerCase() === args[0]?.toLowerCase() || data.discriminator === args[0] || data.id === args[0]) || message.author,
            userData = await Database.User.findOne({ id: user.id }, 'Walls Level Xp'),
            { BgLevel } = Database, data = {}

        if (!userData) return message.reply(`${e.Database} | DATABASE | O usuário **${user?.tag || 'Indefinido'}** *\`${user?.id || '0'}\`* não foi encontrado.`)

        if (user.bot) return message.reply(`${e.Deny} | Bots não possuem experiência.`)

        let LevelWallpapers = BgLevel.get('LevelWallpapers')

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

            let wallSetted = userData.Walls?.Set,
                Client = await Database.Client.findOne({ id: client.user.id }, 'BackgroundAcess') || [],
                option = args[1]?.toLowerCase()

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
            return SendLevel()

        }

        async function SendLevel() {
            const msg = await message.reply(`${e.Loading} | Carregando...`)

            await build()

            let reData = await Database.User.findOne({ id: user.id }, 'Walls.Set')

            try {
                await simply.rankCard(client, message, {
                    member: user, // String
                    level: data.level || 0, // Number
                    currentXP: data.exp || 0, // Number
                    neededXP: data.xpNeeded || 0, // Number
                    rank: data.rank || 0, // Number
                    slash: false, // Boolean
                    background: reData.Walls?.Set || LevelWallpapers?.bg0?.Image || null // String
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

        async function build() {
            data.level = userData.Level || 0
            data.exp = userData.Xp || 0
            data.xpNeeded = parseInt((userData.Level || 0) * 275)
            let usersAllData = await Database.User.find({}, 'id Level')

            if (!usersAllData || usersAllData.length === 0) {
                data.rank = 0
                return
            }

            let UsersArray = []

            usersAllData.map(data => UsersArray.push({ id: data.id || 0, level: data.Level || 0 }))

            if (!UsersArray.length) return 0

            data.rank = UsersArray
                .sort((a, b) => b.level - a.level)
                .findIndex(author => author.id === user.id) + 1 || 0
            return
        }

    }
}