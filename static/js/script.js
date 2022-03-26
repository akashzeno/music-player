
// Awesome audio visualization by Nelson Rodrigues which I tweaked a little to make it work with my audio player
// link to original visualization https://codepen.io/nelsonr/pen/WamzJb

const music = document.querySelector('audio');
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");

canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

let centerX = canvas.width / 2;
let centerY = canvas.height / 2;
let radius = document.body.clientWidth <= 425 ? 120 : 160;
let steps = document.body.clientWidth <= 425 ? 60 : 120;
let interval = 360 / steps;
let pointsUp = [];
let pointsDown = [];
let running = false;
let pCircle = 2 * Math.PI * radius;
let angleExtra = 90;

// Create points
for(let angle = 0; angle < 360; angle += interval) {
  let distUp = 1.1;
  let distDown = 0.9;

  pointsUp.push({
    angle: angle + angleExtra,
    x: centerX + radius * Math.cos((-angle + angleExtra) * Math.PI / 180) * distUp,
    y: centerY + radius * Math.sin((-angle + angleExtra) * Math.PI / 180) * distUp,
    dist: distUp
  });

  pointsDown.push({
    angle: angle + angleExtra + 5,
    x: centerX + radius * Math.cos((-angle + angleExtra + 5) * Math.PI / 180) * distDown,
    y: centerY + radius * Math.sin((-angle + angleExtra + 5) * Math.PI / 180) * distDown,
    dist: distDown
  });
}

// -------------
// Audio stuff
// -------------

// make a Web Audio Context
const context = new AudioContext();
const splitter = context.createChannelSplitter();

const analyserL = context.createAnalyser();
analyserL.fftSize = 8192;

const analyserR = context.createAnalyser();
analyserR.fftSize = 8192;

splitter.connect(analyserL, 0, 0);
splitter.connect(analyserR, 1, 0);

// Make a buffer to receive the audio data
const bufferLengthL = analyserL.frequencyBinCount;
const audioDataArrayL = new Uint8Array(bufferLengthL);

const bufferLengthR = analyserR.frequencyBinCount;
const audioDataArrayR = new Uint8Array(bufferLengthR);



// connect the audio element to the analyser node and the analyser node
// to the main Web Audio context
const source = context.createMediaElementSource(music);
// source.connect(splitter);
// splitter.connect(context.destination);

document.body.addEventListener('touchend', function(ev) {
  context.resume();
});

// -------------
// Canvas stuff
// -------------

function drawLine(points) {
  let origin = points[0];

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineJoin = 'round';
  ctx.moveTo(origin.x, origin.y);

  for (let i = 0; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.lineTo(origin.x, origin.y);
  ctx.stroke();
}

function connectPoints(pointsA, pointsB) {
  for (let i = 0; i < pointsA.length; i++) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.moveTo(pointsA[i].x, pointsA[i].y);
    ctx.lineTo(pointsB[i].x, pointsB[i].y);
    ctx.stroke();
  }
}

function update(dt) {
  let audioIndex, audioValue;

  // get the current audio data
  analyserL.getByteFrequencyData(audioDataArrayL);
  analyserR.getByteFrequencyData(audioDataArrayR);

  for (let i = 0; i < pointsUp.length; i++) {
    audioIndex = Math.ceil(pointsUp[i].angle * (bufferLengthL / (pCircle * 2))) | 0;
    // get the audio data and make it go from 0 to 1
    audioValue = audioDataArrayL[audioIndex] / 255;

    pointsUp[i].dist = 1.1 + audioValue * 0.8;
    pointsUp[i].x = centerX + radius * Math.cos(-pointsUp[i].angle * Math.PI / 180) * pointsUp[i].dist;
    pointsUp[i].y = centerY + radius * Math.sin(-pointsUp[i].angle * Math.PI / 180) * pointsUp[i].dist;

    audioIndex = Math.ceil(pointsDown[i].angle * (bufferLengthR / (pCircle * 2))) | 0;
    // get the audio data and make it go from 0 to 1
    audioValue = audioDataArrayR[audioIndex] / 255;

    pointsDown[i].dist = 0.9 + audioValue * 0.2;
    pointsDown[i].x = centerX + radius * Math.cos(-pointsDown[i].angle * Math.PI / 180) * pointsDown[i].dist;
    pointsDown[i].y = centerY + radius * Math.sin(-pointsDown[i].angle * Math.PI / 180) * pointsDown[i].dist;
  }
}

function draw(dt) {
  requestAnimationFrame(draw);
  update(dt);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawLine(pointsUp);
  drawLine(pointsDown);
  connectPoints(pointsUp, pointsDown);
}

draw();
// ---------------------------------------------------------
// ---------------------------------------------------------
// ---------------------------------------------------------

const jsmediatags = window.jsmediatags;
const image = document.querySelector('img');
const title = document.querySelector('#title');
const artist = document.querySelector('#artist');

// const music = document.querySelector('audio');
const prevBtn = document.getElementById('prev');
const playBtn = document.getElementById('play');
const nextBtn = document.getElementById('next');
const progress = document.getElementById('progress');
const currentTimeElement = document.getElementById('current-time');
const durationElement = document.getElementById('duration');
const progressContainer = document.getElementById('progress-container');
const playerContainer = document.querySelector('.player-container');
const fileSelector = document.getElementById('file-selector');
// let source = context.createMediaElementSource(music);

