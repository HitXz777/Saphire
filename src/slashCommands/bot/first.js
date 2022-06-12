module.exports = {
  name: 'first',
  description: 'Meu primeiro comando em Slash Command',
  type: 1,
  async execute({ interaction: interaction, client: client }) {
    await interaction.reply({
      content: `🙂 | Este é o primeiro comando em Slash Command da ${client.user.username} criado.\n🗓️ | Data: \`11/06/2022 22:14\``,
      ephemeral: true
    })
  }
}