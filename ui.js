// js/ui.js - Lumina Bento Edition (Bug Fix & Full Pagination Version)

// --- Global Variables ---
let allTeacherData = [];
let allStudentData = [];
let allSchoolData = [];
let allNewsData = [];
let allOfficialDocs = [];
let allFormDocs = [];

// --- Config ---
const ACH_ITEMS_PER_PAGE = 6;
const NEWS_ITEMS_PER_PAGE = 5;
const DOCS_ITEMS_PER_PAGE = 10;

// --- State ---
let currentFolderFilter = null;
let currentDocFolder = { official: null, form: null };

// =============================================================================
// 1. SCHOOL INFO RENDERER (Lumina Style)
// =============================================================================

export function renderSchoolInfo(info) {
    if (!info) return;

    if (info.school_name) document.title = info.school_name;
    if (document.getElementById('header-school-name')) document.getElementById('header-school-name').innerText = info.school_name || 'กำลังโหลด...';
    if (document.getElementById('header-affiliation')) document.getElementById('header-affiliation').innerText = info.affiliation || '-';
    
    if (document.getElementById('header-logo')) {
        const logo = document.getElementById('header-logo');
        if (info.logo_url) {
            logo.src = info.logo_url;
            logo.classList.remove('hidden');
        } else {
            logo.classList.add('hidden');
        }
    }

    if (document.getElementById('hero-motto')) document.getElementById('hero-motto').innerText = info.motto || '-';
    if (document.getElementById('footer-school-name')) document.getElementById('footer-school-name').innerText = info.school_name || '';
    if (info.founding_date && document.getElementById('school-age-badge')) {
        const age = new Date().getFullYear() - new Date(info.founding_date).getFullYear();
        document.getElementById('school-age-badge').innerText = `${age}`;
    }

    const basicFields = {
        'info-name-th': info.school_name,
        'info-name-en': info.school_name_en,
        'info-school-code': info.school_code_10,
        'info-smis-code': info.smis_code_8,
        'info-obec-code': info.obec_code_6,
        'info-affiliation': info.affiliation,
        'info-address': info.address
    };
    for (const [id, value] of Object.entries(basicFields)) {
        const el = document.getElementById(id);
        if (el) el.innerText = value || '-';
    }
    
    if (document.getElementById('header-logo-basic')) {
        const logoBasic = document.getElementById('header-logo-basic');
        const logoPlaceholder = document.getElementById('logo-placeholder');
        if (info.logo_url) {
            logoBasic.src = info.logo_url;
            logoBasic.classList.remove('hidden');
            if(logoPlaceholder) logoPlaceholder.classList.add('hidden');
        } else {
            logoBasic.classList.add('hidden');
            if(logoPlaceholder) logoPlaceholder.classList.remove('hidden');
        }
    }

    const aboutFields = {
        'school-history-content': info.history,
        'info-vision': info.vision,
        'school-mission-content': info.mission,
        'info-philosophy': info.philosophy,
        'info-motto': info.motto,
        'school-identity-content': info.identity,
        'school-uniqueness-content': info.uniqueness
    };

    for (const [id, value] of Object.entries(aboutFields)) {
        const el = document.getElementById(id);
        if (el) el.innerText = value || '-';
    }

    if (document.getElementById('school-color-box')) {
        const c1 = info.color_code_1 || '#ddd';
        const c2 = info.color_code_2 || c1 || '#ddd';
        document.getElementById('school-color-box').style.background = `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`;
    }

    if (document.getElementById('student-uniform-img')) {
        const img = document.getElementById('student-uniform-img');
        const placeholder = document.getElementById('uniform-placeholder');
        if (info.uniform_url) {
            img.src = info.uniform_url;
            img.classList.remove('hidden');
            if(placeholder) placeholder.classList.add('hidden');
        } else {
            img.classList.add('hidden');
            if(placeholder) placeholder.classList.remove('hidden');
        }
    }

    if (document.getElementById('school-map-container')) {
        const mapContainer = document.getElementById('school-map-container');
        if (info.map_embed) {
            mapContainer.innerHTML = info.map_embed;
            const iframe = mapContainer.querySelector('iframe');
            if(iframe) {
                iframe.style.width = "100%";
                iframe.style.height = "100%";
                iframe.style.border = "0";
                iframe.style.borderRadius = "2rem";
            }
        }
    }
}

