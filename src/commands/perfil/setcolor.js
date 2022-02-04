const { e } = require('../../../database/emojis.json')
const Colors = require('../../../Routes/functions/colors')

module.exports = {
    name: 'setcolor',
    aliases: ['hex', 'sethex', 'setcor'],
    category: 'perfil',
    emoji: '🎨',
    usage: '<setcolor> <#CódigoHex>',
    description: 'Defina a cor das suas embeds',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (!args[0]) return message.reply(`${e.SaphireObs} | Você pode definir as cores das suas mensagens usando este comando.\nExemplo: \`${prefix}setcolor #00FFFF\` - Se quiser umas cores, use \`${prefix}cor\` que te mando algumas, você também pode pegar qualquer cor usando as configurações do servidor na sessão onde muda as cores dos cargos.\n \nCaso queria deixar ela igual a cor do seu cargo/nome. Basta usar \`${prefix}setcolor off\``)
        if (!sdb.get(`Users.${message.author.id}.Color.Perm`)) return message.reply(`${e.Deny} | Você precisa comprar a permissão 🎨 \`Cores\` para usar este comando.`)
        if (args[0].length !== 7) return message.reply(`${e.SaphireRaiva} | Os códigos #HEX possuem **7 caracteres**`)

        if (['off', 'delete', 'deletar', 'tirar'].includes(args[0]?.toLowerCase())) return SetColorOff()

        isHex(args[0]) ? setHex(args[0]) : InvalidHex(args[0])

        function isHex(value) {
            return /^#[0-9A-F]{6}$/i.test(`${value}`) // True/False
        }

        function InvalidHex(value) {
            return message.reply(`${e.Deny} | \`${value}\` | Não é um código #HEX válido.`)
        }

        function SetColorOff() {
            sdb.delete(`Users.${message.author.id}.Color.Set`)
            return message.reply(`${e.SaphireFeliz} | Sua cor foi deletada e agora eu vou pegar a cor do seu cargo pra colocar nas suas mensagens.`)

        }

        function setHex(value) {
            sdb.set(`Users.${message.author.id}.Color.Set`, value)

            const ConfirmateEmbed = new MessageEmbed()
                .setColor(Colors(message.member))
                .setDescription(`${e.Check} | ${message.author} alterou a sua cor para \`${value}\``)
            return message.channel.send({ embeds: [ConfirmateEmbed] })
        }
    }
}