// js/ui.js - Lumina Bento Edition (Final Full Version)

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
    return `<span class="bg-blue-50/80 backdrop-blur-sm text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-blue-100 inline-flex items-center gap-1.5 whitespace-nowrap shadow-sm"><i class="fa-solid fa-tag text-[9px]"></i> ${cleanSubject}</span>`;
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

    // 3. Page: School Basic Info
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
    
    // Logo Logic for Hero Card
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
        document.getElementById('school-color-box').style.background = `linear-gradient(135deg, ${c1} 50%, ${c2} 50%)`;
        document.getElementById('school-color-box').classList.add('shadow-inner', 'ring-1', 'ring-black/5');
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
                iframe.style.borderRadius = "2rem";
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
            <div class="col-span-full flex flex-col items-center justify-center p-12 bg-white/50 backdrop-blur rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400 animate-pulse">
                <i class="fa-solid fa-user-slash text-5xl mb-4 opacity-30"></i>
                <p class="font-medium tracking-wide">กำลังปรับปรุงข้อมูล</p>
            </div>`;
        return;
    }

    const sorted = [...data].sort((a, b) => a.id - b.id);
    const leader = sorted[0];
    const others = sorted.slice(1);

    const createCard = (p, isLeader = false) => {
        const bgClass = isLeader 
            ? 'bg-gradient-to-b from-white to-blue-50/50 border-blue-100 shadow-[0_20px_50px_-12px_rgba(59,130,246,0.15)]' 
            : 'bg-white/80 backdrop-blur-sm border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-2';
        
        const imgBorder = isLeader ? 'border-blue-200 ring-[8px] ring-blue-50/50' : 'border-white ring-4 ring-slate-50';

        return `
        <div class="relative group rounded-[2.5rem] p-8 ${bgClass} border overflow-hidden transition-all duration-700 flex flex-col items-center text-center h-full">
            <div class="absolute top-0 right-0 w-32 h-32 ${isLeader ? 'bg-blue-100/50' : 'bg-slate-100/50'} rounded-full blur-[60px] opacity-40 -mr-10 -mt-10 group-hover:opacity-100 transition duration-700 pointer-events-none"></div>
            
            <div class="relative z-10 mb-8">
                <div class="w-36 h-36 rounded-full overflow-hidden border-[6px] ${imgBorder} shadow-2xl bg-white relative mx-auto group-hover:scale-105 group-hover:rotate-3 transition duration-700 ease-out">
                    ${p.image 
                        ? `<img src="${p.image}" class="w-full h-full object-cover">` 
                        : `<div class="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><i class="fa-solid fa-user text-6xl"></i></div>`
                    }
                </div>
            </div>

            <div class="relative z-10 w-full space-y-3">
                <h3 class="text-xl font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors duration-500">${p.name}</h3>
                <div class="inline-block px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100 shadow-sm transition-all duration-500 group-hover:bg-blue-50 group-hover:border-blue-100">
                    <p class="text-xs text-slate-500 font-bold uppercase tracking-widest group-hover:text-blue-500 transition-colors">${p.role}</p>
                </div>
            </div>
        </div>`;
    };

    let html = '';
    if (leader) {
        html += `<div class="flex justify-center mb-16 animate-fade-in"><div class="w-full max-w-sm transform transition duration-700 ease-out">${createCard(leader, true)}</div></div>`;
    }
    if (others.length > 0) {
        html += `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">`;
        others.forEach(p => html += createCard(p));
        html += `</div>`;
    }
    container.innerHTML = html;
}

// 3.2 History List (Horizontal Bento)
export function renderHistoryTable(tbodyId, data) {
    const container = document.getElementById(tbodyId); 
    if (!container) return;
    
    const isTable = container.tagName === 'TBODY';
    const targetContainer = isTable ? container.closest('table').parentElement : container;
    
    if (isTable) {
        container.closest('table').style.display = 'none';
        let listContainer = document.getElementById(tbodyId + '-list');
        if(!listContainer) {
            listContainer = document.createElement('div');
            listContainer.id = tbodyId + '-list';
            listContainer.className = "grid grid-cols-1 gap-6";
            targetContainer.appendChild(listContainer);
        }
        renderHistoryList(listContainer, data);
    } else {
        container.className = "grid grid-cols-1 gap-6";
        renderHistoryList(container, data);
    }
}

