// js/ui.js - Lumina Bento Edition (Full Version)

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
// 1. HELPER FUNCTIONS
// =============================================================================

function getSubjectBadge(subject) {
    if (!subject) return '';
    const cleanSubject = subject.trim();
    return `<span class="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 whitespace-nowrap"><i class="fa-solid fa-tag text-[9px]"></i> ${cleanSubject}</span>`;
}

// =============================================================================
// 2. SCHOOL INFO RENDERER (Lumina Logic)
// =============================================================================

export function renderSchoolInfo(info) {
    if (!info) return;

    // 1. Title & Header
    if (info.school_name) document.title = info.school_name;
    if (document.getElementById('header-school-name')) document.getElementById('header-school-name').innerText = info.school_name || 'กำลังโหลด...';
    if (document.getElementById('header-affiliation')) document.getElementById('header-affiliation').innerText = info.affiliation || '-';
    
    // Header Logo (Main Navbar)
    if (document.getElementById('header-logo')) {
        const logo = document.getElementById('header-logo');
        if (info.logo_url) {
            logo.src = info.logo_url;
            logo.classList.remove('hidden');
        } else {
            logo.classList.add('hidden');
        }
    }

    // 2. Home & Footer
    if (document.getElementById('hero-motto')) document.getElementById('hero-motto').innerText = info.motto || '-';
    if (document.getElementById('footer-school-name')) document.getElementById('footer-school-name').innerText = info.school_name || '';
    if (info.founding_date && document.getElementById('school-age-badge')) {
        const age = new Date().getFullYear() - new Date(info.founding_date).getFullYear();
        document.getElementById('school-age-badge').innerText = `${age}`;
    }

    // 3. Page: School Basic Info (Hero Card & Codes)
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
    
    // Logo Logic for Hero Card (Handle Placeholder)
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

    // 4. Page: School About
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

    // Color & Uniform
    if (document.getElementById('school-color-box')) {
        const c1 = info.color_code_1 || '#ddd';
        const c2 = info.color_code_2 || c1 || '#ddd';
        document.getElementById('school-color-box').style.background = `linear-gradient(to right, ${c1} 50%, ${c2} 50%)`;
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

    // Media
    if (info.song_url && document.getElementById('school-song')) {
        document.getElementById('school-song').src = info.song_url;
        document.getElementById('music-player-controls').classList.remove('hidden');
    }

    if (info.vtr_url && document.getElementById('vtr-iframe')) {
        let vid = '';
        try {
            if (info.vtr_url.includes('v=')) vid = info.vtr_url.split('v=')[1].split('&')[0];
            else if (info.vtr_url.includes('youtu.be/')) vid = info.vtr_url.split('youtu.be/')[1];
        } catch (e) {}

        if (vid) {
            document.getElementById('vtr-iframe').src = `https://www.youtube.com/embed/${vid}`;
            if(document.getElementById('vtr-placeholder')) document.getElementById('vtr-placeholder').classList.add('hidden');
        }
    }

    // Google Maps Embed Logic
    if (document.getElementById('school-map-container')) {
        const mapContainer = document.getElementById('school-map-container');
        if (info.map_embed && info.map_embed.trim() !== '') {
            mapContainer.innerHTML = info.map_embed;
            const iframe = mapContainer.querySelector('iframe');
            if(iframe) {
                iframe.style.width = "100%";
                iframe.style.height = "100%";
                iframe.style.border = "0";
                iframe.style.filter = "grayscale(20%) contrast(1.1)";
            }
        }
    }
}

// =============================================================================
// 3. PERSONNEL & STUDENTS (LUMINA BENTO STYLE)
// =============================================================================

// 3.1 Person Grid (Teachers, Board, Student Council)
export function renderPersonGrid(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center p-10 bg-white rounded-[2rem] border border-dashed border-slate-200 text-slate-400">
                <i class="fa-solid fa-user-slash text-4xl mb-3 opacity-50"></i>
                <p>กำลังปรับปรุงข้อมูล</p>
            </div>`;
        return;
    }

    const sorted = [...data].sort((a, b) => a.id - b.id);
    const leader = sorted[0];
    const others = sorted.slice(1);

    const createCard = (p, isLeader = false) => {
        const bgClass = isLeader 
            ? 'bg-gradient-to-b from-white to-blue-50 border-blue-100 shadow-[0_20px_50px_-12px_rgba(59,130,246,0.2)]' 
            : 'bg-white border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl hover:-translate-y-1';
        
        const imgBorder = isLeader ? 'border-blue-200 ring-4 ring-blue-50' : 'border-slate-100';

        return `
        <div class="relative group rounded-[2.5rem] p-6 ${bgClass} border overflow-hidden transition-all duration-500 flex flex-col items-center text-center h-full">
            <div class="absolute top-0 right-0 w-32 h-32 ${isLeader ? 'bg-blue-200' : 'bg-slate-100'} rounded-full blur-[50px] opacity-40 -mr-10 -mt-10 group-hover:opacity-80 transition duration-700 pointer-events-none"></div>
            
            <div class="relative z-10 mb-6">
                <div class="w-32 h-32 rounded-full overflow-hidden border-[6px] ${imgBorder} shadow-lg bg-white relative mx-auto group-hover:scale-105 transition duration-500">
                    ${p.image 
                        ? `<img src="${p.image}" class="w-full h-full object-cover">` 
                        : `<div class="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><i class="fa-solid fa-user text-5xl"></i></div>`
                    }
                </div>
                ${isLeader ? '<div class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">Leader</div>' : ''}
            </div>

            <div class="relative z-10 w-full">
                <h3 class="text-xl font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition">${p.name}</h3>
                <div class="inline-block px-3 py-1 bg-white rounded-full border border-slate-200 shadow-sm">
                    <p class="text-sm text-slate-500 font-medium line-clamp-1">${p.role}</p>
                </div>
            </div>
        </div>`;
    };

    let html = '';
    if (leader) {
        html += `<div class="flex justify-center mb-12 animate-fade-in"><div class="w-full max-w-sm transform hover:scale-105 transition duration-500">${createCard(leader, true)}</div></div>`;
    }
    if (others.length > 0) {
        html += `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in delay-100">`;
        others.forEach(p => html += createCard(p));
        html += `</div>`;
    }
    container.innerHTML = html;
}

