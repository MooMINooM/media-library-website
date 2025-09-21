// This file is responsible for all UI updates and rendering.

import { STATIC_STUDENT_COUNCIL_DATA, STATIC_SCHOOL_BOARD_DATA, STATIC_STUDENT_DATA } from './data.js';

let studentChartInstance = null;

// --- UTILITY FUNCTION ---
function getDirectGoogleDriveUrl(url) {
    if (!url || !url.includes('drive.google.com')) return url;
    try {
        const parts = url.split('/');
        const idIndex = parts.findIndex(part => part === 'd') + 1;
        if (idIndex > 0 && idIndex < parts.length) {
            const fileId = parts[idIndex];
            return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
        return url;
    } catch (e) { return url; }
}

// --- DROPDOWN & MODAL SETUP ---
export function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllDropdowns(menu);
            menu.classList.toggle('hidden');
        });
    });
    window.addEventListener('click', () => closeAllDropdowns());
}

export function closeAllDropdowns(exceptMenu = null) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu !== exceptMenu) menu.classList.add('hidden');
    });
}

export function setupModal() {
    const modal = document.getElementById('detail-modal');
    const closeBtn = document.getElementById('detail-modal-close-btn');
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        document.getElementById('detail-modal-content').innerHTML = ''; 
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            document.getElementById('detail-modal-content').innerHTML = '';
        }
    });
}

// --- RENDER FUNCTIONS ---

export function renderHomeNews(newsList) {
    const container = document.getElementById('home-news-container');
    if (!container) return;
    
    container.innerHTML = '';

    if (!newsList || newsList.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">ยังไม่มีข่าวประชาสัมพันธ์</p>';
        return;
    }

    const latestNews = [...newsList]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    latestNews.forEach(news => {
        const hasLink = news.link && news.link.trim() !== '#' && news.link.trim() !== '';
        const newsElement = document.createElement(hasLink ? 'a' : 'div');

        if (hasLink) {
            newsElement.href = news.link;
            newsElement.target = '_blank';
            newsElement.rel = 'noopener noreferrer';
        }

        newsElement.className = 'block p-3 rounded-md hover:bg-gray-100 transition-colors duration-200';
        
        newsElement.innerHTML = `
            <div class="flex justify-between items-start gap-4">
                <p class="font-semibold text-blue-800 ${hasLink ? 'hover:text-blue-600' : ''}">${news.title || 'ไม่มีหัวข้อ'}</p>
                <p class="text-sm text-gray-500 whitespace-nowrap">${news.date || ''}</p>
            </div>
        `;
        container.appendChild(newsElement);
    });
}


