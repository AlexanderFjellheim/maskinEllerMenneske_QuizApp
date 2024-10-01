// Gather images
const real_src_num = 55;
const fake_src_num = 56;

const desired_length = 10;
const real_fake_ratio = 0.5;

var real_src = [];
var fake_src = [];
var randomImages = [];


var app = document.getElementById("app");
var timeElem;
var scoreElem;


const correctAudio = new Audio("audio/correct.mp3");
const wrongAudio = new Audio("audio/wrong.mp3");
const timedOutAudio = new Audio("audio/timed_out.mp3");
const startScreenAndCountdownAudio = new Audio("audio/startscreenAndCountdown.mp3");
const backgroundAudio = new Audio("audio/background-trimmed.mp3");



startScreenAndCountdownAudio.loop = true;
backgroundAudio.loop = true;

startScreenAndCountdownAudio.play();


index = 1;

var c;

var t;

var afterHighscoreTimer;

var timerDuration = 10000;

var startTime;
var scoreCorrectNum = 0;
var score = 0;
var time = 0;

var canAnswer = false;
var canSkip = false;

var overlayRunning = false;

var currentView = "start";

var highscores = [0, 0, 0, 0, 0];

function saveHighscores(highscores) {
    localStorage.setItem('highscores', JSON.stringify(highscores));
}

function getHighscores() {
    highscores = localStorage.getItem('highscores');
    return highscores ? JSON.parse(highscores) : [];
}

function appendHighscore(score) {
    var highscores = getHighscores();
    highscores.push(score);

    // Sort the highscores in descending order
    highscores.sort((a, b) => b - a);

    // Keep only the top 100 highscores
    highscores = highscores.slice(0, 99);
    console.log("appendHighscores:", highscores);
    saveHighscores(highscores);
}

function preloadImages(urls, callback) {
    var loadedImages = [];
    var count = 0;

    // Iterate through each URL
    urls.forEach(function (url) {
        var img = new Image();

        // When image is loaded
        img.onload = function () {
            count++;
            // If all images are loaded, execute a callback function
            if (count == urls.length) {
                callback(); // Execute the callback function once all images are loaded
            }
        };

        // Set image source to initiate loading
        img.src = url;

        // Push the image object to the loadedImages array
        loadedImages.push(img);
    });
}

function shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}


function createRandomImageArray() {
    real_src = [];
    fake_src = [];
    let combined = [];
    randomImages = [];

    // Create the arrays
    for (let i = 1; i <= real_src_num; i++) {
        real_src.push(["real", "images/real/" + i + ".jpg"]);
    }
    for (let i = 1; i <= fake_src_num; i++) {
        fake_src.push(["fake", "images/fake/" + i + ".jpg"]);
    }
    // Combined array
    combined = real_src.concat(fake_src);

    // Combined and shuffled array
    shuffle(combined);

    randomImages = combined.slice(0, 10);


    var urls = randomImages.map(function (item) {
        return item[1];
    });

    preloadImages(urls, function () {
        // Preloading completed, now display the quiz
        console.log("preloaded...");
    });
}


function restart() {
    console.log("restarting");
    fetch('http://localhost:5000/clear', { method: 'GET' });
    currentView = "start";
    index = 1;

    scoreCorrectNum = 0;
    score = 0;
    time = 0;

    canAnswer = false;


    overlayRunning = false;
    main();
}


function displayQuiz() {
    if (index > 10) {
        index = 10;
        time = 0;
    }
    app.innerHTML = `
            <div id="top-bar"><span id="question">${index} av 10 </span><div id="score-circle"><span id="score">${score}</span></div><span id="time">${"00:" + time.toString().padStart(2, "0")}</span> </div>
            <div id="img-container">
                <div id="overlay"></div>
                <img src="${randomImages[index - 1][1]}" id="img" alt="Image ${index}">
            </div>
    `;
    timeElem = document.getElementById("time");
    scoreElem = document.getElementById("score");
}



function overlayCorrect(points) {
    overlayRunning = true;
    scoreCorrectNum++;
    correctAudio.play();
    fetch('http://localhost:5000/correct', { method: 'GET' });
    return new Promise((resolve, reject) => {
        timeElem.innerText = "";
        let overlay = document.getElementById("overlay");
        overlay.classList.add("green");
        overlay.innerText = `+${points}`;
        setTimeout(function () {
            overlay.innerHTML = `Riktig!<br>Bildet er ${randomImages[index - 1][0] === "real" ? "ekte" : "falskt"}<img src="/images/correct.svg"/>`;
            overlay.classList.add("after");
            scoreElem.innerText = score + points;
            console.log("first resolve")

        }, 2000);
        setTimeout(function () {
            overlay.style.visibility = "hidden";
            overlay.classList.remove("after");
            overlay.classList.remove("green");
            console.log("second resolve")
            resolve();
            overlayRunning = false;
        }, 4000);

    });
}

