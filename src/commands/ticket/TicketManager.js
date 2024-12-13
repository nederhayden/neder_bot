const { openTicket } = require("./buttons");
const { discord } = require("../../utils/imports");

const TicketManager = (footerText) => {
  const ticketChannel = client.channels.cache.find(
    (channel) => channel.id === ticketChannelId
  );
  msg.delete(); // Deleta a mensagem do comando

  const embed = new discord.EmbedBuilder()
    .setColor("#2f3136")
    .setImage(
      "https://cdn.discordapp.com/attachments/999055075899088908/999559700163067985/Component_4.png"
    )
    .setAuthor({
      name: "Abrir ticket de atendimento",
      iconURL:
        "https://cdn.discordapp.com/attachments/929573302098362399/999093804034445442/Logo_4.png",
      url: "",
    })
    .setFooter({
      text: footerText,
      iconURL:
        "https://cdn.discordapp.com/attachments/929573302098362399/999093804034445442/Logo_4.png",
    });

  ticketChannel.send({
    ephemeral: true,
    embeds: [embed],
    components: [openTicket],
  });
};
module.exports = { TicketManager };
