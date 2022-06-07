const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'setstatus',
    aliases: ['status'],
    category: 'perfil',
    emoji: '✍️',
    usage: '<setstatus>',
    description: 'Defina seu status no perfil',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let = userData = await Database.User.findOne({ id: message.author.id }, 'Perfil.Status'),
            statusUser = userData?.Perfil?.Status || null

        let buttons = [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'ALTERAR',
                    emoji: '📝',
                    custom_id: 'setStatusChange',
                    style: 'SUCCESS'
                },
                {
                    type: 2,
                    label: 'DELETAR',
                    emoji: e.Trash,
                    custom_id: 'delete',
                    style: 'PRIMARY'
                },
                {
                    type: 2,
                    label: 'CANCELAR',
                    emoji: '❌',
                    custom_id: 'cancel',
                    style: 'DANGER'
                }
            ]
        }], collected = false

        if (!statusUser)
            buttons[0].components[1].disabled = true

        let msg = await message.reply({
            content: `${e.QuestionMark} | Você deseja alterar seu status do perfil?`,
            components: buttons
        })

        return msg.createMessageComponentCollector({
            filter: int => int.user.id === message.author.id,
            max: 1,
            time: 60000,
            erros: ['max', 'time']
        })
            .on('collect', interaction => {

                const { customId } = interaction

                if (customId === 'cancel') return msg.edit({
                    content: `${e.Deny} | Comando cancelado.`,
                    components: []
                })

                collected = true

                if (customId === 'delete') {
                    interaction.deferUpdate().catch(() => { })
                    return delStatus()
                }

                return msg.edit({
                    content: `${e.Check} | Entendido.`,
                    components: []
                })
            })
            .on('end', () => {
                if (collected) return
                return msg.edit({
                    content: `${e.Deny} | Comando cancelado.`,
                    components: []
                })
            })

        async function delStatus() {

            await Database.delete(message.author.id, 'Perfil.Status')
            return msg.edit({ content: `${e.Check} | Status deletado com sucesso!`, components: [] })

        }

    }

}