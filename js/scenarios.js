/**
 * OrthoVoice AI — Clinical Preset Scenarios
 * Realistic doctor-patient dialogues and expected parsed medical records
 * for 5 common orthopedic cases.
 */

const ORTHO_SCENARIOS = {
  // Case 1: Osteoarthritis of Knee (OA Knee Grade 3)
  oa_knee: {
    id: 'oa_knee',
    title: 'ข้อเข่าเสื่อม (Osteoarthritis of Knee Grade 3)',
    patientName: 'คุณสมศรี อายุ 64 ปี',
    dialogue: [
      { speaker: 'Doctor', text: 'สวัสดีครับคุณป้า วันนี้มีอาการผิดปกติอย่างไรบ้างครับ มาตรวจเรื่องอะไรครับ?' },
      { speaker: 'Patient', text: 'สวัสดีค่ะคุณหมอ ปวดข้อเข่าทั้งสองข้างเลยค่ะ แต่ข้างขวาเป็นหนักกว่า เป็นมาเกือบ 6 เดือนแล้วค่ะ เวลาเดินหรือลงบันไดจะปวดแปลบๆ มาก' },
      { speaker: 'Doctor', text: 'เวลาเดินมีเสียงดังในข้อไหมครับ หรือมีอาการเข่าบวมร้อนไหมครับ?' },
      { speaker: 'Patient', text: 'มีเสียงกรอบแกรบดังกึกๆ เวลาขยับค่ะคุณหมอ ตอนเช้าตื่นมาจะรู้สึกข้อฝืดตึง ขยับยากอยู่ประมาณ 15 นาทีค่ะ แต่ไม่ได้มีไข้หรือบวมแดงร้อนนะคะ' },
      { speaker: 'Doctor', text: 'มีโรคประจำตัวหรือแพ้ยาอะไรไหมครับ?' },
      { speaker: 'Patient', text: 'มีความดันโลหิตสูงกับไขมันค่ะ ทานยาประจำอยู่ ไม่เคยแพ้ยาอะไรค่ะ' },
      { speaker: 'Doctor', text: 'หมอขออนุญาตตรวจร่างกายตรวจข้อเข่านะครับ... คลำดูพบว่ามี crepitus ชัดเจน กดเจ็บบริเวณ medial joint line ของเข่าขวามากกว่าเข่าซ้าย มี mild varus deformity เล็กน้อย' },
      { speaker: 'Doctor', text: 'ลองงอเข่าขวาดูนะครับ... Range of motion งอได้ประมาณ 0 ถึง 110 องศา เหยียดได้เกือบสุดแต่มีอาการตึงเจ็บท้ายมุม ตรวจ stability พบ Lachman test negative, Anterior drawer negative ครับ' },
      { speaker: 'Doctor', text: 'ผลตรวจฟิล์ม X-ray ข้อเข่าท่ายืน พบว่าช่องว่างข้อเข่าด้านในแคบลงมาก มี subchondral sclerosis และ osteophyte เข้าได้กับ Osteoarthritis of right knee Kellgren-Lawrence grade 3 ครับ' },
      { speaker: 'Patient', text: 'อย่างนี้ต้องผ่าตัดเลยไหมคะคุณหมอ หรือรักษายังไงได้บ้างคะ?' },
      { speaker: 'Doctor', text: 'เบื้องต้นยังไม่ต้องผ่าตัดครับ หมอจะเริ่มรักษาแบบประคับประคองก่อน โดยจ่ายยาแก้ปวดลดอักเสบ Celecoxib 200 mg วันละ 1 ครั้งหลังอาหาร พร้อมยา Paracetamol เมื่อมีอาการปวด' },
      { speaker: 'Doctor', text: 'แนะนำให้หลีกเลี่ยงการนั่งพับเพียบ นั่งยองๆ หรือขัดสมาธิ ประคบอุ่นบริเวณข้อเข่า และฝึกทำกายภาพบริหารกล้ามเนื้อต้นขาด้านหน้า Quadriceps exercise วันละ 3 เวลา แล้วอีก 4 สัปดาห์หมอนัดมาติดตามอาการดูผลการรักษานะครับ' }
    ],
    parsed: {
      cc: 'ปวดข้อเข่าทั้งสองข้าง เป็นมากข้างขวา เป็นมาประมาณ 6 เดือน ปวดเวลาเดินลงบันได',
      pi: 'ผู้ป่วยหญิงอายุ 64 ปี มีอาการปวดข้อเข่าขวามากกว่าซ้าย 6 เดือน มีอาการฝืดตึงช่วงเช้าประมาณ 15 นาที มีเสียงกรอบแกรบ (crepitus) ในข้อเวลาขยับ ไม่มีไข้ บวมแดงร้อน ปวดมากขึ้นเวลาเดินและลงน้ำหนัก',
      pmh: 'HT, Dyslipidemia ยาเดิมรับประทานสม่ำเสมอ ปฏิเสธการแพ้ยา',
      pe: 'Knee: Mild varus deformity, no acute erythema. Crepitus palpable on both knees (R > L). Tenderness at medial joint line (Right knee). ROM: Right knee flexion 0-110 degrees with end-range pain. Special test: Lachman test negative, Anterior drawer test negative, McMurray negative. Neurovascular intact.',
      imaging: 'X-ray bilateral knees (standing AP/Lat): Moderate to severe joint space narrowing at medial compartment, subchondral sclerosis, osteophyte formation (KL grade 3 right knee).',
      dx: 'Osteoarthritis of Right Knee (Grade 3 Kellgren-Lawrence)',
      ddx: 'Medial meniscal degenerative tear, Pes anserine bursitis',
      treatment: '1. Celecoxib (200) 1 tab oral OD pc\n2. Paracetamol (500) 1-2 tab prn q 4-6 hr\n3. Physical therapy: Quadriceps strengthening exercise, weight control',
      advice: 'หลีกเลี่ยงการนั่งพับเพียบ นั่งยอง ขัดสมาธิ ประคบอุ่นข้อเข่า ออกกำลังกายเสริมกล้ามเนื้อต้นขา',
      followUp: '4 สัปดาห์ (ติดตามอาการและผลตอบสนองต่อยา)',
      patientInstructions: 'คุณป้าได้รับการวินิจฉัยเป็นโรคข้อเข่าเสื่อมระยะที่ 3 นะครับ สำหรับการดูแลตัวเอง:\n1. ทานยาแก้ปวดลดการอักเสบ Celecoxib วันละ 1 เม็ดหลังอาหารต่อเนื่อง และทานพาราเซตามอลเมื่อมีอาการปวด\n2. หลีกเลี่ยงท่านั่งที่งอเข่ามากๆ เช่น นั่งพับเพียบ ขัดสมาธิ หรือนั่งยองๆ\n3. ประคบอุ่นบริเวณข้อเข่าครั้งละ 15-20 นาที\n4. บริหารกล้ามเนื้อต้นขาโดยนั่งเก้าอี้เตะขาเหยียดตรงเกร็งค้างไว้ 10 วินาที วันละ 3 รอบ\n5. หมอนัดตรวจติดตามอาการอีกครั้งใน 4 สัปดาห์ครับ'
    }
  },

  // Case 2: ACL Tear & Meniscal Injury
  acl_tear: {
    id: 'acl_tear',
    title: 'เอ็นไขว้หน้าข้อเข่าฉีกขาด (ACL Tear with Meniscus Injury)',
    patientName: 'คุณเอกชัย อายุ 28 ปี',
    dialogue: [
      { speaker: 'Doctor', text: 'สวัสดีครับคุณเอกชัย ไปโดนอะไรมาครับ ดูต้องใช้ไม้ค้ำพยุงมา' },
      { speaker: 'Patient', text: 'สวัสดีครับหมอ เมื่อวานตอนเย็นไปเตะบอลมาครับ จังหวะกระโดดลงมาแล้วบิดเข่าขวา ได้ยินเสียง "ป๊อป" ดังในเข่าเลยครับ จากนั้นเข่าทรุด ลุกไม่ไหว แล้วเข่าก็บวมเป่งขึ้นมาทันทีเลยครับ' },
      { speaker: 'Doctor', text: 'ตอนนี้ลงน้ำหนักที่ขาขวาได้ไหมครับ และรู้สึกเข่าหลวมหรือหลุดไหมครับ?' },
      { speaker: 'Patient', text: 'ลงน้ำหนักไม่ได้เลยครับ ปวดมาก รู้สึกเข่าไม่มั่นคง เหมือนจะพับหลุดตลอดเวลาครับ' },
      { speaker: 'Doctor', text: 'หมอขอตรวจข้อเข่าขวานะครับ... พบว่าเข่าขวามี significant joint effusion บวมตึงมาก มีจุดกดเจ็บชัดเจนบริเวณ medial joint line' },
      { speaker: 'Doctor', text: 'ตรวจความมั่นคงของเส้นเอ็นข้อเข่า... Lachman test ให้ผลบวกชัดเจน (Positive grade 2+ with soft end point), Anterior drawer test positive, McMurray test พบว่ามี joint line pain และ click' },
      { speaker: 'Doctor', text: 'จากกลไกการบาดเจ็บและผลการตรวจร่างกาย เข้าได้กับภาวะเอ็นไขว้หน้าข้อเข่าฉีกขาด หรือ ACL Tear และอาจมีหมอนรองกระดูกข้อเข่าด้านในฉีกร่วมด้วย (Medial meniscus tear) ครับ' },
      { speaker: 'Patient', text: 'ต้องทำยังไงต่อครับคุณหมอ จะกลับมาเล่นกีฬาได้ไหมครับ?' },
      { speaker: 'Doctor', text: 'หมอจะส่งตรวจคลื่นแม่เหล็กไฟฟ้า MRI ข้อเข่าขวาเพื่อยืนยันรอยฉีกขาดของเส้นเอ็นและหมอนรองข้ออย่างละเอียด วันนี้หมอจะใส่ Knee brace ล็อคข้อเข่าไว้ ให้ใช้ไม้ค้ำยันช่วยเดินแบบงดลงน้ำหนัก (Non-weight bearing)' },
      { speaker: 'Doctor', text: 'ประคบเย็นบ่อยๆ ยกขาสูงเพื่อลดบวม จ่ายยาแก้ปวด Arcoxia และนัดฟังผล MRI ในอีก 1 สัปดาห์ เพื่อวางแผนการผ่าตัดส่องกล้องสร้างเส้นเอ็นใหม่ (Arthroscopic ACL Reconstruction) ต่อไปครับ' }
    ],
    parsed: {
      cc: 'ปวดเข่าขวา บวมเฉียบพลัน ลงน้ำหนักไม่ได้ หลังเล่นฟุตบอล 1 วัน',
      pi: 'ผู้ป่วยชายอายุ 28 ปี ได้รับอุบัติเหตุขณะเล่นฟุตบอล บิดหมุนเข่าขวาขณะลงสู่พื้น มีเสียงได้ยิน "Pop" ในข้อเข่า เข่าทรุดลงน้ำหนักไม่ได้ มีอาการบวมขึ้นเฉียบพลัน (hemarthrosis) รู้สึกข้อเข่าไม่มั่นคง (knee instability)',
      pmh: 'สุขภาพแข็งแรงดี ไม่มีโรคประจำตัว ไม่เคยผ่าตัดข้อเข่ามาก่อน ปฏิเสธการแพ้ยา',
      pe: 'Right Knee: Marked joint effusion (+3), ballotment test positive. Tenderness at medial joint line. ROM: limited by pain and effusion (flexion 20-70 deg). Special Tests: Lachman test POSITIVE (grade 2+, soft end-point), Anterior drawer test POSITIVE, McMurray test suspicious positive for medial meniscus. Distal pulse (DP, PT) 2+ equal.',
      imaging: 'Plain X-ray Right knee: No gross fracture or dislocation. Segond fracture suspected. Plan for MRI Right Knee.',
      dx: 'Acute Anterior Cruciate Ligament (ACL) Tear with Suspected Medial Meniscal Tear Right Knee',
      ddx: 'Isolated ACL tear, PCL tear, Patellar dislocation, Tibial plateau fracture',
      treatment: '1. Immobilization with hinged Knee Brace in extension\n2. Crutches walking non-weight bearing (NWB)\n3. RICE protocol (Rest, Ice, Compression, Elevation)\n4. Arcoxia (90) 1 tab OD pc x 7 days\n5. Order MRI Right Knee\n6. Discuss Arthroscopic ACL Reconstruction with meniscus repair',
      advice: 'ประคบเย็นครั้งละ 20 นาที ทุก 2-3 ชั่วโมง ห้ามลงน้ำหนักขาขวา ยกขาสูงเวลานอน',
      followUp: '1 สัปดาห์ (ฟังผล MRI Right Knee และวางแผนการผ่าตัด)',
      patientInstructions: 'ผลการตรวจพบว่าเอ็นไขว้หน้าข้อเข่าขวาฉีกขาดและสงสัยหมอนรองข้อเข่าบาดเจ็บครับ คำแนะนำสำคัญมีดังนี้:\n1. สวมสนับเข่าดามตรงไว้ตลอดเวลา และใช้ไม้ค้ำช่วยเดินโดยห้ามทิ้งน้ำหนักลงที่ขาข้างขวาโดยเด็ดขาด\n2. ประคบเย็นบริเวณที่บวมครั้งละ 15-20 นาที วันละ 4-5 ครั้ง และนอนยกขาสูงกว่าระดับหัวใจเพื่อลดอาการบวม\n3. ทานยาแก้อักเสบแก้ปวดตามที่หมอจัดให้อย่างสม่ำเสมอ\n4. เข้ารับการตรวจ MRI ตามที่นัดหมาย และกลับมาพบแพทย์ในอีก 1 สัปดาห์เพื่อวางแผนการผ่าตัดส่องกล้องรักษาครับ'
    }
  },

  // Case 3: Lumbar HNP / Sciatica
  lumbar_hnp: {
    id: 'lumbar_hnp',
    title: 'หมอนรองกระดูกทับเส้นประสาท (Lumbar HNP L4-L5 / Sciatica)',
    patientName: 'คุณวิชัย อายุ 42 ปี',
    dialogue: [
      { speaker: 'Doctor', text: 'สวัสดีครับ มีอาการปวดตรงไหน เป็นมาอย่างไรบ้างครับ?' },
      { speaker: 'Patient', text: 'สวัสดีครับคุณหมอ ปวดหลังส่วนล่างร้าวลงสะโพกและต้นขาซ้าย ลามไปถึงหลังเท้ามา 2 สัปดาห์แล้วครับ เวลาไอ จาม หรือเบ่งจะเสียวแปลบเหมือนไฟช็อตลงขาเลยครับ' },
      { speaker: 'Doctor', text: 'มีอาการชาหรือกล้ามเนื้อขาอ่อนแรง ขาตกบ้างไหมครับ? แล้วระบบปัสสาวะ อุจจาระ ปกติดีไหม มีอาการกลั้นไม่อยู่หรือชาบริเวณก้นกบไหมครับ?' },
      { speaker: 'Patient', text: 'มีอาการชาแถวๆ หลังเท้าและนิ้วโป้งเท้าซ้ายครับ ยังกลั้นปัสสาวะอุจจาระได้ปกติ ไม่มีชาตรงก้นกบครับ แต่รู้สึกว่ากระดกนิ้วโป้งเท้าซ้ายไม่ค่อยมีแรงเท่าข้างขวาครับ' },
      { speaker: 'Doctor', text: 'หมอขอตรวจประเมินทางระบบประสาทและกระดูกสันหลังนะครับ... หลังมี paraspinal muscle spasm แข็งเกร็ง, การตรวจ Straight Leg Raise test (SLR) ข้างซ้าย ยกได้เพียง 40 องศา มีอาการปวดเสียวร้าวลงขาชัดเจน (Radicular pain)' },
      { speaker: 'Doctor', text: 'ตรวจกำลังกล้ามเนื้อ: Extensor Hallucis Longus (EHL) ข้างซ้าย Motor grade 4/5 ส่วนกล้ามเนื้ออื่น grade 5/5, Sensation ชาลดลงบริเวณ L5 dermatome ข้างซ้าย' },
      { speaker: 'Doctor', text: 'ผลตรวจเข้าได้กับ โรคหมอนรองกระดูกทับเส้นประสาทส่วนเอว ระดับ L4-L5 เบียดรากประสาท L5 ข้างซ้าย (Lumbar Disc Herniation L4-L5 with L5 radiculopathy)' },
      { speaker: 'Doctor', text: 'หมอจะจ่ายยาลดการอักเสบ ยาคลายกล้ามเนื้อ และยา Gabapentin สำหรับลดอาการปวดแสบเส้นประสาท พร้อมทั้งส่งทำกายภาพบำบัด ดึงหลัง (Pelvic traction) และห้ามก้มยกของหนักเด็ดขาดนะครับ' }
    ],
    parsed: {
      cc: 'ปวดหลังร้าวลงสะโพกและขาซ้าย ชาหลังเท้า 2 สัปดาห์',
      pi: 'ผู้ป่วยชายอายุ 42 ปี มีอาการปวดหลังส่วนล่างร้าวลงสะโพก ต้นขาด้านข้าง และหลังเท้าข้างซ้าย มีอาการเสียวแปลบคล้ายไฟช็อตเวลาไอ จาม หรือเบ่ง (Valsalva positive) สังเกตว่ากระดกนิ้วโป้งเท้าซ้ายอ่อนแรงเล็กน้อย ไม่มีไข้ ปฏิเสธ cauda equina signs (ขับถ่ายปกติ ไม่ชา saddle)',
      pmh: 'ไม่มีโรคประจำตัว ปฏิเสธประวัติอุบัติเหตุรุนแรง ไม่แพ้ยา',
      pe: 'Spine: Decreased lumbar lordosis, marked paraspinal muscle spasm. Tender at L4-S1 spinous process. Neuro: Straight Leg Raise (SLR) Left: POSITIVE at 40 degrees with radiating pain to dorsum of foot. SLR Right: Negative (80 deg). Motor: EHL left grade 4/5, Tibialis anterior grade 5/5, Gastroc-soleus grade 5/5. Sensory: Hypoesthesia at left L5 dermatome. DTR: Knee jerk 2+, Ankle jerk 2+ symmetric.',
      imaging: 'Plain L-S spine X-ray: Mild L4-L5 disc space narrowing, preserved lumbar alignment.',
      dx: 'Herniated Nucleus Pulposus (HNP) L4-L5 with Left L5 Radiculopathy',
      ddx: 'Lumbar spinal stenosis, Spondylolisthesis, Piriformis syndrome',
      treatment: '1. Celecoxib (200) 1 cap OD pc\n2. Tolperisone (50) 1 tab tid pc (Muscle relaxant)\n3. Gabapentin (300) 1 cap hs\n4. Physical therapy: Pelvic traction, core stabilization exercises\n5. Lumbar support brace when standing/walking',
      advice: 'หลีกเลี่ยงการก้มยกของหนัก หลีกเลี่ยงการนั่งเก้าอี้เตี้ยหรือนั่งพื้น หากมีอาการกลั้นปัสสาวะไม่อยู่หรือขาชาอ่อนแรงเฉียบพลันให้มา รพ. ทันที',
      followUp: '2 สัปดาห์ (หากอาการปวดหรืออ่อนแรงไม่ดีขึ้น พิจารณาทำ MRI L-S spine)',
      patientInstructions: 'ผู้ป่วยมีภาวะหมอนรองกระดูกทับเส้นประสาทบริเวณเอวข้างซ้าย ข้อควรปฏิบัติดังนี้:\n1. ทานยาตามแพทย์สั่งอย่างเคร่งครัด โดยเฉพาะยาก่อนนอนสำหรับลดอาการปวดเส้นประสาท (Gabapentin) ซึ่งอาจทำให้ง่วงนอนได้\n2. งดการก้มยกของหนัก งดการนั่งเก้าอี้เตี้ย นั่งพื้น หรือขับรถระยะทางไกล\n3. ใส่เข็มขัดพยุงหลัง (Lumbar Support) เฉพาะเวลาต้องยืนหรือเดินนานๆ\n4. ไปทำกายภาพบำบัดดึงหลังและบริหารตามที่แพทย์ส่งตัว\n5. สัญญาณเตือนอันตราย: หากมีอาการชาบริเวณก้นรอบทวารหนัก ปัสสาวะไม่ออก หรือกลั้นอุจจาระไม่ได้ หรือขาอ่อนแรงจนเดินไม่ได้ ให้รีบมาโรงพยาบาลทันทีตลอด 24 ชั่วโมงครับ'
    }
  },

  // Case 4: Rotator Cuff Tear
  rotator_cuff: {
    id: 'rotator_cuff',
    title: 'เอ็นข้อไหล่ฉีกขาด (Rotator Cuff Tear - Right Shoulder)',
    patientName: 'คุณปราณี อายุ 56 ปี',
    dialogue: [
      { speaker: 'Doctor', text: 'สวัสดีครับคุณปราณี ปวดข้อไหล่ข้างไหน และเป็นมานานเท่าไหร่แล้วครับ?' },
      { speaker: 'Patient', text: 'สวัสดีค่ะคุณหมอ ปวดไหล่ข้างขวามาเกือบ 3 เดือนแล้วค่ะ ปวดมากเวลากลางคืน นอนตะแคงทับข้างขวาไม่ได้เลยค่ะ สะดุ้งตื่นตลอด ยกแขนเอื้อมหยิบของที่สูง หรือเอื้อมมือไปรูดซิปด้านหลังก็เจ็บมากค่ะ' },
      { speaker: 'Doctor', text: 'เคยหกล้มกระแทกไหล่มาก่อนไหมครับ หรือปวดเรื้อรังขึ้นมาเอง?' },
      { speaker: 'Patient', text: 'เคยสะดุดหกล้มเอามือยันพื้นเมื่อสามเดือนก่อนค่ะ จากนั้นก็เริ่มปวดสะสมมาเรื่อยๆ จนยกแขนไม่ค่อยขึ้นค่ะ' },
      { speaker: 'Doctor', text: 'หมอขอตรวจขยับข้อไหล่ขวาหน่อยนะครับ... ตรวจพบ Painful arc ระหว่าง 60-120 องศา, การตรวจ Neer test ให้ผลบวก และ Hawkins-Kennedy test ให้ผลบวก' },
      { speaker: 'Doctor', text: 'ตรวจกล้ามเนื้อ Supraspinatus ด้วย Empty can test พบว่ามีอาการปวดและกล้ามเนื้อต้านแรงได้ลดลง (Weakness grade 4/5), Drop arm test negative ครับ' },
      { speaker: 'Doctor', text: 'ลักษณะนี้เข้าได้กับ ภาวะเอ็นกล้ามเนื้อข้อไหล่ฉีกขาด (Rotator cuff tear โดยเฉพาะเส้นเอ็น Supraspinatus) ร่วมกับภาวะการกดเบียดใต้โพรงไหล่ (Subacromial impingement) ครับ' },
      { speaker: 'Doctor', text: 'หมอแนะนำให้ทำ X-ray ดูโครงสร้างกระดูก acromion และส่ง Ultrasound หรือ MRI ข้อไหล่ขวาเพื่อดูขนาดของรอยฉีกขาดของเส้นเอ็นครับ' }
    ],
    parsed: {
      cc: 'ปวดข้อไหล่ขวา ยกแขนไม่ขึ้น นอนตะแคงทับไม่ได้ 3 เดือน',
      pi: 'ผู้ป่วยหญิงอายุ 56 ปี มีประวัติหกล้มมือยันพื้น 3 เดือนก่อน หลังจากนั้นปวดข้อไหล่ขวาเรื้อรัง ปวดมากเวลากลางคืน (Night pain) ยกแขนทำกิจวัตรประจำวันลำบาก ไม่สามารถเอื้อมมือไปด้านหลังได้ (limited internal rotation)',
      pmh: 'ไม่มีโรคประจำตัว ไม่เคยผ่าตัด ไม่แพ้ยา',
      pe: 'Right Shoulder: No acute swelling or muscle wasting. Tender at greater tuberosity and subacromial space. Active ROM: Abduction 0-110 deg (painful arc 60-120 deg), Forward flexion 0-120 deg. Special Tests: Neer test POSITIVE, Hawkins-Kennedy test POSITIVE, Empty can test POSITIVE (pain + weakness grade 4/5). Passive ROM preserved with mild end-range pain.',
      imaging: 'X-ray Right shoulder: Type II acromion, subacromial spurring, no dislocation.',
      dx: 'Rotator Cuff Tear (Right Supraspinatus Tendon) with Subacromial Impingement',
      ddx: 'Adhesive capsulitis (Frozen shoulder), Calcific tendinitis, Biceps tendinitis',
      treatment: '1. Arcoxia (90) 1 tab OD pc x 10 days\n2. Paracetamol (500) 1 tab q 6 hr prn\n3. Order Ultrasound / MRI Right shoulder to evaluate tear size\n4. Pendulum exercise and gentle passive stretching\n5. Consider Subacromial Corticosteroid injection if severe night pain',
      advice: 'หลีกเลี่ยงการยกของหนักเหนือศีรษะ หลีกเลี่ยงการนอนทับไหล่ข้างที่เจ็บ ประคบอุ่นก่อนทำกายภาพยืดเหยียดเบาๆ',
      followUp: '2-3 สัปดาห์ (ติดตามผลการตรวจภาพถ่ายรังสีและพิจารณาแผนการรักษา/ฉีดยา/ผ่าตัดส่องกล้อง)',
      patientInstructions: 'ผลการตรวจพบเอ็นข้อไหล่ขวามีการอักเสบและฉีกขาด คำแนะนำในการดูแลตนเอง:\n1. หลีกเลี่ยงการยกแขนสูงเหนือศีรษะ หรือเอื้อมหยิบของหนัก\n2. เวลานอนให้หาหมอนใบเล็กมารองใต้ข้อศอกขวาเพื่อลดแรงตึงที่ข้อไหล่ และหลีกเลี่ยงการนอนตะแคงทับไหล่ขวา\n3. ทำท่าบริหารแกว่งแขนเบาๆ (Pendulum exercise) วันละ 2-3 ครั้ง\n4. ทานยาตามแพทย์สั่ง และมาตรวจตามนัดเพื่อดูขนาดรอยฉีกขาดของเส้นเอ็นจากอัลตราซาวด์หรือเอ็มอาร์ไอครับ'
    }
  },

  // Case 5: Trigger Finger
  trigger_finger: {
    id: 'trigger_finger',
    title: 'โรคนิ้วล็อค (Trigger Finger Grade 3 - Right Ring Finger)',
    patientName: 'คุณวรรณา อายุ 52 ปี',
    dialogue: [
      { speaker: 'Doctor', text: 'สวัสดีครับคุณวรรณา วันนี้มีปัญหาที่มือข้างไหนครับ?' },
      { speaker: 'Patient', text: 'สวัสดีค่ะคุณหมอ นิ้วนางข้างขวาค่ะ เวลากำมือทำงานบ้านหรือซักผ้า พอกางมือออก นิ้วนางจะสะดุด กึก ล็อคค้าง เหยียดไม่ออกเลยค่ะคุณหมอ ต้องเอามือซ้ายมาช่วยงัดเหยียดออก เจ็บโคนนิ้วมากค่ะ เป็นมา 1 เดือนแล้วค่ะ' },
      { speaker: 'Doctor', text: 'มีอาการชานิ้วมือ หรือปวดข้อมือร่วมด้วยไหมครับ?' },
      { speaker: 'Patient', text: 'ไม่มีอาการชาค่ะ มีแต่ปวดเจ็บตรงโคนนิ้วที่สะดุดค่ะ ทำงานตัดเย็บเสื้อผ้าและซักผ้าด้วยมือบ่อยค่ะ' },
      { speaker: 'Doctor', text: 'หมอขอตรวจดูที่ฝ่ามือนะครับ... คลำพบก้อนปม (nodule) ขนาดเล็กและกดเจ็บชัดเจนบริเวณ A1 pulley ตรงโคนนิ้วนางด้านฝ่ามือ' },
      { speaker: 'Doctor', text: 'พอลองให้คนไข้งอนิ้วแล้วเหยียดออก พบว่ามีนิ้วล็อคค้างจริง (Triggering) และต้องใช้มืออีกข้างช่วยเหยียด (Passive extension required) เข้าได้กับ Trigger finger grade 3 ของนิ้วนางข้างขวาครับ' },
      { speaker: 'Doctor', text: 'โรคนี้เกิดจากปลอกหุ้มเส้นเอ็นเกิดการหนาตัวและอักเสบจากการใช้งานซ้ำๆ เบื้องต้นหมอแนะนำให้พักการใช้งานนิ้วมือ แช่น้ำอุ่นเช้า-เย็น จ่ายยาลดอักเสบ หรือหากต้องการหายเร็ว สามารถพิจารณาฉีดยาสเตียรอยด์เฉพาะที่เข้าปลอกหุ้มเอ็นได้ครับ' }
    ],
    parsed: {
      cc: 'นิ้วนางข้างขวาสะดุด ล็อคค้าง ต้องช่วยงัดออก 1 เดือน',
      pi: 'ผู้ป่วยหญิงอายุ 52 ปี ทำอาชีพตัดเย็บเสื้อผ้า มีอาการสะดุดและเจ็บบริเวณโคนนิ้วนางข้างขวาเวลาขยับ 1 เดือนมานี้ อาการเป็นมากขึ้น ตอนเช้าหลังตื่นนอนนิ้วจะล็อคในท่างอ ต้องใช้มืออีกข้างช่วยดัดเหยียดออก (Grade 3 Trigger finger) ไม่มีอาการชาตามปลายนิ้ว',
      pmh: 'ไม่มีเบาหวาน ไม่มีรูมาตอยด์ ปฏิเสธการแพ้ยา',
      pe: 'Right Hand: Tender palpable nodule at A1 pulley area of the 4th digit (ring finger). Active flexion induces triggering with locked flexion deformity requiring passive manipulation to fully extend (Green\'s classification Grade 3). No tenderness at anatomical snuffbox, Finkelstein negative. Neurovascular intact.',
      imaging: 'Not indicated at this stage.',
      dx: 'Trigger Finger, Right Ring Finger (Grade 3 Green\'s Classification)',
      ddx: 'Dupuytren\'s contracture, Flexor tenosynovitis, MCP joint sprain',
      treatment: '1. Celecoxib (200) 1 tab OD pc x 10 days\n2. Warm water hand soaking (10-15 min bid)\n3. Hand resting, avoid repetitive gripping activities\n4. Offer local corticosteroid injection at A1 pulley sheath / discuss percutaneous A1 pulley release if symptoms recur',
      advice: 'หลีกเลี่ยงการหิ้วของหนักด้วยนิ้วมือ การบิดผ้าแรงๆ หรือการกำเครื่องมือแน่นเป็นเวลานาน แช่มือในน้ำอุ่นทุกเช้า',
      followUp: '3-4 สัปดาห์ (ประเมินผล หากยังสะดุดพิจารณาฉีดยาเข้าปลอกเอ็นหรือสะกิดพังผืด)',
      patientInstructions: 'ผู้ป่วยมีภาวะโรคนิ้วล็อคระยะที่ 3 ของนิ้วนางข้างขวา คำแนะนำในการดูแลตัวเอง:\n1. แช่มือในน้ำอุ่นประมาณ 10-15 นาที ทุกเช้าและเย็น จะช่วยให้เส้นเอ็นและปลอกหุ้มเอ็นคลายตัว ขยับได้ง่ายขึ้น\n2. หลีกเลี่ยงกิจกรรมที่ต้องกำมือแน่นเป็นเวลานาน เช่น การหิ้วถุงของหนักด้วยนิ้วมือ การบิดผ้าแรงๆ หรือการใช้กรรไกรต่อเนื่อง\n3. ทานยาแก้อักเสบตามที่แพทย์สั่งต่อเนื่อง 10 วัน\n4. ห้ามออกแรงกระชากนิ้วที่ล็อคอย่างรุนแรง หากนิ้วล็อคให้ค่อยๆ ใช้อีกมือช่วยประคองดันออกเบาๆ\n5. หากอาการยังไม่ดีขึ้น สามารถกลับมาพบแพทย์เพื่อพิจารณาฉีดยาระงับการอักเสบเฉพาะที่ได้ครับ'
    }
  }
};

// Export globally
if (typeof window !== 'undefined') {
  window.ORTHO_SCENARIOS = ORTHO_SCENARIOS;
}
