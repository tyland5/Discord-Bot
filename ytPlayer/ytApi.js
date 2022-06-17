let fs = require('fs').promises;
//var readline = require('readline');
let {google} = require('googleapis');
let OAuth2 = google.auth.OAuth2;

//var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
let TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
let TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

let OAuth = null




//used to initialize OAuth in main.js
// Load client secrets from a local file.
async function getAuthentication(){
  let authentication = new OAuth2("","","")
  try{
    let content = await fs.readFile("client_secret.json", "utf8")
    authentication = await authorize(JSON.parse(content))
    return authentication
  }
  catch{
    console.log('Error loading client secret file: ' + err);
    return null;
  }

}





//helper function now and no longer utilizes callbacks
//Create an OAuth2 client with the given credentials.
async function authorize(credentials) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  try{
    let content = await fs.readFile(TOKEN_PATH, "utf8")
    oauth2Client.credentials = JSON.parse(content);
    return oauth2Client
  }
  catch{
    getNewToken(oauth2Client); //this happens also if the token were to expire
  }
}




exports.videoLookup = videoLookup

async function videoLookup(message){
    const search = message.content.split(/\s+/).slice(1).join(" ")
    let service = google.youtube('v3');
    let arr = []
    let response = "Send the number of what you want played\n"

    //await w/ try catch is necessary here. .then removes from logical control flow and doesn't properly manipulate the stack
    //more specifically, arr and response.
    try{
        let vidList = await service.search.list({ //a promise. placed inside try in case token expires 
          auth: OAuth,
          part: ['id, snippet'],
          q: search,
          maxResults: 5,
          type: ["video"]
        })

        let videos = vidList.data.items //array of yt video response objects
        if(videos.length ===0){throw new Error("not a good lookup")}

        for(var i =0; i < videos.length; i++){
            //appending to array in JS is USUALLY O(1) as it's implemented via hashtable. ofc, not same for prepend 
            arr.push([videos[i].snippet.title, videos[i].id.videoId])
            response += i + ":  " + videos[i].snippet.title +"\n"
        }
    }
    catch (err){
        if(OAuth === null){
          OAuth = await getAuthentication() //have to get authentication first before doing anything so await
          return videoLookup(message) 
        }
      //somewhere in the future, can check if the OAuth has expired
      //"If your app is in testing mode then user tokens will expire in 7 days"
      //quota exceeds leads here as well and of course, nothing you can do
        response = "no video found"
    }
    if(arr.length != 1){message.channel.send(response)} //if user puts in a proper url, should only return one result and just automatically queue/play it
    return arr
}
