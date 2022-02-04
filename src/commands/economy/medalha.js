const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'medalha',
    category: 'economy',
    ClientPermissions: ['MANAGE_MESSAGES'],
    emoji: '🏅',
    usage: '<medalha> <código 1>/<código 2>',
    description: 'Libera a Medalha',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {
        message.delete().catch(err => {
            if (err) {
                return message.channel.send(`${e.Deny} | Não foi possível deletar a mensagem de origem. Eu preciso da permissão **\`GERENCIAR MENSAGENS\`**.`)
            }
        })

        const MedalhaObj = {
            Medalha: sdb.get(`Users.${message.author.id}.Slot.Medalha.Medalha`),
            Code1: sdb.get(`Users.${message.author.id}.Slot.Medalha.Code1`),
            Acess: sdb.get(`Users.${message.author.id}.Slot.Medalha.Acess`),
        }

        let { Medalha, Acess, Code1 } = MedalhaObj

        if (Medalha)
            return message.channel.send(`${e.Deny} | Você já adquiriu sua medalha.`)

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle('🏅 Medalha Cammum')
            .setDescription('Por seus esforços, o Rei Vouwer Heslow te nomeará Cavaleiro(a) Pessoal da Princesa Kaya! Por este mérito, você ganhará uma medalha!')
            .addField('Comando de Ativação', '`' + prefix + 'medalha Código Pessoal 1`\n' + '`' + prefix + 'medalha Código Pessoal 2`')
            .setFooter('Se você desvendou o enigma do código, não repasse para ninguém!')

        const CódigoCertoEmbed2 = new MessageEmbed()
            .setColor('GREEN')
            .setTitle('🏅 Medalha Cammum Adquirida')
            .setDescription('Você adquiriu um item de classe especial!')
            .addField('Comando Desbloqueado', '`' + prefix + 'dogname`')

        if (!Acess) return message.channel.send(`${e.Deny} | Leia a história #4 Final \`${prefix}floresta final\``)
        if (!args[0]) return message.channel.send({ embeds: [embed] })

        if (args[0] === message.author.discriminator) return FirstCode()
        if (args[0] === message.author.id) return SecondCode()
        return FakeCode()

        function FakeCode() {
            return message.channel.send(`${e.Loading} Verificando código pessoal...`).then(msg => {
                setTimeout(() => {
                    msg.edit(`${e.Deny} | Código inválido.`).catch(() => { })
                }, 3000)
            })
        }

        function FirstCode() {
            if (Code1) return message.channel.send(`${e.Deny} | Soldado, você já disse seu primeiro código! Tente descobrir o segundo.`)

            return message.channel.send(`${e.Loading} Verificando código pessoal...`).then(msg => {
                setTimeout(() => {
                    sdb.set(`Users.${message.author.id}.Slot.Medalha.Code1`, true)
                    msg.edit(`${e.Check} | 1/2 | Você disse o primeiro código com sucesso!`).catch(() => { })
                }, 3000)
            })
        }

        function SecondCode() {

            return message.channel.send(`${e.Loading} | Verificando código pessoal...`).then(msg => {
                setTimeout(() => {
                    if (!Code1) return message.channel.send(`${e.Deny} | Soldado, você descobriu seu segundo código, mas diga o primeiro código antes!`)
                    sdb.set(`Users.${message.author.id}.Slot.Medalha`, { Medalha: true })
                    msg.edit({ content: `${e.Check} | 2/2 | Você disse o segundo código com sucesso!`, embeds: [CódigoCertoEmbed2] }).catch(() => { })
                }, 3000)
            })

        }
    }
}