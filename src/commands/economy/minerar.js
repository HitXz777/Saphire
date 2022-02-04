const { e } = require('../../../database/emojis.json')
const Moeda = require('../../../Routes/functions/moeda')
const { Permissions } = require('discord.js')
const colors = require('../../../Routes/functions/colors')
const { ServerDb } = require('../../../Routes/functions/database')

module.exports = {
    name: 'minerar',
    aliases: ['mine'],
    category: 'economy',
    emoji: '⛏️',
    usage: '<minerar>',
    description: 'Minere e obtenha recursos',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (!message.guild.me.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS))
            return message.channel.send(`${e.Deny} | Eu preciso da permissão \`GERENCIAR CANAIS\` para executar este comando.`)

        let canal = message.guild.channels.cache.get(ServerDb.get(`Servers.${message.guild.id}.Farm.MineChannel`)) || false

        let { Picareta, Aguas, Mamute, Fossil, ossos, minerios, diamantes, dinh, rand, randa, Embed } = {
            Picareta: {
                Picareta: sdb.get(`Users.${message.author.id}.Slot.Picareta.Picareta`),
                Usos: sdb.get(`Users.${message.author.id}.Slot.Picareta.Usos`)
            },
            Aguas: sdb.get(`Users.${message.author.id}.Slot.Aguas`),
            Mamute: sdb.get(`Users.${message.author.id}.Slot.Mamute`),
            Fossil: sdb.get(`Users.${message.author.id}.Slot.Fossil`),
            ossos: Math.floor(Math.random() * 2) + 1,
            minerios: Math.floor(Math.random() * 2) + 1,
            diamantes: Math.floor(Math.random() * 1) + 1,
            dinh: Math.floor(Math.random() * 40) + 1,
            randa: Math.floor(Math.random() * 25),
            rand: Math.floor(Math.random() * 15),
            Embed: new MessageEmbed()
        }

        if (!canal)
            return message.reply(`${e.Deny} | Este comando requer um canal específico.\n${e.SaphireObs} | Você pode usar \`${prefix}channel farm minerar\` que eu faço tudo pra você!`)

        if (canal.id !== message.channel.id)
            return message.reply(`${e.SaphireObs} | Este não é o canal de busca. Chega mais, é aqui: ${canal}`)

        if (canal.rateLimitPerUser < 1)
            canal.setRateLimitPerUser(1, ['Cooldown é necessário.']).catch(err => { return message.channel.send(`${e.Warn} | Falha ao configurar o cooldown em 1 segundos.\n\`\`\`${err}\`\`\``) })

        if (!Picareta.Picareta)
            return message.reply(`${e.Deny} | Você precisa de uma ⛏️ \`Picareta\` pra minerar, compre uma na \`${prefix}loja\``)

        if ((Aguas || 0) <= 0)
            return message.reply(`${e.Deny} | Você está sem água. Compre uns copos na \`${prefix}loja\``)

        if ((Picareta.Usos || 0) <= 0)
            return message.reply(`${e.Deny} | **Picareta Danificada!** | Restaure ela na \`${prefix}loja\``)

        sdb.subtract(`Users.${message.author.id}.Xp`, 2)
        sdb.subtract(`Users.${message.author.id}.Slot.Aguas`, 1)
        sdb.subtract(`Users.${message.author.id}.Slot.Picareta.Usos`, 1)
        rand === 1 ? SomePrizes() : NormalFarm(minerios)

        function SomePrizes() {
            if (randa <= 18) return Loose(ossos, minerios, diamantes, dinh)
            if (randa === 19) return NewMamute()
            if (randa === 20) return NewFossil(ossos, minerios, diamantes, dinh, Fossil)
            if (randa > 20) return Pegadas()
        }

        function Loose(ossos, minerios, diamantes, dinh) {
            sdb.add(`Users.${message.author.id}.Slot.Minerios`, minerios)
            sdb.add(`Users.${message.author.id}.Slot.Ossos`, ossos)
            sdb.add(`Users.${message.author.id}.Slot.Diamante`, diamantes)
            sdb.add(`Users.${message.author.id}.Balance`, dinh)
            return message.reply({ embeds: [Embed.setColor('GREEN').setTitle('⛏️ Você cavou itens valiosos!').addField('🪙 🪙 Você achou novos itens! 🪙 🪙', `Você obteve: ${dinh} ${Moeda(message)}, ${minerios} 🪨 Minerios, ${ossos} 🦴 Ossos e ${diamantes} 💎 Diamantes`).setFooter(`R:${rand}`)] })
        }

        function NewMamute() {
            if (!Mamute) {
                sdb.set(`Users.${message.author.id}.Slot.Mamute`, true)
                return message.reply({ embeds: [Embed.setColor('GREEN').setTitle('⭐ Você adquiriu um item de Clase Especial').setDescription(`Item: **Mamute Pré Histórico** | 🦣 *sons de mamute*`).setFooter(`R:${rand}`)] })
            } else {
                return Pegadas()
            }
        }

        function Pegadas() { return message.reply({ embeds: [Embed.setColor('#246FE0').setTitle('Há um mamute por perto').setDescription(`🦣 *Sons de mamute*`).setFooter(`R:${rand}`)] }) }


        function NormalFarm(minerios) {
            sdb.add(`Users.${message.author.id}.Slot.Minerios`, minerios)
            return message.reply(`⛏️ | Você minerou 🪨 ${minerios} minérios. | R:${rand}`)
        }

        function NewFossil(ossos, minerios, diamantes, dinh, fossil) {
            if (!fossil) {
                sdb.add(`Users.${message.author.id}.Slot.Minerios`, minerios)
                sdb.add(`Users.${message.author.id}.Slot.Ossos`, ossos)
                sdb.add(`Users.${message.author.id}.Slot.Diamante`, diamantes)
                sdb.add(`Users.${message.author.id}.Balance`, dinh)
                sdb.set(`Users.${message.author.id}.Slot.Fossil`, true)
                return message.reply({ embeds: [Embed.setColor('GREEN').setTitle('⭐ Você adquiriu um item de Classe Especial').addField(`Item: ${e.Fossil} Fossil`, `Você obteve: ${dinh} ${Moeda(message)}, ${minerios} 🪨 Minerios, ${ossos} 🦴 Ossos e ${diamantes} 💎 Diamantes`).setFooter(`R:${rand}`)] })
            } else {
                sdb.add(`Users.${message.author.id}.Slot.Minerios`, minerios)
                sdb.add(`Users.${message.author.id}.Slot.Ossos`, ossos)
                sdb.add(`Users.${message.author.id}.Slot.Diamante`, diamantes)
                sdb.add(`Users.${message.author.id}.Balance`, dinh)
                return message.reply({ embeds: [Embed.setColor('GREEN').setTitle('⛏️ Você cavou itens valiosos!').setDescription(`Você obteve: ${dinh} ${Moeda(message)}, ${minerios} 🪨 Minerios, ${ossos} 🦴 Ossos e ${diamantes} 💎 Diamantes`).setFooter(`R:${rand}`)] })
            }
        }
    }
}