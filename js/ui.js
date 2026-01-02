// js/ui.js

// ตัวแปรเก็บข้อมูลดิบเพื่อใช้ในการค้นหาและแบ่งหน้า
let allTeacherData = [];
let allStudentData = [];
const ITEMS_PER_PAGE = 9; // 9 รายการต่อหน้า (3x3)

// -------------------------------------------------------------------------
// 1. ระบบจัดการข้อมูลและการแบ่งหน้า (Core Logic)
// -------------------------------------------------------------------------

// ฟังก์ชันหลักสำหรับ Render ข้อมูลแบบมีหน้า (ฉบับ Compact: ไม่มีรูป + ไม่ต้อง Scroll)
function renderPagedData(containerId, data, type, page = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    // 1. กรณีไม่มีข้อมูล
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400">ไม่พบข้อมูลผลงาน</div>';
        return;
    }

    // 2. คำนวณการตัดแบ่งหน้า
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageItems = data.slice(startIndex, endIndex);

    // 3. วาดการ์ดผลงาน (Compact Design: เน้นข้อความ ประหยัดพื้นที่)
    pageItems.forEach(item => {
        const dateStr = item.date ? new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : '-';
        const name = type === 'teacher' ? item.name : item.students;
        
        // กำหนดสีธีม: ครู=น้ำเงิน, นักเรียน=ชมพู
        const themeColor = type === 'teacher' ? 'blue' : 'pink';
        const borderColor = type === 'teacher' ? 'border-blue-500' : 'border-pink-500';
        const iconColor = type === 'teacher' ? 'text-blue-500' : 'text-pink-500';
        
        const div = document.createElement('div');
        div.className = `achievement-card bg-white rounded-lg shadow-sm border border-gray-200 border-l-[3px] ${borderColor} hover:shadow-md transition relative flex flex-col justify-between p-3 h-full min-h-[130px] group animate-fade-in`;
        
        div.innerHTML = `
            <div class="absolute top-1 right-1 text-gray-50 text-4xl -z-0 pointer-events-none group-hover:text-gray-100 transition">
                <i class="fa-solid fa-award"></i>
            </div>

            <div class="relative z-10">
                <div class="flex justify-between items-start mb-1">
                    ${item.level ? `<span class="bg-gray-100 text-gray-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-gray-200">${item.level}</span>` : '<span></span>'}
                    ${item.image ? 
                        `<a href="${item.image}" target="_blank" class="text-[10px] text-${themeColor}-600 hover:underline font-bold flex items-center gap-1">
                            <i class="fa-solid fa-file-contract"></i> ดูเกียรติบัตร
                         </a>` : ''
                    }
                </div>

                <h4 class="text-sm font-bold text-slate-800 leading-tight cursor-pointer hover:text-${themeColor}-600 line-clamp-1 mb-1" onclick="window.open('${item.image || '#'}', '_blank')" title="${item.title}">
                    ${item.title || '-'}
                </h4>
                
                <div class="flex flex-col gap-0.5 text-[10px] text-gray-500 border-l-2 border-gray-200 pl-2 mb-2">
                    ${item.competition ? `<div class="font-semibold text-${themeColor}-600 truncate"><i class="fa-solid fa-trophy w-3 text-center"></i> ${item.competition}</div>` : ''}
                    ${item.program ? `<div class="truncate"><i class="fa-solid fa-tag w-3 text-center"></i> ${item.program}</div>` : ''}
                </div>
            </div>

            <div class="relative z-10 pt-2 border-t border-dashed border-gray-100 mt-auto">
                <div class="flex justify-between items-end text-[10px]">
                    <div class="font-medium text-gray-700 truncate max-w-[70%]">
                        <i class="fa-solid fa-user ${iconColor} mr-1"></i>${name}
                    </div>
                    <div class="text-gray-400 text-[9px]">
                        ${dateStr}
                    </div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    // 4. สร้างปุ่มเปลี่ยนหน้า (Pagination)
    if (totalPages > 1) {
        renderPaginationControls(container, totalPages, page, type, data);
    }
}

// ฟังก์ชันสร้างปุ่มกดเปลี่ยนหน้า
function renderPaginationControls(container, totalPages, currentPage, type, currentFilteredData) {
    const nav = document.createElement('div');
    nav.className = "col-span-full flex justify-center items-center gap-1.5 mt-2 pt-2 border-t border-gray-100";
    
    const createBtn = (label, targetPage, isActive = false, isDisabled = false) => {
        const btn = document.createElement('button');
        btn.innerHTML = label;
        // ปุ่มเล็กกระทัดรัด
        btn.className = `px-2 py-0.5 rounded text-xs font-bold transition ${isActive ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;
        if (!isDisabled && !isActive) {
            btn.onclick = () => renderPagedData(container.id, currentFilteredData, type, targetPage);
        }
        return btn;
    };

    nav.appendChild(createBtn('<i class="fa-solid fa-chevron-left"></i>', currentPage - 1, false, currentPage === 1));

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            nav.appendChild(createBtn(i, i, i === currentPage));
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            nav.appendChild(document.createTextNode("..."));
        }
    }

    nav.appendChild(createBtn('<i class="fa-solid fa-chevron-right"></i>', currentPage + 1, false, currentPage === totalPages));

    container.appendChild(nav);
}

