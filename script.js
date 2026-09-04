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
    if (supabase) fetchAndRenderAll();
    else showConnectionError();
});

function showConnectionError() {
    const banner = document.getElementById('connection-error-banner');
    if (banner) banner.classList.remove('hidden');
}

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

window.navigateToPage = navigateToPage; // ให้ HTML ที่ render แบบไดนามิก (การ์ด/โมดัล) เรียกเปลี่ยนหน้าได้
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

// ✅ Site search — เมนู (static) + เนื้อหาจริง (ข่าว/เอกสาร/นวัตกรรม/บุคลากร/ผลงาน/กิจกรรม)
const RECENT_SEARCH_KEY = 'site_recent_searches';
let _menuIndex = null;
let _contentIndex = [];
let _mediaLibraryItems = [];
function pushMediaItems(type, items, mapper) {
    if (!items) return;
    items.forEach((raw, i) => {
        const mapped = mapper(raw);
        if (mapped && mapped.title) _mediaLibraryItems.push({ type, _uid: `${type}-${raw.id ?? i}`, sortKey: raw.id ?? 0, ...mapped });
    });
}

function buildMenuIndex() {
    const seen = new Map();
    document.querySelectorAll('#main-nav [data-page], #mobile-menu [data-page]').forEach(el => {
        const pageId = el.getAttribute('data-page');
        const label = el.textContent.replace(/\s+/g, ' ').trim();
        if (pageId && label && !seen.has(pageId)) seen.set(pageId, label);
    });
    return Array.from(seen, ([pageId, label]) => ({ category: 'เมนู', icon: 'fa-compass', label, sub: '', url: null, pageId }));
}

// เรียกจาก fetchAndRenderAll หลังโหลดข้อมูลแต่ละหมวด เพื่อสร้าง index สำหรับค้นหา
function indexContentItems(category, icon, items, mapper) {
    if (!items) return;
    items.forEach(raw => {
        const mapped = mapper(raw);
        if (mapped && mapped.label) _contentIndex.push({ category, icon, sub: '', url: null, pageId: null, ...mapped });
    });
}

function getRecentSearches() {
    try { return JSON.parse(localStorage.getItem(RECENT_SEARCH_KEY)) || []; } catch { return []; }
}
function saveRecentSearch(q) {
    if (!q || !q.trim()) return;
    try {
        const list = getRecentSearches().filter(x => x !== q);
        list.unshift(q);
        localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(list.slice(0, 5)));
    } catch {}
}

