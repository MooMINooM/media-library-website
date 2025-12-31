// js/ui.js - จัดการการแสดงผลหน้าเว็บทั้งหมด

// 1. ฟังก์ชันแสดงข่าวหน้าแรก (Latest News)
export function renderHomeNews(newsList) {
    const container = document.getElementById('home-news-container');
    if (!container) return;
    
    container.innerHTML = '';
    if (!newsList || newsList.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 py-4">ยังไม่มีข่าวประชาสัมพันธ์</p>';
        return;
    }

    // เอาแค่ 5 ข่าวล่าสุด
    const limitNews = newsList.slice(0, 5);

    limitNews.forEach(news => {
        const dateStr = news.date ? new Date(news.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
        
        // ถ้ามี Link ให้กดแล้วไป ถ้าไม่มีให้เป็น #
        const linkUrl = (news.link && news.link !== '#') ? news.link : 'javascript:void(0)';
        const cursorClass = (news.link && news.link !== '#') ? 'cursor-pointer hover:bg-gray-50' : '';

        const div = document.createElement('div');
        div.className = `border-b border-gray-100 pb-3 mb-3 last:border-0 ${cursorClass} transition rounded p-2`;
        div.onclick = () => { if(news.link && news.link !== '#') window.open(news.link, '_blank'); };
        
        div.innerHTML = `
            <div class="flex justify-between items-start gap-2">
                <div class="flex-1">
                    <h4 class="text-sm font-bold text-gray-700 line-clamp-2">${news.title}</h4>
                    <p class="text-xs text-gray-400 mt-1"><i class="fa-regular fa-clock"></i> ${dateStr}</p>
                </div>
                ${news.image ? `<img src="${news.image}" class="w-16 h-12 object-cover rounded-md bg-gray-200">` : ''}
            </div>
        `;
        container.appendChild(div);
    });
}

// 2. ฟังก์ชันแสดงข่าวหน้าหลัก (All News) - ✅ จุดที่แก้ไขให้คุณ
export function renderNews(newsList) {
    const container = document.getElementById('news-container');
    if (!container) return;
    
    container.innerHTML = '';
    if (!newsList || newsList.length === 0) {
        container.innerHTML = '<div class="text-center p-10 bg-gray-50 rounded-xl text-gray-500">ไม่พบข่าวสาร</div>';
        return;
    }

    newsList.forEach(news => {
        const dateStr = news.date ? new Date(news.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
        const linkTarget = (news.link && news.link !== '#') ? `href="${news.link}" target="_blank"` : 'href="javascript:void(0)" style="cursor: default;"';

        const div = document.createElement('div');
        div.className = "bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col md:flex-row gap-4";
        
        div.innerHTML = `
            <div class="md:w-1/4 flex-shrink-0">
                <div class="aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
                    ${news.image 
                        ? `<img src="${news.image}" class="w-full h-full object-cover hover:scale-105 transition duration-500" alt="${news.title}">`
                        : `<div class="w-full h-full flex items-center justify-center text-gray-400"><i class="fa-regular fa-image text-3xl"></i></div>`
                    }
                </div>
            </div>
            <div class="flex-1 flex flex-col justify-between py-1">
                <div>
                    <a ${linkTarget} class="text-lg font-bold text-gray-800 hover:text-blue-600 transition line-clamp-2 mb-2">
                        ${news.title}
                    </a>
                    <div class="text-sm text-gray-500 mb-3 flex items-center gap-2">
                        <i class="fa-regular fa-calendar"></i> ${dateStr}
                    </div>
                </div>
                <div class="text-right">
                     ${(news.link && news.link !== '#') 
                        ? `<a href="${news.link}" target="_blank" class="text-blue-600 text-sm font-bold hover:underline">อ่านต่อ <i class="fa-solid fa-arrow-right"></i></a>` 
                        : ''}
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// 3. ฟังก์ชันแสดงบุคลากร (Personnel List)
export function renderPersonnelList(data) {
    const container = document.getElementById('personnel-list-container');
    if (!container) return;
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">กำลังปรับปรุงข้อมูล</p>';
        return;
    }

    // เรียงตาม ID (สมมติว่า ผอ. id=1)
    const sortedData = [...data].sort((a, b) => a.id - b.id);

    // แยก ผอ. ออกมาแสดงเด่นๆ (ถ้ามี)
    const directors = sortedData.filter(p => p.role && p.role.includes('ผู้อำนวยการ'));
    const others = sortedData.filter(p => !p.role || !p.role.includes('ผู้อำนวยการ'));

    // Helper สร้าง Card
    const createCard = (p, isDirector = false) => `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-lg transition transform hover:-translate-y-1 ${isDirector ? 'border-blue-200 bg-blue-50/30' : ''}">
            <div class="w-32 h-32 rounded-full overflow-hidden border-4 ${isDirector ? 'border-blue-200' : 'border-gray-100'} mb-4 shadow-inner bg-gray-200">
                ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover" alt="${p.name}">` : '<div class="w-full h-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-user text-4xl"></i></div>'}
            </div>
            <h3 class="text-lg font-bold text-gray-800 mb-1">${p.name}</h3>
            <p class="text-blue-600 font-medium text-sm">${p.role}</p>
        </div>
    `;

    // แสดงผล
    let html = '';
    
    if (directors.length > 0) {
        html += '<div class="flex justify-center mb-10 gap-6 flex-wrap">';
        directors.forEach(d => html += createCard(d, true));
        html += '</div>';
    }

    if (others.length > 0) {
        html += '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">';
        others.forEach(p => html += createCard(p));
        html += '</div>';
    }

    container.innerHTML = html;
}

// 4. ฟังก์ชันแสดงตารางประวัติ (ผู้บริหาร/บุคลากร)
export function renderHistoryTable(tbodyId, data) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-500">ไม่มีข้อมูล</td></tr>';
        return;
    }

    data.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        // เช็คว่ามีคอลัมน์ไหนบ้าง (Director ใช้ start_date/end_date, Personnel ใช้ year)
        const timeStr = item.year || `${item.start_date || '-'} ถึง ${item.end_date || 'ปัจจุบัน'}`;
        
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${index + 1}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0 mr-4 bg-gray-200 rounded-full overflow-hidden">
                         ${item.image ? `<img class="h-10 w-10 object-cover" src="${item.image}" alt="">` : '<div class="h-full w-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-user"></i></div>'}
                    </div>
                    <div class="text-sm font-medium text-gray-900">${item.name}</div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.role || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${timeStr}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 5. ฟังก์ชันแสดงผลงาน (ครู/นักเรียน/โรงเรียน) - ใช้ Template เดียวกัน
function renderAchievements(containerId, data, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400">ยังไม่มีข้อมูลผลงาน</div>';
        return;
    }

    data.forEach(item => {
        const dateStr = item.date ? new Date(item.date).toLocaleDateString('th-TH', { month: 'short', year: 'numeric' }) : '';
        const subtitle = type === 'teacher' ? (item.level || '') : (item.students || item.date || '');
        
        const div = document.createElement('div');
        div.className = "bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 flex flex-col";
        div.innerHTML = `
            <div class="h-48 bg-gray-100 relative overflow-hidden group">
                 ${item.image 
                    ? `<img src="${item.image}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110">` 
                    : `<div class="w-full h-full flex items-center justify-center text-gray-300"><i class="fa-solid fa-trophy text-4xl"></i></div>`
                 }
                 ${dateStr ? `<div class="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold shadow-sm">${dateStr}</div>` : ''}
            </div>
            <div class="p-4 flex-grow flex flex-col">
                <h4 class="font-bold text-gray-800 mb-1 line-clamp-2">${item.title || item.project || item.name}</h4>
                <p class="text-sm text-gray-500 mb-2">${subtitle}</p>
                <div class="mt-auto pt-2 border-t border-gray-50 text-xs text-blue-600 font-semibold">
                    ${type === 'teacher' ? item.name : (type === 'student' ? (item.subject || 'วิชาการ') : 'โรงเรียน')}
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// Wrapper Functions สำหรับแต่ละหน้า
export function renderTeacherAchievements(data) { renderAchievements('teacher-achievements-container', data, 'teacher'); }
export function renderStudentAchievements(data) { renderAchievements('student-achievements-container', data, 'student'); }
export function renderSchoolAchievements(data) { renderAchievements('school-achievements-container', data, 'school'); }


// 6. ฟังก์ชันแสดงนวัตกรรม
export function renderInnovations(data) {
    const container = document.getElementById('innovations-container');
    if (!container) return;
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-500">ไม่พบนวัตกรรม</div>';
        return;
    }

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = "group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden";
        div.innerHTML = `
            <div class="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                ${item.coverImageUrl 
                    ? `<img src="${item.coverImageUrl}" class="w-full h-full object-cover transition duration-700 group-hover:scale-110">`
                    : `<div class="w-full h-full flex items-center justify-center text-blue-200"><i class="fa-solid fa-lightbulb text-5xl"></i></div>`
                }
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
                <p class="text-sm text-gray-500 flex items-center gap-2">
                    <i class="fa-solid fa-user-pen"></i> ${item.creator || 'คณะผู้จัดทำ'}
                </p>
            </div>
        `;
        container.appendChild(div);
    });
}

// 7. ฟังก์ชันแสดงเอกสาร (Documents & Forms)
export function renderDocuments(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">ไม่พบเอกสาร</div>';
        return;
    }

    data.forEach(doc => {
        const dateStr = doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('th-TH') : '-';
        const icon = doc.title.includes('PDF') ? 'fa-file-pdf text-red-500' : (doc.title.includes('Word') ? 'fa-file-word text-blue-500' : 'fa-file-lines text-gray-500');
        
        const div = document.createElement('div');
        div.className = "flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition group cursor-pointer";
        div.onclick = () => { if(doc.fileUrl) window.open(doc.fileUrl, '_blank'); };
        
        div.innerHTML = `
            <div class="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-2xl group-hover:bg-blue-50 transition">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-gray-700 group-hover:text-blue-600 transition">${doc.title}</h4>
                <div class="flex gap-3 text-xs text-gray-400 mt-1">
                    <span><i class="fa-regular fa-calendar"></i> ${dateStr}</span>
                    <span><i class="fa-solid fa-tag"></i> ${doc.category || 'ทั่วไป'}</span>
                </div>
            </div>
            <div class="text-gray-300 group-hover:text-blue-500">
                <i class="fa-solid fa-download"></i>
            </div>
        `;
        container.appendChild(div);
    });
}

// 8. Setup ต่างๆ (Dropdown, Modal)
export function setupDropdowns() { /* ...Logic Dropdown เดิม... */ }
export function setupModal() { /* ...Logic Modal เดิม... */ }
export function closeAllDropdowns() { document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden')); }
