const RawClientEvents = [
    "READY",
    "RESUMED",
    "VOICE_SERVER_UPDATE",
    "USER_UPDATE",
    "APPLICATION_COMMAND_CREATE",
    "APPLICATION_COMMAND_UPDATE",
    "APPLICATION_COMMAND_DELETE",
    "INTERACTION_CREATE",
    "GUILD_CREATE",
    "GUILD_DELETE",
    "GUILD_ROLE_CREATE",
    "GUILD_ROLE_UPDATE",
    "GUILD_ROLE_DELETE",
    "THREAD_CREATE",
    "THREAD_UPDATE",
    "THREAD_DELETE",
    "THREAD_LIST_SYNC",
    "THREAD_MEMBER_UPDATE",
    "THREAD_MEMBERS_UPDATE",
    "CHANNEL_CREATE",
    "CHANNEL_UPDATE",
    "CHANNEL_DELETE",
    "CHANNEL_PINS_UPDATE",
    "GUILD_MEMBER_ADD",
    "GUILD_MEMBER_UPDATE",
    "GUILD_MEMBER_REMOVE",
    "GUILD_BAN_ADD",
    "GUILD_BAN_REMOVE",
    "GUILD_WEBHOOKS_UPDATE",
    "MESSAGE_CREATE",
    "MESSAGE_UPDATE",
    "MESSAGE_DELETE",
    "MESSAGE_DELETE_BULK",
    "MESSAGE_REACTION_ADD",
    "MESSAGE_REACTION_REMOVE",
    "MESSAGE_REACTION_REMOVE_ALL",
    "MESSAGE_REACTION_REMOVE_EMOJI",
]

const Colors = {
    Default: 0x000000,
    White: 0xffffff,
    Aqua: 0x1abc9c,
    Green: 0x57f287,
    Blue: 0x3498db,
    Yellow: 0xfee75c,
    Purple: 0x9b59b6,
    LuminousVividPink: 0xe91e63,
    Fuchsia: 0xeb459e,
    Gold: 0xf1c40f,
    Orange: 0xe67e22,
    Red: 0xed4245,
    Grey: 0x95a5a6,
    Navy: 0x34495e,
    DarkAqua: 0x11806a,
    DarkGreen: 0x1f8b4c,
    DarkBlue: 0x206694,
    DarkPurple: 0x71368a,
    DarkVividPink: 0xad1457,
    DarkGold: 0xc27c0e,
    DarkOrange: 0xa84300,
    DarkRed: 0x992d22,
    DarkGrey: 0x979c9f,
    DarkerGrey: 0x7f8c8d,
    LightGrey: 0xbcc0c0,
    DarkNavy: 0x2c3e50,
    Blurple: 0x5865f2,
    Greyple: 0x99aab5,
    DarkButNotBlack: 0x2c2f33,
    NotQuiteBlack: 0x23272a,
}

const ColorsTranslate = {
    Default: "Padrão",
    White: "Branco",
    Aqua: "Água",
    Green: "Verde",
    Blue: "Azul",
    Yellow: "Amarelo",
    Purple: "Roxo",
    LuminousVividPink: "Rosa Vívido Luminoso",
    Fuchsia: "Fuchsia",
    Gold: "Ouro",
    Orange: "Laranja",
    Red: "Vermelho",
    Grey: "Cinza",
    Navy: "Oceano Apagado",
    DarkAqua: "Água Escura",
    DarkGreen: "Verde Escuro",
    DarkBlue: "Azul Escuro",
    DarkPurple: "Roxo Escuro",
    DarkVividPink: "Rosa Vívido Escuro",
    DarkGold: "Ouro Escuro",
    DarkOrange: "Laranja Escuro",
    DarkRed: "Vermelho Escuro",
    DarkGrey: "Cinza Escuro",
    DarkerGrey: "Cinza Mais Escuro",
    LightGrey: "Cinza Claro",
    DarkNavy: "Oceano Escuro",
    Blurple: "Violeta",
    Greyple: "Verde Acinzentado",
    DarkButNotBlack: "Escuro, mas não preto",
    NotQuiteBlack: "Não tão preto",
    DEFAULT: "Padrão",
    AQUA: "Água",
    DARK_AQUA: "Água Escura",
    GREEN: "Verde",
    DARK_GREEN: "Verde Escuro",
    BLUE: "Azul",
    DARK_BLUE: "Azul Escuro",
    PURPLE: "Roxo",
    DARK_PURPLE: "Roxo Escuro",
    LUMINOUS_VIVID_PINK: "Rosa Vívido Luminoso",
    DARK_VIVID_PINK: "Rosa Vívido Escuro",
    GOLD: "Ouro",
    DARK_GOLD: "Ouro Escuro",
    ORANGE: "Laranja",
    DARK_ORANGE: "Laranja Escuro",
    RED: "Vermelho",
    DARK_RED: "Vermelho Escuro",
    GREY: "Cinza",
    DARK_GREY: "Cinza Escuro",
    DARKER_GREY: "Cinza Mais Escuro",
    LIGHT_GREY: "Cinza Claro",
    NAVY: "Oceano Apagado",
    DARK_NAVY: "Oceano Escuro",
    YELLOW: "Amarelo",
}

