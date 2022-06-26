/**
 * Requerindo o Discord para criação de protótipos dentro e suas classes
 */

const { Guild, GuildMember } = require('discord.js')

/**
 * ESSE SISTEMA DE PROTOTYPES FOI UMA GAMBIARRA FEITA POR PURA CURIOSIDADE PELOS SEGUINTES MEMBROS:
 * IDEALIZADOR DO PROTOTYPES: JackSkelt#3063 - 904891162362519562
 * ESCRITA: Rody:1000 - 451619591320371213
 * IDEALIZADOR DO "clientPermissions": Seeker#2083 = 750714601284304986
 */

/**
 * Função adicionado ao Array que pega um item aleatório do mesmo.
 */
Array.prototype.random = function (times = 0, repeat = false) {

    if (times > 0) {
        let originalArray = this
        let newArray = []

        if (repeat)
            for (let i = 0; i < times; i++)
                newArray.push(originalArray[~~(Math.random() * originalArray.length)])
        else
            for (let i = 0; i < times; i++) {
                let value = ~~(Math.random() * originalArray.length)
                newArray.push(originalArray[value])
                originalArray.splice(value, 1)
            }

        return newArray
    }

    return this[~~(Math.random() * this.length)]
}

String.prototype.isURL = function () {
    let regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    return regexp.test(this)
}

Date.prototype.constructor.format = function (DateInMs = 0, Shorted = false, withDateNow = true) {

    if (Shorted)
        return new Date(DateInMs + Date.now()).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })

    const date = withDateNow ? new Date(DateInMs + Date.now()) : new Date(DateInMs)
    date.setHours(date.getHours() - 3)

    let Mes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][date.getMonth()],
        DiaDaSemana = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"][date.getDay()],
        Dia = FormatNumber(date.getDate()),
        Hora = FormatNumber(date.getHours()),
        Seconds = FormatNumber(date.getSeconds()),
        Minutes = FormatNumber(date.getMinutes()),
        Ano = date.getFullYear()

    return `${DiaDaSemana}, ${Dia} de ${Mes} de ${Ano} ás ${Hora}:${Minutes}${Seconds > 0 ? `:${Seconds}` : ''}`

    function FormatNumber(data) {
        return data < 10 ? `0${data}` : data
    }
}

String.prototype.didYouMean = function (array) { // Credits: JackSkelt#3063 - 904891162362519562
    return array
        .map(e => { return { e, v: checkSimilarity(this, e) } })
        .filter(({ v }) => v >= 80 / 100)
        .reduce((_, curr, i, arr) => arr[i].v > curr ? arr[i].v : curr.e, null)
}

function checkSimilarity(str1, str2) { // Credits: JackSkelt#3063 - 904891162362519562
    if (str1 === str2) return 1.0

    const len1 = str1.length
    const len2 = str2.length

    const maxDist = ~~(Math.max(len1, len2) / 2) - 1
    let matches = 0

    const hash1 = []
    const hash2 = []

    for (var i = 0; i < len1; i++)
        for (var j = Math.max(0, i - maxDist); j < Math.min(len2, i + maxDist + 1); j++)
            if (str1.charAt(i) === str2.charAt(j) && !hash2[j]) {
                hash1[i] = 1
                hash2[j] = 1
                matches++
                break
            }

    if (!matches) return 0.0

    let t = 0
    let point = 0

    for (var k = 0; k < len1; k++)
        if (hash1[k]) {
            while (!hash2[point])
                point++

            if (str1.charAt(k) !== str2.charAt(point++))
                t++
        }

    t /= 2

    return ((matches / len1) + (matches / len2) + ((matches - t) / matches)) / 3.0
}

Guild.prototype.clientPermissions = function (Permission) {  // Credits: Seeker#2083 = 750714601284304986
    return this.me.permissions.has(Permission)
}

GuildMember.prototype.memberPermissions = function (Permission) {
    return this.permissions.has(Permission)
}