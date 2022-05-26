const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'setstatus',
    aliases: ['status'],
    category: 'perfil',
    emoji: '✍️',
    usage: '<setstatus>',
    description: 'Defina seu status no perfil',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let buttons = [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'ALTERAR',
                    custom_id: 'setStatusChange',
                    style: 'SUCCESS'
                },
                {
                    type: 2,
                    label: 'CANCELAR',
                    custom_id: 'cancel',
                    style: 'DANGER'
                }
            ]
        }], collected = false

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
    }

}