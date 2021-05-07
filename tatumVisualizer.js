var currentTatumStarts = {};
var previousTatumCon1 = 10
var previousTatumCon2 = 10;

var previousTatumDuration = 1000;
var previousTatumDuration2 = 1000; 

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
        let duration = newTatums[tatum].duration * 1000;

        // Creates an object of objects storing the start time and confidence
        currentTatumStarts[startTime] = {confidence: confidence,
                                        duration: duration};
    }
}

//TODO Non-middle bars aren't pulsing
/**
 * Updates the middle bar with the current confidence, and the side bars with the previoous 
 * @param {Number} confidence Confidence of the tatum
 * @param {Nuimber} duration How long the tatum lasts
 */
function updateTatumTimer(confidence, duration) {

    bar1Interval = setInterval(() => {
        if(SpotifyControls.isPlaying) {
            bar1SubTimeout = setTimeout(() => {
                drawTatums(2,confidence);
            }, duration)
            
            bar1SubTimeout = setTimeout(() => {
                drawTatums(2,(confidence * .75));
            }, duration);
        }
    },duration)

    bar2Interval = setInterval(() => {
        if(SpotifyControls.isPlaying) {
            bar2SubTimeout = setTimeout(() => {
                drawTatums(1,previousTatumCon1);
            }, previousTatumDuration);

            bar2SubTimeout = setTimeout(() => {
                drawTatums(1,previousTatumCon1 * .75);

            }, previousTatumDuration);
        }
    },previousTatumDuration)

    bar3Interval = setInterval(() => {
        if(SpotifyControls.isPlaying) {
            bar3SubTimeout = setTimeout(() => {
                drawTatums(0,previousTatumCon2);
            }, previousTatumDuration2);
    
            bar3SubTimeout = setTimeout(() => {
                drawTatums(0,previousTatumCon2 * .75);
            }, previousTatumDuration2);
        }
    }, previousTatumDuration2);

    previousTatumCon2 = previousTatumCon1
    previousTatumCon1 = confidence;

    previousTatumDuration2 = previousTatumDuration;
    previousTatumDuration = duration;
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
                    ctxLeft.fillStyle = "#ffbde1";
                    ctxLeft.fillRect(leftX, 540, 35, -(40));

                    ctxRight.fillStyle = "#ffbde1";
                    ctxRight.fillRect(rightX, 540, 35, -(40));
                    
                    break;
                case 2:
                    ctxLeft.fillStyle = "#ffa5d6";
                    ctxLeft.fillRect(leftX, 480, 35, -(40));

                    ctxRight.fillStyle = "#ffa5d6";
                    ctxRight.fillRect(rightX, 480, 35, -(40));
                    break;
                case 3:
                    ctxLeft.fillStyle = "#fa99ce";
                    ctxLeft.fillRect(leftX, 420, 35, -(40));

                    ctxRight.fillStyle = "#fa99ce";
                    ctxRight.fillRect(rightX, 420, 35, -(40));
                    break;
                case 4:
                    ctxLeft.fillStyle = "#f486c2";
                    ctxLeft.fillRect(leftX, 360, 35, -(40));

                    ctxRight.fillStyle = "#f486c2";
                    ctxRight.fillRect(rightX, 360, 35, -(40));
                    break;
                case 5:
                    ctxLeft.fillStyle = "#f378bb";
                    ctxLeft.fillRect(leftX, 300, 35, -(40));

                    ctxRight.fillStyle = "#f378bb";
                    ctxRight.fillRect(rightX, 300, 35, -(40));
                    break;
                case 6:
                    ctxLeft.fillStyle = "#ec60ac";
                    ctxLeft.fillRect(leftX, 240, 35, -(40));

                    ctxRight.fillStyle = "#ec60ac";
                    ctxRight.fillRect(rightX, 240, 35, -(40));
                    break;
                case 7:
                    ctxLeft.fillStyle = "#e34b9e";
                    ctxLeft.fillRect(leftX, 180, 35, -(40));

                    ctxRight.fillStyle = "#e34b9e";
                    ctxRight.fillRect(rightX, 180, 35, -(40));
                    break;
                case 8:
                    ctxLeft.fillStyle = "#d83c91";
                    ctxLeft.fillRect(leftX, 120, 35, -(40));

                    ctxRight.fillStyle = "#d83c91";
                    ctxRight.fillRect(rightX, 120, 35, -(40));
                    break;
                case 9:
                    ctxLeft.fillStyle = "#cc3085";
                    ctxLeft.fillRect(leftX, 60, 35, -(40));
                    
                    ctxRight.fillStyle = "#cc3085";
                    ctxRight.fillRect(rightX, 60, 35, -(40));
                    break;
                case 10:   
                    ctxLeft.fillStyle = "#bb2476";
                    ctxLeft.fillRect(leftX, 0, 35, -(40));
                    
                    ctxRight.fillStyle = "#bb2476";
                    ctxRight.fillRect(rightX, 0, 35, -(40));
                    break;
            }
        }
       
    }
  }