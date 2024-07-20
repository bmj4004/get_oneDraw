const displayCanvas = document.getElementById('displayCanvas');
const recordingCanvas = document.getElementById('recordingCanvas');
const displayCtx = displayCanvas.getContext('2d');
const recordingCtx = recordingCanvas.getContext('2d');
const videoListDiv = document.getElementById('videoList');

displayCanvas.width = window.innerWidth;
displayCanvas.height = window.innerHeight;
recordingCanvas.width = displayCanvas.width;
recordingCanvas.height = displayCanvas.height;

function initializeCanvas(ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "white";
}

// 캔버스 초기화
initializeCanvas(displayCtx);
initializeCanvas(recordingCtx);

let isPainting = false;
let mediaRecorder;
let recordedChunks = [];

function startRecording() {
    recordedChunks = [];
    const stream = recordingCanvas.captureStream(30); // 30fps
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/mp4' });

    mediaRecorder.ondataavailable = function(e) {
        if (e.data.size > 0) {
            recordedChunks.push(e.data);
        }
    };

    mediaRecorder.onstop = function() {
        const blob = new Blob(recordedChunks, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        displayVideoList(url);
    };

    mediaRecorder.start();
}

function displayVideoList(videoSrc) {
    const videoElement = document.createElement('video');
    videoElement.src = videoSrc;
    videoElement.controls = true;
    videoElement.style.width = "300px"; // 비디오 크기 조정
    videoListDiv.appendChild(videoElement);
}

function stopRecording() {
    mediaRecorder.stop();
    initializeCanvas(recordingCtx); // 녹화용 캔버스 초기화
}

displayCanvas.addEventListener('touchstart', function(e) {
    isPainting = true;
    const { clientX, clientY } = e.touches[0];
    displayCtx.moveTo(clientX, clientY);
    recordingCtx.moveTo(clientX, clientY);
    startRecording();
}, false);

displayCanvas.addEventListener('touchmove', function(e) {
    if (isPainting) {
        const { clientX, clientY } = e.touches[0];
        displayCtx.lineTo(clientX, clientY);
        displayCtx.stroke();
        recordingCtx.lineTo(clientX, clientY);
        recordingCtx.stroke();
    }
}, false);

displayCanvas.addEventListener('touchend', function() {
    isPainting = false;
    stopRecording();
}, false);
