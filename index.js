import { Client, GatewayIntentBits, Message, messageLink } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config(); // configurazione di dotenv

/* configurazione Client e Intent */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

/* Messaggi di Debug */
console.log(
  "[Token Caricato] ",
  process.env.DISCORD_TOKEN ? "[OK]" : "[Non Trovato]"
);

client.once("ready", () => {
  console.log(`Sybil è online come ${client.user.tag}`);
});

const commands = new Map();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((f) => f.endsWith(".js"));
for (const file of commandFiles) {
  const command = (await import(`./commands/${file}`)).default;
  commands.set(command.name, command);
}

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!s")) return;

  const args = message.content.slice(2).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (commands.has(commandName)) {
    commands.get(commandName).execute(message, args);
  }
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === "!s chi sei?") {
    message.reply(
      "Sono **Sybil**, il tuo bot Discord per l’assistenza digitale \n" +
        "Usa `!s info` per scoprire le mie funzionalità!"
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
