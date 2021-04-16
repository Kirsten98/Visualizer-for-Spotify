'use strict'
class SpotifyControls {
    // static clientId = client_id
    static redirectUri = 'http://localhost:8000';

    static #accessToken = '';
    static #deviceID = '';

    constructor() {

    }

    static setAccessToken(newAccessToken) {
        this.#accessToken = newAccessToken;
    }

    static get deviceID() {
        return this.#deviceID;
    }

    static setDeviceID(newDeviceID) {
        this.#deviceID = newDeviceID;
    }

    static get accessToken() {
        return this.#accessToken;
    }


    static clearAccessToken() {
        this.#accessToken = '';
    }

}

var currentSong;  
var currentArtist;   

var currentBeatsStarts = {};
var previousBeatCon1 = 10
var previousBeatCon2 = 10;

var trackDurationMS;
//Tracks current position in song
var trackTimer;
var songTimerInterval;

//Middle Bar
var bar1Interval;
var bar1SubTimeout
//Bars 2 & 4
var bar2Interval;
var bar2SubTimeout
// Bars 1 & 5
var bar3Interval;
var bar3SubTimeout;

var currentBeat = 0;   
var beats;

function sdkSetUp() {
    console.log("STARTED!");
    window.Spotify = Spotify;
    window.isInitialized = true;
    const token = SpotifyControls.accessToken;
    window.Spotify.Player =  new window.Spotify.Player({
        name: 'Visualizer for Spotify',
        getOAuthToken: cb => { cb(token)},
        volume: 0.5
      });

      window.Spotify.Player.addListener('initialization_error', ({ message }) => { console.error(message); });
      window.Spotify.Player.addListener('authentication_error', ({ message }) => { console.error(message); });
      window.Spotify.Player.addListener('account_error', ({ message }) => { console.error(message); });
      window.Spotify.Player.addListener('playback_error', ({ message }) => { console.error(message); });
      
      // Playback status updates
      window.Spotify.Player.addListener('player_state_changed', state => {
            console.log(state); 
            if(state) {
                trackTimer = state.position;
                if(state.paused) {
                    pause(true);
                } else {
                    play(true);
                }

                let song = state.track_window.current_track.name;
                let artists = '';

                if( song !== getCurrentSong()) {
                    trackDurationMS = state.duration;
                    let artistList = state.track_window.current_track.artists;
                    for (let artist = 0; artist < artistList.length ; artist++) {
                        let name = artistList[artist].name;
                        if(artist === 0) {
                            artists = name;
                        } else {
                            artists += ", " + name;
                        }
                    }
                    updateArtist(artists);
                    updateSong(song);
                }
            }
           
        });
    
      // Ready
      window.Spotify.Player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        SpotifyControls.setDeviceID(device_id);

        var httpRequest = new XMLHttpRequest();
        httpRequest.open('PUT', 'https://api.spotify.com/v1/me/player', true);                                                                                                                                                                                                   
        httpRequest.setRequestHeader('Authorization', "Bearer " + SpotifyControls.accessToken);
        httpRequest.send(JSON.stringify({
            "device_ids":[
                device_id
            ],
            "play":"false"
         }));

      });
    
      // Not Ready
      window.Spotify.Player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });
    
    // Connect to the player;
    window.Spotify.Player.connect().then(success => {
        if (success) {
            console.log('The Web Playback SDK successfully connected to Spotify!');
        }
    });    
}

function login() {
    var scopes = 'user-read-private user-read-email streaming user-modify-playback-state user-read-playback-state user-read-currently-playing';
    var originalWindow = window;
    // TODO add State to request
    var authWindow = window.open('https://accounts.spotify.com/authorize' +
    '?response_type=token&show_dialog=true' +
    '&client_id=' + client_id +
    '&scope=' + encodeURIComponent(scopes) +
    '&redirect_uri=' + encodeURIComponent(SpotifyControls.redirectUri), "AuthWindow", "width=600,height=600");

    var loginInterval = setInterval(() => {
            var response = authorizationResponseCheck(authWindow.location.href)
            if(response){
                clearInterval(loginInterval);
                authWindow.close();
                originalWindow.focus();
                SpotifyControls.setAccessToken(response);  
                // updateLoginButton(true); 
                if(!originalWindow.isInitialized) {
                    sdkSetUp();
                }
                
            }
    },3000);
}

function clear() {
    pause();
    SpotifyControls.clearAccessToken();
    updateLoginButton(false);
}

