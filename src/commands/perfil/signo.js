const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'signo',
    aliases: ['setsigno'],
    category: 'perfil',
    emoji: '♋',
    usage: '<signo>',
    description: 'Defina seu signo no perfil',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        const embed = new MessageEmbed()
            .setColor('#9266CC')
            .setTitle('Diga qual é seu signo.')
            .setDescription(`♈ Áries\n♉ Touro\n♊ Gêmeos\n♋ Câncer\n♌ Leão\n♍ Virgem\n♎ Libra\n♏ Escorpião\n♐ Sagitário\n♑ Capricórnio\n♒ Aquário\n♓ Peixes\n${e.Deny} Cancelar`)
            .setFooter('Responda em 15 segundos')

        let aries = "♈ Áries"
        let touro = "♉ Touro"
        let gemeos = "♊ Gêmeos"
        let cancer = "♋ Câncer"
        let leao = "♌ Leão"
        let virgem = "♍ Virgem"
        let libra = "♎ Libra"
        let escorpiao = "♏ Escorpião"
        let sagitario = "♐ Sagitário"
        let capricornio = "♑ Capricórnio"
        let aquario = "♒ Aquário"
        let peixes = "♓ Peixes"

        message.reply({ embeds: [embed] }).catch(() => { }).then(embedmsg => {

            const filter = m => m.author.id === message.author.id
            const collector = message.channel.createMessageCollector({ filter, max: 1, time: 15000 });

            collector.on('collect', m => {
                let content = m.content.toLowerCase()

                switch (content) {
                    case 'peixes': SetSignoProfile(peixes); break;
                    case 'aquário': SetSignoProfile(aquario); break;
                    case 'capricórnio': SetSignoProfile(capricornio); break;
                    case 'sagitário': SetSignoProfile(sagitario); break;
                    case 'escorpião': SetSignoProfile(escorpiao); break;
                    case 'libra': SetSignoProfile(libra); break;
                    case 'áries': SetSignoProfile(aries); break;
                    case 'touro': SetSignoProfile(touro); break;
                    case 'câncer': SetSignoProfile(cancer); break;
                    case 'gêmeos': SetSignoProfile(gemeos); break;
                    case 'leão': SetSignoProfile(leao); break;
                    case 'virgem': SetSignoProfile(virgem); break;
                    case 'cancelar': embedmsg.delete().catch(() => { }); break;
                    default: Cancel(); break;
                }

            });

            function Cancel() {
                embed.setColor('RED').setTitle(`${e.Deny} | Request cancelada!`).setDescription('Nenhum signo definido.').setFooter(message.author.id)
                embedmsg.edit({ embeds: [embed] }).catch(() => { })
            }

            function SetSignoProfile(signo) {
                if (sdb.get(`Users.${message.author.id}.Perfil.Signo`) === signo) return message.channel.send(`${e.Info} | ${message.author}, este já é o seu signo definido.`)
                sdb.set(`Users.${message.author.id}.Perfil.Signo`, `${signo}`)
                embed.setColor('GREEN').setTitle(`${e.Check} | Signo alterado com sucesso!`).setDescription(`Definido: ${signo}`).setFooter(message.author.id)
                embedmsg.edit({ embeds: [embed] }).catch(() => { })
            }

        })
    }
}