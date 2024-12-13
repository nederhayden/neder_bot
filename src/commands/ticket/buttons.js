const discord = require("discord.js");

const openTicket = new discord.ActionRowBuilder().addComponents(
  new discord.ButtonBuilder()
    .setCustomId("ticket")
    .setLabel("Abrir Ticket")
    .setStyle("Secondary")
);

const closeTicket = new discord.ActionRowBuilder().addComponents(
  new discord.ButtonBuilder()
    .setCustomId("delete")
    .setLabel("Fechar Ticket")
    .setStyle("Danger")
);

const redirectChannel = (interaction, voiceChannel) =>
  new discord.ActionRowBuilder().addComponents(
    new discord.ButtonBuilder()
      .setLabel("Ir para o atendimento")
      .setURL(
        `https://discord.com/channels/${interaction.guild.id}/${voiceChannel.id}}`
      )
      .setStyle("Link")
  );

module.exports = { openTicket, closeTicket, redirectChannel };
