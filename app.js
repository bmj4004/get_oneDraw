const displayCanvas = document.getElementById('displayCanvas');
const recordingCanvas = document.getElementById('recordingCanvas');
const displayCtx = displayCanvas.getContext('2d');
const recordingCtx = recordingCanvas.getContext('2d');
const videoListDiv = document.getElementById('videoList');
const saveAllVideosButton = document.getElementById('saveAllVideosButton');
const clearVideoListButton = document.getElementById('clearVideoListButton');

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

initializeCanvas(displayCtx);
initializeCanvas(recordingCtx);

let isPainting = false;
let mediaRecorder;
let recordedChunks = [];
let videoCount = 0;
let videoURLs = [];

function startRecording() {
    initializeCanvas(recordingCtx); // 녹화 시작 전에 캔버스 초기화
    recordedChunks = [];
    const stream = recordingCanvas.captureStream(30);
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
        videoURLs.push({ url: url, title: `Video ${videoCount}` });
        displayVideoList(`Video ${videoCount}`);
    };

    mediaRecorder.start();
}

function stopRecording() {
    mediaRecorder.stop();
}

function displayVideoList(title) {
    const videoTitle = document.createElement('p');
    videoTitle.textContent = title;
    videoListDiv.appendChild(videoTitle);
}

function clearVideoList() {
    while (videoListDiv.children.length > 1) { // 첫 번째 자식 요소 (h3 태그)를 제외하고 모든 자식 요소 제거
        videoListDiv.removeChild(videoListDiv.lastChild);
    }
    videoURLs = []; // URL 목록 초기화
}

saveAllVideosButton.addEventListener('click', function() {
    videoURLs.forEach((video, index) => {
        setTimeout(() => {
            const a = document.createElement('a');
            a.href = video.url;
            a.download = `${video.title}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }, index * 100); // 각 파일 다운로드 사이에 100ms 지연
    });
});

clearVideoListButton.addEventListener('click', clearVideoList);

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
