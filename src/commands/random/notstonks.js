const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'notstonks',
    aliases: ['nostonks', 'stonksdown'],
    category: 'random',
    emoji: `${e.NotStonks}`,
    usage: '<notstonks>',
    description: 'No Stonks...',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let list = ['https://imgur.com/qPzrtI3.gif', 'https://imgur.com/DA1TD46.gif'],
            rand = list[Math.floor(Math.random() * list.length)],
            embed = new MessageEmbed().setColor('#246FE0').setImage(rand)

        return message.reply({ embeds: [embed] })
    }
}