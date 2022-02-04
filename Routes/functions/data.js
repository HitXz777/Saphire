function Data(DateInMs = 0, Shorted = false) {

    if (Shorted)
        return new Date(DateInMs + Date.now()).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })

    const date = new Date(DateInMs + Date.now())
    date.setHours(date.getHours() - 3)

    let Mes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][date.getMonth()],
        DiaDaSemana = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"][date.getDay()],
        Dia = FormatNumber(date.getDate()),
        Hora = FormatNumber(date.getHours()),
        Seconds = FormatNumber(date.getSeconds()),
        Minutes = FormatNumber(date.getMinutes()),
        Ano = date.getFullYear()

    return `${DiaDaSemana}, ${Dia} de ${Mes} de ${Ano} ${Hora}:${Minutes}:${Seconds}`
}

function FormatNumber(data) {
    return data < 10 ? `0${data}` : data
}

module.exports = Data