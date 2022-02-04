const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')

module.exports = {
    name: 'dogname',
    aliases: ['nomedog'],
    category: 'perfil',
    emoji: `${e.Doguinho}`,
    usage: '<dogname> <Nome Do Cahorro(a)>',
    description: 'Escolha um nome pro seu doguinho(a)',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let medalha = sdb.get(`Users.${message.author.id}.Slot.Medalha.Medalha`) || false
        if (!medalha) return message.reply(`${e.Deny} | Você ainda não obteve sua medalha! \`${prefix}floresta\``)

        const args0 = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(`${e.Doguinho} Nome pro cachorrinho`)
            .setDescription('Use este comando para dar um nome para seu cachorrinho/a!')
            .addField('Comando', `\`${prefix}dogname NomeDoCachorro\``)
            .setFooter('O nome deve ser único')

        if (!args[0]) return message.reply({ embeds: [args0] })
        if (args[1]) return message.reply(`${e.Deny} | O nome deve ser único. Nada de dois ou mais nomes.`)
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].includes(args[0].content)) return message.reply(`${e.Deny} | O nome do seu cachorrinho/a não pode ter números no nome.`)
        if (args[0].length > 12 || args[0].length < 3) return message.reply(`${e.Deny} | O nome do seu cachorrinho/a deve estar entre **3~12 caracteres.**`)

        sdb.set(`Users.${message.author.id}.Slot.Dogname`, `${args[0]}`)
        message.reply(`${e.Check} | ${message.author}, o nome do seu cachorro/a agora é **${args[0]}**`)
    }
}
