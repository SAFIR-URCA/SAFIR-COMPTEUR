/**
 * Mes constantes
 */
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
  ]
});
const Config = require("./config.json");
const fs = require("fs");
const token = Config["monToken"];
const channel = Config["channelId"];
const idRuineur = Config["roleRuineur"];

const cleaner = new  SlashCommandBuilder()
    .setName("clean-ruineurs")
    .setDescription("Enlève tous les rôles ruineurs attribués")
/**
 * Mes variables
 */
var dernierJoueur;
var nombre = 1;
var score = 0;

/**
 * Lancement du bot
 */
client.on("ready", () => {
    console.log("Bot opérationnel");
});
client.login(token); //Connexion

/**
 * Si on veut modifier le fichier config depuis le bot, utiliser la fonction Saveconfig
 */
function Saveconfig() {
    fs.writeFile("./config.json", JSON.stringify(Config, null, 4), (err) => {
        if (err) console.log("erreur sauvegarde");
    });
}

/**
 * Détection message
 */
client.on("messageCreate", message => {
    if (message.author.bot) return; //Si c'est un bot on return, sinon ça fais une boucle

    /**
     * Vérification du channel du message
     */
    if (message.channelId == channel) {

        /**
         * Evidemment...
         */
        if (message.content == "ping") {
            message.channel.send("pong");
        }
        
        /**
         * Vérification si il y a un caractère NaN
         */
        if (isNaN(message.content)) {
            try {
                /**
                 * Vérification si il y a NaN et que c'est une opération
                 */
                if (isNaN(eval(message.content))) {
                    return;
                }
                /**
                 * C'est une opération valide
                 */
                else {
                    /**
                     * C'est le bon nombre
                     */
                    if (eval(message.content)==nombre && dernierJoueur!=message.author.id) {
                        nombre++;
                        score++;
                        dernierJoueur=message.author.id;
                        try {
                            message.react("☑️");
                        } catch (e) {
                            console.log("Echec de la réaction")
                        }
                    }
                    /**
                     * Perdu
                     */
                    else {
                        try {
                            message.react("❌");
                        } catch (e) {
                            console.log("Echec de la réaction")
                        }
                        var newNombre = Math.round((Math.random() * 200000) - 100000); //Nouveau nombre
                        message.channel.send("<@"+ message.author.id + "> ruine la game à **"+ nombre + "** ! Le prochain nombre est **"+newNombre+"**.")
                        nombre=newNombre;
                        score=0;
                        try {
                            message.member.roles.add(idRuineur);
                        } catch (e) {
                            message.channel.send("Echec de l'attribution du rôle **Ruinneur**, contactez un administrateur.")
                        }
                        
                        dernierJoueur ="";
                    }
                }
            } catch (e) {
                console.log("pas un nombre")
            }
        }
        /**
         * Nombre simple (sans opération)
         */
        else { 

            /**
             * Le bon nombre
             */
            if (message.content==nombre && dernierJoueur!=message.author.id) {
                nombre++;
                score++;
                dernierJoueur=message.author.id;
                try {
                    message.react("☑️");
                } catch (e) {
                    console.log("Echec de la réaction")
                }
            }
            /**
             * Perdu
             */
            else {
                try {
                    message.react("❌");
                } catch (e) {
                    console.log("Echec de la réaction")
                }
                var newNombre = Math.round((Math.random() * 200000) - 100000); //Nouveau nombre
                message.channel.send("<@"+ message.author.id + "> ruine la game à **"+ nombre + "** ! Le prochain nombre est **"+newNombre+"**.")
                nombre=newNombre;
                if (score > Config["highscore"]) {
                    message.channel.send("Félicitations, nouveau record : **"+score+"** (ancien : **"+Config["highscore"]+"**).")
                    Config["highscore"]=score;
                    Saveconfig();
                }
                score=0;
                try {
                    message.member.roles.add(idRuineur);
                } catch (e) {
                    message.channel.send("Echec de l'attribution du rôle **Ruinneur**, contactez un administrateur.")
                }
                
                dernierJoueur ="";
            }
        }
        
        
    }
});