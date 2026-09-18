/**
 * OrthoVoice AI — Google Sheets Database Connector Module
 * Manages patient case records, two-way sync with Google Sheets, and local storage fallback.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY_RECORDS = 'orthovoice_patient_records_v1';
  const STORAGE_KEY_CONFIG = 'orthovoice_sheets_config_v1';

  // Default Google Sheet provided by the user
  const DEFAULT_SHEET_ID = '1YX9M8P0VoY5k47Gx2_OK-okoPN7oMcylC00zcCb_x_4';
  const DEFAULT_SHEET_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SHEET_ID}/edit?usp=sharing`;

  /**
   * Ready-to-copy Google Apps Script code that powers the Google Sheet backend.
   * Doctors or admins can paste this into:
   * Google Sheets -> ส่วนขยาย (Extensions) -> Apps Script -> Deploy as Web App (เลือก Anyone)
   */
  const APPS_SCRIPT_TEMPLATE = `/**
 * OrthoVoice AI — Google Sheets Web App Backend
 * ให้คัดลอกโค้ดนี้ไปวางใน ส่วนขยาย (Extensions) > Apps Script ใน Google Sheet
 * จากนั้นกด "การทำให้ใช้งานได้ (Deploy)" > "การทำให้ใช้งานได้ใหม่ (New Deployment)"
 * เลือกประเภท "เว็บแอป (Web App)" และกำหนดให้ "ทุกคน (Anyone)" เข้าถึงได้
 */

function setupHeaders(sheet) {
  var headers = [
    "Case_ID", "Timestamp", "HN", "Patient_Name", "Age", "Gender",
    "Visit_Date", "Doctor", "Coverage", "Chief_Complaint", "Present_Illness",
    "Past_History", "Physical_Exam", "Imaging_Labs", "Primary_Diagnosis",
    "Differential_Dx", "Treatment_Plan", "Patient_Advice", "Follow_Up",
    "Systematic_Exam_JSON", "Raw_Dialogue"
  ];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#1e40af").setFontColor("#ffffff").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    setupHeaders(sheet);
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createJsonResponse({ status: "success", records: [] });
    }
    
    var headers = data[0];
    var records = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var item = {};
      for (var j = 0; j < headers.length; j++) {
        item[headers[j]] = row[j];
      }
      records.push(item);
    }
    
    return createJsonResponse({ status: "success", records: records });
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    setupHeaders(sheet);
    
    var rawData = e.postData ? e.postData.contents : "";
    var payload = JSON.parse(rawData);
    var action = payload.action || "save";
    
    if (action === "delete") {
      var targetId = payload.caseId;
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(targetId)) {
          sheet.deleteRow(i + 1);
          return createJsonResponse({ status: "success", message: "Deleted row " + (i + 1) });
        }
      }
      return createJsonResponse({ status: "error", message: "Case not found" });
    }
    
    // Save or Update
    var caseItem = payload.record;
    var rowValues = [
      caseItem.caseId || ("ORTHO-" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd-HHmmss")),
      caseItem.timestamp || new Date().toISOString(),
      caseItem.hn || "",
      caseItem.patientName || "",
      caseItem.age || "",
      caseItem.gender || "",
      caseItem.visitDate || "",
      caseItem.doctor || "",
      caseItem.coverage || "",
      caseItem.chiefComplaint || "",
      caseItem.presentIllness || "",
      caseItem.pastHistory || "",
      caseItem.physicalExam || "",
      caseItem.imagingLabs || "",
      caseItem.primaryDiagnosis || "",
      caseItem.differentialDx || "",
      caseItem.treatmentPlan || "",
      caseItem.patientAdvice || "",
      caseItem.followUp || "",
      typeof caseItem.systematicExam === "object" ? JSON.stringify(caseItem.systematicExam) : (caseItem.systematicExam || ""),
      typeof caseItem.rawDialogue === "object" ? JSON.stringify(caseItem.rawDialogue) : (caseItem.rawDialogue || "")
    ];
    
    var data = sheet.getDataRange().getValues();
    var existingRowIndex = -1;
    for (var r = 1; r < data.length; r++) {
      if (String(data[r][0]) === String(rowValues[0])) {
        existingRowIndex = r + 1;
        break;
      }
    }
    
    if (existingRowIndex > 0) {
      // Update existing row
      sheet.getRange(existingRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
      return createJsonResponse({ status: "success", action: "updated", caseId: rowValues[0] });
    } else {
      // Append new row
      sheet.appendRow(rowValues);
      return createJsonResponse({ status: "success", action: "inserted", caseId: rowValues[0] });
    }
  } catch (err) {
    return createJsonResponse({ status: "error", message: err.toString() });
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

  class SheetsDatabase {
    constructor() {
      this.sheetId = DEFAULT_SHEET_ID;
      this.sheetUrl = DEFAULT_SHEET_URL;
      this.webAppUrl = '';
      this.loadConfig();
    }

    loadConfig() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
        if (saved) {
          const parsed = JSON.parse(saved);
          this.sheetId = parsed.sheetId || DEFAULT_SHEET_ID;
          this.sheetUrl = parsed.sheetUrl || DEFAULT_SHEET_URL;
          this.webAppUrl = parsed.webAppUrl || '';
        }
      } catch (e) {
        console.warn('Could not load sheets config from storage', e);
      }
    }

    saveConfig(config) {
      this.sheetId = config.sheetId || this.sheetId;
      this.sheetUrl = config.sheetUrl || this.sheetUrl;
      this.webAppUrl = (config.webAppUrl || '').trim();

      try {
        localStorage.setItem(
          STORAGE_KEY_CONFIG,
          JSON.stringify({
            sheetId: this.sheetId,
            sheetUrl: this.sheetUrl,
            webAppUrl: this.webAppUrl
          })
        );
      } catch (e) {
        console.warn('Could not save sheets config', e);
      }
    }

    getAppsScriptTemplate() {
      return APPS_SCRIPT_TEMPLATE;
    }

    // =========================================================================
    // LocalStorage Mirror & Cache (Ensures 100% offline & instant access)
    // =========================================================================

    getLocalCases() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error('Error reading local cases', e);
        return [];
      }
    }

    saveLocalCase(record) {
      try {
        const cases = this.getLocalCases();
        const existingIdx = cases.findIndex(c => c.caseId === record.caseId);
        if (existingIdx >= 0) {
          cases[existingIdx] = record;
        } else {
          cases.unshift(record);
        }
        localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(cases));
        return cases;
      } catch (e) {
        console.error('Error saving local case', e);
        return [];
      }
    }

    deleteLocalCase(caseId) {
      try {
        const cases = this.getLocalCases().filter(c => c.caseId !== caseId);
        localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(cases));
        return cases;
      } catch (e) {
        console.error('Error deleting local case', e);
        return [];
      }
    }

    // =========================================================================
    // Google Sheets Cloud Sync Methods
    // =========================================================================

    /**
     * Save a clinical case (saves to local cache first, then syncs to Google Sheets if connected)
     */
    async saveCase(record) {
      // 1. Ensure valid ID and Timestamp
      if (!record.caseId) {
        const d = new Date();
        const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = d.toTimeString().slice(0, 8).replace(/:/g, '');
        record.caseId = `ORTHO-${dateStr}-${timeStr}`;
      }
      record.timestamp = new Date().toISOString();

      // 2. Save locally immediately
      this.saveLocalCase(record);

      // 3. Sync to Google Sheets if Web App URL is set
      let cloudSynced = false;
      let cloudMessage = '';

      if (this.webAppUrl) {
        try {
          const response = await fetch(this.webAppUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify({
              action: 'save',
              record: record
            })
          });

          if (response.ok) {
            const resJson = await response.json();
            if (resJson.status === 'success') {
              cloudSynced = true;
              cloudMessage = 'ซิงค์ข้อมูลขึ้น Google Sheet สำเร็จ';
            }
          }
        } catch (err) {
          console.warn('Google Sheets cloud sync attempt failed (data is safely stored locally):', err);
          cloudMessage = 'บันทึกในเครื่องสำเร็จ (ยังไม่ได้เชื่อมต่อ Google Sheets API)';
        }
      }

      return {
        success: true,
        caseId: record.caseId,
        cloudSynced: cloudSynced,
        cloudMessage: cloudMessage,
        record: record
      };
    }

    /**
     * Fetch all patient records (merges cloud data if available with local cache)
     */
    async fetchAllCases() {
      let cases = this.getLocalCases();

      if (this.webAppUrl) {
        try {
          const url = `${this.webAppUrl}?t=${Date.now()}`;
          const response = await fetch(url);
          if (response.ok) {
            const resJson = await response.json();
            if (resJson.status === 'success' && Array.isArray(resJson.records)) {
              // Format records from Google Sheet
              const cloudCases = resJson.records.map(row => ({
                caseId: row.Case_ID || '',
                timestamp: row.Timestamp || '',
                hn: row.HN || '',
                patientName: row.Patient_Name || '',
                age: row.Age || '',
                gender: row.Gender || '',
                visitDate: row.Visit_Date || '',
                doctor: row.Doctor || '',
                coverage: row.Coverage || '',
                chiefComplaint: row.Chief_Complaint || '',
                presentIllness: row.Present_Illness || '',
                pastHistory: row.Past_History || '',
                physicalExam: row.Physical_Exam || '',
                imagingLabs: row.Imaging_Labs || '',
                primaryDiagnosis: row.Primary_Diagnosis || '',
                differentialDx: row.Differential_Dx || '',
                treatmentPlan: row.Treatment_Plan || '',
                patientAdvice: row.Patient_Advice || '',
                followUp: row.Follow_Up || '',
                systematicExam: typeof row.Systematic_Exam_JSON === 'string' && row.Systematic_Exam_JSON.startsWith('{')
                  ? JSON.parse(row.Systematic_Exam_JSON)
                  : row.Systematic_Exam_JSON,
                rawDialogue: typeof row.Raw_Dialogue === 'string' && row.Raw_Dialogue.startsWith('[')
                  ? JSON.parse(row.Raw_Dialogue)
                  : row.Raw_Dialogue
              }));

              // Merge cloud cases with local cases
              const caseMap = new Map();
              cases.forEach(c => caseMap.set(c.caseId, c));
              cloudCases.forEach(c => caseMap.set(c.caseId, c));
              cases = Array.from(caseMap.values());

              // Update local cache
              localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(cases));
            }
          }
        } catch (err) {
          console.warn('Could not fetch from Google Sheets cloud, using local cache', err);
        }
      }

      // Sort newest first
      cases.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      return cases;
    }

    /**
     * Delete a case
     */
    async deleteCase(caseId) {
      this.deleteLocalCase(caseId);

      if (this.webAppUrl) {
        try {
          await fetch(this.webAppUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'delete', caseId: caseId })
          });
        } catch (e) {
          console.warn('Failed to delete row from Google Sheet', e);
        }
      }
      return true;
    }
  }

  window.OrthoSheetsDB = new SheetsDatabase();
})(window);
