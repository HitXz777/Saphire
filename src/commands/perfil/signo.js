const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'signo',
    aliases: ['setsigno'],
    category: 'perfil',
    emoji: '♋',
    usage: '<signo>',
    description: 'Defina seu signo no perfil',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        const embed = new MessageEmbed()
            .setColor('#9266CC')
            .setTitle('Diga qual é seu signo.')
            .setDescription(`♈ Áries\n♉ Touro\n♊ Gêmeos\n♋ Câncer\n♌ Leão\n♍ Virgem\n♎ Libra\n♏ Escorpião\n♐ Sagitário\n♑ Capricórnio\n♒ Aquário\n♓ Peixes\n${e.Deny} Cancelar`)
            .setFooter({ text: 'Responda em 15 segundos' })

        const msg = await message.reply({ embeds: [embed] }).catch(() => { }),
            collector = message.channel.createMessageCollector({ filter: m => m.author.id === message.author.id, max: 1, time: 15000 })

                .on('collect', m => {
                    let content = m.content.toLowerCase()

                    switch (content) {
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
                        default: Cancel(); break;
                    }

                });

        return

        function Cancel() {
            return msg.edit({ content: `${e.Deny} | Comando cancelado.`, embeds: [] }).catch(() => { })
        }

        async function SetSignoProfile(signo) {

            let data = await Database.User.findOne({ id: message.author.id }, 'Perfil.Signo'),
                sig = data.Perfil?.Signo

            if (sig === signo) return message.channel.send(`${e.Info} | ${message.author}, este já é o seu signo definido.`)
            Database.updateUserData(message.author.id, 'Perfil.Signo', signo)
            embed.setColor('GREEN').setTitle(`${e.Check} | Signo alterado com sucesso!`).setDescription(`Definido: ${signo}`).setFooter(message.author.id)
            msg.edit({ embeds: [embed] }).catch(() => { })
        }

    }
}