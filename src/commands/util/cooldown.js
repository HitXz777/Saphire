const Colors = require('../../../Routes/functions/colors'),
    { DatabaseObj: { e } } = require('../../../Routes/functions/database'),
    Timeout = require('../../../Routes/functions/Timeout'),
    GetTimeout = require('../../../Routes/functions/gettimeout')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'cooldown',
    aliases: ['cd', 'timeouts', 'tm'],
    category: 'util',
    emoji: '⏱️',
    usage: '<cooldown> <@user/id>',
    description: 'Verifique os seus tempos',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let user = message.mentions.users.first() || message.mentions.repliedUser || client.users.cache.get(args[0]) || message.author
        if (!user) return message.reply(`${e.Deny} | Eu não achei, o que será que aconteceu?`)

        let Preso = sdb.get(`Users.${user.id}.Timeouts.Preso`) || null,
            Daily = sdb.get(`Users.${user.id}.Timeouts.Daily`) || null,
            Porquinho = sdb.get(`Users.${user.id}.Timeouts.Porquinho`) || null,
            Work = sdb.get(`Users.${user.id}.Timeouts.Work`) || null,
            Monthly = sdb.get(`Users.${user.id}.Timeouts.Monthly`) || null,
            Weekly = sdb.get(`Users.${user.id}.Timeouts.Weekly`) || null,
            Cu = sdb.get(`Users.${user.id}.Timeouts.Cu`) || null,
            Roleta = sdb.get(`Users.${user.id}.Timeouts.Roleta`) || null,
            Roubo = sdb.get(`Users.${user.id}.Timeouts.Roubo`) || null,
            Assalto = sdb.get(`Users.${user.id}.Timeouts.Assalto`) || null,
            Bitcoin = sdb.get(`Users.${user.id}.Timeouts.Bitcoin`) || null,
            Rep = sdb.get(`Users.${user.id}.Timeouts.Rep`) || null,
            Crime = sdb.get(`Users.${user.id}.Timeouts.Crime`) || null,
            Bolsa = sdb.get(`Users.${user.id}.Timeouts.Bolsa`) || null,
            Helpier = sdb.get(`Users.${user.id}.Timeouts.Helpier`) || null,
            Vip = {
                DateNow: sdb.get(`Users.${user.id}.Timeouts.Vip.DateNow`) || null,
                TimeRemaing: sdb.get(`Users.${user.id}.Timeouts.Vip.TimeRemaing`) || 0,
                Permanent: sdb.get(`Users.${user.id}.Timeouts.Vip.Permanent`)
            },
            Dpn = `${e.Check} Disponível`,
            TPreso, TDaily, TPig, TWork, TRestoreDividas, TCu, TRoleta, TCrime, TBit, TLikes, THelpier, TWeek, TMonth, TReact, TAssalto, TRob, TBolsa, TVip,
            TimeRestoreDividas = sdb.get(`Client.Timeouts.RestoreDividas`) || null,
            TimeReact = sdb.get('Client.Timeouts.React') || null

        // Timeout Preso
        if (Timeout(1500000, Preso)) {
            TPreso = `${e.Loading} ${GetTimeout(1500000, Preso)}`
        } else { sdb.delete(`Users.${user.id}.Timeouts.Preso`); TPreso = `${e.Check} Livre` }

        // Timeout Daily
        if (Daily !== null && 86400000 - (Date.now() - Daily) > 0) {
            TDaily = `${e.Loading} ${GetTimeout(86400000, Daily)}`
        } else { sdb.delete(`Users.${user.id}.Timeouts.Daily`); TDaily = Dpn }

        // Timeout Pig
        if (Porquinho !== null && 30000 - (Date.now() - Porquinho) > 0) {
            TPig = `${e.Loading} ${GetTimeout(30000, Porquinho)}`
        } else { sdb.delete(`Users.${user.id}.Timeouts.Porquinho`); TPig = Dpn }

        // Timeout Work
        if (Work !== null && 66400000 - (Date.now() - Work) > 0) {
            TWork = `${e.Loading} ${GetTimeout(66400000, Work)}`
        } else { sdb.delete(`Users.${user.id}.Timeouts.Work`); TWork = Dpn }

        // Timeout RestoreDividas
        if (TimeRestoreDividas !== null && 86400000 - (Date.now() - TimeRestoreDividas) > 0) {
            TRestoreDividas = `${e.Loading} ${GetTimeout(86400000, TimeRestoreDividas)}`
        } else { sdb.delete(`Client.Timeouts.RestoreDividas`); TRestoreDividas = Dpn }

        // Timeout Cu
        if (Cu !== null && 600000 - (Date.now() - Cu) > 0) {
            TCu = `${e.Loading} ${GetTimeout(600000, Cu)}`
        } else { sdb.delete(`Users.${user.id}.Timeouts.Cu`); TCu = Dpn }

        // Timeout Roleta
        if (Roleta !== null && 1200000 - (Date.now() - Roleta) > 0) {
            TRoleta = `${e.Loading} ${GetTimeout(1200000, Roleta)}`
        } else { sdb.delete(`Users.${user.id}.Timeouts.Roleta`); TRoleta = Dpn }

        // Timeout Crime
        if (Crime !== null && 1200000 - (Date.now() - Crime) > 0) {
            TCrime = `${e.Loading} ${GetTimeout(1200000, Crime)}`
        } else { sdb.delete(`Users.${user.id}.Timeouts.Crime`); TCrime = Dpn }

        // Timeout Bitcoin
        if (Bitcoin !== null && 7200000 - (Date.now() - Bitcoin) > 0) {
            TBit = `${e.Loading} ${GetTimeout(7200000, Bitcoin)}`
        } else { sdb.delete(`Users.${user.id}.Timeouts.Bitcoin`); TBit = Dpn }

        // Timeout Likes
        if (Rep !== null && 1800000 - (Date.now() - Rep) > 0) {
            TLikes = `${e.Loading} ${GetTimeout(1800000, Rep)}`
        } else { sdb.delete(`Users.${user.id}.Timeouts.Rep`); TLikes = Dpn }

        // Timeout Helpier
        if (Helpier !== null && 604800000 - (Date.now() - Helpier) > 0) {
            THelpier = `${e.Loading} ${GetTimeout(604800000, Helpier)}`
        } else { sdb.delete(`Users.${user.id}.Timeouts.Helpier`); THelpier = `${e.Deny} \`Indisponível\`` }

        // Timeout Semanal
        if (Weekly !== null && 604800000 - (Date.now() - Weekly) > 0) {
            TWeek = `${e.Loading} ${GetTimeout(604800000, Weekly)}`
        } else { sdb.delete(`Users.${user.id}.Timeouts.Weekly`); TWeek = Dpn }

        // Timeout Mensal
        if (Monthly !== null && 2592000000 - (Date.now() - Monthly) > 0) {
            TMonth = `${e.Loading} ${GetTimeout(2592000000, Monthly)}`
        } else { sdb.delete(`Users.${user.id}.Timeouts.Monthly`); TMonth = Dpn }

        // Timeout Assalto
        if (Assalto !== null && 1200000 - (Date.now() - Assalto) > 0) {
            TAssalto = `${e.Loading} ${GetTimeout(1200000, Assalto)}`
        } else { sdb.delete(`Users.${user.id}.Timeouts.Assalto`); TAssalto = Dpn }

        // Timeout Roubo
        if (Roubo !== null && 1200000 - (Date.now() - Roubo) > 0) {
            TRob = `${e.Loading} ${GetTimeout(1200000, Roubo)}`
        } else { sdb.delete(`Users.${user.id}.Timeouts.Roubo`); TRob = Dpn }

        // Timeout Reacts
        if (TimeReact !== null && 40000 - (Date.now() - TimeReact) > 0) {
            TReact = `${e.Loading} ${GetTimeout(40000, TimeReact)}`
        } else { sdb.delete(`Users.${user.id}.Timeouts.React`); TReact = Dpn }

        // Timeout Bolsa
        if (Bolsa !== null && 172800000 - (Date.now() - Bolsa) > 0) {
            TBolsa = `${e.Loading} ${GetTimeout(172800000, Bolsa)}`
        } else { sdb.delete(`Users.${user.id}.Timeouts.Bolsa`); TBolsa = Dpn }

        // Timeout Vip
        if (Vip.Permanent) {
            TVip = `\`Permanente\``
        } else {
            if (Vip.DateNow !== null && Vip.TimeRemaing - (Date.now() - Vip.DateNow) > 0) {
                TVip = `${e.Loading} ${GetTimeout(Vip.TimeRemaing, Vip.DateNow)}`
            } else { sdb.delete(`Users.${user.id}.Timeouts.Vip`); TVip = `${e.GrayStar} \`Vip Indisponível\`` }
        }

        if (['global', 'globais', 'saphire'].includes(args[0]?.toLowerCase()))
            return SendCooldownsSaphire()

        const Embed = new MessageEmbed()
            .setColor(Colors(user))
            .setTitle(`⏱️ ${client.user.username} Timeouts | ${user?.username || "User not found."}`)
            .setDescription('Aqui você pode conferir todos os timeouts.')
            .addFields(
                {
                    name: `${e.VipStar} Vip`,
                    value: TVip || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                },
                {
                    name: `${e.PepePreso} Preso`,
                    value: TPreso || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                },
                {
                    name: `${e.Helpier} Ajudante`,
                    value: THelpier || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                },
                {
                    name: '📊 Bolsa de Valores',
                    value: TBolsa || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                },
                {
                    name: `${e.CashAndCash} ${prefix}mensal`,
                    value: TMonth || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                },
                {
                    name: `${e.BagMoney2} ${prefix}semanal`,
                    value: TWeek || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                },
                {
                    name: `${e.MoneyWings} ${prefix}daily`,
                    value: TDaily || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                },
                {
                    name: `${e.PepeRich} ${prefix}work`,
                    value: TWork || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                },
                {
                    name: `${e.Pig} ${prefix}pig`,
                    value: TPig || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                },
                {
                    name: `${e.PepeOk} ${prefix}cu`,
                    value: TCu || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                },
                {
                    name: `🎫 ${prefix}roleta`,
                    value: TRoleta || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                },
                {
                    name: `${e.PepeCrime} ${prefix}crime`,
                    value: TCrime || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                },
                {
                    name: `${e.PandaBag} ${prefix}assaltar`,
                    value: TAssalto || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                },
                {
                    name: `${e.PandaBag} ${prefix}roubar`,
                    value: TRob || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                },
                {
                    name: `${e.BitCoin} ${prefix}bitcoin`,
                    value: TBit || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                },
                {
                    name: `${e.Like} ${prefix}like`,
                    value: TLikes || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                },
            )
            .setFooter(`${prefix}cd Saphire`)
        return message.reply({ embeds: [Embed] })

        function SendCooldownsSaphire() {
            const Embed = new MessageEmbed()
                .setColor(Colors(user))
                .setTitle(`⏱️ ${client.user.username} Timeouts | Global`)
                .setDescription('Timeouts Globais')
                .addFields(
                    {
                        name: `${e.MoneyWings} Restaurar Dívida`,
                        value: TRestoreDividas || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                    },
                    {
                        name: 'Reações Automáticas',
                        value: TReact || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                    },
                )
            return message.reply({ embeds: [Embed] })
        }
    }
}