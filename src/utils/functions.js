const date = new Date();

module.exports = {
  currentYear: date.getFullYear(),
  formattedDate: date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }),
  formattedTime: date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }),
};
