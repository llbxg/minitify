let SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');
const path = require('path');

const { ipcRenderer } = require("electron");

const tokensPath = ipcRenderer.sendSync('plz-path', 'onegai');
const pathAccessToken = path.join(tokensPath, 'setting/tokens.json');
const pathRefreshToken = path.join(tokensPath, 'setting/client.json');

const spotifyApi = new SpotifyWebApi({});

let tokens = JSON.parse(fs.readFileSync(pathAccessToken));
let myAccessToken = tokens.myAccessToken;
const myRefreshToken = tokens.myRefreshToken;

spotifyApi.setAccessToken(myAccessToken);
spotifyApi.setRefreshToken(myRefreshToken);


const client = JSON.parse(fs.readFileSync(pathRefreshToken));
const clientId = client.clientId;
const clientSecret = client.clientSecret;

spotifyApi.setClientId(clientId);
spotifyApi.setClientSecret(clientSecret);


let favorite = null

function checkSavedTracks(id){
    const heart = document.getElementById('heart');
    if (id != null){
        spotifyApi.containsMySavedTracks([id])
        .then(function(data) {
            const trackIsInYourMusic = data.body[0];
            if (trackIsInYourMusic) {
                heart.setAttribute("style", "fill: red;");
                console.log('Track was found in the user\'s Your Music library');
                favorite = true
            } else {
                heart.setAttribute("style", "fill: var(--color-heart);");
                console.log('Track was not found.');
                favorite = false
            }
        }, function(err) {
            console.log('Something went wrong!', err);
        });
    } else {
        heart.setAttribute("style", "fill: var(--color-heart);");
    }
}

exports.addOrRemove = addOrRemove
function addOrRemove(){
    if(id != null){
        const heart = document.getElementById('heart');
        if(favorite){
            removeFromSaved(id)
            console.log("remove!!!")
            favorite = false
            heart.setAttribute("style", "fill: var(--color-heart);");
        } else {
            addToSaved(id)
            console.log("add")
            favorite = true
            heart.setAttribute("style", "fill: red;");
        }
    }
}

async function addToSaved(id){
    spotifyApi.addToMySavedTracks([id])
    .then(function(data) {
        console.log('Added track!');
    }, function(err) {
        console.log('Something went wrong!', err);
    });
}

async function removeFromSaved(id){
    spotifyApi.removeFromMySavedTracks([id])
    .then(function(data) {
        console.log('Removed!');
    }, function(err) {
        console.log('Something went wrong!', err);
    });
};


/* ---------- 🥬 communication ---------- */

let [name, id, artists] = [null, null, null];

exports.checkFromControllerToMain = checkFromControllerToMain
function checkFromControllerToMain(){
    ipcRenderer.send("fromControllerToMain", id);
}

exports.getfromMainToController = getfromMainToController
function getfromMainToController(){
    ipcRenderer.on("fromMainToController", (event, args) => {
        if(args.length == 3 ){
            [name, id, artists] = args;
            const trackName = document.getElementById('trackName');
            const artistsName = document.getElementById('artistsName');
            if (id != null){
                trackName.textContent = name;
                artistsName.textContent = artists;
            } else {
                trackName.textContent = '';
                artistsName.textContent = '';
            }
            checkSavedTracks(id);

        } else if (args.length == 1){
            if(args){
                console.log('The access token has been refreshed!');
                tokens = JSON.parse(fs.readFileSync(pathAccessToken));
                myAccessToken = tokens.myAccessToken;
                spotifyApi.setAccessToken(myAccessToken);
            }
        }
    });
}