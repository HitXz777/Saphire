const { e } = require('../../../database/emojis.json')
const axios = require("axios")

module.exports = {
    name: 'covid',
    aliases: ['cvd  '],
    category: 'util',
    
    ClientPermissions: ['EMBED_LINKS'],
    emoji: ':microbe:',
    usage: '<covid [SiglaDoPais] (Br/Usa/Pt/Ar)>',
    description: 'Contagem da Covid-19 Mundial',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        const baseUrl = "https://corona.lmao.ninja/v2"
        let url, response, corona

        try {
            url = args[0] ? `${baseUrl}/countries/${args[0]}` : `${baseUrl}/all`
            response = await axios.get(url)
            corona = response.data
        } catch (error) {
            return message.reply(`${e.Deny} | O argumento ***${args[0]}*** não existe ou os dados não foram publicados pela OMS (Organização Mundial da Saúde)`)
        }

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(args[0] ? `${args[0].toUpperCase()} Status` : 'Dados Mundiais da COVID-19')
            .setThumbnail(args[0] ? corona.countryInfo.flag : 'https://i.giphy.com/YPbrUhP9Ryhgi2psz3.gif')
            .addFields(
                {
                    name: '⛑️ Casos',
                    value: corona.cases.toLocaleString()
                },
                {
                    name: '😥 Mortes',
                    value: corona.deaths.toLocaleString()
                },
                {
                    name: '🥳 Recuperados',
                    value: corona.recovered.toLocaleString()
                },
                {
                    name: '✅ Ativos',
                    value: corona.active.toLocaleString()
                },
                {
                    name: '🚨 Casos Críticos',
                    value: corona.critical.toLocaleString()
                },
                {
                    name: ':heart: Recuperados Hoje',
                    value: corona.todayRecovered.toLocaleString().replace("-", "")
                },
                {
                    name: ':broken_heart: Mortes Hoje',
                    value: corona.todayDeaths.toLocaleString()
                })
            .setFooter(`${prefix}covid br`)

        message.reply({ embeds: [embed] }).catch(err => { return message.channel.send(`${Attention} | Houve um erro na execução deste comando.\n\`${err}\``) })
    }
}