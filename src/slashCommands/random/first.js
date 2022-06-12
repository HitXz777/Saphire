module.exports = {
  name: 'first',
  description: '[random] Meu primeiro comando em Slash Command',
  dm_permission: false,
  type: 1,
  async execute({ interaction: interaction, client: client }) {
    await interaction.reply({
      content: `🙂 | Este é o primeiro comando criado em Slash Command da ${client.user.username}.\n🗓️ | Data: \`11/06/2022 22:14\``,
      ephemeral: true
    })
  }
}