// 3.2 History List (Horizontal Bento)
export function renderHistoryTable(tbodyId, data) {
    const container = document.getElementById(tbodyId); 
    if (!container) return;
    
    // Handle table replacement if using old HTML
    const isTable = container.tagName === 'TBODY';
    const targetContainer = isTable ? container.closest('table').parentElement : container;
    
    if (isTable) {
        container.closest('table').style.display = 'none';
        let listContainer = document.getElementById(tbodyId + '-list');
        if(!listContainer) {
            listContainer = document.createElement('div');
            listContainer.id = tbodyId + '-list';
            listContainer.className = "space-y-4";
            targetContainer.appendChild(listContainer);
        }
        renderHistoryList(listContainer, data);
    } else {
        container.className = "space-y-4";
        renderHistoryList(container, data);
    }
}

function renderHistoryList(container, data) {
    container.innerHTML = '';
    
    if (!data || data.length === 0) {
        container.innerHTML = `<div class="p-8 text-center bg-white rounded-[2rem] border border-dashed border-slate-200 text-slate-400"><i class="fa-solid fa-clock-rotate-left text-3xl mb-2"></i><p>ยังไม่มีข้อมูลประวัติ</p></div>`;
        return;
    }

    [...data].sort((a, b) => b.id - a.id).forEach((item) => {
        const div = document.createElement('div');
        div.className = "group relative bg-white rounded-[1.5rem] p-4 pr-6 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-500 flex items-center gap-6 overflow-hidden";
        div.innerHTML = `
            <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-slate-200 to-slate-100 group-hover:from-blue-500 group-hover:to-indigo-500 transition-colors duration-500"></div>
            <div class="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-105 transition duration-500">
                ${item.image ? `<img class="h-full w-full object-cover" src="${item.image}">` : `<div class="h-full w-full flex items-center justify-center text-slate-300"><i class="fa-solid fa-user text-2xl"></i></div>`}
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div><h4 class="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition">${item.name}</h4><p class="text-sm text-slate-500 font-medium">${item.role || '-'}</p></div>
                    <div class="flex-shrink-0"><span class="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-100 shadow-sm group-hover:bg-amber-100 transition"><i class="fa-solid fa-calendar-check"></i><span>${item.year || 'ไม่ระบุปี'}</span></span></div>
                </div>
            </div>`;
        container.appendChild(div);
    });
}

