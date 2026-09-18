/**
 * OrthoVoice AI — Medical Knowledge Base & Orthopedic Ontology Dictionary
 * Contains anatomical terms, clinical tests, orthopedic physical examination entities,
 * diagnoses, and standard treatments (Thai & English medical terms).
 */

const ORTHO_KNOWLEDGE = {
  // Anatomical Regions and Structures
  anatomy: [
    { key: 'knee', th: 'ข้อเข่า', en: 'Knee', aliases: ['เข่า', 'ข้อเข่า', 'knee', 'patella', 'meniscus', 'acl', 'pcl', 'mcl', 'lcl', 'joint line'] },
    { key: 'spine', th: 'กระดูกสันหลัง/หลัง', en: 'Spine / Lumbar', aliases: ['หลัง', 'เอว', 'กระดูกสันหลัง', 'lumbar', 'l-spine', 'c-spine', 'cervical', 'disc', 'หมอนรองกระดูก'] },
    { key: 'shoulder', th: 'ข้อไหล่', en: 'Shoulder', aliases: ['ไหล่', 'ข้อไหล่', 'shoulder', 'rotator cuff', 'acromion', 'supraspinatus', 'biceps tendon'] },
    { key: 'hand_wrist', th: 'ข้อมือและมือ', en: 'Hand & Wrist', aliases: ['ข้อมือ', 'มือ', 'นิ้ว', 'wrist', 'finger', 'thumb', 'a1 pulley', 'carpal tunnel', 'finkelstein'] },
    { key: 'hip', th: 'ข้อสะโพก', en: 'Hip', aliases: ['สะโพก', 'ข้อสะโพก', 'hip', 'greater trochanter', 'groin', 'pelvis'] },
    { key: 'ankle_foot', th: 'ข้อเท้าและเท้า', en: 'Ankle & Foot', aliases: ['ข้อเท้า', 'เท้า', 'ส้นเท้า', 'ankle', 'foot', 'heel', 'achilles', 'atfl', 'plantar fascia'] }
  ],

  // Symptoms & Clinical Characteristics
  symptoms: [
    { key: 'pain', label: 'อาการปวด (Pain)', terms: ['ปวด', 'เจ็บ', 'pain', 'ache', 'soreness', 'tender'] },
    { key: 'radiculopathy', label: 'ปวดร้าว/ชาลงขา (Radiculopathy)', terms: ['ปวดร้าว', 'ร้าวลงขา', 'ร้าวลงแขน', 'เสียวร้าว', 'sciatica', 'radicular'] },
    { key: 'numbness', label: 'อาการชา (Numbness)', terms: ['ชา', 'เหน็บชา', 'numbness', 'paresthesia', 'hypoesthesia'] },
    { key: 'weakness', label: 'กล้ามเนื้ออ่อนแรง (Weakness)', terms: ['อ่อนแรง', 'ยกไม่ขึ้น', 'ก้าวไม่ออก', 'weakness', 'motor deficit', 'foot drop'] },
    { key: 'swelling', label: 'อาการบวม (Swelling/Effusion)', terms: ['บวม', 'เข่าบวม', 'ข้อบวม', 'swelling', 'effusion', 'edema'] },
    { key: 'stiffness', label: 'ข้อติดขัด (Stiffness)', terms: ['ข้อติด', 'เหยียดไม่สุด', 'งอไม่เข้า', 'stiffness', 'tightness', 'frozen'] },
    { key: 'locking', label: 'ขัด/สะดุด (Locking/Catching)', terms: ['ขัด', 'สะดุด', 'ล็อค', 'กึก', 'locking', 'catching', 'triggering'] },
    { key: 'crepitus', label: 'เสียงกรอบแกรบในข้อ (Crepitus)', terms: ['เสียงกรอบแกรบ', 'เสียงดังกึก', 'เสียงดังในข้อ', 'crepitus', 'crackling', 'popping'] }
  ],

  // Orthopedic Physical Exam Tests
  specialTests: [
    // Knee Tests
    { name: 'Lachman test', region: 'knee', target: 'ACL laxity', regex: /lachman(?:\s*test)?/i },
    { name: 'Anterior Drawer test', region: 'knee', target: 'ACL integrity', regex: /anterior\s*drawer(?:\s*test)?/i },
    { name: 'Posterior Drawer test', region: 'knee', target: 'PCL integrity', regex: /posterior\s*drawer(?:\s*test)?/i },
    { name: 'McMurray test', region: 'knee', target: 'Meniscus tear', regex: /mcmurray(?:\s*test)?/i },
    { name: 'Patellar Grind / Apprehension', region: 'knee', target: 'Patellofemoral', regex: /(?:patellar\s*grind|apprehension(?:\s*test)?)/i },
    { name: 'Joint line tenderness', region: 'knee', target: 'Meniscus / Joint pathology', regex: /(?:joint\s*line|medial\s*joint\s*line|lateral\s*joint\s*line|กดเจ็บร่องข้อ)/i },
    
    // Spine Tests
    { name: 'Straight Leg Raise (SLR)', region: 'spine', target: 'Nerve root tension (L4-S1)', regex: /(?:slr|straight\s*leg\s*raise|ยกขาสูง)/i },
    { name: 'Spurling test', region: 'spine', target: 'Cervical radiculopathy', regex: /spurling(?:\s*test)?/i },
    { name: 'Femoral nerve stretch test', region: 'spine', target: 'High lumbar radiculopathy (L2-L4)', regex: /femoral\s*(?:nerve\s*)?stretch/i },
    { name: 'Paraspinal tenderness / Spasm', region: 'spine', target: 'Muscular spasm', regex: /(?:paraspinal|กล้ามเนื้อหลังเกร็ง|กดเจ็บข้างกระดูกสันหลัง)/i },
    
    // Shoulder Tests
    { name: "Neer's test", region: 'shoulder', target: 'Subacromial impingement', regex: /neer(?:'s)?(?:\s*test)?/i },
    { name: 'Hawkins-Kennedy test', region: 'shoulder', target: 'Subacromial impingement', regex: /hawkins(?:\s*kennedy)?(?:\s*test)?/i },
    { name: 'Empty Can test (Jobe)', region: 'shoulder', target: 'Supraspinatus tear', regex: /(?:empty\s*can|jobe(?:\s*test)?)/i },
    { name: 'Drop arm test', region: 'shoulder', target: 'Full-thickness rotator cuff tear', regex: /drop\s*arm(?:\s*test)?/i },
    { name: 'Painful arc', region: 'shoulder', target: 'Subacromial impingement', regex: /painful\s*arc/i },
    
    // Hand & Wrist Tests
    { name: "Finkelstein's test", region: 'hand_wrist', target: "De Quervain's tenosynovitis", regex: /finkelstein(?:'s)?(?:\s*test)?/i },
    { name: "Phalen's test", region: 'hand_wrist', target: 'Carpal tunnel syndrome', regex: /phalen(?:'s)?(?:\s*test)?/i },
    { name: "Tinel's sign", region: 'hand_wrist', target: 'Nerve irritation (Median/Ulnar)', regex: /tinel(?:'s)?(?:\s*sign)?/i },
    { name: 'A1 Pulley tenderness / Triggering', region: 'hand_wrist', target: 'Trigger finger', regex: /(?:a1\s*pulley|นิ้วสะดุด|นิ้วล็อค|triggering)/i }
  ],

  // Common Orthopedic Diagnoses & ICD-10
  diagnoses: [
    { icd: 'M17.9', name: 'Osteoarthritis of knee (OA Knee)', aliases: ['oa knee', 'ข้อเข่าเสื่อม', 'เข่าเสื่อม', 'osteoarthritis knee'] },
    { icd: 'S83.5', name: 'Sprain and strain of ACL / Tear (ACL Tear)', aliases: ['acl', 'acl tear', 'เอ็นไขว้หน้าขาด', 'เอ็นไขว้หน้าฉีก'] },
    { icd: 'M23.2', name: 'Derangement of meniscus (Meniscal Tear)', aliases: ['meniscus tear', 'หมอนรองข้อเข่าฉีก', 'meniscal tear'] },
    { icd: 'M51.2', name: 'Lumbar disc herniation (HNP / Sciatica)', aliases: ['hnp', 'herniated disc', 'หมอนรองกระดูกทับเส้น', 'sciatica', 'lumbar disc'] },
    { icd: 'M75.1', name: 'Rotator cuff syndrome / Tear', aliases: ['rotator cuff', 'เอ็นข้อไหล่ฉีก', 'supraspinatus tear', 'เอ็นหัวไหล่'] },
    { icd: 'M75.0', name: 'Adhesive capsulitis of shoulder (Frozen Shoulder)', aliases: ['frozen shoulder', 'ไหล่ติด', 'ข้อไหล่ติด', 'adhesive capsulitis'] },
    { icd: 'M65.3', name: 'Trigger finger (นิ้วล็อค)', aliases: ['trigger finger', 'นิ้วล็อค', 'stenosing tenosynovitis'] },
    { icd: 'M65.4', name: "De Quervain's tenosynovitis", aliases: ['de quervain', 'ปลอกหุ้มเอ็นข้อมืออักเสบ', 'เดอ เกอร์แวง'] },
    { icd: 'S93.4', name: 'Sprain and strain of ankle (ATFL sprain)', aliases: ['ankle sprain', 'ข้อเท้าพลิก', 'ข้อเท้าแพลง', 'atfl'] }
  ],

  // Medications and Treatment Orders
  treatments: [
    { type: 'medication', name: 'NSAIDs (เช่น Celecoxib, Arcoxia)', terms: ['nsaids', 'celecoxib', 'arcoxia', 'etoricoxib', 'ibuprofen', 'ยาแก้ปวดลดการอักเสบ'] },
    { type: 'medication', name: 'Muscle Relaxant (ยาคลายกล้ามเนื้อ)', terms: ['muscle relaxant', 'tolperisone', 'mydocalm', 'norgesic', 'ยาคลายกล้ามเนื้อ'] },
    { type: 'medication', name: 'Neuropathic Pain (Gabapentin/Pregabalin)', terms: ['gabapentin', 'pregabalin', 'lyrica', 'ยาระงับปวดปลายประสาท'] },
    { type: 'injection', name: 'Intra-articular Injection (ฉีดยาเข้าข้อ / น้ำหล่อเลี้ยง / สเตียรอยด์)', terms: ['ฉีดเข้าข้อ', 'ฉีดยาเข้าข้อ', 'steroid injection', 'hyaluronic', 'ha injection', 'prp'] },
    { type: 'pt', name: 'Physical Therapy (กายภาพบำบัด / บริหารกล้ามเนื้อ)', terms: ['กายภาพ', 'กายภาพบำบัด', 'physical therapy', 'บริหารกล้ามเนื้อ', 'quadriceps exercise', 'core muscle'] },
    { type: 'imaging', name: 'X-ray / MRI Investigation', terms: ['x-ray', 'เอ็กซเรย์', 'mri', 'ultrasound', 'ฟิล์ม'] },
    { type: 'lifestyle', name: 'การพักข้อ / การใช้อุปกรณ์พยุง (Brace / Splint)', terms: ['พักข้อ', 'knee brace', 'splint', 'ที่พยุง', 'ประคบเย็น', 'ประคบร้อน'] }
  ]
};

// Export globally for browser scripts
if (typeof window !== 'undefined') {
  window.ORTHO_KNOWLEDGE = ORTHO_KNOWLEDGE;
}
