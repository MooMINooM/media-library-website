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
    // These functions set up all the interactive parts of the website
    setupNavigation();
    setupDropdowns();
    setupModal();
    setupEventListeners();
    // Show the homepage by default
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
    window.addEventListener('click', () => {
        closeAllDropdowns();
    });
}

function closeAllDropdowns(exceptMenu = null) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu !== exceptMenu) {
            menu.classList.add('hidden');
        }
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
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });
    const activePage = document.getElementById(`page-${pageId}`);
    if (activePage) {
        activePage.classList.remove('hidden');
    }
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
async function loadPersonnelData() { /* ... Same as before ... */ }
function renderPersonnelList(personnelList) { /* ... Same as before ... */ }
function showPersonnelModal(person) { /* ... Same as before ... */ }

// --- STUDENT PAGE WITH CHART ---
async function loadStudentData(isRefresh = false) { /* ... Same as before ... */ }
function renderStudentChart(studentList) { /* ... Same as before ... */ }

// --- STUDENT COUNCIL PAGE ---
async function loadStudentCouncilData() { /* ... Same as before ... */ }
function renderStudentCouncilList(boardList) { /* ... Same as before ... */ }
function showStudentCouncilModal(member) { /* ... Same as before ... */ }

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
        const truncatedProject = (item.project && item.project.length > 50) ? item.project.substring(0, 50) + '...' : item.project;
        card.innerHTML = `
            <div>
                <h4 class="font-bold text-blue-800 text-lg">${item.name || '-'}</h4>
                <a href="${item.url_pro || '#'}" target="_blank" rel="noopener noreferrer" class="block mt-1 text-sm text-gray-600 hover:text-blue-800 hover:underline" title="${item.project || ''}">
                    ${truncatedProject || '-'}
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