export function renderPersonnelList(personnelList) {
    const container = document.getElementById('personnel-list-container');
    const loadingEl = document.getElementById('personnel-loading');
    if(loadingEl) loadingEl.classList.add('hidden');
    if(!container) return;
    container.innerHTML = '';
    
    if (!personnelList || personnelList.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-full">ไม่พบข้อมูลบุคลากร</p>';
        return;
    }
    const createCard = (person, index, isDirector = false) => {
        const cardItem = document.createElement('div');
        const cardWidth = isDirector ? 'max-w-xs' : '';
        cardItem.className = `personnel-card bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col items-center p-4 text-center ${cardWidth}`;
        cardItem.dataset.index = index;
        const finalImageUrl = getDirectGoogleDriveUrl(person.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
        const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
        const imageSize = isDirector ? 'w-32 h-32' : 'w-24 h-24';
        const nameSize = isDirector ? 'text-lg' : 'text-md';
        cardItem.innerHTML = `<img src="${finalImageUrl}" alt="รูปภาพของ ${person.name}" class="${imageSize} rounded-full object-cover border-4 border-gray-200" onerror="this.onerror=null; this.src='${errorImageUrl}';"><div class="mt-2"><h4 class="font-bold text-blue-800 ${nameSize}">${person.name || 'N/A'}</h4><p class="text-sm text-gray-600">${person.role || '-'}</p><p class="text-xs text-gray-500 mt-1">${person.academicStanding || ''}</p></div>`;
        return cardItem;
    };
    const director = personnelList[0];
    if (director) {
        const directorContainer = document.createElement('div');
        directorContainer.className = 'flex justify-center mb-8';
        directorContainer.appendChild(createCard(director, 0, true));
        container.appendChild(directorContainer);
    }
    const otherPersonnel = personnelList.slice(1);
    if (otherPersonnel.length > 0) {
        const othersContainer = document.createElement('div');
        othersContainer.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mt-8 border-t pt-6';
        otherPersonnel.forEach((person, index) => {
            othersContainer.appendChild(createCard(person, index + 1));
        });
        container.appendChild(othersContainer);
    }
}

export function showPersonnelModal(person) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('detail-modal-content');
    const imageUrl = getDirectGoogleDriveUrl(person.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
    const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
    const educationList = person.education ? person.education.split('\n').map(edu => `<div>${edu.trim()}</div>`).join('') : '-';
    modalContent.innerHTML = `<div class="p-6"><div class="text-center"><img src="${imageUrl}" alt="รูปภาพของ ${person.name}" class="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200 shadow-lg" onerror="this.onerror=null; this.src='${errorImageUrl}';"><h3 class="text-2xl font-bold text-blue-800">${person.name || 'N/A'}</h3><p class="text-gray-600 text-lg">${person.role || '-'}</p><p class="text-md text-gray-500 mt-1">${person.academicStanding || ''}</p></div><hr class="my-4"><div class="text-sm text-left grid grid-cols-[auto_1fr] gap-x-4 items-start"><strong class="text-gray-600 text-right">วุฒิการศึกษา:</strong><div class="text-gray-500">${educationList}</div><strong class="text-gray-600 text-right">ห้องประจำชั้น:</strong><span class="text-gray-500">${person.class || '-'}</span><strong class="text-gray-600 text-right">โทร:</strong><span class="text-gray-500">${person.tel || '-'}</span></div></div>`;
    modal.classList.remove('hidden');
}

export function renderStudentChart() {
    const studentList = STATIC_STUDENT_DATA;
    const loadingEl = document.getElementById('students-loading');
    const summaryContainer = document.getElementById('student-summary-container');
    const ctx = document.getElementById('studentChart')?.getContext('2d');
    if(loadingEl) loadingEl.classList.add('hidden');
    if (!summaryContainer || !ctx) return;
    summaryContainer.innerHTML = '';
    if (!studentList || studentList.length === 0) {
        summaryContainer.innerHTML = '<p class="text-center text-gray-500 col-span-full">ไม่พบข้อมูลนักเรียน</p>';
        return;
    }
    const labels = studentList.map(s => s.grade || '');
    const boysData = studentList.map(s => parseInt(s.boys) || 0);
    const girlsData = studentList.map(s => parseInt(s.girls) || 0);
    const totalData = studentList.map(s => parseInt(s.total) || 0);
    const totalBoys = boysData.reduce((sum, count) => sum + count, 0);
    const totalGirls = girlsData.reduce((sum, count) => sum + count, 0);
    const grandTotal = totalBoys + totalGirls;
    summaryContainer.innerHTML = `<div class="bg-blue-50 p-4 rounded-lg shadow"><h3 class="text-xl font-bold text-blue-800">${totalBoys.toLocaleString()}</h3><p class="text-sm text-blue-600">นักเรียนชาย</p></div><div class="bg-pink-50 p-4 rounded-lg shadow"><h3 class="text-xl font-bold text-pink-800">${totalGirls.toLocaleString()}</h3><p class="text-sm text-pink-600">นักเรียนหญิง</p></div><div class="bg-gray-100 p-4 rounded-lg shadow"><h3 class="text-xl font-bold text-gray-800">${grandTotal.toLocaleString()}</h3><p class="text-sm text-gray-600">นักเรียนทั้งหมด</p></div>`;
    if (studentChartInstance) {
        studentChartInstance.destroy();
    }
    studentChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'นักเรียนชาย', data: boysData, backgroundColor: 'rgba(59, 130, 246, 0.7)', borderColor: 'rgba(59, 130, 246, 1)', borderWidth: 1 },
                { label: 'นักเรียนหญิง', data: girlsData, backgroundColor: 'rgba(236, 72, 153, 0.7)', borderColor: 'rgba(236, 72, 153, 1)', borderWidth: 1 },
                { label: 'รวม', data: totalData, backgroundColor: 'rgba(107, 114, 128, 0.7)', borderColor: 'rgba(107, 114, 128, 1)', borderWidth: 1 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, title: { display: true, text: 'จำนวนนักเรียน (คน)' } }, x: { title: { display: true, text: 'ระดับชั้น' } } },
            plugins: { legend: { position: 'top' }, title: { display: true, text: 'จำนวนนักเรียนแยกตามเพศและระดับชั้น' } }
        }
    });
}

