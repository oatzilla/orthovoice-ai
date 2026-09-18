/**
 * OrthoVoice AI — Speech-to-Text (STT) & Audio Waveform Visualizer
 * Continuous Thai/English speech recognition using Web Speech API
 * with live Web Audio API Canvas waveform visualizer.
 */

class SpeechSTTEngine {
  constructor(options = {}) {
    this.onTranscriptUpdate = options.onTranscriptUpdate || (() => {});
    this.onStatusChange = options.onStatusChange || (() => {});
    this.onError = options.onError || (() => {});

    this.isRecording = false;
    this.isPaused = false;
    this.recognition = null;
    this.audioContext = null;
    this.analyser = null;
    this.microphoneStream = null;
    this.canvasAnimationId = null;
    
    this.recordingStartTime = 0;
    this.timerInterval = null;
    this.elapsedSeconds = 0;

    this.canvas = document.getElementById('waveformCanvas');
    this.canvasCtx = this.canvas ? this.canvas.getContext('2d') : null;

    this.initSpeechRecognition();
  }

  /**
   * Initialize Web Speech Recognition API
   */
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API is not supported in this browser. Fallback simulator available.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'th-TH'; // Primary Thai, handles English loan words natively
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isRecording = true;
      this.isPaused = false;
      this.onStatusChange('recording', 'กำลังรับฟังเสียง (Listening...)');
      this.startTimer();
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        } else {
          interimTranscript += transcriptPart;
        }
      }

      if (finalTranscript.trim().length > 0) {
        this.onTranscriptUpdate({
          text: finalTranscript.trim(),
          isFinal: true
        });
      } else if (interimTranscript.trim().length > 0) {
        this.onTranscriptUpdate({
          text: interimTranscript.trim(),
          isFinal: false
        });
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        this.onError('ไม่ได้รับอนุญาตให้ใช้ไมโครโฟน (กรุณาอนุญาตในเบราว์เซอร์)');
        this.stop();
      }
    };

    this.recognition.onend = () => {
      // Auto-restart if user did not manually stop (for true continuous ambient scribe)
      if (this.isRecording && !this.isPaused) {
        try {
          this.recognition.start();
        } catch (e) {
          // Ignore already started errors
        }
      } else if (!this.isPaused) {
        this.onStatusChange('ready', 'พร้อมรับฟัง (Ready)');
        this.stopTimer();
      }
    };
  }

  /**
   * Start listening and recording
   */
  async start() {
    if (this.isRecording && !this.isPaused) return;

    try {
      // Start Audio Visualizer
      await this.startVisualizer();

      if (this.recognition) {
        this.recognition.start();
      } else {
        // Mock fallback if browser doesn't have Web Speech
        this.isRecording = true;
        this.onStatusChange('recording', 'กำลังรับฟัง (โหมดจำลองคลื่นเสียง)');
        this.startTimer();
      }
    } catch (err) {
      console.warn('Error starting speech recognition or audio visualizer:', err);
      // Fallback start visualizer in simulated mode
      this.startSimulatedVisualizer();
      this.isRecording = true;
      this.onStatusChange('recording', 'กำลังรับฟังเสียง');
      this.startTimer();
    }
  }

  /**
   * Pause listening
   */
  pause() {
    if (!this.isRecording || this.isPaused) return;
    this.isPaused = true;
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    this.onStatusChange('paused', 'พักการรับฟังชั่วคราว (Paused)');
    this.pauseTimer();
  }

  /**
   * Stop listening completely
   */
  stop() {
    this.isRecording = false;
    this.isPaused = false;
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
    this.stopVisualizer();
    this.stopTimer();
    this.onStatusChange('ready', 'พร้อมรับฟัง (Ready)');
  }

  /**
   * Start Canvas Audio Waveform Visualizer using Web Audio API
   */
  async startVisualizer() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.startSimulatedVisualizer();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.microphoneStream = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);

      this.drawWaveform();
    } catch (e) {
      console.warn('Microphone stream access not granted for visualizer. Using simulated wave.', e);
      this.startSimulatedVisualizer();
    }
  }

  /**
   * Render real audio frequencies onto the Canvas
   */
  drawWaveform() {
    if (!this.canvas || !this.canvasCtx || !this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      this.canvasAnimationId = requestAnimationFrame(render);
      this.analyser.getByteFrequencyData(dataArray);

      const width = this.canvas.width;
      const height = this.canvas.height;
      this.canvasCtx.clearRect(0, 0, width, height);

      // Create clean medical blue gradient
      const gradient = this.canvasCtx.createLinearGradient(0, height, width, 0);
      gradient.addColorStop(0, '#1d4ed8');
      gradient.addColorStop(0.5, '#2563eb');
      gradient.addColorStop(1, '#3b82f6');

      const barWidth = (width / bufferLength) * 2.2;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height * 0.85;

        this.canvasCtx.fillStyle = gradient;
        this.canvasCtx.shadowBlur = 4;
        this.canvasCtx.shadowColor = 'rgba(37, 99, 235, 0.25)';
        this.canvasCtx.fillRect(x, height - barHeight - 4, barWidth - 1, barHeight + 4);

        x += barWidth + 1;
      }
    };

    render();
  }

  /**
   * Simulated dynamic wave if physical mic visualizer is unavailable
   */
  startSimulatedVisualizer() {
    if (!this.canvas || !this.canvasCtx) return;
    let phase = 0;

    const render = () => {
      this.canvasAnimationId = requestAnimationFrame(render);
      const width = this.canvas.width;
      const height = this.canvas.height;
      this.canvasCtx.clearRect(0, 0, width, height);

      this.canvasCtx.lineWidth = 2.5;
      this.canvasCtx.strokeStyle = '#2563eb';
      this.canvasCtx.shadowBlur = 5;
      this.canvasCtx.shadowColor = 'rgba(37, 99, 235, 0.3)';
      this.canvasCtx.beginPath();

      const numPoints = 80;
      const step = width / numPoints;

      for (let i = 0; i <= numPoints; i++) {
        const x = i * step;
        const amplitude = this.isRecording && !this.isPaused ? 18 : 3;
        const y = height / 2 + Math.sin(i * 0.15 + phase) * amplitude * Math.cos(i * 0.05 + phase * 0.5);

        if (i === 0) this.canvasCtx.moveTo(x, y);
        else this.canvasCtx.lineTo(x, y);
      }

      this.canvasCtx.stroke();
      phase += 0.08;
    };

    render();
  }

  stopVisualizer() {
    if (this.canvasAnimationId) {
      cancelAnimationFrame(this.canvasAnimationId);
      this.canvasAnimationId = null;
    }
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach(track => track.stop());
      this.microphoneStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.canvas && this.canvasCtx) {
      this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  // Timer helpers
  startTimer() {
    this.stopTimer();
    const timerElem = document.getElementById('recordingTimer');
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      const mins = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
      const secs = String(this.elapsedSeconds % 60).padStart(2, '0');
      if (timerElem) timerElem.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  pauseTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.elapsedSeconds = 0;
    const timerElem = document.getElementById('recordingTimer');
    if (timerElem) timerElem.textContent = '00:00';
  }
}

// Export globally
if (typeof window !== 'undefined') {
  window.SpeechSTTEngine = SpeechSTTEngine;
}
