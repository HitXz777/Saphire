class TicketManager {
    constructor(message, client) {
        this.message = message
        this.channel = message.channel
        this.guild = message.guild
        this.author = message.user
        this.client = client
        this.Database = require('../../../../modules/classes/Database')
        this.e = this.Database.Emojis
        this.data = {}
    }

    async create() {

        const { e, guild, message, Database } = this

        let buttons = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'NOVO TEMA',
                        emoji: '💭',
                        custom_id: 'newTheme',
                        style: 'SUCCESS'
                    },
                    {
                        type: 2,
                        label: 'MAIS INFORMAÇÕES',
                        emoji: e.Info,
                        custom_id: 'info',
                        style: 'PRIMARY'
                    },
                    {
                        type: 2,
                        label: 'CANCELAR',
                        emoji: e.Deny,
                        custom_id: 'cancel',
                        style: 'DANGER'
                    },
                ]
            }
        ]

        let msg = await message.reply({ components: buttons })

        let collector = msg.createMessageComponentCollector({
            filter: int => int.user.id === message.author.id,
            idle: 60000,
            errors: ['time', 'max']
        })
            .on('collect', interaction => {

                const { customId } = interaction

                if (customId === 'newTicketTheme') {
                    buttons[0].components[0].disabled = true
                    return msg.edit({ content: null, components: buttons }).catch(() => { })
                }

                interaction.deferUpdate().catch(() => { })

                if (customId === 'info') {
                    return this.ticketInfo(msg)
                }

                if (customId === 'newTheme') {
                    return this.revalidadeConfimation(msg)
                }

                if (customId === 'back') {
                    return msg.edit({ content: null, components: buttons }).catch(() => { })
                }

                return collector.stop()
            })
            .on('end', () => {
                return msg.edit({
                    content: `${this.e.Deny} | Comando cancelado.`,
                    embeds: [], components: []
                }).catch(() => { })
            })
    }

    ticketInfo(msg) {

        let embed = {
            color: this.client.blue,
            title: `💭 ${this.client.user.username}'s Ticket System Info`,
            description: 'Este é o sistema o meu sistema de tickets'
        }

        return msg
            ? msg.edit({
                content: null,
                embeds: [embed]
            }).catch(() => { })
            : this.message.reply({ embeds: [embed] }).catch(() => { })
    }

    revalidadeConfimation(msg) {

        let buttons = [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'CONTINUAR',
                        emoji: this.e.Check,
                        custom_id: 'newTicketTheme',
                        style: 'SUCCESS'
                    },
                    {
                        type: 2,
                        label: 'VOLTAR',
                        emoji: '↩',
                        custom_id: 'back',
                        style: 'PRIMARY'
                    }
                ]
            }
        ]

        return msg.edit({
            content: `${this.e.Info} | Para a criação de uma nova categoria, você precisará do \`ID ou Nome da Categoria\` de onde os tickets serão abertos.`,
            embeds: [], components: buttons
        }).catch(() => { })
    }

}

module.exports = TicketManager