// ------------------- 🎯 CONFIGURATION -------------------
const API_URL = 'https://script.google.com/macros/s/AKfycby7CsU7Kck9nUY-uC_R6unpMu9dDrOnuOaQUzi0fto4kSnYhl63xHmr7wrJXwDzxSotow/exec';
// ---------------------------------------------------------

// --- Static data for Personnel Structure ---
const STATIC_PERSONNEL_DATA = [
    { 
        name: 'นายสมชาย ใจดี', 
        role: 'ผู้อำนวยการสถานศึกษา',
        academicStanding: 'ชำนาญการพิเศษ',
        education: 'ค.ม. การบริหารการศึกษา',
        class: '-',
        tel: '081-234-5678',
        imageUrl: 'YOUR_IMAGE_URL_HERE' 
    },
    { 
        name: 'นางสาวสมศรี มีสุข', 
        role: 'ครู',
        academicStanding: 'ชำนาญการ',
        education: 'ศษ.บ. ภาษาไทย\nค.ม. นวัตกรรมการศึกษา',
        class: 'ประถมศึกษาปีที่ 1',
        tel: '082-345-6789',
        imageUrl: 'YOUR_IMAGE_URL_HERE'
    },
];

// --- Static data for Student Council Structure ---
const STATIC_STUDENT_COUNCIL_DATA = [
    { id: 'president', name: 'ประธานนักเรียน', class: 'ประถมศึกษาปีที่ 6', role: 'ประธานนักเรียน', imageUrl: 'YOUR_IMAGE_URL_HERE' },
    { id: 'vp_academic', name: 'รองประธานฝ่ายวิชาการ', class: 'ประถมศึกษาปีที่ 5', role: 'รองประธานนักเรียนฝ่ายวิชาการ', imageUrl: 'YOUR_IMAGE_URL_HERE' },
    { id: 'vp_activities', name: 'รองประธานฝ่ายกิจกรรม', class: 'ประถมศึกษาปีที่ 5', role: 'รองประธานนักเรียนฝ่ายกิจกรรม', imageUrl: 'YOUR_IMAGE_URL_HERE' },
    { id: 'vp_facilities', name: 'รองประธานฝ่ายอาคารและสถานที่', class: 'ประถมศึกษาปีที่ 6', role: 'รองประธานนักเรียนฝ่ายอาคารและสถานที่', imageUrl: 'YOUR_IMAGE_URL_HERE' },
    { id: 'vp_discipline', name: 'รองประธานฝ่ายสารวัตรนักเรียน', class: 'ประถมศึกษาปีที่ 6', role: 'รองประธานนักเรียนฝ่ายสารวัตรนักเรียน', imageUrl: 'YOUR_IMAGE_URL_HERE' },
    { id: 'committee_1', name: 'กรรมการ', class: 'ประถมศึกษาปีที่ 4', role: 'กรรมการ', imageUrl: 'YOUR_IMAGE_URL_HERE' },
];

// --- Global Caches & State ---
let studentDataCache = [];
let teacherAchievementsCache = [];
let studentChartInstance = null;
let studentDataInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupDropdowns();
    setupModal();
    setupEventListeners();
    showPage('home');
});

// --- DROPDOWN SYSTEM ---
function setupDropdowns() {
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

function closeAllDropdowns(exceptMenu = null) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu !== exceptMenu) menu.classList.add('hidden');
    });
}

// --- NAVIGATION SYSTEM ---
function setupNavigation() {
    const mainNav = document.getElementById('main-nav');
    mainNav.addEventListener('click', (e) => {
        if (e.target.matches('a[data-page]')) {
            e.preventDefault();
            const pageId = e.target.dataset.page;
            showPage(pageId);
            closeAllDropdowns();
        }
    });
}

