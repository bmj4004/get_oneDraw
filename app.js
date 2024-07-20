const displayCanvas = document.getElementById('displayCanvas');
const ctx = displayCanvas.getContext('2d');
const videoListDiv = document.getElementById('videoList');
const clearCanvasButton = document.getElementById('clearCanvasButton');

// 캔버스 설정
displayCanvas.width = 500;  // 1:1 비율을 위해 너비와 높이를 같게 설정
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

displayCanvas.addEventListener('touchstart', function(e) {
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
        const url = URL.createObjectURL(blob);
        const videoElement = document.createElement('video');
        videoElement.src = url;
        videoElement.controls = true;
        videoElement.width = 250;
        videoListDiv.appendChild(videoElement);
        recordedChunks = [];  // 초기화
    };

    mediaRecorder.start();
}, false);

displayCanvas.addEventListener('touchmove', function(e) {
    if (isPainting) {
        const x = e.touches[0].clientX - displayCanvas.offsetLeft;
        const y = e.touches[0].clientY - displayCanvas.offsetTop;
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}, false);

displayCanvas.addEventListener('touchend', function() {
    isPainting = false;
    mediaRecorder.stop();
    ctx.closePath();
}, false);

clearCanvasButton.addEventListener('click', function() {
    initializeCanvas();
});
