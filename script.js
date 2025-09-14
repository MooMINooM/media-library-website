// ------------------- 🎯 CONFIGURATION -------------------
const API_URL = 'https://script.google.com/macros/s/AKfycby7CsU7Kck9nUY-uC_R6unpMu9dDrOnuOaQUzi0fto4kSnYhl63xHmr7wrJXwDzxSotow/exec';
// ---------------------------------------------------------

// --- Global Caches & State ---
let personnelDataCache = [];
let studentDataCache = [];
let studentCouncilDataCache = [];
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

// --- DROPDOWN & NAVIGATION SYSTEMS ---
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
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });

    const activePage = document.getElementById(`page-${pageId}`);
    if (activePage) activePage.classList.remove('hidden');

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

    // No changes needed in switch statement as 'vision' was never a dynamic page
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

// --- EVENT LISTENERS, MODAL, UTILITY FUNCTIONS ---
function setupEventListeners() {
    const mainContent = document.getElementById('main-content');
    mainContent.addEventListener('click', (e) => {
        const personnelCard = e.target.closest('.personnel-card');
        const councilCard = e.target.closest('.student-council-card');
        if (personnelCard) {
            const index = personnelCard.dataset.index;
            const selectedPerson = personnelDataCache[index];
            if (selectedPerson) showPersonnelModal(selectedPerson);
        }
        if (councilCard) {
            const index = councilCard.dataset.index;
            const selectedMember = studentCouncilDataCache[index];
            if (selectedMember) showStudentCouncilModal(selectedMember);
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
async function loadPersonnelData() { /* ... No changes ... */ }
function renderPersonnelList(personnelList) { /* ... No changes ... */ }
function showPersonnelModal(person) { /* ... No changes ... */ }

// --- STUDENT PAGE WITH CHART ---
async function loadStudentData(isRefresh = false) { /* ... No changes ... */ }
function renderStudentChart(studentList) { /* ... No changes ... */ }

// --- STUDENT COUNCIL PAGE ---
async function loadStudentCouncilData() { /* ... No changes ... */ }
function renderStudentCouncilList(boardList) { /* ... No changes ... */ }
function showStudentCouncilModal(member) { /* ... No changes ... */ }

// --- TEACHER ACHIEVEMENTS PAGE ---
async function loadTeacherAchievementsData() { /* ... No changes ... */ }
function renderTeacherAchievements(achievementsList) { /* ... No changes ... */ }

