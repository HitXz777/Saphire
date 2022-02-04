const { e } = require('../../../database/emojis.json')
// #246FE0 - Azul Saphire
module.exports = {
    name: 'coinflip',
    aliases: ['caracoroa', 'caraoucoroa'],
    category: 'random',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: `${e.Coin}`,
    usage: '<coinflip> <cara/coroa>',
    description: 'Cara ou coroa?',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let array = ["cara", "coroa"]
        let rand = array[Math.floor(Math.random() * array.length)]

        if (args[1]) return message.channel.send(`${e.Deny} | Apenas \`cara\` ou \`coroa\` meu anjo.`)
        if (!['cara', 'coroa'].includes(args[0]?.toLowerCase())) return message.channel.send(`${e.Deny} | Insira \`cara\` ou \`coroa\` na frente do comando.`)

        args[0].toLowerCase() == `${rand}` ? Win(args[0].toLowerCase()) : Lose(args[0].toLowerCase())

        function Win(value) {
            message.channel.send('https://imgur.com/sFBDKCA.gif').then(msg => {
                setTimeout(() => { msg.edit(`${e.SaphireFeliz} Aeee ${message.author}!! Deu **${value}** e você ganhou!`) }, 2300)
            })
        }

        function Lose(value) {
            value === 'cara' ? value = 'coroa' : value = 'cara'
            message.channel.send('https://imgur.com/sFBDKCA.gif').then(msg => {
                setTimeout(() => { msg.edit(`${e.SaphireCry} Aaaah ${message.author}!! Deu **${value}** e você perdeu!`) }, 2300)
            })
        }
    }
}