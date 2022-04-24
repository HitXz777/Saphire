const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'stonks',
    aliases: ['stonksup'],
    category: 'random',
    emoji: `${e.Stonks}`,
    usage: '<stonks>',
    description: 'Stonks',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {
        let list = ['https://imgur.com/jVL0mbR.gif', 'https://imgur.com/TRHBCon.gif']
        let rand = list[Math.floor(Math.random() * list.length)]
        const embed = new MessageEmbed().setColor('#246FE0').setImage(rand)
        return message.reply({ embeds: [embed] })
    }
}