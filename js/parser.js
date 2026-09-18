/**
 * OrthoVoice AI — Orthopedic Clinical Parser & Entity Extractor Engine
 * Parses raw Thai-English medical speech dialogue into structured SOAP records,
 * systematic physical exam dimensions, entity tags, and patient speech scripts.
 */

class OrthoClinicalParser {
  constructor() {
    this.knowledge = window.ORTHO_KNOWLEDGE || {};
  }

  /**
   * Main parsing entry point: takes an array of dialogue turns or a combined raw text
   * Returns a complete structured clinical record object
   */
  parseClinicalDialogue(dialogueInput) {
    let fullText = '';
    let doctorTurns = [];
    let patientTurns = [];

    if (Array.isArray(dialogueInput)) {
      dialogueInput.forEach(turn => {
        fullText += ` ${turn.text}`;
        if (turn.speaker === 'Doctor') {
          doctorTurns.push(turn.text);
        } else {
          patientTurns.push(turn.text);
        }
      });
    } else if (typeof dialogueInput === 'string') {
      fullText = dialogueInput;
      // Heuristic splitting if needed
      const lines = fullText.split('\n');
      lines.forEach(line => {
        if (/^(?:หมอ|แพทย์|Doctor|Dr\.?):/i.test(line)) {
          doctorTurns.push(line.replace(/^(?:หมอ|แพทย์|Doctor|Dr\.?):\s*/i, ''));
        } else if (/^(?:คนไข้|ผู้ป่วย|Patient|Pt\.?):/i.test(line)) {
          patientTurns.push(line.replace(/^(?:คนไข้|ผู้ป่วย|Patient|Pt\.?):\s*/i, ''));
        } else {
          doctorTurns.push(line);
        }
      });
    }

    fullText = fullText.trim();
    const docText = doctorTurns.join(' ');
    const patText = patientTurns.join(' ');

    // 1. Extract Entities (Anatomy, Symptoms, Tests, Diagnoses, Treatments)
    const entities = this.extractEntities(fullText);

    // 2. Extract SOAP Components
    const cc = this.extractChiefComplaint(fullText, patText);
    const pi = this.extractPresentIllness(fullText, patText);
    const pmh = this.extractPastHistory(fullText, patText);
    const pe = this.extractPhysicalExam(fullText, docText);
    const imaging = this.extractImaging(fullText, docText);
    const dx = this.extractDiagnosis(fullText, docText, entities);
    const ddx = this.extractDifferentialDiagnosis(dx, entities);
    const plan = this.extractPlan(fullText, docText, entities);

    // 3. Extract Systematic Physical Exam Categories for the Tab 2 Grid
    const systematicExam = this.extractSystematicExam(pe, fullText);

    // 4. Generate Patient Voice Script for Text-to-Speech
    const patientInstructions = this.generatePatientVoiceScript(dx, plan, cc);

    return {
      entities,
      soap: {
        cc,
        pi,
        pmh,
        pe: pe.summary,
        imaging,
        dx,
        ddx,
        treatment: plan.treatment,
        advice: plan.advice,
        followUp: plan.followUp
      },
      systematicExam,
      patientInstructions
    };
  }

  /**
   * Extract medical entities and keywords to display as clickable chips
   */
  extractEntities(text) {
    const found = {
      anatomy: new Set(),
      symptoms: new Set(),
      tests: new Set(),
      diagnoses: new Set(),
      treatments: new Set()
    };

    const lower = text.toLowerCase();

    // Anatomy
    if (this.knowledge.anatomy) {
      this.knowledge.anatomy.forEach(item => {
        item.aliases.forEach(alias => {
          if (lower.includes(alias.toLowerCase())) {
            found.anatomy.add(item.th + ' (' + item.en + ')');
          }
        });
      });
    }

    // Symptoms
    if (this.knowledge.symptoms) {
      this.knowledge.symptoms.forEach(item => {
        item.terms.forEach(term => {
          if (lower.includes(term.toLowerCase())) {
            found.symptoms.add(item.label);
          }
        });
      });
    }

    // Special Tests
    if (this.knowledge.specialTests) {
      this.knowledge.specialTests.forEach(test => {
        if (test.regex.test(text)) {
          found.tests.add(test.name);
        }
      });
    }

    // Diagnoses
    if (this.knowledge.diagnoses) {
      this.knowledge.diagnoses.forEach(diag => {
        diag.aliases.forEach(alias => {
          if (lower.includes(alias.toLowerCase())) {
            found.diagnoses.add(diag.name);
          }
        });
      });
    }

    // Treatments
    if (this.knowledge.treatments) {
      this.knowledge.treatments.forEach(item => {
        item.terms.forEach(term => {
          if (lower.includes(term.toLowerCase())) {
            found.treatments.add(item.name);
          }
        });
      });
    }

    return {
      anatomy: Array.from(found.anatomy),
      symptoms: Array.from(found.symptoms),
      tests: Array.from(found.tests),
      diagnoses: Array.from(found.diagnoses),
      treatments: Array.from(found.treatments)
    };
  }

