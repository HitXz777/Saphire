const { Client, Collection } = require('discord.js'),
    Database = require('./Database'),
    ms = require('parse-ms')

require('dotenv').config()

const SaphireClientConfiguration = {
    intents: 34343,
    allowedMentions: { parse: ['users'] },
    partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION']
}

class Saphire extends Client {
    constructor() {
        super(SaphireClientConfiguration)
        this.prefix = '-'
        this.commands = new Collection()
        this.aliases = new Collection()
        this.slashCommands = new Collection()
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

    perms = {
        CREATE_INSTANT_INVITE: 0x0000000000000001,
        KICK_MEMBERS: 0x0000000000000002,
        BAN_MEMBERS: 0x0000000000000004,
        ADMINISTRATOR: 0x0000000000000008,
        MANAGE_CHANNELS: 0x0000000000000010,
        MANAGE_GUILD: 0x0000000000000020,
        ADD_REACTIONS: 0x0000000000000040,
        VIEW_AUDIT_LOG: 0x0000000000000080,
        PRIORITY_SPEAKER: 0x0000000000000100,
        STREAM: 0x0000000000000200,
        VIEW_CHANNEL: 0x0000000000000400,
        SEND_MESSAGES: 0x0000000000000800,
        SEND_TTS_MESSAGES: 0x0000000000001000,
        MANAGE_MESSAGES: 0x0000000000002000,
        EMBED_LINKS: 0x0000000000004000,
        ATTACH_FILES: 0x0000000000008000,
        READ_MESSAGE_HISTORY: 0x0000000000010000,
        MENTION_EVERYONE: 0x0000000000020000,
        USE_EXTERNAL_EMOJIS: 0x0000000000040000,
        VIEW_GUILD_INSIGHTS: 0x0000000000080000,
        CONNECT: 0x0000000000100000,
        SPEAK: 0x0000000000200000,
        MUTE_MEMBERS: 0x0000000000400000,
        DEAFEN_MEMBERS: 0x0000000000800000,
        MOVE_MEMBERS: 0x0000000001000000,
        USE_VAD: 0x0000000002000000,
        CHANGE_NICKNAME: 0x0000000004000000,
        MANAGE_NICKNAMES: 0x0000000008000000,
        MANAGE_ROLES: 0x0000000010000000,
        MANAGE_WEBHOOKS: 0x0000000020000000,
        MANAGE_EMOJIS_AND_STICKERS: 0x0000000040000000,
        USE_APPLICATION_COMMANDS: 0x0000000080000000,
        REQUEST_TO_SPEAK: 0x0000000100000000,
        MANAGE_EVENTS: 0x0000000200000000,
        MANAGE_THREADS: 0x0000000400000000,
        CREATE_PUBLIC_THREADS: 0x0000000800000000,
        CREATE_PRIVATE_THREADS: 0x0000001000000000,
        USE_EXTERNAL_STICKERS: 0x0000002000000000,
        SEND_MESSAGES_IN_THREADS: 0x0000004000000000,
        USE_EMBEDDED_ACTIVITIES: 0x0000008000000000,
        MODERATE_MEMBERS: 0x0000010000000000
    }

    
}

module.exports = Saphire
