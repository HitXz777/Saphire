const weather = require("weather-js")
const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'clima',
    aliases: ['weather', 'tempo'],
    category: 'util',
    
    ClientPermissions: ['EMBED_LINKS'],
    emoji: `🌥️`,
    usage: '<clima> <SiglaDaCidade/Pais> | <Nome da Cidade>',
    description: 'Veja o tempo da sua cidade',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        const noargs = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(`🌥️ Estação de Tempo da ${client.user.username}`)
            .setDescription('• Aqui você pode ver o clima de qualquer lugar do mundo, explore o clima dos paises e cidades.')
            .addField("Comando", `\`${prefix}clima SP/RJ/MG ou o nome da Cidade/Estado\``)
            .addField("Exemplo", `\`${prefix}clima SP ou São Paulo\``)

        if (!args[0]) { return message.reply({ embeds: [noargs] }) }

        let city = args.join(" ")

        await weather.find({ search: city, degreeType: "C" }, function (err, result) {

            if (!city) { return message.reply(`${e.Deny} | Formato incorreto! | \`${prefix}clima SP/RJ/MG ou o nome da Cidade/Estado\``) }
            if (err || result === undefined || result.length === 0) { return message.reply(`${e.Deny} | Nenhuma cidade/estado foi encontrado, verifique a ortografia.`) }

            let current = result[0].current
            let location = result[0].location

            const embed = new MessageEmbed()
                .setColor('#246FE0')
                .setAuthor(current.observationpoint)
                .setDescription(`> ${current.skytext}`)
                .setThumbnail(current.imageUrl)

            embed.addField("Latitude", location.lat, true)
                .addField("Longitude", location.long, true)
                .addField("Temperatura Térmica", `${current.feelslike}° Graus`, true)
                .addField("Escala de Medição", location.degreetype, true)
                .addField("Vento", current.winddisplay, true)
                .addField("Humidade", `${current.humidity}%`, true)
                .addField("Fuzo", `GMT ${location.timezone}`, true)
                .addField("Temperatura", `${current.temperature}° Graus`, true)
                .addField("Observação TimeTemp", current.observationtime, true)
                .setFooter('Isso aqui não é previsão do tempo')
                .setTimestamp()

            return message.reply({ embeds: [embed] }).catch(err => { return message.channel.send(`${e.Warn} | Houve um erro no meu processamento.\n\`${err}\``)})
        })
    }
}