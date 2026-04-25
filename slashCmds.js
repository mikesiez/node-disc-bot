const djs = require('discord.js');
const djsV = require("@discordjs/voice");

/*
@type {djs.ChatInputCommandInteraction} >> so vs recognized var type
*/


module.exports = {
    join : {
        name: "join",
        description: "join vc",
        do: async function(/**@type {djs.ChatInputCommandInteraction}*/interaction) {
            const vc = await interaction.member.voice.channel;
            if (vc){
                await interaction.reply(`joining ${vc.name}`);
                djsV.joinVoiceChannel({
                    channelId: vc.id,
                    guildId: vc.guild.id,
                    adapterCreator: await interaction.guild.voiceAdapterCreator
                })
                await interaction.editReply(`joined vc ${vc.name} at ${interaction.user.globalName}'s request`)

            } else {
               await interaction.reply('u r not in vc ');
            }
        }
    },
    leave : {
        name: "leave",
        description: "leave vc",
        do: async function(/**@type {djs.ChatInputCommandInteraction}*/interaction) {
            const con = djsV.getVoiceConnection(interaction.guildId)
            if (con) {
                con.destroy();
                await interaction.reply("i left according to my boss");
            } else {
                await interaction.reply("?")
            }
        }
    },
    recommend_songs : {
        name: "recommend_songs",
        description: "recommend songs",
        options: [
            {
                name: "songs",
                description: "songs to match to (SEPERATE BY COMMAS)",
                type: 3,
                required: true
            },
            {
                name: "amount",
                description: "amount of songs to be recommended",
                type: 4,
                required: true
            },
            {
                name: "cloudy",
                description: "cloudy song format?",
                type: 5,
                required: true
            }
        ],
        do: async function(/**@type {djs.ChatInputCommandInteraction} */interaction){

            const userInput = interaction.options.getString("songs");
            interaction.reply(`fetching songs similar to: ${userInput} ... `)

            let queries = userInput.replace(" ","").replace(", ",",").split(",")

            let seeds = "";
            for (query of queries) {
                const query = "cakebytheocean";
                const getSongId = await fetch(
                    `https://www.chosic.com/api/tools/search?q=${query}&type=track&limit=1`, {
                    "headers": {
                        "accept": "application/json, text/javascript, */*; q=0.01",
                        "accept-language": "en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,ar-SA;q=0.6,ar;q=0.5",
                        "app": "playlist_generator",
                        "priority": "u=1, i",
                        "sec-ch-ua": "\"Google Chrome\";v=\"147\", \"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"147\"",
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": "\"Windows\"",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-requested-with": "XMLHttpRequest",
                        "Referer": "https://www.chosic.com/playlist-generator/",
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
                    },
                    "body": null,
                    "method": "GET"
                    });
                const possibleSongs = await getSongId.json();
                const songId = possibleSongs["tracks"]["items"][0]["id"];
                seeds += (songId+",");
            }

            const howMany = interaction.options.getInteger("amount");
            const getRecommended = await fetch(
                `https://www.chosic.com/api/tools/recommendations?seed_tracks=${seeds}&limit=${howMany}`, {
                "headers": {
                    "accept": "application/json, text/javascript, */*; q=0.01",
                    "accept-language": "en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,ar-SA;q=0.6,ar;q=0.5",
                    "app": "playlist_generator",
                    "priority": "u=1, i",
                    "sec-ch-ua": "\"Google Chrome\";v=\"147\", \"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"147\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-with": "XMLHttpRequest",
                    "Referer": "https://www.chosic.com/playlist-generator/",
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36'
                },
                "body": null,
                "method": "GET"
                });
            
            const recommendedSongs = await getRecommended.json();

            let returnString = "";
            returnString += `Here are ${howMany} songs that match the songs: \`\`\` ${userInput} \`\`\` \n`
            
            const cloudyFormat = interaction.options.getBoolean("cloudy");
            if (cloudyFormat){
                returnString += `\n [!] Copyable command format for cloudy: \n \`\`\``
                for (song of recommendedSongs["tracks"]){
                    returnString += `/play query:${song["name"]} (${song["artists"][0]["name"]})\n`;
                }
                returnString += "\n```";
            } else {
                for (song of recommendedSongs["tracks"]){
                    returnString += `${song["name"]} (${song["artists"][0]["name"]})\n`;
                }
            }
            

            interaction.editReply(returnString);

        }
    }
}
