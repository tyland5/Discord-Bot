const{SongQueue} = require("./songQueue.js")
const discordVoice = require("@discordjs/voice")
const ytdl = require("discord-ytdl-core");
const fs = require("fs");
const { pipeline } = require("stream");
const { off } = require("process");
const { on } = require("events");
const prism = require("prism-media")

const returnedLink = "https://www.youtube.com/watch?v="

let queueByGuild = new Map()
let currentSong = new Map()
let audioByGuild = new Map() //key value to tuple consisting of connection and audioplayer


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

function dequeue(guildId){
    if(queueByGuild.has(guildId)){
       return queueByGuild.get(guildId).dequeue()
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
    if(queueByGuild.get(guildID) != undefined){
        return queueByGuild.get(guildID).getHead()
    }
    return null
}


exports.getQueueSize = function(guildID){
    if(queueByGuild.get(guildID) != undefined){
        return queueByGuild.get(guildID).getSize()
    }
     return 0
}


exports.remove = function(message){
    const msg = message.content.split(/\s+/).slice(1).join(" ")
    const choice = parseInt(msg) //Number() turned into a 0
    const queue = queueByGuild.get(message.guild.id)
    if(isNaN(choice) || choice < 0 || choice >= queue.getSize()){
        message.channel.send("A wrong input has been made")
    }
    else{
        const removedSong = queue.remove(choice)
        message.channel.send(`${removedSong.songName} has been removed from the queue!`)
    }
}


exports.skip = function(message){
    const vcchannel = message.member.voice.channel
    const guildID = message.channel.guild.id
    
    if(vcchannel != null){
        let nextSong = queueByGuild.get(guildID).getHead()
        if(nextSong ===null){
            p(vcchannel, null)
        }
        else{
            p(vcchannel, nextSong.songURL)
        }
    }
    else{
        message.channel.send("You must be in a vc")
    }
}

exports.pause = function(message){
    const guildID = message.guild.id
    if(currentSong.has(guildID) && currentSong.get(guildID) != null){
        const [connection, audioplayer] = audioByGuild.get(guildID)
        audioplayer.pause()
        message.channel.send("The current song has been paused")
    }
}

exports.unpause = function(guildID){
    const [connection, audioplayer] = audioByGuild.get(guildID)
    audioplayer.unpause()
}

exports.play = p


exports.listen = async function (message){
    const vcchannel = message.member.voice.channel

    if(vcchannel === null){
        message.reply("Please join a voice channel first")
        return
    }
    if(audioByGuild.has(vcchannel.guild.id)){
        message.reply("The bot is currently busy playing audio")
        return
    }
    const connection = discordVoice.joinVoiceChannel({
        channelId: vcchannel.id,
        guildId: vcchannel.guild.id,
        adapterCreator: vcchannel.guild.voiceAdapterCreator,
        selfDeaf: false
    });

    try{
        await discordVoice.entersState(connection, discordVoice.VoiceConnectionStatus.Ready, 20e3);
        const receiver = connection.receiver
        
        //duration specifies how long the silence can be. creates readable stream of OPUS packets (encoded)
        const opusStream = receiver.subscribe(message.member.id, {end:{behavior:discordVoice.EndBehaviorType.AfterSilence, duration: 1000}}) 
        const output = fs.createWriteStream('testing.pcm')
        //const output2 = fs.createWriteStream('testing2.opus')
        //with help of: https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Audio_concepts
        
        //google cloud speech to text seems to support pcm so we'll just leave it to converting to pcm
        const opusDecoder = new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 }) 
        
        /*
        const oggStream = new prism.opus.OggLogicalBitstream({
            opusHead: new prism.opus.OpusHead({
                channelCount: 2,
                sampleRate: 48000,
            }),
            pageSizeControl: {
                maxPackets: 10,
            },
        });
        */
        
        opusStream.on("data", (chunk)=>{
            opusDecoder.write(chunk)
        })

        opusStream.on("end",()=>{
            console.log("this is done")

            const audioPlayer = new discordVoice.AudioPlayer()
            const resource = discordVoice.createAudioResource(opusDecoder) //creates resource out of readable 
            connection.subscribe(audioPlayer)
            audioPlayer.play(resource) //copy cat

            audioPlayer.on(discordVoice.AudioPlayerStatus.Idle, ()=>{
                audioPlayer.stop()
                connection.destroy()
            })

            opusDecoder.pipe(output) //will change to pipeline later on for google api
        })
        

        
    }
    catch (err){
        console.log(err)
    }
}


function p(vcchannel, vidURL){

    //i would have to delete map key value when disconnecting bot
    if(audioByGuild.has(vcchannel.guild.id)){
        const [connection, audioPlayer] = audioByGuild.get(vcchannel.guild.id)

        
        if(vidURL === null){
            currentSong.set(vcchannel.guild.id, null)
            audioPlayer.stop() //for garbage collection
            return
        }
        

        let audio = ytdl(`${returnedLink}${vidURL}`,{
            filter: "audioonly",
            fmt: "mp3"
        })

        const resource = discordVoice.createAudioResource(audio)

        audioPlayer.play(resource)
        let currentlyPlaying = dequeue(vcchannel.guild.id).songName
        currentSong.set(vcchannel.guild.id, currentlyPlaying)
    }

    else{
        const connection = discordVoice.joinVoiceChannel({
            channelId: vcchannel.id,
            guildId: vcchannel.guild.id,
            adapterCreator: vcchannel.guild.voiceAdapterCreator,
        });
        const audioPlayer = new discordVoice.AudioPlayer()
    
        
        //libsodium-wrappers package had to be installed as well as opusscript for opus encoded
        //fmpeg
        let audio = ytdl(`${returnedLink}${vidURL}`,{
            filter: "audioonly",
            fmt: "mp3"
        })
    
        const resource = discordVoice.createAudioResource(audio)
    
        connection.subscribe(audioPlayer) 
        audioPlayer.play(resource)

        audioPlayer.on(discordVoice.AudioPlayerStatus.Idle,() =>{
            if(queueByGuild.get(vcchannel.guild.id).getHead() === null){ //if next song is null
                connection.destroy()
                audioByGuild.delete(vcchannel.guild.id)
                return
            }
        })

        let currentlyPlaying = dequeue(vcchannel.guild.id).songName
        currentSong.set(vcchannel.guild.id, currentlyPlaying)

        audioByGuild.set(vcchannel.guild.id, [connection, audioPlayer])
    }
}


