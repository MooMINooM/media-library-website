// =============================================================================
// 1. CONFIG & SETUP (ตั้งค่าระบบ)
// =============================================================================

// ⚠️⚠️⚠️ ใส่ URL และ KEY ของ Supabase ตรงนี้ ⚠️⚠️⚠️
const PROJECT_URL = 'https://dazypxnsfwdwrqluicbc.supabase.co'; 
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhenlweG5zZndkd3JxbHVpY2JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNDkzMDIsImV4cCI6MjA4MjcyNTMwMn0.hAxjy_poDer5ywgRAZwzTkXF-OAcpduLxESW3v5adxo';

let supabase;

// ลองเชื่อมต่อ Database
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(PROJECT_URL, ANON_KEY);
        console.log("Supabase Connected!");
    } else {
        console.error("Supabase Library not loaded. Check script tags in HTML.");
    }
} catch (e) {
    console.error("Supabase Init Error:", e);
}

// Global Variables
let allTeacherData = [];
let allStudentData = [];
let allSchoolData = [];
let allNewsData = [];
let allOfficialDocs = [];
let allFormDocs = [];

// Configs
const ACH_ITEMS_PER_PAGE = 6;
const NEWS_ITEMS_PER_PAGE = 5;
const DOCS_ITEMS_PER_PAGE = 10;

// State
let currentFolderFilter = null;
let currentDocFolder = null;

// เริ่มทำงานเมื่อเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    if(supabase) fetchAndRenderAll();
});

// =============================================================================
// 2. HELPER FUNCTIONS (ฟังก์ชันช่วยทำงาน)
// =============================================================================

function getSubjectBadge(subject) {
    if (!subject) return '';
    const cleanSubject = subject.trim();
    const colorMap = {
        'คณิตศาสตร์': 'bg-red-50 text-red-600 border-red-100', 'คณิต': 'bg-red-50 text-red-600 border-red-100',
        'วิทยาศาสตร์': 'bg-yellow-50 text-yellow-700 border-yellow-200', 'วิทย์': 'bg-yellow-50 text-yellow-700 border-yellow-200',
        'ภาษาไทย': 'bg-pink-50 text-pink-600 border-pink-100',
        'ภาษาอังกฤษ': 'bg-sky-50 text-sky-600 border-sky-100', 'อังกฤษ': 'bg-sky-50 text-sky-600 border-sky-100',
        'สังคมศึกษา': 'bg-teal-50 text-teal-600 border-teal-100', 'สังคม': 'bg-teal-50 text-teal-600 border-teal-100',
        'การงานอาชีพ': 'bg-orange-50 text-orange-600 border-orange-100',
        'สุขะ - พละ': 'bg-green-50 text-green-600 border-green-100',
        'ศิลปะ': 'bg-indigo-50 text-indigo-600 border-indigo-100', 'ดนตรี': 'bg-indigo-50 text-indigo-600 border-indigo-100',
        'กิจกรรมพัฒนาผู้เรียน': 'bg-purple-50 text-purple-600 border-purple-100',
        'ปฐมวัย': 'bg-rose-50 text-rose-600 border-rose-100',
        'อื่นๆ': 'bg-gray-50 text-gray-600 border-gray-200'
    };
    const styleClass = colorMap[cleanSubject] || colorMap['อื่นๆ'];
    return `<span class="${styleClass} text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 whitespace-nowrap"><i class="fa-solid fa-tag text-[9px]"></i> ${cleanSubject}</span>`;
}

// =============================================================================
// 3. UI RENDERING SYSTEMS (ส่วนแสดงผล)
// =============================================================================

