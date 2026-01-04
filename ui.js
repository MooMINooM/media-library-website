// js/ui.js - Lumina Bento Edition (Full Universal Version)

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
// 2. PERSONNEL & STUDENTS (Lumina Bento)
// =============================================================================

export function renderPersonGrid(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = `<div class="col-span-full flex flex-col items-center justify-center p-10 bg-white rounded-[2rem] border border-dashed border-slate-200 text-slate-400"><i class="fa-solid fa-user-slash text-4xl mb-3 opacity-50"></i><p>กำลังปรับปรุงข้อมูล</p></div>`;
        return;
    }

    const sorted = [...data].sort((a, b) => a.id - b.id);
    const leader = sorted[0];
    const others = sorted.slice(1);

    const createCard = (p, isLeader = false) => {
        const bgClass = isLeader ? 'bg-gradient-to-b from-white to-blue-50 border-blue-100 shadow-xl' : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1';
        return `
        <div class="relative group rounded-[2.5rem] p-6 ${bgClass} border overflow-hidden transition-all duration-500 flex flex-col items-center text-center h-full">
            <div class="absolute top-0 right-0 w-32 h-32 ${isLeader ? 'bg-blue-100' : 'bg-slate-50'} rounded-full blur-[50px] opacity-40 group-hover:opacity-80 transition pointer-events-none"></div>
            <div class="relative z-10 mb-6">
                <div class="w-32 h-32 rounded-full overflow-hidden border-[6px] ${isLeader ? 'border-blue-100' : 'border-white'} shadow-lg bg-white mx-auto group-hover:scale-110 group-hover:rotate-6 transition duration-500">
                    ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><i class="fa-solid fa-user text-5xl"></i></div>`}
                </div>
            </div>
            <div class="relative z-10 w-full">
                <h3 class="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition">${p.name}</h3>
                <div class="inline-block px-3 py-1 bg-white rounded-full border border-slate-100 shadow-sm"><p class="text-xs text-slate-500 font-medium">${p.role}</p></div>
            </div>
        </div>`;
    };

    let html = '';
    if (leader) html += `<div class="flex justify-center mb-12 animate-fade-in"><div class="w-full max-w-sm transform hover:scale-105 transition duration-500">${createCard(leader, true)}</div></div>`;
    if (others.length > 0) {
        html += `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">`;
        others.forEach(p => html += createCard(p));
        html += `</div>`;
    }
    container.innerHTML = html;
}

export function renderHistoryTable(tbodyId, data) {
    const container = document.getElementById(tbodyId); 
    if (!container) return;
    const isTable = container.tagName === 'TBODY';
    const target = isTable ? container.closest('table').parentElement : container;
    if (isTable) container.closest('table').style.display = 'none';
    
    target.className = "space-y-4";
    target.innerHTML = '';
    if (!data || data.length === 0) {
        target.innerHTML = `<div class="p-8 text-center bg-white rounded-[2rem] border border-dashed border-slate-200 text-slate-400"><p>ยังไม่มีข้อมูล</p></div>`;
        return;
    }

    [...data].sort((a, b) => b.id - a.id).forEach(item => {
        target.innerHTML += `
        <div class="group relative bg-white rounded-[1.5rem] p-4 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-500 flex items-center gap-6 overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden shrink-0 group-hover:scale-110 group-hover:rotate-6 transition duration-500">
                ${item.image ? `<img class="h-full w-full object-cover" src="${item.image}">` : `<i class="fa-solid fa-user text-2xl m-5 text-slate-300"></i>`}
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-slate-800 group-hover:text-blue-600 transition">${item.name}</h4>
                <p class="text-xs text-slate-500">${item.role || '-'}</p>
            </div>
            <div class="px-4 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full border border-amber-100">${item.year || '-'}</div>
        </div>`;
    });
}

