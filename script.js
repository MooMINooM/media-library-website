// js/script.js
import * as UI from './ui.js';

// ⚠️⚠️⚠️ ใส่ URL และ KEY ของอาจารย์ที่นี่ ⚠️⚠️⚠️
const PROJECT_URL = 'https://dazypxnsfwdwrqluicbc.supabase.co'; 
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhenlweG5zZndkd3JxbHVpY2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNDkzMDIsImV4cCI6MjA4MjcyNTMwMn0.hAxjy_poDer5ywgRAZwzTkXF-OAcpduLxESW3v5adxo';

let supabase;

try {
    supabase = window.supabase.createClient(PROJECT_URL, ANON_KEY);
} catch (e) {
    console.error("Supabase Init Failed. Check your URL/Key.", e);
}

// เริ่มทำงานเมื่อเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', () => {
    console.log("System Loading...");
    setupNavigation(); 
    if(supabase) fetchAndRenderAll();
});

// =========================================
// 1. ระบบเปลี่ยนหน้า (Navigation)
// =========================================
function setupNavigation() {
    const links = document.querySelectorAll('[data-page], [data-page-link]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            // ถ้าเป็นลิงก์ภายนอก (เช่น ระบบเช็คชื่อ) ให้ปล่อยผ่าน
            if(link.getAttribute('target') === '_blank') return;

            e.preventDefault();
            const pageId = link.getAttribute('data-page') || link.getAttribute('data-page-link');
            
            // ซ่อนทุกหน้า
            document.querySelectorAll('.page-content').forEach(el => {
                el.classList.add('hidden');
                el.classList.remove('animate-fade-in');
            });

            // โชว์หน้าเป้าหมาย
            const target = document.getElementById(`page-${pageId}`);
            if (target) {
                target.classList.remove('hidden');
                target.classList.add('animate-fade-in');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // ปรับเมนู Active
                document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
                if(link.classList.contains('nav-link')) link.classList.add('active');
            }

            // ปิดเมนูมือถือ
            const mobileMenu = document.getElementById('mobile-menu');
            if(mobileMenu) mobileMenu.classList.add('hidden');
        });
    });
}

