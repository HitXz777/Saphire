const util = require('../../structures/util')

module.exports = {
    name: 'firstmessage',
    description: '[moderation] E se eu falasse "First" em todos os canais criados?',
    default_member_permissions: util.slashCommandsPermissions.MANAGE_CHANNELS,
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'system',
            description: 'Ativar ou desativar sistema?',
            type: 3,
            required: true,
            choices: [
                {
                    name: 'Ativar sistema',
                    value: 'enable'
                },
                {
                    name: 'Desativar sistema',
                    value: 'disable'
                }
            ]
        }
    ],
    async execute({ interaction: interaction, database: Database, emojis: e, guildData: guildData }) {

        const { options, guild } = interaction

        let turn = options.getString('system') === 'enable'

        let atualState = guildData.FirstSystem

        if (turn && atualState)
            return await interaction.reply({
                content: `${e.Deny} | Este sistema já está ativado.`
            })

        if (!turn && !atualState)
            return await interaction.reply({
                content: `${e.Deny} | Este sistema já está desativado.`
            })

        let state = turn
            ? { FirstSystem: true }
            : { $unset: { FirstSystem: 1 } }

        await Database.Guild.updateOne({ id: guild.id }, state)

        return await interaction.reply({
            content: turn
                ? `${e.Check} | Prontinho, agora eu vou falar "First" em todos os canais que forem criados.`
                : `${e.Check} | Prontinho, agora eu não vou mais falar "First" em nenhum chat criado.`
        })

    }
}