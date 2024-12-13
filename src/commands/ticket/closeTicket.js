const { formattedDate, formattedTime } = require("../../utils/functions");
const { adminChannelId } = require("../../config/config.json");
const { discord } = require("../../utils/imports");

module.exports = async (interaction, client) => {
  // cancelamento de ticket
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
