

exports.countingGame = async function(message){
    const filter = m => m.author.id === message.author.id
    const firstUp = Math.floor(Math.random()*2) //This decides who goes first
    let turn = firstUp
    let count = 0

    //bot is first
    if(firstUp === 0){ 
        const botChoice = Math.floor(Math.random()*3 + 1) //1-3
        message.channel.send(`Game to 21. I'll start first\nI choose ${botChoice}\nNow you pick 1, 2, or 3`)
        turn += 1
        count += botChoice
    }
    //user is first
    else{
        message.channel.send(`Game to 21. You're up first.\nChoose 1, 2, or 3`)
        try{
            let userChoice = await message.channel.awaitMessages({filter, max:1, time: 12000, errors:['time']})
            userChoice = parseInt(userChoice.first())
            if(isNaN(userChoice) || userChoice < 0 || userChoice >3){throw new Error("Bad response")}
            count += userChoice
            turn +=1
            
            message.channel.send(`The game's count is now ${count}`)
        }
        catch{
            message.channel.send("Time out or invalid response received. Game has ended")
            return
        }
    }

    while(count < 21){
        //bot's turn
        if(turn % 2 === 0){
            if(count === 14 || count === 15 || count === 16){ //clever bot >:)
                const botChoice = 17 - count
                count = 17
                turn +=1
                message.channel.send(`I chose ${botChoice}. The game count is now ${count}\nYour turn`)
            }
            else if(21 - count > 3){
                const botChoice = Math.floor(Math.random()*3 +1)
                count += botChoice
                turn += 1
                message.channel.send(`I chose ${botChoice}. The game count is now ${count}\nYour turn`)
            }
            else{
                const botChoice = 21 - count
                count = 21
                message.channel.send(`I chose ${botChoice} The game count is now 21\nTry not to take an L next time :)`)
                return
            }
        }
        else{
            try{
                let userChoice = await message.channel.awaitMessages({filter, max:1, time: 12000, errors:['time']})
                userChoice = parseInt(userChoice.first())
                if(isNaN(userChoice) || userChoice < 0 || userChoice >3){throw new Error("Bad response")}
                count += userChoice
                turn += 1
                
                if(count === 21){
                    message.channel.send(`The game's count is now ${count}\nCongrats! You Won! (For now)`)
                    return
                }
                else{
                    message.channel.send(`The count after your turn is ${count}`)
                }
            }
            catch{
                message.channel.send("Time out or invalid response received. Game has ended")
                return
            }
        }
    }
    message.channel.send("Do you even know how to do simple arithmetic?!! This game is done")
} 

exports.rps = async function(message){
    const filter = m => m.author.id === message.author.id

    message.channel.send("Rock, paper, scissors, shoot!")

    let userChoice = await message.channel.awaitMessages({filter, max:1, time: 12000, errors:['time']})
    userChoice = userChoice.first().toString()
    if(userChoice.toLowerCase() === "rock"){
        userChoice = 1
    }
    else if(userChoice.toLowerCase() === "scissors"){
        userChoice = 2
    }
    else if(userChoice.toLowerCase() === "paper"){
        userChoice = 3
    }
    else{
        message.channel.send(`${userChoice} is not even an option! I win`)
        return
    }

    const botChoice = Math.floor(Math.random() *3 + 1) //1-3

    if(userChoice === 1 && botChoice === 2 || userChoice === 2 && botChoice === 3 || userChoice === 3 && botChoice === 1){
        message.channel.send("You won!")
    }
    else if(userChoice === botChoice){
        message.channel.send("We tied")
    }
    else{
        message.channel.send("You lose")
    }
}
