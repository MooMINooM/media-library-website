// ui.js (Full)
export function renderSchoolInfo(info) {
    if(!info) return;
    
    // Header Info
    if(document.getElementById('hero-motto')) document.getElementById('hero-motto').innerText = info.motto || '';
    if(document.getElementById('header-logo') && info.logo_url) { 
        document.getElementById('header-logo').src = info.logo_url; 
        document.getElementById('header-logo').classList.remove('hidden');
    }

    // 1. Basic Info Mapping
    const map = {
        'info-name-th': info.school_name,
        'info-name-en': info.school_name_en,
        'info-school-code': info.school_code_10,
        'info-smis-code': info.smis_code_8,
        'info-obec-code': info.obec_code_6,
        'info-affiliation': info.affiliation,
        'info-address': info.address,
        'info-vision': info.vision,
        'info-philosophy': info.philosophy,
        'info-motto': info.motto,
        'school-identity-content': info.identity,
        'school-mission-content': info.mission,
        'school-history-content': info.history,
        'footer-school-name': info.school_name
    };

    for (const [id, val] of Object.entries(map)) {
        if(document.getElementById(id)) document.getElementById(id).innerText = val || '-';
    }

    // Colors & Badge
    if(info.founding_date && document.getElementById('school-age-badge')) {
        document.getElementById('school-age-badge').innerText = `ก่อตั้งมาแล้ว ${new Date().getFullYear() - new Date(info.founding_date).getFullYear()} ปี`;
    }
    if(document.getElementById('school-color-box')) {
        document.getElementById('school-color-box').style.background = `linear-gradient(to right, ${info.color_code_1||'#ddd'} 50%, ${info.color_code_2||'#ddd'} 50%)`;
    }
    
    // Media (Uniform, VTR, Song)
    if(document.getElementById('student-uniform-img')) {
        if(info.uniform_url) {
            document.getElementById('student-uniform-img').src = info.uniform_url;
            document.getElementById('student-uniform-img').classList.remove('hidden');
            if(document.getElementById('uniform-placeholder')) document.getElementById('uniform-placeholder').classList.add('hidden');
        }
    }

    if(info.song_url && document.getElementById('school-song')) {
        document.getElementById('school-song').src = info.song_url;
        document.getElementById('music-player-controls').classList.remove('hidden');
    }
    
    if(info.vtr_url && document.getElementById('vtr-iframe')) {
        let vid = info.vtr_url.split('v=')[1]?.split('&')[0] || info.vtr_url.split('youtu.be/')[1];
        if(vid) document.getElementById('vtr-iframe').src = `https://www.youtube.com/embed/${vid}`;
    }
}

// Global Variables
let allTeacherData = [];
let allStudentData = [];
let allSchoolData = [];
let allNewsData = [];
let allOfficialDocs = [];
let allFormDocs = [];

// Config
const ACH_ITEMS_PER_PAGE = 6;
const NEWS_ITEMS_PER_PAGE = 5;
const DOCS_ITEMS_PER_PAGE = 10;

let currentFolderFilter = null;
let currentDocFolder = null;

function getSubjectBadge(subject) {
    if (!subject) return '';
    return `<span class="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded border">${subject}</span>`;
}

export function renderAchievementSystem(containerId, data, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.className = "w-full"; 
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400">ไม่พบข้อมูล</div>';
        return;
    }

    if (currentFolderFilter === null) {
        renderFolders(containerId, data, type);
    } else {
        const filteredData = data.filter(item => (item.competition || 'รายการอื่นๆ') === currentFolderFilter);
        const backBtn = document.createElement('div');
        backBtn.className = "w-full mb-4";
        backBtn.innerHTML = `<button onclick="window.clearFolderFilter('${containerId}', '${type}')" class="text-blue-600 hover:underline font-bold"><i class="fa-solid fa-arrow-left"></i> ย้อนกลับ (${currentFolderFilter})</button>`;
        container.appendChild(backBtn);
        renderPagedAchievements(container, filteredData, type, 1);
    }
}

