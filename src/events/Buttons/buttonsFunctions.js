const Database = require('../../../modules/classes/Database'),
    { Emojis: e } = Database,
    { newReminder } = require('../plugins/eventPlugins')

async function buttonsFunctions(interaction, client) {

    let { customId, user, guild } = interaction

    switch (customId) {
        case 'setStatusChange': setStatusCommand(); break;
        case 'forcaChooseWord': forcaChooseWord(); break;
        case 'bugReport': bugReportSend(); break;
        case 'editProfile': editProfile(); break;
        case 'newGiveaway': newGiveaway(); break;
        case 'newProof': newProof(); break;
        case 'closeProof': newProof(true); break;
        case 'newReminder': newReminder(interaction); break;
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

    async function newProof(close = false) {

        let hasChannel = guild.channels.cache.find(ch => ch.topic === user.id)

        if (close) {
            if (!hasChannel)
                return await interaction.reply({
                    content: '❌ | Você não possui nenhum canal aberto no servidor.',
                    ephemeral: true
                })

            hasChannel.delete().catch(async err => {
                return await interaction.reply({
                    content: '❌ | Falha ao deletar o seu canal.',
                    ephemeral: true
                })
            })

            return await interaction.reply({
                content: '✅ | Canal deletado com sucesso!',
                ephemeral: true
            })
        }

        if (hasChannel)
            return await interaction.reply({
                content: `❌ | Você já possui um canal aberto no servidor. Ele está aqui: ${hasChannel}`,
                ephemeral: true
            })

        let arr = [], parentId = '893307009246580746'
        guild.channels.cache.map(ch => arr.push(ch.parentId))

        let parentIds = [...new Set(arr)].filter(d => typeof d === 'string')

        if (!parentIds.includes(parentId))
            parentId = null

        const { Permissions } = require('discord.js')

        return guild.channels.create(user.tag, {
            type: 'GUILD_TEXT',
            topic: user.id,
            parent: parentId,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [Permissions.FLAGS.VIEW_CHANNEL],
                },
                {
                    id: user.id,
                    allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.ATTACH_FILES, Permissions.FLAGS.EMBED_LINKS],
                }
            ],
            reason: `Solicitado por ${user.id}`
        }).then(async channel => {
            channel.send(`${e.Check} | ${user}, o seu canal de comprovante foi aberto com sucesso!\n🔍 | Mande o **COMPROVANTE** do pagamento/pix/transação contendo **DATA, HORA e VALOR**.\n${e.Info} | Lembrando! Cada real doado é convertido em 15.000 Safiras + 7 Dias de VIP`)
            return await interaction.reply({
                content: `✅ | Canal criado com sucesso. Aqui está ele: ${channel}`,
                ephemeral: true
            })
        }).catch(async err => {
            if (err.code === 30013)
                return await interaction.reply({
                    content: 'ℹ | O servidor atingiu o limite de **500 canais**.',
                    ephemeral: true
                })

            return await interaction.reply({
                content: `❌ | Ocorreu um erro ao criar um novo canal.\n\`${err}\``,
                ephemeral: true
            })
        })

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
                            label: "Qual é o comando/sistema?",
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

}

module.exports = buttonsFunctions