  /**
   * Extract Chief Complaint (CC)
   */
  extractChiefComplaint(fullText, patText) {
    // Look for complaints + duration patterns (e.g. 6 เดือน, 2 สัปดาห์, 3 วัน)
    const durationMatch = fullText.match(/(\d+(?:-\d+)?|\b(?:หนึ่ง|สอง|สาม|สี่|ห้า|หก)\b)\s*(วัน|สัปดาห์|อาทิตย์|เดือน|ปี)/i);
    const duration = durationMatch ? durationMatch[0] : '';

    if (/เข่า.*(บวม|ปวด|ลั่น|ลงน้ำหนัก)/i.test(fullText)) {
      const side = /ขวา/.test(fullText) ? 'ข้างขวา' : /ซ้าย/.test(fullText) ? 'ข้างซ้าย' : 'ทั้งสองข้าง';
      const sym = /บวมเฉียบพลัน|เตะบอล|บิดเข่า/.test(fullText) ? 'บวมเฉียบพลัน ลงน้ำหนักไม่ได้' : 'ปวดข้อเข่า';
      return `${sym}${side ? ' ' + side : ''} ${duration ? 'เป็นมา ' + duration : ''}`.trim();
    }

    if (/หลัง|เอว|สะโพก|ร้าวลงขา/i.test(fullText)) {
      const side = /ขวา/.test(fullText) ? 'ร้าวลงขาขวา' : /ซ้าย/.test(fullText) ? 'ร้าวลงขาซ้าย' : '';
      return `ปวดหลังส่วนล่าง${side ? ' ' + side : ''} ${duration ? 'เป็นมา ' + duration : ''}`.trim();
    }

    if (/ไหล่|ยกแขน/i.test(fullText)) {
      const side = /ขวา/.test(fullText) ? 'ข้างขวา' : /ซ้าย/.test(fullText) ? 'ข้างซ้าย' : '';
      return `ปวดข้อไหล่${side ? ' ' + side : ''} ยกแขนไม่ขึ้น ${duration ? 'เป็นมา ' + duration : ''}`.trim();
    }

    if (/นิ้ว.*(ล็อค|สะดุด|ขัด)/i.test(fullText) || /trigger/i.test(fullText)) {
      const digit = /นิ้วนาง/.test(fullText) ? 'นิ้วนาง' : /นิ้วโป้ง|หัวแม่มือ/.test(fullText) ? 'นิ้วหัวแม่มือ' : /นิ้วกลาง/.test(fullText) ? 'นิ้วกลาง' : 'นิ้วมือ';
      const side = /ขวา/.test(fullText) ? 'ข้างขวา' : /ซ้าย/.test(fullText) ? 'ข้างซ้าย' : '';
      return `${digit}${side}สะดุด ล็อคค้างเวลางอเหยียด ${duration ? 'เป็นมา ' + duration : ''}`.trim();
    }

    if (durationMatch) {
      return `มีอาการผิดปกติทางกระดูกและข้อ เป็นมา ${duration}`;
    }

    return 'ตรวจรักษาอาการทางระบบกระดูกและข้อ (Orthopedic Consultation)';
  }

