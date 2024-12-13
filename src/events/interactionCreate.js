const createTicket = require("../commands/ticket/createTicket");
const closeTicket = require("../commands/ticket/closeTicket");
const { client } = require("../client/client");

module.exports = async (interaction) => {
  // abertura do ticket
  if (interaction.customId === "ticket") {
    await createTicket(interaction, client);
  }

  // cancelamento do ticket
  if (interaction.customId === "delete") {
    await closeTicket(interaction, client);
  }
};
