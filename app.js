const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let isRecording = false;
let recorder, stream;
let videoList = document.getElementById('videos');

canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    ctx.moveTo(touch.clientX, touch.clientY);
    ctx.beginPath();
    startRecording();
});

canvas.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    ctx.lineTo(touch.clientX, touch.clientY);
    ctx.stroke();
});

canvas.addEventListener('touchend', (e) => {
    ctx.closePath();
    stopRecording();
});

function startRecording() {
    if (!isRecording) {
        stream = canvas.captureStream(30); // 30fps로 캡처
        recorder = new MediaRecorder(stream);
        let chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
            let blob = new Blob(chunks, { type: 'video/mp4' });
            let url = URL.createObjectURL(blob);
            let video = document.createElement('video');
            video.src = url;
            video.controls = true;
            let downloadBtn = document.createElement('button');
            downloadBtn.textContent = '다운로드';
            downloadBtn.onclick = () => downloadVideo(url);
            videoList.appendChild(video);
            videoList.appendChild(downloadBtn);
        };
        recorder.start();
        isRecording = true;
    }
}

function stopRecording() {
    if (isRecording) {
        recorder.stop();
        stream.getTracks().forEach(track => track.stop());
        isRecording = false;
    }
}

function downloadVideo(url) {
    let a = document.createElement('a');
    a.href = url;
    a.download = 'recorded.mp4';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    videoList.innerHTML = ''; // 비디오 목록도 초기화
}

