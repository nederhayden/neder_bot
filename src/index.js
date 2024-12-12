require("dotenv").config();
const discord = require("discord.js");
const {
  ticketChannelId,
  adminChannelId,
  ticketPrefix,
} = require("./config.json");

const neder = new discord.Client({
  intents: [
    discord.GatewayIntentBits.DirectMessages,
    discord.GatewayIntentBits.Guilds,
    discord.GatewayIntentBits.GuildBans,
    discord.GatewayIntentBits.GuildMessages,
    discord.GatewayIntentBits.MessageContent,
  ],
  partials: [discord.Partials.Channel],
});

let usernameBot = "";
const currentYear = new Date().getFullYear();
let footerText = `Bot © ${currentYear}`;

neder.on("ready", () => {
  usernameBot = neder.user.username;
  footerText = `${usernameBot} © ${currentYear}`;
  neder.user.setStatus("online");
  console.log("🟢 " + neder.user.username + " está online!");
});

neder.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.member.permissions.has("Administrador")) return;
  if (msg.channel.type === "dm") return;

  const prefix = ticketPrefix;

  if (!msg.content.startsWith(prefix)) return;
  const ticketChannel = neder.channels.cache.find(
    (channel) => channel.id === ticketChannelId
  );
  msg.delete();
  const row = new discord.ActionRowBuilder().addComponents(
    new discord.ButtonBuilder()
      .setCustomId("ticket")
      .setLabel("Criar Ticket")
      .setStyle("Secondary")
  );

  const embed = new discord.EmbedBuilder()
    .setColor("#2f3136")
    .setImage(
      "https://cdn.discordapp.com/attachments/999055075899088908/999559700163067985/Component_4.png"
    )
    .setAuthor({
      name: "Criar ticket de atendimento | Neder_Bot",
      iconURL:
        "https://cdn.discordapp.com/attachments/929573302098362399/999093804034445442/Logo_4.png",
      url: "https://discord.com/invite/dX5RtYepjp",
    })
    .setFooter({
      text: footerText,
      iconURL:
        "https://cdn.discordapp.com/attachments/929573302098362399/999093804034445442/Logo_4.png",
    });

  ticketChannel.send({ ephemeral: true, embeds: [embed], components: [row] });
});

neder.on("interactionCreate", async (interaction) => {
  if (interaction.customId === "ticket") {
    if (!interaction.isButton()) return;
    const guild = neder.guilds.cache.get(interaction.guild.id);
    const guildChannels = guild.channels.cache;
    const userFirstName = interaction.user.username.split(" ")[0].toLowerCase();
    const interactionChannelName = `ticket-${userFirstName}`;
    const adminAlertChannel = neder.channels.cache.find(
      (channel) => channel.id === adminChannelId
    );
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
      .setDescription(`☄️ Um ticket foi aberto! ${interaction.user.id}`)
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

    for (const channel of guildChannels.values()) {
      if (channel.name.startsWith("ticket")) {
        if (channel.topic === interaction.user.id) {
          return interaction.reply({ ephemeral: true, embeds: [errorEmbed] });
        }
      }
    }

    adminAlertChannel.send({ ephemeral: true, embeds: [adminMessage] });

    guild.channels
      .create({
        name: interactionChannelName,
        permissionOverwrites: [
          {
            id: interaction.user.id,
            allow: [
              discord.PermissionFlagsBits.SendMessages,
              discord.PermissionFlagsBits.ViewChannel,
            ],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: [discord.PermissionFlagsBits.ViewChannel],
          },
        ],
        type: discord.ChannelType.GuildText,
        //parent: 'xxx',
      })
      .then(async (channel) => {
        channel.setTopic(interaction.user.id);
        const embed = new discord.EmbedBuilder()
          .setDescription(
            "☄️ Você solicitou um ticket. Entraremos em contato o mais rápido possível, aguarde. Clique no botão vermelho para encerrar o ticket."
          )
          .setColor("#2f3136")
          .setFooter({
            text: footerText,
            iconURL:
              "https://cdn.discordapp.com/attachments/929573302098362399/999093804034445442/Logo_4.png",
          });

        const deleteButton = new discord.ActionRowBuilder().addComponents(
          new discord.ButtonBuilder()
            .setCustomId("delete")
            .setLabel("Cancelar Ticket")
            .setStyle("Danger")
        );

        await channel.send({
          ephemeral: true,
          embeds: [embed],
          components: [deleteButton],
          content: `||<@${interaction.user.id}>||`,
        });
        interaction.reply({ ephemeral: true, embeds: [sucessEmbed] });
      });
  }
  if (interaction.customId === "delete") {
    interaction.channel.delete();
    const adminAlertChannel = neder.channels.cache.find(
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

    await interaction.user
      .send({ ephemeral: true, embeds: [deleteMessage] })
      .catch(() => {
        adminAlertChannel.send({ ephemeral: true, embeds: [deleteMessage] });
        return false;
      });
    adminAlertChannel.send({ ephemeral: true, embeds: [deleteMessage] });
  }
});
neder.login(process.env.TOKEN);