function overlayWrong() {
    overlayRunning = true;
    wrongAudio.play();
    fetch('http://localhost:5000/wrong', { method: 'GET' });
    return new Promise((resolve, reject) => {
        timeElem.innerText = "";
        let overlay = document.getElementById("overlay");
        overlay.classList.add("red");
        overlay.innerText = "+0";
        setTimeout(function () {
            overlay.innerHTML = `Feil!<br>Bildet er ${randomImages[index - 1][0] === "real" ? "ekte" : "falskt"}<img src="/images/wrong.svg"/>`;
            overlay.classList.add("after");
            console.log("first resolve")
        }, 2000);

        setTimeout(function () {
            overlay.style.visibility = "hidden";
            overlay.classList.remove("after");
            overlay.classList.remove("red");
            resolve();
            overlayRunning = false;
        }, 4000);
    });
}


function overlayTimedOut() {
    overlayRunning = true;
    timedOutAudio.play();
    fetch('http://localhost:5000/wrong', { method: 'GET' });
    return new Promise((resolve, reject) => {
        timeElem.innerText = "";
        let overlay = document.getElementById("overlay");
        overlay.classList.add("red");
        overlay.innerText = "+0";
        setTimeout(function () {
            overlay.innerHTML = `Tom for tid!<br>Bildet er ${randomImages[index - 1][0] === "real" ? "ekte" : "falskt"}<img src="/images/wrong.svg"/>`;
            overlay.classList.add("after");
            console.log("first resolve")
        }, 2000);

        setTimeout(function () {
            overlay.style.visibility = "hidden";
            resolve();
            overlayRunning = false;
        }, 4000);
    });
}



function questionsLoop() {
    if (index <= 10) {
        time = 10;
        displayQuiz();
        // displayQuiz the current question
        console.log("Question " + index, "Score: ", score);


        startTime = Date.now();
        canAnswer = true;

        c = setInterval(function () {
            time--;
            var tmpTime = time;
            timeElem.innerText = "00:" + tmpTime.toString().padStart(2, "0");

        }, 1000);
        // Start the timer for this question
        t = setTimeout(function () {
            canAnswer = false;
            clearInterval(c);

            if (overlayRunning) {
                console.log("overlayRunning");
                return;
            }
            // Timer runs out
            console.log("Time's up! before", index);
            new Promise((resolve, reject) => {
                overlayTimedOut().then(() => {
                    resolve();
                });
            }).then(() => {
                console.log("Time's up! after", index);
                index++;
                questionsLoop();
            });

        }, timerDuration);

    } else {
        console.log("Game Over! Your final score is: " + score);
        appendHighscore(score);
        currentView = "highscore";

        main();
    }
}

// function readHighscores() {
//     // Read the highscores from the cookie
//     console.log("Reading highscores...");

//     console.log("Highscores: ", highscores);

// }

// function updateHighscore(score) {
//     let currentScore = score.toString();
//     console.log("Current score: ", currentScore);
//     let highscores = document.cookie;

// }