function _escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}
function _highlight(label, q) {
    const safe = _escapeHtml(label);
    if (!q) return safe;
    const idx = safe.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return safe;
    return safe.slice(0, idx) + `<mark class="bg-yellow-200 text-slate-900 rounded-sm">${safe.slice(idx, idx + q.length)}</mark>` + safe.slice(idx + q.length);
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

function _goToSearchResult(item) {
    saveRecentSearch(document.getElementById('site-search-input')?.value || '');
    if (item.url) window.open(item.url, '_blank');
    else if (item.pageId) navigateToPage(item.pageId);
}

function renderSearchResults(query) {
    if (!_menuIndex) _menuIndex = buildMenuIndex();
    const results = document.getElementById('site-search-results');
    if (!results) return;
    const q = query.trim().toLowerCase();

    if (!q) {
        const recent = getRecentSearches();
        if (recent.length === 0) {
            const items = _menuIndex.slice(0, 8);
            results.innerHTML = items.map(item => `
                <button type="button" class="search-result-item w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-600 flex items-center gap-2 transition-colors">
                    <i class="fa-solid ${item.icon} text-[11px] text-slate-300 w-4 text-center"></i> ${_escapeHtml(item.label)}
                </button>`).join('');
            _bindResultButtons(results, items);
        } else {
            results.innerHTML = `<p class="px-3 pt-1 pb-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">ค้นหาล่าสุด</p>` +
                recent.map(term => `
                <button type="button" data-recent="${_escapeHtml(term)}"
                    class="search-result-item w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-500 flex items-center gap-2 transition-colors">
                    <i class="fa-solid fa-clock-rotate-left text-[11px] text-slate-300 w-4 text-center"></i> ${_escapeHtml(term)}
                </button>`).join('');
            results.querySelectorAll('[data-recent]').forEach(btn => btn.addEventListener('click', () => {
                document.getElementById('site-search-input').value = btn.getAttribute('data-recent');
                renderSearchResults(btn.getAttribute('data-recent'));
            }));
        }
        return;
    }

    const all = [..._contentIndex, ..._menuIndex];
    const matches = all.filter(item =>
        item.label.toLowerCase().includes(q) || (item.sub && item.sub.toLowerCase().includes(q))
    );

    if (matches.length === 0) {
        results.innerHTML = `<div class="empty-state"><i class="fa-solid fa-magnifying-glass text-2xl opacity-40"></i> ไม่พบข้อมูลที่ตรงกับ "${_escapeHtml(query)}"</div>`;
        return;
    }

    // แยกผลลัพธ์ตามประเภท จำกัดหมวดละ 5 รายการ รวมไม่เกิน 20
    const grouped = new Map();
    for (const item of matches) {
        if (!grouped.has(item.category)) grouped.set(item.category, []);
        const arr = grouped.get(item.category);
        if (arr.length < 5) arr.push(item);
    }

    let shown = 0;
    let html = '';
    const shownItems = [];
    for (const [category, items] of grouped) {
        if (shown >= 20) break;
        html += `<p class="px-3 pt-3 pb-1 text-[10px] font-black text-slate-300 uppercase tracking-widest first:pt-1">${category}</p>`;
        items.forEach(item => {
            html += `<button type="button"
                class="search-result-item w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-600 flex items-center gap-2 transition-colors">
                <i class="fa-solid ${item.icon} text-[11px] text-slate-300 w-4 text-center shrink-0"></i>
                <span class="flex-1 min-w-0"><span class="block truncate">${_highlight(item.label, q)}</span>${item.sub ? `<span class="block text-[11px] text-slate-400 truncate">${_escapeHtml(item.sub)}</span>` : ''}</span></button>`;
            shownItems.push(item);
            shown++;
        });
    }
    results.innerHTML = html;
    _bindResultButtons(results, shownItems);
}

// ผูก click handler ให้ปุ่มผลลัพธ์แต่ละอัน โดยอิงตำแหน่ง (order) เดียวกับตอน render
function _bindResultButtons(container, items) {
    container.querySelectorAll('.search-result-item').forEach((btn, i) => {
        if (items[i]) btn.addEventListener('click', () => _goToSearchResult(items[i]));
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
    _contentIndex = [];
    _mediaLibraryItems = [];

    // 1. ข้อมูลโรงเรียน & ป๊อปอัพประกาศพิเศษ
    try {
        const { data: info, error } = await supabase.from('school_info').select('*').limit(1).single();
        if (error) throw error;
        if(info) {
            UI.renderSchoolInfo(info);
            UI.renderAnnouncement(info);
            UI.renderFacebookFeed(info);
        }
    } catch (e) { console.warn("Load School Info Failed", e); showConnectionError(); }

    // 2. ข่าวสาร
    try {
        const { data: news } = await supabase.from('news').select('*').order('date', { ascending: false });
        if(news) {
            UI.renderHomeNews(news);
            UI.renderNews(news);
            UI.renderNewsTicker(news);
            indexContentItems('ข่าว', 'fa-newspaper', news, n => ({ label: n.title, sub: n.date, url: n.link, pageId: 'news' }));
            pushMediaItems('news', news, n => ({ title: n.title, thumbnail: n.image, url: n.link, academic_year: n.academic_year, pageId: 'news' }));
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

        indexContentItems('ผลงานครู', 'fa-medal', teachers, t => ({ label: t.students || t.name || t.title || 'เกียรติบัตร', sub: t.title, url: t.image || t.fileUrl, pageId: 'teacher-achievements' }));
        indexContentItems('ผลงานนักเรียน', 'fa-trophy', students, s => ({ label: s.students || s.name || s.title || 'เกียรติบัตร', sub: s.title, url: s.image || s.fileUrl, pageId: 'student-achievements' }));
        indexContentItems('ผลงานสถานศึกษา', 'fa-award', allAcademic, a => ({ label: a.title || a.name || 'เกียรติบัตร', sub: a.competition, url: a.image || a.fileUrl, pageId: 'school-achievements' }));

    } catch (e) { console.warn("Load Achievements Failed", e); }

    // 4. เอกสาร & นวัตกรรม
    try {
        const { data: docs } = await supabase.from('documents').select('*');
        if(docs) {
            UI.renderDocumentsList(docs, 'documents-official-container', 'official');
            indexContentItems('เอกสารราชการ', 'fa-file-pdf', docs, d => ({ label: d.title, sub: d.category, url: d.fileUrl, pageId: 'documents-official' }));
            pushMediaItems('document', docs, d => ({ title: d.title, url: d.fileUrl, pageId: 'documents-official' }));
        }

        const { data: forms } = await supabase.from('forms').select('*');
        if(forms) {
            UI.renderDocumentsList(forms, 'documents-forms-container', 'form');
            indexContentItems('แบบฟอร์ม', 'fa-file-lines', forms, f => ({ label: f.title, sub: f.category, url: f.fileUrl, pageId: 'documents-forms' }));
            pushMediaItems('form', forms, f => ({ title: f.title, url: f.fileUrl, pageId: 'documents-forms' }));
        }

        const { data: innov } = await supabase.from('innovations').select('*');
        if(innov) {
            UI.renderInnovations(innov);
            indexContentItems('นวัตกรรม', 'fa-lightbulb', innov, i => ({ label: i.title, sub: i.creator, url: i.fileUrl, pageId: 'innovations' }));
            pushMediaItems('innovation', innov, i => ({ title: i.title, creator: i.creator, subject: i.subject, thumbnail: i.coverImageUrl, url: i.fileUrl, pageId: 'innovations' }));
        }

        UI.renderHomeMedia(docs, innov);
    } catch (e) { console.warn("Load Docs Failed", e); }

    // 5. บุคลากร & นักเรียน
    try {
        const { data: personnel } = await supabase.from('personnel').select('*');
        const { data: p_history } = await supabase.from('personnel_history').select('*');
        const { data: board } = await supabase.from('school_board').select('*');
        const { data: council } = await supabase.from('student_council').select('*');
        
        if(personnel) {
            UI.renderPersonGrid(personnel, 'personnel-list-container');
            indexContentItems('บุคลากร', 'fa-user-tie', personnel, p => ({ label: p.name, sub: p.role, pageId: 'personnel-list' }));
        }
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
            indexContentItems('กิจกรรม', 'fa-calendar-day', calEvents, e => ({ label: e.title, sub: e.start_date, pageId: 'calendar' }));
        }
    } catch (e) { console.warn("Load Calendar Failed", e); }

    // 8. แกลลอรี่
    try {
        const { data: albums } = await supabase.from('gallery_albums').select('*').order('event_date', { ascending: false });
        if (albums) {
            UI.renderHomeGallery(albums);
            UI.renderGalleryPage(albums);
            pushMediaItems('gallery', albums, a => ({ title: a.title, thumbnail: a.cover_url, url: a.album_url, academic_year: a.academic_year, pageId: 'gallery' }));
        }
    } catch (e) { console.warn("Load Gallery Failed", e); }

    // 9. คลังสื่อ (รวมจากทุกหมวดด้านบน)
    UI.setMediaLibraryData(_mediaLibraryItems);
}
