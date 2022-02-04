const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'notstonks',
    aliases: ['nostonks', 'stonksdown'],
    category: 'random',
    
    
    emoji: `${e.NotStonks}`,
    usage: '<notstonks>',
    description: 'No Stonks...',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {
        let list = ['https://imgur.com/qPzrtI3.gif', 'https://imgur.com/DA1TD46.gif']
        let rand = list[Math.floor(Math.random() * list.length)]
        const embed = new MessageEmbed().setColor('#246FE0').setImage(rand)
        return message.reply({ embeds: [embed] })
    }
}