function renderFolders(containerId, data, type) {
    const container = document.getElementById(containerId);
    const groups = data.reduce((acc, item) => {
        const key = item.competition || 'รายการอื่นๆ';
        if (!acc[key]) { acc[key] = { count: 0, latestImage: item.image }; }
        acc[key].count++;
        return acc;
    }, {});

    const grid = document.createElement('div');
    grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

    Object.keys(groups).forEach(name => {
        const div = document.createElement('div');
        div.className = "bg-white p-6 rounded-xl border shadow-sm hover:shadow-md cursor-pointer transition flex items-center gap-4";
        div.onclick = () => window.selectFolder(containerId, type, name);
        div.innerHTML = `<div class="text-4xl text-blue-200"><i class="fa-solid fa-folder"></i></div><div><h4 class="font-bold text-gray-800">${name}</h4><span class="text-xs text-gray-500">${groups[name].count} รายการ</span></div>`;
        grid.appendChild(div);
    });
    container.appendChild(grid);
}

function renderPagedAchievements(container, data, type, page) {
    let grid = container.querySelector('.achievements-grid');
    if (!grid) { grid = document.createElement('div'); grid.className = "achievements-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"; container.appendChild(grid); } else { grid.innerHTML = ''; }
    
    data.forEach(item => {
        const click = item.fileUrl ? `window.open('${item.fileUrl}', '_blank')` : `window.open('${item.image}', '_blank')`;
        const div = document.createElement('div');
        div.className = "bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition cursor-pointer";
        div.onclick = () => window.open(item.fileUrl || item.image, '_blank');
        div.innerHTML = `<div class="h-48 bg-gray-100 relative">${item.image ? `<img src="${item.image}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-file text-4xl"></i></div>`}</div><div class="p-4"><h4 class="font-bold text-gray-800 line-clamp-2">${item.title}</h4><p class="text-xs text-gray-500 mt-2">${item.competition || ''}</p></div>`;
        grid.appendChild(div);
    });
}

export function renderNews(data) {
    const container = document.getElementById('news-container');
    if (!container || !data) return;
    container.innerHTML = '';
    data.slice(0, 5).forEach(news => {
        const div = document.createElement('div');
        div.className = "bg-white p-4 rounded-xl border shadow-sm flex gap-4 mb-4";
        div.innerHTML = `<div class="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden shrink-0">${news.image ? `<img src="${news.image}" class="w-full h-full object-cover">` : ''}</div><div><h4 class="font-bold text-gray-800">${news.title}</h4><p class="text-sm text-gray-500 mt-1">${news.date}</p></div>`;
        container.appendChild(div);
    });
}