function updateLoginButton(isSignedIn){
    if(isSignedIn) {
         document.getElementById("login").onclick = clear();
         document.getElementById("login").innerText = "Sign Out";
    
    } else {
        document.getElementById("login").onclick = login();
         document.getElementById("login").innerText = "Login";
    }
}

function authorizationResponseCheck(url) {
    let urlData =  url.toString().split("#")[1];
    
    if(urlData){
        let urlParameters = urlData.split("&");
        
        for(let paramter = 0; paramter < urlParameters.length; paramter++) {
            let splitParam = urlParameters[paramter].split("=");
            if(splitParam[0] === "error") {
                throw splitParam[1];
            } else if(splitParam[0] === "access_token"){
                return splitParam[1];
            }
        }
    }
    return false;
}    

function updateSong(song) {
    window.document.getElementById('song').innerText = song;
    setCurrentSong(song);
}

function updateArtist(artist) {
    window.document.getElementById('artist').innerText = artist;
    setCurrentArtist(artist);
}


function getNextSong() {
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('POST', 'https://api.spotify.com/v1/me/player/next?device_id=' + SpotifyControls.deviceID, true);
    httpRequest.setRequestHeader('Authorization', "Bearer " + SpotifyControls.accessToken);
    httpRequest.send();
}

function togglePlay() {
    if(window.document.getElementById('pausePlayIcon').className === "far fa-play-circle fa-3x") {
        play();
    } else {
        pause();
    }
}

function play(isPlaying) {
    window.document.getElementById('pausePlayIcon').className = "far fa-pause-circle fa-3x";

    if(!isPlaying) {
        var httpRequest = new XMLHttpRequest();

        httpRequest.open('PUT', 'https://api.spotify.com/v1/me/player/play?device_id=' + SpotifyControls.deviceID, true);

        httpRequest.setRequestHeader('Authorization', "Bearer " + SpotifyControls.accessToken);
        httpRequest.send();
    }

    if (!songTimerInterval) {
        startSongTimer();
        getTrackAudioAnalysis();
    }

    
    
}

function pause(isPaused) {
    window.document.getElementById('pausePlayIcon').className = "far fa-play-circle fa-3x";

    if(!isPaused) {
        var httpRequest = new XMLHttpRequest();
        
        httpRequest.open('PUT', 'https://api.spotify.com/v1/me/player/pause?device_id=' + SpotifyControls.deviceID, true);

        httpRequest.setRequestHeader('Authorization', "Bearer " + SpotifyControls.accessToken);
        httpRequest.send();
    }

    stopSongTimer();

}

function getPreviousSong() {
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('POST', 'https://api.spotify.com/v1/me/player/previous?device_id=' + SpotifyControls.deviceID, true);

    httpRequest.setRequestHeader('Authorization', "Bearer " + SpotifyControls.accessToken);
    httpRequest.send();
}

function getCurrentSong() {
    return currentSong;
}


function getCurrentArtist() {
    return currentArtist;
}

function setCurrentSong(newSong) {
    currentSong = newSong;
}


function setCurrentArtist(newArtist) {
    currentArtist = newArtist;
}

function startSongTimer() {
    songTimerInterval =  setInterval(() => {
        trackTimer++;
        if(currentBeatsStarts[trackTimer]) {
            updateBeatTimer(3,currentBeatsStarts[trackTimer]);
        }
    }, 1);
}

//TODO Isn't stopping bars
function stopSongTimer() {
    clearInterval(songTimerInterval);

    clearInterval(bar1Interval);
    clearInterval(bar2Interval);
    clearInterval(bar3Interval);
    
    clearInterval(bar1SubTimeout);
    clearInterval(bar2SubTimeout);
    clearInterval(bar3SubTimeout);
}   

function startVisualizations(beats) {
    setCurrentBeat(0);
    setBeats(beats);

    //Tatums - Lowest regular pulse train that a listener intuitively infers from the timing of perceived musical events: a time quantum
    //

    //Starts the center bar first*
    // updateBeatTimer(3,getCurrentBeat());

}

function getCurrentBeat() {
    return currentBeat;
}

function setCurrentBeat(newBeatIndex) {
    currentBeat = newBeatIndex;
}

function getBeats() {
    return beats;
}

function setBeats(newBeats) {
    beats = newBeats;

    currentBeatsStarts = {};
    for (let beat in newBeats) {
        let confidence = newBeats[beat].confidence;
        let startTime = newBeats[beat].start.toFixed(3) * 1000

        // Creates an object of objects storing the start time and confidence
        currentBeatsStarts[startTime] = confidence
    }
}

