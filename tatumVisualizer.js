var currentTatumStarts = {};
var previousTatumCon1 = 10
var previousTatumCon2 = 10;

//Middle Bar
var tatumBar1Interval;
var tatumBar1SubTimeout
//Bars 2 & 4
var tatumBar2Interval;
var tatumBar2SubTimeout
// Bars 1 & 5
var tatumBar3Interval;
var tatumBar3SubTimeout;

var tatums;

/**
 * Starts the bar visualization for the tatums on the tatums canvas
 * @param {Array} tatums Array of tatums Objects containing confidence and start time
 */
function startTatumVisualizations(tatums) {
    setTatums(tatums);

    //Tatums - Lowest regular pulse train that a listener intuitively infers from the timing of perceived musical events: a time quantum

}

/**
 * Returns the tatums for the current playing track
 * @returns Stored Array of tatum Objects
 */
function getTatums() {
    return tatums;
}

/**
 * Sets the tatums array to the updated tatums. 
 * @param {Array} newTatums
 */
function setTatums(newTatums) {
    tatums = newTatums;

    currentTatumStarts = {};
    for (let tatum in newTatums) {
        let confidence = newTatums[tatum].confidence;
        let startTime = newTatums[tatum].start.toFixed(3) * 1000

        // Creates an object of objects storing the start time and confidence
        currentTatumStarts[startTime] = confidence
    }
}

//TODO Non-middle bars aren't pulsing
/**
 * Updates the middle bar with the current confidence, and the side bars with the previoous 
 * @param {Number} confidence Confidence of the tatum
 */
function updateTatumTimer(confidence) {

    bar1Interval = setInterval(() => {
        if(SpotifyControls.isPlaying) {
            bar1SubTimeout = setTimeout(() => {
                drawTatums(2,confidence);
            }, 500)
            
            bar1SubTimeout = setTimeout(() => {
                drawTatums(2,(confidence * .75));
            }, 500);
        }
    },500)

    bar2Interval = setInterval(() => {
        if(SpotifyControls.isPlaying) {
            bar2SubTimeout = setTimeout(() => {
                drawTatums(1,previousTatumCon1);
            }, 500);

            bar2SubTimeout = setTimeout(() => {
                drawTatums(1,previousTatumCon1 * .75);

            }, 500);
        }
    },500)

    bar3Interval = setInterval(() => {
        if(SpotifyControls.isPlaying) {
            bar3SubTimeout = setTimeout(() => {
                drawTatums(0,previousTatumCon2);
            }, 500);
    
            bar3SubTimeout = setTimeout(() => {
                drawTatums(0,previousTatumCon2 * .75);
            }, 500);
        }
    }, 500);

    // console.log("Confidence: " + confidence);
    // console.log("Prev 1 Confidence: " + previousTatumCon1);
    // console.log("Prev 2 Confidence: " + previousTatumCon2);


    previousTatumCon2 = previousTatumCon1
    previousTatumCon1 = confidence;
}

/**
 * Draws the Bars at the index with the height based off of confidence.
 * @param {Number} barIndex Bar index 1 - 5
 * @param {Number} confidence Decimal number for the tatum confidence.
 */
function drawTatums(barIndex, confidence) {
    var canvasLeft = document.getElementById('tatumsVisualizerLeft');
    var canvasRight = document.getElementById('tatumsVisualizerRight');
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
                    ctxLeft.fillStyle = "#ffe8ed";
                    ctxLeft.fillRect(leftX, 760, 35, -(40));

                    ctxRight.fillStyle = "#ffe8ed";
                    ctxRight.fillRect(rightX, 760, 35, -(40));
                    
                    break;
                case 2:
                    ctxLeft.fillStyle = "#fdd7df";
                    ctxLeft.fillRect(leftX, 700, 35, -(40));

                    ctxRight.fillStyle = "#fdd7df";
                    ctxRight.fillRect(rightX, 700, 35, -(40));
                    break;
                case 3:
                    ctxLeft.fillStyle = "#fdd7df";
                    ctxLeft.fillRect(leftX, 640, 35, -(40));

                    ctxRight.fillStyle = "#fdd7df";
                    ctxRight.fillRect(rightX, 640, 35, -(40));
                    break;
                case 4:
                    ctxLeft.fillStyle = "#f49aad";
                    ctxLeft.fillRect(leftX, 580, 35, -(40));

                    ctxRight.fillStyle = "#f49aad";
                    ctxRight.fillRect(rightX, 580, 35, -(40));
                    break;
                case 5:
                    ctxLeft.fillStyle = "#e77990";
                    ctxLeft.fillRect(leftX, 520, 35, -(40));

                    ctxRight.fillStyle = "#e77990";
                    ctxRight.fillRect(rightX, 520, 35, -(40));
                    break;
                case 6:
                    ctxLeft.fillStyle = "#db5370";
                    ctxLeft.fillRect(leftX, 460, 35, -(40));

                    ctxRight.fillStyle = "#db5370";
                    ctxRight.fillRect(rightX, 460, 35, -(40));
                    break;
                case 7:
                    ctxLeft.fillStyle = "#d13254";
                    ctxLeft.fillRect(leftX, 400, 35, -(40));

                    ctxRight.fillStyle = "#d13254";
                    ctxRight.fillRect(rightX, 400, 35, -(40));
                    break;
                case 8:
                    ctxLeft.fillStyle = "#c82749";
                    ctxLeft.fillRect(leftX, 340, 35, -(40));

                    ctxRight.fillStyle = "#c82749";
                    ctxRight.fillRect(rightX, 340, 35, -(40));
                    break;
                case 9:
                    ctxLeft.fillStyle = "#b71537";
                    ctxLeft.fillRect(leftX, 280, 35, -(40));
                    
                    ctxRight.fillStyle = "#b71537";
                    ctxRight.fillRect(rightX, 280, 35, -(40));
                    break;
                case 10:   
                    ctxLeft.fillStyle = "#a70c2d";
                    ctxLeft.fillRect(leftX, 220, 35, -(40));
                    
                    ctxRight.fillStyle = "#a70c2d";
                    ctxRight.fillRect(rightX, 220, 35, -(40));
                    break;
            }
        }
       
    }
  }