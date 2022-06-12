module.exports = {
    name: 'afk',
    description: '[util] Deixe que eu aviso a todos que você está offline',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'option',
            description: 'Como deve selecionar esse afk?',
            type: 3,
            required: true,
            choices: [
                {
                    name: 'global',
                    value: 'global'
                },
                {
                    name: 'server',
                    value: 'server'
                }
            ]
        },
        {
            name: 'message',
            description: 'Mensagem que vou dizer quando te mencionarem',
            type: 3
        },
    ],
    async execute({ interaction: interaction, database: Database, emojis: e }) {

        const { options, guild, user } = interaction

        let Data = require('../../../modules/functions/plugins/data')
        let option = options.getString('option')
        let message = options.getString('message') || 'Sem recado definido.'

        return option === 'global' ? saveGlobalAFK() : saveGuildAFK()

        async function saveGuildAFK() {

            await Database.Guild.updateOne(
                { id: guild.id },
                {
                    $push: {
                        AfkSystem: {
                            MemberId: user.id,
                            Message: `\`${Data(0, true)}\`\n🗒️ | ${message}`
                        }
                    }
                },
                { upsert: true }
            )

            return await interaction.reply({
                content: '✅ | Pode deixar! Vou avisar a todos nesse servidor que você está offline.',
                ephemeral: true
            }).catch(() => { })
        }

        async function saveGlobalAFK() {

            await Database.User.updateOne(
                { id: user.id },
                { AfkSystem: `\`${Data()}\`\n🗒️ | ${message}` },
                { upsert: true }
            )

            return await interaction.reply({
                content: '🌎 | Deixa comigo! Vou avisar em todos os servidores que você está offline.',
                ephemeral: true
            }).catch(() => { })
        }
    }
}