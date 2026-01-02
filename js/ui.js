// js/ui.js

// 0. ฟังก์ชันค้นหา (Search Logic) สำหรับหน้าผลงาน
window.filterAchievements = function(inputId, containerId) {
    const input = document.getElementById(inputId);
    const filter = input.value.toLowerCase();
    const container = document.getElementById(containerId);
    // ดึงการ์ดทั้งหมดที่มี class 'achievement-card'
    const cards = container.getElementsByClassName('achievement-card');

    for (let i = 0; i < cards.length; i++) {
        const textContent = cards[i].textContent || cards[i].innerText;
        // ถ้ามีคำที่พิมพ์ค้นหา ให้โชว์ ถ้าไม่มีให้ซ่อน
        if (textContent.toLowerCase().indexOf(filter) > -1) {
            cards[i].style.display = ""; // แสดง
        } else {
            cards[i].style.display = "none"; // ซ่อน
        }
    }
}

// 1. แสดงข่าวหน้าแรก (จำกัด 4 รายการ เพื่อความสวยงามคู่กับเมนูด่วน)
export function renderHomeNews(newsList) {
    const container = document.getElementById('home-news-container');
    if (!container) return;
    container.innerHTML = '';
    
    if (!newsList || newsList.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 py-4 text-sm">ยังไม่มีข่าวประชาสัมพันธ์</p>';
        return;
    }
    
    // เรียงจาก ใหม่ -> เก่า (ID มากไปน้อย)
    const sortedNews = [...newsList].sort((a, b) => b.id - a.id);
    const limitNews = sortedNews.slice(0, 4); // ตัดเหลือ 4 อัน

    limitNews.forEach(news => {
        const dateStr = news.date ? new Date(news.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
        const cursorClass = (news.link && news.link !== '#') ? 'cursor-pointer hover:bg-gray-50' : '';
        
        const div = document.createElement('div');
        div.className = `border-b border-gray-100 pb-3 mb-2 last:border-0 last:mb-0 last:pb-0 ${cursorClass} transition rounded p-2 flex gap-3`;
        div.onclick = () => { if(news.link && news.link !== '#') window.open(news.link, '_blank'); };
        
        div.innerHTML = `
            <div class="flex-shrink-0 w-16 h-12 bg-gray-100 rounded-md overflow-hidden">
                ${news.image 
                    ? `<img src="${news.image}" class="w-full h-full object-cover">` 
                    : `<div class="w-full h-full flex items-center justify-center text-gray-300"><i class="fa-regular fa-image"></i></div>`
                }
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="text-sm font-bold text-gray-700 line-clamp-1">${news.title}</h4>
                <p class="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <i class="fa-regular fa-clock"></i> ${dateStr}
                </p>
            </div>
        `;
        container.appendChild(div);
    });
}

// 2. แสดงข่าวทั้งหมด
export function renderNews(newsList) {
    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = '';
    if (!newsList || newsList.length === 0) {
        container.innerHTML = '<div class="text-center p-10 bg-gray-50 rounded-xl text-gray-500">ไม่พบข่าวสาร</div>';
        return;
    }
    const sortedNews = [...newsList].sort((a, b) => b.id - a.id);

    sortedNews.forEach(news => {
        const dateStr = news.date ? new Date(news.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
        const linkTarget = (news.link && news.link !== '#') ? `href="${news.link}" target="_blank"` : 'href="javascript:void(0)" style="cursor: default;"';
        const div = document.createElement('div');
        div.className = "bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col md:flex-row gap-4";
        div.innerHTML = `
            <div class="md:w-1/4 flex-shrink-0">
                <div class="aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
                    ${news.image ? `<img src="${news.image}" class="w-full h-full object-cover hover:scale-105 transition duration-500">` : `<div class="w-full h-full flex items-center justify-center text-gray-400"><i class="fa-regular fa-image text-3xl"></i></div>`}
                </div>
            </div>
            <div class="flex-1 flex flex-col justify-between py-1">
                <div>
                    <a ${linkTarget} class="text-lg font-bold text-gray-800 hover:text-blue-600 transition line-clamp-2 mb-2">${news.title}</a>
                    <div class="text-sm text-gray-500 mb-3 flex items-center gap-2"><i class="fa-regular fa-calendar"></i> ${dateStr}</div>
                </div>
                <div class="text-right">
                     ${(news.link && news.link !== '#') ? `<a href="${news.link}" target="_blank" class="text-blue-600 text-sm font-bold hover:underline">อ่านต่อ <i class="fa-solid fa-arrow-right"></i></a>` : ''}
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// 3. แสดงข้อมูลโรงเรียน
export function renderSchoolInfo(dataList) {
    if (!dataList || dataList.length === 0) return;
    const info = dataList[0]; 

    // Hero Motto
    const mottoEl = document.getElementById('hero-motto');
    if(mottoEl && info.motto) mottoEl.innerText = info.motto;

    // School Age
    if (info.founding_date) {
        const founded = new Date(info.founding_date);
        const now = new Date();
        const age = now.getFullYear() - founded.getFullYear();
        const ageBadge = document.getElementById('school-age-badge');
        if(ageBadge) ageBadge.innerText = `ก่อตั้งมาแล้ว ${age} ปี`;
    }

    // Identity
    if(info.identity) {
        const idBadge = document.getElementById('school-identity');
        if(idBadge) {
            idBadge.innerText = info.identity;
            idBadge.classList.remove('hidden');
        }
    }

    // VTR
    const vtrContainer = document.getElementById('vtr-container');
    const vtrIframe = document.getElementById('vtr-iframe');
    if (info.vtr_url && vtrContainer && vtrIframe) {
        let videoId = '';
        if (info.vtr_url.includes('v=')) videoId = info.vtr_url.split('v=')[1].split('&')[0];
        else if (info.vtr_url.includes('youtu.be/')) videoId = info.vtr_url.split('youtu.be/')[1];
        
        if (videoId) {
            vtrIframe.src = `https://www.youtube.com/embed/${videoId}`;
            vtrContainer.classList.remove('hidden');
            const ph = document.getElementById('vtr-placeholder');
            if(ph) ph.style.display = 'none';
        }
    }

    // Colors
    const colorBox = document.getElementById('school-color-box');
    if(colorBox) {
        const c1 = info.color_code || '#ddd';
        const c2 = info.color_code_2 || c1;
        colorBox.style.background = `linear-gradient(to right, ${c1} 50%, ${c2} 50%)`;
        colorBox.style.border = '1px solid rgba(0,0,0,0.1)';
    }

    // Music
    const audio = document.getElementById('school-song');
    if (info.song_url && audio) {
        audio.src = info.song_url;
        const controls = document.getElementById('music-player-controls');
        if(controls) controls.classList.remove('hidden');
    }

    // History Content
    const histContent = document.getElementById('school-history-content');
    if(histContent) histContent.innerText = info.history || 'ยังไม่มีข้อมูลประวัติในระบบ';
    
    const missionContent = document.getElementById('school-mission-content');
    if(missionContent) missionContent.innerText = info.mission || '-';

    const identityContent = document.getElementById('school-identity-content');
    if(identityContent) identityContent.innerText = info.identity || '-';

    // Footer Socials
    const footerName = document.getElementById('footer-school-name');
    if(footerName && info.school_name) footerName.innerText = info.school_name;
    
    const socialContainer = document.getElementById('social-links-container');
    if(socialContainer) {
        let html = '';
        if(info.facebook) html += `<a href="${info.facebook}" target="_blank" class="text-slate-400 hover:text-blue-500 transition text-xl"><i class="fa-brands fa-facebook"></i></a>`;
        if(info.youtube) html += `<a href="${info.youtube}" target="_blank" class="text-slate-400 hover:text-red-500 transition text-xl"><i class="fa-brands fa-youtube"></i></a>`;
        socialContainer.innerHTML = html;
    }
}

// 4. แสดง Grid บุคลากร (คนแรกเดี่ยว, ที่เหลือ Grid 4)
export function renderPersonGrid(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (!data || data.length === 0) { container.innerHTML = '<p class="text-center text-gray-500 col-span-full">กำลังปรับปรุงข้อมูล</p>'; return; }

    // เรียง ID น้อย -> มาก (ID 1 มาก่อน)
    const sortedData = [...data].sort((a, b) => a.id - b.id);
    const leader = sortedData[0]; 
    const others = sortedData.slice(1);

    const createCard = (p) => `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-lg transition transform hover:-translate-y-1 h-full">
            <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 mb-4 shadow-inner bg-gray-200">
                ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : '<div class="w-full h-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-user text-4xl"></i></div>'}
            </div>
            <h3 class="text-lg font-bold text-gray-800 mb-1">${p.name}</h3>
            <p class="text-blue-600 font-medium text-sm">${p.role}</p>
        </div>
    `;

    let html = '';
    // ผอ./ประธาน
    if (leader) {
        html += `<div class="flex justify-center mb-8"><div class="w-full max-w-xs">${createCard(leader)}</div></div>`;
    }
    // คนอื่นๆ
    if (others.length > 0) {
        html += '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">';
        others.forEach(p => html += createCard(p));
        html += '</div>';
    }
    container.innerHTML = html;
}

// 5. แสดงประวัติ (Table)
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
        tr.innerHTML = `
            <td class="px-6 py-4 text-sm text-gray-500">${index + 1}</td>
            <td class="px-6 py-4"><div class="flex items-center"><div class="h-10 w-10 mr-4 bg-gray-200 rounded-full overflow-hidden">${item.image ? `<img class="h-10 w-10 object-cover" src="${item.image}">` : '<div class="h-full w-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-user"></i></div>'}</div><div class="text-sm font-medium text-gray-900">${item.name}</div></div></td>
            <td class="px-6 py-4 text-sm text-gray-500">${item.role || '-'}</td>
            <td class="px-6 py-4 text-sm text-gray-500">${timeStr}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 6. ผลงาน (Achievements) - แบบละเอียดครบ 8 ข้อ
function renderAchievements(containerId, data, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    
    if (!data || data.length === 0) { 
        container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400">ยังไม่มีข้อมูลผลงาน</div>'; 
        return; 
    }
    
    // เรียง ใหม่ -> เก่า
    const sortedData = [...data].sort((a, b) => b.id - a.id);

    sortedData.forEach(item => {
        const dateStr = item.date ? new Date(item.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
        const name = type === 'teacher' ? item.name : item.students;
        
        // เพิ่ม class 'achievement-card' เพื่อใช้ค้นหา
        const div = document.createElement('div');
        div.className = "achievement-card bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden border border-gray-100 flex flex-col h-full";
        div.innerHTML = `
            <div class="h-56 bg-gray-100 relative overflow-hidden group border-b cursor-pointer" onclick="window.open('${item.image || '#'}', '_blank')">
                 ${item.image 
                    ? `<img src="${item.image}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110">` 
                    : `<div class="w-full h-full flex items-center justify-center text-gray-300"><i class="fa-solid fa-certificate text-5xl"></i></div>`
                 }
                 ${item.level ? `<div class="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">${item.level}</div>` : ''}
            </div>
            <div class="p-5 flex-grow flex flex-col gap-2">
                <div>
                    <span class="text-[10px] font-bold tracking-wider text-gray-400 uppercase">${item.program || 'รายการทั่วไป'}</span>
                    <h4 class="font-bold text-gray-800 text-lg leading-tight mt-1 hover:text-blue-600 cursor-pointer" onclick="window.open('${item.image || '#'}', '_blank')">${item.title || '-'}</h4>
                </div>
                
                <div class="text-sm text-gray-600 space-y-1 mt-2">
                    <p class="flex items-start gap-2"><i class="fa-solid fa-user text-blue-500 mt-1"></i> <span class="font-medium">${name}</span></p>
                    <p class="flex items-start gap-2"><i class="fa-solid fa-book text-yellow-500 mt-1"></i> <span>${item.subject || '-'}</span></p>
                    ${item.organization ? `<p class="flex items-start gap-2"><i class="fa-solid fa-building text-gray-400 mt-1"></i> <span class="text-xs">${item.organization}</span></p>` : ''}
                </div>

                <div class="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                    <span><i class="fa-regular fa-calendar"></i> ${dateStr}</span>
                    ${item.image ? `<a href="${item.image}" target="_blank" class="text-blue-600 hover:underline">ดูเกียรติบัตร</a>` : ''}
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}
export function renderTeacherAchievements(data) { renderAchievements('teacher-achievements-container', data, 'teacher'); }
export function renderStudentAchievements(data) { renderAchievements('student-achievements-container', data, 'student'); }
export function renderSchoolAchievements(data) { renderAchievements('school-achievements-container', data, 'school'); }

// 7. นวัตกรรม
export function renderInnovations(data) {
    const container = document.getElementById('innovations-container');
    if (!container) return;
    container.innerHTML = '';
    if (!data || data.length === 0) { container.innerHTML = '<div class="col-span-full text-center text-gray-500">ไม่พบนวัตกรรม</div>'; return; }
    
    const sortedData = [...data].sort((a, b) => b.id - a.id);
    sortedData.forEach(item => {
        const div = document.createElement('div');
        div.className = "group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden";
        div.innerHTML = `
            <div class="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                ${item.coverImageUrl ? `<img src="${item.coverImageUrl}" class="w-full h-full object-cover transition duration-700 group-hover:scale-110">` : `<div class="w-full h-full flex items-center justify-center text-blue-200"><i class="fa-solid fa-lightbulb text-5xl"></i></div>`}
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                     ${item.fileUrl ? `<a href="${item.fileUrl}" target="_blank" class="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm font-bold shadow-lg w-full text-center transform translate-y-4 group-hover:translate-y-0 transition duration-300">เปิดดูผลงาน</a>` : ''}
                </div>
            </div>
            <div class="p-5">
                <div class="flex items-center gap-2 mb-2">
                    <span class="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-md">${item.subject || 'ทั่วไป'}</span>
                    <span class="text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded-md">${item.class || '-'}</span>
                </div>
                <h3 class="font-bold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition">${item.title}</h3>
                <p class="text-sm text-gray-500 flex items-center gap-2"><i class="fa-solid fa-user-pen"></i> ${item.creator || 'คณะผู้จัดทำ'}</p>
            </div>
        `;
        container.appendChild(div);
    });
}

// 8. เอกสาร
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
        div.innerHTML = `
            <div class="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-2xl group-hover:bg-blue-50 transition"><i class="fa-solid ${icon}"></i></div>
            <div class="flex-1">
                <h4 class="font-bold text-gray-700 group-hover:text-blue-600 transition">${doc.title}</h4>
                <div class="flex gap-3 text-xs text-gray-400 mt-1"><span><i class="fa-regular fa-calendar"></i> ${dateStr}</span><span><i class="fa-solid fa-tag"></i> ${doc.category || 'ทั่วไป'}</span></div>
            </div>
            <div class="text-gray-300 group-hover:text-blue-500"><i class="fa-solid fa-download"></i></div>
        `;
        container.appendChild(div);
    });
}