// --- 3.1 ระบบผลงาน (Achievements) ---
function renderAchievementSystem(containerId, data, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.className = "w-full"; 
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200"><i class="fa-solid fa-folder-open text-4xl mb-4 opacity-50"></i><p>ไม่พบข้อมูลผลงาน</p></div>';
        return;
    }

    if (currentFolderFilter === null) {
        renderFolders(containerId, data, type);
    } else {
        const filteredData = data.filter(item => (item.competition || 'รายการอื่นๆ') === currentFolderFilter);
        const backBtnContainer = document.createElement('div');
        backBtnContainer.className = "w-full mb-6 animate-fade-in";
        backBtnContainer.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div><h3 class="text-xl font-bold text-gray-800 flex items-center gap-2"><i class="fa-solid fa-folder-open text-yellow-500"></i> ${currentFolderFilter}</h3><p class="text-xs text-gray-500 mt-1 pl-7">พบข้อมูล ${filteredData.length} รายการ</p></div>
                <button onclick="clearFolderFilter('${containerId}', '${type}')" class="flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition font-bold text-sm bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm w-full md:w-auto"><i class="fa-solid fa-arrow-left"></i> ย้อนกลับ</button>
            </div>`;
        container.appendChild(backBtnContainer);
        renderPagedAchievements(container, filteredData, type, 1);
    }
}

function renderFolders(containerId, data, type) {
    const container = document.getElementById(containerId);
    const groups = data.reduce((acc, item) => {
        const key = item.competition || 'รายการอื่นๆ';
        if (!acc[key]) { acc[key] = { count: 0, items: [], latestImage: null, dates: [] }; }
        acc[key].count++; acc[key].items.push(item);
        if (!acc[key].latestImage && item.image) acc[key].latestImage = item.image;
        if (item.date) acc[key].dates.push(new Date(item.date));
        return acc;
    }, {});

    const themeColor = type === 'teacher' ? 'blue' : (type === 'school' ? 'orange' : 'pink');
    const gridDiv = document.createElement('div');
    gridDiv.className = "w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

    Object.keys(groups).forEach(competitionName => {
        const group = groups[competitionName];
        let dateLabel = 'ไม่ระบุวันที่';
        if(group.dates.length > 0) {
            const maxDate = new Date(Math.max.apply(null, group.dates));
            dateLabel = maxDate.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' });
        }

        const folderDiv = document.createElement('div');
        folderDiv.className = `bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-${themeColor}-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full animate-fade-in group relative overflow-hidden`;
        folderDiv.onclick = () => selectFolder(containerId, type, competitionName);
        folderDiv.innerHTML = `
            <div class="absolute top-0 right-0 w-24 h-24 bg-${themeColor}-50 rounded-bl-full -mr-4 -mt-4 transition group-hover:scale-110"></div>
            <div class="relative z-10 flex items-start gap-4">
                <div class="w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-105 transition duration-300 overflow-hidden relative">
                    ${group.latestImage ? `<img src="${group.latestImage}" class="w-full h-full object-cover object-top">` : `<i class="fa-solid fa-folder-closed text-${themeColor}-200"></i>`}
                </div>
                <div class="flex-1 min-w-0 pt-1">
                    <h4 class="font-bold text-gray-800 text-lg leading-tight mb-2 line-clamp-2 group-hover:text-${themeColor}-600 transition">${competitionName}</h4>
                    <div class="flex items-center gap-3 text-xs text-gray-500"><span class="bg-${themeColor}-50 text-${themeColor}-600 px-2 py-0.5 rounded-full font-bold border border-${themeColor}-100">${group.count} รายการ</span><span><i class="fa-regular fa-calendar mr-1"></i>${dateLabel}</span></div>
                </div>
            </div>
            <div class="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 group-hover:text-${themeColor}-500 transition"><span>คลิกเพื่อเปิดดู</span><i class="fa-solid fa-arrow-right-long transform group-hover:translate-x-1 transition"></i></div>`;
        gridDiv.appendChild(folderDiv);
    });
    container.appendChild(gridDiv);
}

function renderPagedAchievements(container, pageItemsFullList, type, page = 1) {
    let gridWrapper = container.querySelector('.achievements-grid-wrapper');
    if (!gridWrapper) {
        gridWrapper = document.createElement('div');
        gridWrapper.className = "achievements-grid-wrapper w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
        container.appendChild(gridWrapper);
    } else { gridWrapper.innerHTML = ''; }

    const oldPag = container.querySelector('.pagination-controls');
    if(oldPag) oldPag.remove();

    const totalPages = Math.ceil(pageItemsFullList.length / ACH_ITEMS_PER_PAGE);
    if (page < 1) page = 1; if (page > totalPages) page = totalPages;
    const pageItems = pageItemsFullList.slice((page - 1) * ACH_ITEMS_PER_PAGE, page * ACH_ITEMS_PER_PAGE);

    pageItems.forEach(item => {
        const dateStr = item.date ? new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : '-';
        const name = type === 'teacher' ? item.name : (type === 'student' ? item.students : 'โรงเรียน');
        const themeColor = type === 'teacher' ? 'blue' : (type === 'school' ? 'orange' : 'pink');
        const iconClass = type === 'teacher' ? 'fa-chalkboard-user' : (type === 'student' ? 'fa-user-graduate' : 'fa-school');
        const clickAction = item.fileUrl ? `window.open('${item.fileUrl}', '_blank')` : `window.open('${item.image || '#'}', '_blank')`;
        
        const div = document.createElement('div');
        div.className = `achievement-card group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full animate-fade-in w-full`;
        div.innerHTML = `
            <div class="h-60 bg-gray-50 relative overflow-hidden cursor-pointer border-b border-gray-100" onclick="${clickAction}">
                 ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover object-top transition duration-700 group-hover:scale-105">` : `<div class="w-full h-full flex flex-col items-center justify-center text-gray-300"><i class="fa-solid fa-file-contract text-5xl mb-2 opacity-50"></i><span class="text-xs">เอกสาร</span></div>`}
                 <div class="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/5"></div>
                 <div class="absolute top-3 right-3">${item.level ? `<span class="bg-white/95 backdrop-blur text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm border border-gray-200">${item.level}</span>` : ''}</div>
            </div>
            <div class="p-5 flex-grow flex flex-col justify-between relative">
                <div>
                    <div class="flex flex-wrap gap-2 mb-3">${item.competition ? `<span class="bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1"><i class="fa-solid fa-trophy text-yellow-500"></i> ${item.competition}</span>` : ''}${getSubjectBadge(item.subject)}</div>
                    <h4 class="font-bold text-gray-800 text-lg leading-snug mb-1 group-hover:text-${themeColor}-600 transition-colors cursor-pointer" onclick="${clickAction}" title="${item.title}">${item.title || '-'}</h4>
                    <p class="text-xs text-gray-500 mb-4 flex items-center gap-1"><i class="fa-solid fa-tag text-gray-300"></i> ${item.program || '-'}</p>
                </div>
                <div class="mt-auto pt-3 border-t border-gray-50">
                    <div class="flex items-center gap-2 mb-2"><div class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs flex-shrink-0"><i class="fa-solid ${iconClass}"></i></div><span class="text-sm font-bold text-gray-800 truncate flex-1">${name}</span></div>
                    <div class="flex items-center justify-between text-[10px] text-gray-400">
                        <div class="flex items-center gap-1 truncate max-w-[50%]" title="${item.organization}"><i class="fa-solid fa-building"></i> ${item.organization || '-'}</div>
                        <div class="flex items-center gap-3 flex-shrink-0"><span><i class="fa-regular fa-calendar"></i> ${dateStr}</span><a href="javascript:void(0)" onclick="${clickAction}" class="text-${themeColor}-600 hover:text-${themeColor}-700 hover:underline font-bold flex items-center gap-1 transition"><i class="fa-solid ${item.fileUrl?'fa-file-pdf':'fa-eye'}"></i> ดู</a></div>
                    </div>
                </div>
            </div>`;
        gridWrapper.appendChild(div);
    });

    if (totalPages > 1) {
        const nav = document.createElement('div');
        nav.className = "pagination-controls w-full flex justify-center items-center gap-1.5 mt-6 pt-4 border-t border-gray-100";
        const createBtn = (lbl, pg, active) => {
            const btn = document.createElement('button'); btn.innerHTML = lbl;
            btn.className = `w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition ${active ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`;
            if (!active) btn.onclick = () => renderPagedAchievements(container, pageItemsFullList, type, pg);
            return btn;
        };
        for (let i = 1; i <= totalPages; i++) nav.appendChild(createBtn(i, i, i === page));
        container.appendChild(nav);
    }
}

// --- 3.2 ระบบข่าว & เอกสาร (Simplified) ---
function renderNewsSystem(data) {
    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = '';
    
    // Sort & Slice for simplified view
    const items = [...data].sort((a,b) => b.id - a.id);
    if(items.length === 0) { container.innerHTML = '<div class="text-center p-10 text-gray-400">ไม่พบน่าวสาร</div>'; return; }

    items.forEach(news => {
        const div = document.createElement('div');
        div.className = "bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex gap-4 hover:shadow-md transition mb-4";
        div.innerHTML = `
            <div class="w-32 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">${news.image ? `<img src="${news.image}" class="w-full h-full object-cover">` : ''}</div>
            <div class="flex-1"><h4 class="font-bold text-lg text-gray-800">${news.title}</h4><p class="text-sm text-gray-500 mt-1">${new Date(news.date).toLocaleDateString('th-TH')}</p>
            ${news.link ? `<a href="${news.link}" target="_blank" class="text-blue-600 text-sm font-bold mt-2 inline-block">อ่านต่อ -></a>` : ''}</div>`;
        container.appendChild(div);
    });
}

function renderDocumentSystem(containerId, data, type) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';
    
    // Filter official vs form (assuming handled by caller or simple filter)
    // Here we assume 'data' is already filtered or we render all
    data.forEach(doc => {
        const div = document.createElement('div');
        div.className = "flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50";
        div.innerHTML = `<div class="flex items-center gap-3"><i class="fa-solid fa-file-pdf text-red-500 text-xl"></i><div><div class="font-bold text-gray-700 text-sm">${doc.title}</div><div class="text-xs text-gray-400">${doc.category || '-'}</div></div></div><a href="${doc.fileUrl}" target="_blank" class="text-blue-600"><i class="fa-solid fa-download"></i></a>`;
        container.appendChild(div);
    });
}

// --- 3.3 Helper Renders ---
function renderHomeNews(newsList) {
    const container = document.getElementById('home-news-container');
    if (!container) return; 
    container.innerHTML = '';
    [...newsList].sort((a, b) => b.id - a.id).slice(0, 4).forEach(news => {
        const div = document.createElement('div');
        div.className = `border-b border-gray-100 pb-3 mb-2 cursor-pointer hover:bg-gray-50 p-2 flex gap-3`;
        div.onclick = () => { if(news.link) window.open(news.link, '_blank'); };
        div.innerHTML = `<div class="flex-shrink-0 w-16 h-12 bg-gray-100 rounded-md overflow-hidden">${news.image ? `<img src="${news.image}" class="w-full h-full object-cover">` : ''}</div><div class="flex-1"><h4 class="text-sm font-bold text-gray-700 line-clamp-1">${news.title}</h4><p class="text-xs text-gray-400 mt-1">${new Date(news.date).toLocaleDateString('th-TH')}</p></div>`;
        container.appendChild(div);
    });
}

// =============================================================================
// 4. DATA FETCHING & LOGIC (Controller)
// =============================================================================

async function fetchAndRenderAll() {
    console.log("Fetching Data...");

    // 1. School Info
    try { const { data } = await supabase.from('school_info').select('*'); if(data && data[0]) renderSchoolInfo(data[0]); } catch(e) {}

    // 2. News
    try { 
        const { data } = await supabase.from('news').select('*'); 
        if(data) { allNewsData = data; renderHomeNews(data); renderNewsSystem(data); }
    } catch(e) {}

    // 3. Achievements (รวม O-NET/NT/RT)
    try {
        const { data: t } = await supabase.from('teacher_achievements').select('*'); if(t) { allTeacherData = t; renderAchievementSystem('teacher-achievements-container', t, 'teacher'); }
        const { data: s } = await supabase.from('student_achievements').select('*'); if(s) { allStudentData = s; renderAchievementSystem('student-achievements-container', s, 'student'); }

        const { data: sc } = await supabase.from('school_achievements').select('*');
        const { data: onet } = await supabase.from('onet').select('*');
        const { data: nt } = await supabase.from('nt').select('*');
        const { data: rt } = await supabase.from('rt').select('*');

        let allAcad = [];
        if(sc) allAcad = [...sc];
        
        const mapAcad = (arr, tag) => arr ? arr.map(i => ({ ...i, title: `${tag}: ${i.title}`, competition: `ปีการศึกษา ${i.tag}`, fileUrl: i.file_url, image: null })) : [];
        allAcad = [...allAcad, ...mapAcad(onet, 'O-NET'), ...mapAcad(nt, 'NT'), ...mapAcad(rt, 'RT')];
        
        allSchoolData = allAcad;
        
        // Render แยกตาม Container
        const general = allAcad.filter(i => !i.title.includes('O-NET') && !i.title.includes('NT') && !i.title.includes('RT'));
        renderAchievementSystem('school-achievements-container', general, 'school');
        
        if(document.getElementById('onet-container')) renderAchievementSystem('onet-container', mapAcad(onet, 'O-NET'), 'school');
        if(document.getElementById('nt-container')) renderAchievementSystem('nt-container', mapAcad(nt, 'NT'), 'school');
        if(document.getElementById('rt-container')) renderAchievementSystem('rt-container', mapAcad(rt, 'RT'), 'school');

    } catch(e) { console.error(e); }

    // 4. Docs & E-Services
    try {
        const { data: docs } = await supabase.from('documents').select('*');
        if(docs) { 
            allOfficialDocs = docs.filter(d => d.category !== 'แบบฟอร์ม'); // Example filter logic
            allFormDocs = docs.filter(d => d.category === 'แบบฟอร์ม'); // Example
            renderDocumentSystem('documents-official-container', allOfficialDocs, 'official');
            renderDocumentSystem('documents-forms-container', allFormDocs, 'form');
        }

        const { data: es } = await supabase.from('eservices').select('*');
        const esContainer = document.getElementById('eservice-dropdown-container');
        if(es && esContainer) {
            esContainer.innerHTML = '';
            es.forEach(item => {
                const a = document.createElement('a'); a.href = item.url; a.target = "_blank";
                a.className = "block px-4 py-2 hover:bg-green-50 text-green-700 font-bold border-b border-gray-100";
                a.innerText = item.title;
                esContainer.appendChild(a);
            });
        }
    } catch(e) {}
}

function renderSchoolInfo(info) {
    if(document.getElementById('hero-motto')) document.getElementById('hero-motto').innerText = info.motto || '';
    if(document.getElementById('footer-school-name')) document.getElementById('footer-school-name').innerText = info.school_name || '';
    // Add logic for VTR/History here if needed as per original requirement
}

// =============================================================================
// 5. NAVIGATION & UTILS
// =============================================================================

function setupNavigation() {
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const id = link.getAttribute('data-page');
            document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
            const target = document.getElementById(`page-${id}`);
            if(target) {
                target.classList.remove('hidden');
                target.classList.add('animate-fade-in');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            if(document.getElementById('mobile-menu')) document.getElementById('mobile-menu').classList.add('hidden');
        });
    });
}

// Global functions for onClick in HTML
window.selectFolder = (cid, type, name) => { 
    currentFolderFilter = name; 
    let data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData);
    // Specific filter for O-NET/NT/RT logic can be added here if needed, keeping it simple for now
    if(cid.includes('onet')) data = data.filter(d => d.title.includes('O-NET')); // Simple filter
    else if(cid.includes('nt')) data = data.filter(d => d.title.includes('NT'));
    else if(cid.includes('rt')) data = data.filter(d => d.title.includes('RT'));
    
    renderAchievementSystem(cid, data, type); 
};

window.clearFolderFilter = (cid, type) => { 
    currentFolderFilter = null; 
    // Re-trigger render with correct subset
    let data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData);
    if(cid.includes('onet')) data = data.filter(d => d.title.includes('O-NET'));
    else if(cid.includes('nt')) data = data.filter(d => d.title.includes('NT'));
    else if(cid.includes('rt')) data = data.filter(d => d.title.includes('RT'));
    renderAchievementSystem(cid, data, type); 
};

// Filter Search
window.filterNews = (id) => { /* logic from prev */ };
window.filterDocuments = (id, cid) => { /* logic from prev */ };
window.filterAchievements = (id, selId, cid) => { /* logic from prev */ };
