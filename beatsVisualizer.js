var currentBeatsStarts = {};
var previousBeatCon1 = 10
var previousBeatCon2 = 10;

var previousBeatDuration = 1000;
var previousBeatDuration2 = 1000; 

//Middle Bar
var bar1Interval;
var bar1SubTimeout
//Bars 2 & 4
var bar2Interval;
var bar2SubTimeout
// Bars 1 & 5
var bar3Interval;
var bar3SubTimeout;

var beats;

/**
 * Starts the bar visualization for the beats on the beats canvas
 * @param {Array} beats Array of Beats Objects containing confidence and start time
 */
function startBeatVisualizations(beats) {
    setBeats(beats);

    //Tatums - Lowest regular pulse train that a listener intuitively infers from the timing of perceived musical events: a time quantum

}

/**
 * Returns the Beats for the current playing track
 * @returns Stored Array of Beat Objects
 */
function getBeats() {
    return beats;
}

/**
 * Sets the beats array to the updated Beats. 
 * @param {Array} newBeats 
 */
function setBeats(newBeats) {
    beats = newBeats;

    currentBeatsStarts = {};
    for (let beat in newBeats) {
        let confidence = newBeats[beat].confidence;         
        let startTime = newBeats[beat].start.toFixed(3) * 1000;
        let duration = newBeats[beat].duration * 1000;

        // Creates an object of objects storing the start time and confidence
        currentBeatsStarts[startTime] = {confidence: confidence,
                                        duration: duration}
    }
}

//TODO Non-middle bars aren't pulsing
/**
 * Updates the middle bar with the current confidence, and the side bars with the previoous 
 * @param {Number} confidence Confidence of the beat
 * @param {Nuimber} duration How long the beat lasts
 */
function updateBeatTimer(confidence, duration) {

    bar1Interval = setInterval(() => {
        if(SpotifyControls.isPlaying) {
            bar1SubTimeout = setTimeout(() => {
                drawBeats(2,confidence);
            }, duration)
            
            bar1SubTimeout = setTimeout(() => {
                drawBeats(2,(confidence * .75));
            }, duration);
        }
    },duration)

    bar2Interval = setInterval(() => {
        if(SpotifyControls.isPlaying) {
            bar2SubTimeout = setTimeout(() => {
                drawBeats(1,previousBeatCon1);
            }, previousBeatDuration);

            bar2SubTimeout = setTimeout(() => {
                drawBeats(1,previousBeatCon1 * .75);
            }, previousBeatDuration);
        }
    },previousBeatDuration)

    bar3Interval = setInterval(() => {
        if(SpotifyControls.isPlaying) {
            bar3SubTimeout = setTimeout(() => {
                drawBeats(0,previousBeatCon2);
            }, previousBeatDuration2);
    
            bar3SubTimeout = setTimeout(() => {
                drawBeats(0,previousBeatCon2 * .75);
            }, previousBeatDuration2);
        }
    }, previousBeatDuration2);

    // console.log("Confidence: " + confidence);
    // console.log("Prev 1 Confidence: " + previousBeatCon1);
    // console.log("Prev 2 Confidence: " + previousBeatCon2);


    previousBeatCon2 = previousBeatCon1
    previousBeatCon1 = confidence;

    previousBeatDuration2 = previousBeatDuration;
    previousBeatDuration = duration;
}

/**
 * drawBeatss the Bars at the index with the height based off of confidence.
 * @param {Number} barIndex Bar index 1 - 5
 * @param {Number} confidence Decimal number for the beat confidence.
 */
function drawBeats(barIndex, confidence) {
    var canvasLeft = document.getElementById('beatsVisualizerLeft');
    var canvasRight = document.getElementById('beatsVisualizerRight');

    if (canvasLeft.getContext && canvasRight.getContext) {
        var ctxLeft = canvasLeft.getContext('2d');
        var ctxRight = canvasRight.getContext('2d');

        let leftX = (barIndex * 75);
        let rightX = ( (2 - barIndex) * 75);
        ctxLeft.clearRect(leftX, 900, 50, -900);
        ctxRight.clearRect(rightX, 900, 50, -900);
        
        let tensInterval = (confidence * 100) / 10
        
        for(let percent = 0 ; percent < tensInterval ; percent++) {
            switch(percent) {
                case 1:
                    ctxLeft.fillStyle = "#bffffb";
                    ctxLeft.fillRect(leftX, 540, 35, -(40));

                    ctxRight.fillStyle = "#bffffb";
                    ctxRight.fillRect(rightX, 540, 35, -(40));
                    break;
                case 2:
                    ctxLeft.fillStyle = "#a6fef8";
                    ctxLeft.fillRect(leftX, 480, 35, -(40));

                    ctxRight.fillStyle = "#a6fef8";
                    ctxRight.fillRect(rightX, 480, 35, -(40));
                    break;
                case 3:
                    ctxLeft.fillStyle = "#89fff6";
                    ctxLeft.fillRect(leftX, 420, 35, -(40));

                    ctxRight.fillStyle = "#89fff6";
                    ctxRight.fillRect(rightX, 420, 35, -(40));
                    break;
                case 4:
                    ctxLeft.fillStyle = "#81eff9";
                    ctxLeft.fillRect(leftX, 360, 35, -(40));

                    ctxRight.fillStyle = "#81eff9";
                    ctxRight.fillRect(rightX, 360, 35, -(40));
                    break;
                case 5:
                    ctxLeft.fillStyle = "#77e6f0";
                    ctxLeft.fillRect(leftX, 300, 35, -(40));

                    ctxRight.fillStyle = "#77e6f0";
                    ctxRight.fillRect(rightX, 300, 35, -(40));
                    break;
                case 6:
                    ctxLeft.fillStyle = "#6addef";
                    ctxLeft.fillRect(leftX, 240, 35, -(40));

                    ctxRight.fillStyle = "#6addef";
                    ctxRight.fillRect(rightX, 240, 35, -(40));
                    break;
                case 7:
                    ctxLeft.fillStyle = "#5dd3e5";
                    ctxLeft.fillRect(leftX, 180, 35, -(40));

                    ctxRight.fillStyle = "#5dd3e5";
                    ctxRight.fillRect(rightX, 180, 35, -(40));
                    break;
                case 8:
                    ctxLeft.fillStyle = "#5dc3e5";
                    ctxLeft.fillRect(leftX, 120, 35, -(40));

                    ctxRight.fillStyle = "#5dc3e5";
                    ctxRight.fillRect(rightX, 120, 35, -(40));
                    break;
                case 9:
                    ctxLeft.fillStyle = "#4db6d8";
                    ctxLeft.fillRect(leftX, 60, 35, -(40));
                    
                    ctxRight.fillStyle = "#4db6d8";
                    ctxRight.fillRect(rightX, 60, 35, -(40));
                    break;
                case 10:   
                    ctxLeft.fillStyle = "#4daad8";
                    ctxLeft.fillRect(leftX, 0, 35, -(40));
                    
                    ctxRight.fillStyle = "#4daad8";
                    ctxRight.fillRect(rightX, 0, 35, -(40));
                    break;
            }
        }
       
    }
  }