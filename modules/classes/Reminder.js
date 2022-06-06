class Reminder {
    constructor(message, data = {}) {
        this.emojiClock = '⏰'
        this.time = data.time
        this.client = data.client
        this.message = message
        this.user = data.user
        this.reminderData = data.reminderData
        this.confirmationMessage = data.confirmationMessage
    }

    async showButton() {

        let msg = await this.message.edit({
            components: [{
                type: 1,
                components: [
                    {
                        type: 2,
                        emoji: this.emojiClock,
                        custom_id: 'setReminder',
                        style: 'SUCCESS'
                    }
                ]
            }]
        }).catch(() => { })

        return this.executeCollector(msg)
    }

    executeCollector(msg) {

        return msg.createMessageComponentCollector({
            filter: int => int.user.id === this.user.id,
            time: 120000,
            max: 1,
            errors: ['time', 'max']
        })
            .on('collect', async () => await this.saveReminder())
            .on('end', () => {
                return this.message.edit({ components: [] }).catch(() => { })
            })

    }

    async saveReminder() {

        const Database = require('./Database'),
            passCode = require('../functions/plugins/PassCode')

        this.reminderData.id = passCode(7).toUpperCase()
        new Database.Reminder(this.reminderData).save()
        return this.message.channel.send({ content: this.confirmationMessage.replace(/ReplaceTIMER/g, this.client.GetTimeout(this.time, this.reminderData.DateNow)) })
    }
}

module.exports = Reminder