// ฟังก์ชันค้นหาและกรอง
window.filterAchievements = function(inputId, selectId, containerId) {
    const input = document.getElementById(inputId);
    const select = document.getElementById(selectId);
    
    const searchText = input.value.toLowerCase().trim();
    const filterLevel = select.value;
    
    const isTeacher = containerId.includes('teacher');
    const sourceData = isTeacher ? allTeacherData : allStudentData;
    const type = isTeacher ? 'teacher' : 'student';

    const filteredData = sourceData.filter(item => {
        const textContent = `${item.title} ${item.program} ${item.competition} ${item.name || item.students} ${item.organization}`.toLowerCase();
        const itemLevel = item.level || "";
        const matchText = !searchText || textContent.includes(searchText);
        const matchLevel = (filterLevel === "all") || (itemLevel === filterLevel);
        return matchText && matchLevel;
    });

    renderPagedData(containerId, filteredData, type, 1);
}

// -------------------------------------------------------------------------
// 2. Export Functions
// -------------------------------------------------------------------------

export function renderTeacherAchievements(data) { 
    if(!data) return;
    allTeacherData = [...data].sort((a, b) => b.id - a.id);
    renderPagedData('teacher-achievements-container', allTeacherData, 'teacher', 1); 
}

export function renderStudentAchievements(data) { 
    if(!data) return;
    allStudentData = [...data].sort((a, b) => b.id - a.id);
    renderPagedData('student-achievements-container', allStudentData, 'student', 1); 
}

// ... (ฟังก์ชันอื่นๆ renderHomeNews, renderNews, renderSchoolInfo, renderPersonGrid, renderHistoryTable, renderInnovations, renderDocuments, renderStudentChart คงเดิม) ...

