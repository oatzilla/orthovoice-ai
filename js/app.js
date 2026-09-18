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
    btnOpenConfig: document.getElementById('btnOpenConfig'),
    btnClearAll: document.getElementById('btnClearAll'),
    configDialog: document.getElementById('configDialog'),
    btnCloseConfig: document.getElementById('btnCloseConfig'),
    btnSaveConfig: document.getElementById('btnSaveConfig'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    modelSelect: document.getElementById('modelSelect'),
    chkAutoSpeaker: document.getElementById('chkAutoSpeaker'),
    sheetWebAppUrlInput: document.getElementById('sheetWebAppUrlInput'),
    btnCopyAppsScript: document.getElementById('btnCopyAppsScript'),
    btnTestSheetSync: document.getElementById('btnTestSheetSync'),

    // Top Action Buttons
    btnSaveCase: document.getElementById('btnSaveCase'),
    btnSaveCaseText: document.getElementById('btnSaveCaseText'),
    btnOpenSavedCases: document.getElementById('btnOpenSavedCases'),
    savedCasesCountBadge: document.getElementById('savedCasesCountBadge'),
    btnPrintReport: document.getElementById('btnPrintReport'),
    btnNewCase: document.getElementById('btnNewCase'),

    // Patient Demographics
    patientInfoBar: document.getElementById('patientInfoBar'),
    patientName: document.getElementById('patientName'),
    patientHn: document.getElementById('patientHn'),
    patientAge: document.getElementById('patientAge'),
    patientGender: document.getElementById('patientGender'),
    patientDate: document.getElementById('patientDate'),
    patientDoctor: document.getElementById('patientDoctor'),
    patientCoverage: document.getElementById('patientCoverage'),
    activeCaseTag: document.getElementById('activeCaseTag'),
    btnQuickDemoPatient: document.getElementById('btnQuickDemoPatient'),

    // Saved Cases Modal
    savedCasesModal: document.getElementById('savedCasesModal'),
    btnCloseSavedCases: document.getElementById('btnCloseSavedCases'),
    btnCloseSavedCasesFooter: document.getElementById('btnCloseSavedCasesFooter'),
    inputSearchCases: document.getElementById('inputSearchCases'),
    btnSyncCasesNow: document.getElementById('btnSyncCasesNow'),
    savedCasesContainer: document.getElementById('savedCasesContainer'),
    savedCasesCountLabel: document.getElementById('savedCasesCountLabel'),
    sheetSyncBanner: document.getElementById('sheetSyncBanner'),

    // Print Report Modal
    printReportModal: document.getElementById('printReportModal'),
    btnPrintModalConfirm: document.getElementById('btnPrintModalConfirm'),
    btnBackToEditFromPrint: document.getElementById('btnBackToEditFromPrint'),
    btnClosePrintReport: document.getElementById('btnClosePrintReport'),
    printPaperSheet: document.getElementById('printPaperSheet'),

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

  // Clear All
  elems.btnClearAll.addEventListener('click', () => {
    if (confirm('คุณต้องการล้างข้อมูลการตรวจและเริ่มเคสใหม่หรือไม่?')) {
      clearAllData();
      showToast('ล้างข้อมูลเรียบร้อยแล้ว พร้อมเริ่มเคสใหม่', 'success');
    }
  });

  // Set Default Date to Today
  if (elems.patientDate && !elems.patientDate.value) {
    elems.patientDate.valueAsDate = new Date();
  }

  // Load Saved Google Sheets Config
  if (elems.sheetWebAppUrlInput && window.OrthoSheetsDB) {
    elems.sheetWebAppUrlInput.value = window.OrthoSheetsDB.webAppUrl || '';
  }
  updateSavedCasesBadge();

  // Config Dialog
  elems.btnOpenConfig.addEventListener('click', () => {
    if (elems.sheetWebAppUrlInput && window.OrthoSheetsDB) {
      elems.sheetWebAppUrlInput.value = window.OrthoSheetsDB.webAppUrl || '';
    }
    elems.configDialog.showModal();
  });

  elems.btnCloseConfig.addEventListener('click', () => {
    elems.configDialog.close();
  });

  elems.btnSaveConfig.addEventListener('click', () => {
    geminiService.setApiKey(elems.apiKeyInput.value);
    geminiService.setModel(elems.modelSelect.value);

    // Save Google Sheets Config
    if (elems.sheetWebAppUrlInput && window.OrthoSheetsDB) {
      window.OrthoSheetsDB.saveConfig({
        webAppUrl: elems.sheetWebAppUrlInput.value.trim()
      });
    }

    elems.configDialog.close();
    showToast('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว', 'success');
  });

  // Copy Google Apps Script Template
  if (elems.btnCopyAppsScript) {
    elems.btnCopyAppsScript.addEventListener('click', () => {
      if (window.OrthoSheetsDB) {
        const code = window.OrthoSheetsDB.getAppsScriptTemplate();
        navigator.clipboard.writeText(code).then(() => {
          showToast('คัดลอกโค้ด Google Apps Script เรียบร้อยแล้ว นำไปวางในชีตได้เลย', 'success');
        });
      }
    });
  }

  // Test Google Sheet Sync
  if (elems.btnTestSheetSync) {
    elems.btnTestSheetSync.addEventListener('click', async () => {
      const url = elems.sheetWebAppUrlInput ? elems.sheetWebAppUrlInput.value.trim() : '';
      if (!url) {
        showToast('กรุณากรอก Google Apps Script Web App URL ก่อนทดสอบ', 'error');
        return;
      }
      showToast('กำลังทดสอบการเชื่อมต่อ Google Sheets...', 'info');
      try {
        const res = await fetch(`${url}?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success') {
            showToast(`เชื่อมต่อ Google Sheets สำเร็จ! พบข้อมูล ${data.records ? data.records.length : 0} รายการ`, 'success');
          } else {
            showToast(`การเชื่อมต่อตอบกลับ: ${data.message || 'Error'}`, 'error');
          }
        } else {
          showToast(`เชื่อมต่อไม่สำเร็จ HTTP ${res.status}`, 'error');
        }
      } catch (err) {
        showToast(`เชื่อมต่อไม่สำเร็จ: ตรวจสอบ URL หรือสิทธิ์เข้าถึง (ต้องเลือก Anyone)`, 'error');
      }
    });
  }

  // Quick Demo Patient Button
  if (elems.btnQuickDemoPatient) {
    elems.btnQuickDemoPatient.addEventListener('click', () => {
      elems.patientName.value = 'นายสมศักดิ์ วงศ์สวัสดิ์';
      elems.patientHn.value = '67-004291';
      elems.patientAge.value = '58 ปี';
      elems.patientGender.value = 'ชาย';
      elems.patientCoverage.value = 'บัตรทอง (UC) / รพ.ตามสิทธิ';
      elems.patientDoctor.value = 'นพ. กฤษดา (ศัลยแพทย์ออร์โธปิดิกส์)';
      showToast('กรอกข้อมูลผู้ป่วยตัวอย่างเรียบร้อย', 'info');
    });
  }

  // Save Case Button
  if (elems.btnSaveCase) {
    elems.btnSaveCase.addEventListener('click', async () => {
      await saveCurrentCase();
    });
  }

  // Open Saved Cases Archive Modal
  if (elems.btnOpenSavedCases) {
    elems.btnOpenSavedCases.addEventListener('click', async () => {
      elems.savedCasesModal.showModal();
      await renderSavedCasesList();
    });
  }

  if (elems.btnCloseSavedCases) {
    elems.btnCloseSavedCases.addEventListener('click', () => {
      elems.savedCasesModal.close();
    });
  }

  if (elems.btnCloseSavedCasesFooter) {
    elems.btnCloseSavedCasesFooter.addEventListener('click', () => {
      elems.savedCasesModal.close();
    });
  }

  if (elems.inputSearchCases) {
    elems.inputSearchCases.addEventListener('input', () => {
      const q = elems.inputSearchCases.value.trim().toLowerCase();
      renderSavedCasesList(q);
    });
  }

  if (elems.btnSyncCasesNow) {
    elems.btnSyncCasesNow.addEventListener('click', async () => {
      showToast('กำลังซิงค์ข้อมูลจาก Google Sheet...', 'info');
      await renderSavedCasesList();
      showToast('ซิงค์ข้อมูลล่าสุดเรียบร้อยแล้ว', 'success');
    });
  }

  // Print Report Buttons
  if (elems.btnPrintReport) {
    elems.btnPrintReport.addEventListener('click', () => {
      openPrintReportModal();
    });
  }

  if (elems.btnPrintOpdCard) {
    elems.btnPrintOpdCard.addEventListener('click', () => {
      openPrintReportModal();
    });
  }

  if (elems.btnPrintModalConfirm) {
    elems.btnPrintModalConfirm.addEventListener('click', () => {
      window.print();
    });
  }

  if (elems.btnBackToEditFromPrint) {
    elems.btnBackToEditFromPrint.addEventListener('click', () => {
      elems.printReportModal.close();
      if (elems.fieldCC) elems.fieldCC.focus();
    });
  }

  if (elems.btnClosePrintReport) {
    elems.btnClosePrintReport.addEventListener('click', () => {
      elems.printReportModal.close();
    });
  }

  // New Case Button
  if (elems.btnNewCase) {
    elems.btnNewCase.addEventListener('click', () => {
      if (confirm('คุณต้องการเริ่มตรวจคนไข้เคสใหม่หรือไม่? (ข้อมูลปัจจุบันที่ยังไม่ได้บันทึกจะถูกล้าง)')) {
        startNewCase();
      }
    });
  }

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
  // Core Business Logic: Speech Handling
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
  // Case Data Management (Google Sheets & LocalStorage)
  // ==========================================================================

  function collectCaseData() {
    return {
      caseId: state.currentCaseId || '',
      timestamp: new Date().toISOString(),
      hn: (elems.patientHn ? elems.patientHn.value.trim() : ''),
      patientName: (elems.patientName ? elems.patientName.value.trim() : ''),
      age: (elems.patientAge ? elems.patientAge.value.trim() : ''),
      gender: (elems.patientGender ? elems.patientGender.value : ''),
      visitDate: (elems.patientDate ? elems.patientDate.value : new Date().toISOString().slice(0, 10)),
      doctor: (elems.patientDoctor ? elems.patientDoctor.value.trim() : ''),
      coverage: (elems.patientCoverage ? elems.patientCoverage.value.trim() : ''),
      chiefComplaint: (elems.fieldCC ? elems.fieldCC.value.trim() : ''),
      presentIllness: (elems.fieldPI ? elems.fieldPI.value.trim() : ''),
      pastHistory: (elems.fieldPMH ? elems.fieldPMH.value.trim() : ''),
      physicalExam: (elems.fieldPE ? elems.fieldPE.value.trim() : ''),
      imagingLabs: (elems.fieldImaging ? elems.fieldImaging.value.trim() : ''),
      primaryDiagnosis: (elems.fieldDx ? elems.fieldDx.value.trim() : ''),
      differentialDx: (elems.fieldDDx ? elems.fieldDDx.value.trim() : ''),
      treatmentPlan: (elems.fieldTreatment ? elems.fieldTreatment.value.trim() : ''),
      patientAdvice: (elems.fieldAdvice ? elems.fieldAdvice.value.trim() : ''),
      followUp: (elems.fieldFollowUp ? elems.fieldFollowUp.value.trim() : ''),
      systematicExam: state.parsedData && state.parsedData.systematicExam ? state.parsedData.systematicExam : {
        inspection: [], palpation: [], rom: [], specialTests: [], neuro: []
      },
      rawDialogue: state.dialogueTurns || [],
      ttsText: (elems.ttsSpeechText ? elems.ttsSpeechText.value : '')
    };
  }

  function populateCaseData(record) {
    if (!record) return;

    state.currentCaseId = record.caseId || null;

    if (elems.patientName) elems.patientName.value = record.patientName || '';
    if (elems.patientHn) elems.patientHn.value = record.hn || '';
    if (elems.patientAge) elems.patientAge.value = record.age || '';
    if (elems.patientGender) elems.patientGender.value = record.gender || '';
    if (elems.patientDate && record.visitDate) elems.patientDate.value = record.visitDate;
    if (elems.patientDoctor && record.doctor) elems.patientDoctor.value = record.doctor;
    if (elems.patientCoverage && record.coverage) elems.patientCoverage.value = record.coverage;

    populateSoapFields({
      cc: record.chiefComplaint || '',
      pi: record.presentIllness || '',
      pmh: record.pastHistory || '',
      pe: record.physicalExam || '',
      imaging: record.imagingLabs || '',
      dx: record.primaryDiagnosis || '',
      ddx: record.differentialDx || '',
      treatment: record.treatmentPlan || '',
      advice: record.patientAdvice || '',
      followUp: record.followUp || ''
    });

    if (record.systematicExam) {
      try {
        const examData = typeof record.systematicExam === 'string' ? JSON.parse(record.systematicExam) : record.systematicExam;
        populateSystematicExam(examData);
      } catch (e) {
        console.warn('Could not parse systematicExam json', e);
      }
    }

    if (record.rawDialogue && Array.isArray(record.rawDialogue) && record.rawDialogue.length > 0) {
      state.dialogueTurns = record.rawDialogue;
      renderTranscriptStream();
    }

    if (elems.ttsSpeechText && record.ttsText) {
      elems.ttsSpeechText.value = record.ttsText;
    }

    // Update active case indicator tag
    if (elems.activeCaseTag) {
      elems.activeCaseTag.textContent = `กำลังแก้ไข: ${record.caseId}`;
      elems.activeCaseTag.classList.add('is-saved');
    }
  }

  async function saveCurrentCase() {
    const record = collectCaseData();

    // Warn if no patient name or CC or DX
    if (!record.patientName && !record.chiefComplaint && !record.primaryDiagnosis) {
      showToast('กรุณากรอกชื่อผู้ป่วย หรือ อาการสำคัญ หรือ การวินิจฉัยก่อนบันทึก', 'error');
      if (elems.patientName) elems.patientName.focus();
      return;
    }

    if (elems.btnSaveCaseText) elems.btnSaveCaseText.textContent = 'กำลังบันทึก...';
    if (elems.btnSaveCase) elems.btnSaveCase.disabled = true;

    try {
      const res = await window.OrthoSheetsDB.saveCase(record);
      state.currentCaseId = res.caseId;

      if (elems.activeCaseTag) {
        elems.activeCaseTag.textContent = `บันทึกแล้ว: ${res.caseId}`;
        elems.activeCaseTag.classList.add('is-saved');
      }

      updateSavedCasesBadge();

      if (res.cloudSynced) {
        showToast(`✅ บันทึกเคส ${res.caseId} สำเร็จและส่งเข้า Google Sheet แล้ว`, 'success');
      } else {
        showToast(`💾 บันทึกเคส ${res.caseId} ในเครื่องเรียบร้อยแล้ว (ตั้งค่าในเมนู "ตั้งค่า" เพื่อส่งเข้า Google Sheet)`, 'info');
      }
    } catch (err) {
      console.error('Error saving case:', err);
      showToast('เกิดข้อผิดพลาดในการบันทึกเคส', 'error');
    } finally {
      if (elems.btnSaveCaseText) elems.btnSaveCaseText.textContent = 'บันทึกเคส (Save)';
      if (elems.btnSaveCase) elems.btnSaveCase.disabled = false;
    }
  }

  async function renderSavedCasesList(filterText = '') {
    if (elems.sheetSyncBanner) {
      if (window.OrthoSheetsDB && window.OrthoSheetsDB.webAppUrl) {
        elems.sheetSyncBanner.className = 'sheet-sync-banner synced';
        elems.sheetSyncBanner.innerHTML = `
          <span>🟢 <strong>ซิงค์กับ Google Sheet อัตโนมัติ</strong> (ระบบเชื่อมต่อกับชีตของคุณหมอแล้ว)</span>
          <a href="https://docs.google.com/spreadsheets/d/1YX9M8P0VoY5k47Gx2_OK-okoPN7oMcylC00zcCb_x_4/edit?usp=sharing" target="_blank" class="btn-text-action" style="color: inherit; text-decoration: underline;">เปิดตาราง Google Sheet ↗</a>
        `;
      } else {
        elems.sheetSyncBanner.className = 'sheet-sync-banner local-only';
        elems.sheetSyncBanner.innerHTML = `
          <span>💾 <strong>ข้อมูลถูกจัดเก็บในเครื่องของคุณหมอ (Local Storage)</strong> — หากต้องการให้ข้อมูลขึ้นตาราง Google Sheet โดยตรง ต้องเชื่อมต่อ Apps Script</span>
          <button id="btnBannerSetupSheet" class="btn btn-primary btn-sm" style="font-size: 0.75rem; padding: 4px 10px;">⚡ เชื่อมต่อ Google Sheet</button>
        `;
        const btnSetup = document.getElementById('btnBannerSetupSheet');
        if (btnSetup) {
          btnSetup.addEventListener('click', () => {
            elems.savedCasesModal.close();
            elems.configDialog.showModal();
          });
        }
      }
    }

    if (!elems.savedCasesContainer) return;
    elems.savedCasesContainer.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-secondary);">กำลังโหลดข้อมูลเวชระเบียน...</div>';

    const cases = await window.OrthoSheetsDB.fetchAllCases();
    updateSavedCasesBadge(cases.length);

    let filtered = cases;
    if (filterText) {
      const q = filterText.toLowerCase();
      filtered = cases.filter(c => 
        (c.patientName && c.patientName.toLowerCase().includes(q)) ||
        (c.hn && c.hn.toLowerCase().includes(q)) ||
        (c.primaryDiagnosis && c.primaryDiagnosis.toLowerCase().includes(q)) ||
        (c.chiefComplaint && c.chiefComplaint.toLowerCase().includes(q))
      );
    }

    if (elems.savedCasesCountLabel) {
      elems.savedCasesCountLabel.textContent = `แสดง ${filtered.length} จากทั้งหมด ${cases.length} เคส`;
    }

    if (filtered.length === 0) {
      elems.savedCasesContainer.innerHTML = `
        <div class="empty-state" style="padding: 40px 20px;">
          <div class="empty-icon">📂</div>
          <h4>${cases.length === 0 ? 'ยังไม่มีประวัติเคสที่บันทึกไว้' : 'ไม่พบเคสที่ตรงกับคำค้นหา'}</h4>
          <p>${cases.length === 0 ? 'เมื่อตรวจรักษาผู้ป่วยเสร็จแล้ว ให้กดปุ่ม "💾 บันทึกเคส" เพื่อจัดเก็บข้อมูลลง Google Sheet' : 'ลองค้นหาด้วยชื่ออื่น หรือ HN อื่น'}</p>
        </div>
      `;
      return;
    }

    elems.savedCasesContainer.innerHTML = '';
    filtered.forEach(item => {
      const row = document.createElement('div');
      row.className = 'saved-case-item';

      const dateDisplay = item.visitDate || (item.timestamp ? new Date(item.timestamp).toLocaleDateString('th-TH') : '-');
      const nameDisplay = item.patientName || 'ไม่ระบุชื่อผู้ป่วย';
      const hnDisplay = item.hn ? `HN: ${item.hn}` : 'ไม่มี HN';
      const dxDisplay = item.primaryDiagnosis || 'ยังไม่ระบุการวินิจฉัย';
      const ccDisplay = item.chiefComplaint ? `CC: ${item.chiefComplaint}` : 'ไม่มีอาการสำคัญ';

      row.innerHTML = `
        <div class="case-info-main">
          <div class="case-header-row">
            <span class="case-patient-name">${escapeHtml(nameDisplay)}</span>
            <span class="case-hn-badge">${escapeHtml(hnDisplay)}</span>
            <span class="case-date-text">📅 ${dateDisplay}</span>
            <span style="font-size: 0.72rem; color: #94a3b8; font-family: var(--font-mono);">${escapeHtml(item.caseId)}</span>
          </div>
          <div class="case-dx-title">🩺 ${escapeHtml(dxDisplay)}</div>
          <div class="case-cc-snippet">${escapeHtml(ccDisplay)}</div>
        </div>
        <div class="case-actions-group">
          <button class="btn btn-primary btn-sm btn-edit-case" title="โหลดข้อมูลกลับมาแก้ไขในฟอร์ม">
            ✏️ เปิดแก้ไข
          </button>
          <button class="btn btn-secondary btn-sm btn-print-case" title="พิมพ์รายงานการตรวจเคสนี้">
            🖨️ พิมพ์
          </button>
          <button class="btn btn-ghost btn-sm btn-delete-case" title="ลบเคสนี้" style="color: var(--color-danger);">
            🗑️
          </button>
        </div>
      `;

      // Button handlers
      row.querySelector('.btn-edit-case').addEventListener('click', () => {
        loadCaseForEditing(item.caseId);
      });

      row.querySelector('.btn-print-case').addEventListener('click', () => {
        elems.savedCasesModal.close();
        openPrintReportModal(item);
      });

      row.querySelector('.btn-delete-case').addEventListener('click', async () => {
        if (confirm(`คุณต้องการลบเคส "${nameDisplay}" (${item.caseId}) หรือไม่?`)) {
          await window.OrthoSheetsDB.deleteCase(item.caseId);
          showToast(`ลบเคส ${item.caseId} เรียบร้อยแล้ว`, 'info');
          renderSavedCasesList(filterText);
          updateSavedCasesBadge();
        }
      });

      elems.savedCasesContainer.appendChild(row);
    });
  }

  function loadCaseForEditing(caseId) {
    const cases = window.OrthoSheetsDB.getLocalCases();
    const item = cases.find(c => c.caseId === caseId);
    if (!item) {
      showToast('ไม่พบข้อมูลเคสที่เลือก', 'error');
      return;
    }

    populateCaseData(item);
    elems.savedCasesModal.close();

    // Switch to first tab (SOAP note)
    const firstTabBtn = document.querySelector('.tab-btn[data-tab="soapTab"]');
    if (firstTabBtn) firstTabBtn.click();

    showToast(`โหลดข้อมูลเคส "${item.patientName || item.caseId}" เพื่อแก้ไขเรียบร้อยแล้ว`, 'success');
  }

  function updateSavedCasesBadge(count = null) {
    if (!elems.savedCasesCountBadge) return;
    if (count === null) {
      const cases = window.OrthoSheetsDB ? window.OrthoSheetsDB.getLocalCases() : [];
      count = cases.length;
    }
    elems.savedCasesCountBadge.textContent = count;
  }

  // ==========================================================================
  // Report Generator & Print Modal Handler
  // ==========================================================================

  function openPrintReportModal(record = null) {
    if (!record) {
      record = collectCaseData();
    }

    if (!elems.printPaperSheet) return;

    const dateStr = record.visitDate || new Date().toLocaleDateString('th-TH');
    const printDate = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Build 5-Dimension Exam Table if available
    let examTableHtml = '';
    const sys = record.systematicExam || {};
    const inspection = Array.isArray(sys.inspection) && sys.inspection.length ? sys.inspection.join(', ') : '-';
    const palpation = Array.isArray(sys.palpation) && sys.palpation.length ? sys.palpation.join(', ') : '-';
    const rom = Array.isArray(sys.rom) && sys.rom.length ? sys.rom.join(', ') : '-';
    const specialTests = Array.isArray(sys.specialTests) && sys.specialTests.length ? sys.specialTests.join(', ') : '-';
    const neuro = Array.isArray(sys.neuro) && sys.neuro.length ? sys.neuro.join(', ') : '-';

    if (inspection !== '-' || palpation !== '-' || rom !== '-' || specialTests !== '-' || neuro !== '-') {
      examTableHtml = `
        <table class="report-exam-table">
          <tr><th>1. Inspection & Gait</th><td>${escapeHtml(inspection)}</td></tr>
          <tr><th>2. Palpation / Tenderness</th><td>${escapeHtml(palpation)}</td></tr>
          <tr><th>3. Range of Motion (ROM)</th><td>${escapeHtml(rom)}</td></tr>
          <tr><th>4. Special Orthopedic Tests</th><td><strong>${escapeHtml(specialTests)}</strong></td></tr>
          <tr><th>5. Neurovascular Status</th><td>${escapeHtml(neuro)}</td></tr>
        </table>
      `;
    }

    elems.printPaperSheet.innerHTML = `
      <div class="report-header">
        <div class="report-hospital-info">
          <div class="h-logo">🏥</div>
          <div>
            <div class="report-hospital-title">คลินิกเฉพาะทางศัลยกรรมกระดูกและข้อ (Department of Orthopedics)</div>
            <div class="report-hospital-sub">โรงพยาบาลออร์โธปิดิกส์อัจฉริยะ • OrthoVoice Clinical Documentation System</div>
          </div>
        </div>
        <div class="report-doc-badge">
          <div class="report-doc-title">OPD CLINICAL REPORT</div>
          <div class="report-doc-id">Ref: ${escapeHtml(record.caseId || 'NEW-RECORD')}</div>
        </div>
      </div>

      <div class="report-patient-box">
        <div class="rp-item"><strong>ชื่อ-สกุล:</strong> ${escapeHtml(record.patientName || 'ไม่ระบุ')}</div>
        <div class="rp-item"><strong>เลขประจำตัว (HN):</strong> ${escapeHtml(record.hn || 'ไม่ระบุ')}</div>
        <div class="rp-item"><strong>อายุ / เพศ:</strong> ${escapeHtml(record.age || '-')} / ${escapeHtml(record.gender || '-')}</div>
        <div class="rp-item"><strong>วันที่ตรวจ:</strong> ${escapeHtml(dateStr)}</div>
        <div class="rp-item" style="grid-column: span 2;"><strong>สิทธิการรักษา:</strong> ${escapeHtml(record.coverage || '-')}</div>
        <div class="rp-item" style="grid-column: span 2;"><strong>แพทย์ผู้ตรวจ:</strong> ${escapeHtml(record.doctor || '-')}</div>
      </div>

      <div class="report-section">
        <div class="report-section-title"><span>[S] ประวัติและอาการสำคัญ (Subjective)</span></div>
        <div class="report-section-body">
          <div class="report-field-row"><strong>อาการสำคัญ (Chief Complaint):</strong> ${escapeHtml(record.chiefComplaint || '-')}</div>
          <div class="report-field-row"><strong>ประวัติปัจจุบัน (Present Illness):</strong> ${escapeHtml(record.presentIllness || '-')}</div>
          <div class="report-field-row"><strong>ประวัติอดีต/แพ้ยา (Past History & Allergy):</strong> ${escapeHtml(record.pastHistory || 'ปฏิเสธโรคประจำตัวและการแพ้ยา')}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-title"><span>[O] ผลการตรวจร่างกายและการตรวจพิเศษ (Objective)</span></div>
        <div class="report-section-body">
          <div class="report-field-row"><strong>การตรวจร่างกาย (Physical Examination):</strong> ${escapeHtml(record.physicalExam || '-')}</div>
          ${examTableHtml}
          <div class="report-field-row" style="margin-top: 6px;"><strong>ผลภาพถ่ายรังสี / ภาพสแกน (Imaging & Labs):</strong> ${escapeHtml(record.imagingLabs || '-')}</div>
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-title"><span>[A] การวินิจฉัยโรค (Assessment)</span></div>
        <div class="report-section-body">
          <div class="report-field-row"><strong>การวินิจฉัยโรคหลัก (Primary Diagnosis):</strong> <span style="font-size: 0.92rem; font-weight: 700; color: #1e40af;">${escapeHtml(record.primaryDiagnosis || '-')}</span></div>
          ${record.differentialDx ? `<div class="report-field-row"><strong>การวินิจฉัยแยกโรค (Differential Dx):</strong> ${escapeHtml(record.differentialDx)}</div>` : ''}
        </div>
      </div>

      <div class="report-section">
        <div class="report-section-title"><span>[P] แผนการรักษาและคำแนะนำ (Plan & Management)</span></div>
        <div class="report-section-body">
          <div class="report-field-row"><strong>การรักษา ยา และหัตถการ (Treatment & Medication):</strong><br>${escapeHtml(record.treatmentPlan || '-').replace(/\n/g, '<br>')}</div>
          <div class="report-field-row" style="margin-top: 6px;"><strong>คำแนะนำสำหรับผู้ป่วย (Patient Advice):</strong> ${escapeHtml(record.patientAdvice || '-')}</div>
          <div class="report-field-row" style="margin-top: 6px;"><strong>การนัดตรวจติดตาม (Follow-up):</strong> <strong style="color: #b91c1c;">${escapeHtml(record.followUp || '-')}</strong></div>
        </div>
      </div>

      <div class="report-sign-box">
        <div class="report-signature-block">
          <div class="report-sign-line"></div>
          <div class="report-doctor-name">(${escapeHtml(record.doctor || '..........................................................')})</div>
          <div class="report-doctor-role">แพทย์ผู้ตรวจรักษา / ศัลยแพทย์ออร์โธปิดิกส์</div>
          <div style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">วันที่ออกรายงาน: ${printDate}</div>
        </div>
      </div>
    `;

    elems.printReportModal.showModal();
  }

  function startNewCase() {
    clearAllData();
    state.currentCaseId = null;

    if (elems.patientName) elems.patientName.value = '';
    if (elems.patientHn) elems.patientHn.value = '';
    if (elems.patientAge) elems.patientAge.value = '';
    if (elems.patientGender) elems.patientGender.value = '';
    if (elems.patientDate) elems.patientDate.valueAsDate = new Date();

    if (elems.activeCaseTag) {
      elems.activeCaseTag.textContent = 'เคสใหม่ (ยังไม่บันทึก)';
      elems.activeCaseTag.classList.remove('is-saved');
    }

    const firstTabBtn = document.querySelector('.tab-btn[data-tab="soapTab"]');
    if (firstTabBtn) firstTabBtn.click();

    showToast('เริ่มตรวจคนไข้เคสใหม่เรียบร้อยแล้ว', 'success');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function clearAllData() {
    sttEngine.stop();
    ttsEngine.stop();
    state.dialogueTurns = [];
    state.interimTurn = null;
    state.currentCaseId = null;
    state.parsedData = null;

    if (elems.patientName) elems.patientName.value = '';
    if (elems.patientHn) elems.patientHn.value = '';
    if (elems.patientAge) elems.patientAge.value = '';
    if (elems.patientGender) elems.patientGender.value = '';
    if (elems.patientDate) elems.patientDate.valueAsDate = new Date();

    if (elems.activeCaseTag) {
      elems.activeCaseTag.textContent = 'เคสใหม่ (ยังไม่บันทึก)';
      elems.activeCaseTag.classList.remove('is-saved');
    }

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
