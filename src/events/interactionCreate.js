const { adminChannelId } = require("../config/config.json");

const { closeTicket, redirectChannel } = require("../commands/ticket/buttons");
const {
  formattedDate,
  formattedTime,
  currentYear,
} = require("../utils/functions");
const { discord } = require("../utils/imports");
const { client } = require("../client/client");

module.exports = async (interaction) => {
  let footerText = `Neder Bot © ${currentYear}`;

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
        text: footerText,
      });

    const sucessEmbed = new discord.EmbedBuilder()
      .setDescription(
        "✅ Você foi mencionado no canal correspondente ao seu ticket."
      )
      .setColor("#2f3136")
      .setFooter({
        text: footerText,
      });

    const adminMessage = new discord.EmbedBuilder()
      .setDescription(`✅ Um ticket foi aberto! `)
      .addFields([
        {
          name: "Usuário:",
          value: `${interaction.user.username}`,
          inline: true,
        },
        {
          name: "ID:",
          value: `${interaction.user.id}`,
          inline: true,
        },
        {
          name: "Data e Hora:",
          value: `${formattedDate} - ${formattedTime}`,
          inline: true,
        },
      ])
      .setColor("#2f3136")
      .setFooter({
        text: footerText,
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
            `✅ Você abriu um ticket. 
            Entraremos em contato o mais rápido possível, por favor aguarde. 
            Clique no botão vermelho caso deseje fechar o ticket.
            
            🔊 **Canal de voz de suporte criado. Entre para aguardar o atendimento**.

            ${formattedDate} - ${formattedTime}
            `
          )
          .setColor("#2f3136")
          .setFooter({
            text: footerText,
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
      .setDescription(`❌ Ticket encerrado!`)
      .addFields([
        {
          name: "Usuário:",
          value: `${interaction.user.username}`,
          inline: true,
        },
        {
          name: "ID:",
          value: `${interaction.user.id}`,
          inline: true,
        },
        {
          name: "Data e Hora:",
          value: `${formattedDate} - ${formattedTime}`,
          inline: true,
        },
      ])
      .setColor("#2f3136")
      .setFooter({
        text: footerText,
      });

    adminAlertChannel.send({ ephemeral: true, embeds: [deleteMessage] });
  }
};
