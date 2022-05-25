const { e } = require('../../../JSON/emojis.json'),
    Quiz = require('./classes/quiz')

module.exports = {
    name: 'quiz',
    aliases: ['q'],
    category: 'games',
    emoji: `${e.QuestionMark}`,
    usage: 'quiz <info>',
    description: 'Quiz é bem legal, garanto.',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        return new Quiz().init(client, message, args, prefix, MessageEmbed, Database, e)

    }
}