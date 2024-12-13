const { client } = require("../client/client");
const { currentYear } = require("../utils/functions");

let usernameBot = "";

// Quando o bot estiver pronto, define o status e o nome
const startBot = () =>
  client.on("ready", () => {
    usernameBot = client.user.username; // Define o nome do bot
    footerText = `${usernameBot} © ${currentYear}`; // Define o rodapé com o nome do bot
    client.user.setStatus("online"); // Define o status do bot como online
    console.log("🟢 " + client.user.username + " está online!"); // Log para saber que o bot está online
  });

module.exports = { startBot };
