const client = require('../../../index')

module.exports = {
    name: "say",
    type: 1,
    description: '[moderation] Fale algo atráves de mim',
    default_member_permissions: client.perms.MANAGE_MESSAGES,
    dm_permission: false,
    options: [
        {
            name: 'mensagem',
            description: '[moderation] Qual a mensagem que você quer enviar?',
            type: 3,
            required: true
        }
    ],
    async execute({ interaction: interaction, guildData: guildData, member: member, emojis: e }) {

        let content = interaction.options.getString('mensagem')

        if (guildData?.AntLink && !member?.permissions?.toArray()?.includes('ADMINISTRATOR') && content.replace(/ /g, '').includes('discord.gg')) {
            return interaction.reply({
                content: `${e.antlink} | O sistema de antilink está ativado neste servidor.`,
                ephemeral: true
            })
        }

        if (content.length > 1500)
            return await interaction.reply({
                content: '❌ | O limite de caracteres é de 1500 caracteres'
            })

        return await interaction.reply({ content: content })
    }
}