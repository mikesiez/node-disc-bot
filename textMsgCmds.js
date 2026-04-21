module.exports = {
    wise : {
        name: "wise",
        do : async function(msg){
            let wiseMessage;
            await fetch("https://corporatebs-generator.sameerkumar.website/")
            .then(response => {
                return response.json();
            })
            .then(data => {
                wiseMessage = data.phrase;
            })
            .catch((err)=>wiseMessage = "err: "+err)

            await msg.reply(`${wiseMessage}`);
        }

    }
}