export default {
  name: "aliases",
  aliases: [
    "alias",
    "calias",
    "c alias",
    "ca",
    "c a",
    "caliases",
    "c aliases",
    "cas",
  ],
  description: "Lista dei comandi con Alias",
  async execute(message, args) {
    const client = message.client; // ottieni il client dal message

    let msg = "**📜 Lista comandi: 📜**\n\n";

    client.commands.forEach((cmd) => {
      const aliases =
        cmd.aliases && cmd.aliases.length > 0
          ? " | Alias: " + cmd.aliases.map((a) => `\`${a}\``).join(", ")
          : "";

      msg += `\`!s ${cmd.name}\` → ${
        cmd.description || "Nessuna descrizione"
      }${aliases}\n`;
    });

    await message.reply(msg);
  },
};
