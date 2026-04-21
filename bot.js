const djs = require('discord.js');
const djsV = require('@discordjs/voice');
const fs = require("fs")
const { Readable } = require('stream');

const prefix = "!";

const keys = require("./token");
const clientId = keys.clientId;
const token = keys.token;
const guildId = keys.guildId;

const client = new djs.Client({ intents: [
    djs.GatewayIntentBits.Guilds, 
    djs.GatewayIntentBits.GuildMessages, 
    djs.GatewayIntentBits.MessageContent,
    djs.GatewayIntentBits.GuildVoiceStates
] });

client.on(djs.Events.ClientReady, (client) => {
    console.log(`Logged in as ${client.user.tag}`);
});


const msgCmds = require('./textMsgCmds');
const slashCmds = require('./slashCmds');

let commands = [];
for ({name, description} of Object.values(slashCmds)){
    commands.push( {name, description} );
    console.log(`added cmd ${name}`)
}

const rest = new djs.REST({ version: '10'}).setToken(token);

async function syncCommands() {
    try {
        console.log(`Refreshing app cmds.`);
        const data = await rest.put(djs.Routes.applicationGuildCommands(clientId,guildId), { body: commands} )
        console.log(`"suces" ${data.length}`);

    } catch (err){
        console.error(err);

    }
}
syncCommands();

client.on(djs.Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand() || !interaction.inGuild()) return;

    slashCmds[interaction.commandName].do(interaction);
    
})

client.on(djs.Events.MessageContent, async (msg)=>{
    console.log(msg);
})

const player = djsV.createAudioPlayer();
client.on(djs.Events.MessageCreate, async msg => {
    if (msg.author.bot) return;

    if (msg.content[0] == prefix){
        const cmdObj = msgCmds[msg.content.substring(1,)];
        if (cmdObj) {
            cmdObj.do(msg);
        } else {
            msg.reply("?")
        }
    }

    else if (djsV.getVoiceConnection(msg.guildId)){
        const text = msg.content;

        const connection = djsV.getVoiceConnection(msg.guildId);
        connection.subscribe(player);

        const SPEAKER_WAV = "C:/Users/micha/speaker.wav"; // your wav file path
        const LANGUAGE = "en";

        const response = await fetch(
        `http://localhost:5002/api/tts` +
        `?text=${encodeURIComponent(text)}` +
        `&speaker_wav=${encodeURIComponent(SPEAKER_WAV)}` +
        `&language=${LANGUAGE}`
        );

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const readable = Readable.from(buffer);

        const resource = djsV.createAudioResource(readable, {
            inputType: djsV.StreamType.Arbitrary,
        });

        player.play(resource);

    }

})

client.login(token);