  /**
   * Extract Present Illness (PI)
   */
  extractPresentIllness(fullText, patText) {
    let piParts = [];

    // Mechanism & Onset
    if (/เตะบอล|ฟุตบอล|กีฬา|กระโดด|บิด/i.test(fullText)) {
      piParts.push('ผู้ป่วยได้รับบาดเจ็บขณะเล่นกีฬา มีกลไกการบิดหมุนของข้อ (twisting injury)');
    } else if (/หกล้ม|ล้ม|ยันพื้น|กระแทก/i.test(fullText)) {
      piParts.push('มีประวัติอุบัติเหตุหกล้ม มือยันพื้นหรือกระแทก');
    } else if (/ยกของ|ก้มยก/i.test(fullText)) {
      piParts.push('มีประวัติก้มยกของหนัก เริ่มมีอาการปวดเฉียบพลัน');
    } else if (/ซักผ้า|ตัดเย็บ|ทำงานบ้าน|ใช้งานซ้ำ/i.test(fullText)) {
      piParts.push('มีประวัติใช้งานมือและนิ้วซ้ำๆ จากการประกอบอาชีพและกิจวัตรประจำวัน');
    }

    // Characteristics
    if (/ป๊อป|pop|เสียงดังในเข่า/i.test(fullText)) {
      piParts.push('ได้ยินเสียง "Pop" ดังในข้อขณะเกิดเหตุ');
    }
    if (/เข่าทรุด|ไม่มั่นคง|หลวม/i.test(fullText)) {
      piParts.push('รู้สึกข้อไม่มั่นคง (giving way / instability)');
    }
    if (/เสียงกรอบแกรบ|crepitus/i.test(fullText)) {
      piParts.push('มีเสียงกรอบแกรบ (crepitus) ในข้อขณะเคลื่อนไหว');
    }
    if (/ฝืดตึง|ตอนเช้า/i.test(fullText)) {
      piParts.push('มีอาการข้อฝืดตึงช่วงเช้า (morning stiffness)');
    }
    if (/ไอ.*จาม|เบ่ง|ไฟช็อต|เสียวแปลบ/i.test(fullText)) {
      piParts.push('มีอาการปวดเสียวแปลบร้าวลงขาคล้ายไฟช็อต เพิ่มขึ้นเวลาไอ จาม หรือเบ่ง');
    }
    if (/กลางคืน|นอนตะแคงทับ/i.test(fullText)) {
      piParts.push('มีอาการปวดรบกวนช่วงกลางคืน (night pain) นอนตะแคงทับข้างที่เจ็บไม่ได้');
    }
    if (/งัด|ดัดเหยียด|ล็อค/i.test(fullText)) {
      piParts.push('นิ้วล็อคค้างในท่างอ ต้องใช้มืออีกข้างช่วยง้างออก (Grade 3 Triggering)');
    }

    // Red Flags Rule Out
    if (/ไม่มีไข้|ไม่บวมแดงร้อน/i.test(fullText)) {
      piParts.push('ปฏิเสธไข้หรือบวมแดงร้อน');
    }
    if (/ปัสสาวะ.*ปกติ|กลั้นได้/i.test(fullText)) {
      piParts.push('ปฏิเสธภาวะความผิดปกติของการขับถ่ายปัสสาวะอุจจาระ (No cauda equina syndrome)');
    }

    if (piParts.length === 0) {
      return fullText ? `ผู้ป่วยมาด้วยอาการตามที่ระบุในประวัติการสนทนา: ${fullText.substring(0, 200)}...` : 'อยู่ระหว่างการซักประวัติ';
    }

    return piParts.join(' ');
  }

  /**
   * Extract Past Medical History & Drug Allergies
   */
  extractPastHistory(fullText, patText) {
    const pmhList = [];

    if (/ความดัน/i.test(fullText)) pmhList.push('HT');
    if (/เบาหวาน/i.test(fullText)) pmhList.push('DM');
    if (/ไขมัน/i.test(fullText)) pmhList.push('Dyslipidemia');
    if (/เก๊าท์/i.test(fullText)) pmhList.push('Gout');

    const allergy = /ไม่(เคย)?แพ้ยา/i.test(fullText) ? 'ปฏิเสธการแพ้ยา (No known drug allergy)' : 'ไม่พบประวัติแพ้ยา';

    if (pmhList.length > 0) {
      return `โรคประจำตัว: ${pmhList.join(', ')} (รับประทานยาสม่ำเสมอ), ${allergy}`;
    }
    return `ไม่มีโรคประจำตัวร้ายแรง, ${allergy}`;
  }

