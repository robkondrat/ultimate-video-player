window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const player = document.querySelector('.player');
const video = player.querySelector('.viewer');
const progress = player.querySelector('.progress');
const progressBar = player.querySelector('.progress__filled');
const toggle = player.querySelector('.toggle');
const skipButtons = player.querySelectorAll('[data-skip]');
const ranges = player.querySelectorAll('.player__slider');
const fullscreen = player.querySelector('.fullscreen');

function togglePlay() {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  };
};

function updateButton() {
  const icon = this.paused ? '►' : '❚ ❚';
  toggle.textContent = icon;
};

function skip() {
  video.currentTime += parseFloat(this.dataset.skip);
};

function handleRangeUpdate() {
  video[this.name] = this.value;
};

function handleProgress() {
  const percent = (video.currentTime / video.duration) * 100;
  progressBar.style.flexBasis = `${percent}%`;
};

function scrub(e) {
  const scrubTime = (e.offsetX / progress.offsetWidth) * video.duration;
  video.currentTime = scrubTime;
};

function toggleFullscreen() {
  // video.requestFullscreen();
  let elem = document.querySelector("video");

  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch(err => {
      alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name}`);
    });
  } else {
    document.exitFullscreen();
  };
};



video.addEventListener('click', togglePlay);
video.addEventListener('play', updateButton);
video.addEventListener('pause', updateButton);
video.addEventListener('timeupdate', handleProgress);
fullscreen.addEventListener('click', toggleFullscreen);


toggle.addEventListener('click', togglePlay);
skipButtons.forEach(button => button.addEventListener('click', skip));
ranges.forEach(range => range.addEventListener('change', handleRangeUpdate));
ranges.forEach(range => range.addEventListener('mousemove', handleRangeUpdate));

let mousedown = false;
progress.addEventListener('click', scrub);
progress.addEventListener('mousemove', (e) => mousedown && scrub(e));
progress.addEventListener('mousedown', () => mousedown = true);
progress.addEventListener('mouseup', () => mousedown = false);


// voice command


const recognition = new SpeechRecognition();
recognition.interimResults = true;

recognition.addEventListener('end', recognition.start);

function voiceControl(transcript) {
  const playCommand = 'play';
  if (transcript.includes(playCommand)) {
    togglePlay();
  };
  const pauseCommand = 'pause';
  if (transcript.includes(pauseCommand)) {
    togglePlay();
  };
  const fullscreenCommand = 'full screen';
  if (transcript.includes(fullscreenCommand)) {
    toggleFullscreen();
  };
  const skipAheadCommand = 'skip ahead';
  if (transcript.includes(skipAheadCommand)) {
    skip();
  };
}

recognition.addEventListener('result', e => {
  const transcript = Array.from(e.results)
    .map(result => result[0])
    .map(result => result.transcript)
    .join('')

    if(e.results[0].isFinal) {
      console.log(transcript);
      voiceControl(transcript);
    };


});

recognition.start();