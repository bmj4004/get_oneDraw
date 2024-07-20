const displayCanvas = document.getElementById('displayCanvas');
const ctx = displayCanvas.getContext('2d');
const videoListDiv = document.getElementById('videoList');
const clearCanvasButton = document.getElementById('clearCanvasButton');

// 캔버스 크기 설정
displayCanvas.width = 500;
displayCanvas.height = 500;

function initializeCanvas() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "white";
}

initializeCanvas();

let isPainting = false;
let mediaRecorder;
let recordedChunks = [];
let videoCount = 0;

function addVideoToList(title) {
    const listItem = document.createElement('li');
    listItem.textContent = title;
    videoListDiv.appendChild(listItem);
}

displayCanvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    isPainting = true;
    const x = e.touches[0].clientX - displayCanvas.offsetLeft;
    const y = e.touches[0].clientY - displayCanvas.offsetTop;
    ctx.beginPath();
    ctx.moveTo(x, y);

    // 녹화 시작
    const stream = displayCanvas.captureStream(30);  // 30fps
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = function() {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        videoCount++;
        addVideoToList(`Video ${videoCount}`);
        recordedChunks = [];
    };

    mediaRecorder.start();
}, false);

displayCanvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (isPainting) {
        const x = e.touches[0].clientX - displayCanvas.offsetLeft;
        const y = e.touches[0].clientY - displayCanvas.offsetTop;
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}, false);

displayCanvas.addEventListener('touchend', function(e) {
    e.preventDefault();
    if (isPainting) {
        isPainting = false;
        ctx.closePath();
        mediaRecorder.stop();
    }
}, false);

clearCanvasButton.addEventListener('click', function() {
    initializeCanvas();
    while (videoListDiv.children.length > 1) {
        videoListDiv.removeChild(videoListDiv.lastChild);
    }
});
