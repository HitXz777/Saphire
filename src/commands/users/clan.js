const
    { e } = require('../../../JSON/emojis.json'),
    Moeda = require('../../../modules/functions/public/moeda'),
    PassCode = require('../../../modules/functions/plugins/PassCode'),
    Vip = require('../../../modules/functions/public/vip'),
    Colors = require('../../../modules/functions/plugins/colors'),
    Data = require('../../../modules/functions/plugins/data')

module.exports = {
    name: 'clan',
    aliases: ['team', 'clã'],
    category: 'vip',
    emoji: '🛡️',
    usage: '<clan> <info>',
    description: 'Saphire\'s Clan System',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let
            Clans = await Database.Clan.find({}) || [],
            dataUser = await Database.User.findOne({ id: message.author.id }, 'Clan Balance'),
            AtualClan = dataUser.Clan,
            user = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || message.guild.members.cache.get(args[0]),
            keys = [],
            RequestControl,
            reg = /^[A-Za-z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ' ]+$/i,
            control = 0,
            moeda = await Moeda(message),
            emojis = ['✅', '❌'],
            optionsEmojis = ['◀️', '▶️', '❌']

        Clans.forEach(clan => keys.push(clan.id))

        let ClanData = Clans.find(clan => clan.Name === AtualClan),
            Admins = ClanData?.Admins || [],
            Owner = ClanData?.Owner === message.author.id,
            Admin = Owner || Admins?.includes(message.author.id),
            Members = ClanData?.Members || [],
            Argument = args[0],
            key = ClanData?.id

        if (!args[1] && user) {

            let userData = await Database.User.findOne({ id: user.id }, 'Clan')

            if (!userData)
                return message.reply(`${e.Database} | DATABASE | Nenhum registro encontrado.`)

            let ClanChave = Clans.find(clan => clan.Name === userData.Clan)?.id
            const UserClan = userData.Clan ? `**${userData.Clan}** | \`${ClanChave}\`` : 'Não possui'
            return message.reply(`${e.Info} | ${user.user.tag} Clan Status: ${UserClan}`)

        }

        switch (Argument?.toLowerCase()) {
            case 'create': case 'criar': NewClan(); break;
            case 'invite': case 'convidar': case 'convite': NewClanInvitation(); break;
            case 'expulsar': case 'kick': case 'banir': case 'ban': KickMember(); break;
            case 'membros': case 'members': case 'lista': MemberList(); break;
            case 'list': case 'lista': case 'todos': case 'all': ClanList(); break;
            case 'staff': case 'mod': case 'adm': case 'admin': AddOrRemoveStaff(); break;
            case 'delete': case 'apagar': case 'deletar': DeleteClan(); break;
            case 'doar': case 'donate': NewDonate(); break;
            case 'status': case 'perfil': case 'stats': ClanStatus(); break;
            case 'leave': case 'sair': LeaveClan(); break;
            case 'transferirposse': NewClanOwner(); break;
            case 'editname': case 'rename': EditClanName(); break;
            case 'rank': ClanRanking(); break;
            case 'info': case 'help': case 'help': ClanInfo(); break;
            case 'logs': case 'logs': case 'histórico': case 'historico': ClanLogs(); break;
            case 'logsdelete': ClanLogsDelete(); break;
            default:
                message.reply(`${e.Info} | Caso tenha alguma dúvida de como usar este comando, use \`${prefix}clan info\``)
                break;
        }
        return

        async function NewClan() {

            let vip = await Vip(message.author.id)

            if (!vip)
                return message.reply(`${e.Deny} | Apenas membros vips podem criar um clan.`)

            if (AtualClan)
                return message.reply(`${e.Deny} | Você já pertence a um clan.`)

            let ClanName = args.slice(1).join(' '),
                Money = dataUser.Balance || 0,
                ID = Pass()

            function Pass() {
                const code = PassCode(10)

                if (Clans.find(data => data.id === code))
                    return Pass()

                return code
            }

            if (Money < 2000000)
                return message.reply(`${e.Deny} | Você precisa ter pelo menos **2000000 ${moeda}** na carteira para criar um clan.`)

            if (!ClanName)
                return message.reply(`${e.Info} | Você precisa fornecer um nome para a criação do seu clan.`)

            if (!reg.test(ClanName))
                return message.reply(`${e.Deny} | O nome do clan aceita apenas **letras, letras com acento e números**`)

            if (ClanName.length > 30)
                return message.reply(`${e.Deny} | O nome do clan não pode ultrapassar **30 caracteres.**`)

            if (Clans.find(data => data.Name === ClanName))
                return message.reply(`${e.Deny} | Já existe um clan com este nome.`)

            new Database.Clan({
                id: ID,
                Name: ClanName,
                Owner: message.author.id,
                Members: [message.author.id],
                LogRegister: [{ Data: Data(0, true), Message: `🛡️ ${message.author.tag} criou o clan **${ClanName}**` }]
            }).save()

            Database.updateUserData(message.author.id, 'Clan', ClanName)
            Database.subtract(message.author.id, 2000000)
            Database.PushTransaction(message.author.id, `${e.loss} Gastou 2000000 Safiras para criar o clan ${ClanName}`)

            return message.channel.send(`${e.Check} | Você criou o clan **${ClanName}** \`${ID}\` com sucesso!`)

        }

        async function NewClanInvitation() {

            if (!AtualClan)
                return message.reply(`${e.Deny} | Você precisa de um clan para poder convidar alguém.`)

            if (!Admin)
                return message.reply(`${e.Deny} | Você precisa ser um*(a)* administrador*(a)* do clan para convidar outras pessoas.`)

            if (Members.length >= 100)
                return message.reply(`${e.Deny} | O clan atingiu o número máximo de 100 membros.`)

            if (!user)
                return message.reply(`${e.Info} | Você precisa @mencionar ou dizer o ID da pessoa que você quer convidar para o clan`)

            if (user.user.bot)
                return message.reply(`${e.Deny} | Bots não podem ser convidados para um clan.`)

            if (user.id === message.author.id)
                return message.reply(`${e.Deny} | Huuum? Você quer convidar você mesmo?`)

            let userData = await Database.User.findOne({ id: user.id }, 'Clan')

            if (!userData) return message.reply(`${e.Database} | DATABASE | Este usuário não possui nenhum dado no meu banco dados.`)

            if (userData.Clan) return message.reply(`${e.Info} | ${user.user.username} já possui um clan.`)

            const msg = await message.channel.send(`${e.QuestionMark} | ${user}, você está sendo convidado por ${message.author.tag} para entrar no clan **${AtualClan}**.\nVocê aceita o convite?`)

            for (let i of emojis) msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, u) => emojis.includes(reaction.emoji.name) && u.id === user.id,
                time: 30000,
                errors: ['time']
            });

            collector.on('collect', (reaction) => {

                reaction.emoji.name === emojis[0]
                    ? (async () => {

                        await Database.Clan.updateOne(
                            { id: key },
                            { $push: { Members: user.id } }
                        )
                        Database.updateUserData(user.id, 'Clan', AtualClan)
                        msg.edit(`${e.Check} | ${user.user.tag} entrou para o Clan **${AtualClan}**`).catch(() => { })
                        RequestControl = true
                        LogRegister(`➡️ **${user.user.tag}** entrou no clan por convite de **${message.author.tag}**`)
                        return collector.stop()
                    })()
                    : collector.stop()

            });

            collector.on('end', () => {
                if (!RequestControl)
                    return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })

                return
            })

        }

        async function KickMember() {

            const User = message.mentions.users.first() || client.users.cache.get(args[1])

            if (!AtualClan)
                return message.reply(`${e.Deny} | Você não possui clan.`)

            if (!Admin)
                return message.reply(`${e.Deny} | Você precisa ser um*(a)* administrador*(a)* do clan para expulsar membros.`)

            if (!User)
                return message.reply(`${e.Info} | Você precisar mencionar ou dizer o ID do membro que deseja expulsar.`)

            if (!Members.includes(User.id))
                return message.reply(`${e.Deny} | Este usuário não faz parte do clan.`)

            if (Admins?.includes(User.id) && Clans.find(clan => clan.Name === AtualClan)?.Owner !== User.id)
                return message.reply(`${e.Deny} | Este usuário é um administrador e apenas o criado*(a)* do clan pode expulsa-lo*(a)*.`)

            const msg = await message.reply(`${e.QuestionMark} | **Clan: ${AtualClan}** | Você confirma a expulsão do membro **${User.tag}**?`)

            for (let i of emojis) msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, u) => emojis.includes(reaction.emoji.name) && u.id === message.author.id,
                time: 30000,
                errors: ['time']
            });

            collector.on('collect', async (reaction, u) => {

                if (reaction.emoji.name === emojis[0]) {

                    await Database.Clan.updateOne(
                        { id: key },
                        { $pull: { Members: User.id, Admins: User.id } }
                    )

                    LogRegister(`⬅️ **${User.tag}** foi expulso pelo Adm **${message.author.tag}**`)
                    Database.delete(User.id, 'Clan')
                    msg.edit(`${e.Check} | ${User.tag} foi expulso do Clan **${AtualClan}** pelo Admin \`${message.author.tag}\``).catch(() => { })
                    RequestControl = true
                    return collector.stop()

                }

                if (reaction.emoji.name === emojis[1])
                    return collector.stop()

            });

            collector.on('end', () => {
                if (!RequestControl)
                    return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })

                return
            })

        }

        async function MemberList() {

            const K = args[1] || key,
                clan = Clans.find(data => data.id === K)

            if (!K)
                return message.reply(`${e.Deny} | Forneça um ID de algúm clan para que eu pesquise.`)

            if (!clan)
                return message.reply(`${e.Deny} | Nenhum clan foi encontrado.`)

            if (!clan.Members || clan.Members.length === 0) return message.reply(`${e.Deny} | Eu não consegui encontrar os membros desse clan.`)

            let Admins = clan?.Admins || [],
                Name = clan?.Name,
                Members = clan?.Members || [],
                amount = 10,
                Page = 1,
                embeds = [],
                length = Members.length / 10 < 1 ? 1 : parseInt((Members.length / 10) + 1)

            for (let i = 0; i < Members.length; i += 10) {

                let current = Members.slice(i, amount),
                    description = current.map(id => {
                        let Coroa = clan?.Owner === id ? e.OwnerCrow : '',
                            ModShield = Admins?.includes(id) && clan?.Owner !== id ? e.ModShield : '',
                            MemberBust = !Admins.includes(id) && clan?.Owner !== id ? '👤' : '',
                            memberDiscord = client.users.cache.get(id),
                            MemberTag = memberDiscord?.tag?.replace(/`/g, '') || 'Membro não encontrado',
                            MemberId = memberDiscord?.id || "N/A"

                        if (!memberDiscord) {
                            removeMember(clan.id, id)
                            Database.deleteUser(id)
                            MemberTag = 'Usuário deletado'
                            MemberId = ''
                            MemberBust = e.Deny
                            ModShield = ''
                            Coroa = ''
                        }

                        return `${Coroa}${ModShield}${MemberBust}${MemberTag} \`${MemberId}\``
                    }).join('\n')

                embeds.push({
                    color: client.blue,
                    title: `🛡️ Membros do Clan ${Name} | ${Page}/${length}`,
                    description: `${description}`,
                    footer: {
                        text: `${Members?.length || 0}/70 Membros`
                    }
                })

                Page++
                amount += 10

            }

            if (!embeds[0]) return message.reply(`${e.Deny} | Incapaz de gerar a tabela de membros. Tente novamente mais tarde.`)

            let msg = await message.reply({ embeds: [embeds[0]] })

            if (embeds.length > 1)
                for (const emoji of optionsEmojis)
                    msg.react(emoji).catch(() => { })

            let collector = msg.createReactionCollector({
                filter: (reaction, user) => optionsEmojis.includes(reaction.emoji.name) && user.id === message.author.id,
                idle: 30000,
                errors: ['idle']
            })

                .on('collect', (reaction) => {

                    if (reaction.emoji.name === optionsEmojis[0]) {
                        control--
                        embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control++

                    }

                    if (reaction.emoji.name === optionsEmojis[1]) {
                        control++
                        embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control--

                    }

                    if (reaction.emoji.name === optionsEmojis[2])
                        return collector.stop()

                })

                .on('end', () => {
                    return msg.reactions.removeAll().catch(() => { })
                })

        }

        async function ClanList() {

            if (!Clans || Clans.length === 0)
                return message.reply(`${e.Info} | Nenhum clan foi criado ainda.`)

            const ListArray = []

            for (const data of Clans)
                ListArray.push({
                    key: data.id,
                    name: data.Name || 'Indefinido',
                    owner: client.users.cache.get(data.Owner)?.tag || 'Indefinido'
                })

            function EmbedGenerator() {

                let amount = 10,
                    Page = 1,
                    embeds = [],
                    length = parseInt(ListArray.length / 10) + 1

                for (let i = 0; i < ListArray.length; i += 10) {

                    const current = ListArray.slice(i, amount)
                    const description = current.map(clan => `> \`${clan.key}\` - **${clan.name}**\n> ${e.OwnerCrow} ${clan.owner}\n⠀`).join("\n")

                    embeds.push({
                        color: client.blue,
                        title: `🛡️ Lista de Todos os Clans | ${Page}/${length}`,
                        description: `${description}`,
                        footer: {
                            text: `${ListArray?.length || 0} Clans contabilizados`
                        }
                    })

                    Page++
                    amount += 10

                }

                return embeds;
            }

            const embeds = EmbedGenerator()
            const msg = await message.reply({ embeds: [embeds[0]] })

            if (embeds.length > 1)
                for (const emoji of optionsEmojis)
                    msg.react(emoji).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => optionsEmojis.includes(reaction.emoji.name) && user.id === message.author.id,
                idle: 30000,
                errors: ['idle']
            });

            collector.on('collect', (reaction) => {

                if (reaction.emoji.name === optionsEmojis[0]) {
                    control--
                    embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control++
                }

                if (reaction.emoji.name === optionsEmojis[1]) {
                    control++
                    embeds[control] ? msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control--
                }

                if (reaction.emoji.name === optionsEmojis[2]) {
                    collector.stop()
                }

            });

            collector.on('end', () => msg.reactions.removeAll().catch(() => { }))

        }

        function AddOrRemoveStaff() {

            if (!AtualClan)
                return message.reply(`${e.Deny} | Você precisa estar em um clan para usar este comando.`)

            if (!Owner)
                return message.reply(`${e.Deny} | Apenas o dono do clan pode promover admins.`)

            if (['add', 'new', 'adicionar', 'promover'].includes(args[1]?.toLowerCase())) return AddAdmin()
            if (['remove', 'del', 'deletar', 'demitir'].includes(args[1]?.toLowerCase())) return RemoveAdmin()
            return message.reply(`${e.Info} | Você precisa usar o comando de forma correta. \n\`${prefix}clan staff <add/remove> <@user>\``)

            async function AddAdmin() {

                if (Admins.length >= 5)
                    return message.reply(`${e.Deny} | O clan atingiu o número máximo de administradores.`)

                if (!user)
                    return message.reply(`${e.Info} | Mencione o usuário que deseja promover para Administrador*(a)*`)

                if (!Members?.includes(user.id))
                    return message.reply(`${e.Deny} | Este usuário não é membro do clan.`)

                if (Admins?.includes(user.id))
                    return message.reply(`${e.Deny} | Este usuário já é um administrador.`)

                await Database.Clan.updateOne(
                    { id: key },
                    { $push: { Admins: user.id } }
                )
                LogRegister(`${e.ModShield} **${user.user.tag}** foi promovido para Administrador`)
                return message.reply(`${e.Check} | ${user.user.tag} foi promovido para ${e.ModShield} **Administrador*(a)*** no clan **${AtualClan}**`)

            }

            async function RemoveAdmin() {

                if (!user)
                    return message.reply(`${e.Info} | Mencione o usuário que deseja remover do cargo Administrador*(a)*`)

                if (!Members?.includes(user.id))
                    return message.reply(`${e.Deny} | Este usuário não é membro do clan.`)

                if (!Admins?.includes(user.id))
                    return message.reply(`${e.Deny} | Este usuário não é um administrador.`)

                await Database.Clan.updateOne(
                    { id: key },
                    { $pull: { Admins: user.id } }
                )
                LogRegister(`${e.ModShield} **${user.user.tag}** foi removido do cargo Administrador`)
                return message.reply(`${e.Info} | ${user.user.tag} foi removido do cargo ${e.ModShield} **Administrador*(a)*** no clan **${AtualClan}**`)

            }

        }

        async function DeleteClan() {

            if (!AtualClan)
                return message.reply(`${e.Deny} | Você precisa estar em um clan para usar este comando.`)

            if (!Owner)
                return message.reply(`${e.Deny} | Apenas o dono do clan pode apagar o clan.`)

            const msg = await message.reply(`${e.QuestionMark} | Você confirma deletar o clan **${AtualClan}**?`)

            for (let i of emojis) msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, u) => emojis.includes(reaction.emoji.name) && u.id === message.author.id,
                time: 30000,
                errors: ['time']
            });

            collector.on('collect', (reaction, u) => {

                return reaction.emoji.name === emojis[0] ? deleteClan() : Denied()

                async function deleteClan() {

                    for (const id of Members)
                        Database.delete(id, 'Clan')

                    await Database.Clan.deleteOne({ id: key })
                    msg.edit(`${e.Check} | O Clan **${AtualClan}** foi deletado com sucesso!`).catch(() => { })
                    RequestControl = true
                    return collector.stop()

                }

                function Denied() {
                    msg.edit(`${e.Deny} | Pedido recusado.`)
                    return collector.stop()
                }

            });


            collector.on('end', () => {
                if (!RequestControl)
                    return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })

                return
            })

        }

        async function NewDonate() {

            if (!AtualClan)
                return message.reply(`${e.Deny} | Você precisa estar em um clan para usar este comando.`)

            let amount = parseInt(args[1]?.replace(/k/g, '000')) || 0
            let money = dataUser.Balance || 0

            if (['all', 'tudo'].includes(args[1]?.toLowerCase())) amount = money

            if (!amount || isNaN(amount))
                return message.reply(`${e.Deny} | Você precisa dizer uma quantia para doar ao clan.`)

            if (money < 1)
                return message.reply(`${e.Deny} | Você não possui dinheiro para doar.`)

            if (amount > money)
                return message.reply(`${e.Deny} | Você não possui todo este direito na carteira.`)

            if (amount < 1)
                return message.reply(`${e.Deny} | Você pode doar no mínimo 1 ${moeda}`)

            await Database.Clan.updateOne(
                { id: key },
                { $inc: { Donation: amount } }
            )

            Database.subtract(message.author.id, amount)
            Database.PushTransaction(message.author.id, `${e.loss} Doou ${amount} Safiras para o Clan ${AtualClan}`)
            LogRegister(`${e.gain} **${message.author.tag}** doou **${amount} Safiras**`)
            return message.reply(`${e.Check} | Você doou **${amount} ${moeda}** para o Clan **${AtualClan}**.`)
        }

        async function ClanStatus() {

            let KeyArgs = args[1] || key

            let clan = Clans.find(clan => clan.id === KeyArgs)

            if (!clan)
                return message.reply(`${e.Deny} | Você não possui clan ou o clan requisitado não existe.`)

            let
                Name = clan.Name,
                Owner = client.users.cache.get(clan.Owner)?.tag || 'Indefinido',
                AdminsLength = clan.Admins?.length || 0,
                Admins = clan.Admins?.map(adm => `> ${client.users.cache.get(adm)?.tag || "Indefinido"}`).join('\n') || '> Nenhum',
                Members = clan.Members?.length || 0,
                Donation = clan.Donation || 0,
                DataFormatada = `${client.formatTimestamp(clan.CreatAt)}`,
                color = await Colors(message.author.id)

            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(color)
                        .setTitle(`🛡️ Informações do Clan: ${Name}`)
                        .addFields(
                            {
                                name: `${e.Gear} Clan Key`,
                                value: `> \`${KeyArgs}\``
                            },
                            {
                                name: '📝 Nome',
                                value: `> ${Name}`
                            },
                            {
                                name: `${e.OwnerCrow} Dono*(a)*`,
                                value: `> ${Owner}`
                            },
                            {
                                name: `${e.ModShield} Administradores - ${AdminsLength}/5`,
                                value: `${Admins}`
                            },
                            {
                                name: '👥 Membros',
                                value: `> ${Members}/100`
                            },
                            {
                                name: `${e.MoneyWings} Doações`,
                                value: `> ${Donation} ${moeda}`
                            },
                            {
                                name: 'Criado há',
                                value: `> ${DataFormatada}`
                            }
                        )
                ]
            })

        }

        async function LeaveClan() {

            if (!AtualClan)
                return message.reply(`${e.Deny} | Você não possui clan.`)

            if (Owner)
                return message.reply(`${e.Deny} | Você precisa passar a liderança do clan para outro membro ou deletar o clan. \`${prefix}clan transferirposse <@user>\` | \`${prefix}clan delete\``)

            const msg = await message.reply(`${e.QuestionMark} | Você confirma sair do clan **${AtualClan}**?`)

            for (let i of emojis) msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, u) => emojis.includes(reaction.emoji.name) && u.id === message.author.id,
                time: 30000,
                errors: ['time']
            });

            collector.on('collect', async (reaction) => {

                RequestControl = true
                if (reaction.emoji.name === emojis[0]) {

                    await Database.Clan.updateOne(
                        { id: key },
                        {
                            $pull: {
                                Members: message.author.id,
                                Admins: message.author.id
                            }
                        }
                    )
                    LogRegister(`⬅️ **${message.author.tag}** saiu do clan`)
                    Database.delete(message.author.id, 'Clan')
                    msg.edit(`${e.Check} | Você saiu do Clan **${AtualClan}**!`).catch(() => { })
                    return collector.stop()
                }

                if (reaction.emoji.name === emojis[1]) {
                    msg.edit(`${e.Deny} | Pedido recusado.`).catch(() => { })
                    return collector.stop()
                }

            });

            collector.on('end', () => {
                if (!RequestControl)
                    return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })

                return
            })

        }

        async function NewClanOwner() {

            if (!AtualClan)
                return message.reply(`${e.Deny} | Você precisa ter um clan para usar este comando.`)

            if (!Owner)
                return message.reply(`${e.Deny} | Apenas o dono do clan pode usar este comando.`)

            if (!user)
                return message.reply(`${e.Info} | @Mencione o membro que você deseja transferir a posse do clan`)

            if (!Members.includes(user.id))
                return message.reply(`${e.Deny} | Este usuário não faz parte do clan.`)

            const msg = await message.reply(`${e.QuestionMark} | Você confirma transferir a posso do clan **${AtualClan}** para **${user.user.tag}**?`)

            for (let i of emojis) msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, u) => emojis.includes(reaction.emoji.name) && u.id === message.author.id,
                time: 30000,
                errors: ['time']
            });

            collector.on('collect', async (reaction) => {

                if (reaction.emoji.name === emojis[0]) {

                    await Database.Clan.updateOne({ id: key }, { Owner: user.id })
                    RequestControl = true
                    if (!Admins?.includes(user.id))
                        await Database.Clan.updateOne(
                            { id: key },
                            { $push: { Admins: user.id } }
                        )

                    if (!Admins?.includes(message.author.id))
                        await Database.Clan.updateOne(
                            { id: key },
                            { $push: { Admins: message.author.id } }
                        )

                    LogRegister(`${e.ModShield} **${message.author.tag}** transferiu a posse do clan para **${user.user.tag}**`)
                    msg.edit(`${e.Check} | Você transferiu a posse do Clan **${AtualClan}** para ${user.user.tag} com sucesso! Por padrão, você ainda é um administrador.`).catch(() => { })
                    return collector.stop()

                }

                if (reaction.emoji.name === emojis[1]) {
                    msg.edit(`${e.Deny} | Pedido recusado.`)
                    return collector.stop()
                }

                return
            });

            collector.on('end', () => {
                if (!RequestControl)
                    return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })

                return
            })

        }

        async function EditClanName() {

            if (!AtualClan)
                return message.reply(`${e.Deny} | Você precisa ter um clan para usar este comando.`)

            if (!Owner)
                return message.reply(`${e.Deny} | Apenas o dono do clan pode usar este comando.`)

            let NewName = args.slice(1).join(' ')
            let money = dataUser.Balance || 0

            if (money < 700000)
                return message.reply(`${e.Info} | Você precisa de pelo menos 700.000 ${moeda} para trocar o nome do clan.`)

            if (!NewName)
                return message.reply(`${e.Info} | Você precisa fornecer um nome para a criação do seu clan.`)

            if (!reg.test(NewName))
                return message.reply(`${e.Deny} | O nome do clan aceita apenas **letras, letras com acento e números**`)

            if (AtualClan === NewName)
                return message.reply(`${e.Deny} | Este já é o nome atual do seu clan.`)

            let already = Clans.some(data => data.Name === NewName)

            if (already)
                return message.reply(`${e.Deny} | Já existe um clan com este nome.`)

            if (NewName.length > 30)
                return message.reply(`${e.Deny} | O nome do clan não pode ultrapassar **30 caracteres.**`)

            const msg = await message.reply(`${e.QuestionMark} | Você confirma trocar o nome do clan de **${AtualClan}** para **${NewName}**?`)

            for (let i of emojis) msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, u) => emojis.includes(reaction.emoji.name) && u.id === message.author.id,
                time: 30000,
                errors: ['time']
            })

                .on('collect', async (reaction) => {

                    RequestControl = true
                    if (reaction.emoji.name === emojis[0]) {

                        for (const id of Members)
                            Database.updateUserData(id, 'Clan', NewName)

                        await Database.Clan.updateOne(
                            { id: key },
                            { Name: NewName }
                        )

                        LogRegister(`${e.ModShield} O nome do clan foi alterado de **${AtualClan}** para **${NewName}**`)

                        Database.subtract(message.author.id, 700000)
                        msg.edit(`${e.Check} | Você trocou o nome do seu Clan com sucesso!`).catch(() => { })
                        return collector.stop()

                    }

                    if (reaction.emoji.name === emojis[1]) {
                        msg.edit(`${e.Deny} | Pedido recusado.`)
                        return collector.stop()
                    }

                })

                .on('end', () => {
                    if (!RequestControl)
                        return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })

                    return
                })
            return

        }

        async function ClanRanking() {

            const ClansArray = []

            for (const data of Clans)
                if (data.Donation > 0)
                    ClansArray.push({ key: data.id, name: data.Name || 'Indefinido', donation: data.Donation || 0 })

            if (ClansArray.length < 1) return message.reply(`${e.Info} | Não há ranking por enquanto.`)

            let Medals = { 1: '🥇', 2: '🥈', 3: '🥉' },
                rank = ClansArray.slice(0, 10).sort((a, b) => b.donation - a.donation).map((clan, i) => ` \n> ${Medals[i + 1] || `${i + 1}.`} **${clan.name}** - \`${clan.key}\`\n> ${clan.donation} ${moeda}\n`).join('\n'),
                MyClanRank = ClansArray.findIndex(clans => clans.name === AtualClan) + 1 || 'N/A',
                color = await Colors(message.author.id)

            return message.reply(
                {
                    embeds: [
                        new MessageEmbed()
                            .setColor(color)
                            .setTitle(`👑 Top 10 Clans`)
                            .setDescription(`O clan é baseado nas doações\n \n${rank}`)
                            .setFooter({ text: `Meu Clan: ${MyClanRank}/${Clans.length || 0}` })
                    ]
                }
            )

        }

        async function ClanLogs() {

            if (!AtualClan)
                return message.reply(`${e.Deny} | Você não possui nenhum clan.`)

            const ClanLogs = Clans.find(clan => clan.Name === AtualClan)?.LogRegister || []

            if (ClanLogs.length < 1)
                return message.reply(`${e.Info} | Este clan não possui nenhum histórico.`)

            function EmbedGenerator() {

                let amount = 10,
                    Page = 1,
                    embeds = [],
                    length = ClanLogs.length / 10 <= 1 ? 1 : parseInt((ClanLogs.length / 10) + 1)

                for (let i = 0; i < ClanLogs.length; i += 10) {

                    let current = ClanLogs.slice(i, amount),
                        description = current.map(log => `\`${log.Data}\` ${log.Message}`).join("\n")

                    embeds.push({
                        color: client.blue,
                        title: `🛡️ Logs do Clan ${AtualClan} | ${Page}/${length}`,
                        description: `${description}`,
                        footer: {
                            text: `${ClanLogs?.length || 0} Logs`
                        }
                    })

                    Page++
                    amount += 10

                }

                return embeds;
            }

            const embeds = EmbedGenerator(),
                msg = await message.reply({ embeds: [embeds[0]] })

            if (embeds.length > 1)
                for (const emoji of optionsEmojis)
                    msg.react(emoji).catch(() => { })

            let collector = msg.createReactionCollector({
                filter: (reaction, user) => optionsEmojis.includes(reaction.emoji.name) && user.id === message.author.id,
                idle: 30000,
                errors: ['idle']
            })

            collector.on('collect', (reaction, user) => {

                if (reaction.emoji.name === optionsEmojis[2])
                    return collector.stop()

                return reaction.emoji.name === optionsEmojis[0]
                    ? (() => {

                        control--
                        return embeds[control] ? msg.edit({ embeds: [embeds[control]] }) : control++

                    })()
                    : (() => {

                        control++
                        return embeds[control] ? msg.edit({ embeds: [embeds[control]] }) : control--

                    })()

            });

            collector.on('end', () => msg.reactions.removeAll().catch(() => { }))

        }

        async function ClanLogsDelete() {

            if (!Owner)
                return message.reply(`${e.Deny} | Apenas o dono do clan pode apagar o histórico.`)

            const ClanLogs = Clans.find(clan => clan.Name === AtualClan)?.LogRegister || []

            if (ClanLogs.length < 1)
                return message.reply(`${e.Deny} | O clan não tem nenhum histórico a ser deletado.`)

            const msg = await message.reply(`${e.QuestionMark} | Você realmente deseja excluir todo o histórico do seu clan?`),
                collector = msg.createReactionCollector({
                    filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                    time: 30000,
                    errors: ['time']
                })

            for (const emoji of emojis) msg.react(emoji).catch(() => { })

            collector.on('collect', async (reaction) => {

                return reaction.emoji.name === emojis[0]
                    ? (async () => {
                        await Database.Clan.updateOne(
                            { id: key },
                            { $unset: { LogRegister: 1 } }
                        )
                        return msg.edit(`${e.Check} | Você deletou todo o histórico do seu clan.`).catch(() => { })
                    })()
                    : collector.stop()

            })

            collector.on('end', () => msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { }))

        }

        async function LogRegister(MessageData) {

            await Database.Clan.updateOne(
                { id: key },
                { $push: { LogRegister: { $each: [{ Data: Data(0, true), Message: MessageData }], $position: 0 } } },
                { upsert: true }
            )

        }

        function ClanInfo() {
            return message.reply(
                {
                    embeds: [
                        {
                            color: client.blue,
                            title: `🛡️ ${client.user.username}'s Clan System`,
                            description: `No sistema de clans, você pode fazer parte dos clans ou até criar o seu. Presente em rankings globais, você pode competir para ver qual é o maior clan!`,
                            fields: [
                                {
                                    name: `👀 Veja o clan de alguém, ou o seu`,
                                    value: `\`${prefix}clan <@user>\` ou \`${prefix}clan status <KeyCode>\``
                                },
                                {
                                    name: `${e.Stonks} Crie o seu clan`,
                                    value: `\`${prefix}clan create <Nome do Clan>\``
                                },
                                {
                                    name: `${e.Join} Convite membros para o seu clan`,
                                    value: `\`${prefix}clan invite <@user>\` - Apenas donos e administradores podem convidar`
                                },
                                {
                                    name: `${e.Leave} Expulse pessoas do clan`,
                                    value: `\`${prefix}clan kick <@user>\` - Apenas donos e administradores podem expulsar`
                                },
                                {
                                    name: `${e.Commands} Veja quem está no clan ou os clans`,
                                    value: `\`${prefix}clan membros [KeyCode de outro Clan (opcional)]\` - \`${prefix}clan list\``
                                },
                                {
                                    name: `${e.ModShield} Adicione ou remova administradores`,
                                    value: `\`${prefix}clan adm add/remove <@user>\` - Apenas donos podem adicionar ou remover adms`
                                },
                                {
                                    name: `${e.Deny} Delete o clan`,
                                    value: `\`${prefix}clan delete\` - Apenas donos podem deletar o clan`
                                },
                                {
                                    name: `${e.gain} Doe ao clan`,
                                    value: `\`${prefix}clan donate <valor>\``
                                },
                                {
                                    name: `${e.Download} Veja como está o seu clan`,
                                    value: `\`${prefix}clan status\``
                                },
                                {
                                    name: `${e.PandaBag} Saia do clan`,
                                    value: `\`${prefix}clan leave\``
                                },
                                {
                                    name: '🔄 Transfira a posse do clan',
                                    value: `\`${prefix}clan transferirposse <@user>\` - Apenas o dono pode dar a posse de dono`
                                },
                                {
                                    name: `🔄 Mude o nome do clan`,
                                    value: `\`${prefix}clan editname <Novo Nome>\` - Apenas o dono pode mudar o nome do clan`
                                },
                                {
                                    name: `${e.Info} Veja o que acontece no clan`,
                                    value: `\`${prefix}clan logs\``
                                },
                                {
                                    name: `${e.Deny} Delete o histórico`,
                                    value: `\`${prefix}clan logsdelete\``
                                },
                                {
                                    name: `${e.Upvote} Veja o ranking dos clans`,
                                    value: `\`${prefix}clan rank\``
                                }
                            ],
                            footer: {
                                text: `Este comando faz parte da categoria "${client.user.username} hiper commands"`
                            }
                        }
                    ]
                }
            )
        }

        async function removeMember(clanKey, memberId) {
            await Database.Clan.updateOne(
                { id: clanKey },
                {
                    $pull: {
                        Members: memberId,
                        Admins: memberId,
                    }
                }
            )
        }

    }
}