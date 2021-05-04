'use strict'
class SpotifyControls {
    // static clientId = client_id
    static redirectUri = 'http://localhost:8000';

    static #accessToken = '';
    static #deviceID = '';
    static #isPlaying = false;

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

    static setIsPlaying(isPlaying) {
        this.#isPlaying = isPlaying;
    }

    static get isPlaying() {
        return this.#isPlaying;
    }


    static clearAccessToken() {
        this.#accessToken = '';
    }

}

var currentSong;  
var currentArtist; 

var trackDurationMS;
var songStartTime;
//Tracks current position in song
var trackTimer;
var songTimerInterval;

var isSliding;

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
            if(state && SpotifyControls.accessToken) {
                trackTimer = state.position;
                songStartTime = new Date().setMilliseconds(new Date().getMilliseconds() - trackTimer);

                if(state.paused) {
                    pause(true);
                 
                } else {
                    play(true);
                }

                let song = state.track_window.current_track.name;
                let artists = '';

                if( song !== getCurrentSong()) {
                    trackDurationMS = state.duration;

                    adjustSeek(trackTimer, trackDurationMS);
                    document.getElementById('albumArt').src = state.track_window.current_track.album.images[0].url;

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
                updateLoginButton(true); 
                if(!originalWindow.isInitialized) {
                    sdkSetUp();
                }
                
            }
    },3000);
}

function clear() {
    console.log("Sign Out")
    pause();
    SpotifyControls.clearAccessToken();
    updateLoginButton(false);
    updateArtist("No Artist");
    updateSong("No Song");
}

function updateLoginButton(isSignedIn){
    if(isSignedIn) {
         document.getElementById("login").onclick = clear;
         document.getElementById("login").innerText = "Sign Out";

         document.getElementById("previousSong").removeAttribute('disabled');
         document.getElementById("pausePlay").removeAttribute('disabled');
         document.getElementById("nextSong").removeAttribute('disabled');
         document.getElementById("volume").removeAttribute('disabled');
         document.getElementById("seeker").removeAttribute('disabled');
         
    } else {
        document.getElementById("login").onclick = login;
        document.getElementById("login").innerText = "Login";

        document.getElementById("previousSong").setAttribute('disabled','');
        document.getElementById("pausePlay").setAttribute('disabled','');
        document.getElementById("nextSong").setAttribute('disabled','');
        document.getElementById("volume").setAttribute('disabled','');
        document.getElementById("albumArt").setAttribute('src','');
        document.getElementById("seeker").setAttribute('disabled','');
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
    console.log("New Song: " + song);
    window.document.getElementById('song').innerText = song;
    setCurrentSong(song);
}

function updateArtist(artist) {
    console.log("New Artist: " + artist);
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
    SpotifyControls.setIsPlaying(true);

    if(!isPlaying) {
        var httpRequest = new XMLHttpRequest();

        httpRequest.open('PUT', 'https://api.spotify.com/v1/me/player/play?device_id=' + SpotifyControls.deviceID, true);

        httpRequest.setRequestHeader('Authorization', "Bearer " + SpotifyControls.accessToken);
        httpRequest.send();
    }

    if (!songTimerInterval) {
        startSongTimer();
        getTrackAudioAnalysis();
        console.log("Start Song Timer: " + songTimerInterval)
    }

    
    
}

function pause(isPaused) {
    window.document.getElementById('pausePlayIcon').className = "far fa-play-circle fa-3x";
    SpotifyControls.setIsPlaying(false)

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
                    startBeatVisualizations(response.beats); 
                    startTatumVisualizations(response.tatums); 
                }
                
            }
            analysisRequest.send();
        }

    }
    trackIDRequest.send();

    
}

function startSongTimer() {
    songTimerInterval =  setInterval(() => {
        trackTimer = Date.now() - songStartTime;
        adjustSeek(trackTimer,trackDurationMS);

        if(currentBeatsStarts[trackTimer]) {
            updateBeatTimer(currentBeatsStarts[trackTimer].confidence, currentBeatsStarts[trackTimer].duration);
        }
        
        if(currentTatumStarts[trackTimer]) {
            updateTatumTimer(currentTatumStarts[trackTimer].confidence, currentTatumStarts[trackTimer].duration)
        }
        
    }, 1);
}

function stopSongTimer() {
    songTimerInterval = null;
    bar1Interval = null;
    bar2Interval = null;
    bar3Interval = null;

    bar1SubTimeout = null;
    bar2SubTimeout = null;
    bar3SubTimeout = null;
    console.log("Stop Song Timer: " + songTimerInterval)
}  

function adjustSeek(currentTime, maxTime) {
    if(!isSliding) {
        document.getElementById('seeker').value = currentTime;
    }
    
    document.getElementById('seeker').max = maxTime;

    document.getElementById('currentTime').innerText = millisToMinutesAndSeconds(currentTime);
    document.getElementById('timeDuration').innerText = millisToMinutesAndSeconds(maxTime);

} 

function adjustTimer(currentTime) {
    trackTimer = currentTime;

    var seekRequest = new XMLHttpRequest();
    seekRequest.open('PUT', 'https://api.spotify.com/v1/me/player/seek?position_ms=' +  currentTime, true);
    seekRequest.setRequestHeader('Authorization', "Bearer " + SpotifyControls.accessToken);
 
    seekRequest.send();

    setSliding(false);
} 

function setSliding (sliding) {
    isSliding = sliding;
}

function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return (
        seconds == 60 ?
        (minutes+1) + ":00" :
        minutes + ":" + (seconds < 10 ? "0" : "") + seconds
      );
  }


var express = require('express');
const { get } = require('http');
const { LOADIPHLPAPI } = require('node:dns');
var app = express();
var http = require('http').Server(app);
// var SpotifyWebApi = require('spotify-web-api-node');
app.use(express.static(__dirname));
//Listens on Local Host port 8000
var server = http.listen(8000, () => {
    console.log("Server is listening on port ", server.address().port)
});
