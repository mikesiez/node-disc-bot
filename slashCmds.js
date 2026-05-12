const djs = require('discord.js');
const djsV = require("@discordjs/voice");
const { spawn } = require('child_process');
const tokens = require("./token");
const mcLogsCid = tokens.mcLogChannel;

/*
@type {djs.ChatInputCommandInteraction} >> so vs recognizes var type
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
               await interaction.reply('you are not in vc ');
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
                await interaction.reply("left vc");
            } else {
                await interaction.reply("not in vc")
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

            const chosicApiKey = tokens.chosicApiKey;

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
                        "cookie": `${chosicApiKey}`,
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
                    "cookie": `${chosicApiKey}`,
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
    },
    start_zombie_mc : {
        name: "start_zombie_mc",
        description: "start mc server",
        do : async function(/**@type {djs.ChatInputCommandInteraction} */interaction){
            if (global.mcServerP){
                return interaction.reply('alrdy running')
            }
            await interaction.deferReply();

            const mcProcess = spawn('bash', ['../start_server.sh']); // just the nohup bash process but ideally wanna directly run the java cmd for server runup
            global.mcServerP = mcProcess;

            mcProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });

            mcProcess.on('close', (code) => {
                console.log(`server exited with code ${code}`);
            });

            await interaction.editReply('server starting...');
            
            let plrsInServer = [];
            mcProcess.stdout.on('data', async (data) => {
                
                if (data.includes("Done (")) {
                    console.log("started")
                    await interaction.editReply("server started")

                } else if (data.includes("UUID of player")) {
                    const output = line.split(" ");
                    const name = output[8];
                    const UUID = output[output.length - 1];

                    if (!plrsInServer.includes(name)) {
                        plrsInServer.push(name);
                    }

                    const msg = `User joined server: ${name} | Players online: ${plrsInServer.length}`

                    console.log(msg);

                } else if (data.includes("left the game")) {
                    const output = line.split(" ");
                    const name = output[output.length - 4];

                    const index = plrsInServer.indexOf(name);
                    if (index !== -1) {
                        plrsInServer.splice(index, 1);
                    }

                    const msg = `User left server: ${name} | Players online: ${plrsInServer.length}`

                    console.log(msg);

                } else if (data.includes("has made the advancement")) {
                    const output = line.split(" ");
                    const advancement = output.slice(9).join(" ");
                    const playerWhoGot = output[4];

                    const msg = `${playerWhoGot} got achievement ${advancement}`
                    console.log(msg);
                }

                //console.log(`stdout: ${data}`);
            });

        }
    },
    stop_zombie_mc : {
        name: "stop_zombie_mc",
        description: "stop mc server",
        do : async function(/**@type {djs.ChatInputCommandInteraction} */interaction){
            
            if (global.mcServerP){
                const killer = spawn('pkill', ['-f', 'java.*minecraft']); // only 1 server running so this is fine

                killer.on('close', (code) => {
                    console.log(`pkill exited with code ${code}`);
                });

                global.mcServerP = null;
                await interaction.reply('server killed')
            } else {
                await interaction.reply("no server running")
            }

        }
    }
}