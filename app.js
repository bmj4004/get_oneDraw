const displayCanvas = document.getElementById('displayCanvas');
const ctx = displayCanvas.getContext('2d');
const videoList = document.getElementById('videoList');
const clearCanvasButton = document.getElementById('clearCanvasButton');
const saveAllVideosButton = document.getElementById('saveAllVideosButton');

displayCanvas.width = 800;
displayCanvas.height = 800;

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
let videoURLs = [];
let videoCount = 0;

displayCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startPainting(e.touches[0]);
}, false);

displayCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isPainting) {
        draw(e.touches[0]);
    }
}, false);

displayCanvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopPainting();
}, false);

function startPainting(touch) {
    isPainting = true;
    const { clientX, clientY } = touch;
    ctx.beginPath();
    ctx.moveTo(clientX - displayCanvas.offsetLeft, clientY - displayCanvas.offsetTop);
    startRecording();
}

function draw(touch) {
    const { clientX, clientY } = touch;
    ctx.lineTo(clientX - displayCanvas.offsetLeft, clientY - displayCanvas.offsetTop);
    ctx.stroke();
}

function stopPainting() {
    isPainting = false;
    ctx.closePath();
    mediaRecorder.stop();
}

function startRecording() {
    recordedChunks = [];
    const stream = displayCanvas.captureStream(30); // 30fps
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = function() {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        videoURLs.push(url);
        addVideoToList(`Video ${++videoCount}`);
    };

    mediaRecorder.start();
}

function addVideoToList(title) {
    const listItem = document.createElement('li');
    listItem.textContent = title;
    videoList.appendChild(listItem);
}

clearCanvasButton.addEventListener('click', () => {
    initializeCanvas();
    while (videoList.firstChild) {
        videoList.removeChild(videoList.firstChild);
    }
    const h3 = document.createElement('h3');
    h3.textContent = 'Recorded Videos';
    videoList.appendChild(h3);
    videoURLs = [];
    videoCount = 0;
});

saveAllVideosButton.addEventListener('click', () => {
    videoURLs.forEach((url, index) => {
        setTimeout(() => {
            const a = document.createElement('a');
            a.href = url;
            a.download = `Video-${index + 1}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }, index * 100);
    });
});