function showPage(pageId) {
    if (studentDataInterval) {
        clearInterval(studentDataInterval);
        studentDataInterval = null;
    }
    document.querySelectorAll('.page-content').forEach(page => page.classList.add('hidden'));
    const activePage = document.getElementById(`page-${pageId}`);
    if (activePage) activePage.classList.remove('hidden');

    document.querySelectorAll('#main-nav a[data-page], #main-nav button.dropdown-toggle').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`#main-nav a[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
        const parentDropdown = activeLink.closest('.dropdown');
        if (parentDropdown) parentDropdown.querySelector('.dropdown-toggle').classList.add('active');
    }

    switch (pageId) {
        case 'personnel-list':
            renderPersonnelList();
            break;
        case 'students':
            loadStudentData();
            studentDataInterval = setInterval(() => loadStudentData(true), 300000);
            break;
        case 'student-council':
            renderStudentCouncilList();
            break;
        case 'teacher-achievements':
            loadTeacherAchievementsData();
            break;
        case 'school-board':
            renderSchoolBoardList();
            break;
    }
}

// --- EVENT LISTENERS, MODAL, UTILITY ---
function setupEventListeners() {
    const mainContent = document.getElementById('main-content');
    mainContent.addEventListener('click', (e) => {
        const personnelCard = e.target.closest('.personnel-card');
        const councilCard = e.target.closest('.student-council-card');
        const boardCard = e.target.closest('.school-board-card');

        if (personnelCard) {
            const index = personnelCard.dataset.index;
            const selectedPerson = STATIC_PERSONNEL_DATA[index];
            if (selectedPerson) showPersonnelModal(selectedPerson);
        }
        if (councilCard) {
            const index = councilCard.dataset.index;
            const selectedMember = STATIC_STUDENT_COUNCIL_DATA[index];
            if (selectedMember) showStudentCouncilModal(selectedMember);
        }
        if (boardCard) {
            const index = boardCard.dataset.index;
            const selectedMember = STATIC_SCHOOL_BOARD_DATA[index];
            if (selectedMember) showSchoolBoardModal(selectedMember);
        }
    });
}

function setupModal() {
    const modal = document.getElementById('detail-modal');
    const closeBtn = document.getElementById('detail-modal-close-btn');
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
}

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

// --- PERSONNEL PAGE ---
function renderPersonnelList() {
    const container = document.getElementById('personnel-list-container');
    const loadingEl = document.getElementById('personnel-loading');
    loadingEl.classList.add('hidden');
    container.innerHTML = '';

    const personnelList = STATIC_PERSONNEL_DATA;

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

        cardItem.innerHTML = `
            <img src="${finalImageUrl}" alt="รูปภาพของ ${person.name}" class="${imageSize} rounded-full object-cover border-4 border-gray-200" onerror="this.onerror=null; this.src='${errorImageUrl}';">
            <div class="mt-2">
                <h4 class="font-bold text-blue-800 ${nameSize}">${person.name || 'N/A'}</h4>
                <p class="text-sm text-gray-600">${person.role || '-'}</p>
                <p class="text-xs text-gray-500 mt-1">${person.academicStanding || ''}</p>
            </div>`;
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

function showPersonnelModal(person) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('detail-modal-content');
    const imageUrl = getDirectGoogleDriveUrl(person.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
    const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
    const educationList = person.education ? person.education.split('\n').map(edu => `<li>${edu.trim()}</li>`).join('') : '<li>-</li>';
    modalContent.innerHTML = `<div class="text-center"><img src="${imageUrl}" alt="รูปภาพของ ${person.name}" class="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200 shadow-lg" onerror="this.onerror=null; this.src='${errorImageUrl}';"><h3 class="text-2xl font-bold text-blue-800">${person.name || 'N/A'}</h3><p class="text-gray-600 text-lg">${person.role || '-'}</p><p class="text-md text-gray-500 mt-1">${person.academicStanding || ''}</p></div><hr class="my-4"><div class="text-sm text-left grid grid-cols-[auto_1fr] gap-x-4 items-start"><strong class="text-gray-600 text-right">วุฒิการศึกษา:</strong><ul class="text-gray-500 list-disc list-inside">${educationList}</ul><strong class="text-gray-600 text-right">ห้องประจำชั้น:</strong><span class="text-gray-500">${person.class || '-'}</span><strong class="text-gray-600 text-right">โทร:</strong><span class="text-gray-500">${person.tel || '-'}</span></div>`;
    modal.classList.remove('hidden');
}

// --- STUDENT PAGE WITH CHART ---
async function loadStudentData(isRefresh = false) {
    const loadingEl = document.getElementById('students-loading');
    if (!isRefresh) {
        loadingEl.textContent = 'กำลังโหลดข้อมูล...';
        loadingEl.classList.remove('hidden');
    }
    try {
        const url = `${API_URL}?sheet=students&v=${new Date().getTime()}`;
        const response = await fetch(url);
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        studentDataCache = result.data;
        renderStudentChart(studentDataCache);
    } catch (error) {
        console.error('Error loading student data:', error);
        loadingEl.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
    }
}

function renderStudentChart(studentList) {
    const loadingEl = document.getElementById('students-loading');
    const summaryContainer = document.getElementById('student-summary-container');
    const ctx = document.getElementById('studentChart').getContext('2d');
    loadingEl.classList.add('hidden');
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
    summaryContainer.innerHTML = `
        <div class="bg-blue-50 p-4 rounded-lg shadow">
            <h3 class="text-xl font-bold text-blue-800">${totalBoys.toLocaleString()}</h3>
            <p class="text-sm text-blue-600">นักเรียนชาย</p>
        </div>
        <div class="bg-pink-50 p-4 rounded-lg shadow">
            <h3 class="text-xl font-bold text-pink-800">${totalGirls.toLocaleString()}</h3>
            <p class="text-sm text-pink-600">นักเรียนหญิง</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow">
            <h3 class="text-xl font-bold text-gray-800">${grandTotal.toLocaleString()}</h3>
            <p class="text-sm text-gray-600">นักเรียนทั้งหมด</p>
        </div>
    `;
    if (studentChartInstance) {
        studentChartInstance.destroy();
    }
    studentChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'นักเรียนชาย',
                    data: boysData,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                },
                {
                    label: 'นักเรียนหญิง',
                    data: girlsData,
                    backgroundColor: 'rgba(236, 72, 153, 0.7)',
                    borderColor: 'rgba(236, 72, 153, 1)',
                    borderWidth: 1
                },
                {
                    label: 'รวม',
                    data: totalData,
                    backgroundColor: 'rgba(107, 114, 128, 0.7)',
                    borderColor: 'rgba(107, 114, 128, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'จำนวนนักเรียน (คน)' }
                },
                x: {
                    title: { display: true, text: 'ระดับชั้น' }
                }
            },
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'จำนวนนักเรียนแยกตามเพศและระดับชั้น' }
            }
        }
    });
}

// --- STUDENT COUNCIL PAGE ---
function renderStudentCouncilList() {
    const container = document.getElementById('student-council-container');
    const loadingEl = document.getElementById('student-council-loading');
    loadingEl.classList.add('hidden');
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
        cardItem.innerHTML = `
            <img src="${finalImageUrl}" alt="รูปภาพของ ${member.name}" class="${imageSize} rounded-full object-cover border-4 border-gray-200" onerror="this.onerror=null; this.src='${errorImageUrl}';">
            <div class="mt-2">
                <h4 class="font-bold text-blue-800 ${nameSize}">${member.name || 'N/A'}</h4>
                <p class="text-sm text-gray-600">${member.role || '-'}</p>
                <p class="text-xs text-gray-500 mt-1">${member.class || ''}</p>
            </div>`;
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

function showStudentCouncilModal(member) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('detail-modal-content');
    const imageUrl = getDirectGoogleDriveUrl(member.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
    const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
    modalContent.innerHTML = `
        <div class="text-center">
            <img src="${imageUrl}" alt="รูปภาพของ ${member.name}" class="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200 shadow-lg" onerror="this.onerror=null; this.src='${errorImageUrl}';">
            <h3 class="text-2xl font-bold text-blue-800">${member.name || 'N/A'}</h3>
            <p class="text-gray-600 text-lg">${member.role || '-'}</p>
            <p class="text-md text-gray-500 mt-1">${member.class || ''}</p>
        </div>`;
    modal.classList.remove('hidden');
}

// --- SCHOOL BOARD PAGE ---
function renderSchoolBoardList() {
    const container = document.getElementById('school-board-container');
    const loadingEl = document.getElementById('school-board-loading');
    loadingEl.classList.add('hidden');
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
        cardItem.innerHTML = `
            <img src="${finalImageUrl}" alt="รูปภาพของ ${member.name}" class="${imageSize} rounded-full object-cover border-4 border-gray-200" onerror="this.onerror=null; this.src='${errorImageUrl}';">
            <div class="mt-2">
                <h4 class="font-bold text-blue-800 ${nameSize}">${member.name || 'N/A'}</h4>
                <p class="text-sm text-gray-600">${member.role || '-'}</p>
            </div>`;
        return cardItem;
    };

    const president = boardData[0];
    if (president) {
        const presidentSection = document.createElement('div');
        presidentSection.className = 'mb-8';
        presidentSection.innerHTML = `<h3 class="text-xl font-semibold text-center mb-4 text-blue-800">ประธานกรรมการ</h3>`;
        const presidentContainer = document.createElement('div');
        presidentContainer.className = 'flex justify-center';
        presidentContainer.appendChild(createCard(president, 0, true));
        presidentSection.appendChild(presidentContainer);
        container.appendChild(presidentSection);
    }

    const otherMembers = boardData.slice(1);
    if (otherMembers.length > 0) {
        const othersSection = document.createElement('div');
        othersSection.className = 'mt-8 border-t pt-6';
        othersSection.innerHTML = `<h3 class="text-xl font-semibold text-center mb-4 text-blue-800">คณะกรรมการ</h3>`;
        const othersContainer = document.createElement('div');
        othersContainer.className = 'grid grid-cols-2 md:grid-cols-4 gap-6';
        otherMembers.forEach((member, index) => {
            othersContainer.appendChild(createCard(member, index + 1));
        });
        othersSection.appendChild(othersContainer);
        container.appendChild(othersSection);
    }
}

function showSchoolBoardModal(member) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('detail-modal-content');
    const imageUrl = getDirectGoogleDriveUrl(member.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
    const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';
    modalContent.innerHTML = `
        <div class="text-center">
            <img src="${imageUrl}" alt="รูปภาพของ ${member.name}" class="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200 shadow-lg" onerror="this.onerror=null; this.src='${errorImageUrl}';">
            <h3 class="text-2xl font-bold text-blue-800">${member.name || 'N/A'}</h3>
            <p class="text-gray-600 text-lg">${member.role || '-'}</p>
        </div>`;
    modal.classList.remove('hidden');
}

// --- TEACHER ACHIEVEMENTS PAGE ---
async function loadTeacherAchievementsData() {
    if (teacherAchievementsCache.length > 0) {
        renderTeacherAchievements(teacherAchievementsCache);
        return;
    }
    const container = document.getElementById('teacher-achievements-container');
    const loadingEl = document.getElementById('teacher-achievements-loading');
    loadingEl.classList.remove('hidden');
    container.innerHTML = '';
    try {
        const response = await fetch(`${API_URL}?sheet=performance`);
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        teacherAchievementsCache = result.data;
        renderTeacherAchievements(teacherAchievementsCache);
    } catch (error) {
        console.error('Error loading teacher achievements:', error);
        loadingEl.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
    }
}
function renderTeacherAchievements(achievementsList) {
    const container = document.getElementById('teacher-achievements-container');
    const loadingEl = document.getElementById('teacher-achievements-loading');
    loadingEl.classList.add('hidden');
    container.innerHTML = '';
    if (!achievementsList || achievementsList.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-full">ไม่พบข้อมูลผลงานครู</p>';
        return;
    }
    achievementsList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md p-4 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300';
        card.innerHTML = `
            <div>
                <h4 class="font-bold text-blue-800 text-lg">${item.name || '-'}</h4>
                <a href="${item.url_pro || '#'}" target="_blank" rel="noopener noreferrer" class="block mt-1 text-sm text-gray-600 hover:text-blue-800 hover:underline line-clamp-2" title="${item.project || ''}">
                    ${item.project || '-'}
                </a>
            </div>
            <div class="mt-4 text-right">
                <a href="${item.url_all || '#'}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    ดูผลงานทั้งหมด
                </a>
            </div>
        `;
        container.appendChild(card);
    });
}

