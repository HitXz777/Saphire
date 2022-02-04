const ms = require('parse-ms')

function GetTimeout(TimeToCooldown = 0, DateNowInDatabase = 0) {

    let Time = ms(TimeToCooldown - (Date.now() - DateNowInDatabase)),
        Day = Time.days > 0 ? `${Time.days}d` : '',
        Hours = Time.hours > 0 ? ` ${Time.hours}h` : '',
        Minutes = Time.minutes > 0 ? ` ${Time.minutes}m` : '',
        Seconds = Time.seconds > 0 ? ` ${Time.seconds}s` : '',
        Nothing = !Day && !Hours && !Minutes && !Seconds ? 'Invalid Cooldown Acess Bad Formated' : ''

    return `${Day}${Hours}${Minutes}${Seconds}${Nothing}`

}

module.exports = GetTimeout