let SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');
const path = require('path');

const { ipcRenderer } = require("electron");

const Vibrant = require('node-vibrant');
const ColorThief = require('colorthief');

const tokensPath = ipcRenderer.sendSync('plz-path', 'onegai');
const pathAccessToken = path.join(tokensPath, 'setting/tokens.json');
const pathRefreshToken = path.join(tokensPath, 'setting/client.json');

const spotifyApi = new SpotifyWebApi({});

const tokens = JSON.parse(fs.readFileSync(pathAccessToken));
let myAccessToken = tokens.myAccessToken;
const myRefreshToken = tokens.myRefreshToken;

spotifyApi.setAccessToken(myAccessToken);
spotifyApi.setRefreshToken(myRefreshToken);


const client = JSON.parse(fs.readFileSync(pathRefreshToken));
const clientId = client.clientId;
const clientSecret = client.clientSecret;

spotifyApi.setClientId(clientId);
spotifyApi.setClientSecret(clientSecret);

async function checkDarkOrLight(url){
    const color = await ColorThief.getColor(url);
    try{
        let [r, g, b] = color;
        return (r*299+g*587+b*114)/2550
    } catch(err) {
        console.log(`i dont prepare to support for ${err}`);
        return 0
    }
}

function getColor(theme, url){
    const close = document.getElementById('closeB');
    const previous = document.getElementById('previous');
    const next = document.getElementById('next');
    const pp = document.getElementById('pp');
    Vibrant.from(url).getPalette()
        .then((palette) => {
            const [theme1, theme2] = theme;;
            let [r, g, b] = palette[theme2]._rgb;
            let [r2, g2, b2] = palette[theme1]._rgb;

            close.setAttribute("style", `color: rgb(${r2}, ${g2}, ${b2}); background: radial-gradient(circle farthest-side, rgba(${r}, ${g}, ${b},0.8), rgba(0,0,0,0) );`);
            previous.setAttribute("style", `background: linear-gradient(to left, rgba(0,0,0,0), rgba(${r2}, ${g2}, ${b2},0.8));`);
            next.setAttribute("style", `background: linear-gradient(to right, rgba(0,0,0,0), rgba(${r2}, ${g2}, ${b2},0.8));`);
            pp.setAttribute("style", `background: radial-gradient(circle farthest-side, rgba(${r2}, ${g2}, ${b2},0.8), rgba(0,0,0,0) );`);
        })
}

const setColor = async url => {
    const result = await checkDarkOrLight(url);
    if (result<50){
        const theme = ["Vibrant", "Muted"];
        getColor(theme, url)

    } else {
        const theme = ["DarkVibrant", "DarkMuted"];
        getColor(theme, url)
    }
}

async function refreshAccessToken(){
    spotifyApi.refreshAccessToken().then(
        data => {
            console.log('The access token has been refreshed!');

            myAccessToken = data.body['access_token'];
            spotifyApi.setAccessToken(myAccessToken);
            const myTokens ={
                "myAccessToken":myAccessToken,
                "myRefreshToken":myRefreshToken
            };
            let masterData = JSON.stringify(myTokens, null, ' ');
            fs.writeFileSync(pathAccessToken, masterData);
        },
        err => {
            console.log('Could not refresh access token', err);
        }
    );
}

const func4s = {
    401: () => {
        refreshAccessToken();
    }
}

// 🥬 メインの関数って感じ
exports.setJucket =  setJucket
async function setJucket() {
    const playingTrack = document.getElementById('playingTrack');
    const albumJucket = document.getElementById('jucket');
    let statusCode = 400;
    try{
        const data = await spotifyApi.getMyCurrentPlayingTrack();
        statusCode = data.statusCode;

        if (statusCode==200){
            if(data.body.item.name != playingTrack.value){
                const url = data.body.item.album.images[0].url;
                albumJucket.setAttribute("src", url);
                playingTrack.setAttribute("value", data.body.item.name);
                setColor(url);
            }

        } else {
            albumJucket.setAttribute("src", "");
            playingTrack.setAttribute("value", "no music");
        }

    } catch(e) {
        statusCode = e.statusCode
        if(func4s[statusCode] != null){
            func4s[statusCode]();
        }else{
            console.log(`i dont prepare to support for ${e}`);
        }
    }
}

exports.playXpause = async function playXpause() {
    spotifyApi.getMyCurrentPlaybackState()
    .then(function(data) {
        if (data.body && data.body.is_playing) {
            spotifyApi.pause()
            .then(function() {
                console.log('Playback paused');
            }, function(err) {
                console.log('Something went wrong!', err);
            });
        } else {
            spotifyApi.play()
            .then(function() {
                console.log('Playback started');
            }, function(err) {
                console.log('Something went wrong!', err);
            });
        }
    }, function(err) {
        console.log('Something went wrong!', err);
    });
}

exports.skipToNext = async function skipToNext() {
    spotifyApi.skipToNext()
    .then(() => {
        console.log('Skip to next');
        setJucket();
    }, err => {
        console.log('Something went wrong!', err);
    });
}

exports.skipToPrevious =
async function skipToNext(){
    spotifyApi.skipToPrevious()
    try{
        console.log('Skip to previous');
        setJucket();
    } catch (err) {
        console.log('Something went wrong!', err);
    };

}

exports.skipToBack = skipToBack

let start = Date.now() - 5000;

async function skipToBack(){
    const now = Date.now()
    console.log(now-start)
    if ((now - start)>3000){
        spotifyApi.seek(0)
        try{
            console.log('Seek to 0');
            start = now;
        } catch (err) {
            console.log('Something went wrong!', err);
        };
    } else {
        spotifyApi.skipToPrevious()
        try{
            console.log('Skip to previous');
            start = now - 5000;
        } catch (err) {
            console.log('Something went wrong!', err);
        };
    }
}