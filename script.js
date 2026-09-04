// script.js
import * as UI from './ui.js';

// ⚠️⚠️⚠️ ใส่ URL และ KEY ของอาจารย์ที่นี่ ⚠️⚠️⚠️
const PROJECT_URL = 'https://dazypxnsfwdwrqluicbc.supabase.co'; 
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhenlweG5zZndkd3JxbHVpY2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNDkzMDIsImV4cCI6MjA4MjcyNTMwMn0.hAxjy_poDer5ywgRAZwzTkXF-OAcpduLxESW3v5adxo';

let supabase;
try { 
    supabase = window.supabase.createClient(PROJECT_URL, ANON_KEY);
    window._supabaseGallery = supabase; // expose for gallery modal
    window._SUPABASE_URL = PROJECT_URL;
} catch(e) { console.error(e); }

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupHeaderScroll();
    setupMobileAccordion();
    setupSiteSearch();
    setActiveLink('home');
    if(supabase) fetchAndRenderAll();
});

// ✅ Navigation System
function setupNavigation() {
    const links = document.querySelectorAll('[data-page], [data-page-link]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            if(link.getAttribute('target') === '_blank') return;
            e.preventDefault();
            const pageId = link.getAttribute('data-page') || link.getAttribute('data-page-link');
            navigateToPage(pageId);
        });
    });
}

function navigateToPage(pageId) {
    document.querySelectorAll('.page-content').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('animate-fade-in');
    });
    const target = document.getElementById(`page-${pageId}`);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('animate-fade-in');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveLink(pageId);
    }
    const mobileMenu = document.getElementById('mobile-menu');
    if(mobileMenu) mobileMenu.classList.add('hidden');
    window.closeSiteSearch();
}

// ✅ Active nav state (desktop nav-links + parent dropdown + mobile menu links)
function setActiveLink(pageId) {
    document.querySelectorAll('[data-page], [data-page-link]').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.dropdown-toggle').forEach(el => el.classList.remove('active'));

    document.querySelectorAll(`[data-page="${pageId}"], [data-page-link="${pageId}"]`).forEach(el => {
        el.classList.add('active');
        const dropdown = el.closest('.dropdown');
        if (dropdown) {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (toggle) toggle.classList.add('active');
        }
    });
}

// ✅ Sticky header: shrink after scrolling past the top
function setupHeaderScroll() {
    const header = document.getElementById('site-header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

// ✅ Mobile menu accordion (เกี่ยวกับเรา / วิชาการ & ผลงาน / บริการ & เอกสาร)
function setupMobileAccordion() {
    document.querySelectorAll('[data-acc-toggle]').forEach(btn => {
        btn.setAttribute('aria-expanded', 'false');
        btn.addEventListener('click', () => {
            const panel = document.getElementById(btn.getAttribute('data-acc-toggle'));
            if (!panel) return;
            const isOpen = !panel.classList.contains('hidden');
            panel.classList.toggle('hidden', isOpen);
            btn.setAttribute('aria-expanded', String(!isOpen));
        });
    });
}

// ✅ Site search (quick jump ไปยังเมนู/หน้าต่าง ๆ)
let _searchIndex = null;
function buildSearchIndex() {
    const seen = new Map();
    document.querySelectorAll('#main-nav [data-page], #mobile-menu [data-page]').forEach(el => {
        const pageId = el.getAttribute('data-page');
        const label = el.textContent.replace(/\s+/g, ' ').trim();
        if (pageId && label && !seen.has(pageId)) seen.set(pageId, label);
    });
    return Array.from(seen, ([pageId, label]) => ({ pageId, label }));
}

function setupSiteSearch() {
    const input = document.getElementById('site-search-input');
    const modal = document.getElementById('site-search-modal');
    if (!input || !modal) return;
    input.addEventListener('input', () => renderSearchResults(input.value));
    modal.addEventListener('click', (e) => { if (e.target === modal) window.closeSiteSearch(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) window.closeSiteSearch();
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); window.openSiteSearch(); }
    });
}

function renderSearchResults(query) {
    if (!_searchIndex) _searchIndex = buildSearchIndex();
    const results = document.getElementById('site-search-results');
    if (!results) return;
    const q = query.trim().toLowerCase();
    const matches = q
        ? _searchIndex.filter(item => item.label.toLowerCase().includes(q)).slice(0, 8)
        : _searchIndex.slice(0, 8);

    if (matches.length === 0) {
        results.innerHTML = `<p class="text-center text-sm text-slate-300 py-6">ไม่พบเมนูที่ตรงกับ "${query}"</p>`;
        return;
    }
    results.innerHTML = matches.map(item => `
        <button type="button" data-goto="${item.pageId}"
            class="search-result-item w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-600 flex items-center gap-2 transition-colors">
            <i class="fa-solid fa-arrow-right text-[10px] text-slate-300"></i> ${item.label}
        </button>`).join('');
    results.querySelectorAll('[data-goto]').forEach(btn => {
        btn.addEventListener('click', () => navigateToPage(btn.getAttribute('data-goto')));
    });
}

