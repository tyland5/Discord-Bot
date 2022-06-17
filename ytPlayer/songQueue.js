

exports.SongQueue = class{   
    //SongQueue will utlize a Singly Linked List

    #createSLLNode(songName, songURL, next ){
        return{
            songName,
            songURL,
            next
        }
    }


    #head
    #tail
    #size = 0

    queue(songName, songURL){
        if(this.#size === 0){
            this.#head = this.#createSLLNode(songName, songURL, null)
            this.#tail = this.#head
            this.#size += 1
        }
        else{
            this.#tail.next = this.#createSLLNode(songName, songURL, null)
            this.#tail= this.#tail.next
            this.#size += 1
        }
    }
    
    dequeue(){
        const nextSong = this.#head
        this.#head = this.#head.next
        this.#size -= 1
        return nextSong
    }

    remove(index){
        if(index < this.#size){
            if(index === 0){
                const removed = this.#head
                this.#head = this.#head.next
                this.#size -= 1
                return removed
            }

            let counter = 0
            let rover = this.#head 
            
            while(counter < index - 1){
                rover = rover.next
                counter += 1
            }

            const removed = rover.next
            rover.next = rover.next.next
            this.#size -=1 
            if(rover.next === null){ //this means we just removed the tail
                this.#tail = rover
            }
            return removed
        }
        else{
            throw new Error("This should never happen")
        }
    }

    getHead() {return this.#head}

    getSize(){return this.#size}

    print(){
        let rover = this.#head
        while(rover != null){
            console.log(rover.songName)
            rover = rover.next
        }
    }
}

/*
let test = new SongQueue()

i = 1

while(i <= 10){
    test.queue(i, null)
    i +=1
}

test.remove(9)
test.remove(5)
test.queue(12)
test.print()

console.log("Swtiching to second part")

i=1
while(i <= 9){
    test.dequeue()
    i +=1
}

test.print()

test.queue(80, 3)
test.print()
console.log(test.getSize())
*/