const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'dogname',
    aliases: ['nomedog'],
    category: 'random',
    emoji: `${e.Doguinho}`,
    usage: '<dogname> <Nome Do Cahorro(a)>',
    description: 'Escolha um nome pro seu doguinho(a)',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (!args[0]) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#246FE0')
                    .setTitle(`${e.Doguinho} Nome pro cachorrinho`)
                    .setDescription('Use este comando para dar um nome para seu cachorrinho/a!')
                    .addField('Comando', `\`${prefix}dogname NomeDoCachorro\``)
                    .setFooter('O nome deve ser único')
            ]
        })

        if (args[1]) return message.reply(`${e.Deny} | O nome deve ser único. Nada de dois ou mais nomes.`)

        if (/^[0-9]+$/i.test(args[0].content))
            return message.reply(`${e.Deny} | O nome do seu cachorrinho/a não pode ter números no nome.`)

        if (args[0].length > 15 || args[0].length < 3) return message.reply(`${e.Deny} | O nome do seu cachorrinho/a deve estar entre **3~15 caracteres.**`)

        Database.updateUserData(message.author.id, 'Slot.Dogname', args[0])
        return message.reply(`${e.Check} | ${message.author}, o nome do seu cachorro/a agora é **${args[0]}**`)
    }
}