export function renderDocuments(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !data) return;
    container.innerHTML = '';
    data.forEach(doc => {
        const div = document.createElement('div');
        div.className = "flex justify-between items-center p-3 border-b hover:bg-gray-50";
        div.innerHTML = `<div class="flex items-center gap-3"><i class="fa-solid fa-file-pdf text-red-500"></i><span class="text-sm font-bold text-gray-700">${doc.title}</span></div><a href="${doc.fileUrl}" target="_blank" class="text-blue-600"><i class="fa-solid fa-download"></i></a>`;
        container.appendChild(div);
    });
}

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
export function renderInnovations(data) { const c = document.getElementById('innovations-container'); if(c && data) { c.innerHTML=''; data.forEach(i => { c.innerHTML += `<div class="bg-white p-4 rounded border"><img src="${i.coverImageUrl||''}" class="w-full h-32 object-cover mb-2"><h4 class="font-bold">${i.title}</h4></div>`; }); } }
export function renderPersonGrid(data, containerId) { const container = document.getElementById(containerId); if(!container) return; container.innerHTML = ''; if(!data || data.length === 0) { container.innerHTML='<p class="text-center text-gray-500 col-span-full">กำลังปรับปรุงข้อมูล</p>'; return; } const sorted=[...data].sort((a,b)=>a.id-b.id); const leader=sorted[0]; const others=sorted.slice(1); const createCard = (p) => `<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-lg transition transform hover:-translate-y-1 h-full"><div class="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 mb-4 shadow-inner bg-gray-200">${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : '<div class="w-full h-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-user text-4xl"></i></div>'}</div><h3 class="text-lg font-bold text-gray-800 mb-1">${p.name}</h3><p class="text-blue-600 font-medium text-sm">${p.role}</p></div>`; let html=''; if(leader) html+=`<div class="flex justify-center mb-8"><div class="w-full max-w-xs">${createCard(leader)}</div></div>`; if(others.length>0){ html+='<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">'; others.forEach(p=>html+=createCard(p)); html+='</div>'; } container.innerHTML=html; }
export function renderHistoryTable(tbodyId, data) { const tbody = document.getElementById(tbodyId); if (!tbody) return; tbody.innerHTML = ''; if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-500">ไม่มีข้อมูล</td></tr>'; return; } [...data].sort((a,b)=>a.id-b.id).forEach((item,index)=>{ const tr=document.createElement('tr'); tr.className=index%2===0?'bg-white':'bg-gray-50'; tr.innerHTML=`<td class="px-6 py-4 text-sm text-gray-500">${index+1}</td><td class="px-6 py-4"><div class="flex items-center"><div class="h-10 w-10 mr-4 bg-gray-200 rounded-full overflow-hidden">${item.image?`<img class="h-10 w-10 object-cover" src="${item.image}">`:'<div class="h-full w-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-user"></i></div>'}</div><div class="text-sm font-medium text-gray-900">${item.name}</div></div></td><td class="px-6 py-4 text-sm text-gray-500">${item.role||'-'}</td><td class="px-6 py-4 text-sm text-gray-500">${item.year||`${item.start_date||'-'} ถึง ${item.end_date||'ปัจจุบัน'}`}</td>`; tbody.appendChild(tr); }); }
export function renderStudentChart(data) { const container = document.getElementById('student-summary-container'); const chartCanvas = document.getElementById('studentChart'); if (!data || data.length === 0) { if(container) container.innerHTML = '<p class="text-center text-gray-400 col-span-3">ยังไม่มีข้อมูลนักเรียน</p>'; return; } data.sort((a, b) => a.id - b.id); let totalMale = 0, totalFemale = 0; data.forEach(d => { totalMale += parseInt(d.male || 0); totalFemale += parseInt(d.female || 0); }); if (container) { container.innerHTML = `<div class="bg-blue-100 p-4 rounded-xl text-center border border-blue-200"><h3 class="text-blue-800 font-bold text-lg">ทั้งหมด</h3><p class="text-3xl font-bold text-blue-600">${totalMale + totalFemale} <span class="text-sm">คน</span></p></div><div class="bg-green-100 p-4 rounded-xl text-center border border-green-200"><h3 class="text-green-800 font-bold text-lg">ชาย</h3><p class="text-3xl font-bold text-green-600">${totalMale} <span class="text-sm">คน</span></p></div><div class="bg-pink-100 p-4 rounded-xl text-center border border-pink-200"><h3 class="text-pink-800 font-bold text-lg">หญิง</h3><p class="text-3xl font-bold text-pink-600">${totalFemale} <span class="text-sm">คน</span></p></div>`; } if (chartCanvas) { if (window.myStudentChart) window.myStudentChart.destroy(); window.myStudentChart = new Chart(chartCanvas, { type: 'bar', data: { labels: data.map(d => d.grade), datasets: [ { label: 'ชาย', data: data.map(d => d.male), backgroundColor: '#3b82f6', borderRadius: 4 }, { label: 'หญิง', data: data.map(d => d.female), backgroundColor: '#ec4899', borderRadius: 4 } ] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }, plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'แผนภูมิแสดงจำนวนนักเรียนแยกตามระดับชั้น' } } } }); } }
export function renderHomeNews(data) { const c = document.getElementById('home-news-container'); if(c) { c.innerHTML = ''; data.slice(0,4).forEach(n => c.innerHTML += `<div class="p-2 border-b flex gap-2"><div class="w-12 h-12 bg-gray-200"><img src="${n.image}" class="w-full h-full object-cover"></div><div><h4 class="text-sm font-bold">${n.title}</h4></div></div>`); } }

window.selectFolder = (cid, type, name) => {
    currentFolderFilter = name;
    let data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData);
    if(cid.includes('onet')) data = data.filter(d => d.title.includes('O-NET') || d.competition.includes('O-NET'));
    else if(cid.includes('nt')) data = data.filter(d => d.title.includes('NT') || d.competition.includes('NT'));
    else if(cid.includes('rt')) data = data.filter(d => d.title.includes('RT') || d.competition.includes('RT'));
    renderAchievementSystem(cid, data, type);
};

window.clearFolderFilter = (cid, type) => {
    currentFolderFilter = null;
    let data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData);
    if(cid.includes('onet')) data = data.filter(d => d.title.includes('O-NET') || d.competition.includes('O-NET'));
    else if(cid.includes('nt')) data = data.filter(d => d.title.includes('NT') || d.competition.includes('NT'));
    else if(cid.includes('rt')) data = data.filter(d => d.title.includes('RT') || d.competition.includes('RT'));
    renderAchievementSystem(cid, data, type);
};

window.filterNews = (id) => {};
window.filterDocuments = (id, cid) => {};
window.filterAchievements = (id, selId, cid) => {};