// =========================================
// 2. ดึงข้อมูลและแสดงผล (Data Fetching)
// =========================================
async function fetchAndRenderAll() {
    
    // 2.1 ข้อมูลโรงเรียน
    try {
        const { data } = await supabase.from('school_info').select('*');
        if(data) UI.renderSchoolInfo(data);
    } catch (e) { console.warn("Load School Info Failed", e); }

    // 2.2 ข่าวสาร
    try {
        const { data } = await supabase.from('news').select('*');
        if(data) {
            UI.renderHomeNews(data);
            UI.renderNews(data);
        }
    } catch (e) { console.warn("Load News Failed", e); }

    // 2.3 ผลงานครู & นักเรียน
    try {
        const { data: teachers } = await supabase.from('teacher_achievements').select('*');
        if(teachers) UI.renderTeacherAchievements(teachers);

        const { data: students } = await supabase.from('student_achievements').select('*');
        if(students) UI.renderStudentAchievements(students);
    } catch (e) { console.warn("Load Achievements Failed", e); }

    // 2.4 ✅ ไฮไลท์: รวมพลัง O-NET / NT / RT และผลงานโรงเรียน
    try {
        // ดึงข้อมูลดิบจาก 4 ตาราง
        const { data: school } = await supabase.from('school_achievements').select('*');
        const { data: onet } = await supabase.from('onet').select('*');
        const { data: nt } = await supabase.from('nt').select('*');
        const { data: rt } = await supabase.from('rt').select('*');

        let combinedData = [];

        // ใส่ผลงานโรงเรียนปกติ
        if(school) combinedData = [...combinedData, ...school];

        // 🛠️ ตัวแปลงร่าง (Mapper): แปลงข้อมูลตารางแยก ให้เข้าฟอร์มมาตรฐาน
        // ใส่คำว่า "O-NET" / "NT" / "RT" ลงใน Title เพื่อให้ UI.js รู้ว่าจะเอาไปลงกล่องไหน
        const mapAcademic = (items, type) => {
            if(!items) return [];
            return items.map(item => ({
                id: `acad-${type}-${item.id}`, // สร้าง ID ปลอมกันซ้ำ
                title: `${type} : ${item.title}`, // เพิ่ม Prefix เช่น "O-NET : คะแนนปี 66"
                competition: `ปีการศึกษา ${item.tag}`, // เอาปีมาเป็นชื่อโฟลเดอร์
                fileUrl: item.file_url, // ลิงก์ไฟล์
                image: null, // ไม่มีรูปปก ใช้ icon แทน
                date: item.date,
                category: type // แปะป้ายไว้เผื่อใช้
            }));
        };

        // รวมร่าง
        combinedData = [
            ...combinedData,
            ...mapAcademic(onet, 'O-NET'),
            ...mapAcademic(nt, 'NT'),
            ...mapAcademic(rt, 'RT')
        ];

        // ส่งให้ UI ไปคัดแยกเอง (UI ฉลาดพอจะแยกตาม Title/Category)
        UI.renderSchoolAchievements(combinedData);

    } catch (e) { console.warn("Load Academic Failed", e); }

    // 2.5 เอกสาร & นวัตกรรม
    try {
        const { data: docs } = await supabase.from('documents').select('*');
        if(docs) {
            // UI.renderDocuments จะแยก official/form ให้เองถ้าเราเรียกถูก container
            UI.renderDocuments(docs, 'documents-official-container'); 
            UI.renderDocuments(docs, 'documents-forms-container');
        }
        const { data: innov } = await supabase.from('innovations').select('*');
        if(innov) UI.renderInnovations(innov);
    } catch (e) { console.warn("Load Docs Failed", e); }

    // 2.6 บุคลากร
    try {
        const { data: personnel } = await supabase.from('personnel').select('*');
        if(personnel) UI.renderPersonGrid(personnel, 'personnel-list-container');

        const { data: dirHistory } = await supabase.from('director_history').select('*');
        if(dirHistory) UI.renderHistoryTable('director-history-table-body', dirHistory);

        const { data: perHistory } = await supabase.from('personnel_history').select('*');
        if(perHistory) UI.renderHistoryTable('personnel-history-table-body', perHistory);
    } catch (e) { console.warn("Load Personnel Failed", e); }

    // 2.7 สถิตินักเรียน
    try {
        // เช็คชื่อตารางใน Admin ดีๆ ว่าใช้ 'student_data' หรือ 'student_stats'
        const { data: stats } = await supabase.from('student_data').select('*');
        if(stats) UI.renderStudentChart(stats);
    } catch (e) { console.warn("Load Stats Failed", e); }

    // 2.8 ✅ ระบบสารสนเทศ (Dynamic E-Service)
    try {
        const { data: services } = await supabase.from('eservices').select('*').order('id', { ascending: true });
        const container = document.getElementById('eservice-dropdown-container');
        
        if(container) {
            container.innerHTML = ''; // ล้าง Loading...
            
            if (services && services.length > 0) {
                services.forEach(item => {
                    const a = document.createElement('a');
                    a.href = item.url;
                    a.target = "_blank";
                    a.className = "block px-4 py-2 hover:bg-green-50 text-green-700 font-bold border-b border-gray-100 last:border-0 transition";
                    // แสดงชื่อระบบ (ไม่มี icon ตามที่ขอ)
                    a.innerText = item.title;
                    container.appendChild(a);
                });
            } else {
                container.innerHTML = '<span class="block px-4 py-2 text-gray-400 text-xs text-center cursor-default">ยังไม่มีระบบ</span>';
            }
        }
    } catch (e) { console.warn("Load E-Service Failed", e); }
}