export function renderStudentChart(data) {
    const container = document.getElementById('student-summary-container');
    const chartCanvas = document.getElementById('studentChart');
    if (!data || data.length === 0) return;

    let totalMale = 0, totalFemale = 0;
    data.forEach(d => { totalMale += parseInt(d.male || 0); totalFemale += parseInt(d.female || 0); });

    if (container) {
        container.innerHTML = `
        <div class="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-[2rem] p-6 shadow-lg border border-blue-50 relative group transition-all duration-500 hover:-translate-y-1">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl text-blue-600 group-hover:rotate-12 transition"><i class="fa-solid fa-users"></i></div>
                    <div><p class="text-[10px] font-bold text-blue-400 uppercase tracking-widest">ทั้งหมด</p><h3 class="text-3xl font-black text-slate-800">${totalMale+totalFemale}</h3></div>
                </div>
            </div>
            <div class="bg-white rounded-[2rem] p-6 shadow-lg border border-sky-50 relative group transition-all duration-500 hover:-translate-y-1">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center text-2xl text-sky-500 group-hover:rotate-12 transition"><i class="fa-solid fa-child"></i></div>
                    <div><p class="text-[10px] font-bold text-sky-400 uppercase tracking-widest">ชาย</p><h3 class="text-3xl font-black text-slate-800">${totalMale}</h3></div>
                </div>
            </div>
            <div class="bg-white rounded-[2rem] p-6 shadow-lg border border-pink-50 relative group transition-all duration-500 hover:-translate-y-1">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-2xl text-pink-500 group-hover:rotate-12 transition"><i class="fa-solid fa-child-dress"></i></div>
                    <div><p class="text-[10px] font-bold text-pink-400 uppercase tracking-widest">หญิง</p><h3 class="text-3xl font-black text-slate-800">${totalFemale}</h3></div>
                </div>
            </div>
        </div>`;
    }

    if (chartCanvas && window.Chart) {
        chartCanvas.parentElement.className = "bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 overflow-hidden";
        if (window.myStudentChart) window.myStudentChart.destroy();
        window.myStudentChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: data.map(d => d.grade),
                datasets: [
                    { label: 'ชาย', data: data.map(d => d.male), backgroundColor: '#0ea5e9', borderRadius: 6, barPercentage: 0.6, categoryPercentage: 0.8 },
                    { label: 'หญิง', data: data.map(d => d.female), backgroundColor: '#ec4899', borderRadius: 6, barPercentage: 0.6, categoryPercentage: 0.8 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { x: { grid: { display: false } }, y: { grid: { color: '#f1f5f9' }, beginAtZero: true } },
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }
            }
        });
    }
}

// =============================================================================
// 3. NEWS & INNOVATIONS (Lumina Bento)
// =============================================================================

