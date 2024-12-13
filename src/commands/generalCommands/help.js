export async function helpCommandHandler(interaction) {
  const helpText = "Aqui estão os comandos disponíveis:";
  await interaction.reply(helpText);
}
