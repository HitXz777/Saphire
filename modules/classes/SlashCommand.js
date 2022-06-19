const Modals = require('./Modals')

class SlashCommand extends Modals {
    constructor(interaction, client) {
        super()
        this.interaction = interaction
        this.user = interaction.user
        this.guild = interaction.guild
        this.channel = interaction.channel
        this.client = client
        this.error = require('../functions/config/interactionError')
        this.Database = require('./Database')
        this.e = this.Database.Emojis
    }

    async execute(guildData, clientData, member) {

        const command = this.client.slashCommands.get(this.interaction.commandName);
        if (!command) return

        await command.execute({
            interaction: this.interaction,
            emojis: this.e,
            database: this.Database,
            client: this.client,
            data: this,
            modals: this.modals,
            guildData: guildData,
            clientData: clientData,
            member: member
        }).catch(async err => {
            this.error(this.interaction, err)
            
            return await this.interaction.reply({
                content: "❌ | Ocorreu um erro ao executar este comando.",
                ephemeral: true,
            })
        })

        return this.registerCommand()
    }

    async CheckBeforeExecute() {

        const { guild, client, e, Database, interaction, user, channel } = this

        let guildData = await Database.Guild.findOne({ id: guild.id })
        let clientData = await Database.Client.findOne({ id: client.user.id })
        let member = guild.members.cache.get(user.id)

        if (clientData.Rebooting?.ON)
            return await interaction.reply({ content: `${e.Loading} | Reiniciando em breve...\n${e.BookPages} | ${clientData.Rebooting?.Features || 'Nenhum dado fornecido'}` })

        if (clientData?.Blacklist?.Users?.some(data => data?.id === user.id))
            return await interaction.reply({
                content: '❌ | Você está na blacklist.',
                ephemeral: true
            })

        if (!member.permissions?.toArray()?.includes('ADMINISTRATOR') && guildData?.Blockchannels?.Channels?.includes(channel.id))
            return await interaction.reply({
                content: `${e.Deny} | Meus comandos foram bloqueados neste canal.`,
                ephemeral: true
            })

        return this.execute(guildData, clientData, member)
    }

    async registerCommand() {
        return await this.Database.Client.updateOne(
            { id: this.client.user.id },
            { $inc: { ComandosUsados: 1 } },
            { upsert: true }
        )
    }
}

module.exports = SlashCommand