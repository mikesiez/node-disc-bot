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
    }
}