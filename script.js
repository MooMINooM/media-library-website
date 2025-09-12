// ------------------- 🎯 CONFIGURATION -------------------
const API_URL = 'https://script.google.com/macros/s/AKfycby7CsU7Kck9nUY-uC_R6unpMu9dDrOnuOaQUzi0fto4kSnYhl63xHmr7wrJXwDzxSotow/exec';
// ---------------------------------------------------------

// --- Global Caches & State ---
let personnelDataCache = [];
let studentDataCache = [];
let studentCouncilDataCache = [];
let teacherAchievementsCache = [];
// 🌟 REMOVED: No longer need to cache school info
let studentChartInstance = null;
let studentDataInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupDropdowns();
    setupModal();
    setupEventListeners();
    showPage('home');
});

// --- DROPDOWN, NAVIGATION, EVENT LISTENERS, MODAL (No Changes) ---
function setupDropdowns() { /* ... */ }
function closeAllDropdowns(exceptMenu = null) { /* ... */ }
function setupNavigation() { /* ... */ }
function setupEventListeners() { /* ... */ }
function setupModal() { /* ... */ }
function getDirectGoogleDriveUrl(url) { /* ... */ }


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

    // --- 🌟 UPDATED: Removed 'history' case as it's now static ---
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
        case 'teacher-achievements':
            loadTeacherAchievementsData();
            break;
    }
}

// --- PERSONNEL PAGE & MODAL (No Changes) ---
async function loadPersonnelData() { /* ... */ }
function renderPersonnelList(personnelList) { /* ... */ }
function showPersonnelModal(person) { /* ... */ }

// --- STUDENT PAGE WITH CHART (No Changes) ---
async function loadStudentData(isRefresh = false) { /* ... */ }
function renderStudentChart(studentList) { /* ... */ }

// --- STUDENT COUNCIL PAGE & MODAL (No Changes) ---
async function loadStudentCouncilData() { /* ... */ }
function renderStudentCouncilList(boardList) { /* ... */ }
function showStudentCouncilModal(member) { /* ... */ }

// --- TEACHER ACHIEVEMENTS PAGE (No Changes) ---
async function loadTeacherAchievementsData() { /* ... */ }
function renderTeacherAchievements(achievementsList) { /* ... */ }

// --- 🌟 REMOVED: The `loadSchoolInfoData` and `renderHistory` functions are no longer needed ---

