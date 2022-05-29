const Database = require('../../../modules/classes/Database'),
    { Emojis: e } = Database

async function buttonsFunctions(interaction, client) {

    let { customId, user } = interaction

    switch (customId) {
        case 'setStatusChange': setStatusCommand(); break;
        case 'forcaChooseWord': forcaChooseWord(); break;
        case 'bugReport': bugReportSend(); break;
        case 'editProfile': editProfile(); break;
        case 'sendNewLetter': sendNewLetter(); break;
        case 'newGiveaway': newGiveaway(); break;
        default:
            break;
    }
    return

    async function editProfile() {

        let data = await Database.User.findOne({ id: user.id }, 'Perfil')

        const modal = {
            title: "Edit Profile Information",
            custom_id: "editProfile",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "profileJob",
                            label: "Qual sua profissão?",
                            style: 1,
                            min_length: 5,
                            max_length: 30,
                            placeholder: "Estoquista, Gamer, Terapeuta..."
                        }
                    ]
                }, // MAX: 5 Fields
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "profileBirth",
                            label: "Digite seu aniversário",
                            style: 2,
                            min_length: 10,
                            max_length: 10,
                            placeholder: "26/06/1999"
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "profileStatus",
                            label: "Digite seu novo status",
                            style: 2,
                            min_length: 5,
                            max_length: 100,
                            placeholder: "No mundo da lua..."
                        }
                    ]
                }
            ]
        }

        if (data?.Perfil?.TitlePerm)
            modal.components.unshift({
                type: 1,
                components: [
                    {
                        type: 4,
                        custom_id: "profileTitle",
                        label: "Qual seu título?",
                        style: 1,
                        min_length: 3,
                        max_length: 20,
                        placeholder: "Escrever novo título"
                    }
                ]
            })

        return await interaction.showModal(modal)
    }

    async function setStatusCommand() {

        const modal = {
            title: "Set Status Command",
            custom_id: "setStatusModal",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "newStatus",
                            label: "Digite seu novo status",
                            style: 1,
                            min_length: 5,
                            max_length: 80,
                            placeholder: "No mundo da lua",
                            required: true
                        }
                    ]
                } // MAX: 5 Fields
            ]
        }

        return await interaction.showModal(modal);
    }

    async function forcaChooseWord() {

        const modal = {
            title: "Hangman Game",
            custom_id: "forcaChooseWord",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "componentOne",
                            label: "Diga sua palavra",
                            style: 1,
                            min_length: 3,
                            max_length: 25,
                            placeholder: "Discord",
                            required: true
                        }
                    ]
                } // MAX: 5 Fields
            ]
        }

        return await interaction.showModal(modal)

    }

    async function bugReportSend() {

        const modal = {
            title: "Bugs & Errors Reporting",
            custom_id: "BugModalReport",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "commandBuggued",
                            label: "Qual é o comando?",
                            placeholder: "Balance, Giveaway, AFk, Hug...",
                            style: 1,
                            max_length: 50
                        }
                    ]
                }, // MAX: 5 Fields
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "bugTextInfo",
                            label: "O que aconteceu?",
                            style: 2,
                            min_length: 20,
                            max_length: 3900,
                            placeholder: "Quando tal recurso é usado acontece...",
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
                            min_length: 7,
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

module.exports = buttonsFunctions