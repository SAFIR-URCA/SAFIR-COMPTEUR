/**
 * Mes constantes
 */
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
  ]
});
const Config = require("./donnees/config.json");
const listeRuineur = require("./donnees/liste_ruineurs.json")
const fs = require("fs");
const token = Config["monToken"];
const channel = Config["channelId"];
const idRuineur = Config["roleRuineur"];
const idServer = Config["serverId"]
const { SlashCommandBuilder } = require("@discordjs/builders");

/**
 * Mes variables
 */
var dernierJoueur;
var nombre = 1;
var score = 0;
var rand = false;

/**
 * Mes slash commands
 */

//clean-ruineurs : nettoie tous les rôles ruineurs
const dataCleaner = new SlashCommandBuilder()
    .setName("clean-ruineurs")
    .setDescription("Enlève les rôles ruineurs de ceux qui le possèdent.")

//random : active/désactive le mode random
const dataRandom = new SlashCommandBuilder()
    .setName("random")
    .setDescription("Active le mode random du bot SAFIR-Compteur")

//highscore : montre le plus haut score
const dataScore = new SlashCommandBuilder()
    .setName("highscore")
    .setDescription("Connaître le meilleur score de compteur.")

/**
 * Lancement du bot
 */
client.on("ready", () => {

    client.guilds.cache.get(idServer).commands.create(dataCleaner);
    client.guilds.cache.get(idServer).commands.create(dataRandom);
    client.guilds.cache.get(idServer).commands.create(dataScore);

    console.log("Bot opérationnel");
});
client.login(token); //Connexion

/**
 * Si on veut modifier le fichier config depuis le bot, utiliser la fonction Saveconfig
 */
function Saveconfig() {
    fs.writeFile("./donnees/config.json", JSON.stringify(Config, null, 4), (err) => {
        if (err) console.log("erreur sauvegarde");
    });
}

/**
 * Si on veut modifier le fichier liste_ruineur depuis le bot, utiliser la fonction SaveListe
 */
 function SaveListe() {
    fs.writeFile("./donnees/liste_ruineurs.json", JSON.stringify(listeRuineur, null, 4), (err) => {
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
            return;
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
                        if (rand == true) {
                            var newNombre = Math.round((Math.random() * 200000) - 100000); //Nouveau nombre
                        }
                        else {  
                            var newNombre = 1;//Nouveau nombre
                        }
                        message.channel.send("<@"+ message.author.id + "> ruine la game à **"+ nombre + "** ! Le prochain nombre est **"+newNombre+"**.")
                        nombre=newNombre;
                        score=0;
                        try {
                            message.member.roles.add(idRuineur);
                            listeRuineur["Liste"][message.author.id]=true;
                            SaveListe();
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
                /**
                 * Réagis
                 */
                try {
                    message.react("❌");
                } catch (e) {
                    console.log("Echec de la réaction")
                }
                /**
                 * Vérifie le mode random
                 */
                if (rand == true) {
                    var newNombre = Math.round((Math.random() * 200000) - 100000); //Nouveau nombre
                }
                else {  
                    var newNombre = 1; //Nouveau nombre
                }
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
                    listeRuineur["Liste"][message.author.id]=true;
                    SaveListe();
                } catch (e) {
                    message.channel.send("Echec de l'attribution du rôle **Ruinneur**, contactez un administrateur.")
                }
                
                dernierJoueur ="";
            }
        }
        
    } 
});

/**
 * Handler des interactions en générale
 */
client.on("interactionCreate", async interaction => {
    
    /**
     * Vérifie si c'est une commande
     */
    if(interaction.isCommand()) {
        /**
         * Commande de clean-ruineurs
         */
        if(interaction.commandName === "clean-ruineurs") {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                interaction.reply("Vous n'avez pas les permissions.");
            }
            else {
                try {
                    const guild = client.guilds.cache.get(idServer);
                    var memb;
                    for (var key in listeRuineur["Liste"]) {
                        memb = await guild.members.fetch(""+key+"")
                        memb.roles.remove(idRuineur)
                        listeRuineur["Liste"][key]=false;
                    }
                    SaveListe();
                    interaction.reply("Rôles ruineurs supprimés.")
                } catch (e) { 
                    interaction.reply("Echec du nettoyage de rôles.")
                }
            }
            return;
        }
        /**
         * Mode random
         */
        if (interaction.commandName === "random") {
            try {
                if (interaction.member.roles.cache.some(role => role.name === 'Admins') || interaction.member.roles.cache.some(role => role.name === 'Modérateurs 👮🏻') ) {
                    if (rand) {
                        rand = false
                        interaction.reply("Mode **random** désactivé pour la prochaine partie.")
                    }
                    else {
                        rand = true
                        interaction.reply("Mode **random** activé pour la prochaine partie.")
                    }
                } else {
                    interaction.reply("Vous n'avez pas les permissions.")
                }
            }
            catch (e) {
                interaction.reply("Echec de l'activation du mode random.")
            }
            

            return;
        }

        /**
         * Meilleur score
         */
        if (interaction.commandName === "highscore") {
            interaction.reply({content: "Meilleur score : **"+Config["highscore"]+"**",ephemeral: true});
            return
        }

    }
});