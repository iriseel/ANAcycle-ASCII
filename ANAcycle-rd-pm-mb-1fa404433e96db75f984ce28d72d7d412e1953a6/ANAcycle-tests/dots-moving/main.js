// Generate placeholder items
const content = document.querySelector('.content');
for (let i = 0; i < 48; i++) {
  const item = document.createElement('div');
  item.className = 'placeholder-item';
  content.appendChild(item);
}

// Wire up migration manager once elements are loaded
window.addEventListener('load', () => {
  const dissolveElements = document.querySelectorAll('dissolve-element');
  if (dissolveElements.length >= 2) {
    const anaElement = dissolveElements[0]; // ANA element
    const cycleElement = dissolveElements[1]; // cycle element

    // Set up the migration manager
    window.migrationManager.setElements(anaElement, cycleElement);
  }
});

// ============================================
// SCREEN RECORDING
// ============================================

let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let displayStream = null;

async function startRecording() {
  try {
    // Capture the current tab/window
    // Note: Don't specify mediaSource to allow user to choose tab, window, or screen
    displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        frameRate: 60,
        displaySurface: 'browser' // Prefer browser tab
      },
      audio: false,
      preferCurrentTab: true // Chrome-specific hint to show current tab
    });

    // Set up MediaRecorder
    const options = {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 8000000 // 8 Mbps for good quality
    };

    // Fallback to vp8 if vp9 not supported
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm;codecs=vp8';
    }

    mediaRecorder = new MediaRecorder(displayStream, options);
    recordedChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      // Create blob and download
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `anacycle-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      // Stop all tracks
      displayStream.getTracks().forEach(track => track.stop());
      displayStream = null;

      console.log('Recording saved and stream stopped');
    };

    // Start recording
    mediaRecorder.start();
    isRecording = true;

    console.log('Recording started - press SPACE again to stop');

  } catch (err) {
    console.error('Error starting recording:', err);
    isRecording = false;
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    isRecording = false;
    console.log('Recording stopped - saving file...');
  }
}

function toggleRecording() {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

// Add spacebar listener for screen recording
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && event.target === document.body) {
    event.preventDefault(); // Prevent page scroll
    toggleRecording();
  }
});
