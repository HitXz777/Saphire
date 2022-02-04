const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'stonks',
    aliases: ['stonksup'],
    category: 'random',
    
    
    emoji: `${e.Stonks}`,
    usage: '<stonks>',
    description: 'Stonks',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {
        let list = ['https://imgur.com/jVL0mbR.gif', 'https://imgur.com/TRHBCon.gif']
        let rand = list[Math.floor(Math.random() * list.length)]
        const embed = new MessageEmbed().setColor('#246FE0').setImage(rand)
        return message.reply({ embeds: [embed] })
    }
}