export function renderStudentCouncilList() {
    const container = document.getElementById('student-council-container');
    const loadingEl = document.getElementById('student-council-loading');
    if(loadingEl) loadingEl.classList.add('hidden');
    if(!container) return;
    container.innerHTML = '';
    const boardData = STATIC_STUDENT_COUNCIL_DATA;
    if (!boardData || boardData.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">ไม่พบข้อมูลคณะกรรมการสภานักเรียน</p>';
        return;
    }
    const createCard = (member, index, isPresident = false) => {
        const cardItem = document.createElement('div');
        const cardWidth = isPresident ? 'max-w-xs' : '';
        cardItem.className = `student-council-card bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col items-center p-4 text-center ${cardWidth}`;
        cardItem.dataset.index = index;
        const finalImageUrl = getDirectGoogleDriveUrl(member.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
        const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
        const imageSize = isPresident ? 'w-32 h-32' : 'w-24 h-24';
        const nameSize = isPresident ? 'text-lg' : 'text-md';
        cardItem.innerHTML = `<img src="${finalImageUrl}" alt="รูปภาพของ ${member.name}" class="${imageSize} rounded-full object-cover border-4 border-gray-200" onerror="this.onerror=null; this.src='${errorImageUrl}';"><div class="mt-2"><h4 class="font-bold text-blue-800 ${nameSize}">${member.name || 'N/A'}</h4><p class="text-sm text-gray-600">${member.role || '-'}</p><p class="text-xs text-gray-500 mt-1">${member.class || ''}</p></div>`;
        return cardItem;
    };
    const president = boardData[0];
    if (president) {
        const presidentContainer = document.createElement('div');
        presidentContainer.className = 'flex justify-center mb-8';
        presidentContainer.appendChild(createCard(president, 0, true));
        container.appendChild(presidentContainer);
    }
    const otherMembers = boardData.slice(1);
    if (otherMembers.length > 0) {
        const othersContainer = document.createElement('div');
        othersContainer.className = 'grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 border-t pt-6';
        otherMembers.forEach((member, index) => {
            othersContainer.appendChild(createCard(member, index + 1));
        });
        container.appendChild(othersContainer);
    }
}
export function showStudentCouncilModal(member) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('detail-modal-content');
    const imageUrl = getDirectGoogleDriveUrl(member.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
    const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
    modalContent.innerHTML = `<div class="p-6"><div class="text-center"><img src="${imageUrl}" alt="รูปภาพของ ${member.name}" class="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200 shadow-lg" onerror="this.onerror=null; this.src='${errorImageUrl}';"><h3 class="text-2xl font-bold text-blue-800">${member.name || 'N/A'}</h3><p class="text-gray-600 text-lg">${member.role || '-'}</p><p class="text-md text-gray-500 mt-1">${member.class || ''}</p></div></div>`;
    modal.classList.remove('hidden');
}

export function renderSchoolBoardList() {
    const container = document.getElementById('school-board-container');
    const loadingEl = document.getElementById('school-board-loading');
    if(loadingEl) loadingEl.classList.add('hidden');
    if(!container) return;
    container.innerHTML = '';
    const boardData = STATIC_SCHOOL_BOARD_DATA;
    if (!boardData || boardData.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">ไม่พบข้อมูลคณะกรรมการสถานศึกษา</p>';
        return;
    }
    const createCard = (member, index, isPresident = false) => {
        const cardItem = document.createElement('div');
        const cardWidth = isPresident ? 'max-w-xs' : '';
        cardItem.className = `school-board-card bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col items-center p-4 text-center ${cardWidth}`;
        cardItem.dataset.index = index;
        const finalImageUrl = getDirectGoogleDriveUrl(member.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
        const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
        const imageSize = isPresident ? 'w-32 h-32' : 'w-24 h-24';
        const nameSize = isPresident ? 'text-lg' : 'text-md';
        cardItem.innerHTML = `<img src="${finalImageUrl}" alt="รูปภาพของ ${member.name}" class="${imageSize} rounded-full object-cover border-4 border-gray-200" onerror="this.onerror=null; this.src='${errorImageUrl}';"><div class="mt-2"><h4 class="font-bold text-blue-800 ${nameSize}">${member.name || 'N/A'}</h4><p class="text-sm text-gray-600">${member.role || '-'}</p></div>`;
        return cardItem;
    };
    const president = boardData[0];
    if (president) {
        const presidentContainer = document.createElement('div');
        presidentContainer.className = 'flex justify-center mb-8';
        presidentContainer.appendChild(createCard(president, 0, true));
        container.appendChild(presidentContainer);
    }
    const otherMembers = boardData.slice(1);
    if (otherMembers.length > 0) {
        const othersContainer = document.createElement('div');
        othersContainer.className = 'grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 border-t pt-6';
        otherMembers.forEach((member, index) => {
            othersContainer.appendChild(createCard(member, index + 1));
        });
        container.appendChild(othersContainer);
    }
}
export function showSchoolBoardModal(member) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('detail-modal-content');
    const imageUrl = getDirectGoogleDriveUrl(member.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
    const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
    modalContent.innerHTML = `<div class="p-6"><div class="text-center"><img src="${imageUrl}" alt="รูปภาพของ ${member.name}" class="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200 shadow-lg" onerror="this.onerror=null; this.src='${errorImageUrl}';"><h3 class="text-2xl font-bold text-blue-800">${member.name || 'N/A'}</h3><p class="text-gray-600 text-lg">${member.role || '-'}</p></div></div>`;
    modal.classList.remove('hidden');
}

export function renderHistoryTable(tbodyId, data) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 5;
        td.className = 'px-6 py-4 text-center text-gray-500';
        td.textContent = 'ไม่พบข้อมูล';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.no || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.name || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.position || '-'}</p>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.start || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.end || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

export function setupHistorySearch(inputId, tbodyId, allData) {
    const searchInput = document.getElementById(inputId);
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();

        if (!searchTerm) {
            renderHistoryTable(tbodyId, allData);
            return;
        }

        const filteredData = allData.filter(item => {
            const name = (item.name || '').toLowerCase();
            const position = (item.position || '').toLowerCase();
            return name.includes(searchTerm) || position.includes(searchTerm);
        });

        renderHistoryTable(tbodyId, filteredData);
    });
}