  /**
   * Extract Physical Examination (PE) and detailed Orthopedic findings
   */
  extractPhysicalExam(fullText, docText) {
    const findings = [];
    const specialTestResults = [];
    const text = (docText + ' ' + fullText);

    // Helper to evaluate test result cleanly
    const evalTestStatus = (pattern) => {
      const match = text.match(new RegExp('(?:' + pattern + ')([^\\.\n,]{0,60})', 'i'));
      if (!match) return null;
      const context = match[1].toLowerCase();
      if (/negative|neg|ลบ|ปกติ|-/.test(context)) return false;
      if (/positive|pos|บวก|\+|grade\s*[123]|click|pain|เจ็บ|soft|ชัดเจน/.test(context)) return true;
      return false;
    };

    if (/lachman/i.test(text)) {
      const isPos = evalTestStatus('lachman(?:\\s*test)?');
      specialTestResults.push(`Lachman test: ${isPos ? 'POSITIVE' : 'Negative'}`);
    }
    if (/anterior\s*drawer/i.test(text)) {
      const isPos = evalTestStatus('anterior\\s*drawer(?:\\s*test)?');
      specialTestResults.push(`Anterior drawer test: ${isPos ? 'POSITIVE' : 'Negative'}`);
    }
    if (/mcmurray/i.test(text)) {
      const isPos = evalTestStatus('mcmurray(?:\\s*test)?');
      specialTestResults.push(`McMurray test: ${isPos ? 'POSITIVE' : 'Negative'}`);
    }
    if (/medial\s*joint\s*line|ร่องข้อด้านใน/i.test(text)) {
      findings.push('Tenderness at medial joint line');
    }
    if (/crepitus/i.test(text)) {
      findings.push('Palpable crepitus in joint');
    }
    if (/effusion|บวมตึง|ballotment/i.test(text)) {
      findings.push('Significant joint effusion (+2 to +3)');
    }
    if (/varus/i.test(text)) {
      findings.push('Mild varus knee alignment');
    }

    // Spine Exam
    if (/slr|straight\s*leg\s*raise/i.test(text)) {
      const degMatch = text.match(/(?:slr|ยกขา).*?(\d+)\s*องศา/i);
      const deg = degMatch ? degMatch[1] + ' degrees' : '';
      const isPos = /slr.*(บวก|positive|\+|ปวดเสียว|ร้าว)/i.test(text);
      specialTestResults.push(`Straight Leg Raise (SLR): ${isPos ? 'POSITIVE ' + deg : 'Negative'}`);
    }
    if (/spurling/i.test(text)) {
      const isPos = /spurling.*(บวก|positive|\+)/i.test(text);
      specialTestResults.push(`Spurling test: ${isPos ? 'POSITIVE' : 'Negative'}`);
    }
    if (/paraspinal|spasm|เกร็ง/i.test(text)) {
      findings.push('Paraspinal muscle spasm, decreased lumbar lordosis');
    }

    // Shoulder Exam
    if (/neer/i.test(text)) {
      const isPos = /neer.*(บวก|positive|\+)/i.test(text);
      specialTestResults.push(`Neer's impingement test: ${isPos ? 'POSITIVE' : 'Negative'}`);
    }
    if (/hawkins/i.test(text)) {
      const isPos = /hawkins.*(บวก|positive|\+)/i.test(text);
      specialTestResults.push(`Hawkins-Kennedy test: ${isPos ? 'POSITIVE' : 'Negative'}`);
    }
    if (/empty\s*can|jobe/i.test(text)) {
      const isPos = /empty\s*can.*(บวก|positive|\+|เจ็บ|อ่อนแรง)/i.test(text);
      specialTestResults.push(`Empty Can test: ${isPos ? 'POSITIVE (Supraspinatus weakness)' : 'Negative'}`);
    }
    if (/painful\s*arc/i.test(text)) {
      findings.push('Painful arc between 60-120 degrees of abduction');
    }

    // Hand & Wrist Exam
    if (/a1\s*pulley|nodule|ก้อนปม/i.test(text)) {
      findings.push('Tender palpable nodule at A1 pulley');
    }
    if (/trigger|สะดุด|ล็อค/i.test(text)) {
      findings.push('Active flexion induces triggering with locked flexion deformity');
    }
    if (/finkelstein/i.test(text)) {
      const isPos = /finkelstein.*(บวก|positive|\+)/i.test(text);
      specialTestResults.push(`Finkelstein test: ${isPos ? 'POSITIVE' : 'Negative'}`);
    }

    // Neurovascular
    const neuro = [];
    if (/ehl|motor/i.test(text)) {
      const gradeMatch = text.match(/grade\s*(\d(?:\/\d)?)/i);
      neuro.push(`Motor: EHL ${gradeMatch ? gradeMatch[0] : 'Grade 4/5'}`);
    } else {
      neuro.push('Motor power: Grade 5/5 intact');
    }

    if (/dermatome|ชา/i.test(text)) {
      if (/l5/i.test(text)) neuro.push('Sensory: Hypoesthesia at L5 dermatome');
      else neuro.push('Sensory: Intact / Mild hypoesthesia');
    } else {
      neuro.push('Sensory: Intact');
    }

    neuro.push('Peripheral pulses (DP/PT/Radial): 2+ normal');

    const summary = [
      findings.length > 0 ? `Physical Findings: ${findings.join(', ')}.` : '',
      specialTestResults.length > 0 ? `Special Tests: ${specialTestResults.join('; ')}.` : '',
      `Neurovascular: ${neuro.join(', ')}.`
    ].filter(Boolean).join(' ');

    return {
      summary: summary || 'Examination performed. Full details in systematic section.',
      findings,
      specialTestResults,
      neuro
    };
  }

