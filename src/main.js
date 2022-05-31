//import DiscordJs, { Channel, Client, Message, MessageManager } from 'discord.js'
//import 'dotenv'

import { Client, Intents } from 'discord.js';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

const aniListApi = "https://graphql.anilist.co"

client.once('ready', () => console.log("bot ready to go"))

client.on("messageCreate", message =>{
    if(message.content === "hello"){
        message.reply("Hello <@" + message.author + ">")//technically a promise but should work all the time
        .catch(() => {}); 
    }

    if(message.content.startsWith("searchchar")){
        async function func(){
            var variables = {
                charName: message.content.split(/\s+/).slice(1).join(" ")
            };
            
            var query = `
            query($charName: String){
                Character(search: $charName){
                    name{
                        first
                        last
                    }
                    image{
                        large
                    }
                    description
                    favourites
                }
            }
            `;

            let json = await aniRequest(variables, query)
            if(json != null){
                const character = json.data.Character
                const fullName = character.name.first + " " + character.name.last
                const description = character.description.split("~!")[0].trim()
                const img = character.image.large
                message.reply(fullName + "\n\n" + description + "\n\n" + img)
            }
            else{
                message.reply("Please enter a valid character")
            }
        }
        func()
    }

    if(message.content.startsWith("searchani")){
        async function func(){
            var variables ={
                aniName: message.content.split(/\s+/).slice(1).join(" ")
            };

            var query = `
            query($aniName: String){
                Media(search: $aniName, type: ANIME){ #according to API, this is fine
                   title{
                       english
                       romaji
                       native
                   }
                   startDate{
                    month  
                    day 
                    year
                   }
                   endDate{
                    month  
                    day 
                    year
                   }
                   description
                   meanScore
                }
            }
            `;

            let json = await aniRequest(variables, query)
            if(json != null){
                const anime = json.data.Media
                const title = anime.title.english
                const description = anime.description
                const startDate = anime.startDate.year
                const endDate = anime.endDate.year != null ? anime.endDate.year : "Present"
                const score = anime.meanScore
                message.reply(title + "\n\n" + description + "\n\n" + startDate + " - " + endDate + "\n\n" + score)
            }
            else{
                message.reply("Please enter a valid anime name")
            }
        }
        func()
    }

})


async function aniRequest(variables, query){
        var options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json', //return json instead of XML
            },
            body: JSON.stringify({
                query: query,
                variables: variables
            })
        };

        /*
        fetch(aniListApi, options) //promise
        .then(response =>{
            console.log("request worked");
            console.log(response.status);
            return response.json()
        })
        .then(json =>{
            console.log(json.data)
        })
        .catch( err => console.log(err))
    }   
    */

    try{
        let response = await fetch(aniListApi,options)
        console.log(response.status)
        if(!response.ok){throw new Error("Not valid lookup")}
        let json = await response.json()
        return json
    }catch{
        return null
    }
}

 client.login() //dont catch, just let it die

