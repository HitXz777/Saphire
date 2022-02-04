const
    { DatabaseObj } = require('../../../Routes/functions/database'),
    { e, config, N } = DatabaseObj,
    Moeda = require('../../../Routes/functions/moeda'),
    Colors = require('../../../Routes/functions/colors'),
    Vip = require('../../../Routes/functions/vip')

module.exports = {
    name: 'perfil',
    aliases: ['profile', 'p'],
    category: 'perfil',
    emoji: '👤',
    usage: '<perfil> [@user]',
    description: 'Veja o perfil, seu ou o de alguém',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let
            u = message.mentions.members.first() || message.mentions.repliedUser || client.users.cache.get(args[0]) || client.users.cache.find(user => user.username?.toLowerCase() == args[0]?.toLowerCase() || user.tag?.toLowerCase() == args[0]?.toLowerCase()) || message.author,
            user = u?.id
                ? await client.users.cache.get(u?.id)
                : (() => {
                    return message.reply(`${e.Deny} | Usuário não encontrado.`)
                })(),
            color = Colors(user),
            Embed = new MessageEmbed()
                .setColor(color),
            msg = await message.reply({ embeds: [Embed.setDescription(`${e.Loading} | Construindo perfil...`)] }),
            money = sdb.get(`Users.${user.id}.Perfil.BankOcult`) && (message.author.id !== user.id || message.author.id !== config.ownerId)
                ? '||Oculto||'
                : (sdb.get(`Users.${user.id}.Balance`) || 0) + (sdb.get(`Users.${user.id}.Bank`) || 0) + (sdb.get(`Users.${user.id}.Cache.Resgate`) || 0),
            marry = await client.users.cache.get(sdb.get(`Users.${user.id}.Perfil.Marry`))
                ? await client.users.cache.get(sdb.get(`Users.${user.id}.Perfil.Marry`)).tag
                : "Solteiro(a)",
            level = sdb.get(`Users.${user.id}.Level`) || 0,
            likes = sdb.get(`Users.${user.id}.Likes`) || 0,
            vip = Vip(`${user.id}`) ? `${e.VipStar}` : '📃',
            estrela = 'Indefinido',
            TopGlobalMoney,
            TopGlobalLevel,
            TopGlobalLikes,
            OfficialTitle = sdb.get(`Users.${user.id}.Perfil.OfficialTitles`)
                ? `\n${sdb.get(`Users.${user.id}.Perfil.OfficialTitles`)}`
                : '',
            Moderator = sdb.get(`Client.Moderadores.${user.id}`)
                ? `\n${e.ModShield} **Official Moderator**`
                : '',
            Developer = sdb.get(`Client.Developer.${user.id}`)
                ? `\n${e.OwnerCrow} **Official Developer**`
                : '',
            BugHunter = sdb.get(`Client.BugHunter.${user.id}`)
                ? `\n${e.Gear} **Bug Hunter**`
                : '',
            OfficialDesigner = sdb.get(`Client.OfficialDesigner.${user.id}`)
                ? `\n${e.SaphireFeliz} **Designer Official**`
                : '',
            HalloweenTitle = sdb.get(`Titulos.Halloween`)?.includes(user.id)
                ? `\n🎃 **Halloween 2021**`
                : '',
            Marry = sdb.get(`Users.${user.id}.Perfil.Marry`),
            Titulo = sdb.get(`Users.${user.id}.Perfil.Titulo`),
            titulo = sdb.get(`Users.${user.id}.Perfil.TitlePerm`)
                ? `🔰 ${Titulo || 'Sem título definido'}`
                : `${e.Deny} Não possui título`,
            Estrela = {
                Um: sdb.get(`Users.${user.id}.Perfil.Estrela.Um`),
                Dois: sdb.get(`Users.${user.id}.Perfil.Estrela.Dois`),
                Tres: sdb.get(`Users.${user.id}.Perfil.Estrela.Tres`),
                Quatro: sdb.get(`Users.${user.id}.Perfil.Estrela.Quatro`),
                Cinco: sdb.get(`Users.${user.id}.Perfil.Estrela.Cinco`),
                Seis: sdb.get(`Users.${user.id}.Perfil.Estrela.Seis`),
            },
            parca1 = await client.users.cache.get(sdb.get(`Users.${user.id}.Perfil.Parcas.Um`))
                ? `\n1. ${await client.users.cache.get(sdb.get(`Users.${user.id}.Perfil.Parcas.Um`)).tag}`
                : '',
            parca2 = await client.users.cache.get(sdb.get(`Users.${user.id}.Perfil.Parcas.Dois`))
                ? `\n2. ${await client.users.cache.get(sdb.get(`Users.${user.id}.Perfil.Parcas.Dois`)).tag}`
                : '',
            parca3 = await client.users.cache.get(sdb.get(`Users.${user.id}.Perfil.Parcas.Tres`))
                ? `\n3. ${await client.users.cache.get(sdb.get(`Users.${user.id}.Perfil.Parcas.Tres`)).tag}`
                : '',
            parca4 = await client.users.cache.get(sdb.get(`Users.${user.id}.Perfil.Parcas.Quatro`))
                ? `\n4. ${await client.users.cache.get(sdb.get(`Users.${user.id}.Perfil.Parcas.Quatro`)).tag}`
                : '',
            parca5 = await client.users.cache.get(sdb.get(`Users.${user.id}.Perfil.Parcas.Cinco`))
                ? `\n5. ${await client.users.cache.get(sdb.get(`Users.${user.id}.Perfil.Parcas.Cinco`)).tag}`
                : '',
            NoParcas = !parca1 && !parca2 && !parca3 && !parca4 && !parca5
                ? 'Nenhum parça ainda'
                : '',
            family1 = await client.users.cache.get(sdb.get(`Users.${user.id}.Perfil.Family.Um`))
                ? `\n1. ${await client.users.cache.get(sdb.get(`Users.${user.id}.Perfil.Family.Um`)).tag}`
                : '',
            family2 = await client.users.cache.get(sdb.get(`Users.${user.id}.Perfil.Family.Dois`))
                ? `\n2. ${await client.users.cache.get(sdb.get(`Users.${user.id}.Perfil.Family.Dois`)).tag}`
                : '',
            family3 = await client.users.cache.get(sdb.get(`Users.${user.id}.Perfil.Family.Tres`))
                ? `\n3. ${await client.users.cache.get(sdb.get(`Users.${user.id}.Perfil.Family.Tres`)).tag}`
                : '',
            NoFamily = !family1 && !family2 && !family3
                ? 'Nenhum membro na família'
                : '',
            status = sdb.get(`Users.${user.id}.Perfil.Status`)
                ? sdb.get(`Users.${user.id}.Perfil.Status`)
                : `${user.username} não conhece o comando \`${prefix}setstatus\``,
            signo = sdb.get(`Users.${user.id}.Perfil.Signo`)
                ? `⠀\n${sdb.get(`Users.${user.id}.Perfil.Signo`)}`
                : `⠀\n${e.Deny} Sem signo definido`,
            sexo = sdb.get(`Users.${user.id}.Perfil.Sexo`)
                ? `⠀\n${sdb.get(`Users.${user.id}.Perfil.Sexo`)}`
                : `⠀\n${e.Deny} Sem sexo definido`,
            niver = sdb.get(`Users.${user.id}.Perfil.Aniversario`) ? `⠀\n🎉 ${sdb.get(`Users.${user.id}.Perfil.Aniversario`)}` : `⠀\n${e.Deny} Sem aniversário definido`,
            job = sdb.get(`Users.${user.id}.Perfil.Trabalho`) ? `⠀\n👷 ${sdb.get(`Users.${user.id}.Perfil.Trabalho`)}` : `⠀\n${e.Deny} Sem profissão definida`,
            Clan = sdb.get(`Users.${user.id}.Clan`) || 'Não possui'

        if (Marry && !await client.users.cache.get(Marry)) {
            sdb.delete(`Users.${Marry}`)
            sdb.delete(`Users.${user.id}.Perfil.Marry`)
            marry = "Solteiro(a)"
            message.channel.send(`${e.Info} | Eu não achei o perceiro*(a)* deste perfil em nenhum dos meus servidores. Então, eu forcei o divórcio entre o casal.`)
        }

        if (Estrela.Um) estrela = `${e.Star}${e.GrayStar}${e.GrayStar}${e.GrayStar}${e.GrayStar}`
        if (Estrela.Dois) estrela = `${e.Star}${e.Star}${e.GrayStar}${e.GrayStar}${e.GrayStar}`
        if (Estrela.Tres) estrela = `${e.Star}${e.Star}${e.Star}${e.GrayStar}${e.GrayStar}`
        if (Estrela.Quatro) estrela = `${e.Star}${e.Star}${e.Star}${e.Star}${e.GrayStar}`
        if (Estrela.Cinco) estrela = `${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}`
        if (Estrela.Seis) estrela = `${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}${e.Star}`
        if (!Estrela.Um && !Estrela.Dois && !Estrela.Tres && !Estrela.Quatro && !Estrela.Cinco && !Estrela.Seis) estrela = `${e.GrayStar}${e.GrayStar}${e.GrayStar}${e.GrayStar}${e.GrayStar}`

        TopGlobalLevel = sdb.get('Client.TopGlobalLevel') === user.id ? `\n${e.RedStar} **Top Global Level**` : ''
        TopGlobalLikes = sdb.get('Client.TopGlobalLikes') === user.id ? `\n${e.Like} **Top Global Likes**` : ''
        TopGlobalMoney = sdb.get('Client.TopGlobalMoney') === user.id ? `\n${e.MoneyWings} **Top Global Money**` : ''

        if (user.id === client.user.id) {
            const perfil = new MessageEmbed()
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
                        value: `${N.Rody}`
                    },
                    {
                        name: '🤝 Parças',
                        value: 'Galera do Discord'
                    },
                    {
                        name: '🌐 Global',
                        value: `∞ ${Moeda(message)}\n∞ ${e.RedStar} Level\n∞ ${e.Like} Likes`,
                    },
                    {
                        name: '📝 Status',
                        value: 'Um dia eu quero ir pra lua'
                    },
                    {
                        name: '🛡️ Clan',
                        value: Clan
                    }
                )
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            return message.reply({ embeds: [perfil] })
        }

        Embed
            .setDescription(`${vip} **Perfil de ${user.username}**${Developer}${OfficialDesigner}${Moderator}${HalloweenTitle}${BugHunter}${OfficialTitle}${TopGlobalLevel}${TopGlobalLikes}${TopGlobalMoney}\n${estrela}`)
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
                    value: `${family1}${family2}${family3}${NoFamily}`
                },
                {
                    name: '🤝 Parças',
                    value: `${parca1}${parca2}${parca3}${parca4}${parca5}${NoParcas}`
                },
                {
                    name: '🌐 Global',
                    value: `${money} ${Moeda(message)}\n${level} ${e.RedStar} Level\n${likes} ${e.Like} Likes`,
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

        return msg.edit({ embeds: [Embed] }).catch()
    }
}