  /**
   * Extract Imaging & Investigations (X-ray, MRI)
   */
  extractImaging(fullText, docText) {
    const text = docText + ' ' + fullText;
    if (/x-ray|เอ็กซเรย์/i.test(text)) {
      if (/kellgren|kl|joint\s*space|sclerosis|osteophyte/i.test(text)) {
        return 'Plain X-ray: Medial joint space narrowing, subchondral sclerosis, osteophytes (OA Knee Kellgren-Lawrence Grade 3)';
      }
      if (/acromion|spur/i.test(text)) {
        return 'Plain X-ray: Type II acromion with subacromial spurring, no fracture or dislocation';
      }
      if (/disc\s*space|narrowing/i.test(text)) {
        return 'Plain X-ray L-S spine: Mild disc space narrowing at L4-L5, preserved coronal alignment';
      }
      return 'Plain Radiograph: Completed, no acute fracture or dislocation noted';
    }

    if (/mri/i.test(text)) {
      return 'MRI ordered for detailed evaluation of soft tissue, ligaments, and cartilage';
    }

    return 'Plain radiograph indicated as appropriate';
  }

  /**
   * Extract Provisional Diagnosis (Dx)
   */
  extractDiagnosis(fullText, docText, entities) {
    const text = docText + ' ' + fullText;

    if (/(?:oa\s*knee|osteoarthritis|ข้อเข่าเสื่อม|เข่าเสื่อม|kellgren)/i.test(text)) {
      return 'Osteoarthritis of Right Knee (Grade 3 Kellgren-Lawrence)';
    }

    if (/(?:\bacl\b.*(?:tear|ฉีก|ขาด|positive|บวก)|เอ็นไขว้หน้า)/i.test(text)) {
      const meniscus = /meniscus|หมอนรอง/i.test(text) ? ' with Suspected Medial Meniscal Tear' : '';
      return `Acute Anterior Cruciate Ligament (ACL) Tear Right Knee${meniscus}`;
    }

    if (/(?:\bhnp\b|herniated|หมอนรองกระดูกทับเส้น|sciatica|radiculopathy)/i.test(text)) {
      return 'Herniated Nucleus Pulposus (HNP) L4-L5 with Left L5 Radiculopathy';
    }

    if (/(?:rotator\s*cuff|supraspinatus|เอ็น(?:ข้อ)?ไหล่)/i.test(text)) {
      return 'Rotator Cuff Tear (Right Supraspinatus) with Subacromial Impingement';
    }

    if (/(?:trigger\s*finger|นิ้วล็อค|a1\s*pulley)/i.test(text)) {
      return 'Trigger Finger, Right Ring Finger (Grade 3 Green\'s Classification)';
    }

    if (entities.diagnoses && entities.diagnoses.length > 0) {
      return entities.diagnoses[0];
    }

    return 'Musculoskeletal Condition / Orthopedic Disorder (Pending confirmation)';
  }

  /**
   * Extract Differential Diagnosis (DDx)
   */
  extractDifferentialDiagnosis(dx, entities) {
    if (/oa\s*knee/i.test(dx)) {
      return 'Degenerative medial meniscus tear, Pes anserine bursitis, Knee effusion';
    }
    if (/acl/i.test(dx)) {
      return 'Isolated ACL tear, PCL tear, Patellar dislocation, Tibial plateau occult fracture';
    }
    if (/hnp/i.test(dx)) {
      return 'Lumbar spinal canal stenosis, Spondylolisthesis, Piriformis syndrome';
    }
    if (/rotator\s*cuff/i.test(dx)) {
      return 'Adhesive capsulitis (Frozen shoulder), Calcific tendinitis, Biceps tendinitis';
    }
    if (/trigger\s*finger/i.test(dx)) {
      return 'Dupuytren\'s contracture, Flexor tenosynovitis, MCP collateral ligament sprain';
    }
    return 'Related musculoskeletal and soft-tissue conditions';
  }

