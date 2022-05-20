const
    { e } = require('../../../JSON/emojis.json'),
    Data = require('../../../modules/functions/plugins/data'),
    { MessageButton, MessageActionRow } = require('discord.js')

module.exports = {
    name: 'afk',
    aliases: ['off', 'offline'],
    category: 'afksystem',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.Afk}`,
    usage: '<afk> <motivo>',
    description: 'Com este comando, eu aviso pra todos que chamarem você que você está offline',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let Motivo = args.join(" ") || 'Sem recado definido.'

        if (Motivo.length > 1000) return message.reply(`${e.Deny} | O seu motivo não pode passar de 1000 caracteres.`)

        for (const word of ['@everyone', '@here'])
            if (Motivo.includes(word))
                return message.channel.send(`${e.Deny} | ${message.author}, o seu recado contém palavras que são proibidas neste comando.`)

        let AfkInfoEmbed = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(`${e.Planet} Afk Global System`)
            .setDescription('Utilize este comando para avisar que você está offline.')
            .addFields(
                {
                    name: '🏠 Servidor',
                    value: 'Avisarei apenas neste servidor que você está offline.'
                },
                {
                    name: '🌎 Global',
                    value: 'Avisarei em todos os servidores que você está offline.'
                },
                {
                    name: '❌ Cancelar',
                    value: 'Cancela o comando.'
                },
                {
                    name: `${e.Warn} | Atenção!`,
                    value: '> 1. O \`Modo Global\` é desativado quando você mandar uma mensagem em qualquer servidor comigo.\n> 2. O \`Modo Servidor\` será desativado apenas se você mandar mensagem no servidor em que o sistema foi ativado.\n> 3. O \`Modo Global\` sobre põe o modo local.'
                }
            ),
            validate = false,
            buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('inGuild')
                        .setLabel('Servidor')
                        .setEmoji('🏠')
                        .setStyle('SUCCESS')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('global')
                        .setLabel('Global')
                        .setEmoji('🌎')
                        .setStyle('SUCCESS')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('help')
                        .setLabel('Painel de ajuda')
                        .setEmoji('❓')
                        .setStyle('PRIMARY')
                )
                .addComponents(
                    new MessageButton()
                        .setCustomId('cancel')
                        .setLabel('Cancelar')
                        .setEmoji('❌')
                        .setStyle('DANGER')
                ),
            msg = await message.reply({
                content: `${e.Loading} | AFK Global System - Escolha um opção...`,
                components: [buttons]
            }),
            collector = msg.createMessageComponentCollector({
                filter: (interaction) => interaction.user.id === message.author.id,
                time: 15000,
                erros: ['time']
            })

                .on('collect', async (interaction) => {
                    validate = true
                    collector.stop()

                    if (interaction.customId === 'cancel')
                        return msg.edit({ content: `${e.Deny} | Comando cancelado.` }).catch(() => { })

                    if (interaction.customId === 'inGuild') {

                        await Database.Guild.updateOne(
                            { id: message.guild.id },
                            {
                                $push: {
                                    AfkSystem: {
                                        MemberId: message.author.id,
                                        Message: `\`${Data(0, true)}\`\n🗒️ | ${Motivo}`
                                    }
                                }
                            },
                            { upsert: true }
                        )

                        return msg.edit({ content: `${e.Check} | Pode deixar! Vou avisar a todos nesse servidor que você está offline. ${e.SaphireFeliz}` }).catch(() => { })
                    }

                    if (interaction.customId === 'global') {

                        await Database.User.updateOne(
                            { id: message.author.id },
                            { AfkSystem: `\`${Data()}\`\n🗒️ | ${Motivo}` },
                            { upsert: true }
                        )

                        return msg.edit({ content: `${e.Planet} | Deixa comigo! Vou avisar em todos os servidores que você está offline. ${e.Menhera}` }).catch(() => { })
                    }

                    if (interaction.customId === 'help')
                        return msg.edit({ content: 'Aqui estão as informações', embeds: [AfkInfoEmbed] }).catch(() => { })

                    return message.reply(`${e.Deny} | Comando de registro inválido.`)

                })

                .on('end', () => {

                    if (!validate) msg.edit({ content: `${e.Deny} | Comando cancelado` }).catch(() => { })
                    return msg.edit({ components: [] }).catch(() => { })
                })

        return
    }
}