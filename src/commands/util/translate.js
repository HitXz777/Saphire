const translate = require('@iamtraction/google-translate')
const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'translate',
    aliases: ['t', 'tradutor'],
    category: 'util',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: `${e.Translate}`,
    usage: '<t> <sigla> <texto para traduzir>',
    description: 'Traduza palavras e textos de qualquer língua',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let googlepng = 'https://imgur.com/9kWn6Qp.png'

        const Embed = new MessageEmbed()
            .setColor('#4295fb')
            .setAuthor('Google Tradutor', googlepng)

        const lan = new MessageEmbed()
            .setColor('RED') // Red
            .setTitle(`${e.Info} | Siga o formato correto do tradutor`)
            .setDescription(`\`${prefix}t en/pt/fr/lt A frase que deseja traduzir\``)

        let language = args[0]
        let text = args.slice(1).join(" ")

        if (!language || language.length !== 2 || !text) { return message.reply({ embeds: [lan] }) }

        translate(args.slice(1).join(" "), { to: language }).then(res => {

            Embed.addField('Texto', "```txt\n" + `${text}` + "\n```", false).addField('Tradução', "```txt\n" + `${res.text}` + "\n```", false)
            message.reply({ embeds: [Embed] })

        }).catch(err => {
            Embed.addField('Texto', "```txt\n" + `${text}` + "\n```", false).addField('Erro', "```txt\n" + `${err}` + "\n```", false).setColor('RED')
            message.reply({ embeds: [Embed] })
        })
    }
}