export function renderTeacherAchievements(achievementsList) {
    const container = document.getElementById('teacher-achievements-container');
    const loadingEl = document.getElementById('teacher-achievements-loading');
    if(loadingEl) loadingEl.classList.add('hidden');
    if(!container) return;
    container.innerHTML = '';
    if (!achievementsList || achievementsList.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-full">ไม่พบข้อมูลผลงานครู</p>';
        return;
    }
    achievementsList.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'teacher-achievement-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-slate-200 flex flex-col cursor-pointer';
        card.dataset.index = index;

        const finalImageUrl = getDirectGoogleDriveUrl(item.imageUrl) || `https://placehold.co/600x400/BFDBFE/1E3A8A?text=${encodeURIComponent(item.name || 'ผลงานครู')}`;
        const errorImageUrl = 'https://placehold.co/600x400/FEE2E2/DC2626?text=Image%20Error';
        
        card.innerHTML = `
            <img 
                src="${finalImageUrl}" 
                alt="รูปภาพผลงาน ${item.project}" 
                class="w-full h-40 object-cover pointer-events-none"
                onerror="this.onerror=null; this.src='${errorImageUrl}';"
            >
            <div class="p-4 flex flex-col flex-grow pointer-events-none">
                <h4 class="font-bold text-slate-800 text-lg">${item.name || '-'}</h4>
                <p class="text-sm text-slate-600 mt-1 flex-grow">${item.project || '-'}</p>
                <p class="text-xs text-slate-400 mt-2 text-right">${item.date || ''}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

export function showTeacherAchievementModal(item) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('detail-modal-content');
    if (!modal || !modalContent) return;

    const finalImageUrl = getDirectGoogleDriveUrl(item.imageUrl) || 'https://placehold.co/600x400/BFDBFE/1E3A8A?text=ผลงานครู';
    const errorImageUrl = 'https://placehold.co/600x400/FEE2E2/DC2626?text=Image%20Error';

    modalContent.innerHTML = `
        <div>
            <img 
                src="${finalImageUrl}" 
                alt="รูปภาพผลงาน ${item.project}" 
                class="w-full h-64 object-cover rounded-t-lg bg-slate-100"
                onerror="this.onerror=null; this.src='${errorImageUrl}';"
            >
            <div class="p-6">
                <h3 class="text-2xl font-bold text-slate-800">${item.name || 'ไม่มีชื่อ'}</h3>
                <p class="text-md text-slate-600 mt-1">${item.project || 'ไม่มีชื่อผลงาน'}</p>
                <div class="mt-4 border-t pt-4 text-slate-700 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-start">
                    <strong class="text-right text-slate-500">ได้รับจาก:</strong>
                    <span>${item.awardedBy || '-'}</span>
                    <strong class="text-right text-slate-500">วันที่:</strong>
                    <span>${item.date || '-'}</span>
                </div>
                <p class="text-slate-600 mt-4">${item.description || ''}</p>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
}


