const { e } = require('../../../JSON/emojis.json'),
    Moeda = require('../../../modules/functions/public/moeda'),
    Colors = require('../../../modules/functions/plugins/colors')

module.exports = {
    name: 'bingo',
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '💴',
    usage: '<bingo> quantia',
    description: 'Jogar bingo é divertido',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let authorData = await Database.User.findOne({ id: message.author.id }, 'Balance'),
            clientData = await Database.Client.findOne({ id: client.user.id }, 'GameChannels.Bingo'),
            canaisAtivos = clientData?.GameChannels?.Bingo || [],
            money = parseInt(authorData?.Balance) || 0,
            moeda = await Moeda(message)

        if (canaisAtivos.includes(message.channel.id)) return message.reply(`${e.Nagatoro} | Opa opa coisinha fofa! Já tem um bingo rolando nesse chat.`)

        const color = await Colors(message.author.id),
            BingoEmbed = new MessageEmbed()
                .setColor(color)
                .setTitle(`💴 Bingo ${client.user.username}`)
                .setDescription('Jogar bingo é MUITO BOM! Com este comando você e todo o chat pode jogar bingo sem toda aquela burocracia')
                .addField(`${e.SaphireObs} Como jogar?`, `Quando alguém mandar um bingo no chat, basta você digitar o **NÚMERO** que você acha que é.`)
                .addField(`${e.SaphireObs} Como iniciar um bingo?`, `Use o comando \`${prefix}bingo [quantia/all]\`. É só isso mesmo.`)
                .addField(`:tada: Bingo Party`, `Use o comando \`${prefix}bingo party\` e junte dinheiro com todos para um super bingo!`)
                .setFooter({ text: '*Bingo Party: Prêmios maiores que 2000 tem um taxa de 4%' })

        if (!args[0]) return message.reply({ embeds: [BingoEmbed] })

        if (['party'].includes(args[0]?.toLowerCase())) return bingoParty()

        let quantia = parseInt(args[0].replace(/k/g, '000'))
        if (['all', 'tudo'].includes(args[0]?.toLowerCase())) quantia = money
        if (isNaN(quantia)) return message.reply(`${e.Deny} | O valor não é um número`)
        if (quantia > money || quantia <= 0 || money <= 0) return message.reply(`${e.Deny} | Você não tem todo esse dinheiro na carteira.`)

        Database.subtract(message.author.id, quantia)
        Database.PushTransaction(message.author.id, `${e.loss} Inicou um bingo no valor de ${quantia || 0} Safiras`)

        let Number = Math.floor(Math.random() * 90)
        if (Number === 0) Number++

        let Bingo = new MessageEmbed()
            .setColor('GREEN')
            .setTitle(`${message.author.username} iniciou um Bingo.`)
            .setDescription(`🏆 ${quantia} ${moeda}\n \nAdivinhe o número do bingo!\n**1 a 90**`),
            msg = await message.channel.send({ embeds: [Bingo] }),
            toCancel = false

        bingoStarted()

        const collector = message.channel.createMessageCollector({
            filter: msg => msg.content === `${Number}`,
            max: 1,
            time: 60000
        })

        collector.on('collect', async winner => {

            Bingo.setTitle(`${message.author.username} fez um Bingo.`)
                .setDescription(`🏆 ${quantia} ${moeda}\n${e.OwnerCrow} ${winner.author} Acertou o número: ${Number}`).setFooter({ text: 'Concluído' })

            msg.edit({ embeds: [Bingo] }).catch(() => { })
            Database.add(winner.id, quantia)
            toCancel = true
            Database.PushTransaction(winner.author.id, `${e.gain} Recebeu ${quantia || 0} Safiras jogando no bingo`)
            winner.reply(`${e.MoneyWings} | ${winner.author} acertou o número do bingo! **${Number}**`).catch(() => { })

            finishBingo()
            return

        })

        collector.on('end', () => {

            if (toCancel) return

            Bingo.setColor('RED').setTitle(`${message.author.username} fez um Bingo.`).setDescription(`🏆 ${quantia} ${moeda}\n${e.Deny} Ninguém acertou o número: ${Number}`).setFooter({ text: 'Concluído' })
            msg.edit({ embeds: [Bingo] }).catch(() => { })
            Database.add(message.author.id, quantia)
            Database.PushTransaction(message.author.id, `${e.gain} Recebeu ${quantia || 0} Safiras jogando no bingo`)
            finishBingo()
            return message.channel.send(`${e.Deny} | Tempo do bingo expirado!\n${message.author}, o dinheiro lançado no Bingo retornou a sua carteira.`)

        })

        async function bingoParty() {

            let emojis = ['✅', '🎉']

            if (!args[1]) return message.reply(
                {
                    embeds: [
                        new MessageEmbed()
                            .setColor(client.blue)
                            .setTitle(`${emojis[1]} Bingo Party`)
                            .setDescription(`A Bingo Party é onde as pessoas podem se reunir para apostar o mesmo valor em um único bingo!`)
                            .addFields(
                                {
                                    name: `${e.QuestionMark} Quem pode participar?`,
                                    value: 'Todos que tiverem a quantia de safiras dada pelo criador da Bingo Party'
                                },
                                {
                                    name: `${e.QuestionMark} Como jogar?`,
                                    value: `O criador da Bingo Party deve usar o comando abaixo. Todos que queiram entrar no jogo, deve clicar no emoji "${emojis[1]}". O valor será descontado da carteira e adicionado ao prêmio do jogo.`
                                },
                                {
                                    name: `${e.QuestionMark} O que acontece se ninguém acertar o número?`,
                                    value: 'Todo o prêmio irá para a loteria.'
                                },
                                {
                                    name: `${e.Gear} Comando`,
                                    value: `\`${prefix}bingo party <quantia>\``
                                }
                            )
                    ]
                }
            )

            let quantia = parseInt(args[1]?.replace(/k/g, '000'))
            if (['all', 'tudo'].includes(args[1]?.toLowerCase())) quantia = money
            if (isNaN(quantia)) return message.reply(`${e.Deny} | O valor não é um número`)
            if (quantia > money || quantia <= 0 || money <= 0) return message.reply(`${e.Deny} | Você não tem todo esse dinheiro na carteira.`)

            let buttons = {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Iniciar Bingo Party',
                        custom_id: 'init',
                        emoji: '✅',
                        style: 'PRIMARY',
                        disabled: true
                    },
                    {
                        type: 2,
                        label: 'Participar',
                        emoji: '🎉',
                        custom_id: 'join',
                        style: 'SUCCESS'
                    }
                ]
            }

            let initMessage = await message.channel.send(
                {
                    content: `${e.Loading} | ${message.author} iniciou um "${emojis[1]} Bingo Party". Valor proposto **${quantia} ${moeda}**`,
                    components: [buttons]
                }
            ),
                arrayControl = [],
                prize = quantia

            Database.subtract(message.author.id, quantia)
            arrayControl.push(message.author.id)

            const collector = initMessage.createMessageComponentCollector({
                filter: () => true,
                time: 60000,
                errors: ['time']
            })

            collector.on('collect', async (interaction) => {
                interaction.deferUpdate().catch(() => { })

                let user = interaction.user,
                    customId = interaction.customId

                if (customId === 'init' && user.id === message.author.id)
                    return collector.stop()

                if (customId === 'join' && !arrayControl.includes(user.id)) {

                    let userData = await Database.User.findOne({ id: user.id }, 'Balance'),
                        userBalance = userData.Balance || 0

                    if (!userData || !userBalance || userBalance < quantia) return message.reply(`${e.Deny} | ${user}, você não possui a quantia de entrada no bingo.`)

                    Database.subtract(user.id, quantia)
                    prize += quantia
                    arrayControl.push(user.id)

                    if (arrayControl.length > 1 && buttons.components[0].disabled) {
                        buttons.components[0].disabled = false
                        initMessage.edit({ components: [buttons] }).catch(() => { })
                    }

                    return message.channel.send(`${emojis[1]} | ${user} entrou na Bingo Party!`)

                }

            })

            collector.on('end', () => bingoPartyInit())

            async function bingoPartyInit() {

                initMessage.delete().catch(() => { })

                if (arrayControl.length < 1 || arrayControl.length === 1 && arrayControl.includes(message.author.id)) {
                    Database.add(message.author.id, quantia)
                    return message.channel.send(`${e.Deny} | Bingo Party cancelada por falta de participantes.`)
                }

                let taxa = 0
                if (prize > 2000) {
                    taxa += parseInt(prize * 0.04).toFixed(0)
                    if (taxa > 0) prize -= taxa
                }

                let msg1 = await message.channel.send(`${emojis[1]} | Tudo certo! Bingo começando em 10 segundos!\n💰 | Prêmio: **${prize} ${moeda}** ${taxa > 0 ? `\`${e.Taxa} Taxa: -${taxa} ${moeda}\`` : ''}`)
                let msg2 = await message.channel.send(`👥 | ${arrayControl.length} participantes\n${arrayControl.map((id, i) => `${i + 1}. <@${id}>`).join('\n')}`).catch(() => { })

                let Number = Math.floor(Math.random() * 90)
                if (Number === 0) Number++

                setTimeout(async () => {
                    msg1.delete().catch(() => { })
                    msg2.delete().catch(() => { })

                    let Bingo = new MessageEmbed()
                        .setColor('GREEN')
                        .setTitle(`${emojis[1]} ${message.author.username} iniciou uma Bingo Party.`)
                        .setDescription(`🏆 ${prize} ${moeda}\n \nAdivinhe o número do bingo!\n**1 a 90**`),
                        msg = await message.channel.send({ embeds: [Bingo] }),
                        toCancel = false

                    bingoStarted()
                    const collector = message.channel.createMessageCollector({
                        filter: m => m.content === `${Number}` && arrayControl.includes(m.author.id),
                        time: 60000,
                        errors: ['time']
                    });

                    collector.on('collect', winner => {

                        toCancel = true

                        Bingo.setColor('RED')
                            .setTitle(`${emojis[1]} ${message.author.username} fez uma Bingo Party.`)
                            .setDescription(`🏆 ${prize} ${moeda}\n \n${winner.author} acertou o número **\`${Number}\`**`)

                        Database.add(winner.author.id, prize)
                        Database.PushTransaction(winner.author.id, `${e.gain} Recebeu ${prize || 0} Safiras jogando na ${emojis[1]} Bingo Party`)
                        msg.edit({ embeds: [Bingo] }).catch(() => { })
                        collector.stop()
                        return winner.reply(`${emojis[1]} | ${winner.author} acertou o número da Bingo Party! **\`${Number}\`**\n${taxa > 0 ? `${e.Taxa} | Taxa da Bingo Party (5%): ${taxa} ${moeda}` : ''}`)
                    })

                    collector.on('end', () => {
                        finishBingo()
                        if (toCancel) return

                        Bingo.setColor('RED')
                            .setTitle(`${emojis[1]} ${message.author.username} fez uma Bingo Party.`)
                            .setDescription(`🏆 ${prize} ${moeda}\n \nNinguém adivinhou o número **\`${Number}\`**`)

                        msg.edit({ embeds: [Bingo] }).catch(() => { })

                        Database.addLotery(prize, client.user.id)
                        return message.channel.send(`${e.Deny} | Ninguém acertou o número da ${emojis[1]} Bingo Party. **\`${Number}\`**\n${e.Taxa} | Dinheiro adicionado a loteria.`)
                    })

                }, 10000)

            }

        }

        async function finishBingo() {
            await Database.Client.updateOne(
                { id: client.user.id },
                { $pull: { ['GameChannels.Bingo']: message.channel.id } }
            )
            return
        }

        async function bingoStarted() {
            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { ['GameChannels.Bingo']: message.channel.id } }
            )
            return
        }

    }
}