//TODO Non-middle bars are freaking out too much
function updateBeatTimer(barIndex,confidence) {

    if(barIndex === 3) {
        bar1Interval = setInterval(() => {
            draw(3,confidence);
            bar1SubTimeout = setTimeout(() => {
                draw(3,(confidence * .75));
            }, 4000);
            
        },1000)

        bar2Interval = setInterval(() => {
            draw(2,previousBeatCon1);
            draw(4,previousBeatCon1);
            bar2SubTimeout = setTimeout(() => {
                draw(2,previousBeatCon1 * .75);
                draw(4,previousBeatCon1 * .75);
            }, 4000);
            
        },1000)

        bar3Interval = setInterval(() => {
            draw(1,previousBeatCon2);
            draw(5,previousBeatCon2);
            bar3SubTimeout = setTimeout(() => {
                draw(1,previousBeatCon2 * .75);
                draw(5,previousBeatCon2 * .75);
            }, 4000);
            
        },1000)

        previousBeatCon2 = previousBeatCon1
        previousBeatCon1 = confidence;
    } 
}

function draw(barIndex, confidence) {
    var canvas = document.getElementById('visualizer');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        let x = (barIndex*100) + (50 * barIndex);
        ctx.clearRect(x, 900, 100, -900);
        
        let tensInterval = (confidence * 100) / 10
        
        for(let percent = 0 ; percent < tensInterval ; percent++) {
            switch(percent) {
                case 1:
                    ctx.fillStyle = "#bffffb";
                    ctx.fillRect(x, 760, 100, -(40));
                    break;
                case 2:
                    ctx.fillStyle = "#a6fef8";
                    ctx.fillRect(x, 700, 100, -(40));
                    break;
                case 3:
                    ctx.fillStyle = "#89fff6";
                    ctx.fillRect(x, 640, 100, -(40));
                    break;
                case 4:
                    ctx.fillStyle = "#81eff9";
                    ctx.fillRect(x, 580, 100, -(40));
                    break;
                case 5:
                    ctx.fillStyle = "#77e6f0";
                    ctx.fillRect(x, 520, 100, -(40));
                    break;
                case 6:
                    ctx.fillStyle = "#6addef";
                    ctx.fillRect(x, 460, 100, -(40));
                    break;
                case 7:
                    ctx.fillStyle = "#5dd3e5";
                    ctx.fillRect(x, 400, 100, -(40));
                    break;
                case 8:
                    ctx.fillStyle = "#5dc3e5";
                    ctx.fillRect(x, 340, 100, -(40));
                    break;
                case 9:
                    ctx.fillStyle = "#4db6d8";
                    ctx.fillRect(x, 280, 100, -(40));
                    break;
                case 10:   
                    ctx.fillStyle = "#4daad8";
                    ctx.fillRect(x, 220, 100, -(40));
                    break;
            }
        }
       
    }
  }

function adjustVolume() {
    let volume = Number.parseInt(document.getElementById("volume").value);
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('PUT', 'https://api.spotify.com/v1/me/player/volume?device_id=' + SpotifyControls.deviceID + "&volume_percent=" + volume, true);

    httpRequest.setRequestHeader('Authorization', "Bearer " + SpotifyControls.accessToken);
    httpRequest.send();
}

function getTrackAudioAnalysis() {
    var trackIDRequest = new XMLHttpRequest();
    trackIDRequest.open('GET', 'https://api.spotify.com/v1/me/player/currently-playing?market=from_token' , true);
    trackIDRequest.setRequestHeader('Authorization', "Bearer " + SpotifyControls.accessToken);

    trackIDRequest.onreadystatechange = function() {
        if(trackIDRequest.responseText) {
            var response = JSON.parse(trackIDRequest.responseText);
            var trackID = response.item.id;
            console.log("Track ID: " + trackID);
        }
        

        if(trackID) {
            var analysisRequest = new XMLHttpRequest();
            analysisRequest.open('GET', 'https://api.spotify.com/v1/audio-analysis/' +  trackID, true);
            analysisRequest.setRequestHeader('Authorization', "Bearer " + SpotifyControls.accessToken);

            analysisRequest.onreadystatechange = function() {
                if(analysisRequest.responseText) {
                    let response = JSON.parse(analysisRequest.responseText);
                    startVisualizations(response.beats); 
                }
                
            }
            analysisRequest.send();
        }

    }
    trackIDRequest.send();

    
}


var express = require('express');
const { get } = require('http');
var app = express();
var http = require('http').Server(app);
// var SpotifyWebApi = require('spotify-web-api-node');
app.use(express.static(__dirname));
//Listens on Local Host port 8000
var server = http.listen(8000, () => {
    console.log("Server is listening on port ", server.address().port)
});