export function renderStudentAchievements(achievementsList) {
    const container = document.getElementById('student-achievements-container');
    const loadingEl = document.getElementById('student-achievements-loading');
    if (!container || !loadingEl) return;

    if(loadingEl) loadingEl.classList.add('hidden');
    container.innerHTML = '';

    if (!achievementsList || achievementsList.length === 0) {
        container.innerHTML = '<p class="text-center text-slate-500 col-span-full">ไม่พบข้อมูลผลงานนักเรียน</p>';
        return;
    }

    achievementsList.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'student-achievement-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-slate-200 cursor-pointer';
        card.dataset.index = index;
        
        const finalImageUrl = getDirectGoogleDriveUrl(item.imageUrl) || 'https://placehold.co/600x400/FEF9C3/854D0E?text=ผลงานนักเรียน';
        const errorImageUrl = 'https://placehold.co/600x400/FEE2E2/DC2626?text=Image%20Error';

        card.innerHTML = `
            <img 
                src="${finalImageUrl}" 
                alt="รูปภาพผลงาน ${item.title}" 
                class="w-full h-48 object-cover pointer-events-none"
                onerror="this.onerror=null; this.src='${errorImageUrl}';"
            >
            <div class="p-4 pointer-events-none">
                <p class="text-sm font-semibold text-amber-600">${item.level || 'ระดับ'}</p>
                <h4 class="font-bold text-slate-800 text-lg mt-1">${item.title || '-'}</h4>
                <p class="text-sm text-slate-600 mt-2">โดย: ${item.students || '-'}</p>
                <p class="text-xs text-slate-400 mt-2">วันที่: ${item.date || '-'}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

export function showStudentAchievementModal(item) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('detail-modal-content');
    if (!modal || !modalContent) return;

    const finalImageUrl = getDirectGoogleDriveUrl(item.imageUrl) || 'https://placehold.co/600x400/FEF9C3/854D0E?text=ผลงานนักเรียน';
    const errorImageUrl = 'https://placehold.co/600x400/FEE2E2/DC2626?text=Image%20Error';

    modalContent.innerHTML = `
        <div>
            <img 
                src="${finalImageUrl}" 
                alt="รูปภาพผลงาน ${item.title}" 
                class="w-full h-64 object-cover rounded-t-lg bg-slate-100"
                onerror="this.onerror=null; this.src='${errorImageUrl}';"
            >
            <div class="p-6">
                <p class="text-sm font-semibold text-amber-600">${item.level || 'ระดับ'}</p>
                <h3 class="text-2xl font-bold text-slate-800 mt-1">${item.title || 'ไม่มีชื่อเรื่อง'}</h3>
                <div class="mt-4 border-t pt-4 text-slate-700 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-start">
                    <strong class="text-right text-slate-500">นักเรียน:</strong>
                    <span>${item.students || '-'}</span>
                    <strong class="text-right text-slate-500">ครูผู้ดูแล:</strong>
                    <span>${item.teacher || '-'}</span>
                    <strong class="text-right text-slate-500">วันที่:</strong>
                    <span>${item.date || '-'}</span>
                </div>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
}