// =============================================================================
// 2. PERSONNEL & STUDENTS (Lumina Bento)
// =============================================================================

export function renderPersonGrid(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (!data || data.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center p-10 bg-white/50 rounded-[2rem] border border-dashed text-slate-400">ยังไม่มีข้อมูล</div>`;
        return;
    }
    const sorted = [...data].sort((a, b) => a.id - b.id);
    const leader = sorted[0];
    const others = sorted.slice(1);
    const createCard = (p, isLeader = false) => `
        <div class="relative group rounded-[2.5rem] p-8 ${isLeader ? 'bg-gradient-to-b from-white to-blue-50 border-blue-100 shadow-xl' : 'bg-white border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2'} border overflow-hidden transition-all duration-700 flex flex-col items-center text-center h-full">
            <div class="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-40 bg-blue-100 pointer-events-none"></div>
            <div class="w-36 h-36 rounded-full overflow-hidden border-[6px] ${isLeader ? 'border-blue-100' : 'border-white'} shadow-lg bg-white mb-6 group-hover:scale-105 transition duration-500">
                ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><i class="fa-solid fa-user text-5xl"></i></div>`}
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">${p.name}</h3>
            <div class="inline-block px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100 shadow-sm"><p class="text-xs text-slate-500 font-bold uppercase tracking-widest">${p.role}</p></div>
        </div>`;

    if (leader) container.innerHTML += `<div class="flex justify-center mb-16 animate-fade-in"><div class="w-full max-w-sm">${createCard(leader, true)}</div></div>`;
    if (others.length > 0) {
        let grid = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">`;
        others.forEach(p => grid += createCard(p));
        grid += `</div>`;
        container.innerHTML += grid;
    }
}

export function renderHistoryTable(tbodyId, data) {
    const container = document.getElementById(tbodyId); 
    if (!container) return;
    const isTable = container.tagName === 'TBODY';
    const target = isTable ? container.closest('table').parentElement : container;
    if (isTable) container.closest('table').style.display = 'none';
    target.className = "grid grid-cols-1 gap-4";
    target.innerHTML = '';
    [...data].sort((a, b) => b.id - a.id).forEach(item => {
        target.innerHTML += `
        <div class="group bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-500 flex items-center gap-6 overflow-hidden">
            <div class="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden shrink-0 group-hover:scale-110 transition">
                ${item.image ? `<img class="h-full w-full object-cover" src="${item.image}">` : `<i class="fa-solid fa-user text-2xl m-5 text-slate-200"></i>`}
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-slate-800 text-lg">${item.name}</h4>
                <p class="text-xs text-slate-500 font-bold uppercase tracking-wider">${item.role || '-'}</p>
            </div>
            <div class="px-5 py-2 bg-amber-50 text-amber-600 text-[11px] font-black rounded-full border border-amber-100 shadow-sm">${item.year || '-'}</div>
        </div>`;
    });
}

export function renderStudentChart(data) {
    const summary = document.getElementById('student-summary-container');
    const chartCanvas = document.getElementById('studentChart');
    if (!data || data.length === 0) return;
    let totalMale = 0, totalFemale = 0;
    data.forEach(d => { totalMale += parseInt(d.male || 0); totalFemale += parseInt(d.female || 0); });

    if (summary) {
        summary.innerHTML = `
        <div class="col-span-full grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div class="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2.5rem] p-8 shadow-xl text-white group hover:-translate-y-2 transition-all duration-700">
                <div class="flex items-center gap-6">
                    <div class="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl border border-white/10 group-hover:rotate-12 transition"><i class="fa-solid fa-users"></i></div>
                    <div><p class="text-[10px] font-bold opacity-70 uppercase tracking-widest">ทั้งหมด</p><h3 class="text-4xl font-black">${totalMale+totalFemale}</h3></div>
                </div>
            </div>
            <div class="bg-white rounded-[2.5rem] p-8 shadow-lg border border-sky-100 group hover:-translate-y-2 transition-all duration-700">
                <div class="flex items-center gap-6">
                    <div class="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center text-3xl text-sky-500 border border-sky-100 group-hover:rotate-12 transition"><i class="fa-solid fa-child"></i></div>
                    <div><p class="text-[10px] font-bold text-sky-400 uppercase tracking-widest">ชาย</p><h3 class="text-4xl font-black text-slate-800">${totalMale}</h3></div>
                </div>
            </div>
            <div class="bg-white rounded-[2.5rem] p-8 shadow-lg border border-pink-100 group hover:-translate-y-2 transition-all duration-700">
                <div class="flex items-center gap-6">
                    <div class="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-3xl text-pink-500 border border-pink-100 group-hover:rotate-12 transition"><i class="fa-solid fa-child-dress"></i></div>
                    <div><p class="text-[10px] font-bold text-pink-400 uppercase tracking-widest">หญิง</p><h3 class="text-4xl font-black text-slate-800">${totalFemale}</h3></div>
                </div>
            </div>
        </div>`;
    }

    if (chartCanvas && window.Chart) {
        chartCanvas.parentElement.className = "bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-100 overflow-hidden";
        if (window.myStudentChart) window.myStudentChart.destroy();
        window.myStudentChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: data.map(d => d.grade),
                datasets: [
                    { label: 'ชาย', data: data.map(d => d.male), backgroundColor: '#0ea5e9', borderRadius: 8, barPercentage: 0.6, categoryPercentage: 0.8 },
                    { label: 'หญิง', data: data.map(d => d.female), backgroundColor: '#ec4899', borderRadius: 8, barPercentage: 0.6, categoryPercentage: 0.8 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } }
        });
    }
}

