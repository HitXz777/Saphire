const { e } = require('../../../JSON/emojis.json'),
    { MessageActionRow, MessageSelectMenu } = require('discord.js')

module.exports = {
    name: 'signo',
    aliases: ['setsigno'],
    category: 'perfil',
    emoji: '♋',
    usage: '<signo>',
    description: 'Defina seu signo no perfil',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let data = await Database.User.findOne({ id: message.author.id }, 'Perfil.Signo'),
            sig = data.Perfil?.Signo || '',
            check = false,
            // emojis = ['♓', '♒', '♑', '♐', '♏', '♎', '♉', '♋', '♊', '♌', '♍'],
            values = [
                { label: 'Peixes', emoji: '♓', value: 'peixes' },
                { label: 'Aquário', emoji: '♒', value: 'aquário' },
                { label: 'Capricórnio', emoji: '♑', value: 'capricórnio' },
                { label: 'Sagitário', emoji: '♐', value: 'sagitário' },
                { label: 'Escorpião', emoji: '♏', value: 'escorpião' },
                { label: 'Libra', emoji: '♎', value: 'libra' },
                { label: 'Áries', emoji: '♈', value: 'áries' },
                { label: 'Touro', emoji: '♉', value: 'touro' },
                { label: 'Câncer', emoji: '♋', value: 'câncer' },
                { label: 'Gêmeos', emoji: '♊', value: 'gêmeos' },
                { label: 'Leão', emoji: '♌', value: 'leão' },
                { label: 'Virgem', emoji: '♍', value: 'virgem' },
                { label: 'Cancelar', emoji: '❌', value: 'cancelar' }
            ], options = []

        sig
            ? (() => {
                for (let i of values)
                    if (!sig.includes(i.emoji))
                        options.push(i)
            })()
            : options = [...values]

        let selectMenu = new MessageActionRow()
            .addComponents(new MessageSelectMenu()
                .setCustomId('menu')
                .setPlaceholder('Definir meu signo') // Mensagem estampada
                .addOptions([options])
            ),
            msg = await message.reply({ content: `${e.Loading} | Aguardando resposta...`, components: [selectMenu] })

        const collector = msg.createMessageComponentCollector({
            filter: (interaction) => interaction.customId === 'menu' && interaction.user.id === message.author.id,
            time: 60000,
            max: 1,
            errors: ['time', 'max']
        })
            .on('collect', (interaction) => {
                interaction.deferUpdate().catch(() => { })
                check = true
                switch (interaction.values[0]) {
                    case 'peixes': SetSignoProfile("♓ Peixes"); break;
                    case 'aquário': SetSignoProfile("♒ Aquário"); break;
                    case 'capricórnio': SetSignoProfile("♑ Capricórnio"); break;
                    case 'sagitário': SetSignoProfile("♐ Sagitário"); break;
                    case 'escorpião': SetSignoProfile("♏ Escorpião"); break;
                    case 'libra': SetSignoProfile("♎ Libra"); break;
                    case 'áries': SetSignoProfile("♈ Áries"); break;
                    case 'touro': SetSignoProfile("♉ Touro"); break;
                    case 'câncer': SetSignoProfile("♋ Câncer"); break;
                    case 'gêmeos': SetSignoProfile("♊ Gêmeos"); break;
                    case 'leão': SetSignoProfile("♌ Leão"); break;
                    case 'virgem': SetSignoProfile("♍ Virgem"); break;
                    case 'cancelar': collector.stop(); break;
                    default: msg.edit({ content: `${e.Deny} | Comando cancelado.`, components: [] }).catch(() => { }); break;
                }

            })
            .on('end', () => {
                if (check) return
                return msg.edit({ content: `${e.Deny} | Comando cancelado.`, components: [] }).catch(() => { })
            })

        return

        async function SetSignoProfile(signo) {

            Database.updateUserData(message.author.id, 'Perfil.Signo', signo)
            return msg.edit({ content: `${e.Check} | Seu signo foi alterado com sucesso para **${signo}**!`, components: [] }).catch(() => { })
        }

    }
}