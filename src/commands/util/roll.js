const { e } = require('../../../database/emojis.json')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'roll',
    aliases: ['dado', 'dados', 'rolls'],
    category: 'util',
    emoji: '🎲',
    usage: '<roll> <número>',
    description: 'Role os dados e tente a sorte',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return RollInfo()
        if (!args[0]) return GetNewNumber()
        if (args[1]) return message.reply(`${e.Deny} | Só me fala os números, ok? \`${prefix}roll Números\``)

        isNaN(parseInt(args[0])) ? message.channel.send(`${e.Deny} | **${args[0]}** | Não é um número. \`${prefix}roll info\``) : NewRoll(parseInt(args[0]))

        function GetNewNumber() {
            message.reply(`${e.Loading} | Já que você não disse o número, eu vou esperar você dizer... Eai? Qual é o número do roll?`).then(msg => {
                const filter = m => m.author.id === message.author.id && !isNaN(m.content)
                const collector = message.channel.createMessageCollector({ filter, time: 30000 });

                collector.on('collect', m => {
                    msg.delete().catch(() => { })
                    return NewRoll(parseInt(m.content))
                });

                collector.on('end', () => {
                    msg.delete().catch(() => { })
                });
            })
        }

        function NewRoll(value) {
            if (isNaN(value)) return message.reply(`${e.Warn} | Argumento inválido!`)
            let Result = Math.floor(Math.random() * value).toFixed(0)
            if (Result === 0) Result = 1
            return message.reply(`🎲 | **${Result}**`)
        }

        function RollInfo() {
            return message.reply({ embeds: [new MessageEmbed().setColor('#246FE0').setTitle(`🎲 ${client.user.username} Rolls`).setDescription(`Role quantos dados quiser! Você fala algúm número e eu rolo os dados. Quer tentar a sorte?`).addField(`${e.SaphireObs} Comando`, `\`${prefix}roll <Número>\``)] })
        }
    }
}