export function renderNews(data) {
    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = '';
    if(!data || data.length === 0) {
        container.innerHTML = '<div class="text-center p-8 text-slate-400">ยังไม่มีข่าวประชาสัมพันธ์</div>';
        return;
    }

    data.slice(0, NEWS_ITEMS_PER_PAGE).forEach(news => {
        container.innerHTML += `
        <div class="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-500 flex flex-col md:flex-row gap-6 mb-6 group cursor-pointer" onclick="if('${news.link}') window.open('${news.link}', '_blank')">
            <div class="w-full md:w-56 h-40 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                ${news.image ? `<img src="${news.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700">` : `<div class="w-full h-full flex items-center justify-center text-slate-300"><i class="fa-solid fa-image text-4xl"></i></div>`}
            </div>
            <div class="flex-1 flex flex-col justify-between py-2">
                <div>
                    <h4 class="font-bold text-xl text-slate-800 group-hover:text-blue-600 transition line-clamp-2">${news.title}</h4>
                    <p class="text-sm text-slate-500 mt-3 line-clamp-2 font-light">อ่านข่าวประชาสัมพันธ์และข่าวสารกิจกรรมต่างๆ ของโรงเรียนเพิ่มเติมได้ที่นี่...</p>
                </div>
                <div class="flex items-center justify-between mt-4">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"><i class="fa-regular fa-clock mr-1"></i> ${new Date(news.date).toLocaleDateString('th-TH')}</span>
                    <span class="text-blue-600 text-xs font-bold group-hover:translate-x-2 transition">อ่านเพิ่มเติม <i class="fa-solid fa-arrow-right ml-1"></i></span>
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
        c.innerHTML = '<div class="col-span-full text-center text-slate-400 py-10">ยังไม่มีนวัตกรรม</div>';
        return;
    }
    c.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";
    data.forEach(i => { 
        c.innerHTML += `
        <div class="group bg-white rounded-[2.5rem] shadow-lg border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition duration-500 cursor-pointer" onclick="window.open('${i.fileUrl}','_blank')">
            <div class="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                ${i.coverImageUrl ? `<img src="${i.coverImageUrl}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700">` : '<i class="fa-solid fa-lightbulb text-5xl absolute inset-0 m-auto text-slate-200"></i>'}
                <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-blue-600 shadow-sm border border-white/50">${i.subject || 'นวัตกรรม'}</div>
            </div>
            <div class="p-6">
                <h4 class="font-bold text-lg text-slate-800 line-clamp-2 group-hover:text-blue-600 transition mb-3">${i.title}</h4>
                <div class="flex items-center gap-3 pt-4 border-t border-slate-50">
                    <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-xs"><i class="fa-solid fa-user"></i></div>
                    <div class="text-[11px]"><p class="font-bold text-slate-700">${i.creator}</p><p class="text-slate-400">${i.class || '-'}</p></div>
                </div>
            </div>
        </div>`; 
    }); 
}

// =============================================================================
// 4. ACHIEVEMENTS & DOCUMENTS (Lumina Bento)
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

        container.className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6";
        Object.keys(groups).forEach(name => {
            container.innerHTML += `
            <div onclick="window.selectFolder('${containerId}', '${type}', '${name}')" class="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition duration-500 cursor-pointer text-center">
                <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl text-blue-400 mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition duration-500"><i class="fa-solid fa-folder"></i></div>
                <h4 class="font-bold text-slate-700 text-sm line-clamp-1 group-hover:text-blue-600 transition">${name}</h4>
                <span class="text-[10px] font-bold text-slate-400 mt-2 inline-block bg-slate-50 px-3 py-0.5 rounded-full">${groups[name].count} รายการ</span>
            </div>`;
        });
    } else {
        const filtered = data.filter(item => (item.competition || 'รายการอื่นๆ') === currentFolderFilter);
        container.className = "space-y-6";
        container.innerHTML = `
            <div class="flex items-center justify-between bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm mb-8">
                <h3 class="font-bold text-slate-800 flex items-center gap-2"><i class="fa-solid fa-folder-open text-amber-500"></i> ${currentFolderFilter}</h3>
                <button onclick="window.clearFolderFilter('${containerId}', '${type}')" class="text-xs font-bold text-blue-600 hover:underline"><i class="fa-solid fa-arrow-left mr-1"></i> ย้อนกลับ</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                ${filtered.map(item => `
                <div class="group bg-white rounded-[2.5rem] shadow-md border border-slate-100 overflow-hidden hover:shadow-2xl transition duration-500 cursor-pointer" onclick="window.open('${item.image || item.file_url || '#'}', '_blank')">
                    <div class="aspect-square bg-slate-50 relative overflow-hidden">
                        ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700">` : '<i class="fa-solid fa-award text-5xl absolute inset-0 m-auto text-slate-200"></i>'}
                    </div>
                    <div class="p-6 text-center">
                        <h4 class="font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition">${item.title || item.name}</h4>
                        <p class="text-[10px] font-bold text-slate-400 tracking-widest uppercase">${item.program || '-'}</p>
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
        container.className = "grid grid-cols-2 md:grid-cols-4 gap-6";
        container.innerHTML = Object.entries(groups).map(([name, count]) => `
            <div onclick="window.selectDocFolder('${containerId}', '${type}', '${name}')" class="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-amber-200 hover:-translate-y-1 transition duration-500 cursor-pointer text-center">
                <div class="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl text-amber-400 mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition duration-500"><i class="fa-solid fa-folder-closed"></i></div>
                <h4 class="font-bold text-slate-700 text-sm line-clamp-1 group-hover:text-blue-600 transition">${name}</h4>
                <span class="text-[10px] font-bold text-slate-400 mt-2 inline-block bg-slate-50 px-3 py-0.5 rounded-full">${count} ไฟล์</span>
            </div>`).join('');
    } else {
        const filtered = data.filter(item => (item.category || 'ทั่วไป') === current);
        container.className = "space-y-3";
        container.innerHTML = `
            <div class="flex items-center justify-between bg-slate-50 p-4 rounded-[1.5rem] mb-6">
                <h3 class="font-bold text-slate-700 flex items-center gap-2"><i class="fa-solid fa-folder-open text-amber-500"></i> ${current}</h3>
                <button onclick="window.clearDocFolder('${containerId}', '${type}')" class="text-xs font-bold text-blue-600 hover:underline">ย้อนกลับ</button>
            </div>
            ${filtered.map(doc => `
            <div class="group bg-white p-4 rounded-[1.2rem] border border-slate-100 flex items-center justify-between hover:shadow-lg transition cursor-pointer" onclick="window.open('${doc.fileUrl}', '_blank')">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition"><i class="fa-solid fa-file-lines"></i></div>
                    <div><h4 class="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition">${doc.title}</h4><p class="text-[10px] text-slate-400 mt-0.5">${new Date(doc.uploadDate).toLocaleDateString('th-TH')}</p></div>
                </div>
                <i class="fa-solid fa-download text-slate-200 group-hover:text-blue-500 transition mr-2"></i>
            </div>`).join('')}`;
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
        c.innerHTML += `<div class="p-4 border-b border-slate-50 flex gap-4 hover:bg-slate-50 cursor-pointer transition rounded-2xl group" onclick="window.open('${n.link || '#'}', '_blank')"><div class="w-20 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0">${n.image ? `<img src="${n.image}" class="w-full h-full object-cover group-hover:scale-110 transition">` : ''}</div><div><h4 class="text-sm font-bold text-slate-700 line-clamp-1 group-hover:text-blue-600">${n.title}</h4><p class="text-[10px] text-slate-400 mt-2">${new Date(n.date).toLocaleDateString('th-TH')}</p></div></div>`; 
    }); 
}

// Window Bridge
window.selectFolder = (cid, type, name) => { currentFolderFilter = name; const data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData); renderAchievementSystem(cid, data, type); };
window.clearFolderFilter = (cid, type) => { currentFolderFilter = null; const data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData); renderAchievementSystem(cid, data, type); };
window.selectDocFolder = (cid, type, catName) => { currentDocFolder[type] = catName; const data = type === 'official' ? allOfficialDocs : allFormDocs; renderDocumentSystem(data, cid, type); };
window.clearDocFolder = (cid, type) => { currentDocFolder[type] = null; const data = type === 'official' ? allOfficialDocs : allFormDocs; renderDocumentSystem(data, cid, type); };
window.filterNews = (id, cid) => { const input = document.getElementById(id); const searchText = input.value.toLowerCase(); const filtered = allNewsData.filter(item => item.title.toLowerCase().includes(searchText)); renderNews(filtered); };
