const { Client, Collection } = require('discord.js'),
    Database = require('./Database'),
    ms = require('parse-ms')

require('dotenv').config()

const SaphireClientConfiguration = {
    intents: 2047,
    allowedMentions: { parse: ['users'] },
    partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION']
}

class Saphire extends Client {
    constructor() {
        super(SaphireClientConfiguration)
        this.prefix = '-'
        this.commands = new Collection()
        this.aliases = new Collection()
        this.blue = '#246FE0'
        this.red = '#ED4245'
        this.green = '#57f287'
    }

    Timeout(TimeoutInMS = 0, DateNowAtDatabase = 0) {
        return TimeoutInMS - (Date.now() - DateNowAtDatabase) > 0
    }

    Rebooting = {
        ON: async (clientId) => {

            let cl = await Database.Client.findOne({ id: clientId })
            return cl?.Rebooting?.ON ? true : false

        },
        Features: async (clientId) => {

            let cl = await Database.Client.findOne({ id: clientId })
            return cl?.Rebooting?.ON || "Nenhum dado fornecido"

        },
        ChannelId: async (clientId) => {

            let cl = await Database.Client.findOne({ id: clientId })
            return cl?.Rebooting?.ChannelId || null

        },
        MessageId: async (clientId) => {

            let cl = await Database.Client.findOne({ id: clientId })
            return cl?.Rebooting?.MessageId || null

        }
    }

    async start() {
        await super.login(process.env.DISCORD_CLIENT_BOT_TOKEN)
    }

    async off() {
        super.destroy().catch(() => { })
    }

    GetTimeout(TimeToCooldown = 0, DateNowInDatabase = 0, withDateNow = true) {

        let Time = withDateNow ? ms(TimeToCooldown - (Date.now() - DateNowInDatabase)) : ms(TimeToCooldown),
            Day = Time.days > 0 ? `${Time.days}d` : '',
            Hours = Time.hours > 0 ? `${Time.hours}h` : '',
            Minutes = Time.minutes > 0 ? `${Time.minutes}m` : '',
            Seconds = Time.seconds > 0 ? `${Time.seconds}s` : '',
            Nothing = !Day && !Hours && !Minutes && !Seconds ? 'Invalid Cooldown Acess Bad Formated' : '',
            Dh = '', Hm = '', Ms = ''

        if (Time.days > 365) return '+365 dias'

        if (Day && Hours || Day && Minutes || Day && Seconds) Dh = 'SPACE'
        if (Hours && Minutes || Hours && Seconds) Hm = 'SPACE'
        if (Minutes && Seconds) Ms = 'SPACE'

        return `${Day}${Dh}${Hours}${Hm}${Minutes}${Ms}${Seconds}${Nothing}`.replace(/SPACE/g, ' ')
    }

    formatTimestamp(timeStamp) {

        const moment = require('moment')

        let now = Date.now(),
            ms = moment(now).diff(moment(timeStamp)),
            date = moment.duration(ms),
            Years = format(date.years()) > 0 ? `${format(date.years())} anos` : '',
            Months = format(date.months()) > 0 ? `${format(date.months())} meses` : '',
            Day = format(date.days()) > 0 ? `${format(date.days())} dias` : '',
            Hours = format(date.hours()) > 0 ? `${format(date.hours())} horas` : '',
            Minutes = format(date.minutes()) > 0 ? `${format(date.minutes())} minutos` : '',
            Seconds = format(date.seconds()) > 0 ? `${format(date.seconds())} segundos` : '',
            Dh = '', Hm = '', Ms = '', Ym = '', Md = ''

        if (Years && Months || Years && Day || Years && Hours || Years && Minutes || Years && Seconds) Ym = 'SPACE'
        if (Months && Day || Months && Hours || Months && Minutes || Months && Seconds) Md = 'SPACE'
        if (Day && Hours || Day && Minutes || Day && Seconds) Dh = 'SPACE'
        if (Hours && Minutes || Hours && Seconds) Hm = 'SPACE'
        if (Minutes && Seconds) Ms = 'SPACE'

        return `${Years}${Ym}${Months}${Md}${Day}${Dh}${Hours}${Hm}${Minutes}${Ms}${Seconds}`.replace(/SPACE/g, ' ')

        function format(data) {
            return data < 10 ? `0${data}` : data
        }
    }

    getUser(client, message, args, userOrMember = String) {

        if (!client || !message || !args) return undefined

        let hasMember = searchMember()

        return userOrMember === 'member'
            ? hasMember
            : message.mentions.users.first()
            || message.mentions.repliedUser
            || client.users.cache.find(data => {

                return data.username?.toLowerCase() === args.join(' ')?.toLowerCase()
                    || data.username?.toLowerCase() === args.slice(1).join(' ')?.toLowerCase()
                    || data.tag?.toLowerCase() === args.slice(1).join(' ')?.toLowerCase()
                    || data.tag?.toLowerCase() === args[0]?.toLowerCase()
                    || data.discriminator === args[0]
                    || data.tag?.toLowerCase() === args[1]?.toLowerCase()
                    || data.discriminator === args[1]
                    || data.id === args[1]
                    || data.id === args[0]
            })

        function searchMember() {
            return message.mentions.members.first()
                || message.guild.members.cache.get(args[0])
                || message.guild.members.cache.get(args[1])
                || message.guild.members.cache.get(message.mentions.repliedUser?.id)
                || message.guild.members.cache.find(member => {
                    return member.displayName?.toLowerCase() == args[0]?.toLowerCase()
                        || member.user.username.toLowerCase() == args[0]?.toLowerCase()
                        || member.user.tag.toLowerCase() == args[0]?.toLowerCase()
                        || member.user.discriminator === args[0]
                        || member.user.id === args[0]
                        || member.user.username.toLowerCase() == args.join(' ')?.toLowerCase()
                        || member.user.tag.toLowerCase() == args.join(' ')?.toLowerCase()
                        || member.displayName?.toLowerCase() == args.join(' ')?.toLowerCase()
                        || member.user.username.toLowerCase() == args[1]?.toLowerCase()
                        || member.user.tag.toLowerCase() == args[1]?.toLowerCase()
                        || member.displayName?.toLowerCase() == args[1]?.toLowerCase()
                        || member.user.id === args[1]
                        || member.user.discriminator === args[1]
                        || member.user.username.toLowerCase() == args.slice(1).join(' ')?.toLowerCase()
                        || member.user.tag.toLowerCase() == args.slice(1).join(' ')?.toLowerCase()
                        || member.displayName.toLowerCase() == args.slice(1).join(' ')?.toLowerCase()
                        || member.user.username.toLowerCase().includes(args[0]?.toLowerCase())
                        || member.displayName?.toLowerCase().includes(args[0]?.toLowerCase())
                        || member.user.username.toLowerCase().includes(args[1]?.toLowerCase())
                        || member.displayName?.toLowerCase().includes(args[1]?.toLowerCase())
                })
        }

    }

}

module.exports = Saphire