export function renderSchoolAchievements(achievementsList) {
    const container = document.getElementById('school-achievements-container');
    const loadingEl = document.getElementById('school-achievements-loading');
    if (!container || !loadingEl) return;

    loadingEl.classList.add('hidden');
    container.innerHTML = '';

    if (!achievementsList || achievementsList.length === 0) {
        container.innerHTML = '<p class="text-center text-slate-500 col-span-full">ไม่พบข้อมูลผลงานสถานศึกษา</p>';
        return;
    }

    achievementsList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-slate-200 flex flex-col';
        
        const finalImageUrl = getDirectGoogleDriveUrl(item.imageUrl) || 'https://placehold.co/600x400/C7D2FE/312E81?text=ผลงานสถานศึกษา';
        const errorImageUrl = 'https://placehold.co/600x400/FEE2E2/DC2626?text=Image%20Error';

        card.innerHTML = `
            <img 
                src="${finalImageUrl}" 
                alt="รูปภาพผลงาน ${item.title}" 
                class="w-full h-48 object-cover"
                onerror="this.onerror=null; this.src='${errorImageUrl}';"
            >
            <div class="p-4 flex flex-col flex-grow">
                <h4 class="font-bold text-slate-800 text-lg">${item.title || '-'}</h4>
                <p class="text-sm text-slate-500 mt-1">ได้รับจาก: ${item.awardedBy || '-'}</p>
                <p class="text-slate-600 mt-3 text-sm flex-grow">${item.description || ''}</p>
                <p class="text-xs text-slate-400 mt-3 text-right">วันที่: ${item.date || '-'}</p>
            </div>
        `;
        container.appendChild(card);
    });
}


