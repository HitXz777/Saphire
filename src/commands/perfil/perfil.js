const
    { DatabaseObj: { e, config } } = require('../../../modules/functions/plugins/database'),
    Moeda = require('../../../modules/functions/public/moeda'),
    Colors = require('../../../modules/functions/plugins/colors'),
    Vip = require('../../../modules/functions/public/vip')

module.exports = {
    name: 'perfil',
    aliases: ['profile', 'p'],
    category: 'perfil',
    emoji: '👤',
    usage: '<perfil> [@user]',
    description: 'Veja o perfil, seu ou o de alguém',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (['refresh', 'reboot', 'restart', 'r', 'att'].includes(args[0]?.toLowerCase())) return refreshProfile()

        let user = message.mentions.users.first() || message.mentions.repliedUser || client.users.cache.find(data => data.username?.toLowerCase() === args.join(' ')?.toLowerCase() || data.tag?.toLowerCase() === args[0]?.toLowerCase() || data.discriminator === args[0] || data.id === args[0]) || message.author,
            data = await Database.User.findOne({ id: user.id }),
            N = Database.Names

        if (user.id === client.user.id)
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setDescription(`${e.VipStar} **Perfil Pessoal de ${client.user.username}**\n${e.SaphireTimida} **Envergonhada**\n🎃 **Halloween 2021**\n${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}`)
                        .setColor('#246FE0')
                        .addFields(
                            {
                                name: `👤 Pessoal`,
                                value: `🔰 Princesa do Discord\n${e.Deny} Não tenho signo\n:tada: 29/4/2021\n${e.CatJump} Gatinha\n👷 Bot no Discord`
                            },
                            {
                                name: '💍 Cônjuge',
                                value: `💍 Itachi Uchiha`
                            },
                            {
                                name: '❤️ Família',
                                value: `${client.users.cache.get(N.Rody)?.tag || 'Indefnido'}`
                            },
                            {
                                name: '🤝 Parças',
                                value: 'Galera do Discord'
                            },
                            {
                                name: '🌐 Global',
                                value: `∞ ${await Moeda(message)}\n∞ ${e.RedStar} Level\n∞ ${e.Like} Likes`,
                            },
                            {
                                name: '📝 Status',
                                value: 'Um dia eu quero ir a lua'
                            },
                            {
                                name: '🛡️ Clan',
                                value: 'Saphire\'s Team Official'
                            }
                        )
                        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                ]
            })

        if (user.bot) return message.reply(`${e.Deny} | Bots não possuem perfil.`)

        if (!data) return message.reply(`${e.Database} | DATABASE | Nenhum dado encontrado.${message.author.id === user.id ? ' Tenta novamente, por favor.' : ''}`)

        let color = await Colors(user.id),
            Embed = new MessageEmbed().setColor(color),
            msg = await message.reply({ embeds: [Embed.setDescription(`${e.Loading} | Construindo perfil...`)] }),
            clientData = await Database.Client.findOne({ id: client.user.id }, 'Administradores Moderadores Titles TopGlobal'),
            money = data.Perfil.BalanceOcult && (message.author.id !== user.id || message.author.id !== config.ownerId)
                ? '||Oculto||'
                : data.Balance?.toFixed(0) || 0,
            marry = data?.Perfil.Marry?.Conjugate
                ? (() => {
                    let u = client.users.cache.get(data.Perfil.Marry.Conjugate)?.tag
                    if (!u) {
                        Database.delete(message.author.id, 'Perfil.Marry')
                        Database.deleteUser(data.Marry?.Conjugate, 'Perfil.Marry')
                        message.channel.send(`${e.Database} | DATABASE | Eu não achei o usuário setado como seu cônjuge. Efetuei a separação.`)
                        return `${e.Deny} Usuário deletado`
                    }

                    let time = data?.Perfil.Marry?.StartAt
                    return `${u} | \`${client.formatTimestamp(time)}\``
                })()
                : "Solteiro(a)",
            level = data?.Level || 0,
            likes = data?.Likes || 0,
            vip = await Vip(`${user.id}`) ? `${e.VipStar}` : '📃',
            estrela = 'Indefinido',
            Administrador = clientData.Administradores?.includes(user.id)
                ? `\n${e.Admin} **Official Administrator**`
                : '',
            Moderator = clientData.Moderadores?.includes(user.id)
                ? `\n${e.ModShield} **Official Moderator**`
                : '',
            Developer = clientData.Titles?.Developer?.includes(user.id)
                ? `\n${e.OwnerCrow} **Official Developer**`
                : '',
            BugHunter = clientData.Titles?.BugHunter?.includes(user.id)
                ? `\n${e.Gear} **Bug Hunter**`
                : '',
            OfficialDesigner = clientData.Titles?.OfficialDesigner?.includes(user.id)
                ? `\n${e.SaphireFeliz} **Designer Official**`
                : '',
            HalloweenTitle = clientData.Titles?.Halloween?.includes(user.id)
                ? `\n🎃 **Halloween 2021**`
                : '',
            Titulo = data.Perfil?.Titulo || `Sem título definido \`${prefix}title\``,
            titulo = data.Perfil?.TitlePerm
                ? `🔰 ${Titulo}`
                : `${e.Deny} Não possui título`,
            Estrela = {
                Um: data.Perfil.Estrela?.Um,
                Dois: data.Perfil.Estrela?.Dois,
                Tres: data.Perfil.Estrela?.Tres,
                Quatro: data.Perfil.Estrela?.Quatro,
                Cinco: data.Perfil.Estrela?.Cinco,
                Seis: data.Perfil.Estrela?.Seis,
            },
            parcaData = data?.Perfil?.Parcas || [],
            familyData = data?.Perfil?.Family,
            status = data?.Perfil?.Status || `${user.username} não conhece o comando \`${prefix}setstatus\``,
            signo = data?.Perfil?.Signo
                ? `⠀\n${data?.Perfil?.Signo}`
                : `⠀\n${e.Deny} Sem signo definido \`${prefix}signo\``,
            sexo = data?.Perfil?.Sexo
                ? `⠀\n${data?.Perfil?.Sexo}`
                : `⠀\n${e.Deny} Sem gênero definido \`${prefix}sexo\``,
            niver = data?.Perfil?.Aniversario ? `⠀\n🎉 ${data?.Perfil?.Aniversario}` : `⠀\n${e.Deny} Sem aniversário definido \`${prefix}niver\``,
            job = data?.Perfil?.Trabalho ? `⠀\n👷 ${data?.Perfil?.Trabalho}` : `⠀\n${e.Deny} Sem profissão definida \`${prefix}job\``,
            Clan = data?.Clan || 'Não possui',
            TopGlobalLevel = clientData.TopGlobal?.Level === user.id ? `\n${e.RedStar} **Top Global Level**` : '',
            TopGlobalLikes = clientData.TopGlobal?.Likes === user.id ? `\n${e.Like} **Top Global Likes**` : '',
            TopGlobalMoney = clientData.TopGlobal?.Money === user.id ? `\n${e.MoneyWings} **Top Global Money**` : '',
            TopGlobalQuiz = clientData.TopGlobal?.Quiz === user.id ? `\n🧠 **Top Global Quiz**` : '',
            TopGlobalMix = clientData.TopGlobal?.Mix === user.id ? `\n🔡 **Top Global Mix**` : '',
            TopGlobalJokempo = clientData.TopGlobal?.Jokempo === user.id ? `\n✂️ **Top Global Jokempo**` : '',
            TopGlobalTicTacToe = clientData.TopGlobal?.TicTacToe === user.id ? `\n#️⃣ **Top Global TicTacToe**` : '',
            TopGlobalMemory = clientData.TopGlobal?.Memory === user.id ? `\n${e.duvida || '❔'} **Top Global Memory**` : '',
            TopGlobalForca = clientData.TopGlobal?.Forca === user.id ? `\n😵 **Top Global Forca**` : '',
            TopGlobalFlag = clientData.TopGlobal?.Flag === user.id ? `\n🎌 **Top Global Flag Gaming**` : ''

        if (Estrela.Um) estrela = `${e.Star}${e.GrayStar}${e.GrayStar}${e.GrayStar}${e.GrayStar}`
        if (Estrela.Dois) estrela = `${e.Star}${e.Star}${e.GrayStar}${e.GrayStar}${e.GrayStar}`
        if (Estrela.Tres) estrela = `${e.Star}${e.Star}${e.Star}${e.GrayStar}${e.GrayStar}`
        if (Estrela.Quatro) estrela = `${e.Star}${e.Star}${e.Star}${e.Star}${e.GrayStar}`
        if (Estrela.Cinco) estrela = `${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}`
        if (Estrela.Seis) estrela = `${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}`
        if (!Estrela.Um && !Estrela.Dois && !Estrela.Tres && !Estrela.Quatro && !Estrela.Cinco && !Estrela.Seis) estrela = `${e.GrayStar}${e.GrayStar}${e.GrayStar}${e.GrayStar}${e.GrayStar}`

        let parcas = parcaData.map(id => {

            if (!id) return 'Nenhum parça'

            let u = client.users.cache.get(id)
            if (!u) {
                Database.pullUserData(message.author.id, 'Perfil.Parcas', id)
                return `${e.Deny} Usuário deletado`
            }
            return u.tag.replace(/`/g, '')
        }).join('\n') || 'Nenhum parça'

        let family = familyData.map(id => {

            if (!id) return 'Nenhum membro na família'

            let u = client.users.cache.get(id)
            if (!u) {
                Database.pullUserData(message.author.id, 'Perfil.Family', id)
                return `${e.Deny} Usuário deletado`
            }
            return u.tag.replace(/`/g, '')
        }).join('\n') || 'Nenhum membro na família'

        Embed
            .setDescription(`${vip} **Perfil de ${user.username}**${Developer}${Administrador}${Moderator}${OfficialDesigner}${HalloweenTitle}${BugHunter}${TopGlobalLevel}${TopGlobalLikes}${TopGlobalMoney}${TopGlobalMix}${TopGlobalJokempo}${TopGlobalQuiz}${TopGlobalTicTacToe}${TopGlobalMemory}${TopGlobalForca}${TopGlobalFlag}\n${estrela}`)
            .addFields(
                {
                    name: '👤 Pessoal',
                    value: `${titulo}${signo}${niver}${sexo}${job}`
                },
                {
                    name: '💍 Cônjuge',
                    value: `${marry}`
                },
                {
                    name: '❤️ Família',
                    value: `${family}`
                },
                {
                    name: '🤝 Parças',
                    value: `${parcas}`
                },
                {
                    name: '🌐 Global',
                    value: `${money} ${await Moeda(message)}\n${level} ${e.RedStar} Level\n${likes} ${e.Like} Likes`,
                },
                {
                    name: '📝 Status',
                    value: `${status}`
                },
                {
                    name: '🛡️ Clan',
                    value: `${Clan}`
                }
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))

        let warnData = await Database.Guild.findOne({ id: message.guild.id }, 'Warns.Users'),
            warnsFormat = warnData?.Warns?.Users || {},
            warns = Object.values(warnsFormat[`${user.id}`] || {})

        warns.length > 0 ? Embed.setFooter({ text: `${warns.length} avisos neste servidor` }) : 0
        // Ideia de warns no perfil de: joãozinho#0001

        let buttons = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'LIKE',
                        emoji: '💙',
                        custom_id: 'likeProfile',
                        style: 'PRIMARY'
                    }
                ]
            }
        ]

        if (message.author.id === user.id)
            buttons[0].components.push({
                type: 2,
                label: 'EDITAR PERFIL',
                emoji: '📝',
                custom_id: 'editProfile',
                style: 'SUCCESS'
            })

        msg.edit({
            content: `${e.Info} Algo errado no Família ou Parças? Use \`${prefix}perfil refresh\``,
            embeds: [Embed],
            components: buttons
        }).catch(() => { })

        return reactionsButtons()

        async function reactionsButtons() {

            if (user.id === message.author.id)
                msg.createMessageComponentCollector({
                    filter: int => int.user.id === message.author.id && int.customId === 'editProfile',
                    time: 60000,
                    errors: ['time']
                })
                    .on('collect', () => { })

            msg.createMessageComponentCollector({
                filter: int => int.customId === 'likeProfile',
                time: 60000,
                errors: ['time']
            })
                .on('collect', interaction => {
                    interaction.deferUpdate().catch(() => { })
                    const { customId, user } = interaction

                    if (customId === 'likeProfile') return NewLike(user)

                })
                .on('end', () => msg.edit({
                    content: null,
                    embeds: [Embed],
                    components: []
                }).catch(() => { }))

            async function NewLike(Author) {
                if (user.id === client.user.id) return message.channel.send(`${Author}, olha... Eu agradeço... Mas você já viu meu \`${prefix}perfil @${client.user.username}\`?`)
                if (Author.id === user.id || user.bot) return

                let authorData = await Database.User.findOne({ id: Author.id }, 'Timeouts.Rep'),
                    userData = await Database.User.findOne({ id: user.id })

                if (!userData) {

                    let u = client.users.cache.get(Author.id)

                    if (!u)
                        return message.reply(`${e.Deny} | Usuário desconhecido.`)

                    Database.registerUser(u)
                    return message.reply(`${e.Deny} | <@${Author.id}>, tenta de novo por favor...`)
                }

                if (client.Timeout(1800000, authorData?.Timeouts?.Rep))
                    return message.channel.send(`${e.Nagatoro} | ${Author}, calminha aí Princesa! \`${client.GetTimeout(1800000, authorData.Timeouts.Rep)}\``)

                Database.addItem(user.id, 'Likes', 1)
                Database.SetTimeout(Author.id, 'Timeouts.Rep')

                return message.channel.send(`${e.Check} | ${Author} deu um like para ${user.tag}.`)
            }
        }

        async function refreshProfile() {

            let data = await Database.User.find({}, 'id Perfil.Parcas Perfil.Family'),
                authorData = data.find(d => d.id === message.author.id),
                parcas = authorData?.Perfil?.Parcas || [],
                family = authorData?.Perfil?.Family || []

            if (parcas.length > 0)
                for (const id of parcas) {
                    let userData = data.find(d => d.id === id)

                    if (userData?.Perfil?.Parcas?.includes(message.author.id)) continue

                    Database.pullUserData(message.author.id, 'Perfil.Parcas', id)
                    Database.pullUserData(id, 'Perfil.Parcas', message.author.id)
                }

            if (family.length > 0)
                for (const id of family) {
                    let userData = data.find(d => d.id === id)

                    if (userData?.Perfil?.Family?.includes(message.author.id)) continue

                    Database.pullUserData(message.author.id, 'Perfil.Family', id)
                    Database.pullUserData(id, 'Perfil.Family', message.author.id)
                }

            return message.reply(`${e.Check} | Perfil atualizado com sucesso!`)

        }

    }
}