function renderHistoryList(container, data) {
    container.innerHTML = '';
    
    if (!data || data.length === 0) {
        container.innerHTML = `<div class="p-12 text-center bg-white/50 backdrop-blur rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400 font-medium tracking-wide">ยังไม่มีข้อมูลทำเนียบ</div>`;
        return;
    }

    [...data].sort((a, b) => b.id - a.id).forEach((item) => {
        const div = document.createElement('div');
        div.className = "group relative bg-white/80 backdrop-blur-sm rounded-[2rem] p-5 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-700 flex flex-col sm:flex-row items-center gap-8 overflow-hidden";
        div.innerHTML = `
            <div class="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div class="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition duration-700">
                ${item.image ? `<img class="h-full w-full object-cover" src="${item.image}">` : `<div class="h-full w-full flex items-center justify-center text-slate-300"><i class="fa-solid fa-user text-3xl"></i></div>`}
            </div>

            <div class="flex-1 text-center sm:text-left min-w-0">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div class="space-y-1">
                        <h4 class="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition-colors duration-500">${item.name}</h4>
                        <p class="text-sm text-slate-500 font-bold uppercase tracking-widest">${item.role || '-'}</p>
                    </div>
                    
                    <div class="flex-shrink-0 flex justify-center">
                        <span class="inline-flex items-center gap-2.5 px-5 py-2 bg-amber-50 text-amber-600 text-[11px] font-black uppercase tracking-[0.2em] rounded-full border border-amber-100 shadow-sm group-hover:bg-amber-100 transition-colors duration-500">
                            <i class="fa-solid fa-calendar-check"></i>
                            <span>${item.year || 'ไม่ระบุปี'}</span>
                        </span>
                    </div>
                </div>
            </div>`;
        container.appendChild(div);
    });
}

// 3.3 Student Data (Dashboard Bento & Paired Bar Chart)
export function renderStudentChart(data) {
    const container = document.getElementById('student-summary-container');
    const chartCanvas = document.getElementById('studentChart');

    if (!data || data.length === 0) {
        if (container) container.innerHTML = '<div class="col-span-full text-center text-slate-400 py-16 bg-white rounded-[2.5rem] border border-dashed font-medium">ยังไม่มีข้อมูลนักเรียน</div>';
        return;
    }

    data.sort((a, b) => a.id - b.id);
    let totalMale = 0, totalFemale = 0;
    data.forEach(d => { totalMale += parseInt(d.male || 0); totalFemale += parseInt(d.female || 0); });

    if (container) {
        container.innerHTML = `
        <div class="col-span-full grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div class="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2.5rem] p-8 shadow-xl text-white relative overflow-hidden group transition-all duration-700 hover:-translate-y-2">
                <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl opacity-60 -mr-10 -mt-10 group-hover:scale-125 transition duration-700"></div>
                <div class="relative z-10 flex items-center gap-6">
                    <div class="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:rotate-12 transition duration-500 border border-white/10"><i class="fa-solid fa-users"></i></div>
                    <div>
                        <p class="text-[10px] font-bold text-indigo-100 uppercase tracking-[0.2em] mb-1">นักเรียนทั้งหมด</p>
                        <h3 class="text-4xl font-black">${totalMale + totalFemale} <span class="text-sm font-light opacity-60">คน</span></h3>
                    </div>
                </div>
            </div>
            <div class="bg-white/80 backdrop-blur-sm border border-sky-100 rounded-[2.5rem] p-8 shadow-lg relative overflow-hidden group transition-all duration-700 hover:-translate-y-2">
                <div class="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-10 group-hover:scale-125 transition duration-700"></div>
                <div class="relative z-10 flex items-center gap-6">
                    <div class="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center text-3xl text-sky-500 shadow-sm group-hover:rotate-12 transition duration-500 border border-sky-100"><i class="fa-solid fa-child"></i></div>
                    <div>
                        <p class="text-[10px] font-bold text-sky-400 uppercase tracking-[0.2em] mb-1">นักเรียนชาย</p>
                        <h3 class="text-4xl font-black text-slate-800">${totalMale} <span class="text-sm font-light text-slate-400">คน</span></h3>
                    </div>
                </div>
            </div>
            <div class="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-[2.5rem] p-8 shadow-lg relative overflow-hidden group transition-all duration-700 hover:-translate-y-2">
                <div class="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-10 group-hover:scale-125 transition duration-700"></div>
                <div class="relative z-10 flex items-center gap-6">
                    <div class="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-3xl text-pink-500 shadow-sm group-hover:rotate-12 transition duration-500 border border-pink-100"><i class="fa-solid fa-child-dress"></i></div>
                    <div>
                        <p class="text-[10px] font-bold text-pink-400 uppercase tracking-[0.2em] mb-1">นักเรียนหญิง</p>
                        <h3 class="text-4xl font-black text-slate-800">${totalFemale} <span class="text-sm font-light text-slate-400">คน</span></h3>
                    </div>
                </div>
            </div>
        </div>`;
    }

    if (chartCanvas && window.Chart) {
        chartCanvas.parentElement.className = "bg-white/90 backdrop-blur rounded-[3rem] p-8 md:p-12 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden relative";
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
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { 
                    x: { grid: { display: false }, ticks: { font: { weight: 'bold', family: "'Sarabun', sans-serif" } } }, 
                    y: { grid: { color: '#f1f5f9', borderDash: [5, 5] }, beginAtZero: true } 
                },
                plugins: { 
                    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 30, font: { family: "'Sarabun', sans-serif", weight: 'bold' } } },
                    tooltip: { backgroundColor: 'rgba(30, 41, 59, 0.95)', padding: 16, cornerRadius: 16, titleFont: { size: 14 }, bodyFont: { size: 14 } }
                }
            }
        });
    }
}