// =============================================================================
// 3. NEWS & ACHIEVEMENT PAGINATION SYSTEM (✅ บั๊ก 1, 2, 3)
// =============================================================================

// ✅ แก้ไข: ข่าวประชาสัมพันธ์ พร้อมระบบแบ่งหน้า
export function renderNews(data, page = 1) {
    allNewsData = data;
    const container = document.getElementById('news-container');
    if (!container) return;
    
    container.innerHTML = '';
    if(!data || data.length === 0) {
        container.innerHTML = '<div class="text-center p-16 text-slate-400">ไม่พบข่าวสาร</div>';
        return;
    }

    const startIndex = (page - 1) * NEWS_ITEMS_PER_PAGE;
    const pageItems = data.slice(startIndex, startIndex + NEWS_ITEMS_PER_PAGE);

    pageItems.forEach(news => {
        container.innerHTML += `
        <div class="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-700 flex flex-col lg:flex-row gap-8 mb-8 group cursor-pointer" onclick="window.open('${news.link || '#'}', '_blank')">
            <div class="w-full lg:w-64 h-48 bg-slate-100 rounded-[1.8rem] overflow-hidden shrink-0 shadow-inner">
                ${news.image ? `<img src="${news.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[1.5s]">` : `<div class="w-full h-full flex items-center justify-center text-slate-200"><i class="fa-solid fa-image text-5xl"></i></div>`}
            </div>
            <div class="flex-1 flex flex-col justify-between py-2">
                <div>
                    <h4 class="font-bold text-2xl text-slate-800 group-hover:text-blue-600 transition line-clamp-2">${news.title}</h4>
                    <p class="text-sm text-slate-500 mt-4 line-clamp-2 font-light">อ่านรายละเอียดข่าวประกาศล่าสุดประจำวันที่ ${new Date(news.date).toLocaleDateString('th-TH')}</p>
                </div>
                <div class="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"><i class="fa-regular fa-clock text-blue-400 mr-2"></i> ${new Date(news.date).toLocaleDateString('th-TH')}</span>
                    <span class="text-blue-600 text-xs font-black group-hover:translate-x-3 transition duration-500">READ MORE <i class="fa-solid fa-chevron-right ml-2 text-[9px]"></i></span>
                </div>
            </div>
        </div>`;
    });

    renderPagination('news-pagination', data.length, NEWS_ITEMS_PER_PAGE, page, (p) => renderNews(allNewsData, p));
}