export function renderNews(newsList) {
    const container = document.getElementById('news-container');
    const loadingEl = document.getElementById('news-loading');
    
    if (!container || !loadingEl) return;

    if(loadingEl) loadingEl.classList.add('hidden');
    container.innerHTML = '';

    if (!newsList || newsList.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">ไม่พบข่าวประชาสัมพันธ์</p>';
        return;
    }
    
    const sortedNews = [...newsList].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedNews.forEach(item => {
        const hasLink = item.link && item.link.trim() !== '#' && item.link.trim() !== '';
        
        const newsCard = document.createElement('div');
        newsCard.className = 'bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4';
        
        let formattedDate = '-';
        if (item.date) {
            try {
                formattedDate = new Date(item.date).toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'long', day: 'numeric',
                });
            } catch (e) { /* keep default */ }
        }

        newsCard.innerHTML = `
            <div>
                <p class="text-xs text-gray-500 mb-1">${formattedDate}</p>
                <h3 class="font-bold text-lg text-gray-800">${item.title || 'ไม่มีหัวข้อ'}</h3>
            </div>
            ${hasLink ? `
            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="mt-2 sm:mt-0 inline-block bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap">
                อ่านเพิ่มเติม
            </a>` : `
            <span class="mt-2 sm:mt-0 inline-block bg-gray-300 text-gray-600 font-semibold px-4 py-2 rounded-md cursor-not-allowed whitespace-nowrap">
                ไม่มีลิงก์
            </span>`
            }
        `;
        container.appendChild(newsCard);
    });
}


export function renderDocuments(docsList, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    if (!docsList || docsList.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-full">ไม่พบเอกสารที่ตรงตามเงื่อนไข</p>';
        return;
    }

    docsList.forEach(doc => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md p-4 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300';

        let formattedDate = '-';
        if (doc.uploadDate) {
            try {
                formattedDate = new Date(doc.uploadDate).toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'short', day: 'numeric',
                });
            } catch (e) { /* keep default */ }
        }

        card.innerHTML = `
            <div>
                <h4 class="font-bold text-gray-800 text-lg mt-1" title="${doc.title}">${doc.title || 'ไม่มีชื่อเรื่อง'}</h4>
                <p class="text-sm text-gray-500 mt-2">วันที่: ${formattedDate}</p>
            </div>
            <div class="mt-4 text-right">
                <a href="${doc.fileUrl || '#'}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    ดาวน์โหลด
                </a>
            </div>
        `;
        container.appendChild(card);
    });
}


