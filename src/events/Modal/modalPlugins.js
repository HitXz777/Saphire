
function eightyYears(formatBr = false) {

    const date = new Date(Date.now() - 3155760000000)
    date.setHours(date.getHours() - 3)

    let Dia = FormatNumber(date.getDate()),
        Ano = date.getFullYear()

    if (formatBr)
        return `${Dia}/${FormatNumber(date.getMonth() + 1)}/${Ano}`

    return `${Ano}-${FormatNumber(date.getMonth() + 1)}-${Dia}`
}

function Now(formatBr = false) {

    const date = new Date(Date.now() - 410248800000)
    date.setHours(date.getHours() - 3)

    let Dia = FormatNumber(date.getDate()),
        Ano = date.getFullYear()

    if (formatBr)
        return `${Dia}/${FormatNumber(date.getMonth() + 1)}/${Ano}`

    return `${Ano}-${FormatNumber(date.getMonth() + 1)}-${Dia}`

}

function FormatNumber(data) {
    return data < 10 ? `0${data}` : data
}

function getUser(nameOrId, client) {

    return client.users.cache.find(data => {
        return data.username === nameOrId
            || data.tag === nameOrId
            || data.id === nameOrId
    })

}

module.exports = {
    eightyYears,
    Now,
    FormatNumber,
    getUser
}