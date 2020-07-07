window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const player = document.querySelector('.player');
const video = player.querySelector('.viewer');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const progress = player.querySelector('.progress');
const progressBar = player.querySelector('.progress__filled');
const toggle = player.querySelector('.toggle');
const skipButtons = player.querySelectorAll('[data-skip]');
const ranges = player.querySelectorAll('.player__slider');
const fullscreen = player.querySelector('.fullscreen');
// const cloudinaryButton = document.getElementById("cloudinary_button");

// const uploadWidget = cloudinary.createUploadWidget(
//   {
//     cloudName: "heydanhey",
//     tags: ["video"],
//     resourceType: "video",
//     multiple: false,
//     clientAllowedFormats: ["mp4", "mov"],
//     uploadPreset: "tycwqdaj"
//   },
//   function(error, result) {
//     if (!error && result && result.event === "success") {
//       console.log("Done! Here is the image info: ", result.info.url);
//       video.src = result.info.url;
//       console.log(result);
//       let li = document.createElement("li");
//       li.innerHTML = result.info.created_at;
//       const att = document.createAttribute("id");
//       att.value = result.info.url;
//       li.setAttributeNode(att);
//       li.addEventListener("click", loadVideo);
//       list.prepend(li);
//       this.close();
//     }
//   }
// );

// function getVideos() {
//   fetch("https://res.cloudinary.com/heydanhey/video/list/video.json")
//     .then(response => response.json())
//     .then(data => addVideos(data.resources));
// }

// function addVideos(videos) {
//   console.log(videos);
//   videos.forEach(video => {
//     let li = document.createElement("li");
//     li.innerHTML = video.created_at;
//     const att = document.createAttribute("id");
//     att.value = `https://res.cloudinary.com/heydanhey/video/upload/v${video.version}/${video.public_id}.${video.format}`;
//     li.setAttributeNode(att);
//     li.addEventListener("click", loadVideo);
//     list.appendChild(li);
//   });
// }

// function loadVideo(event) {
//   video.src = event.target.id;
//   video.play();
//   console.log(event);
// }

// JS 30 functions
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

function skip(e, skipValue=null) {
  console.log(e, skipValue);
  if (skipValue) {
    video.currentTime += skipValue;
  } else {
    video.currentTime += parseFloat(this.dataset.skip);
  };
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

// required function for voice command
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

// function getVideo() {
//   navigator.mediaDevices.getUserMedia({ video: true, audio: false })
//     .then(localMediaStream => {
//       console.log(localMediaStream);
    
// //  DEPRECIATION : 
// //       The following has been depreceated by major browsers as of Chrome and Firefox.
// //       video.src = window.URL.createObjectURL(localMediaStream);
// //       Please refer to these:
// //       Deprecated  - https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
// //       Newer Syntax - https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject
      
//       video.srcObject = localMediaStream;
//       video.play();
//     })
//     .catch(err => {
//       console.error(`OH NO!!!`, err);
//     });
// }

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    // take the pixels out
    let pixels = ctx.getImageData(0, 0, width, height);
    // mess with them
    pixels = redEffect(pixels);

    pixels = rgbSplit(pixels);
    ctx.globalAlpha = 0.8;

    ctx.putImageData(pixels, 0, 0);
  }, 50);
}

function redEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i+=4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 200; // RED
    pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
  }
  return pixels;
}

function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i+=4) {
    pixels.data[i - 150] = pixels.data[i + 0]; // RED
    pixels.data[i + 500] = pixels.data[i + 1]; // GREEN
    pixels.data[i - 550] = pixels.data[i + 2]; // Blue
  }
  return pixels;
}

video.addEventListener('click', togglePlay);
video.addEventListener('play', updateButton);
video.addEventListener('pause', updateButton);
video.addEventListener('timeupdate', handleProgress);
fullscreen.addEventListener('click', toggleFullscreen);
video.addEventListener('canplay', paintToCanvas);


toggle.addEventListener('click', togglePlay);
skipButtons.forEach(button => button.addEventListener('click', skip));
ranges.forEach(range => range.addEventListener('change', handleRangeUpdate));
ranges.forEach(range => range.addEventListener('mousemove', handleRangeUpdate));

let mousedown = false;
progress.addEventListener('click', scrub);
progress.addEventListener('mousemove', (e) => mousedown && scrub(e));
progress.addEventListener('mousedown', () => mousedown = true);
progress.addEventListener('mouseup', () => mousedown = false);

// cloudinaryButton.addEventListener("click", () => {
//   uploadWidget.open();
// }, false);


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
    skip(null, 25);
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

// getVideo();

recognition.start();