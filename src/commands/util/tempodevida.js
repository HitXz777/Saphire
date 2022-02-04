const { e } = require('../../../database/emojis.json')
const fromNow = require('fromnow');
const translate = require('@iamtraction/google-translate')

module.exports = {
    name: 'tempodevida',
    aliases: ['quantovivi', 'idade', 'dias', 'tempovivido', 'date'],
    category: 'util',
    
    
    emoji: '⏲️',
    usage: '<dias> [anos]',
    description: 'Quanto tempo eu vivi?',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (!args[0]) return message.reply(`${e.QuestionMark} | Você precisa dizer sua data de aniversário.`)
        if (args[3]) return message.reply(`${e.SaphireWhat} | Nada além da sua data de aniversário.`)

        let DataAtual = new Date()
        let DiaAtual = DataAtual.getDate()
        let MesAtual = DataAtual.getMonth() + 1
        let AnoAtual = DataAtual.getFullYear()

        let dia = parseInt(args[0])
        let mes = parseInt(args[1])
        let ano = parseInt(args[2])
        if (!dia || !mes || !ano) return message.reply(`${e.Info} | Segue esse formato -> **DD MM AAAA** | **26 06 1999**`)
        if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return message.reply(`${e.SaphireWhat} | Datas são **NÚMEROS**, ok?`)
        if (args[0].length !== 2) return message.reply(`${e.SaphireWhat} | Dias contém apenas 2 caractes, ele vão de 01 a 31`)
        if (args[1].length !== 2) return message.reply(`${e.SaphireWhat} | Meses contém apenas 2 caractes, ele vão de 01 a 12`)
        if (args[2].length !== 4) return message.reply(`${e.SaphireWhat} | Os anos válidos estão entre 1910 e 2015`)

        // Dia
        if (dia > 31 || dia < 1) return message.reply(`${e.SaphireWhat} | Hey, fala um dia do mês! Eu acho que os meses começa no dia 1 e termina no dia 31`)

        // Mês
        if (mes > 12 || mes < 1) return message.reply(`${e.SaphireWhat} | Quantos meses tem seu ano?`)
        if (dia > 28 && mes === 02) return message.reply(`${e.SaphireWhat} | Fevereiro não tem mais de 28 dias`)
        if ((dia >= 31) && ['04', '06', '09', '11'].includes(args[1])) return message.reply(`${e.SaphireWhat} | Esse mês não tem o dia 31, baka.`)

        // Ano
        if (ano > AnoAtual || ano < 1) return message.reply(`${e.SaphireWhat} | Os anos válidos estão entre 1 e ${AnoAtual}`)

        if (ano === AnoAtual && mes > MesAtual) return message.reply(`${e.SaphireWhat} | Essa data ainda não chegou, acho eu.`)

        let text = fromNow(`${mes}/${dia + 1}/${ano}`)
        translate(text, { to: 'pt' }).then(res => {
            return message.reply(`${e.SaphireFeliz} | Você tem ${res.text} de vida.`).catch(() => { })
        }).catch(err => {
            message.reply(`${err}`)
        })
    }
}