export function populateInnovationFilters(innovationsList) {
    const categoryFilter = document.getElementById('innovations-category-filter');
    const subjectFilter = document.getElementById('innovations-subject-filter');
    const gradeFilter = document.getElementById('innovations-grade-filter');

    const populateSelect = (selectElement, items, defaultOptionText) => {
        const uniqueItems = [...new Set(items.map(item => item).filter(Boolean))];
        selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`;
        uniqueItems.sort().forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            selectElement.appendChild(option);
        });
    };

    populateSelect(categoryFilter, innovationsList.map(i => i.category), 'ทุกหมวดหมู่');
    populateSelect(subjectFilter, innovationsList.map(i => i.subject), 'ทุกวิชา');
    populateSelect(gradeFilter, innovationsList.map(i => i.grade), 'ทุกระดับชั้น');
}

export function populateStudentAchievementFilters(awardsList) {
    const subjectFilter = document.getElementById('student-achievements-subject-filter');
    if (!subjectFilter) return;

    const subjects = [...new Set(awardsList.map(item => item.subject).filter(Boolean))];
    
    subjectFilter.innerHTML = '<option value="">ทุกกลุ่มสาระ</option>'; 
    
    subjects.sort().forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectFilter.appendChild(option);
    });
}

export function renderInnovations(innovationsList) {
    const container = document.getElementById('innovations-container');
    const loadingEl = document.getElementById('innovations-loading');
    if(loadingEl) loadingEl.classList.add('hidden');
    if(!container) return;
    container.innerHTML = '';

    if (!innovationsList || innovationsList.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-full">ไม่พบข้อมูลนวัตกรรมที่ตรงตามเงื่อนไข</p>';
        return;
    }

    innovationsList.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'innovation-card block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer';
        card.dataset.index = index;

        const coverImageUrl = getDirectGoogleDriveUrl(item.coverImageUrl) || `https://placehold.co/600x400/EBF8FF/3182CE?text=${encodeURIComponent(item.category || 'นวัตกรรม')}`;
        const errorImageUrl = 'https://placehold.co/600x400/FEE2E2/DC2626?text=Image%20Error';
        
        let formattedDate = '-';
        if (item.uploadDate) {
            try {
                formattedDate = new Date(item.uploadDate).toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'short', day: 'numeric',
                });
            } catch(e) { /* Keep default date */ }
        }

        card.innerHTML = `
            <div class="relative pointer-events-none">
                <img 
                    src="${coverImageUrl}" 
                    alt="ปกของ ${item.title}" 
                    class="w-full h-40 object-cover"
                    onerror="this.onerror=null; this.src='${errorImageUrl}';"
                >
                <div class="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">${item.category || 'ทั่วไป'}</div>
            </div>
            <div class="p-4 flex flex-col h-full pointer-events-none">
                <h4 class="font-bold text-lg text-gray-800 mt-1 truncate" title="${item.title}">${item.title || 'ไม่มีชื่อเรื่อง'}</h4>
                <p class="text-sm text-gray-600 mt-1 line-clamp-2 h-10">${item.description || ''}</p>
                <div class="mt-3 text-xs text-gray-500 space-y-1">
                    <div class="flex items-center">
                        <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v11.494m-5.243-7.243l10.486 4.494M4.757 12h14.486"></path></svg>
                        <span>วิชา: ${item.subject || '-'}</span>
                    </div>
                    <div class="flex items-center">
                        <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v7"></path></svg>
                        <span>ระดับชั้น: ${item.grade || '-'}</span>
                    </div>
                </div>
                <div class="border-t mt-3 pt-2 text-xs text-gray-500">
                    <p>โดย: ${item.creator || '-'}</p>
                    <p>${formattedDate}</p>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

export function showInnovationModal(item) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('detail-modal-content');
    const coverImageUrl = getDirectGoogleDriveUrl(item.coverImageUrl) || `https://placehold.co/600x400/EBF8FF/3182CE?text=${encodeURIComponent(item.category || 'นวัตกรรม')}`;
    const errorImageUrl = 'https://placehold.co/600x400/FEE2E2/DC2626?text=Image%20Error';
        
    let formattedDate = '-';
    if (item.uploadDate) {
        try {
            formattedDate = new Date(item.uploadDate).toLocaleDateString('th-TH', {
                year: 'numeric', month: 'long', day: 'numeric',
            });
        } catch(e) { /* Keep default date */ }
    }

    modalContent.innerHTML = `
        <div>
            <img 
                src="${coverImageUrl}" 
                alt="ปกของ ${item.title}" 
                class="w-full h-48 object-cover rounded-t-lg"
                onerror="this.onerror=null; this.src='${errorImageUrl}';"
            >
            <div class="p-6">
                <p class="text-sm font-semibold text-blue-600 uppercase">${item.category || 'ไม่มีหมวดหมู่'}</p>
                <h3 class="text-2xl font-bold text-gray-800 mt-1">${item.title || 'ไม่มีชื่อเรื่อง'}</h3>
                <p class="text-sm text-gray-500 mt-2">โดย: ${item.creator || '-'}</p>
                <p class="text-gray-600 mt-4">${item.description || 'ไม่มีคำอธิบาย'}</p>
                
                <div class="mt-4 border-t pt-4 text-sm text-gray-700 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-center">
                    <strong class="text-right">วิชา:</strong>
                    <span>${item.subject || '-'}</span>
                    <strong class="text-right">ระดับชั้น:</strong>
                    <span>${item.grade || '-'}</span>
                    <strong class="text-right">วันที่ลง:</strong>
                    <span>${formattedDate}</span>
                </div>

                <div class="mt-6 text-center">
                    <a href="${item.fileUrl || '#'}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <svg class="w-5 h-5 mr-2 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002 2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        เปิดไฟล์นวัตกรรม
                    </a>
                </div>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
}