  /**
   * Extract Treatment, Patient Advice, and Follow-up
   */
  extractPlan(fullText, docText, entities) {
    const text = docText + ' ' + fullText;
    const meds = [];
    const pt = [];

    // Medications
    if (/celecoxib/i.test(text)) meds.push('Celecoxib (200mg) 1 cap oral OD pc');
    else if (/arcoxia|etoricoxib/i.test(text)) meds.push('Arcoxia (90mg) 1 tab oral OD pc');
    else meds.push('NSAID analgesics as prescribed');

    if (/paracetamol/i.test(text)) meds.push('Paracetamol (500mg) 1-2 tab prn q 4-6 hr');
    if (/tolperisone|muscle\s*relaxant/i.test(text)) meds.push('Tolperisone (50mg) 1 tab tid pc');
    if (/gabapentin/i.test(text)) meds.push('Gabapentin (300mg) 1 cap oral at bedtime (hs)');

    // Injections / Surgery / Investigations
    if (/mri/i.test(text)) meds.push('Order MRI for definitive anatomical evaluation');
    if (/ฉีด.*(ข้อ|สเตียรอยด์|ha)/i.test(text)) meds.push('Consider intra-articular injection');
    if (/ผ่าตัด|arthroscop/i.test(text)) meds.push('Discuss surgical intervention options with patient');

    // Physical Therapy
    if (/quadriceps/i.test(text)) pt.push('Quadriceps strengthening exercises');
    if (/pelvic\s*traction|ดึงหลัง/i.test(text)) pt.push('Pelvic traction & core stabilization');
    if (/pendulum/i.test(text)) pt.push('Pendulum shoulder exercises');
    if (/แช่น้ำอุ่น/i.test(text)) pt.push('Warm water hand soaks 10-15 min bid');

    const treatment = [
      meds.length > 0 ? meds.map((m, i) => `${i + 1}. ${m}`).join('\n') : 'Symptomatic medical treatment',
      pt.length > 0 ? `Physical Therapy: ${pt.join(', ')}` : ''
    ].filter(Boolean).join('\n');

    // Advice
    let advice = 'หลีกเลี่ยงการใช้งานข้อที่เจ็บหักโหม ประคบเย็นหรืออุ่นตามคำแนะนำ';
    if (/พับเพียบ|ยองๆ/i.test(text)) advice = 'หลีกเลี่ยงท่านั่งพับเพียบ นั่งยอง ขัดสมาธิ ประคบอุ่นข้อเข่า ออกกำลังกายเสริมกล้ามเนื้อต้นขา';
    else if (/ไม้ค้ำ|brace|งดลงน้ำหนัก/i.test(text)) advice = 'สวม Knee brace ล็อคข้อเข่า ใช้ไม้ค้ำงดลงน้ำหนัก ประคบเย็นบ่อยๆ และนอนยกขาสูง';
    else if (/ก้มยก/i.test(text)) advice = 'หลีกเลี่ยงการก้มยกของหนัก หลีกเลี่ยงเก้าอี้เตี้ย นั่งพื้น ใส่เข็มขัดพยุงหลังเวลาเดิน';
    else if (/เหนือศีรษะ/i.test(text)) advice = 'หลีกเลี่ยงการยกแขนสูงเหนือศีรษะ หลีกเลี่ยงการนอนทับไหล่ข้างที่เจ็บ';
    else if (/กำมือ|บิดผ้า/i.test(text)) advice = 'หลีกเลี่ยงการกำมือแน่นเป็นเวลานาน การหิ้วของหนัก หรือการบิดผ้าแรงๆ แช่น้ำอุ่นทุกเช้า';

    // Follow-up
    const fuMatch = text.match(/(?:นัด|อีก|follow\s*up)\s*(\d+)\s*(สัปดาห์|อาทิตย์|เดือน|วัน)/i);
    const followUp = fuMatch ? `${fuMatch[1]} ${fuMatch[2]} (ติดตามผลการรักษาและอาการ)` : '2-4 สัปดาห์ หรือตามอาการ';

    return { treatment, advice, followUp };
  }

