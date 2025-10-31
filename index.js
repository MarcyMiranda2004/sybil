import { Client, Collection, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import { sourceMapsEnabled } from "process";

dotenv.config(); // Carica il file .env

//#region /* === CONFIGURAZIONE CLIENT === */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});
//#endregion

//#region /* === DEBUG TOKEN === */
console.log(
  "\x1b[35m [Token Caricato] \x1b[0m",
  process.env.DISCORD_TOKEN
    ? "\x1b[32m [OK] \x1b[0m"
    : "\x1b[31m [Non Trovato] \x1b[0m"
);
//#endregion

//#region /* === CARICAMENTO COMANDI === */
client.commands = new Collection(); // collection globale dei comandi

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = (await import(`./commands/${file}`)).default;
  client.commands.set(command.name, command);
}

console.log(
  `\x1b[35m [Comandi caricati] \x1b[0m \x1b[36m ${client.commands.size} comandi trovati \x1b[0m`
);
//#endregion

//#region /* === EVENTO READY === */
client.once("clientReady", () => {
  console.log(
    `\x1b[35m [Status] \x1b[0m \x1b[36m Sybil è online come ${client.user.tag} \x1b[0m`
  );
});
//#endregion

//#region /* === GESTIONE MESSAGGI === */
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!s")) return;

  // Rimuove "!s", pulisce spazi e separa le parole
  const input = message.content.slice(2).trim().toLowerCase();
  const [commandName, ...args] = input.split(/ +/);

  // Cerca un comando corrispondente
  const command =
    client.commands.get(commandName) ||
    [...client.commands.values()].find(
      (cmd) =>
        cmd.aliases?.includes(commandName) || cmd.aliases?.includes(input)
    );

  if (!command) return;

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(`\x1b[31m[Errore comando ${commandName}]\x1b[0m`, error);
    message.reply("❌ Si è verificato un errore nell'esecuzione comando. ❌");
  }
});
//#endregion

//#region /* === LOGIN BOT === */
client.login(process.env.DISCORD_TOKEN);
//#endregion

/*  ======= COMANDI INDEX ====== */

//#region /* RUOLO OSPITE AUTOMATICO */
client.on("guildMemberAdd", async (member) => {
  try {
    const roleName = "🏠 Ospite 🏠";
    const roleId = "1243149267841843242";

    const role = member.guild.roles.cache.get(roleId);

    if (!role) {
      console.log(`[Ruolo] "${roleName}" | [ID] ${roleId} non trovato`);
      return;
    }

    await member.roles.add(role);

    console.log(`Ruolo: "${roleName}" assegnato a ${member.user.tag}`);
  } catch (error) {
    console.error(`Errore nell'assegnazione del ruolo | Error:  ${error}`);
  }
});
//#endregion
