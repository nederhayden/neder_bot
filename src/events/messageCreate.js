const { ticketChannelId, ticketPrefix } = require("../config/config.json");

const { openTicket } = require("../commands/ticket/buttons");
const { client } = require("../client/client");
const { discord } = require("../utils/imports");
const { currentYear } = require("../utils/functions");

module.exports = async (msg) => {
  let footerText = `Neder Bot © ${currentYear}`;

  if (msg.author.bot) return; // Ignora mensagens de outros bots
  if (!msg.member.permissions.has(["CEO", "Administrador"])) return; // Só permite admins
  if (msg.channel.type === "dm") return; // Ignora mensagens em DM

  const prefix = ticketPrefix;

  if (!msg.content.startsWith(prefix)) return; // Verifica se a mensagem começa com o prefixo do ticket
  const ticketChannel = client.channels.cache.find(
    (channel) => channel.id === ticketChannelId
  );

  // Deleta a mensagem do comando
  msg.delete();

  const embed = new discord.EmbedBuilder()
    .setColor("#2f3136")
    .setImage(
      "https://cdn.discordapp.com/attachments/999055075899088908/999559700163067985/Component_4.png"
    )
    .setAuthor({
      name: "Abrir ticket de atendimento",
    })
    .setFooter({
      text: footerText,
    });

  ticketChannel.send({
    ephemeral: true,
    embeds: [embed],
    components: [openTicket],
  });
};
