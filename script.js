// js/script.js
import * as UI from './ui.js';

// ⚠️⚠️⚠️ ใส่ URL และ KEY ของอาจารย์ที่นี่ ⚠️⚠️⚠️
const PROJECT_URL = 'https://dazypxnsfwdwrqluicbc.supabase.co'; 
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhenlweG5zZndkd3JxbHVpY2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNDkzMDIsImV4cCI6MjA4MjcyNTMwMn0.hAxjy_poDer5ywgRAZwzTkXF-OAcpduLxESW3v5adxo';

let supabase;

try {
    supabase = window.supabase.createClient(PROJECT_URL, ANON_KEY);
} catch (e) {
    console.error("Supabase Init Failed:", e);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("App Started...");
    setupNavigation();
    if(supabase) fetchAndRenderAll();
});

// ✅ ฟังก์ชันจัดการเมนู (Navigation)
function setupNavigation() {
    const links = document.querySelectorAll('[data-page], [data-page-link]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            if(link.getAttribute('target') === '_blank') return; // ปล่อยลิงก์ภายนอก

            e.preventDefault();
            const pageId = link.getAttribute('data-page') || link.getAttribute('data-page-link');
            
            // 1. ซ่อนทุกหน้า
            document.querySelectorAll('.page-content').forEach(section => {
                section.classList.add('hidden');
                section.classList.remove('animate-fade-in');
            });

            // 2. โชว์หน้าเป้าหมาย
            const target = document.getElementById(`page-${pageId}`);
            if (target) {
                target.classList.remove('hidden');
                target.classList.add('animate-fade-in');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
                if(link.classList.contains('nav-link')) link.classList.add('active');
            }

            // 3. ปิดเมนูมือถือ
            const mobileMenu = document.getElementById('mobile-menu');
            if(mobileMenu) mobileMenu.classList.add('hidden');
        });
    });
}

// ✅ ฟังก์ชันดึงข้อมูลทั้งหมด
async function fetchAndRenderAll() {
    // 1. ข้อมูลโรงเรียน
    try {
        const { data: info } = await supabase.from('school_info').select('*');
        if(info) UI.renderSchoolInfo(info);
    } catch (e) { console.error("Error School Info:", e); }

    // 2. ข่าวสาร
    try {
        const { data: news } = await supabase.from('news').select('*');
        if(news) {
            UI.renderHomeNews(news);
            UI.renderNews(news);
        }
    } catch (e) { console.error("Error News:", e); }

    // 3. ผลงาน (ครู/นักเรียน/โรงเรียน + วิชาการ)
    try {
        const { data: teachers } = await supabase.from('teacher_achievements').select('*');
        if(teachers) UI.renderTeacherAchievements(teachers);

        const { data: students } = await supabase.from('student_achievements').select('*');
        if(students) UI.renderStudentAchievements(students);

        // ดึงข้อมูล 4 ส่วนมารวมกันเพื่อส่งให้ UI จัดการ
        const { data: school } = await supabase.from('school_achievements').select('*');
        const { data: onet } = await supabase.from('onet').select('*');
        const { data: nt } = await supabase.from('nt').select('*');
        const { data: rt } = await supabase.from('rt').select('*');
        
        let allAcademic = [];
        // รวมผลงานโรงเรียนทั่วไป
        if(school) allAcademic = [...allAcademic, ...school];
        
        // แปลง O-NET/NT/RT ให้ format ตรงกันกับที่ UI คาดหวัง
        // (Mapping: title -> title, tag -> competition เพื่อให้สร้าง Folder ปี)
        const formatAcad = (arr, prefix) => arr ? arr.map(i => ({
            ...i, 
            title: `${prefix} ${i.title}`, // เพิ่ม Prefix ให้ชัดเจน
            competition: `${prefix} ปี ${i.tag}`, // ใช้ Tag ปีการศึกษา เป็นชื่อ Folder
            image: i.file_url, // ใช้ไฟล์เป็นรูป (ถ้าเป็นรูป) หรือลิงก์
            fileUrl: i.file_url // เก็บลิงก์ไว้เปิด
        })) : [];

        allAcademic = [
            ...allAcademic, 
            ...formatAcad(onet, 'O-NET'), 
            ...formatAcad(nt, 'NT'), 
            ...formatAcad(rt, 'RT')
        ];

        // ส่งให้ UI render (UI จะแยก Folder ตามชื่อ Competition ให้เอง)
        UI.renderSchoolAchievements(allAcademic);

    } catch (e) { console.error("Error Achievements:", e); }

    // 4. เอกสาร & นวัตกรรม
    try {
        const { data: docs } = await supabase.from('documents').select('*');
        if(docs) {
            UI.renderDocuments(docs, 'documents-official-container'); 
            UI.renderDocuments(docs, 'documents-forms-container'); 
        }
        const { data: innov } = await supabase.from('innovations').select('*');
        if(innov) UI.renderInnovations(innov);
    } catch (e) { console.error("Error Docs:", e); }

    // 5. บุคลากร & นักเรียน
    try {
        const { data: personnel } = await supabase.from('personnel').select('*');
        const { data: director } = await supabase.from('director_history').select('*');
        const { data: p_history } = await supabase.from('personnel_history').select('*');
        
        if(personnel) UI.renderPersonGrid(personnel, 'personnel-list-container');
        if(director) UI.renderHistoryTable('director-history-table-body', director);
        if(p_history) UI.renderHistoryTable('personnel-history-table-body', p_history);

        const { data: stats } = await supabase.from('student_data').select('*'); 
        if(stats) UI.renderStudentChart(stats);

    } catch (e) { console.error("Error Personnel:", e); }

    // 6. ✅ ระบบสารสนเทศ (E-Service Dynamic Menu)
    try {
        const { data: services } = await supabase.from('eservices').select('*').order('id', { ascending: true });
        const container = document.getElementById('eservice-dropdown-container');
        
        if (services && services.length > 0) {
            container.innerHTML = ''; 
            services.forEach(item => {
                const a = document.createElement('a');
                a.href = item.url;
                a.target = "_blank";
                a.className = "block px-4 py-2 hover:bg-green-50 text-green-700 font-bold border-b border-gray-100 last:border-0 transition";
                a.innerHTML = `<i class="fa-solid fa-link mr-2 text-green-500"></i> ${item.title}`; 
                container.appendChild(a);
            });
        } else {
            container.innerHTML = '<span class="block px-4 py-2 text-gray-400 text-xs cursor-default text-center">ยังไม่มีระบบ</span>';
        }
    } catch (e) { console.error("Error E-Service:", e); }
}
