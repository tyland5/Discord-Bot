# Discord Bot ("WickedBot")
This is a smaller Discord Bot that I've made written entirely in JavaScript. It currently only utilizes the AniList API as well as the YouTube API

## Areas of Service
* Voice Chat
* AniList
* Minigames

## Voice Chat Discord Commands
* .play [song name or youtube URL]: If the sender is in a voice chat, the bot will join their call and play the desired song or media. If the bot is already playing something, it will be queued and played after the existing media

* .pause: Allows the sender to pause the song being played

* .unpause: Allows the sender to resume what is being played

* .skip: Allows the sender to skip what's currently being played

* .np or .nowplaying: Returns what is currently being played through the bot

* .songqueue: Returns what songs are queued

* .removesong: Prompts the user to select which song to remove from the queue

* .copycat: The bot waits for the sender's voice input and then plays back the decoded opus stream

A future possibility will be to have voice commands. The only problem is Google, Amazon, etc. charges for speech to text functionality


## AniList Discord Commands
* .searchchar [character name or nickname]: Returns an embed containing information about the character and a picture

* .searchani [anime name]: Returns an embed containing information about the show or movie and a picture

* .searchmanga [manga name]: Returns an embed containing information about the manga and a picture

Future plan: random anime and random manga feature. Will show a random one depending on user's genre preferences

## Minigames Discord Commands
* .rps: Play rock paper scissors with the bot

* .counting: Play a game of [21](https://en.wikipedia.org/wiki/21_(drinking_game)#:~:text=21%2C%20Bagram%2C%20or%20Twenty%20Plus,and%20starts%20the%20new%20round.) with the bot

