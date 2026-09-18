/**
 * OrthoVoice AI — Text-to-Voice (TTS) Audio Assistant Engine
 * Synthesizes clear Thai speech for medical case summaries and patient discharge instructions
 * using the Web Speech Synthesis API.
 */

class VoiceTTSEngine {
  constructor(options = {}) {
    this.onStateChange = options.onStateChange || (() => {});
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.currentUtterance = null;
    this.isPlaying = false;
    this.isPaused = false;

    this.voiceSelectElem = document.getElementById('ttsVoiceSelect');
    this.rateRangeElem = document.getElementById('ttsRateRange');
    this.rateValueElem = document.getElementById('ttsRateValue');
    this.speechTextElem = document.getElementById('ttsSpeechText');
    this.waveBarsElem = document.getElementById('ttsWaveBars');
    this.statusTextElem = document.getElementById('ttsStatusText');
    this.playBtnElem = document.getElementById('btnTtsPlay');
    this.playBtnTextElem = document.getElementById('ttsPlayBtnText');
    this.pauseBtnElem = document.getElementById('btnTtsPause');
    this.stopBtnElem = document.getElementById('btnTtsStop');

    this.initVoices();
    this.bindEvents();
  }

  initVoices() {
    if (!this.synth) {
      console.warn('Speech Synthesis API is not supported in this browser.');
      return;
    }

    const loadVoices = () => {
      this.voices = this.synth.getVoices();
      this.populateVoiceSelect();
    };

    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  populateVoiceSelect() {
    if (!this.voiceSelectElem) return;
    this.voiceSelectElem.innerHTML = '';

    // Prioritize Thai voices (th-TH, th)
    const thaiVoices = this.voices.filter(v => v.lang.startsWith('th'));
    const otherVoices = this.voices.filter(v => !v.lang.startsWith('th'));

    const sortedVoices = [...thaiVoices, ...otherVoices];

    if (sortedVoices.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'ค่าเริ่มต้นระบบ (Default Thai System Voice)';
      this.voiceSelectElem.appendChild(opt);
      return;
    }

    sortedVoices.forEach((voice, index) => {
      const opt = document.createElement('option');
      opt.value = voice.name;
      const isThai = voice.lang.startsWith('th');
      opt.textContent = `${isThai ? '🇹🇭 ' : '🌐 '}${voice.name} (${voice.lang})${isThai ? ' [แนะนำ]' : ''}`;
      if (isThai && index === 0) {
        opt.selected = true;
      }
      this.voiceSelectElem.appendChild(opt);
    });
  }

  bindEvents() {
    if (this.rateRangeElem && this.rateValueElem) {
      this.rateRangeElem.addEventListener('input', (e) => {
        this.rateValueElem.textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
      });
    }
  }

  /**
   * Speak the given text or the text currently in the textarea
   */
  speak(textToSpeak) {
    if (!this.synth) {
      alert('เบราว์เซอร์นี้ไม่รองรับการสังเคราะห์เสียง (Web Speech Synthesis)');
      return;
    }

    const text = textToSpeak || (this.speechTextElem ? this.speechTextElem.value : '');
    if (!text || text.trim().length === 0) {
      alert('กรุณากรอกหรือสกัดข้อมูลข้อความที่ต้องการอ่านออกเสียงก่อน');
      return;
    }

    // If currently paused, resume instead
    if (this.isPaused && this.isPlaying) {
      this.resume();
      return;
    }

    // Cancel any ongoing speech
    this.stop();

    // Prepare speech utterance
    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    // Set voice
    const selectedVoiceName = this.voiceSelectElem ? this.voiceSelectElem.value : null;
    if (selectedVoiceName) {
      const chosenVoice = this.voices.find(v => v.name === selectedVoiceName);
      if (chosenVoice) utterance.voice = chosenVoice;
    }

    // Set language fallback
    utterance.lang = 'th-TH';

    // Set rate
    const rate = this.rateRangeElem ? parseFloat(this.rateRangeElem.value) : 1.0;
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Events
    utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      this.updateUI('playing', 'กำลังอ่านออกเสียง...');
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.updateUI('idle', 'อ่านออกเสียงเสร็จสิ้น');
    };

    utterance.onerror = (event) => {
      console.warn('Speech synthesis error:', event);
      this.isPlaying = false;
      this.isPaused = false;
      this.updateUI('idle', 'เกิดข้อผิดพลาดในการอ่านเสียง');
    };

    this.synth.speak(utterance);
  }

  pause() {
    if (this.synth && this.isPlaying && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.updateUI('paused', 'หยุดชั่วคราว');
    }
  }

  resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.updateUI('playing', 'กำลังอ่านออกเสียง...');
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isPlaying = false;
      this.isPaused = false;
      this.updateUI('idle', 'พร้อมอ่านออกเสียง');
    }
  }

  updateUI(state, message) {
    if (this.statusTextElem) {
      this.statusTextElem.textContent = message;
    }

    if (this.waveBarsElem) {
      if (state === 'playing') {
        this.waveBarsElem.classList.add('is-playing');
      } else {
        this.waveBarsElem.classList.remove('is-playing');
      }
    }

    if (this.playBtnElem && this.playBtnTextElem) {
      if (state === 'playing') {
        this.playBtnTextElem.textContent = 'กำลังอ่าน...';
        this.playBtnElem.classList.add('btn-accent');
      } else {
        this.playBtnTextElem.textContent = 'อ่านออกเสียง (Play Voice)';
        this.playBtnElem.classList.remove('btn-accent');
      }
    }

    if (this.pauseBtnElem) {
      this.pauseBtnElem.disabled = (state !== 'playing');
    }

    if (this.stopBtnElem) {
      this.stopBtnElem.disabled = (state === 'idle');
    }
  }
}

// Export globally
if (typeof window !== 'undefined') {
  window.VoiceTTSEngine = VoiceTTSEngine;
}
