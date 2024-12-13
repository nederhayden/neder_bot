require("dotenv").config();
const { discord } = require("./utils/imports");
const { startBot } = require("./config/startBot");
const { currentYear } = require("./utils/functions");

const {
  ticketPrefix, // Prefixo utilizado para iniciar o comando
  adminChannelId, // ID do canal de alertas para administradores
} = require("../config.json");
const { client } = require("./client/client");

const { closeTicket, redirectChannel } = require("./commands/ticket/buttons");
const { TicketManager } = require("./commands/ticket/TicketManager");

let footerText = `Bot © ${currentYear}`;

startBot();

// Quando uma mensagem for criada, processa o comando de ticket
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return; // Ignora mensagens de outros bots
  if (!msg.member.permissions.has(["CEO", "Administrador"])) return; // Só permite admins
  if (msg.channel.type === "dm") return; // Ignora mensagens em DM

  const prefix = ticketPrefix;

  if (!msg.content.startsWith(prefix)) return; // Verifica se a mensagem começa com o prefixo do ticket
  TicketManager();
});

// Processa as interações dos botões, como a criação e exclusão de tickets
client.on("interactionCreate", async (interaction) => {
  if (interaction.customId === "ticket") {
    if (!interaction.isButton()) return;
    const guild = client.guilds.cache.get(interaction.guild.id);
    const guildChannels = guild.channels.cache;
    const userFirstName = interaction.user.username.split(" ")[0].toLowerCase();
    const interactionChannelName = `ticket-${userFirstName}`;
    const adminAlertChannel = client.channels.cache.find(
      (channel) => channel.id === adminChannelId
    );

    // Verifica se o usuário já tem um ticket aberto
    const errorEmbed = new discord.EmbedBuilder()
      .setDescription(
        "❌ Você já possui um ticket aberto! Encerre o ticket atual para poder abrir um novo."
      )
      .setColor("#2f3136")
      .setFooter({
        text: "Neder_Bot © 2025",
        iconURL:
          "https://cdn.discordapp.com/attachments/929573302098362399/999093804034445442/Logo_4.png",
      });

    const sucessEmbed = new discord.EmbedBuilder()
      .setDescription(
        "✅ Você foi mencionado no canal correspondente ao seu ticket."
      )
      .setColor("#2f3136")
      .setFooter({
        text: footerText,
        iconURL:
          "https://cdn.discordapp.com/attachments/929573302098362399/999093804034445442/Logo_4.png",
      });

    const adminMessage = new discord.EmbedBuilder()
      .setDescription(`✅ Um ticket foi aberto! ${interaction.user.id}`)
      .addFields([
        {
          name: "😀 Usuário:",
          value: `${interaction.user.username}`,
          inline: true,
        },
      ])
      .setColor("#2f3136")
      .setFooter({
        text: footerText,
        iconURL:
          "https://cdn.discordapp.com/attachments/929573302098362399/999093804034445442/Logo_4.png",
      });

    // Verifica se já existe um canal de ticket aberto para o usuário
    for (const channel of guildChannels.values()) {
      if (channel.name.startsWith("ticket")) {
        if (channel.topic === interaction.user.id) {
          return interaction.reply({ ephemeral: true, embeds: [errorEmbed] });
        }
      }
    }

    adminAlertChannel.send({ ephemeral: true, embeds: [adminMessage] });

    // Criação do canal de texto para o ticket
    guild.channels
      .create({
        name: interactionChannelName,
        permissionOverwrites: [
          {
            id: interaction.user.id,
            allow: [
              discord.PermissionFlagsBits.SendMessages,
              discord.PermissionFlagsBits.ViewChannel,
              discord.PermissionFlagsBits.Connect,
            ],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: [
              discord.PermissionFlagsBits.ViewChannel,
              discord.PermissionFlagsBits.Connect,
            ],
          },
        ],
        type: discord.ChannelType.GuildText,
        parent: "1316632228150902804", // ID da categoria de suporte
      })
      .then(async (channel) => {
        channel.setTopic(interaction.user.id);

        // Envia uma mensagem ao usuário informando sobre o ticket
        const embed = new discord.EmbedBuilder()
          .setDescription(
            `✅ Você solicitou um ticket. Entraremos em contato o mais rápido possível, aguarde. Clique no botão vermelho para encerrar o ticket.
            
            🔊 **Canal de voz de suporte criado. Entre para atendimento**. ${interaction.user.username}!
            `
          )
          .setColor("#2f3136")
          .setFooter({
            text: footerText,
            iconURL:
              "https://cdn.discordapp.com/attachments/929573302098362399/999093804034445442/Logo_4.png",
          });

        // Criação do canal de voz
        guild.channels
          .create({
            name: `${interactionChannelName}`, // Nome do canal de voz
            type: discord.ChannelType.GuildVoice, // Tipo de canal de voz
            parent: "1316632228150902804", // Categoria de suporte (mesma do canal de texto)
            permissionOverwrites: [
              {
                id: interaction.user.id,
                allow: [
                  discord.PermissionFlagsBits.Connect, // Permite que o usuário entre no canal
                  discord.PermissionFlagsBits.Speak, // Permite que o usuário fale
                ],
              },
              {
                id: interaction.guild.roles.everyone,
                deny: [
                  discord.PermissionFlagsBits.Connect, // Impede que outros usuários entrem
                ],
              },
            ],
          })
          .then((voiceChannel) => {
            // Envia mensagem de confirmação para o usuário sobre o canal de voz
            voiceChannel.send(
              `🔊 **Canal de voz de suporte criado. Entre para atendimento**. ${interaction.user.username}!`
            );

            channel.send({
              ephemeral: true,
              embeds: [embed],
              components: [
                closeTicket,
                redirectChannel(interaction, voiceChannel),
              ],
              content: `<@${interaction.user.id}>`,
            });
          });

        interaction.reply({ ephemeral: true, embeds: [sucessEmbed] });
      });
  }

  // Lógica de cancelamento de ticket
  if (interaction.customId === "delete") {
    const textChannel = interaction.channel;
    const voiceChannelName = `ticket-${textChannel.name.split("-")[1]}`;

    // Debugando o nome do canal de voz
    console.log(`Tentando excluir o canal de voz: ${voiceChannelName}`);

    // Excluindo o canal de texto
    textChannel.delete().catch(console.error);

    // Procurando o canal de voz pelo nome gerado
    const voiceChannel = interaction.guild.channels.cache.find(
      (channel) =>
        channel.name === voiceChannelName &&
        channel.type === discord.ChannelType.GuildVoice
    );

    // Verificando se o canal de voz foi encontrado
    if (voiceChannel) {
      console.log(`Canal de voz encontrado: ${voiceChannel.name}`);
      // Excluindo o canal de voz
      voiceChannel.delete().catch(console.error);
    } else {
      console.log(
        `Canal de voz não encontrado com o nome: ${voiceChannelName}`
      );
    }

    const adminAlertChannel = client.channels.cache.find(
      (channel) => channel.id === adminChannelId
    );

    const deleteMessage = new discord.EmbedBuilder()
      .setDescription(`❌ Ticket encerrado! ${interaction.user.id}`)
      .addFields([
        {
          name: "😀 Usuário:",
          value: `${interaction.user.username}`,
          inline: true,
        },
      ])
      .setColor("#2f3136")
      .setFooter({
        text: footerText,
        iconURL:
          "https://cdn.discordapp.com/attachments/929573302098362399/999093804034445442/Logo_4.png",
      });

    adminAlertChannel.send({ ephemeral: true, embeds: [deleteMessage] });
  }
});

// Loga o bot com o token
client.login(process.env.TOKEN);
