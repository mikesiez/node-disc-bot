let obj = {
    le : {
        name: "aksda",
        desc: "sadlask"
    },
    li : {
        name: "les",
        desc: "as"
    }
}

let commands = [];
for ({name, desc} of Object.values(obj)){
    commands.push( {name, desc} );
}

console.log(commands);