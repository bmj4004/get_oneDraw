const displayCanvas = document.getElementById('displayCanvas');
const recordingCanvas = document.getElementById('recordingCanvas');
const displayCtx = displayCanvas.getContext('2d');
const recordingCtx = recordingCanvas.getContext('2d');
const videoListDiv = document.getElementById('videoList');

displayCanvas.width = window.innerWidth;
displayCanvas.height = window.innerHeight;
recordingCanvas.width = displayCanvas.width;
recordingCanvas.height = displayCanvas.height;

function initializeCanvas(ctx, keepDrawing = false) {
    if (!keepDrawing) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    ctx.lineWidth = 5;
    ctx.strokeStyle = "white";
}

initializeCanvas(displayCtx, true); // 표시용 캔버스는 내용 유지
initializeCanvas(recordingCtx); // 녹화용 캔버스는 내용 비우기

let isPainting = false;
let mediaRecorder;
let recordedChunks = [];
let videoCount = 0;

function startRecording() {
    initializeCanvas(recordingCtx); // 녹화 시작 전에 캔버스 초기화
    recordedChunks = [];
    const stream = recordingCanvas.captureStream(30); // 30fps
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = function(e) {
        if (e.data.size > 0) {
            recordedChunks.push(e.data);
        }
    };

    mediaRecorder.onstop = function() {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        videoCount++;
        displayVideoList(url, videoCount);
    };

    mediaRecorder.start();
}

function stopRecording() {
    mediaRecorder.stop();
}

function displayVideoList(videoSrc, index) {
    const videoTitle = document.createElement('p');
    videoTitle.textContent = `Video ${index}`;
    videoTitle.style.cursor = 'pointer';
    videoTitle.onclick = function() {
        const a = document.createElement('a');
        a.href = videoSrc;
        a.download = `RecordedVideo-${index}.webm`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    videoListDiv.appendChild(videoTitle);
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
