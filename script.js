// js/script.js
import * as UI from './ui.js';

// ⚠️⚠️⚠️ ตั้งค่า Supabase (ใส่ URL และ Key ของอาจารย์ที่นี่) ⚠️⚠️⚠️
const PROJECT_URL = 'https://dazypxnsfwdwrqluicbc.supabase.co'; 
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhenlweG5zZndkd3JxbHVpY2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNDkzMDIsImV4cCI6MjA4MjcyNTMwMn0.hAxjy_poDer5ywgRAZwzTkXF-OAcpduLxESW3v5adxo';

const supabase = window.supabase.createClient(PROJECT_URL, ANON_KEY);

// ฟังก์ชันหลักเริ่มทำงาน
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    fetchAndRenderAll();
});

// จัดการการเปลี่ยนหน้า (Navigation)
function setupNavigation() {
    const navLinks = document.querySelectorAll('[data-page], [data-page-link]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page') || link.getAttribute('data-page-link');
            
            // 1. ซ่อนทุกหน้า
            document.querySelectorAll('.page-content').forEach(el => el.classList.add('hidden'));
            
            // 2. โชว์หน้าเป้าหมาย
            const targetPage = document.getElementById(`page-${pageId}`);
            if (targetPage) {
                targetPage.classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            // 3. ปิดเมนูมือถือ (ถ้าเปิดอยู่)
            document.getElementById('mobile-menu').classList.add('hidden');
        });
    });
}

