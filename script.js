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
    setupNavigation();
    if(supabase) fetchAndRenderAll();
});

// ✅ Navigation System (ระบบเปลี่ยนหน้า)
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
                
                // Active State เมนู
                document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
                if(link.classList.contains('nav-link')) link.classList.add('active');
            }

            // 3. ปิดเมนูมือถือ
            const mobileMenu = document.getElementById('mobile-menu');
            if(mobileMenu) mobileMenu.classList.add('hidden');
        });
    });
}

// ✅ Data Fetching System (ระบบดึงข้อมูล)
async function fetchAndRenderAll() {
    
    // 1. School Info (ข้อมูลพื้นฐาน & เกี่ยวกับโรงเรียน)
    // ดึงมาแถวเดียวพอ (limit 1)
    try {
        const { data: info } = await supabase.from('school_info').select('*').limit(1).single();
        if(info) UI.renderSchoolInfo(info); // ส่ง object ก้อนใหญ่ไปให้ UI แกะเอง
    } catch (e) { console.warn("Load School Info Failed", e); }

    // 2. News (ข่าวสาร)
    try {
        const { data: news } = await supabase.from('news').select('*').order('date', { ascending: false });
        if(news) {
            UI.renderHomeNews(news);
            UI.renderNews(news);
        }
    } catch (e) { console.warn("Load News Failed", e); }

    // 3. Achievements (ผลงาน)
    try {
        const { data: teachers } = await supabase.from('teacher_achievements').select('*');
        if(teachers) UI.renderTeacherAchievements(teachers);

        const { data: students } = await supabase.from('student_achievements').select('*');
        if(students) UI.renderStudentAchievements(students);

        // รวม O-NET / NT / RT / School
        const { data: school } = await supabase.from('school_achievements').select('*');
        const { data: onet } = await supabase.from('onet').select('*');
        const { data: nt } = await supabase.from('nt').select('*');
        const { data: rt } = await supabase.from('rt').select('*');
        
        let allAcademic = [];
        if(school) allAcademic = [...school];
        
        // Helper ในการ map ข้อมูลให้เข้าฟอร์ม
        const formatAcad = (arr, prefix) => arr ? arr.map(i => ({
            ...i, 
            title: `${prefix} ${i.title}`,
            competition: `${prefix} ปี ${i.tag}`, // ใช้ปีการศึกษาเป็นชื่อ Folder
            fileUrl: i.file_url,
            image: null
        })) : [];

        allAcademic = [
            ...allAcademic, 
            ...formatAcad(onet, 'O-NET'), 
            ...formatAcad(nt, 'NT'), 
            ...formatAcad(rt, 'RT')
        ];

        UI.renderSchoolAchievements(allAcademic);

    } catch (e) { console.warn("Load Achievements Failed", e); }

    // 4. Docs & Innov (เอกสาร & นวัตกรรม)
    try {
        const { data: docs } = await supabase.from('documents').select('*');
        if(docs) {
            UI.renderDocuments(docs, 'documents-official-container'); 
            UI.renderDocuments(docs, 'documents-forms-container'); 
        }
        const { data: innov } = await supabase.from('innovations').select('*');
        if(innov) UI.renderInnovations(innov);
    } catch (e) { console.warn("Load Docs Failed", e); }

    // 5. Personnel & Stats (บุคลากร & นักเรียน)
    try {
        const { data: personnel } = await supabase.from('personnel').select('*');
        const { data: p_history } = await supabase.from('personnel_history').select('*'); // เปลี่ยนเป็น personnel_history ตามโจทย์
        const { data: director } = await supabase.from('director_history').select('*'); // เผื่อของเก่า
        
        if(personnel) UI.renderPersonGrid(personnel, 'personnel-list-container');
        
        // รวม director history เก่าเข้ากับ personnel history ใหม่ (เผื่อไว้) หรือเลือกแค่อันเดียว
        let historyData = [];
        if(p_history) historyData = [...p_history];
        if(director) historyData = [...historyData, ...director]; 
        
        if(historyData.length > 0) UI.renderHistoryTable('personnel-history-table-body', historyData);

        const { data: stats } = await supabase.from('student_data').select('*'); 
        if(stats) UI.renderStudentChart(stats);

    } catch (e) { console.warn("Load Personnel Failed", e); }

    // 6. E-Service (Dynamic Menu)
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
                a.innerText = item.title;
                container.appendChild(a);
            });
        } else {
            if(container) container.innerHTML = '<span class="block px-4 py-2 text-gray-400 text-xs text-center cursor-default">ยังไม่มีระบบ</span>';
        }
    } catch (e) { console.warn("Load E-Service Failed", e); }
}
