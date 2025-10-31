export default {
  name: "chisei",
  aliases: ["chi sei ?", "chi sei?", "chisei?", "chisei ?"],
  description: "Da una breve presentazione sul bot",
  execute(message) {
    message.reply(
      "Sono **Sybil**, il tuo bot Discord per l’assistenza digitale \n" +
        "Usa `!s info` per scoprire le mie funzionalità!" +
        " Oppure Usa `!s commands` per vedere i miei comandi !"
    );
  },
};
