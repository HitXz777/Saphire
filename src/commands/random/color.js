const { c } = require('../../../database/hex.json')
const { e } = require('../../../database/emojis.json')
const { N } = require('../../../database/nomes.json')

module.exports = {
    name: 'color',
    aliases: ['cor', 'hex', 'cores', 'codhex'],
    category: 'random',
    
    ClientPermissions: ['EMBED_LINKS'],
    emoji: '🎨',
    usage: '<color> <ColorName>/<#hex>',
    description: `Cores em #HEX. Use \`cor\` para mais informações.`,

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        const embed = new MessageEmbed().setFooter(`${prefix}cor #hex`)

        const NoArgsEmbed = new MessageEmbed().setColor('#246FE0').setTitle(`${e.Info} Tabelinha de Cores #HEX`).addField('🎨 Cores Disponiveis', 'Preto\n Azul\n Ciano\n Verde\n Vermelho\n Rosa\n Roxo\n Laranja\n Amarelo\n Branco').addField('Comando', `\`${prefix}cor <cor>\` Códigos #hex\n\`${prefix}cor <#hex>\` A cor da #hex`).setFooter(`Ideia do comando: ${N.Makol}`)

        let HexColors = ''

        if (args[1]) {
            return message.reply(`${e.Deny} | Nada além da \`<cor/#hex>\`. Quer ajuda? Use \`${prefix}cor\``)
        } else if (!args[0]) {

            return message.reply({ embeds: [NoArgsEmbed] })

        } else if (args[0].startsWith("#")) {

            isHex(args[0]) ? SentHexMessage(args[0]) : InvalidHex(args[0])

            function isHex(value) {
                return /^#[0-9A-F]{6}$/i.test(`${value}`) // True/False
            }

            function InvalidHex(value) {
                return message.reply(`${e.Deny} | \`${value}\` | Não é um código #HEX válido.`)
            }

            function SentHexMessage(value) {
                const EmbedHex = new MessageEmbed().setColor(args[0]).setDescription(`🎨 \`${args[0]}\``)
                return message.reply({ embeds: [EmbedHex] })
            }

        } else if (['preto', 'black', 'dark', 'preta'].includes(args[0]?.toLowerCase())) {

            embed.setTitle('🎨 #HEX: Preto').setColor(c.Black[1])
            for (let i = 0; i < c.Black.length; i++) {
                HexColors += `\n${i + 1}. ${c.Black[i]}`
                embed.setDescription(HexColors)
            }
            return message.reply({ embeds: [embed] })

        } else if (['blue', 'azul'].includes(args[0]?.toLowerCase())) {

            embed.setTitle('🎨 #HEX: Azul').setColor(c.Blue[8])
            for (let i = 0; i < c.Blue.length; i++) {
                HexColors += `${i + 1}. ${c.Blue[i]}\n`
                embed.setDescription(HexColors)
            }
            return message.reply({ embeds: [embed] })

        } else if (['cyan', 'ciano'].includes(args[0]?.toLowerCase())) {

            embed.setTitle('🎨 #HEX: Ciano').setColor(c.Cyan[1])
            for (let i = 0; i < c.Cyan.length; i++) {
                HexColors += `${i + 1}. ${c.Cyan[i]}\n`
                embed.setDescription(HexColors)
            }
            return message.reply({ embeds: [embed] })

        } else if (['green', 'verde'].includes(args[0]?.toLowerCase())) {

            embed.setTitle('🎨 #HEX: Verde').setColor(c.Green[2])
            for (let i = 0; i < c.Green.length; i++) {
                HexColors += `${i + 1}. ${c.Green[i]}\n`
                embed.setDescription(HexColors)
            }
            return message.reply({ embeds: [embed] })

        } else if (['red', 'vermelho'].includes(args[0]?.toLowerCase())) {

            embed.setTitle('🎨 #HEX: Vermelho').setColor(c.Red[1])
            for (let i = 0; i < c.Red.length; i++) {
                HexColors += `${i + 1}. ${c.Red[i]}\n`
                embed.setDescription(HexColors)
            }
            return message.reply({ embeds: [embed] })

        } else if (['pink', 'rosa'].includes(args[0]?.toLowerCase())) {

            embed.setTitle('🎨 #HEX: Rosa').setColor(c.Pink[1])
            for (let i = 0; i < c.Pink.length; i++) {
                HexColors += `${i + 1}. ${c.Pink[i]}\n`
                embed.setDescription(HexColors)
            }
            return message.reply({ embeds: [embed] })

        } else if (['purple', 'roxo'].includes(args[0]?.toLowerCase())) {

            embed.setTitle('🎨 #HEX: Roxo').setColor(c.Purple[1])
            for (let i = 0; i < c.Purple.length; i++) {
                HexColors += `${i + 1}. ${c.Purple[i]}\n`
                embed.setDescription(HexColors)
            }
            return message.reply({ embeds: [embed] })

        } else if (['orange', 'laranja'].includes(args[0]?.toLowerCase())) {

            embed.setTitle('🎨 #HEX: Laranja').setColor(c.Orange[1])
            for (let i = 0; i < c.Orange.length; i++) {
                HexColors += `${i + 1}. ${c.Orange[i]}\n`
                embed.setDescription(HexColors)
            }
            return message.reply({ embeds: [embed] })

        } else if (['yellow', 'amarelo'].includes(args[0]?.toLowerCase())) {

            embed.setTitle('🎨 #HEX: Amarelo').setColor(c.Yellow[1])
            for (let i = 0; i < c.Yellow.length; i++) {
                HexColors += `${i + 1}. ${c.Yellow[i]}\n`
                embed.setDescription(HexColors)
            }
            return message.reply({ embeds: [embed] })

        } else if (['white', 'branco'].includes(args[0]?.toLowerCase())) {

            embed.setTitle('🎨 #HEX: Branco').setColor(c.White[0])
            for (let i = 0; i < c.White.length; i++) {
                HexColors += `${i + 1}. ${c.White[i]}\n`
                embed.setDescription(HexColors)
            }
            return message.reply({ embeds: [embed] })

        } else {
            return message.reply(`${e.Deny} | Cor não listada. Use \`${prefix}cor\` que te mando a lista.`)
        }
    }
}