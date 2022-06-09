const{SongQueue} = require("./songQueue.js")
const discordVoice = require("@discordjs/voice")
const ytdl = require("discord-ytdl-core");

const returnedLink = "https://www.youtube.com/watch?v="

let queueByGuild = new Map()
let currentSong = new Map()

exports.addSong = function(guildID, songTuple){
    const [songName, songURL] = songTuple
    if(queueByGuild.has(guildID)){
        const queue = queueByGuild.get(guildID)
        queue.queue(songName, songURL)
    }
    else{
        queueByGuild.set(guildID, new SongQueue())
        queueByGuild.get(guildID).queue(songName, songURL)
    }
}

function removeSong(guildId){
    if(queueByGuild.has(guildId)){
       return queueByGuild.get(guildId).dequeue()
    }
}

exports.getQueue = function(guildID){
    try{
        return queueByGuild.get(guildID).getQueue()
    }
    catch{
        return null
    }
}


exports.getCurrentSong = function(guildID){
    if(currentSong.get(guildID)===undefined){
        return null
    }
    else{
        return currentSong.get(guildID)
    }
}

exports.getNextSong = function(guildID){
    let head = queueByGuild.get(guildID).getQueue()
    return head
}


//will eventually need to change since there may be resources still being used in the background from the previous audioPlayers
//can just make another map but ill think it over
exports.play = function(vcchannel, vidURL){

    const connection = discordVoice.joinVoiceChannel({
        channelId: vcchannel.id,
        guildId: vcchannel.guild.id,
        adapterCreator: vcchannel.guild.voiceAdapterCreator,
    });
    const audioPlayer = new discordVoice.AudioPlayer()


    //not one of my proudest moments but should suffice for now
    if(vidURL === null){
        currentSong.set(vcchannel.guild.id, null)
        connection.subscribe(audioPlayer)
        return
    }

    
    //libsodium-wrappers package had to be installed as well as opusscript for opus encoded
    //fmpeg
    let audio = ytdl(`${returnedLink}${vidURL}`,{
        filter: "audioonly",
        fmt: "mp3"
    })

    const resource = discordVoice.createAudioResource(audio)

    connection.subscribe(audioPlayer) //this is what makes the bot join the vc
    audioPlayer.play(resource)
    let currentlyPlaying = removeSong(vcchannel.guild.id).songName
    currentSong.set(vcchannel.guild.id, currentlyPlaying)
}


