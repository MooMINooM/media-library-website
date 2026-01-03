// script.js
import * as UI from './ui.js';

const PROJECT_URL = 'https://dazypxnsfwdwrqluicbc.supabase.co'; 
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhenlweG5zZndkd3JxbHVpY2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNDkzMDIsImV4cCI6MjA4MjcyNTMwMn0.hAxjy_poDer5ywgRAZwzTkXF-OAcpduLxESW3v5adxo';

let supabase;
try { supabase = window.supabase.createClient(PROJECT_URL, ANON_KEY); } catch(e) { console.error(e); }

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    if(supabase) fetchAndRenderAll();
});

// ✅ Navigation
function setupNavigation() {
    const links = document.querySelectorAll('[data-page], [data-page-link]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            if(link.getAttribute('target') === '_blank') return;

            e.preventDefault();
            const pageId = link.getAttribute('data-page') || link.getAttribute('data-page-link');
            
            document.querySelectorAll('.page-content').forEach(section => {
                section.classList.add('hidden');
                section.classList.remove('animate-fade-in');
            });

            const target = document.getElementById(`page-${pageId}`);
            if (target) {
                target.classList.remove('hidden');
                target.classList.add('animate-fade-in');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
                if(link.classList.contains('nav-link')) link.classList.add('active');
            }

            const mobileMenu = document.getElementById('mobile-menu');
            if(mobileMenu) mobileMenu.classList.add('hidden');
        });
    });
}

// ✅ Data Fetching
async function fetchAndRenderAll() {
    
    // 1. School Info
    try {
        const { data: info } = await supabase.from('school_info').select('*');
        if(info) UI.renderSchoolInfo(info);
    } catch (e) {}

    // 2. News
    try {
        const { data: news } = await supabase.from('news').select('*');
        if(news) {
            UI.renderHomeNews(news);
            UI.renderNews(news);
        }
    } catch (e) {}

    // 3. Achievements
    try {
        const { data: teachers } = await supabase.from('teacher_achievements').select('*');
        if(teachers) UI.renderTeacherAchievements(teachers);

        const { data: students } = await supabase.from('student_achievements').select('*');
        if(students) UI.renderStudentAchievements(students);

        // รวม O-NET / NT / RT
        const { data: school } = await supabase.from('school_achievements').select('*');
        const { data: onet } = await supabase.from('onet').select('*');
        const { data: nt } = await supabase.from('nt').select('*');
        const { data: rt } = await supabase.from('rt').select('*');
        
        let allAcademic = [];
        if(school) allAcademic = [...school];
        
        const formatAcad = (arr, prefix) => arr ? arr.map(i => ({
            ...i, 
            title: `${prefix} ${i.title}`,
            competition: `${prefix} ปี ${i.tag}`, // ใช้ปีเป็นชื่อโฟลเดอร์
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

    } catch (e) {}

    // 4. Docs & Innov
    try {
        const { data: docs } = await supabase.from('documents').select('*');
        if(docs) {
            UI.renderDocuments(docs, 'documents-official-container'); 
            UI.renderDocuments(docs, 'documents-forms-container'); 
        }
        const { data: innov } = await supabase.from('innovations').select('*');
        if(innov) UI.renderInnovations(innov);
    } catch (e) {}

    // 5. Personnel & Stats
    try {
        const { data: personnel } = await supabase.from('personnel').select('*');
        const { data: director } = await supabase.from('director_history').select('*');
        const { data: p_history } = await supabase.from('personnel_history').select('*');
        
        if(personnel) UI.renderPersonGrid(personnel, 'personnel-list-container');
        if(director) UI.renderHistoryTable('director-history-table-body', director);
        if(p_history) UI.renderHistoryTable('personnel-history-table-body', p_history);

        const { data: stats } = await supabase.from('student_data').select('*'); 
        if(stats) UI.renderStudentChart(stats);

    } catch (e) {}

    // 6. E-Service (Dynamic)
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
            container.innerHTML = '<span class="block px-4 py-2 text-gray-400 text-xs text-center cursor-default">ยังไม่มีระบบ</span>';
        }
    } catch (e) {}
}
