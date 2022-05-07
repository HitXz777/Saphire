const { DatabaseObj: { e } } = require('../../../modules/functions/plugins/database'),
    Colors = require('../../../modules/functions/plugins/colors')

module.exports = {
    name: 'cooldown',
    aliases: ['cd', 'timeouts', 'tm'],
    category: 'util',
    emoji: '⏱️',
    usage: '<cooldown> <@user/id>',
    description: 'Verifique os seus tempos',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.users.first() || message.mentions.repliedUser || client.users.cache.find(data => data.username?.toLowerCase() === args.join(' ')?.toLowerCase() || data.tag?.toLowerCase() === args[0]?.toLowerCase() || data.discriminator === args[0] || data.id === args[0]) || message.author

        const msg = await message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor(client.blue)
                    .setDescription(`${e.Loading} | Carregando...`)
            ]
        })

        let data = await Database.User.findOne({ id: user.id }, 'Timeouts Vip'),
            clientData = await Database.Client.findOne({ id: client.user.id }, 'Timeouts'),
            color = await Colors(user.id),
            timeouts = data?.Timeouts,
            clientTimeouts = clientData?.Timeouts

        if (!timeouts) return msg.edit({ content: `${e.Database} | DATABASE | Nenhum dado foi encontrado para: **${user.tag} \`${user.id}\`**`, embeds: [] })

        let Daily = timeouts.Daily,
            Porquinho = timeouts.Porquinho,
            Work = timeouts.Work,
            Cu = timeouts.Cu,
            Roleta = timeouts.Roleta,
            Bitcoin = timeouts.Bitcoin,
            Rep = timeouts.Rep,
            Vip = {
                DateNow: data.Vip.DateNow,
                TimeRemaing: data.Vip.TimeRemaing || 0,
                Permanent: data.Vip.Permanent
            },
            TDaily, TPig, TWork, TRestoreDividas, TCu, TRoleta, TBit, TLikes, TVip,
            TimeRestoreDividas = clientTimeouts.RestoreDividas

        // Timeout Daily
        TDaily = cooldown(86400000, Daily)

        // Timeout Pig
        TPig = cooldown(30000, Porquinho)

        // Timeout Work
        TWork = cooldown(66400000, Work)

        // Timeout RestoreDividas
        TRestoreDividas = cooldown(86400000, TimeRestoreDividas)

        // Timeout Cu
        TCu = cooldown(600000, Cu)

        // Timeout Roleta
        TRoleta = cooldown(1200000, Roleta)

        // Timeout Bitcoin
        TBit = cooldown(7200000, Bitcoin)

        // Timeout Likes
        TLikes = cooldown(1800000, Rep)

        // Timeout Vip
        TVip = cooldown(Vip.TimeRemaing, Vip.DateNow, true)

        if (['global', 'globais', 'saphire'].includes(args[0]?.toLowerCase()))
            return SendCooldownsSaphire()

        return msg.edit({
            embeds: [
                new MessageEmbed()
                    .setColor(color)
                    .setTitle(`⏱️ ${client.user.username} Timeouts | ${user?.username || "User not found."}`)
                    .setDescription('Aqui você pode conferir todos os timeouts.')
                    .addFields(
                        {
                            name: `${e.VipStar} Vip`,
                            value: TVip || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
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
                            name: `${e.BitCoin} ${prefix}bitcoin`,
                            value: TBit || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                        },
                        {
                            name: `${e.Like} ${prefix}like`,
                            value: TLikes || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                        },
                    )
                    .setFooter({ text: `${prefix}cd Saphire` })
            ]
        }).catch(() => { })

        function SendCooldownsSaphire() {
            return msg.edit({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`⏱️ ${client.user.username} Timeouts | Global`)
                        .setDescription('Timeouts Globais')
                        .addFields(
                            {
                                name: `${e.MoneyWings} Restaurar Dívida`,
                                value: TRestoreDividas || `\`Você não deveria ver essa mensagem... Usa "${prefix}bug", por favor?\``
                            }
                        )
                ]
            }).catch(() => { })
        }

        function cooldown(ms, timeDatabase = 0, vip = false) {

            if (vip) {
                if (Vip.Permanent) return `\`Permanente\``
                return ms - (Date.now() - timeDatabase) > 0 ? cooldown(ms, timeDatabase) : '\`Indisponível\`'
            }

            return client.Timeout(ms, timeDatabase) ? `${e.Loading} \`${client.GetTimeout(ms, timeDatabase)}\`` : `${e.Check} \`Disponível\``
        }
    }
}
