const { Permissions } = require('discord.js')
const { e } = require('../../../database/emojis.json')
const Moeda = require('../../../Routes/functions/moeda')
const { ServerDb } = require('../../../Routes/functions/database')

module.exports = {
    name: 'buscar',
    aliases: ['bus', 'busca'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '🔦',
    usage: '<buscar>',
    description: 'Ajude a Princesa Kaya',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (!message.guild.me.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS))
            return message.channel.send(`${e.Deny} | Eu preciso da permissão \`GERENCIAR CANAIS\` para executar este comando.`)

        if (sdb.get(`Users.${message.author.id}.Timeouts.Buscar`) !== null && 1500 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Buscar`)) > 0)
            return

        let canal = message.guild.channels.cache.get(ServerDb.get(`Servers.${message.guild.id}.Farm.BuscaChannel`)) || false

        const BuscarObj = {
            Machado: {
                Machado: sdb.get(`Users.${message.author.id}.Slot.Machado.Machado`),
                Usos: sdb.get(`Users.${message.author.id}.Slot.Machado.Usos`),
            },
            Bola: sdb.get(`Users.${message.author.id}.Slot.Bola`),
            DiamanteNegro: sdb.get(`Users.${message.author.id}.Slot.DiamanteNegro`),
            Cachorro: sdb.get(`Users.${message.author.id}.Slot.Cachorro`),
            Comidas: sdb.get(`Users.${message.author.id}.Slot.Comidas`),
            Ossos: sdb.get(`Users.${message.author.id}.Slot.Ossos`),
            Remedio: sdb.get(`Users.${message.author.id}.Slot.Remedio`),
        }

        let { Machado, Bola, DiamanteNegro, Cachorro, Comidas, Ossos, Remedio } = BuscarObj
        let dinh, apple, comidas, rosas, rand, randa

        if (!canal) return message.reply(`${e.Deny} | Este comando requer um canal específico.\n${e.SaphireObs} | Você pode usar \`${prefix}channel farm buscar\` que eu faço tudo pra você!`)
        if (canal.id !== message.channel.id) return message.reply(`${e.SaphireObs} | Este não é o canal de busca. Chega mais, é aqui: ${canal}`)
        if (canal.rateLimitPerUser < 1) canal.setRateLimitPerUser(1, ['Cooldown é necessário.']).catch(err => { return message.channel.send(`${e.Warn} | Falha ao configurar o cooldown em 1 segundos.\n\`\`\`${err}\`\`\``) })
        if (!Machado.Machado) return message.reply(`${e.Deny} | ${message.author}, você precisa de um machado. Compre um na \`${prefix}loja\``)
        if ((Machado.Usos || 0) <= 0) return message.reply(`${e.Deny} | Seu machado está danificado! Restaure ele na \`${prefix}loja\``)

        if ((Comidas || 0) >= 1) {
            sdb.subtract(`Users.${message.author.id}.Xp`, 1)
            rand = Math.floor(Math.random() * 100)
            randa = Math.floor(Math.random() * 100)

            sdb.set(`Users.${message.author.id}.Timeouts.Buscar`, Date.now())
            sdb.subtract(`Users.${message.author.id}.Slot.Comidas`, 1)
            sdb.subtract(`Users.${message.author.id}.Slot.Machado.Usos`, 1)

            if (rand > 15) return Lose()

            if (randa <= 4) {
                dinh = Math.floor(Math.random() * 30) + 1
                apple = Math.floor(Math.random() * 4) + 1
                comidas = Math.floor(Math.random() * 3) + 1
                rosas = Math.floor(Math.random() * 2) + 1

                if (!Bola) {
                    sdb.add(`Users.${message.author.id}.Slot.Apple`, apple); sdb.add(`Users.${message.author.id}.Slot.Comida`, comidas); sdb.add(`Users.${message.author.id}.Slot.Rosas`, rosas); sdb.add(`Users.${message.author.id}.Balance`, dinh); sdb.set(`Users.${message.author.id}.Slot.Bola`, true);
                    return message.reply({ embeds: [new MessageEmbed().setColor('GREEN').setTitle('⭐ Você adquiriu um item de Classe Especial').addField('Item: 🥎 Bola do Brown', `Você obteve: ${dinh} ${Moeda(message)}, ${apple} 🍎 Maças, ${comidas} 🥘 Comidas e ${rosas} 🌹 Rosas`)] })
                } else {
                    sdb.add(`Users.${message.author.id}.Slot.Apple`, apple)
                    sdb.add(`Users.${message.author.id}.Slot.Comida`, comidas)
                    sdb.add(`Users.${message.author.id}.Slot.Rosas`, rosas)
                    sdb.add(`Users.${message.author.id}.Balance`, dinh)
                    return message.reply({ embeds: [new MessageEmbed().setColor('GREEN').addField('🪙 🪙 Baú perdido! 🪙 🪙', `Você obteve: ${dinh} ${Moeda(message)}, ${apple} 🍎 Maças, ${comidas} 🥘 Comidas e ${rosas} 🌹 Rosas`)] })
                }

            } 
            
            if (randa === 5) {

                if (!DiamanteNegro) {
                    sdb.set(`Users.${message.author.id}.Slot.DiamanteNegro`, true)
                    return message.reply({ embeds: [new MessageEmbed().setColor('GREEN').setTitle('⭐ Você adquiriu um item de Classe Especial').setDescription(`Item: ${e.DarkDiamond} Diamante Negro`)] })
                } else {
                    dinh = Math.floor(Math.random() * 30) + 1
                    apple = Math.floor(Math.random() * 4) + 1
                    comidas = Math.floor(Math.random() * 3) + 1
                    rosas = Math.floor(Math.random() * 2) + 1
                    sdb.add(`Users.${message.author.id}.Slot.Apple`, apple)
                    sdb.add(`Users.${message.author.id}.Slot.Comida`, comidas)
                    sdb.add(`Users.${message.author.id}.Slot.Rosas`, rosas)
                    sdb.add(`Users.${message.author.id}.Balance`, dinh)
                    return message.reply({ embeds: [new MessageEmbed().setColor('GREEN').addField('🪙 🪙 Baú perdido! 🪙 🪙', `Você obteve: ${dinh} ${Moeda(message)}, ${apple} 🍎 Maças, ${comidas} 🥘 Comidas e ${rosas} 🌹 Rosas`)] })
                }

            } 
            
            if (randa > 15) {

                apple = Math.floor(Math.random() * 4) + 1
                comidas = Math.floor(Math.random() * 2) + 1
                rosas = Math.floor(Math.random() * 2) + 1
                dinh = Math.floor(Math.random() * 20) + 1
                sdb.add(`Users.${message.author.id}.Slot.Apple`, apple)
                sdb.add(`Users.${message.author.id}.Slot.Comida`, comidas)
                sdb.add(`Users.${message.author.id}.Slot.Rosas`, rosas)
                sdb.add(`Users.${message.author.id}.Balance`, dinh)
                return message.reply({ embeds: [new MessageEmbed().setColor('GREEN').addField('🪙 🪙 Baú perdido! 🪙 🪙', `Você obteve: ${dinh} ${Moeda(message)}, ${apple} 🍎 Maças, ${comidas} 🥘 Comidas e ${rosas} 🌹 Rosas`)] })
            }

            if (randa === 6) {
                if (!Cachorro) {
                    await message.reply({ embeds: [new MessageEmbed().setColor('#246FE0').setTitle('🐶 Você achou o Brown!!!').setDescription('Ele está com medo! Dê 5 🦴 `Ossos` para ele se acalmar!').setFooter('Você tem 20 segundos até as reações sumirem!')] }).then(msg => {
                        sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                        msg.react('✅').catch(() => { }) // Check
                        msg.react('❌').catch(() => { }) // X

                        const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                        msg.awaitReactions({ filter, max: 1, time: 20000, errors: ['time'] }).then(collected => {
                            const reaction = collected.first()

                            if (reaction.emoji.name === '✅') {
                                sdb.delete(`Request.${message.author.id}`)

                                if ((Ossos || 0) < 5) {
                                    return message.reply(`${e.Deny} | Você não tem ossos suficiente! Brown se assustou e saiu correndo.`)
                                } else {
                                    sdb.subtract(`Users.${message.author.id}.Slot.Ossos`, 5)
                                    sdb.set(`Users.${message.author.id}.Slot.Cachorro`, true)
                                    return msg.edit({ embeds: [new MessageEmbed().setColor('GREEN').setTitle('🌲 Você adquiriu um item de Clase Especial').setDescription(`${e.Doguinho} Au au au!`)] }).catch(() => { })
                                }

                            } else {
                                sdb.delete(`Request.${message.author.id}`)
                                msg.delete().catch(() => { })
                                message.reply(`${e.Deny} | Você se recusou a resgatar o Brown!`)
                            }
                        }).catch(() => {
                            sdb.delete(`Request.${message.author.id}`)
                            return msg.edit({ embeds: [new MessageEmbed().setColor('RED').setTitle(`${e.Deny} Time Over!`).setDescription(`Tempo expirado.`)] }).catch(() => { })
                        })
                    })
                } else {
                    return message.reply('🐾 Você encontrou pegadas do Brown.')
                }
            }

            if (randa >= 6 && randa <= 10) {
                if (!Remedio) {
                    sdb.set(`Users.${message.author.id}.Slot.Remedio`, true)
                    return message.reply({ embeds: [new MessageEmbed().setColor('#246FE0').setTitle('💊 Remédio!!').setDescription('Você achou o Remédio do Velho Welter!')] })
                } else {
                    return message.reply('💊 Você encontrou pílulas quebradas.')
                }
            }

            if (randa >= 11 && randa <= 15)
                return message.reply({ embeds: [new MessageEmbed().setColor('#246FE0').setTitle('🐾 Você encontrou pegadas do Brown.')] })

            function Lose() {
                apple = Math.floor(Math.random() * 2) + 1
                sdb.add(`Users.${message.author.id}.Slot.Apple`, apple)
                return message.reply(`🍎 Você encontrou ${apple} maças!`)
            }
        } else {
            message.reply(`❌ | ${message.author}, você não possui comidas para buscar o Brown. Compre algumas na \`${prefix}loja\``)
        }
    }
}