export default {
  name: "commands",
  aliases: [
    "comands",
    "command",
    "comand",
    "cmds",
    "cmd",
    "comandi",
    "comando",
  ],
  description: "Lista dei comandi",
  async execute(message, args) {
    const client = message.client; // ottieni il client dal message

    let msg = "**📜 Lista comandi: 📜**\n\n";
    client.commands.forEach((cmd) => {
      msg += `\`!s ${cmd.name}\` → ${
        cmd.description || "Nessuna descrizione"
      }\n`;
    });

    await message.reply(msg);
  },
};
