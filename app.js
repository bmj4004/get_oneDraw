const displayCanvas = document.getElementById('displayCanvas');
const recordingCanvas = document.getElementById('recordingCanvas');
const displayCtx = displayCanvas.getContext('2d');
const recordingCtx = recordingCanvas.getContext('2d');

displayCanvas.width = window.innerWidth;
displayCanvas.height = window.innerHeight;
recordingCanvas.width = displayCanvas.width;
recordingCanvas.height = displayCanvas.height;

let isPainting = false;
let mediaRecorder;
let recordedChunks = [];
let videoBlobs = []; // 모든 비디오의 Blob 저장

function startRecording() {
    recordedChunks = [];
    const stream = recordingCanvas.captureStream(30); // 30fps
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = function(e) {
        if (e.data.size > 0) {
            recordedChunks.push(e.data);
        }
    };
    
    mediaRecorder.onstop = function() {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        videoBlobs.push(blob); // Blob 리스트에 추가
    };
    
    mediaRecorder.start();
}

function stopRecording() {
    mediaRecorder.stop();
    recordingCtx.clearRect(0, 0, recordingCanvas.width, recordingCanvas.height); // 녹화용 캔버스 초기화
}

displayCanvas.addEventListener('touchstart', function(e) {
    isPainting = true;
    const { clientX, clientY } = e.touches[0];
    displayCtx.moveTo(clientX, clientY);
    recordingCtx.moveTo(clientX, clientY); // 녹화용 캔버스에도 동일하게 적용
    startRecording(); // 녹화 시작
}, false);

displayCanvas.addEventListener('touchmove', function(e) {
    if (isPainting) {
        const { clientX, clientY } = e.touches[0];
        displayCtx.lineTo(clientX, clientY);
        displayCtx.stroke();
        recordingCtx.lineTo(clientX, clientY);
        recordingCtx.stroke(); // 녹화용 캔버스에 획 그리기
    }
}, false);

displayCanvas.addEventListener('touchend', function() {
    isPainting = false;
    stopRecording(); // 녹화 중지
}, false);

displayCtx.lineWidth = 5; // 선 굵기 설정
recordingCtx.lineWidth = 5; // 녹화용 캔버스의 선 굵기도 동일하게 설정

function downloadAllVideos() {
    videoBlobs.forEach((blob, index) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `touchPath-${index+1}.webm`;
        a.click();
        URL.revokeObjectURL(url);
    });
}
