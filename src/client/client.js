const { discord } = require("../utils/imports");

// Inicializa o cliente do Discord com os intents necessários
const client = new discord.Client({
  intents: [
    discord.GatewayIntentBits.DirectMessages, // Permite ler mensagens diretas
    discord.GatewayIntentBits.Guilds, // Permite interagir com guilds
    discord.GatewayIntentBits.GuildBans, // Permite ver e gerenciar banimentos
    discord.GatewayIntentBits.GuildMessages, // Permite ler mensagens nos canais
    discord.GatewayIntentBits.MessageContent, // Permite ler o conteúdo das mensagens
  ],
  partials: [discord.Partials.Channel], // Permite lidar com canais parcialmente carregados
});

module.exports = { client };