// =============================================================================
// 4. NEWS & INNOVATIONS (Lumina Bento)
// =============================================================================

export function renderNews(data) {
    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = '';
    if(!data || data.length === 0) {
        container.innerHTML = '<div class="text-center p-16 text-slate-400 font-medium">ยังไม่มีข่าวประชาสัมพันธ์ในขณะนี้</div>';
        return;
    }

    data.slice(0, NEWS_ITEMS_PER_PAGE).forEach(news => {
        container.innerHTML += `
        <div class="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-700 flex flex-col lg:flex-row gap-8 mb-8 group cursor-pointer" onclick="if('${news.link}') window.open('${news.link}', '_blank')">
            <div class="w-full lg:w-64 h-48 bg-slate-100 rounded-[1.8rem] overflow-hidden shrink-0 shadow-inner">
                ${news.image ? `<img src="${news.image}" class="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-2 transition duration-[1.5s] ease-out">` : `<div class="w-full h-full flex items-center justify-center text-slate-200"><i class="fa-solid fa-image text-5xl"></i></div>`}
            </div>
            <div class="flex-1 flex flex-col justify-between py-2">
                <div class="space-y-4">
                    <h4 class="font-bold text-2xl text-slate-800 group-hover:text-blue-600 transition-colors duration-500 leading-tight line-clamp-2">${news.title}</h4>
                    <p class="text-slate-500 line-clamp-2 font-light leading-relaxed">ข้อมูลและรายละเอียดข่าวประชาสัมพันธ์ล่าสุดจากทางโรงเรียน สามารถคลิกเพื่ออ่านรายละเอียดฉบับเต็มได้ที่นี่...</p>
                </div>
                <div class="flex items-center justify-between mt-8 pt-6 border-t border-slate-50">
                    <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-slate-100 shadow-sm"><i class="fa-regular fa-calendar-alt text-blue-400"></i> ${new Date(news.date).toLocaleDateString('th-TH')}</span>
                    <span class="text-blue-600 text-xs font-black uppercase tracking-widest group-hover:translate-x-3 transition-transform duration-500">Read More <i class="fa-solid fa-chevron-right ml-2 text-[10px]"></i></span>
                </div>
            </div>
        </div>`;
    });
}

