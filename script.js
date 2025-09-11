// ------------------- 🎯 CONFIGURATION -------------------
const API_URL = 'https://script.google.com/macros/s/AKfycby7CsU7Kck9nUY-uC_R6unpMu9dDrOnuOaQUzi0fto4kSnYhl63xHmr7wrJXwDzxSotow/exec';
// ---------------------------------------------------------

// --- Global Caches & State ---
let personnelDataCache = [];
let studentDataCache = [];
let studentCouncilDataCache = [];
let studentChartInstance = null;
let studentDataInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupDropdowns();
    setupModal();
    showPage('home');
});

// --- DROPDOWN & NAVIGATION SYSTEMS (No Changes) ---
function setupDropdowns() { /* ... Same as before ... */ }
function closeAllDropdowns(exceptMenu = null) { /* ... Same as before ... */ }
function setupNavigation() { /* ... Same as before ... */ }
function showPage(pageId) { /* ... Same as before ... */ }

// --- MODAL & UTILITY FUNCTIONS (No Changes) ---
function setupModal() { /* ... Same as before ... */ }
function getDirectGoogleDriveUrl(url) { /* ... Same as before ... */ }

// --- PERSONNEL PAGE (No Changes) ---
async function loadPersonnelData() { /* ... Same as before ... */ }
function renderPersonnelList(personnelList) { /* ... Same as before ... */ }
function showPersonnelModal(person) { /* ... Same as before ... */ }

// --- STUDENT PAGE WITH CHART (No Changes) ---
async function loadStudentData(isRefresh = false) { /* ... Same as before ... */ }
function renderStudentChart(studentList) { /* ... Same as before ... */ }

// --- 🌟 UPDATED: STUDENT COUNCIL PAGE with new layout logic 🌟 ---
async function loadStudentCouncilData() {
    if (studentCouncilDataCache.length > 0) {
        renderStudentCouncilList(studentCouncilDataCache);
        return;
    }
    const container = document.getElementById('student-council-container');
    const loadingEl = document.getElementById('student-council-loading');
    loadingEl.classList.remove('hidden');
    container.innerHTML = '';
    try {
        const response = await fetch(`${API_URL}?sheet=student_board`);
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        studentCouncilDataCache = result.data;
        renderStudentCouncilList(studentCouncilDataCache);
    } catch (error) {
        console.error('Error loading student council data:', error);
        loadingEl.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
    }
}

function renderStudentCouncilList(boardList) {
    const container = document.getElementById('student-council-container');
    const loadingEl = document.getElementById('student-council-loading');
    loadingEl.classList.add('hidden');
    container.innerHTML = '';

    if (!boardList || boardList.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">ไม่พบข้อมูลคณะกรรมการสภานักเรียน</p>';
        return;
    }

    // Helper function to create a card
    const createCard = (member, index) => {
        const cardItem = document.createElement('div');
        cardItem.className = 'bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col items-center p-4 text-center';
        cardItem.dataset.index = index;
        
        const finalImageUrl = getDirectGoogleDriveUrl(member.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
        const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';

        cardItem.innerHTML = `
            <img src="${finalImageUrl}" alt="รูปภาพของ ${member.name}" class="w-24 h-24 rounded-full object-cover border-4 border-gray-200" onerror="this.onerror=null; this.src='${errorImageUrl}';">
            <div class="mt-2">
                <h4 class="font-bold text-blue-800 text-md">${member.name || 'N/A'}</h4>
                <p class="text-sm text-gray-600">${member.role || '-'}</p>
                <p class="text-xs text-gray-500 mt-1">${member.class || ''}</p>
            </div>
        `;
        
        cardItem.addEventListener('click', () => {
            const clickedIndex = cardItem.dataset.index;
            const selectedMember = studentCouncilDataCache[clickedIndex];
            if (selectedMember) {
                showStudentCouncilModal(selectedMember);
            }
        });
        return cardItem;
    };

    // Handle the first member (President)
    const president = boardList[0];
    if (president) {
        const presidentContainer = document.createElement('div');
        presidentContainer.className = 'flex justify-center mb-8'; // Center the president
        presidentContainer.appendChild(createCard(president, 0));
        container.appendChild(presidentContainer);
    }

    // Handle the rest of the members
    const otherMembers = boardList.slice(1);
    if (otherMembers.length > 0) {
        const othersContainer = document.createElement('div');
        othersContainer.className = 'grid grid-cols-2 md:grid-cols-4 gap-6'; // 4 columns for others
        
        otherMembers.forEach((member, index) => {
            // The original index is index + 1
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
    modalContent.innerHTML = `<div class="text-center"><img src="${imageUrl}" alt="รูปภาพของ ${member.name}" class="w-40 h-40 rounded-full mx-auto mb-4 object-cover border-4 border-blue-200 shadow-lg" onerror="this.onerror=null; this.src='${errorImageUrl}';"><h3 class="text-2xl font-bold text-blue-800">${member.name || 'N/A'}</h3><p class="text-gray-600 text-lg">${member.role || '-'}</p><p class="text-md text-gray-500 mt-1">${member.class || ''}</p></div>`;
    modal.classList.remove('hidden');
}

