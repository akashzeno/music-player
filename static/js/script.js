const jsmediatags = window.jsmediatags;
const image = document.querySelector('img');
const title = document.querySelector('#title');
const artist = document.querySelector('#artist');
const music = document.querySelector('audio');
const prevBtn = document.getElementById('prev');
const playBtn = document.getElementById('play');
const nextBtn = document.getElementById('next');
const progress = document.getElementById('progress');
const currentTimeElement = document.getElementById('current-time');
const durationElement = document.getElementById('duration');
const progressContainer = document.getElementById('progress-container');
const playerContainer = document.querySelector('.player-container');
const fileSelector = document.getElementById('file-selector');

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
