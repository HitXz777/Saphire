const CampoMinado = require('../../../modules/classes/games/campo-minado')

module.exports = {
    name: 'campo-minado',
    description: '[games] Cuidado com as bombas.',
    dm_permission: false,
    type: 1,

    async execute({ interaction: interaction, emojis: e, database: Database }) {
        return new CampoMinado().start(interaction, e, Database)
    }
}