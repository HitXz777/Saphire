const { create } = require("sourcebin")
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: "bin",
    aliases: ["copia"],
    category: 'util',
    
    
    emoji: '🖇️',
    description: "Faça uma cópia online de algum texto",
    usage: '[Texto que deseja copiar]',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        const content = args.join(" ")
        if (!content) return message.reply({ content: `${e.NezukoDance} | Diga algo para que eu possa criar uma cópia.`, })

        create([{ name: `Por: ${message.author.tag}`, content, language: "text", },], { title: "Copia e Cola, By: {SourceBin}", description: `${client.user.username} Command System`}).then((value) => {
            message.reply(`Criado com sucesso! Link: ${value.url}`)
        })
    }
}