const EmbedColors = {
    DEFAULT: "#000000",
    AQUA: "#1ABC9C",
    DARK_AQUA: "#11806A",
    GREEN: "#2ECC71",
    DARK_GREEN: "#1F8B4C",
    BLUE: "#3498DB",
    DARK_BLUE: "#206694",
    PURPLE: "#9B59B6",
    DARK_PURPLE: "#71368A",
    LUMINOUS_VIVID_PINK: "#E91E63",
    DARK_VIVID_PINK: "#AD1457",
    GOLD: "#F1C40F",
    DARK_GOLD: "#C27C0E",
    ORANGE: "#E67E22",
    DARK_ORANGE: "#A84300",
    RED: "#E74C3C",
    DARK_RED: "#992D22",
    GREY: "#95A5A6",
    DARK_GREY: "#979C9F",
    DARKER_GREY: "#7F8C8D",
    LIGHT_GREY: "#BCC0C0",
    NAVY: "#34495E",
    DARK_NAVY: "#2C3E50",
    YELLOW: "#FFFF00"
}

const Events = {
    ApplicationCommandPermissionsUpdate: 'applicationCommandPermissionsUpdate',
    CacheSweep: 'cacheSweep',
    ChannelCreate: 'channelCreate',
    ChannelDelete: 'channelDelete',
    ChannelPinsUpdate: 'channelPinsUpdate',
    ChannelUpdate: 'channelUpdate',
    ClientReady: 'ready',
    Debug: 'debug',
    Error: 'error',
    GuildBanAdd: 'guildBanAdd',
    GuildBanRemove: 'guildBanRemove',
    GuildCreate: 'guildCreate',
    GuildDelete: 'guildDelete',
    GuildEmojiCreate: 'emojiCreate',
    GuildEmojiDelete: 'emojiDelete',
    GuildEmojiUpdate: 'emojiUpdate',
    GuildIntegrationsUpdate: 'guildIntegrationsUpdate',
    GuildMemberAdd: 'guildMemberAdd',
    GuildMemberAvailable: 'guildMemberAvailable',
    GuildMemberRemove: 'guildMemberRemove',
    GuildMembersChunk: 'guildMembersChunk',
    GuildMemberUpdate: 'guildMemberUpdate',
    GuildRoleCreate: 'roleCreate',
    GuildRoleDelete: 'roleDelete',
    GuildRoleUpdate: 'roleUpdate',
    GuildScheduledEventCreate: 'guildScheduledEventCreate',
    GuildScheduledEventDelete: 'guildScheduledEventDelete',
    GuildScheduledEventUpdate: 'guildScheduledEventUpdate',
    GuildScheduledEventUserAdd: 'guildScheduledEventUserAdd',
    GuildScheduledEventUserRemove: 'guildScheduledEventUserRemove',
    GuildStickerCreate: 'stickerCreate',
    GuildStickerDelete: 'stickerDelete',
    GuildStickerUpdate: 'stickerUpdate',
    GuildUnavailable: 'guildUnavailable',
    GuildUpdate: 'guildUpdate',
    InteractionCreate: 'interactionCreate',
    Invalidated: 'invalidated',
    InviteCreate: 'inviteCreate',
    InviteDelete: 'inviteDelete',
    MessageBulkDelete: 'messageDeleteBulk',
    MessageCreate: 'messageCreate',
    MessageDelete: 'messageDelete',
    MessageReactionAdd: 'messageReactionAdd',
    MessageReactionRemove: 'messageReactionRemove',
    MessageReactionRemoveAll: 'messageReactionRemoveAll',
    MessageReactionRemoveEmoji: 'messageReactionRemoveEmoji',
    MessageUpdate: 'messageUpdate',
    PresenceUpdate: 'presenceUpdate',
    Raw: 'raw',
    ShardDisconnect: 'shardDisconnect',
    ShardError: 'shardError',
    ShardReady: 'shardReady',
    ShardReconnecting: 'shardReconnecting',
    ShardResume: 'shardResume',
    StageInstanceCreate: 'stageInstanceCreate',
    StageInstanceDelete: 'stageInstanceDelete',
    StageInstanceUpdate: 'stageInstanceUpdate',
    ThreadCreate: 'threadCreate',
    ThreadDelete: 'threadDelete',
    ThreadListSync: 'threadListSync',
    ThreadMembersUpdate: 'threadMembersUpdate',
    ThreadMemberUpdate: 'threadMemberUpdate',
    ThreadUpdate: 'threadUpdate',
    TypingStart: 'typingStart',
    UserUpdate: 'userUpdate',
    VoiceServerUpdate: 'voiceServerUpdate',
    VoiceStateUpdate: 'voiceStateUpdate',
    Warn: 'warn',
    WebhooksUpdate: 'webhookUpdate',
}

