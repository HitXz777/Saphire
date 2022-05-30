const Database = require('../../../modules/classes/Database'),
    { newReminder } = require('../plugins/modalPlugins')

async function selectMenuFunctions(interaction, client) {

    const { values, message, user, guild } = interaction

    let value = values[0]

    switch (value) {
        case 'newGiveaway': newGiveaway(); break;
        case 'newReminder': newReminder(interaction); break;
        case 'sendNewLetter': sendNewLetter(); break;
        case 'report': letterReport(); break;
        case '914925531529609247':
        case '980293085298839572':
        case '920012840356683776':
        case '899393472283410493':
        case '894615786138787941':
            reactionRole(); break;
        default: break;
    }

    return

    async function reactionRole() {

        let msgConfirmation = 'ℹ | Feedback'

        for (let roleId of values)
            await addRole(roleId)

        function addRole(roleId) {

            let role = guild.roles.cache.get(roleId),
                member = guild.members.cache.get(user.id)

            if (!role)
                return msgConfirmation += `\n⚠️ | ${role?.name || 'NOT FOUND'} - **ERRO**`

            if (member.roles.cache.has(roleId)) {
                member.roles.remove(role)
                    .catch(() => msgConfirmation += `\n⚠️ | ${role || 'NOT FOUND'} - **ERRO**`)

                msgConfirmation += `\n❌ | ${role} - **REMOVIDO**`

            } else {
                member.roles.add(role)
                    .catch(() => msgConfirmation += `\n⚠️ | ${role} - **ERRO**`)

                msgConfirmation += `\n✅ | ${role} - **ADICIONADO**`
            }

        }

        return await interaction.reply({
            content: msgConfirmation,
            ephemeral: true
        })
    }

    async function newGiveaway() {

        let reference = message.reference,
            Message = await message.channel.messages.fetch(reference.messageId)

        if (user.id !== Message.author.id)
            return await interaction.reply({
                content: `❌ | Opa opa! Não foi você que iniciou o comando. Então, este não é o seu lugar.`,
                ephemeral: true
            })

        let data = await Database.Guild.findOne({ id: message.guild.id }, 'GiveawayChannel Prefix'),
            prefix = data?.Prefix || '-',
            ChannelId = data?.GiveawayChannel,
            Channel = message.guild.channels.cache.has(ChannelId)

        if (!ChannelId)
            return await interaction.reply({
                content: `❌ | Esse servidor não tem nenhum canal de sorteios configurado. Configure um canal usando \`${prefix}giveaway config #canalDeSorteios\`.`,
                ephemeral: true
            })

        if (ChannelId && !Channel) {

            await Database.Guild.updateOne(
                { id: guild.id },
                { $unset: { GiveawayChannel: 1 } }
            )

            return await interaction.reply({
                content: `❌ | O canal presente no meu banco de dados não condiz com nenhum canal do servidor. Por favor, configure um novo usando: \`${prefix}giveaway config #canalDeSorteios\`.`,
                ephemeral: true
            })
        }

        if (!Channel)
            return await interaction.reply({
                content: `❌ | O canal presente no meu banco de dados não condiz com nenhum canal do servidor. Por favor, configure um novo usando: \`${prefix}giveaway config #canalDeSorteios\`.`,
                ephemeral: true
            })

        const modal = {
            title: "Giveaway Central Create",
            custom_id: "createNewGiveaway",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "winners",
                            label: "Quantos vencedores?",
                            style: 1,
                            min_length: 1,
                            max_length: 2,
                            placeholder: "1, 2, 3... Max: 20",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "timing",
                            label: "Quando devo efetuar o sorteio?",
                            style: 1,
                            min_length: 1,
                            max_length: 25,
                            placeholder: "Amanhã 14:35 | 24/06/2022 14:30 | 1d 20m 30s",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "prize",
                            label: "Qual é o prêmio?",
                            style: 2,
                            min_length: 5,
                            max_length: 1024,
                            placeholder: "Uma paçoca",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "requires",
                            label: "Requisitos? Se sim, quais?",
                            style: 2,
                            min_length: 5,
                            max_length: 1024,
                            placeholder: "Dar likes para @maria e estar no servidor a 5 dias"
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "imageURL",
                            label: "Quer alguma imagem no sorteio?",
                            style: 1,
                            placeholder: "https://i.imgur.com/aGaDNeL.jpeg"
                        }
                    ]
                }
            ]
        }

        return await interaction.showModal(modal)

    }

    async function letterReport() {

        const modal = {
            title: "Report Letter Content",
            custom_id: "lettersReport",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "letterId",
                            label: "Informe o ID da carta",
                            style: 1,
                            max_length: 7,
                            max_length: 7,
                            placeholder: "ABC1234",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "reason",
                            label: "Qual é o motivo da sua denúncia?",
                            style: 2,
                            min_length: 10,
                            max_length: 1024,
                            placeholder: "O autor da carta me xingou...",
                            required: true
                        }
                    ]
                }
            ]
        }

        return await interaction.showModal(modal)
    }

    async function sendNewLetter() {

        let data = await Database.User.findOne({ id: user.id }, 'Balance Slot.Cartas Timeouts.Letter'),
            cartas = data?.Slot?.Cartas || 0,
            Timer = data?.Timeouts?.Letter || 0

        if (!data) {
            Database.registerUser(user)

            return await interaction.reply({
                content: '❌ | Nenhum dado foi encontrado no banco de dados. Tente novamente.',
                ephemeral: true
            })
        }

        if (cartas <= 0)
            return await interaction.reply({
                content: '❌ | Você não possui nenhuma carta. Que tal comprar umas na loja?',
                ephemeral: true
            })

        if (client.Timeout(900000, Timer))
            return await interaction.reply({
                content: `⏱️ | Letters System Cooldown | Tempo restante para o envio de uma próxima carta: \`${client.GetTimeout(900000, Timer)}\``,
                ephemeral: true
            })

        const modal = {
            title: `${client.user.username}'s Letters System`,
            custom_id: "newLetter",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "username",
                            label: "Para quem é a carta?",
                            style: 1,
                            min_length: 2,
                            max_length: 37,
                            placeholder: "Nome, Nome#0000 ou ID",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "anonymous",
                            label: "Está é um carta anonima?",
                            style: 1,
                            min_length: 3,
                            max_length: 3,
                            placeholder: "Sim | Não",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "letterContent",
                            label: "Escreva sua carta",
                            style: 2,
                            min_length: 10,
                            max_length: 1024,
                            placeholder: "Em um dia, eu te vi na rua, foi quando...",
                            required: true
                        }
                    ]
                }
            ]
        }

        return await interaction.showModal(modal)

    }

}

module.exports = selectMenuFunctions