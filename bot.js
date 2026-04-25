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
for ({name, description, options} of Object.values(slashCmds)){
    const cmd = {name, description};

    if (options) {
        cmd.options = options;
    }

    commands.push(cmd);
    console.log(`added cmd ${name}`)
}

const rest = new djs.REST({ version: '10'}).setToken(token);

async function syncCommands() {
    try {
        console.log(`Refreshing app cmds.`);
        const data = await rest.put(djs.Routes.applicationGuildCommands(clientId,guildId), { body: commands} )
        console.log(`"cmd refresh success" ${data.length}`);

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
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const stream = Readable.from(buffer);

        const resource = djsV.createAudioResource(stream, {
            inputType: djsV.StreamType.Arbitrary,
        });

        const connection = djsV.getVoiceConnection(msg.guildId);
        connection.subscribe(player);
        player.play(resource);

        await msg.reply("voiced message: "+text)
        
    }

})

client.login(token);