const Moeda = require('../../../modules/functions/public/moeda')

module.exports = {
    name: 'pay',
    description: '[economy] Page outras pessoas',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'member',
            description: 'Membro a receber o dinheiro',
            type: 6,
            required: true
        },
        {
            name: 'quantity',
            description: 'Valor a ser enviado',
            type: 4,
            required: true
        }
    ],
    async execute({ interaction: interaction, client: client, database: Database, emojis: e }) {

        const { options, guild, user: author } = interaction

        let moeda = await Moeda(false, guild.id),
            user = options.getUser('member')

        if (user.id === client.user.id)
            return await interaction.reply({
                content: `${e.HiNagatoro} | Preciso não coisa fofa, eu já sou rica.`,
                ephemeral: true
            })

        if (user.id === author.id)
            return await interaction.reply({
                content: `${e.Deny} | Nada de pagar você mesmo.`,
                ephemeral: true
            })

        if (user.bot)
            return await interaction.reply({
                content: `${e.Deny} | Nada de bots.`,
                ephemeral: true
            })

        let authorData = await Database.User.findOne({ id: author.id }, 'Balance'),
            userData = await Database.User.findOne({ id: user.id }, 'id')

        if (!userData)
            return await interaction.reply({
                content: `${e.Database} | DATABASE | O usuário **${user} \`${user.id}\`** não se encontra no meu banco de dados. Diga para ele/a mandar uma mensageem no chat que eu registro rapidinho!`,
                ephemeral: true
            })

        let money = authorData.Balance || 0

        if (money <= 0)
            return await interaction.reply({
                content: `${e.Deny} | Você não possui dinheiro para efetuar pagamentos.`,
                ephemeral: true
            })

        let quantia = options.getInteger('quantity')

        if (quantia <= 0)
            return await interaction.reply({
                content: `${e.Deny} | Você não pode pagar alguém com menos de 1 ${moeda}, baaaaka.`,
                ephemeral: true
            })

        if (quantia > money)
            return await interaction.reply({
                content: `${e.Deny} | Você não possui todo esse dinheiro.`,
                ephemeral: true
            })

        let payCache = quantia
        Database.subtract(author.id, quantia)

        let msg = await interaction.reply({
            content: `${e.Loading} | Transferir **${payCache} ${moeda}** de ${author} para ${user}?${quantia >= 1000 ? `\n> *${e.Taxa} Pagamentos acima de 1000 ${moeda} sofrem uma taxa de 5%.*` : ''}\n \n> **ATENÇÃO:** A Saphire e sua equipe não irá se responsabilizar por *${moeda}* perdidas. Pense bem para quem você manda seu dinheiro. Dinheiro perdido não será devolvido.\n> *obs: Os dois lados devem confirmar o pagamento.*`,
            fetchReply: true
        }),
            emojis = ['✅', '❌'], control = [], reacted = false

        for (let emoji of emojis) msg.react(emoji).catch(() => { })

        const collector = msg.createReactionCollector({
            filter: (r, u) => emojis.includes(r.emoji.name) && [author.id, user.id].includes(u.id),
            time: 60000
        })

            .on('collect', (reaction, u) => {

                if (reaction.emoji.name === emojis[1]) return collector.stop()

                if (reaction.emoji.name === emojis[0] && !control.includes(u.id))
                    control.push(u.id)

                if (control.includes(user.id) && control.includes(author.id))
                    return paymentStart()

                return
            })

            .on('end', () => {
                if (reacted) return

                Database.add(author.id, payCache)
                return msg.edit(`${e.Deny} | Pagamento cancelado.`).catch(() => { })
            })

        function paymentStart() {

            reacted = true

            let taxa = parseInt((payCache * 0.05).toFixed(0)),
                taxaValidate

            if (payCache >= 1000) {
                payCache -= taxa
                taxaValidate = `\n${e.Taxa} | *Pagamentos maiores que 1000 ${moeda} tem uma taxa de 5% (-${taxa})*`
            }

            Database.PushTransaction(user.id, `${e.gain} Recebeu ${payCache} Safiras de ${author.tag} em um pagamento`)
            Database.PushTransaction(author.id, `${e.loss} Enviou ${payCache} Safiras para ${client.users.cache.get(user.id)?.tag} em um pagamento`)
            Database.add(user.id, payCache)
            return msg.edit({
                content: `${e.Check} | ${author} -> ${user} | Pagamento efetuado com sucesso!${taxaValidate || ''}`
            }).catch(() => { })
        }
    }
}