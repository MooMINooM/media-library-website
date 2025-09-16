// This is the main controller file.
// It imports functions from other modules and coordinates everything.

import * as Data from './js/data.js';
import * as API from './js/api.js';
import * as UI from './js/ui.js';

// --- Global Caches ---
let teacherAchievementsCache = [];
let innovationsDataCache = [];

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    UI.setupDropdowns();
    UI.setupModal();
    setupEventListeners();
    showPage('home');
});


// --- NAVIGATION ---
function setupNavigation() {
    const mainNav = document.getElementById('main-nav');
    mainNav.addEventListener('click', (e) => {
        if (e.target.matches('a[data-page]')) {
            e.preventDefault();
            const pageId = e.target.dataset.page;
            showPage(pageId);
            UI.closeAllDropdowns();
        }
    });
}

async function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(page => page.classList.add('hidden'));
    const activePage = document.getElementById(`page-${pageId}`);
    if (activePage) activePage.classList.remove('hidden');

    // Highlight active link logic...
    document.querySelectorAll('#main-nav a[data-page], #main-nav button.dropdown-toggle').forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`#main-nav a[data-page="${pageId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
        const parentDropdown = activeLink.closest('.dropdown');
        if (parentDropdown) parentDropdown.querySelector('.dropdown-toggle').classList.add('active');
    }

    // Load data based on the page
    switch (pageId) {
        case 'personnel-list':
            UI.renderPersonnelList();
            break;
        case 'students':
            UI.renderStudentChart();
            break;
        case 'student-council':
            UI.renderStudentCouncilList();
            break;
        case 'school-board':
            UI.renderSchoolBoardList();
            break;
        case 'teacher-achievements':
            if (teacherAchievementsCache.length > 0) {
                UI.renderTeacherAchievements(teacherAchievementsCache);
            } else {
                try {
                    const data = await API.loadTeacherAchievementsData();
                    teacherAchievementsCache = data;
                    UI.renderTeacherAchievements(teacherAchievementsCache);
                } catch (e) { console.error(e); }
            }
            break;
        case 'innovations':
             if (innovationsDataCache.length > 0) {
                UI.renderInnovations(innovationsDataCache);
            } else {
                try {
                    const data = await API.loadInnovationsData();
                    innovationsDataCache = data;
                    UI.renderInnovations(innovationsDataCache);
                } catch (e) { console.error(e); }
            }
            break;
    }
}

// --- EVENT LISTENERS for dynamic content ---
function setupEventListeners() {
    const mainContent = document.getElementById('main-content');
    mainContent.addEventListener('click', (e) => {
        const personnelCard = e.target.closest('.personnel-card');
        if (personnelCard) {
            const index = personnelCard.dataset.index;
            const selectedPerson = Data.STATIC_PERSONNEL_DATA[index];
            if (selectedPerson) UI.showPersonnelModal(selectedPerson);
        }

        const councilCard = e.target.closest('.student-council-card');
        if (councilCard) {
            const index = councilCard.dataset.index;
            const selectedMember = Data.STATIC_STUDENT_COUNCIL_DATA[index];
            if (selectedMember) UI.showStudentCouncilModal(selectedMember);
        }

        const boardCard = e.target.closest('.school-board-card');
        if (boardCard) {
            const index = boardCard.dataset.index;
            const selectedMember = Data.STATIC_SCHOOL_BOARD_DATA[index];
            if (selectedMember) UI.showSchoolBoardModal(selectedMember);
        }
    });
}

