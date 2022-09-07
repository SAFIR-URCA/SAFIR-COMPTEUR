Bot Discord "Compteur" pour SAFIR, par Romain Cogné.

Fichiers disponibles : 
-README.md
-donnees : -config.json :token du bot, id du channel, id du role ruineur, score, etc.
           -liste_ruineurs.json : liste des ruineurs attribués par ce bot.
-index.js : script du bot

POUR INSTALLER LES MODULES NODE.JS :
-"npm install discord.js" à la racine du dossier du bot

Nouveautés :
3 slashs commandes :
    -Plus haut score disponible : /highscore
    -Mode random : /random POUR MODO ET ADMINS UNIQUEMENT
    -Clean-ruineurs : /clean-ruineurs retire tous les rôles ruineurs attribués 
        (Attention : retire seulement les rôles ruineurs attribués par CE bot, les anciens ruineurs ne seront pas enlevés.)
