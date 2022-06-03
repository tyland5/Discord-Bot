//import { Client, Intents} from 'discord.js';
//import {searchCharacter, searchMedia} from './aniList.js'

const{Client, Intents} = require('discord.js')
const aniList = require("./aniList.js")
const fs = require("fs")
const { join } = require('node:path');
const youtube = require("../ytPlayer/ytApi.js")
const discordVoice = require("@discordjs/voice")
const ytdl = require("discord-ytdl-core");

const returnedLink = "https://www.youtube.com/watch?v=" //concatenate with videoId in json
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] })

client.once('ready', () => {
    console.log("bot ready to go")
    client.user.setPresence({activities: [{name:"with people's emotions on @channel", type:'PLAYING'}]}) //cannot set custom status according to documentation
})

client.on("messageCreate", message =>{
    if(message.content === "hello"){
        message.reply("Hello <@" + message.author + ">")   
    }

    else if(message.content.startsWith(".searchchar")){
        aniList.searchCharacter(message)
    }

    else if(message.content.startsWith(".searchani")){
        aniList.searchMedia(message, "ANIME")
    }

    else if(message.content.startsWith(".searchmanga")){
        aniList.searchMedia(message, "MANGA")
    }

    else if(message.content.startsWith(".psong")){
        const vcchannel =  message.member.voice.channel
        const connection = discordVoice.joinVoiceChannel({
            channelId: vcchannel.id,
            guildId: vcchannel.guild.id,
            adapterCreator: vcchannel.guild.voiceAdapterCreator,
        });

        const audioPlayer = new discordVoice.AudioPlayer()
        let audio = ytdl(`https://www.youtube.com/watch?v=ToRiflECtU8`,{
            filter: "audioonly",
            fmt: "mp3"
        })

        const resource = discordVoice.createAudioResource(audio)
        connection.subscribe(audioPlayer)
        audioPlayer.play(resource)
        console.log("reaches here")
    }

    else if(message.content.startsWith(".play")){
        async function func(){
            if(message.member.voice.channel != null){
            let vidList = await youtube.videoLookup(message)

            if(vidList.length != 0){
                const filter = m => m.author.id === message.author.id
                try{
                    const userMsg = await message.channel.awaitMessages({filter, max:1, time: 8000, errors:['time']})
                    const choice = parseInt(userMsg.first())

                    //The first language i have ever seen to not have an index out of bounds error?
                    if(isNaN(choice) || choice < 0 || choice >= vidList.length){throw new Error("Bad Input")}
                    
                    const vidId = vidList[choice]
        
                    const vcchannel = message.member.voice.channel
                    //in case the user were to leave before submitting choice
                    if(vcchannel != null){
                        const connection = discordVoice.joinVoiceChannel({
                            channelId: vcchannel.id,
                            guildId: vcchannel.guild.id,
                            adapterCreator: vcchannel.guild.voiceAdapterCreator,
                        });
                        const audioPlayer = new discordVoice.AudioPlayer()
                        
                        //libsodium-wrappers package had to be installed as well as opusscript for opus encoded
                        //fmpeg
                        let audio = ytdl(`${returnedLink}${vidId}`,{
                            filter: "audioonly",
                            fmt: "mp3"
                        })

                        const resource = discordVoice.createAudioResource(audio)

                        connection.subscribe(audioPlayer) //this is what makes the bot join the vc
                        audioPlayer.play(resource)
                        message.channel.send(`Now Playing: ${returnedLink}${vidId}`)
                    }
                    else{
                        message.channel.send("Please join a vc first")
                    }
                }
                catch(err){
                    message.channel.send("Process ended. Incorrect Input or Time Out")
                    //console.log(err)
                }
            }
            }
            else{message.channel.send("Please join a vc first")}
        }
        func()
    }

})

 client.login() //dont catch, just let it die