// ✅ แก้ไข: ระบบผลงาน พร้อม "รายละเอียดเกียรติบัตร" และ "ระบบแบ่งหน้า"
export function renderAchievementSystem(containerId, data, type, page = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (currentFolderFilter === null) {
        const groups = data.reduce((acc, item) => {
            const key = item.competition || 'รายการอื่นๆ';
            if (!acc[key]) acc[key] = { count: 0 };
            acc[key].count++;
            return acc;
        }, {});

        container.className = "grid grid-cols-2 md:grid-cols-4 gap-8";
        Object.keys(groups).forEach(name => {
            container.innerHTML += `
            <div onclick="window.selectFolder('${containerId}', '${type}', '${name}')" class="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-200 hover:-translate-y-2 transition-all duration-700 cursor-pointer text-center relative overflow-hidden">
                <div class="w-20 h-20 bg-blue-50/80 rounded-[1.8rem] flex items-center justify-center text-4xl text-blue-500 mx-auto mb-6 shadow-sm border border-blue-100 group-hover:scale-110 group-hover:rotate-6 transition duration-700"><i class="fa-solid fa-folder-open"></i></div>
                <h4 class="font-bold text-slate-700 text-base line-clamp-1">${name}</h4>
                <div class="mt-4 font-black text-[10px] text-blue-400 bg-blue-50/50 px-4 py-1.5 rounded-full inline-block uppercase tracking-widest">${groups[name].count} Items</div>
            </div>`;
        });
    } else {
        const filtered = data.filter(item => (item.competition || 'รายการอื่นๆ') === currentFolderFilter);
        const startIndex = (page - 1) * ACH_ITEMS_PER_PAGE;
        const pageItems = filtered.slice(startIndex, startIndex + ACH_ITEMS_PER_PAGE);

        container.className = "space-y-10 animate-fade-in";
        let html = `
            <div class="flex items-center justify-between bg-white/80 backdrop-blur-sm p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 class="font-bold text-xl text-slate-800 flex items-center gap-3"><i class="fa-solid fa-folder-open text-amber-500"></i> ${currentFolderFilter}</h3>
                <button onclick="window.clearFolderFilter('${containerId}', '${type}')" class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-6 py-2.5 rounded-full border border-blue-100 shadow-sm hover:shadow-md hover:text-indigo-600 transition-all"><i class="fa-solid fa-arrow-left mr-2"></i> ย้อนกลับ</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">`;

        pageItems.forEach(item => {
            html += `
            <div class="group bg-white rounded-[3rem] shadow-lg border border-slate-100 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-3 transition-all duration-[0.8s] cursor-pointer" onclick="window.open('${item.image || item.file_url || '#'}', '_blank')">
                <div class="aspect-square bg-slate-50 relative overflow-hidden">
                    ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[2s]">` : '<i class="fa-solid fa-award text-7xl absolute inset-0 m-auto text-slate-100"></i>'}
                    <div class="absolute bottom-5 left-5 right-5 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-[1.2rem] text-[10px] font-black text-blue-600 shadow-xl border border-white/50 uppercase tracking-widest text-center">รางวัล: ${item.title || 'ประกาศนียบัตร'}</div>
                </div>
                <div class="p-8 text-center space-y-4">
                    <h4 class="font-bold text-lg text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">${item.students || item.name || '-'}</h4>
                    <div class="pt-4 border-t border-slate-50 space-y-1">
                        <p class="text-[10px] font-black text-slate-400 tracking-[0.1em] uppercase">รายการ: ${item.program || '-'}</p>
                        <p class="text-[9px] font-bold text-slate-400">รางวัล: ${item.title || '-'}</p>
                    </div>
                </div>
            </div>`;
        });
        html += `</div><div id="${containerId}-pagination" class="mt-12"></div>`;
        container.innerHTML = html;

        renderPagination(`${containerId}-pagination`, filtered.length, ACH_ITEMS_PER_PAGE, page, (p) => renderAchievementSystem(containerId, data, type, p));
    }
}

// ✅ แก้ไข: ระบบแบ่งหน้า (Pagination) สไตล์ Lumina
function renderPagination(id, totalItems, perPage, currentPage, callback) {
    const container = document.getElementById(id);
    if (!container) return;
    const totalPages = Math.ceil(totalItems / perPage);
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let html = `<div class="flex justify-center items-center gap-3">`;
    for (let i = 1; i <= totalPages; i++) {
        const active = i === currentPage;
        html += `
        <button onclick="(${callback})(${i}); window.scrollTo({top: 0, behavior: 'smooth'})" 
            class="w-10 h-10 rounded-xl font-black text-xs transition-all duration-300 shadow-sm border 
            ${active ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-300 hover:text-blue-500'}">
            ${i}
        </button>`;
    }
    html += `</div>`;
    container.innerHTML = html;
}

// =============================================================================
// 4. INNOVATIONS & DOCUMENTS (Lumina Bento)
// =============================================================================

export function renderInnovations(data) { 
    const c = document.getElementById('innovations-container'); 
    if(!c) return;
    c.innerHTML=''; 
    if(!data || data.length === 0) {
        c.innerHTML = '<div class="col-span-full text-center text-slate-400 py-20 font-medium">ยังไม่มีนวัตกรรมใหม่</div>';
        return;
    }
    c.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10";
    data.forEach(i => { 
        c.innerHTML += `
        <div class="group bg-white rounded-[3rem] shadow-lg border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-3 transition-all duration-700 cursor-pointer" onclick="window.open('${i.fileUrl}','_blank')">
            <div class="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                ${i.coverImageUrl ? `<img src="${i.coverImageUrl}" class="w-full h-full object-cover group-hover:scale-110 transition duration-[2s]">` : '<i class="fa-solid fa-lightbulb text-6xl absolute inset-0 m-auto text-slate-200"></i>'}
                <div class="absolute top-5 right-5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-2xl text-[10px] font-black text-blue-600 shadow-xl border border-white/50 uppercase tracking-widest">${i.subject || 'CREATIVE'}</div>
            </div>
            <div class="p-8">
                <h4 class="font-bold text-xl text-slate-800 line-clamp-2 group-hover:text-blue-600 transition h-14">${i.title}</h4>
                <div class="flex items-center gap-4 pt-6 border-t border-slate-50">
                    <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100/50 group-hover:rotate-12 transition-transform duration-500"><i class="fa-solid fa-user-pen text-sm"></i></div>
                    <div class="text-[11px]"><p class="font-black text-slate-700 uppercase tracking-wider">${i.creator}</p><p class="text-slate-400 font-bold mt-0.5">${i.class || '-'}</p></div>
                </div>
            </div>
        </div>`; 
    }); 
}

export function renderDocumentSystem(data, containerId, type = 'official') {
    const container = document.getElementById(containerId);
    if (!container) return;
    if(type === 'official') allOfficialDocs = data; else allFormDocs = data;
    const current = currentDocFolder[type];

    if (current === null) {
        const groups = data.reduce((acc, item) => {
            const key = item.category || 'ทั่วไป';
            if (!acc[key]) acc[key] = 0; acc[key]++;
            return acc;
        }, {});
        container.className = "grid grid-cols-2 md:grid-cols-4 gap-8";
        container.innerHTML = Object.entries(groups).map(([name, count]) => `
            <div onclick="window.selectDocFolder('${containerId}', '${type}', '${name}')" class="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-amber-200 hover:-translate-y-2 transition-all duration-700 cursor-pointer text-center relative overflow-hidden">
                <div class="w-20 h-20 bg-amber-50/80 rounded-[1.8rem] flex items-center justify-center text-4xl text-amber-500 mx-auto mb-6 shadow-sm border border-amber-100 group-hover:scale-110 group-hover:rotate-6 transition duration-700"><i class="fa-solid fa-folder-closed"></i></div>
                <h4 class="font-bold text-slate-700 text-base line-clamp-1">${name}</h4>
                <div class="mt-4"><span class="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] bg-amber-50/50 px-4 py-1.5 rounded-full border border-amber-50">${count} Files</span></div>
            </div>`).join('');
    } else {
        const filtered = data.filter(item => (item.category || 'ทั่วไป') === current);
        container.className = "space-y-4 animate-fade-in";
        container.innerHTML = `
            <div class="flex items-center justify-between bg-slate-100/50 backdrop-blur p-5 rounded-[2rem] border border-white/50 mb-10">
                <h3 class="font-bold text-xl text-slate-700 flex items-center gap-3"><i class="fa-solid fa-folder-open text-amber-500"></i> ${current}</h3>
                <button onclick="window.clearDocFolder('${containerId}', '${type}')" class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 bg-white/80 px-5 py-2.5 rounded-full border border-white shadow-sm hover:shadow-md">Back to Files</button>
            </div>
            <div class="grid grid-cols-1 gap-4">
                ${filtered.map(doc => `
                <div class="group bg-white/80 backdrop-blur-sm p-5 rounded-[1.8rem] border border-slate-100 flex items-center justify-between hover:shadow-2xl hover:border-blue-100 transition-all duration-700 cursor-pointer shadow-sm" onclick="window.open('${doc.fileUrl}', '_blank')">
                    <div class="flex items-center gap-6">
                        <div class="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all shadow-inner"><i class="fa-solid fa-file-lines"></i></div>
                        <div><h4 class="font-bold text-base text-slate-700 group-hover:text-blue-600 transition-colors">${doc.title}</h4><p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">${new Date(doc.uploadDate).toLocaleDateString('th-TH')}</p></div>
                    </div>
                    <div class="p-3 rounded-full bg-slate-50 text-slate-200 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm"><i class="fa-solid fa-download text-sm"></i></div>
                </div>`).join('')}
            </div>`;
    }
}

// =============================================================================
// 5. EXPORTS & SEARCH (✅ บั๊ก 1: ระบบค้นหา)
// =============================================================================

export function renderSchoolAchievements(data) { 
    if (!data) return;
    allSchoolData = [...data].sort((a, b) => b.id - a.id);
    const onet = allSchoolData.filter(i => (i.title+i.competition).includes('O-NET'));
    const nt = allSchoolData.filter(i => (i.title+i.competition).includes('NT'));
    const rt = allSchoolData.filter(i => (i.title+i.competition).includes('RT'));
    const general = allSchoolData.filter(i => !onet.includes(i) && !nt.includes(i) && !rt.includes(i));
    renderAchievementSystem('school-achievements-container', general, 'school');
}
export function renderTeacherAchievements(data) { allTeacherData = data; renderAchievementSystem('teacher-achievements-container', data, 'teacher'); }
export function renderStudentAchievements(data) { allStudentData = data; renderAchievementSystem('student-achievements-container', data, 'student'); }

export function renderHomeNews(newsList) { 
    const c = document.getElementById('home-news-container'); if(!c) return;
    c.innerHTML = ''; if(!newsList || newsList.length === 0) return;
    [...newsList].sort((a, b) => b.id - a.id).slice(0,4).forEach(n => {
        c.innerHTML += `
        <div class="p-4 border-b border-slate-50 flex gap-4 hover:bg-white/80 cursor-pointer transition rounded-2xl group" onclick="window.open('${n.link || '#'}', '_blank')">
            <div class="w-20 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">${n.image ? `<img src="${n.image}" class="w-full h-full object-cover">` : ''}</div>
            <div class="flex-1 space-y-1 py-0.5">
                <h4 class="text-sm font-bold text-slate-700 line-clamp-1 group-hover:text-blue-600 transition-colors">${n.title}</h4>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest"><span class="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block mr-1"></span> ${new Date(n.date).toLocaleDateString('th-TH')}</p>
            </div>
        </div>`; 
    }); 
}

// Window Bridge Logic (✅ สำหรับ onclick ใน HTML)
window.selectFolder = (cid, type, name) => { currentFolderFilter = name; const data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData); renderAchievementSystem(cid, data, type); };
window.clearFolderFilter = (cid, type) => { currentFolderFilter = null; const data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData); renderAchievementSystem(cid, data, type); };
window.selectDocFolder = (cid, type, catName) => { currentDocFolder[type] = catName; const data = type === 'official' ? allOfficialDocs : allFormDocs; renderDocumentSystem(data, cid, type); };
window.clearDocFolder = (cid, type) => { currentDocFolder[type] = null; const data = type === 'official' ? allOfficialDocs : allFormDocs; renderDocumentSystem(data, cid, type); };

// ✅ ระบบค้นหาผลงาน (Search)
window.filterAchievements = (inputId, type, containerId) => {
    const val = document.getElementById(inputId).value.toLowerCase();
    const sourceData = type==='teacher' ? allTeacherData : (type==='student' ? allStudentData : allSchoolData);
    const filtered = sourceData.filter(i => (i.title+i.students+i.name+i.competition).toLowerCase().includes(val));
    currentFolderFilter = val ? 'ผลการค้นหา' : null;
    renderAchievementSystem(containerId, filtered, type);
};

// ✅ ระบบค้นหาข่าว (Search)
window.filterNews = (inputId, containerId) => {
    const val = document.getElementById(inputId).value.toLowerCase();
    const filtered = allNewsData.filter(i => i.title.toLowerCase().includes(val));
    renderNews(filtered);
};