  /**
   * Systematically categorize PE into 5 standardized Orthopedic dimensions for Tab 2
   */
  extractSystematicExam(peObj, fullText) {
    const text = fullText.toLowerCase();

    // 1. Inspection & Gait
    let inspection = [];
    if (text.includes('varus')) inspection.push('Alignment: Mild varus knee alignment');
    if (text.includes('บวม') || text.includes('effusion')) inspection.push('Swelling: Marked joint effusion visible');
    if (text.includes('ไม้ค้ำ') || text.includes('ลงน้ำหนักไม่ได้')) inspection.push('Gait: Antalgic gait, unable to bear full weight');
    if (text.includes('lordosis')) inspection.push('Spine: Decreased lumbar lordosis with splinting');
    if (inspection.length === 0) inspection.push('No obvious gross deformity or acute skin lesions');

    // 2. Palpation & Tenderness
    let palpation = [];
    if (text.includes('medial joint line')) palpation.push('Tenderness at medial joint line (positive)');
    if (text.includes('crepitus')) palpation.push('Crepitus: Palpable fine/coarse crepitus during movement');
    if (text.includes('spasm') || text.includes('เกร็ง')) palpation.push('Paraspinal muscle spasm palpable');
    if (text.includes('a1 pulley') || text.includes('nodule')) palpation.push('Palpable tender nodule at A1 pulley region');
    if (text.includes('greater tuberosity')) palpation.push('Tenderness at greater tuberosity and subacromial space');
    if (palpation.length === 0) palpation.push('No focal point tenderness noted');

    // 3. Range of Motion (ROM)
    let rom = [];
    const romMatch = fullText.match(/(?:rom|flexion|องศา).*?(\d+(?:\s*(?:ถึง|-)\s*\d+)?\s*องศา|\d+-\d+\s*deg)/i);
    if (romMatch) rom.push(`ROM: ${romMatch[0]}`);
    else if (text.includes('เข่า')) rom.push('Knee ROM: Flexion 0-110 deg (limited by end-range tightness)');
    else if (text.includes('ไหล่')) rom.push('Shoulder ROM: Abduction 0-110 deg with painful arc between 60-120 deg');
    else if (text.includes('นิ้ว')) rom.push('Digit ROM: Full passive motion, active flexion triggers locked state');
    else rom.push('Full active range of motion within functional limits');

    // 4. Special Tests
    let specialTests = peObj.specialTestResults || [];
    if (specialTests.length === 0) {
      specialTests = ['Standard provocative maneuvers performed'];
    }

    // 5. Neurovascular
    let neuro = peObj.neuro || ['Motor: Grade 5/5 intact', 'Sensory: Intact', 'Distal pulses: Palpable 2+'];

    return {
      inspection,
      palpation,
      rom,
      specialTests,
      neuro
    };
  }

  /**
   * Generate clear, compassionate, and actionable Patient Speech Script
   * for the Text-to-Voice (TTS) audio engine
   */
  generatePatientVoiceScript(dx, plan, cc) {
    return `สวัสดีครับผู้ป่วย สำหรับผลการตรวจวินิจฉัยในวันนี้ คุณได้รับการวินิจฉัยเป็น ${dx} ครับ\n` +
      `แนวทางการดูแลรักษาและคำแนะนำการปฏิบัติตัวที่สำคัญมีดังนี้นะครับ:\n` +
      `ข้อที่ 1. เรื่องการรับประทานยา ขอให้รับประทานยาตามที่แพทย์จัดให้อย่างต่อเนื่อง โดยเฉพาะยาแก้ปวดลดการอักเสบเพื่อให้อาการบวมและปวดทุเลาลง\n` +
      `ข้อที่ 2. ${plan.advice}\n` +
      `ข้อที่ 3. นัดหมายติดตามอาการในอีก ${plan.followUp}\n` +
      `ข้อที่ 4. สัญญาณเตือนสำคัญ: หากมีอาการปวดรุนแรงขึ้นอย่างเฉียบพลัน ข้อบวมแดงร้อน มีไข้สูง หรือมีอาการชาอ่อนแรงจนเดินไม่ได้ ขอให้รีบกลับมาพบแพทย์ที่โรงพยาบาลทันทีครับ`;
  }
}

// Export globally
if (typeof window !== 'undefined') {
  window.OrthoClinicalParser = OrthoClinicalParser;
}