export function renderHomeNews(newsList) {
    const container = document.getElementById('home-news-container');
    if (!container) return;
    container.innerHTML = '';
    if (!newsList || newsList.length === 0) { container.innerHTML = '<p class="text-center text-gray-400 py-4 text-sm">ยังไม่มีข่าวประชาสัมพันธ์</p>'; return; }
    const sortedNews = [...newsList].sort((a, b) => b.id - a.id);
    const limitNews = sortedNews.slice(0, 4);
    limitNews.forEach(news => {
        const dateStr = news.date ? new Date(news.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
        const cursorClass = (news.link && news.link !== '#') ? 'cursor-pointer hover:bg-gray-50' : '';
        const div = document.createElement('div');
        div.className = `border-b border-gray-100 pb-3 mb-2 last:border-0 last:mb-0 last:pb-0 ${cursorClass} transition rounded p-2 flex gap-3`;
        div.onclick = () => { if(news.link && news.link !== '#') window.open(news.link, '_blank'); };
        div.innerHTML = `<div class="flex-shrink-0 w-16 h-12 bg-gray-100 rounded-md overflow-hidden">${news.image ? `<img src="${news.image}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-gray-300"><i class="fa-regular fa-image"></i></div>`}</div><div class="flex-1 min-w-0"><h4 class="text-sm font-bold text-gray-700 line-clamp-1">${news.title}</h4><p class="text-xs text-gray-400 mt-1 flex items-center gap-1"><i class="fa-regular fa-clock"></i> ${dateStr}</p></div>`;
        container.appendChild(div);
    });
}

export function renderNews(newsList) {
    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = '';
    if (!newsList || newsList.length === 0) { container.innerHTML = '<div class="text-center p-10 bg-gray-50 rounded-xl text-gray-500">ไม่พบข่าวสาร</div>'; return; }
    const sortedNews = [...newsList].sort((a, b) => b.id - a.id);
    sortedNews.forEach(news => {
        const dateStr = news.date ? new Date(news.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
        const linkTarget = (news.link && news.link !== '#') ? `href="${news.link}" target="_blank"` : 'href="javascript:void(0)" style="cursor: default;"';
        const div = document.createElement('div');
        div.className = "bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col md:flex-row gap-4";
        div.innerHTML = `<div class="md:w-1/4 flex-shrink-0"><div class="aspect-video bg-gray-200 rounded-lg overflow-hidden relative">${news.image ? `<img src="${news.image}" class="w-full h-full object-cover hover:scale-105 transition duration-500">` : `<div class="w-full h-full flex items-center justify-center text-gray-400"><i class="fa-regular fa-image text-3xl"></i></div>`}</div></div><div class="flex-1 flex flex-col justify-between py-1"><div><a ${linkTarget} class="text-lg font-bold text-gray-800 hover:text-blue-600 transition line-clamp-2 mb-2">${news.title}</a><div class="text-sm text-gray-500 mb-3 flex items-center gap-2"><i class="fa-regular fa-calendar"></i> ${dateStr}</div></div><div class="text-right">${(news.link && news.link !== '#') ? `<a href="${news.link}" target="_blank" class="text-blue-600 text-sm font-bold hover:underline">อ่านต่อ <i class="fa-solid fa-arrow-right"></i></a>` : ''}</div></div>`;
        container.appendChild(div);
    });
}

export function renderSchoolInfo(dataList) {
    if (!dataList || dataList.length === 0) return;
    const info = dataList[0]; 
    const mottoEl = document.getElementById('hero-motto'); if(mottoEl && info.motto) mottoEl.innerText = info.motto;
    if (info.founding_date) { const founded = new Date(info.founding_date); const now = new Date(); const age = now.getFullYear() - founded.getFullYear(); const ageBadge = document.getElementById('school-age-badge'); if(ageBadge) ageBadge.innerText = `ก่อตั้งมาแล้ว ${age} ปี`; }
    if(info.identity) { const idBadge = document.getElementById('school-identity'); if(idBadge) { idBadge.innerText = info.identity; idBadge.classList.remove('hidden'); } }
    const vtrContainer = document.getElementById('vtr-container'); const vtrIframe = document.getElementById('vtr-iframe');
    if (info.vtr_url && vtrContainer && vtrIframe) { let videoId = ''; if (info.vtr_url.includes('v=')) videoId = info.vtr_url.split('v=')[1].split('&')[0]; else if (info.vtr_url.includes('youtu.be/')) videoId = info.vtr_url.split('youtu.be/')[1]; if (videoId) { vtrIframe.src = `https://www.youtube.com/embed/${videoId}`; vtrContainer.classList.remove('hidden'); const ph = document.getElementById('vtr-placeholder'); if(ph) ph.style.display = 'none'; } }
    const colorBox = document.getElementById('school-color-box'); if(colorBox) { const c1 = info.color_code || '#ddd'; const c2 = info.color_code_2 || c1; colorBox.style.background = `linear-gradient(to right, ${c1} 50%, ${c2} 50%)`; colorBox.style.border = '1px solid rgba(0,0,0,0.1)'; }
    const audio = document.getElementById('school-song'); if (info.song_url && audio) { audio.src = info.song_url; const controls = document.getElementById('music-player-controls'); if(controls) controls.classList.remove('hidden'); }
    const histContent = document.getElementById('school-history-content'); if(histContent) histContent.innerText = info.history || 'ยังไม่มีข้อมูลประวัติในระบบ';
    const missionContent = document.getElementById('school-mission-content'); if(missionContent) missionContent.innerText = info.mission || '-';
    const identityContent = document.getElementById('school-identity-content'); if(identityContent) identityContent.innerText = info.identity || '-';
    const footerName = document.getElementById('footer-school-name'); if(footerName && info.school_name) footerName.innerText = info.school_name;
    const socialContainer = document.getElementById('social-links-container'); if(socialContainer) { let html = ''; if(info.facebook) html += `<a href="${info.facebook}" target="_blank" class="text-slate-400 hover:text-blue-500 transition text-xl"><i class="fa-brands fa-facebook"></i></a>`; if(info.youtube) html += `<a href="${info.youtube}" target="_blank" class="text-slate-400 hover:text-red-500 transition text-xl"><i class="fa-brands fa-youtube"></i></a>`; socialContainer.innerHTML = html; }
}

export function renderPersonGrid(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (!data || data.length === 0) { container.innerHTML = '<p class="text-center text-gray-500 col-span-full">กำลังปรับปรุงข้อมูล</p>'; return; }
    const sortedData = [...data].sort((a, b) => a.id - b.id);
    const leader = sortedData[0]; const others = sortedData.slice(1);
    const createCard = (p) => `<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-lg transition transform hover:-translate-y-1 h-full"><div class="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 mb-4 shadow-inner bg-gray-200">${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : '<div class="w-full h-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-user text-4xl"></i></div>'}</div><h3 class="text-lg font-bold text-gray-800 mb-1">${p.name}</h3><p class="text-blue-600 font-medium text-sm">${p.role}</p></div>`;
    let html = '';
    if (leader) html += `<div class="flex justify-center mb-8"><div class="w-full max-w-xs">${createCard(leader)}</div></div>`;
    if (others.length > 0) { html += '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">'; others.forEach(p => html += createCard(p)); html += '</div>'; }
    container.innerHTML = html;
}

export function renderHistoryTable(tbodyId, data) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-500">ไม่มีข้อมูล</td></tr>'; return; }
    const sortedData = [...data].sort((a, b) => a.id - b.id);
    sortedData.forEach((item, index) => {
        const timeStr = item.year || `${item.start_date || '-'} ถึง ${item.end_date || 'ปัจจุบัน'}`;
        const tr = document.createElement('tr');
        tr.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        tr.innerHTML = `<td class="px-6 py-4 text-sm text-gray-500">${index + 1}</td><td class="px-6 py-4"><div class="flex items-center"><div class="h-10 w-10 mr-4 bg-gray-200 rounded-full overflow-hidden">${item.image ? `<img class="h-10 w-10 object-cover" src="${item.image}">` : '<div class="h-full w-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-user"></i></div>'}</div><div class="text-sm font-medium text-gray-900">${item.name}</div></div></td><td class="px-6 py-4 text-sm text-gray-500">${item.role || '-'}</td><td class="px-6 py-4 text-sm text-gray-500">${timeStr}</td>`;
        tbody.appendChild(tr);
    });
}

export function renderSchoolAchievements(data) { 
    const container = document.getElementById('school-achievements-container');
    if (!container) return;
    container.innerHTML = '';
    if (!data || data.length === 0) { container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400">ยังไม่มีข้อมูลผลงาน</div>'; return; }
    const sortedData = [...data].sort((a, b) => b.id - a.id);
    sortedData.forEach(item => {
        const dateStr = item.date ? new Date(item.date).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' }) : '';
        const div = document.createElement('div');
        div.className = "bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 flex flex-col";
        div.innerHTML = `<div class="h-48 bg-gray-100 relative overflow-hidden group">${item.image ? `<img src="${item.image}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110">` : `<div class="w-full h-full flex items-center justify-center text-gray-300"><i class="fa-solid fa-trophy text-4xl"></i></div>`}${dateStr ? `<div class="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold shadow-sm">${dateStr}</div>` : ''}</div><div class="p-4 flex-grow flex flex-col"><h4 class="font-bold text-gray-800 mb-1 line-clamp-2">${item.title}</h4><div class="mt-auto pt-2 border-t border-gray-50 text-xs text-blue-600 font-semibold">โรงเรียน</div></div>`;
        container.appendChild(div);
    });
}

export function renderInnovations(data) {
    const container = document.getElementById('innovations-container');
    if (!container) return;
    container.innerHTML = '';
    if (!data || data.length === 0) { container.innerHTML = '<div class="col-span-full text-center text-gray-500">ไม่พบนวัตกรรม</div>'; return; }
    const sortedData = [...data].sort((a, b) => b.id - a.id);
    sortedData.forEach(item => {
        const div = document.createElement('div');
        div.className = "group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden";
        div.innerHTML = `<div class="aspect-[4/3] bg-gray-100 relative overflow-hidden">${item.coverImageUrl ? `<img src="${item.coverImageUrl}" class="w-full h-full object-cover transition duration-700 group-hover:scale-110">` : `<div class="w-full h-full flex items-center justify-center text-blue-200"><i class="fa-solid fa-lightbulb text-5xl"></i></div>`}<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">${item.fileUrl ? `<a href="${item.fileUrl}" target="_blank" class="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm font-bold shadow-lg w-full text-center transform translate-y-4 group-hover:translate-y-0 transition duration-300">เปิดดูผลงาน</a>` : ''}</div></div><div class="p-5"><div class="flex items-center gap-2 mb-2"><span class="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-md">${item.subject || 'ทั่วไป'}</span><span class="text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded-md">${item.class || '-'}</span></div><h3 class="font-bold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition">${item.title}</h3><p class="text-sm text-gray-500 flex items-center gap-2"><i class="fa-solid fa-user-pen"></i> ${item.creator || 'คณะผู้จัดทำ'}</p></div>`;
        container.appendChild(div);
    });
}

export function renderDocuments(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (!data || data.length === 0) { container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">ไม่พบเอกสาร</div>'; return; }
    const sortedData = [...data].sort((a, b) => b.id - a.id);
    sortedData.forEach(doc => {
        const dateStr = doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('th-TH') : '-';
        const icon = doc.title.includes('PDF') ? 'fa-file-pdf text-red-500' : (doc.title.includes('Word') ? 'fa-file-word text-blue-500' : 'fa-file-lines text-gray-500');
        const div = document.createElement('div');
        div.className = "flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition group cursor-pointer";
        div.onclick = () => { if(doc.fileUrl) window.open(doc.fileUrl, '_blank'); };
        div.innerHTML = `<div class="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-2xl group-hover:bg-blue-50 transition"><i class="fa-solid ${icon}"></i></div><div class="flex-1"><h4 class="font-bold text-gray-700 group-hover:text-blue-600 transition">${doc.title}</h4><div class="flex gap-3 text-xs text-gray-400 mt-1"><span><i class="fa-regular fa-calendar"></i> ${dateStr}</span><span><i class="fa-solid fa-tag"></i> ${doc.category || 'ทั่วไป'}</span></div></div><div class="text-gray-300 group-hover:text-blue-500"><i class="fa-solid fa-download"></i></div>`;
        container.appendChild(div);
    });
}

export function renderStudentChart(data) {
    const container = document.getElementById('student-summary-container');
    const chartCanvas = document.getElementById('studentChart');
    if (!data || data.length === 0) { if(container) container.innerHTML = '<p class="text-center text-gray-400 col-span-3">ยังไม่มีข้อมูลนักเรียน</p>'; return; }
    data.sort((a, b) => a.id - b.id);
    let totalMale = 0, totalFemale = 0;
    data.forEach(d => { totalMale += parseInt(d.male || 0); totalFemale += parseInt(d.female || 0); });
    if (container) { container.innerHTML = `<div class="bg-blue-100 p-4 rounded-xl text-center border border-blue-200"><h3 class="text-blue-800 font-bold text-lg">ทั้งหมด</h3><p class="text-3xl font-bold text-blue-600">${totalMale + totalFemale} <span class="text-sm">คน</span></p></div><div class="bg-green-100 p-4 rounded-xl text-center border border-green-200"><h3 class="text-green-800 font-bold text-lg">ชาย</h3><p class="text-3xl font-bold text-green-600">${totalMale} <span class="text-sm">คน</span></p></div><div class="bg-pink-100 p-4 rounded-xl text-center border border-pink-200"><h3 class="text-pink-800 font-bold text-lg">หญิง</h3><p class="text-3xl font-bold text-pink-600">${totalFemale} <span class="text-sm">คน</span></p></div>`; }
    if (chartCanvas) { if (window.myStudentChart) window.myStudentChart.destroy(); window.myStudentChart = new Chart(chartCanvas, { type: 'bar', data: { labels: data.map(d => d.grade), datasets: [ { label: 'ชาย', data: data.map(d => d.male), backgroundColor: '#3b82f6', borderRadius: 4 }, { label: 'หญิง', data: data.map(d => d.female), backgroundColor: '#ec4899', borderRadius: 4 } ] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }, plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'แผนภูมิแสดงจำนวนนักเรียนแยกตามระดับชั้น' } } } }); }
}

export function setupDropdowns() {}
export function setupModal() {}
export function closeAllDropdowns() { document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden')); }
