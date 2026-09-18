# OrthoVoice AI — ระบบตรวจรักษาและผู้ช่วยเสียงอัจฉริยะคลินิกกระดูกและข้อ (Orthopedic Ambient Scribe & Text-to-Voice)

ระบบเว็บแอปพลิเคชันสำหรับแพทย์และบุคลากรทางการแพทย์เฉพาะทางออร์โธปิดิกส์ (Department of Orthopedics) ที่รับฟังเสียงพูดสนทนาระหว่างแพทย์และผู้ป่วยแบบเรียลไทม์ (Continuous Ambient Speech-to-Text) ตรวจจับคำศัพท์ทางการแพทย์เฉพาะทาง แยกแยะและจัดหมวดหมู่ข้อมูลตามหลักการซักประวัติและตรวจร่างกายมาตรฐาน (Orthopedic SOAP Note & Systematic Physical Examination) พร้อมระบบสังเคราะห์เสียงพูดอ่านคำแนะนำการปฏิบัติตัวให้ผู้ป่วย (Text-to-Voice)

---

## 🌟 จุดเด่นและฟังก์ชันการทำงานหลัก (Key Features)

1. **Ambient Speech-to-Text & Realtime Visualizer**:
   - รับฟังเสียงพูดต่อเนื่องผ่าน Web Speech API รองรับภาษาไทยผสมศัพท์แพทย์สากล
   - แสดงคลื่นความถี่เสียงเรืองแสงแบบเรียลไทม์ด้วย HTML5 Canvas & Web Audio API
   - แยกบทสนทนาแพทย์ (Doctor) และผู้ป่วย (Patient) อัตโนมัติ

2. **Orthopedic Clinical Intelligence Parser**:
   - **Subjective (ประวัติ)**: CC (Chief Complaint) และระยะเวลา, PI (Present Illness) กลไกบาดเจ็บ ลักษณะปวด Morning stiffness, PMH โรคประจำตัวและการแพ้ยา
   - **Objective (ตรวจร่างกาย)**: แยกหมวดหมู่เฉพาะทาง 5 มิติ (Inspection & Gait, Palpation & Tenderness, Range of Motion / ROM, Special Orthopedic Tests, และ Neurovascular)
   - **Assessment (วินิจฉัย)**: สกัด Primary Dx และ Differential Dx
   - **Plan (แผนการรักษา)**: รายการยา, การตรวจภาพรังสี (X-ray, MRI), กายภาพบำบัด และคำแนะนำผู้ป่วย

3. **Text-to-Voice (TTS) Audio Assistant**:
   - สังเคราะห์เสียงพูดภาษาไทยที่นุ่มนวล เข้าใจง่าย ด้วย Web Speech Synthesis API
   - สร้างสคริปต์อัตโนมัติ: คำแนะนำผู้ป่วย, สรุปย่อเคสแพทย์, และสัญญาณเตือนอันตราย (Red Flags)
   - ปรับความเร็วเสียงพูดได้ตั้งแต่ 0.7x – 1.4x

4. **1-Click Preset Demos (5 เคสตัวอย่างจริง)**:
   - 🦵 ข้อเข่าเสื่อม (Osteoarthritis of Knee - OA Knee Grade 3)
   - 🏃‍♂️ เอ็นไขว้หน้าข้อเข่าฉีกขาด (ACL Tear with Meniscal Injury)
   - ⚡ หมอนรองกระดูกทับเส้นประสาท (Lumbar HNP L4-L5 / Sciatica)
   - 💪 เอ็นข้อไหล่ฉีกขาด (Rotator Cuff Tear & Subacromial Impingement)
   - 🖐️ โรคนิ้วล็อค (Trigger Finger Grade 3)

5. **EMR & Hospital Integration**:
   - คัดลอกเวชระเบียนรูปแบบ OPD Card ลงคลิปบอร์ดสำหรับระบบ EMR/HIS
   - สั่งพิมพ์ใบตรวจผู้ป่วยนอก (Print OPD Card)
   - ส่งออกข้อมูลเป็นไฟล์ JSON

---

## 🚀 การติดตั้งและนำขึ้นใช้งานบน Vercel (Deployment)

โปรเจกต์นี้สร้างด้วย Vanilla HTML5 / CSS3 / JavaScript โดยไม่มี External Dependencies ที่ซับซ้อน สามารถ Deploy ขึ้นบน Vercel ได้ทันทีด้วยขั้นตอนดังนี้:

### ขั้นตอนที่ 1: เตรียม Git Repository
```bash
git init
git add .
git commit -m "Initial commit: OrthoVoice AI Web Application"
git branch -M main
```

### ขั้นตอนที่ 2: เชื่อมต่อ GitHub และ Push Code
1. สร้าง Repository ใหม่บน [GitHub](https://github.com/new) ตั้งชื่อ เช่น `orthovoice-ai` หรือ `TTV`
2. เชื่อมต่อ Remote และ Push:
```bash
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

### ขั้นตอนที่ 3: Deploy บน Vercel
1. เข้าไปที่ [Vercel Dashboard](https://vercel.com/dashboard)
2. กด **"Add New..."** -> **"Project"**
3. เลือก Import จาก GitHub repository ที่สร้างไว้
4. สำหรับ **Framework Preset** ให้เลือกเป็น **Other** หรือระบบจะตรวจจับเป็น Static HTML โดยอัตโนมัติ
5. กดปุ่ม **"Deploy"** รอประมาณ 10-15 วินาที ระบบจะพร้อมใช้งานบน Production URL ทันที