export function renderInnovations(data) { 
    const c = document.getElementById('innovations-container'); 
    if(!c) return;
    c.innerHTML=''; 
    if(!data || data.length === 0) {
        c.innerHTML = '<div class="col-span-full text-center text-slate-400 py-20 font-medium">ยังไม่มีนวัตกรรมใหม่ในขณะนี้</div>';
        return;
    }
    c.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10";
    data.forEach(i => { 
        c.innerHTML += `
        <div class="group bg-white rounded-[3rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] hover:-translate-y-3 transition-all duration-700 cursor-pointer" onclick="window.open('${i.fileUrl}','_blank')">
            <div class="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                ${i.coverImageUrl ? `<img src="${i.coverImageUrl}" class="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition duration-[2s] ease-out">` : '<i class="fa-solid fa-lightbulb text-6xl absolute inset-0 m-auto text-slate-200"></i>'}
                <div class="absolute top-5 right-5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-2xl text-[10px] font-black text-blue-600 shadow-xl border border-white/50 uppercase tracking-widest">${i.subject || 'Creative'}</div>
            </div>
            <div class="p-8">
                <h4 class="font-bold text-xl text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors duration-500 mb-6 h-14">${i.title}</h4>
                <div class="flex items-center gap-4 pt-6 border-t border-slate-50">
                    <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100/50 group-hover:rotate-12 transition-transform duration-500"><i class="fa-solid fa-user-pen text-sm"></i></div>
                    <div class="text-[11px]"><p class="font-black text-slate-700 uppercase tracking-wider">${i.creator}</p><p class="text-slate-400 font-bold mt-0.5">${i.class || '-'}</p></div>
                </div>
            </div>
        </div>`; 
    }); 
}

// =============================================================================
// 5. ACHIEVEMENTS & DOCUMENTS (Lumina Bento)
// =============================================================================

export function renderAchievementSystem(containerId, data, type) {
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

        container.className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-fade-in";
        Object.keys(groups).forEach(name => {
            container.innerHTML += `
            <div onclick="window.selectFolder('${containerId}', '${type}', '${name}')" class="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.12)] hover:border-blue-200 hover:-translate-y-2 transition-all duration-700 cursor-pointer text-center relative overflow-hidden">
                <div class="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="w-20 h-20 bg-blue-50/80 rounded-[1.8rem] flex items-center justify-center text-4xl text-blue-500 mx-auto mb-6 shadow-sm border border-blue-100 group-hover:scale-110 group-hover:rotate-6 transition duration-700"><i class="fa-solid fa-folder-open"></i></div>
                <h4 class="font-bold text-slate-700 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">${name}</h4>
                <div class="mt-4"><span class="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-50/50 px-4 py-1.5 rounded-full border border-blue-50">${groups[name].count} Items</span></div>
            </div>`;
        });
    } else {
        const filtered = data.filter(item => (item.competition || 'รายการอื่นๆ') === currentFolderFilter);
        container.className = "space-y-10 animate-fade-in";
        container.innerHTML = `
            <div class="flex items-center justify-between bg-white/80 backdrop-blur-sm p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 class="font-bold text-xl text-slate-800 flex items-center gap-3"><i class="fa-solid fa-folder-open text-amber-500"></i> ${currentFolderFilter}</h3>
                <button onclick="window.clearFolderFilter('${containerId}', '${type}')" class="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-indigo-600 transition-colors bg-blue-50 px-5 py-2.5 rounded-full border border-blue-100 shadow-sm hover:shadow-md"><i class="fa-solid fa-arrow-left mr-2"></i> Back to Gallery</button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                ${filtered.map(item => `
                <div class="group bg-white rounded-[3rem] shadow-lg border border-slate-100 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-3 transition-all duration-[0.8s] cursor-pointer" onclick="window.open('${item.image || item.file_url || '#'}', '_blank')">
                    <div class="aspect-square bg-slate-50 relative overflow-hidden">
                        ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition duration-[2s] ease-out">` : '<i class="fa-solid fa-award text-7xl absolute inset-0 m-auto text-slate-100"></i>'}
                    </div>
                    <div class="p-8 text-center space-y-3">
                        <h4 class="font-bold text-lg text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">${item.title || item.name}</h4>
                        <div class="pt-4 border-t border-slate-50"><p class="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">${item.program || 'Achievement'}</p></div>
                    </div>
                </div>`).join('')}
            </div>`;
    }
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
        container.className = "grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in";
        container.innerHTML = Object.entries(groups).map(([name, count]) => `
            <div onclick="window.selectDocFolder('${containerId}', '${type}', '${name}')" class="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(245,158,11,0.12)] hover:border-amber-200 hover:-translate-y-2 transition-all duration-700 cursor-pointer text-center relative overflow-hidden">
                <div class="absolute -bottom-4 -right-4 w-20 h-20 bg-amber-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div class="w-20 h-20 bg-amber-50/80 rounded-[1.8rem] flex items-center justify-center text-4xl text-amber-500 mx-auto mb-6 shadow-sm border border-amber-100 group-hover:scale-110 group-hover:rotate-6 transition duration-700"><i class="fa-solid fa-folder-closed"></i></div>
                <h4 class="font-bold text-slate-700 text-base line-clamp-1 group-hover:text-amber-600 transition-colors">${name}</h4>
                <div class="mt-4"><span class="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] bg-amber-50/50 px-4 py-1.5 rounded-full border border-amber-50">${count} Files</span></div>
            </div>`).join('');
    } else {
        const filtered = data.filter(item => (item.category || 'ทั่วไป') === current);
        container.className = "space-y-4 animate-fade-in";
        container.innerHTML = `
            <div class="flex items-center justify-between bg-slate-100/50 backdrop-blur p-5 rounded-[2rem] border border-white/50 mb-10">
                <h3 class="font-bold text-xl text-slate-700 flex items-center gap-3"><i class="fa-solid fa-folder-open text-amber-500"></i> ${current}</h3>
                <button onclick="window.clearDocFolder('${containerId}', '${type}')" class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-slate-800 transition-colors bg-white/80 px-5 py-2.5 rounded-full border border-white shadow-sm hover:shadow-md">Back to Files</button>
            </div>
            <div class="grid grid-cols-1 gap-4">
                ${filtered.map(doc => `
                <div class="group bg-white/80 backdrop-blur-sm p-5 rounded-[1.8rem] border border-slate-100 flex items-center justify-between hover:shadow-2xl hover:-translate-y-1 hover:border-blue-100 transition-all duration-700 cursor-pointer shadow-sm" onclick="window.open('${doc.fileUrl}', '_blank')">
                    <div class="flex items-center gap-6">
                        <div class="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner"><i class="fa-solid fa-file-lines"></i></div>
                        <div class="space-y-1">
                            <h4 class="font-bold text-base text-slate-700 group-hover:text-blue-600 transition-colors duration-500">${doc.title}</h4>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><i class="fa-regular fa-clock text-blue-300"></i> ${new Date(doc.uploadDate).toLocaleDateString('th-TH')}</p>
                        </div>
                    </div>
                    <div class="p-3 rounded-full bg-slate-50 text-slate-200 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-sm"><i class="fa-solid fa-download text-sm"></i></div>
                </div>`).join('')}
            </div>`;
    }
}

