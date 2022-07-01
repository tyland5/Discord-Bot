//import {MessageEmbed} from 'discord.js';
const{MessageEmbed} = require('discord.js')

const aniListApi = "https://graphql.anilist.co"

//Post to aniListApi
async function aniRequest(variables, query){
    let options = {
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
        if(!response.ok){throw new Error("Not valid lookup")}
        let json = await response.json()
        return json
    }
    catch{
        return null
    }
}


//Sends back discord embed of character information
exports.searchCharacter = async function(message){
    let variables = {
        charName: message.content.split(/\s+/).slice(1).join(" ")
    };

    let query = `
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
        const description = character.description.split("~!")[0].trim() //get rid of spoilers
        const img = character.image.large

        //Note: order of sets has no effect on order of embed
        const embed = new MessageEmbed()
        .setTitle(fullName)
        .setImage(img)
        .setDescription(description)
        .setFooter({text:"Based on AniList"})
        .setColor('DARK_RED')
        

        message.channel.send({embeds:[embed]})//embeds only real property, array of embed
    }
    else{
        message.reply("Please enter a valid character")
    }
}


//Sends discord embed of Anime or Manga information
exports.searchMedia= async function(message, type){
    let variables ={
        aniName: message.content.split(/\s+/).slice(1).join(" "),
        type: type //string can be casted to MediaType
    };

    let query = `
    query($aniName: String, $type: MediaType){
        Media(search: $aniName, type: $type){ #according to API, this is fine
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
           averageScore
           coverImage{
               large
           }
        }
    }
    `;

    let json = await aniRequest(variables, query)

    //originally had it as if statement, but "failed" lookups would have a malformed object
    sendAniEmbed(message, json, type)
}

exports.giveRandomAni = async function(message, type){
    let genre = message.content.split(/\s+/).slice(1).join(" ")

    let variables = {
        genre : genre,
        type: type
    }

    let query = `
    query($genre: String, $type: String){
        Media(genre: $genre, type: $type){
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
            averageScore
            coverImage{
                large
            }
        }
    }
    `

    let json = await aniRequest(variables, query)
    //sendAniEmbed(message,json, type)
    console.log(json)
}

//"Helper function". Avoid repeat
function sendAniEmbed(message, json, type){
    try{ 
        const anime = json.data.Media //really anime or manga
        const title = anime.title.english
        const description = anime.description
        const startDate = `${anime.startDate.month}/${anime.startDate.day}/${anime.startDate.year}`
        const endDate = anime.endDate.month != null ? `${anime.endDate.month}/${anime.endDate.day}/${anime.endDate.year}`: "Present"
        const score = anime.averageScore
        const img = anime.coverImage.large
       
        const embed = new MessageEmbed()
        .setTitle(`${title} (${type.toLowerCase()})`)
        .setDescription(description)
        .addField("Run Date (MM/DD/YYYY)",startDate + " - " + endDate, true)
        .addField("Rating", score +"/100", true)
        .setImage(img)
        .setFooter({text:"Based on AniList"})
        .setColor('DARK_RED')  
        
        message.channel.send({embeds:[embed]})
    }
    catch (err){
        message.reply("Please enter a valid anime name")
        console.log(err)
    }
}

