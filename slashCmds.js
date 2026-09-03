const djs = require('discord.js');
const djsV = require("@discordjs/voice");
const { spawn } = require('child_process');
const tokens = require("./token");
const mcLogsCid = tokens.mcLogChannel;

/*
@type {djs.ChatInputCommandInteraction} >> so vs recognizes var type
*/

db = {}

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
                required: false
            }
        ],
        do: async function(/**@type {djs.ChatInputCommandInteraction} */interaction){

            const userInput = interaction.options.getString("songs");
            await interaction.reply(`fetching songs similar to: ${userInput} ... `)

            await interaction.editReply('no key rn.')

            return;

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
            
            const cloudyFormat = ("cloudy");
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
            
            /*let plrsInServer = [];
            mcProcess.stdout.on('data', async (data) => {
                
                if (data.includes("Done (")) {
                    console.log("started")
                    await interaction.editReply(`<@${interaction.member.id}> server started`)

                } else if (data.includes("UUID of player")) {
                    const output = data.split(" ");
                    const name = output[8];
                    const UUID = output[output.length - 1];

                    if (!plrsInServer.includes(name)) {
                        plrsInServer.push(name);
                    }

                    const msg = `User joined server: ${name} | Players online: ${plrsInServer.length}`

                    console.log(msg);

                } else if (data.includes("left the game")) {
                    const output = data.split(" ");
                    const name = output[output.length - 4];

                    const index = plrsInServer.indexOf(name);
                    if (index !== -1) {
                        plrsInServer.splice(index, 1);
                    }

                    const msg = `User left server: ${name} | Players online: ${plrsInServer.length}`

                    console.log(msg);

                } else if (data.includes("has made the advancement")) {
                    const output = data.split(" ");
                    const advancement = output.slice(9).join(" ");
                    const playerWhoGot = output[4];

                    const msg = `${playerWhoGot} got achievement ${advancement}`
                    console.log(msg);
                }

                //console.log(`stdout: ${data}`);
            });*/

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
    },
    beg : {
        name: "beg",
        description: "beg strangers for coins",
        do : async function(/**@type {djs.ChatInputCommandInteraction} */interaction){
            await interaction.reply("begging strangers for money")

            if (!(interaction.member.displayName in db)){
                db[interaction.member.displayName] = {money:5, winnings: 0, losses: 0};
            }

            if (db[interaction.member.displayName].money > 10){
                interaction.editReply("ur too rich go gamble");
                return;
            }

            if (Math.random() < 0.5){
                const amount = parseInt((Math.random())*10);
                await interaction.editReply(`u got $${amount}`)

                
                db[interaction.member.displayName].money += amount;
            } else {
                interaction.editReply("no one wanted to give u money")
            }

        }
    },
    blackjack : {
        name: "blackjack",
        description: "play a game of blackjack",
        options: [
            {
                name: "bet",
                description: "amount to bet against dealer",
                type: 4,
                required: false,
                min_value : 1
            },
            {
                name: "all-in",
                description: "go all in",
                type: 5,
                required: false
            }
        ],
        do : async function(/**@type {djs.ChatInputCommandInteraction} */interaction){

            await interaction.reply("checking stuff")

            const username = interaction.member.displayName;
            
            if (!(username in db)){
                db[username] = {money: 5, winnings: 0, losses: 0};
            }
            
            if ((!interaction.options.getBoolean("all-in") && !interaction.options.getInteger("bet")) || (interaction.options.getInteger("bet") && interaction.options.getInteger("bet") <= 0)){
                return interaction.editReply("mfw when u do stupid stuff: 🥴")
            }

            let bet = interaction.options.getInteger("bet");
            if (interaction.options.getBoolean("all-in")){
                bet = db[username].money;
            }

            if (!(db[username].money >= bet)){
                await interaction.editReply("ur too broke.");
                return;
            }
            db[username].money -= bet;

            
            //-----------------------------------

            // 1. Dead simple math: cards are just numbers from 2 to 11
            const drawCard = () => Math.floor(Math.random() * 10) + 2;

            const dealerCard1 = drawCard();
            const dealerCard2 = drawCard();

            let playerTotal = drawCard() + drawCard();
            let dealerTotal = dealerCard1 + dealerCard2;

            // 2. Simple Button Layout (Raw Discord format)
            const buttons = [{
                type: 1, // This means "Action Row" (a container for buttons)
                components: [
                    { type: 2, style: 1, label: 'Hit', custom_id: 'hit_btn' },
                    { type: 2, style: 2, label: 'Stand', custom_id: 'stand_btn' }
                ]
            }];

            // 3. Send the initial game state
            const gameMessage = await interaction.editReply({
                content: `🃏 **Blackjack Table** (Bet: 🪙${bet})\n\n👤 Your Total: \`${playerTotal}\`\n🤖 Dealer shows: \`${dealerCard1}\` + 🎴`,
                components: buttons
            });

            // 4. This is the "Collector"—think of it as a simple event listener for the buttons
            const listener = gameMessage.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id, // Only allow the person who played to click
                time: 30000 // Turn off after 30 seconds of inactivity
            });

            listener.on('collect', async (click) => {
                // Acknowledge the click immediately so Discord doesn't say "Interaction Failed"
                await click.deferUpdate();

                // --- IF THEY CLICK HIT ---
                if (click.customId === 'hit_btn') {
                    playerTotal += drawCard(); // Do the math

                    if (playerTotal > 21) {
                        // Game Over: Bust
                        await interaction.editReply({
                            content: `💥 **Bust!** You got \`${playerTotal}\`. You lost 🪙${bet}.`,
                            components: [] // This removes the buttons from the message
                        });
                        listener.stop(); // Turn off the listener
                    } else {
                        // Still alive, update the numbers
                        await interaction.editReply({
                            content: `🃏 **Blackjack Table** (Bet: 🪙${bet})\n\n👤 Your Total: \`${playerTotal}\`\n🤖 Dealer shows: \`${dealerCard1}\` + 🎴`,
                            components: buttons
                        });
                    }
                }

                // --- IF THEY CLICK STAND ---
                if (click.customId === 'stand_btn') {
                    listener.stop(); // Stop listening and move to the dealer's turn below
                }
            });

            // 5. This triggers when the game finishes or times out
            listener.on('end', async (collected, reason) => {
                // If the player busted, we already handled it, so stop here
                if (playerTotal > 21) return;

                // Dealer hits until they have at least 17
                while (dealerTotal < 17) {
                    dealerTotal += drawCard();
                }

                // Simple win/loss logic
                let finalStatus = '';
                if (dealerTotal > 21) {
                    finalStatus = `🏆 Dealer busted with \`${dealerTotal}\`! You win 🪙${bet}!`;
                    db[username].money += 2 * bet;
                    db[username].winnings += bet;
                } else if (playerTotal > dealerTotal) {
                    finalStatus = `🏆 You beat the dealer (\`${playerTotal}\` vs \`${dealerTotal}\`)! You win 🪙${bet}!`;
                    db[username].money += 2 * bet;
                    db[username].winnings += bet;
                } else if (playerTotal < dealerTotal) {
                    finalStatus = `❌ Dealer wins with \`${dealerTotal}\`. You lose 🪙${bet}.`;
                    db[username].losses += bet;
                } else {
                    finalStatus = `👔 It's a tie (\`${playerTotal}\` each). Bet returned.`;
                    db[username].money += bet;
                }

                // One final edit to display results and wipe the buttons
                await interaction.editReply({
                    content: `🃏 **Final Score**\n\n👤 You: \`${playerTotal}\`\n🤖 Dealer: \`${dealerTotal}\`\n\n${finalStatus}`,
                    components: []
                });
            });



            //----------------------------------
        }
    },
    balance : {
        name: "balance",
        description: "show game balance",
        options : [
            {
                name:"user",
                description: "see user's balance",
                type: 6,
                required: false
            }
        ],
        do : async function(/**@type {djs.ChatInputCommandInteraction} */interaction){

            let username = interaction.member.displayName;
            if (interaction.options.getMember("user")){
                username = interaction.options.getMember("user").displayName;
            }

            if (!(username in db)){
                if (!(username in db)){
                    db[username] = {money:5, winnings: 0, losses: 0};
                }
            }

            await interaction.reply(`${username}'s Balance: $${db[username].money}, Winnings: $${db[username].winnings}, Losses: $${db[username].losses}, Winrate: ${(db[username].winnings/db[username].losses).toFixed(2)}`);

        }
    },
    leaderboard: {
        name: "leaderboard",
        description: "global leaderboard",
        do : async function(/**@type {djs.ChatInputCommandInteraction} */interaction){
            
            const players = Object.keys(db).map(username => {
                const user = db[username];
                const winnings = user.winnings;
                const losses = user.losses;
                
                // Calculate winrate safely (prevent division by zero)

                return {
                    username,
                    money: user.money,
                    winnings,
                    losses
                };
            });

            // 2. Sort players by money (highest first)
            players.sort((a, b) => b.money - a.money);

            // 3. Slice to only show top 10 players (prevents character limit overflow)
            const topPlayers = players.slice(0, 10);

            if (topPlayers.length === 0) {
                return interaction.reply({ content: "❌ No data found in the database yet!", ephemeral: true });
            }

            // 4. Build a perfectly aligned text table for the codeblock
            // Adjust padding widths if usernames or numbers get massive
            let leaderboardText = "Rank | Player           | Balance  \n";
            leaderboardText += "--------------------------------------\n";

            topPlayers.forEach((player, index) => {
                const rank = (index + 1).toString().padEnd(4, ' ');
                const name = player.username.substring(0, 16).padEnd(16, ' '); // Max 16 chars for formatting
                const balance = `🪙${player.money.toFixed(2)}`.padEnd(10, ' ');

                leaderboardText += `${rank} | ${name} | ${balance}\n`;
            });

            // 5. Send the styled Embed response
            await interaction.reply({
                embeds: [{
                    title: '🏆 CASINO LEADERBOARD 🏆',
                    color: 0xF1C40F, // Golden yellow color
                    description: `\`\`\`text\n${leaderboardText}\`\`\``,
                    footer: { text: `Showing top ${topPlayers.length} active players` },
                    timestamp: new Date().toISOString()
                }]
            });

        }
    },
    kill: {
        name: "kill",
        description: "kill me",
        do : async function(/**@type {djs.ChatInputCommandInteraction} */interaction){
            db.elimination.destroyme.destroyme[destroy] = 1;
        }
    },
    chat: {
        name: "chat",
        description: "chat with bad ai",
        options: [
            {
                name: "message",
                description: "message to send",
                type: 3,
                required: true
            },
            {
                name: "think",
                description: "prompt the ai to think. will cause longer reply times.",
                type: 5,
                required: false
            }
        ],
        do : async function(/**@type {djs.ChatInputCommandInteraction} */interaction){
            const userInput = interaction.options.getString("message");
            const username = interaction.member.displayName
            const think = (interaction.options.getBoolean("think")==true ? true : false) // a = x==true ? true : false

            //const model = "qwen2.5-coder"
            const model = "qwen3:8b"
            const personality = "Your creator is no one else than 'almighty michael'. You live for almighty michael. If you do not know how to help someone or the answer to a question, you directly refer people to @michael. You are a joyful fun person but also you are counter-argumentative. You criticize, to a certain extent."
            const endpoint = "http://localhost:11434/api/chat" // can use /chat if want to make context or more system related hints to the ai
            await interaction.deferReply()

            try {
                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: model,
                        think: think,
                        "messages" : [
                            {
                                "role" : "system",
                                "content" : personality
                            },
                            {
                                "role" : "user",
                                "content" : `${username} prompted you with: ${userInput}`
                            }
                        ]
                    })
                });

                const data = await response.json();
                const thoughtTime = data.total_duration
                let answer = data.message.content
                let warn = false
                if (answer.length > 2000){ // max disc char limit
                    answer = `${answer.slice(0,2000-3)}...`
                    warn = true
                }
                await interaction.editReply(`**Prompt:** ${userInput}\n\n**AI Answer**: ${answer}\n\n> *running on michael's server pls go easy. model:${model} | thought for ${thoughtTime/1000000000}s*`);
                if (warn){
                    await interaction.channel.send("*The AI produced a reply that was over discord's max character limit.*")
                }
            } catch (e) {
                await interaction.editReply(`error occured. dont do bad things | e:${e}`)
            }
            
        }
    }
}