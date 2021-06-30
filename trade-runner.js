// [2021.06.21 17:15]


// RUNNER SECTION
let runnerID = null;
let runnerTimerID = null;

// RUN the process
function runner(duration, fequency, userCallback, label) {
    // check for errors ...
    if (runnerID) {
        console.error('WARNING [FUNCTION runner : ' + (label || '') +  ']: already runs');
        return;
    }

    // how often should request API 
    let interval = 1 / fequency; // 1 / 'times in seconds'

    // make it to tick after each ...
    runnerID = setInterval(() => {
        userCallback();
    }, interval);

    // set duration/timeout [how long will run till the next set-up]
    setRunnerDuration(duration);
}

// reset/change the duration [timeout]
function setRunnerDuration(duration) {
    // clear any timeout if there is one
    clearTimeout(runnerTimerID);

    // close session - close/stop interval/ticks
    runnerTimerID = setTimeout(() => {
        stopRunner();
    }, duration * 1000);
}

// stop runner
function stopRunner() {
    // LOG
    console.log('FUNCTION resetDuration : ' + label +  '');
    
    // clear timeout 
    clearTimeout(runnerTimerID);

    // clear Interval 
    clearInterval(runnerID);

    runnerID = null;
}
