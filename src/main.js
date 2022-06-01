import { Client, Intents} from 'discord.js';
import {searchCharacter, searchMedia} from './aniList.js'

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

client.once('ready', () => {
    console.log("bot ready to go")
    client.user.setPresence({activities: [{name:"with people's emotions on @channel", type:'PLAYING'}]}) //cannot set custom status according to documentation
})

client.on("messageCreate", message =>{
    if(message.content === "hello"){
        message.reply("Hello <@" + message.author + ">")//technically a promise but should work all the time
        .catch(() => {}); 
    }

    else if(message.content.startsWith("searchchar")){
        searchCharacter(message)
    }

    else if(message.content.startsWith("searchani")){
        searchMedia(message, "ANIME")
    }

    else if(message.content.startsWith("searchmanga")){
        searchMedia(message, "MANGA")
    }

})

 client.login() //dont catch, just let it die
