const client = require('../../index'),
    Database = require('../../modules/classes/Database'),
    { Emojis: e } = Database

client.on('interactionCreate', async interaction => {

    if (interaction.isModalSubmit()) return submitModalFunction()
    if (!interaction.isButton()) return

    if (interaction.customId === 'setStatusChange') return modalSetStatus()
    if (!['newRole', 'delRole'].includes(interaction.customId)) return

    let { customId, channel, user } = interaction

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

    async function modalSetStatus() {

        const { MessageActionRow, Modal, TextInputComponent } = require('discord.js')
        // Create the modal
        const modal = new Modal()
            .setCustomId('setStatusModal')
            .setTitle('Set Status Command');

        const newStatus = new TextInputComponent()
            .setCustomId('newStatus')
            .setLabel('Digite seu novo status')
            .setPlaceholder('No mundo da lua')
            .setStyle('PARAGRAPH')
            .setRequired(true)
            .setMinLength(5)
            .setMaxLength(80)

        const modalComponent = new MessageActionRow().addComponents(newStatus);
        modal.addComponents(modalComponent);
        return await interaction.showModal(modal);
    }

    async function submitModalFunction() {

        const { fields, user } = interaction

        const newStatus = fields.getTextInputValue('newStatus')

        if (!newStatus)
            return await interaction.reply({
                content: '❌ | Não foi possível verificar o seu novo status.',
                ephemeral: true
            })

        Database.updateUserData(user.id, 'Perfil.Status', newStatus)
        return await interaction.reply({
            content: `✅ | Novo status definido com sucesso!\n📝 | ${newStatus}`,
            ephemeral: true
        })
    }
})