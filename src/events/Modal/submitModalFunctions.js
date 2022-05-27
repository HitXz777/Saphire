const Database = require('../../../modules/classes/Database')

async function submitModalFunctions(interaction, client) {

    const { customId, fields, user } = interaction

    if (customId === 'setStatusModal') return setStatusCommad()
    if (customId === 'forcaChooseWord') return forcaGame()
    return

    async function setStatusCommad() {

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

    async function forcaGame() {
        const Forca = require('../../commands/games/classes/forca')
        const word = fields.getTextInputValue('componentOne')
        const { MessageEmbed } = require('discord.js')

        let data = await Database.Guild.findOne({ id: interaction.guildId }, 'Prefix'),
            prefix = data?.Prefix || Database.Config.Prefix

        let validate = /^[a-z ]+$/i

        if (!validate.test(word))
            return await interaction.reply({
                content: '❌ | O texto informado contém acentos ou números.',
                ephemeral: true
            })

        let message = await interaction.reply({
            content: '✅ | Ok! Palavra coletada com sucesso!',
            fetchReply: true
        })

        return new Forca().game(client, false, [], prefix, MessageEmbed, Database, word?.toLowerCase(), user, message.channel)
    }

}

module.exports = submitModalFunctions