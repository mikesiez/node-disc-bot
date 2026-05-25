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

            if (Math.random() < 0.5){
                const amount = (Math.random())*10;
                await interaction.editReply(`u got $${amount}`)

                if (!(interaction.member.displayName in db)){
                    db[interaction.member.displayName] = {money:0, winnings: 0, losses: 0};
                }
                db[interaction.member.displayName].money += amount;
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
                required: true
            }
        ],
        do : async function(/**@type {djs.ChatInputCommandInteraction} */interaction){

            await interaction.reply("checking stuff")

            const username = interaction.member.displayName;
            
            if (!(username in db)){
                db[username] = {money: 0, winnings: 0, losses: 0};
            }
            
            const bet = interaction.options.getInteger("bet");

            if (!(db[username].money >= bet)){
                interaction.editReply("ur too broke.");
                return;
            }
            db[username].money -= bet;

            
            //-----------------------------------

            // 1. Setup Deck & Game State
            const suits = ['♠️', '♥️', '♦️', '♣️'];
            const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
            let deck = [];

            for (const suit of suits) {
                for (const value of values) {
                    deck.push({ value, suit });
                }
            }

            // Shuffle deck
            deck = deck.sort(() => Math.random() - 0.5);

            const drawCard = () => deck.pop();
            
            // Calculate hand value
            const calculateHand = (hand) => {
                let value = 0;
                let aces = 0;
                for (const card of hand) {
                    if (['J', 'Q', 'K'].includes(card.value)) value += 10;
                    else if (card.value === 'A') { value += 11; aces++; }
                    else value += parseInt(card.value);
                }
                while (value > 21 && aces > 0) {
                    value -= 10;
                    aces--;
                }
                return value;
            };

            // Format hand for Discord display
            const formatHand = (hand) => hand.map(c => `\`${c.value}${c.suit}\``).join(' ');

            // Initial Deal
            let playerHand = [drawCard(), drawCard()];
            let dealerHand = [drawCard(), drawCard()];

            // 2. Create UI Buttons (Using raw Discord.js object format)
            const getButtons = (disabled = false) => {
                return [{
                    type: 1, // ActionRow
                    components: [
                        { type: 2, style: 1, label: 'Hit', custom_id: 'bj_hit', disabled },
                        { type: 2, style: 2, label: 'Stand', custom_id: 'bj_stand', disabled }
                    ]
                }];
            };

            // 3. Game State Display Function
            const generateEmbed = (gameOver = false, message = '') => {
                const pScore = calculateHand(playerHand);
                const dScore = calculateHand(dealerHand);
                
                // Hide dealer's second card if game is still going
                const dealerString = gameOver 
                    ? `${formatHand(dealerHand)} *(Total: ${dScore})*`
                    : `\`${dealerHand[0].value}${dealerHand[0].suit}\` \`??\``;

                return {
                    embeds: [{
                        title: '🃏 Blackjack Table',
                        color: gameOver ? 0x2f3136 : 0x00ff00,
                        fields: [
                            { name: 'Your Hand', value: `${formatHand(playerHand)} *(Total: ${pScore})*`, inline: true },
                            { name: 'Dealer Hand', value: dealerString, inline: true },
                            { name: 'Bet Amount', value: `🪙 ${bet} credits`, inline: false }
                        ],
                        description: message || 'What would you like to do?'
                    }],
                    components: getButtons(gameOver)
                };
            };

            // 4. Start the game with an initial reply
            const initialResponse = await interaction.reply(generateEmbed());

            // Check for immediate natural Blackjack
            if (calculateHand(playerHand) === 21) {
                await interaction.editReply(generateEmbed(true, '🎉 **Blackjack! You win instantly!**'));
                return;
            }

            // 5. Create a collector to listen for button interactions
            const collector = initialResponse.createMessageComponentCollector({
                filter: (i) => i.user.id === interaction.user.id, // Only the player can click
                time: 60000 // 1 minute timeout
            });

            collector.on('collect', async (btnInteraction) => {
                // Acknowledge the button click immediately to prevent lag/errors
                await btnInteraction.deferUpdate();

                if (btnInteraction.customId === 'bj_hit') {
                    playerHand.push(drawCard());
                    const playerScore = calculateHand(playerHand);

                    if (playerScore > 21) {
                        // Player busted
                        await interaction.editReply(generateEmbed(true, `💥 **Bust! You went over 21. You lose ${bet} credits.**`));
                        collector.stop();
                    } else if (playerScore === 21) {
                        // Auto-stand on 21
                        collector.stop('dealer_turn');
                    } else {
                        // Update board and keep playing
                        await interaction.editReply(generateEmbed());
                    }
                } 
                
                else if (btnInteraction.customId === 'bj_stand') {
                    collector.stop('dealer_turn');
                }
            });

            // 6. Handle Dealer's turn and Final Results
            collector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    await interaction.editReply(generateEmbed(true, '⏰ **Game timed out.**'));
                    return;
                }

                if (reason === 'dealer_turn') {
                    let playerScore = calculateHand(playerHand);
                    let dealerScore = calculateHand(dealerHand);

                    // Dealer hits until hitting 17 or higher
                    while (dealerScore < 17) {
                        dealerHand.push(drawCard());
                        dealerScore = calculateHand(dealerHand);
                    }

                    // Determine Winner
                    let finalMessage = '';
                    if (dealerScore > 21) {
                        finalMessage = `🏆 **Dealer busted with ${dealerScore}! You win ${bet} credits!**`;
                        db[username].money += 2*bet;
                        db[username].winnings += bet;
                    } else if (playerScore > dealerScore) {
                        finalMessage = `🏆 **You beat the dealer! You win ${bet} credits!**`;
                        db[username].money += 2*bet;
                        db[username].winnings += bet;
                    } else if (playerScore < dealerScore) {
                        finalMessage = `❌ **Dealer wins with ${dealerScore}. You lose ${bet} credits.**`;
                        db[username].losses += bet;
                    } else {
                        finalMessage = `👔 **It's a tie! Your ${bet} credits were returned.**`;
                        db[username].money += bet;
                    }

                    // Update the reply one final time with buttons disabled and results shown
                    await interaction.editReply(generateEmbed(true, finalMessage));
                }
            });



            //----------------------------------
        }
    },
    balance : {
        name: "balance",
        description: "show game balance",
        do : async function(/**@type {djs.ChatInputCommandInteraction} */interaction){

            const username = interaction.member.displayName;

            if (!(username in db)){
                db[username] = {money:0, winnings: 0, losses: 0};
            }

            await interaction.reply(`Balance: ${db[username].money}, Winnings: ${db[username].winnings}, Losses: ${db[username].losses}`);

        }
    },
}