let fileIndex = 0;

function playMusic() {
    playBtn.classList.replace('fa-play', 'fa-pause');
    playBtn.setAttribute('title', 'Pause');
    music.play();
}

function pauseMusic() {
    playBtn.classList.replace('fa-pause', 'fa-play');
    playBtn.setAttribute('title', 'Play');
    music.pause();
}

function prevSong() {
    if (fileIndex === 0 && fileSelector.files.length > 1) {
        fileIndex = fileSelector.files.length - 1;
        loadSong();
        setTimeout(() => {
            playMusic();
        }, 50);
    }
    else if(fileSelector.files.length === 1){
        alert('No more songs to play');
        pauseMusic();
    }
    else {
        fileIndex--;
        loadSong();
        setTimeout(() => {
            playMusic();
        }, 50);
    }
}

function nextSong() {
    if (fileIndex === fileSelector.files.length - 1 && fileSelector.files.length > 1) {
        fileIndex = 0;
        loadSong();
        setTimeout(() => {
            playMusic();
        }, 50);
    }
    else if(fileSelector.files.length === 1){
        alert('No more songs to play');
        pauseMusic();
    }
    else {
        fileIndex++;
        loadSong();
        setTimeout(() => {
            playMusic();
        }, 50);
    }
}

function updateProgressBar(event) {
    // Destructuring the event
    const { duration, currentTime } = event.target;

    // Update progress bar width
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;

    // Calculate the duration
    const durationMinutes = Math.floor(duration / 60);
    let durationSeconds = Math.floor(duration % 60);
    if (durationSeconds < 10) {
        durationSeconds = `0${durationSeconds}`;
    }

    // Delay Switching duration Element to avoid NaN
    if(durationSeconds) {
        durationElement.textContent = `${durationMinutes}:${durationSeconds}`;
    }

    // Calculate the current time
    const currentMinutes = Math.floor(currentTime / 60);
    let currentSeconds = Math.floor(currentTime % 60);
    if (currentSeconds < 10) {
        currentSeconds = `0${currentSeconds}`;
    }
    currentTimeElement.textContent = `${currentMinutes}:${currentSeconds}`;
}

function setProgressBar(event) {
    const width = this.clientWidth;
    const clickX = event.offsetX;
    const { duration } = music;
    music.currentTime = (clickX/width) * duration;
}

function loadSong() {
    let songUrl = URL.createObjectURL(fileSelector.files[fileIndex]);
    if(songUrl) {
        // Code for extracting the metadata from audio files
        jsmediatags.read(fileSelector.files[fileIndex], {
            onSuccess: function(tag) {
                    let musicImage = tag.tags.picture;
                    if (musicImage) {
                        let blob = new Blob([new Uint8Array(musicImage.data)], { type: musicImage.format });
                        image.src = URL.createObjectURL(blob);
                    }
                    title.textContent = tag.tags.title;
                    artist.textContent = tag.tags.artist;
                    try {
                        music.src = songUrl;
                    } catch (error) {
                        music.srcObject = files[fileIndex];
                    }


                    setTimeout(() => {
                    // Destructuring the event
                    const { duration } = music;

                    // Calculate the duration
                    const durationMinutes = Math.floor(duration / 60);
                    let durationSeconds = Math.floor(duration % 60);
                    if (durationSeconds < 10) {
                    durationSeconds = `0${durationSeconds}`;
                    }

                    // Delay Switching duration Element to avoid NaN
                    if(durationSeconds) {
                    durationElement.textContent = `${durationMinutes}:${durationSeconds}`;
                    }
                    }, 200);


            },
            onError: function(error) {
                console.log(error);
                // A simple adjustment to play the songs without metadata
                try {
                    music.src = songUrl;
                } catch (error) {
                    music.srcObject = files[fileIndex];
                }


                setTimeout(() => {
                // Destructuring the event
                const { duration } = music;

                // Calculate the duration
                const durationMinutes = Math.floor(duration / 60);
                let durationSeconds = Math.floor(duration % 60);
                if (durationSeconds < 10) {
                durationSeconds = `0${durationSeconds}`;
                }

                // Delay Switching duration Element to avoid NaN
                if(durationSeconds) {
                durationElement.textContent = `${durationMinutes}:${durationSeconds}`;
                }
                }, 200);
            }
        });
    }
}

// Event Listeners

prevBtn.addEventListener('click', prevSong);

// Play / Pause toggle
playBtn.addEventListener('click', ()=>{
    music.paused? playMusic(): pauseMusic();
});

nextBtn.addEventListener('click', nextSong);

// to detect song change
fileSelector.addEventListener('change', () => {
    pauseMusic();
    loadSong();
    source.connect(splitter);
    splitter.connect(context.destination);
});

// to update progress bar
music.addEventListener('timeupdate', updateProgressBar);

// to detect song ended
music.addEventListener('ended', nextSong);

// to set music playback position
progressContainer.addEventListener('click', setProgressBar)

try {
    loadSong();
} catch (error) {

}