window.openSiteSearch = function () {
    const modal = document.getElementById('site-search-modal');
    const input = document.getElementById('site-search-input');
    if (!modal || !input) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    input.value = '';
    renderSearchResults('');
    setTimeout(() => input.focus(), 50);
};

window.closeSiteSearch = function () {
    const modal = document.getElementById('site-search-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
};

// ✅ Data Fetching System
async function fetchAndRenderAll() {
    
    // 1. ข้อมูลโรงเรียน & ป๊อปอัพประกาศพิเศษ
    try {
        const { data: info } = await supabase.from('school_info').select('*').limit(1).single();
        if(info) {
            UI.renderSchoolInfo(info);
            UI.renderAnnouncement(info);
            UI.renderFacebookFeed(info);
        }
    } catch (e) { console.warn("Load School Info Failed", e); }

    // 2. ข่าวสาร
    try {
        const { data: news } = await supabase.from('news').select('*').order('date', { ascending: false });
        if(news) {
            UI.renderHomeNews(news);
            UI.renderNews(news);
            UI.renderNewsTicker(news);
        }
    } catch (e) { console.warn("Load News Failed", e); }

    // 3. ผลงาน
    try {
        const { data: teachers } = await supabase.from('teacher_awards').select('*');
        if(teachers) UI.renderTeacherAchievements(teachers);

        const { data: students } = await supabase.from('student_awards').select('*');
        if(students) UI.renderStudentAchievements(students);

        const { data: school } = await supabase.from('school_awards').select('*');
        const { data: onet } = await supabase.from('onet').select('*');
        const { data: nt } = await supabase.from('nt').select('*');
        const { data: rt } = await supabase.from('rt').select('*');

        // Fetch summary image settings
        try {
            const [onetSet, ntSet, rtSet] = await Promise.all([
                supabase.from('onet_settings').select('*').limit(1).maybeSingle(),
                supabase.from('nt_settings').select('*').limit(1).maybeSingle(),
                supabase.from('rt_settings').select('*').limit(1).maybeSingle(),
            ]);
            UI.renderAcademicSettings('onet', onetSet.data || {});
            UI.renderAcademicSettings('nt',   ntSet.data   || {});
            UI.renderAcademicSettings('rt',   rtSet.data   || {});
        } catch(e) { console.warn('Load Academic Settings Failed', e); }
        
        let allAcademic = [];
        if(school) allAcademic = [...school];
        
        const formatAcad = (arr, prefix) => arr ? arr.map(i => ({
            ...i, 
            title: `${prefix} ${i.title}`,
            competition: `${prefix} ปี ${i.tag}`, 
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
        UI.renderHomeAchievements(teachers, students, school);

    } catch (e) { console.warn("Load Achievements Failed", e); }

    // 4. เอกสาร & นวัตกรรม
    try {
        const { data: docs } = await supabase.from('documents').select('*');
        if(docs) {
            UI.renderDocumentsList(docs, 'documents-official-container', 'official');
        }

        const { data: forms } = await supabase.from('forms').select('*');
        if(forms) {
            UI.renderDocumentsList(forms, 'documents-forms-container', 'form');
        }

        const { data: innov } = await supabase.from('innovations').select('*');
        if(innov) UI.renderInnovations(innov);

        UI.renderHomeMedia(docs, innov);
    } catch (e) { console.warn("Load Docs Failed", e); }

    // 5. บุคลากร & นักเรียน
    try {
        const { data: personnel } = await supabase.from('personnel').select('*');
        const { data: p_history } = await supabase.from('personnel_history').select('*');
        const { data: board } = await supabase.from('school_board').select('*');
        const { data: council } = await supabase.from('student_council').select('*');
        
        if(personnel) UI.renderPersonGrid(personnel, 'personnel-list-container');
        if(board) UI.renderPersonGrid(board, 'school-board-container');
        if(council) UI.renderPersonGrid(council, 'student-council-container');
        if(p_history) UI.renderHistoryTable('personnel-history-table-body', p_history);

        const { data: stats } = await supabase.from('student_data').select('*'); 
        if(stats) UI.renderStudentChart(stats);

    } catch (e) { console.warn("Load Personnel Failed", e); }

    // 6. E-Service
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

    // 7. ปฏิทินกิจกรรม
    try {
        const { data: calEvents } = await supabase.from('calendar_events').select('*').order('start_date', { ascending: true });
        if (calEvents) {
            UI.renderCalendar(calEvents);
        }
    } catch (e) { console.warn("Load Calendar Failed", e); }

    // 8. แกลลอรี่
    try {
        const { data: albums } = await supabase.from('gallery_albums').select('*').order('event_date', { ascending: false });
        if (albums) {
            UI.renderHomeGallery(albums);
            UI.renderGalleryPage(albums);
        }
    } catch (e) { console.warn("Load Gallery Failed", e); }
}
