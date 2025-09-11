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
    setupEventListeners(); // 🌟 NEW: Centralized event listeners
    showPage('home');
});

// --- DROPDOWN & NAVIGATION SYSTEMS (No Changes) ---
function setupDropdowns() { /* ... Same as before ... */ }
function closeAllDropdowns(exceptMenu = null) { /* ... Same as before ... */ }
function setupNavigation() { /* ... Same as before ... */ }
function showPage(pageId) { /* ... Same as before ... */ }

// --- 🌟 NEW: CENTRALIZED EVENT LISTENER SETUP 🌟 ---
// This function sets up click listeners for dynamic content
function setupEventListeners() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.addEventListener('click', (e) => {
        // Find the closest parent card with a data-index attribute
        const personnelCard = e.target.closest('#personnel-list-container .personnel-card');
        const councilCard = e.target.closest('#student-council-container .student-council-card');

        if (personnelCard) {
            const index = personnelCard.dataset.index;
            const selectedPerson = personnelDataCache[index];
            if (selectedPerson) {
                showPersonnelModal(selectedPerson);
            }
        }

        if (councilCard) {
            const index = councilCard.dataset.index;
            const selectedMember = studentCouncilDataCache[index];
            if (selectedMember) {
                showStudentCouncilModal(selectedMember);
            }
        }
    });
}


// --- MODAL & UTILITY FUNCTIONS (No Changes) ---
function setupModal() { /* ... Same as before ... */ }
function getDirectGoogleDriveUrl(url) { /* ... Same as before ... */ }

// --- PERSONNEL PAGE ---
async function loadPersonnelData() { /* ... Same as before, no changes needed here ... */ }

// 🌟 UPDATED: renderPersonnelList no longer adds event listeners directly
function renderPersonnelList(personnelList) {
    const listContainer = document.getElementById('personnel-list-container');
    const loadingEl = document.getElementById('personnel-loading');
    loadingEl.classList.add('hidden');
    listContainer.innerHTML = '';
    if (!personnelList || personnelList.length === 0) {
        listContainer.innerHTML = '<p class="text-center text-gray-500 col-span-full">ไม่พบข้อมูลบุคลากร</p>';
        return;
    }
    personnelList.forEach((person, index) => {
        const cardItem = document.createElement('div');
        // Added a specific class 'personnel-card' for the event listener
        cardItem.className = 'personnel-card bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col items-center p-4';
        cardItem.dataset.index = index;
        
        const finalImageUrl = getDirectGoogleDriveUrl(person.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
        const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';

        cardItem.innerHTML = `<img src="${finalImageUrl}" alt="รูปภาพของ ${person.name}" class="w-24 h-24 rounded-full object-cover border-4 border-gray-200" onerror="this.onerror=null; this.src='${errorImageUrl}';"><div class="text-center mt-2"><h4 class="font-bold text-blue-800 text-md">${person.name || 'N/A'}</h4><p class="text-sm text-gray-600">${person.role || '-'}</p><p class="text-xs text-gray-500 mt-1">${person.academicStanding || ''}</p></div>`;
        listContainer.appendChild(cardItem);
    });
}
function showPersonnelModal(person) { /* ... Same as before ... */ }


// --- STUDENT PAGE WITH CHART (No Changes) ---
async function loadStudentData(isRefresh = false) { /* ... Same as before ... */ }
function renderStudentChart(studentList) { /* ... Same as before ... */ }

// --- STUDENT COUNCIL PAGE ---
async function loadStudentCouncilData() { /* ... Same as before ... */ }

// 🌟 UPDATED: renderStudentCouncilList no longer adds event listeners directly
function renderStudentCouncilList(boardList) {
    const container = document.getElementById('student-council-container');
    const loadingEl = document.getElementById('student-council-loading');
    loadingEl.classList.add('hidden');
    container.innerHTML = '';

    if (!boardList || boardList.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">ไม่พบข้อมูลคณะกรรมการสภานักเรียน</p>';
        return;
    }

    const createCard = (member, index) => {
        const cardItem = document.createElement('div');
        // Added a specific class 'student-council-card' for the event listener
        cardItem.className = 'student-council-card bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col items-center p-4 text-center';
        cardItem.dataset.index = index;
        
        const finalImageUrl = getDirectGoogleDriveUrl(member.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
        const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';

        cardItem.innerHTML = `<img src="${finalImageUrl}" alt="รูปภาพของ ${member.name}" class="w-24 h-24 rounded-full object-cover border-4 border-gray-200" onerror="this.onerror=null; this.src='${errorImageUrl}';"><div class="mt-2"><h4 class="font-bold text-blue-800 text-md">${member.name || 'N/A'}</h4><p class="text-sm text-gray-600">${member.role || '-'}</p><p class="text-xs text-gray-500 mt-1">${member.class || ''}</p></div>`;
        return cardItem;
    };

    // Layout logic remains the same
    const president = boardList[0];
    if (president) {
        const presidentContainer = document.createElement('div');
        presidentContainer.className = 'flex justify-center mb-8';
        presidentContainer.appendChild(createCard(president, 0));
        container.appendChild(presidentContainer);
    }

    const otherMembers = boardList.slice(1);
    if (otherMembers.length > 0) {
        const othersContainer = document.createElement('div');
        othersContainer.className = 'grid grid-cols-2 md:grid-cols-4 gap-6';
        otherMembers.forEach((member, index) => {
            othersContainer.appendChild(createCard(member, index + 1));
        });
        container.appendChild(othersContainer);
    }
}

function showStudentCouncilModal(member) { /* ... Same as before ... */ }

