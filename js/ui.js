// This file is responsible for all UI updates and rendering.

import { STATIC_STUDENT_COUNCIL_DATA, STATIC_SCHOOL_BOARD_DATA, STATIC_STUDENT_DATA } from './data.js';

let studentChartInstance = null;

// --- UTILITY FUNCTION ---
function getDirectGoogleDriveUrl(url) {
    // ... (this function remains unchanged) ...
}

// --- DROPDOWN & MODAL SETUP ---
export function setupDropdowns() {
    // ... (this function remains unchanged) ...
}

export function closeAllDropdowns(exceptMenu = null) {
    // ... (this function remains unchanged) ...
}

export function setupModal() {
    // ... (this function remains unchanged) ...
}

// --- RENDER FUNCTIONS ---

export function renderHomeNews(newsList) {
    // ... (this function remains unchanged) ...
}

export function renderPersonnelList(personnelList) {
    // ... (this function remains unchanged) ...
}

export function showPersonnelModal(person) {
    // ... (this function remains unchanged) ...
}

// ... (other render functions like renderStudentChart, etc., remain unchanged) ...

export function renderHistoryTable(tbodyId, data) {
    // ... (this function remains unchanged) ...
}

export function setupHistorySearch(inputId, tbodyId, allData) {
    // ... (this function remains unchanged) ...
}

export function renderTeacherAchievements(achievementsList) {
    // ... (this function remains unchanged) ...
}

export function renderNews(newsList) {
    // ... (this function remains unchanged) ...
}

// 🌟 DELETED: ฟังก์ชันนี้ไม่จำเป็นอีกต่อไป 🌟
// export function populateDocumentFilters(docsList) { ... }

// 🌟 UPDATED: อัปเดตฟังก์ชันให้รับ container ID 🌟
export function renderDocuments(docsList, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // ไม่มี loading element ในหน้าย่อยแล้ว
    // const loadingEl = document.getElementById('documents-loading');
    // if(loadingEl) loadingEl.classList.add('hidden');
    
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
                <p class="text-xs font-semibold text-blue-600 uppercase">${doc.category || 'ทั่วไป'}</p>
                <h4 class="font-bold text-gray-800 text-lg mt-1" title="${doc.title}">${doc.title || 'ไม่มีชื่อเรื่อง'}</h4>
                <p class="text-sm text-gray-500 mt-2">วันที่: ${formattedDate}</p>
            </div>
            <div class="mt-4 text-right">
                <a href="${doc.fileUrl || '#'}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
    // ... (this function remains unchanged) ...
}

export function renderInnovations(innovationsList) {
    // ... (this function remains unchanged) ...
}

export function showInnovationModal(item) {
    // ... (this function remains unchanged) ...
}