// 3.3 Student Data (Dashboard Bento)
export function renderStudentChart(data) {
    const container = document.getElementById('student-summary-container');
    const chartCanvas = document.getElementById('studentChart');

    if (!data || data.length === 0) {
        if (container) container.innerHTML = '<div class="col-span-full text-center text-slate-400 py-10 bg-white rounded-[2rem] border border-dashed">ยังไม่มีข้อมูลนักเรียน</div>';
        return;
    }

    data.sort((a, b) => a.id - b.id);
    let totalMale = 0, totalFemale = 0;
    data.forEach(d => { totalMale += parseInt(d.male || 0); totalFemale += parseInt(d.female || 0); });

    if (container) {
        container.innerHTML = `
        <div class="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-[2rem] p-6 shadow-lg border border-blue-50 relative overflow-hidden group hover:-translate-y-1 transition duration-500">
                <div class="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-60 -mr-6 -mt-6"></div>
                <div class="relative z-10 flex items-center gap-4">
                    <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl text-blue-600 shadow-sm group-hover:scale-110 transition duration-500"><i class="fa-solid fa-users"></i></div>
                    <div><p class="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">นักเรียนทั้งหมด</p><h3 class="text-3xl font-black text-slate-800">${totalMale + totalFemale} <span class="text-sm font-light text-slate-400">คน</span></h3></div>
                </div>
            </div>
            <div class="bg-white rounded-[2rem] p-6 shadow-lg border border-sky-50 relative overflow-hidden group hover:-translate-y-1 transition duration-500">
                <div class="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-full blur-2xl opacity-60 -mr-6 -mt-6"></div>
                <div class="relative z-10 flex items-center gap-4">
                    <div class="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center text-2xl text-sky-500 shadow-sm group-hover:scale-110 transition duration-500"><i class="fa-solid fa-child"></i></div>
                    <div><p class="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">นักเรียนชาย</p><h3 class="text-3xl font-black text-slate-800">${totalMale} <span class="text-sm font-light text-slate-400">คน</span></h3></div>
                </div>
            </div>
            <div class="bg-white rounded-[2rem] p-6 shadow-lg border border-pink-50 relative overflow-hidden group hover:-translate-y-1 transition duration-500">
                <div class="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-full blur-2xl opacity-60 -mr-6 -mt-6"></div>
                <div class="relative z-10 flex items-center gap-4">
                    <div class="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-2xl text-pink-500 shadow-sm group-hover:scale-110 transition duration-500"><i class="fa-solid fa-child-dress"></i></div>
                    <div><p class="text-xs font-bold text-pink-400 uppercase tracking-wider mb-1">นักเรียนหญิง</p><h3 class="text-3xl font-black text-slate-800">${totalFemale} <span class="text-sm font-light text-slate-400">คน</span></h3></div>
                </div>
            </div>
        </div>`;
    }

    if (chartCanvas && window.Chart) {
        const canvasContainer = chartCanvas.parentElement;
        canvasContainer.className = "bg-white rounded-[2.5rem] p-6 md:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 relative overflow-hidden";
        if (window.myStudentChart) window.myStudentChart.destroy();
        window.myStudentChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: data.map(d => d.grade),
                datasets: [
                    { label: 'ชาย', data: data.map(d => d.male), backgroundColor: '#0ea5e9', borderRadius: 6, barPercentage: 0.6 },
                    { label: 'หญิง', data: data.map(d => d.female), backgroundColor: '#ec4899', borderRadius: 6, barPercentage: 0.6 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: '#f1f5f9' }, beginAtZero: true } },
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { family: "'Sarabun', sans-serif" } } }, tooltip: { backgroundColor: 'rgba(30, 41, 59, 0.9)', padding: 12, cornerRadius: 12 } }
            }
        });
    }
}

// =============================================================================
// 4. ACHIEVEMENT & DOCS SYSTEM (Standard)
// =============================================================================

