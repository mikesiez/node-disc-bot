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
                        "cookie": "pll_language=en; FCCDCF=%5Bnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5B32%2C%22%5B%5C%222e03dcba-9c83-4ba9-bd38-7e00e3562645%5C%22%2C%5B1777056842%2C875000000%5D%5D%22%5D%5D%5D; _gid=GA1.2.1310018804.1777056843; _lc2_fpi=529aa3a252f0--01kq0df3gk8jcgv0ggv3cpejm2; _lc2_fpi_meta=%7B%22w%22%3A1777056845331%7D; _lr_env_src_ats=false; gamera_user_id=57973590-43b3-4cfc-a948-b8c5f3f0d5c3; _lr_geo_location_state=ON; _lr_geo_location=CA; _cc_id=38b971635259be727ff49a2f76808025; panoramaId_expiry=1777661644673; panoramaId=bae73093b9d06ae346f5b18502dd4945a7023d794e9c8230a5f56a9bf4929fe1; panoramaIdType=panoIndiv; _lr_sampling_rate=100; pbjs-unifiedid=%7B%22TDID%22%3A%22c3ba3c8e-cfce-40da-bdb2-9fb6c13fecb1%22%2C%22TDID_LOOKUP%22%3A%22TRUE%22%2C%22TDID_CREATED_AT%22%3A%222026-03-24T18%3A54%3A07%22%7D; pbjs-unifiedid_cst=YiwPLDosoA%3D%3D; r_34874064=1777058160%7C2ec4ca9dcfb0f7c6%7C1784d545619ca62c56b8fbb0ccd4446d09106df1192467204a511ede468f0d2c; _li_dcdm_c=.chosic.com; _lr_retry_request=true; _iiq_fdata=%7B%22pcid%22%3A%225b0eba80-160d-d15b-4f3a-50cd91a46d5f%22%2C%22pcidDate%22%3A1777056849061%7D; __gads=ID=fba76e49928b4e7f:T=1777056841:RT=1777079918:S=ALNI_MYvaV5ewvGVZdzSSxysKr9RyiLoUw; __gpi=UID=00001364aaedc39c:T=1777056841:RT=1777079918:S=ALNI_MZEIFZcSanlNa7uGJRQk2dwwXqMUg; __eoi=ID=387765fd0d282eb6:T=1777056841:RT=1777079918:S=AA-AfjYqrJaLeIBpQADV1ZbpRIXn; _gat_gtag_UA_132567108_1=1; _ga=GA1.1.1255861347.1777056843; FCNEC=%5B%5B%22AKsRol81e8qFsy77FoN6Isz1ZdcfOUY0iprzpvGzwPqKqySvt4NO_2EVOqRDMs1n3jA7ylglxXHHDLWY0pnpbwMVdR6GWowZwqzQjpakYEvtrjldY6KfIQ2CRWvAvNEbo5CS8Tj_FoK7aF1CNB_VofTghFg--j-EVg%3D%3D%22%5D%5D; _ga_XPLVMMQKKB=GS2.1.s1777079563$o2$g1$t1777080033$j38$l0$h0; pbjs-unifiedid_last=Sat%2C%2025%20Apr%202026%2001%3A20%3A36%20GMT; cto_bundle=ZkSXlF9RNER1Z1FCWWFQOWtuUnVVR1gzWTFVNkpHSDJZYUx0bCUyQlRveUJTTzlIMUdkWjNtcWRMcHR6SHFBNWhuNkM0dDlzSURUbmNSQno2U3FyNWJVemhxRnJjNCUyQmJlRkJsSG1lWWdHT0JXY0JPbHdqMDB4NmlyMEZwT2VrYVNWNEE5RGtqbm1qSkliMHJ1WUE1bSUyQlhjeXF4TmclM0QlM0Q; cto_bidid=rK8d8V9sR2hySlB5UWQ2V2NDYnJoJTJGbXlnU0tPZiUyRlh4UjRsODEwemd6MEhCZjJmaUJvVFVSZWx2WkRuTyUyRnRRMUlnWjZkRTV5dEQ3U3ZzMEFObVpjd0FNZzloR2t6RlNaNmtjJTJGVGRkT1JDRzZZajAwJTNE",
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
                    "cookie": "pll_language=en; FCCDCF=%5Bnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C%5B%5B32%2C%22%5B%5C%222e03dcba-9c83-4ba9-bd38-7e00e3562645%5C%22%2C%5B1777056842%2C875000000%5D%5D%22%5D%5D%5D; _gid=GA1.2.1310018804.1777056843; _lc2_fpi=529aa3a252f0--01kq0df3gk8jcgv0ggv3cpejm2; _lc2_fpi_meta=%7B%22w%22%3A1777056845331%7D; _lr_env_src_ats=false; gamera_user_id=57973590-43b3-4cfc-a948-b8c5f3f0d5c3; _lr_geo_location_state=ON; _lr_geo_location=CA; _cc_id=38b971635259be727ff49a2f76808025; panoramaId_expiry=1777661644673; panoramaId=bae73093b9d06ae346f5b18502dd4945a7023d794e9c8230a5f56a9bf4929fe1; panoramaIdType=panoIndiv; _lr_sampling_rate=100; pbjs-unifiedid=%7B%22TDID%22%3A%22c3ba3c8e-cfce-40da-bdb2-9fb6c13fecb1%22%2C%22TDID_LOOKUP%22%3A%22TRUE%22%2C%22TDID_CREATED_AT%22%3A%222026-03-24T18%3A54%3A07%22%7D; pbjs-unifiedid_cst=YiwPLDosoA%3D%3D; r_34874064=1777058160%7C2ec4ca9dcfb0f7c6%7C1784d545619ca62c56b8fbb0ccd4446d09106df1192467204a511ede468f0d2c; _li_dcdm_c=.chosic.com; _lr_retry_request=true; __gads=ID=fba76e49928b4e7f:T=1777056841:RT=1777079565:S=ALNI_MYvaV5ewvGVZdzSSxysKr9RyiLoUw; __gpi=UID=00001364aaedc39c:T=1777056841:RT=1777079565:S=ALNI_MZEIFZcSanlNa7uGJRQk2dwwXqMUg; __eoi=ID=387765fd0d282eb6:T=1777056841:RT=1777079565:S=AA-AfjYqrJaLeIBpQADV1ZbpRIXn; _iiq_fdata=%7B%22pcid%22%3A%225b0eba80-160d-d15b-4f3a-50cd91a46d5f%22%2C%22pcidDate%22%3A1777056849061%7D; _ga=GA1.2.1255861347.1777056843; FCNEC=%5B%5B%22AKsRol9Bq7RabIm_vJqvPnc1gMifYuccKfPgAxAgEp_taUyRnZzAn9Jb7mVf9osbQ46J06o5xE47dnyt_wNwlLn2qzq5U-YtuyTeBjh2K_oAfgcbrzfhNnJ8QiuZsHscirIEYtfckBK8VvGLScmoyQDxsqlJqvUAtA%3D%3D%22%5D%5D; pbjs-unifiedid_last=Sat%2C%2025%20Apr%202026%2001%3A13%3A07%20GMT; cto_bundle=Ps3FXV9RNER1Z1FCWWFQOWtuUnVVR1gzWTFVWjJHdWlueFBWckJreG5rQ0QwSmVuV1o1S2V2UkliZW1XZ2MlMkJ4azVrMzAlMkJ0blNzbndJUURmNUZ2Wk10dTVmNlVGNWZqOVZnQSUyQiUyRmhocG5PRGN6OWxjZ08lMkJVSk85QTdMZGppRXJ3SEdsQ204UjQ1UGFHYWJDdGRyNEJRUThEMUF3JTNEJTNE; cto_bidid=5D0nh19sR2hySlB5UWQ2V2NDYnJoJTJGbXlnU0tPZiUyRlh4UjRsODEwemd6MEhCZjJmaUJvVFVSZWx2WkRuTyUyRnRRMUlnWjZkRTV5dEQ3U3ZzMEFObVpjd0FNZzloTXRETVNBZlNzM0x5VEFucDFPWGR0ayUzRA; _ga_XPLVMMQKKB=GS2.1.s1777079563$o2$g1$t1777079771$j60$l0$h0",
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