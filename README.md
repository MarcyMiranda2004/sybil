# 🤖 Sybil – Discord Assistant Bot

Sybil è un bot Discord modulare scritto in **Node.js** con **discord.js v14+**.
Il suo scopo è fornire un sistema di assistenza digitale estensibile tramite comandi modulari.

---

## 📑 Indice

- [⚙️ Struttura del progetto](#%EF%B8%8F-struttura-del-progetto)
- [🧩 Panoramica del codice (`index.js`)](#%EF%B8%8F-panoramica-del-codice-indexjs)
- [🔍 Spiegazione passo-passo del codice](#%EF%B8%8F-spiegazione-passo-passo-del-codice)

  - [1. Import e configurazione dotenv](#1-import-e-configurazione-dotenv)
  - [2. Creazione del client e intents](#2-creazione-del-client-e-intents)
  - [3. Debug token](#3-debug-token)
  - [4. Evento `ready`](#4-evento-ready)
  - [5. Caricamento dinamico dei comandi](#5-caricamento-dinamico-dei-comandi)
  - [6. Routing dei messaggi e parsing dei comandi](#6-routing-dei-messaggi-e-parsing-dei-comandi)
  - [7. Login del bot](#7-login-del-bot)

- [🛠 Esempio: file comando (`commands/info.js`)](#%EF%B8%8F-esempio-file-comando-commandsinfojs)
- [💡 Best practice e note](#%EF%B8%8F-best-practice-e-note)
- [🚀 Avvio rapido](#%EF%B8%8F-avvio-rapido)

---

## ⚙️ Struttura del progetto

```
sybil/
├── commands/         # Cartella che contiene i singoli comandi (ogni file = un comando)
│   ├── info.js
│   ├── help.js
│   └── ...
├── index.js          # Entry point principale del bot
├── .env              # File con le variabili d’ambiente (token)
├── package.json
└── README.md
```

---

## 🧩 Panoramica del codice (`index.js`)

Il file `index.js` è il cuore del bot e gestisce:

- la connessione a Discord tramite `discord.js`
- il caricamento automatico dei comandi dalla cartella `commands`
- la gestione dei messaggi e il routing verso i comandi appropriati

---

## 🔍 Spiegazione passo-passo del codice

Di seguito trovi il codice `index.js` completo e accompagnato da spiegazioni passo-passo. Puoi copiare il file così com'è nel progetto.

---

### 1. Import e configurazione dotenv

```js
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Carica le variabili d'ambiente da .env
dotenv.config();
```

**Cosa fa:**

- importa le librerie necessarie
- `dotenv.config()` carica le variabili dal file `.env` (es. `DISCORD_TOKEN`) in `process.env`

---

### 2. Creazione del client e intents

```js
// Configurazione del client con gli intents necessari
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
```

**Cosa fa:**

- crea l'istanza del bot
- gli _intents_ dicono a Discord quali eventi il bot riceverà (leggere messaggi, contenuto messaggi, informazioni sui server)

> ⚠️ Assicurati di abilitare `Message Content Intent` anche dal Developer Portal per permettere al bot di leggere i contenuti dei messaggi.

---

### 3. Debug token

```js
console.log(
  "[Token Caricato] ",
  process.env.DISCORD_TOKEN ? "[OK]" : "[Non Trovato]"
);
```

**Cosa fa:**

- stampa in console se la variabile `DISCORD_TOKEN` è stata caricata correttamente (utile per debugging iniziale)

---

### 4. Evento `ready`

```js
client.once("ready", () => {
  console.log(`Sybil è online come ${client.user.tag}`);
});
```

**Cosa fa:**

- viene eseguito una sola volta quando il bot è connesso e pronto. Utile per log iniziali o per eseguire operazioni di setup.

---

### 5. Caricamento dinamico dei comandi

```js
// Mappa che conterrà i comandi caricati
const commands = new Map();

// Legge tutti i file JS nella cartella ./commands
const commandFiles = fs
  .readdirSync("./commands")
  .filter((f) => f.endsWith(".js"));

for (const file of commandFiles) {
  // import dinamico di ogni comando
  const command = (await import(`./commands/${file}`)).default;
  // ogni comando deve esportare un oggetto con almeno: { name, execute }
  commands.set(command.name, command);
}
```

**Cosa fa:**

- legge la cartella `commands`
- importa ogni file come modulo ES
- registra ogni comando in una `Map` usando `command.name` come chiave

**Vantaggi:** aggiungere un nuovo comando è semplice: basta creare un file `.js` in `commands/` che esporti l'oggetto comando.

---

### 6. Routing dei messaggi e parsing dei comandi

```js
client.on("messageCreate", (message) => {
  // Ignora messaggi da bot
  if (message.author.bot) return;
  // Accetta solo messaggi che iniziano con il prefisso '!s'
  if (!message.content.startsWith("!s")) return;

  // Rimuove il prefisso e crea un array di argomenti
  const args = message.content.slice(2).trim().split(/ +/);
  // Estrae il nome comando
  const commandName = args.shift().toLowerCase();

  // Se il comando esiste nella mappa, lo esegue
  if (commands.has(commandName)) {
    commands.get(commandName).execute(message, args);
  }
});
```

**Cosa fa:**

- verifica e filtra i messaggi
- trasforma il testo in `commandName` e `args`
- esegue il comando corrispondente

**Nota:** usando `slice(2)` si rimuovono i due caratteri del prefisso `!s` (es. `!s info` -> `info`). Se decidi di usare un prefisso più lungo, adegua questo valore.

---

### 7. Login del bot

```js
client.login(process.env.DISCORD_TOKEN);
```

Fa il login su Discord con il token caricato dal `.env`.

---

## 🛠 Esempio: file comando (`commands/info.js`)

Ecco un esempio di comando semplice da mettere in `commands/info.js`:

```js
export default {
  name: "info",
  execute(message, args) {
    message.reply(
      "Sono **Sybil**, il tuo assistente digitale 🤖\nVersione: 1.0.0"
    );
  },
};
```

---

## 💡 Best practice e note

- **.env**: non committare mai il file `.env` (usa `.gitignore`).
- **Permessi**: controlla i permessi del bot sul server (leggere/inviare messaggi).
- **Intents**: abilita `Message Content Intent` dal Developer Portal.
- **Comandi complessi**: per argomenti più elaborati, gestisci parsing avanzato (quotes, flags, subcommands).
- **Slash commands**: considera l'uso di slash commands (`/`) per un'esperienza utente migliore.

---

## 🚀 Avvio rapido

1. Installa dipendenze:

```bash
npm install
```

2. Crea `.env` con:

```env
DISCORD_TOKEN=il_tuo_token
```

3. Avvia:

```bash
node index.js
```

---

## 📄 Licenza

MIT © 2025 Marcy
