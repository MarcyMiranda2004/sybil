# 🤖 Sybil – Discord Assistant Bot

Sybil (System Yielding Bot Intelligent Logistic) è un bot Discord modulare scritto in **Node.js** con **discord.js v14+**.  
Permette di gestire comandi modulari, assegnare ruoli automaticamente e interagire con gli utenti.

---

## 📑 Indice

- [⚙️ Struttura del progetto](#-struttura-del-progetto)
- [🧩 Panoramica del codice (`index.js`)](#-panoramica-del-codice-indexjs)
- [🔍 Spiegazione passo-passo del codice](#-spiegazione-passo-passo-del-codice)
  - [1. Import e configurazione dotenv](#1-import-e-configurazione-dotenv)
  - [2. Creazione del client e intents](#2-creazione-del-client-e-intents)
  - [3. Debug token](#3-debug-token)
  - [4. Evento `ready`](#4-evento-ready)
  - [5. Caricamento dinamico dei comandi](#5-caricamento-dinamico-dei-comandi)
  - [6. Routing dei messaggi e parsing dei comandi](#6-routing-dei-messaggi-e-parsing-dei-comandi)
  - [7. Ruolo ospite automatico](#7-ruolo-ospite-automatico)
  - [8. Login del bot](#8-login-del-bot)
- [🔍 Spiegazione passo-passo dei Comandi](#-spiegazione-passo-passo-dei-comandi)
- [🛠 Esempio: file comando (`commands/info.js`)](#-esempio-file-comando-commandsinfojs)
- [💡 Best practice e note](#-best-practice-e-note)
- [🚀 Avvio rapido](#-avvio-rapido)

---

## ⚙️ Struttura del progetto

sybil/
├── commands/ # Cartella dei comandi (ogni file = un comando)
│ ├── info.js
│ ├── help.js
│ └── ...
├── index.js # Entry point principale
├── .env # Variabili d’ambiente (token)
├── package.json
└── README.md

---

## 🧩 Panoramica del codice (`index.js`)

- Connessione a Discord tramite `discord.js`
- Caricamento automatico dei comandi dalla cartella `commands`
- Routing dei messaggi verso i comandi corretti
- Gestione assegnazione automatica del ruolo `🏠 Ospite 🏠`

============================================

## 🔍 Spiegazione passo-passo del codice

============================================

### 1. Import e configurazione dotenv

```js
import { Client, Collection, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config(); // Carica variabili dal .env
```

- Importa le librerie necessarie
- Carica DISCORD_TOKEN e altre variabili dal .env

---

### 2. Creazione del client e intents

```js
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});
```

- intents specificano quali eventi il bot riceve (messaggi, membri, contenuto)
- ⚠️ Ricorda di abilitare Message Content Intent sul Developer Portal

---

### 3. Debug token

```js
console.log(
  "[Token Caricato]",
  process.env.DISCORD_TOKEN ? "[OK]" : "[Non Trovato]"
);
```

- Controlla se il token è stato caricato correttamente

---

### 4. Evento ready

```js
client.once("ready", () => {
  console.log(`Sybil è online come ${client.user.tag}`);
});
```

- Viene eseguito una sola volta al login
- Utile per log iniziale o setup

---

### 5. Caricamento dinamico dei comandi

```js
client.commands = new Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = (await import(`./commands/${file}`)).default;
  client.commands.set(command.name, command);
}

console.log(`${client.commands.size} comandi caricati`);
```

- Legge la cartella commands
- Importa ogni file come modulo ES
- Registra comandi nella Collection usando command.name

---

### 6. Routing dei messaggi e parsing dei comandi

```js
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!s")) return;

  const input = message.content.slice(2).trim().toLowerCase();
  const [commandName, ...args] = input.split(/ +/);

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
    console.error(`[Errore comando ${commandName}]`, error);
    message.reply("❌ Si è verificato un errore nell'esecuzione comando. ❌");
  }
});
```

- Filtra messaggi bot e messaggi senza prefisso
- Ricerca comandi sia per nome che per alia

---

### 7. Ruolo ospite automatico

```js
client.on("guildMemberAdd", async (member) => {
  try {
    const roleName = "🏠 Ospite 🏠";
    const roleId = "1243149267841843242"; // ID del ruolo

    const role = member.guild.roles.cache.get(roleId);

    if (!role) {
      console.log(`[Ruolo] "${roleName}" | [ID] ${roleId} non trovato`);
      return;
    }

    await member.roles.add(role);
    console.log(`Ruolo: "${roleName}" assegnato a ${member.user.tag}`);
  } catch (error) {
    console.error(`Errore nell'assegnazione del ruolo | ${error}`);
  }
});
```

- Assegna automaticamente il ruolo al nuovo membro
- Usa roleId per sicurezza (i nomi possono contenere emoji)

---

### 8. Login del bot

```js
client.login(process.env.DISCORD_TOKEN);
```

- Esegue il login su Discord con il token del .env

---

============================================

## 🔍 Spiegazione passo-passo dei comandi

============================================

### Struttura Dei comandi

```js
export default {
  name: "info",
  aliases: ["information", "i"],
  description: "Informazioni sul bot",
  execute(message, args) {
    message.reply(
      "Sono **Sybil**, il tuo assistente digitale 🤖\nVersione: 1.0.0"
    );
  },
};
```

- **name** → nome comando principale
- **aliases** → nomi alternativi
- **description** → descrizione per help
- **execute** → logica del comando
