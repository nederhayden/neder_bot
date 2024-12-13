require("dotenv").config();
const { startBot } = require("./events/ready");

const { client } = require("./client/client");

const messageCreate = require("./events/messageCreate");
const interactionCreate = require("./events/interactionCreate");

startBot();

client.on("messageCreate", messageCreate);
client.on("interactionCreate", interactionCreate);

client.login(process.env.BOT_TOKEN);
