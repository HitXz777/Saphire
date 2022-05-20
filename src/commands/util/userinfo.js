const { e } = require('../../../JSON/emojis.json'),
    Data = require('../../../modules/functions/plugins/data'),
    { config } = require('../../../JSON/config.json'),
    Colors = require('../../../modules/functions/plugins/colors')

module.exports = {
    name: 'userinfo',
    aliases: ['ui', 'search', 'localize'],
    category: 'util',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: `${e.Info}`,
    usage: '<userinfo> [@user]',
    description: 'Informações de usuários no Discord',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.users.first() || client.users.cache.find(data => data.username?.toLowerCase() === args.join(' ')?.toLowerCase() || data.tag?.toLowerCase() === args[0]?.toLowerCase() || data.discriminator === args[0] || data.id === args[0]) || message.author

        if (['encontrar', 'find', 'localizar', 'search', 'procurar', 'p', 's', 'localize'].includes(args[0]?.toLowerCase())) return searchUser()
        if (['info', 'ajuda', 'help'].includes(args[0]?.toLowerCase())) return userInfoHelp()

        if (args[0] && user.id === message.author.id)
            return message.reply(`${e.Deny} | Eu não achei ninguém em nenhum lugar... Que tal tentar usar o comando \`${prefix}userinfo help\` e testar o comando de busca?`)

        return userInfo(user)

        async function searchUser() {

            let where = args[1],
                info = args.slice(2).join(' ')

            if (!where)
                return message.reply(`${e.Info} | Você pode pesquisar usuários usando paramêtros de busca. Exemplo: \`${prefix}ui search id <idDoUsuário>\`\n> Paramêtros de busca: \`id, username, tag (Nome#0000), discriminator (os 4 números após a #)\`\n> Caso tenha mais de 1 resultado, te direi o ID de cada um para você usar o comando \`${prefix}ui <ID>\``)

            if (!['id', 'username', 'name', 'tag', 'discriminator'].includes(where?.toLowerCase()))
                return message.reply(`${e.Info} | Paramêtros disponíveis: ${['id', 'username', 'name', 'tag', 'discriminator'].map(data => `\`${data}\``).join(', ')}`)

            if (!info)
                return message.reply(`${e.Deny} | Por favor, forneça algo para eu buscar`)

            if (where === 'id') return searchById()
            if (['username', 'name'].includes(where)) return searchByUsername()
            if (where === 'tag') return searchByTag()
            if (['discriminator'].includes(where)) return searchByDiscriminator()

            function searchById() {
                let u = client.users.cache.get(info)

                if (!u) return message.reply(`${e.Deny} | Nenhum resultado obtido.`)
                return userInfo(u)
            }

            async function searchByUsername() {

                let u = client.users.cache.filter(data => data.username.toLowerCase().includes(info?.toLowerCase()))

                if (!u || u.size === 0)
                    return message.reply(`${e.Deny} | Não achei ninguém com esse nome.`)

                let embeds = EmbedGenerator(u),
                    emojis = ['⬅️', '➡️'],
                    control = 0,
                    msg = await message.reply({ embeds: [embeds[0]] })

                if (embeds.length > 1) {

                    for (let i of emojis) msg.react(i).catch(() => { })

                    const collector = msg.createReactionCollector({
                        filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                        idle: 30000,
                        errors: ['idle']
                    })

                    collector.on('collect', (reaction) => {

                        if (reaction.emoji.name === emojis[0]) {
                            control--
                            return embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control++
                        }

                        if (reaction.emoji.name === emojis[1]) {
                            control++
                            return embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control--
                        }

                        return
                    })

                    collector.on('end', () => msg.reactions.removeAll().catch(() => { }))
                }

                return
            }

            async function searchByTag() {

                let u = client.users.cache.filter(data => data.tag.toLowerCase() === info.toLowerCase())

                if (!u || u.size === 0)
                    return message.reply(`${e.Deny} | Não achei ninguém com essa tag.`)

                let embeds = EmbedGenerator(u),
                    emojis = ['⬅️', '➡️'],
                    control = 0,
                    msg = await message.reply({ embeds: [embeds[0]] })

                if (embeds.length > 1) {

                    for (let i of emojis) msg.react(i).catch(() => { })

                    const collector = msg.createReactionCollector({
                        filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                        idle: 30000,
                        errors: ['idle']
                    })

                    collector.on('collect', (reaction) => {

                        if (reaction.emoji.name === emojis[0]) {
                            control--
                            return embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control++
                        }

                        if (reaction.emoji.name === emojis[1]) {
                            control++
                            return embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control--
                        }

                        return
                    })

                    collector.on('end', () => msg.reactions.removeAll().catch(() => { }))
                }

                return
            }

            async function searchByDiscriminator() {

                let discriminator = args[2]
                if (!discriminator || isNaN(discriminator) || discriminator.length !== 4)
                    return message.reply(`${e.Deny} | Informe um discriminator válido. Elas são compostas por 4 números.`)

                let u = client.users.cache.filter(data => data.discriminator === discriminator)

                if (!u || u.size === 0)
                    return message.reply(`${e.Deny} | Não achei ninguém com esse discriminator.`)

                let embeds = EmbedGenerator(u),
                    emojis = ['⬅️', '➡️'],
                    control = 0,
                    msg = await message.reply({ embeds: [embeds[0]] })

                if (embeds.length > 1) {

                    for (let i of emojis) msg.react(i).catch(() => { })

                    const collector = msg.createReactionCollector({
                        filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                        idle: 30000,
                        errors: ['idle']
                    })

                    collector.on('collect', (reaction) => {

                        if (reaction.emoji.name === emojis[0]) {
                            control--
                            return embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control++
                        }

                        if (reaction.emoji.name === emojis[1]) {
                            control++
                            return embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control--
                        }

                        return
                    })

                    collector.on('end', () => msg.reactions.removeAll().catch(() => { }))
                }

                return
            }
        }

        async function userInfo(user) {

            let member = message.guild.members.cache.get(user.id),
                userData = {},
                memberData = {},
                flags = {
                    DISCORD_EMPLOYEE: 'Empregado do Discord',
                    DISCORD_PARTNER: 'Parceiro do Discord',
                    HYPESQUAD_EVENTS: 'HypeSquad Events',
                    HOUSE_BRAVERY: 'House of Bravery',
                    HOUSE_BRILLIANCE: 'House of Brilliance',
                    HOUSE_BALANCE: 'House of Balance',
                    EARLY_SUPPORTER: 'Apoiador inicial',
                    TEAM_USER: 'Usuário de Time',
                    SYSTEM: 'Sistema',
                    VERIFIED_BOT: 'Bot Verificado',
                    VERIFIED_DEVELOPER: 'Verified Bot Developer',
                    BOT_HTTP_INTERACTIONS: 'Bot de Interação HTTP'
                }

            let userflags = user?.flags?.toArray() || []
            userData.Bandeiras = `${userflags.length > 0 ? userflags.map(flag => `\`${flags[flag] ? flags[flag] : flag}\``).join(', ') : 'Nenhuma'}`
            userData.system = user.system ? '\n🧑‍💼 `\`Usuário do Sistema\``' : ''
            userData.avatar = user.avatarURL({ dynamic: true, format: "png", size: 1024 })
            userData.bot = user.bot ? '\`Sim\`' : '\`Não\`'
            userData.createAccount = Data(user.createdAt.getTime(), false, false)
            userData.timeoutAccount = client.formatTimestamp(user.createdAt.getTime())

            if (member) {
                memberData.joinedAt = Data(member.joinedAt.getTime(), false, false)
                memberData.joinedTimestamp = client.formatTimestamp(member.joinedAt.getTime())
                memberData.onwer = (message.guild.ownerId === user.id) ? '\`Sim\`' : '\`Não\`'
                memberData.adm = member.permissions.toArray().includes('ADMINISTRATOR') ? '\`Sim\`' : '\`Não\`'
                memberData.associado = member.pending ? '\`Não\`' : '\`Sim\`'
                memberData.premiumSince = member.premiumSinceTimestamp ? `\n<a:boost:937713593187704903> Booster há: \`${client.formatTimestamp(member.premiumSinceTimestamp)}\`` : ''
                memberData.roles = member.roles.cache.filter(r => r.name !== '@everyone').map(r => `\`${r.name}\``).join(', ') || '\`Nenhum cargo\`'
                memberData.permissions = (() => {

                    if (user.id === message.guild.ownerId) return `${user.username} é o dono*(a)* do servidor. Possui todas as permissões.`

                    return member.permissions.toArray().map(perm => `\`${config.Perms[perm]}\``).join(', ')
                })()
            }

            let Emojis = ['⬅️', '➡️'],
                Control = 0,
                colorData = member ? await Colors(user.id) : client.blue,
                whoIs = user.id === message.author.id ? 'Suas Informações' : `Informações de ${user.username}`

            let embedOne = new MessageEmbed()
                .setTitle(`${e.Info} ${whoIs}`)
                .setColor(client.blue)
                .setDescription(`Resultado: ${member ? user : user.username}`)
                .addField('👤 Usuário', `✏️ Nome: ${user.tag} | \`${user.id}\`\n🤖 Bot: ${userData.bot}\n🏳️ Bandeiras: ${userData.Bandeiras}${userData.system}\n📆 Criou a conta em: \`${userData.createAccount}\`\n⏱️ Criou a conta faz: \`${userData.timeoutAccount}\``)
                .setThumbnail(userData.avatar)

            let embedTwo = new MessageEmbed()
                .setTitle(`${e.Info} ${message.guild.name} | ${whoIs}`)
                .setColor(colorData)
                .addField('🔰 Servidor', `✏️ Nome no servidor: ${member?.displayName}\n${e.OwnerCrow} Dono: ${memberData?.onwer}\n${e.ModShield} Administrador: ${memberData?.adm}\n🎨 Cor: \`${member?.displayHexColor}\`\n🤝 Associado: ${memberData?.associado}${memberData?.premiumSince}\n📅 Entrou em: \`${memberData?.joinedAt}\`\n⏱️ Entrou no servidor faz: \`${memberData?.joinedTimestamp}\``)
                .addField('@ Cargos', `${memberData?.roles}`)

            let embedThree = new MessageEmbed()
                .setTitle(`${e.Info} ${whoIs}`)
                .setColor(colorData)
                .addField('⚙️ Permissões', `${memberData?.permissions}`)

            const msg = await message.reply({ embeds: [embedOne] })

            if (member) {

                for (let i of Emojis) msg.react(i).catch(() => { })

                const collector = msg.createReactionCollector({
                    filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                    idle: 30000,
                    errors: ['idle']
                }),
                    embedArray = [embedOne, embedTwo, embedThree]

                collector.on('collect', (reaction) => {

                    if (reaction.emoji.name === Emojis[0]) {
                        if (Control === 0) return
                        Control--
                        return msg.edit({ embeds: [embedArray[Control]] })
                    }

                    if (reaction.emoji.name === Emojis[1]) {
                        if (Control === 2) return
                        Control++
                        return msg.edit({ embeds: [embedArray[Control]] })
                    }
                    return
                })

                collector.on('end', () => msg.reactions.removeAll().catch(() => { }))
            }


            return like()

            async function like() {

                msg.react('💙').catch(() => { })

                return msg.createReactionCollector({
                    filter: (reaction, u) => reaction.emoji.name === '💙' && !u.bot,
                    time: 30000
                })

                    .on('collect', (reaction, u) => NewLike(u))

                async function NewLike(Author) {
                    if (user.id === client.user.id) return message.channel.send(`${Author}, olha... Eu agradeço... Mas você já viu meu \`${prefix}perfil @${client.user.username}\`?`)
                    if (Author.id === user.id || user.bot) return

                    let authorData = await Database.User.findOne({ id: Author.id }, 'Timeouts.Rep'),
                        userData = await Database.User.findOne({ id: user.id })

                    if (!userData) {

                        let u = client.users.cache.get(user.id)

                        if (!u)
                            return message.reply(`${e.Deny} | Usuário desconhecido.`)

                        Database.registerUser(u)
                        return message.reply(`${e.Deny} | <@${Author.id}>, tenta de novo por favor...`)
                    }

                    if (client.Timeout(1800000, authorData.Timeouts.Rep))
                        return message.channel.send(`${e.Nagatoro} | ${Author}, calminha aí Princesa! \`${client.GetTimeout(1800000, authorData.Timeouts.Rep)}\``)

                    Database.addItem(user.id, 'Likes', 1)
                    Database.SetTimeout(Author.id, 'Timeouts.Rep')

                    return message.channel.send(`${e.Check} | ${Author} deu um like para ${user.tag}.`)
                }
            }
        }

        function userInfoHelp() {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`${e.Info} Informações do Userinfo`)
                        .setDescription('Como o nome do comando já diz, entregarei as informações do usuário.')
                        .addFields(
                            {
                                name: `${e.Gear} Comando`,
                                value: `\`${prefix}userinfo <Paramêtros>\``
                            },
                            {
                                name: `${e.Commands} Paramêtros`,
                                value: `\`ID, @Menção, Responder a mensagem de alguém, Nome da pessoa\``
                            },
                            {
                                name: '🔍 Sistema de Busca Avançada',
                                value: `Aqui eu pesquiso o que você quiser dentro de todos os servidores em que eu estou em busca do usuário.\n> Comando: \`${prefix}userinfo search <id/name/tag/discriminator>\``
                            },
                            {
                                name: `${e.Info} Adicionais`,
                                value: `Os paramêtros de busca são seletivos, então tome cuidado onde procura.\n> 1. ID: Cada usuário tem seu id. Veja usando o comando \`${prefix}id @user\`\n> 2. Name: **Name**#0000. Sem as #0000\n> 3. Tag: Tag é o nome completo do usuário - **Name#0000**\n> 4. Discriminator: O discriminator é apenas os 4 últimos números do nome - Name#**0000**\nTente uma pesquisa: \`${prefix}ui s name saphire\``
                            },
                            {
                                name: '✏️ Atalhos',
                                value: `${e.Gear} Comando: ${['userinfo', 'ui', 'search', 'localize'].map(a => `\`${a}\``).join(', ')}\n🔍 Busca: ${['encontrar', 'find', 'localizar', 'search', 'procurar', 'p', 's', 'localize'].map(a => `\`${a}\``).join(', ')}`
                            }
                        )
                        .setFooter({ text: 'Hiper Commands Saphire' })
                ]
            })
        }

        function EmbedGenerator(arrayData) {

            let amount = 10,
                Page = 1,
                embeds = [],
                array = []

            arrayData.forEach(a => array.push(a))
            let length = array.length / 10 <= 1 ? 1 : parseInt((array.length / 10) + 1)

            for (let i = 0; i < array.length; i += 10) {

                let current = array.slice(i, amount),
                    description = current.map(data => `> ${data.tag.replace(/`/g, '')} - \`${data.id}\``).join("\n") || 'Nenhum usuário encontrado',
                    PageCount = `${length > 1 ? `- ${Page}/${length}` : ''}`

                if (current.length > 0) {

                    embeds.push({
                        color: client.blue,
                        title: `🔍 Resultado da busca ${PageCount}`,
                        description: `${description || 'Nenhum usuário encontrado'}`,
                        footer: {
                            text: `${array.length} usuários encontrados | ${prefix}ui <id>`
                        },
                    })

                    Page++
                    amount += 10

                }

            }

            return embeds;
        }

    }
}