const date = new Date();

// ano atual
const currentYear = date.getFullYear();

// data formatada
const formattedDate = date.toLocaleDateString("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

// hora formatada
const formattedTime = date.toLocaleTimeString("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

module.exports = { currentYear, formattedDate, formattedTime };