// ดึงข้อมูลทั้งหมดจาก Supabase
async function fetchAndRenderAll() {
    try {
        // 1. ข้อมูลทั่วไป
        const { data: news } = await supabase.from('news').select('*');
        const { data: teachers } = await supabase.from('teacher_achievements').select('*');
        const { data: students } = await supabase.from('student_achievements').select('*');
        const { data: school } = await supabase.from('school_achievements').select('*');
        const { data: docs } = await supabase.from('documents').select('*');
        const { data: innov } = await supabase.from('innovations').select('*');
        const { data: schoolInfo } = await supabase.from('school_info').select('*');
        const { data: personnel } = await supabase.from('personnel').select('*');
        const { data: studentStats } = await supabase.from('student_stats').select('*');

        // 2. ข้อมูลวิชาการ (O-NET / NT / RT)
        const { data: onet } = await supabase.from('onet').select('*');
        const { data: nt } = await supabase.from('nt').select('*');
        const { data: rt } = await supabase.from('rt').select('*');

        // --- Render ลงหน้าเว็บ ---

        // หน้าแรก & ข่าว
        UI.renderHomeNews(news);
        UI.renderNews(news);

        // ผลงาน
        UI.renderTeacherAchievements(teachers);
        UI.renderStudentAchievements(students);
        UI.renderSchoolAchievements(school); // ผลงานโรงเรียนทั่วไป

        // 📊 วิชาการ: แปลงข้อมูล O-NET/NT/RT ให้เข้าฟอร์มของการ์ด (Mapping)
        // เราใช้ "tag" (ปีการศึกษา) มาเป็น "competition" เพื่อให้ระบบสร้าง Folder ปีให้
        // และใส่รูปปกกลางๆ ให้ (เพราะไฟล์จริงอาจเป็น PDF)
        const formatAcademic = (data, defaultImg) => {
            if(!data) return [];
            return data.map(item => ({
                ...item,
                competition: `ปีการศึกษา ${item.tag}`, // สร้าง Folder ตามปี
                program: 'ผลสอบทางการ',
                image: defaultImg, // รูปปก
                organization: 'สพฐ.',
                fileUrl: item.file_url // ลิงก์ไฟล์จริง
            }));
        };

        // ส่งข้อมูลวิชาการไปให้ UI วาด (ใช้ฟังก์ชันเดียวกับ Achievement แต่แยก Container)
        // ** ต้องแก้ ui.js ให้ renderAchievementSystem เป็น export หรือเรียกผ่าน UI object **
        // ในไฟล์ ui.js ที่ให้ไป ฟังก์ชัน renderAchievementSystem เป็น internal
        // แต่เราสามารถ Hack โดยการเรียกผ่าน renderSchoolAchievements ได้ หรือแก้ ui.js นิดหน่อย
        // เพื่อความง่าย: ผมเขียน Logic แยกให้ใน ui.js แล้ว (ใน renderSchoolAchievements)
        // แต่เพื่อความชัวร์สำหรับการแยกหน้า ผมจะใช้ฟังก์ชัน render ในนี้เลย

        // Render O-NET
        renderAcademicSystem('onet-container', formatAcademic(onet, 'https://cdn-icons-png.flaticon.com/512/3000/3000745.png'), 'school');
        // Render NT
        renderAcademicSystem('nt-container', formatAcademic(nt, 'https://cdn-icons-png.flaticon.com/512/3000/3000756.png'), 'school');
        // Render RT
        renderAcademicSystem('rt-container', formatAcademic(rt, 'https://cdn-icons-png.flaticon.com/512/3000/3000767.png'), 'school');

        // เอกสาร & นวัตกรรม
        UI.renderDocuments(docs, 'documents-official-container'); // ส่ง container id ไปบอกว่าเป็น Official
        UI.renderDocuments(docs, 'documents-forms-container');    // (ต้องกรอง category ใน ui.js หรือ database) *หมายเหตุ: ui.js ตัวล่าสุดจัดการให้แล้ว
        UI.renderInnovations(innov);

        // ข้อมูลโรงเรียน
        UI.renderSchoolInfo(schoolInfo);
        UI.renderPersonGrid(personnel.filter(p => p.type === 'current'), 'personnel-list-container');
        UI.renderHistoryTable('director-history-table-body', personnel.filter(p => p.type === 'director_history'));
        UI.renderHistoryTable('personnel-history-table-body', personnel.filter(p => p.type === 'history'));
        
        // กราฟ
        UI.renderStudentChart(studentStats);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// ฟังก์ชันเสริมสำหรับเรียก UI ของ O-NET/NT/RT (เนื่องจาก ui.js ไม่ได้ export renderAchievementSystem ตรงๆ)
function renderAcademicSystem(containerId, data, type) {
    // เราใช้ทริค: ส่งข้อมูลที่แปลงแล้ว ไปให้ฟังก์ชัน renderSchoolAchievements 
    // แต่มันจะไปลง school-achievements-container
    // ดังนั้นเราต้องเขียน UI Logic เล็กๆ ตรงนี้ หรือ แก้ใน ui.js
    
    // ✅ วิธีที่ง่ายที่สุด: ใช้ ui.js ตัวล่าสุดที่ผมให้ไป มันมี Logic รองรับ onet-container แล้ว
    // เราแค่ต้องส่ง data ไปให้ถูก
    
    // โหลด Module UI แบบ Dynamic เพื่อเรียกใช้ฟังก์ชันภายใน (ถ้าจำเป็น)
    // แต่จริงๆ ใน ui.js ตัวล่าสุด ผมเขียนดักไว้แล้วว่าถ้ามี element id 'onet-container' ให้วาดลงไปได้เลย
    // ดังนั้นโค้ดข้างบนที่เรียก renderAcademicSystem... เปลี่ยนเป็นเรียก UI ตรงๆ ได้ถ้า UI export มา
    
    // เพื่อความชัวร์และง่าย: ใช้ท่าไม้ตาย --> สร้างฟังก์ชัน render เฉพาะกิจใน script.js โดยลอก logic บางส่วนมา
    // หรือ (ดีที่สุด) ใช้ UI.renderSchoolAchievements แล้วให้มันไปจัดการเองตาม id
    
    // *หมายเหตุ: ใน ui.js ตัวล่าสุด ผมเขียนให้ renderSchoolAchievements แยก onet/nt/rt ให้แล้ว
    // ดังนั้นเราแค่ส่ง data รวม หรือส่งแยกก็ได้ 
    // เพื่อความสมบูรณ์แบบ ให้ใช้บรรทัดข้างล่างนี้ครับ:
    
    import('./ui.js').then(Module => {
        // เรียกใช้ฟังก์ชันภายใน Module ที่ไม่ได้ export (ถ้าทำได้) หรือใช้ฟังก์ชันที่ export
        // เนื่องจาก JS Module เข้าถึง private ไม่ได้
        // เราจึงต้องพึ่งพา UI.renderSchoolAchievements ในการจัดการ หรือ เพิ่ม export ใน ui.js
        
        // สมมติว่า ui.js ตัวล่าสุดทำงานตามที่คุยกัน คือแยก onet/nt/rt อัตโนมัติ
        // เราแค่โยนข้อมูลเข้า school_achievements แล้ว ui.js จัดการแยก
        
        // *แต่เดี๋ยวก่อน!* อาจารย์แยกตาราง onet/nt/rt ใน Database
        // ดังนั้นเราต้องแปลงข้อมูลพวกนี้ ให้หน้าตาเหมือน School Achievement แล้วรวมส่งไปให้ UI
        
        // แก้ไข ui.js บรรทัดสุดท้ายให้ export renderAchievementSystem ออกมาใช้จะง่ายสุด
        // แต่ถ้าไม่อยากแก้ ui.js แล้ว... ใช้ท่านี้ครับ:
        
        // ส่ง O-NET
        const onetContainer = document.getElementById(containerId);
        if(onetContainer) {
             // เรียกใช้ฟังก์ชัน render ของ Folder System ที่เรามี
             // เนื่องจาก export ไม่ได้ เราจะใช้ trick การเปลี่ยน data ให้ UI.renderSchoolAchievements(data) ทำงาน
             // แต่ SchoolAchievements มัน clear container
             
             // **สรุป:** อาจารย์ครับ เพื่อให้ง่ายที่สุด รบกวนกลับไปแก้ `js/ui.js` บรรทัดสุดท้าย
             // เพิ่ม `export { renderAchievementSystem };` ต่อท้ายครับ
             // แล้วใช้โค้ดนี้:
             Module.renderAchievementSystem(containerId, data, type);
        }
    });
}