function displayHighscores(numberCorrect) {
    let circleElem = '<circle id="circle" cx="250" cy="250" r="230" stroke-linecap="round" /> '
    if (window.screen.width > 3000) {
        circleElem = '<circle id="circle" cx="500" cy="500" r="460" stroke-linecap="round" />';
    }
    let finalScoreImg = "";
    let finalScoreH1 = "";
    let finalScoreH2 = "";

    if (numberCorrect <= 2) {
        finalScoreImg = "images/characters/digital_dult.svg";
        finalScoreH1 = "Digital Dult"
        finalScoreH2 = "Du er et lett bytte for manipulasjon og har liten bevissthet om de potensielle farene som fremtidens KI-teknologi kan føre med seg."
    }
    else if (numberCorrect <= 4) {
        finalScoreImg = "images/characters/naiv_nettbruker.svg";
        finalScoreH1 = "Naiv Nettbruker";
        finalScoreH2 = "Du er naiv når det gjelder digital sikkerhet og er sårbar for manipulasjon av KI-genererte bilder";
    }
    else if (numberCorrect <= 6) {
        finalScoreImg = "images/characters/pessimistisk_pixel.svg";
        finalScoreH1 = "Pessimistisk Pixel";
        finalScoreH2 = "Du er skeptisk til digitalt innhold, men undervurderer likevel de potensielle truslene fra fremtidens KI-teknologi.";
    }
    else if (numberCorrect <= 8) {
        finalScoreImg = "images/characters/virtuell_vokter.svg";
        finalScoreH1 = "Virtuell Vokter";
        finalScoreH2 = "Du er kritisk til digitalt innhold, men må fortsatt være mer bevisst over KI-genererte bilder.";
    }
    else {
        finalScoreImg = "images/characters/teknologisk_trollmann.svg";
        finalScoreH1 = "Teknologisk Trollmann";
        finalScoreH2 = "Du er en mester i å avsløre manipulerte bilder!";
    }

    app.innerHTML = `
        <div id="highscore-screen">
        
            <div id="final-score">
                    <div class="final-score-description">
                        <img src=${finalScoreImg} />
                        <h1>Du er en <div class="odd">${finalScoreH1}</div></h1>
                        <h2>${finalScoreH2}</h2>
                    </div>
                    <div class="final-score-container">
                        <div class="outer">
                            <div class="inner">
                                <div id="final-score-counter">
                                    3210
                                </div>
                                <div id="final-score-correct-number">
                                    10 av 10
                                </div>
                            </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="500px" height="500px">
                        <defs>
                            <linearGradient id="GradientColor">
                                <stop offset="0%" stop-color="#81B5B7" />
                                <stop offset="100%" stop-color="#01ECF3" />
                            </linearGradient>
                        </defs>
                        ${circleElem}
                 
                        </svg>

                    </div>
        
            </div>
            
            <div id="scoreboard">
                <h1>Scoreboard</h1>
                <ol>
                    <li id="1"></li>
                    <li id="2"></li>
                    <li id="3"></li>
                    <li id="4"></li>
                    <li id="5"></li>
                    <li id="6"></li>
                </ol>
            </div>
        </div>
    `;
    return;
}


function displayScoreDescription() {
    let finalScoreContainer = document.querySelector(".final-score-container");
    let finalScoreDescription = document.querySelector(".final-score-description");
    finalScoreContainer.classList.add("after");
    finalScoreDescription.classList.add("after");
}


function updateScore(score, numberCorrect) {
    let scoreElem = document.getElementById("final-score-counter");

    let scoreNumberElem = document.getElementById("final-score-correct-number");
    let scoreCircle = document.getElementById("circle");
    let scoreCircleXL = document.getElementById("circleXL");

    // Animation duration    
    const animationDuration = 3000;

    // Framerate
    const frameDuration = 1000 / 60;

    const totalFrames = Math.round(animationDuration / frameDuration);

    console.log("score", score);
    let percentage = score / 100;
    percentage.toFixed();
    percentage = parseInt(percentage);
    console.log("percentage", percentage);

    let offset = 1500;
    if (window.screen.width > 3000) {
        offset = 3000;
    }

    //fetch(`http://localhost:5000/progress/${percentage}`, { method: 'GET' });
    fetch(`http://localhost:5000/progress/${percentage}`, { method: 'GET' });

    // Ease function
    const easeOutQuad = t => t * (2 - t);

    const animateCountUp = el => {
        let frame = 0;
        const countTo = parseInt(el.innerHTML, 10);
        // Start the animation running 60 times per second
        const counter = setInterval(() => {
            frame++;
            // Calculate our progress as a value between 0 and 1
            // Pass that value to our easing function to get our
            // progress on a curve
            const progress = easeOutQuad(frame / totalFrames);
            // Use the progress value to calculate the current count
            const currentCount = Math.round(countTo * progress);

            // If the current count has changed, update the element
            if (parseInt(el.innerHTML, 10) !== currentCount) {
                if (el.id == "final-score-counter") {
                    el.innerHTML = currentCount;
                    //scoreCircle.style.strokeDashoffset = 1500 - currentCount / 10300 * 1500;
                    scoreCircle.style.strokeDashoffset = offset - currentCount / 10300 * offset;
                }
                if (el.id == "final-score-correct-number") {
                    el.innerHTML = currentCount + " av 10";
                }
            }

            // If we’ve reached our last frame, stop the animation
            if (frame === totalFrames) {
                clearInterval(counter);
                if (el.id == "final-score-counter") {
                    console.log("doneee");
                    displayScoreDescription();
                }
            }
        }, frameDuration);
    };

    scoreNumberElem.innerText = numberCorrect + " av 10";
    scoreElem.innerText = score;


    animateCountUp(scoreElem);
    animateCountUp(scoreNumberElem);

}


