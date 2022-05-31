const { e } = require('../../../JSON/emojis.json'),
    { MessageButton, MessageActionRow } = require('discord.js'),
    Moeda = require('../../../modules/functions/public/moeda')

module.exports = {
    name: 'jokempo',
    aliases: ['jokenpo', 'jkp', 'ppt', 'jokenpô', 'jokempô'],
    category: 'games',
    emoji: '✂️',
    usage: '<jkp> <info>',
    description: 'Vai um jokempo?',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (['delete', 'del', 'deletar', 'excluir', 'apagar'].includes(args[0]?.toLowerCase())) return deleteData()
        if (['winrate', 'status', 'stats'].includes(args[0]?.toLowerCase())) return calculateWinrate()
        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return jokempoInfo()

        let user = message.mentions.members.first() || message.guild.members.cache.find(data => data.id === args[0] || data.displayName?.toLowerCase() === args.join(' '))

        if (['bet', 'aposta', 'apostar'].includes(args[0]?.toLowerCase())) return betJokempoSystem()
        if (!user) return message.reply(`${e.Info} | Marque alguém para iniciar o jokempo.`)

        if (user.id === message.author.id)
            return message.reply(`${e.Deny} | Você não pode iniciar um jokempo contra você mesmo.`)

        if (user.id === client.user.id)
            return message.reply(`${e.SaphireOk} | Foi mal, mas eu ganharia fácil.`)

        if (user.user.bot)
            return message.reply(`${e.Deny} | Bots não participam desse jogo, sorry.`)

        return questionToUser()

        async function questionToUser() {

            let buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('accept')
                        .setEmoji('✅')
                        .setLabel('Aceitar')
                        .setStyle('SUCCESS')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('deny')
                        .setEmoji('❌')
                        .setLabel('Recusar')
                        .setStyle('DANGER')
                )

            let msg = await message.reply({
                content: `${e.QuestionMark} | ${user}, você aceita iniciar um jogo *Jokempo* contra ${message.author}?`,
                components: [buttons]
            }),
                validate = false,
                collector = msg.createMessageComponentCollector({
                    filter: () => true,
                    time: 30000,
                    errors: ['time']
                })

                    .on('collect', (interaction) => {
                        interaction.deferUpdate().catch(() => { })

                        if (interaction.user.id !== user.id) return

                        if (interaction.customId === 'accept') {
                            validate = true
                            collector.stop()
                            msg.delete().catch(() => { })
                            return init()
                        }

                        if (interaction.customId === 'deny') {
                            validate = true
                            collector.stop()
                            return msg.edit({ content: `${e.Deny} | Desafio recusado`, components: [] }).catch(() => { })
                        }

                        return

                    })

                    .on('end', () => {

                        if (validate) return
                        return msg.edit({ content: `${e.Deny} | Jogo cancelado.`, components: [] }).catch(() => { })
                    })
        }

        async function init() {

            let usersControl = [],
                userChoice = '',
                authorChoice = ''

            let buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('scissors')
                        .setEmoji('✂️')
                        .setLabel('Tesoura')
                        .setStyle('PRIMARY')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('rock')
                        .setEmoji('🪨')
                        .setLabel('Pedra')
                        .setStyle('PRIMARY')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('paper')
                        .setEmoji('🧾')
                        .setLabel('Papel')
                        .setStyle('PRIMARY')
                )

            const msg = await message.channel.send(
                {
                    content: `${e.Loading} ${message.author}\n${e.Loading} ${user}`,
                    components: [buttons]
                }
            )

            return msg.createMessageComponentCollector({
                filter: () => true,
                idle: 30000,
                errors: ['idle']
            })

                .on('collect', (interaction) => {
                    interaction.deferUpdate().catch(() => { })

                    if (![user.id, message.author.id].includes(interaction.user.id)) return

                    if (usersControl.includes(interaction.user.id))
                        return

                    interaction.user.id === message.author.id
                        ? usersControl.push(message.author.id)
                        : usersControl.push(user.id)

                    let value = interaction.customId

                    if (value === 'scissors')
                        interaction.user.id === message.author.id ? authorChoice = 'scissors' : userChoice = 'scissors'

                    if (value === 'rock')
                        interaction.user.id === message.author.id ? authorChoice = 'rock' : userChoice = 'rock'

                    if (value === 'paper')
                        interaction.user.id === message.author.id ? authorChoice = 'paper' : userChoice = 'paper'

                    if (usersControl.length === 2)
                        return result(authorChoice, userChoice, msg)

                    interaction.user.id === message.author.id
                        ? msg.edit(`${e.Check} ${message.author}\n${e.Loading} ${user}`).catch(() => { })
                        : msg.edit(`${e.Loading} ${message.author}\n${e.Check} ${user}`).catch(() => { })

                    return

                })

                .on('end', () => {

                    if (usersControl.length === 2) return
                    return msg.edit({ content: `${e.Deny} | Jogo cancelado.`, components: [] }).catch(() => { })
                })

        }

        async function result(authorChoice, userChoice, msg) {

            const jokempoObject = {
                scissors: '✂️',
                paper: '🧾',
                rock: '🪨'
            }

            if (authorChoice === userChoice)
                return msg.edit(
                    {
                        content: `🏳️ | ${message.author} & ${user}, vocês empataram (${jokempoObject[authorChoice]} X ${jokempoObject[authorChoice]}).`,
                        components: []
                    }
                ).catch(() => { })

            if (authorChoice === 'scissors' && userChoice === 'paper') {
                registerVictory(true)
                return msg.edit(
                    {
                        content: `${e.OwnerCrow} | ${message.author} (✂️) ganhou o *jokempo* contra ${user} (🧾)`,
                        components: []
                    }
                ).catch(() => { })
            }

            if (authorChoice === 'scissors' && userChoice === 'rock') {
                registerVictory(false)
                return msg.edit(
                    {
                        content: `${e.SaphireDie} | ${message.author} (✂️) perdeu o *jokempo* contra ${user} (🪨)`,
                        components: []
                    }
                ).catch(() => { })
            }

            if (authorChoice === 'paper' && userChoice === 'rock') {
                registerVictory(true)
                return msg.edit(
                    {
                        content: `${e.OwnerCrow} | ${message.author} (🧾) ganhou o *jokempo* contra ${user} (🪨)`,
                        components: []
                    }
                ).catch(() => { })
            }

            if (authorChoice === 'paper' && userChoice === 'scissors') {
                registerVictory(false)
                return msg.edit(
                    {
                        content: `${e.SaphireDie} | ${message.author} (🧾) perdeu o *jokempo* contra ${user} (✂️)`,
                        components: []
                    }
                ).catch(() => { })
            }

            if (authorChoice === 'rock' && userChoice === 'paper') {
                registerVictory(false)
                return msg.edit(
                    {
                        content: `${e.SaphireDie} | ${message.author} (🪨) perdeu o *jokempo* contra ${user} (🧾)`,
                        components: []
                    }
                ).catch(() => { })
            }

            if (authorChoice === 'rock' && userChoice === 'scissors') {
                registerVictory(true)
                return msg.edit(
                    {
                        content: `${e.OwnerCrow} | ${message.author} (🪨) ganhou o *jokempo* contra ${user} (✂️)`,
                        components: []
                    }
                ).catch(() => { })
            }

            return msg.edit(
                {
                    content: `${e.QuestionMark} | Resultado indefinido.`,
                    components: []
                }
            ).catch(() => { })
        }

        async function registerVictory(authorWin, jokempoBet = false, prize = 0, draw = false) {

            let moeda = await Moeda(message)

            if (jokempoBet) {
                if (draw) {
                    Database.add(message.author.id, prize / 2)
                    Database.add(user.id, prize / 2)
                } else {
                    if (authorWin) {
                        Database.add(message.author.id, prize)
                        Database.PushTransaction(message.author.id, `${e.gain} Ganhou ${(prize / 2).toFixed(0)} ${moeda} em um *Jokempo Bet* contra ${user.user.tag}`)
                        Database.PushTransaction(user.id, `${e.loss} Perdeu ${(prize / 2).toFixed(0)} ${moeda} em um *Jokempo Bet* contra ${message.author.tag}`)
                    } else {
                        Database.add(user.id, prize)
                        Database.PushTransaction(user.id, `${e.gain} Ganhou ${(prize / 2).toFixed(0)} ${moeda} em um *Jokempo Bet* contra ${message.author.tag}`)
                        Database.PushTransaction(message.author.id, `${e.loss} Perdeu ${(prize / 2).toFixed(0)} ${moeda} em um *Jokempo Bet* contra ${user.user.tag}`)
                    }
                }
            }

            if (authorWin) {
                await Database.User.updateOne(
                    { id: message.author.id },
                    {
                        $inc: { 'Jokempo.Wins': 1 }
                    },
                    { upsert: true }
                )
                await Database.User.updateOne(
                    { id: user.id },
                    {
                        $inc: { 'Jokempo.Loses': 1 }
                    },
                    { upsert: true }
                )
            } else {
                await Database.User.updateOne(
                    { id: message.author.id },
                    {
                        $inc: { 'Jokempo.Loses': 1 }
                    },
                    { upsert: true }
                )
                await Database.User.updateOne(
                    { id: user.id },
                    {
                        $inc: { 'Jokempo.Wins': 1 }
                    },
                    { upsert: true }
                )
            }

        }

        async function deleteData() {

            let clientData = await Database.Client.findOne({ id: client.user.id }, 'Administradores'),
                adms = clientData?.Administradores || []

            if (!adms.includes(message.author.id))
                return message.reply(`${e.Admin} | Este comando é privado aos Administradores do meu sistema.`)

            let user = message.mentions.users.first() || client.users.cache.get(args[1]) || client.users.cache.find(data => data.username?.toLowerCase() === args.join(' ')?.toLowerCase()) || client.users.cache.find(data => data.tag.toLowerCase() === args[1]?.toLowerCase()) || client.users.cache.find(data => data.discriminator === args[1])

            if (!user) return message.reply(`${e.Deny} | Usuário não encontrado.`)

            let userData = await Database.User.findOne({ id: user.id }, 'Jokempo')

            if (!userData || !userData.Jokempo)
                return message.reply(`${e.Deny} | Este usuário não possui nenhum dado do Jokempo.`)

            await Database.User.updateOne(
                { id: user.id },
                {
                    $unset: { 'Jokempo': 1 }
                }
            )

            return message.reply(`${e.Check} | Os dados do game Jokempo foram deletados da conta de **${user.tag}** \`${user.id}\`.`)

        }

        function jokempoInfo() {
            return message.reply(
                {
                    embeds: [
                        new MessageEmbed()
                            .setColor(client.blue)
                            .setTitle(`✂️ ${client.user.username}'s Jokempo Game`)
                            .setDescription('Todo mundo gosta de um clássico jokempo. Vamos jogar?')
                            .addFields(
                                {
                                    name: `${e.Gear} Começar um jogo`,
                                    value: `\`${prefix}jokempo @user\``
                                },
                                {
                                    name: `${e.CoroaDourada} Ranking`,
                                    value: `\`${prefix}rank jokempo [me/@user/local]\``
                                },
                                {
                                    name: '% WinRate',
                                    value: `\`${prefix}jokempo winrate [@user]\``
                                },
                                {
                                    name: `${e.MoneyWings} Bet no jokempo`,
                                    value: `\`${prefix}jokempo bet @user quantia\``
                                },
                                {
                                    name: '+ Atalhos',
                                    value: '\`jkp\`, \`jokenpo\`'
                                },
                            )
                            .setFooter({ text: `${client.user.username}'s Games` })
                    ]
                }
            )
        }

        async function calculateWinrate() {

            let user = message.mentions.users.first() || client.users.cache.find(data => data.username?.toLowerCase() === args.join(' ')?.toLowerCase() || data.tag?.toLowerCase() === args[0]?.toLowerCase() || data.discriminator === args[0] || data.id === args[0]) || message.mentions.repliedUser || message.author

            let data = await Database.User.findOne({ id: user.id }, 'Jokempo')

            if (!data || !data.Jokempo)
                return message.reply(`${e.Deny} | Nenhum dado encontrado para o calculo do winrate.`)

            let winrate = {
                win: data?.Jokempo?.Wins || 0,
                lose: data?.Jokempo?.Loses || 0
            }

            winrate.result = cal(winrate.win, winrate.lose)

            function cal(win, lose) {
                let allMatch = win + lose
                let percentWins = win / allMatch
                return percentWins * 100
            }

            return message.reply(`${e.Info} | ${user.id === message.author.id ? 'Seu winrate' : `O winrate de ${user.tag}`} no jokempo é de ${winrate.result?.toFixed(3)}%.`)

        }

        async function betJokempoSystem() {

            if (!user) return message.reply(`${e.Info} | Você precisa dizer quem é o usuário. \`${prefix}jokempo @user Quantia\``)

            if (user.id === message.author.id)
                return message.reply(`${e.Deny} | Seu esquisito... Marca alguém além de você, né?`)

            if (user.id === client.user.id)
                return message.reply(`${e.SaphireOk} | Apostar comigo é o mesmo que dar seu dinheiro pra mim, eu ganho de olhos fechados...`)

            if (user.user.bot) return message.reply(`${e.Deny} | Nada de bots, ok?`)

            let dataUsers = await Database.User.find({
                id: {
                    $in: [message.author.id, user.id]
                }
            }, 'id Balance')

            let data = {
                author: dataUsers.find(d => d.id === message.author.id),
                user: dataUsers.find(d => d.id === user.id)
            }

            if (!data.user) {
                Database.registerUser(user.user)
                return message.reply(`${e.Database} | DATABASE | Não foi possível encontrar nenhum data de ${user.user.tag}. Eu acabei de efetuar o registro, por favor, use o comando novamente.`)
            }

            data.authorBalance = data.author?.Balance || 0
            data.userBalance = data.user?.Balance || 0

            let quantia = parseInt(args[2]?.replace(/k/g, '000'))
            if (['all', 'tudo', 'todos'].includes(args[2]?.toLowerCase())) quantia = data.authorBalance
            if (!quantia || isNaN(quantia)) return message.reply(`${e.Deny} | Você precisa dizer um valor válido e obviamente que você tenha. Lembrando, nada de valores negativos.`)
            if (quantia <= 0) return message.reply(`${e.Deny} | Nada de valor menor ou igual a 0, ok?`)

            let moeda = await Moeda(message)

            if (data.authorBalance <= 0)
                return message.reply(`${e.Deny} | Você não possui dinheiro pra apostar não... Olha seu saldo que tristeza: **${data.authorBalance} ${moeda}**`)

            if (data.authorBalance < quantia)
                return message.reply(`${e.Deny} | Você não possui todo esse dinheiro, ainda falta **${(quantia - data.authorBalance)?.toFixed(0)} ${moeda}** pra completar o valor.`)

            if (data.userBalance < quantia)
                return message.reply(`${e.Deny} | ${user.displayName} não tem todo esse dinheiro.`)

            let buttons = {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Aceitar aposta',
                        custom_id: 'init',
                        style: 'SUCCESS'
                    },
                    {
                        type: 2,
                        label: 'Recusar',
                        custom_id: 'cancel',
                        style: 'DANGER'
                    }
                ]
            }

            const Msg = await message.channel.send(
                {
                    content: `${e.Loading} ${user}, você está sendo desafiado*(a)* por ${message.author} para um *jokempo bet* valendo **${quantia} ${moeda}**.`,
                    components: [buttons]
                }
            )

            return Msg.createMessageComponentCollector({
                filter: (int) => [user.id, message.author.id].includes(int.user.id),
                time: 30000,
                errors: ['time']
            })
                .on('collect', async (interaction) => {
                    interaction.deferUpdate().catch(() => { })

                    if (interaction.customId === 'init' && interaction.user.id === user.id) {

                        Msg.delete().catch(() => { })

                        let dataUsers = await Database.User.find({
                            id: {
                                $in: [message.author.id, user.id]
                            }
                        }, 'id Balance')

                        let data = {
                            author: dataUsers.find(d => d.id === message.author.id),
                            user: dataUsers.find(d => d.id === user.id)
                        }

                        let authorBalance = data.author?.Balance || 0
                        let userBalance = data.user?.Balance || 0

                        if (authorBalance < quantia || userBalance < quantia)
                            return message.reply(`${e.Gear} | **PROTECT DATA SYSTEM** | Uma tentativa de burla ao \`${client.user.username}'s Economy System\` foi detectada. Comando cancelado.`)

                        return initWithBet(quantia, user, moeda)
                    }

                    if (interaction.customId === 'cancel') {
                        Msg.edit(
                            {
                                content: `${e.Deny} | Desafio cancelado por ${interaction.user}.`,
                                components: []
                            }
                        ).catch(() => { })
                    }

                    return
                })
        }

        async function initWithBet(amount, user, moeda) {

            Database.subtract(message.author.id, amount)
            Database.subtract(user.id, amount)

            let usersControl = [],
                userChoice = '',
                authorChoice = '',
                prize = parseInt(amount * 2)

            let buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('scissors')
                        .setEmoji('✂️')
                        .setLabel('Tesoura')
                        .setStyle('PRIMARY')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('rock')
                        .setEmoji('🪨')
                        .setLabel('Pedra')
                        .setStyle('PRIMARY')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('paper')
                        .setEmoji('🧾')
                        .setLabel('Papel')
                        .setStyle('PRIMARY')
                )

            const msg = await message.channel.send(
                {
                    content: `${e.Loading} ${message.author}\n${e.Loading} ${user}\n> Escolham suas opções e boa sorte!\n> Valor: **${amount} ${moeda}**`,
                    components: [buttons]
                }
            )

            return msg.createMessageComponentCollector({
                filter: (int) => [user.id, message.author.id].includes(int.user.id),
                idle: 30000,
                errors: ['idle']
            })

                .on('collect', (interaction) => {
                    interaction.deferUpdate().catch(() => { })

                    if (usersControl.includes(interaction.user.id))
                        return

                    interaction.user.id === message.author.id
                        ? usersControl.push(message.author.id)
                        : usersControl.push(user.id)

                    let value = interaction.customId

                    if (value === 'scissors')
                        interaction.user.id === message.author.id ? authorChoice = 'scissors' : userChoice = 'scissors'

                    if (value === 'rock')
                        interaction.user.id === message.author.id ? authorChoice = 'rock' : userChoice = 'rock'

                    if (value === 'paper')
                        interaction.user.id === message.author.id ? authorChoice = 'paper' : userChoice = 'paper'

                    if (usersControl.length === 2)
                        return resultJokempoBet(authorChoice, userChoice, msg, prize)

                    interaction.user.id === message.author.id
                        ? msg.edit(`${e.Check} ${message.author}\n${e.Loading} ${user}`).catch(() => { })
                        : msg.edit(`${e.Loading} ${message.author}\n${e.Check} ${user}`).catch(() => { })

                    return

                })

                .on('end', () => {

                    if (usersControl.length === 2) return
                    registerVictory(false, true, prize, true)
                    return msg.edit({ content: `${e.Deny} | Jogo cancelado.`, components: [] }).catch(() => { })
                })

        }

        async function resultJokempoBet(authorChoice, userChoice, msg, prize) {

            const jokempoObject = {
                scissors: '✂️',
                paper: '🧾',
                rock: '🪨'
            }

            if (authorChoice === userChoice) {
                registerVictory(false, true, prize, true)
                return msg.edit(
                    {
                        content: `🏳️ | ${message.author} & ${user}, vocês empataram (${jokempoObject[authorChoice]} X ${jokempoObject[authorChoice]}).`,
                        components: []
                    }
                ).catch(() => { })
            }

            if (authorChoice === 'scissors' && userChoice === 'paper') {
                registerVictory(true, true, prize)
                return msg.edit(
                    {
                        content: `${e.OwnerCrow} | ${message.author} (✂️) ganhou o *jokempo bet* contra ${user} (🧾)`,
                        components: []
                    }
                ).catch(() => { })
            }

            if (authorChoice === 'scissors' && userChoice === 'rock') {
                registerVictory(false, true, prize)
                return msg.edit(
                    {
                        content: `${e.SaphireDie} | ${message.author} (✂️) perdeu o *jokempo bet* contra ${user} (🪨)`,
                        components: []
                    }
                ).catch(() => { })
            }

            if (authorChoice === 'paper' && userChoice === 'rock') {
                registerVictory(true, true, prize)
                return msg.edit(
                    {
                        content: `${e.OwnerCrow} | ${message.author} (🧾) ganhou o *jokempo bet* contra ${user} (🪨)`,
                        components: []
                    }
                ).catch(() => { })
            }

            if (authorChoice === 'paper' && userChoice === 'scissors') {
                registerVictory(false, true, prize)
                return msg.edit(
                    {
                        content: `${e.SaphireDie} | ${message.author} (🧾) perdeu o *jokempo bet* contra ${user} (✂️)`,
                        components: []
                    }
                ).catch(() => { })
            }

            if (authorChoice === 'rock' && userChoice === 'paper') {
                registerVictory(false, true, prize)
                return msg.edit(
                    {
                        content: `${e.SaphireDie} | ${message.author} (🪨) perdeu o *jokempo bet* contra ${user} (🧾)`,
                        components: []
                    }
                ).catch(() => { })
            }

            if (authorChoice === 'rock' && userChoice === 'scissors') {
                registerVictory(true, true, prize)
                return msg.edit(
                    {
                        content: `${e.OwnerCrow} | ${message.author} (🪨) ganhou o *jokempo bet* contra ${user} (✂️)`,
                        components: []
                    }
                ).catch(() => { })
            }

            registerVictory(false, true, prize, true)
            return msg.edit(
                {
                    content: `${e.QuestionMark} | Resultado indefinido.`,
                    components: []
                }
            ).catch(() => { })
        }

    }
}