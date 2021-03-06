function padded(num){
    let paddedNumStr = '';
    if(num<10){
        paddedNumStr = '0' + String(num);
    }
    else{
        paddedNumStr = String(num);
    }

    return paddedNumStr;
}

const breakSFX = new Audio('audio/cat2.wav');
const sessionSFX = new Audio('audio/winGame.wav');

const mainTimeLabel = document.querySelector("#mainTimeLabel");
const mainSquareLabel = document.querySelector("#mainSquareLabel");

//take time in millisecs and return timeArr[hours, mins, secs]
function calcTimeFromMilliSecs(millisecs){
    let hours = Math.floor((millisecs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((millisecs % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((millisecs % (1000 * 60)) / 1000);
    let timeArr = [hours,minutes,seconds];
    return timeArr;
}

//take an arr[hours,mins,secs] and display it in mainTimeLabel
function displayTime(timeArr){
    mainTimeLabel.textContent = padded(timeArr[0]) + ':' + padded(timeArr[1]) + ':' + padded(timeArr[2]);
}

let maxSessionMins = 120;
let minSessionMins = 1;
let maxBreakMins = 60;
let minBreakMins = 1;
let defaultSessionMins = 25;
let defaultBreakMins = 5;
let sessionMins = defaultSessionMins;
let breakMins = defaultBreakMins;
let remainHoursStr = '00';
let remainMinsStr = '00';
let remainSecsStr = '00';

const sessionDecreaseTimeBtn = document.querySelector("#sessionDecreaseTimeBtn");
const sessioIncreaseTimeBtn = document.querySelector("#sessionIncreaseTimeBtn");
const breakDecreaseTimeBtn = document.querySelector("#breakDecreaseTimeBtn");
const breakIncreaseTimeBtn = document.querySelector("#breakIncreaseTimeBtn");
const sessionTimeLabel = document.querySelector("#sessionTimeLabel");
const breakTimeLabel = document.querySelector("#breakTimeLabel");

function disableSessionDecreaseBtn(){ sessionDecreaseTimeBtn.disabled = true; }
function disableSessionIncreaseBtn(){ sessionIncreaseTimeBtn.disabled = true; }
function disableBreaknDecreaseBtn(){ breakDecreaseTimeBtn.disabled = true; }
function disableBreakIncreaseBtn(){ breakIncreaseTimeBtn.disabled = true; }

function enableSessionDecreaseBtn(){ sessionDecreaseTimeBtn.disabled = false; }
function enableSessionIncreaseBtn(){ sessionIncreaseTimeBtn.disabled = false; }
function enableBreakDecreaseBtn(){ breakDecreaseTimeBtn.disabled = false; }
function enableBreakIncreaseBtn(){ breakIncreaseTimeBtn.disabled = false; }

function disableTimeChange(){
    disableSessionDecreaseBtn();
    disableSessionIncreaseBtn();
    disableBreaknDecreaseBtn();
    disableBreakIncreaseBtn();
}

function enableTimeChange(){
    enableSessionDecreaseBtn();
    enableSessionIncreaseBtn();
    enableBreakDecreaseBtn();
    enableBreakIncreaseBtn();
}

function updateSessionTimeLabel(){
    sessionTimeLabel.textContent = sessionMins;
}

function updateBreakTimeLabel(){
    breakTimeLabel.textContent = breakMins;
}

updateSessionTimeLabel();
updateBreakTimeLabel();

const startBtn = document.querySelector("#startBtn");
const stopBtn = document.querySelector("#stopBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const resetBtn = document.querySelector("#resetBtn");

function disableStartBtn(){ startBtn.disabled = true;}
function disablePauseBtn(){ pauseBtn.disabled = true;}
function disableStopBtn(){ stopBtn.disabled = true;}

function enableStartBtn(){ startBtn.disabled = false;}
function enablePauseBtn(){ pauseBtn.disabled = false;}
function enableStopBtn(){ stopBtn.disabled = false;}

disablePauseBtn();
disableStopBtn();

let playing = false;
let finished = true;
let paused = false;

function countDown(sessionOrBreakStr){
    let now = new Date().getTime(); // Get today's date and time in millisecs
    let countDownMins = 0;

    if(sessionOrBreakStr.toUpperCase()==='SESSION'){ 
        countDownMins = sessionMins; 
        mainSquareLabel.textContent = 'SESSION';
    }
    else if(sessionOrBreakStr.toUpperCase()==='BREAK') { 
        mainSquareLabel.textContent = 'BREAK';
        countDownMins = breakMins; 
    }
    else if(sessionOrBreakStr.toUpperCase()==='REMAIN'){
        countDownMins = parseInt(remainMinsStr) + parseInt(remainHoursStr)*60 + parseInt(remainSecsStr)/60;
    }

    let deadline = now + countDownMins*60000; //now + countdown mins in millisecs

    // Update the count down every 1 second
    let x = setInterval(function() {
        if(playing===true){
            disableStartBtn();
            enablePauseBtn();
            enableStopBtn();
            disableTimeChange();
        }

        if(finished===true){
            clearInterval(x);
            displayTime([0,0,0]);
            mainSquareLabel.textContent = 'SESSION/BREAK';
            disablePauseBtn();
            disableStopBtn();
            enableStartBtn();
            enableTimeChange();
            return;
        }

        //if paused, store remaining hours, mins, secs and clear interval
        if(paused===true){
            clearInterval(x);
            remainHoursStr = mainTimeLabel.textContent.substring(0,2);
            remainMinsStr = mainTimeLabel.textContent.substring(3,5);
            remainSecsStr = mainTimeLabel.textContent.substring(6,8);
            disablePauseBtn();
            enableStartBtn();
            enableStopBtn();
            disableTimeChange();
        }

        let now = new Date().getTime();

        // Find the distance between now and the deadline (in millisecs)
        let distance = deadline - now;

        // Time calculations for hours, minutes and seconds
        let timeArr = calcTimeFromMilliSecs(distance);

        // Display the result in main time label
        displayTime(timeArr);

        // If session/break count down is finished, switch to break/session countdown
        if (distance < 0) {
            clearInterval(x);
            if(mainSquareLabel.textContent==='SESSION'){
                mainTimeLabel.textContent = '00:00:00';
                countDown('break');
                breakSFX.play();
            }
            else if(mainSquareLabel.textContent==='BREAK'){
                mainTimeLabel.textContent = '00:00:00';
                countDown('session');
                sessionSFX.play();
            }
        }
    },1000)
}

//if paused, count down with remainMins, else countdown with sessionMins
function startCountDown(){
    playing = true;
    finished = false;
    if(paused===true){
        paused = false;
        countDown('remain');
    }
    else{
        countDown('session');
    }
}

function stopCountDown(){
    startCountDown();
    playing = false;
    paused = false;
    finished = true;
}

function pauseCountDown(){
    paused = true;
    playing = false;
    finished = false;
}

startBtn.addEventListener('click', function(){
    sessionSFX.play();
    startCountDown();
});
stopBtn.addEventListener('click', stopCountDown);
pauseBtn.addEventListener('click', pauseCountDown);

function decreaseSessionTime(){
    if(sessionMins > minSessionMins){ sessionMins--; }
    updateSessionTimeLabel();
}

function increaseSessionTime(){
    if(sessionMins < maxSessionMins){ sessionMins++; }
    updateSessionTimeLabel();
}

function decreaseBreakTime(){
    if(breakMins > minBreakMins){ breakMins--; }
    updateBreakTimeLabel();
}

function increaseBreakTime(){
    if(breakMins > minBreakMins){ breakMins++; }
    updateBreakTimeLabel();
}

sessionDecreaseTimeBtn.addEventListener('click',decreaseSessionTime);
sessionIncreaseTimeBtn.addEventListener('click',increaseSessionTime);
breakDecreaseTimeBtn.addEventListener('click',decreaseBreakTime);
breakIncreaseTimeBtn.addEventListener('click',increaseBreakTime);

function reset(){
    stopCountDown();
    sessionMins = defaultSessionMins;
    breakMins = defaultBreakMins;
    updateSessionTimeLabel();
    updateBreakTimeLabel();
}

resetBtn.addEventListener('click',reset);

