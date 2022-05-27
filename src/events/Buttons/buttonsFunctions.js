const Database = require('../../../modules/classes/Database')

async function buttonsFunctions(interaction) {

    let { customId, channel, user, message } = interaction

    switch (customId) {
        case 'setStatusChange': setStatusCommand(); break;
        case 'newRole': case 'delRole': reactionRole(); break;
        case 'forcaChooseWord': forcaChooseWord(); break;
        case 'bugReport': bugReportSend(); break;
        case 'editProfile': editProfile(); break;
        default:
            break;
    }
    return

    async function editProfile() {

        let data = await Database.User.findOne({ id: user.id }, 'Perfil')

        const modal = {
            title: "Set Status Command",
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

    async function reactionRole() {

        let role = channel.guild.roles.cache.get('914925531529609247'),
            member = channel.guild.members.cache.get(user.id)

        if (!member || !role)
            return await interaction.reply({
                content: '❌ | Não foi possível acionar o cargo.',
                ephemeral: true
            })

        if (customId === 'newRole') return addRole()
        if (customId === 'delRole') return delRole()
        return

        async function addRole() {

            if (member.roles.cache.has('914925531529609247'))
                return await interaction.reply({
                    content: '❌ | Você já possui o cargo de notificações.',
                    ephemeral: true
                })

            member.roles.add(role).catch(async (err) => {

                return await interaction.reply({
                    content: `❌ | Houve um erro ao adicionar o cargo.\n${err}`,
                    ephemeral: true
                })

            })

            return await interaction.reply({
                content: '✅ | Cargo **adicionado** com sucesso!',
                ephemeral: true
            })
        }

        async function delRole() {

            if (!member.roles.cache.has('914925531529609247'))
                return await interaction.reply({
                    content: '❌ | Você não possui o cargo de notificações.',
                    ephemeral: true
                })

            member.roles.remove(role).catch(async (err) => {

                return await interaction.reply({
                    content: `❌ | Houve um erro ao remover o cargo.\n${err}`,
                    ephemeral: true
                })

            })

            return await interaction.reply({
                content: '✅ | Cargo **removido** com sucesso!',
                ephemeral: true
            })
        }
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
                            style: 1,
                            max_length: 15
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

}

module.exports = buttonsFunctions