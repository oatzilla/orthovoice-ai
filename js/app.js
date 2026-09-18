/**
 * OrthoVoice AI — Main Application Controller
 * Coordinates audio recording, speech recognition, orthopedic entity extraction,
 * SOAP note generation, tab navigation, and text-to-speech synthesis.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Subsystems
  const localParser = new OrthoClinicalParser();
  const geminiService = new GeminiService();
  const ttsEngine = new VoiceTTSEngine();

  // Application State
  const state = {
    dialogueTurns: [],
    interimTurn: null,
    currentCaseId: null,
    currentSpeaker: 'Doctor',
    isProcessing: false,
    parsedData: null
  };

  // 2. DOM Elements Cache
  const elems = {
    // Status & Header
    systemStatus: document.getElementById('systemStatus'),
    scenarioSelect: document.getElementById('scenarioSelect'),
    btnLoadScenario: document.getElementById('btnLoadScenario'),
    btnOpenConfig: document.getElementById('btnOpenConfig'),
    btnClearAll: document.getElementById('btnClearAll'),
    configDialog: document.getElementById('configDialog'),
    btnCloseConfig: document.getElementById('btnCloseConfig'),
    btnSaveConfig: document.getElementById('btnSaveConfig'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    modelSelect: document.getElementById('modelSelect'),
    chkAutoSpeaker: document.getElementById('chkAutoSpeaker'),

    // Audio & Speech Controls
    btnToggleRecord: document.getElementById('btnToggleRecord'),
    recordBtnText: document.getElementById('recordBtnText'),
    btnPauseRecord: document.getElementById('btnPauseRecord'),
    btnAnalyzeNow: document.getElementById('btnAnalyzeNow'),
    
    // Transcript Area
    transcriptStream: document.getElementById('transcriptStream'),
    transcriptEmptyState: document.getElementById('transcriptEmptyState'),
    btnManualAddText: document.getElementById('btnManualAddText'),
    manualInputBox: document.getElementById('manualInputBox'),
    manualTextInput: document.getElementById('manualTextInput'),
    btnSubmitManualText: document.getElementById('btnSubmitManualText'),
    btnCopyTranscript: document.getElementById('btnCopyTranscript'),
    entityChips: document.getElementById('entityChips'),

    // Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),

    // SOAP Fields
    fieldCC: document.getElementById('fieldCC'),
    fieldPI: document.getElementById('fieldPI'),
    fieldPMH: document.getElementById('fieldPMH'),
    fieldPE: document.getElementById('fieldPE'),
    fieldImaging: document.getElementById('fieldImaging'),
    fieldDx: document.getElementById('fieldDx'),
    fieldDDx: document.getElementById('fieldDDx'),
    fieldTreatment: document.getElementById('fieldTreatment'),
    fieldAdvice: document.getElementById('fieldAdvice'),
    fieldFollowUp: document.getElementById('fieldFollowUp'),
    badgeCC: document.getElementById('badgeCC'),
    badgePE: document.getElementById('badgePE'),
    badgeDx: document.getElementById('badgeDx'),
    badgePlan: document.getElementById('badgePlan'),

    // Systematic Exam Grid Elements
    examInspectionContent: document.getElementById('examInspectionContent'),
    examPalpationContent: document.getElementById('examPalpationContent'),
    examROMContent: document.getElementById('examROMContent'),
    examSpecialTestsContent: document.getElementById('examSpecialTestsContent'),
    examNeuroContent: document.getElementById('examNeuroContent'),

    // TTS Assistant Elements
    ttsSpeechText: document.getElementById('ttsSpeechText'),
    btnTtsPlay: document.getElementById('btnTtsPlay'),
    btnTtsPause: document.getElementById('btnTtsPause'),
    btnTtsStop: document.getElementById('btnTtsStop'),
    btnRegenerateSpeechScript: document.getElementById('btnRegenerateSpeechScript'),
    btnPresetPatientSummary: document.getElementById('btnPresetPatientSummary'),
    btnPresetDoctorSummary: document.getElementById('btnPresetDoctorSummary'),
    btnPresetDischargeWarning: document.getElementById('btnPresetDischargeWarning'),

    // Export Elements
    emrPreviewText: document.getElementById('emrPreviewText'),
    btnCopyEmrText: document.getElementById('btnCopyEmrText'),
    btnPrintOpdCard: document.getElementById('btnPrintOpdCard'),
    btnDownloadJson: document.getElementById('btnDownloadJson'),

    // Footer
    wordCountLabel: document.getElementById('wordCountLabel'),
    entityCountLabel: document.getElementById('entityCountLabel'),
    toastContainer: document.getElementById('toastContainer')
  };

  // 3. Initialize STT Engine
  const sttEngine = new SpeechSTTEngine({
    onTranscriptUpdate: handleTranscriptUpdate,
    onStatusChange: updateRecordingStatus,
    onError: (errMsg) => showToast(errMsg, 'error')
  });

  // Load Saved Settings into Modal
  if (elems.apiKeyInput) elems.apiKeyInput.value = geminiService.getApiKey();
  if (elems.modelSelect) elems.modelSelect.value = geminiService.getModel();

  // ==========================================================================
  // Event Listeners Setup
  // ==========================================================================

  // Tab Navigation
  elems.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');
      elems.tabBtns.forEach(b => b.classList.remove('active'));
      elems.tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(targetTabId);
      if (targetContent) targetContent.classList.add('active');

      if (targetTabId === 'exportTab') {
        updateEmrPreview();
      }
    });
  });

  // Recording Controls
  elems.btnToggleRecord.addEventListener('click', () => {
    if (sttEngine.isRecording && !sttEngine.isPaused) {
      sttEngine.stop();
      triggerAIAnalysis();
    } else {
      sttEngine.start();
    }
  });

  elems.btnPauseRecord.addEventListener('click', () => {
    if (sttEngine.isPaused) {
      sttEngine.start();
    } else {
      sttEngine.pause();
    }
  });

  elems.btnAnalyzeNow.addEventListener('click', () => {
    triggerAIAnalysis();
  });

  // Manual Add Text Toggle
  elems.btnManualAddText.addEventListener('click', () => {
    const isVisible = elems.manualInputBox.style.display !== 'none';
    elems.manualInputBox.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) elems.manualTextInput.focus();
  });

  elems.btnSubmitManualText.addEventListener('click', submitManualText);
  elems.manualTextInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitManualText();
  });

  function submitManualText() {
    const text = elems.manualTextInput.value.trim();
    if (!text) return;

    const speakerRadio = document.querySelector('input[name="speakerRadio"]:checked');
    const speaker = speakerRadio ? speakerRadio.value : 'Doctor';

    addDialogueTurn(speaker, text);
    elems.manualTextInput.value = '';
    elems.manualTextInput.focus();
    triggerAIAnalysis();
  }

  // Copy Transcript
  elems.btnCopyTranscript.addEventListener('click', () => {
    if (state.dialogueTurns.length === 0) {
      showToast('ยังไม่มีข้อความบทสนทนาที่จะคัดลอก', 'error');
      return;
    }
    const fullText = state.dialogueTurns.map(t => `${t.speaker === 'Doctor' ? 'แพทย์' : 'ผู้ป่วย'}: ${t.text}`).join('\n');
    navigator.clipboard.writeText(fullText).then(() => {
      showToast('คัดลอกบทสนทนาเรียบร้อยแล้ว', 'success');
    });
  });

  // Load Preset Scenario
  elems.btnLoadScenario.addEventListener('click', () => {
    let caseKey = elems.scenarioSelect.value;
    if (!caseKey) {
      caseKey = 'oa_knee';
      elems.scenarioSelect.value = 'oa_knee';
    }
    loadPresetScenario(caseKey);
  });

  elems.scenarioSelect.addEventListener('change', () => {
    if (elems.scenarioSelect.value) {
      loadPresetScenario(elems.scenarioSelect.value);
    }
  });

  // Quick Scenario Pills (1-Click Instant Demo)
  document.querySelectorAll('.pill-btn').forEach(pill => {
    pill.addEventListener('click', () => {
      const scenarioKey = pill.getAttribute('data-scenario');
      if (scenarioKey) {
        if (elems.scenarioSelect) elems.scenarioSelect.value = scenarioKey;
        loadPresetScenario(scenarioKey);
      }
    });
  });

  // Clear All
  elems.btnClearAll.addEventListener('click', () => {
    if (confirm('คุณต้องการล้างข้อมูลการตรวจและเริ่มเคสใหม่หรือไม่?')) {
      clearAllData();
      showToast('ล้างข้อมูลเรียบร้อยแล้ว พร้อมเริ่มเคสใหม่', 'success');
    }
  });

  // Config Dialog
  elems.btnOpenConfig.addEventListener('click', () => {
    elems.configDialog.showModal();
  });

  elems.btnCloseConfig.addEventListener('click', () => {
    elems.configDialog.close();
  });

  elems.btnSaveConfig.addEventListener('click', () => {
    geminiService.setApiKey(elems.apiKeyInput.value);
    geminiService.setModel(elems.modelSelect.value);
    elems.configDialog.close();
    showToast('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว', 'success');
  });

  // TTS Controls
  elems.btnTtsPlay.addEventListener('click', () => {
    const text = elems.ttsSpeechText.value;
    ttsEngine.speak(text);
  });

  elems.btnTtsPause.addEventListener('click', () => {
    ttsEngine.pause();
  });

  elems.btnTtsStop.addEventListener('click', () => {
    ttsEngine.stop();
  });

  elems.btnRegenerateSpeechScript.addEventListener('click', () => {
    if (state.parsedData) {
      elems.ttsSpeechText.value = state.parsedData.patientInstructions;
      showToast('สร้างสคริปต์คำแนะนำผู้ป่วยใหม่เรียบร้อย', 'success');
    } else {
      triggerAIAnalysis();
    }
  });

  // TTS Script Presets
  elems.btnPresetPatientSummary.addEventListener('click', () => {
    setActiveTtsPresetBtn(elems.btnPresetPatientSummary);
    if (state.parsedData) {
      elems.ttsSpeechText.value = state.parsedData.patientInstructions;
    }
  });

  elems.btnPresetDoctorSummary.addEventListener('click', () => {
    setActiveTtsPresetBtn(elems.btnPresetDoctorSummary);
    if (state.parsedData) {
      const s = state.parsedData.soap;
      elems.ttsSpeechText.value = `สรุปเคสทางการแพทย์: ผู้ป่วยมาด้วย ${s.cc} ตรวจร่างกายพบ ${s.pe} การวินิจฉัยคือ ${s.dx} แผนการรักษาคือ ${s.treatment.replace(/\n/g, ' ')}`;
    }
  });

  elems.btnPresetDischargeWarning.addEventListener('click', () => {
    setActiveTtsPresetBtn(elems.btnPresetDischargeWarning);
    elems.ttsSpeechText.value = `สัญญาณเตือนสำคัญที่ต้องรีบมาโรงพยาบาลทันที:\n` +
      `1. มีอาการปวดรุนแรงขึ้นเฉียบพลัน ทานยาแก้ปวดแล้วไม่ทุเลา\n` +
      `2. ข้อบวมแดง ร้อนขึ้นอย่างเห็นได้ชัด หรือมีไข้สูง หนาวสั่น\n` +
      `3. มีอาการชาบริเวณหว่างขา ก้นกบ หรือกลั้นปัสสาวะและอุจจาระไม่ได้\n` +
      `4. ขา แขน หรือนิ้วเท้าอ่อนแรงอย่างกะทันหันจนก้าวเดินไม่ได้`;
  });

  function setActiveTtsPresetBtn(targetBtn) {
    [elems.btnPresetPatientSummary, elems.btnPresetDoctorSummary, elems.btnPresetDischargeWarning].forEach(b => b.classList.remove('active'));
    targetBtn.classList.add('active');
  }

  // Export / EMR Buttons
  elems.btnCopyEmrText.addEventListener('click', () => {
    const text = elems.emrPreviewText.textContent;
    navigator.clipboard.writeText(text).then(() => {
      showToast('คัดลอกเวชระเบียนรูปแบบ EMR ลงคลิปบอร์ดแล้ว', 'success');
    });
  });

  elems.btnPrintOpdCard.addEventListener('click', () => {
    window.print();
  });

  elems.btnDownloadJson.addEventListener('click', () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      dialogue: state.dialogueTurns,
      parsedRecord: state.parsedData
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ortho_record_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('ดาวน์โหลดไฟล์ JSON เรียบร้อยแล้ว', 'success');
  });

  // ==========================================================================
  // Core Business Logic: Speech Handling & Scenario Loading
  // ==========================================================================

  function handleTranscriptUpdate(result) {
    if (result.isFinal) {
      // Determine speaker
      const speaker = determineSpeakerHeuristic(result.text);
      addDialogueTurn(speaker, result.text);
      // Realtime entity preview
      updateEntityChipsRealtime();
    } else {
      renderInterimBubble(result.text);
    }
  }

  function determineSpeakerHeuristic(text) {
    if (!elems.chkAutoSpeaker.checked) {
      return state.currentSpeaker;
    }
    // Doctors typically ask questions or announce findings
    if (/(?:ตรวจ|หมอ|ขออนุญาต|พบว่า|lachman|mcmurray|slr|x-ray|ผลตรวจ|วินิจฉัย|จ่ายยา|นัด)/i.test(text)) {
      return 'Doctor';
    }
    // Patients report sensations, durations, daily life impact
    if (/(?:เป็นมา|ปวดมาก|สะดุด|เดินไม่ได้|หกล้ม|เตะบอล|ทานยา|แพ้ยา|ค่ะ|ครับหมอ|นอนไม่ได้)/i.test(text)) {
      return 'Patient';
    }
    // Default alternate
    return state.dialogueTurns.length % 2 === 0 ? 'Doctor' : 'Patient';
  }

  function addDialogueTurn(speaker, text) {
    state.dialogueTurns.push({
      speaker,
      text,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
    renderTranscriptStream();
  }

  function renderInterimBubble(interimText) {
    removeInterimBubble();
    if (!interimText) return;

    if (elems.transcriptEmptyState) elems.transcriptEmptyState.style.display = 'none';

    const div = document.createElement('div');
    div.id = 'interimDialogueBubble';
    div.className = `dialogue-item dialogue-doctor`;
    div.innerHTML = `
      <div class="dialogue-speaker"><span>กำลังพูด...</span></div>
      <div class="dialogue-bubble interim">${interimText}</div>
    `;
    elems.transcriptStream.appendChild(div);
    elems.transcriptStream.scrollTop = elems.transcriptStream.scrollHeight;
  }

  function removeInterimBubble() {
    const existing = document.getElementById('interimDialogueBubble');
    if (existing) existing.remove();
  }

  function renderTranscriptStream() {
    removeInterimBubble();
    elems.transcriptStream.innerHTML = '';

    if (state.dialogueTurns.length === 0) {
      elems.transcriptStream.appendChild(elems.transcriptEmptyState);
      elems.transcriptEmptyState.style.display = 'flex';
      updateCounts(0, 0);
      return;
    }

    if (elems.transcriptEmptyState) elems.transcriptEmptyState.style.display = 'none';

    state.dialogueTurns.forEach(turn => {
      const isDoctor = turn.speaker === 'Doctor';
      const item = document.createElement('div');
      item.className = `dialogue-item ${isDoctor ? 'dialogue-doctor' : 'dialogue-patient'}`;
      item.innerHTML = `
        <div class="dialogue-speaker">
          <span>${isDoctor ? '👨‍⚕️ แพทย์ (Doctor)' : '🧑 ผู้ป่วย (Patient)'}</span>
          <span class="dialogue-time">${turn.timestamp || ''}</span>
        </div>
        <div class="dialogue-bubble">${turn.text}</div>
      `;
      elems.transcriptStream.appendChild(item);
    });

    elems.transcriptStream.scrollTop = elems.transcriptStream.scrollHeight;
    
    // Update word count
    const totalWords = state.dialogueTurns.reduce((acc, t) => acc + t.text.split(/\s+/).length, 0);
    updateCounts(totalWords, null);
  }

  function updateRecordingStatus(status, label) {
    elems.systemStatus.className = 'status-indicator';
    if (status === 'recording') {
      elems.systemStatus.classList.add('recording');
      elems.btnToggleRecord.classList.add('is-recording');
      elems.recordBtnText.textContent = 'สิ้นสุดการฟัง (Stop & Parse)';
      elems.btnPauseRecord.disabled = false;
    } else if (status === 'paused') {
      elems.systemStatus.classList.add('paused');
      elems.recordBtnText.textContent = 'รับฟังต่อ (Resume)';
      elems.btnPauseRecord.disabled = false;
    } else if (status === 'processing') {
      elems.systemStatus.classList.add('processing');
    } else {
      elems.btnToggleRecord.classList.remove('is-recording');
      elems.recordBtnText.textContent = 'เริ่มรับฟังเสียง (Start Listening)';
      elems.btnPauseRecord.disabled = true;
    }
    const statusLabel = elems.systemStatus.querySelector('.status-label');
    if (statusLabel) statusLabel.textContent = label;
  }

  // Real-time Chip Extraction
  function updateEntityChipsRealtime() {
    const fullText = state.dialogueTurns.map(t => t.text).join(' ');
    const entities = localParser.extractEntities(fullText);
    renderEntityChips(entities);
  }

  function renderEntityChips(entities) {
    elems.entityChips.innerHTML = '';
    let totalCount = 0;

    const addChip = (name, typeClass) => {
      const chip = document.createElement('span');
      chip.className = `medical-chip ${typeClass}`;
      chip.textContent = name;
      elems.entityChips.appendChild(chip);
      totalCount++;
    };

    entities.anatomy.forEach(a => addChip(`🦴 ${a}`, 'chip-anatomy'));
    entities.tests.forEach(t => addChip(`🎯 ${t}`, 'chip-test'));
    entities.symptoms.forEach(s => addChip(`⚠️ ${s}`, 'chip-symptom'));
    entities.diagnoses.forEach(d => addChip(`🏷️ ${d}`, 'chip-dx'));
    entities.treatments.forEach(tr => addChip(`💊 ${tr}`, 'chip-drug'));

    if (totalCount === 0) {
      elems.entityChips.innerHTML = '<span class="chip-placeholder">ระบบจะตรวจจับชื่อข้อ อาการ การตรวจพิเศษ และยาอัตโนมัติ</span>';
    }

    updateCounts(null, totalCount);
  }

  function updateCounts(words, entities) {
    if (words !== null && elems.wordCountLabel) {
      elems.wordCountLabel.textContent = `${words} คำสนทนา`;
    }
    if (entities !== null && elems.entityCountLabel) {
      elems.entityCountLabel.textContent = `${entities} ศัพท์การแพทย์`;
    }
  }

  // ==========================================================================
  // AI Parsing & Record Population
  // ==========================================================================

  async function triggerAIAnalysis() {
    if (state.dialogueTurns.length === 0) {
      showToast('ไม่มีข้อมูลบทสนทนาสำหรับวิเคราะห์', 'error');
      return;
    }

    updateRecordingStatus('processing', 'AI กำลังสกัดข้อมูลการตรวจ...');
    state.isProcessing = true;

    try {
      // Use Gemini Service with fallback to Local Parser
      const result = await geminiService.extractOrthoRecord(state.dialogueTurns, localParser);
      state.parsedData = result;

      // Populate SOAP Note Tab
      populateSoapFields(result.soap);

      // Populate Systematic Exam Tab
      populateSystematicExam(result.systematicExam);

      // Populate TTS Voice Assistant Tab
      if (result.patientInstructions) {
        elems.ttsSpeechText.value = result.patientInstructions;
      }

      // Populate Entity Chips
      if (result.entities) {
        renderEntityChips(result.entities);
      }

      // Populate EMR Preview
      updateEmrPreview();

      updateRecordingStatus('ready', 'วิเคราะห์เสร็จสมบูรณ์ (Parsed)');
      if (result.routeReason) {
        showToast(result.routeReason, 'success');
      } else {
        showToast('AI แยกข้อมูลประวัติและการตรวจร่างกายเรียบร้อยแล้ว', 'success');
      }
    } catch (err) {
      console.error('Error during parsing:', err);
      updateRecordingStatus('ready', 'พร้อมรับฟัง (Ready)');
      showToast('เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล', 'error');
    } finally {
      state.isProcessing = false;
    }
  }

  function populateSoapFields(soap) {
    elems.fieldCC.value = soap.cc || '';
    elems.fieldPI.value = soap.pi || '';
    elems.fieldPMH.value = soap.pmh || '';
    elems.fieldPE.value = soap.pe || '';
    elems.fieldImaging.value = soap.imaging || '';
    elems.fieldDx.value = soap.dx || '';
    elems.fieldDDx.value = soap.ddx || '';
    elems.fieldTreatment.value = soap.treatment || '';
    elems.fieldAdvice.value = soap.advice || '';
    elems.fieldFollowUp.value = soap.followUp || '';

    // Badges update
    elems.badgeCC.textContent = soap.cc ? '1 รายการ' : '0 รายการ';
    elems.badgePE.textContent = soap.pe ? 'ตรวจพบ' : '0 ตรวจพบ';
    elems.badgeDx.textContent = soap.dx ? '1 ข้อวินิจฉัย' : '0 ข้อ';
    elems.badgePlan.textContent = soap.treatment ? 'มีแผนการรักษา' : '0 คำสั่ง';
  }

  function populateSystematicExam(sysExam) {
    renderExamCategory(elems.examInspectionContent, sysExam.inspection, 'ยังไม่พบข้อมูลการดูหรือการเดิน');
    renderExamCategory(elems.examPalpationContent, sysExam.palpation, 'ยังไม่พบข้อมูลจุดกดเจ็บ');
    renderExamCategory(elems.examROMContent, sysExam.rom, 'ยังไม่พบข้อมูลมุมองศาการเคลื่อนไหว');
    renderExamCategory(elems.examSpecialTestsContent, sysExam.specialTests, 'เช่น Lachman, McMurray, Spurling, SLR');
    renderExamCategory(elems.examNeuroContent, sysExam.neuro, 'Motor power, Sensation dermatome, Pulses');
  }

  function renderExamCategory(container, items, emptyText) {
    container.innerHTML = '';
    if (!items || items.length === 0) {
      container.innerHTML = `<div class="exam-item empty-hint">${emptyText}</div>`;
      return;
    }

    items.forEach(itemText => {
      const div = document.createElement('div');
      const isPositive = /(?:positive|\+|บวก|weakness|spasm|tenderness|click)/i.test(itemText);
      const isNormal = /(?:negative|ปกติ|intact|5\/5)/i.test(itemText);

      div.className = `exam-item ${isPositive ? 'positive-finding' : isNormal ? 'normal-finding' : ''}`;
      div.textContent = itemText;
      container.appendChild(div);
    });
  }

  function updateEmrPreview() {
    const s = {
      cc: elems.fieldCC.value,
      pi: elems.fieldPI.value,
      pmh: elems.fieldPMH.value,
      pe: elems.fieldPE.value,
      imaging: elems.fieldImaging.value,
      dx: elems.fieldDx.value,
      ddx: elems.fieldDDx.value,
      treatment: elems.fieldTreatment.value,
      advice: elems.fieldAdvice.value,
      followUp: elems.fieldFollowUp.value
    };

    const dateStr = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const emrText = `========================================================================
ORTHOPEDIC OUTPATIENT CLINICAL RECORD (OPD NOTE)
วันที่ตรวจ: ${dateStr}
แผนก: ศัลยกรรมกระดูกและข้อ (Department of Orthopedics)
========================================================================

[S] SUBJECTIVE:
- Chief Complaint: ${s.cc}
- Present Illness: ${s.pi}
- Past Medical History & Allergy: ${s.pmh}

[O] OBJECTIVE:
- Orthopedic Physical Examination:
  ${s.pe}
- Imaging & Diagnostics:
  ${s.imaging}

[A] ASSESSMENT:
- Primary Diagnosis: ${s.dx}
- Differential Diagnosis: ${s.ddx}

[P] PLAN & MANAGEMENT:
- Orders & Treatments:
  ${s.treatment}
- Patient Advice & Precautions: ${s.advice}
- Next Follow-up: ${s.followUp}

========================================================================
Recorded via OrthoVoice Ambient Scribe System (Confidential Medical Record)
========================================================================`;

    elems.emrPreviewText.textContent = emrText;
  }

  // ==========================================================================
  // Preset Scenario Loader (Demo Showcase)
  // ==========================================================================

  function loadPresetScenario(caseKey) {
    const scenario = window.ORTHO_SCENARIOS ? window.ORTHO_SCENARIOS[caseKey] : null;
    if (!scenario) return;

    // Stop current listening if active
    sttEngine.stop();

    // Clear state
    state.dialogueTurns = [];
    state.currentCaseId = caseKey;

    // Simulate animated stream of dialogue turns
    let turnIndex = 0;
    elems.transcriptStream.innerHTML = '';
    updateRecordingStatus('recording', `กำลังจำลองบทสนทนา: ${scenario.title}`);

    const interval = setInterval(() => {
      if (turnIndex < scenario.dialogue.length) {
        const turn = scenario.dialogue[turnIndex];
        addDialogueTurn(turn.speaker, turn.text);
        turnIndex++;
      } else {
        clearInterval(interval);
        updateRecordingStatus('ready', 'บทสนทนาครบถ้วน — กำลังวิเคราะห์...');
        triggerAIAnalysis();
      }
    }, 450); // Fluid, natural pacing for demo
  }

  function clearAllData() {
    sttEngine.stop();
    ttsEngine.stop();
    state.dialogueTurns = [];
    state.interimTurn = null;
    state.currentCaseId = null;
    state.parsedData = null;

    elems.scenarioSelect.value = '';
    renderTranscriptStream();
    renderEntityChips({ anatomy: [], tests: [], symptoms: [], diagnoses: [], treatments: [] });

    populateSoapFields({ cc: '', pi: '', pmh: '', pe: '', imaging: '', dx: '', ddx: '', treatment: '', advice: '', followUp: '' });
    populateSystematicExam({ inspection: [], palpation: [], rom: [], specialTests: [], neuro: [] });

    elems.ttsSpeechText.value = '';
    elems.emrPreviewText.textContent = '';
    updateRecordingStatus('ready', 'พร้อมรับฟัง (Ready)');
  }

  // Toast Helper
  function showToast(message, type = 'info') {
    if (!elems.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'toast-success' : type === 'error' ? 'toast-error' : ''}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
      <span>${message}</span>
    `;
    elems.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
});
