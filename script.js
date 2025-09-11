// ------------------- 🎯 CONFIGURATION -------------------
const API_URL = 'https://script.google.com/macros/s/AKfycby7CsU7Kck9nUY-uC_R6unpMu9dDrOnuOaQUzi0fto4kSnYhl63xHmr7wrJXwDzxSotow/exec';
// ---------------------------------------------------------

// --- Global Caches & State ---
let personnelDataCache = [];
let studentDataCache = [];
let schoolBoardDataCache = []; // 🌟 NEW: Cache for school board data
let studentChartInstance = null;
let studentDataInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupDropdowns();
    setupModal();
    showPage('home');
});

// --- DROPDOWN & NAVIGATION SYSTEMS (No Changes) ---
function setupDropdowns() { /* ... No changes ... */ }
function closeAllDropdowns(exceptMenu = null) { /* ... No changes ... */ }
function setupNavigation() { /* ... No changes ... */ }

function showPage(pageId) {
    if (studentDataInterval) {
        clearInterval(studentDataInterval);
        studentDataInterval = null;
    }

    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });

    const activePage = document.getElementById(`page-${pageId}`);
    if (activePage) activePage.classList.remove('hidden');

    // Highlighting logic
    document.querySelectorAll('#main-nav a[data-page], #main-nav button.dropdown-toggle').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`#main-nav a[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
        const parentDropdown = activeLink.closest('.dropdown');
        if (parentDropdown) {
            parentDropdown.querySelector('.dropdown-toggle').classList.add('active');
        }
    }

    // --- 🌟 UPDATED: Load data for all relevant pages ---
    switch (pageId) {
        case 'personnel-list':
            loadPersonnelData();
            break;
        case 'students':
            loadStudentData();
            studentDataInterval = setInterval(() => loadStudentData(true), 300000);
            break;
        case 'student-council': // 🌟 NEW
            loadSchoolBoardData();
            break;
        // ... other cases
    }
}

// --- MODAL & UTILITY & PERSONNEL FUNCTIONS (No Changes) ---
function setupModal() { /* ... No changes ... */ }
function getDirectGoogleDriveUrl(url) { /* ... No changes ... */ }
async function loadPersonnelData() { /* ... No changes ... */ }
function renderPersonnelList(personnelList) { /* ... No changes ... */ }
function showPersonnelModal(person) { /* ... No changes ... */ }

// --- STUDENT PAGE WITH CHART (No Changes) ---
async function loadStudentData(isRefresh = false) { /* ... No changes ... */ }
function renderStudentChart(studentList) { /* ... No changes ... */ }


// --- 🌟 NEW: SCHOOL BOARD / STUDENT COUNCIL PAGE 🌟 ---
async function loadSchoolBoardData() {
    if (schoolBoardDataCache.length > 0) {
        renderSchoolBoard(schoolBoardDataCache);
        return;
    }
    
    const container = document.getElementById('school-board-container');
    const loadingEl = document.getElementById('school-board-loading');

    loadingEl.classList.remove('hidden');
    container.innerHTML = '';
    
    try {
        if (!API_URL || API_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL') {
            throw new Error("กรุณาตั้งค่า API_URL ในไฟล์ script.js ก่อน");
        }
        
        const response = await fetch(`${API_URL}?sheet=school_board`);
        const result = await response.json();

        if (result.error) throw new Error(result.error);
        
        schoolBoardDataCache = result.data;
        renderSchoolBoard(schoolBoardDataCache);

    } catch (error) {
        console.error('Error loading school board data:', error);
        loadingEl.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
    }
}

function renderSchoolBoard(boardList) {
    const container = document.getElementById('school-board-container');
    const loadingEl = document.getElementById('school-board-loading');
    
    loadingEl.classList.add('hidden');
    container.innerHTML = '';

    if (!boardList || boardList.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-full">ไม่พบข้อมูลคณะกรรมการสภานักเรียน</p>';
        return;
    }

    boardList.forEach(member => {
        const cardItem = document.createElement('div');
        cardItem.className = 'bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center p-4 text-center';
        
        const finalImageUrl = getDirectGoogleDriveUrl(member.imageUrl) || 'https://placehold.co/200x200/EBF8FF/3182CE?text=?';
        const errorImageUrl = 'https://placehold.co/200x200/FEE2E2/DC2626?text=Link%20Error';

        cardItem.innerHTML = `
            <img 
                src="${finalImageUrl}" 
                alt="รูปภาพของ ${member.name}" 
                class="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                onerror="this.onerror=null; this.src='${errorImageUrl}';"
            >
            <div class="mt-2">
                <h4 class="font-bold text-blue-800 text-md">${member.name || 'N/A'}</h4>
                <p class="text-sm text-gray-600">${member.role || '-'}</p>
                <p class="text-xs text-gray-500 mt-1">${member.class || ''}</p>
            </div>
        `;
        container.appendChild(cardItem);
    });
}