// =============================================================================
// 6. EXPORTS & ATTACHMENTS
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

export function renderHomeNews(newsList) { 
    const c = document.getElementById('home-news-container'); if(!c) return;
    c.innerHTML = ''; if(!newsList || newsList.length === 0) return;
    [...newsList].sort((a, b) => b.id - a.id).slice(0,4).forEach(n => {
        c.innerHTML += `
        <div class="p-5 border-b border-slate-50 flex gap-5 hover:bg-white/80 hover:backdrop-blur-sm cursor-pointer transition-all duration-500 rounded-[1.5rem] group" onclick="window.open('${n.link || '#'}', '_blank')">
            <div class="w-24 h-16 bg-slate-100 rounded-2xl overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                ${n.image ? `<img src="${n.image}" class="w-full h-full object-cover">` : ''}
            </div>
            <div class="flex-1 space-y-2 py-0.5">
                <h4 class="text-sm font-bold text-slate-700 line-clamp-1 group-hover:text-blue-600 transition-colors">${n.title}</h4>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span> ${new Date(n.date).toLocaleDateString('th-TH')}</p>
            </div>
        </div>`; 
    }); 
}

// Window Bridge
window.selectFolder = (cid, type, name) => { currentFolderFilter = name; const data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData); renderAchievementSystem(cid, data, type); };
window.clearFolderFilter = (cid, type) => { currentFolderFilter = null; const data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData); renderAchievementSystem(cid, data, type); };
window.selectDocFolder = (cid, type, catName) => { currentDocFolder[type] = catName; const data = type === 'official' ? allOfficialDocs : allFormDocs; renderDocumentSystem(data, cid, type); };
window.clearDocFolder = (cid, type) => { currentDocFolder[type] = null; const data = type === 'official' ? allOfficialDocs : allFormDocs; renderDocumentSystem(data, cid, type); };
window.filterNews = (id, cid) => { const input = document.getElementById(id); const searchText = input.value.toLowerCase(); const filtered = allNewsData.filter(item => item.title.toLowerCase().includes(searchText)); renderNews(filtered); };
