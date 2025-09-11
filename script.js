// ------------------- 🎯 CONFIGURATION -------------------
const API_URL = 'https://script.google.com/macros/s/AKfycby7CsU7Kck9nUY-uC_R6unpMu9dDrOnuOaQUzi0fto4kSnYhl63xHmr7wrJXwDzxSotow/exec';
// ---------------------------------------------------------

// --- Global Caches & State ---
let personnelDataCache = [];
let studentDataCache = [];
let studentCouncilDataCache = [];
let teacherAchievementsCache = []; // 🌟 NEW
let studentChartInstance = null;
let studentDataInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupDropdowns();
    setupModal();
    setupEventListeners();
    showPage('home');
});

// --- DROPDOWN & NAVIGATION SYSTEMS ---
function setupDropdowns() { /* ... Same as before ... */ }
function closeAllDropdowns(exceptMenu = null) { /* ... Same as before ... */ }
function setupNavigation() { /* ... Same as before ... */ }

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

    // --- 🌟 UPDATED: Load data for the new achievements page ---
    switch (pageId) {
        case 'personnel-list':
            loadPersonnelData();
            break;
        case 'students':
            loadStudentData();
            studentDataInterval = setInterval(() => loadStudentData(true), 300000);
            break;
        case 'student-council':
            loadStudentCouncilData();
            break;
        case 'teacher-achievements': // 🌟 NEW
            loadTeacherAchievementsData();
            break;
    }
}

// --- EVENT LISTENERS, MODAL, UTILITY FUNCTIONS ---
function setupEventListeners() { /* ... Same as before ... */ }
function setupModal() { /* ... Same as before ... */ }
function getDirectGoogleDriveUrl(url) { /* ... Same as before ... */ }

// --- PERSONNEL PAGE & MODAL ---
async function loadPersonnelData() { /* ... Same as before ... */ }
function renderPersonnelList(personnelList) { /* ... Same as before ... */ }
function showPersonnelModal(person) { /* ... Same as before ... */ }

// --- STUDENT PAGE WITH CHART ---
async function loadStudentData(isRefresh = false) { /* ... Same as before ... */ }
function renderStudentChart(studentList) { /* ... Same as before ... */ }

// --- STUDENT COUNCIL PAGE & MODAL ---
async function loadStudentCouncilData() { /* ... Same as before ... */ }
function renderStudentCouncilList(boardList) { /* ... Same as before ... */ }
function showStudentCouncilModal(member) { /* ... Same as before ... */ }


// --- 🌟 NEW: TEACHER ACHIEVEMENTS PAGE 🌟 ---
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
        if (!API_URL) throw new Error("API_URL is not configured.");
        
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
        container.innerHTML = '<p class="text-center text-gray-500">ไม่พบข้อมูลผลงานครู</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-gray-200';
    table.innerHTML = `
        <thead class="bg-gray-50">
            <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-สกุล</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อผลงานล่าสุด</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผลงานทั้งหมด</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200"></tbody>
    `;

    const tableBody = table.querySelector('tbody');

    achievementsList.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.name || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <a href="${item.url_pro || '#'}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 hover:underline">
                    ${item.project || '-'}
                </a>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <a href="${item.url_all || '#'}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    ดูทั้งหมด
                </a>
            </td>
        `;
        tableBody.appendChild(row);
    });

    container.appendChild(table);
}