// 9. กราฟข้อมูลนักเรียน
export function renderStudentChart(data) {
    const container = document.getElementById('student-summary-container');
    const chartCanvas = document.getElementById('studentChart');
    if (!data || data.length === 0) { if(container) container.innerHTML = '<p class="text-center text-gray-400 col-span-3">ยังไม่มีข้อมูลนักเรียน</p>'; return; }

    data.sort((a, b) => a.id - b.id);
    let totalMale = 0, totalFemale = 0;
    data.forEach(d => { totalMale += parseInt(d.male || 0); totalFemale += parseInt(d.female || 0); });

    if (container) {
        container.innerHTML = `
            <div class="bg-blue-100 p-4 rounded-xl text-center border border-blue-200"><h3 class="text-blue-800 font-bold text-lg">ทั้งหมด</h3><p class="text-3xl font-bold text-blue-600">${totalMale + totalFemale} <span class="text-sm">คน</span></p></div>
            <div class="bg-green-100 p-4 rounded-xl text-center border border-green-200"><h3 class="text-green-800 font-bold text-lg">ชาย</h3><p class="text-3xl font-bold text-green-600">${totalMale} <span class="text-sm">คน</span></p></div>
            <div class="bg-pink-100 p-4 rounded-xl text-center border border-pink-200"><h3 class="text-pink-800 font-bold text-lg">หญิง</h3><p class="text-3xl font-bold text-pink-600">${totalFemale} <span class="text-sm">คน</span></p></div>
        `;
    }

    if (chartCanvas) {
        if (window.myStudentChart) window.myStudentChart.destroy();
        window.myStudentChart = new Chart(chartCanvas, {
            type: 'bar',
            data: {
                labels: data.map(d => d.grade),
                datasets: [ { label: 'ชาย', data: data.map(d => d.male), backgroundColor: '#3b82f6', borderRadius: 4 }, { label: 'หญิง', data: data.map(d => d.female), backgroundColor: '#ec4899', borderRadius: 4 } ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
                plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'แผนภูมิแสดงจำนวนนักเรียนแยกตามระดับชั้น' } }
            }
        });
    }
}

export function setupDropdowns() {}
export function setupModal() {}
export function closeAllDropdowns() { document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden')); }
