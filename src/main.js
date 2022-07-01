//import { Client, Intents} from 'discord.js';
//import {searchCharacter, searchMedia} from './aniList.js'

const{Client, Intents} = require('discord.js')
const aniList = require("../aniList/aniList.js")
const { join } = require('node:path');
const youtube = require("../ytPlayer/ytApi.js")
const discordVoice = require("@discordjs/voice")
const ytdl = require("discord-ytdl-core");
const minigames = require("../minigames/minigames.js")
const musicPlayer = require("../ytPlayer/mediaPlayer.js")

const returnedLink = "https://www.youtube.com/watch?v=" //concatenate with videoId in json
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] })

client.once('ready', () => {
    console.log("bot ready to go")
    client.user.setPresence({activities: [{name:"with people's emotions on @channel", type:'PLAYING'}]}) //cannot set custom status according to documentation
})

client.on("messageCreate", message =>{

    //ALL ANILIST COMMANDS
    if(message.content.startsWith(".searchchar")){
        aniList.searchCharacter(message)
    }

    else if(message.content.startsWith(".searchani")){
        aniList.searchMedia(message, "ANIME")
    }

    else if(message.content.startsWith(".searchmanga")){
        aniList.searchMedia(message, "MANGA")
    }

    else if(message.content.startsWith(".randomani")){
        aniList.giveRandomAni(message, "ANIME")
    }

    //ALL MINIGAME COMMANDS
    else if(message.content.startsWith(".counting")){
        minigames.countingGame(message)
    }

    else if(message.content.startsWith(".rps")){
        minigames.rps(message)
    }


    //ALL YTPLAYER COMMANDS
    else if(message.content.startsWith(".songqueue")){
        let rover = musicPlayer.getNextSong(message.guild.id)
        if(rover === null){
            message.channel.send("There's no songs in the queue")
        }
        else{
            let response = "Songs in the Queue are:\n"
            let counter = 0
            while(rover != null){
                response += `${counter}:  ${rover.songName}\n`
                rover = rover.next
                counter ++
            }
            message.channel.send(response)
        }
    }

    else if(message.content.startsWith(".np") || message.content.startsWith(".nowplaying")){
        let currentSong = musicPlayer.getCurrentSong(message.guild.id)

        if(currentSong === null){
            message.channel.send("There are no songs playing")
        }
        else{
            message.channel.send(`${currentSong} is currently playing`)
        }
    }

    else if(message.content.startsWith(".skip")){
        musicPlayer.skip(message)
    }

    else if(message.content.startsWith(".removesong")){
        let queueSize = musicPlayer.getQueueSize(message.guild.id)
        if(queueSize != 0){
            musicPlayer.remove(message)
        }
        else{
            message.channel.send("There is no song in the queue to remove")
        }
    }

    else if (message.content.startsWith(".pause")){
        musicPlayer.pause(message)
    }

    else if (message.content.startsWith(".unpause")){
        musicPlayer.unpause(message)
        message.channel.send("The current song will resume")
    }

    else if(message.content.startsWith(".play")){
        async function func(){
            if(message.member.voice.channel != null){
            let vidList = await youtube.videoLookup(message) //array of tuples

            if(vidList.length != 0){
                const filter = m => m.author.id === message.author.id
                try{
                    let songTuple = vidList[0] //This will be chosen if a "proper" url is used. Only 1 result
                    
                    if(vidList.length > 1){
                        const userMsg = await message.channel.awaitMessages({filter, max:1, time: 8000, errors:['time']})
                        const choice = parseInt(userMsg.first())

                        //The first language i have ever seen to not have an index out of bounds error?
                        if(isNaN(choice) || choice < 0 || choice >= vidList.length){throw new Error("Bad Input")}
                        songTuple = vidList[choice] 
                    }
                    
                    const vcchannel = message.member.voice.channel

                    //in case the user were to leave before submitting choice
                    if(vcchannel != null){
                        if(musicPlayer.getNextSong(message.guild.id) === null && musicPlayer.getCurrentSong(message.guild.id) === null){
                            message.channel.send(`Now Playing: ${returnedLink}${songTuple[1]}`)
                            musicPlayer.addSong(message.guild.id, songTuple)
                            musicPlayer.play(vcchannel, songTuple[1])
                        }
                        else{
                            musicPlayer.addSong(message.guild.id, songTuple)
                            message.channel.send(`${songTuple[0]} was added to the music queue`)
                        }
                    }
                    else{
                        message.channel.send("Please join a vc first")
                    }
                }
                catch(err){
                    message.channel.send("Process ended. Incorrect Input or Time Out")
                }
            }
            }
            else{message.channel.send("Please join a vc first")}
        }
        func()
    }

    //ALL VOICE COMMANDS 
    else if(message.content.startsWith(".copycat")){
        musicPlayer.listen(message)
    }

})

 client.login()
