// ==============================
// 📦 IMPORTS
// ==============================

// On importe les outils nécessaires de discord.js
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');


// ==============================
// 🤖 CRÉATION DU BOT
// ==============================

// On crée le client Discord (le bot)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,          // accès aux serveurs
    GatewayIntentBits.GuildMessages,   // accès aux messages
    GatewayIntentBits.MessageContent   // lire le contenu des messages ⚠️ obligatoire
  ]
});


// ==============================
// 📍 CONFIGURATION
// ==============================

// Ici tu mets les IDs des salons où le bot doit fonctionner
const CHANNEL_IDS = [
  "1507713452163076147",
  "1507713770687041616"
];


// ==============================
// 🧠 STOCKAGE TEMPORAIRE
// ==============================

// Map = stockage en mémoire
// structure :
// salonId → (userId → messageId)
const messages = new Map();


// ==============================
// 🔌 BOT CONNECTÉ
// ==============================

client.on("ready", () => {
  console.log(`🤖 Connecté en tant que ${client.user.tag}`);
});


// ==============================
// 💬 DÉTECTION DES MESSAGES
// ==============================

client.on("messageCreate", async (message) => {

  // ❌ ignore les bots (évite boucles infinies)
  if (message.author.bot) return;

  // ❌ ignore si le message n'est pas dans les salons ciblés
  if (!CHANNEL_IDS.includes(message.channel.id)) return;

  // ❌ ignore les administrateurs (ils peuvent spam sans restriction)
  if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;


  // ==============================
  // 🧩 IDENTIFIANTS
  // ==============================

  const channelId = message.channel.id; // salon actuel
  const userId = message.author.id;     // utilisateur actuel


  // ==============================
  // 🗂️ INITIALISATION DU SALON
  // ==============================

  // Si le salon n'existe pas encore dans la Map → on le crée
  if (!messages.has(channelId)) {
    messages.set(channelId, new Map());
  }

  // On récupère la Map du salon
  const channelMap = messages.get(channelId);


  // ==============================
  // 🧹 SUPPRESSION ANCIEN MESSAGE
  // ==============================

  // Si l'utilisateur a déjà envoyé un message dans ce salon
  if (channelMap.has(userId)) {
    try {
      // on récupère l'ancien message ID
      const oldMessageId = channelMap.get(userId);

      // on récupère le message sur Discord
      const oldMessage = await message.channel.messages.fetch(oldMessageId);

      // on supprime l'ancien message
      await oldMessage.delete();

    } catch (err) {
      // si le message est déjà supprimé ou introuvable
      console.log("⚠️ Ancien message introuvable ou déjà supprimé");
    }
  }


  // ==============================
  // 💾 SAUVEGARDE DU NOUVEAU MESSAGE
  // ==============================

  // on enregistre le nouveau message comme référence
  channelMap.set(userId, message.id);
});


// ==============================
// 🔐 CONNEXION DU BOT
// ==============================

// IMPORTANT : remplace par ton token Discord (SECRET !)
require('dotenv').config();
const token = process.env.TOKEN;