const ShardEvents = {
    Close: 'close',
    Destroyed: 'destroyed',
    InvalidSession: 'invalidSession',
    Ready: 'ready',
    Resumed: 'resumed',
    AllReady: 'allReady',
}

const Permissions = {
    CREATE_INSTANT_INVITE: "Criar convite",
    KICK_MEMBERS: "Expulsar membros",
    BAN_MEMBERS: "Banir membros",
    ADMINISTRATOR: "Administrador",
    MANAGE_CHANNELS: "Gerenciar canais",
    MANAGE_GUILD: "Gerenciar servidor",
    ADD_REACTIONS: "Adicionar reações",
    VIEW_AUDIT_LOG: "Ver o registro de auditoria",
    PRIORITY_SPEAKER: "Voz Prioritária",
    STREAM: "Vídeo",
    VIEW_CHANNEL: "Ver canais",
    SEND_MESSAGES: "Enviar mensagens",
    SEND_TTS_MESSAGES: "Enviar mensagens TTS",
    MANAGE_MESSAGES: "Gerenciar mensagens",
    EMBED_LINKS: "Enviar links",
    ATTACH_FILES: "Enviar arquivos",
    READ_MESSAGE_HISTORY: "Ver histórico de mensagens",
    MENTION_EVERYONE: "Mencionar Everyone",
    USE_EXTERNAL_EMOJIS: "Usar emojis externos",
    VIEW_GUILD_INSIGHTS: "Ver Análises do Servidor",
    CONNECT: "Conectar",
    SPEAK: "Falar",
    MUTE_MEMBERS: "Silenciar membros",
    DEAFEN_MEMBERS: "Ensurdecer membros",
    MOVE_MEMBERS: "Mover membros",
    USE_VAD: "Usar detecção de voz",
    CHANGE_NICKNAME: "Alterar apelido",
    MANAGE_NICKNAMES: "Gerenciar apelidos",
    MANAGE_ROLES: "Gerenciar cargos",
    MANAGE_WEBHOOKS: "Gerenciar Webhooks",
    MANAGE_EMOJIS_AND_STICKERS: "Gerenciar emojis e figurinhas",
    USE_APPLICATION_COMMANDS: "Usar comandos de aplicativos",
    REQUEST_TO_SPEAK: "Pedir para falar",
    MANAGE_THREADS: "Gerenciar Threads",
    USE_PUBLIC_THREADS: "Usar threads publicas",
    USE_PRIVATE_THREADS: "Usar threads privadas",
    USE_EXTERNAL_STICKERS: "Usar figurinhas externas",
    START_EMBEDDED_ACTIVITIES: "Começar atividades embedded",
    SEND_MESSAGES_IN_THREADS: "Enviar mensagens em threads",
    CREATE_PRIVATE_THREADS: "Criar threads privadas",
    CREATE_PUBLIC_THREADS: "Criar threads publicas",
    MODERATE_MEMBERS: "Moderar membros"
}

const slashCommandsPermissions = {
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

const ignoreUsersOptions = [
    'serversRemove',
    'logregisterDelete',
    'cacheDelete',
    'clanDelete',
    'set_ServerPremium',
    'remove_ServerPremium'
]

module.exports = {
    RawClientEvents,
    Colors,
    Events,
    ShardEvents,
    ColorsTranslate,
    Permissions,
    slashCommandsPermissions,
    EmbedColors,
    ignoreUsersOptions
}