export function renderAchievementSystem(containerId, data, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.className = "w-full"; 
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200"><i class="fa-solid fa-folder-open text-3xl mb-2 opacity-50"></i><p>ไม่พบข้อมูล</p></div>';
        return;
    }

    if (currentFolderFilter === null) {
        renderFolders(containerId, data, type);
    } else {
        const filteredData = data.filter(item => (item.competition || 'รายการอื่นๆ') === currentFolderFilter);
        const backBtnContainer = document.createElement('div');
        backBtnContainer.className = "w-full mb-6 animate-fade-in";
        backBtnContainer.innerHTML = `
            <div class="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h3 class="font-bold text-gray-800 flex items-center gap-2"><i class="fa-solid fa-folder-open text-yellow-500"></i> ${currentFolderFilter}</h3>
                <button onclick="clearFolderFilter('${containerId}', '${type}')" class="text-sm text-blue-600 hover:underline font-bold flex items-center gap-1"><i class="fa-solid fa-arrow-left"></i> ย้อนกลับ</button>
            </div>`;
        container.appendChild(backBtnContainer);
        renderPagedAchievements(container, filteredData, type, 1);
    }
}

function renderFolders(containerId, data, type) {
    const container = document.getElementById(containerId);
    const groups = data.reduce((acc, item) => {
        const key = item.competition || 'รายการอื่นๆ';
        if (!acc[key]) { acc[key] = { count: 0, latestImage: item.image }; }
        acc[key].count++;
        if(!acc[key].latestImage && item.image) acc[key].latestImage = item.image;
        return acc;
    }, {});

    const gridDiv = document.createElement('div');
    gridDiv.className = "w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

    Object.keys(groups).forEach(name => {
        const group = groups[name];
        const folderDiv = document.createElement('div');
        folderDiv.className = `bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md cursor-pointer flex items-center gap-4 transition duration-200 group`;
        folderDiv.onclick = () => selectFolder(containerId, type, name);
        folderDiv.innerHTML = `
            <div class="w-14 h-14 rounded-lg bg-blue-50 text-blue-400 flex items-center justify-center text-3xl group-hover:scale-110 transition">
                <i class="fa-solid fa-folder"></i>
            </div>
            <div>
                <h4 class="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition line-clamp-1">${name}</h4>
                <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">${group.count} รายการ</span>
            </div>
        `;
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

    const startIndex = (page - 1) * ACH_ITEMS_PER_PAGE;
    const pageItems = pageItemsFullList.slice(startIndex, startIndex + ACH_ITEMS_PER_PAGE);

    pageItems.forEach(item => {
        const div = document.createElement('div');
        div.className = `bg-white rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100 overflow-hidden cursor-pointer group`;
        div.onclick = () => window.open(item.fileUrl || item.image || '#', '_blank');
        
        div.innerHTML = `
            <div class="h-48 bg-gray-100 relative overflow-hidden">
                 ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover transition duration-500 group-hover:scale-105">` : `<div class="w-full h-full flex flex-col items-center justify-center text-gray-400"><i class="fa-solid fa-file-image text-4xl"></i></div>`}
            </div>
            <div class="p-4">
                <h4 class="font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition">${item.title || '-'}</h4>
                <p class="text-xs text-gray-500 mt-2 flex items-center gap-1"><i class="fa-regular fa-calendar"></i> ${item.date ? new Date(item.date).toLocaleDateString('th-TH') : '-'}</p>
            </div>
        `;
        gridWrapper.appendChild(div);
    });
}

// =============================================================================
// 5. NEWS & DOCS
// =============================================================================

export function renderNews(data) {
    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = '';
    
    if(!data || data.length === 0) {
        container.innerHTML = '<div class="text-center p-8 text-gray-400">ไม่พบน่าวสาร</div>';
        return;
    }

    data.slice(0, NEWS_ITEMS_PER_PAGE).forEach(news => {
        const div = document.createElement('div');
        div.className = "bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col md:flex-row gap-4 mb-4 group cursor-pointer";
        div.onclick = () => { if(news.link) window.open(news.link, '_blank'); };
        div.innerHTML = `
            <div class="w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                ${news.image ? `<img src="${news.image}" class="w-full h-full object-cover group-hover:scale-105 transition">` : ''}
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition line-clamp-2">${news.title}</h4>
                <p class="text-sm text-gray-500 mt-2"><i class="fa-regular fa-clock"></i> ${new Date(news.date).toLocaleDateString('th-TH')}</p>
            </div>
        `;
        container.appendChild(div);
    });
}

export function renderDocumentSystem(data, containerId, type = 'official') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    
    if(type === 'official') allOfficialDocs = data; else allFormDocs = data;

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="text-center p-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed"><i class="fa-solid fa-folder-open text-3xl mb-2 opacity-50"></i><p>ไม่พบเอกสาร</p></div>';
        return;
    }

    const currentFolder = currentDocFolder[type];

    if (currentFolder === null) {
        const groups = data.reduce((acc, item) => {
            const key = item.category || 'ทั่วไป';
            if (!acc[key]) acc[key] = 0;
            acc[key]++;
            return acc;
        }, {});

        let html = '<div class="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">';
        for(const [catName, count] of Object.entries(groups)) {
            html += `
            <div onclick="window.selectDocFolder('${containerId}', '${type}', '${catName}')" 
                 class="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer flex flex-col items-center text-center gap-3 transition group">
                <div class="w-14 h-14 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition">
                    <i class="fa-solid fa-folder"></i>
                </div>
                <div>
                    <h4 class="font-bold text-gray-700 text-sm group-hover:text-blue-600 transition">${catName}</h4>
                    <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">${count} ไฟล์</span>
                </div>
            </div>`;
        }
        html += '</div>';
        container.innerHTML = html;

    } else {
        const filteredDocs = data.filter(item => (item.category || 'ทั่วไป') === currentFolder);
        container.innerHTML = `
            <div class="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200 animate-fade-in">
                <h3 class="font-bold text-gray-700 flex items-center gap-2"><i class="fa-solid fa-folder-open text-yellow-500"></i> ${currentFolder}</h3>
                <button onclick="window.clearDocFolder('${containerId}', '${type}')" class="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1"><i class="fa-solid fa-arrow-left"></i> ย้อนกลับ</button>
            </div>
            <div class="space-y-3 animate-fade-in">
                ${filteredDocs.map(doc => {
                    const dateStr = doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('th-TH') : '-';
                    let iconClass = 'fa-file-lines text-gray-400';
                    if(doc.title && doc.title.includes('.pdf')) iconClass = 'fa-file-pdf text-red-500';
                    else if(doc.title && doc.title.includes('.doc')) iconClass = 'fa-file-word text-blue-500';
                    else if(doc.title && doc.title.includes('.xls')) iconClass = 'fa-file-excel text-green-500';

                    return `
                    <div class="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition group cursor-pointer" onclick="window.open('${doc.fileUrl}', '_blank')">
                        <div class="flex items-center gap-4 overflow-hidden">
                            <div class="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 text-xl group-hover:bg-white transition"><i class="fa-solid ${iconClass}"></i></div>
                            <div class="min-w-0">
                                <h4 class="font-bold text-gray-700 text-sm truncate group-hover:text-blue-600 transition">${doc.title}</h4>
                                <div class="flex gap-3 text-xs text-gray-400 mt-0.5"><span><i class="fa-regular fa-calendar"></i> ${dateStr}</span></div>
                            </div>
                        </div>
                        <div class="text-gray-300 group-hover:text-blue-500 transition px-2"><i class="fa-solid fa-download"></i></div>
                    </div>`;
                }).join('')}
            </div>
        `;
    }
}

// =============================================================================
// 6. EXPORTS & HELPERS
// =============================================================================

export function renderSchoolAchievements(data) { 
    if (!data) return;
    allSchoolData = [...data].sort((a, b) => b.id - a.id);
    const onet = allSchoolData.filter(i => i.title.includes('O-NET') || (i.competition && i.competition.includes('O-NET')));
    const nt = allSchoolData.filter(i => i.title.includes('NT') || (i.competition && i.competition.includes('NT')));
    const rt = allSchoolData.filter(i => i.title.includes('RT') || (i.competition && i.competition.includes('RT')));
    const general = allSchoolData.filter(i => !onet.includes(i) && !nt.includes(i) && !rt.includes(i));

    renderAchievementSystem('school-achievements-container', general, 'school');
    if(document.getElementById('onet-container')) renderAchievementSystem('onet-container', onet, 'school');
    if(document.getElementById('nt-container')) renderAchievementSystem('nt-container', nt, 'school');
    if(document.getElementById('rt-container')) renderAchievementSystem('rt-container', rt, 'school');
}

export function renderTeacherAchievements(data) { allTeacherData = data; renderAchievementSystem('teacher-achievements-container', data, 'teacher'); }
export function renderStudentAchievements(data) { allStudentData = data; renderAchievementSystem('student-achievements-container', data, 'student'); }

export function renderInnovations(data) { 
    const c = document.getElementById('innovations-container'); 
    if(c && data) { 
        c.innerHTML=''; 
        if(data.length === 0) c.innerHTML = '<div class="col-span-full text-center text-gray-400">ยังไม่มีนวัตกรรม</div>';
        data.forEach(i => { 
            c.innerHTML += `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition cursor-pointer" onclick="window.open('${i.fileUrl}','_blank')">
                <div class="aspect-video bg-gray-200 relative">
                    ${i.coverImageUrl ? `<img src="${i.coverImageUrl}" class="w-full h-full object-cover">` : '<div class="w-full h-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-lightbulb text-4xl"></i></div>'}
                </div>
                <div class="p-4">
                    <h4 class="font-bold text-gray-800 line-clamp-1">${i.title}</h4>
                    <p class="text-xs text-gray-500 mt-1">โดย ${i.creator}</p>
                </div>
            </div>`; 
        }); 
    } 
}

export function renderHomeNews(newsList) { 
    const c = document.getElementById('home-news-container'); 
    if(c) { c.innerHTML = ''; if(!newsList || newsList.length === 0) { c.innerHTML = '<div class="text-center py-10 text-gray-300 text-sm">ยังไม่มีข่าว</div>'; return; }
        [...newsList].sort((a, b) => b.id - a.id).slice(0,4).forEach(n => {
            c.innerHTML += `<div class="p-3 border-b border-gray-50 flex gap-3 hover:bg-gray-50 cursor-pointer transition rounded-lg group" onclick="window.open('${n.link || '#'}', '_blank')"><div class="w-16 h-12 bg-gray-200 rounded-md overflow-hidden shrink-0">${n.image ? `<img src="${n.image}" class="w-full h-full object-cover group-hover:scale-110 transition">` : ''}</div><div><h4 class="text-sm font-bold text-gray-700 line-clamp-1 group-hover:text-blue-600">${n.title}</h4><p class="text-xs text-gray-400 mt-1">${new Date(n.date).toLocaleDateString('th-TH')}</p></div></div>`; 
        }); 
    } 
}

// Window Assignments for OnClick
window.selectFolder = (cid, type, name) => { currentFolderFilter = name; let data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData); if(cid.includes('onet')) data = data.filter(d => d.title.includes('O-NET') || d.competition.includes('O-NET')); else if(cid.includes('nt')) data = data.filter(d => d.title.includes('NT') || d.competition.includes('NT')); else if(cid.includes('rt')) data = data.filter(d => d.title.includes('RT') || d.competition.includes('RT')); renderAchievementSystem(cid, data, type); };
window.clearFolderFilter = (cid, type) => { currentFolderFilter = null; let data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData); if(cid.includes('onet')) data = data.filter(d => d.title.includes('O-NET') || d.competition.includes('O-NET')); else if(cid.includes('nt')) data = data.filter(d => d.title.includes('NT') || d.competition.includes('NT')); else if(cid.includes('rt')) data = data.filter(d => d.title.includes('RT') || d.competition.includes('RT')); renderAchievementSystem(cid, data, type); };
window.selectDocFolder = (cid, type, catName) => { currentDocFolder[type] = catName; const data = type === 'official' ? allOfficialDocs : allFormDocs; renderDocumentSystem(data, cid, type); };
window.clearDocFolder = (cid, type) => { currentDocFolder[type] = null; const data = type === 'official' ? allOfficialDocs : allFormDocs; renderDocumentSystem(data, cid, type); };
window.filterNews = (id, cid) => { const input = document.getElementById(id); const searchText = input.value.toLowerCase().trim(); const filtered = allNewsData.filter(item => !searchText || item.title.toLowerCase().includes(searchText)); renderNews(filtered); };
window.filterDocuments = (id, cid) => { const input = document.getElementById(id); const searchText = input.value.toLowerCase().trim(); const isOfficial = cid.includes('official'); const type = isOfficial ? 'official' : 'form'; const sourceData = isOfficial ? allOfficialDocs : allFormDocs; if (searchText) { currentDocFolder[type] = 'ผลการค้นหา'; const filtered = sourceData.filter(item => item.title.toLowerCase().includes(searchText)); const container = document.getElementById(cid); container.innerHTML = ''; renderDocumentSystem(filtered, cid, type); } else { window.clearDocFolder(cid, type); } };
window.filterAchievements = (id, selId, cid) => {};