function updateHighscores(score) {
    var highscores = getHighscores();
    var scoreIndex = highscores.indexOf(score);

    let highscoreList = document.getElementById("scoreboard").getElementsByTagName("li");

    if (scoreIndex <= 5) {
        console.log("scoreIndex <=5", scoreIndex);
        for (let i = 0; i < highscoreList.length; i++) {
            if (i < highscores.length) {
                highscoreList[i].innerText = highscores[i];
            }
            else {
                highscoreList[i].innerText = "0";
            }
        }
        highscoreList[scoreIndex].classList.add("active");
    }
    else {
        console.log("scoreindex ", scoreIndex);
        for (let i = 0; i < highscoreList.length - 1; i++) {
            if (i < highscores.length) {
                highscoreList[i].innerText = highscores[i];
            }
            else {
                highscoreList[i].innerText = "0";
            }
        }
        scoreIndexString = '"' + (scoreIndex + 1) + '"';
        console.log(scoreIndexString);

        document.documentElement.style.setProperty('--current-score-not-in-top-5', scoreIndexString);
        highscoreList[5].innerText = score;
        highscoreList[5].classList.add("active");
    }

    setTimeout(() => {
        console.log("can skip now");
        canSkip = true;
    }, 5000);

    afterHighscoreTimer = setTimeout(() => {
        console.log("auto skipped to start screen");
        canSkip = false;
        restart();
    }, 30000);


}


function processAnswer(answer) {
    if (canAnswer) {
        canAnswer = false;
        // Check if the answer is correct
        const correct = randomImages[index - 1][0] === answer;

        if (correct) {
            // Calculate the points
            const points = Math.floor((timerDuration - (Date.now() - startTime)) / 10);
            console.log("Correct!", index, "+", points, "points");
            clearInterval(c);
            new Promise((resolve, reject) => {
                overlayCorrect(points).then(() => {
                    resolve();
                });
            }).then(() => {
                // Add the points to the score
                score += points;


                index++;
                clearInterval(c);
                clearTimeout(t);


                questionsLoop();
            });


        }
        else {
            console.log("Wrong!", index);
            clearInterval(c);

            new Promise((resolve, reject) => {
                overlayWrong().then(() => {
                    resolve();
                });
            }).then(() => {

                index++;
                clearInterval(c);
                clearTimeout(t);
                questionsLoop();
            });
        }
    }

}

function displayStartScreen() {
    //startScreenAndCountdownAudio.play();
    ///backgroundAudio.pause();
    app.innerHTML = `
        <div id="start-screen">
            <h1>
                <div>Menneske</div>
                <div class="odd">eller</div>
                <div>Maskin</div>
            </h1>
            <h2>Trykk for å starte spillet</h2>
        </div>
    `;
}

function displayInstructions() {
    app.innerHTML = `
        <div id="instructions-screen">
            <h1 id=instruction1>Trykk på <span>grønn</span> knapp hvis du tror bildet er <span>ekte</span></h1>
            <h1 id=instruction2>Trykk på <span>rød</span> knapp hvis du tror bildet er <span>falskt</span></h1>
        </div>
    `;
    setTimeout(() => {
        currentView = "intro";
        main();
    }, 7000);
}

function displayIntro() {
    app.innerHTML = `
        <div id="intro-screen">
            <div id="countdown">
                <div>Spillet starter om</div>
                <div id="counter-circle">
                    <div id="counter">3</div>
                </div>
      
            </div>

        </div>
    `;
}



function countdown() {
    let counter = document.getElementById("counter");
    let count = 3;
    let interval = setInterval(() => {
        count--;
        counter.innerText = count;
        if (count === 0) {
            clearInterval(interval);
            backgroundAudio.play();
            startScreenAndCountdownAudio.pause()
            currentView = "quiz";
            main();
        }
    }, 1000);

}

function keyPressHandler(e) {
    if (currentView === "start") {
        currentView = "instructions";
        console.log("start");
        main();
    }
    else if (currentView === "highscore" && canSkip == true) {
        canSkip = false;
        clearTimeout(afterHighscoreTimer);
        restart();
    }
    else if (e.key === "1") {
        //console.log("input_true");
        processAnswer("real");
    }
    else if (e.key === "2") {
        //console.log("input_false");
        processAnswer("fake");
    }

};

window.addEventListener("keydown", keyPressHandler, false);


function main() {
    if (currentView === "start") {
        displayStartScreen();
    }
    else if (currentView === "instructions") {
        displayInstructions();
    }

    else if (currentView === "intro") {
        displayIntro();
        createRandomImageArray();
        countdown();
        getHighscores();
    }

    else if (currentView === "quiz") {
        questionsLoop();
    }
    else if (currentView === "highscore") {
        startScreenAndCountdownAudio.play();
        backgroundAudio.pause();
        displayHighscores(scoreCorrectNum);
        updateScore(score, scoreCorrectNum);
        updateHighscores(score);

    }
    else {
        console.log("Error: Invalid currentView");
    }
}

main();
