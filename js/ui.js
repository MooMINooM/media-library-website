// This file is responsible for all UI updates and rendering.

import { STATIC_PERSONNEL_DATA, STATIC_STUDENT_COUNCIL_DATA, STATIC_SCHOOL_BOARD_DATA, STATIC_STUDENT_DATA } from './data.js';

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
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
}

// --- RENDER FUNCTIONS ---
export function renderPersonnelList() {
    const container = document.getElementById('personnel-list-container');
    const loadingEl = document.getElementById('personnel-loading');
    loadingEl.classList.add('hidden');
    container.innerHTML = '';
    const personnelList = STATIC_PERSONNEL_DATA;
    // ... (rest of the render function is the same)
}

export function showPersonnelModal(person) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('detail-modal-content');
    // ... (rest of the show modal function is the same)
}

export function renderStudentChart() {
    const studentList = STATIC_STUDENT_DATA;
    // ... (rest of the chart rendering logic is the same)
}

export function renderStudentCouncilList() {
    const container = document.getElementById('student-council-container');
    const loadingEl = document.getElementById('student-council-loading');
    loadingEl.classList.add('hidden');
    container.innerHTML = '';
    const boardData = STATIC_STUDENT_COUNCIL_DATA;
    // ... (rest of the render function is the same)
}

export function showStudentCouncilModal(member) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('detail-modal-content');
    // ... (rest of the show modal function is the same)
}

export function renderSchoolBoardList() {
     const container = document.getElementById('school-board-container');
    const loadingEl = document.getElementById('school-board-loading');
    loadingEl.classList.add('hidden');
    container.innerHTML = '';
    const boardData = STATIC_SCHOOL_BOARD_DATA;
    // ... (rest of the render function is the same)
}

export function showSchoolBoardModal(member) {
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('detail-modal-content');
    // ... (rest of the show modal function is the same)
}


export function renderTeacherAchievements(achievementsList) {
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

export function renderInnovations(innovationsList) {
    const container = document.getElementById('innovations-container');
    const loadingEl = document.getElementById('innovations-loading');
    loadingEl.classList.add('hidden');
    container.innerHTML = '';
    if (!innovationsList || innovationsList.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-full">ไม่พบคลังนวัตกรรม</p>';
        return;
    }
    innovationsList.forEach(item => {
        const card = document.createElement('a');
        card.href = item.fileUrl || '#';
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        // ... (rest of the card creation logic)
    });
}

